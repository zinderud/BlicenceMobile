import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppSelector, useAppDispatch } from '../../store';
import { setShowNotificationCenter } from '../../store/slices/notificationSlice';

interface NotificationBadgeProps {
  style?: any;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  style,
  size = 'medium',
  showCount = true,
}) => {
  const dispatch = useAppDispatch();
  const { unreadCount } = useAppSelector(state => state.notifications);

  const handlePress = () => {
    dispatch(setShowNotificationCenter(true));
  };

  if (!showCount && unreadCount === 0) {
    return null;
  }

  const sizeStyles = {
    small: {
      container: { width: 16, height: 16 },
      text: { fontSize: 10 },
    },
    medium: {
      container: { width: 20, height: 20 },
      text: { fontSize: 12 },
    },
    large: {
      container: { width: 24, height: 24 },
      text: { fontSize: 14 },
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <TouchableOpacity onPress={handlePress} style={[styles.container, style]}>
      <Text style={styles.icon}>🔔</Text>
      {unreadCount > 0 && (
        <View style={[styles.badge, currentSize.container]}>
          <Text style={[styles.badgeText, currentSize.text]}>
            {unreadCount > 99 ? '99+' : unreadCount.toString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 8,
  },
  icon: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default NotificationBadge;
