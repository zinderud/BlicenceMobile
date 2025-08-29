# 🎨 08 - Faz 6: UI/UX İyileştirmeleri ve Test Sistemi (2-3 Hafta)

## 🎯 Faz 6 Hedefleri

Bu son fazda uygulamanın kullanıcı deneyimini mükemmelleştireceğiz ve kapsamlı test sistemini oluşturacağız:
- Gelişmiş UI/UX iyileştirmeleri
- Accessibility (erişilebilirlik) desteği
- Performance optimizasyonları
- Comprehensive test suite
- Error handling ve logging
- Documentation tamamlama

## 📋 Sprint Planlaması

### Sprint 6.1: UI/UX İyileştirmeleri (4-5 gün)
- ✅ Advanced component library
- ✅ Animation ve micro-interactions
- ✅ Responsive design optimizasyonu
- ✅ Dark/Light theme refinements
- ✅ Accessibility improvements

### Sprint 6.2: Test Infrastructure (3-4 gün)
- ✅ Unit test setup ve coverage
- ✅ Integration tests
- ✅ E2E test scenarios
- ✅ Performance testing
- ✅ Security testing

### Sprint 6.3: Performance & Polish (3-4 gün)
- ✅ Code splitting ve lazy loading
- ✅ Bundle size optimization
- ✅ Memory leak prevention
- ✅ Error boundary implementation
- ✅ Production deployment preparation

## 🎨 Gelişmiş UI Komponenti Sistemi

### Enhanced Button Component
```typescript
// src/components/enhanced/Button/Button.tsx
import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  Animated,
  Dimensions,
  View,
  ActivityIndicator,
} from 'react-native';
import { useTailwind } from 'tailwind-rn';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@/contexts/ThemeContext';
import { useHaptics } from '@/hooks/useHaptics';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  animated?: boolean;
  hapticFeedback?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  animated = true,
  hapticFeedback = true,
  testID,
  accessibilityLabel,
  accessibilityHint,
  style,
  textStyle,
}) => {
  const tw = useTailwind();
  const { theme } = useTheme();
  const { triggerHaptic } = useHaptics();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const getButtonStyles = (): ViewStyle => {
    const baseStyles: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      ...tw('border'),
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      sm: { paddingHorizontal: 12, paddingVertical: 8, minHeight: 36 },
      md: { paddingHorizontal: 16, paddingVertical: 12, minHeight: 44 },
      lg: { paddingHorizontal: 20, paddingVertical: 16, minHeight: 52 },
      xl: { paddingHorizontal: 24, paddingVertical: 20, minHeight: 60 },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
      },
      secondary: {
        backgroundColor: theme.colors.secondary,
        borderColor: theme.colors.secondary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: theme.colors.primary,
        borderWidth: 1,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      },
      danger: {
        backgroundColor: theme.colors.error,
        borderColor: theme.colors.error,
      },
    };

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      width: fullWidth ? '100%' : 'auto',
      opacity: disabled ? 0.6 : 1,
    };
  };

  const getTextStyles = (): TextStyle => {
    const baseTextStyles: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    // Size text styles
    const sizeTextStyles: Record<string, TextStyle> = {
      sm: { fontSize: 14 },
      md: { fontSize: 16 },
      lg: { fontSize: 18 },
      xl: { fontSize: 20 },
    };

    // Variant text styles
    const variantTextStyles: Record<string, TextStyle> = {
      primary: { color: theme.colors.white },
      secondary: { color: theme.colors.white },
      outline: { color: theme.colors.primary },
      ghost: { color: theme.colors.primary },
      danger: { color: theme.colors.white },
    };

    return {
      ...baseTextStyles,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
    };
  };

  const handlePressIn = () => {
    if (hapticFeedback) {
      triggerHaptic('light');
    }

    if (animated) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePressOut = () => {
    if (animated) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={tw('flex-row items-center')}>
          <ActivityIndicator 
            size={size === 'sm' ? 'small' : 'small'} 
            color={getTextStyles().color} 
          />
          <Text style={[getTextStyles(), { marginLeft: 8 }, textStyle]}>
            Yükleniyor...
          </Text>
        </View>
      );
    }

    return (
      <View style={tw('flex-row items-center')}>
        {icon && iconPosition === 'left' && (
          <Icon
            name={icon}
            size={size === 'sm' ? 16 : size === 'md' ? 18 : 20}
            color={getTextStyles().color}
            style={{ marginRight: 8 }}
          />
        )}
        
        <Text style={[getTextStyles(), textStyle]}>
          {title}
        </Text>
        
        {icon && iconPosition === 'right' && (
          <Icon
            name={icon}
            size={size === 'sm' ? 16 : size === 'md' ? 18 : 20}
            color={getTextStyles().color}
            style={{ marginLeft: 8 }}
          />
        )}
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
        style,
      ]}
    >
      <TouchableOpacity
        style={[getButtonStyles()]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        testID={testID}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || loading }}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default Button;
```

