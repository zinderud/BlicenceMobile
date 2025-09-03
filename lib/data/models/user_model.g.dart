// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UserModel _$UserModelFromJson(Map<String, dynamic> json) => UserModel(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
      walletAddress: json['walletAddress'] as String,
      type: json['type'] as String,
      createdAt: json['createdAt'] as String,
      isActive: json['isActive'] as bool? ?? true,
    );

Map<String, dynamic> _$UserModelToJson(UserModel instance) => <String, dynamic>{
      'id': instance.id,
      'email': instance.email,
      'name': instance.name,
      'walletAddress': instance.walletAddress,
      'type': instance.type,
      'createdAt': instance.createdAt,
      'isActive': instance.isActive,
    };
