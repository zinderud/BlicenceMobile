import 'package:flutter/foundation.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../firebase_options.dart';
import 'notification_service.dart';

class FirebaseService {
  static final FirebaseService _instance = FirebaseService._internal();
  late final FirebaseMessaging? _messaging;
  late final FirebaseAnalytics _analytics;
  late final FirebaseCrashlytics? _crashlytics;
  late final FirebaseFirestore _firestore;
  late final NotificationService _notificationService;

  factory FirebaseService() {
    return _instance;
  }

  FirebaseService._internal();

  /// Firebase servislerini başlat
  Future<void> initialize() async {
    try {
      // Firebase Core'u başlat - platform-specific options ile
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );

      // Servis referanslarını al
      _analytics = FirebaseAnalytics.instance;
      _firestore = FirebaseFirestore.instance;
      _notificationService = NotificationService();

      // Platform-specific servisler
      if (!kIsWeb) {
        _messaging = FirebaseMessaging.instance;
        _crashlytics = FirebaseCrashlytics.instance;
      } else {
        _messaging = null;
        _crashlytics = null;
        print('⚠️ FCM Messaging ve Crashlytics web platformunda sınırlı desteklenir');
      }

      // Notification servisini başlat (sadece mobile için)
      if (!kIsWeb) {
        await _notificationService.initialize();
      }

      // Push notification izinlerini iste (sadece mobile için)
      if (!kIsWeb && _messaging != null) {
        await _requestNotificationPermissions();
        
        // FCM token'ı al
        try {
          final token = await _messaging!.getToken();
          print('🔥 FCM Token: $token');
        } catch (e) {
          print('⚠️ FCM Token alınamadı: $e');
        }

        // Background mesaj handler'ı ayarla
        FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

        // Foreground mesaj handler'ı ayarla
        FirebaseMessaging.onMessage.listen(_onMessageReceived);
      }

      // Analytics'i etkinleştir (tüm platformlarda çalışır)
      await _analytics.setAnalyticsCollectionEnabled(true);

      // Crashlytics'i etkinleştir (sadece mobile için)
      if (!kIsWeb && _crashlytics != null) {
        try {
          await _crashlytics!.setCrashlyticsCollectionEnabled(true);
        } catch (e) {
          print('⚠️ Crashlytics ayarlanamadı: $e');
        }
      }

      print('✅ Firebase services initialized successfully');
    } catch (e, stackTrace) {
      print('❌ Firebase initialization failed: $e');
      // Sadece mobile'da crashlytics'e kaydet
      if (!kIsWeb && _crashlytics != null) {
        try {
          await _crashlytics!.recordError(e, stackTrace);
        } catch (crashError) {
          print('⚠️ Crashlytics error recording failed: $crashError');
        }
      }
    }
  }

  /// Push notification izinlerini iste
  Future<void> _requestNotificationPermissions() async {
    if (kIsWeb || _messaging == null) return;
    
    try {
      final settings = await _messaging!.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );

      print('🔔 Notification permissions: ${settings.authorizationStatus}');
    } catch (e) {
      print('⚠️ Notification permission request failed: $e');
    }
  }

  /// Foreground mesaj geldiğinde
  void _onMessageReceived(RemoteMessage message) {
    if (kIsWeb) return;
    
    print('📨 Foreground message received: ${message.notification?.title}');

    // Local notification olarak göster
    _notificationService.showFirebaseMessage(message);

    // Analytics event'i gönder
    _analytics.logEvent(
      name: 'push_notification_received',
      parameters: {
        'title': message.notification?.title ?? '',
        'body': message.notification?.body ?? '',
      },
    );
  }

  /// Background mesaj handler
  static Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
    print('📨 Background message received: ${message.notification?.title}');
  }

  /// Analytics event'i gönder
  Future<void> logEvent({
    required String name,
    Map<String, Object>? parameters,
  }) async {
    try {
      await _analytics.logEvent(
        name: name,
        parameters: parameters,
      );
      print('✅ Analytics event logged: $name');
    } catch (e) {
      print('❌ Analytics event failed: $e');
    }
  }

  /// Analytics screen view'i gönder
  Future<void> logScreenView({
    required String screenName,
    String? screenClass,
  }) async {
    try {
      await _analytics.logScreenView(
        screenName: screenName,
        screenClass: screenClass,
      );
      print('✅ Screen view logged: $screenName');
    } catch (e) {
      print('❌ Screen view logging failed: $e');
    }
  }

  /// Crashlytics'e hata kaydet
  Future<void> recordError(
    dynamic exception,
    StackTrace? stackTrace, {
    String? reason,
  }) async {
    if (kIsWeb || _crashlytics == null) {
      print('⚠️ Crashlytics web platformunda desteklenmiyor: $exception');
      return;
    }
    
    try {
      await _crashlytics!.recordError(
        exception,
        stackTrace,
        reason: reason,
      );
      print('✅ Error recorded to Crashlytics');
    } catch (e) {
      print('❌ Crashlytics error recording failed: $e');
    }
  }

  /// Crashlytics'e log mesajı ekle
  Future<void> logMessage(String message) async {
    if (kIsWeb || _crashlytics == null) {
      print('⚠️ Crashlytics logging web platformunda desteklenmiyor: $message');
      return;
    }
    
    try {
      await _crashlytics!.log(message);
      print('✅ Message logged to Crashlytics: $message');
    } catch (e) {
      print('❌ Crashlytics logging failed: $e');
    }
  }

  /// Firestore'dan veri oku
  Future<DocumentSnapshot> getDocument(String collection, String documentId) async {
    try {
      return await _firestore.collection(collection).doc(documentId).get();
    } catch (e) {
      await recordError(e, StackTrace.current, reason: 'Firestore read failed');
      rethrow;
    }
  }

  /// Firestore'a veri yaz
  Future<void> setDocument(
    String collection,
    String documentId,
    Map<String, dynamic> data,
  ) async {
    try {
      await _firestore.collection(collection).doc(documentId).set(data);
      print('✅ Document written to Firestore: $collection/$documentId');
    } catch (e) {
      await recordError(e, StackTrace.current, reason: 'Firestore write failed');
      rethrow;
    }
  }

  /// FCM token'ı al
  Future<String?> getFCMToken() async {
    if (kIsWeb || _messaging == null) {
      print('⚠️ FCM Token web platformunda desteklenmiyor');
      return null;
    }
    
    try {
      return await _messaging!.getToken();
    } catch (e) {
      print('❌ Failed to get FCM token: $e');
      return null;
    }
  }

  /// Platform destekli mi kontrol et
  bool get isMessagingSupported => !kIsWeb && _messaging != null;
  bool get isCrashlyticsSupported => !kIsWeb && _crashlytics != null;
  bool get isAnalyticsSupported => true; // Her platformda desteklenir
  bool get isFirestoreSupported => true; // Her platformda desteklenir

  /// Notification service getter
  NotificationService get notificationService => _notificationService;
}
