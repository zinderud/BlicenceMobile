import 'package:dartz/dartz.dart';
import '../../domain/entities/plan.dart';
import '../../domain/entities/customer_plan.dart';
import '../../domain/entities/plan_info.dart';
import '../../domain/repositories/plan_repository.dart';
import '../datasources/local/local_storage_service.dart';

class PlanRepositoryImpl implements PlanRepository {
  final LocalStorageService localStorage;

  PlanRepositoryImpl({required this.localStorage});

  // Mock data for testing
  static final List<Plan> _mockPlans = [
    Plan(
      planId: 1,
      producerId: 1,
      cloneAddress: '0x1234567890123456789012345678901234567890',
      name: 'Premium Gym Membership',
      description: 'Full access to all gym facilities including pool, sauna, and classes',
      totalSupply: 100,
      priceAddress: '0x0000000000000000000000000000000000000000',
      startDate: DateTime.now(),
      price: 99.99,
      duration: 30,
      maxUsage: 0,
      planType: PlanType.api,
      status: PlanStatus.active,
      features: ['Unlimited gym access', 'Pool access', 'Group classes', 'Personal trainer consultation'],
      imageUrl: 'https://example.com/gym.jpg',
      category: 'Fitness',
      tags: ['gym', 'fitness', 'health'],
      vestingPeriod: 0,
      cliffPeriod: 0,
      apiEndpoint: 'https://api.gym.com/access',
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    ),
    Plan(
      planId: 2,
      producerId: 2,
      cloneAddress: '0x2345678901234567890123456789012345678901',
      name: 'Coffee Loyalty Card',
      description: '10 coffee purchases with loyalty rewards',
      totalSupply: 50,
      priceAddress: '0x0000000000000000000000000000000000000000',
      startDate: DateTime.now(),
      price: 45.00,
      duration: 0,
      maxUsage: 10,
      planType: PlanType.nUsage,
      status: PlanStatus.active,
      features: ['10 coffee purchases', 'Free pastry after 5th coffee', 'Premium coffee beans'],
      imageUrl: 'https://example.com/coffee.jpg',
      category: 'Food & Beverage',
      tags: ['coffee', 'loyalty', 'rewards'],
      vestingPeriod: 0,
      cliffPeriod: 0,
      apiEndpoint: '',
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    ),
    Plan(
      planId: 3,
      producerId: 3,
      cloneAddress: '0x3456789012345678901234567890123456789012',
      name: 'Educational Course Access',
      description: 'Vested access to premium educational content over 6 months',
      totalSupply: 30,
      priceAddress: '0x0000000000000000000000000000000000000000',
      startDate: DateTime.now(),
      price: 299.99,
      duration: 180,
      maxUsage: 0,
      planType: PlanType.vestingApi,
      status: PlanStatus.active,
      features: ['Progressive content unlock', 'Certificate upon completion', 'Mentor support'],
      imageUrl: 'https://example.com/education.jpg',
      category: 'Education',
      tags: ['education', 'course', 'vesting'],
      vestingPeriod: 180,
      cliffPeriod: 30,
      apiEndpoint: 'https://api.education.com/course',
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    ),
  ];

  @override
  Future<Either<String, List<Plan>>> getPlans() async {
    try {
      // In a real implementation, this would fetch from a blockchain or API
      await Future.delayed(const Duration(milliseconds: 500)); // Simulate network delay
      return Right(_mockPlans);
    } catch (e) {
      return Left('Failed to get plans: ${e.toString()}');
    }
  }

  @override
  Future<Either<String, List<Plan>>> getPlansByProducer(int producerId) async {
    try {
      await Future.delayed(const Duration(milliseconds: 300));
      final filteredPlans = _mockPlans.where((plan) => plan.producerId == producerId).toList();
      return Right(filteredPlans);
    } catch (e) {
      return Left('Failed to get plans by producer: ${e.toString()}');
    }
  }

