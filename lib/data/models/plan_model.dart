import '../../domain/entities/plan.dart';

class PlanModel {
  final String id;
  final String name;
  final String description;
  final String type;
  final double price;
  final double energyCapacity;
  final int durationDays;
  final String producerId;
  final bool isActive;
  final String? nftContractAddress;
  final int? tokenId;
  final List<String> customers;
  final int totalCustomers;
  final double rating;
  final List<String> reviews;
  final String createdAt;
  final String updatedAt;

  PlanModel({
    required this.id,
    required this.name,
    required this.description,
    required this.type,
    required this.price,
    required this.energyCapacity,
    required this.durationDays,
    required this.producerId,
    required this.isActive,
    this.nftContractAddress,
    this.tokenId,
    required this.customers,
    required this.totalCustomers,
    required this.rating,
    required this.reviews,
    required this.createdAt,
    required this.updatedAt,
  });

  factory PlanModel.fromJson(Map<String, dynamic> json) {
    return PlanModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      type: json['type'] ?? 'solar',
      price: (json['price'] ?? 0.0).toDouble(),
      energyCapacity: (json['energyCapacity'] ?? 0.0).toDouble(),
      durationDays: json['durationDays'] ?? 365,
      producerId: json['producerId'] ?? '',
      isActive: json['isActive'] ?? true,
      nftContractAddress: json['nftContractAddress'],
      tokenId: json['tokenId'],
      customers: List<String>.from(json['customers'] ?? []),
      totalCustomers: json['totalCustomers'] ?? 0,
      rating: (json['rating'] ?? 0.0).toDouble(),
      reviews: List<String>.from(json['reviews'] ?? []),
      createdAt: json['createdAt'] ?? DateTime.now().toIso8601String(),
      updatedAt: json['updatedAt'] ?? DateTime.now().toIso8601String(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'type': type,
      'price': price,
      'energyCapacity': energyCapacity,
      'durationDays': durationDays,
      'producerId': producerId,
      'isActive': isActive,
      'nftContractAddress': nftContractAddress,
      'tokenId': tokenId,
      'customers': customers,
      'totalCustomers': totalCustomers,
      'rating': rating,
      'reviews': reviews,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }

  factory PlanModel.fromDomain(Plan plan) {
    return PlanModel(
      id: plan.id,
      name: plan.name,
      description: plan.description,
      type: plan.type.toString().split('.').last,
      price: plan.price,
      energyCapacity: plan.energyCapacity,
      durationDays: plan.duration.inDays,
      producerId: plan.producerId,
      isActive: plan.isActive,
      nftContractAddress: plan.nftContractAddress,
      tokenId: plan.tokenId,
      customers: plan.customers,
      totalCustomers: plan.totalCustomers,
      rating: plan.rating,
      reviews: plan.reviews,
      createdAt: plan.createdAt.toIso8601String(),
      updatedAt: plan.updatedAt.toIso8601String(),
    );
  }

  Plan toDomain() {
    return Plan(
      id: id,
      name: name,
      description: description,
      type: _stringToPlanType(type),
      price: price,
      energyCapacity: energyCapacity,
      duration: Duration(days: durationDays),
      producerId: producerId,
      isActive: isActive,
      nftContractAddress: nftContractAddress,
      tokenId: tokenId,
      customers: customers,
      totalCustomers: totalCustomers,
      rating: rating,
      reviews: reviews,
      createdAt: DateTime.parse(createdAt),
      updatedAt: DateTime.parse(updatedAt),
    );
  }

  PlanType _stringToPlanType(String type) {
    switch (type.toLowerCase()) {
      case 'solar':
        return PlanType.solar;
      case 'wind':
        return PlanType.wind;
      case 'hydro':
        return PlanType.hydro;
      case 'hybrid':
        return PlanType.hybrid;
      default:
        return PlanType.solar;
    }
  }
}
