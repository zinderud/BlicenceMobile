import 'package:equatable/equatable.dart';

/// DataTypes.PlanInfoApi struct ile uyumlu PlanInfoApi entity
/// API usage planları için (örn: spor salonu aboneliği)
class PlanInfoApi extends Equatable {
  final int planId; // uint256 planId
  final double flowRate; // uint256 flowRate (cost per second in wei)
  final int perMonthLimit; // uint256 perMonthLimit (max tokens per month)
  
  // Repository implementation fields
  final String apiEndpoint;
  final String accessToken;
  final int requestLimit;
  final int requestsUsed;

  const PlanInfoApi({
    required this.planId,
    required this.flowRate,
    required this.perMonthLimit,
    this.apiEndpoint = '',
    this.accessToken = '',
    this.requestLimit = 0,
    this.requestsUsed = 0,
  });

  @override
  List<Object?> get props => [planId, flowRate, perMonthLimit, apiEndpoint, accessToken, requestLimit, requestsUsed];

  PlanInfoApi copyWith({
    int? planId,
    double? flowRate,
    int? perMonthLimit,
  }) {
    return PlanInfoApi(
      planId: planId ?? this.planId,
      flowRate: flowRate ?? this.flowRate,
      perMonthLimit: perMonthLimit ?? this.perMonthLimit,
    );
  }

  // Helper methods
  double get pricePerSecond => flowRate / 1e18; // Convert wei to token units
  
  double get pricePerMonth => pricePerSecond * 30 * 24 * 60 * 60; // Approximate monthly cost
  
  // Convert to JSON for blockchain interaction
  Map<String, dynamic> toBlockchainJson() {
    return {
      'planId': planId,
      'flowRate': flowRate.toInt(),
      'perMonthLimit': perMonthLimit,
    };
  }

  // Create from blockchain data
  factory PlanInfoApi.fromBlockchainJson(Map<String, dynamic> json) {
    return PlanInfoApi(
      planId: json['planId'] as int,
      flowRate: (json['flowRate'] as num).toDouble(),
      perMonthLimit: json['perMonthLimit'] as int,
    );
  }
}

/// DataTypes.PlanInfoVesting struct ile uyumlu PlanInfoVesting entity
/// Vesting API planları için (örn: gelecekte başlayacak hizmetler)
class PlanInfoVesting extends Equatable {
  final int planId; // uint256 planId
  final DateTime cliffDate; // uint32 cliffDate
  final double flowRate; // uint256 flowRate
  final double startAmount; // uint256 startAmount
  final String ctx; // bytes ctx (context data)
  
  // Repository implementation fields
  final double totalAmount;
  final double vestedAmount;
  final double claimedAmount;
  final DateTime vestingStartDate;
  final DateTime vestingEndDate;
  final DateTime? lastClaimDate;

  const PlanInfoVesting({
    required this.planId,
    required this.cliffDate,
    required this.flowRate,
    required this.startAmount,
    this.ctx = '',
    this.totalAmount = 0.0,
    this.vestedAmount = 0.0,
    this.claimedAmount = 0.0,
    required this.vestingStartDate,
    required this.vestingEndDate,
    this.lastClaimDate,
  });

  @override
  List<Object?> get props => [planId, cliffDate, flowRate, startAmount, ctx, totalAmount, vestedAmount, claimedAmount, vestingStartDate, vestingEndDate, lastClaimDate];

  PlanInfoVesting copyWith({
    int? planId,
    DateTime? cliffDate,
    double? flowRate,
    double? startAmount,
    String? ctx,
  }) {
    return PlanInfoVesting(
      planId: planId ?? this.planId,
      cliffDate: cliffDate ?? this.cliffDate,
      flowRate: flowRate ?? this.flowRate,
      startAmount: startAmount ?? this.startAmount,
      ctx: ctx ?? this.ctx,
      totalAmount: this.totalAmount,
      vestedAmount: this.vestedAmount,
      claimedAmount: this.claimedAmount,
      vestingStartDate: this.vestingStartDate,
      vestingEndDate: this.vestingEndDate,
      lastClaimDate: this.lastClaimDate,
    );
  }

  // Helper methods
  bool get isCliffReached => DateTime.now().isAfter(cliffDate);
  
  Duration get timeToCliff {
    final now = DateTime.now();
    return cliffDate.isAfter(now) ? cliffDate.difference(now) : Duration.zero;
  }

  double get startAmountInTokens => startAmount / 1e18; // Convert wei to token units
  
  double get flowRatePerSecond => flowRate / 1e18; // Convert wei to token units per second

