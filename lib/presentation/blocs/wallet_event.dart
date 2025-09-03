part of 'wallet_bloc.dart';

abstract class WalletEvent extends Equatable {
  const WalletEvent();

  @override
  List<Object?> get props => [];
}

class LoadWallets extends WalletEvent {
  final String userId;

  const LoadWallets(this.userId);

  @override
  List<Object?> get props => [userId];
}

class CreateWallet extends WalletEvent {
  final Wallet wallet;

  const CreateWallet(this.wallet);

  @override
  List<Object?> get props => [wallet];
}

class UpdateWallet extends WalletEvent {
  final Wallet wallet;

  const UpdateWallet(this.wallet);

  @override
  List<Object?> get props => [wallet];
}

class DeleteWallet extends WalletEvent {
  final String walletId;

  const DeleteWallet(this.walletId);

  @override
  List<Object?> get props => [walletId];
}

class ConnectWallet extends WalletEvent {
  final String walletAddress;
  final WalletType type;

  const ConnectWallet(this.walletAddress, this.type);

  @override
  List<Object?> get props => [walletAddress, type];
}

class DisconnectWallet extends WalletEvent {
  final String walletId;

  const DisconnectWallet(this.walletId);

  @override
  List<Object?> get props => [walletId];
}

class RefreshWalletBalance extends WalletEvent {
  final String walletId;

  const RefreshWalletBalance(this.walletId);

  @override
  List<Object?> get props => [walletId];
}

class SendTransaction extends WalletEvent {
  final String fromWalletId;
  final String toAddress;
  final double amount;
  final String? memo;

  const SendTransaction({
    required this.fromWalletId,
    required this.toAddress,
    required this.amount,
    this.memo,
  });

  @override
  List<Object?> get props => [fromWalletId, toAddress, amount, memo];
}

class LoadTransactionHistory extends WalletEvent {
  final String walletId;

  const LoadTransactionHistory(this.walletId);

  @override
  List<Object?> get props => [walletId];
}
