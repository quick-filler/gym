/**
 * Gym — student app home screen (single-screen demo).
 *
 * Architecture:
 *   1. The `<Root>` wrapper conditionally installs an Apollo provider
 *      when the app is in API mode — mocks mode skips Apollo entirely
 *      so the dev bundle is smaller.
 *   2. `<HomeScreen>` consumes `useDashboard()` which returns the same
 *      shape regardless of data source. It renders one of three states:
 *        - loading  → <SkeletonHome>
 *        - error    → <ErrorHome>
 *        - success  → <DashboardHome>
 *   3. API mode NEVER falls back to mocks. If the query fails, the
 *      user sees an error card with a retry button — full stop.
 *
 * To flip modes: set `EXPO_PUBLIC_USE_MOCKS=false` in `app/.env` and
 * restart the dev server. The env var is inlined at build time, so
 * the branch is fixed for the lifetime of the bundle.
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { USE_MOCKS } from './lib/config';
import { useDashboard } from './hooks/useDashboard';
import { Skeleton, SkeletonLines } from './components/Skeleton';
import type { DashboardData } from './lib/types';

// Only imported in API mode. Kept as a conditional import pattern so
// mocks-mode bundles don't pull Apollo into the JS bundle at all.
const { ApolloClientProvider } = USE_MOCKS
  ? { ApolloClientProvider: PassThroughProvider }
  : require('./lib/apollo-provider');

/* ==================================================================
 * ROOT
 * ================================================================ */
export default function App() {
  return (
    <ApolloClientProvider>
      <HomeScreen />
    </ApolloClientProvider>
  );
}

function PassThroughProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/* ==================================================================
 * HOME SCREEN — loading / error / success switch
 * ================================================================ */
function HomeScreen() {
  const { data, loading, error, refetch } = useDashboard();

  // Loading state (API mode only — mocks resolve synchronously)
  if (loading && !data) {
    return <SkeletonHome />;
  }

  // Error state — no fallback to mocks, ever.
  if (error) {
    return <ErrorHome error={error} onRetry={refetch} />;
  }

  // Empty state — the query succeeded but returned nothing.
  if (!data) {
    return <EmptyHome />;
  }

  return <DashboardHome data={data} />;
}

/* ==================================================================
 * DASHBOARD — the happy path
 * ================================================================ */
