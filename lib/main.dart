import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'presentation/pages/feature_test_dashboard.dart';
import 'app/router/app_router.dart';
import 'app/theme/app_theme.dart';
import 'core/storage/hive_service.dart';
import 'core/di/service_locator.dart';
import 'core/services/firebase/firebase_service.dart';
import 'presentation/blocs/auth/auth_bloc.dart';
import 'presentation/blocs/plan/plan_bloc.dart';

// Firebase background message handler
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  print('📨 Background message received: ${message.notification?.title}');
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Hive for local storage
  await HiveService.init();

  // Initialize Firebase with platform-specific options
  await FirebaseService().initialize();

  // Initialize dependency injection
  await initializeDependencies();

  // Blockchain initialization - Bu değerleri gerçek deployment bilgileriniz ile değiştirin
  // await BlockchainService.initialize(
  //   factoryAddress: '0x742d35Cc6634C0532925a3b8D697C9bCbFD84aAe',
  //   rpcUrl: 'https://polygon-rpc.com',
  //   privateKey: 'YOUR_PRIVATE_KEY', // Test environment için
  // );

  runApp(BlicenceMobileApp());
}class BlicenceMobileApp extends StatelessWidget {
  BlicenceMobileApp({super.key});

  final GoRouter _router = AppRouter.router;

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<AuthBloc>(
          create: (context) => sl<AuthBloc>()..add(AuthCheckRequested()),
        ),
        BlocProvider<PlanBloc>(
          create: (context) => sl<PlanBloc>(),
        ),
      ],
      child: MaterialApp.router(
        title: 'Blicence Mobile',
        theme: AppTheme.lightTheme,
        routerConfig: _router, // Use router configuration
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}
