import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'presentation/blocs/plan/plan_bloc.dart';
import 'domain/entities/plan.dart';
import 'data/repositories/plan_repository_impl.dart';
import 'data/datasources/local/local_storage_service.dart';

class SimpleTestPage extends StatefulWidget {
  const SimpleTestPage({super.key});

  @override
  State<SimpleTestPage> createState() => _SimpleTestPageState();
}

class _SimpleTestPageState extends State<SimpleTestPage> {
  List<Plan>? plans;
  String? error;
  bool isLoading = false;

  Future<void> _loadPlansDirectly() async {
    setState(() {
      isLoading = true;
      error = null;
      plans = null;
    });

    try {
      print('🔵 Repository test başlatılıyor...');
      
      // Repository'yi doğrudan test et
      final localStorage = LocalStorageService();
      final repository = PlanRepositoryImpl(localStorage: localStorage);
      
      print('🔵 Repository oluşturuldu');
      
      final result = await repository.getPlans();
      
      result.fold(
        (errorMsg) {
          print('🔴 Repository hatası: $errorMsg');
          setState(() {
            error = errorMsg;
            isLoading = false;
          });
        },
        (planList) {
          print('🟢 Repository başarılı: ${planList.length} plan');
          planList.forEach((plan) {
            print('🟢 Plan: ${plan.name} - ${plan.price}');
          });
          setState(() {
            plans = planList;
            isLoading = false;
          });
        },
      );
    } catch (e) {
      print('🔴 Hata: $e');
      setState(() {
        error = e.toString();
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    print('SimpleTestPage build');
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Simple Repository Test'),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            ElevatedButton(
              onPressed: isLoading ? null : _loadPlansDirectly,
              child: Text(isLoading ? 'Yükleniyor...' : 'Repository Test'),
            ),
            const SizedBox(height: 16),
            if (isLoading)
              const Center(child: CircularProgressIndicator())
            else if (error != null)
              Text('Hata: $error', style: const TextStyle(color: Colors.red))
            else if (plans != null)
              Expanded(
                child: ListView.builder(
                  itemCount: plans!.length,
                  itemBuilder: (context, index) {
                    final plan = plans![index];
                    return Card(
                      child: ListTile(
                        title: Text(plan.name),
                        subtitle: Text('\$${plan.price} - ${plan.category}'),
                        trailing: Text('ID: ${plan.planId}'),
                      ),
                    );
                  },
                ),
              )
            else
              const Text('Henüz plan yüklenmedi'),
          ],
        ),
      ),
    );
  }
}