function DashboardHome({ data }: { data: DashboardData }) {
  const accent = data.academy.primaryColor;
  const accentDark = data.academy.primaryDark;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]}>
      <StatusBar barStyle="light-content" backgroundColor={accent} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: accent }]}>
          <View style={styles.headerTop}>
            <View style={styles.brand}>
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>{data.academy.initials}</Text>
              </View>
              <View>
                <Text style={styles.academyName}>{data.academy.name}</Text>
                {data.academy.tagline ? (
                  <Text style={styles.academyTag}>{data.academy.tagline}</Text>
                ) : null}
              </View>
            </View>
            <View style={styles.iconBtn}>
              <View style={[styles.notifDot, { borderColor: accent }]} />
              <Text style={styles.iconBtnText}>●</Text>
            </View>
          </View>
          <Text style={styles.welcome}>Bem-vindo de volta,</Text>
          <Text style={styles.welcomeName}>{data.student.name} 💪</Text>
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          {/* NEXT CLASS HERO — only shown if we actually have one */}
          {data.nextClass ? (
            <View
              style={[
                styles.classCard,
                { backgroundColor: accent, shadowColor: accentDark },
              ]}
            >
              <View style={styles.classBadge}>
                <Text style={styles.classBadgeText}>PRÓXIMA AULA</Text>
              </View>
              <Text style={styles.className}>{data.nextClass.name}</Text>
              <View style={styles.classMeta}>
                <Text style={styles.classMetaText}>
                  {data.nextClass.timeLabel}
                </Text>
                <Text style={styles.classMetaDivider}>·</Text>
                <Text style={styles.classMetaText}>{data.nextClass.room}</Text>
              </View>
              <TouchableOpacity style={styles.classCta} activeOpacity={0.85}>
                <Text style={styles.classCtaText}>
                  {data.nextClass.booked ? '✓ Reserva confirmada' : 'Reservar'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* QUICK ACTIONS */}
          <View style={styles.actionsRow}>
            {[
              { label: 'Agenda',   emoji: '📅' },
              { label: 'Treino',   emoji: '💪' },
              { label: 'Finanças', emoji: '💳' },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.actionBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.actionEmoji}>{item.emoji}</Text>
                <Text style={styles.actionLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* PAYMENT STATUS */}
          {data.enrollment ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardLabel}>FINANCEIRO</Text>
                  <Text style={styles.cardTitle}>Situação do plano</Text>
                </View>
                <StatusPill status={data.enrollment.status} />
              </View>
              <Row k="Plano" v={data.enrollment.planName} />
              <Row k="Valor" v={data.enrollment.amount} emphasize accent={accent} />
              <Row k="Vencimento" v={data.enrollment.dueDate} />
              <Row k="Forma de pagamento" v={data.enrollment.method} last />
            </View>
          ) : null}

          {/* CURRENT WORKOUT */}
          {data.workout ? (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>TREINO ATUAL</Text>
              <View style={styles.workoutHeader}>
                <View
                  style={[
                    styles.workoutIcon,
                    { backgroundColor: withAlpha(accent, 0.1) },
                  ]}
                >
                  <Text style={styles.workoutIconText}>🏋️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.workoutName}>{data.workout.name}</Text>
                  <Text style={styles.workoutMeta}>
                    {data.workout.updatedLabel}
                  </Text>
                </View>
              </View>
              {data.workout.exercises.map((ex, i, arr) => (
                <ExerciseRow
                  key={`${ex.num}-${ex.name}`}
                  num={ex.num}
                  name={ex.name}
                  detail={ex.detail}
                  load={ex.load}
                  accent={accent}
                  last={i === arr.length - 1}
                />
              ))}
            </View>
          ) : null}

          <View
            style={[
              styles.modeBanner,
              { borderColor: USE_MOCKS ? theme.line : '#a7f3d0' },
            ]}
          >
            <Text style={styles.modeBannerTitle}>
              {USE_MOCKS ? 'Modo demonstração' : 'Conectado ao backend'}
            </Text>
            <Text style={styles.modeBannerBody}>
              {USE_MOCKS
                ? 'Dados estáticos locais. Defina EXPO_PUBLIC_USE_MOCKS=false no .env para rodar contra o GraphQL de verdade.'
                : 'Lendo do backend via Apollo Client + GraphQL codegen. Nunca cai pros mocks automaticamente.'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        {[
          { label: 'Início',   emoji: '🏠', active: true  },
          { label: 'Agenda',   emoji: '📅', active: false },
          { label: 'Treinos',  emoji: '💪', active: false },
          { label: 'Finanças', emoji: '💳', active: false },
          { label: 'Perfil',   emoji: '👤', active: false },
        ].map((tab) => (
          <View key={tab.label} style={styles.navTab}>
            <Text
              style={[
                styles.navEmoji,
                tab.active && { opacity: 1 },
              ]}
            >
              {tab.emoji}
            </Text>
            <Text
              style={[
                styles.navLabel,
                tab.active && { color: accent },
              ]}
            >
              {tab.label}
            </Text>
            {tab.active ? (
              <View style={[styles.navDot, { backgroundColor: accent }]} />
            ) : null}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

/* ==================================================================
 * SKELETON — shown while the API query is in flight
 * ================================================================ */
function SkeletonHome() {
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.paper2} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER SKELETON — paper-toned instead of accent since we
            don't know the academy color yet */}
        <View style={[styles.header, { backgroundColor: theme.paper2 }]}>
          <View style={styles.headerTop}>
            <View style={styles.brand}>
              <Skeleton width={44} height={44} radius={13} />
              <View style={{ gap: 6 }}>
                <Skeleton width={120} height={16} radius={4} />
                <Skeleton width={90} height={10} radius={3} />
              </View>
            </View>
            <Skeleton width={36} height={36} radius={18} />
          </View>
          <Skeleton width={160} height={12} radius={4} style={{ marginTop: 6 }} />
          <Skeleton width={140} height={26} radius={6} style={{ marginTop: 8 }} />
        </View>

        <View style={styles.content}>
          {/* HERO CLASS SKELETON */}
          <View style={styles.skeletonHeroCard}>
            <Skeleton width={110} height={18} radius={999} />
            <Skeleton
              width="70%"
              height={22}
              radius={6}
              style={{ marginTop: 10 }}
            />
            <Skeleton
              width="55%"
              height={12}
              radius={4}
              style={{ marginTop: 8 }}
            />
            <Skeleton
              width={150}
              height={36}
              radius={999}
              style={{ marginTop: 16 }}
            />
          </View>

          {/* ACTIONS */}
          <View style={styles.actionsRow}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.actionBtn}>
                <Skeleton width={28} height={28} radius={8} />
                <Skeleton
                  width={50}
                  height={10}
                  radius={3}
                  style={{ marginTop: 8 }}
                />
              </View>
            ))}
          </View>

          {/* PAYMENT CARD */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ gap: 6 }}>
                <Skeleton width={80} height={10} radius={3} />
                <Skeleton width={140} height={16} radius={4} />
              </View>
              <Skeleton width={60} height={18} radius={999} />
            </View>
            <SkeletonLines lines={4} gap={14} />
          </View>

          {/* WORKOUT CARD */}
          <View style={styles.card}>
            <Skeleton width={90} height={10} radius={3} />
            <View style={[styles.workoutHeader, { marginTop: 12 }]}>
              <Skeleton width={44} height={44} radius={12} />
              <View style={{ gap: 6, flex: 1 }}>
                <Skeleton width="80%" height={14} radius={4} />
                <Skeleton width="50%" height={10} radius={3} />
              </View>
            </View>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={styles.exRow}>
                <Skeleton width={28} height={28} radius={8} />
                <View style={{ gap: 4, flex: 1 }}>
                  <Skeleton width="70%" height={12} radius={3} />
                  <Skeleton width="40%" height={10} radius={3} />
                </View>
                <Skeleton width={40} height={12} radius={3} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ==================================================================
 * ERROR — no fallback, just a retry card
 * ================================================================ */
