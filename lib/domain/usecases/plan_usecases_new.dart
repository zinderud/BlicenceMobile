import 'package:dartz/dartz.dart';
import '../entities/plan.dart';
import '../entities/customer_plan.dart';
import '../repositories/plan_repository.dart';

class GetAllPlansUseCase {
  final PlanRepository repository;

  GetAllPlansUseCase(this.repository);

  Future<Either<String, List<Plan>>> call() async {
    return await repository.getAllPlans();
  }
}

class GetPlansByProducerUseCase {
  final PlanRepository repository;

  GetPlansByProducerUseCase(this.repository);

  Future<Either<String, List<Plan>>> call(int producerId) async {
    if (producerId <= 0) {
      return left('Producer ID geçersiz');
    }
    return await repository.getPlansByProducer(producerId);
  }
}

class CreatePlanUseCase {
  final PlanRepository repository;

  CreatePlanUseCase(this.repository);

  Future<Either<String, Plan>> call(Plan plan) async {
    final validation = _validatePlan(plan);
    if (validation != null) {
      return left(validation);
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
    if (plan.price <= 0) {
      return 'Plan fiyatı 0\'dan büyük olmalı';
    }
    if (plan.totalSupply <= 0) {
      return 'Plan kapasitesi 0\'dan büyük olmalı';
    }
    return null;
  }
}

class PurchasePlanUseCase {
  final PlanRepository repository;

  PurchasePlanUseCase(this.repository);

  Future<Either<String, CustomerPlan>> call(int planId, int customerId) async {
    if (planId <= 0) {
      return left('Plan ID geçersiz');
    }
    if (customerId <= 0) {
      return left('Customer ID geçersiz');
    }

    // Plan varlığını kontrol et
    final plan = await repository.getPlanById(planId);
    return plan.fold(
      (error) => left(error),
      (planData) {
        if (planData.status != PlanStatus.active) {
          return left('Plan aktif değil');
        }
        return repository.purchasePlan(planId, customerId);
      },
    );
  }
}

class SearchPlansUseCase {
  final PlanRepository repository;

  SearchPlansUseCase(this.repository);

  Future<Either<String, List<Plan>>> call({
    String? query,
    PlanType? type,
    double? minPrice,
    double? maxPrice,
  }) async {
    if (minPrice != null && minPrice < 0) {
      return left('Minimum fiyat 0\'dan küçük olamaz');
    }
    if (maxPrice != null && maxPrice < 0) {
      return left('Maximum fiyat 0\'dan küçük olamaz');
    }
    if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
      return left('Minimum fiyat maximum fiyattan büyük olamaz');
    }

    return await repository.searchPlans(
      query: query,
      type: type,
      minPrice: minPrice,
      maxPrice: maxPrice,
    );
  }
}

class UpdatePlanUseCase {
  final PlanRepository repository;

  UpdatePlanUseCase(this.repository);

  Future<Either<String, Plan>> call(Plan plan) async {
    final validation = _validatePlan(plan);
    if (validation != null) {
      return left(validation);
    }
    return await repository.updatePlan(plan);
  }

  String? _validatePlan(Plan plan) {
    if (plan.name.isEmpty) {
      return 'Plan adı boş olamaz';
    }
    if (plan.description.isEmpty) {
      return 'Plan açıklaması boş olamaz';
    }
    if (plan.price <= 0) {
      return 'Plan fiyatı 0\'dan büyük olmalı';
    }
    if (plan.totalSupply <= 0) {
      return 'Plan kapasitesi 0\'dan büyük olmalı';
    }
    return null;
  }
}

class DeletePlanUseCase {
  final PlanRepository repository;

  DeletePlanUseCase(this.repository);

  Future<bool> call(int planId) async {
    if (planId <= 0) {
      return false;
    }
    return await repository.deletePlan(planId);
  }
}

class GetPlanByIdUseCase {
  final PlanRepository repository;

  GetPlanByIdUseCase(this.repository);

  Future<Either<String, Plan>> call(int planId) async {
    if (planId <= 0) {
      return left('Plan ID geçersiz');
    }
    return await repository.getPlanById(planId);
  }
}
