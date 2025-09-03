import 'package:web3dart/web3dart.dart';
import 'package:http/http.dart' as http;
import '../../../core/constants/app_constants.dart';

class BlockchainDataSource {
  late Web3Client _web3Client;
  late EthereumAddress _blicenceContractAddress;
  late EthereumAddress _nftContractAddress;

  bool _isInitialized = false;

  Web3Client get web3Client => _web3Client;
  EthereumAddress get blicenceContractAddress => _blicenceContractAddress;
  EthereumAddress get nftContractAddress => _nftContractAddress;
  bool get isInitialized => _isInitialized;

  Future<void> initialize({
    required String rpcUrl,
    required String blicenceContractAddress,
    required String nftContractAddress,
  }) async {
    try {
      _web3Client = Web3Client(rpcUrl, http.Client());

      _blicenceContractAddress = EthereumAddress.fromHex(blicenceContractAddress);
      _nftContractAddress = EthereumAddress.fromHex(nftContractAddress);

      _isInitialized = true;
      print('✅ Blockchain initialized successfully');
      print('📍 RPC URL: $rpcUrl');
      print('🏠 Blicence Contract: $blicenceContractAddress');
      print('🎨 NFT Contract: $nftContractAddress');
    } catch (e) {
      print('❌ Failed to initialize blockchain: $e');
      rethrow;
    }
  }

  Future<String> getNetworkName() async {
    if (!_isInitialized) throw Exception('Blockchain not initialized');

    final chainId = await _web3Client.getChainId();
    switch (chainId.toInt()) {
      case 1:
        return 'Ethereum Mainnet';
      case 5:
        return 'Goerli Testnet';
      case 137:
        return 'Polygon Mainnet';
      case 80001:
        return 'Polygon Mumbai';
      default:
        return 'Unknown Network ($chainId)';
    }
  }

  Future<BigInt> getGasPrice() async {
    if (!_isInitialized) throw Exception('Blockchain not initialized');
    return await _web3Client.getGasPrice();
  }

  Future<EtherAmount> getBalance(String address) async {
    if (!_isInitialized) throw Exception('Blockchain not initialized');

    final ethAddress = EthereumAddress.fromHex(address);
    return await _web3Client.getBalance(ethAddress);
  }

  Future<String> sendTransaction({
    required String privateKey,
    required String to,
    required EtherAmount amount,
    String? data,
  }) async {
    if (!_isInitialized) throw Exception('Blockchain not initialized');

    final credentials = EthPrivateKey.fromHex(privateKey);
    final toAddress = EthereumAddress.fromHex(to);

    final transaction = Transaction(
      to: toAddress,
      value: amount,
      data: data != null ? Uint8List.fromList(hex.decode(data)) : null,
    );

    final txHash = await _web3Client.sendTransaction(
      credentials,
      transaction,
      chainId: await _web3Client.getChainId(),
    );

    print('📤 Transaction sent: $txHash');
    return txHash;
  }

  Future<TransactionReceipt?> getTransactionReceipt(String txHash) async {
    if (!_isInitialized) throw Exception('Blockchain not initialized');
    return await _web3Client.getTransactionReceipt(txHash);
  }

  Future<TransactionInformation?> getTransactionByHash(String txHash) async {
    if (!_isInitialized) throw Exception('Blockchain not initialized');
    return await _web3Client.getTransactionByHash(txHash);
  }

  Future<int> getBlockNumber() async {
    if (!_isInitialized) throw Exception('Blockchain not initialized');
    return await _web3Client.getBlockNumber();
  }

  void dispose() {
    _web3Client.dispose();
    _isInitialized = false;
  }
}
