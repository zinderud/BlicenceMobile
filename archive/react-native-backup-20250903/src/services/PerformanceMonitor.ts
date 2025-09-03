import { InteractionManager, AppState, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoggerService from './LoggerService';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  category: 'memory' | 'cpu' | 'network' | 'ui' | 'custom' | 'technical';
  metadata?: Record<string, any>;
}

export interface ScreenPerformance {
  screenName: string;
  mountTime: number;
  renderTime: number;
  interactionTime?: number;
  memoryUsage?: number;
  timestamp: string;
}

export interface NetworkPerformance {
  url: string;
  method: string;
  startTime: number;
  endTime: number;
  duration: number;
  responseSize?: number;
  statusCode?: number;
  timestamp: string;
}

export interface AppPerformanceReport {
  sessionId: string;
  appVersion: string;
  deviceInfo: {
    model: string;
    osVersion: string;
    screenSize: string;
    isTablet: boolean;
  };
  metrics: PerformanceMetric[];
  screenMetrics: ScreenPerformance[];
  networkMetrics: NetworkPerformance[];
  crashes: number;
  errors: number;
  sessionDuration: number;
  startTime: string;
  endTime?: string;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private sessionId: string;
  private sessionStartTime: number;
  private metrics: PerformanceMetric[] = [];
  private screenMetrics: ScreenPerformance[] = [];
  private networkMetrics: NetworkPerformance[] = [];
  private screenStartTimes: Map<string, number> = new Map();
  private activeNetworkRequests: Map<string, number> = new Map();
  private memoryWarningCount: number = 0;
  private crashCount: number = 0;
  private errorCount: number = 0;
  private isMonitoring: boolean = false;

