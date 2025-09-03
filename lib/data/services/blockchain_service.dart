import 'package:web3dart/web3dart.dart';
import 'package:http/http.dart';
import '../../domain/entities/plan.dart';
import '../../domain/entities/customer_plan.dart';
import '../../domain/entities/producer.dart';
import '../../domain/entities/plan_info.dart';

/// Blicontract smart kontratları ile etkileşim servisi
class BlockchainService {
  late final Web3Client _client;
  late final EthPrivateKey _credentials;
  
  // Contract addresses - Bunları gerçek deployment adresleriniz ile değiştirin
  late final EthereumAddress _factoryAddress;
  late final EthereumAddress _uriGeneratorAddress;
  late final EthereumAddress _producerStorageAddress;
  
  // Contract ABIs - Bu örnekler gerçek ABI'larınız ile değiştirilmeli
  late final DeployedContract _factoryContract;
  late final DeployedContract _producerContract;
  
  BlockchainService._();
  
  static BlockchainService? _instance;
  static BlockchainService get instance {
    _instance ??= BlockchainService._();
    return _instance!;
  }

  /// Blockchain service'i başlat
  Future<void> initialize({
    required String rpcUrl,
    required String privateKey,
    required String factoryAddress,
    required String uriGeneratorAddress,
    required String producerStorageAddress,
  }) async {
    _client = Web3Client(rpcUrl, Client());
    _credentials = EthPrivateKey.fromHex(privateKey);
    
    _factoryAddress = EthereumAddress.fromHex(factoryAddress);
    _uriGeneratorAddress = EthereumAddress.fromHex(uriGeneratorAddress);
    _producerStorageAddress = EthereumAddress.fromHex(producerStorageAddress);
    
    await _loadContracts();
  }

  /// Contract ABI'larını yükle
  Future<void> _loadContracts() async {
    // Factory contract ABI - Gerçek ABI'nız ile değiştirin
    const factoryAbi = '''[
      {
        "type": "function",
        "name": "newBcontract",
        "inputs": [
          {
            "name": "producer",
            "type": "tuple",
            "components": [
              {"name": "producerId", "type": "uint256"},
              {"name": "producerAddress", "type": "address"},
              {"name": "name", "type": "string"},
              {"name": "description", "type": "string"},
              {"name": "image", "type": "string"},
              {"name": "externalLink", "type": "string"},
              {"name": "cloneAddress", "type": "address"},
              {"name": "exists", "type": "bool"}
            ]
          }
        ],
        "outputs": [{"name": "", "type": "address"}]
      }
    ]''';
    
    // Producer contract ABI - Gerçek ABI'nız ile değiştirin
    const producerAbi = '''[
      {
        "type": "function",
        "name": "addPlan",
        "inputs": [
          {
            "name": "plan",
            "type": "tuple",
            "components": [
              {"name": "planId", "type": "uint256"},
              {"name": "cloneAddress", "type": "address"},
              {"name": "producerId", "type": "uint256"},
              {"name": "name", "type": "string"},
              {"name": "description", "type": "string"},
              {"name": "externalLink", "type": "string"},
              {"name": "totalSupply", "type": "int256"},
              {"name": "currentSupply", "type": "int256"},
              {"name": "backgroundColor", "type": "string"},
              {"name": "image", "type": "string"},
              {"name": "priceAddress", "type": "address"},
              {"name": "startDate", "type": "uint32"},
              {"name": "status", "type": "uint8"},
              {"name": "planType", "type": "uint8"},
              {"name": "custumerPlanIds", "type": "uint256[]"}
            ]
          }
        ],
        "outputs": []
      },
      {
        "type": "function",
        "name": "addCustomerPlan",
        "inputs": [
          {
            "name": "customerPlan",
            "type": "tuple",
            "components": [
              {"name": "customerAdress", "type": "address"},
              {"name": "planId", "type": "uint256"},
              {"name": "custumerPlanId", "type": "uint256"},
              {"name": "producerId", "type": "uint256"},
              {"name": "cloneAddress", "type": "address"},
              {"name": "priceAddress", "type": "address"},
              {"name": "startDate", "type": "uint32"},
              {"name": "endDate", "type": "uint32"},
              {"name": "remainingQuota", "type": "uint256"},
              {"name": "status", "type": "uint8"},
              {"name": "planType", "type": "uint8"}
            ]
          }
        ],
        "outputs": []
      }
    ]''';
    
    _factoryContract = DeployedContract(
      ContractAbi.fromJson(factoryAbi, 'Factory'),
      _factoryAddress,
    );
    
    // Producer contract - Bu dinamik olarak clone address ile oluşturulur
    _producerContract = DeployedContract(
      ContractAbi.fromJson(producerAbi, 'Producer'),
      EthereumAddress.fromHex('0x0000000000000000000000000000000000000000'), // Placeholder
    );
  }

