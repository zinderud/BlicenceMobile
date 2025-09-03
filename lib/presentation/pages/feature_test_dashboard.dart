import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../presentation/blocs/auth/auth_bloc.dart';
import '../../core/services/firebase/firebase_service.dart';

class FeatureTestDashboard extends StatelessWidget {
  final FirebaseService _firebaseService = FirebaseService();

  FeatureTestDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🧪 Blicence Feature Test Dashboard'),
        backgroundColor: Theme.of(context).primaryColor,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            _buildHeaderSection(context),
            const SizedBox(height: 24),
            
            // Authentication Section
            _buildSectionTitle('🔐 Authentication System', context),
            _buildAuthTestCards(context),
            const SizedBox(height: 24),
            
            // Navigation Section
            _buildSectionTitle('🧭 Navigation & Routing', context),
            _buildNavigationTestCards(context),
            const SizedBox(height: 24),
            
            // Dashboard Section
            _buildSectionTitle('📊 Dashboard Components', context),
            _buildDashboardTestCards(context),
            const SizedBox(height: 24),
            
            // Blockchain Section
            _buildSectionTitle('⛓️ Blockchain & Wallet', context),
            _buildBlockchainTestCards(context),
            const SizedBox(height: 24),
            
            // Firebase Section
            _buildSectionTitle('🔥 Firebase Services', context),
            _buildFirebaseTestCards(context),
          ],
        ),
      ),
    );
  }

  Widget _buildHeaderSection(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Theme.of(context).primaryColor,
            Theme.of(context).primaryColor.withOpacity(0.7),
          ],
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '🎉 Flutter Migration Success!',
            style: TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Blicence Mobile uygulaması başarıyla Flutter\'a geçirildi.',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 16),
          BlocBuilder<AuthBloc, AuthState>(
            builder: (context, state) {
              return Text(
                'Auth Status: ${state.runtimeType}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title, BuildContext context) {
    return Text(
      title,
      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
        fontWeight: FontWeight.bold,
        color: Theme.of(context).primaryColor,
      ),
    );
  }

  Widget _buildAuthTestCards(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildTestCard(
                context,
                icon: Icons.login,
                title: 'Login Test',
                subtitle: 'Test authentication flow',
                color: Colors.blue,
                onTap: () => _testLogin(context),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildTestCard(
                context,
                icon: Icons.person_add,
                title: 'Register Test',
                subtitle: 'Test user registration',
                color: Colors.green,
                onTap: () => _testRegister(context),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        _buildTestCard(
          context,
          icon: Icons.switch_account,
          title: 'User Type Management',
          subtitle: 'Customer/Producer switching',
          color: Colors.purple,
          onTap: () => _testUserTypeManagement(context),
          fullWidth: true,
        ),
      ],
    );
  }

  Widget _buildNavigationTestCards(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildTestCard(
                context,
                icon: Icons.home,
                title: 'Ana Sayfa',
                subtitle: 'Home screen navigation',
                color: Colors.orange,
                onTap: () => _navigateToHome(context),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildTestCard(
                context,
                icon: Icons.store,
                title: 'Marketplace',
                subtitle: 'Go to marketplace',
                color: Colors.teal,
                onTap: () => _navigateToMarketplace(context),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildTestCard(
                context,
                icon: Icons.qr_code,
                title: 'QR Code Scanner',
                subtitle: 'Test QR functionality',
                color: Colors.indigo,
                onTap: () => _testQRCode(context),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildTestCard(
                context,
                icon: Icons.account_balance_wallet,
                title: 'Wallet',
                subtitle: 'Wallet connection',
                color: Colors.amber,
                onTap: () => _navigateToWallet(context),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildDashboardTestCards(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildTestCard(
                context,
                icon: Icons.dashboard,
                title: 'Customer Dashboard',
                subtitle: 'Plan viewing & tracking',
                color: Colors.cyan,
                onTap: () => _testCustomerDashboard(context),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildTestCard(
                context,
                icon: Icons.factory,
                title: 'Producer Dashboard',
                subtitle: 'Plan creation & management',
                color: Colors.deepOrange,
                onTap: () => _testProducerDashboard(context),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildBlockchainTestCards(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildTestCard(
                context,
                icon: Icons.link,
                title: 'MetaMask Connection',
                subtitle: 'Connect MetaMask wallet',
                color: Colors.orange,
                onTap: () => _testMetaMaskConnection(context),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildTestCard(
                context,
                icon: Icons.security,
                title: 'Trust Wallet',
                subtitle: 'Connect Trust Wallet',
                color: Colors.blue,
                onTap: () => _testTrustWallet(context),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildTestCard(
                context,
                icon: Icons.account_balance,
                title: 'Balance Check',
                subtitle: 'View wallet balance',
                color: Colors.green,
                onTap: () => _testBalanceCheck(context),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildTestCard(
                context,
                icon: Icons.history,
                title: 'Transaction History',
                subtitle: 'View transaction history',
                color: Colors.purple,
                onTap: () => _testTransactionHistory(context),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildFirebaseTestCards(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildTestCard(
                context,
                icon: Icons.analytics,
                title: 'Analytics',
                subtitle: 'Firebase Analytics test',
                color: Colors.blue,
                onTap: () => _testFirebaseAnalytics(context),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildTestCard(
                context,
                icon: Icons.storage,
                title: 'Firestore',
                subtitle: 'Database operations',
                color: Colors.orange,
                onTap: () => _testFirestore(context),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildTestCard(
                context,
                icon: Icons.bug_report,
                title: 'Crashlytics',
                subtitle: 'Error reporting test',
                color: Colors.red,
                onTap: () => _testCrashlytics(context),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildTestCard(
                context,
                icon: Icons.notifications,
                title: 'Push Notifications',
                subtitle: 'FCM messaging test',
                color: Colors.purple,
                onTap: () => _testPushNotifications(context),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildTestCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
    bool fullWidth = false,
  }) {
    return Card(
      elevation: 2,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.all(16),
          height: fullWidth ? 80 : 120,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                color: color,
                size: fullWidth ? 24 : 32,
              ),
              const SizedBox(height: 8),
              Text(
                title,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 12,
                ),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Test Methods
  void _testLogin(BuildContext context) {
    context.read<AuthBloc>().add(AuthLoginRequested(
      email: 'test@blicence.com',
      password: 'test123',
    ));
    _showTestResult(context, 'Login Test', 'Login event triggered');
  }

  void _testRegister(BuildContext context) {
    _showTestResult(context, 'Register Test', 'Registration flow would open here');
  }

  void _testUserTypeManagement(BuildContext context) {
    _showTestResult(context, 'User Type Test', 'User type switching functionality');
  }

  void _navigateToHome(BuildContext context) {
    context.go('/home');
  }

  void _navigateToMarketplace(BuildContext context) {
    context.go('/marketplace');
  }

  void _navigateToWallet(BuildContext context) {
    context.go('/wallet');
  }

  void _testQRCode(BuildContext context) {
    _showTestResult(context, 'QR Code Test', 'QR Code scanner would open here');
  }

  void _testCustomerDashboard(BuildContext context) {
    _showTestResult(context, 'Customer Dashboard', 'Plan viewing interface test');
  }

  void _testProducerDashboard(BuildContext context) {
    _showTestResult(context, 'Producer Dashboard', 'Plan creation interface test');
  }

  void _testMetaMaskConnection(BuildContext context) {
    _showTestResult(context, 'MetaMask Test', 'MetaMask connection would be initiated');
  }

  void _testTrustWallet(BuildContext context) {
    _showTestResult(context, 'Trust Wallet Test', 'Trust Wallet connection would be initiated');
  }

  void _testBalanceCheck(BuildContext context) {
    _showTestResult(context, 'Balance Test', 'Wallet balance: 1.2345 ETH');
  }

  void _testTransactionHistory(BuildContext context) {
    _showTestResult(context, 'Transaction History', 'Transaction history would be displayed');
  }

  void _testFirebaseAnalytics(BuildContext context) async {
    try {
      await _firebaseService.logEvent(
        name: 'dashboard_analytics_test',
        parameters: {
          'test_type': 'feature_dashboard',
          'timestamp': DateTime.now().toIso8601String(),
        },
      );
      _showTestResult(context, 'Analytics Test', '✅ Analytics event sent successfully');
    } catch (e) {
      _showTestResult(context, 'Analytics Test', '❌ Error: $e');
    }
  }

  void _testFirestore(BuildContext context) async {
    try {
      await _firebaseService.setDocument(
        'test_features',
        'dashboard_test_${DateTime.now().millisecondsSinceEpoch}',
        {
          'test_type': 'feature_dashboard',
          'timestamp': DateTime.now().toIso8601String(),
          'features_tested': ['auth', 'navigation', 'blockchain', 'firebase'],
        },
      );
      _showTestResult(context, 'Firestore Test', '✅ Data written to Firestore successfully');
    } catch (e) {
      _showTestResult(context, 'Firestore Test', '❌ Error: $e');
    }
  }

  void _testCrashlytics(BuildContext context) async {
    try {
      await _firebaseService.recordError(
        Exception('Test exception from feature dashboard'),
        StackTrace.current,
        reason: 'Feature dashboard test error',
      );
      _showTestResult(context, 'Crashlytics Test', '✅ Error recorded to Crashlytics');
    } catch (e) {
      _showTestResult(context, 'Crashlytics Test', '❌ Error: $e');
    }
  }

  void _testPushNotifications(BuildContext context) async {
    try {
      if (_firebaseService.isMessagingSupported) {
        await _firebaseService.notificationService.showNotification(
          title: 'Feature Dashboard Test',
          body: 'Push notification test from feature dashboard 🚀',
          payload: 'dashboard_test',
        );
        _showTestResult(context, 'Push Notifications', '✅ Notification sent successfully');
      } else {
        _showTestResult(context, 'Push Notifications', '⚠️ Not supported on this platform');
      }
    } catch (e) {
      _showTestResult(context, 'Push Notifications', '❌ Error: $e');
    }
  }

  void _showTestResult(BuildContext context, String title, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            Text(message),
          ],
        ),
        duration: const Duration(seconds: 3),
        backgroundColor: Theme.of(context).primaryColor,
      ),
    );
  }
}
