/**
 * Explicit GraphQL schema registration for the gym domain.
 *
 * shadowCRUD is disabled in plugin config (see config/plugins.ts), so this
 * file is the single source of truth for every type, query, and mutation
 * exposed via /graphql.
 *
 * One module per content type lives under ./types — each exports a builder
 * that takes `{ nexus, strapi }` and returns `{ types, resolversConfig }`.
 * We flatten them into a single extension registration so Nexus can build
 * one combined schema.
 *
 * Conventions:
 *   - The Strapi documentId (string UUID) is the canonical GraphQL ID.
 *     The numeric primary key is never exposed.
 *   - Every resolver defaults to `auth: true`. The only public surfaces are
 *     `Query.academyBySlug` (for white-label theming) and the Asaas webhook
 *     (which stays on REST since Asaas pushes to a fixed URL).
 *   - Relations are resolved lazily via field resolvers that re-fetch the
 *     parent document with the needed populate. This keeps each query
 *     focused without forcing every list query to over-fetch.
 */

import type { Core } from '@strapi/strapi';

import { buildCommonTypes } from './types/common';
import { buildAcademy } from './types/academy';
import { buildStudent } from './types/student';
import { buildPlan } from './types/plan';
import { buildEnrollment } from './types/enrollment';
import { buildClassSchedule } from './types/class-schedule';
import { buildClassBooking } from './types/class-booking';
import { buildPayment } from './types/payment';
import { buildWorkoutPlan } from './types/workout-plan';
import { buildBodyAssessment } from './types/body-assessment';
import { buildExpense } from './types/expense';
import { buildDependent } from './types/dependent';

export function registerGraphQL(strapi: Core.Strapi) {
  const extensionService = strapi.plugin('graphql').service('extension');

  extensionService.use(({ nexus }: any) => {
    const ctx = { nexus, strapi };

    const modules = [
      buildAcademy(ctx),
      buildStudent(ctx),
      buildPlan(ctx),
      buildEnrollment(ctx),
      buildClassSchedule(ctx),
      buildClassBooking(ctx),
      buildPayment(ctx),
      buildWorkoutPlan(ctx),
      buildBodyAssessment(ctx),
      buildExpense(ctx),
      buildDependent(ctx),
    ];

    const types: any[] = [...buildCommonTypes(ctx)];
    const resolversConfig: Record<string, any> = {};

    for (const mod of modules) {
      types.push(...mod.types);
      Object.assign(resolversConfig, mod.resolversConfig);
    }

    return { types, resolversConfig };
  });

  strapi.log.info('[graphql] explicit gym schema registered');
}
