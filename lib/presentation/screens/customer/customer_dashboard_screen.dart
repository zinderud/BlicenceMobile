import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../app/router/app_router.dart';
import '../../../domain/entities/plan.dart';
import '../../blocs/plan_bloc.dart';
import '../../blocs/auth_bloc.dart';

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
      context.read<PlanBloc>().add(LoadPlansByCustomer(authState.user.id));
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
                  } else if (state is PlanLoaded) {
                    if (state.plans.isEmpty) {
                      return const Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.energy_savings_leaf, size: 64, color: Colors.grey),
                            SizedBox(height: 16),
                            Text(
                              'Henüz plan bulunmuyor',
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            SizedBox(height: 8),
                            Text(
                              'Marketplace\'den enerji planı satın alabilirsiniz',
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 16, color: Colors.grey),
                            ),
                          ],
                        ),
                      );
                    }
                    return ListView.builder(
                      itemCount: state.plans.length,
                      itemBuilder: (context, index) {
                        final plan = state.plans[index];
                        return Card(
                          margin: const EdgeInsets.symmetric(vertical: 8),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: _getPlanColor(plan.planType),
                              child: Icon(
                                _getPlanIcon(plan.planType),
                                color: Colors.white,
                              ),
                            ),
                            title: Text(
                              plan.name,
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(plan.description),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    Icon(Icons.flash_on, size: 16, color: Colors.orange),
                                    Text(' ${plan.totalSupply} kWh'),
                                    const SizedBox(width: 16),
                                    Icon(Icons.star, size: 16, color: Colors.amber),
                                    Text(' ${plan.rating.toStringAsFixed(1)}'),
                                  ],
                                ),
                              ],
                            ),
                            trailing: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  '${plan.price.toStringAsFixed(0)} ₺',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                                Text(
                                  _getPlanTypeText(plan.planType),
                                  style: const TextStyle(fontSize: 12),
                                ),
                              ],
                            ),
                          ),
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

  Color _getPlanColor(PlanType type) {
    switch (type) {
      case PlanType.api:
        return Colors.green;
      case PlanType.nUsage:
        return Colors.blue;
      case PlanType.vestingApi:
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  IconData _getPlanIcon(PlanType type) {
    switch (type) {
      case PlanType.api:
        return Icons.api;
      case PlanType.nUsage:
        return Icons.credit_card;
      case PlanType.vestingApi:
        return Icons.schedule;
      default:
        return Icons.help;
    }
  }

  String _getPlanTypeText(PlanType type) {
    switch (type) {
      case PlanType.api:
        return 'API Abonelik';
      case PlanType.nUsage:
        return 'Kullanım Kartı';
      case PlanType.vestingApi:
        return 'Gelecek Hizmet';
      default:
        return 'Bilinmeyen';
    }
  }
}
