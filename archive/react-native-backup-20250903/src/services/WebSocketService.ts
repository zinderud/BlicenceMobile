import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WebSocketMessage {
  type: 'plan_update' | 'price_change' | 'usage_update' | 'nft_update' | 'system_message';
  payload: any;
  timestamp: string;
  userId?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  reconnectAttempts: number;
  lastConnected?: string;
  lastError?: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig = {
    url: 'wss://api.blicence.com/ws', // Mock URL
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
    heartbeatInterval: 30000,
  };
  
  private connectionStatus: ConnectionStatus = {
    connected: false,
    reconnectAttempts: 0,
  };

  private listeners: Map<string, ((message: WebSocketMessage) => void)[]> = new Map();
  private statusListeners: ((status: ConnectionStatus) => void)[] = [];
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isIntentionalClose = false;

  // WebSocket bağlantısını başlat
  async connect(userId?: string): Promise<void> {
    try {
      this.isIntentionalClose = false;
      
      // Mock WebSocket bağlantısı (gerçek implementasyonda WebSocket kullanılacak)
      console.log('Connecting to WebSocket:', this.config.url);
      
      // Gerçek WebSocket kodu:
      // this.ws = new WebSocket(this.config.url);
      
      // Mock bağlantı simülasyonu
      setTimeout(() => {
        this.handleConnectionOpen();
        
        // Mock message simulation
        this.startMockMessageSimulation();
      }, 1000);

    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleConnectionError(error as Error);
    }
  }

  // WebSocket bağlantısını kapat
  disconnect(): void {
    this.isIntentionalClose = true;
    this.clearTimers();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.updateConnectionStatus({
      connected: false,
      reconnectAttempts: 0,
    });
  }

  // Mesaj gönder
  sendMessage(message: Omit<WebSocketMessage, 'timestamp'>): void {
    if (!this.connectionStatus.connected) {
      console.warn('WebSocket not connected, message not sent:', message);
      return;
    }

    const fullMessage: WebSocketMessage = {
      ...message,
      timestamp: new Date().toISOString(),
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(fullMessage));
    } else {
      console.log('Mock WebSocket send:', fullMessage);
    }
  }

  // Mesaj dinleyici ekle
  addMessageListener(type: WebSocketMessage['type'], callback: (message: WebSocketMessage) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);
  }

  // Mesaj dinleyici kaldır
  removeMessageListener(type: WebSocketMessage['type'], callback: (message: WebSocketMessage) => void): void {
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      const index = typeListeners.indexOf(callback);
      if (index > -1) {
        typeListeners.splice(index, 1);
      }
    }
  }

  // Bağlantı durumu dinleyici ekle
  addStatusListener(callback: (status: ConnectionStatus) => void): void {
    this.statusListeners.push(callback);
    // Mevcut durumu hemen gönder
    callback(this.connectionStatus);
  }

  // Bağlantı durumu dinleyici kaldır
  removeStatusListener(callback: (status: ConnectionStatus) => void): void {
    const index = this.statusListeners.indexOf(callback);
    if (index > -1) {
      this.statusListeners.splice(index, 1);
    }
  }

  // Bağlantı durumunu getir
  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  // Yapılandırmayı güncelle
  updateConfig(newConfig: Partial<WebSocketConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Private methods
  private handleConnectionOpen(): void {
    console.log('WebSocket connected (mock)');
    
    this.updateConnectionStatus({
      connected: true,
      reconnectAttempts: 0,
      lastConnected: new Date().toISOString(),
      lastError: undefined,
    });

    this.startHeartbeat();
  }

  private handleConnectionClose(event?: CloseEvent): void {
    console.log('WebSocket disconnected:', event);
    
    this.clearTimers();
    
    this.updateConnectionStatus({
      connected: false,
      lastError: event ? `Connection closed: ${event.code} - ${event.reason}` : 'Connection closed',
    });

    // Otomatik yeniden bağlanma
    if (!this.isIntentionalClose && this.connectionStatus.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  private handleConnectionError(error: Error): void {
    console.error('WebSocket error:', error);
    
    this.updateConnectionStatus({
      connected: false,
      lastError: error.message,
    });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      console.log('WebSocket message received:', message);
      
      // Mesajı ilgili dinleyicilere ilet
      const typeListeners = this.listeners.get(message.type);
      if (typeListeners) {
        typeListeners.forEach(callback => callback(message));
      }
      
      // Tüm mesaj dinleyicilerine de ilet
      const allListeners = this.listeners.get('*' as any);
      if (allListeners) {
        allListeners.forEach(callback => callback(message));
      }
      
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.connectionStatus.connected) {
        this.sendMessage({
          type: 'system_message',
          payload: { type: 'heartbeat' },
        });
      }
    }, this.config.heartbeatInterval);
  }

  private scheduleReconnect(): void {
    this.connectionStatus.reconnectAttempts++;
    
    console.log(`Scheduling reconnect attempt ${this.connectionStatus.reconnectAttempts}/${this.config.maxReconnectAttempts}`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.config.reconnectInterval);
  }

  private clearTimers(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private updateConnectionStatus(updates: Partial<ConnectionStatus>): void {
    this.connectionStatus = { ...this.connectionStatus, ...updates };
    
    // Tüm dinleyicilere durumu bildir
    this.statusListeners.forEach(callback => callback(this.connectionStatus));
    
    // Durumu kaydet
    this.saveConnectionStatus();
  }

  private async saveConnectionStatus(): Promise<void> {
    try {
      await AsyncStorage.setItem('websocket_status', JSON.stringify(this.connectionStatus));
    } catch (error) {
      console.error('Failed to save WebSocket status:', error);
    }
  }

  private async loadConnectionStatus(): Promise<void> {
    try {
      const statusJson = await AsyncStorage.getItem('websocket_status');
      if (statusJson) {
        const savedStatus = JSON.parse(statusJson);
        this.connectionStatus = { ...this.connectionStatus, ...savedStatus, connected: false };
      }
    } catch (error) {
      console.error('Failed to load WebSocket status:', error);
    }
  }

  // Mock message simulation for development
  private startMockMessageSimulation(): void {
    // Simulate periodic messages
    const mockMessages: WebSocketMessage[] = [
      {
        type: 'plan_update',
        payload: {
          planId: 'plan-123',
          status: 'active',
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        timestamp: new Date().toISOString(),
      },
      {
        type: 'price_change',
        payload: {
          planId: 'plan-456',
          oldPrice: 100,
          newPrice: 85,
          effectiveDate: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      },
      {
        type: 'usage_update',
        payload: {
          planId: 'plan-123',
          usagePercentage: 75,
          remainingQuota: 250,
        },
        timestamp: new Date().toISOString(),
      },
    ];

    let messageIndex = 0;
    
    setInterval(() => {
      if (this.connectionStatus.connected && mockMessages.length > 0) {
        const message = mockMessages[messageIndex % mockMessages.length];
        message.timestamp = new Date().toISOString();
        
        console.log('Mock WebSocket message:', message);
        
        // Mesajı dinleyicilere ilet
        const typeListeners = this.listeners.get(message.type);
        if (typeListeners) {
          typeListeners.forEach(callback => callback(message));
        }
        
        messageIndex++;
      }
    }, 15000); // Her 15 saniyede bir mock mesaj
  }
}

export default new WebSocketService();
