export interface EnvironmentConfig {
  API_URL: string;
  WEBSOCKET_URL: string;
  BLOCKCHAIN_RPC_URL: string;
  CHAIN_ID: number;
  CONTRACT_ADDRESSES: {
    PLAN_FACTORY: string;
    PAYMENT_PROCESSOR: string;
    NFT_MANAGER: string;
  };
  FIREBASE_CONFIG: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  ANALYTICS_CONFIG: {
    MIXPANEL_TOKEN?: string;
    AMPLITUDE_API_KEY?: string;
  };
  SENTRY_DSN?: string;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  ENABLE_FLIPPER: boolean;
}

const development: EnvironmentConfig = {
  API_URL: 'https://dev-api.blicence.com',
  WEBSOCKET_URL: 'wss://dev-api.blicence.com/ws',
  BLOCKCHAIN_RPC_URL: 'https://goerli.infura.io/v3/YOUR_PROJECT_ID',
  CHAIN_ID: 5, // Goerli testnet
  CONTRACT_ADDRESSES: {
    PLAN_FACTORY: '0x1234567890123456789012345678901234567890',
    PAYMENT_PROCESSOR: '0x2345678901234567890123456789012345678901',
    NFT_MANAGER: '0x3456789012345678901234567890123456789012',
  },
  FIREBASE_CONFIG: {
    apiKey: 'dev-api-key',
    authDomain: 'blicence-dev.firebaseapp.com',
    projectId: 'blicence-dev',
    storageBucket: 'blicence-dev.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:android:dev123',
  },
  ANALYTICS_CONFIG: {
    MIXPANEL_TOKEN: 'dev-mixpanel-token',
  },
  SENTRY_DSN: 'https://dev-sentry-dsn@sentry.io/project',
  LOG_LEVEL: 'debug',
  ENABLE_FLIPPER: true,
};

const production: EnvironmentConfig = {
  API_URL: 'https://api.blicence.com',
  WEBSOCKET_URL: 'wss://api.blicence.com/ws',
  BLOCKCHAIN_RPC_URL: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
  CHAIN_ID: 1, // Ethereum mainnet
  CONTRACT_ADDRESSES: {
    PLAN_FACTORY: '0x7890123456789012345678901234567890123456',
    PAYMENT_PROCESSOR: '0x8901234567890123456789012345678901234567',
    NFT_MANAGER: '0x9012345678901234567890123456789012345678',
  },
  FIREBASE_CONFIG: {
    apiKey: 'prod-api-key',
    authDomain: 'blicence-prod.firebaseapp.com',
    projectId: 'blicence-prod',
    storageBucket: 'blicence-prod.appspot.com',
    messagingSenderId: '345678901',
    appId: '1:345678901:android:prod123',
  },
  ANALYTICS_CONFIG: {
    MIXPANEL_TOKEN: 'prod-mixpanel-token',
    AMPLITUDE_API_KEY: 'prod-amplitude-key',
  },
  SENTRY_DSN: 'https://prod-sentry-dsn@sentry.io/project',
  LOG_LEVEL: 'error',
  ENABLE_FLIPPER: false,
};

function getEnvironment(): EnvironmentConfig {
  const env = __DEV__ ? 'development' : 'production';
  
  switch (env) {
    case 'production':
      return production;
    default:
      return development;
  }
}

export default getEnvironment();
