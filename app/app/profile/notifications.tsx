/**
 * Notification preferences (Fase 7 follow-up / item 5).
 *
 * Opt-out per category: everything is on by default; toggling off stops *push*
 * delivery for that category (the in-app inbox still receives everything).
 * Backed by `myNotificationPreferences` / `updateMyNotificationPreferences`.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useMutation, useQuery } from '@apollo/client/react';

import {
  AppNotificationPreferencesDocument,
  AppUpdateNotificationPreferencesDocument,
} from '../../gql/graphql';
import { useDashboard } from '../../hooks/useDashboard';
import { USE_MOCKS } from '../../lib/config';
import { theme, withAlpha } from '../../lib/theme';

type PrefKey = 'payments' | 'classes' | 'workouts';

const CATEGORIES: Array<{ key: PrefKey; title: string; description: string }> = [
  { key: 'payments', title: 'Pagamentos', description: 'Cobranças a vencer e pagamentos confirmados' },
  { key: 'classes', title: 'Aulas', description: 'Reservas, lembretes de aula e vaga confirmada' },
  { key: 'workouts', title: 'Treinos', description: 'Novas fichas de treino e atividades de piscina' },
];

export default function NotificationPrefsScreen() {
  const { data: dash } = useDashboard();
  const accent = dash?.academy.primaryColor ?? theme.ink900;

  const q = useQuery<any>(AppNotificationPreferencesDocument, {
    skip: USE_MOCKS,
    fetchPolicy: 'cache-and-network',
  });
  const [updatePrefs] = useMutation<any>(AppUpdateNotificationPreferencesDocument);

  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>({
    payments: true,
    classes: true,
    workouts: true,
  });

  const hydrated = useRef(false);
  useEffect(() => {
    if (USE_MOCKS || hydrated.current) return;
    const p = q.data?.myNotificationPreferences;
    if (p) {
      hydrated.current = true;
      setPrefs({ payments: !!p.payments, classes: !!p.classes, workouts: !!p.workouts });
    }
  }, [q.data]);

  const toggle = async (key: PrefKey) => {
    const value = !prefs[key];
    setPrefs((p) => ({ ...p, [key]: value })); // optimistic
    if (USE_MOCKS) return;
    try {
      await updatePrefs({ variables: { input: { [key]: value } } });
    } catch {
      setPrefs((p) => ({ ...p, [key]: !value })); // revert on failure
    }
  };

  const firstLoad = !USE_MOCKS && q.loading && !q.data;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back} activeOpacity={0.7}>
          <ArrowLeft size={20} color={theme.ink900} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>Notificações</Text>
        <View style={styles.back} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Escolha o que quer receber por notificação no celular. As mensagens
          continuam disponíveis na sua caixa de entrada do app.
        </Text>

        {firstLoad ? (
          <ActivityIndicator color={accent} style={{ marginTop: 24 }} />
        ) : (
          <View style={styles.card}>
            {CATEGORIES.map((c, i) => (
              <View
                key={c.key}
                style={[styles.row, i === CATEGORIES.length - 1 && styles.rowLast]}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={styles.rowTitle}>{c.title}</Text>
                  <Text style={styles.rowDesc}>{c.description}</Text>
                </View>
                <Switch
                  value={prefs[c.key]}
                  onValueChange={() => toggle(c.key)}
                  trackColor={{ false: theme.line, true: withAlpha(accent, 0.5) }}
                  thumbColor={prefs[c.key] ? accent : '#fff'}
                  ios_backgroundColor={theme.line}
                />
              </View>
            ))}
          </View>
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
  title: { fontSize: 16, fontWeight: '600', color: theme.ink900 },
  content: { padding: 20, paddingBottom: 48 },
  intro: { fontSize: 13.5, color: theme.ink500, lineHeight: 20, marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.line,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.line,
  },
  rowLast: { borderBottomWidth: 0 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: theme.ink900 },
  rowDesc: { fontSize: 12.5, color: theme.ink400, marginTop: 3, lineHeight: 17 },
});
