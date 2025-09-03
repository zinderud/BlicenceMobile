import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/utils/helpers.dart';

class WalletConnectionScreen extends StatefulWidget {
  const WalletConnectionScreen({super.key});

  @override
  State<WalletConnectionScreen> createState() => _WalletConnectionScreenState();
}

class _WalletConnectionScreenState extends State<WalletConnectionScreen> {
  String? _walletAddress;
  String? _balance;
  bool _isConnecting = false;
  bool _isConnected = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Wallet Bağlantısı'),
        backgroundColor: Theme.of(context).primaryColor,
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Blockchain Cüzdanı',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Ethereum cüzdanınızı bağlayarak blockchain işlemlerini gerçekleştirin',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
            const SizedBox(height: 32),

            // Connection Status Card
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  children: [
                    Icon(
                      _isConnected ? Icons.account_balance_wallet : Icons.account_balance_wallet_outlined,
                      size: 48,
                      color: _isConnected ? Colors.green : Colors.grey,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _isConnected ? 'Cüzdan Bağlandı' : 'Cüzdan Bağlı Değil',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: _isConnected ? Colors.green : Colors.grey,
                      ),
                    ),
                    if (_walletAddress != null) ...[
                      const SizedBox(height: 8),
                      Text(
                        'Adres: ${StringUtils.truncate(_walletAddress!, 20)}',
                        style: const TextStyle(fontSize: 14, color: Colors.grey),
                      ),
                    ],
                    if (_balance != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        'Bakiye: $_balance ETH',
                        style: const TextStyle(fontSize: 14, color: Colors.grey),
                      ),
                    ],
                  ],
                ),
              ),
            ),

            const SizedBox(height: 32),

            // Action Buttons
            if (!_isConnected) ...[
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _isConnecting ? null : _connectWallet,
                  icon: _isConnecting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.link),
                  label: Text(_isConnecting ? 'Bağlanıyor...' : 'Cüzdan Bağla'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: _createWallet,
                  icon: const Icon(Icons.add),
                  label: const Text('Yeni Cüzdan Oluştur'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
            ] else ...[
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _disconnectWallet,
                  icon: const Icon(Icons.link_off),
                  label: const Text('Cüzdanı Bağlantıyı Kes'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    backgroundColor: Colors.red,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
            ],

            const SizedBox(height: 32),

            // Network Info
            const Text(
              'Ağ Bilgileri',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Card(
              elevation: 2,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    _buildNetworkInfo('Ağ', 'Polygon Mainnet'),
                    _buildNetworkInfo('RPC URL', AppConstants.polygonRpcUrl),
                    _buildNetworkInfo('Chain ID', '137'),
                    _buildNetworkInfo('Currency', 'MATIC'),
                  ],
                ),
              ),
            ),

            const Spacer(),

            // Info Text
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.blue.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.blue.withOpacity(0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline, color: Colors.blue),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'MetaMask, Trust Wallet veya WalletConnect destekli cüzdanlar ile bağlanabilirsiniz.',
                      style: TextStyle(color: Colors.blue),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNetworkInfo(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(fontWeight: FontWeight.w500),
          ),
          Text(
            value,
            style: const TextStyle(color: Colors.grey),
          ),
        ],
      ),
    );
  }

  Future<void> _connectWallet() async {
    setState(() {
      _isConnecting = true;
    });

    try {
      // Simulate wallet connection
      await Future.delayed(const Duration(seconds: 2));

      // Mock wallet data
      setState(() {
        _walletAddress = '0x742d35Cc6634C0532925a3b8D697C9bCbFD84aAe';
        _balance = '1.234';
        _isConnected = true;
        _isConnecting = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Cüzdan başarıyla bağlandı!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      setState(() {
        _isConnecting = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Cüzdan bağlantısı başarısız: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _createWallet() async {
    // Show dialog for wallet creation
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Yeni Cüzdan Oluştur'),
        content: const Text(
          'Yeni bir Ethereum cüzdanı oluşturmak istediğinizden emin misiniz? '
          'Private key\'inizi güvenli bir yerde sakladığınızdan emin olun.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('İptal'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              _generateNewWallet();
            },
            child: const Text('Oluştur'),
          ),
        ],
      ),
    );
  }

  Future<void> _generateNewWallet() async {
    try {
      // Mock wallet generation
      await Future.delayed(const Duration(seconds: 1));

      final mockPrivateKey = '0x' + List.generate(64, (i) => '0123456789abcdef'[i % 16]).join();
      final mockAddress = '0x' + List.generate(40, (i) => '0123456789abcdef'[i % 16]).join();

      if (mounted) {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Cüzdan Oluşturuldu'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Private Key (Güvenli Saklayın!):'),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.grey.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    mockPrivateKey,
                    style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
                  ),
                ),
                const SizedBox(height: 16),
                Text('Adres: $mockAddress'),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () async {
                  await Clipboard.setData(ClipboardData(text: mockPrivateKey));
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Private key panoya kopyalandı')),
                    );
                  }
                },
                child: const Text('Kopyala'),
              ),
              ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Tamam'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Cüzdan oluşturma başarısız: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _disconnectWallet() async {
    setState(() {
      _walletAddress = null;
      _balance = null;
      _isConnected = false;
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Cüzdan bağlantısı kesildi'),
          backgroundColor: Colors.orange,
        ),
      );
    }
  }
}
