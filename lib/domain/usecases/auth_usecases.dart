import '../entities/user.dart';
import '../repositories/user_repository.dart';

class LoginUseCase {
  final UserRepository repository;

  LoginUseCase(this.repository);

  Future<User> call(String email, String password) async {
    if (email.isEmpty || password.isEmpty) {
      throw Exception('Email ve şifre boş olamaz');
    }

    if (!_isValidEmail(email)) {
      throw Exception('Geçersiz email formatı');
    }

    return await repository.login(email, password);
  }

  bool _isValidEmail(String email) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }
}

class RegisterUseCase {
  final UserRepository repository;

  RegisterUseCase(this.repository);

  Future<User> call({
    required String email,
    required String password,
    required String name,
    required UserType type,
  }) async {
    if (email.isEmpty || password.isEmpty || name.isEmpty) {
      throw Exception('Tüm alanlar doldurulmalıdır');
    }

    if (!_isValidEmail(email)) {
      throw Exception('Geçersiz email formatı');
    }

    if (password.length < 6) {
      throw Exception('Şifre en az 6 karakter olmalıdır');
    }

    return await repository.register(
      email: email,
      password: password,
      name: name,
      type: type,
    );
  }

  bool _isValidEmail(String email) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }
}

class LogoutUseCase {
  final UserRepository repository;

  LogoutUseCase(this.repository);

  Future<void> call() async {
    await repository.logout();
  }
}

class GetCurrentUserUseCase {
  final UserRepository repository;

  GetCurrentUserUseCase(this.repository);

  Future<User?> call() async {
    return await repository.getCurrentUser();
  }
}