  /// Yeni Producer kontratı oluştur (Factory.newBcontract)
  Future<String> createProducer(Producer producer) async {
    final function = _factoryContract.function('newBcontract');
    
    final producerStruct = [
      BigInt.from(producer.producerId),
      EthereumAddress.fromHex(producer.producerAddress),
      producer.name,
      producer.description,
      producer.image,
      producer.externalLink,
      EthereumAddress.fromHex(producer.cloneAddress.isEmpty ? '0x0000000000000000000000000000000000000000' : producer.cloneAddress),
      producer.exists,
    ];
    
    final transaction = Transaction.callContract(
      contract: _factoryContract,
      function: function,
      parameters: [producerStruct],
    );
    
    final result = await _client.sendTransaction(
      _credentials,
      transaction,
      chainId: 1, // Mainnet chain ID - Kendi networkunuz için değiştirin
    );
    
    return result;
  }

  /// Plan oluştur (Producer.addPlan)
  Future<String> createPlan(String producerCloneAddress, Plan plan) async {
    final producerContract = DeployedContract(
      _producerContract.abi,
      EthereumAddress.fromHex(producerCloneAddress),
    );
    
    final function = producerContract.function('addPlan');
    
    final planStruct = [
      BigInt.from(plan.planId),
      EthereumAddress.fromHex(plan.cloneAddress),
      BigInt.from(plan.producerId),
      plan.name,
      plan.description,
      plan.externalLink,
      BigInt.from(plan.totalSupply),
      BigInt.from(plan.currentSupply),
      plan.backgroundColor,
      plan.image,
      EthereumAddress.fromHex(plan.priceAddress),
      BigInt.from(plan.startDate.millisecondsSinceEpoch ~/ 1000),
      BigInt.from(plan.status.index),
      BigInt.from(plan.planType.index),
      plan.customerPlanIds.map((id) => BigInt.from(id)).toList(),
    ];
    
    final transaction = Transaction.callContract(
      contract: producerContract,
      function: function,
      parameters: [planStruct],
    );
    
    final result = await _client.sendTransaction(
      _credentials,
      transaction,
      chainId: 1,
    );
    
    return result;
  }

  /// Müşteri plan satın al (Producer.addCustomerPlan)
  Future<String> purchasePlan(
    String producerCloneAddress, 
    CustomerPlan customerPlan,
  ) async {
    final producerContract = DeployedContract(
      _producerContract.abi,
      EthereumAddress.fromHex(producerCloneAddress),
    );
    
    final function = producerContract.function('addCustomerPlan');
    
    final customerPlanStruct = [
      EthereumAddress.fromHex(customerPlan.customerAddress),
      BigInt.from(customerPlan.planId),
      BigInt.from(customerPlan.customerPlanId),
      BigInt.from(customerPlan.producerId),
      EthereumAddress.fromHex(customerPlan.cloneAddress),
      EthereumAddress.fromHex(customerPlan.priceAddress),
      BigInt.from(customerPlan.startDate.millisecondsSinceEpoch ~/ 1000),
      BigInt.from(customerPlan.endDate.millisecondsSinceEpoch ~/ 1000),
      BigInt.from(customerPlan.remainingQuota),
      BigInt.from(customerPlan.status.index),
      BigInt.from(customerPlan.planType.index),
    ];
    
    final transaction = Transaction.callContract(
      contract: producerContract,
      function: function,
      parameters: [customerPlanStruct],
    );
    
    final result = await _client.sendTransaction(
      _credentials,
      transaction,
      chainId: 1,
    );
    
    return result;
  }

