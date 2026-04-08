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

  return [Media, PaginationInput];
}