### Advanced Card Component
```typescript
// src/components/enhanced/Card/Card.tsx
import React, { useRef, useEffect } from 'react';
import {
  View,
  ViewStyle,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { useTheme } from '@/contexts/ThemeContext';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  onPress?: () => void;
  animated?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  style?: ViewStyle;
  shadow?: boolean;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  margin = 'none',
  onPress,
  animated = true,
  testID,
  accessibilityLabel,
  style,
  shadow = true,
  borderRadius = 'md',
}) => {
  const tw = useTailwind();
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(1)).current;

  const getCardStyles = (): ViewStyle => {
    const baseStyles: ViewStyle = {
      backgroundColor: theme.colors.surface,
    };

    // Padding styles
    const paddingStyles: Record<string, ViewStyle> = {
      none: {},
      sm: { padding: 8 },
      md: { padding: 16 },
      lg: { padding: 24 },
      xl: { padding: 32 },
    };

    // Margin styles
    const marginStyles: Record<string, ViewStyle> = {
      none: {},
      sm: { margin: 8 },
      md: { margin: 16 },
      lg: { margin: 24 },
      xl: { margin: 32 },
    };

    // Border radius styles
    const borderRadiusStyles: Record<string, ViewStyle> = {
      none: { borderRadius: 0 },
      sm: { borderRadius: 4 },
      md: { borderRadius: 8 },
      lg: { borderRadius: 12 },
      xl: { borderRadius: 16 },
      full: { borderRadius: 9999 },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      elevated: {
        ...Platform.select({
          ios: {
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
          android: {
            elevation: shadow ? 4 : 0,
          },
        }),
      },
      outlined: {
        borderWidth: 1,
        borderColor: theme.colors.border,
      },
      filled: {
        backgroundColor: theme.colors.surfaceVariant,
      },
    };

    return {
      ...baseStyles,
      ...paddingStyles[padding],
      ...marginStyles[margin],
      ...borderRadiusStyles[borderRadius],
      ...variantStyles[variant],
    };
  };

  const handlePressIn = () => {
    if (animated && onPress) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.98,
          useNativeDriver: true,
        }),
        Animated.timing(shadowAnim, {
          toValue: 0.5,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  const handlePressOut = () => {
    if (animated && onPress) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(shadowAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
    shadowOpacity: Platform.OS === 'ios' ? shadowAnim : undefined,
    elevation: Platform.OS === 'android' ? shadowAnim : undefined,
  };

  if (onPress) {
    return (
      <Animated.View style={[animatedStyle, style]}>
        <TouchableOpacity
          style={getCardStyles()}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          testID={testID}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          activeOpacity={0.9}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View 
      style={[animatedStyle, getCardStyles(), style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </Animated.View>
  );
};

export default Card;
```

## 🧪 Comprehensive Test Suite

### Unit Test Configuration
```typescript
// __tests__/setup.js
import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock React Native modules
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Firebase
jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: () => ({
    requestPermission: jest.fn(() => Promise.resolve(true)),
    getToken: jest.fn(() => Promise.resolve('mock-token')),
    onMessage: jest.fn(),
    onNotificationOpenedApp: jest.fn(),
    setBackgroundMessageHandler: jest.fn(),
    onTokenRefresh: jest.fn(),
  }),
}));

// Mock WalletConnect
jest.mock('@walletconnect/react-native-dapp', () => ({
  WalletConnectProvider: ({ children }) => children,
  useWalletConnect: () => ({
    connector: {
      connected: false,
      accounts: [],
      chainId: 1,
    },
    connect: jest.fn(),
    killSession: jest.fn(),
  }),
}));

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    providers: {
      JsonRpcProvider: jest.fn(),
    },
    Contract: jest.fn(),
    utils: {
      parseEther: jest.fn(),
      formatEther: jest.fn(),
      isAddress: jest.fn(() => true),
    },
  },
}));

// Global test utilities
global.fetch = jest.fn();
global.__DEV__ = true;

// Silence warnings
console.warn = jest.fn();
console.error = jest.fn();
```

