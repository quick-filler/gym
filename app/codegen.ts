/**
 * GraphQL Code Generator config for the Expo student app.
 *
 * Reads the canonical schema from `backend/schema.graphql` (emitted at
 * every Strapi boot via `graphql.artifacts.schema = true`) and scans
 * `graphql/**` + all source files for queries and mutations. Generated
 * types land in `./gql/` — use via:
 *
 *   import { graphql } from './gql';
 *
 *   const ACADEMY_BY_SLUG = graphql(`
 *     query AcademyBySlug($slug: String!) {
 *       academyBySlug(slug: $slug) { documentId name primaryColor }
 *     }
 *   `);
 *
 * Identical pipeline to `website/` — the only difference is the output
 * directory (Expo's metro bundler doesn't care about `src/` conventions).
 *
 * Run with: `npm run codegen`
 */

import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../backend/schema.graphql',
  documents: ['**/*.{ts,tsx}', 'graphql/**/*.graphql', '!node_modules/**', '!gql/**'],
  ignoreNoDocuments: true,
  generates: {
    './gql/': {
      preset: 'client',
      config: {
        scalars: {
          DateTime: 'string',
          JSON: 'unknown',
        },
      },
    },
  },
};

export default config;
