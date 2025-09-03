import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'firebase_service.dart';

/// Push notification servisi
class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  late final FlutterLocalNotificationsPlugin _localNotifications;

  factory NotificationService() {
    return _instance;
  }

  NotificationService._internal() {
    _localNotifications = FlutterLocalNotificationsPlugin();
  }

  /// Local notifications'ı başlat
  Future<void> initialize() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const settings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      settings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    print('✅ Local notifications initialized');
  }

  /// Local notification göster
  Future<void> showNotification({
    required String title,
    required String body,
    String? payload,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'blicence_channel',
      'Blicence Notifications',
      channelDescription: 'Blicence mobile app notifications',
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title,
      body,
      details,
      payload: payload,
    );
  }

  /// Bildirim tıklandığında
  void _onNotificationTapped(NotificationResponse response) {
    final payload = response.payload;
    if (payload != null) {
      print('🔔 Notification tapped with payload: $payload');
      // Burada navigasyon yapabilirsiniz
    }
  }

  /// Firebase mesajını local notification olarak göster
  Future<void> showFirebaseMessage(RemoteMessage message) async {
    await showNotification(
      title: message.notification?.title ?? 'Blicence',
      body: message.notification?.body ?? 'Yeni bildirim',
      payload: message.data.toString(),
    );
  }

  /// Tüm bildirimleri temizle
  Future<void> cancelAllNotifications() async {
    await _localNotifications.cancelAll();
  }

  /// Belirli bir bildirimi iptal et
  Future<void> cancelNotification(int id) async {
    await _localNotifications.cancel(id);
  }
}
