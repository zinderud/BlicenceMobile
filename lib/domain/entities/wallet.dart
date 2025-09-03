import 'package:equatable/equatable.dart';

class Wallet extends Equatable {
  final String address;
  final String privateKey;
  final double balance;
  final String network;
  final List<Token> tokens;
  final bool isConnected;
  final WalletType type;

  const Wallet({
    required this.address,
    required this.privateKey,
    required this.balance,
    required this.network,
    required this.tokens,
    this.isConnected = false,
    this.type = WalletType.metamask,
  });

  @override
  List<Object?> get props => [
        address,
        privateKey,
        balance,
        network,
        tokens,
        isConnected,
        type,
      ];

  Wallet copyWith({
    String? address,
    String? privateKey,
    double? balance,
    String? network,
    List<Token>? tokens,
    bool? isConnected,
    WalletType? type,
  }) {
    return Wallet(
      address: address ?? this.address,
      privateKey: privateKey ?? this.privateKey,
      balance: balance ?? this.balance,
      network: network ?? this.network,
      tokens: tokens ?? this.tokens,
      isConnected: isConnected ?? this.isConnected,
      type: type ?? this.type,
    );
  }
}

class Token extends Equatable {
  final String address;
  final String symbol;
  final String name;
  final int decimals;
  final double balance;

  const Token({
    required this.address,
    required this.symbol,
    required this.name,
    required this.decimals,
    required this.balance,
  });

  @override
  List<Object?> get props => [address, symbol, name, decimals, balance];
}

enum WalletType {
  metamask,
  walletConnect,
  injected,
}
