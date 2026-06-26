/**
 * Agenda tab — weekly schedule, per-day class list (Fase 2 — wired).
 *
 * Mirrors `mockups/app-schedule.html`. The agenda body (day picker, class
 * cards, capacity bars, booking buttons, book/cancel flow) lives in the shared
 * `ScheduleWeekView`; this screen only supplies the branded header and the
 * `useScheduleWeek()` data source. The dependent agenda reuses the same view.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Filter } from 'lucide-react-native';

import { ScheduleWeekView } from '../../components/ScheduleWeekView';
import { useDashboard } from '../../hooks/useDashboard';
import { useModuleGuard } from '../../hooks/useModuleGuard';
import { useScheduleWeek } from '../../hooks/useScheduleWeek';
import { theme } from '../../lib/theme';

export default function ScheduleScreen() {
  const { data } = useDashboard();
  const accent = data?.academy.primaryColor ?? theme.ink900;
  const academyName = data?.academy.name ?? 'Gym';
  const initials = data?.academy.initials ?? 'G';

  const allowed = useModuleGuard('classes');
  const result = useScheduleWeek();

  if (!allowed) return null;

  return (
    <ScheduleWeekView
      accent={accent}
      result={result}
      header={
        <>
          <View style={styles.headerTop}>
            <View style={styles.brand}>
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>{initials}</Text>
              </View>
              <Text style={styles.academyName}>{academyName}</Text>
            </View>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} accessibilityLabel="Filtros">
              <Filter size={18} color="#fff" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
          <Text style={styles.eyebrow}>AGENDA</Text>
          <Text style={styles.title}>Suas aulas</Text>
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
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
  title: { color: '#fff', fontSize: 28, fontWeight: '700', letterSpacing: -0.8, marginTop: 4 },
});
