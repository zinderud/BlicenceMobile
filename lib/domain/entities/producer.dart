import 'package:equatable/equatable.dart';

/// DataTypes.Producer struct ile uyumlu Producer entity
class Producer extends Equatable {
  // Smart contract Producer struct fields
  final int producerId; // uint256 producerId
  final String producerAddress; // address producerAddress
  final String name; // string name
  final String description; // string description
  final String image; // string image
  final String externalLink; // string externalLink
  final String cloneAddress; // address cloneAddress
  final bool exists; // bool exists

  // Additional Flutter app fields
  final String email;
  final String category;
  final double rating;
  final int totalCustomers;
  final List<String> services;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Map<String, dynamic> metadata;

  const Producer({
    required this.producerId,
    required this.producerAddress,
    required this.name,
    required this.description,
    this.image = '',
    this.externalLink = '',
    this.cloneAddress = '',
    this.exists = true,
    this.email = '',
    this.category = '',
    this.rating = 0.0,
    this.totalCustomers = 0,
    this.services = const [],
    required this.createdAt,
    required this.updatedAt,
    this.metadata = const {},
  });

  @override
  List<Object?> get props => [
        producerId,
        producerAddress,
        name,
        description,
        image,
        externalLink,
        cloneAddress,
        exists,
        email,
        category,
        rating,
        totalCustomers,
        services,
        createdAt,
        updatedAt,
        metadata,
      ];

  Producer copyWith({
    int? producerId,
    String? producerAddress,
    String? name,
    String? description,
    String? image,
    String? externalLink,
    String? cloneAddress,
    bool? exists,
    String? email,
    String? category,
    double? rating,
    int? totalCustomers,
    List<String>? services,
    DateTime? createdAt,
    DateTime? updatedAt,
    Map<String, dynamic>? metadata,
  }) {
    return Producer(
      producerId: producerId ?? this.producerId,
      producerAddress: producerAddress ?? this.producerAddress,
      name: name ?? this.name,
      description: description ?? this.description,
      image: image ?? this.image,
      externalLink: externalLink ?? this.externalLink,
      cloneAddress: cloneAddress ?? this.cloneAddress,
      exists: exists ?? this.exists,
      email: email ?? this.email,
      category: category ?? this.category,
      rating: rating ?? this.rating,
      totalCustomers: totalCustomers ?? this.totalCustomers,
      services: services ?? this.services,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      metadata: metadata ?? this.metadata,
    );
  }

  // Helper methods
  bool get isActive => exists;
  
  bool get hasCloneAddress => cloneAddress.isNotEmpty && cloneAddress != '';

  String get displayImage => image.isNotEmpty ? image : 'https://via.placeholder.com/150';

  String get displayLink => externalLink.isNotEmpty ? externalLink : '#';

  // Convert to JSON for blockchain interaction
  Map<String, dynamic> toBlockchainJson() {
    return {
      'producerId': producerId,
      'producerAddress': producerAddress,
      'name': name,
      'description': description,
      'image': image,
      'externalLink': externalLink,
      'cloneAddress': cloneAddress,
      'exists': exists,
    };
  }

  // Create from blockchain data
  factory Producer.fromBlockchainJson(Map<String, dynamic> json) {
    return Producer(
      producerId: json['producerId'] as int,
      producerAddress: json['producerAddress'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      image: json['image'] as String? ?? '',
      externalLink: json['externalLink'] as String? ?? '',
      cloneAddress: json['cloneAddress'] as String? ?? '',
      exists: json['exists'] as bool? ?? true,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
  }

  // Convert to JSON for app storage
  Map<String, dynamic> toJson() {
    return {
      'producerId': producerId,
      'producerAddress': producerAddress,
      'name': name,
      'description': description,
      'image': image,
      'externalLink': externalLink,
      'cloneAddress': cloneAddress,
      'exists': exists,
      'email': email,
      'category': category,
      'rating': rating,
      'totalCustomers': totalCustomers,
      'services': services,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'metadata': metadata,
    };
  }

  // Create from app storage JSON
  factory Producer.fromJson(Map<String, dynamic> json) {
    return Producer(
      producerId: json['producerId'] as int,
      producerAddress: json['producerAddress'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      image: json['image'] as String? ?? '',
      externalLink: json['externalLink'] as String? ?? '',
      cloneAddress: json['cloneAddress'] as String? ?? '',
      exists: json['exists'] as bool? ?? true,
      email: json['email'] as String? ?? '',
      category: json['category'] as String? ?? '',
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      totalCustomers: json['totalCustomers'] as int? ?? 0,
      services: List<String>.from(json['services'] as List? ?? []),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      metadata: json['metadata'] as Map<String, dynamic>? ?? {},
    );
  }
}

/// Producer kategorileri
enum ProducerCategory {
  fitness('Spor & Fitness'),
  food('Yiyecek & İçecek'),
  education('Eğitim'),
  technology('Teknoloji'),
  health('Sağlık'),
  entertainment('Eğlence'),
  transport('Ulaşım'),
  beauty('Güzellik & Bakım'),
  other('Diğer');

  const ProducerCategory(this.displayName);
  final String displayName;
}