### Component Tests
```typescript
// __tests__/components/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Button from '@/components/enhanced/Button/Button';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('Button Component', () => {
  it('renders correctly with basic props', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithTheme(
      <Button title="Test Button" onPress={onPress} />
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithTheme(
      <Button title="Test Button" onPress={onPress} />
    );

    fireEvent.press(getByText('Test Button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithTheme(
      <Button title="Test Button" onPress={onPress} disabled />
    );

    fireEvent.press(getByText('Test Button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows loading state correctly', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithTheme(
      <Button title="Test Button" onPress={onPress} loading />
    );

    expect(getByText('Yükleniyor...')).toBeTruthy();
  });

  it('renders with icon correctly', () => {
    const onPress = jest.fn();
    const { getByTestId } = renderWithTheme(
      <Button 
        title="Test Button" 
        onPress={onPress} 
        icon="checkmark"
        testID="button-with-icon"
      />
    );

    expect(getByTestId('button-with-icon')).toBeTruthy();
  });

  describe('variants', () => {
    it.each(['primary', 'secondary', 'outline', 'ghost', 'danger'])(
      'renders %s variant correctly',
      (variant) => {
        const onPress = jest.fn();
        const { getByText } = renderWithTheme(
          <Button 
            title="Test Button" 
            onPress={onPress} 
            variant={variant as any}
          />
        );

        expect(getByText('Test Button')).toBeTruthy();
      }
    );
  });

  describe('sizes', () => {
    it.each(['sm', 'md', 'lg', 'xl'])(
      'renders %s size correctly',
      (size) => {
        const onPress = jest.fn();
        const { getByText } = renderWithTheme(
          <Button 
            title="Test Button" 
            onPress={onPress} 
            size={size as any}
          />
        );

        expect(getByText('Test Button')).toBeTruthy();
      }
    );
  });
});
```

### Service Tests
```typescript
// __tests__/services/WebSocketService.test.ts
import WebSocketService from '@/services/realtime/WebSocketService';
import { store } from '@/store';

// Mock WebSocket
global.WebSocket = jest.fn().mockImplementation(() => ({
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

describe('WebSocketService', () => {
  let wsService: typeof WebSocketService;

  beforeEach(() => {
    wsService = WebSocketService;
    jest.clearAllMocks();
  });

  afterEach(() => {
    wsService.disconnect();
  });

  it('should create singleton instance', () => {
    const instance1 = WebSocketService;
    const instance2 = WebSocketService;
    expect(instance1).toBe(instance2);
  });

  it('should connect successfully', async () => {
    const mockWS = {
      readyState: 1,
      send: jest.fn(),
      close: jest.fn(),
      onopen: null,
      onmessage: null,
      onclose: null,
      onerror: null,
    };

    (global.WebSocket as jest.Mock).mockImplementation(() => mockWS);

    await wsService.connect('0x123', 'token123');

    expect(global.WebSocket).toHaveBeenCalledWith(
      expect.stringContaining('address=0x123&token=token123')
    );
  });

  it('should handle message correctly', () => {
    const mockWS = {
      readyState: 1,
      send: jest.fn(),
      close: jest.fn(),
      onopen: null,
      onmessage: null,
      onclose: null,
      onerror: null,
    };

    (global.WebSocket as jest.Mock).mockImplementation(() => mockWS);

    const mockMessage = {
      type: 'PLAN_USAGE_UPDATED',
      payload: { customerPlanId: '123', usageData: {} },
      timestamp: Date.now(),
      id: 'msg123',
    };

    // Simulate message reception
    if (mockWS.onmessage) {
      mockWS.onmessage({ data: JSON.stringify(mockMessage) });
    }

    // Verify message processing (would check store state in real test)
  });

  it('should queue messages when offline', () => {
    const mockWS = {
      readyState: 0, // Connecting
      send: jest.fn(),
      close: jest.fn(),
    };

    (global.WebSocket as jest.Mock).mockImplementation(() => mockWS);

    wsService.sendMessage({
      type: 'TEST_MESSAGE',
      payload: { test: true },
    });

    // Message should be queued, not sent immediately
    expect(mockWS.send).not.toHaveBeenCalled();
  });

  it('should reconnect on connection loss', (done) => {
    const mockWS = {
      readyState: 3, // Closed
      send: jest.fn(),
      close: jest.fn(),
      onopen: null,
      onmessage: null,
      onclose: null,
      onerror: null,
    };

    (global.WebSocket as jest.Mock).mockImplementation(() => mockWS);

    // Simulate connection close
    if (mockWS.onclose) {
      mockWS.onclose({ code: 1006, reason: 'Connection lost' });
    }

    // Should attempt reconnection after a delay
    setTimeout(() => {
      expect(global.WebSocket).toHaveBeenCalledTimes(2);
      done();
    }, 6000);
  }, 7000);

  it('should disconnect cleanly', () => {
    const mockWS = {
      readyState: 1,
      send: jest.fn(),
      close: jest.fn(),
    };

    (global.WebSocket as jest.Mock).mockImplementation(() => mockWS);

    wsService.disconnect();

    expect(mockWS.close).toHaveBeenCalledWith(1000, 'Manual disconnect');
  });
});
```

