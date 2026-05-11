/**
 * Shared GraphQL types used across the gym schema.
 *
 * Returned from each module-level builder function (one per content type)
 * so the registration step can flatten them into a single types array.
 */

export function buildCommonTypes({ nexus }: any) {
  const Media = nexus.objectType({
    name: 'Media',
    description: 'Reference to an uploaded file (logo, photo, etc.)',
    definition(t: any) {
      t.nonNull.id('documentId');
      t.string('url');
      t.string('alternativeText');
      t.int('width');
      t.int('height');
      t.string('mime');
    },
  });

  const PaginationInput = nexus.inputObjectType({
    name: 'PaginationInput',
    definition(t: any) {
      t.int('start', { default: 0 });
      t.int('limit', { default: 25 });
    },
  });

  // Structured address — used by Student and Dependent. Free-form enough
  // to fit the variety of Brazilian formats (apartments, blocks, gated
  // communities) without committing to ViaCEP-style sub-fields.
  const Address = nexus.objectType({
    name: 'Address',
    definition(t: any) {
      t.string('type');
      t.string('cep');
      t.string('street');
      t.string('number');
      t.string('complement');
      t.string('neighborhood');
      t.string('city');
      t.string('state');
    },
  });

  const AddressInput = nexus.inputObjectType({
    name: 'AddressInput',
    definition(t: any) {
      t.string('type');
      t.string('cep');
      t.string('street');
      t.string('number');
      t.string('complement');
      t.string('neighborhood');
      t.string('city');
      t.string('state');
    },
  });

  return [Media, PaginationInput, Address, AddressInput];
}
