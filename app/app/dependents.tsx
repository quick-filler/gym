/**
 * Dependentes screen — responsible guardian's children roster.
 *
 * Mirrors `mockups/app-dependents.html`. Accessed from the dashboard
 * when the authenticated student is flagged as a guardian
 * (`isGuardian`). Each card shows the dependent's avatar, age, active
 * status, optional medical alert, info rows (plano / turma / tipo
 * sanguíneo / próximo vencimento) and an emergency contact box.
 *
 * Data flow: pulls the tenant accent from `useDashboard` (so the
 * header matches the rest of the app) and reads the dependents list
 * from `MOCK_DEPENDENTS`. Swap the import for a `useDependents()`
 * hook once the backend `me.dependents` query is wired.
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
import { router } from 'expo-router';
import {
  AlertTriangle,
  ArrowLeft,
  Phone,
  Plus,
  User,
  UserRound,
} from 'lucide-react-native';

import { useDashboard } from '../hooks/useDashboard';
import { MOCK_DEPENDENTS } from '../lib/mock-data';
import { theme, withAlpha } from '../lib/theme';
import type {
  DependentRecord,
  DependentStatus,
  DependentsData,
} from '../lib/types';

const STATUS_LABEL: Record<DependentStatus, string> = {
  active: 'Ativa',
  pending: 'Pendente',
  inactive: 'Inativo',
};

const STATUS_TONE: Record<
  DependentStatus,
  { bg: string; fg: string }
> = {
  active: { bg: '#d1fae5', fg: '#065f46' },
  pending: { bg: '#fef3c7', fg: '#92400e' },
  inactive: { bg: '#e5e7eb', fg: '#374151' },
};

export default function DependentsScreen() {
  const { data } = useDashboard();
  const accent = data?.academy.primaryColor ?? theme.ink900;
  const academyName = data?.academy.name ?? 'Gym';

  const payload: DependentsData = MOCK_DEPENDENTS;

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
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              style={styles.backBtn}
              accessibilityLabel="Voltar"
            >
              <ArrowLeft size={18} color="#fff" strokeWidth={2.2} />
              <Text style={styles.backText}>Voltar</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Meus dependentes</Text>
          <Text style={styles.sub}>
            {payload.guardianName} · {academyName}
          </Text>
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          <Text style={styles.sectionLabel}>Dependentes cadastrados</Text>

          {payload.dependents.map((dep) => (
            <DependentCard key={dep.id} dep={dep} accent={accent} />
          ))}

          {/* Add dependent card */}
          <TouchableOpacity
            style={styles.addCard}
            activeOpacity={0.75}
            accessibilityLabel="Adicionar dependente"
          >
            <View
              style={[
                styles.addIconWrap,
                { backgroundColor: withAlpha(accent, 0.08) },
              ]}
            >
              <Plus size={22} color={accent} strokeWidth={2.2} />
            </View>
            <Text style={styles.addLabel}>Adicionar dependente</Text>
            <Text style={styles.addSublabel}>
              Filho, neto, sobrinho ou outro
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DependentCard({
  dep,
  accent,
}: {
  dep: DependentRecord;
  accent: string;
}) {
  const tone = STATUS_TONE[dep.status];
  const AvatarIcon = dep.gender === 'girl' ? UserRound : User;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <AvatarIcon size={22} color={theme.ink500} strokeWidth={1.8} />
        </View>
        <View style={styles.nameBlock}>
          <Text style={styles.depName}>{dep.name}</Text>
          <Text style={styles.depAge}>{dep.ageLabel}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: tone.bg }]}>
          <Text style={[styles.badgeText, { color: tone.fg }]}>
            {STATUS_LABEL[dep.status]}
          </Text>
        </View>
      </View>

      {dep.medicalAlert && (
        <View style={styles.alertBox}>
          <AlertTriangle size={14} color="#92400e" strokeWidth={2} />
          <Text style={styles.alertText}>{dep.medicalAlert}</Text>
        </View>
      )}

      <View style={styles.infoGroup}>
        {dep.info.map((row, idx) => (
          <View
            key={row.key}
            style={[
              styles.infoRow,
              idx < dep.info.length - 1 && styles.infoRowBorder,
            ]}
          >
            <Text style={styles.infoKey}>{row.key}</Text>
            <Text style={styles.infoValue}>{row.value}</Text>
          </View>
        ))}
      </View>

      {dep.emergency && (
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <Phone size={14} color={theme.ink900} strokeWidth={2} />
            <Text style={styles.emergencyTitle}>Contato de emergência</Text>
          </View>
          <Text style={styles.emergencyName}>{dep.emergency.name}</Text>
          <Text style={styles.emergencyPhone}>{dep.emergency.phone}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: accent }]}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Ver agenda</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.outlineBtn, { borderColor: accent }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.outlineBtnText, { color: accent }]}>Editar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, backgroundColor: theme.paper },
  header: {
    paddingTop: 12,
    paddingBottom: 36,
    paddingHorizontal: 22,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingRight: 10,
  },
  backText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13.5,
    fontWeight: '500',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginTop: 4,
  },
  sub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: 4,
  },
  content: {
    marginTop: -16,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 40,
    backgroundColor: '#f6f8fa',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flex: 1,
  },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: theme.ink400,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.05)',
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  nameBlock: {
    flex: 1,
  },
  depName: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  depAge: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fcd34d',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  alertText: {
    color: '#92400e',
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
  },
  infoGroup: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoKey: {
    fontSize: 12.5,
    color: '#94a3b8',
  },
  infoValue: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  emergencyCard: {
    backgroundColor: '#f8fafc',
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  emergencyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  emergencyName: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    marginTop: 2,
  },
  emergencyPhone: {
    fontSize: 12.5,
    color: '#64748b',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13.5,
  },
  outlineBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  outlineBtnText: {
    fontWeight: '600',
    fontSize: 13.5,
  },
  addCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  addLabel: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  addSublabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
});
