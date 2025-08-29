// import PushNotification, { Importance } from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionsAndroid, Platform, Alert } from 'react-native';

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'plan_update' | 'price_change' | 'usage_alert' | 'nft_received' | 'system';
  data?: any;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'normal' | 'high';
}

export interface NotificationConfig {
  enabled: boolean;
  planUpdates: boolean;
  priceAlerts: boolean;
  usageAlerts: boolean;
  nftNotifications: boolean;
  systemMessages: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

class PushNotificationService {
  private initialized = false;
  private config: NotificationConfig = {
    enabled: true,
    planUpdates: true,
    priceAlerts: true,
    usageAlerts: true,
    nftNotifications: true,
    systemMessages: true,
    soundEnabled: true,
    vibrationEnabled: true,
  };

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load saved configuration
      await this.loadConfig();

      // Request permissions
      await this.requestPermissions();

      // Configure push notifications
      this.configurePushNotifications();

      this.initialized = true;
      console.log('PushNotificationService initialized');
    } catch (error) {
      console.error('Failed to initialize PushNotificationService:', error);
    }
  }

  private async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Bildirim İzni',
            message: 'Uygulama plan güncellemeleri ve önemli bilgiler için bildirim gönderebilir.',
            buttonNeutral: 'Sonra Sor',
            buttonNegative: 'İptal',
            buttonPositive: 'İzin Ver',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (error) {
        console.error('Permission request error:', error);
        return false;
      }
    }
    return true; // iOS için otomatik izin istenir
  }

  private configurePushNotifications(): void {
    // Mock Push notification konfigürasyonu
    console.log('Push notifications configured (mock)');
    
    // Mock token generation
    setTimeout(() => {
      const mockToken = 'mock_push_token_' + Date.now();
      console.log('Mock push token:', mockToken);
      this.savePushToken(mockToken);
    }, 1000);

    // Mock bildirim kanalları oluştur
    this.createNotificationChannels();
  }

  private createNotificationChannels(): void {
    // Mock implementation - gerçek uygulamada PushNotification.createChannel kullanılacak
    const channels = [
      {
        channelId: 'plan-updates',
        channelName: 'Plan Güncellemeleri',
        channelDescription: 'Plan durumu ve güncelleme bildirimleri',
        importance: 'HIGH',
        vibrate: true,
      },
      {
        channelId: 'price-alerts',
        channelName: 'Fiyat Uyarıları',
        channelDescription: 'Plan fiyat değişiklikleri',
        importance: 'DEFAULT',
        vibrate: true,
      },
      {
        channelId: 'usage-alerts',
        channelName: 'Kullanım Uyarıları',
        channelDescription: 'Plan kullanım limiti bildirimleri',
        importance: 'HIGH',
        vibrate: true,
      },
      {
        channelId: 'nft-notifications',
        channelName: 'NFT Bildirimleri',
        channelDescription: 'NFT sahiplik ve transfer bildirimleri',
        importance: 'DEFAULT',
        vibrate: false,
      },
      {
        channelId: 'system',
        channelName: 'Sistem Bildirimleri',
        channelDescription: 'Güvenlik ve sistem güncellemeleri',
        importance: 'HIGH',
        vibrate: true,
      },
    ];

    channels.forEach(channel => {
      console.log(`Mock channel ${channel.channelId} created`);
    });
  }

  // Local notification gönder
  async sendLocalNotification(data: Omit<NotificationData, 'id' | 'timestamp' | 'read'>): Promise<void> {
    if (!this.config.enabled || !this.shouldSendNotification(data.type)) {
      return;
    }

    const notificationId = Date.now().toString();
    const channelId = this.getChannelId(data.type);

    // Mock local notification - gerçek uygulamada PushNotification.localNotification kullanılacak
    console.log('Mock local notification:', {
      id: notificationId,
      title: data.title,
      message: data.message,
      channelId,
      priority: data.priority,
      type: data.type,
    });

    // Mock system alert for demonstration
    if (Platform.OS === 'web' || __DEV__) {
      Alert.alert(data.title, data.message);
    }

    // Bildirimi geçmişe kaydet
    await this.saveNotificationToHistory({
      id: notificationId,
      title: data.title,
      message: data.message,
      type: data.type,
      data: data.data,
      timestamp: new Date().toISOString(),
      read: false,
      priority: data.priority,
    });
  }

  // Plan güncellemesi bildirimi
  async notifyPlanUpdate(planId: string, planName: string, updateType: 'activated' | 'expired' | 'suspended'): Promise<void> {
    const messages = {
      activated: `${planName} planınız aktifleştirildi!`,
      expired: `${planName} planınızın süresi doldu.`,
      suspended: `${planName} planınız askıya alındı.`,
    };

    await this.sendLocalNotification({
      title: 'Plan Durumu',
      message: messages[updateType],
      type: 'plan_update',
      priority: 'high',
      data: { planId, updateType },
    });
  }

  // Fiyat değişikliği bildirimi
  async notifyPriceChange(planId: string, planName: string, oldPrice: number, newPrice: number): Promise<void> {
    const isIncrease = newPrice > oldPrice;
    const emoji = isIncrease ? '📈' : '📉';
    const direction = isIncrease ? 'arttı' : 'azaldı';

    await this.sendLocalNotification({
      title: `${emoji} Fiyat Değişikliği`,
      message: `${planName} planının fiyatı ${direction}: ${oldPrice}₺ → ${newPrice}₺`,
      type: 'price_change',
      priority: 'normal',
      data: { planId, oldPrice, newPrice },
    });
  }

  // Kullanım uyarısı
  async notifyUsageAlert(planId: string, planName: string, usagePercentage: number): Promise<void> {
    let message = '';
    let priority: 'low' | 'normal' | 'high' = 'normal';

    if (usagePercentage >= 90) {
      message = `⚠️ ${planName} planınızın %${usagePercentage} kullanıldı! Limit aşımına yaklaşıyorsunuz.`;
      priority = 'high';
    } else if (usagePercentage >= 75) {
      message = `📊 ${planName} planınızın %${usagePercentage} kullanıldı.`;
      priority = 'normal';
    } else if (usagePercentage >= 50) {
      message = `📈 ${planName} planınızın yarısı kullanıldı.`;
      priority = 'low';
    }

    if (message) {
      await this.sendLocalNotification({
        title: 'Kullanım Uyarısı',
        message,
        type: 'usage_alert',
        priority,
        data: { planId, usagePercentage },
      });
    }
  }

  // NFT bildirimi
  async notifyNFTReceived(tokenId: string, planName: string): Promise<void> {
    await this.sendLocalNotification({
      title: '🎨 NFT Alındı',
      message: `${planName} planı için NFT sahiplik belgeniz oluşturuldu!`,
      type: 'nft_received',
      priority: 'normal',
      data: { tokenId },
    });
  }

  // Sistem bildirimi
  async notifySystemMessage(title: string, message: string, priority: 'low' | 'normal' | 'high' = 'normal'): Promise<void> {
    await this.sendLocalNotification({
      title,
      message,
      type: 'system',
      priority,
    });
  }

  // Bildirim geçmişini getir
  async getNotificationHistory(): Promise<NotificationData[]> {
    try {
      const historyJson = await AsyncStorage.getItem('notification_history');
      if (historyJson) {
        const history: NotificationData[] = JSON.parse(historyJson);
        return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }
      return [];
    } catch (error) {
      console.error('Failed to load notification history:', error);
      return [];
    }
  }

  // Bildirimi okundu olarak işaretle
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const history = await this.getNotificationHistory();
      const updatedHistory = history.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      );
      await AsyncStorage.setItem('notification_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  // Tüm bildirimleri okundu olarak işaretle
  async markAllAsRead(): Promise<void> {
    try {
      const history = await this.getNotificationHistory();
      const updatedHistory = history.map(notification => ({ ...notification, read: true }));
      await AsyncStorage.setItem('notification_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  // Bildirim ayarlarını getir
  getConfig(): NotificationConfig {
    return { ...this.config };
  }

  // Bildirim ayarlarını güncelle
  async updateConfig(newConfig: Partial<NotificationConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    await this.saveConfig();
  }

  // Okunmamış bildirim sayısını getir
  async getUnreadCount(): Promise<number> {
    const history = await this.getNotificationHistory();
    return history.filter(notification => !notification.read).length;
  }

  // Bildirim geçmişini temizle
  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem('notification_history');
    } catch (error) {
      console.error('Failed to clear notification history:', error);
    }
  }

  // Private helper methods
  private shouldSendNotification(type: NotificationData['type']): boolean {
    switch (type) {
      case 'plan_update':
        return this.config.planUpdates;
      case 'price_change':
        return this.config.priceAlerts;
      case 'usage_alert':
        return this.config.usageAlerts;
      case 'nft_received':
        return this.config.nftNotifications;
      case 'system':
        return this.config.systemMessages;
      default:
        return true;
    }
  }

  private getChannelId(type: NotificationData['type']): string {
    switch (type) {
      case 'plan_update':
        return 'plan-updates';
      case 'price_change':
        return 'price-alerts';
      case 'usage_alert':
        return 'usage-alerts';
      case 'nft_received':
        return 'nft-notifications';
      case 'system':
        return 'system';
      default:
        return 'system';
    }
  }

  private async saveNotificationToHistory(notification: NotificationData): Promise<void> {
    try {
      const history = await this.getNotificationHistory();
      const updatedHistory = [notification, ...history].slice(0, 100); // Son 100 bildirimi sakla
      await AsyncStorage.setItem('notification_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to save notification to history:', error);
    }
  }

  private async savePushToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('push_token', token);
    } catch (error) {
      console.error('Failed to save push token:', error);
    }
  }

  private async loadConfig(): Promise<void> {
    try {
      const configJson = await AsyncStorage.getItem('notification_config');
      if (configJson) {
        const savedConfig = JSON.parse(configJson);
        this.config = { ...this.config, ...savedConfig };
      }
    } catch (error) {
      console.error('Failed to load notification config:', error);
    }
  }

  private async saveConfig(): Promise<void> {
    try {
      await AsyncStorage.setItem('notification_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save notification config:', error);
    }
  }

  private handleNotificationReceived(notification: any): void {
    // Bildirim alındığında custom logic
    console.log('Notification received:', notification);
  }

  private handleNotificationAction(notification: any): void {
    // Bildirim tıklandığında navigation logic
    console.log('Notification action:', notification);
  }
}

export default new PushNotificationService();
