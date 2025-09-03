import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/user.dart';

part 'user_model.g.dart';

@JsonSerializable()
class UserModel {
  final String id;
  final String email;
  final String name;
  final String walletAddress;
  final String type;
  final String createdAt;
  final bool isActive;

  const UserModel({
    required this.id,
    required this.email,
    required this.name,
    required this.walletAddress,
    required this.type,
    required this.createdAt,
    this.isActive = true,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);

  Map<String, dynamic> toJson() => _$UserModelToJson(this);

  factory UserModel.fromEntity(User user) {
    return UserModel(
      id: user.id,
      email: user.email,
      name: user.name,
      walletAddress: user.walletAddress,
      type: user.type.name,
      createdAt: user.createdAt.toIso8601String(),
      isActive: user.isActive,
    );
  }

  User toEntity() {
    return User(
      id: id,
      email: email,
      name: name,
      walletAddress: walletAddress,
      type: UserType.values.firstWhere((e) => e.name == type),
      createdAt: DateTime.parse(createdAt),
      isActive: isActive,
    );
  }
}
