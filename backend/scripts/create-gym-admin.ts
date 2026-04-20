/**
 * CLI — create (or update) a gym admin for a given academy.
 *
 * A "gym admin" is the pair of records the frontend expects:
 *   1. a users-permissions user with role = Authenticated (login creds)
 *   2. a Student in the target academy, linked to that user,
 *      with Student.role = 'academy_admin'
 *
 * The script talks to a **running Strapi** over HTTP — it does NOT
 * boot Strapi in-process (which hits a Node 22 / koa+is-generator-function
 * incompatibility). Start the backend first:
 *
 *   cd backend && SEED_DEMO=true npm run develop
 *
 * Usage:
 *   npm run admin:create -- \
 *     --email alice@crossfit-sp.com \
 *     --password seCreT123 \
 *     --name "Alice Rocha" \
 *     --academy crossfit-sp
 *
 *   # optional:
 *   #   --phone "+55 11 99999-0000"
 *   #   --strapi-admin   also creates/resets a Strapi /admin user
 *   #   --endpoint       default http://localhost:7777
 *   #   --admin-email    default admin@gym-demo.com (seeded dev admin)
 *   #   --admin-password default gym-demo-admin
 *
 * Idempotent: safe to re-run. The users-permissions user's password is
 * reset every run (so this doubles as a password-reset tool).
 *
 * Exit codes: 0 success, 1 bad args, 2 backend unreachable / academy not found.
 */

interface Args {
  email?: string;
  password?: string;
  name?: string;
  academy?: string;
  phone?: string;
  strapiAdmin?: boolean;
  endpoint?: string;
  adminEmail?: string;
  adminPassword?: string;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (!key?.startsWith('--')) continue;
    const flag = key.slice(2);
    if (flag === 'strapi-admin') {
      args.strapiAdmin = true;
      continue;
    }
    const value = argv[++i];
    if (!value) continue;
    switch (flag) {
      case 'email': args.email = value; break;
      case 'password': args.password = value; break;
      case 'name': args.name = value; break;
      case 'academy': args.academy = value; break;
      case 'phone': args.phone = value; break;
      case 'endpoint': args.endpoint = value; break;
      case 'admin-email': args.adminEmail = value; break;
      case 'admin-password': args.adminPassword = value; break;
    }
  }
  return args;
}

function usage(): void {
  process.stderr.write(
    [
      '',
      'Create (or update) a gym admin.',
      '',
      'Usage:',
      '  npm run admin:create -- --email <email> --password <pw> --name "<name>" --academy <slug>',
      '      [--phone <phone>] [--strapi-admin] [--endpoint <url>]',
      '      [--admin-email <email>] [--admin-password <pw>]',
      '',
      'Required: --email --password --name --academy',
      '',
      'Flags:',
      '  --strapi-admin   Also create/reset a Strapi /admin user with the same creds',
      '  --endpoint       Backend URL (default http://localhost:7777)',
      '  --admin-email    Seeded admin to authenticate as (default admin@gym-demo.com)',
      '  --admin-password Seeded admin password        (default gym-demo-admin)',
      '',
    ].join('\n'),
  );
}

type Fetcher = (path: string, init?: RequestInit) => Promise<Response>;

function makeFetcher(base: string, adminToken: string): Fetcher {
  return (path, init = {}) => {
    const headers = new Headers(init.headers ?? {});
    if (!headers.has('Content-Type') && init.body) {
      headers.set('Content-Type', 'application/json');
    }
    headers.set('Authorization', `Bearer ${adminToken}`);
    return fetch(`${base}${path}`, { ...init, headers });
  };
}