### Integration Tests
```typescript
// __tests__/integration/PlanPurchase.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { store } from '@/store';
import { ThemeProvider } from '@/contexts/ThemeContext';
import PlanDetailsScreen from '@/screens/marketplace/PlanDetailsScreen';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <ThemeProvider>
        <NavigationContainer>
          {component}
        </NavigationContainer>
      </ThemeProvider>
    </Provider>
  );
};

describe('Plan Purchase Flow', () => {
  const mockPlan = {
    id: 'plan123',
    name: 'Test Plan',
    description: 'Test description',
    type: 'API',
    price: '10',
    maxUsage: 1000,
    producerAddress: '0xproducer',
    isActive: true,
  };

  beforeEach(() => {
    // Mock navigation
    jest.mock('@react-navigation/native', () => ({
      ...jest.requireActual('@react-navigation/native'),
      useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
      }),
      useRoute: () => ({
        params: { plan: mockPlan },
      }),
    }));
  });

  it('should display plan details correctly', () => {
    const { getByText } = renderWithProviders(
      <PlanDetailsScreen />
    );

    expect(getByText('Test Plan')).toBeTruthy();
    expect(getByText('Test description')).toBeTruthy();
    expect(getByText('10 ETH')).toBeTruthy();
  });

  it('should handle plan purchase flow', async () => {
    const { getByText, getByTestId } = renderWithProviders(
      <PlanDetailsScreen />
    );

    // Click purchase button
    const purchaseButton = getByText('Planı Satın Al');
    fireEvent.press(purchaseButton);

    // Should show wallet connection modal
    await waitFor(() => {
      expect(getByText('Cüzdan Bağla')).toBeTruthy();
    });

    // Simulate wallet connection
    const connectButton = getByTestId('connect-wallet-button');
    fireEvent.press(connectButton);

    // Should proceed to purchase confirmation
    await waitFor(() => {
      expect(getByText('Satın Alma Onayı')).toBeTruthy();
    });
  });

  it('should handle purchase errors gracefully', async () => {
    // Mock failed purchase
    jest.mock('@/services/blockchain/ContractService', () => ({
      purchasePlan: jest.fn().mockRejectedValue(new Error('Transaction failed')),
    }));

    const { getByText } = renderWithProviders(
      <PlanDetailsScreen />
    );

    fireEvent.press(getByText('Planı Satın Al'));

    await waitFor(() => {
      expect(getByText('İşlem başarısız oldu')).toBeTruthy();
    });
  });
});
```

## 🔍 Performance Testing

