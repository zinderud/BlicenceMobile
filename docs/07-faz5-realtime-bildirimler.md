# 🔄 07 - Faz 5: Gerçek Zamanlı İzleme ve Bildirimler (2-3 Hafta)

## 🎯 Faz 5 Hedefleri

Bu fazda uygulamanın gerçek zamanlı veri güncellemeleri alabilmesi ve kullanıcılara önemli olaylar hakkında bildirim gönderebilmesi için sistem geliştireceğiz:
- WebSocket tabanlı gerçek zamanlı güncellemeler
- Push notification sistemi
- Local notification sistemi  
- Background data synchronization
- Offline-first veri yönetimi
- Analytics ve event tracking

## 📋 Sprint Planlaması

### Sprint 5.1: WebSocket ve Gerçek Zamanlı Sistem (4-5 gün)
- ✅ WebSocket bağlantı yönetimi
- ✅ Gerçek zamanlı plan durumu güncellemeleri
- ✅ Kullanım tracking sistemi
- ✅ Ödeme bildirimleri
- ✅ Connection pooling ve reconnection

### Sprint 5.2: Push Notification Sistemi (3-4 gün)
- ✅ Firebase Cloud Messaging entegrasyonu
- ✅ Notification kategorileri ve öncelikleri
- ✅ Rich notification desteği
- ✅ Deep linking sistemi
- ✅ Notification preferences

### Sprint 5.3: Background Sync ve Offline Support (3-4 gün)
- ✅ Background app refresh
- ✅ Offline data queueing
- ✅ Conflict resolution
- ✅ Data consistency management
- ✅ Incremental sync

## 📡 Gerçek Zamanlı İzleme Sistemi

