/**
 * Dependent agenda screen (Fase 6) — the guardian books classes on behalf of
 * a dependent. Same UI as the Agenda tab (shared ScheduleWeekView); the data
 * comes from useDependentSchedule(id) so book/cancel act for the dependent.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import { ScheduleWeekView } from '../../../components/ScheduleWeekView';
import { useDashboard } from '../../../hooks/useDashboard';
import { useDependents } from '../../../hooks/useDependents';
import { useDependentSchedule } from '../../../hooks/useDependentSchedule';
import { theme } from '../../../lib/theme';

export default function DependentScheduleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useDashboard();
  const accent = data?.academy.primaryColor ?? theme.ink900;

  const { data: deps } = useDependents();
  const name = deps?.dependents.find((d) => d.id === id)?.name ?? 'Dependente';

  const result = useDependentSchedule(String(id));

  return (
    <ScheduleWeekView
      accent={accent}
      result={result}
      header={
        <>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={styles.backBtn}
            accessibilityLabel="Voltar"
          >
            <ArrowLeft size={18} color="#fff" strokeWidth={2.2} />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.eyebrow}>AGENDA DO DEPENDENTE</Text>
          <Text style={styles.title}>{name}</Text>
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    marginBottom: 8,
  },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 13.5, fontWeight: '500' },
  eyebrow: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: { color: '#fff', fontSize: 28, fontWeight: '700', letterSpacing: -0.8, marginTop: 4 },
});