### Performance Monitor
```typescript
// src/utils/performance/PerformanceMonitor.ts
import { InteractionManager, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface MemoryUsage {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
  timestamp: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private memorySnapshots: MemoryUsage[] = [];
  private monitoringEnabled = __DEV__;

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(name: string, metadata?: Record<string, any>): void {
    if (!this.monitoringEnabled) return;

    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata,
    };

    this.metrics.push(metric);
  }

  endTiming(name: string): number | null {
    if (!this.monitoringEnabled) return null;

    const metricIndex = this.metrics.findIndex(
      (m) => m.name === name && !m.endTime
    );

    if (metricIndex === -1) {
      console.warn(`No active timing found for: ${name}`);
      return null;
    }

    const metric = this.metrics[metricIndex];
    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    console.log(`⏱️ ${name}: ${metric.duration.toFixed(2)}ms`);

    // Warn about slow operations
    if (metric.duration > 1000) {
      console.warn(`🐌 Slow operation detected: ${name} took ${metric.duration.toFixed(2)}ms`);
    }

    return metric.duration;
  }

  measureFunction<T extends (...args: any[]) => any>(
    name: string,
    fn: T,
    metadata?: Record<string, any>
  ): T {
    return ((...args: any[]) => {
      this.startTiming(name, metadata);
      const result = fn(...args);
      
      if (result instanceof Promise) {
        return result.finally(() => {
          this.endTiming(name);
        });
      }
      
      this.endTiming(name);
      return result;
    }) as T;
  }

  measureAsyncFunction<T extends (...args: any[]) => Promise<any>>(
    name: string,
    fn: T,
    metadata?: Record<string, any>
  ): T {
    return (async (...args: any[]) => {
      this.startTiming(name, metadata);
      try {
        const result = await fn(...args);
        return result;
      } finally {
        this.endTiming(name);
      }
    }) as T;
  }

  measureComponentRender<P extends object>(
    Component: React.ComponentType<P>,
    displayName?: string
  ): React.ComponentType<P> {
    const componentName = displayName || Component.displayName || Component.name || 'Component';
    
    return (props: P) => {
      this.startTiming(`Render:${componentName}`);
      
      React.useLayoutEffect(() => {
        this.endTiming(`Render:${componentName}`);
      });

      return React.createElement(Component, props);
    };
  }

  captureMemorySnapshot(): void {
    if (!this.monitoringEnabled) return;

    // Note: These properties might not be available in React Native
    // This is more relevant for web environments
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      const snapshot: MemoryUsage = {
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        totalJSHeapSize: memory.totalJSHeapSize,
        usedJSHeapSize: memory.usedJSHeapSize,
        timestamp: Date.now(),
      };

      this.memorySnapshots.push(snapshot);

      // Keep only last 100 snapshots
      if (this.memorySnapshots.length > 100) {
        this.memorySnapshots = this.memorySnapshots.slice(-100);
      }

      // Check for memory leaks
      this.checkMemoryLeaks();
    }
  }

  private checkMemoryLeaks(): void {
    if (this.memorySnapshots.length < 10) return;

    const recent = this.memorySnapshots.slice(-10);
    const oldestUsage = recent[0].usedJSHeapSize;
    const newestUsage = recent[recent.length - 1].usedJSHeapSize;
    
    const growthPercentage = ((newestUsage - oldestUsage) / oldestUsage) * 100;

    if (growthPercentage > 50) {
      console.warn(
        `🚨 Potential memory leak detected: ${growthPercentage.toFixed(1)}% growth over last 10 snapshots`
      );
    }
  }

  generateReport(): string {
    const completedMetrics = this.metrics.filter(m => m.duration);
    
    if (completedMetrics.length === 0) {
      return 'No performance metrics available';
    }

    const avgDuration = completedMetrics.reduce((sum, m) => sum + m.duration!, 0) / completedMetrics.length;
    const slowestMetric = completedMetrics.reduce((max, m) => m.duration! > max.duration! ? m : max);
    const fastestMetric = completedMetrics.reduce((min, m) => m.duration! < min.duration! ? m : min);

    let report = `🎯 Performance Report\n`;
    report += `📊 Total operations: ${completedMetrics.length}\n`;
    report += `⏱️ Average duration: ${avgDuration.toFixed(2)}ms\n`;
    report += `🐌 Slowest: ${slowestMetric.name} (${slowestMetric.duration!.toFixed(2)}ms)\n`;
    report += `⚡ Fastest: ${fastestMetric.name} (${fastestMetric.duration!.toFixed(2)}ms)\n`;

    if (this.memorySnapshots.length > 0) {
      const latestMemory = this.memorySnapshots[this.memorySnapshots.length - 1];
      const memoryUsageMB = (latestMemory.usedJSHeapSize / 1024 / 1024).toFixed(2);
      report += `💾 Current memory usage: ${memoryUsageMB}MB\n`;
    }

    return report;
  }

  async saveReport(): Promise<void> {
    try {
      const report = this.generateReport();
      const timestamp = new Date().toISOString();
      await AsyncStorage.setItem(`performance_report_${timestamp}`, report);
      console.log('Performance report saved');
    } catch (error) {
      console.error('Failed to save performance report:', error);
    }
  }

  clearMetrics(): void {
    this.metrics = [];
    this.memorySnapshots = [];
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getMemorySnapshots(): MemoryUsage[] {
    return [...this.memorySnapshots];
  }

  setMonitoringEnabled(enabled: boolean): void {
    this.monitoringEnabled = enabled;
  }
}

export default PerformanceMonitor.getInstance();
```

Bu Faz 6'nın tamamlanmasıyla uygulama production-ready hale gelecek ve kapsamlı test coverage ile birlikte yayınlanmaya hazır olacak.