### WebSocket Service
```typescript
// src/services/realtime/WebSocketService.ts
import { EventEmitter } from 'events';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import { store } from '@/store';
import { updatePlanUsage, addPaymentRecord, updatePlanStatus } from '@/store/slices/customerSlice';
import { updateProducerStats, addCustomerActivity } from '@/store/slices/producerSlice';

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
  id: string;
}

export interface ConnectionConfig {
  url: string;
  protocols?: string[];
  headers?: Record<string, string>;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

class WebSocketService extends EventEmitter {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private config: ConnectionConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private isAuthenticated = false;
  private messageQueue: WebSocketMessage[] = [];
  private appState: AppStateStatus = 'active';

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  constructor() {
    super();
    this.config = {
      url: process.env.WEBSOCKET_URL || 'wss://api.blicence.com/ws',
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
    };

    // Listen to app state changes
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  async connect(walletAddress: string, authToken: string): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    
    try {
      const wsUrl = `${this.config.url}?address=${walletAddress}&token=${authToken}`;
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);

      console.log('WebSocket connecting...');
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.clearTimers();
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    this.isConnecting = false;
    this.isAuthenticated = false;
    this.reconnectAttempts = 0;
  }

  sendMessage(message: Omit<WebSocketMessage, 'timestamp' | 'id'>): void {
    const fullMessage: WebSocketMessage = {
      ...message,
      timestamp: Date.now(),
      id: this.generateMessageId(),
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.isAuthenticated) {
      this.ws.send(JSON.stringify(fullMessage));
    } else {
      // Queue message for later
      this.messageQueue.push(fullMessage);
    }
  }

  private handleOpen = () => {
    console.log('WebSocket connected');
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.emit('connected');
    
    // Send authentication message
    this.sendAuthMessage();
    
    // Start heartbeat
    this.startHeartbeat();
  };

  private handleMessage = (event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      this.processMessage(message);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  };

  private handleClose = (event: CloseEvent) => {
    console.log('WebSocket closed:', event.code, event.reason);
    this.clearTimers();
    this.isAuthenticated = false;
    this.emit('disconnected', { code: event.code, reason: event.reason });
    
    // Schedule reconnect if not manual disconnect
    if (event.code !== 1000 && this.appState === 'active') {
      this.scheduleReconnect();
    }
  };

  private handleError = (error: Event) => {
    console.error('WebSocket error:', error);
    this.emit('error', error);
  };

  private processMessage(message: WebSocketMessage): void {
    console.log('Received WebSocket message:', message.type);
    
    switch (message.type) {
      case 'AUTH_SUCCESS':
        this.handleAuthSuccess();
        break;
      case 'AUTH_FAILED':
        this.handleAuthFailed(message.payload);
        break;
      case 'PLAN_USAGE_UPDATED':
        this.handlePlanUsageUpdate(message.payload);
        break;
      case 'PAYMENT_RECEIVED':
        this.handlePaymentReceived(message.payload);
        break;
      case 'PLAN_STATUS_CHANGED':
        this.handlePlanStatusChange(message.payload);
        break;
      case 'NEW_CUSTOMER':
        this.handleNewCustomer(message.payload);
        break;
      case 'CUSTOMER_ACTIVITY':
        this.handleCustomerActivity(message.payload);
        break;
      case 'PRODUCER_STATS_UPDATE':
        this.handleProducerStatsUpdate(message.payload);
        break;
      case 'HEARTBEAT_RESPONSE':
        this.handleHeartbeatResponse();
        break;
      default:
        console.log('Unknown message type:', message.type);
    }

    this.emit('message', message);
  }

  private sendAuthMessage(): void {
    const authState = store.getState().auth;
    this.sendMessage({
      type: 'AUTHENTICATE',
      payload: {
        walletAddress: authState.walletAddress,
        userType: authState.userType,
        token: authState.session.token,
      },
    });
  }

  private handleAuthSuccess(): void {
    console.log('WebSocket authentication successful');
    this.isAuthenticated = true;
    
    // Send queued messages
    this.sendQueuedMessages();
    
    this.emit('authenticated');
  }

  private handleAuthFailed(payload: any): void {
    console.error('WebSocket authentication failed:', payload);
    this.disconnect();
    this.emit('authFailed', payload);
  }

  private sendQueuedMessages(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
      }
    }
  }

  private handlePlanUsageUpdate(payload: any): void {
    store.dispatch(updatePlanUsage({
      customerPlanId: payload.customerPlanId,
      usageData: payload.usageData,
    }));
    
    this.emit('planUsageUpdated', payload);
  }

  private handlePaymentReceived(payload: any): void {
    store.dispatch(addPaymentRecord(payload));
    this.emit('paymentReceived', payload);
  }

  private handlePlanStatusChange(payload: any): void {
    store.dispatch(updatePlanStatus({
      customerPlanId: payload.customerPlanId,
      status: payload.status,
    }));
    
    this.emit('planStatusChanged', payload);
  }

  private handleNewCustomer(payload: any): void {
    store.dispatch(addCustomerActivity({
      type: 'NEW_CUSTOMER',
      data: payload,
    }));
    
    this.emit('newCustomer', payload);
  }

  private handleCustomerActivity(payload: any): void {
    store.dispatch(addCustomerActivity({
      type: 'CUSTOMER_ACTIVITY',
      data: payload,
    }));
    
    this.emit('customerActivity', payload);
  }

  private handleProducerStatsUpdate(payload: any): void {
    store.dispatch(updateProducerStats(payload));
    this.emit('producerStatsUpdated', payload);
  }

  private handleHeartbeatResponse(): void {
    // Heartbeat received, connection is healthy
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.sendMessage({
          type: 'HEARTBEAT',
          payload: {},
        });
      }
    }, this.config.heartbeatInterval);
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= (this.config.maxReconnectAttempts || 10)) {
      console.log('Max reconnect attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    const delay = Math.min(
      (this.config.reconnectInterval || 5000) * Math.pow(2, this.reconnectAttempts),
      30000
    );

    console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      const authState = store.getState().auth;
      if (authState.walletAddress && authState.session.token) {
        this.connect(authState.walletAddress, authState.session.token);
      }
    }, delay);
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (this.appState.match(/inactive|background/) && nextAppState === 'active') {
      // App came to foreground, reconnect if needed
      const authState = store.getState().auth;
      if (authState.isAuthenticated && (!this.ws || this.ws.readyState !== WebSocket.OPEN)) {
        this.connect(authState.walletAddress!, authState.session.token!);
      }
    } else if (nextAppState === 'background') {
      // App went to background, keep connection for a while
      // iOS will terminate background connections after some time
    }
    
    this.appState = nextAppState;
  };

  private generateMessageId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getConnectionStatus(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    if (this.isConnecting) return 'connecting';
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.isAuthenticated) return 'connected';
    return 'disconnected';
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN && this.isAuthenticated;
  }
}

export default WebSocketService.getInstance();
```

## 📱 Push Notification Sistemi

