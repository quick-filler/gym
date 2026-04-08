import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => {
  const result: Core.Config.Plugin = {
    'users-permissions': {
      config: {
        jwt: {
          expiresIn: '30d',
        },
        register: {
          allowedFields: ['name', 'phone'],
        },
      },
    },
  };

  // Activate S3 upload provider only when explicitly enabled.
  if (env('UPLOAD_PROVIDER') === 's3') {
    result.upload = {
      config: {
        provider: 'aws-s3',
        providerOptions: {
          s3Options: {
            credentials: {
              accessKeyId: env('S3_ACCESS_KEY'),
              secretAccessKey: env('S3_SECRET_KEY'),
            },
            region: env('S3_REGION', 'us-east-1'),
            endpoint: env('S3_ENDPOINT'),
            forcePathStyle: env.bool('S3_FORCE_PATH_STYLE', true),
            params: {
              Bucket: env('S3_BUCKET'),
            },
          },
        },
        actionOptions: {
          upload: {},
          uploadStream: {},
          delete: {},
        },
      },
    };
  }

  return result;
};

export default config;
