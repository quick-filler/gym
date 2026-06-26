/**
 * Notifications inbox — /notifications (Fase 7c).
 *
 * Lists the caller's notifications (polled via useNotifications). Tapping one
 * marks it read and deep-links to its target route (data.route). "Marcar todas
 * como lidas" clears the badge. Pull-to-refresh + near-real-time polling.
 */

import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Bell,
  Calendar,
  CheckCheck,
  CreditCard,
  Dumbbell,
  Waves,
  type LucideIcon,
} from 'lucide-react-native';

import { useDashboard } from '../hooks/useDashboard';
import { useNotifications } from '../hooks/useNotifications';
import { theme, withAlpha } from '../lib/theme';
import type { NotificationView } from '../lib/types';

const ICONS: Record<string, LucideIcon> = {
  payment_paid: CreditCard,
  payment_due: CreditCard,
  booking_confirmed: Calendar,
  class_reminder: Calendar,
  workout_new: Dumbbell,
};

function iconFor(kind: string): LucideIcon {
  if (kind === 'workout_new') return Dumbbell;
  if (kind === 'pool') return Waves;
  return ICONS[kind] ?? Bell;
}

export default function NotificationsScreen() {
  const { data: dash } = useDashboard();
  const accent = dash?.academy.primaryColor ?? theme.ink900;
  const { items, unreadCount, loading, error, refetch, markRead, markAllRead } =
    useNotifications();

  const onTap = async (n: NotificationView) => {
    if (!n.read) await markRead(n.id);
    if (n.route && !n.route.startsWith('/admin')) {
      router.push(n.route as never);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back} activeOpacity={0.7}>
          <ArrowLeft size={20} color={theme.ink900} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>Notificações</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead} style={styles.markAll} activeOpacity={0.7}>
            <CheckCheck size={18} color={accent} strokeWidth={2} />
          </TouchableOpacity>
        ) : (
          <View style={styles.back} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading && items.length > 0} onRefresh={refetch} tintColor={accent} />
        }
      >
        {loading && items.length === 0 ? (
          <View style={styles.centerBox}>
            <ActivityIndicator color={accent} />
          </View>
        ) : error && items.length === 0 ? (
          <View style={styles.centerBox}>
            <Text style={styles.errTitle}>Não conseguimos carregar</Text>
            <Text style={styles.errBody}>{error.message}</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyBox}>
            <View style={[styles.emptyIcon, { backgroundColor: withAlpha(accent, 0.1) }]}>
              <Bell size={26} color={accent} strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
            <Text style={styles.emptyBody}>
              Você verá aqui avisos de cobranças, aulas e treinos.
            </Text>
          </View>
        ) : (
          items.map((n) => {
            const Icon = iconFor(n.kind);
            return (
              <TouchableOpacity
                key={n.id}
                activeOpacity={0.75}
                onPress={() => onTap(n)}
                style={[styles.row, !n.read && { backgroundColor: withAlpha(accent, 0.05) }]}
              >
                <View style={[styles.rowIcon, { backgroundColor: withAlpha(accent, 0.12) }]}>
                  <Icon size={18} color={accent} strokeWidth={2.2} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.rowTop}>
                    <Text style={[styles.rowTitle, !n.read && styles.rowTitleUnread]} numberOfLines={1}>
                      {n.title}
                    </Text>
                    <Text style={styles.rowTime}>{n.timeLabel}</Text>
                  </View>
                  {n.body ? (
                    <Text style={styles.rowBody} numberOfLines={2}>
                      {n.body}
                    </Text>
                  ) : null}
                </View>
                {!n.read ? <View style={[styles.dot, { backgroundColor: accent }]} /> : null}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.paper },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.line,
  },
  back: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  markAll: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '600', color: theme.ink900 },
  content: { paddingVertical: 8, flexGrow: 1 },

  centerBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64, gap: 10 },
  errTitle: { fontSize: 16, fontWeight: '800', color: theme.ink900 },
  errBody: { fontSize: 13, color: theme.ink500, textAlign: 'center', paddingHorizontal: 32 },

  emptyBox: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: theme.ink900 },
  emptyBody: { fontSize: 13.5, color: theme.ink500, marginTop: 6, textAlign: 'center', lineHeight: 20 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.line,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  rowTitle: { fontSize: 14.5, fontWeight: '600', color: theme.ink900, flex: 1 },
  rowTitleUnread: { fontWeight: '800' },
  rowTime: { fontSize: 11, color: theme.ink400, fontWeight: '500' },
  rowBody: { fontSize: 12.5, color: theme.ink500, marginTop: 2, lineHeight: 17 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