  @override
  Future<Either<String, Plan>> getPlanById(int planId) async {
    try {
      await Future.delayed(const Duration(milliseconds: 200));
      final plan = _mockPlans.firstWhere(
        (plan) => plan.planId == planId,
        orElse: () => throw Exception('Plan not found'),
      );
      return Right(plan);
    } catch (e) {
      return Left('Failed to get plan by ID: ${e.toString()}');
    }
  }

  @override
  Future<Either<String, Plan>> createPlan(Plan plan) async {
    try {
      await Future.delayed(const Duration(milliseconds: 800));
      // In a real implementation, this would create the plan on blockchain
      final newPlan = plan.copyWith(
        planId: _mockPlans.length + 1,
        status: PlanStatus.active,
      );
      _mockPlans.add(newPlan);
      return Right(newPlan);
    } catch (e) {
      return Left('Failed to create plan: ${e.toString()}');
    }
  }

  @override
  Future<Either<String, List<CustomerPlan>>> getCustomerPlans(String customerAddress) async {
    try {
      await Future.delayed(const Duration(milliseconds: 400));
      // Mock customer plans
      final customerPlans = [
        CustomerPlan(
          customerPlanId: 1,
          planId: 1,
          producerId: 1,
          cloneAddress: '0x1234567890123456789012345678901234567890',
          priceAddress: '0x0000000000000000000000000000000000000000',
          customerAddress: customerAddress,
          startDate: DateTime.now().subtract(const Duration(days: 5)),
          endDate: DateTime.now().add(const Duration(days: 25)),
          planType: PlanType.api,
          purchaseDate: DateTime.now().subtract(const Duration(days: 5)),
          expiryDate: DateTime.now().add(const Duration(days: 25)),
          usageCount: 5,
          lastUsed: DateTime.now().subtract(const Duration(days: 1)),
          vestingStartDate: DateTime.now().subtract(const Duration(days: 5)),
          claimedAmount: 0,
          totalVestingAmount: 0,
        ),
      ];
      return Right(customerPlans);
    } catch (e) {
      return Left('Failed to get customer plans: ${e.toString()}');
    }
  }

  @override
  Future<Either<String, CustomerPlan>> purchasePlan(int planId, String customerAddress) async {
    try {
      await Future.delayed(const Duration(milliseconds: 1000));
      final plan = _mockPlans.firstWhere(
        (p) => p.planId == planId,
        orElse: () => throw Exception('Plan not found'),
      );
      
      final customerPlan = CustomerPlan(
        customerPlanId: DateTime.now().millisecondsSinceEpoch,
        planId: planId,
        producerId: plan.producerId,
        cloneAddress: plan.cloneAddress,
        priceAddress: plan.priceAddress,
        customerAddress: customerAddress,
        startDate: DateTime.now(),
        endDate: plan.duration > 0 
          ? DateTime.now().add(Duration(days: plan.duration))
          : DateTime.now().add(const Duration(days: 365)),
        planType: plan.planType,
        purchaseDate: DateTime.now(),
        expiryDate: plan.duration > 0 
          ? DateTime.now().add(Duration(days: plan.duration))
          : DateTime.now().add(const Duration(days: 365)),
        usageCount: 0,
        lastUsed: null,
        vestingStartDate: plan.planType == PlanType.vestingApi ? DateTime.now() : null,
        claimedAmount: 0,
        totalVestingAmount: plan.planType == PlanType.vestingApi ? plan.price : 0,
      );
      
      return Right(customerPlan);
    } catch (e) {
      return Left('Failed to purchase plan: ${e.toString()}');
    }
  }

  @override
  Future<Either<String, PlanInfoApi>> getApiPlanInfo(int planId) async {
    try {
      await Future.delayed(const Duration(milliseconds: 300));
      return Right(PlanInfoApi(
        planId: planId,
        flowRate: 0.1,
        perMonthLimit: 1000,
        apiEndpoint: 'https://api.example.com/plan/$planId',
        accessToken: 'mock_token_${DateTime.now().millisecondsSinceEpoch}',
        requestLimit: 1000,
        requestsUsed: 45,
      ));
    } catch (e) {
      return Left('Failed to get API plan info: ${e.toString()}');
    }
  }

