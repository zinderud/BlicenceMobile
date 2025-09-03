import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../domain/entities/wallet.dart';
import '../../domain/usecases/wallet_usecases.dart';

part 'wallet_event.dart';
part 'wallet_state.dart';

class WalletBloc extends Bloc<WalletEvent, WalletState> {
  final GetWalletsUseCase _getWalletsUseCase;
  final CreateWalletUseCase _createWalletUseCase;
  final UpdateWalletUseCase _updateWalletUseCase;
  final DeleteWalletUseCase _deleteWalletUseCase;
  final ConnectWalletUseCase _connectWalletUseCase;
  final SendTransactionUseCase _sendTransactionUseCase;
  final GetTransactionHistoryUseCase _getTransactionHistoryUseCase;

  WalletBloc({
    required GetWalletsUseCase getWalletsUseCase,
    required CreateWalletUseCase createWalletUseCase,
    required UpdateWalletUseCase updateWalletUseCase,
    required DeleteWalletUseCase deleteWalletUseCase,
    required ConnectWalletUseCase connectWalletUseCase,
    required SendTransactionUseCase sendTransactionUseCase,
    required GetTransactionHistoryUseCase getTransactionHistoryUseCase,
  })  : _getWalletsUseCase = getWalletsUseCase,
        _createWalletUseCase = createWalletUseCase,
        _updateWalletUseCase = updateWalletUseCase,
        _deleteWalletUseCase = deleteWalletUseCase,
        _connectWalletUseCase = connectWalletUseCase,
        _sendTransactionUseCase = sendTransactionUseCase,
        _getTransactionHistoryUseCase = getTransactionHistoryUseCase,
        super(WalletInitial()) {
    on<LoadWallets>(_onLoadWallets);
    on<CreateWallet>(_onCreateWallet);
    on<UpdateWallet>(_onUpdateWallet);
    on<DeleteWallet>(_onDeleteWallet);
    on<ConnectWallet>(_onConnectWallet);
    on<DisconnectWallet>(_onDisconnectWallet);
    on<RefreshWalletBalance>(_onRefreshWalletBalance);
    on<SendTransaction>(_onSendTransaction);
    on<LoadTransactionHistory>(_onLoadTransactionHistory);
  }

  Future<void> _onLoadWallets(
    LoadWallets event,
    Emitter<WalletState> emit,
  ) async {
    emit(WalletLoading());
    try {
      final wallets = await _getWalletsUseCase(event.userId);
      emit(WalletLoaded(wallets));
    } catch (e) {
      emit(WalletError(e.toString()));
    }
  }

  Future<void> _onCreateWallet(
    CreateWallet event,
    Emitter<WalletState> emit,
  ) async {
    emit(WalletLoading());
    try {
      final wallet = await _createWalletUseCase(event.wallet);
      emit(WalletCreated(wallet));
    } catch (e) {
      emit(WalletError(e.toString()));
    }
  }

  Future<void> _onUpdateWallet(
    UpdateWallet event,
    Emitter<WalletState> emit,
  ) async {
    emit(WalletLoading());
    try {
      final wallet = await _updateWalletUseCase(event.wallet);
      emit(WalletUpdated(wallet));
    } catch (e) {
      emit(WalletError(e.toString()));
    }
  }

  Future<void> _onDeleteWallet(
    DeleteWallet event,
    Emitter<WalletState> emit,
  ) async {
    emit(WalletLoading());
    try {
      await _deleteWalletUseCase(event.walletId);
      emit(WalletDeleted(event.walletId));
    } catch (e) {
      emit(WalletError(e.toString()));
    }
  }

  Future<void> _onConnectWallet(
    ConnectWallet event,
    Emitter<WalletState> emit,
  ) async {
    emit(WalletLoading());
    try {
      final wallet = await _connectWalletUseCase(event.walletAddress, event.type);
      emit(WalletConnected(wallet));
    } catch (e) {
      emit(WalletError(e.toString()));
    }
  }

  Future<void> _onDisconnectWallet(
    DisconnectWallet event,
    Emitter<WalletState> emit,
  ) async {
    emit(WalletLoading());
    try {
      await _deleteWalletUseCase(event.walletId);
      emit(WalletDisconnected(event.walletId));
    } catch (e) {
      emit(WalletError(e.toString()));
    }
  }

  Future<void> _onRefreshWalletBalance(
    RefreshWalletBalance event,
    Emitter<WalletState> emit,
  ) async {
    emit(WalletLoading());
    try {
      // Refresh wallet balance logic here
      // For now, emit a mock updated wallet
      emit(WalletError('Bakiye yenileme henüz implementasyonda'));
    } catch (e) {
      emit(WalletError(e.toString()));
    }
  }

  Future<void> _onSendTransaction(
    SendTransaction event,
    Emitter<WalletState> emit,
  ) async {
    emit(WalletLoading());
    try {
      final result = await _sendTransactionUseCase(
        fromWalletId: event.fromWalletId,
        toAddress: event.toAddress,
        amount: event.amount,
        memo: event.memo,
      );
      emit(TransactionSent(result.transactionHash, result.updatedWallet));
    } catch (e) {
      emit(WalletError(e.toString()));
    }
  }

  Future<void> _onLoadTransactionHistory(
    LoadTransactionHistory event,
    Emitter<WalletState> emit,
  ) async {
    emit(WalletLoading());
    try {
      final transactions = await _getTransactionHistoryUseCase(event.walletId);
      emit(TransactionHistoryLoaded(event.walletId, transactions));
    } catch (e) {
      emit(WalletError(e.toString()));
    }
  }
}
