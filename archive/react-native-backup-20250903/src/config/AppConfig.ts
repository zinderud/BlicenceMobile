import { Platform } from 'react-native';

export interface AppConfig {
  environment: 'development' | 'staging' | 'production';
  apiBaseUrl: string;
  blockchainNetwork: 'mainnet' | 'testnet' | 'localhost';
  enableLogging: boolean;
  enableCrashReporting: boolean;
  enablePerformanceMonitoring: boolean;
  enableAnalytics: boolean;
  maxLogFileSize: number;
  logRetentionDays: number;
  apiTimeout: number;
  retryAttempts: number;
  features: {
    nftMarketplace: boolean;
    qrCodeScanning: boolean;
    pushNotifications: boolean;
    biometricAuth: boolean;
    darkMode: boolean;
    multiLanguage: boolean;
  };
  blockchain: {
    networkId: number;
    rpcUrl: string;
    contractAddresses: {
      blicence: string;
      nft: string;
      marketplace: string;
    };
    gasLimits: {
      transfer: number;
      mint: number;
      marketplace: number;
    };
  };
  security: {
    encryptionEnabled: boolean;
    biometricTimeout: number;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
  };
  ui: {
    animationsEnabled: boolean;
    hapticFeedback: boolean;
    autoTheme: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
  notifications: {
    enabled: boolean;
    badge: boolean;
    sound: boolean;
    vibration: boolean;
    categories: string[];
  };
}

// Development Configuration
const developmentConfig: AppConfig = {
  environment: 'development',
  apiBaseUrl: 'http://localhost:3000/api',
  blockchainNetwork: 'testnet',
  enableLogging: true,
  enableCrashReporting: false,
  enablePerformanceMonitoring: true,
  enableAnalytics: false,
  maxLogFileSize: 10 * 1024 * 1024, // 10MB
  logRetentionDays: 7,
  apiTimeout: 30000,
  retryAttempts: 3,
  features: {
    nftMarketplace: true,
    qrCodeScanning: true,
    pushNotifications: true,
    biometricAuth: true,
    darkMode: true,
    multiLanguage: true,
  },
  blockchain: {
    networkId: 80001, // Polygon Mumbai
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    contractAddresses: {
      blicence: '0x1234567890123456789012345678901234567890',
      nft: '0x2345678901234567890123456789012345678901',
      marketplace: '0x3456789012345678901234567890123456789012',
    },
    gasLimits: {
      transfer: 100000,
      mint: 200000,
      marketplace: 300000,
    },
  },
  security: {
    encryptionEnabled: true,
    biometricTimeout: 300000, // 5 minutes
    sessionTimeout: 1800000, // 30 minutes
    maxLoginAttempts: 3,
    passwordMinLength: 8,
  },
  ui: {
    animationsEnabled: true,
    hapticFeedback: true,
    autoTheme: true,
    fontSize: 'medium',
  },
  notifications: {
    enabled: true,
    badge: true,
    sound: true,
    vibration: Platform.OS === 'android',
    categories: ['license', 'payment', 'system', 'marketing'],
  },
};

// Staging Configuration
const stagingConfig: AppConfig = {
  ...developmentConfig,
  environment: 'staging',
  apiBaseUrl: 'https://staging-api.blicence.com/api',
  enableCrashReporting: true,
  enableAnalytics: true,
  logRetentionDays: 14,
  blockchain: {
    ...developmentConfig.blockchain,
    contractAddresses: {
      blicence: '0xSTAGING1234567890123456789012345678901',
      nft: '0xSTAGING2345678901234567890123456789012',
      marketplace: '0xSTAGING3456789012345678901234567890123',
    },
  },
};

// Production Configuration
const productionConfig: AppConfig = {
  ...developmentConfig,
  environment: 'production',
  apiBaseUrl: 'https://api.blicence.com/api',
  blockchainNetwork: 'mainnet',
  enableLogging: false,
  enableCrashReporting: true,
  enablePerformanceMonitoring: true,
  enableAnalytics: true,
  maxLogFileSize: 5 * 1024 * 1024, // 5MB
  logRetentionDays: 30,
  apiTimeout: 15000,
  retryAttempts: 5,
  blockchain: {
    networkId: 137, // Polygon Mainnet
    rpcUrl: 'https://polygon-rpc.com',
    contractAddresses: {
      blicence: '0xPROD1234567890123456789012345678901234',
      nft: '0xPROD2345678901234567890123456789012345',
      marketplace: '0xPROD3456789012345678901234567890123456',
    },
    gasLimits: {
      transfer: 80000,
      mint: 150000,
      marketplace: 250000,
    },
  },
  security: {
    ...developmentConfig.security,
    sessionTimeout: 3600000, // 1 hour
    maxLoginAttempts: 5,
    passwordMinLength: 10,
  },
  ui: {
    ...developmentConfig.ui,
    animationsEnabled: true,
  },
  notifications: {
    ...developmentConfig.notifications,
    categories: ['license', 'payment', 'system'],
  },
};

// Get configuration based on environment
function getConfig(): AppConfig {
  if (__DEV__) {
    return developmentConfig;
  }
  
  // In a real app, you would check for staging vs production
  // This could be done via build variants, environment variables, etc.
  const environment = process.env.NODE_ENV;
  
  switch (environment) {
    case 'staging':
      return stagingConfig;
    case 'production':
      return productionConfig;
    default:
      return developmentConfig;
  }
}

// Export the active configuration
export const Config = getConfig();

// Export individual configs for testing
export {
  developmentConfig,
  stagingConfig,
  productionConfig,
};

// Configuration utilities
export class ConfigUtils {
  static isProduction(): boolean {
    return Config.environment === 'production';
  }

