import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';
import '../../presentation/screens/auth/login_screen.dart';
import '../../presentation/screens/shared/home_screen.dart';
import '../../presentation/screens/customer/customer_dashboard_screen.dart';
import '../../presentation/screens/producer/producer_dashboard_screen.dart';
import '../../presentation/screens/marketplace/marketplace_screen.dart';
import '../../presentation/screens/wallet/wallet_connection_screen.dart';
import '../../presentation/pages/plans/plans_page.dart';
import '../../presentation/pages/feature_test_dashboard.dart';

class AppRouter {
  static const String login = '/login';
  static const String home = '/';
  static const String customerDashboard = '/customer';
  static const String producerDashboard = '/producer';
  static const String marketplace = '/marketplace';
  static const String wallet = '/wallet';
  static const String plans = '/plans';
  static const String testDashboard = '/test-dashboard';

  static final GoRouter router = GoRouter(
    initialLocation: testDashboard, // Start with test dashboard
    routes: [
      GoRoute(
        path: testDashboard,
        builder: (BuildContext context, GoRouterState state) => FeatureTestDashboard(),
      ),
      GoRoute(
        path: login,
        builder: (BuildContext context, GoRouterState state) => const LoginScreen(),
      ),
      GoRoute(
        path: home,
        builder: (BuildContext context, GoRouterState state) => const HomeScreen(),
      ),
      GoRoute(
        path: customerDashboard,
        builder: (BuildContext context, GoRouterState state) => const CustomerDashboardScreen(),
      ),
      GoRoute(
        path: producerDashboard,
        builder: (BuildContext context, GoRouterState state) => const ProducerDashboardScreen(),
      ),
      GoRoute(
        path: marketplace,
        builder: (BuildContext context, GoRouterState state) => const MarketplaceScreen(),
      ),
      GoRoute(
        path: wallet,
        builder: (BuildContext context, GoRouterState state) => const WalletConnectionScreen(),
      ),
      GoRoute(
        path: plans,
        builder: (BuildContext context, GoRouterState state) => const PlansPage(),
      ),
    ],
  );
}