function ErrorHome({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.paper} />
      <View style={styles.errorContainer}>
        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>!</Text>
        </View>
        <Text style={styles.errorTitle}>Não conseguimos carregar</Text>
        <Text style={styles.errorBody}>
          O backend não respondeu. Verifique se você está online e tente de novo.
          Nenhum dado de exemplo é exibido — a gente só mostra dados reais.
        </Text>
        <View style={styles.errorDetailBox}>
          <Text style={styles.errorDetailLabel}>DETALHE TÉCNICO</Text>
          <Text style={styles.errorDetailText} numberOfLines={4}>
            {error.message}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onRetry}
          style={styles.retryBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.retryBtnText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ==================================================================
 * EMPTY — query succeeded but nothing to render
 * ================================================================ */
function EmptyHome() {
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]}>
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Nada por aqui ainda</Text>
        <Text style={styles.errorBody}>
          Sua conta ainda não tem matrícula ativa nem ficha de treino. Fale com a recepção da sua academia.
        </Text>
      </View>
    </SafeAreaView>
  );
}

/* ==================================================================
 * SUB-COMPONENTS
 * ================================================================ */

function StatusPill({
  status,
}: {
  status: NonNullable<DashboardData['enrollment']>['status'];
}) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    em_dia:   { label: 'EM DIA',    bg: theme.emerald50, color: theme.emerald },
    pendente: { label: 'PENDENTE',  bg: '#fffbeb',       color: '#d97706'     },
    atrasado: { label: 'EM ATRASO', bg: '#fef2f2',       color: '#be123c'     },
  };
  const s = map[status] ?? map.em_dia;
  return (
    <View style={[styles.statusPill, { backgroundColor: s.bg }]}>
      <Text style={[styles.statusPillText, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}

function Row({
  k,
  v,
  emphasize = false,
  accent,
  last = false,
}: {
  k: string;
  v: string;
  emphasize?: boolean;
  accent?: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <Text style={styles.rowK}>{k}</Text>
      <Text
        style={[
          styles.rowV,
          emphasize && { color: accent ?? theme.ink900, fontSize: 15, fontWeight: '800' },
        ]}
      >
        {v}
      </Text>
    </View>
  );
}

function ExerciseRow({
  num,
  name,
  detail,
  load,
  accent,
  last = false,
}: {
  num: number;
  name: string;
  detail: string;
  load: string;
  accent: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.exRow, last && styles.rowLast]}>
      <View style={[styles.exNum, { backgroundColor: withAlpha(accent, 0.1) }]}>
        <Text style={[styles.exNumText, { color: accent }]}>{num}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.exName}>{name}</Text>
        <Text style={styles.exDetail}>{detail}</Text>
      </View>
      <Text style={[styles.exLoad, { color: accent }]}>{load}</Text>
    </View>
  );
}

/* ==================================================================
 * UTILS
 * ================================================================ */

