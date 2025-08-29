import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store';
import { setLoading, setConnected, setWalletInfo, setError } from '../../store/slices/walletSlice';
import BlockchainService from '../../services/BlockchainService';

const WalletConnectScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.wallet);

  const handleConnectWallet = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      // Initialize blockchain service
      await BlockchainService.initializeProvider();
      
      // Connect wallet
      const walletConnection = await BlockchainService.connectWallet();
      
      // Update store with wallet info
      dispatch(setWalletInfo({
        address: walletConnection.address,
        balance: '0', // Will be updated later
        chainId: walletConnection.chainId,
        isConnected: true,
      }));
      
      dispatch(setConnected(true));
      dispatch(setLoading(false));
      
      // Navigate to user type selection
      navigation.navigate('UserTypeSelection' as never);
      
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      dispatch(setLoading(false));
      dispatch(setError(error.message || 'Cüzdan bağlantısı başarısız oldu'));
      Alert.alert('Hata', 'Cüzdan bağlantısı başarısız oldu. Lütfen tekrar deneyin.');
    }
  };

  const handleSkipForDev = () => {
    // Development için geçici skip fonksiyonu
    dispatch(setWalletInfo({
      address: '0x742d35Cc6634C0532925a3b8D404B3C48B9C8C8d',
      balance: '10.5',
      chainId: 80001,
      isConnected: true,
    }));
    dispatch(setConnected(true));
    navigation.navigate('UserTypeSelection' as never);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cüzdan Bağlantısı</Text>
      <Text style={styles.subtitle}>
        Blicence uygulamasını kullanmak için cüzdanınızı bağlayın
      </Text>
      
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={handleConnectWallet}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Bağlanıyor...' : 'Cüzdan Bağla'}
        </Text>
      </TouchableOpacity>

      {/* Development Skip Button */}
      <TouchableOpacity 
        style={[styles.button, styles.skipButton]} 
        onPress={handleSkipForDev}
      >
        <Text style={styles.buttonText}>Geliştirme için Atla</Text>
      </TouchableOpacity>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  skipButton: {
    backgroundColor: '#6C757D',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    color: '#ff3333',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default WalletConnectScreen;
