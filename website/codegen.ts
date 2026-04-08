/**
 * GraphQL Code Generator config for the website.
 *
 * Reads the canonical schema from `backend/schema.graphql` (emitted at
 * every Strapi boot via the `graphql.artifacts.schema = true` plugin
 * config) and scans `src/graphql/**` + all source files for queries and
 * mutations. Output lands in `src/gql/` as a fully-typed `graphql()`
 * function + generated types — use it in components via:
 *
 *   import { graphql } from '@/gql';
 *
 *   const ACADEMY_BY_SLUG = graphql(`
 *     query AcademyBySlug($slug: String!) {
 *       academyBySlug(slug: $slug) { documentId name primaryColor }
 *     }
 *   `);
 *
 *   const { data } = useQuery(ACADEMY_BY_SLUG, { variables: { slug } });
 *
 * Apollo Client's `useQuery` infers `data` from the `graphql()` return
 * type — no manual types, no casts.
 *
 * Run with: `npm run codegen` (or `npm run codegen -- --watch`).
 */

import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../backend/schema.graphql',
  documents: ['src/**/*.{ts,tsx}', 'src/graphql/**/*.graphql'],
  ignoreNoDocuments: true,
  generates: {
    './src/gql/': {
      preset: 'client',
      config: {
        scalars: {
          // Strapi v5 DateTime comes through as ISO strings.
          DateTime: 'string',
          JSON: 'unknown',
        },
      },
    },
  },
};

export default config;
