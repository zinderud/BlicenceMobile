import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../app/router/app_router.dart';
import '../../../domain/entities/customer_plan.dart';
import '../../blocs/plan_bloc.dart';
import '../../blocs/auth_bloc.dart';
import '../../widgets/customer_plan_card.dart';

class CustomerDashboardScreen extends StatefulWidget {
  const CustomerDashboardScreen({super.key});

  @override
  State<CustomerDashboardScreen> createState() => _CustomerDashboardScreenState();
}

class _CustomerDashboardScreenState extends State<CustomerDashboardScreen> {
  @override
  void initState() {
    super.initState();
    _loadCustomerPlans();
  }

  void _loadCustomerPlans() {
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthAuthenticated) {
      context.read<PlanBloc>().add(LoadCustomerPlans(authState.user.walletAddress ?? authState.user.id));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Müşteri Paneli'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadCustomerPlans,
          ),
          IconButton(
            icon: const Icon(Icons.home),
            onPressed: () => context.go(AppRouter.home),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Satın Aldığım Planlar',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: BlocBuilder<PlanBloc, PlanState>(
                builder: (context, state) {
                  if (state is PlanLoading) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (state is CustomerPlansLoaded) {
                    if (state.customerPlans.isEmpty) {
                      return const Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.playlist_remove, size: 64, color: Colors.grey),
                            SizedBox(height: 16),
                            Text(
                              'Henüz plan bulunmuyor',
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            SizedBox(height: 8),
                            Text(
                              'Marketplace\'den plan satın alabilirsiniz',
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 16, color: Colors.grey),
                            ),
                          ],
                        ),
                      );
                    }
                    return ListView.builder(
                      itemCount: state.customerPlans.length,
                      itemBuilder: (context, index) {
                        final customerPlan = state.customerPlans[index];
                        return CustomerPlanCard(
                          customerPlan: customerPlan,
                          onTap: () => _showPlanDetails(customerPlan),
                        );
                      },
                    );
                  } else if (state is PlanError) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.error, size: 64, color: Colors.red),
                          const SizedBox(height: 16),
                          Text(
                            'Hata: ${state.message}',
                            textAlign: TextAlign.center,
                            style: const TextStyle(fontSize: 16),
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: _loadCustomerPlans,
                            child: const Text('Tekrar Dene'),
                          ),
                        ],
                      ),
                    );
                  }
                  return const Center(child: Text('Plan yükleniyor...'));
                },
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go(AppRouter.marketplace),
        icon: const Icon(Icons.shopping_cart),
        label: const Text('Marketplace'),
      ),
    );
  }

  void _showPlanDetails(CustomerPlan customerPlan) {
    // Navigate to plan details page or show detailed dialog
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Plan detayları: ${customerPlan.customerPlanId}'),
      ),
    );
  }
}