  /// Token onayı ver (ERC20.approve)
  Future<String> approveToken(
    String tokenAddress,
    String spenderAddress,
    BigInt amount,
  ) async {
    const erc20Abi = '''[
      {
        "type": "function",
        "name": "approve",
        "inputs": [
          {"name": "spender", "type": "address"},
          {"name": "amount", "type": "uint256"}
        ],
        "outputs": [{"name": "", "type": "bool"}]
      }
    ]''';
    
    final tokenContract = DeployedContract(
      ContractAbi.fromJson(erc20Abi, 'ERC20'),
      EthereumAddress.fromHex(tokenAddress),
    );
    
    final function = tokenContract.function('approve');
    
    final transaction = Transaction.callContract(
      contract: tokenContract,
      function: function,
      parameters: [
        EthereumAddress.fromHex(spenderAddress),
        amount,
      ],
    );
    
    final result = await _client.sendTransaction(
      _credentials,
      transaction,
      chainId: 1,
    );
    
    return result;
  }

  /// Token bakiyesi kontrol et (ERC20.balanceOf)
  Future<BigInt> getTokenBalance(String tokenAddress, String userAddress) async {
    const erc20Abi = '''[
      {
        "type": "function",
        "name": "balanceOf",
        "inputs": [{"name": "account", "type": "address"}],
        "outputs": [{"name": "", "type": "uint256"}]
      }
    ]''';
    
    final tokenContract = DeployedContract(
      ContractAbi.fromJson(erc20Abi, 'ERC20'),
      EthereumAddress.fromHex(tokenAddress),
    );
    
    final function = tokenContract.function('balanceOf');
    
    final result = await _client.call(
      contract: tokenContract,
      function: function,
      params: [EthereumAddress.fromHex(userAddress)],
    );
    
    return result.first as BigInt;
  }

  /// Transaction durumunu kontrol et
  Future<TransactionReceipt?> getTransactionReceipt(String txHash) async {
    return await _client.getTransactionReceipt(txHash);
  }

  /// Mevcut gas fiyatını al
  Future<EtherAmount> getGasPrice() async {
    return await _client.getGasPrice();
  }

  /// Hesap bakiyesini al (ETH)
  Future<EtherAmount> getBalance(String address) async {
    return await _client.getBalance(EthereumAddress.fromHex(address));
  }

  /// Service'i kapat
  void dispose() {
    _client.dispose();
  }
}

/// Blockchain işlemlerinde kullanılacak yardımcı sınıflar
class BlockchainConfig {
  static const String mainnetRpcUrl = 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID';
  static const String goerliRpcUrl = 'https://goerli.infura.io/v3/YOUR_PROJECT_ID';
  static const String polygonRpcUrl = 'https://polygon-rpc.com';
  
  // Contract addresses - Gerçek deployment adresleriniz ile değiştirin
  static const String factoryAddress = '0x...';
  static const String uriGeneratorAddress = '0x...';
  static const String producerStorageAddress = '0x...';
  
  // Token addresses
  static const String usdcAddress = '0xA0b86a33E6441c66a8b7b6a3C83BF6C0A39C62E7'; // USDC
  static const String usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // USDT
}

/// Blockchain işlem durumları
enum TransactionStatus {
  pending,
  success,
  failed,
  unknown,
}

/// Blockchain hata türleri
class BlockchainException implements Exception {
  final String message;
  final String? code;
  final dynamic originalError;

  const BlockchainException(
    this.message, {
    this.code,
    this.originalError,
  });

  @override
  String toString() => 'BlockchainException: $message ${code != null ? '($code)' : ''}';
}
