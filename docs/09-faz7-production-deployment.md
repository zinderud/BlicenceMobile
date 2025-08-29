# 🚀 09 - Faz 7: Production Deployment ve Maintenance (1-2 Hafta)

## 🎯 Faz 7 Hedefleri

Son fazda uygulamayı production ortamına hazırlayacağız ve sürekli bakım sistemini oluşturacağız:
- Production build optimizasyonu
- App Store ve Google Play Store deployment
- CI/CD pipeline kurulumu
- Monitoring ve analytics sistemi
- Error tracking ve crash reporting
- Maintenance ve update stratejisi

## 📋 Sprint Planlaması

### Sprint 7.1: Production Build ve Store Preparation (3-4 gün)
- ✅ Production build configuration
- ✅ App Store assets ve metadata
- ✅ Google Play Store listing
- ✅ Security audit ve penetration testing
- ✅ Legal compliance documentation

### Sprint 7.2: Deployment Pipeline (2-3 gün)
- ✅ CI/CD pipeline setup
- ✅ Automated testing integration
- ✅ Code signing ve certificate management
- ✅ Staged deployment strategy
- ✅ Rollback mechanisms

### Sprint 7.3: Monitoring ve Maintenance (2-3 gün)
- ✅ Analytics integration
- ✅ Crash reporting setup
- ✅ Performance monitoring
- ✅ User feedback collection
- ✅ Update delivery system

## 🏗️ Production Build Configuration

### Android Production Build
```gradle
// android/app/build.gradle
android {
    compileSdkVersion rootProject.ext.compileSdkVersion

    defaultConfig {
        applicationId "com.blicence.mobile"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0.0"
        
        // Enable multidex
        multiDexEnabled true
        
        // Proguard settings
        proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
    }

    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }

    buildTypes {
        debug {
            signingConfig signingConfigs.debug
            applicationIdSuffix ".debug"
            debuggable true
            minifyEnabled false
            shrinkResources false
        }
        release {
            signingConfig signingConfigs.release
            debuggable false
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"
            
            // Bundle configuration
            bundleConfig {
                language {
                    enableSplit = false
                }
                density {
                    enableSplit = true
                }
                abi {
                    enableSplit = true
                }
            }
        }
    }

    // Bundle configuration
    bundle {
        language {
            enableSplit = false
        }
        density {
            enableSplit = true
        }
        abi {
            enableSplit = true
        }
    }

    // Resource optimization
    packagingOptions {
        pickFirst '**/libc++_shared.so'
        pickFirst '**/libjsc.so'
        exclude 'META-INF/DEPENDENCIES'
        exclude 'META-INF/LICENSE'
        exclude 'META-INF/LICENSE.txt'
        exclude 'META-INF/NOTICE'
        exclude 'META-INF/NOTICE.txt'
    }
}

dependencies {
    implementation fileTree(dir: "libs", include: ["*.jar"])
    implementation "com.facebook.react:react-native:+"
    implementation "androidx.multidex:multidex:2.0.1"
    
    // Bundle size optimization
    if (enableProguardInReleaseBuilds) {
        implementation "com.facebook.soloader:soloader:0.10.4"
    }
    
    debugImplementation("com.facebook.flipper:flipper:${FLIPPER_VERSION}") {
        exclude group:'com.facebook.fbjni'
    }
    debugImplementation("com.facebook.flipper:flipper-network-plugin:${FLIPPER_VERSION}") {
        exclude group:'com.facebook.flipper'
        exclude group:'com.squareup.okhttp3', module:'okhttp'
    }
    debugImplementation("com.facebook.flipper:flipper-fresco-plugin:${FLIPPER_VERSION}") {
        exclude group:'com.facebook.flipper'
    }
}
```