### Push Notification Service
```typescript
// src/services/push/PushNotificationService.ts
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert, Linking } from 'react-native';
import { store } from '@/store';
import { addNotification } from '@/store/slices/settingsSlice';

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  type: NotificationTypes;
  data?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'max';
  scheduled?: Date;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval?: number;
  };
}

export type NotificationTypes = 
  | 'PLAN_USAGE_LOW'
  | 'PLAN_EXPIRED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_FAILED'
  | 'NEW_CUSTOMER'
  | 'PLAN_ACTIVATED'
  | 'GENERAL_UPDATE'
  | 'SECURITY_ALERT';

export interface NotificationPreferences {
  enabled: boolean;
  types: Record<NotificationTypes, boolean>;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
  sound: boolean;
  vibration: boolean;
  badge: boolean;
}

class PushNotificationService {
  private static instance: PushNotificationService;
  private fcmToken: string | null = null;
  private preferences: NotificationPreferences;

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  constructor() {
    this.preferences = {
      enabled: true,
      types: {
        PLAN_USAGE_LOW: true,
        PLAN_EXPIRED: true,
        PAYMENT_RECEIVED: true,
        PAYMENT_FAILED: true,
        NEW_CUSTOMER: true,
        PLAN_ACTIVATED: true,
        GENERAL_UPDATE: false,
        SECURITY_ALERT: true,
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
      sound: true,
      vibration: true,
      badge: true,
    };
  }

  async initialize(): Promise<void> {
    try {
      // Load preferences
      await this.loadPreferences();
      
      // Configure local notifications
      this.configureLocalNotifications();
      
      // Request permissions
      await this.requestPermissions();
      
      // Get FCM token
      await this.getFCMToken();
      
      // Set up message handlers
      this.setupMessageHandlers();
      
      console.log('Push notification service initialized');
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  }

  private async requestPermissions(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        Alert.alert(
          'Bildirim İzni',
          'Önemli güncellemeler için bildirim izni gerekiyor. Ayarlardan izni açabilirsiniz.',
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'Ayarlara Git', onPress: () => Linking.openSettings() },
          ]
        );
      }

      return enabled;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  private async getFCMToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      this.fcmToken = token;
      
      // Store token in AsyncStorage and send to backend
      await AsyncStorage.setItem('fcm_token', token);
      await this.registerTokenWithBackend(token);
      
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  private setupMessageHandlers(): void {
    // Handle foreground messages
    messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground message received:', remoteMessage);
      this.handleForegroundMessage(remoteMessage);
    });

    // Handle background/quit messages
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background message received:', remoteMessage);
    });

    // Handle notification open events
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification opened app:', remoteMessage);
      this.handleNotificationOpen(remoteMessage);
    });

    // Handle app launch from notification
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('App opened from notification:', remoteMessage);
          this.handleNotificationOpen(remoteMessage);
        }
      });

    // Handle token refresh
    messaging().onTokenRefresh((token) => {
      console.log('FCM token refreshed:', token);
      this.fcmToken = token;
      AsyncStorage.setItem('fcm_token', token);
      this.registerTokenWithBackend(token);
    });
  }

  private configureLocalNotifications(): void {
    PushNotification.configure({
      onRegister: (token) => {
        console.log('Local notification token:', token);
      },

      onNotification: (notification) => {
        console.log('Local notification received:', notification);
        this.handleLocalNotification(notification);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // Create notification channels for Android
    if (Platform.OS === 'android') {
      this.createNotificationChannels();
    }
  }

  private createNotificationChannels(): void {
    const channels = [
      {
        channelId: 'plan_updates',
        channelName: 'Plan Güncellemeleri',
        channelDescription: 'Plan durumu ve kullanım bildirimleri',
        importance: 4,
      },
      {
        channelId: 'payments',
        channelName: 'Ödeme Bildirimleri',
        channelDescription: 'Ödeme alma ve hata bildirimleri',
        importance: 4,
      },
      {
        channelId: 'customers',
        channelName: 'Müşteri Aktiviteleri',
        channelDescription: 'Yeni müşteri ve aktivite bildirimleri',
        importance: 3,
      },
      {
        channelId: 'security',
        channelName: 'Güvenlik Uyarıları',
        channelDescription: 'Güvenlik ile ilgili kritik bildirimler',
        importance: 4,
      },
    ];

    channels.forEach((channel) => {
      PushNotification.createChannel(
        {
          channelId: channel.channelId,
          channelName: channel.channelName,
          channelDescription: channel.channelDescription,
          importance: channel.importance,
          vibrate: true,
        },
        (created) => console.log(`Channel ${channel.channelId} created:`, created)
      );
    });
  }

  async sendLocalNotification(notification: NotificationData): Promise<void> {
    try {
      // Check preferences
      if (!this.shouldSendNotification(notification.type)) {
        return;
      }

      // Check quiet hours
      if (this.isQuietHours()) {
        // Schedule for later or skip
        return;
      }

      const notificationConfig = {
        id: notification.id,
        title: notification.title,
        message: notification.body,
        channelId: this.getChannelId(notification.type),
        priority: notification.priority || 'normal',
        vibrate: this.preferences.vibration,
        playSound: this.preferences.sound,
        soundName: 'default',
        userInfo: notification.data || {},
        date: notification.scheduled,
      };

      if (notification.scheduled) {
        PushNotification.localNotificationSchedule(notificationConfig);
      } else {
        PushNotification.localNotification(notificationConfig);
      }

      // Store notification in app state
      store.dispatch(addNotification({
        id: notification.id,
        title: notification.title,
        body: notification.body,
        type: notification.type,
        timestamp: Date.now(),
        read: false,
      }));

    } catch (error) {
      console.error('Failed to send local notification:', error);
    }
  }

  private handleForegroundMessage(remoteMessage: FirebaseMessagingTypes.RemoteMessage): void {
    if (remoteMessage.notification) {
      // Show local notification for foreground messages
      this.sendLocalNotification({
        id: remoteMessage.messageId || Date.now().toString(),
        title: remoteMessage.notification.title || 'Bildirim',
        body: remoteMessage.notification.body || '',
        type: (remoteMessage.data?.type as NotificationTypes) || 'GENERAL_UPDATE',
        data: remoteMessage.data,
      });
    }
  }

  private handleLocalNotification(notification: any): void {
    if (notification.userInteraction) {
      // User tapped the notification
      this.handleNotificationTap(notification);
    }
  }

  private handleNotificationOpen(remoteMessage: FirebaseMessagingTypes.RemoteMessage): void {
    // Handle deep linking based on notification data
    if (remoteMessage.data) {
      this.navigateFromNotification(remoteMessage.data);
    }
  }

  private handleNotificationTap(notification: any): void {
    // Handle local notification tap
    if (notification.userInfo) {
      this.navigateFromNotification(notification.userInfo);
    }
  }

  private navigateFromNotification(data: Record<string, any>): void {
    // This would typically use React Navigation
    // For now, we'll just log the action
    console.log('Navigate from notification:', data);
    
    // Example navigation logic:
    // if (data.screen) {
    //   NavigationService.navigate(data.screen, data.params);
    // }
  }

  private shouldSendNotification(type: NotificationTypes): boolean {
    return this.preferences.enabled && this.preferences.types[type];
  }

  private isQuietHours(): boolean {
    if (!this.preferences.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const start = this.preferences.quietHours.start;
    const end = this.preferences.quietHours.end;
    
    if (start <= end) {
      return currentTime >= start && currentTime <= end;
    } else {
      // Quiet hours span midnight
      return currentTime >= start || currentTime <= end;
    }
  }

  private getChannelId(type: NotificationTypes): string {
    switch (type) {
      case 'PLAN_USAGE_LOW':
      case 'PLAN_EXPIRED':
      case 'PLAN_ACTIVATED':
        return 'plan_updates';
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_FAILED':
        return 'payments';
      case 'NEW_CUSTOMER':
        return 'customers';
      case 'SECURITY_ALERT':
        return 'security';
      default:
        return 'plan_updates';
    }
  }

  private async registerTokenWithBackend(token: string): Promise<void> {
    try {
      const authState = store.getState().auth;
      if (!authState.walletAddress) return;

      // Send token to backend
      const response = await fetch(`${process.env.API_URL}/api/notifications/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.session.token}`,
        },
        body: JSON.stringify({
          walletAddress: authState.walletAddress,
          fcmToken: token,
          platform: Platform.OS,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register token');
      }
    } catch (error) {
      console.error('Failed to register FCM token with backend:', error);
    }
  }

  async updatePreferences(newPreferences: Partial<NotificationPreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...newPreferences };
    await AsyncStorage.setItem('notification_preferences', JSON.stringify(this.preferences));
  }

  private async loadPreferences(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('notification_preferences');
      if (stored) {
        this.preferences = { ...this.preferences, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  }

  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  async clearAllNotifications(): Promise<void> {
    PushNotification.cancelAllLocalNotifications();
  }

  async cancelNotification(id: string): Promise<void> {
    PushNotification.cancelLocalNotifications({ id });
  }

  // Pre-defined notification templates
  async sendPlanUsageLowNotification(planName: string, remainingUsage: number): Promise<void> {
    await this.sendLocalNotification({
      id: `usage_low_${Date.now()}`,
      title: 'Kullanım Hakkı Az Kaldı',
      body: `${planName} planınızda ${remainingUsage} kullanım hakkı kaldı.`,
      type: 'PLAN_USAGE_LOW',
      priority: 'high',
    });
  }

  async sendPaymentReceivedNotification(amount: string, planName: string): Promise<void> {
    await this.sendLocalNotification({
      id: `payment_${Date.now()}`,
      title: 'Ödeme Alındı',
      body: `${planName} planından ${amount} ödeme aldınız.`,
      type: 'PAYMENT_RECEIVED',
      priority: 'normal',
    });
  }

  async sendNewCustomerNotification(customerAddress: string, planName: string): Promise<void> {
    await this.sendLocalNotification({
      id: `customer_${Date.now()}`,
      title: 'Yeni Müşteri',
      body: `${planName} planınızı yeni bir müşteri satın aldı.`,
      type: 'NEW_CUSTOMER',
      priority: 'normal',
    });
  }
}

export default PushNotificationService.getInstance();
```

