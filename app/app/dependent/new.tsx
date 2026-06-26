/**
 * New dependent screen (Fase 6) — guardian self-service registration.
 *
 * Thin wrapper over the shared DependentForm; on success it pops back to the
 * dependents roster (which refetches MyDependents).
 */

import React from 'react';
import { router } from 'expo-router';

import { DependentForm } from '../../components/DependentForm';
import { useDashboard } from '../../hooks/useDashboard';
import { useDependents } from '../../hooks/useDependents';
import { theme } from '../../lib/theme';
import type { DependentActionResult } from '../../lib/types';

export default function NewDependentScreen() {
  const { data } = useDashboard();
  const accent = data?.academy.primaryColor ?? theme.ink900;
  const { add, saving } = useDependents();

  const onSubmit = async (
    input: Record<string, unknown>,
  ): Promise<DependentActionResult> => {
    const res = await add(input);
    if (res.ok) router.back();
    return res;
  };

  return (
    <DependentForm
      accent={accent}
      title="Novo dependente"
      submitLabel="Cadastrar dependente"
      saving={saving}
      onSubmit={onSubmit}
    />
  );
}
