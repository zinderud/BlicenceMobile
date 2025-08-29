import { Config } from '../config/AppConfig';
import LoggerService from './LoggerService';
import PerformanceMonitor from './PerformanceMonitor';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, any>;
  timestamp: string;
  sessionId: string;
  userId?: string;
  screen?: string;
  category?: 'user_action' | 'business' | 'technical' | 'error' | 'performance';
}

export interface UserProperties {
  userId: string;
  email?: string;
  userType: 'customer' | 'producer' | 'admin';
  registrationDate: string;
  lastActiveDate: string;
  totalSessions: number;
  deviceType: 'mobile' | 'tablet';
  appVersion: string;
  osVersion: string;
  language: string;
  country?: string;
  premium: boolean;
  preferences?: Record<string, any>;
}

export interface SessionMetrics {
  sessionId: string;
  userId?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  screenViews: number;
  userActions: number;
  errors: number;
  crashes: number;
  networkRequests: number;
  averageResponseTime: number;
  peakMemoryUsage: number;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private sessionId: string;
  private userId?: string;
  private currentScreen?: string;
  private sessionStartTime: number;
  private eventQueue: AnalyticsEvent[] = [];
  private userProperties: Partial<UserProperties> = {};
  private sessionMetrics: Partial<SessionMetrics> = {};
  private isEnabled: boolean;
  private flushTimer?: ReturnType<typeof setTimeout>;

