/**
 * Perfil tab — student personal info, measurements, body assessment
 * history, settings links.
 *
 * No dedicated mockup HTML ships for this screen yet, so the layout
 * takes cues from the shared design system: paper background, rounded
 * cards with a 1px line, mono labels in uppercase, a single accent
 * pill reserved for call-to-action moments. Sections are:
 *   1. Hero card — avatar, name, plan pill, member-since label.
 *   2. Measurements grid — weight / height / gordura corporal.
 *   3. Assessment history — list of monthly body assessments with
 *      a delta pill (down/up/flat).
 *   4. Settings — list of links (editar dados, notificações, idioma).
 *   5. Logout button — danger-toned outline.
 *
 * Data: academy branding from `useDashboard()`, content from
 * `MOCK_PROFILE`. Swap for `useProfile()` when the backend ships it.
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
  Bell,
  ChevronRight,
  Globe,
  LogOut,
  Mail,
  Phone,
  Settings,
  Shield,
  TrendingDown,
  TrendingUp,
  User,
  type LucideIcon,
} from 'lucide-react-native';

import { useDashboard } from '../../hooks/useDashboard';
import { MOCK_PROFILE } from '../../lib/mock-data';
import { theme, withAlpha } from '../../lib/theme';
import type { BodyAssessment } from '../../lib/types';

export default function ProfileScreen() {
  const { data } = useDashboard();
  const accent = data?.academy.primaryColor ?? theme.ink900;
  const academyName = data?.academy.name ?? 'Gym';
  const initials = data?.academy.initials ?? 'G';

  const profile = MOCK_PROFILE;
  const avatarInitials = profile.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

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
              accessibilityLabel="Configurações"
            >
              <Settings size={18} color="#fff" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
          <Text style={styles.eyebrow}>PERFIL</Text>
          <Text style={styles.title}>Minha conta</Text>
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          {/* Hero card — avatar + name */}
          <View style={styles.heroCard}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: withAlpha(accent, 0.12),
                  borderColor: withAlpha(accent, 0.25),
                },
              ]}
            >
              <Text style={[styles.avatarText, { color: accent }]}>
                {avatarInitials}
              </Text>
            </View>
            <Text style={styles.heroName}>{profile.name}</Text>
            <View style={styles.heroPills}>
              <View
                style={[
                  styles.heroPill,
                  { backgroundColor: withAlpha(accent, 0.1) },
                ]}
              >
                <Text style={[styles.heroPillText, { color: accent }]}>
                  PLANO {profile.plan}
                </Text>
              </View>
              <View style={styles.heroPillMuted}>
                <Text style={styles.heroPillMutedText}>
                  {profile.memberSince}
                </Text>
              </View>
            </View>
            <View style={styles.heroDivider} />
            <InfoRow Icon={Mail} label="E-mail" value={profile.email} />
            <InfoRow Icon={Phone} label="Telefone" value={profile.phone} last />
          </View>

          {/* Measurements */}
          <Text style={styles.sectionLabel}>MEDIDAS ATUAIS</Text>
          <View style={styles.statsGrid}>
            <Stat label="PESO" value={profile.measurements.weight} />
            <Stat label="ALTURA" value={profile.measurements.height} />
            <Stat label="GORDURA" value={profile.measurements.bodyFat} />
          </View>

          {/* Assessments */}
          <Text style={styles.sectionLabel}>AVALIAÇÕES FÍSICAS</Text>
          <View style={styles.card}>
            {profile.assessments.map((a, i, arr) => (
              <AssessmentRow
                key={a.id}
                assessment={a}
                accent={accent}
                last={i === arr.length - 1}
              />
            ))}
          </View>

          {/* Settings */}
          <Text style={styles.sectionLabel}>CONFIGURAÇÕES</Text>
          <View style={styles.card}>
            <SettingsRow Icon={User} label="Editar dados pessoais" />
            <SettingsRow Icon={Bell} label="Notificações" />
            <SettingsRow Icon={Globe} label="Idioma e região" />
            <SettingsRow Icon={Shield} label="Privacidade e segurança" last />
          </View>

          {/* Logout */}
          <TouchableOpacity activeOpacity={0.8} style={styles.logoutBtn}>
            <LogOut size={16} color="#be123c" strokeWidth={2.2} />
            <Text style={styles.logoutText}>Sair da conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ==================================================================
 * SUB-COMPONENTS
 * ================================================================ */
