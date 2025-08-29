# 📱 BLIMOBIL Mobil Uygulama Yol Haritası

## 🎯 Proje Vizyonu
Kullanıcıların satın aldıkları blockchain tabanlı planları mobil cihazlarından kolayca yönetebilecekleri, kimlik doğrulama yapabilecekleri ve NFT/kullanım haklarını takip edebilecekleri kapsamlı bir mobil uygulama geliştirmek.

---

## 📋 Temel Gereksinimler Analizi

### 🔍 Mevcut Sistem Analizi
Blicontract ekosisteminde 3 ana plan türü bulunmaktadır:

1. **API Plan**: Saatlik/günlük/aylık akış ödemeli sürekli hizmetler
2. **Vesting Plan**: Gelecek tarihli başlangıçlı hizmetler  
3. **N-Usage Plan**: Kullanım bazlı pay-per-use hizmetler

### 👤 Kullanıcı İhtiyaçları
- ✅ Plan satın alma sonrası kimlik doğrulama
- ✅ NFT sahiplik kanıtı gösterme
- ✅ Kalan kullanım hakkı takibi
- ✅ QR kod ile offline kimlik doğrulama
- ✅ Planların durumu ve istatistikleri
- ✅ Gerçek zamanlı kullanım izleme

---

## 🏗️ Teknik Mimari

### 📱 Platform Seçimi
**Önerilen Platform: React Native**
- ✅ Cross-platform (iOS & Android)
- ✅ Mevcut web uygulaması TypeScript/Angular bilgisi transfer edilebilir
- ✅ Blockchain entegrasyonu için WalletConnect desteği
- ✅ NFT ve QR kod işlemleri için zengin kütüphane desteği

### 🔧 Teknik Stack
```
Frontend: React Native
State Management: Redux Toolkit
Blockchain: ethers.js, WalletConnect
QR Codes: react-native-qrcode-generator, react-native-qrcode-scanner
NFT: OpenSea SDK, Alchemy NFT API
Storage: AsyncStorage, Secure Storage
Navigation: React Navigation
UI Components: NativeBase / Tamagui
```

---

## 🗓️ Geliştirme Fazları

## **FAZA 1: Temel Altyapı (2-3 Hafta)**

### 1.1 Proje Kurulumu
```bash
# React Native projesi başlatma
npx react-native@latest init BlimobilApp --template react-native-template-typescript
cd BlimobilApp

# Temel bağımlılıklar
npm install @reduxjs/toolkit react-redux
npm install ethers react-native-walletconnect-v2
npm install @react-navigation/native @react-navigation/stack
npm install react-native-qrcode-generator react-native-qrcode-scanner
npm install react-native-async-storage react-native-keychain
```

### 1.2 Temel Dosya Yapısı
```
src/
├── components/
│   ├── common/
│   ├── wallet/
│   ├── qr/
│   └── plans/
├── screens/
│   ├── auth/
│   ├── dashboard/
│   ├── plans/
│   └── settings/
├── services/
│   ├── blockchain/
│   ├── storage/
│   └── api/
├── utils/
├── types/
└── navigation/
```

### 1.3 Wallet Entegrasyonu
```typescript
// src/services/blockchain/WalletService.ts
export class WalletService {
  async connectWallet(): Promise<string>;
  async getConnectedAddress(): Promise<string>;
  async getBalance(tokenAddress: string): Promise<string>;
  async signMessage(message: string): Promise<string>;
}
```

---

## **FAZA 2: Plan Yönetimi (3-4 Hafta)**

### 2.1 Plan Türü Component'leri

#### API Plan Component
```typescript
// src/components/plans/ApiPlanCard.tsx
interface ApiPlanCardProps {
  plan: ApiPlan;
  customerPlan: CustomerPlan;
  flowRate: string;
  nextPayment: Date;
  totalSpent: number;
}

export const ApiPlanCard: React.FC<ApiPlanCardProps> = ({
  plan, customerPlan, flowRate, nextPayment, totalSpent
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.planName}>{plan.name}</Text>
      <Text>Akış Hızı: {flowRate} DAI/ay</Text>
      <Text>Sonraki Ödeme: {nextPayment.toLocaleDateString()}</Text>
      <Text>Toplam Harcama: {totalSpent} DAI</Text>
      <Button title="Planı Durdur" onPress={handleStopPlan} />
    </View>
  );
};
```

