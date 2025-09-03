import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'presentation/blocs/plan/plan_bloc.dart';
import 'domain/entities/plan.dart';
import 'core/di/service_locator.dart';

class TestPage extends StatelessWidget {
  const TestPage({super.key});

  @override
  Widget build(BuildContext context) {
    print('TestPage build çağrıldı');
    return BlocProvider<PlanBloc>(
      create: (context) {
        print('PlanBloc oluşturuluyor...');
        final bloc = sl<PlanBloc>();
        print('PlanBloc oluşturuldu: $bloc');
        return bloc;
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Mock Veriler Test'),
          backgroundColor: Colors.blue,
          foregroundColor: Colors.white,
        ),
        body: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  ElevatedButton(
                    onPressed: () {
                      print('🔵 Mock Planları Yükle butonu tıklandı');
                      try {
                        final bloc = context.read<PlanBloc>();
                        print('🔵 PlanBloc erişildi: $bloc');
                        print('🔵 LoadPlans eventi gönderiliyor...');
                        bloc.add(LoadPlans());
                        print('🔵 LoadPlans eventi gönderildi');
                      } catch (e) {
                        print('🔴 Hata: $e');
                      }
                    },
                    child: const Text('Mock Planları Yükle'),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Repository implementation mock verileri test edin',
                    style: TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              ),
            ),
            Expanded(
              child: BlocBuilder<PlanBloc, PlanState>(
                builder: (context, state) {
                  print('🟡 BlocBuilder state: ${state.runtimeType}');
                  print('🟡 State details: $state');
                  
                  if (state is PlanLoading) {
                    print('🟠 Loading state detected');
                    return const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          CircularProgressIndicator(),
                          SizedBox(height: 16),
                          Text('Planlar yükleniyor...'),
                        ],
                      ),
                    );
                  }

                  if (state is PlanError) {
                    print('🔴 PlanError: ${state.message}');
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.error, color: Colors.red, size: 64),
                          const SizedBox(height: 16),
                          Text('Hata: ${state.message}'),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: () {
                              context.read<PlanBloc>().add(LoadPlans());
                            },
                            child: const Text('Tekrar Dene'),
                          ),
                        ],
                      ),
                    );
                  }

                  if (state is PlansLoaded) {
                    print('🟢 PlansLoaded: ${state.plans.length} plans');
                    print('🟢 Plan details: ${state.plans.map((p) => p.name).toList()}');
                    return ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: state.plans.length,
                      itemBuilder: (context, index) {
                        final plan = state.plans[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 16),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
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
                                const SizedBox(height: 8),
                                Text(
                                  plan.description,
                                  style: const TextStyle(color: Colors.grey),
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 8,
                                        vertical: 4,
                                      ),
                                      decoration: BoxDecoration(
                                        color: Colors.blue.withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Text(
                                        plan.category,
                                        style: const TextStyle(
                                          color: Colors.blue,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ),
                                    const Spacer(),
                                    Text(
                                      '\$${plan.price.toStringAsFixed(2)}',
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.green,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Plan ID: ${plan.planId}',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey,
                                  ),
                                ),
                                Text(
                                  'Producer ID: ${plan.producerId}',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey,
                                  ),
                                ),
                                Text(
                                  'Tip: ${plan.planType.name}',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey,
                                  ),
                                ),
                                Text(
                                  'Durum: ${plan.status.name}',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey,
                                  ),
                                ),
                                if (plan.features.isNotEmpty) ...[
                                  const SizedBox(height: 8),
                                  const Text(
                                    'Özellikler:',
                                    style: TextStyle(fontWeight: FontWeight.bold),
                                  ),
                                  ...plan.features.map(
                                    (feature) => Padding(
                                      padding: const EdgeInsets.only(left: 16),
                                      child: Text('• $feature'),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        );
                      },
                    );
                  }

                  return const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.list, size: 64, color: Colors.grey),
                        SizedBox(height: 16),
                        Text('Mock planları görmek için butona basın'),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