### iOS Production Build
```ruby
# ios/Podfile
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

platform :ios, '11.0'
install! 'cocoapods', :deterministic_uuids => false

target 'BlicenceMobile' do
  config = use_native_modules!

  # Flags change depending on the env values.
  flags = get_default_flags()

  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true,
    :fabric_enabled => flags[:fabric_enabled],
    :flipper_configuration => FlipperConfiguration.enabled,
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  # Firebase dependencies
  pod 'Firebase/Core', '~> 10.0'
  pod 'Firebase/Messaging', '~> 10.0'
  pod 'Firebase/Analytics', '~> 10.0'
  pod 'Firebase/Crashlytics', '~> 10.0'
  
  # Security
  pod 'RNKeychain', :path => '../node_modules/react-native-keychain'
  
  target 'BlicenceMobileTests' do
    inherit! :complete
    # Pods for testing
  end

  post_install do |installer|
    react_native_post_install(installer)
    __apply_Xcode_12_5_M1_post_install_workaround(installer)
    
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings["ONLY_ACTIVE_ARCH"] = "NO"
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '11.0'
      end
    end
  end
end
```

### Environment Configuration
```typescript
// src/config/environment.ts
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

const staging: EnvironmentConfig = {
  API_URL: 'https://staging-api.blicence.com',
  WEBSOCKET_URL: 'wss://staging-api.blicence.com/ws',
  BLOCKCHAIN_RPC_URL: 'https://goerli.infura.io/v3/YOUR_PROJECT_ID',
  CHAIN_ID: 5, // Goerli testnet
  CONTRACT_ADDRESSES: {
    PLAN_FACTORY: '0x4567890123456789012345678901234567890123',
    PAYMENT_PROCESSOR: '0x5678901234567890123456789012345678901234',
    NFT_MANAGER: '0x6789012345678901234567890123456789012345',
  },
  FIREBASE_CONFIG: {
    apiKey: 'staging-api-key',
    authDomain: 'blicence-staging.firebaseapp.com',
    projectId: 'blicence-staging',
    storageBucket: 'blicence-staging.appspot.com',
    messagingSenderId: '234567890',
    appId: '1:234567890:android:staging123',
  },
  ANALYTICS_CONFIG: {
    MIXPANEL_TOKEN: 'staging-mixpanel-token',
  },
  SENTRY_DSN: 'https://staging-sentry-dsn@sentry.io/project',
  LOG_LEVEL: 'info',
  ENABLE_FLIPPER: false,
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
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return production;
    case 'staging':
      return staging;
    default:
      return development;
  }
}

export default getEnvironment();
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/mobile-ci-cd.yml
name: Mobile CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  JAVA_VERSION: '11'
  XCODE_VERSION: '14.3'

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run ESLint
      run: npm run lint

    - name: Run TypeScript check
      run: npm run type-check

    - name: Run tests
      run: npm run test -- --coverage --watchAll=false

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info

  build-android:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: Setup Java
      uses: actions/setup-java@v3
      with:
        distribution: 'temurin'
        java-version: ${{ env.JAVA_VERSION }}

    - name: Setup Android SDK
      uses: android-actions/setup-android@v2

    - name: Install dependencies
      run: npm ci

    - name: Cache Gradle
      uses: actions/cache@v3
      with:
        path: |
          ~/.gradle/caches
          ~/.gradle/wrapper
        key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}

    - name: Make gradlew executable
      run: chmod +x android/gradlew

    - name: Generate Android keystore
      run: |
        echo "${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 -d > android/app/release.keystore

    - name: Build Android APK (Debug)
      if: github.ref == 'refs/heads/develop'
      run: |
        cd android
        ./gradlew assembleDebug

    - name: Build Android AAB (Release)
      if: github.ref == 'refs/heads/main'
      env:
        MYAPP_UPLOAD_STORE_FILE: release.keystore
        MYAPP_UPLOAD_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
        MYAPP_UPLOAD_STORE_PASSWORD: ${{ secrets.ANDROID_STORE_PASSWORD }}
        MYAPP_UPLOAD_KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
      run: |
        cd android
        ./gradlew bundleRelease

    - name: Upload Android artifact
      uses: actions/upload-artifact@v3
      with:
        name: android-build
        path: |
          android/app/build/outputs/apk/debug/*.apk
          android/app/build/outputs/bundle/release/*.aab

  build-ios:
    needs: lint-and-test
    runs-on: macos-latest
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: Setup Xcode
      uses: maxim-lobanov/setup-xcode@v1
      with:
        xcode-version: ${{ env.XCODE_VERSION }}

    - name: Install dependencies
      run: npm ci

    - name: Install CocoaPods
      run: |
        cd ios
        pod install --repo-update

    - name: Import certificates
      env:
        BUILD_CERTIFICATE_BASE64: ${{ secrets.BUILD_CERTIFICATE_BASE64 }}
        P12_PASSWORD: ${{ secrets.P12_PASSWORD }}
        BUILD_PROVISION_PROFILE_BASE64: ${{ secrets.BUILD_PROVISION_PROFILE_BASE64 }}
        KEYCHAIN_PASSWORD: ${{ secrets.KEYCHAIN_PASSWORD }}
      run: |
        # Create variables
        CERTIFICATE_PATH=$RUNNER_TEMP/build_certificate.p12
        PP_PATH=$RUNNER_TEMP/build_pp.mobileprovision
        KEYCHAIN_PATH=$RUNNER_TEMP/app-signing.keychain-db

        # Import certificate and provisioning profile from secrets
        echo -n "$BUILD_CERTIFICATE_BASE64" | base64 --decode --output $CERTIFICATE_PATH
        echo -n "$BUILD_PROVISION_PROFILE_BASE64" | base64 --decode --output $PP_PATH

        # Create temporary keychain
        security create-keychain -p "$KEYCHAIN_PASSWORD" $KEYCHAIN_PATH
        security set-keychain-settings -lut 21600 $KEYCHAIN_PATH
        security unlock-keychain -p "$KEYCHAIN_PASSWORD" $KEYCHAIN_PATH

        # Import certificate to keychain
        security import $CERTIFICATE_PATH -P "$P12_PASSWORD" -A -t cert -f pkcs12 -k $KEYCHAIN_PATH
        security list-keychain -d user -s $KEYCHAIN_PATH

        # Apply provisioning profile
        mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
        cp $PP_PATH ~/Library/MobileDevice/Provisioning\ Profiles

    - name: Build iOS app (Debug)
      if: github.ref == 'refs/heads/develop'
      run: |
        xcodebuild -workspace ios/BlicenceMobile.xcworkspace \
                   -scheme BlicenceMobile \
                   -configuration Debug \
                   -destination generic/platform=iOS \
                   -archivePath $RUNNER_TEMP/BlicenceMobile.xcarchive \
                   archive

    - name: Build iOS app (Release)
      if: github.ref == 'refs/heads/main'
      run: |
        xcodebuild -workspace ios/BlicenceMobile.xcworkspace \
                   -scheme BlicenceMobile \
                   -configuration Release \
                   -destination generic/platform=iOS \
                   -archivePath $RUNNER_TEMP/BlicenceMobile.xcarchive \
                   archive

    - name: Export IPA
      if: github.ref == 'refs/heads/main'
      run: |
        xcodebuild -exportArchive \
                   -archivePath $RUNNER_TEMP/BlicenceMobile.xcarchive \
                   -exportOptionsPlist ios/ExportOptions.plist \
                   -exportPath $RUNNER_TEMP/build

    - name: Upload iOS artifact
      uses: actions/upload-artifact@v3
      with:
        name: ios-build
        path: |
          ${{ runner.temp }}/BlicenceMobile.xcarchive
          ${{ runner.temp }}/build/*.ipa

  deploy-staging:
    needs: [build-android, build-ios]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
    - name: Deploy to Firebase App Distribution
      run: |
        # Download artifacts and distribute to test groups
        echo "Deploying to staging environment"

  deploy-production:
    needs: [build-android, build-ios]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - name: Deploy to App Stores
      run: |
        # Upload to Google Play Console and App Store Connect
        echo "Deploying to production stores"
```

