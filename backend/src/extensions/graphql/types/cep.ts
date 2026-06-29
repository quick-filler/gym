/**
 * GraphQL for CEP lookup — `Query.cepLookup(cep)` resolves a Brazilian
 * postal code to an address via ViaCEP (server-side proxy in
 * `services/cep.ts`). Powers address autofill in the app's profile /
 * dependent forms (and reusable by the admin web). Read-only, auth: true.
 */

import type { Core } from '@strapi/strapi';
import { lookupCep } from '../../../services/cep';

export function buildCep({ nexus, strapi }: { nexus: any; strapi: Core.Strapi }) {
  const CepAddress = nexus.objectType({
    name: 'CepAddress',
    description:
      'Address resolved from a Brazilian CEP (postal code). Null when the CEP is not found.',
    definition(t: any) {
      t.nonNull.string('cep');
      t.nonNull.string('street');
      t.nonNull.string('neighborhood');
      t.nonNull.string('city');
      t.nonNull.string('state');
    },
  });

  const queries = nexus.extendType({
    type: 'Query',
    definition(t: any) {
      t.field('cepLookup', {
        type: 'CepAddress',
        description:
          'Resolve a Brazilian CEP to street/neighborhood/city/state (ViaCEP). Null when invalid or not found. Powers address autofill so the user only types the number.',
        args: { cep: nexus.nonNull(nexus.stringArg()) },
        resolve: async (_root: any, args: any) => lookupCep(strapi, args.cep),
      });
    },
  });

  return {
    types: [CepAddress, queries],
    resolversConfig: {
      'Query.cepLookup': { auth: true },
    },
  };
}
