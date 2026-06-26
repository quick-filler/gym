/**
 * Piscina tab — pool activities (aquatic fichas).
 *
 * Shown only when the academy enables the `pool` module (the tab is hidden
 * otherwise by `(tabs)/_layout.tsx`, and the API enforces it via
 * `requireModule`). A pool activity is a WorkoutPlan with `category: 'pool'`,
 * so this reuses the Treinos model/visuals (`usePoolActivities` →
 * `myPoolActivities`) and the shared execution flow (`/workout/[id]`).
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
import { ArrowRight, Play, Waves } from 'lucide-react-native';

import { useDashboard } from '../../hooks/useDashboard';
import { usePoolActivities } from '../../hooks/usePoolActivities';
import { theme, withAlpha } from '../../lib/theme';
import type { ActiveWorkoutPlan, UpcomingWorkoutPlan } from '../../lib/types';

export default function PoolScreen() {
  const { data } = useDashboard();
  const accent = data?.academy.primaryColor ?? theme.ink900;
  const academyName = data?.academy.name ?? 'Gym';
  const initials = data?.academy.initials ?? 'G';

  const { active, upcoming, loading, error, refetch } = usePoolActivities();
  const firstLoad = loading && !active && upcoming.length === 0;

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: accent }]}>
      <StatusBar barStyle="light-content" backgroundColor={accent} />
      <ScrollView
        style={{ backgroundColor: theme.paper }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading && !firstLoad} onRefresh={refetch} tintColor={accent} />
        }
      >
        <View style={[styles.header, { backgroundColor: accent }]}>
          <View style={styles.brand}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>{initials}</Text>
            </View>
            <Text style={styles.academyName}>{academyName}</Text>
          </View>
          <Text style={styles.eyebrow}>PISCINA</Text>
          <Text style={styles.title}>Atividades de piscina</Text>
        </View>

        <View style={styles.content}>
          {firstLoad ? (
            <View style={styles.centerBox}>
              <ActivityIndicator color={accent} />
              <Text style={styles.centerText}>Carregando atividades…</Text>
            </View>
          ) : error ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Não conseguimos carregar</Text>
              <Text style={styles.emptyBody}>{error.message}</Text>
              <TouchableOpacity
                onPress={refetch}
                style={[styles.cta, { backgroundColor: accent, alignSelf: 'center', marginTop: 16 }]}
                activeOpacity={0.85}
              >
                <Text style={styles.ctaText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.sectionLabel}>ATIVIDADE ATUAL</Text>
              {active ? (
                <ActivePoolCard plan={active} accent={accent} />
              ) : (
                <View style={styles.emptyCard}>
                  <View style={[styles.wIcon, { backgroundColor: withAlpha(accent, 0.1) }]}>
                    <Waves size={20} color={accent} strokeWidth={2.2} />
                  </View>
                  <Text style={styles.emptyTitle}>Sem atividade ativa</Text>
                  <Text style={styles.emptyBody}>
                    Você ainda não tem uma atividade de piscina. Fale com a
                    recepção da sua academia.
                  </Text>
                </View>
              )}

              {upcoming.length > 0 ? (
                <>
                  <Text style={styles.sectionLabel}>PRÓXIMAS ATIVIDADES</Text>
                  {upcoming.map((plan) => (
                    <UpcomingPoolCard key={plan.documentId} plan={plan} accent={accent} />
                  ))}
                </>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActivePoolCard({ plan, accent }: { plan: ActiveWorkoutPlan; accent: string }) {
  return (
    <View style={[styles.card, { borderColor: accent, borderWidth: 1.5 }]}>
      <View style={styles.wHead}>
        <View style={[styles.wIcon, { backgroundColor: withAlpha(accent, 0.1) }]}>
          <Waves size={20} color={accent} strokeWidth={2.2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.wName}>{plan.name}</Text>
          <Text style={styles.wMeta}>{plan.meta}</Text>
        </View>
        <View style={[styles.wTag, { backgroundColor: accent }]}>
          <Text style={styles.wTagText}>ATIVA</Text>
        </View>
      </View>

      <View style={styles.exList}>
        {plan.exercises.map((ex, i, arr) => (
          <View
            key={`${ex.num}-${ex.name}`}
            style={[styles.exRow, i === arr.length - 1 && styles.exRowLast]}
          >
            <View style={[styles.exNum, { backgroundColor: withAlpha(accent, 0.1) }]}>
              <Text style={[styles.exNumText, { color: accent }]}>{ex.num}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.exName}>{ex.name}</Text>
              <Text style={styles.exDetail}>{ex.detail}</Text>
            </View>
            <Text style={[styles.exLoad, { color: accent }]}>{ex.load}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.cta, { backgroundColor: accent }]}
        onPress={() => router.push(`/workout/${plan.documentId}`)}
      >
        <Play size={16} color="#fff" strokeWidth={2.5} />
        <Text style={styles.ctaText}>Iniciar atividade</Text>
      </TouchableOpacity>
    </View>
  );
}

function UpcomingPoolCard({ plan, accent }: { plan: UpcomingWorkoutPlan; accent: string }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={() => router.push(`/workout/${plan.documentId}`)}
    >
      <View style={[styles.wHead, { borderBottomWidth: 0, paddingBottom: 0 }]}>
        <View style={[styles.wIcon, { backgroundColor: withAlpha(accent, 0.1) }]}>
          <Waves size={20} color={accent} strokeWidth={2.2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.wName}>{plan.name}</Text>
          <Text style={styles.wMeta}>{plan.meta}</Text>
        </View>
        <ArrowRight size={16} color={theme.ink300} strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 32, flexGrow: 1, backgroundColor: theme.paper },

  header: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 28 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: -0.5 },
  academyName: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: -0.3 },
  eyebrow: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: { color: '#fff', fontSize: 28, fontWeight: '700', letterSpacing: -0.8, marginTop: 4 },

  content: {
    marginTop: -20,
    backgroundColor: theme.paper,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 24,
    minHeight: 320,
  },

  centerBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 56, gap: 12 },
  centerText: { fontSize: 13, color: theme.ink500 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.ink400,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 4,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.line,
    shadowColor: theme.ink900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  wHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.line,
  },
  wIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wName: { fontSize: 15, fontWeight: '700', color: theme.ink900, letterSpacing: -0.2 },
  wMeta: {
    fontSize: 11,
    color: theme.ink400,
    marginTop: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  wTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  wTagText: { color: '#fff', fontSize: 9.5, fontWeight: '800', letterSpacing: 0.5 },

  exList: { paddingVertical: 6 },
  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.line,
  },
  exRowLast: { borderBottomWidth: 0 },
  exNum: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  exNumText: { fontSize: 12, fontWeight: '800' },
  exName: { fontSize: 14, fontWeight: '600', color: theme.ink900 },
  exDetail: { fontSize: 11.5, color: theme.ink400, marginTop: 1 },
  exLoad: { fontSize: 13, fontWeight: '700' },

  cta: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
  },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.line,
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: theme.ink900, marginTop: 4 },
  emptyBody: {
    fontSize: 13,
    color: theme.ink500,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 19,
  },
});