#### N-Usage Plan Component
```typescript
// src/components/plans/NUsagePlanCard.tsx
interface NUsagePlanCardProps {
  plan: NUsagePlan;
  customerPlan: CustomerPlan;
  remainingUsage: number;
  usageHistory: UsageRecord[];
}

export const NUsagePlanCard: React.FC<NUsagePlanCardProps> = ({
  plan, customerPlan, remainingUsage, usageHistory
}) => {
  const usagePercentage = ((customerPlan.totalUsage - remainingUsage) / customerPlan.totalUsage) * 100;
  
  return (
    <View style={styles.card}>
      <Text style={styles.planName}>{plan.name}</Text>
      <Text>Kalan Kullanım: {remainingUsage}/{customerPlan.totalUsage}</Text>
      <ProgressBar progress={usagePercentage} />
      <Button title="Kullanım Geçmişi" onPress={showUsageHistory} />
      <Button title="QR Kod Oluştur" onPress={generateQRCode} />
    </View>
  );
};
```

#### Vesting Plan Component
```typescript
// src/components/plans/VestingPlanCard.tsx
interface VestingPlanCardProps {
  plan: VestingPlan;
  customerPlan: CustomerPlan;
  cliffDate: Date;
  isActive: boolean;
  vestedAmount: number;
}

export const VestingPlanCard: React.FC<VestingPlanCardProps> = ({
  plan, customerPlan, cliffDate, isActive, vestedAmount
}) => {
  const timeUntilCliff = cliffDate.getTime() - Date.now();
  
  return (
    <View style={styles.card}>
      <Text style={styles.planName}>{plan.name}</Text>
      {!isActive ? (
        <Text>Başlangıç: {cliffDate.toLocaleDateString()}</Text>
      ) : (
        <Text>Aktif Plan - Vested: {vestedAmount} DAI</Text>
      )}
      <CountdownTimer targetDate={cliffDate} />
      <Button title="Planı Aktifleştir" onPress={activatePlan} disabled={isActive} />
    </View>
  );
};
```

### 2.2 Plan Listesi ve Dashboard
```typescript
// src/screens/dashboard/DashboardScreen.tsx
export const DashboardScreen: React.FC = () => {
  const [userPlans, setUserPlans] = useState<CustomerPlan[]>([]);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [activeSubscriptions, setActiveSubscriptions] = useState<number>(0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statsContainer}>
        <StatCard title="Toplam Değer" value={`${totalValue} DAI`} />
        <StatCard title="Aktif Planlar" value={activeSubscriptions.toString()} />
      </View>
      
      <FlatList
        data={userPlans}
        keyExtractor={(item) => item.custumerPlanId.toString()}
        renderItem={({ item }) => (
          <PlanCard plan={item} />
        )}
      />
    </ScrollView>
  );
};
```

---

## **FAZA 3: NFT ve Kimlik Doğrulama (2-3 Hafta)**

### 3.1 NFT Görüntüleme
```typescript
// src/components/nft/NFTViewer.tsx
interface NFTViewerProps {
  customerPlanId: number;
  onNFTLoaded: (nft: NFTMetadata) => void;
}

export const NFTViewer: React.FC<NFTViewerProps> = ({ customerPlanId, onNFTLoaded }) => {
  const [nftData, setNFTData] = useState<NFTMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNFTData();
  }, [customerPlanId]);

  const loadNFTData = async () => {
    try {
      // Alchemy NFT API kullanarak NFT metadata'sını al
      const nft = await AlchemyService.getNFT(contractAddress, customerPlanId);
      setNFTData(nft);
      onNFTLoaded(nft);
    } catch (error) {
      console.error('NFT loading error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <View>
          <Image source={{ uri: nftData?.image }} style={styles.nftImage} />
          <Text style={styles.title}>{nftData?.name}</Text>
          <Text style={styles.description}>{nftData?.description}</Text>
        </View>
      )}
    </View>
  );
};
```

