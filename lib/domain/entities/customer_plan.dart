import 'package:equatable/equatable.dart';
import 'plan.dart';

/// DataTypes.CustomerPlan struct ile uyumlu CustomerPlan entity
class CustomerPlan extends Equatable {
  // Smart contract CustomerPlan struct fields
  final String customerAddress; // address customerAdress
  final int planId; // uint256 planId
  final int customerPlanId; // uint256 custumerPlanId
  final int producerId; // uint256 producerId
  final String cloneAddress; // address cloneAddress
  final String priceAddress; // address priceAddress
  final DateTime startDate; // uint32 startDate
  final DateTime endDate; // uint32 endDate
  final int remainingQuota; // uint256 remainingQuota
  final PlanStatus status; // Status status
  final PlanType planType; // PlanTypes planType

  // Additional Flutter app fields
  final String? nftTokenId;
  final String? nftContractAddress;
  final double totalPaid;
  final String currency;
  final Map<String, dynamic> metadata;

  const CustomerPlan({
    required this.customerAddress,
    required this.planId,
    required this.customerPlanId,
    required this.producerId,
    required this.cloneAddress,
    required this.priceAddress,
    required this.startDate,
    required this.endDate,
    this.remainingQuota = 0,
    this.status = PlanStatus.inactive,
    required this.planType,
    this.nftTokenId,
    this.nftContractAddress,
    this.totalPaid = 0.0,
    this.currency = 'USDC',
    this.metadata = const {},
  });

  @override
  List<Object?> get props => [
        customerAddress,
        planId,
        customerPlanId,
        producerId,
        cloneAddress,
        priceAddress,
        startDate,
        endDate,
        remainingQuota,
        status,
        planType,
        nftTokenId,
        nftContractAddress,
        totalPaid,
        currency,
        metadata,
      ];

  CustomerPlan copyWith({
    String? customerAddress,
    int? planId,
    int? customerPlanId,
    int? producerId,
    String? cloneAddress,
    String? priceAddress,
    DateTime? startDate,
    DateTime? endDate,
    int? remainingQuota,
    PlanStatus? status,
    PlanType? planType,
    String? nftTokenId,
    String? nftContractAddress,
    double? totalPaid,
    String? currency,
    Map<String, dynamic>? metadata,
  }) {
    return CustomerPlan(
      customerAddress: customerAddress ?? this.customerAddress,
      planId: planId ?? this.planId,
      customerPlanId: customerPlanId ?? this.customerPlanId,
      producerId: producerId ?? this.producerId,
      cloneAddress: cloneAddress ?? this.cloneAddress,
      priceAddress: priceAddress ?? this.priceAddress,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      remainingQuota: remainingQuota ?? this.remainingQuota,
      status: status ?? this.status,
      planType: planType ?? this.planType,
      nftTokenId: nftTokenId ?? this.nftTokenId,
      nftContractAddress: nftContractAddress ?? this.nftContractAddress,
      totalPaid: totalPaid ?? this.totalPaid,
      currency: currency ?? this.currency,
      metadata: metadata ?? this.metadata,
    );
  }

  // Helper methods
  bool get isActive => status == PlanStatus.active;
  
  bool get isExpired => status == PlanStatus.expired || DateTime.now().isAfter(endDate);

  Duration get remainingDuration {
    final now = DateTime.now();
    return endDate.isAfter(now) ? endDate.difference(now) : Duration.zero;
  }

  Duration get totalDuration => endDate.difference(startDate);

  double get durationProgress {
    final now = DateTime.now();
    if (now.isBefore(startDate)) return 0.0;
    if (now.isAfter(endDate)) return 1.0;
    
    final elapsed = now.difference(startDate);
    final total = totalDuration;
    return total.inMilliseconds > 0 ? elapsed.inMilliseconds / total.inMilliseconds : 1.0;
  }

  bool get hasRemainingQuota => remainingQuota > 0;

  // Convert to JSON for blockchain interaction
  Map<String, dynamic> toBlockchainJson() {
    return {
      'customerAdress': customerAddress, // Note: typo in smart contract
      'planId': planId,
      'custumerPlanId': customerPlanId, // Note: typo in smart contract
      'producerId': producerId,
      'cloneAddress': cloneAddress,
      'priceAddress': priceAddress,
      'startDate': startDate.millisecondsSinceEpoch ~/ 1000, // Unix timestamp
      'endDate': endDate.millisecondsSinceEpoch ~/ 1000, // Unix timestamp
      'remainingQuota': remainingQuota,
      'status': status.index,
      'planType': planType.index,
    };
  }

  // Create from blockchain data
  factory CustomerPlan.fromBlockchainJson(Map<String, dynamic> json) {
    return CustomerPlan(
      customerAddress: json['customerAdress'] as String, // Note: typo in smart contract
      planId: json['planId'] as int,
      customerPlanId: json['custumerPlanId'] as int, // Note: typo in smart contract
      producerId: json['producerId'] as int,
      cloneAddress: json['cloneAddress'] as String,
      priceAddress: json['priceAddress'] as String,
      startDate: DateTime.fromMillisecondsSinceEpoch((json['startDate'] as int) * 1000),
      endDate: DateTime.fromMillisecondsSinceEpoch((json['endDate'] as int) * 1000),
      remainingQuota: json['remainingQuota'] as int? ?? 0,
      status: PlanStatus.values[json['status'] as int],
      planType: PlanType.values[json['planType'] as int],
    );
  }

  // Convert to JSON for app storage
  Map<String, dynamic> toJson() {
    return {
      'customerAddress': customerAddress,
      'planId': planId,
      'customerPlanId': customerPlanId,
      'producerId': producerId,
      'cloneAddress': cloneAddress,
      'priceAddress': priceAddress,
      'startDate': startDate.toIso8601String(),
      'endDate': endDate.toIso8601String(),
      'remainingQuota': remainingQuota,
      'status': status.name,
      'planType': planType.name,
      'nftTokenId': nftTokenId,
      'nftContractAddress': nftContractAddress,
      'totalPaid': totalPaid,
      'currency': currency,
      'metadata': metadata,
    };
  }

  // Create from app storage JSON
  factory CustomerPlan.fromJson(Map<String, dynamic> json) {
    return CustomerPlan(
      customerAddress: json['customerAddress'] as String,
      planId: json['planId'] as int,
      customerPlanId: json['customerPlanId'] as int,
      producerId: json['producerId'] as int,
      cloneAddress: json['cloneAddress'] as String,
      priceAddress: json['priceAddress'] as String,
      startDate: DateTime.parse(json['startDate'] as String),
      endDate: DateTime.parse(json['endDate'] as String),
      remainingQuota: json['remainingQuota'] as int? ?? 0,
      status: PlanStatus.values.firstWhere((s) => s.name == json['status']),
      planType: PlanType.values.firstWhere((t) => t.name == json['planType']),
      nftTokenId: json['nftTokenId'] as String?,
      nftContractAddress: json['nftContractAddress'] as String?,
      totalPaid: (json['totalPaid'] as num?)?.toDouble() ?? 0.0,
      currency: json['currency'] as String? ?? 'USDC',
      metadata: json['metadata'] as Map<String, dynamic>? ?? {},
    );
  }
}
