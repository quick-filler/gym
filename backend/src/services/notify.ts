/**
 * In-app notification helper (Fase 7).
 *
 * `createInApp` writes a Notification row for one recipient user; the app and
 * the admin web read it via the GraphQL inbox (myNotifications) and poll for
 * near-real-time delivery. `notifyAcademyAdmins` fans a notification out to
 * every academy_admin of an academy (admin-web notifications).
 *
 * Push-to-device (Expo, Fase 7e) ships here too: `createInApp` calls `sendPush`
 * after writing the row, so every caller gets in-app + push for free. Real
 * delivery only validates on a dev/standalone EAS build — see design-decisions §2.16.
 */

import type { Core } from '@strapi/strapi';

const UID = 'api::notification.notification';
const STUDENT = 'api::student.student';
const PUSH_DEVICE = 'api::push-device.push-device';
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export interface ExpoPushMessage {
  to: string;
  title: string;
  body?: string;
  data?: unknown;
  sound: 'default';
}

/**
 * Builds Expo push messages from a token list, dropping anything that isn't a
 * valid ExponentPushToken. Pure + unit-tested.
 */
export function buildExpoPushMessages(
  tokens: Array<string | null | undefined>,
  payload: { title: string; body?: string | null; data?: unknown },
): ExpoPushMessage[] {
  return (tokens ?? [])
    .filter(
      (t): t is string => typeof t === 'string' && t.startsWith('ExponentPushToken'),
    )
    .map((to) => ({
      to,
      title: payload.title,
      body: payload.body ?? undefined,
      data: payload.data ?? undefined,
      sound: 'default',
    }));
}

/**
 * Best-effort push to all of a user's registered devices via the Expo Push
 * Service (relays to APNs/FCM). No-ops when the user has no tokens. Never
 * throws — push is non-critical.
 */
export async function sendPush(
  strapi: Core.Strapi,
  userId: number | null | undefined,
  payload: { title: string; body?: string | null; data?: unknown },
): Promise<void> {
  if (!userId) return;
  try {
    const devices: any[] = await strapi.db.query(PUSH_DEVICE).findMany({
      where: { owner: { id: userId } },
      select: ['token'],
      limit: 50,
    });
    const messages = buildExpoPushMessages(
      devices.map((d) => d.token),
      payload,
    );
    if (messages.length === 0) return;
    await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(messages),
    });
  } catch (err) {
    strapi.log.error(`[notify] sendPush failed: ${(err as Error)?.message}`);
  }
}

export interface InAppInput {
  userId: number;
  academyId?: number | null;
  kind: string;
  title: string;
  body?: string | null;
  data?: unknown;
}

/** Creates one in-app notification (lower-level db.query → numeric relation ids). */
export async function createInApp(
  strapi: Core.Strapi,
  input: InAppInput,
): Promise<any | null> {
  if (!input.userId) return null;
  let row: any = null;
  try {
    row = await strapi.db.query(UID).create({
      data: {
        recipient: input.userId,
        academy: input.academyId ?? null,
        kind: input.kind,
        title: input.title,
        body: input.body ?? null,
        data: input.data ?? null,
        read: false,
        publishedAt: new Date(),
      },
    });
  } catch (err) {
    // Notifications are best-effort — never break the triggering write.
    strapi.log.error(`[notify] createInApp failed: ${(err as Error)?.message}`);
    return null;
  }
  // Fan out to the device(s) too (best-effort, never throws).
  await sendPush(strapi, input.userId, {
    title: input.title,
    body: input.body,
    data: input.data,
  });
  return row;
}

/** Fan-out a notification to every academy_admin user of an academy. */
export async function notifyAcademyAdmins(
  strapi: Core.Strapi,
  academyId: number | null | undefined,
  n: { kind: string; title: string; body?: string | null; data?: unknown },
): Promise<void> {
  if (!academyId) return;
  const admins: any[] = await strapi.db.query(STUDENT).findMany({
    where: { role: 'academy_admin', academy: { id: academyId } },
    populate: { user: true },
  });
  for (const a of admins) {
    if (a?.user?.id) {
      await createInApp(strapi, { userId: a.user.id, academyId, ...n });
    }
  }
}