### 3.2 QR Kod Sistemi
```typescript
// src/services/qr/QRCodeService.ts
export class QRCodeService {
  static generatePlanUsageQR(customerPlanId: number, signature: string): string {
    const qrData = {
      type: 'PLAN_USAGE',
      customerPlanId,
      signature,
      timestamp: Date.now(),
      expiresAt: Date.now() + (15 * 60 * 1000) // 15 dakika geçerli
    };
    
    return JSON.stringify(qrData);
  }

  static async verifyQRSignature(qrData: string, walletAddress: string): Promise<boolean> {
    try {
      const data = JSON.parse(qrData);
      const message = `Plan kullanımı: ${data.customerPlanId} - ${data.timestamp}`;
      const recoveredAddress = ethers.utils.verifyMessage(message, data.signature);
      return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
    } catch (error) {
      return false;
    }
  }
}
```

### 3.3 Offline Kimlik Doğrulama
```typescript
// src/components/qr/QRCodeGenerator.tsx
export const QRCodeGenerator: React.FC<{ customerPlan: CustomerPlan }> = ({ customerPlan }) => {
  const [qrValue, setQRValue] = useState<string>('');
  const [signature, setSignature] = useState<string>('');

  const generateQRCode = async () => {
    try {
      const message = `Plan kullanımı: ${customerPlan.custumerPlanId} - ${Date.now()}`;
      const sig = await WalletService.signMessage(message);
      const qrData = QRCodeService.generatePlanUsageQR(customerPlan.custumerPlanId, sig);
      
      setSignature(sig);
      setQRValue(qrData);
    } catch (error) {
      Alert.alert('Hata', 'QR kod oluşturulamadı');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="QR Kod Oluştur" onPress={generateQRCode} />
      {qrValue && (
        <QRCode
          value={qrValue}
          size={200}
          backgroundColor="white"
          color="black"
        />
      )}
      <Text style={styles.note}>
        Bu QR kod 15 dakika geçerlidir ve offline kullanım için imzalanmıştır.
      </Text>
    </View>
  );
};
```

---

## **FAZA 4: Gerçek Zamanlı İzleme (2-3 Hafta)**

### 4.1 WebSocket Bağlantısı
```typescript
// src/services/realtime/RealtimeService.ts
export class RealtimeService {
  private ws: WebSocket | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;

  connect(walletAddress: string) {
    this.ws = new WebSocket(`wss://api.blicence.com/ws/${walletAddress}`);
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleRealtimeUpdate(data);
    };

    this.ws.onclose = () => {
      this.scheduleReconnect();
    };
  }

  private handleRealtimeUpdate(data: any) {
    switch (data.type) {
      case 'PLAN_USAGE_UPDATED':
        store.dispatch(updatePlanUsage(data.payload));
        break;
      case 'PAYMENT_RECEIVED':
        store.dispatch(addPaymentRecord(data.payload));
        break;
      case 'PLAN_EXPIRED':
        store.dispatch(markPlanExpired(data.payload));
        break;
    }
  }
}
```

### 4.2 Push Notification
```typescript
// src/services/notification/NotificationService.ts
export class NotificationService {
  static async schedulePlanExpiryNotification(customerPlan: CustomerPlan) {
    if (customerPlan.planType === 'N_USAGE' && customerPlan.remainingQuota <= 5) {
      PushNotification.localNotification({
        title: 'Kullanım Hakkı Az Kaldı',
        message: `${customerPlan.planName} planınızda ${customerPlan.remainingQuota} kullanım hakkı kaldı.`,
        date: new Date(Date.now() + 60 * 1000), // 1 dakika sonra
      });
    }
  }

  static async schedulePaymentReminder(customerPlan: CustomerPlan) {
    if (customerPlan.planType === 'API') {
      const nextPayment = calculateNextPayment(customerPlan);
      PushNotification.localNotification({
        title: 'Yaklaşan Ödeme',
        message: `${customerPlan.planName} planı için yarın ödeme yapılacak.`,
        date: new Date(nextPayment.getTime() - 24 * 60 * 60 * 1000), // 1 gün önceden
      });
    }
  }
}
```

---

## **FAZA 5: UI/UX ve Test (2 Hafta)**

### 5.1 Tema ve Tasarım Sistemi
```typescript
// src/theme/colors.ts
export const colors = {
  primary: '#3B82F6',     // Mavi
  secondary: '#10B981',   // Yeşil  
  warning: '#F59E0B',     // Turuncu
  danger: '#EF4444',      // Kırmızı
  success: '#059669',     // Koyu yeşil
  
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280'
};

