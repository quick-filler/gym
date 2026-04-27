/**
 * Email helpers for the Gym platform.
 *
 * Uses Strapi's email plugin (configured with @strapi/provider-email-nodemailer
 * in config/plugins.ts). Every function accepts the strapi instance so they
 * are usable from lifecycle hooks without relying on the global.
 */

import type { Core } from '@strapi/strapi';

// ---------------------------------------------------------------------------
// Core sender
// ---------------------------------------------------------------------------

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail(
  strapi: Core.Strapi,
  opts: SendEmailOptions,
): Promise<void> {
  const defaultFrom =
    strapi.config.get<string>('plugin::email.settings.defaultFrom') ??
    'Gym <contato@gym.app>';

  await strapi.plugin('email').service('email').send({
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    from: opts.from ?? defaultFrom,
    replyTo: opts.replyTo,
  });
}

// ---------------------------------------------------------------------------
// HTML wrapper
// ---------------------------------------------------------------------------

function wrap(content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gym</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f3f4f6;line-height:1.6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f3f4f6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#0f0f0f;padding:28px 32px;">
              <span style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.03em;">Gym</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#0f0f0f;padding:24px 32px;text-align:center;">
              <p style="margin:0 0 6px 0;font-size:13px;color:#a1a1aa;">
                <a href="https://gym.app" style="color:#ffffff;text-decoration:none;">gym.app</a>
              </p>
              <p style="margin:0;font-size:12px;color:#52525b;">
                © ${new Date().getFullYear()} Gym. Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Lead notification (to the team)
// ---------------------------------------------------------------------------

interface LeadNotificationParams {
  name: string;
  email: string;
  phone?: string | null;
  academyName?: string | null;
  studentCount?: string | null;
  message: string;
}

const STUDENT_COUNT_LABELS: Record<string, string> = {
  menos_de_50: 'Menos de 50',
  de_50_a_200: '50 – 200',
  de_200_a_500: '200 – 500',
  mais_de_500: 'Mais de 500',
  ainda_nao_abri: 'Ainda não abri',
};

export async function sendLeadNotificationEmail(
  strapi: Core.Strapi,
  params: LeadNotificationParams,
): Promise<void> {
  const to = strapi.config.get<string>('server.contactNotificationEmail') ??
    process.env.CONTACT_NOTIFICATION_EMAIL;

  if (!to) {
    strapi.log.warn('[email] CONTACT_NOTIFICATION_EMAIL not set — skipping lead notification');
    return;
  }

  const countLabel = params.studentCount
    ? (STUDENT_COUNT_LABELS[params.studentCount] ?? params.studentCount)
    : '—';

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-size:14px;color:#6b7280;width:40%;">${label}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-size:14px;color:#111827;font-weight:500;">${value}</td>
    </tr>`;

  const html = wrap(`
    <h2 style="margin:0 0 6px 0;font-size:20px;font-weight:700;color:#111827;">Novo lead recebido</h2>
    <p style="margin:0 0 24px 0;font-size:14px;color:#6b7280;">
      Alguém preencheu o formulário de contato no site.
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:24px;">
      ${row('Nome', params.name)}
      ${row('E-mail', `<a href="mailto:${params.email}" style="color:#e8551c;">${params.email}</a>`)}
      ${row('WhatsApp', params.phone ?? '—')}
      ${row('Academia', params.academyName ?? '—')}
      ${row('Alunos ativos', countLabel)}
    </table>

    <div style="background-color:#f9fafb;border-left:3px solid #e8551c;border-radius:4px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 6px 0;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Mensagem</p>
      <p style="margin:0;font-size:15px;color:#111827;white-space:pre-wrap;">${params.message}</p>
    </div>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td>
          <a href="mailto:${params.email}"
             style="display:inline-block;background-color:#e8551c;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">
            Responder agora
          </a>
        </td>
      </tr>
    </table>
  `);

  const text = `Novo lead recebido

Nome: ${params.name}
E-mail: ${params.email}
WhatsApp: ${params.phone ?? '—'}
Academia: ${params.academyName ?? '—'}
Alunos ativos: ${countLabel}

Mensagem:
${params.message}

Responder: mailto:${params.email}`;

  await sendEmail(strapi, {
    to,
    subject: `Novo lead: ${params.name} — ${params.academyName ?? params.email}`,
    html,
    text,
  });
}

// ---------------------------------------------------------------------------
// Lead confirmation (to the prospect)
// ---------------------------------------------------------------------------

export async function sendLeadConfirmationEmail(
  strapi: Core.Strapi,
  params: Pick<LeadNotificationParams, 'name' | 'email' | 'message'>,
): Promise<void> {
  const firstName = params.name.split(' ')[0];

  const html = wrap(`
    <h2 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#111827;">
      Obrigado pela preferência, ${firstName}!
    </h2>
    <p style="margin:0 0 20px 0;font-size:15px;color:#374151;line-height:1.7;">
      Recebemos sua mensagem e ficamos muito felizes com o seu interesse no
      <strong>Gym</strong>. Nossa equipe já foi notificada e entrará em contato
      em breve — geralmente em <strong>menos de 1 hora</strong> durante o
      horário comercial.
    </p>

    <div style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 10px 0;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.07em;">
        Sua mensagem
      </p>
      <p style="margin:0;font-size:15px;color:#111827;line-height:1.7;white-space:pre-wrap;">${params.message}</p>
    </div>

    <p style="margin:0 0 20px 0;font-size:15px;color:#374151;">
      Se quiser falar com a gente agora mesmo, é só chamar no WhatsApp:
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td>
          <a href="https://wa.me/5511999990000"
             style="display:inline-block;background-color:#25d366;color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:600;font-size:15px;">
            💬 Falar pelo WhatsApp
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
      Atenciosamente,<br>
      <strong style="color:#111827;">Time Gym</strong>
    </p>
  `);

  const text = `Obrigado pela preferência, ${firstName}!

Recebemos sua mensagem e nossa equipe entrará em contato em breve.

Sua mensagem:
---
${params.message}
---

Se quiser falar agora: https://wa.me/5511999990000

Atenciosamente,
Time Gym`;

  await sendEmail(strapi, {
    to: params.email,
    subject: `Obrigado pela preferência, ${firstName}! Recebemos sua mensagem.`,
    html,
    text,
    replyTo: process.env.CONTACT_NOTIFICATION_EMAIL,
  });
}
