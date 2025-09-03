import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Default [FirebaseOptions] for use with your Firebase apps.
///
/// Example:
/// ```dart
/// import 'firebase_options.dart';
/// // ...
/// await Firebase.initializeApp(
///   options: DefaultFirebaseOptions.currentPlatform,
/// );
/// ```
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        return windows;
      case TargetPlatform.linux:
        return linux;
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyDemoKeyForTestingPurposesOnly',
    appId: '1:123456789:web:abcdef123456',
    messagingSenderId: '123456789',
    projectId: 'blicence-mobile-demo',
    authDomain: 'blicence-mobile-demo.firebaseapp.com',
    storageBucket: 'blicence-mobile-demo.appspot.com',
    measurementId: 'G-ABCDEFGHIJ',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyDemoKeyForTestingPurposesOnly',
    appId: '1:123456789:android:abcdef123456',
    messagingSenderId: '123456789',
    projectId: 'blicence-mobile-demo',
    storageBucket: 'blicence-mobile-demo.appspot.com',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyDemoKeyForTestingPurposesOnly',
    appId: '1:123456789:ios:abcdef123456',
    messagingSenderId: '123456789',
    projectId: 'blicence-mobile-demo',
    storageBucket: 'blicence-mobile-demo.appspot.com',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'your-macos-api-key',
    appId: 'your-macos-app-id',
    messagingSenderId: 'your-messaging-sender-id',
    projectId: 'your-project-id',
    storageBucket: 'your-project-id.appspot.com',
  );

  static const FirebaseOptions windows = FirebaseOptions(
    apiKey: 'your-windows-api-key',
    appId: 'your-windows-app-id',
    messagingSenderId: 'your-messaging-sender-id',
    projectId: 'your-project-id',
    storageBucket: 'your-project-id.appspot.com',
  );

  static const FirebaseOptions linux = FirebaseOptions(
    apiKey: 'your-linux-api-key',
    appId: 'your-linux-app-id',
    messagingSenderId: 'your-messaging-sender-id',
    projectId: 'your-project-id',
    storageBucket: 'your-project-id.appspot.com',
  );
}