  @override
  Future<Either<String, PlanInfoVesting>> getVestingPlanInfo(int planId) async {
    try {
      await Future.delayed(const Duration(milliseconds: 300));
      return Right(PlanInfoVesting(
        planId: planId,
        cliffDate: DateTime.now().subtract(const Duration(days: 0)),
        flowRate: 0.05,
        startAmount: 299.99,
        totalAmount: 299.99,
        vestedAmount: 50.0,
        claimedAmount: 25.0,
        vestingStartDate: DateTime.now().subtract(const Duration(days: 30)),
        vestingEndDate: DateTime.now().add(const Duration(days: 150)),
        lastClaimDate: DateTime.now().subtract(const Duration(days: 7)),
      ));
    } catch (e) {
      return Left('Failed to get vesting plan info: ${e.toString()}');
    }
  }

  @override
  Future<Either<String, PlanInfoNUsage>> getNUsagePlanInfo(int planId) async {
    try {
      await Future.delayed(const Duration(milliseconds: 300));
      return Right(PlanInfoNUsage(
        planId: planId,
        oneUsagePrice: 4.5,
        minUsageLimit: 1,
        maxUsageLimit: 10,
        maxUsage: 10,
        currentUsage: 3,
        remainingUsage: 7,
        lastUsageDate: DateTime.now().subtract(const Duration(hours: 6)),
        usageHistory: [
          DateTime.now().subtract(const Duration(days: 5)),
          DateTime.now().subtract(const Duration(days: 3)),
          DateTime.now().subtract(const Duration(hours: 6)),
        ],
      ));
    } catch (e) {
      return Left('Failed to get N-usage plan info: ${e.toString()}');
    }
  }

  @override
  Future<Either<String, List<Plan>>> searchPlans({
    String? query,
    PlanType? type,
    PlanStatus? status,
  }) async {
    try {
      await Future.delayed(const Duration(milliseconds: 400));
      var filteredPlans = List<Plan>.from(_mockPlans);

      if (query != null && query.isNotEmpty) {
        filteredPlans = filteredPlans.where((plan) =>
          plan.name.toLowerCase().contains(query.toLowerCase()) ||
          plan.description.toLowerCase().contains(query.toLowerCase()) ||
          plan.category.toLowerCase().contains(query.toLowerCase())
        ).toList();
      }

      if (type != null) {
        filteredPlans = filteredPlans.where((plan) => plan.planType == type).toList();
      }

      if (status != null) {
        filteredPlans = filteredPlans.where((plan) => plan.status == status).toList();
      }

      return Right(filteredPlans);
    } catch (e) {
      return Left('Failed to search plans: ${e.toString()}');
    }
  }

  @override
  Stream<List<Plan>> plansStream() {
    // In a real implementation, this would stream from blockchain events
    return Stream.periodic(const Duration(seconds: 5), (_) => _mockPlans);
  }