async function loginAsAdmin(
  base: string,
  email: string,
  password: string,
): Promise<string> {
  const res = await fetch(`${base}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(
      `Admin login failed (${res.status}). Check --admin-email / --admin-password, or seed the dev admin with SEED_DEMO=true.`,
    );
  }
  const payload: any = await res.json();
  return payload.data.token as string;
}

async function findAcademyId(fetcher: Fetcher, slug: string): Promise<number> {
  const res = await fetcher(
    `/content-manager/collection-types/api::academy.academy?filters[slug][$eq]=${encodeURIComponent(slug)}&pageSize=1`,
  );
  if (!res.ok) {
    throw new Error(`Academy lookup failed (${res.status})`);
  }
  const payload: any = await res.json();
  const first = payload.results?.[0];
  if (!first) {
    throw new Error(`Academy not found: slug="${slug}"`);
  }
  // Relations in Strapi v5 use the numeric id internally; content-manager
  // accepts either, but id is what ships in other connect payloads.
  return first.id as number;
}

async function findAuthenticatedRoleId(fetcher: Fetcher): Promise<number> {
  const res = await fetcher('/users-permissions/roles');
  if (!res.ok) throw new Error(`Role list failed (${res.status})`);
  const payload: any = await res.json();
  const auth = payload.roles?.find(
    (r: any) => r.type === 'authenticated' || r.name === 'Authenticated',
  );
  if (!auth) throw new Error('Authenticated role missing');
  return auth.id as number;
}

const USER_CM = '/content-manager/collection-types/plugin::users-permissions.user';

interface CmRow {
  id: number;
  documentId: string;
}

async function findUserByEmail(
  fetcher: Fetcher,
  email: string,
): Promise<CmRow | null> {
  const res = await fetcher(
    `${USER_CM}?filters[email][$eq]=${encodeURIComponent(email)}&pageSize=1`,
  );
  if (!res.ok) throw new Error(`User lookup failed (${res.status})`);
  const payload: any = await res.json();
  return payload.results?.[0] ?? null;
}

async function upsertUpUser(
  fetcher: Fetcher,
  existing: CmRow | null,
  email: string,
  password: string,
  roleId: number,
  _name: string,
): Promise<number> {
  const body = JSON.stringify({
    username: email,
    email,
    password,
    confirmed: true,
    blocked: false,
    role: roleId,
  });
  if (existing) {
    // Strapi v5 content-manager routes PUT/DELETE by documentId, not id.
    const res = await fetcher(`${USER_CM}/${existing.documentId}`, {
      method: 'PUT',
      body,
    });
    if (!res.ok) {
      throw new Error(`User update failed (${res.status}): ${await res.text()}`);
    }
    process.stdout.write(`✓ Updated users-permissions user: ${email}\n`);
    return existing.id;
  }
  const res = await fetcher(USER_CM, {
    method: 'POST',
    body,
  });
  if (!res.ok) {
    throw new Error(`User create failed (${res.status}): ${await res.text()}`);
  }
  const payload: any = await res.json();
  process.stdout.write(`✓ Created users-permissions user: ${email}\n`);
  return (payload.data?.id ?? payload.id) as number;
}

async function findStudentByEmail(
  fetcher: Fetcher,
  email: string,
): Promise<CmRow | null> {
  const res = await fetcher(
    `/content-manager/collection-types/api::student.student?filters[email][$eq]=${encodeURIComponent(email)}&pageSize=1`,
  );
  if (!res.ok) throw new Error(`Student lookup failed (${res.status})`);
  const payload: any = await res.json();
  return payload.results?.[0] ?? null;
}

async function upsertStudent(
  fetcher: Fetcher,
  existing: CmRow | null,
  name: string,
  email: string,
  phone: string | undefined,
  userId: number,
  academyId: number,
): Promise<void> {
  // Note: we DON'T send `status` here — Strapi v5's content-manager API
  // reserves that key for draft/publish state and rejects our enum value
  // with "Invalid status" even though the content type has
  // draftAndPublish: false. The field has a server-side default of
  // 'active' so the new row comes out correct. If an update ever needs
  // to toggle status, go through a GraphQL mutation instead of this CLI.
  const body = JSON.stringify({
    name,
    email,
    phone: phone ?? null,
    role: 'academy_admin',
    user: userId,
    academy: academyId,
    isGuardian: false,
  });
  if (existing) {
    const res = await fetcher(
      `/content-manager/collection-types/api::student.student/${existing.documentId}`,
      { method: 'PUT', body },
    );
    if (!res.ok) {
      throw new Error(`Student update failed (${res.status}): ${await res.text()}`);
    }
    process.stdout.write(`✓ Updated Student: ${name} (role=academy_admin)\n`);
    return;
  }
  const res = await fetcher(
    '/content-manager/collection-types/api::student.student',
    { method: 'POST', body },
  );
  if (!res.ok) {
    throw new Error(`Student create failed (${res.status}): ${await res.text()}`);
  }
  process.stdout.write(`✓ Created Student: ${name} (role=academy_admin)\n`);
}

async function ensureStrapiAdminUser(
  fetcher: Fetcher,
  email: string,
  password: string,
  name: string,
): Promise<void> {
  const roleRes = await fetcher('/admin/roles');
  const roles: any = await roleRes.json();
  const superAdmin = roles?.data?.find(
    (r: any) => r.code === 'strapi-super-admin',
  );
  if (!superAdmin) {
    throw new Error('Strapi super-admin role not found');
  }

  const existingRes = await fetcher(
    `/admin/users?filters[email][$eq]=${encodeURIComponent(email)}`,
  );
  const existingPayload: any = await existingRes.json();
  const existing = existingPayload?.data?.results?.[0];

  const [firstname, ...rest] = name.split(/\s+/);
  const lastname = rest.join(' ') || 'Admin';

  if (existing) {
    const res = await fetcher(`/admin/users/${existing.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        firstname: firstname ?? name,
        lastname,
        email,
        password,
        isActive: true,
        roles: [superAdmin.id],
      }),
    });
    if (!res.ok) {
      throw new Error(
        `Strapi admin update failed (${res.status}): ${await res.text()}`,
      );
    }
    process.stdout.write(`✓ Reset Strapi admin: ${email}\n`);
    return;
  }

  const res = await fetcher('/admin/users', {
    method: 'POST',
    body: JSON.stringify({
      firstname: firstname ?? name,
      lastname,
      email,
      password,
      isActive: true,
      roles: [superAdmin.id],
    }),
  });
  if (!res.ok) {
    throw new Error(
      `Strapi admin create failed (${res.status}): ${await res.text()}`,
    );
  }
  process.stdout.write(`✓ Created Strapi admin: ${email}\n`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const missing = (['email', 'password', 'name', 'academy'] as const).filter(
    (k) => !args[k],
  );
  if (missing.length > 0) {
    usage();
    process.stderr.write(`\nMissing required flag(s): ${missing.join(', ')}\n`);
    process.exit(1);
  }

  const endpoint = (args.endpoint ?? 'http://localhost:7777').replace(/\/$/, '');
  const adminEmail = args.adminEmail ?? 'admin@gym-demo.com';
  const adminPassword = args.adminPassword ?? 'gym-demo-admin';

  // Sanity-check backend is up.
  try {
    const ping = await fetch(`${endpoint}/_health`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!ping.ok && ping.status !== 204) throw new Error(String(ping.status));
  } catch {
    process.stderr.write(
      `\nBackend unreachable at ${endpoint}. Start it first: cd backend && npm run develop\n`,
    );
    process.exit(2);
  }

  const adminToken = await loginAsAdmin(endpoint, adminEmail, adminPassword);
  const fetcher = makeFetcher(endpoint, adminToken);

  const academyId = await findAcademyId(fetcher, args.academy!);
  const authRoleId = await findAuthenticatedRoleId(fetcher);
  const existingUser = await findUserByEmail(fetcher, args.email!);
  const userId = await upsertUpUser(
    fetcher,
    existingUser,
    args.email!,
    args.password!,
    authRoleId,
    args.name!,
  );
  const existingStudent = await findStudentByEmail(fetcher, args.email!);
  await upsertStudent(
    fetcher,
    existingStudent,
    args.name!,
    args.email!,
    args.phone,
    userId,
    academyId,
  );

  if (args.strapiAdmin) {
    await ensureStrapiAdminUser(fetcher, args.email!, args.password!, args.name!);
  }

  process.stdout.write(
    `\nAll set — log in at http://localhost:9999/login with ${args.email}\n`,
  );
}

main().catch((err) => {
  process.stderr.write(`\n${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
