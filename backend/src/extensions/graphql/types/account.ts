/**
 * GraphQL schema for self-service account activation ("completar cadastro").
 *
 * Use case: students imported in bulk (or created without a chosen
 * password) claim their login on first access. They prove identity with
 * data the academy already has on file — email + birthdate, falling back
 * to phone when the record has no birthdate — then set their own password
 * and land logged in.
 *
 * Security model (see docs/design-decisions.md):
 *   - Scoped to one academy (by slug) — no cross-tenant claim.
 *   - One-shot: blocked once `Student.activated` is true. A claimed
 *     account must use normal login / forgot-password.
 *   - Second factor required beyond email: birthdate OR phone must match
 *     the imported record (academy-vouched data). Email alone never
 *     activates.
 *
 * Public (auth: false) — the caller has no JWT yet.
 */

import type { Core } from '@strapi/strapi';
import { setOrCreateAuthUserPassword } from '../../../lib/provisioning';

const ACADEMY = 'api::academy.academy';
const STUDENT = 'api::student.student';

/** Digits-only phone for tolerant comparison ("(11) 98888-1111" → "11988881111"). */
function normalizePhone(p?: string | null): string {
  return (p ?? '').replace(/\D/g, '');
}

/**
 * True when the provided data matches the academy's record on at least
 * one second factor: birthdate (yyyy-mm-dd) OR phone (digits-only, min 8).
 * Email alone is never enough. Exported for unit testing.
 */
export function verifyActivationIdentity(
  record: { birthdate?: string | null; phone?: string | null },
  provided: { birthdate?: string | null; phone?: string | null },
): boolean {
  const recBirth = (record.birthdate ?? '').slice(0, 10);
  const provBirth = (provided.birthdate ?? '').slice(0, 10);
  const birthMatch = !!recBirth && recBirth === provBirth;

  const recPhone = normalizePhone(record.phone);
  const provPhone = normalizePhone(provided.phone);
  const phoneMatch = recPhone.length >= 8 && recPhone === provPhone;

  return birthMatch || phoneMatch;
}

/**
 * Pre-validates a password change (before touching the DB). Returns an
 * error message, or null when the inputs are acceptable. Pure + tested.
 */
export function validatePasswordChange(
  oldPassword?: string | null,
  newPassword?: string | null,
): string | null {
  if (!oldPassword || !newPassword) {
    return 'Informe a senha atual e a nova senha.';
  }
  if (newPassword.length < 6) {
    return 'A nova senha precisa ter pelo menos 6 caracteres.';
  }
  if (newPassword === oldPassword) {
    return 'A nova senha precisa ser diferente da atual.';
  }
  return null;
}

