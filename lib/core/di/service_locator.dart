import 'package:get_it/get_it.dart';
import '../../data/services/blockchain_service.dart';
import '../../data/datasources/local/local_storage_service.dart';
import '../../data/repositories/user_repository_impl.dart';
import '../../data/repositories/plan_repository_impl.dart';
import '../../domain/repositories/user_repository.dart';
import '../../domain/repositories/plan_repository.dart';
import '../../presentation/blocs/auth/auth_bloc.dart';
import '../../presentation/blocs/plan/plan_bloc.dart';
import '../services/firebase/firebase_service.dart';

final GetIt sl = GetIt.instance;

Future<void> initializeDependencies() async {
  // Services
  sl.registerLazySingleton<LocalStorageService>(() => LocalStorageService());
  sl.registerLazySingleton<BlockchainService>(() => BlockchainService.instance);
  sl.registerLazySingleton<FirebaseService>(() => FirebaseService());

    // Repositories
  sl.registerLazySingleton<UserRepository>(
    () => UserRepositoryImpl(localStorageService: sl<LocalStorageService>()),
  );

  sl.registerLazySingleton<PlanRepository>(
    () => PlanRepositoryImpl(localStorage: sl<LocalStorageService>()),
  );

  // BLoCs
  sl.registerFactory<AuthBloc>(
    () => AuthBloc(userRepository: sl<UserRepository>()),
  );

  sl.registerFactory<PlanBloc>(
    () => PlanBloc(planRepository: sl<PlanRepository>()),
  );
}

Future<void> initializeBlockchain({
  required String rpcUrl,
  required String privateKey,
  required String factoryAddress,
  required String uriGeneratorAddress,
  required String producerStorageAddress,
}) async {
  await sl<BlockchainService>().initialize(
    rpcUrl: rpcUrl,
    privateKey: privateKey,
    factoryAddress: factoryAddress,
    uriGeneratorAddress: uriGeneratorAddress,
    producerStorageAddress: producerStorageAddress,
  );
}
