/**
 * Presets de módulos por businessType.
 *
 * Quando o admin muda o tipo da academia em /admin/settings, o frontend
 * roda `suggestModulesForBusinessType(type)` pra mostrar um diff —
 * "sugerimos ativar X, desativar Y. Aplicar?" — sem sobrescrever as
 * escolhas manuais automaticamente.
 *
 * Mantemos só os 4 módulos toggleáveis (Alunos/Financeiro/Planos/Settings
 * são sempre on). A lista é declarativa: pra adicionar um businessType
 * novo basta editar a tabela aqui.
 */

import type { Core } from '@strapi/strapi';

export type ToggleableModule =
  | 'dependents'
  | 'workouts'
  | 'classes'
  | 'pool';

export const TOGGLEABLE_MODULES: ToggleableModule[] = [
  'dependents',
  'workouts',
  'classes',
  'pool',
];

const PRESETS: Record<string, ToggleableModule[]> = {
  gym: ['workouts', 'classes'],
  swimming_school: ['dependents', 'classes', 'pool'],
  pilates: ['classes'],
  ballet: ['dependents', 'classes'],
  martial_arts: ['dependents', 'classes'],
  studio: ['classes'],
  other: ['workouts', 'classes'],
};

export function presetFor(businessType: string | null | undefined): ToggleableModule[] {
  if (!businessType) return PRESETS.gym;
  return PRESETS[businessType] ?? PRESETS.other;
}

export function buildModulePresets({
  nexus,
}: {
  nexus: any;
  strapi: Core.Strapi;
}) {
  const ModulePresetSuggestion = nexus.objectType({
    name: 'ModulePresetSuggestion',
    description:
      'Suggested toggleable modules for a given businessType. Frontend shows this as a diff against the current Academy.enabledModules so the admin can accept or ignore.',
    definition(t: any) {
      t.nonNull.string('businessType');
      t.nonNull.list.nonNull.string('modules');
    },
  });

  const queries = nexus.extendType({
    type: 'Query',
    definition(t: any) {
      t.field('suggestModulesForBusinessType', {
        type: 'ModulePresetSuggestion',
        args: { businessType: nexus.nonNull(nexus.stringArg()) },
        resolve: (_: any, args: any) => ({
          businessType: args.businessType,
          modules: presetFor(args.businessType),
        }),
      });
    },
  });

  return {
    types: [ModulePresetSuggestion, queries],
    resolversConfig: {
      // auth: false porque o admin pode chamar isso na própria UI sem
      // precisar de academia vinculada (ex: preview no signup futuro).
      'Query.suggestModulesForBusinessType': { auth: false },
    },
  };
}
