# 🏗️ 03 - Faz 1: Temel Altyapı Kurulumu (2-3 Hafta)

## 🎯 Faz 1 Hedefleri

Bu fazda temel proje altyapısını kuracak ve çekirdek servisleri geliştirecekiz:
- React Native projesinin kurulumu
- Temel navigasyon yapısı
- Wallet entegrasyonu
- Basit authentication sistemi
- Redux store konfigürasyonu

## 📋 Sprint Planlaması

### Sprint 1.1: Proje Kurulumu (3-4 gün)
- ✅ React Native proje başlatma
- ✅ Temel bağımlılıkları yükleme
- ✅ Dosya yapısını oluşturma
- ✅ ESLint ve Prettier konfigürasyonu
- ✅ Git hooks kurulumu

### Sprint 1.2: Navigasyon ve Tema (3-4 gün)
- ✅ React Navigation kurulumu
- ✅ Tab ve Stack navigator'ların kurulumu
- ✅ Tema sisteminin oluşturulması
- ✅ Temel component library
- ✅ Safe area handling

### Sprint 1.3: Wallet Entegrasyonu (4-5 gün)
- ✅ WalletConnect v2 entegrasyonu
- ✅ Wallet connection flow
- ✅ Secure storage implementation
- ✅ Biometric authentication
- ✅ Session management

## 🚀 Kurulum Adımları

### Adım 1: Proje Başlatma

```bash
# React Native projesi oluşturma
npx react-native@latest init BlimobilApp --template react-native-template-typescript

# Proje dizinine gitme
cd BlimobilApp

# Temel klasör yapısını oluşturma
mkdir -p src/{components,screens,services,store,navigation,types,utils,hooks,theme,assets}
mkdir -p src/components/{common,plans,marketplace,producer,nft,qr,wallet}
mkdir -p src/screens/{auth,customer,marketplace,producer,qr,settings}
mkdir -p src/services/{blockchain,api,storage,push,qr,sync}
mkdir -p src/store/{slices,middleware,selectors}
mkdir -p src/assets/{images,icons,fonts,animations}
```

### Adım 2: Temel Bağımlılıkları Yükleme

```bash
# Navigation
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler react-native-reanimated

# State Management
npm install @reduxjs/toolkit react-redux redux-persist

# Blockchain & Wallet
npm install ethers @walletconnect/react-native-v2
npm install react-native-keychain react-native-biometrics

# UI & Animation
npm install react-native-svg react-native-linear-gradient
npm install react-native-vector-icons react-native-reanimated

# Storage
npm install @react-native-async-storage/async-storage

# QR Code
npm install react-native-qrcode-generator react-native-qrcode-scanner
npm install react-native-camera react-native-permissions

# Utils
npm install react-native-device-info react-native-uuid
npm install @react-native-clipboard/clipboard

# Development
npm install --save-dev @types/react @types/react-native
npm install --save-dev eslint prettier @typescript-eslint/parser
npm install --save-dev husky lint-staged
```

### Adım 3: TypeScript Konfigürasyonu

```typescript
// tsconfig.json
{
  "extends": "@react-native/typescript-config/tsconfig.json",
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@/components/*": ["components/*"],
      "@/screens/*": ["screens/*"],
      "@/services/*": ["services/*"],
      "@/store/*": ["store/*"],
      "@/types/*": ["types/*"],
      "@/utils/*": ["utils/*"],
      "@/hooks/*": ["hooks/*"],
      "@/theme/*": ["theme/*"],
      "@/assets/*": ["assets/*"]
    },
    "strict": true,
    "noImplicitReturns": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "ios",
    "android"
  ]
}
```

### Adım 4: ESLint ve Prettier Konfigürasyonu

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: [
    '@react-native-community',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    'react-native/no-inline-styles': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
```

```json
// .prettierrc
{
  "bracketSpacing": true,
  "jsxBracketSameLine": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 80
}
```

## 🎨 Tema Sistemi Kurulumu

### Renk Paleti
```typescript
// src/theme/colors.ts
export const lightColors = {
  // Primary colors
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  
  // Secondary colors
  secondary: '#10B981',
  secondaryLight: '#34D399',
  secondaryDark: '#059669',
  
  // Accent colors
  accent: '#F59E0B',
  accentLight: '#FBBF24',
  accentDark: '#D97706',
  
  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Gray scale
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // Background colors
  background: '#FFFFFF',
  surface: '#F9FAFB',
  card: '#FFFFFF',
  
  // Text colors
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',
};

export const darkColors = {
  // Primary colors
  primary: '#818CF8',
  primaryLight: '#A5B4FC',
  primaryDark: '#6366F1',
  
  // Secondary colors
  secondary: '#34D399',
  secondaryLight: '#6EE7B7',
  secondaryDark: '#10B981',
  
  // Accent colors
  accent: '#FBBF24',
  accentLight: '#FCD34D',
  accentDark: '#F59E0B',
  
  // Semantic colors
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  
  // Gray scale
  gray50: '#111827',
  gray100: '#1F2937',
  gray200: '#374151',
  gray300: '#4B5563',
  gray400: '#6B7280',
  gray500: '#9CA3AF',
  gray600: '#D1D5DB',
  gray700: '#E5E7EB',
  gray800: '#F3F4F6',
  gray900: '#F9FAFB',
  
  // Background colors
  background: '#111827',
  surface: '#1F2937',
  card: '#374151',
  
  // Text colors
  textPrimary: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
  textInverse: '#111827',
  
  // Border colors
  border: '#374151',
  borderLight: '#4B5563',
  borderDark: '#1F2937',
};

export type Colors = typeof lightColors;
```

### Typography Sistemi
```typescript
// src/theme/typography.ts
export const typography = {
  // Font families
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // Line heights
  lineHeight: {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 28,
    '2xl': 32,
    '3xl': 36,
    '4xl': 40,
    '5xl': 52,
  },
  
  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
  
  // Text styles
  heading1: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  heading2: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  heading3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  heading4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  heading5: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  heading6: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  
  body1: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
  },
  body2: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
  },
  
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
};

