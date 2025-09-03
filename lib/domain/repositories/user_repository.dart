import '../entities/user.dart';

abstract class UserRepository {
  Future<User?> getCurrentUser();
  Future<User> login(String email, String password);
  Future<User> register({
    required String email,
    required String password,
    required String name,
    required UserType type,
  });
  Future<void> logout();
  Future<User> updateUser(User user);
  Future<void> deleteUser(String userId);
  Future<bool> isLoggedIn();
  Stream<User?> userStream();
}