function InfoRow({
  Icon,
  label,
  value,
  last = false,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, last && { borderBottomWidth: 0 }]}>
      <View style={styles.infoIcon}>
        <Icon size={14} color={theme.ink400} strokeWidth={2} />
      </View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function AssessmentRow({
  assessment,
  accent,
  last,
}: {
  assessment: BodyAssessment;
  accent: string;
  last: boolean;
}) {
  const DeltaIcon =
    assessment.tone === 'down' ? TrendingDown : TrendingUp;
  const deltaColor =
    assessment.tone === 'down' ? theme.emerald : '#be123c';
  const deltaBg =
    assessment.tone === 'down' ? theme.emerald50 : '#fef2f2';

  return (
    <View style={[styles.assessRow, last && { borderBottomWidth: 0 }]}>
      <View
        style={[
          styles.assessIcon,
          { backgroundColor: withAlpha(accent, 0.1) },
        ]}
      >
        <Text style={[styles.assessIconText, { color: accent }]}>
          {assessment.date.slice(0, 5)}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.assessMetrics}>
          {assessment.weight} · {assessment.bodyFat}
        </Text>
        <Text style={styles.assessDate}>{assessment.date}</Text>
      </View>
      <View style={[styles.deltaPill, { backgroundColor: deltaBg }]}>
        <DeltaIcon size={12} color={deltaColor} strokeWidth={2.5} />
        <Text style={[styles.deltaText, { color: deltaColor }]}>
          {assessment.delta}
        </Text>
      </View>
    </View>
  );
}

function SettingsRow({
  Icon,
  label,
  last = false,
}: {
  Icon: LucideIcon;
  label: string;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.settingsRow, last && { borderBottomWidth: 0 }]}
    >
      <View style={styles.settingsIcon}>
        <Icon size={16} color={theme.ink500} strokeWidth={2} />
      </View>
      <Text style={styles.settingsLabel}>{label}</Text>
      <ChevronRight size={16} color={theme.ink300} strokeWidth={2} />
    </TouchableOpacity>
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
    paddingBottom: 32,
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

  content: {
    marginTop: -20,
    backgroundColor: theme.paper,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 24,
  },

  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.line,
    shadowColor: theme.ink900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    marginBottom: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroName: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.ink900,
    letterSpacing: -0.5,
  },
  heroPills: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  heroPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  heroPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  heroPillMuted: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: theme.paper2,
  },
  heroPillMutedText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.ink500,
    letterSpacing: 0.6,
  },
  heroDivider: {
    width: '100%',
    height: 1,
    backgroundColor: theme.line,
    marginTop: 18,
    marginBottom: 6,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.paper2,
    width: '100%',
  },
  infoIcon: {
    width: 22,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: theme.ink400,
    fontWeight: '500',
    width: 72,
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    color: theme.ink900,
    fontWeight: '600',
    textAlign: 'right',
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.ink400,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 10,
    paddingHorizontal: 4,
  },

  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.line,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.ink400,
    letterSpacing: 0.8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.ink900,
    marginTop: 5,
    letterSpacing: -0.5,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.line,
  },

  assessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.paper2,
  },
  assessIcon: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 56,
    alignItems: 'center',
  },
  assessIconText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  assessMetrics: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.ink900,
  },
  assessDate: {
    fontSize: 10,
    color: theme.ink400,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.4,
  },
  deltaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  deltaText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: -0.2,
  },

  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: theme.paper2,
  },
  settingsIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: theme.paper2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: theme.ink700,
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#be123c',
  },
});
