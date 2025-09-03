import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../app/router/app_router.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Blicence Ana Sayfa'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => context.go(AppRouter.login),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Hoş Geldiniz!',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Blockchain tabanlı plan yönetim sistemi',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
            const SizedBox(height: 32),
            Expanded(
              child: GridView.count(
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                children: [
                  _buildFeatureCard(
                    context,
                    'Blockchain Planları',
                    'Smart kontrat planları',
                    Icons.account_balance_wallet,
                    () => context.go(AppRouter.plans),
                  ),
                  _buildFeatureCard(
                    context,
                    'Mock Veriler Test',
                    'Test için mock veriler',
                    Icons.bug_report,
                    () => context.go(AppRouter.test),
                  ),
                  _buildFeatureCard(
                    context,
                    'Müşteri Paneli',
                    'Planlarınızı yönetin',
                    Icons.person,
                    () => context.go(AppRouter.customerDashboard),
                  ),
                  _buildFeatureCard(
                    context,
                    'Üretici Paneli',
                    'Plan oluşturun',
                    Icons.business,
                    () => context.go(AppRouter.producerDashboard),
                  ),
                  _buildFeatureCard(
                    context,
                    'Marketplace',
                    'Planları keşfedin',
                    Icons.store,
                    () => context.go(AppRouter.marketplace),
                  ),
                  _buildFeatureCard(
                    context,
                    'Wallet',
                    'Cüzdan bağlayın',
                    Icons.wallet,
                    () => _showComingSoon(context),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureCard(
    BuildContext context,
    String title,
    String subtitle,
    IconData icon,
    VoidCallback onTap,
  ) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 48,
                color: Theme.of(context).colorScheme.primary,
              ),
              const SizedBox(height: 16),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                subtitle,
                style: const TextStyle(
                  fontSize: 12,
                  color: Colors.grey,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showComingSoon(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Bu özellik yakında gelecek!')),
    );
  }
}
