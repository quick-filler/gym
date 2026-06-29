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
import { buildPlatformPlan } from './types/platform-plan';
import { buildAcademySubscription } from './types/academy-subscription';
import { buildPool } from './types/pool';
import { buildModulePresets } from './types/module-presets';
import { buildEnrollment } from './types/enrollment';
import { buildClassSchedule } from './types/class-schedule';
import { buildClassBooking } from './types/class-booking';
import { buildStudentSchedule } from './types/student-schedule';
import { buildPayment } from './types/payment';
import { buildWorkoutPlan } from './types/workout-plan';
import { buildWorkoutSession } from './types/workout-session';
import { buildBodyAssessment } from './types/body-assessment';
import { buildExpense } from './types/expense';
import { buildDependent } from './types/dependent';
import { buildAggregates } from './types/aggregates';
import { buildLead } from './types/lead';
import { buildPlatform } from './types/platform';
import { buildUpload } from './types/upload';
import { buildBulkImport } from './types/bulk-import';
import { buildNotification } from './types/notification';
import { buildAccount } from './types/account';
import { buildCep } from './types/cep';

export function registerGraphQL(strapi: Core.Strapi) {
  const extensionService = strapi.plugin('graphql').service('extension');

  extensionService.use(({ nexus }: any) => {
    const ctx = { nexus, strapi };

    const modules = [
      buildAcademy(ctx),
      buildStudent(ctx),
      buildPlan(ctx),
      buildPlatformPlan(ctx),
      buildAcademySubscription(ctx),
      buildPool(ctx),
      buildModulePresets(ctx),
      buildEnrollment(ctx),
      buildClassSchedule(ctx),
      buildClassBooking(ctx),
      buildStudentSchedule(ctx),
      buildPayment(ctx),
      buildWorkoutPlan(ctx),
      buildWorkoutSession(ctx),
      buildBodyAssessment(ctx),
      buildExpense(ctx),
      buildDependent(ctx),
      buildAggregates(ctx),
      buildLead(ctx),
      buildPlatform(ctx),
      buildUpload(ctx),
      buildBulkImport(ctx),
      buildNotification(ctx),
      buildAccount(ctx),
      buildCep(ctx),
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
