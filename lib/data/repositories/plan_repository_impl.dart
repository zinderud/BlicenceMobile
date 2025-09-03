import 'package:dartz/dartz.dart';
import '../../domain/entities/plan.dart';
import '../../domain/entities/customer_plan.dart';
import '../../domain/entities/plan_info.dart';
import '../../domain/repositories/plan_repository.dart';
import '../datasources/local/local_storage_service.dart';

class PlanRepositoryImpl implements PlanRepository {
  final LocalStorageService _localStorage;

  PlanRepositoryImpl({required LocalStorageService localStorage})
      : _localStorage = localStorage;

  @override
  Future<Either<String, List<Plan>>> getPlans() async {
    try {
      // Mock data for now
      final mockPlans = _getMockPlans();
      return Right(mockPlans);
    } catch (e) {
      return Left('Failed to get plans: $e');
    }
  }

  @override
  Future<Either<String, List<Plan>>> getPlansByProducer(int producerId) async {
    try {
      final allPlans = _getMockPlans();
      final producerPlans = allPlans.where((plan) => plan.producerId == producerId).toList();
      return Right(producerPlans);
    } catch (e) {
      return Left('Failed to get producer plans: $e');
    }
  }

  @override
  Future<Either<String, Plan>> getPlanById(int planId) async {
    try {
      final allPlans = _getMockPlans();
      final plan = allPlans.firstWhere((p) => p.planId == planId);
      return Right(plan);
    } catch (e) {
      return Left('Plan not found: $planId');
    }
  }

  @override
  Future<Either<String, Plan>> createPlan(Plan plan) async {
    try {
      // In real implementation, this would call blockchain service
      return Right(plan);
    } catch (e) {
      return Left('Failed to create plan: $e');
    }
  }

  @override
  Future<Either<String, List<CustomerPlan>>> getCustomerPlans(String customerAddress) async {
    try {
      // Mock customer plans
      return Right([]);
    } catch (e) {
      return Left('Failed to get customer plans: $e');
    }
  }

  @override
  Future<Either<String, CustomerPlan>> purchasePlan(int planId, String customerAddress) async {
    try {
      final planResult = await getPlanById(planId);
      return planResult.fold(
        (error) => Left(error),
        (plan) {
          final customerPlan = CustomerPlan(
            id: DateTime.now().millisecondsSinceEpoch.toString(),
            planId: planId,
            customerId: customerAddress,
            startDate: DateTime.now(),
            endDate: DateTime.now().add(const Duration(days: 30)),
            status: PlanStatus.active,
            planType: plan.planType,
            createdAt: DateTime.now(),
            updatedAt: DateTime.now(),
          );
          return Right(customerPlan);
        },
      );
    } catch (e) {
      return Left('Failed to purchase plan: $e');
    }
  }

  @override
  Future<Either<String, PlanInfoApi>> getApiPlanInfo(int planId) async {
    try {
      return Right(PlanInfoApi(
        planId: planId,
        apiEndpoint: 'https://api.example.com',
        apiKey: 'sample-key',
        requestsPerDay: 1000,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ));
    } catch (e) {
      return Left('Failed to get API plan info: $e');
    }
  }

  @override
  Future<Either<String, PlanInfoVesting>> getVestingPlanInfo(int planId) async {
    try {
      return Right(PlanInfoVesting(
        planId: planId,
        vestingDuration: const Duration(days: 365),
        releaseSchedule: ['25% at 3 months', '25% at 6 months', '50% at 12 months'],
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ));
    } catch (e) {
      return Left('Failed to get vesting plan info: $e');
    }
  }

  @override
  Future<Either<String, PlanInfoNUsage>> getNUsagePlanInfo(int planId) async {
    try {
      return Right(PlanInfoNUsage(
        planId: planId,
        totalUsages: 100,
        usedCount: 0,
        resetPeriod: const Duration(days: 30),
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ));
    } catch (e) {
      return Left('Failed to get usage plan info: $e');
    }
  }

  @override
  Future<Either<String, List<Plan>>> searchPlans({
    String? query,
    PlanType? type,
    PlanStatus? status,
  }) async {
    try {
      var plans = _getMockPlans();
      
      if (query != null && query.isNotEmpty) {
        plans = plans.where((plan) => 
          plan.name.toLowerCase().contains(query.toLowerCase()) ||
          plan.description.toLowerCase().contains(query.toLowerCase())
        ).toList();
      }
      
      if (type != null) {
        plans = plans.where((plan) => plan.planType == type).toList();
      }
      
      if (status != null) {
        plans = plans.where((plan) => plan.status == status).toList();
      }
      
      return Right(plans);
    } catch (e) {
      return Left('Failed to search plans: $e');
    }
  }

  @override
  Stream<List<Plan>> plansStream() {
    return Stream.periodic(const Duration(seconds: 30), (_) => _getMockPlans());
  }

  List<Plan> _getMockPlans() {
    return [
      Plan(
        planId: 1,
        cloneAddress: '0x1234567890123456789012345678901234567890',
        producerId: 1,
        name: 'Premium Gym API Access',
        description: 'Unlimited access to gym facilities with digital check-ins',
        totalSupply: 100,
        currentSupply: 25,
        priceAddress: '0xA0b86a33E6441B8Db08D1Df1C2C2A1c6e6D3e8A1',
        startDate: DateTime.now().subtract(const Duration(days: 30)),
        planType: PlanType.api,
        status: PlanStatus.active,
        price: 49.99,
        currency: 'USDC',
        producerName: 'FitnessTech',
        rating: 4.5,
        createdAt: DateTime.now().subtract(const Duration(days: 30)),
        updatedAt: DateTime.now(),
      ),
      Plan(
        planId: 2,
        cloneAddress: '0x2345678901234567890123456789012345678901',
        producerId: 2,
        name: 'Coffee Loyalty Points',
        description: '10 coffee purchases with bonus rewards',
        totalSupply: 200,
        currentSupply: 150,
        priceAddress: '0xB1c97a44F7552B9Ec18D2Df2D3D3B2d7f7E4f9B2',
        startDate: DateTime.now().subtract(const Duration(days: 15)),
        planType: PlanType.nUsage,
        status: PlanStatus.active,
        price: 29.99,
        currency: 'USDC',
        producerName: 'CoffeeChain',
        rating: 4.2,
        createdAt: DateTime.now().subtract(const Duration(days: 15)),
        updatedAt: DateTime.now(),
      ),
      Plan(
        planId: 3,
        cloneAddress: '0x3456789012345678901234567890123456789012',
        producerId: 3,
        name: 'Educational Platform Vesting',
        description: 'Access to premium courses with graduated unlock',
        totalSupply: 50,
        currentSupply: 10,
        priceAddress: '0xC2d08b55G8663C0Fd29E3Df3E4E4C3e8g8F5g0C3',
        startDate: DateTime.now().subtract(const Duration(days: 5)),
        planType: PlanType.vestingApi,
        status: PlanStatus.active,
        price: 199.99,
        currency: 'USDC',
        producerName: 'EduTech Pro',
        rating: 4.8,
        createdAt: DateTime.now().subtract(const Duration(days: 5)),
        updatedAt: DateTime.now(),
      ),
    ];
  }
}
