import 'package:flutter/material.dart';
import 'core/services/firebase/firebase_service.dart';

class SimpleTestPage extends StatefulWidget {
  const SimpleTestPage({super.key});

  @override
  State<SimpleTestPage> createState() => _SimpleTestPageState();
}

class _SimpleTestPageState extends State<SimpleTestPage> {
  int _counter = 0;
  final FirebaseService _firebaseService = FirebaseService();

  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }

  void _testFirebaseAnalytics() async {
    try {
      await _firebaseService.logEvent(
        name: 'test_button_clicked',
        parameters: {
          'button_type': 'analytics_test',
          'timestamp': DateTime.now().toIso8601String(),
          'platform': 'web', // Web platformunda test ediyoruz
        },
      );

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('✅ Firebase Analytics event gönderildi!'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('❌ Analytics hatası: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _testFirebaseCrashlytics() async {
    try {
      if (_firebaseService.isCrashlyticsSupported) {
        await _firebaseService.recordError(
          Exception('Test error from Flutter app'),
          StackTrace.current,
          reason: 'Manual test error',
        );

        await _firebaseService.logMessage('Test log message from Flutter app');

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Firebase Crashlytics test tamamlandı!'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('⚠️ Crashlytics bu platformda desteklenmiyor (Web)'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('❌ Crashlytics hatası: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _testLocalNotification() async {
    try {
      if (_firebaseService.isMessagingSupported) {
        await _firebaseService.notificationService.showNotification(
          title: 'Test Bildirimi',
          body: 'Bu bir test bildirimidir! 🔔',
          payload: 'test_payload',
        );

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Local notification gönderildi!'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('⚠️ Notifications bu platformda desteklenmiyor (Web)'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('❌ Notification hatası: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _testFirestore() async {
    try {
      // Test verisi yaz
      await _firebaseService.setDocument(
        'test_collection',
        'test_doc_${DateTime.now().millisecondsSinceEpoch}',
        {
          'message': 'Hello from Flutter Web!',
          'timestamp': DateTime.now().toIso8601String(),
          'platform': 'web',
          'test_counter': _counter,
        },
      );

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('✅ Firestore test verileri yazıldı!'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('❌ Firestore hatası: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Blicence Mobile - Flutter Test'),
        backgroundColor: Theme.of(context).primaryColor,
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                '🎉 Flutter Geçişi Başarılı!',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Blicence Mobile uygulaması artık Flutter ile çalışıyor',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 20),
              Text(
                'Butona tıklandı: $_counter kez',
                style: const TextStyle(fontSize: 18),
              ),
              const SizedBox(height: 40),

              // Firebase Test Butonları
              const Text(
                '🔥 Firebase Testleri',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 20),

              ElevatedButton(
                onPressed: _testFirebaseAnalytics,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue,
                  minimumSize: const Size(200, 50),
                ),
                child: const Text('📊 Analytics Test'),
              ),
              const SizedBox(height: 10),

              ElevatedButton(
                onPressed: _testFirebaseCrashlytics,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.orange,
                  minimumSize: const Size(200, 50),
                ),
                child: const Text('🐛 Crashlytics Test'),
              ),
              const SizedBox(height: 10),

              ElevatedButton(
                onPressed: _testLocalNotification,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.purple,
                  minimumSize: const Size(200, 50),
                ),
                child: const Text('🔔 Notification Test'),
              ),
              const SizedBox(height: 10),

              ElevatedButton(
                onPressed: _testFirestore,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.teal,
                  minimumSize: const Size(200, 50),
                ),
                child: const Text('🔥 Firestore Test'),
              ),
              const SizedBox(height: 30),

              // Eski Test Butonları
              ElevatedButton(
                onPressed: _incrementCounter,
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(200, 50),
                ),
                child: const Text('Test Et'),
              ),
              const SizedBox(height: 10),

              ElevatedButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Flutter entegrasyonu başarılı! 🎉'),
                      backgroundColor: Colors.green,
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(200, 50),
                ),
                child: const Text('Snackbar Test'),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: const Icon(Icons.add),
      ),
    );
  }
}
