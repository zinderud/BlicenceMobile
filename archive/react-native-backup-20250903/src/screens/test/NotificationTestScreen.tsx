import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  sendTestNotification,
  simulateNotification,
  loadNotificationHistory,
  markAllNotificationsAsRead,
  clearNotificationHistory,
} from '../../store/slices/notificationSlice';
import NotificationBadge from '../../components/notifications/NotificationBadge';
import WebSocketService from '../../services/WebSocketService';

const NotificationTestScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    notifications, 
    unreadCount, 
    connectionStatus, 
    config 
  } = useAppSelector(state => state.notifications);

  useEffect(() => {
    dispatch(loadNotificationHistory());
  }, [dispatch]);

  const handleTestNotification = (type: Parameters<typeof sendTestNotification>[0]) => {
    dispatch(sendTestNotification(type));
    Alert.alert('Test Bildirimi', `${type} türünde test bildirimi gönderildi!`);
  };

  const handleSimulateNotification = (type: 'plan_update' | 'price_change' | 'usage_alert' | 'nft_received' | 'system') => {
    const notifications = {
      plan_update: {
        title: '📋 Plan Güncellemesi',
        message: 'API Planınız başarıyla aktifleştirildi!',
      },
      price_change: {
        title: '💰 Fiyat Değişikliği',
        message: 'Premium Plan fiyatı %15 düştü: 100₺ → 85₺',
      },
      usage_alert: {
        title: '📊 Kullanım Uyarısı',
        message: 'API Planınızın %80\'i kullanıldı. Kalan: 200 istek',
      },
      nft_received: {
        title: '🎨 NFT Alındı',
        message: 'Premium Plan NFT sahiplik belgeniz oluşturuldu!',
      },
      system: {
        title: '⚙️ Sistem Güncellemesi',
        message: 'Sistem bakımı: 03:00-04:00 arası geçici kesinti olabilir.',
      },
    };

    const notification = notifications[type];
    dispatch(simulateNotification({
      type,
      title: notification.title,
      message: notification.message,
    }));
  };

  const handleWebSocketTest = () => {
    // Mock WebSocket mesajı simüle et
    const mockMessage = {
      type: 'plan_update' as const,
      payload: {
        planId: 'plan-123',
        planName: 'Test API Planı',
        status: 'activated',
      },
      timestamp: new Date().toISOString(),
    };

    // WebSocket mesajını simüle et
    console.log('Simulating WebSocket message:', mockMessage);
    Alert.alert('WebSocket Test', 'Mock WebSocket mesajı gönderildi! Console\'u kontrol edin.');
  };

  const handleConnectionTest = () => {
    if (connectionStatus.connected) {
      WebSocketService.disconnect();
      Alert.alert('Bağlantı Testi', 'WebSocket bağlantısı kapatıldı');
    } else {
      WebSocketService.connect();
      Alert.alert('Bağlantı Testi', 'WebSocket bağlantısı başlatıldı');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Bildirim Test Merkezi</Text>
          <Text style={styles.headerSubtitle}>
            Bildirim sistemini test etmek için kullanın
          </Text>
        </View>
        <NotificationBadge size="large" />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{notifications.length}</Text>
          <Text style={styles.statLabel}>Toplam</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{unreadCount}</Text>
          <Text style={styles.statLabel}>Okunmamış</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[
            styles.statNumber,
            { color: connectionStatus.connected ? '#28a745' : '#dc3545' }
          ]}>
            {connectionStatus.connected ? '●' : '○'}
          </Text>
          <Text style={styles.statLabel}>Bağlantı</Text>
        </View>
      </View>

      {/* Connection Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>WebSocket Bağlantısı</Text>
        <View style={[
          styles.connectionCard,
          connectionStatus.connected ? styles.connectedCard : styles.disconnectedCard
        ]}>
          <Text style={styles.connectionStatus}>
            Durum: {connectionStatus.connected ? 'Bağlı' : 'Bağlı Değil'}
          </Text>
          {connectionStatus.lastConnected && (
            <Text style={styles.connectionTime}>
              Son Bağlantı: {new Date(connectionStatus.lastConnected).toLocaleTimeString('tr-TR')}
            </Text>
          )}
          {connectionStatus.reconnectAttempts > 0 && (
            <Text style={styles.reconnectAttempts}>
              Yeniden Deneme: {connectionStatus.reconnectAttempts}
            </Text>
          )}
          {connectionStatus.lastError && (
            <Text style={styles.connectionError}>
              Hata: {connectionStatus.lastError}
            </Text>
          )}
          
          <TouchableOpacity
            style={styles.connectionButton}
            onPress={handleConnectionTest}
          >
            <Text style={styles.connectionButtonText}>
              {connectionStatus.connected ? 'Bağlantıyı Kes' : 'Bağlan'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Test Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Bildirimleri (Real)</Text>
        <Text style={styles.sectionDescription}>
          Gerçek bildirim sistemi ile test bildirimleri gönderir
        </Text>
        
        <View style={styles.buttonGrid}>
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: '#007AFF' }]}
            onPress={() => handleTestNotification('plan_update')}
          >
            <Text style={styles.testButtonText}>📋 Plan Güncellemesi</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: '#28a745' }]}
            onPress={() => handleTestNotification('price_change')}
          >
            <Text style={styles.testButtonText}>💰 Fiyat Değişikliği</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: '#ffc107' }]}
            onPress={() => handleTestNotification('usage_alert')}
          >
            <Text style={styles.testButtonText}>📊 Kullanım Uyarısı</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: '#6f42c1' }]}
            onPress={() => handleTestNotification('nft_received')}
          >
            <Text style={styles.testButtonText}>🎨 NFT Bildirimi</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: '#6c757d' }]}
            onPress={() => handleTestNotification('system')}
          >
            <Text style={styles.testButtonText}>⚙️ Sistem Bildirimi</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Simulate Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Simülasyon Bildirimleri</Text>
        <Text style={styles.sectionDescription}>
          Redux store'a direk bildirim ekler (UI test için)
        </Text>
        
        <View style={styles.buttonGrid}>
          <TouchableOpacity
            style={[styles.testButton, styles.simulateButton, { borderColor: '#007AFF' }]}
            onPress={() => handleSimulateNotification('plan_update')}
          >
            <Text style={[styles.testButtonText, { color: '#007AFF' }]}>📋 Plan Sim.</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.testButton, styles.simulateButton, { borderColor: '#28a745' }]}
            onPress={() => handleSimulateNotification('price_change')}
          >
            <Text style={[styles.testButtonText, { color: '#28a745' }]}>💰 Fiyat Sim.</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.testButton, styles.simulateButton, { borderColor: '#ffc107' }]}
            onPress={() => handleSimulateNotification('usage_alert')}
          >
            <Text style={[styles.testButtonText, { color: '#ffc107' }]}>📊 Kullanım Sim.</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.testButton, styles.simulateButton, { borderColor: '#6f42c1' }]}
            onPress={() => handleSimulateNotification('nft_received')}
          >
            <Text style={[styles.testButtonText, { color: '#6f42c1' }]}>🎨 NFT Sim.</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.testButton, styles.simulateButton, { borderColor: '#6c757d' }]}
            onPress={() => handleSimulateNotification('system')}
          >
            <Text style={[styles.testButtonText, { color: '#6c757d' }]}>⚙️ Sistem Sim.</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* WebSocket Test */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>WebSocket Test</Text>
        <Text style={styles.sectionDescription}>
          Mock WebSocket mesajları gönderir
        </Text>
        
        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: '#17a2b8' }]}
          onPress={handleWebSocketTest}
        >
          <Text style={styles.testButtonText}>🌐 WebSocket Mesajı Gönder</Text>
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
            onPress={() => dispatch(loadNotificationHistory())}
          >
            <Text style={styles.actionButtonText}>🔄 Yenile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#28a745' }]}
            onPress={() => dispatch(markAllNotificationsAsRead())}
            disabled={unreadCount === 0}
          >
            <Text style={[
              styles.actionButtonText,
              unreadCount === 0 && { opacity: 0.5 }
            ]}>
              ✓ Tümü Okundu
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#dc3545' }]}
            onPress={() => {
              Alert.alert(
                'Geçmişi Temizle',
                'Tüm bildirimler silinecek. Emin misiniz?',
                [
                  { text: 'İptal' },
                  { 
                    text: 'Sil',
                    onPress: () => dispatch(clearNotificationHistory())
                  }
                ]
              );
            }}
            disabled={notifications.length === 0}
          >
            <Text style={[
              styles.actionButtonText,
              notifications.length === 0 && { opacity: 0.5 }
            ]}>
              🗑️ Temizle
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Config Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mevcut Ayarlar</Text>
        <View style={styles.configCard}>
          <Text style={styles.configItem}>
            ✓ Ana Bildirimler: {config.enabled ? 'Açık' : 'Kapalı'}
          </Text>
          <Text style={styles.configItem}>
            📋 Plan Güncellemeleri: {config.planUpdates ? 'Açık' : 'Kapalı'}
          </Text>
          <Text style={styles.configItem}>
            💰 Fiyat Uyarıları: {config.priceAlerts ? 'Açık' : 'Kapalı'}
          </Text>
          <Text style={styles.configItem}>
            📊 Kullanım Uyarıları: {config.usageAlerts ? 'Açık' : 'Kapalı'}
          </Text>
          <Text style={styles.configItem}>
            🎨 NFT Bildirimleri: {config.nftNotifications ? 'Açık' : 'Kapalı'}
          </Text>
          <Text style={styles.configItem}>
            🔊 Ses: {config.soundEnabled ? 'Açık' : 'Kapalı'}
          </Text>
          <Text style={styles.configItem}>
            📳 Titreşim: {config.vibrationEnabled ? 'Açık' : 'Kapalı'}
          </Text>
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
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
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
    marginTop: 4,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  connectionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  connectedCard: {
    borderColor: '#28a745',
    backgroundColor: '#f0f9f0',
  },
  disconnectedCard: {
    borderColor: '#dc3545',
    backgroundColor: '#fef0f0',
  },
  connectionStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  connectionTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  reconnectAttempts: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  connectionError: {
    fontSize: 12,
    color: '#dc3545',
    marginBottom: 12,
  },
  connectionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  connectionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  testButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  simulateButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  testButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  configCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
  },
  configItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default NotificationTestScreen;