  private constructor() {
    this.sessionId = Date.now().toString();
    this.sessionStartTime = Date.now();
    this.isEnabled = Config.enableAnalytics;
    
    if (this.isEnabled) {
      this.initializeAnalytics();
      this.startSession();
      this.setupAutoFlush();
    }
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private async initializeAnalytics() {
    try {
      // Load user properties from storage
      const savedProperties = await AsyncStorage.getItem('user_properties');
      if (savedProperties) {
        this.userProperties = JSON.parse(savedProperties);
      }

      // Initialize session metrics
      this.sessionMetrics = {
        sessionId: this.sessionId,
        userId: this.userId,
        startTime: new Date(this.sessionStartTime).toISOString(),
        screenViews: 0,
        userActions: 0,
        errors: 0,
        crashes: 0,
        networkRequests: 0,
        averageResponseTime: 0,
        peakMemoryUsage: 0,
      };

      LoggerService.info('Analytics initialized', { sessionId: this.sessionId });
    } catch (error) {
      LoggerService.error('Failed to initialize analytics', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  private setupAutoFlush() {
    // Flush events every 30 seconds
    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, 30000);
  }

  // Session Management
  private startSession() {
    this.trackEvent('session_start', {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    }, 'technical');
  }

  public endSession() {
    const sessionDuration = Date.now() - this.sessionStartTime;
    
    this.sessionMetrics.endTime = new Date().toISOString();
    this.sessionMetrics.duration = sessionDuration;

    this.trackEvent('session_end', {
      sessionId: this.sessionId,
      duration: sessionDuration,
      metrics: this.sessionMetrics,
    }, 'technical');

    this.flushEvents();
  }

  // User Management
  public setUserId(userId: string) {
    this.userId = userId;
    this.sessionMetrics.userId = userId;
    LoggerService.setUserId(userId);
    
    this.trackEvent('user_identified', {
      userId,
      sessionId: this.sessionId,
    }, 'technical');
  }

  public setUserProperties(properties: Partial<UserProperties>) {
    this.userProperties = { ...this.userProperties, ...properties };
    this.saveUserProperties();
    
    this.trackEvent('user_properties_updated', {
      properties: Object.keys(properties),
    }, 'technical');
  }

  public getUserProperties(): Partial<UserProperties> {
    return { ...this.userProperties };
  }

  private async saveUserProperties() {
    try {
      await AsyncStorage.setItem('user_properties', JSON.stringify(this.userProperties));
    } catch (error) {
      LoggerService.error('Failed to save user properties', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  // Event Tracking
  public trackEvent(
    name: string, 
    parameters?: Record<string, any>,
    category: AnalyticsEvent['category'] = 'user_action'
  ) {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      name,
      parameters,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      screen: this.currentScreen,
      category,
    };

    this.eventQueue.push(event);
    
    // Update session metrics
    if (category === 'user_action') {
      this.sessionMetrics.userActions = (this.sessionMetrics.userActions || 0) + 1;
    } else if (category === 'error') {
      this.sessionMetrics.errors = (this.sessionMetrics.errors || 0) + 1;
    }

    LoggerService.logBusinessEvent(name, parameters);

    // Flush immediately for critical events
    if (category === 'error' || name.includes('crash')) {
      this.flushEvents();
    }
  }

  // Screen Tracking
  public trackScreen(screenName: string, parameters?: Record<string, any>) {
    this.currentScreen = screenName;
    this.sessionMetrics.screenViews = (this.sessionMetrics.screenViews || 0) + 1;
    
    this.trackEvent('screen_view', {
      screen_name: screenName,
      ...parameters,
    }, 'technical');

    // Start performance tracking
    PerformanceMonitor.getInstance().startScreenTracking(screenName);
  }

  public trackScreenPerformance(screenName: string, renderTime: number) {
    this.trackEvent('screen_performance', {
      screen_name: screenName,
      render_time: renderTime,
    }, 'performance');

    PerformanceMonitor.getInstance().endScreenTracking(screenName);
  }

  // Business Events
  public trackLicensePurchase(licenseType: string, amount: number, currency: string) {
    this.trackEvent('license_purchase', {
      license_type: licenseType,
      amount,
      currency,
      payment_method: 'crypto',
    }, 'business');
  }

  public trackNFTMinted(nftId: string, licenseId: string) {
    this.trackEvent('nft_minted', {
      nft_id: nftId,
      license_id: licenseId,
    }, 'business');
  }

  public trackQRCodeScanned(qrType: string, data: any) {
    this.trackEvent('qr_code_scanned', {
      qr_type: qrType,
      has_valid_data: !!data,
    }, 'user_action');
  }

  public trackWalletConnected(walletType: string, address: string) {
    this.trackEvent('wallet_connected', {
      wallet_type: walletType,
      address_prefix: address.substring(0, 10),
    }, 'technical');
  }

  public trackNotificationReceived(notificationType: string, opened: boolean) {
    this.trackEvent('notification_received', {
      notification_type: notificationType,
      opened,
    }, 'user_action');
  }

  // Error and Performance Tracking
  public trackError(error: Error, context?: string, isFatal: boolean = false) {
    this.trackEvent('error_occurred', {
      error_message: error.message,
      error_stack: error.stack,
      context,
      is_fatal: isFatal,
    }, 'error');

    if (isFatal) {
      this.sessionMetrics.crashes = (this.sessionMetrics.crashes || 0) + 1;
    }
  }

  public trackPerformanceMetric(metricName: string, value: number, unit: string) {
    this.trackEvent('performance_metric', {
      metric_name: metricName,
      value,
      unit,
    }, 'performance');

    // Update session metrics
    if (metricName === 'memory_usage' && value > (this.sessionMetrics.peakMemoryUsage || 0)) {
      this.sessionMetrics.peakMemoryUsage = value;
    }
  }

  public trackNetworkRequest(method: string, url: string, duration: number, status?: number) {
    this.sessionMetrics.networkRequests = (this.sessionMetrics.networkRequests || 0) + 1;
    
    // Update average response time
    const currentAvg = this.sessionMetrics.averageResponseTime || 0;
    const currentCount = this.sessionMetrics.networkRequests;
    this.sessionMetrics.averageResponseTime = ((currentAvg * (currentCount - 1)) + duration) / currentCount;

    this.trackEvent('network_request', {
      method,
      url_path: new URL(url).pathname,
      duration,
      status,
    }, 'technical');
  }

  // User Behavior Analytics
  public trackUserJourney(step: string, journeyName: string, metadata?: Record<string, any>) {
    this.trackEvent('user_journey_step', {
      journey_name: journeyName,
      step,
      ...metadata,
    }, 'user_action');
  }

  public trackFeatureUsage(featureName: string, action: string, metadata?: Record<string, any>) {
    this.trackEvent('feature_usage', {
      feature_name: featureName,
      action,
      ...metadata,
    }, 'user_action');
  }

  public trackSearchQuery(query: string, resultsCount: number, category?: string) {
    this.trackEvent('search_performed', {
      query_length: query.length,
      results_count: resultsCount,
      category,
      has_results: resultsCount > 0,
    }, 'user_action');
  }

  // A/B Testing and Experiments
  public trackExperimentExposure(experimentName: string, variant: string) {
    this.trackEvent('experiment_exposure', {
      experiment_name: experimentName,
      variant,
    }, 'technical');
  }

  public trackConversion(conversionName: string, value?: number, metadata?: Record<string, any>) {
    this.trackEvent('conversion', {
      conversion_name: conversionName,
      value,
      ...metadata,
    }, 'business');
  }

  // Data Export and Analysis
  public async getAnalyticsData(filters?: {
    startDate?: Date;
    endDate?: Date;
    eventNames?: string[];
    categories?: AnalyticsEvent['category'][];
    userId?: string;
  }): Promise<AnalyticsEvent[]> {
    try {
      // In a real implementation, this would query a backend service
      // For now, we'll return filtered local events
      let events = [...this.eventQueue];

      if (filters) {
        if (filters.startDate) {
          events = events.filter(event => 
            new Date(event.timestamp) >= filters.startDate!
          );
        }

        if (filters.endDate) {
          events = events.filter(event => 
            new Date(event.timestamp) <= filters.endDate!
          );
        }

        if (filters.eventNames) {
          events = events.filter(event => 
            filters.eventNames!.includes(event.name)
          );
        }

        if (filters.categories) {
          events = events.filter(event => 
            event.category && filters.categories!.includes(event.category)
          );
        }

        if (filters.userId) {
          events = events.filter(event => event.userId === filters.userId);
        }
      }

      return events;
    } catch (error) {
      LoggerService.error('Failed to get analytics data', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return [];
    }
  }

  public getSessionMetrics(): SessionMetrics {
    return {
      ...this.sessionMetrics,
      duration: Date.now() - this.sessionStartTime,
    } as SessionMetrics;
  }

  public async getEventStats(): Promise<{
    totalEvents: number;
    eventsByCategory: Record<string, number>;
    eventsByName: Record<string, number>;
    uniqueScreens: number;
    sessionDuration: number;
  }> {
    const events = this.eventQueue;
    const eventsByCategory: Record<string, number> = {};
    const eventsByName: Record<string, number> = {};
    const uniqueScreens = new Set<string>();

    events.forEach(event => {
      // Count by category
      if (event.category) {
        eventsByCategory[event.category] = (eventsByCategory[event.category] || 0) + 1;
      }

      // Count by name
      eventsByName[event.name] = (eventsByName[event.name] || 0) + 1;

      // Track unique screens
      if (event.screen) {
        uniqueScreens.add(event.screen);
      }
    });

    return {
      totalEvents: events.length,
      eventsByCategory,
      eventsByName,
      uniqueScreens: uniqueScreens.size,
      sessionDuration: Date.now() - this.sessionStartTime,
    };
  }

  // Data Management
  private async flushEvents() {
    if (this.eventQueue.length === 0) return;

    try {
      // In a real implementation, this would send events to analytics service
      LoggerService.info(`Flushing ${this.eventQueue.length} analytics events`);
      
      // Save events to local storage for offline capability
      await this.saveEventsToStorage();
      
      // Clear the queue
      this.eventQueue = [];
      
      LoggerService.info('Analytics events flushed successfully');
    } catch (error) {
      LoggerService.error('Failed to flush analytics events', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  private async saveEventsToStorage() {
    try {
      const existingEvents = await AsyncStorage.getItem('analytics_events');
      const events = existingEvents ? JSON.parse(existingEvents) : [];
      
      events.push(...this.eventQueue);
      
      // Keep only recent events (last 1000)
      const recentEvents = events.slice(-1000);
      
      await AsyncStorage.setItem('analytics_events', JSON.stringify(recentEvents));
    } catch (error) {
      LoggerService.error('Failed to save events to storage', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  public async clearAnalyticsData() {
    try {
      this.eventQueue = [];
      await AsyncStorage.removeItem('analytics_events');
      await AsyncStorage.removeItem('user_properties');
      
      LoggerService.info('Analytics data cleared');
    } catch (error) {
      LoggerService.error('Failed to clear analytics data', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  // Lifecycle Management
  public pause() {
    this.flushEvents();
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
  }

  public resume() {
    this.setupAutoFlush();
  }

  public destroy() {
    this.endSession();
    this.pause();
  }
}

export default AnalyticsService;
