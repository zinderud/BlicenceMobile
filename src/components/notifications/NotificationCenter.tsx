import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Switch,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  loadNotificationHistory,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotificationHistory,
  updateNotificationConfig,
  setShowNotificationCenter,
  sendTestNotification,
} from '../../store/slices/notificationSlice';
import { NotificationData } from '../../services/PushNotificationService';

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ visible, onClose }) => {
  const dispatch = useAppDispatch();
  const { 
    notifications, 
    unreadCount, 
    config, 
    connectionStatus, 
    loading 
  } = useAppSelector(state => state.notifications);
  
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (visible) {
      dispatch(loadNotificationHistory());
    }
  }, [visible, dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(loadNotificationHistory());
    setRefreshing(false);
  };

  const handleNotificationPress = (notification: NotificationData) => {
    if (!notification.read) {
      dispatch(markNotificationAsRead(notification.id));
    }
    
    // Bildirim tipine göre navigasyon yapılabilir
    // Örnek: plan_update için PlansScreen'e git
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      dispatch(markAllNotificationsAsRead());
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Geçmişi Temizle',
      'Tüm bildirim geçmişi silinecek. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: () => dispatch(clearNotificationHistory())
        },
      ]
    );
  };

  const handleConfigUpdate = (key: keyof typeof config, value: boolean) => {
    dispatch(updateNotificationConfig({ [key]: value }));
  };

  const handleTestNotification = (type: Parameters<typeof sendTestNotification>[0]) => {
    dispatch(sendTestNotification(type));
  };

  const getNotificationIcon = (type: NotificationData['type']) => {
    switch (type) {
      case 'plan_update': return '📋';
      case 'price_change': return '💰';
      case 'usage_alert': return '📊';
      case 'nft_received': return '🎨';
      case 'system': return '⚙️';
      default: return '📢';
    }
  };

  const getNotificationTypeText = (type: NotificationData['type']) => {
    switch (type) {
      case 'plan_update': return 'Plan Güncellemesi';
      case 'price_change': return 'Fiyat Değişikliği';
      case 'usage_alert': return 'Kullanım Uyarısı';
      case 'nft_received': return 'NFT Bildirimi';
      case 'system': return 'Sistem';
      default: return 'Bildirim';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} dakika önce`;
    } else if (diffDays < 1) {
      return `${diffHours} saat önce`;
    } else if (diffDays < 7) {
      return `${diffDays} gün önce`;
    } else {
      return date.toLocaleDateString('tr-TR');
    }
  };

  const renderNotificationItem = ({ item }: { item: NotificationData }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.notificationTitle}>
          <Text style={styles.notificationIcon}>
            {getNotificationIcon(item.type)}
          </Text>
          <Text style={[
            styles.notificationTitleText,
            !item.read && styles.unreadText
          ]}>
            {item.title}
          </Text>
        </View>
        
        <View style={styles.notificationMeta}>
          <Text style={styles.notificationTime}>
            {formatTimestamp(item.timestamp)}
          </Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
      </View>
      
      <Text style={styles.notificationMessage} numberOfLines={2}>
        {item.message}
      </Text>
      
      <Text style={styles.notificationTypeLabel}>
        {getNotificationTypeText(item.type)}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔔</Text>
      <Text style={styles.emptyTitle}>Henüz bildirim yok</Text>
      <Text style={styles.emptyDescription}>
        Plan güncellemeleri ve önemli bilgiler burada görünecek
      </Text>
    </View>
  );

  const renderNotificationsTab = () => (
    <View style={styles.tabContent}>
      {/* Header */}
      <View style={styles.notificationsHeader}>
        <Text style={styles.notificationCount}>
          {notifications.length} bildirim
          {unreadCount > 0 && ` (${unreadCount} okunmamış)`}
        </Text>
        
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={handleMarkAllAsRead}
            >
              <Text style={styles.markAllButtonText}>Tümünü Okundu İşaretle</Text>
            </TouchableOpacity>
          )}
          
          {notifications.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearHistory}
            >
              <Text style={styles.clearButtonText}>Temizle</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Connection Status */}
      <View style={[
        styles.connectionStatus,
        connectionStatus.connected ? styles.connected : styles.disconnected
      ]}>
        <View style={[
          styles.connectionDot,
          { backgroundColor: connectionStatus.connected ? '#28a745' : '#dc3545' }
        ]} />
        <Text style={styles.connectionText}>
          {connectionStatus.connected ? 'Bağlı' : 'Bağlantı Yok'}
          {connectionStatus.reconnectAttempts > 0 && 
            ` (${connectionStatus.reconnectAttempts} yeniden deneme)`
          }
        </Text>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={notifications.length === 0 ? styles.emptyListContainer : undefined}
      />
    </View>
  );

  const renderSettingsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.settingsTitle}>Bildirim Ayarları</Text>
      
      {/* Ana Bildirim Anahtarı */}
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Bildirimleri Etkinleştir</Text>
        <Switch
          value={config.enabled}
          onValueChange={(value) => handleConfigUpdate('enabled', value)}
          trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
          thumbColor={config.enabled ? '#fff' : '#f4f3f4'}
        />
      </View>

      {/* Bildirim Türleri */}
      <Text style={styles.settingsSectionTitle}>Bildirim Türleri</Text>
      
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Plan Güncellemeleri</Text>
        <Switch
          value={config.planUpdates}
          onValueChange={(value) => handleConfigUpdate('planUpdates', value)}
          disabled={!config.enabled}
          trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
          thumbColor={config.planUpdates ? '#fff' : '#f4f3f4'}
        />
      </View>
      
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Fiyat Uyarıları</Text>
        <Switch
          value={config.priceAlerts}
          onValueChange={(value) => handleConfigUpdate('priceAlerts', value)}
          disabled={!config.enabled}
          trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
          thumbColor={config.priceAlerts ? '#fff' : '#f4f3f4'}
        />
      </View>
      
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Kullanım Uyarıları</Text>
        <Switch
          value={config.usageAlerts}
          onValueChange={(value) => handleConfigUpdate('usageAlerts', value)}
          disabled={!config.enabled}
          trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
          thumbColor={config.usageAlerts ? '#fff' : '#f4f3f4'}
        />
      </View>
      
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>NFT Bildirimleri</Text>
        <Switch
          value={config.nftNotifications}
          onValueChange={(value) => handleConfigUpdate('nftNotifications', value)}
          disabled={!config.enabled}
          trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
          thumbColor={config.nftNotifications ? '#fff' : '#f4f3f4'}
        />
      </View>
      
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Sistem Mesajları</Text>
        <Switch
          value={config.systemMessages}
          onValueChange={(value) => handleConfigUpdate('systemMessages', value)}
          disabled={!config.enabled}
          trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
          thumbColor={config.systemMessages ? '#fff' : '#f4f3f4'}
        />
      </View>

      {/* Ses ve Titreşim */}
      <Text style={styles.settingsSectionTitle}>Ses ve Titreşim</Text>
      
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Ses</Text>
        <Switch
          value={config.soundEnabled}
          onValueChange={(value) => handleConfigUpdate('soundEnabled', value)}
          disabled={!config.enabled}
          trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
          thumbColor={config.soundEnabled ? '#fff' : '#f4f3f4'}
        />
      </View>
      
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Titreşim</Text>
        <Switch
          value={config.vibrationEnabled}
          onValueChange={(value) => handleConfigUpdate('vibrationEnabled', value)}
          disabled={!config.enabled}
          trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
          thumbColor={config.vibrationEnabled ? '#fff' : '#f4f3f4'}
        />
      </View>

      {/* Test Bildirimleri */}
      <Text style={styles.settingsSectionTitle}>Test Bildirimleri</Text>
      
      <View style={styles.testButtons}>
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => handleTestNotification('plan_update')}
        >
          <Text style={styles.testButtonText}>Plan Güncellemesi</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => handleTestNotification('price_change')}
        >
          <Text style={styles.testButtonText}>Fiyat Değişikliği</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => handleTestNotification('usage_alert')}
        >
          <Text style={styles.testButtonText}>Kullanım Uyarısı</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => handleTestNotification('nft_received')}
        >
          <Text style={styles.testButtonText}>NFT Bildirimi</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => handleTestNotification('system')}
        >
          <Text style={styles.testButtonText}>Sistem Bildirimi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bildirimler</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Kapat</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
            onPress={() => setActiveTab('notifications')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'notifications' && styles.activeTabText
            ]}>
              Bildirimler
            </Text>
            {unreadCount > 0 && activeTab !== 'notifications' && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
            onPress={() => setActiveTab('settings')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'settings' && styles.activeTabText
            ]}>
              Ayarlar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'notifications' ? renderNotificationsTab() : renderSettingsTab()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: '30%',
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
  },
  notificationsHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  notificationCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  markAllButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ff3b30',
    borderRadius: 6,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  connected: {
    backgroundColor: '#f0f9f0',
  },
  disconnected: {
    backgroundColor: '#fef0f0',
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  connectionText: {
    fontSize: 12,
    color: '#666',
  },
  notificationItem: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  unreadNotification: {
    backgroundColor: '#f8f9ff',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  notificationTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  unreadText: {
    color: '#007AFF',
  },
  notificationMeta: {
    alignItems: 'flex-end',
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTypeLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    margin: 16,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  testButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  testButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  testButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default NotificationCenter;
