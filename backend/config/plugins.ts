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
      // Emit the built SDL to disk on every boot so the website and app
      // codegen can read it directly — no introspection round-trip, no
      // running backend required for `npm run codegen`.
      //
      // Written to: src/extensions/graphql/schema/schema.graphql
      // (tracked in git so fresh clones can codegen without booting Strapi)
      artifacts: {
        schema: true,
        typegen: false,
      },
    },
  },

  // Email — Nodemailer provider. Configure SMTP_ vars in .env.
  // CONTACT_NOTIFICATION_EMAIL sets where new lead notifications land.
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.gmail.com'),
        port: env.int('SMTP_PORT', 587),
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
      },
      settings: {
        defaultFrom: env('SMTP_DEFAULT_FROM', 'Gym <contato@gym.app>'),
        defaultReplyTo: env('SMTP_DEFAULT_REPLY_TO', 'contato@gym.app'),
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
