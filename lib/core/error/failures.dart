import 'package:equatable/equatable.dart';

/// Base failure class for all domain failures
abstract class Failure extends Equatable {
  final String message;
  final String? code;

  const Failure({required this.message, this.code});

  @override
  List<Object?> get props => [message, code];
}

/// Network related failures
class NetworkFailure extends Failure {
  const NetworkFailure({required super.message, super.code});
}

class ServerFailure extends Failure {
  const ServerFailure({required super.message, super.code});
}

class TimeoutFailure extends Failure {
  const TimeoutFailure({required super.message, super.code});
}

/// Authentication related failures
class AuthFailure extends Failure {
  const AuthFailure({required super.message, super.code});
}

class UnauthorizedFailure extends Failure {
  const UnauthorizedFailure({required super.message, super.code});
}

/// Blockchain related failures
class BlockchainFailure extends Failure {
  const BlockchainFailure({required super.message, super.code});
}

class ContractFailure extends Failure {
  const ContractFailure({required super.message, super.code});
}

class TransactionFailure extends Failure {
  const TransactionFailure({required super.message, super.code});
}

/// Local storage related failures
class StorageFailure extends Failure {
  const StorageFailure({required super.message, super.code});
}

/// Validation related failures
class ValidationFailure extends Failure {
  const ValidationFailure({required super.message, super.code});
}

/// Unknown failures
class UnknownFailure extends Failure {
  const UnknownFailure({required super.message, super.code});
}

/// Extension methods for handling failures
extension FailureExtension on Failure {
  bool get isNetworkFailure => this is NetworkFailure;
  bool get isAuthFailure => this is AuthFailure;
  bool get isBlockchainFailure => this is BlockchainFailure;
  bool get isStorageFailure => this is StorageFailure;
  bool get isValidationFailure => this is ValidationFailure;
}

/// Utility class for handling exceptions
class FailureHandler {
  static Failure handleException(dynamic exception) {
    if (exception is Exception) {
      // Handle Dio exceptions
      if (exception.toString().contains('DioException')) {
        return NetworkFailure(
          message: 'Network connection failed. Please check your internet connection.',
          code: 'NETWORK_ERROR',
        );
      }

      // Handle Web3Dart exceptions
      if (exception.toString().contains('RPCError')) {
        return BlockchainFailure(
          message: 'Blockchain network error. Please try again.',
          code: 'BLOCKCHAIN_ERROR',
        );
      }

      // Handle Hive exceptions
      if (exception.toString().contains('HiveError')) {
        return StorageFailure(
          message: 'Local storage error. Please restart the app.',
          code: 'STORAGE_ERROR',
        );
      }
    }

    // Handle string errors
    if (exception is String) {
      return UnknownFailure(
        message: exception,
        code: 'UNKNOWN_ERROR',
      );
    }

    return UnknownFailure(
      message: 'An unexpected error occurred. Please try again.',
      code: 'UNKNOWN_ERROR',
    );
  }

  static String getErrorMessage(Failure failure) {
    return failure.message;
  }

  static String? getErrorCode(Failure failure) {
    return failure.code;
  }
}
