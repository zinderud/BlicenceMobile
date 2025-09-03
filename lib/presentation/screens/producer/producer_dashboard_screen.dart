import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../app/router/app_router.dart';
import '../../../domain/entities/plan.dart';
import '../../blocs/plan_bloc.dart';
import '../../blocs/auth_bloc.dart';

class ProducerDashboardScreen extends StatefulWidget {
  const ProducerDashboardScreen({super.key});

  @override
  State<ProducerDashboardScreen> createState() => _ProducerDashboardScreenState();
}

class _ProducerDashboardScreenState extends State<ProducerDashboardScreen> {
  @override
  void initState() {
    super.initState();
    _loadProducerPlans();
  }

  void _loadProducerPlans() {
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthAuthenticated) {
      context.read<PlanBloc>().add(LoadPlansByProducer(authState.user.id));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Üretici Paneli'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadProducerPlans,
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
              'Plan Yönetimi',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: BlocConsumer<PlanBloc, PlanState>(
                listener: (context, state) {
                  if (state is PlanCreated) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Plan başarıyla oluşturuldu!')),
                    );
                    _loadProducerPlans();
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
                            Icon(Icons.add_business, size: 64, color: Colors.grey),
                            SizedBox(height: 16),
                            Text(
                              'Henüz plan bulunmuyor',
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            SizedBox(height: 8),
                            Text(
                              'Yeni enerji planı oluşturarak başlayabilirsiniz',
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
                                    Icon(Icons.people, size: 16, color: Colors.blue),
                                    Text(' ${plan.customerPlanIds.length} müşteri'),
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
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: plan.isActive ? Colors.green : Colors.red,
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Text(
                                    plan.isActive ? 'Aktif' : 'Pasif',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 10,
                                    ),
                                  ),
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
                            onPressed: _loadProducerPlans,
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
        onPressed: () => _showCreatePlanDialog(context),
        icon: const Icon(Icons.add),
        label: const Text('Yeni Plan'),
      ),
    );
  }

  void _showCreatePlanDialog(BuildContext context) {
    final nameController = TextEditingController();
    final descriptionController = TextEditingController();
    final priceController = TextEditingController();
    final capacityController = TextEditingController();
    PlanType selectedType = PlanType.api;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Yeni Plan Oluştur'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(
                    labelText: 'Plan Adı',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: descriptionController,
                  decoration: const InputDecoration(
                    labelText: 'Açıklama',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 2,
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<PlanType>(
                  value: selectedType,
                  decoration: const InputDecoration(
                    labelText: 'Plan Türü',
                    border: OutlineInputBorder(),
                  ),
                  items: PlanType.values.map((type) {
                    return DropdownMenuItem(
                      value: type,
                      child: Text(_getPlanTypeText(type)),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      selectedType = value!;
                    });
                  },
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: priceController,
                  decoration: const InputDecoration(
                    labelText: 'Fiyat (₺)',
                    border: OutlineInputBorder(),
                  ),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: capacityController,
                  decoration: const InputDecoration(
                    labelText: 'Enerji Kapasitesi (kWh)',
                    border: OutlineInputBorder(),
                  ),
                  keyboardType: TextInputType.number,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('İptal'),
            ),
            ElevatedButton(
              onPressed: () {
                if (nameController.text.isNotEmpty &&
                    priceController.text.isNotEmpty &&
                    capacityController.text.isNotEmpty) {
                  final authState = this.context.read<AuthBloc>().state;
                  if (authState is AuthAuthenticated) {
                    final plan = Plan(
                      planId: 0, // Will be set by backend
                      cloneAddress: '0x0000000000000000000000000000000000000000',
                      producerId: int.parse(authState.user.id),
                      name: nameController.text,
                      description: descriptionController.text,
                      totalSupply: int.parse(capacityController.text),
                      priceAddress: '0x0000000000000000000000000000000000000000',
                      startDate: DateTime.now(),
                      planType: selectedType,
                      status: PlanStatus.active,
                      price: double.parse(priceController.text),
                      createdAt: DateTime.now(),
                      updatedAt: DateTime.now(),
                      customers: [],
                      totalCustomers: 0,
                      rating: 0.0,
                      reviews: [],
                      metadata: {},
                    );
                    
                    this.context.read<PlanBloc>().add(CreatePlan(plan));
                    Navigator.of(context).pop();
                  }
                }
              },
              child: const Text('Oluştur'),
            ),
          ],
        ),
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