export type Typography = typeof typography;
```

### Spacing Sistemi
```typescript
// src/theme/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 80,
  '5xl': 96,
};

export type Spacing = typeof spacing;
```

## 🧩 Redux Store Konfigürasyonu

### Store Kurulumu
```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

// Slices
import authSlice from './slices/authSlice';
import customerSlice from './slices/customerSlice';
import producerSlice from './slices/producerSlice';
import plansSlice from './slices/plansSlice';
import marketplaceSlice from './slices/marketplaceSlice';
import walletSlice from './slices/walletSlice';
import settingsSlice from './slices/settingsSlice';

// Middleware
import { syncMiddleware } from './middleware/syncMiddleware';
import { loggingMiddleware } from './middleware/loggingMiddleware';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'settings', 'wallet'], // Sadece bunlar persist edilsin
};

const rootReducer = combineReducers({
  auth: authSlice,
  customer: customerSlice,
  producer: producerSlice,
  plans: plansSlice,
  marketplace: marketplaceSlice,
  wallet: walletSlice,
  settings: settingsSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
    .concat(syncMiddleware)
    .concat(loggingMiddleware),
  devTools: __DEV__,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Auth Slice
```typescript
// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WalletService } from '@/services/blockchain/WalletService';
import { AuthAPI } from '@/services/api/AuthAPI';

interface AuthState {
  isAuthenticated: boolean;
  walletAddress: string | null;
  userType: 'customer' | 'producer' | null;
  isLoading: boolean;
  error: string | null;
  session: {
    token: string | null;
    refreshToken: string | null;
    expiresAt: number | null;
  };
}

const initialState: AuthState = {
  isAuthenticated: false,
  walletAddress: null,
  userType: null,
  isLoading: false,
  error: null,
  session: {
    token: null,
    refreshToken: null,
    expiresAt: null,
  },
};

// Async thunks
export const connectWallet = createAsyncThunk(
  'auth/connectWallet',
  async (_, { rejectWithValue }) => {
    try {
      const address = await WalletService.connectWallet();
      return address;
    } catch (error) {
      return rejectWithValue('Wallet connection failed');
    }
  }
);

export const authenticateUser = createAsyncThunk(
  'auth/authenticateUser',
  async (walletAddress: string, { rejectWithValue }) => {
    try {
      const signature = await WalletService.signMessage('Login to Blimobil');
      const result = await AuthAPI.login(walletAddress, signature);
      return result;
    } catch (error) {
      return rejectWithValue('Authentication failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await AuthAPI.logout();
      await WalletService.disconnect();
      return true;
    } catch (error) {
      return rejectWithValue('Logout failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUserType: (state, action: PayloadAction<'customer' | 'producer'>) => {
      state.userType = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Connect Wallet
      .addCase(connectWallet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.walletAddress = action.payload;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Authenticate User
      .addCase(authenticateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(authenticateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.userType = action.payload.userType;
        state.session = action.payload.session;
      })
      .addCase(authenticateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        return initialState;
      });
  },
});

export const { clearError, setUserType } = authSlice.actions;
export default authSlice.reducer;
```

## 📱 Navigasyon Sistemi

### Ana Navigatör
```typescript
// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

import { RootState } from '@/store';
import AuthNavigator from './AuthNavigator';
import CustomerTabNavigator from './CustomerTabNavigator';
import ProducerTabNavigator from './ProducerTabNavigator';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, userType } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : userType === 'customer' ? (
          <Stack.Screen name="Customer" component={CustomerTabNavigator} />
        ) : (
          <Stack.Screen name="Producer" component={ProducerTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
```

### Müşteri Tab Navigatörü
```typescript
// src/navigation/CustomerTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import DashboardScreen from '@/screens/customer/DashboardScreen';
import MyPlansScreen from '@/screens/customer/MyPlansScreen';
import MarketplaceScreen from '@/screens/marketplace/MarketplaceScreen';
import SettingsScreen from '@/screens/settings/SettingsScreen';

import { useTheme } from '@/hooks/useTheme';

const Tab = createBottomTabNavigator();

const CustomerTabNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'MyPlans':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'Marketplace':
              iconName = focused ? 'storefront' : 'storefront-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Ana Sayfa' }}
      />
      <Tab.Screen 
        name="MyPlans" 
        component={MyPlansScreen}
        options={{ title: 'Planlarım' }}
      />
      <Tab.Screen 
        name="Marketplace" 
        component={MarketplaceScreen}
        options={{ title: 'Market' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Ayarlar' }}
      />
    </Tab.Navigator>
  );
};

export default CustomerTabNavigator;
```

## 🔐 Wallet Entegrasyonu

### Wallet Service
```typescript
// src/services/blockchain/WalletService.ts
import { ethers } from 'ethers';
import WalletConnect from '@walletconnect/react-native-v2';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Keychain } from 'react-native-keychain';

interface WalletConnection {
  address: string;
  provider: ethers.providers.Provider;
  signer: ethers.Signer;
}

class WalletService {
  private static instance: WalletService;
  private connection: WalletConnection | null = null;
  private walletConnect: WalletConnect | null = null;

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  async initializeWalletConnect(): Promise<void> {
    this.walletConnect = new WalletConnect({
      projectId: 'YOUR_PROJECT_ID', // WalletConnect Cloud'dan alınacak
      metadata: {
        name: 'Blimobil',
        description: 'Blockchain Plans Mobile App',
        url: 'https://blicence.com',
        icons: ['https://blicence.com/icon.png'],
      },
    });
  }

  async connectWallet(): Promise<string> {
    try {
      if (!this.walletConnect) {
        await this.initializeWalletConnect();
      }

      const { uri, approval } = await this.walletConnect!.connect({
        requiredNamespaces: {
          eip155: {
            methods: ['eth_sendTransaction', 'personal_sign'],
            chains: ['eip155:1'], // Ethereum mainnet
            events: ['accountsChanged', 'chainChanged'],
          },
        },
      });

      // QR kod ile bağlantı kurulacak
      // URI'yi kullanıcıya göster veya deep link ile wallet'a gönder

      const session = await approval();
      const address = session.namespaces.eip155.accounts[0].split(':')[2];

      // Bağlantı bilgilerini güvenli şekilde sakla
      await this.storeConnection(address, session);

      this.connection = {
        address,
        provider: new ethers.providers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY'),
        signer: this.walletConnect!.getSigner(),
      };

      return address;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw new Error('Wallet bağlantısı başarısız');
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.connection) {
      throw new Error('Wallet not connected');
    }

    try {
      const signature = await this.connection.signer.signMessage(message);
      return signature;
    } catch (error) {
      console.error('Message signing failed:', error);
      throw new Error('İmzalama işlemi başarısız');
    }
  }

  async getBalance(tokenAddress?: string): Promise<string> {
    if (!this.connection) {
      throw new Error('Wallet not connected');
    }

    try {
      if (tokenAddress) {
        // ERC20 token balance
        const contract = new ethers.Contract(
          tokenAddress,
          ['function balanceOf(address) view returns (uint256)'],
          this.connection.provider
        );
        const balance = await contract.balanceOf(this.connection.address);
        return ethers.utils.formatEther(balance);
      } else {
        // ETH balance
        const balance = await this.connection.provider.getBalance(this.connection.address);
        return ethers.utils.formatEther(balance);
      }
    } catch (error) {
      console.error('Balance fetch failed:', error);
      throw new Error('Bakiye alınamadı');
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.walletConnect) {
        await this.walletConnect.disconnect();
      }
      
      this.connection = null;
      this.walletConnect = null;
      
      // Stored data'yı temizle
      await AsyncStorage.removeItem('wallet_session');
      await Keychain.resetInternetCredentials('wallet_credentials');
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  }

  private async storeConnection(address: string, session: any): Promise<void> {
    try {
      await AsyncStorage.setItem('wallet_session', JSON.stringify(session));
      await Keychain.setInternetCredentials(
        'wallet_credentials',
        address,
        JSON.stringify({ address, timestamp: Date.now() })
      );
    } catch (error) {
      console.error('Failed to store connection:', error);
    }
  }

  getConnectedAddress(): string | null {
    return this.connection?.address || null;
  }

  isConnected(): boolean {
    return this.connection !== null;
  }
}

export default WalletService.getInstance();
```

Bu Faz 1'in tamamlanmasıyla temel altyapı hazır olacak ve Faz 2'ye geçiş yapılabilecek.
