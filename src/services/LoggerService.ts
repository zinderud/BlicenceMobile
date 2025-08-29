import { logger, consoleTransport } from 'react-native-logs';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  category?: string;
  data?: any;
  userId?: string;
  sessionId?: string;
}

class LoggerService {
  private logger: any;
  private sessionId: string;
  private userId?: string;
  private logBuffer: LogEntry[] = [];
  private readonly MAX_BUFFER_SIZE = 1000;
  private readonly MAX_STORAGE_ENTRIES = 5000;

  constructor() {
    this.sessionId = Date.now().toString();
    
    // Configure react-native-logs
    const defaultTransport = consoleTransport;

    this.logger = logger.createLogger({
      severity: __DEV__ ? 'debug' : 'error',
      transport: [defaultTransport, this.customTransport.bind(this)],
      transportOptions: {
        colors: {
          info: 'blueBright',
          warn: 'yellowBright',
          error: 'redBright',
        },
      },
    });

    // Load existing logs on initialization
    this.loadLogsFromStorage();
  }

  // Custom transport for saving logs to storage
  private customTransport(log: any) {
    const logEntry: LogEntry = {
      level: log.level.text,
      message: typeof log.msg === 'string' ? log.msg : JSON.stringify(log.msg),
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      data: log.rawMsg.length > 1 ? log.rawMsg.slice(1) : undefined,
    };

    this.addToBuffer(logEntry);
  }

  private addToBuffer(entry: LogEntry) {
    this.logBuffer.push(entry);
    
    // Keep buffer size manageable
    if (this.logBuffer.length > this.MAX_BUFFER_SIZE) {
      this.logBuffer = this.logBuffer.slice(-this.MAX_BUFFER_SIZE);
    }

    // Periodically save to storage
    if (this.logBuffer.length % 50 === 0) {
      this.saveLogsToStorage();
    }
  }

  public setUserId(userId: string) {
    this.userId = userId;
    this.info('User ID set', { userId });
  }

  public clearUserId() {
    this.info('User logged out', { previousUserId: this.userId });
    this.userId = undefined;
  }

  // Public logging methods
  public debug(message: string, data?: any, category?: string) {
    this.logger.debug(message, data);
    if (category) {
      this.addCategoryToLastLog(category);
    }
  }

  public info(message: string, data?: any, category?: string) {
    this.logger.info(message, data);
    if (category) {
      this.addCategoryToLastLog(category);
    }
  }

  public warn(message: string, data?: any, category?: string) {
    this.logger.warn(message, data);
    if (category) {
      this.addCategoryToLastLog(category);
    }
  }

  public error(message: string, data?: any, category?: string) {
    this.logger.error(message, data);
    if (category) {
      this.addCategoryToLastLog(category);
    }
  }

  // Specialized logging methods
  public logApiCall(method: string, url: string, status?: number, duration?: number) {
    this.info(`API ${method} ${url}`, {
      method,
      url,
      status,
      duration,
    }, 'API');
  }

  public logUserAction(action: string, screen?: string, data?: any) {
    this.info(`User action: ${action}`, {
      action,
      screen,
      data,
    }, 'USER_ACTION');
  }

  public logNavigation(from?: string, to?: string) {
    this.info(`Navigation: ${from} -> ${to}`, {
      from,
      to,
    }, 'NAVIGATION');
  }

  public logPerformance(metric: string, value: number, unit?: string) {
    this.info(`Performance: ${metric}`, {
      metric,
      value,
      unit,
    }, 'PERFORMANCE');
  }

  public logBusinessEvent(event: string, data?: any) {
    this.info(`Business event: ${event}`, data, 'BUSINESS');
  }

  // Crash and error logging
  public logCrash(error: Error, context?: string) {
    this.error(`Crash: ${error.message}`, {
      stack: error.stack,
      context,
      sessionId: this.sessionId,
    }, 'CRASH');
  }

  public logException(error: Error, isFatal: boolean = false, context?: string) {
    const level = isFatal ? 'error' : 'warn';
    this[level](`Exception: ${error.message}`, {
      stack: error.stack,
      isFatal,
      context,
      sessionId: this.sessionId,
    }, 'EXCEPTION');
  }

