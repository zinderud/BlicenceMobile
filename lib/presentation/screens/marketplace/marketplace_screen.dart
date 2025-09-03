import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../app/router/app_router.dart';
import '../../../domain/entities/plan.dart';
import '../../blocs/plan_bloc.dart';
import '../../blocs/auth_bloc.dart';

class MarketplaceScreen extends StatefulWidget {
  const MarketplaceScreen({super.key});

  @override
  State<MarketplaceScreen> createState() => _MarketplaceScreenState();
}

class _MarketplaceScreenState extends State<MarketplaceScreen> {
  final TextEditingController _searchController = TextEditingController();
  PlanType? _selectedType;

  @override
  void initState() {
    super.initState();
    _loadAllPlans();
  }

  void _loadAllPlans() {
    context.read<PlanBloc>().add(LoadAllPlans());
  }

  void _searchPlans() {
    context.read<PlanBloc>().add(SearchPlans(
      query: _searchController.text.isNotEmpty ? _searchController.text : null,
      type: _selectedType,
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Marketplace'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadAllPlans,
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
            // Search and Filter Section
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: 'Plan ara...',
                      prefixIcon: const Icon(Icons.search),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    ),
                    onChanged: (value) => _searchPlans(),
                  ),
                ),
                const SizedBox(width: 8),
                PopupMenuButton<PlanType?>(
                  icon: Icon(Icons.filter_list),
                  onSelected: (type) {
                    setState(() {
                      _selectedType = type;
                    });
                    _searchPlans();
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: null,
                      child: Text('Tümü'),
                    ),
                    ...PlanType.values.map((type) => PopupMenuItem(
                      value: type,
                      child: Text(_getPlanTypeText(type)),
                    )),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Text(
              'Mevcut Planlar',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: BlocConsumer<PlanBloc, PlanState>(
                listener: (context, state) {
                  if (state is PlanPurchased) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Plan başarıyla satın alındı!')),
                    );
                    _loadAllPlans();
                  } else if (state is PlanError) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Hata: ${state.message}')),
                    );
                  }
                },
                builder: (context, state) {
                  if (state is PlanLoading) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (state is PlanLoaded) {
                    if (state.plans.isEmpty) {
                      return const Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.store_outlined, size: 64, color: Colors.grey),
                            SizedBox(height: 16),
                            Text(
                              'Henüz plan bulunmuyor',
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            SizedBox(height: 8),
                            Text(
                              'Üreticiler plan oluşturdukça burada görünecekler',
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
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    CircleAvatar(
                                      backgroundColor: _getPlanColor(plan.planType),
                                      child: Icon(
                                        _getPlanIcon(plan.planType),
                                        color: Colors.white,
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            plan.name,
                                            style: const TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 18,
                                            ),
                                          ),
                                          Text(
                                            _getPlanTypeText(plan.planType),
                                            style: TextStyle(
                                              color: _getPlanColor(plan.planType),
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.end,
                                      children: [
                                        Text(
                                          '${plan.price.toStringAsFixed(0)} ₺',
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 20,
                                            color: Colors.green,
                                          ),
                                        ),
                                        Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(Icons.star, size: 16, color: Colors.amber),
                                            Text(' ${plan.rating.toStringAsFixed(1)}'),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  plan.description,
                                  style: const TextStyle(fontSize: 14, color: Colors.grey),
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    Expanded(
                                      child: Row(
                                        children: [
                                          Icon(Icons.flash_on, size: 16, color: Colors.orange),
                                          Text(' ${plan.totalSupply} kWh'),
                                          const SizedBox(width: 16),
                                          Icon(Icons.people, size: 16, color: Colors.blue),
                                          Text(' ${plan.customerPlanIds.length} müşteri'),
                                        ],
                                      ),
                                    ),
                                    ElevatedButton(
                                      onPressed: plan.isActive ? () => _purchasePlan(plan) : null,
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: plan.isActive ? Colors.green : Colors.grey,
                                        foregroundColor: Colors.white,
                                      ),
                                      child: Text(plan.isActive ? 'Satın Al' : 'Pasif'),
                                    ),
                                  ],
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
                            onPressed: _loadAllPlans,
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
    );
  }

  void _purchasePlan(Plan plan) {
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthAuthenticated) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Plan Satın Al'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Plan: ${plan.name}'),
              Text('Fiyat: ${plan.price.toStringAsFixed(0)} ₺'),
              Text('Kapasite: ${plan.totalSupply} kWh'),
              const SizedBox(height: 16),
              const Text('Bu planı satın almak istediğinizden emin misiniz?'),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('İptal'),
            ),
            ElevatedButton(
              onPressed: () {
                context.read<PlanBloc>().add(PurchasePlan(
                                  planId: plan.planId.toString(), 
                                  customerId: '1', // Mock customer ID
                                ));
                Navigator.of(context).pop();
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
              child: const Text('Satın Al'),
            ),
          ],
        ),
      );
    }
  }

  Color _getPlanColor(PlanType type) {
    switch (type) {
      case PlanType.api:
        return Colors.green;
      case PlanType.nUsage:
        return Colors.blue;
      case PlanType.vestingApi:
        return Colors.orange;
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
    }
  }
}
