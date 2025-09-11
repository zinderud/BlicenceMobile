# BlicenceMobile

Bu proje, Blicence blockchain tabanlı plan yönetim sisteminin Flutter/Dart mobil uygulamasıdır. 

## Proje Yapısı

Bu proje Clean Architecture prensiplerine uygun olarak Flutter ile geliştirilmiştir.

### Dizin Yapısı

```
lib/
├── app/                    # Uygulama konfigürasyonu
├── core/                   # Temel sınıflar ve yardımcılar
├── data/                   # Veri katmanı (repositories, datasources)
├── domain/                 # Domain katmanı (entities, usecases, repositories)
└── presentation/           # Sunum katmanı (pages, widgets, blocs)
```

## Özellikler

### 🔗 Blockchain Entegrasyonu
- Smart contract entegrasyonu (Producer, Factory, StreamLockManager)
- Web3 wallet bağlantısı (MetaMask, WalletConnect)
- Blockchain transaction yönetimi

### 📊 Plan Yönetimi
- **API Plans**: Stream tabanlı abonelik planları
- **N-Usage Plans**: Kullanım kotası ile limit tabanlı planlar
- **Vesting API Plans**: Cliff period ve stream destekli gelecek hizmet planları

### 💸 Stream Destekli Ödemeler
- Real-time ödeme akışı (streaming payments)
- Otomatik ödeme dağıtımı
- Stream progress tracking
- Claim mekanizması

### 👤 Kullanıcı Rolleri
- **Customer**: Plan satın alma ve yönetimi
- **Producer**: Plan oluşturma ve satışı
- **Admin**: Sistem yönetimi

## Kurulum

### Gereksinimler

- Flutter SDK (3.0+)
- Dart SDK (3.0+)
- Android Studio / VS Code
- Android device/emulator veya iOS simulator

### Adımlar

1. **Repository'yi klonlayın:**
```bash
git clone <repository-url>
cd BlicenceMobile
```

2. **Dependencies yükleyin:**
```bash
flutter pub get
```

3. **Platformlara göre build:**

#### Android
```bash
flutter run android
```

#### iOS
```bash
cd ios && pod install && cd ..
flutter run ios
```

## Mimari

### Clean Architecture Katmanları

#### 1. Domain Layer (`lib/domain/`)
- **Entities**: CustomerPlan, Plan, PlanInfo vb.
- **Repositories**: Abstract repository interfaces
- **Use Cases**: Business logic implementation

#### 2. Data Layer (`lib/data/`)
- **Repositories**: Repository implementations
- **Data Sources**: Local/Remote data sources
- **Models**: DTO sınıfları

#### 3. Presentation Layer (`lib/presentation/`)
- **Pages**: Ekran widget'ları
- **Widgets**: Tekrar kullanılabilir UI component'ları
- **BLoC**: State management (Business Logic Components)

## Smart Contract Entegrasyonu

### Desteklenen Contract'lar

1. **Producer Contract**
   - Plan oluşturma (`addCustomerPlanWithStream`)
   - Stream destekli plan satın alma
   - Kullanım validasyonu (`validateUsageWithStream`)

2. **Factory Contract**
   - Producer clone'ları yönetimi
   - Deployment operations

3. **StreamLockManager Contract**
   - Stream lock yönetimi
   - Ödeme akışı kontrolü
   - Claim işlemleri

### Plan Türleri

#### API Plans
```dart
CustomerPlan(
  planType: PlanType.api,
  hasActiveStream: true,
  streamLockId: 12345,
  streamStartDate: DateTime.now(),
  streamEndDate: DateTime.now().add(Duration(days: 30)),
  // ...
)
```

#### N-Usage Plans
```dart
CustomerPlan(
  planType: PlanType.nUsage,
  remainingQuota: 10,
  hasActiveStream: true, // Optional stream support
  // ...
)
```

#### Vesting API Plans
```dart
CustomerPlan(
  planType: PlanType.vestingApi,
  hasActiveStream: true,
  streamStartDate: DateTime.now().add(Duration(days: 30)), // Cliff period
  // ...
)
```

## State Management

Bu projede **BLoC (Business Logic Component)** pattern kullanılmaktadır:

### Ana BLoC'lar

1. **AuthBloc**: Kullanıcı kimlik doğrulama
2. **PlanBloc**: Plan yönetimi ve CRUD işlemleri
3. **WalletBloc**: Wallet bağlantısı ve blockchain işlemleri

### BLoC Usage Örneği

```dart
// Event
context.read<PlanBloc>().add(LoadCustomerPlans(customerAddress));

// State Listening
BlocBuilder<PlanBloc, PlanState>(
  builder: (context, state) {
    if (state is CustomerPlansLoaded) {
      return ListView.builder(
        itemCount: state.customerPlans.length,
        itemBuilder: (context, index) {
          return CustomerPlanCard(
            customerPlan: state.customerPlans[index],
          );
        },
      );
    }
    return CircularProgressIndicator();
  },
)
```

## UI Components

### CustomerPlanCard Widget

Stream destekli customer planlarını görüntülemek için özel widget:

```dart
CustomerPlanCard(
  customerPlan: customerPlan,
  onTap: () => _showPlanDetails(customerPlan),
)
```

**Özellikler:**
- Plan bilgileri gösterimi
- Stream progress bar
- Real-time stream status
- Claim button (stream progress > 10%)
- Plan detayları dialog

### Plan Types Support

- ✅ API (Stream-based subscription)
- ✅ N-Usage (Quota + Optional stream)
- ✅ Vesting API (Cliff + Stream)

## Testing

### Unit Tests
```bash
flutter test
```

### Integration Tests
```bash
flutter drive --target=test_driver/app.dart
```

## Deployment

### Android APK
```bash
flutter build apk --release
```

### iOS IPA
```bash
flutter build ios --release
```

## Katkıda Bulunma

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

Bu proje [MIT License](LICENSE) altında lisanslanmıştır.

## Contact

Proje ile ilgili sorularınız için issue açabilir veya iletişime geçebilirsiniz.

---

## React Native Migration Backup

Bu proje Flutter'a migrate edilmiştir. React Native backup dosyaları `archive/react-native-backup-20250903/` dizininde bulunmaktadır.

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
