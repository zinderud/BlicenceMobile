part of 'wallet_bloc.dart';

abstract class WalletState extends Equatable {
  const WalletState();

  @override
  List<Object?> get props => [];
}

class WalletInitial extends WalletState {}

class WalletLoading extends WalletState {}

class WalletLoaded extends WalletState {
  final List<Wallet> wallets;

  const WalletLoaded(this.wallets);

  @override
  List<Object?> get props => [wallets];
}

class WalletError extends WalletState {
  final String message;

  const WalletError(this.message);

  @override
  List<Object?> get props => [message];
}

class WalletCreated extends WalletState {
  final Wallet wallet;

  const WalletCreated(this.wallet);

  @override
  List<Object?> get props => [wallet];
}

class WalletUpdated extends WalletState {
  final Wallet wallet;

  const WalletUpdated(this.wallet);

  @override
  List<Object?> get props => [wallet];
}

class WalletDeleted extends WalletState {
  final String walletId;

  const WalletDeleted(this.walletId);

  @override
  List<Object?> get props => [walletId];
}

class WalletConnected extends WalletState {
  final Wallet wallet;

  const WalletConnected(this.wallet);

  @override
  List<Object?> get props => [wallet];
}

class WalletDisconnected extends WalletState {
  final String walletId;

  const WalletDisconnected(this.walletId);

  @override
  List<Object?> get props => [walletId];
}

class WalletBalanceRefreshed extends WalletState {
  final Wallet wallet;

  const WalletBalanceRefreshed(this.wallet);

  @override
  List<Object?> get props => [wallet];
}

class TransactionSent extends WalletState {
  final String transactionHash;
  final Wallet updatedWallet;

  const TransactionSent(this.transactionHash, this.updatedWallet);

  @override
  List<Object?> get props => [transactionHash, updatedWallet];
}

class TransactionHistoryLoaded extends WalletState {
  final String walletId;
  final List<Map<String, dynamic>> transactions;

  const TransactionHistoryLoaded(this.walletId, this.transactions);

  @override
  List<Object?> get props => [walletId, transactions];
}
