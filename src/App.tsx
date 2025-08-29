import React, { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppState } from 'react-native';
import { store } from './store';
import AppNavigator from './navigation/AppNavigator';
import ErrorBoundary from './components/error/ErrorBoundary';
import { Config, ConfigUtils } from './config/AppConfig';
import LoggerService from './services/LoggerService';
import PerformanceMonitor from './services/PerformanceMonitor';
import AnalyticsService from './services/AnalyticsService';
import SecurityManager from './services/SecurityManager';

const App: React.FC = () => {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    initializeApp();
    setupAppStateListener();
    
    // Cleanup on unmount
    return () => {
      cleanupApp();
    };
  }, []);

  const initializeApp = async () => {
    try {
      // Print configuration in development
      if (__DEV__) {
        ConfigUtils.printConfig();
      }

      // Validate configuration
      if (!ConfigUtils.validateConfig()) {
        LoggerService.error('Invalid app configuration detected');
      }

      // Initialize performance monitoring
      const performanceMonitor = PerformanceMonitor.getInstance();
      performanceMonitor.recordMetric('app_init_start', Date.now(), 'ms', 'technical');

      // Initialize analytics
      const analytics = AnalyticsService.getInstance();
      analytics.trackEvent('app_launched', {
        environment: Config.environment,
        version: '1.0.0',
        platform: 'react-native',
      }, 'technical');

      // Initialize security manager
      const securityManager = SecurityManager.getInstance();
      
      LoggerService.info('App initialized successfully', {
        environment: Config.environment,
        features: Object.keys(Config.features).filter(key => 
          Config.features[key as keyof typeof Config.features]
        ),
      });

      performanceMonitor.recordMetric('app_init_complete', Date.now(), 'ms', 'technical');
    } catch (error) {
      LoggerService.error('Failed to initialize app', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      
      // Track initialization failure
      AnalyticsService.getInstance().trackError(error as Error, 'app_initialization', true);
    }
  };

  const setupAppStateListener = () => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const analytics = AnalyticsService.getInstance();
      const performanceMonitor = PerformanceMonitor.getInstance();

      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        LoggerService.info('App became active');
        analytics.trackEvent('app_foreground', {}, 'technical');
        analytics.resume();
      } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        // App has gone to the background
        LoggerService.info('App went to background');
        analytics.trackEvent('app_background', {}, 'technical');
        analytics.pause();
        
        // Flush logs and analytics
        LoggerService.flush();
      }

      appState.current = nextAppState;
    });

    return subscription;
  };

  const cleanupApp = async () => {
    try {
      LoggerService.info('App cleanup started');
      
      // Cleanup services
      AnalyticsService.getInstance().destroy();
      PerformanceMonitor.getInstance().stopMonitoring();
      await LoggerService.flush();
      
      LoggerService.info('App cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup app:', error);
    }
  };

  const handleNavigationStateChange = (state: any) => {
    // Track navigation for analytics
    if (state && state.routes) {
      const currentRoute = getCurrentRouteName(state);
      if (currentRoute) {
        AnalyticsService.getInstance().trackScreen(currentRoute);
        LoggerService.logNavigation(undefined, currentRoute);
      }
    }
  };

  const getCurrentRouteName = (state: any): string | undefined => {
    if (!state || !state.routes || state.routes.length === 0) {
      return undefined;
    }

    const route = state.routes[state.index];
    
    if (route.state) {
      return getCurrentRouteName(route.state);
    }
    
    return route.name;
  };

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <SafeAreaProvider>
          <NavigationContainer onStateChange={handleNavigationStateChange}>
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;