// src/theme/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};
```

### 5.2 Component Library
```typescript
// src/components/common/Button.tsx
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  title, onPress, variant, disabled, loading 
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, styles[variant], disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
```

---

## **FAZA 6: Deployment ve Dağıtım (1-2 Hafta)**

### 6.1 Build Konfigürasyonu
```javascript
// android/app/build.gradle
android {
    compileSdkVersion 34
    buildToolsVersion "34.0.0"
    
    defaultConfig {
        applicationId "com.blicence.mobile"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
    
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 6.2 Store Metadata
```
App Store / Google Play Store:
- Uygulama Adı: Blimobil - Blockchain Plans
- Açıklama: Blockchain tabanlı abonelik planlarınızı yönetin
- Kategori: Finance / Utilities
- Anahtar Kelimeler: blockchain, subscription, NFT, payment, plans
- Screenshots: 6+ adet farklı ekran görüntüsü
```

---

## 🔧 Entegrasyon Detayları

### Mevcut Blicontract ile Entegrasyon
```typescript
// src/services/blockchain/ContractService.ts
export class ContractService {
  // Mevcut Blicontract ABI'larını kullan
  private factoryContract: Contract;
  private producerStorageContract: Contract;
  
  async getCustomerPlans(walletAddress: string): Promise<CustomerPlan[]> {
    // ProducerStorageContract.getCustomerPlans() çağrısı
  }
  
  async getPlanDetails(planId: number): Promise<Plan> {
    // ProducerStorageContract.getPlan() çağrısı
  }
  
  async useNUsagePlan(customerPlanId: number): Promise<TransactionResult> {
    // Producer clone contract üzerinden kullanım işlemi
  }
}
```

### Blicence Web App ile Senkronizasyon
```typescript
// src/services/sync/SyncService.ts
export class SyncService {
  static async syncWithWebApp(walletAddress: string) {
    try {
      // Web app API'si ile senkronizasyon
      const response = await fetch(`https://app.blicence.com/api/sync/${walletAddress}`);
      const data = await response.json();
      
      // Local storage güncelleme
      await AsyncStorage.setItem(`user_${walletAddress}`, JSON.stringify(data));
      
      return data;
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }
}
```

---

## 📊 Başarı Metrikleri

### Teknik Metrikler
- ✅ App başlatma süresi < 3 saniye
- ✅ Blockchain işlem onayı süresi görünürlüğü  
- ✅ Offline QR kod oluşturma %100 başarı oranı
- ✅ Push notification teslimat oranı > %95
- ✅ Crash-free session oranı > %99.5

### Kullanıcı Deneyimi Metrikleri  
- ✅ Plan detaylarına erişim < 2 dokunuş
- ✅ QR kod oluşturma < 5 saniye
- ✅ Wallet bağlantısı < 10 saniye
- ✅ Kullanım geçmişi yükleme < 3 saniye

---

## 🚀 Gelecek Özellikler (V2.0)

### Gelişmiş Özellikler
1. **Biometric Authentication**: Face ID / Touch ID entegrasyonu
2. **Multi-Chain Support**: Polygon, BSC, Arbitrum desteği  
3. **DeFi Integration**: Yield farming, staking özellikleri
4. **Social Features**: Plan paylaşımı, referans sistemi
5. **Analytics Dashboard**: Detaylı kullanım analitiği
6. **Widget Support**: iOS/Android widget'ları

### İş Geliştirme
1. **Producer Mobile**: Üreticiler için ayrı mobil uygulama
2. **White Label**: Üreticilerin kendi markalı uygulamaları
3. **Enterprise Features**: Kurumsal kullanıcı yönetimi
4. **API Gateway**: Üçüncü parti entegrasyonlar

---

## 📁 Proje Dosya Yapısı

```
blimobil/
├── README.md
├── package.json
├── tsconfig.json
├── metro.config.js
├── babel.config.js
├── ios/
├── android/
└── src/
    ├── components/
    │   ├── common/
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── Input.tsx
    │   │   └── Modal.tsx
    │   ├── plans/
    │   │   ├── ApiPlanCard.tsx
    │   │   ├── NUsagePlanCard.tsx
    │   │   ├── VestingPlanCard.tsx
    │   │   └── PlanList.tsx
    │   ├── nft/
    │   │   ├── NFTViewer.tsx
    │   │   └── NFTGallery.tsx
    │   ├── qr/
    │   │   ├── QRCodeGenerator.tsx
    │   │   ├── QRCodeScanner.tsx
    │   │   └── QRVerifier.tsx
    │   └── wallet/
    │       ├── WalletConnector.tsx
    │       ├── WalletInfo.tsx
    │       └── TokenBalance.tsx
    ├── screens/
    │   ├── auth/
    │   │   ├── WelcomeScreen.tsx
    │   │   ├── WalletConnectScreen.tsx
    │   │   └── AuthLoadingScreen.tsx
    │   ├── dashboard/
    │   │   ├── DashboardScreen.tsx
    │   │   ├── StatsScreen.tsx
    │   │   └── NotificationScreen.tsx
    │   ├── plans/
    │   │   ├── PlanListScreen.tsx
    │   │   ├── PlanDetailScreen.tsx
    │   │   ├── UsageHistoryScreen.tsx
    │   │   └── QRCodeScreen.tsx
    │   └── settings/
    │       ├── SettingsScreen.tsx
    │       ├── WalletSettingsScreen.tsx
    │       └── NotificationSettingsScreen.tsx
    ├── services/
    │   ├── blockchain/
    │   │   ├── WalletService.ts
    │   │   ├── ContractService.ts
    │   │   └── TransactionService.ts
    │   ├── api/
    │   │   ├── BlicenceAPI.ts
    │   │   ├── AlchemyService.ts
    │   │   └── SyncService.ts
    │   ├── storage/
    │   │   ├── AsyncStorageService.ts
    │   │   ├── SecureStorageService.ts
    │   │   └── CacheService.ts
    │   ├── qr/
    │   │   ├── QRCodeService.ts
    │   │   └── SignatureService.ts
    │   ├── notification/
    │   │   ├── PushNotificationService.ts
    │   │   └── LocalNotificationService.ts
    │   └── realtime/
    │       ├── WebSocketService.ts
    │       └── RealtimeService.ts
    ├── store/
    │   ├── index.ts
    │   ├── slices/
    │   │   ├── authSlice.ts
    │   │   ├── plansSlice.ts
    │   │   ├── walletSlice.ts
    │   │   └── settingsSlice.ts
    │   └── middleware/
    │       ├── persistenceMiddleware.ts
    │       └── loggingMiddleware.ts
    ├── navigation/
    │   ├── AppNavigator.tsx
    │   ├── AuthNavigator.tsx
    │   ├── TabNavigator.tsx
    │   └── StackNavigator.tsx
    ├── utils/
    │   ├── constants.ts
    │   ├── helpers.ts
    │   ├── formatters.ts
    │   └── validators.ts
    ├── types/
    │   ├── plans.ts
    │   ├── wallet.ts
    │   ├── nft.ts
    │   └── api.ts
    ├── theme/
    │   ├── colors.ts
    │   ├── spacing.ts
    │   ├── typography.ts
    │   └── index.ts
    └── assets/
        ├── images/
        ├── icons/
        └── fonts/
```

---

## 🎯 Sonuç

Bu yol haritası, Blimobil mobil uygulamasının kapsamlı bir şekilde geliştirilmesi için detaylı bir plan sunmaktadır. Uygulama, kullanıcıların blockchain tabanlı planlarını mobil cihazlarından kolayca yönetmelerini, NFT sahipliklerini kanıtlamalarını ve offline kimlik doğrulama yapmalarını sağlayacaktır.

**Tahmini Geliştirme Süresi**: 12-16 hafta
**Gerekli Ekip**: 2-3 React Native Developer, 1 UI/UX Designer, 1 Blockchain Developer
**Bütçe Tahmini**: Orta seviye proje için uygun

Bu roadmap, mevcut Blicontract ve Blicence ekosistemi ile tam uyumlu bir mobil uygulama geliştirilmesini hedeflemektedir.
