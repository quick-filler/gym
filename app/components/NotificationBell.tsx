/**
 * NotificationBell — header bell with the live unread badge (Fase 7c/7e).
 *
 * Shared by the dashboard + the Agenda / Treinos / Piscina / Finanças tabs.
 * Polls the unread count (via useNotifications) and deep-links to the inbox.
 * Styled for the accent-colored headers (white icon, translucent circle).
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Bell } from 'lucide-react-native';

import { useNotifications } from '../hooks/useNotifications';

export function NotificationBell({ iconColor = '#fff' }: { iconColor?: string }) {
  const { unreadCount } = useNotifications();
  return (
    <TouchableOpacity
      style={styles.iconBtn}
      activeOpacity={0.7}
      onPress={() => router.push('/notifications')}
      accessibilityLabel={
        unreadCount > 0 ? `Notificações (${unreadCount} não lidas)` : 'Notificações'
      }
    >
      {unreadCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
        </View>
      ) : null}
      <Bell size={18} color={iconColor} strokeWidth={2.2} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  badgeText: { color: '#fff', fontSize: 9.5, fontWeight: '800' },
});