## 📊 Monitoring ve Analytics

### Analytics Service
```typescript
// src/services/analytics/AnalyticsService.ts
import { Amplitude } from '@amplitude/react-native';
import Mixpanel from 'react-native-mixpanel';
import crashlytics from '@react-native-firebase/crashlytics';
import analytics from '@react-native-firebase/analytics';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '@/config/environment';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: number;
}

export interface UserProperties {
  userId: string;
  walletAddress: string;
  userType: 'customer' | 'producer';
  totalPlans?: number;
  totalSpent?: string;
  totalEarned?: string;
  lastActiveDate?: string;
  appVersion?: string;
  platform?: string;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private isInitialized = false;
  private eventQueue: AnalyticsEvent[] = [];
  private userId: string | null = null;

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Initialize Amplitude
      if (Config.ANALYTICS_CONFIG.AMPLITUDE_API_KEY) {
        await Amplitude.getInstance().init(Config.ANALYTICS_CONFIG.AMPLITUDE_API_KEY);
        console.log('Amplitude initialized');
      }

      // Initialize Mixpanel
      if (Config.ANALYTICS_CONFIG.MIXPANEL_TOKEN) {
        await Mixpanel.sharedInstanceWithToken(Config.ANALYTICS_CONFIG.MIXPANEL_TOKEN);
        console.log('Mixpanel initialized');
      }

      // Initialize Firebase Analytics
      await analytics().setAnalyticsCollectionEnabled(true);
      console.log('Firebase Analytics initialized');

      // Load saved user ID
      const savedUserId = await AsyncStorage.getItem('analytics_user_id');
      if (savedUserId) {
        this.userId = savedUserId;
        await this.setUserId(savedUserId);
      }

      this.isInitialized = true;

      // Process queued events
      await this.processEventQueue();

      console.log('Analytics service initialized');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
      crashlytics().recordError(error as Error);
    }
  }

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.isInitialized) {
      this.eventQueue.push(event);
      return;
    }

    try {
      const eventData = {
        ...event.properties,
        timestamp: event.timestamp || Date.now(),
        platform: Platform.OS,
        app_version: '1.0.0', // Get from package.json
      };

      // Track with Amplitude
      if (Config.ANALYTICS_CONFIG.AMPLITUDE_API_KEY) {
        await Amplitude.getInstance().logEvent(event.name, eventData);
      }

      // Track with Mixpanel
      if (Config.ANALYTICS_CONFIG.MIXPANEL_TOKEN) {
        Mixpanel.track(event.name, eventData);
      }

      // Track with Firebase Analytics
      await analytics().logEvent(event.name, eventData);

      console.log(`Analytics event tracked: ${event.name}`, eventData);
    } catch (error) {
      console.error('Failed to track event:', error);
      crashlytics().recordError(error as Error);
    }
  }

  async setUserProperties(properties: UserProperties): Promise<void> {
    try {
      if (!this.isInitialized) {
        return;
      }

      this.userId = properties.userId;
      await AsyncStorage.setItem('analytics_user_id', properties.userId);

      const userProps = {
        ...properties,
        platform: Platform.OS,
        app_version: '1.0.0',
      };

      // Set user properties in Amplitude
      if (Config.ANALYTICS_CONFIG.AMPLITUDE_API_KEY) {
        await Amplitude.getInstance().setUserProperties(userProps);
      }

      // Set user properties in Mixpanel
      if (Config.ANALYTICS_CONFIG.MIXPANEL_TOKEN) {
        Mixpanel.set(userProps);
      }

      // Set user properties in Firebase
      await analytics().setUserProperties(userProps);

      console.log('User properties set:', userProps);
    } catch (error) {
      console.error('Failed to set user properties:', error);
      crashlytics().recordError(error as Error);
    }
  }

  async setUserId(userId: string): Promise<void> {
    try {
      this.userId = userId;
      await AsyncStorage.setItem('analytics_user_id', userId);

      // Set user ID in all analytics platforms
      if (Config.ANALYTICS_CONFIG.AMPLITUDE_API_KEY) {
        await Amplitude.getInstance().setUserId(userId);
      }

      if (Config.ANALYTICS_CONFIG.MIXPANEL_TOKEN) {
        Mixpanel.identify(userId);
      }

      await analytics().setUserId(userId);

      console.log(`User ID set: ${userId}`);
    } catch (error) {
      console.error('Failed to set user ID:', error);
      crashlytics().recordError(error as Error);
    }
  }

  private async processEventQueue(): Promise<void> {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        await this.trackEvent(event);
      }
    }
  }

  // Predefined events for common actions
  async trackScreenView(screenName: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      name: 'screen_view',
      properties: {
        screen_name: screenName,
        ...properties,
      },
    });
  }

  async trackPlanPurchase(planId: string, planType: string, price: string): Promise<void> {
    await this.trackEvent({
      name: 'plan_purchased',
      properties: {
        plan_id: planId,
        plan_type: planType,
        price,
        currency: 'ETH',
      },
    });
  }

  async trackPlanUsage(planId: string, usageType: string, amount?: number): Promise<void> {
    await this.trackEvent({
      name: 'plan_usage',
      properties: {
        plan_id: planId,
        usage_type: usageType,
        amount,
      },
    });
  }

  async trackWalletConnection(walletType: string, success: boolean): Promise<void> {
    await this.trackEvent({
      name: 'wallet_connection',
      properties: {
        wallet_type: walletType,
        success,
      },
    });
  }

  async trackError(error: Error, context?: Record<string, any>): Promise<void> {
    // Log to Crashlytics
    crashlytics().recordError(error);
    
    // Log to analytics
    await this.trackEvent({
      name: 'app_error',
      properties: {
        error_name: error.name,
        error_message: error.message,
        error_stack: error.stack,
        ...context,
      },
    });
  }

  async trackPerformance(metricName: string, duration: number, metadata?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      name: 'performance_metric',
      properties: {
        metric_name: metricName,
        duration,
        ...metadata,
      },
    });
  }

  // Revenue tracking
  async trackRevenue(amount: string, currency: string = 'ETH', properties?: Record<string, any>): Promise<void> {
    const revenue = parseFloat(amount);
    
    // Track in Amplitude
    if (Config.ANALYTICS_CONFIG.AMPLITUDE_API_KEY) {
      const revenueEvent = new Amplitude.Revenue()
        .setProductId(properties?.plan_id || 'unknown')
        .setPrice(revenue)
        .setRevenue(revenue);
      
      await Amplitude.getInstance().logRevenueV2(revenueEvent);
    }

    // Track in Mixpanel
    if (Config.ANALYTICS_CONFIG.MIXPANEL_TOKEN) {
      Mixpanel.trackCharge(revenue, {
        currency,
        ...properties,
      });
    }

    // Track in Firebase
    await analytics().logEvent('purchase', {
      currency,
      value: revenue,
      ...properties,
    });
  }

  async flush(): Promise<void> {
    try {
      if (Config.ANALYTICS_CONFIG.AMPLITUDE_API_KEY) {
        await Amplitude.getInstance().uploadEvents();
      }

      if (Config.ANALYTICS_CONFIG.MIXPANEL_TOKEN) {
        Mixpanel.flush();
      }

      console.log('Analytics events flushed');
    } catch (error) {
      console.error('Failed to flush analytics:', error);
    }
  }

  async reset(): Promise<void> {
    try {
      this.userId = null;
      await AsyncStorage.removeItem('analytics_user_id');

      if (Config.ANALYTICS_CONFIG.AMPLITUDE_API_KEY) {
        await Amplitude.getInstance().setUserId(null);
        await Amplitude.getInstance().regenerateDeviceId();
      }

      if (Config.ANALYTICS_CONFIG.MIXPANEL_TOKEN) {
        Mixpanel.reset();
      }

      await analytics().resetAnalyticsData();

      console.log('Analytics data reset');
    } catch (error) {
      console.error('Failed to reset analytics:', error);
    }
  }
}

export default AnalyticsService.getInstance();
```

