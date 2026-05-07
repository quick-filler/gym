/**
 * S3 pre-signed URL helper.
 *
 * The frontend uploads bytes directly to S3 instead of POSTing through
 * Strapi's /api/upload — saves bandwidth on the backend container and
 * scales independently. After the PUT lands, the frontend calls
 * confirmUpload (in extensions/graphql/types/upload.ts) which HEADs
 * the public URL and creates the plugin::upload.file record.
 *
 * Pattern ported from quickfiller-strapi-api's getUploadURL controller,
 * adapted to gym's TypeScript backend and the S3_* env vars already
 * consumed by @strapi/provider-upload-aws-s3 (config/plugins.ts).
 */

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let cachedClient: S3Client | null = null;

function getClient(): S3Client {
  if (cachedClient) return cachedClient;
  cachedClient = new S3Client({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    credentials:
      process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY
        ? {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_KEY,
          }
        : undefined, // fall back to default chain (env, profile, IAM role)
    // Disable AWS SDK v3's automatic per-request CRC32 checksum (default
    // since Jan 2025). Backblaze B2 and other S3-compatible providers
    // reject presigned PUTs that carry the placeholder checksum query
    // params (x-amz-checksum-crc32=AAAAAA==) because the browser never
    // computes the real checksum at upload time. Setting both knobs to
    // WHEN_REQUIRED tells the SDK to only add a checksum if the API
    // operation explicitly demands it (PutObject does not).
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });
  return cachedClient;
}

export interface MintPutUrlInput {
  key: string;
  contentType: string;
  /** TTL in seconds. Defaults to 15 minutes. */
  expiresIn?: number;
}

export interface MintPutUrlResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

/**
 * Mints a presigned PUT URL for uploading a single object directly to
 * S3. publicUrl is the same URL with the auth query stripped — valid
 * once the object is uploaded with ACL public-read.
 */
export async function mintPutUrl({
  key,
  contentType,
  expiresIn = 15 * 60,
}: MintPutUrlInput): Promise<MintPutUrlResult> {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) throw new Error('S3_BUCKET is not configured.');

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    ACL: 'public-read',
  });

  const uploadUrl = await getSignedUrl(getClient(), command, { expiresIn });
  const publicUrl = stripQuery(uploadUrl);
  return { uploadUrl, publicUrl, key };
}

function stripQuery(url: string): string {
  const u = new URL(url);
  u.search = '';
  return u.toString();
}