export function buildAccount({ nexus, strapi }: { nexus: any; strapi: Core.Strapi }) {
  const ActivateAccountInput = nexus.inputObjectType({
    name: 'ActivateAccountInput',
    definition(t: any) {
      t.nonNull.string('academySlug');
      t.nonNull.string('email');
      t.string('birthdate'); // one of birthdate/phone must match the record
      t.string('phone');
      t.nonNull.string('password');
    },
  });

  const ActivateAccountResult = nexus.objectType({
    name: 'ActivateAccountResult',
    definition(t: any) {
      t.nonNull.string('jwt');
      t.field('student', { type: 'Student' });
    },
  });

  const mutations = nexus.extendType({
    type: 'Mutation',
    definition(t: any) {
      t.field('activateAccount', {
        type: 'ActivateAccountResult',
        description:
          'Self-service first-access: an imported student proves identity (email + birthdate/phone) and sets a password. Returns a JWT.',
        args: { data: nexus.nonNull(nexus.arg({ type: 'ActivateAccountInput' })) },
        resolve: async (_root: any, args: any) => {
          const slug = String(args.data.academySlug ?? '').trim().toLowerCase();
          const email = String(args.data.email ?? '').trim().toLowerCase();
          const password = String(args.data.password ?? '');

          if (!slug || !email) {
            throw new Error('Informe a academia e o e-mail.');
          }
          if (password.length < 6) {
            throw new Error('A senha precisa ter pelo menos 6 caracteres.');
          }

          // ── resolve academy ──────────────────────────────────────────
          const academy: any = (
            await strapi.documents(ACADEMY).findMany({
              filters: { slug },
              fields: ['documentId'],
              limit: 1,
            })
          )[0];
          if (!academy) {
            throw new Error('Academia não encontrada.');
          }

          // ── find the student (scoped to the academy) ─────────────────
          const student: any = (
            await strapi.documents(STUDENT).findMany({
              filters: {
                email: { $eqi: email },
                academy: { documentId: academy.documentId },
              } as any,
              populate: { user: true } as any,
              limit: 1,
            })
          )[0];
          if (!student) {
            throw new Error(
              'Não encontramos seu cadastro nesta academia. Fale com a recepção.',
            );
          }

          // ── one-shot guard ───────────────────────────────────────────
          if (student.activated) {
            throw new Error(
              'Esta conta já foi ativada. Use "entrar" ou "esqueci a senha".',
            );
          }

          // ── identity check (email + birthdate|phone) ─────────────────
          const ok = verifyActivationIdentity(
            { birthdate: student.birthdate, phone: student.phone },
            { birthdate: args.data.birthdate, phone: args.data.phone },
          );
          if (!ok) {
            throw new Error(
              'Os dados não conferem. Confira sua data de nascimento ou telefone, ou fale com a recepção.',
            );
          }

          // ── claim the login + activate ───────────────────────────────
          const userId = await setOrCreateAuthUserPassword(strapi, {
            email,
            password,
          });

          // Fill any missing profile data the student just provided, link
          // the user, and flip the activated flag — all in one update.
          const patch: any = { activated: true, user: userId };
          if (!student.birthdate && args.data.birthdate) {
            patch.birthdate = String(args.data.birthdate).slice(0, 10);
          }
          if (!student.phone && args.data.phone) {
            patch.phone = args.data.phone;
          }
          const updated = await strapi.documents(STUDENT).update({
            documentId: student.documentId,
            data: patch,
            populate: { academy: { populate: { logo: true } } } as any,
          });

          // ── issue a JWT so the student lands logged in ───────────────
          const jwt = strapi
            .plugin('users-permissions')
            .service('jwt')
            .issue({ id: userId });

          return { jwt, student: updated };
        },
      });

      t.field('updateMyPassword', {
        type: 'Boolean',
        description:
          "Authenticated student changes their own password: verifies the current one, then sets the new one.",
        args: {
          oldPassword: nexus.nonNull(nexus.stringArg()),
          newPassword: nexus.nonNull(nexus.stringArg()),
        },
        resolve: async (_root: any, args: any, ctx: any) => {
          const userId = ctx?.state?.user?.id;
          if (!userId) throw new Error('Não autenticado.');

          const problem = validatePasswordChange(args.oldPassword, args.newPassword);
          if (problem) throw new Error(problem);

          const user: any = await strapi.db
            .query('plugin::users-permissions.user')
            .findOne({ where: { id: userId } });
          if (!user) throw new Error('Usuário não encontrado.');

          const valid = await strapi
            .plugin('users-permissions')
            .service('user')
            .validatePassword(args.oldPassword, user.password);
          if (!valid) throw new Error('Senha atual incorreta.');

          await strapi
            .plugin('users-permissions')
            .service('user')
            .edit(userId, { password: args.newPassword });

          return true;
        },
      });
    },
  });

  return {
    types: [ActivateAccountInput, ActivateAccountResult, mutations],
    resolversConfig: {
      'Mutation.activateAccount': { auth: false },
      'Mutation.updateMyPassword': { auth: true },
    },
  };
}