## 🔄 Background Sync Service

### Background Sync Service
```typescript
// src/services/sync/BackgroundSyncService.ts
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo';
import { store } from '@/store';
import { syncCustomerData } from '@/store/slices/customerSlice';
import { syncProducerData } from '@/store/slices/producerSlice';
import WebSocketService from '@/services/realtime/WebSocketService';

interface SyncOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'PLAN' | 'CUSTOMER_PLAN' | 'USAGE' | 'PAYMENT';
  data: any;
  timestamp: number;
  retries: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

interface SyncConfig {
  maxRetries: number;
  retryInterval: number;
  batchSize: number;
  syncInterval: number;
  offlineQueueLimit: number;
}

class BackgroundSyncService {
  private static instance: BackgroundSyncService;
  private syncQueue: SyncOperation[] = [];
  private isOnline = true;
  private isSyncing = false;
  private appState: AppStateStatus = 'active';
  private syncTimer: NodeJS.Timeout | null = null;
  private config: SyncConfig;

  public static getInstance(): BackgroundSyncService {
    if (!BackgroundSyncService.instance) {
      BackgroundSyncService.instance = new BackgroundSyncService();
    }
    return BackgroundSyncService.instance;
  }

  constructor() {
    this.config = {
      maxRetries: 3,
      retryInterval: 5000,
      batchSize: 10,
      syncInterval: 30000,
      offlineQueueLimit: 100,
    };
  }

  async initialize(): Promise<void> {
    try {
      // Load queued operations from storage
      await this.loadSyncQueue();
      
      // Listen to network state changes
      NetInfo.addEventListener((state) => {
        const wasOnline = this.isOnline;
        this.isOnline = state.isConnected ?? false;
        
        if (!wasOnline && this.isOnline) {
          // Back online, start syncing
          this.startSync();
        }
      });

      // Listen to app state changes
      AppState.addEventListener('change', this.handleAppStateChange);

      // Start periodic sync
      this.startPeriodicSync();

      console.log('Background sync service initialized');
    } catch (error) {
      console.error('Failed to initialize background sync:', error);
    }
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (this.appState === 'background' && nextAppState === 'active') {
      // App came to foreground, sync immediately
      this.startSync();
    }
    this.appState = nextAppState;
  };

  async queueOperation(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retries'>): Promise<void> {
    const fullOperation: SyncOperation = {
      ...operation,
      id: this.generateOperationId(),
      timestamp: Date.now(),
      retries: 0,
    };

    // Check queue limit
    if (this.syncQueue.length >= this.config.offlineQueueLimit) {
      // Remove oldest low priority operations
      this.syncQueue = this.syncQueue
        .filter(op => op.priority !== 'low')
        .slice(-(this.config.offlineQueueLimit - 1));
    }

    this.syncQueue.push(fullOperation);
    
    // Sort by priority and timestamp
    this.syncQueue.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      return a.timestamp - b.timestamp;
    });

    // Save to storage
    await this.saveSyncQueue();

    // Try to sync immediately if online
    if (this.isOnline && !this.isSyncing) {
      this.startSync();
    }
  }

  private async startSync(): Promise<void> {
    if (this.isSyncing || this.syncQueue.length === 0 || !this.isOnline) {
      return;
    }

    this.isSyncing = true;

    try {
      // Process operations in batches
      while (this.syncQueue.length > 0 && this.isOnline) {
        const batch = this.syncQueue.splice(0, this.config.batchSize);
        await this.processBatch(batch);
      }

      // Also sync latest data from server
      await this.syncFromServer();

    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.isSyncing = false;
      await this.saveSyncQueue();
    }
  }

  private async processBatch(operations: SyncOperation[]): Promise<void> {
    const results = await Promise.allSettled(
      operations.map(operation => this.processOperation(operation))
    );

    // Handle failed operations
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const operation = operations[index];
        operation.retries++;
        
        if (operation.retries <= this.config.maxRetries) {
          // Re-queue for retry
          this.syncQueue.unshift(operation);
        } else {
          console.error('Operation failed permanently:', operation);
          // Could store in failed operations for manual retry
        }
      }
    });
  }

  private async processOperation(operation: SyncOperation): Promise<void> {
    const authState = store.getState().auth;
    
    if (!authState.session.token) {
      throw new Error('No auth token available');
    }

    const endpoint = this.getEndpointForOperation(operation);
    const method = this.getMethodForOperation(operation);
    
    const response = await fetch(`${process.env.API_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authState.session.token}`,
      },
      body: operation.type !== 'DELETE' ? JSON.stringify(operation.data) : undefined,
      timeout: 10000,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Update local data with server response if needed
    const responseData = await response.json();
    this.updateLocalData(operation, responseData);
  }

  private getEndpointForOperation(operation: SyncOperation): string {
    switch (operation.entity) {
      case 'PLAN':
        return `/api/plans${operation.type === 'CREATE' ? '' : `/${operation.data.id}`}`;
      case 'CUSTOMER_PLAN':
        return `/api/customer-plans${operation.type === 'CREATE' ? '' : `/${operation.data.id}`}`;
      case 'USAGE':
        return `/api/usage`;
      case 'PAYMENT':
        return `/api/payments`;
      default:
        throw new Error(`Unknown entity type: ${operation.entity}`);
    }
  }

  private getMethodForOperation(operation: SyncOperation): string {
    switch (operation.type) {
      case 'CREATE':
        return 'POST';
      case 'UPDATE':
        return 'PUT';
      case 'DELETE':
        return 'DELETE';
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  private updateLocalData(operation: SyncOperation, responseData: any): void {
    // Update Redux store with server response
    // This ensures local data stays in sync with server
    console.log('Updating local data for operation:', operation.id);
  }

  private async syncFromServer(): Promise<void> {
    const authState = store.getState().auth;
    
    if (!authState.walletAddress || !authState.session.token) {
      return;
    }

    try {
      // Sync customer data if user is a customer
      if (authState.userType === 'customer') {
        await store.dispatch(syncCustomerData(authState.walletAddress));
      }
      
      // Sync producer data if user is a producer
      if (authState.userType === 'producer') {
        await store.dispatch(syncProducerData(authState.walletAddress));
      }

      console.log('Server sync completed');
    } catch (error) {
      console.error('Server sync failed:', error);
    }
  }

  private startPeriodicSync(): void {
    this.syncTimer = setInterval(() => {
      if (this.isOnline && this.appState === 'active') {
        this.startSync();
      }
    }, this.config.syncInterval);
  }

  private async loadSyncQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('sync_queue');
      if (stored) {
        this.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
      this.syncQueue = [];
    }
  }

  private async saveSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  private generateOperationId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async clearQueue(): Promise<void> {
    this.syncQueue = [];
    await AsyncStorage.removeItem('sync_queue');
  }

  getQueueStatus(): { pending: number; failed: number; isOnline: boolean; isSyncing: boolean } {
    const failed = this.syncQueue.filter(op => op.retries >= this.config.maxRetries).length;
    return {
      pending: this.syncQueue.length - failed,
      failed,
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
    };
  }

  async forceSync(): Promise<void> {
    if (this.isOnline) {
      await this.startSync();
    } else {
      throw new Error('Cannot sync while offline');
    }
  }

  destroy(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }
}

export default BackgroundSyncService.getInstance();
```

Bu Faz 5'in tamamlanmasıyla gerçek zamanlı izleme, push notification ve background sync sistemleri hazır olacak. Kullanıcılar önemli olaylardan anında haberdar olacaklar.