function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return `rgba(239, 68, 68, ${alpha})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ==================================================================
 * THEME + STYLES
 * ================================================================ */

const theme = {
  paper:     '#faf8f5',
  paper2:    '#f3efe8',
  paper3:    '#e7e2d9',
  ink900:    '#0c0a09',
  ink700:    '#292524',
  ink600:    '#44403c',
  ink500:    '#57534e',
  ink400:    '#78716c',
  ink300:    '#a8a29e',
  emerald:   '#059669',
  emerald50: '#ecfdf5',
  line:      '#e7e2d9',
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 100 },

  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
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
  academyTag: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  iconBtnText: { color: '#fff', fontSize: 16 },
  notifDot: {
    position: 'absolute', top: 6, right: 6,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#fbbf24',
    borderWidth: 2,
  },
  welcome: { color: 'rgba(255,255,255,0.78)', fontSize: 14 },
  welcomeName: {
    color: '#fff', fontSize: 28, fontWeight: '700', letterSpacing: -0.8, marginTop: 2,
  },

  content: {
    marginTop: -20,
    backgroundColor: theme.paper,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 24,
  },

  classCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 6,
  },
  classBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
  },
  classBadgeText: {
    color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5,
  },
  className: {
    color: '#fff', fontSize: 22, fontWeight: '700', letterSpacing: -0.5,
    marginBottom: 6,
  },
  classMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  classMetaText: { color: 'rgba(255,255,255,0.82)', fontSize: 13 },
  classMetaDivider: { color: 'rgba(255,255,255,0.5)' },
  classCta: {
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  classCtaText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  skeletonHeroCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.line,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: theme.line,
    alignItems: 'center',
  },
  actionEmoji: { fontSize: 22, marginBottom: 4 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: theme.ink600 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.line,
    shadowColor: theme.ink900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 10, fontWeight: '700', color: theme.ink400,
    letterSpacing: 0.8,
  },
  cardTitle: {
    fontSize: 15, fontWeight: '700', color: theme.ink900,
    marginTop: 3, letterSpacing: -0.2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusPillText: {
    fontSize: 10, fontWeight: '800', letterSpacing: 0.4,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: theme.paper2,
  },
  rowLast: { borderBottomWidth: 0 },
  rowK: { fontSize: 13, color: theme.ink400 },
  rowV: { fontSize: 14, fontWeight: '600', color: theme.ink900 },

  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.line,
    marginBottom: 4,
    marginTop: 10,
  },
  workoutIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  workoutIconText: { fontSize: 20 },
  workoutName: { fontSize: 14, fontWeight: '700', color: theme.ink900, letterSpacing: -0.2 },
  workoutMeta: { fontSize: 10, color: theme.ink400, marginTop: 2, letterSpacing: 0.4, fontWeight: '600' },

  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.paper2,
  },
  exNum: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  exNumText: { fontWeight: '800', fontSize: 11 },
  exName: { fontSize: 14, fontWeight: '600', color: theme.ink900 },
  exDetail: { fontSize: 11, color: theme.ink400, marginTop: 1 },
  exLoad: { fontSize: 12, fontWeight: '800' },

  modeBanner: {
    backgroundColor: theme.paper2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  modeBannerTitle: {
    fontSize: 13, fontWeight: '700', color: theme.ink700, marginBottom: 4,
  },
  modeBannerBody: {
    fontSize: 12, color: theme.ink500, lineHeight: 17,
  },

  /* Bottom nav */
  bottomNav: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: theme.line,
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  navTab: { alignItems: 'center', gap: 3, paddingHorizontal: 10 },
  navEmoji: { fontSize: 19, opacity: 0.35 },
  navLabel: {
    fontSize: 10, fontWeight: '600', color: theme.ink300, letterSpacing: 0.3,
  },
  navDot: {
    width: 4, height: 4, borderRadius: 2, marginTop: 2,
  },

  /* Error state */
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#fef2f2',
    borderWidth: 2,
    borderColor: '#fecaca',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorIconText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#be123c',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.ink900,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  errorBody: {
    fontSize: 14,
    color: theme.ink500,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorDetailBox: {
    marginTop: 24,
    width: '100%',
    padding: 14,
    backgroundColor: theme.paper2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.line,
  },
  errorDetailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.ink400,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  errorDetailText: {
    fontSize: 12,
    color: theme.ink700,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  retryBtn: {
    marginTop: 24,
    backgroundColor: theme.ink900,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