  // Storage management
  private async saveLogsToStorage() {
    try {
      const existingLogs = await this.getStoredLogs();
      const allLogs = [...existingLogs, ...this.logBuffer];
      
      // Keep only recent logs
      const recentLogs = allLogs.slice(-this.MAX_STORAGE_ENTRIES);
      
      await AsyncStorage.setItem('app_logs', JSON.stringify(recentLogs));
      this.logBuffer = [];
    } catch (error) {
      console.error('Failed to save logs to storage:', error);
    }
  }

  private async loadLogsFromStorage() {
    try {
      const logs = await this.getStoredLogs();
      this.info(`Loaded ${logs.length} logs from storage`, { count: logs.length });
    } catch (error) {
      this.error('Failed to load logs from storage', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  public async getStoredLogs(): Promise<LogEntry[]> {
    try {
      const logsJson = await AsyncStorage.getItem('app_logs');
      return logsJson ? JSON.parse(logsJson) : [];
    } catch (error) {
      console.error('Failed to get stored logs:', error);
      return [];
    }
  }

  public async getLogs(filters?: {
    level?: LogEntry['level'][];
    category?: string[];
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    limit?: number;
  }): Promise<LogEntry[]> {
    try {
      // Get logs from buffer and storage
      await this.saveLogsToStorage();
      const allLogs = [...await this.getStoredLogs(), ...this.logBuffer];
      
      let filteredLogs = allLogs;

      if (filters) {
        if (filters.level) {
          filteredLogs = filteredLogs.filter(log => filters.level!.includes(log.level));
        }

        if (filters.category) {
          filteredLogs = filteredLogs.filter(log => 
            log.category && filters.category!.includes(log.category)
          );
        }

        if (filters.startDate) {
          filteredLogs = filteredLogs.filter(log => 
            new Date(log.timestamp) >= filters.startDate!
          );
        }

        if (filters.endDate) {
          filteredLogs = filteredLogs.filter(log => 
            new Date(log.timestamp) <= filters.endDate!
          );
        }

        if (filters.userId) {
          filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
        }

        if (filters.limit) {
          filteredLogs = filteredLogs.slice(-filters.limit);
        }
      }

      return filteredLogs.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Failed to get logs:', error);
      return [];
    }
  }

  public async clearLogs() {
    try {
      await AsyncStorage.removeItem('app_logs');
      this.logBuffer = [];
      this.info('Logs cleared');
    } catch (error) {
      this.error('Failed to clear logs', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  public async exportLogs(): Promise<string> {
    try {
      const logs = await this.getLogs();
      return JSON.stringify(logs, null, 2);
    } catch (error) {
      this.error('Failed to export logs', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return '[]';
    }
  }

  // Analytics and metrics
  public async getLogStats(): Promise<{
    total: number;
    byLevel: Record<string, number>;
    byCategory: Record<string, number>;
    sessionsCount: number;
    oldestLog?: string;
    newestLog?: string;
  }> {
    try {
      const logs = await this.getLogs();
      
      const stats = {
        total: logs.length,
        byLevel: {} as Record<string, number>,
        byCategory: {} as Record<string, number>,
        sessionsCount: 0,
        oldestLog: undefined as string | undefined,
        newestLog: undefined as string | undefined,
      };

      const sessions = new Set<string>();

      logs.forEach(log => {
        // Count by level
        stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
        
        // Count by category
        if (log.category) {
          stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
        }

        // Track sessions
        if (log.sessionId) {
          sessions.add(log.sessionId);
        }
      });

      stats.sessionsCount = sessions.size;
      
      if (logs.length > 0) {
        stats.oldestLog = logs[logs.length - 1].timestamp;
        stats.newestLog = logs[0].timestamp;
      }

      return stats;
    } catch (error) {
      this.error('Failed to get log stats', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return {
        total: 0,
        byLevel: {},
        byCategory: {},
        sessionsCount: 0,
      };
    }
  }

  private addCategoryToLastLog(category: string) {
    if (this.logBuffer.length > 0) {
      this.logBuffer[this.logBuffer.length - 1].category = category;
    }
  }

  // Cleanup on app termination
  public async flush() {
    try {
      await this.saveLogsToStorage();
      this.info('Logger flushed successfully');
    } catch (error) {
      console.error('Failed to flush logger:', error);
    }
  }
}

// Create singleton instance
const LoggerInstance = new LoggerService();

// Export both the class and the instance
export { LoggerService };
export default LoggerInstance;
