import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'app/router/app_router.dart';
import 'app/theme/app_theme.dart';
import 'core/storage/hive_service.dart';
import 'core/di/service_locator.dart';
import 'presentation/blocs/auth/auth_bloc.dart';
import 'presentation/blocs/plan/plan_bloc.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Hive for local storage
  await HiveService.init();
  
  // Initialize dependency injection
  await initializeDependencies();
  
  // Blockchain initialization - Bu değerleri gerçek deployment bilgileriniz ile değiştirin
  // await BlockchainService.initialize(
  //   factoryAddress: '0x742d35Cc6e898f9E93bD9Ba9dB1B5b0fa6ef3c',
  //   rpcUrl: 'https://polygon-rpc.com',
  //   privateKey: 'YOUR_PRIVATE_KEY', // Test environment için
  // );
  
  runApp(BlicenceMobileApp());
}

class BlicenceMobileApp extends StatelessWidget {
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
        routerConfig: _router,
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}
