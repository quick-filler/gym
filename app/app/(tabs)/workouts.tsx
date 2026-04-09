/**
 * Treinos tab — active workout plan + upcoming fichas + history.
 *
 * Mirrors `mockups/app-workouts.html`. The header carries three
 * progress stats (this week / 30 days / streak). The content area is
 * three sections: "FICHA ATUAL" (active plan with exercise list and a
 * start-workout CTA), "PRÓXIMAS FICHAS" (collapsed cards with just the
 * plan header), and "HISTÓRICO" (past sessions as single rows).
 *
 * Data:
 *   - Academy branding comes from `useDashboard()`.
 *   - Workouts content is read from `MOCK_WORKOUTS` directly. When
 *     the backend gains a `myWorkouts` query we swap this import for
 *     a `useWorkouts()` hook with the same shape.
 */

import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowRight,
  Clock,
  Dumbbell,
  Play,
} from 'lucide-react-native';

import { useDashboard } from '../../hooks/useDashboard';
import { MOCK_WORKOUTS } from '../../lib/mock-data';
import { theme, withAlpha } from '../../lib/theme';
import type { WorkoutPlanCard } from '../../lib/types';

export default function WorkoutsScreen() {
  const { data } = useDashboard();
  const accent = data?.academy.primaryColor ?? theme.ink900;
  const academyName = data?.academy.name ?? 'Gym';
  const initials = data?.academy.initials ?? 'G';

  const workouts = MOCK_WORKOUTS;

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: accent }]}
    >
      <StatusBar barStyle="light-content" backgroundColor={accent} />
      <ScrollView
        style={{ backgroundColor: theme.paper }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: accent }]}>
          <View style={styles.headerTop}>
            <View style={styles.brand}>
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>{initials}</Text>
              </View>
              <Text style={styles.academyName}>{academyName}</Text>
            </View>
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.7}
              accessibilityLabel="Histórico"
            >
              <Clock size={18} color="#fff" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
          <Text style={styles.eyebrow}>TREINOS</Text>
          <Text style={styles.title}>Minhas fichas</Text>

          {/* Progress stats */}
          <View style={styles.statsRow}>
            <StatCell
              label="Esta semana"
              value={workouts.stats.thisWeek}
              delta={workouts.stats.thisWeekDelta}
            />
            <StatCell
              label="Total · 30d"
              value={workouts.stats.thirtyDays}
              delta={workouts.stats.thirtyDaysDelta}
            />
            <StatCell
              label="Sequência"
              value={workouts.stats.streak}
              delta={workouts.stats.streakDelta}
            />
          </View>
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          <Text style={styles.sectionLabel}>FICHA ATUAL</Text>
          <ActiveWorkoutCard plan={workouts.active} accent={accent} />

          <Text style={styles.sectionLabel}>PRÓXIMAS FICHAS</Text>
          {workouts.upcoming.map((plan) => (
            <UpcomingWorkoutCard key={plan.id} plan={plan} accent={accent} />
          ))}

          <Text style={styles.sectionLabel}>HISTÓRICO</Text>
          {workouts.history.map((entry) => (
            <TouchableOpacity
              key={entry.id}
              activeOpacity={0.8}
              style={styles.historyRow}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.historyName}>{entry.name}</Text>
                <Text style={styles.historyMeta}>{entry.meta}</Text>
              </View>
              <ArrowRight size={16} color={theme.ink300} strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ==================================================================
 * ACTIVE WORKOUT — full card with exercise list + CTA
 * ================================================================ */
function ActiveWorkoutCard({
  plan,
  accent,
}: {
  plan: WorkoutPlanCard;
  accent: string;
}) {
  return (
    <View style={[styles.workoutCard, { borderColor: accent, borderWidth: 1.5 }]}>
      <View style={styles.wHead}>
        <View
          style={[
            styles.wIcon,
            { backgroundColor: withAlpha(accent, 0.1) },
          ]}
        >
          <Dumbbell size={20} color={accent} strokeWidth={2.2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.wName}>{plan.name}</Text>
          <Text style={styles.wMeta}>{plan.meta}</Text>
        </View>
        <View style={[styles.wTag, { backgroundColor: accent }]}>
          <Text style={styles.wTagText}>EM ANDAMENTO</Text>
        </View>
      </View>

      <View style={styles.exList}>
        {plan.exercises.map((ex, i, arr) => (
          <View
            key={`${ex.num}-${ex.name}`}
            style={[
              styles.exRow,
              i === arr.length - 1 && styles.exRowLast,
            ]}
          >
            <View
              style={[
                styles.exNum,
                { backgroundColor: withAlpha(accent, 0.1) },
              ]}
            >
              <Text style={[styles.exNumText, { color: accent }]}>
                {ex.num}
              </Text>
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
      >
        <Play size={16} color="#fff" strokeWidth={2.5} />
        <Text style={styles.ctaText}>Iniciar treino</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ==================================================================
 * UPCOMING WORKOUT — collapsed card with just the plan header
 * ================================================================ */
function UpcomingWorkoutCard({
  plan,
  accent,
}: {
  plan: { id: string; name: string; meta: string };
  accent: string;
}) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.workoutCard}>
      <View style={[styles.wHead, { borderBottomWidth: 0, paddingBottom: 0 }]}>
        <View
          style={[
            styles.wIcon,
            { backgroundColor: withAlpha(accent, 0.1) },
          ]}
        >
          <Dumbbell size={20} color={accent} strokeWidth={2.2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.wName}>{plan.name}</Text>
          <Text style={styles.wMeta}>{plan.meta}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* ==================================================================
 * STAT CELL — one of the three progress stats in the header
 * ================================================================ */
function StatCell({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statDelta}>{delta}</Text>
    </View>
  );
}

/* ==================================================================
 * STYLES
 * ================================================================ */
const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 32 },

  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
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
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.8,
    marginTop: 4,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  statCell: {
    flex: 1,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: -0.5,
  },
  statDelta: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 10,
    marginTop: 3,
    fontWeight: '500',
  },

  content: {
    marginTop: -20,
    backgroundColor: theme.paper,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 24,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.ink400,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 10,
    paddingHorizontal: 4,
  },

  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
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
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.ink900,
    letterSpacing: -0.2,
  },
  wMeta: {
    fontSize: 10,
    color: theme.ink400,
    marginTop: 3,
    letterSpacing: 0.5,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  wTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  wTagText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  exList: { marginTop: 10 },
  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.paper2,
  },
  exRowLast: { borderBottomWidth: 0 },
  exNum: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exNumText: { fontWeight: '800', fontSize: 11 },
  exName: { fontSize: 14, fontWeight: '600', color: theme.ink900 },
  exDetail: { fontSize: 11, color: theme.ink400, marginTop: 1 },
  exLoad: { fontSize: 12, fontWeight: '800' },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    paddingVertical: 13,
    borderRadius: 14,
  },
  ctaText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  historyName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.ink700,
  },
  historyMeta: {
    fontSize: 10,
    color: theme.ink400,
    marginTop: 3,
    letterSpacing: 0.5,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
