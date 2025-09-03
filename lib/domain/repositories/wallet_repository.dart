import '../entities/wallet.dart';
import '../usecases/wallet_usecases.dart';

abstract class WalletRepository {
  Future<Wallet?> getConnectedWallet();
  Future<List<Wallet>> getWalletsByUserId(String userId);
  Future<Wallet> connectWallet(WalletType type);
  Future<Wallet> createWallet(Wallet wallet);
  Future<Wallet> updateWallet(Wallet wallet);
  Future<void> deleteWallet(String walletId);
  Future<void> disconnectWallet();
  Future<double> getBalance(String address);
  Future<double> getWalletBalance(String walletId);
  Future<List<Token>> getTokens(String address);
  Future<String> sendTransaction({
    required String to,
    required double amount,
    String? data,
  });
  Future<TransactionResult> sendTransactionAdvanced({
    required String fromWalletId,
    required String toAddress,
    required double amount,
    String? memo,
  });
  Future<List<Map<String, dynamic>>> getTransactionHistory(String walletId);
  Future<Wallet> getWalletById(String walletId);
  Future<bool> isWalletConnected();
  Stream<Wallet?> walletStream();
}
