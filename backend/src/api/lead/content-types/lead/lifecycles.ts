import {
  sendLeadNotificationEmail,
  sendLeadConfirmationEmail,
} from '../../../../lib/email';

export default {
  async afterCreate(event: any) {
    const { result } = event;

    setImmediate(async () => {
      try {
        await sendLeadNotificationEmail(strapi, {
          name: result.name,
          email: result.email,
          phone: result.phone,
          academyName: result.academyName,
          studentCount: result.studentCount,
          message: result.message,
        });

        await sendLeadConfirmationEmail(strapi, {
          name: result.name,
          email: result.email,
          message: result.message,
        });

        strapi.log.info(`[lead] emails sent for lead ${result.documentId}`);
      } catch (err: any) {
        strapi.log.error(`[lead] failed to send emails: ${err.message}`);
      }
    });
  },
};
