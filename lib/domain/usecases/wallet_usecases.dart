import '../../domain/entities/wallet.dart';
import '../../domain/repositories/wallet_repository.dart';

class GetWalletsUseCase {
  final WalletRepository repository;

  GetWalletsUseCase(this.repository);

  Future<List<Wallet>> call(String userId) async {
    if (userId.isEmpty) {
      throw Exception('User ID boş olamaz');
    }
    return await repository.getWalletsByUserId(userId);
  }
}

class CreateWalletUseCase {
  final WalletRepository repository;

  CreateWalletUseCase(this.repository);

  Future<Wallet> call(Wallet wallet) async {
    // Validate wallet data
    if (wallet.address.isEmpty) {
      throw Exception('Cüzdan adresi boş olamaz');
    }
    if (wallet.name.isEmpty) {
      throw Exception('Cüzdan adı boş olamaz');
    }
    if (wallet.userId.isEmpty) {
      throw Exception('User ID boş olamaz');
    }

    return await repository.createWallet(wallet);
  }
}

class UpdateWalletUseCase {
  final WalletRepository repository;

  UpdateWalletUseCase(this.repository);

  Future<Wallet> call(Wallet wallet) async {
    // Validate wallet data
    if (wallet.id.isEmpty) {
      throw Exception('Cüzdan ID boş olamaz');
    }
    if (wallet.address.isEmpty) {
      throw Exception('Cüzdan adresi boş olamaz');
    }

    return await repository.updateWallet(wallet);
  }
}

class DeleteWalletUseCase {
  final WalletRepository repository;

  DeleteWalletUseCase(this.repository);

  Future<void> call(String walletId) async {
    if (walletId.isEmpty) {
      throw Exception('Cüzdan ID boş olamaz');
    }

    await repository.deleteWallet(walletId);
  }
}

class ConnectWalletUseCase {
  final WalletRepository repository;

  ConnectWalletUseCase(this.repository);

  Future<Wallet> call(String walletAddress, WalletType type) async {
    if (walletAddress.isEmpty) {
      throw Exception('Cüzdan adresi boş olamaz');
    }

    return await repository.connectWallet(walletAddress, type);
  }
}

class SendTransactionUseCase {
  final WalletRepository repository;

  SendTransactionUseCase(this.repository);

  Future<TransactionResult> call({
    required String fromWalletId,
    required String toAddress,
    required double amount,
    String? memo,
  }) async {
    // Validate transaction data
    if (fromWalletId.isEmpty) {
      throw Exception('Gönderen cüzdan ID boş olamaz');
    }
    if (toAddress.isEmpty) {
      throw Exception('Alıcı adresi boş olamaz');
    }
    if (amount <= 0) {
      throw Exception('Miktar sıfırdan büyük olmalıdır');
    }

    return await repository.sendTransaction(
      fromWalletId: fromWalletId,
      toAddress: toAddress,
      amount: amount,
      memo: memo,
    );
  }
}

class GetTransactionHistoryUseCase {
  final WalletRepository repository;

  GetTransactionHistoryUseCase(this.repository);

  Future<List<Map<String, dynamic>>> call(String walletId) async {
    if (walletId.isEmpty) {
      throw Exception('Cüzdan ID boş olamaz');
    }

    return await repository.getTransactionHistory(walletId);
  }
}

class TransactionResult {
  final String transactionHash;
  final Wallet updatedWallet;

  TransactionResult({
    required this.transactionHash,
    required this.updatedWallet,
  });
}