  private constructor() {
    this.sessionId = Date.now().toString();
    this.sessionStartTime = Date.now();
    this.setupAppStateListener();
    this.startMonitoring();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private setupAppStateListener() {
    AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background') {
        this.recordMetric('app_state', 0, 'state', 'ui', { state: 'background' });
        this.saveSessionData();
      } else if (nextAppState === 'active') {
        this.recordMetric('app_state', 1, 'state', 'ui', { state: 'active' });
      }
    });
  }

  private startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    LoggerService.info('Performance monitoring started', { sessionId: this.sessionId });

    // Monitor memory usage every 30 seconds
    this.startMemoryMonitoring();
    
    // Monitor interaction performance
    this.startInteractionMonitoring();
  }

  private startMemoryMonitoring() {
    const memoryInterval = setInterval(() => {
      if (!this.isMonitoring) {
        clearInterval(memoryInterval);
        return;
      }

      // Simulate memory monitoring (React Native doesn't have direct memory APIs)
      const estimatedMemory = this.estimateMemoryUsage();
      this.recordMetric('memory_usage', estimatedMemory, 'MB', 'memory');

      // Check for memory warnings
      if (estimatedMemory > 100) {
        this.memoryWarningCount++;
        LoggerService.warn('High memory usage detected', { 
          memoryUsage: estimatedMemory,
          warningCount: this.memoryWarningCount 
        });
      }
    }, 30000); // Every 30 seconds
  }

  private startInteractionMonitoring() {
    // Monitor interactions using InteractionManager
    InteractionManager.runAfterInteractions(() => {
      this.recordMetric('interactions_complete', 1, 'count', 'ui');
    });
  }

  private estimateMemoryUsage(): number {
    // Simplified memory estimation based on app complexity
    const baseMemory = 50; // Base memory usage
    const componentMemory = this.screenMetrics.length * 2; // Estimate based on screens
    const networkMemory = this.networkMetrics.length * 0.1; // Network cache
    
    return baseMemory + componentMemory + networkMemory;
  }

  // Public API methods
  public recordMetric(
    name: string, 
    value: number, 
    unit: string, 
    category: PerformanceMetric['category'],
    metadata?: Record<string, any>
  ) {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      category,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.metrics.push(metric);
    LoggerService.logPerformance(name, value, unit);

    // Keep metrics array manageable
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }
  }

  public startScreenTracking(screenName: string) {
    const startTime = Date.now();
    this.screenStartTimes.set(screenName, startTime);
    LoggerService.logNavigation(undefined, screenName);
  }

  public endScreenTracking(screenName: string) {
    const startTime = this.screenStartTimes.get(screenName);
    if (!startTime) return;

    const endTime = Date.now();
    const renderTime = endTime - startTime;

    const screenMetric: ScreenPerformance = {
      screenName,
      mountTime: startTime,
      renderTime,
      memoryUsage: this.estimateMemoryUsage(),
      timestamp: new Date().toISOString(),
    };

    this.screenMetrics.push(screenMetric);
    this.screenStartTimes.delete(screenName);

    // Record as performance metric
    this.recordMetric(`screen_render_${screenName}`, renderTime, 'ms', 'ui', {
      screenName,
    });

    LoggerService.info(`Screen ${screenName} rendered`, { renderTime });
  }

  public startNetworkTracking(requestId: string, url: string, method: string) {
    const startTime = Date.now();
    this.activeNetworkRequests.set(requestId, startTime);
    LoggerService.logApiCall(method, url);
  }

  public endNetworkTracking(
    requestId: string, 
    url: string, 
    method: string,
    statusCode?: number,
    responseSize?: number
  ) {
    const startTime = this.activeNetworkRequests.get(requestId);
    if (!startTime) return;

    const endTime = Date.now();
    const duration = endTime - startTime;

    const networkMetric: NetworkPerformance = {
      url,
      method,
      startTime,
      endTime,
      duration,
      responseSize,
      statusCode,
      timestamp: new Date().toISOString(),
    };

    this.networkMetrics.push(networkMetric);
    this.activeNetworkRequests.delete(requestId);

    // Record as performance metric
    this.recordMetric('network_request', duration, 'ms', 'network', {
      url,
      method,
      statusCode,
      responseSize,
    });

    LoggerService.logApiCall(method, url, statusCode, duration);
  }

  public recordError(error: Error, isCrash: boolean = false) {
    if (isCrash) {
      this.crashCount++;
      LoggerService.logCrash(error);
    } else {
      this.errorCount++;
      LoggerService.logException(error);
    }

    this.recordMetric(
      isCrash ? 'crash' : 'error',
      1,
      'count',
      'custom',
      {
        message: error.message,
        stack: error.stack,
        isCrash,
      }
    );
  }

  public markInteraction(screenName: string, interactionTime: number) {
    const screenMetric = this.screenMetrics.find(m => m.screenName === screenName);
    if (screenMetric) {
      screenMetric.interactionTime = interactionTime;
    }

    this.recordMetric('interaction_time', interactionTime, 'ms', 'ui', {
      screenName,
    });
  }

  // Reporting and analytics
  public async generateReport(): Promise<AppPerformanceReport> {
    const { width, height } = Dimensions.get('window');
    const deviceInfo = {
      model: 'Unknown', // Would need react-native-device-info for real data
      osVersion: 'Unknown',
      screenSize: `${width}x${height}`,
      isTablet: Math.min(width, height) > 600,
    };

    const report: AppPerformanceReport = {
      sessionId: this.sessionId,
      appVersion: '1.0.0', // Would come from app config
      deviceInfo,
      metrics: [...this.metrics],
      screenMetrics: [...this.screenMetrics],
      networkMetrics: [...this.networkMetrics],
      crashes: this.crashCount,
      errors: this.errorCount,
      sessionDuration: Date.now() - this.sessionStartTime,
      startTime: new Date(this.sessionStartTime).toISOString(),
      endTime: new Date().toISOString(),
    };

    return report;
  }

  public getMetricsSummary() {
    const summary = {
      totalMetrics: this.metrics.length,
      screenCount: this.screenMetrics.length,
      networkRequests: this.networkMetrics.length,
      errors: this.errorCount,
      crashes: this.crashCount,
      sessionDuration: Date.now() - this.sessionStartTime,
      averageScreenRenderTime: 0,
      averageNetworkTime: 0,
      memoryWarnings: this.memoryWarningCount,
    };

    // Calculate averages
    if (this.screenMetrics.length > 0) {
      summary.averageScreenRenderTime = this.screenMetrics.reduce(
        (sum, metric) => sum + metric.renderTime, 0
      ) / this.screenMetrics.length;
    }

    if (this.networkMetrics.length > 0) {
      summary.averageNetworkTime = this.networkMetrics.reduce(
        (sum, metric) => sum + metric.duration, 0
      ) / this.networkMetrics.length;
    }

    return summary;
  }

  public getSlowScreens(threshold: number = 2000): ScreenPerformance[] {
    return this.screenMetrics.filter(screen => screen.renderTime > threshold);
  }

  public getSlowNetworkRequests(threshold: number = 5000): NetworkPerformance[] {
    return this.networkMetrics.filter(request => request.duration > threshold);
  }

  // Storage and persistence
  private async saveSessionData() {
    try {
      const report = await this.generateReport();
      const storageKey = `performance_session_${this.sessionId}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(report));
      LoggerService.info('Performance session saved', { sessionId: this.sessionId });
    } catch (error) {
      LoggerService.error('Failed to save performance session', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  public async getAllSessions(): Promise<AppPerformanceReport[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const sessionKeys = keys.filter(key => key.startsWith('performance_session_'));
      
      const sessions: AppPerformanceReport[] = [];
      for (const key of sessionKeys) {
        const sessionData = await AsyncStorage.getItem(key);
        if (sessionData) {
          sessions.push(JSON.parse(sessionData));
        }
      }

      return sessions.sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
    } catch (error) {
      LoggerService.error('Failed to get performance sessions', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return [];
    }
  }

  public async clearOldSessions(maxAge: number = 7 * 24 * 60 * 60 * 1000) {
    try {
      const sessions = await this.getAllSessions();
      const cutoffTime = Date.now() - maxAge;

      for (const session of sessions) {
        const sessionTime = new Date(session.startTime).getTime();
        if (sessionTime < cutoffTime) {
          await AsyncStorage.removeItem(`performance_session_${session.sessionId}`);
        }
      }

      LoggerService.info('Old performance sessions cleaned up');
    } catch (error) {
      LoggerService.error('Failed to clean up old sessions', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  // Lifecycle management
  public stopMonitoring() {
    this.isMonitoring = false;
    this.saveSessionData();
    LoggerService.info('Performance monitoring stopped', { sessionId: this.sessionId });
  }

  public startNewSession() {
    this.stopMonitoring();
    this.sessionId = Date.now().toString();
    this.sessionStartTime = Date.now();
    this.metrics = [];
    this.screenMetrics = [];
    this.networkMetrics = [];
    this.crashCount = 0;
    this.errorCount = 0;
    this.memoryWarningCount = 0;
    this.startMonitoring();
  }
}

export default PerformanceMonitor;