  static isDevelopment(): boolean {
    return Config.environment === 'development';
  }

  static isStaging(): boolean {
    return Config.environment === 'staging';
  }

  static getApiUrl(endpoint: string): string {
    return `${Config.apiBaseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  }

  static getContractAddress(contractName: keyof AppConfig['blockchain']['contractAddresses']): string {
    return Config.blockchain.contractAddresses[contractName];
  }

  static isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return Config.features[feature];
  }

  static getGasLimit(operation: keyof AppConfig['blockchain']['gasLimits']): number {
    return Config.blockchain.gasLimits[operation];
  }

  static shouldShowLogs(): boolean {
    return Config.enableLogging && __DEV__;
  }

  static getLogLevel(): 'debug' | 'info' | 'warn' | 'error' {
    if (ConfigUtils.isDevelopment()) {
      return 'debug';
    } else if (ConfigUtils.isStaging()) {
      return 'info';
    } else {
      return 'error';
    }
  }

  static getNotificationSettings() {
    return {
      ...Config.notifications,
      categories: Config.notifications.categories.filter(category => {
        // Filter out marketing notifications in production for some users
        if (ConfigUtils.isProduction() && category === 'marketing') {
          return false; // Could be based on user preferences
        }
        return true;
      }),
    };
  }

  static validateConfig(): boolean {
    try {
      // Validate required URLs
      if (!Config.apiBaseUrl || !Config.blockchain.rpcUrl) {
        console.error('Missing required URLs in configuration');
        return false;
      }

      // Validate contract addresses
      const addresses = Object.values(Config.blockchain.contractAddresses);
      for (const address of addresses) {
        if (!address || address.length !== 42 || !address.startsWith('0x')) {
          console.error('Invalid contract address:', address);
          return false;
        }
      }

      // Validate network configuration
      if (Config.blockchain.networkId <= 0) {
        console.error('Invalid network ID');
        return false;
      }

      // Validate timeouts
      if (Config.apiTimeout <= 0 || Config.security.sessionTimeout <= 0) {
        console.error('Invalid timeout configuration');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Configuration validation failed:', error);
      return false;
    }
  }

  static printConfig(): void {
    if (!__DEV__) return;

    console.log('🔧 App Configuration:');
    console.log(`Environment: ${Config.environment}`);
    console.log(`API Base URL: ${Config.apiBaseUrl}`);
    console.log(`Blockchain Network: ${Config.blockchainNetwork} (${Config.blockchain.networkId})`);
    console.log(`Logging: ${Config.enableLogging ? 'Enabled' : 'Disabled'}`);
    console.log(`Analytics: ${Config.enableAnalytics ? 'Enabled' : 'Disabled'}`);
    console.log(`Crash Reporting: ${Config.enableCrashReporting ? 'Enabled' : 'Disabled'}`);
    console.log('Features:', Object.entries(Config.features)
      .filter(([, enabled]) => enabled)
      .map(([name]) => name)
      .join(', '));
  }
}

// Environment-specific exports
export const API_BASE_URL = Config.apiBaseUrl;
export const BLOCKCHAIN_NETWORK = Config.blockchainNetwork;
export const CONTRACT_ADDRESSES = Config.blockchain.contractAddresses;
export const IS_PRODUCTION = ConfigUtils.isProduction();
export const IS_DEVELOPMENT = ConfigUtils.isDevelopment();
export const ENABLE_LOGGING = Config.enableLogging;
export const ENABLE_ANALYTICS = Config.enableAnalytics;
