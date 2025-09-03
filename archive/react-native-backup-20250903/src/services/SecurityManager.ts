import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { Config } from '../config/AppConfig';
import LoggerService from './LoggerService';

export interface SecurityOptions {
  encryptData?: boolean;
  keyRotationInterval?: number;
  sessionTimeout?: number;
  maxLoginAttempts?: number;
}

export interface SecurityEvent {
  type: 'login_attempt' | 'login_success' | 'login_failure' | 'logout' | 'session_timeout' | 'suspicious_activity';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface SessionInfo {
  userId: string;
  sessionId: string;
  loginTime: string;
  lastActivity: string;
  expiresAt: string;
  deviceInfo?: Record<string, any>;
}

class SecurityManager {
  private static instance: SecurityManager;
  private encryptionKey: string = '';
  private sessionInfo: SessionInfo | null = null;
  private loginAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private securityEvents: SecurityEvent[] = [];
  private sessionTimer: ReturnType<typeof setTimeout> | null = null;

  private constructor() {
    this.initializeEncryption();
    this.loadSessionInfo();
    this.startSessionMonitoring();
  }

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  private async initializeEncryption() {
    try {
      // Try to load existing encryption key
      let key = await AsyncStorage.getItem('encryption_key');
      
      if (!key) {
        // Generate new key if none exists
        key = this.generateEncryptionKey();
        await AsyncStorage.setItem('encryption_key', key);
        LoggerService.info('New encryption key generated');
      }
      
      this.encryptionKey = key;
    } catch (error) {
      LoggerService.error('Failed to initialize encryption', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      // Fallback to generated key
      this.encryptionKey = this.generateEncryptionKey();
    }
  }

  private generateEncryptionKey(): string {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }

  // Data Encryption/Decryption
  public encryptData(data: string): string {
    if (!Config.security.encryptionEnabled) {
      return data;
    }

    try {
      return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
    } catch (error) {
      LoggerService.error('Failed to encrypt data', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return data; // Return unencrypted data as fallback
    }
  }

  public decryptData(encryptedData: string): string {
    if (!Config.security.encryptionEnabled) {
      return encryptedData;
    }

    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      LoggerService.error('Failed to decrypt data', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return encryptedData; // Return encrypted data as fallback
    }
  }

  public async storeSecureData(key: string, value: string): Promise<void> {
    try {
      const encryptedValue = this.encryptData(value);
      await AsyncStorage.setItem(`secure_${key}`, encryptedValue);
      LoggerService.debug('Secure data stored', { key });
    } catch (error) {
      LoggerService.error('Failed to store secure data', { 
        key,
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  public async getSecureData(key: string): Promise<string | null> {
    try {
      const encryptedValue = await AsyncStorage.getItem(`secure_${key}`);
      if (!encryptedValue) return null;
      
      const decryptedValue = this.decryptData(encryptedValue);
      LoggerService.debug('Secure data retrieved', { key });
      return decryptedValue;
    } catch (error) {
      LoggerService.error('Failed to retrieve secure data', { 
        key,
        error: error instanceof Error ? error.message : String(error) 
      });
      return null;
    }
  }

  public async removeSecureData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`secure_${key}`);
      LoggerService.debug('Secure data removed', { key });
    } catch (error) {
      LoggerService.error('Failed to remove secure data', { 
        key,
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  // Session Management
  public async createSession(userId: string, deviceInfo?: Record<string, any>): Promise<SessionInfo> {
    const sessionId = this.generateSessionId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + Config.security.sessionTimeout);

    const sessionInfo: SessionInfo = {
      userId,
      sessionId,
      loginTime: now.toISOString(),
      lastActivity: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      deviceInfo,
    };

    this.sessionInfo = sessionInfo;
    await this.saveSessionInfo();
    this.startSessionTimer();

    this.recordSecurityEvent('login_success', { userId, sessionId });
    LoggerService.info('Session created', { userId, sessionId });

    return sessionInfo;
  }

  public async updateSessionActivity(): Promise<void> {
    if (!this.sessionInfo) return;

    this.sessionInfo.lastActivity = new Date().toISOString();
    await this.saveSessionInfo();
  }

  public async isSessionValid(): Promise<boolean> {
    if (!this.sessionInfo) return false;

    const now = new Date();
    const expiresAt = new Date(this.sessionInfo.expiresAt);

    if (now > expiresAt) {
      await this.destroySession();
      this.recordSecurityEvent('session_timeout', { 
        sessionId: this.sessionInfo?.sessionId 
      });
      return false;
    }

    return true;
  }

  public async destroySession(): Promise<void> {
    if (this.sessionInfo) {
      this.recordSecurityEvent('logout', { 
        sessionId: this.sessionInfo.sessionId,
        userId: this.sessionInfo.userId 
      });
      LoggerService.info('Session destroyed', { 
        sessionId: this.sessionInfo.sessionId 
      });
    }

    this.sessionInfo = null;
    await AsyncStorage.removeItem('session_info');
    
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  public getSessionInfo(): SessionInfo | null {
    return this.sessionInfo;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async saveSessionInfo(): Promise<void> {
    if (!this.sessionInfo) return;

    try {
      const sessionData = this.encryptData(JSON.stringify(this.sessionInfo));
      await AsyncStorage.setItem('session_info', sessionData);
    } catch (error) {
      LoggerService.error('Failed to save session info', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  private async loadSessionInfo(): Promise<void> {
    try {
      const sessionData = await AsyncStorage.getItem('session_info');
      if (sessionData) {
        const decryptedData = this.decryptData(sessionData);
        this.sessionInfo = JSON.parse(decryptedData);
        
        // Check if session is still valid
        if (!(await this.isSessionValid())) {
          this.sessionInfo = null;
        } else {
          this.startSessionTimer();
        }
      }
    } catch (error) {
      LoggerService.error('Failed to load session info', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      this.sessionInfo = null;
    }
  }

  private startSessionTimer(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }

    if (this.sessionInfo) {
      const expiresAt = new Date(this.sessionInfo.expiresAt);
      const now = new Date();
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();

      if (timeUntilExpiry > 0) {
        this.sessionTimer = setTimeout(() => {
          this.destroySession();
        }, timeUntilExpiry);
      }
    }
  }

  private startSessionMonitoring(): void {
    // Update activity every 5 minutes
    setInterval(() => {
      if (this.sessionInfo) {
        this.updateSessionActivity();
      }
    }, 5 * 60 * 1000);
  }

  // Login Attempts Management
  public recordLoginAttempt(identifier: string, success: boolean): void {
    const now = Date.now();
    const attempt = this.loginAttempts.get(identifier) || { count: 0, lastAttempt: 0 };

    if (success) {
      // Reset attempts on successful login
      this.loginAttempts.delete(identifier);
      this.recordSecurityEvent('login_success', { identifier });
    } else {
      // Increment failed attempts
      attempt.count += 1;
      attempt.lastAttempt = now;
      this.loginAttempts.set(identifier, attempt);
      
      this.recordSecurityEvent('login_failure', { 
        identifier, 
        attemptCount: attempt.count 
      });

      if (attempt.count >= Config.security.maxLoginAttempts) {
        this.recordSecurityEvent('suspicious_activity', { 
          type: 'max_login_attempts_exceeded',
          identifier,
          attemptCount: attempt.count 
        });
      }
    }
  }

  public isAccountLocked(identifier: string): boolean {
    const attempt = this.loginAttempts.get(identifier);
    if (!attempt) return false;

    return attempt.count >= Config.security.maxLoginAttempts;
  }

  public getLoginAttemptsCount(identifier: string): number {
    const attempt = this.loginAttempts.get(identifier);
    return attempt ? attempt.count : 0;
  }

  public getRemainingLoginAttempts(identifier: string): number {
    const count = this.getLoginAttemptsCount(identifier);
    return Math.max(0, Config.security.maxLoginAttempts - count);
  }

  // Security Events
  private recordSecurityEvent(
    type: SecurityEvent['type'], 
    metadata?: Record<string, any>
  ): void {
    const event: SecurityEvent = {
      type,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.securityEvents.push(event);

    // Keep only recent events
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-500);
    }

    LoggerService.info(`Security event: ${type}`, metadata, 'SECURITY');
  }

  public getSecurityEvents(
    filters?: {
      type?: SecurityEvent['type'][];
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): SecurityEvent[] {
    let filteredEvents = [...this.securityEvents];

    if (filters) {
      if (filters.type) {
        filteredEvents = filteredEvents.filter(event => 
          filters.type!.includes(event.type)
        );
      }

      if (filters.startDate) {
        filteredEvents = filteredEvents.filter(event => 
          new Date(event.timestamp) >= filters.startDate!
        );
      }

      if (filters.endDate) {
        filteredEvents = filteredEvents.filter(event => 
          new Date(event.timestamp) <= filters.endDate!
        );
      }

      if (filters.limit) {
        filteredEvents = filteredEvents.slice(-filters.limit);
      }
    }

    return filteredEvents.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // Data Validation and Sanitization
  public validateInput(input: string, pattern: RegExp): boolean {
    return pattern.test(input);
  }

  public sanitizeInput(input: string): string {
    // Remove potentially dangerous characters
    return input.replace(/[<>\"'%;()&+]/g, '');
  }

  public validateEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.validateInput(email, emailPattern);
  }

  public validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < Config.security.passwordMinLength) {
      errors.push(`Password must be at least ${Config.security.passwordMinLength} characters long`);
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Utility Methods
  public generateSecureToken(length: number = 32): string {
    return CryptoJS.lib.WordArray.random(length).toString();
  }

  public hashData(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  public async clearAllSecureData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const secureKeys = keys.filter(key => key.startsWith('secure_'));
      
      await AsyncStorage.multiRemove(secureKeys);
      await this.destroySession();
      
      LoggerService.info('All secure data cleared');
    } catch (error) {
      LoggerService.error('Failed to clear secure data', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  public getSecurityStatus(): {
    hasActiveSession: boolean;
    sessionExpiresAt: string | null;
    encryptionEnabled: boolean;
    securityEventsCount: number;
    lockedAccounts: number;
  } {
    return {
      hasActiveSession: this.sessionInfo !== null,
      sessionExpiresAt: this.sessionInfo?.expiresAt || null,
      encryptionEnabled: Config.security.encryptionEnabled,
      securityEventsCount: this.securityEvents.length,
      lockedAccounts: Array.from(this.loginAttempts.values())
        .filter(attempt => attempt.count >= Config.security.maxLoginAttempts)
        .length,
    };
  }
}

export default SecurityManager;
