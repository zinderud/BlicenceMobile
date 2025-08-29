import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '../../types';

interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  language: 'tr' | 'en';
  notifications: {
    enabled: boolean;
    pushEnabled: boolean;
    emailEnabled: boolean;
    types: {
      planUpdates: boolean;
      payments: boolean;
      security: boolean;
      marketing: boolean;
    };
  };
  privacy: {
    analytics: boolean;
    crashReporting: boolean;
  };
  currency: 'ETH' | 'USD' | 'TRY';
  appNotifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  theme: 'system',
  language: 'tr',
  notifications: {
    enabled: true,
    pushEnabled: true,
    emailEnabled: true,
    types: {
      planUpdates: true,
      payments: true,
      security: true,
      marketing: false,
    },
  },
  privacy: {
    analytics: true,
    crashReporting: true,
  },
  currency: 'ETH',
  appNotifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<'tr' | 'en'>) => {
      state.language = action.payload;
    },
    setCurrency: (state, action: PayloadAction<'ETH' | 'USD' | 'TRY'>) => {
      state.currency = action.payload;
    },
    updateNotificationSettings: (state, action: PayloadAction<Partial<SettingsState['notifications']>>) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    updatePrivacySettings: (state, action: PayloadAction<Partial<SettingsState['privacy']>>) => {
      state.privacy = { ...state.privacy, ...action.payload };
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.appNotifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.appNotifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.appNotifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.appNotifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const notification = state.appNotifications[index];
        if (!notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.appNotifications.splice(index, 1);
      }
    },
    clearAllNotifications: (state) => {
      state.appNotifications = [];
      state.unreadCount = 0;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setTheme,
  setLanguage,
  setCurrency,
  updateNotificationSettings,
  updatePrivacySettings,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearAllNotifications,
  clearError,
} = settingsSlice.actions;

export default settingsSlice.reducer;