  @override
  Future<Either<String, CustomerPlan>> purchasePlanWithStream({
    required int planId, 
    required String customerAddress,
    bool? enableStream,
  }) async {
    try {
      await Future.delayed(const Duration(seconds: 2)); // Simulate blockchain transaction
      
      final plan = _mockPlans.firstWhere((p) => p.planId == planId);
      final now = DateTime.now();
      
      // Determine if stream should be enabled based on plan type
      final shouldEnableStream = enableStream ?? 
          (plan.planType == PlanType.api || plan.planType == PlanType.vestingApi);
      
      final customerPlan = CustomerPlan(
        customerAddress: customerAddress,
        planId: planId,
        customerPlanId: DateTime.now().millisecondsSinceEpoch % 100000,
        producerId: plan.producerId,
        cloneAddress: plan.cloneAddress,
        priceAddress: plan.priceAddress,
        startDate: now,
        endDate: plan.duration > 0 ? now.add(Duration(days: plan.duration)) : now.add(const Duration(days: 365)),
        remainingQuota: plan.maxUsage,
        status: PlanStatus.active,
        planType: plan.planType,
        totalPaid: plan.price,
        currency: 'USDC',
        metadata: {'purchaseTransactionHash': '0x${DateTime.now().millisecondsSinceEpoch.toRadixString(16)}'},
        purchaseDate: now,
        // Stream fields
        streamLockId: shouldEnableStream ? DateTime.now().millisecondsSinceEpoch % 1000000 : null,
        hasActiveStream: shouldEnableStream,
        streamStartDate: shouldEnableStream ? now : null,
        streamEndDate: shouldEnableStream && plan.duration > 0 
            ? now.add(Duration(days: plan.duration)) 
            : (shouldEnableStream ? now.add(const Duration(days: 365)) : null),
        streamedAmount: 0.0,
        remainingStreamAmount: shouldEnableStream ? plan.price : 0.0,
        streamDuration: shouldEnableStream && plan.duration > 0 ? plan.duration * 24 * 60 * 60 : null, // seconds
      );

      return Right(customerPlan);
    } catch (e) {
      return Left('Failed to purchase plan with stream: ${e.toString()}');
    }
  }

  @override
  Future<Either<String, double>> getStreamProgress(int streamLockId) async {
    try {
      await Future.delayed(const Duration(milliseconds: 500));
      
      // Mock calculation - in real implementation, this would query StreamLockManager
      final random = DateTime.now().millisecondsSinceEpoch % 100;
      final progress = (random / 100).clamp(0.0, 1.0);
      
      return Right(progress);
    } catch (e) {
      return Left('Failed to get stream progress: ${e.toString()}');
    }
  }

  @override
  Future<Either<String, Map<String, dynamic>>> getStreamDetails(int streamLockId) async {
    try {
      await Future.delayed(const Duration(milliseconds: 500));
      
      // Mock stream details - in real implementation, this would query blockchain
      final now = DateTime.now();
      const duration = Duration(days: 30);
      final startDate = now.subtract(const Duration(days: 5));
      final endDate = startDate.add(duration);
      final elapsed = now.difference(startDate).inSeconds;
      final totalDuration = duration.inSeconds;
      final progress = (elapsed / totalDuration).clamp(0.0, 1.0);
      
      return Right({
        'streamLockId': streamLockId,
        'startDate': startDate.toIso8601String(),
        'endDate': endDate.toIso8601String(),
        'totalAmount': 100.0,
        'streamedAmount': 100.0 * progress,
        'remainingAmount': 100.0 * (1 - progress),
        'progress': progress,
        'isActive': progress < 1.0,
        'canClaim': progress > 0.1, // Can claim after 10% progress
      });
    } catch (e) {
      return Left('Failed to get stream details: ${e.toString()}');
    }
  }

  @override
  Future<Either<String, bool>> claimStreamedAmount(int streamLockId) async {
    try {
      await Future.delayed(const Duration(seconds: 1)); // Simulate blockchain transaction
      
      // Mock claim operation - in real implementation, this would call smart contract
      return const Right(true);
    } catch (e) {
      return Left('Failed to claim streamed amount: ${e.toString()}');
    }
  }

  @override
  Future<Either<String, List<CustomerPlan>>> getActiveStreamPlans(String customerAddress) async {
    try {
      await Future.delayed(const Duration(milliseconds: 500));
      
      // Get all customer plans and filter for active streams
      final allPlansResult = await getCustomerPlans(customerAddress);
      
      return allPlansResult.fold(
        (error) => Left(error),
        (plans) {
          final streamPlans = plans.where((plan) => 
            plan.hasActiveStream && 
            plan.streamLockId != null &&
            !plan.isStreamExpired
          ).toList();
          return Right(streamPlans);
        },
      );
    } catch (e) {
      return Left('Failed to get active stream plans: ${e.toString()}');
    }
  }
}
