import 'package:dartz/dartz.dart';
import '../entities/plan.dart';
import '../entities/customer_plan.dart';
import '../entities/plan_info.dart';

abstract class PlanRepository {
  Future<Either<String, List<Plan>>> getPlans();
  Future<Either<String, List<Plan>>> getPlansByProducer(int producerId);
  Future<Either<String, Plan>> getPlanById(int planId);
  Future<Either<String, Plan>> createPlan(Plan plan);
  Future<Either<String, List<CustomerPlan>>> getCustomerPlans(String customerAddress);
  Future<Either<String, CustomerPlan>> purchasePlan(int planId, String customerAddress);
  Future<Either<String, PlanInfoApi>> getApiPlanInfo(int planId);
  Future<Either<String, PlanInfoVesting>> getVestingPlanInfo(int planId);
  Future<Either<String, PlanInfoNUsage>> getNUsagePlanInfo(int planId);
  Future<Either<String, List<Plan>>> searchPlans({
    String? query,
    PlanType? type,
    PlanStatus? status,
  });
  Stream<List<Plan>> plansStream();
}
