import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useAppSelector, useAppDispatch } from '../../store';
import { setBalance } from '../../store/slices/walletSlice';
import BlockchainService from '../../services/BlockchainService';
import NotificationBadge from '../../components/notifications/NotificationBadge';

const DashboardScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { walletInfo } = useAppSelector(state => state.wallet);
  const { user } = useAppSelector(state => state.auth);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadWalletBalance();
  }, []);

  const loadWalletBalance = async () => {
    try {
      if (walletInfo?.address) {
        const balance = await BlockchainService.getBalance();
        dispatch(setBalance(balance));
      }
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletBalance();
    setRefreshing(false);
  };

  const userTypeText = user?.userType === 'customer' ? 'Müşteri' : 'Üretici';

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeContent}>
          <View>
            <Text style={styles.welcomeText}>Hoş Geldiniz!</Text>
            <Text style={styles.userTypeText}>{userTypeText} Hesabı</Text>
          </View>
          <NotificationBadge />
        </View>
      </View>

      {/* Wallet Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cüzdan Bilgileri</Text>
        <View style={styles.walletInfo}>
          <Text style={styles.addressLabel}>Adres:</Text>
          <Text style={styles.addressValue}>{walletInfo?.address || 'Bağlı değil'}</Text>
          
          <Text style={styles.balanceLabel}>Bakiye:</Text>
          <Text style={styles.balanceValue}>{walletInfo?.balance || '0'} MATIC</Text>
          
          <Text style={styles.networkLabel}>Ağ:</Text>
          <Text style={styles.networkValue}>Polygon Mumbai</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Hızlı İşlemler</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Planları Gör</Text>
          </TouchableOpacity>
          
          {user?.userType === 'customer' && (
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Marketplace</Text>
            </TouchableOpacity>
          )}
          
          {user?.userType === 'producer' && (
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Plan Oluştur</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>İstatistikler</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>
              {user?.userType === 'customer' ? 'Aktif Planlar' : 'Yayınlanan Planlar'}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>
              {user?.userType === 'customer' ? 'Kullanım Hakkı' : 'Toplam Satış'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  welcomeSection: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 60,
    marginBottom: 20,
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userTypeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  walletInfo: {
    gap: 8,
  },
  addressLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  addressValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  balanceValue: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  networkLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  networkValue: {
    fontSize: 14,
    color: '#333',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    minWidth: 120,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default DashboardScreen;
