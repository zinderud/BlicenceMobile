import 'package:equatable/equatable.dart';

// Plan status enum matching smart contract
enum PlanStatus { inactive, active, expired }

// Plan type enum matching smart contract
enum PlanType { api, nUsage, vestingApi }

/// Blockchain smart contract DataTypes.Plan ile uyumlu Plan entity
class Plan extends Equatable {
  // Smart contract Plan struct fields
  final int planId; // uint256 planId
  final String cloneAddress; // address cloneAddress (producer clone address)
  final int producerId; // uint256 producerId
  final String name; // string name
  final String description; // string description
  final String externalLink; // string externalLink
  final int totalSupply; // int256 totalSupply
  final int currentSupply; // int256 currentSupply
  final String backgroundColor; // string backgroundColor
  final String image; // string image
  final String priceAddress; // address priceAddress
  final DateTime startDate; // uint32 startDate
  final PlanStatus status; // Status enum
  final PlanType planType; // PlanTypes enum
  final List<int> customerPlanIds; // uint256[] custumerPlanIds

  // Additional Flutter app fields
  final String? producerName;
  final String currency;
  final double price; // UI gösterimi için fiyat
  final double rating;
  final List<String> reviews;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Map<String, dynamic> metadata;

  const Plan({
    required this.planId,
    required this.cloneAddress,
    required this.producerId,
    required this.name,
    required this.description,
    this.externalLink = '',
    required this.totalSupply,
    this.currentSupply = 0,
    this.backgroundColor = '#FFFFFF',
    this.image = '',
    required this.priceAddress,
    required this.startDate,
    this.status = PlanStatus.inactive,
    required this.planType,
    this.customerPlanIds = const [],
    this.producerName = '',
    this.currency = 'USDC',
    this.price = 0.0,
    this.rating = 0.0,
    this.reviews = const [],
    required this.createdAt,
    required this.updatedAt,
    this.metadata = const {},
  });

  @override
  List<Object?> get props => [
        planId,
        cloneAddress,
        producerId,
        name,
        description,
        externalLink,
        totalSupply,
        currentSupply,
        backgroundColor,
        image,
        priceAddress,
        startDate,
        status,
        planType,
        customerPlanIds,
        producerName,
        currency,
        price,
        rating,
        reviews,
        createdAt,
        updatedAt,
        metadata,
      ];

  Plan copyWith({
    int? planId,
    String? cloneAddress,
    int? producerId,
    String? name,
    String? description,
    String? externalLink,
    int? totalSupply,
    int? currentSupply,
    String? backgroundColor,
    String? image,
    String? priceAddress,
    DateTime? startDate,
    PlanStatus? status,
    PlanType? planType,
    List<int>? customerPlanIds,
    String? producerName,
    String? currency,
    double? price,
    double? rating,
    List<String>? reviews,
    DateTime? createdAt,
    DateTime? updatedAt,
    Map<String, dynamic>? metadata,
  }) {
    return Plan(
      planId: planId ?? this.planId,
      cloneAddress: cloneAddress ?? this.cloneAddress,
      producerId: producerId ?? this.producerId,
      name: name ?? this.name,
      description: description ?? this.description,
      externalLink: externalLink ?? this.externalLink,
      totalSupply: totalSupply ?? this.totalSupply,
      currentSupply: currentSupply ?? this.currentSupply,
      backgroundColor: backgroundColor ?? this.backgroundColor,
      image: image ?? this.image,
      priceAddress: priceAddress ?? this.priceAddress,
      startDate: startDate ?? this.startDate,
      status: status ?? this.status,
      planType: planType ?? this.planType,
      customerPlanIds: customerPlanIds ?? this.customerPlanIds,
      producerName: producerName ?? this.producerName,
      currency: currency ?? this.currency,
      price: price ?? this.price,
      rating: rating ?? this.rating,
      reviews: reviews ?? this.reviews,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      metadata: metadata ?? this.metadata,
    );
  }

  // Helper methods
  bool get isActive => status == PlanStatus.active;
  
  bool get isExpired => status == PlanStatus.expired;

  double get supplyPercentage => totalSupply > 0 ? (currentSupply / totalSupply) : 0.0;

  int get remainingSupply => totalSupply - currentSupply;

  bool get hasAvailableSupply => currentSupply < totalSupply;

  // Convert to JSON for app storage
  Map<String, dynamic> toJson() {
    return {
      'planId': planId,
      'cloneAddress': cloneAddress,
      'producerId': producerId,
      'name': name,
      'description': description,
      'externalLink': externalLink,
      'totalSupply': totalSupply,
      'currentSupply': currentSupply,
      'backgroundColor': backgroundColor,
      'image': image,
      'priceAddress': priceAddress,
      'startDate': startDate.toIso8601String(),
      'status': status.name,
      'planType': planType.name,
      'customerPlanIds': customerPlanIds,
      'producerName': producerName,
      'currency': currency,
      'price': price,
      'rating': rating,
      'reviews': reviews,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'metadata': metadata,
    };
  }

  // Create from app storage JSON
  factory Plan.fromJson(Map<String, dynamic> json) {
    return Plan(
      planId: json['planId'] as int,
      cloneAddress: json['cloneAddress'] as String,
      producerId: json['producerId'] as int,
      name: json['name'] as String,
      description: json['description'] as String,
      externalLink: json['externalLink'] as String? ?? '',
      totalSupply: json['totalSupply'] as int,
      currentSupply: json['currentSupply'] as int? ?? 0,
      backgroundColor: json['backgroundColor'] as String? ?? '#FFFFFF',
      image: json['image'] as String? ?? '',
      priceAddress: json['priceAddress'] as String,
      startDate: DateTime.parse(json['startDate'] as String),
      status: PlanStatus.values.firstWhere((s) => s.name == json['status']),
      planType: PlanType.values.firstWhere((t) => t.name == json['planType']),
      customerPlanIds: List<int>.from(json['customerPlanIds'] as List? ?? []),
      producerName: json['producerName'] as String? ?? '',
      currency: json['currency'] as String? ?? 'USDC',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      reviews: List<String>.from(json['reviews'] as List? ?? []),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      metadata: json['metadata'] as Map<String, dynamic>? ?? {},
    );
  }
}
