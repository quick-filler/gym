import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => {
  const result: Core.Config.Plugin = {
  // Auth — JWT lasts 30 days, register accepts the gym-specific fields.
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

  // GraphQL — the only data API for the website + apps.
  // shadowCRUD is intentionally disabled per project convention: every type,
  // query, and mutation is defined explicitly in src/extensions/graphql so we
  // never accidentally expose internal fields or incremental DB IDs.
  graphql: {
    config: {
      endpoint: '/graphql',
      shadowCRUD: false,
      playgroundAlways: env.bool('GRAPHQL_PLAYGROUND', env('NODE_ENV') !== 'production'),
      defaultLimit: 25,
      maxLimit: 100,
      apolloServer: {
        tracing: false,
      },
    },
  },

  // config-sync — exports/imports core-store + permissions to /config/sync,
  // so role and admin config travels with the repo across environments.
  // importOnBootstrap is off so manual review is always required.
  'config-sync': {
    enabled: true,
    config: {
      syncDir: 'config/sync/',
      minify: false,
      soft: false,
      importOnBootstrap: false,
      excludedTypes: [],
      excludedConfig: [
        'plugin_users-permissions_grant', // OAuth client secrets — don't sync.
      ],
    },
  },

  };

  // S3-compatible upload provider is the default. Local fallback is enabled
  // explicitly via UPLOAD_PROVIDER=local for offline development.
  if (env('UPLOAD_PROVIDER', 's3') !== 'local') {
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
