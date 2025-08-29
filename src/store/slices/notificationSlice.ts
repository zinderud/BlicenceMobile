import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import PushNotificationService, { NotificationData, NotificationConfig } from '../../services/PushNotificationService';
import WebSocketService, { WebSocketMessage, ConnectionStatus } from '../../services/WebSocketService';

interface NotificationState {
  // Bildirim geçmişi
  notifications: NotificationData[];
  unreadCount: number;
  
  // WebSocket durumu
  connectionStatus: ConnectionStatus;
  
  // Ayarlar
  config: NotificationConfig;
  
  // UI durumu
  loading: boolean;
  error: string | null;
  
  // Bildirim merkezi
  showNotificationCenter: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  connectionStatus: {
    connected: false,
    reconnectAttempts: 0,
  },
  config: {
    enabled: true,
    planUpdates: true,
    priceAlerts: true,
    usageAlerts: true,
    nftNotifications: true,
    systemMessages: true,
    soundEnabled: true,
    vibrationEnabled: true,
  },
  loading: false,
  error: null,
  showNotificationCenter: false,
};

// Async Thunks
export const initializeNotifications = createAsyncThunk(
  'notifications/initialize',
  async (userId?: string) => {
    await PushNotificationService.initialize();
    await WebSocketService.connect(userId);
    
    const [notifications, unreadCount, config] = await Promise.all([
      PushNotificationService.getNotificationHistory(),
      PushNotificationService.getUnreadCount(),
      PushNotificationService.getConfig(),
    ]);
    
    return { notifications, unreadCount, config };
  }
);

export const loadNotificationHistory = createAsyncThunk(
  'notifications/loadHistory',
  async () => {
    const [notifications, unreadCount] = await Promise.all([
      PushNotificationService.getNotificationHistory(),
      PushNotificationService.getUnreadCount(),
    ]);
    
    return { notifications, unreadCount };
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string) => {
    await PushNotificationService.markAsRead(notificationId);
    return notificationId;
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async () => {
    await PushNotificationService.markAllAsRead();
  }
);

export const updateNotificationConfig = createAsyncThunk(
  'notifications/updateConfig',
  async (newConfig: Partial<NotificationConfig>) => {
    await PushNotificationService.updateConfig(newConfig);
    return newConfig;
  }
);

export const clearNotificationHistory = createAsyncThunk(
  'notifications/clearHistory',
  async () => {
    await PushNotificationService.clearHistory();
  }
);

export const sendTestNotification = createAsyncThunk(
  'notifications/sendTest',
  async (type: 'plan_update' | 'price_change' | 'usage_alert' | 'nft_received' | 'system') => {
    const testMessages = {
      plan_update: {
        title: '📋 Test Plan Güncellemesi',
        message: 'Bu bir test bildirimidir. Plan durumu değişikliklerini bu şekilde alacaksınız.',
        type: 'plan_update' as const,
        priority: 'high' as const,
      },
      price_change: {
        title: '💰 Test Fiyat Değişikliği',
        message: 'Bu bir test bildirimidir. Fiyat değişikliklerini bu şekilde alacaksınız.',
        type: 'price_change' as const,
        priority: 'normal' as const,
      },
      usage_alert: {
        title: '📊 Test Kullanım Uyarısı',
        message: 'Bu bir test bildirimidir. Kullanım uyarılarını bu şekilde alacaksınız.',
        type: 'usage_alert' as const,
        priority: 'high' as const,
      },
      nft_received: {
        title: '🎨 Test NFT Bildirimi',
        message: 'Bu bir test bildirimidir. NFT bildirimlerini bu şekilde alacaksınız.',
        type: 'nft_received' as const,
        priority: 'normal' as const,
      },
      system: {
        title: '⚙️ Test Sistem Bildirimi',
        message: 'Bu bir test bildirimidir. Sistem bildirimlerini bu şekilde alacaksınız.',
        type: 'system' as const,
        priority: 'normal' as const,
      },
    };
    
    const testMessage = testMessages[type];
    await PushNotificationService.sendLocalNotification(testMessage);
    
    return testMessage;
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // WebSocket mesajı alındığında
    handleWebSocketMessage: (state, action: PayloadAction<WebSocketMessage>) => {
      const message = action.payload;
      
      // Mesaj tipine göre bildirim gönder
      switch (message.type) {
        case 'plan_update':
          PushNotificationService.notifyPlanUpdate(
            message.payload.planId,
            message.payload.planName || 'Plan',
            message.payload.status
          );
          break;
          
        case 'price_change':
          PushNotificationService.notifyPriceChange(
            message.payload.planId,
            message.payload.planName || 'Plan',
            message.payload.oldPrice,
            message.payload.newPrice
          );
          break;
          
        case 'usage_update':
          if (message.payload.usagePercentage >= 50) {
            PushNotificationService.notifyUsageAlert(
              message.payload.planId,
              message.payload.planName || 'Plan',
              message.payload.usagePercentage
            );
          }
          break;
      }
    },
    
    // WebSocket bağlantı durumu güncelle
    updateConnectionStatus: (state, action: PayloadAction<ConnectionStatus>) => {
      state.connectionStatus = action.payload;
    },
    
    // Yeni bildirim ekle
    addNotification: (state, action: PayloadAction<NotificationData>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    
    // Bildirim merkezi göster/gizle
    toggleNotificationCenter: (state) => {
      state.showNotificationCenter = !state.showNotificationCenter;
    },
    
    setShowNotificationCenter: (state, action: PayloadAction<boolean>) => {
      state.showNotificationCenter = action.payload;
    },
    
    // Hata temizle
    clearError: (state) => {
      state.error = null;
    },
    
    // Bildirim simülasyonu (development için)
    simulateNotification: (state, action: PayloadAction<{
      type: NotificationData['type'];
      title: string;
      message: string;
    }>) => {
      const { type, title, message } = action.payload;
      const notification: NotificationData = {
        id: Date.now().toString(),
        title,
        message,
        type,
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'normal',
      };
      
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize notifications
      .addCase(initializeNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.config = action.payload.config;
      })
      .addCase(initializeNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Bildirimler başlatılamadı';
      })
      
      // Load notification history
      .addCase(loadNotificationHistory.fulfilled, (state, action) => {
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      
      // Mark as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      
      // Mark all as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.read = true;
        });
        state.unreadCount = 0;
      })
      
      // Update config
      .addCase(updateNotificationConfig.fulfilled, (state, action) => {
        state.config = { ...state.config, ...action.payload };
      })
      
      // Clear history
      .addCase(clearNotificationHistory.fulfilled, (state) => {
        state.notifications = [];
        state.unreadCount = 0;
      })
      
      // Send test notification
      .addCase(sendTestNotification.fulfilled, (state, action) => {
        // Test bildirimi başarıyla gönderildi, geçmişi yeniden yükle
        // Bu gerçek uygulamada otomatik olarak handleWebSocketMessage ile gelecek
      });
  },
});

export const {
  handleWebSocketMessage,
  updateConnectionStatus,
  addNotification,
  toggleNotificationCenter,
  setShowNotificationCenter,
  clearError,
  simulateNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;