### Crash Reporting ve Error Tracking
```typescript
// src/services/error/ErrorReportingService.ts
import crashlytics from '@react-native-firebase/crashlytics';
import * as Sentry from '@sentry/react-native';
import Config from '@/config/environment';
import AnalyticsService from '@/services/analytics/AnalyticsService';

export interface ErrorContext {
  userId?: string;
  screen?: string;
  action?: string;
  extra?: Record<string, any>;
}

class ErrorReportingService {
  private static instance: ErrorReportingService;

  public static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Initialize Sentry
      if (Config.SENTRY_DSN) {
        Sentry.init({
          dsn: Config.SENTRY_DSN,
          debug: __DEV__,
          environment: process.env.NODE_ENV || 'development',
          beforeSend(event, hint) {
            // Filter out development errors in production
            if (!__DEV__ && event.environment === 'development') {
              return null;
            }
            return event;
          },
        });
        console.log('Sentry initialized');
      }

      // Configure Crashlytics
      await crashlytics().setCrashlyticsCollectionEnabled(!__DEV__);
      console.log('Crashlytics initialized');

    } catch (error) {
      console.error('Failed to initialize error reporting:', error);
    }
  }

  reportError(error: Error, context?: ErrorContext): void {
    try {
      // Log to console in development
      if (__DEV__) {
        console.error('Error reported:', error, context);
      }

      // Report to Crashlytics
      if (context?.userId) {
        crashlytics().setUserId(context.userId);
      }
      
      if (context?.screen) {
        crashlytics().setAttribute('screen', context.screen);
      }
      
      if (context?.action) {
        crashlytics().setAttribute('action', context.action);
      }
      
      if (context?.extra) {
        Object.entries(context.extra).forEach(([key, value]) => {
          crashlytics().setAttribute(key, String(value));
        });
      }
      
      crashlytics().recordError(error);

      // Report to Sentry
      if (Config.SENTRY_DSN) {
        Sentry.withScope((scope) => {
          if (context?.userId) {
            scope.setUser({ id: context.userId });
          }
          
          if (context?.screen) {
            scope.setTag('screen', context.screen);
          }
          
          if (context?.action) {
            scope.setTag('action', context.action);
          }
          
          if (context?.extra) {
            scope.setContext('extra', context.extra);
          }
          
          Sentry.captureException(error);
        });
      }

      // Report to Analytics
      AnalyticsService.trackError(error, context);

    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  reportMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext): void {
    try {
      // Log to Crashlytics
      crashlytics().log(message);

      // Log to Sentry
      if (Config.SENTRY_DSN) {
        Sentry.withScope((scope) => {
          if (context?.userId) {
            scope.setUser({ id: context.userId });
          }
          
          if (context?.extra) {
            scope.setContext('extra', context.extra);
          }
          
          Sentry.captureMessage(message, level);
        });
      }

    } catch (error) {
      console.error('Failed to report message:', error);
    }
  }

  setUserContext(userId: string, email?: string, username?: string): void {
    try {
      // Set user in Crashlytics
      crashlytics().setUserId(userId);
      if (email) {
        crashlytics().setAttribute('email', email);
      }
      if (username) {
        crashlytics().setAttribute('username', username);
      }

      // Set user in Sentry
      if (Config.SENTRY_DSN) {
        Sentry.setUser({
          id: userId,
          email,
          username,
        });
      }

    } catch (error) {
      console.error('Failed to set user context:', error);
    }
  }

  addBreadcrumb(message: string, category?: string, data?: Record<string, any>): void {
    try {
      // Add to Sentry
      if (Config.SENTRY_DSN) {
        Sentry.addBreadcrumb({
          message,
          category,
          data,
          timestamp: Date.now() / 1000,
        });
      }

    } catch (error) {
      console.error('Failed to add breadcrumb:', error);
    }
  }

  // Global error handlers
  setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    const originalHandler = global.Promise.prototype.catch;
    global.Promise.prototype.catch = function(onRejected) {
      return originalHandler.call(this, (error) => {
        ErrorReportingService.getInstance().reportError(
          error instanceof Error ? error : new Error(String(error)),
          { action: 'unhandled_promise_rejection' }
        );
        
        if (onRejected) {
          return onRejected(error);
        }
        throw error;
      });
    };

    // Handle React Native errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const error = args[0];
      if (error instanceof Error) {
        this.reportError(error, { action: 'console_error' });
      }
      originalConsoleError(...args);
    };
  }
}

export default ErrorReportingService.getInstance();
```

Bu Faz 7'nin tamamlanmasıyla uygulama tamamen production-ready hale gelir ve App Store ile Google Play Store'da yayınlanmaya hazır olur. Monitoring, analytics ve error tracking sistemleri sayesinde uygulamanın performansı sürekli izlenebilir ve kullanıcı deneyimi optimize edilebilir.
