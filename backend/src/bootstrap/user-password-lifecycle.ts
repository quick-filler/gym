/**
 * Lifecycle hook that ensures every write to the users-permissions User
 * model goes through bcrypt, regardless of the entry point.
 *
 * Why this exists: the users-permissions REST controller already calls
 * `getService('user').add/edit → ensureHashedPasswords` before it hits
 * the database, so REST-originated writes arrive here pre-hashed.
 * However the Strapi Admin UI (Content Manager) and direct
 * `strapi.db.query` calls bypass that service layer and write the
 * password as plain text.  The `startsWith('$2')` guard prevents
 * double-hashing for the REST path while fixing every other path.
 */
import bcrypt from 'bcryptjs';
import type { Core } from '@strapi/strapi';

const USER_MODEL = 'plugin::users-permissions.user';
const BCRYPT_ROUNDS = 10;

function isBcryptHash(value: string): boolean {
  return value.startsWith('$2a$') || value.startsWith('$2b$');
}

async function maybeHash(password: unknown): Promise<string | undefined> {
  if (typeof password !== 'string' || !password) return undefined;
  if (isBcryptHash(password)) return undefined; // already hashed — skip
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function registerUserPasswordLifecycle(strapi: Core.Strapi) {
  strapi.db.lifecycles.subscribe({
    models: [USER_MODEL],

    async beforeCreate(event: any) {
      const hashed = await maybeHash(event.params.data?.password);
      if (hashed) event.params.data.password = hashed;
    },

    async beforeUpdate(event: any) {
      const hashed = await maybeHash(event.params.data?.password);
      if (hashed) event.params.data.password = hashed;
    },
  });
}
