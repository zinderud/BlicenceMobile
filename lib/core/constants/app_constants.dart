class AppConstants {
  // App Info
  static const String appName = 'Blicence Mobile';
  static const String appVersion = '1.0.0';
  
  // Network
  static const String mainnetRpcUrl = 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID';
  static const String testnetRpcUrl = 'https://goerli.infura.io/v3/YOUR_PROJECT_ID';
  static const String polygonRpcUrl = 'https://polygon-rpc.com';
  
  // Contract Addresses (Mock addresses for now)
  static const String blicenceContractAddress = '0x742d35Cc6634C0532925a3b8D697C9bCbFD84aAe';
  static const String nftContractAddress = '0x843d35Cc6634C0532925a3b8D697C9bCbFD84bBf';
  
  // API
  static const String baseApiUrl = 'https://api.blicence.com';
  static const int apiTimeoutSeconds = 30;
  
  // Storage Keys
  static const String userTokenKey = 'user_token';
  static const String walletAddressKey = 'wallet_address';
  static const String privateKeyKey = 'private_key';
  
  // UI
  static const double borderRadius = 12.0;
  static const double cardElevation = 2.0;
  static const double buttonHeight = 48.0;
  
  // Animation Durations
  static const int shortAnimationMs = 200;
  static const int mediumAnimationMs = 400;
  static const int longAnimationMs = 800;
  
  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
  
  // File Upload
  static const int maxFileSize = 5 * 1024 * 1024; // 5MB
  static const List<String> allowedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
}

class NetworkConstants {
  static const Map<String, String> networks = {
    'ethereum': 'Ethereum Mainnet',
    'goerli': 'Goerli Testnet',
    'polygon': 'Polygon Mainnet',
    'mumbai': 'Mumbai Testnet',
  };
  
  static const Map<String, int> chainIds = {
    'ethereum': 1,
    'goerli': 5,
    'polygon': 137,
    'mumbai': 80001,
  };
}
