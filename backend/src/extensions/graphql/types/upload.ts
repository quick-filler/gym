/**
 * Direct-to-S3 upload mutations.
 *
 * Pattern (ported from quickfiller-strapi-api):
 *   1. Frontend → mintUploadUrl(filename, contentType, size)
 *      Backend validates auth + MIME + size, derives a tenant-scoped
 *      key (academies/<slug>/<nanoid>.<ext>), returns a 15-min
 *      presigned PUT URL plus the future public URL.
 *   2. Frontend → PUT bytes directly to uploadUrl. The backend never
 *      touches the file content.
 *   3. Frontend → confirmUpload(url, name)
 *      Backend HEADs the public URL to recover mime/size from S3 (we
 *      don't trust the client), then creates a plugin::upload.file
 *      record so Strapi's Media admin and the Academy.logo relation
 *      can refer to it as if it had been uploaded the normal way.
 *
 * The slug used in the path is derived from the caller's JWT — never
 * accepted from the client — so a malicious user can't drop files in
 * another tenant's prefix.
 */

import { nanoid } from 'nanoid';
import type { Core } from '@strapi/strapi';
import { mintPutUrl } from '../../../lib/s3-presign';
import { requireRole, resolveUserAcademyId } from '../helpers';

const FILE_UID = 'plugin::upload.file';
const ACADEMY_UID = 'api::academy.academy';

// Allowlist intentionally narrow: the only uploads the gym accepts today
// are images (logos, photos). Add to this list when new use cases land.
const ALLOWED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/svg+xml',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
};

function extFromMime(mime: string): string {
  return MIME_TO_EXT[mime] ?? mime.split('/').pop() ?? 'bin';
}

export function buildUpload({
  nexus,
  strapi,
}: {
  nexus: any;
  strapi: Core.Strapi;
}) {
  const PresignedUpload = nexus.objectType({
    name: 'PresignedUpload',
    description:
      "URL set returned by mintUploadUrl. Frontend PUTs bytes to uploadUrl, then calls confirmUpload(publicUrl, name) once it succeeds.",
    definition(t: any) {
      t.nonNull.string('uploadUrl');
      t.nonNull.string('publicUrl');
      t.nonNull.string('key');
    },
  });

  const mutations = nexus.extendType({
    type: 'Mutation',
    definition(t: any) {
      t.field('mintUploadUrl', {
        type: 'PresignedUpload',
        args: {
          filename: nexus.nonNull(nexus.stringArg()),
          contentType: nexus.nonNull(nexus.stringArg()),
          size: nexus.nonNull(nexus.intArg()),
        },
        resolve: async (_root: any, args: any, ctx: any) => {
          await requireRole(strapi, ctx, ['academy_admin', 'instructor']);

          if (!ALLOWED_MIME.has(args.contentType)) {
            throw new Error(
              `Tipo de arquivo não permitido: ${args.contentType}.`,
            );
          }
          if (args.size <= 0 || args.size > MAX_SIZE_BYTES) {
            throw new Error(
              `Tamanho inválido. Limite: ${Math.floor(MAX_SIZE_BYTES / 1024 / 1024)} MB.`,
            );
          }

          const academyId = await resolveUserAcademyId(strapi, ctx);
          if (!academyId) {
            throw new Error('Sua conta não está vinculada a uma academia.');
          }
          const academy: any = await strapi
            .documents(ACADEMY_UID)
            .findOne({ documentId: academyId, fields: ['slug'] as any });
          const slug = academy?.slug ?? 'unknown';

          const ext = extFromMime(args.contentType);
          const key = `academies/${slug}/${nanoid(64)}.${ext}`;
          return mintPutUrl({ key, contentType: args.contentType });
        },
      });

      t.field('confirmUpload', {
        type: 'Media',
        description:
          'Registers a previously-uploaded S3 object as a Strapi Media file. Run after a successful PUT to the URL returned by mintUploadUrl.',
        args: {
          url: nexus.nonNull(nexus.stringArg()),
          name: nexus.nonNull(nexus.stringArg()),
        },
        resolve: async (_root: any, args: any, ctx: any) => {
          await requireRole(strapi, ctx, ['academy_admin', 'instructor']);

          // HEAD the URL to recover mime/size — never trust the client.
          const head = await fetch(args.url, { method: 'HEAD' });
          if (!head.ok) {
            throw new Error(
              `Arquivo não encontrado no destino (${head.status}). O upload foi concluído?`,
            );
          }
          const mime = head.headers.get('content-type') ?? 'application/octet-stream';
          const sizeBytes = Number(head.headers.get('content-length') ?? 0);
          if (!ALLOWED_MIME.has(mime)) {
            throw new Error(`Tipo de arquivo não permitido: ${mime}.`);
          }
          if (sizeBytes <= 0 || sizeBytes > MAX_SIZE_BYTES) {
            throw new Error('Tamanho do arquivo inválido.');
          }

          // Derive name parts from the URL path.
          const pathname = new URL(args.url).pathname;
          const baseName = pathname.split('/').pop() ?? 'file';
          const dot = baseName.lastIndexOf('.');
          const hash = dot >= 0 ? baseName.slice(0, dot) : baseName;
          const ext = dot >= 0 ? baseName.slice(dot) : '';

          const academyId = await resolveUserAcademyId(strapi, ctx);
          const academy: any = academyId
            ? await strapi
                .documents(ACADEMY_UID)
                .findOne({ documentId: academyId, fields: ['slug'] as any })
            : null;
          const slug = academy?.slug ?? 'unknown';

          const file: any = await strapi.documents(FILE_UID).create({
            data: {
              folderPath: '/',
              name: args.name,
              hash: `${slug}/${hash}`,
              ext,
              mime,
              provider: 'aws-s3',
              size: sizeBytes / 1024, // Strapi stores size in KB
              url: args.url,
            } as any,
          });

          return file;
        },
      });
    },
  });

  return {
    types: [PresignedUpload, mutations],
    resolversConfig: {
      'Mutation.mintUploadUrl': { auth: true },
      'Mutation.confirmUpload': { auth: true },
    },
  };
}
