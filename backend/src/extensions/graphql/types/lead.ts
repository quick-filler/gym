/**
 * Public mutation: submitContactForm
 *
 * Called from the /contact page on the marketing site. Auth is intentionally
 * off — prospects aren't logged in. The mutation creates a Lead record and
 * the afterCreate lifecycle sends both an internal notification email (to the
 * team) and a confirmation email to the prospect.
 */

export function buildLead({ nexus, strapi }: any) {
  const ContactFormInput = nexus.inputObjectType({
    name: 'ContactFormInput',
    definition(t: any) {
      t.nonNull.string('name');
      t.nonNull.string('email');
      t.string('phone');
      t.string('academyName');
      t.string('studentCount');
      t.nonNull.string('message');
    },
  });

  const ContactFormResult = nexus.objectType({
    name: 'ContactFormResult',
    definition(t: any) {
      t.nonNull.boolean('ok');
    },
  });

  const Mutation = nexus.extendType({
    type: 'Mutation',
    definition(t: any) {
      t.field('submitContactForm', {
        type: 'ContactFormResult',
        args: { input: nexus.nonNull(nexus.arg({ type: 'ContactFormInput' })) },
        async resolve(_: any, { input }: any) {
          await strapi.documents('api::lead.lead').create({ data: input });
          return { ok: true };
        },
      });
    },
  });

  return {
    types: [ContactFormInput, ContactFormResult, Mutation],
    resolversConfig: {
      'Mutation.submitContactForm': { auth: false },
    },
  };
}
