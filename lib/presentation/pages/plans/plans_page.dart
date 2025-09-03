import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../blocs/plan/plan_bloc.dart';
import '../../../domain/entities/plan.dart';

class PlansPage extends StatefulWidget {
  const PlansPage({super.key});

  @override
  State<PlansPage> createState() => _PlansPageState();
}

class _PlansPageState extends State<PlansPage> {
  @override
  void initState() {
    super.initState();
    context.read<PlanBloc>().add(LoadPlans());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Blockchain Planları'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => _showSearchDialog(context),
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => context.read<PlanBloc>().add(LoadPlans()),
          ),
        ],
      ),
      body: BlocBuilder<PlanBloc, PlanState>(
        builder: (context, state) {
          if (state is PlanLoading) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          if (state is PlanError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.error_outline,
                    size: 64,
                    color: Colors.red[400],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Hata: ${state.message}',
                    style: const TextStyle(fontSize: 16),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => context.read<PlanBloc>().add(LoadPlans()),
                    child: const Text('Tekrar Dene'),
                  ),
                ],
              ),
            );
          }

          if (state is PlansLoaded) {
            if (state.plans.isEmpty) {
              return const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.inbox_outlined,
                      size: 64,
                      color: Colors.grey,
                    ),
                    SizedBox(height: 16),
                    Text(
                      'Henüz plan bulunmamaktadır',
                      style: TextStyle(fontSize: 16, color: Colors.grey),
                    ),
                  ],
                ),
              );
            }

            return RefreshIndicator(
              onRefresh: () async {
                context.read<PlanBloc>().add(LoadPlans());
              },
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: state.plans.length,
                itemBuilder: (context, index) {
                  final plan = state.plans[index];
                  return _buildPlanCard(context, plan);
                },
              ),
            );
          }

          return const Center(
            child: Text('Planlar yükleniyor...'),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showPlanTypeFilter(context),
        child: const Icon(Icons.filter_list),
      ),
    );
  }

  Widget _buildPlanCard(BuildContext context, Plan plan) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () => _showPlanDetails(context, plan),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          plan.name,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        if (plan.producerName?.isNotEmpty == true) ...[
                          const SizedBox(height: 4),
                          Text(
                            'Provider: ${plan.producerName}',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  _buildStatusChip(plan.status),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                plan.description,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[700],
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  _buildPlanTypeChip(plan.planType),
                  const SizedBox(width: 8),
                  _buildSupplyInfo(plan),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Currency: ${plan.currency}',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                  ElevatedButton(
                    onPressed: plan.isActive ? () => _purchasePlan(context, plan) : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    ),
                    child: const Text('Satın Al'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusChip(PlanStatus status) {
    Color color;
    String label;
    
    switch (status) {
      case PlanStatus.active:
        color = Colors.green;
        label = 'Aktif';
        break;
      case PlanStatus.inactive:
        color = Colors.orange;
        label = 'Pasif';
        break;
      case PlanStatus.expired:
        color = Colors.red;
        label = 'Süresi Dolmuş';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildPlanTypeChip(PlanType type) {
    Color color;
    String label;
    IconData icon;
    
    switch (type) {
      case PlanType.api:
        color = Colors.blue;
        label = 'API Abonelik';
        icon = Icons.api;
        break;
      case PlanType.nUsage:
        color = Colors.orange;
        label = 'Kullanım Kartı';
        icon = Icons.credit_card;
        break;
      case PlanType.vestingApi:
        color = Colors.purple;
        label = 'Gelecek Hizmet';
        icon = Icons.schedule;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSupplyInfo(Plan plan) {
    final percentage = plan.supplyPercentage;
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            '${plan.currentSupply}/${plan.totalSupply}',
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 2),
          LinearProgressIndicator(
            value: percentage,
            backgroundColor: Colors.grey[300],
            valueColor: AlwaysStoppedAnimation<Color>(
              percentage > 0.8 ? Colors.red : percentage > 0.5 ? Colors.orange : Colors.green,
            ),
          ),
        ],
      ),
    );
  }

  void _showSearchDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Plan Ara'),
        content: TextField(
          decoration: const InputDecoration(
            hintText: 'Plan adı veya açıklama...',
            border: OutlineInputBorder(),
          ),
          onSubmitted: (query) {
            Navigator.of(context).pop();
            context.read<PlanBloc>().add(SearchPlans(query: query));
          },
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('İptal'),
          ),
        ],
      ),
    );
  }

  void _showPlanTypeFilter(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Plan Tipi Filtrele', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            ...PlanType.values.map((type) => ListTile(
              title: Text(_getPlanTypeDisplayName(type)),
              onTap: () {
                Navigator.of(context).pop();
                context.read<PlanBloc>().add(SearchPlans(type: type));
              },
            )),
            const Divider(),
            ListTile(
              title: const Text('Tüm Planlar'),
              onTap: () {
                Navigator.of(context).pop();
                context.read<PlanBloc>().add(LoadPlans());
              },
            ),
          ],
        ),
      ),
    );
  }

  String _getPlanTypeDisplayName(PlanType type) {
    switch (type) {
      case PlanType.api:
        return 'API Abonelik (Spor Salonu)';
      case PlanType.nUsage:
        return 'Kullanım Kartı (Kafeterya)';
      case PlanType.vestingApi:
        return 'Gelecek Hizmet (Eğitim)';
    }
  }

  void _showPlanDetails(BuildContext context, Plan plan) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.9,
        builder: (context, scrollController) => Container(
          padding: const EdgeInsets.all(16),
          child: SingleChildScrollView(
            controller: scrollController,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      plan.name,
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    ),
                    _buildStatusChip(plan.status),
                  ],
                ),
                const SizedBox(height: 16),
                Text('Provider: ${plan.producerName}', style: const TextStyle(fontSize: 16)),
                const SizedBox(height: 8),
                Text(plan.description, style: const TextStyle(fontSize: 14)),
                const SizedBox(height: 16),
                const Divider(),
                const SizedBox(height: 16),
                Text('Blockchain Bilgileri', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                _buildInfoRow('Plan ID', plan.planId.toString()),
                _buildInfoRow('Producer ID', plan.producerId.toString()),
                _buildInfoRow('Clone Address', plan.cloneAddress),
                _buildInfoRow('Price Address', plan.priceAddress),
                _buildInfoRow('Supply', '${plan.currentSupply}/${plan.totalSupply}'),
                _buildInfoRow('Plan Type', _getPlanTypeDisplayName(plan.planType)),
                _buildInfoRow('Currency', plan.currency),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: plan.isActive ? () => _purchasePlan(context, plan) : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: const Text('Satın Al', style: TextStyle(fontSize: 16)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(color: Colors.grey),
            ),
          ),
        ],
      ),
    );
  }

  void _purchasePlan(BuildContext context, Plan plan) {
    // Mock customer address - gerçek uygulamada kullanıcının wallet adresini alacaksınız
    const customerAddress = '0x742d35Cc6639C0532fea4cf0d2fBaBaFa62bD5BB';
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Plan Satın Al'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Plan: ${plan.name}'),
            Text('Provider: ${plan.producerName}'),
            Text('Type: ${_getPlanTypeDisplayName(plan.planType)}'),
            const SizedBox(height: 16),
            const Text('Bu planı satın almak istediğinizden emin misiniz?'),
            const SizedBox(height: 8),
            const Text(
              'Bu işlem blockchain üzerinde gerçekleştirilecek ve geri alınamaz.',
              style: TextStyle(fontSize: 12, color: Colors.orange),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('İptal'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              context.read<PlanBloc>().add(
                PurchasePlan(
                  planId: plan.planId,
                  customerAddress: customerAddress,
                ),
              );
            },
            child: const Text('Satın Al'),
          ),
        ],
      ),
    );
  }
}
