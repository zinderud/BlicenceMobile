import 'package:equatable/equatable.dart';
import 'plan.dart'; // PlanStatus ve PlanType enum'ları için

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
  
  // Stream integration fields ✨ **YENİ**
  final String? streamLockId; // Stream lock ID for payment streaming
  final bool hasActiveStream; // Whether this plan has an active stream
  final DateTime? streamStartDate; // When stream payment started
  final DateTime? streamEndDate; // When stream payment ends
  final double streamedAmount; // Amount already streamed
  final double remainingStreamAmount; // Amount left to stream
  final int streamDuration; // Stream duration in seconds
  
  // Repository implementation fields
  final DateTime purchaseDate;
  final DateTime? expiryDate;
  final int usageCount;
  final DateTime? lastUsed;
  final DateTime? vestingStartDate;
  final double claimedAmount;
  final double totalVestingAmount;

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
    // Stream fields ✨ **YENİ**
    this.streamLockId,
    this.hasActiveStream = false,
    this.streamStartDate,
    this.streamEndDate,
    this.streamedAmount = 0.0,
    this.remainingStreamAmount = 0.0,
    this.streamDuration = 0,
    // Repository fields
    required this.purchaseDate,
    this.expiryDate,
    this.usageCount = 0,
    this.lastUsed,
    this.vestingStartDate,
    this.claimedAmount = 0.0,
    this.totalVestingAmount = 0.0,
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
        // Stream fields ✨ **YENİ**
        streamLockId,
        hasActiveStream,
        streamStartDate,
        streamEndDate,
        streamedAmount,
        remainingStreamAmount,
        streamDuration,
        // Original fields continue
        nftTokenId,
        nftContractAddress,
        totalPaid,
        currency,
        metadata,
        purchaseDate,
        expiryDate,
        usageCount,
        lastUsed,
        vestingStartDate,
        claimedAmount,
        totalVestingAmount,
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
    // Stream fields ✨ **YENİ**
    String? streamLockId,
    bool? hasActiveStream,
    DateTime? streamStartDate,
    DateTime? streamEndDate,
    double? streamedAmount,
    double? remainingStreamAmount,
    int? streamDuration,
    // Repository fields
    DateTime? purchaseDate,
    DateTime? expiryDate,
    int? usageCount,
    DateTime? lastUsed,
    DateTime? vestingStartDate,
    double? claimedAmount,
    double? totalVestingAmount,
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
      // Stream fields ✨ **YENİ**
      streamLockId: streamLockId ?? this.streamLockId,
      hasActiveStream: hasActiveStream ?? this.hasActiveStream,
      streamStartDate: streamStartDate ?? this.streamStartDate,
      streamEndDate: streamEndDate ?? this.streamEndDate,
      streamedAmount: streamedAmount ?? this.streamedAmount,
      remainingStreamAmount: remainingStreamAmount ?? this.remainingStreamAmount,
      streamDuration: streamDuration ?? this.streamDuration,
      // Repository fields
      purchaseDate: purchaseDate ?? this.purchaseDate,
      expiryDate: expiryDate ?? this.expiryDate,
      usageCount: usageCount ?? this.usageCount,
      lastUsed: lastUsed ?? this.lastUsed,
      vestingStartDate: vestingStartDate ?? this.vestingStartDate,
      claimedAmount: claimedAmount ?? this.claimedAmount,
      totalVestingAmount: totalVestingAmount ?? this.totalVestingAmount,
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

  // Stream utility methods ✨ **YENİ**
  bool get isStreamActive => hasActiveStream && streamLockId != null;
  
  double get streamProgress {
    if (!hasActiveStream || streamedAmount + remainingStreamAmount == 0) return 0.0;
    return streamedAmount / (streamedAmount + remainingStreamAmount);
  }
  
  Duration? get streamTimeRemaining {
    if (!hasActiveStream || streamEndDate == null) return null;
    final now = DateTime.now();
    if (now.isAfter(streamEndDate!)) return Duration.zero;
    return streamEndDate!.difference(now);
  }
  
  bool get isStreamExpired {
    if (!hasActiveStream || streamEndDate == null) return false;
    return DateTime.now().isAfter(streamEndDate!);
  }
  
  String get streamStatusText {
    if (!hasActiveStream) return 'No Stream';
    if (isStreamExpired) return 'Stream Expired';
    if (streamTimeRemaining != null) {
      final remaining = streamTimeRemaining!;
      if (remaining.inDays > 0) return '${remaining.inDays}d remaining';
      if (remaining.inHours > 0) return '${remaining.inHours}h remaining';
      return '${remaining.inMinutes}m remaining';
    }
    return 'Stream Active';
  }

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
      // Stream fields ✨ **YENİ**
      'streamLockId': streamLockId,
      'hasActiveStream': hasActiveStream,
      'streamDuration': streamDuration,
    };
  }

  // Create from blockchain data with stream support ✨ **GÜNCEL**
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
      // Stream fields ✨ **YENİ**
      streamLockId: json['streamLockId'] as String?,
      hasActiveStream: json['hasActiveStream'] as bool? ?? false,
      streamDuration: json['streamDuration'] as int? ?? 0,
      purchaseDate: DateTime.fromMillisecondsSinceEpoch((json['startDate'] as int) * 1000), // Use startDate as purchaseDate
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
      'purchaseDate': purchaseDate.toIso8601String(),
      // Stream fields
      'streamLockId': streamLockId,
      'hasActiveStream': hasActiveStream,
      'streamStartDate': streamStartDate?.toIso8601String(),
      'streamEndDate': streamEndDate?.toIso8601String(),
      'streamedAmount': streamedAmount,
      'remainingStreamAmount': remainingStreamAmount,
      'streamDuration': streamDuration,
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
      purchaseDate: json['purchaseDate'] != null 
          ? DateTime.parse(json['purchaseDate'] as String)
          : DateTime.parse(json['startDate'] as String), // Fallback to startDate
      // Stream fields
      streamLockId: json['streamLockId'] as int?,
      hasActiveStream: json['hasActiveStream'] as bool? ?? false,
      streamStartDate: json['streamStartDate'] != null 
          ? DateTime.parse(json['streamStartDate'] as String) 
          : null,
      streamEndDate: json['streamEndDate'] != null 
          ? DateTime.parse(json['streamEndDate'] as String) 
          : null,
      streamedAmount: (json['streamedAmount'] as num?)?.toDouble() ?? 0.0,
      remainingStreamAmount: (json['remainingStreamAmount'] as num?)?.toDouble() ?? 0.0,
      streamDuration: json['streamDuration'] as int?,
    );
  }
}
