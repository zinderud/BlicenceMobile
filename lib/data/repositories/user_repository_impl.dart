import '../../domain/entities/user.dart';
import '../../domain/repositories/user_repository.dart';
import '../datasources/local/local_storage_service.dart';
import '../models/user_model.dart';

class UserRepositoryImpl implements UserRepository {
  final LocalStorageService localStorageService;

  UserRepositoryImpl({required this.localStorageService});

  @override
  Future<User?> getCurrentUser() async {
    try {
      final userMap = await localStorageService.getUser();
      if (userMap != null) {
        return UserModel.fromJson(userMap).toEntity();
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  @override
  Future<User> login(String email, String password) async {
    // Simulated login - In real app, this would call API
    await Future.delayed(const Duration(seconds: 1));
    
    // Mock user data
    final user = User(
      id: 'user_123',
      email: email,
      name: email.split('@')[0],
      walletAddress: '0x742d35Cc6634C0532925a3b8D697C9bCbFD84aAe',
      type: email.contains('producer') ? UserType.producer : UserType.customer,
      createdAt: DateTime.now(),
    );

    // Save to local storage
    await localStorageService.saveUser(UserModel.fromEntity(user).toJson());
    
    return user;
  }

  @override
  Future<User> register({
    required String email,
    required String password,
    required String name,
    required UserType type,
  }) async {
    // Simulated registration - In real app, this would call API
    await Future.delayed(const Duration(seconds: 1));
    
    final user = User(
      id: 'user_${DateTime.now().millisecondsSinceEpoch}',
      email: email,
      name: name,
      walletAddress: _generateWalletAddress(),
      type: type,
      createdAt: DateTime.now(),
    );

    // Save to local storage
    await localStorageService.saveUser(UserModel.fromEntity(user).toJson());
    
    return user;
  }

  @override
  Future<void> logout() async {
    await localStorageService.clearUser();
  }

  @override
  Future<User> updateUser(User user) async {
    await localStorageService.saveUser(UserModel.fromEntity(user).toJson());
    return user;
  }

  @override
  Future<void> deleteUser(String userId) async {
    await localStorageService.clearUser();
  }

  @override
  Future<bool> isLoggedIn() async {
    final user = await getCurrentUser();
    return user != null;
  }

  @override
  Stream<User?> userStream() async* {
    while (true) {
      yield await getCurrentUser();
      await Future.delayed(const Duration(seconds: 5));
    }
  }

  String _generateWalletAddress() {
    // Generate a mock wallet address
    return '0x742d35Cc6634C0532925a3b8D697C9bCbFD84aAe';
  }
}
