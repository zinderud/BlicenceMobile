import 'package:dartz/dartz.dart';
import '../entities/plan.dart';
import '../entities/customer_plan.dart';
import '../repositories/plan_repository.dart';

class GetAllPlansUseCase {
  final PlanRepository repository;

  GetAllPlansUseCase(this.repository);

  Future<Either<String, List<Plan>>> call() async {
    return await repository.getPlans();
  }
}

class GetPlansByProducerUseCase {
  final PlanRepository repository;

  GetPlansByProducerUseCase(this.repository);

  Future<Either<String, List<Plan>>> call(int producerId) async {
    return await repository.getPlansByProducer(producerId);
  }
}

class CreatePlanUseCase {
  final PlanRepository repository;

  CreatePlanUseCase(this.repository);

  Future<Either<String, Plan>> call(Plan plan) async {
    // Basic validation
    final validation = _validatePlan(plan);
    if (validation != null) {
      return Left(validation);
    }
    
    return await repository.createPlan(plan);
  }

  String? _validatePlan(Plan plan) {
    if (plan.name.isEmpty) {
      return 'Plan adı boş olamaz';
    }
    
    if (plan.description.isEmpty) {
      return 'Plan açıklaması boş olamaz';
    }
    
    if (plan.totalSupply <= 0) {
      return 'Toplam arz 0\'dan büyük olmalı';
    }
    
    if (plan.price < 0) {
      return 'Fiyat negatif olamaz';
    }
    
    return null;
  }
}

class PurchasePlanUseCase {
  final PlanRepository repository;

  PurchasePlanUseCase(this.repository);

  Future<Either<String, CustomerPlan>> call(int planId, String customerAddress) async {
    try {
      final planResult = await repository.getPlanById(planId);
      return planResult.fold(
        (error) => Left(error),
        (planData) {
          if (planData.status != PlanStatus.active) {
            return Left('Bu plan aktif değil');
          }
          
          if (!planData.hasAvailableSupply) {
            return Left('Bu plan için stok bulunmuyor');
          }
          
          return repository.purchasePlan(planId, customerAddress);
        },
      );
    } catch (e) {
      return Left('Plan satın alma hatası: $e');
    }
  }
}

class SearchPlansUseCase {
  final PlanRepository repository;

  SearchPlansUseCase(this.repository);

  Future<Either<String, List<Plan>>> call({
    String? query,
    PlanType? type,
    PlanStatus? status,
    double? minPrice,
    double? maxPrice,
  }) async {
    return await repository.searchPlans(
      query: query,
      type: type,
      status: status,
    );
  }
}

class UpdatePlanUseCase {
  final PlanRepository repository;

  UpdatePlanUseCase(this.repository);

  Future<Either<String, Plan>> call(Plan plan) async {
    // Basic validation
    final validation = _validatePlan(plan);
    if (validation != null) {
      return Left(validation);
    }
    
    return await repository.createPlan(plan); // Using create for update
  }

  String? _validatePlan(Plan plan) {
    if (plan.name.isEmpty) {
      return 'Plan adı boş olamaz';
    }
    
    if (plan.description.isEmpty) {
      return 'Plan açıklaması boş olamaz';
    }
    
    if (plan.totalSupply <= 0) {
      return 'Toplam arz 0\'dan büyük olmalı';
    }
    
    if (plan.price < 0) {
      return 'Fiyat negatif olamaz';
    }
    
    return null;
  }
}

class DeletePlanUseCase {
  final PlanRepository repository;

  DeletePlanUseCase(this.repository);

  Future<Either<String, bool>> call(int planId) async {
    try {
      // In a real implementation, this would delete the plan
      // For now, we'll just return success
      return const Right(true);
    } catch (e) {
      return Left('Plan silme hatası: $e');
    }
  }
}

class GetPlanByIdUseCase {
  final PlanRepository repository;

  GetPlanByIdUseCase(this.repository);

  Future<Either<String, Plan>> call(int planId) async {
    return await repository.getPlanById(planId);
  }
}

class GetPlansByCustomerUseCase {
  final PlanRepository repository;

  GetPlansByCustomerUseCase(this.repository);

  Future<Either<String, List<CustomerPlan>>> call(String customerAddress) async {
    return await repository.getCustomerPlans(customerAddress);
  }
}