  // Convert to JSON for blockchain interaction
  Map<String, dynamic> toBlockchainJson() {
    return {
      'planId': planId,
      'cliffDate': cliffDate.millisecondsSinceEpoch ~/ 1000, // Unix timestamp
      'flowRate': flowRate.toInt(),
      'startAmount': startAmount.toInt(),
      'ctx': ctx,
    };
  }

  // Create from blockchain data
  factory PlanInfoVesting.fromBlockchainJson(Map<String, dynamic> json) {
    return PlanInfoVesting(
      planId: json['planId'] as int,
      cliffDate: DateTime.fromMillisecondsSinceEpoch((json['cliffDate'] as int) * 1000),
      flowRate: (json['flowRate'] as num).toDouble(),
      startAmount: (json['startAmount'] as num).toDouble(),
      ctx: json['ctx'] as String? ?? '',
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0.0,
      vestedAmount: (json['vestedAmount'] as num?)?.toDouble() ?? 0.0,
      claimedAmount: (json['claimedAmount'] as num?)?.toDouble() ?? 0.0,
      vestingStartDate: DateTime.fromMillisecondsSinceEpoch((json['vestingStartDate'] as int?) ?? DateTime.now().millisecondsSinceEpoch),
      vestingEndDate: DateTime.fromMillisecondsSinceEpoch((json['vestingEndDate'] as int?) ?? DateTime.now().add(Duration(days: 365)).millisecondsSinceEpoch),
    );
  }
}

/// DataTypes.PlanInfoNUsage struct ile uyumlu PlanInfoNUsage entity
/// Number of usage planları için (örn: kafeterya puan kartı)
class PlanInfoNUsage extends Equatable {
  final int planId; // uint256 planId
  final double oneUsagePrice; // uint256 oneUsagePrice (cost per usage in wei)
  final int minUsageLimit; // uint32 minUsageLimit
  final int maxUsageLimit; // uint32 maxUsageLimit
  
  // Repository implementation fields
  final int maxUsage;
  final int currentUsage;
  final int remainingUsage;
  final DateTime? lastUsageDate;
  final List<DateTime> usageHistory;

  const PlanInfoNUsage({
    required this.planId,
    required this.oneUsagePrice,
    required this.minUsageLimit,
    required this.maxUsageLimit,
    this.maxUsage = 0,
    this.currentUsage = 0,
    this.remainingUsage = 0,
    this.lastUsageDate,
    this.usageHistory = const [],
  });

  @override
  List<Object?> get props => [planId, oneUsagePrice, minUsageLimit, maxUsageLimit, maxUsage, currentUsage, remainingUsage, lastUsageDate, usageHistory];

  PlanInfoNUsage copyWith({
    int? planId,
    double? oneUsagePrice,
    int? minUsageLimit,
    int? maxUsageLimit,
  }) {
    return PlanInfoNUsage(
      planId: planId ?? this.planId,
      oneUsagePrice: oneUsagePrice ?? this.oneUsagePrice,
      minUsageLimit: minUsageLimit ?? this.minUsageLimit,
      maxUsageLimit: maxUsageLimit ?? this.maxUsageLimit,
    );
  }

  // Helper methods
  double get pricePerUsage => oneUsagePrice / 1e18; // Convert wei to token units
  
  double get minTotalPrice => pricePerUsage * minUsageLimit;
  
  double get maxTotalPrice => pricePerUsage * maxUsageLimit;
  
  bool isValidUsageCount(int count) {
    return count >= minUsageLimit && count <= maxUsageLimit;
  }

  double calculateTotalPrice(int usageCount) {
    if (!isValidUsageCount(usageCount)) {
      throw ArgumentError('Usage count must be between $minUsageLimit and $maxUsageLimit');
    }
    return pricePerUsage * usageCount;
  }

  // Convert to JSON for blockchain interaction
  Map<String, dynamic> toBlockchainJson() {
    return {
      'planId': planId,
      'oneUsagePrice': oneUsagePrice.toInt(),
      'minUsageLimit': minUsageLimit,
      'maxUsageLimit': maxUsageLimit,
    };
  }

  // Create from blockchain data
  factory PlanInfoNUsage.fromBlockchainJson(Map<String, dynamic> json) {
    return PlanInfoNUsage(
      planId: json['planId'] as int,
      oneUsagePrice: (json['oneUsagePrice'] as num).toDouble(),
      minUsageLimit: json['minUsageLimit'] as int,
      maxUsageLimit: json['maxUsageLimit'] as int,
    );
  }
}
