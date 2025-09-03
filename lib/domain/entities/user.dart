import 'package:equatable/equatable.dart';

class User extends Equatable {
  final String id;
  final String email;
  final String name;
  final String walletAddress;
  final UserType type;
  final DateTime createdAt;
  final bool isActive;

  const User({
    required this.id,
    required this.email,
    required this.name,
    required this.walletAddress,
    required this.type,
    required this.createdAt,
    this.isActive = true,
  });

  @override
  List<Object?> get props => [
        id,
        email,
        name,
        walletAddress,
        type,
        createdAt,
        isActive,
      ];

  User copyWith({
    String? id,
    String? email,
    String? name,
    String? walletAddress,
    UserType? type,
    DateTime? createdAt,
    bool? isActive,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      walletAddress: walletAddress ?? this.walletAddress,
      type: type ?? this.type,
      createdAt: createdAt ?? this.createdAt,
      isActive: isActive ?? this.isActive,
    );
  }
}

enum UserType {
  customer,
  producer,
  admin,
}
