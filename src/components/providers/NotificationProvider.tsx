import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  initializeNotifications,
  updateConnectionStatus,
  handleWebSocketMessage,
  setShowNotificationCenter,
} from '../../store/slices/notificationSlice';
import WebSocketService from '../../services/WebSocketService';
import NotificationCenter from '../notifications/NotificationCenter';

interface NotificationProviderProps {
  children: React.ReactNode;
}

const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { showNotificationCenter } = useAppSelector(state => state.notifications);

  useEffect(() => {
    // Notification sistemi başlat
    if (user?.id) {
      dispatch(initializeNotifications(user.id));
    }

    // WebSocket status listener
    const statusListener = (status: any) => {
      dispatch(updateConnectionStatus(status));
    };

    // WebSocket message listener
    const messageListener = (message: any) => {
      dispatch(handleWebSocketMessage(message));
    };

    WebSocketService.addStatusListener(statusListener);
    WebSocketService.addMessageListener('plan_update', messageListener);
    WebSocketService.addMessageListener('price_change', messageListener);
    WebSocketService.addMessageListener('usage_update', messageListener);
    WebSocketService.addMessageListener('nft_update', messageListener);
    WebSocketService.addMessageListener('system_message', messageListener);

    return () => {
      // Cleanup listeners
      WebSocketService.removeStatusListener(statusListener);
      WebSocketService.removeMessageListener('plan_update', messageListener);
      WebSocketService.removeMessageListener('price_change', messageListener);
      WebSocketService.removeMessageListener('usage_update', messageListener);
      WebSocketService.removeMessageListener('nft_update', messageListener);
      WebSocketService.removeMessageListener('system_message', messageListener);
    };
  }, [user?.id, dispatch]);

  return (
    <>
      {children}
      <NotificationCenter
        visible={showNotificationCenter}
        onClose={() => dispatch(setShowNotificationCenter(false))}
      />
    </>
  );
};

export default NotificationProvider;
