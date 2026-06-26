/**
 * Edit dependent screen (Fase 6) — guardian self-service.
 *
 * Reads the editable record from useDependents().records, hydrates the shared
 * DependentForm, and saves via updateMyDependent (whitelisted fields only).
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { DependentForm } from '../../../components/DependentForm';
import { useDashboard } from '../../../hooks/useDashboard';
import { useDependents } from '../../../hooks/useDependents';
import { theme } from '../../../lib/theme';
import type { DependentActionResult } from '../../../lib/types';

export default function EditDependentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useDashboard();
  const accent = data?.academy.primaryColor ?? theme.ink900;
  const { records, update, saving, loading } = useDependents();

  const initial = records.find((r) => r.id === id) ?? null;

  const onSubmit = async (
    input: Record<string, unknown>,
  ): Promise<DependentActionResult> => {
    const res = await update(String(id), input);
    if (res.ok) router.back();
    return res;
  };

  // Wait for the record so the form hydrates from real values, not blanks.
  if (loading && !initial) {
    return (
      <SafeAreaView edges={['top']} style={styles.loading}>
        <ActivityIndicator color={accent} />
        <Text style={styles.loadingText}>Carregando…</Text>
      </SafeAreaView>
    );
  }

  return (
    <DependentForm
      accent={accent}
      title="Editar dependente"
      initial={initial}
      submitLabel="Salvar alterações"
      saving={saving}
      onSubmit={onSubmit}
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.paper,
  },
  loadingText: { fontSize: 13, color: theme.ink500 },
});
