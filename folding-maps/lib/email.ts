import { Resend } from 'resend';
import type { ContactPayload } from '@/lib/contactValidation';

/**
 * Everything the contact route needs to talk to Resend.
 *
 * The configuration is resolved once and reported as a discriminated result, so
 * the route can distinguish "email is not set up on this deployment" (a 503 the
 * visitor should be told about, with a fallback address) from "Resend rejected
 * the send" (a 502 worth retrying). Silently swallowing the first is how an
 * enquiry form ends up quietly dropping business for a month.
 */

export const FALLBACK_ADDRESS = 'enquiries@quietgears.xyz';
const DEFAULT_TO = FALLBACK_ADDRESS;

export type EmailConfig = {
  apiKey: string;
  /** Verified sender. Resend rejects anything not on a verified domain. */
  from: string;
  to: string;
  bcc?: string;
  /** Acknowledgements only send from a verified domain, never from resend.dev. */
  canAcknowledge: boolean;
};

export type EmailConfigResult =
  | { ok: true; config: EmailConfig }
  | { ok: false; reason: string };

/**
 * Mailbox providers do not let anyone verify their domain as a Resend sender,
 * so a CONTACT_FROM_EMAIL on one of these is guaranteed to be rejected at send
 * time. Catching it here turns a 502 nobody can diagnose into a named
 * configuration error in the log.
 */
const UNVERIFIABLE_SENDER_DOMAINS = [
  'gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'hotmail.co.uk',
  'live.com', 'live.co.uk', 'yahoo.com', 'yahoo.co.uk', 'icloud.com', 'me.com',
  'aol.com', 'proton.me', 'protonmail.com', 'gmx.com', 'mail.com',
];

/** Accepts both `addr@domain` and `Display Name <addr@domain>`. */
export function senderAddress(value: string) {
  const angled = value.match(/<([^>]+)>/);
  return (angled ? angled[1] : value).trim().toLowerCase();
}

/** Takes the environment as an argument so it can be exercised without mutating process.env. */
export function getEmailConfig(
  env: Record<string, string | undefined> = process.env,
): EmailConfigResult {
  const apiKey = env.RESEND_API_KEY?.trim();
  if (!apiKey) return { ok: false, reason: 'RESEND_API_KEY is not set' };
  if (!apiKey.startsWith('re_')) {
    return { ok: false, reason: 'RESEND_API_KEY does not look like a Resend key: they begin with re_' };
  }

  const configuredFrom = env.CONTACT_FROM_EMAIL?.trim();
  const to = env.CONTACT_TO_EMAIL?.trim() || DEFAULT_TO;
  const bcc = env.CONTACT_BCC_EMAIL?.trim() || undefined;

  if (configuredFrom) {
    const address = senderAddress(configuredFrom);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(address)) {
      return {
        ok: false,
        reason: `CONTACT_FROM_EMAIL is not an address: ${configuredFrom}. Use enquiries@yourdomain.co.uk or Name <enquiries@yourdomain.co.uk>`,
      };
    }
    const domain = address.split('@')[1];
    if (UNVERIFIABLE_SENDER_DOMAINS.includes(domain)) {
      return {
        ok: false,
        reason: `CONTACT_FROM_EMAIL uses ${domain}, which cannot be verified as a Resend sending domain. Send from a domain you control and set CONTACT_TO_EMAIL to the ${domain} address if that is where enquiries should land`,
      };
    }
  }

  // Resend's shared onboarding sender works for a first smoke test but can only
  // deliver to the account owner, so it is never used to acknowledge a visitor.
  const from = configuredFrom || 'Quiet Gears <onboarding@resend.dev>';

  return {
    ok: true,
    config: { apiKey, from, to, bcc, canAcknowledge: Boolean(configuredFrom) },
  };
}

let client: Resend | null = null;
let clientKey = '';

/** One client per key, reused across invocations in a warm serverless instance. */
export function getResend(apiKey: string): Resend {
  if (!client || clientKey !== apiKey) {
    client = new Resend(apiKey);
    clientKey = apiKey;
  }
  return client;
}

/* -------------------------------------------------------------------------- */
/* Templates                                                                   */
/* -------------------------------------------------------------------------- */

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const paragraphs = (value: string) =>
  value
    .split(/\n{2,}/)
    .map((block) => escapeHtml(block).replace(/\n/g, '<br />'))
    .filter(Boolean);

/** Shared shell. Table-based and inline-styled, because email clients are not browsers. */
function wrap(title: string, body: string) {
  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /><title>${escapeHtml(title)}</title></head>
  <body style="margin:0;padding:24px;background:#f2f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0a1b2a;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid rgba(10,27,42,0.14);">
      <tr>
        <td style="padding:24px 28px;border-bottom:1px solid rgba(10,27,42,0.14);">
          <span style="font-size:15px;font-weight:600;letter-spacing:-0.02em;">Quiet Gears</span>
        </td>
      </tr>
      <tr><td style="padding:28px;font-size:15px;line-height:1.65;">${body}</td></tr>
      <tr>
        <td style="padding:18px 28px;border-top:1px solid rgba(10,27,42,0.14);font-size:12px;line-height:1.6;color:#56687c;">
          Quiet Gears Ltd · London · working UK-wide
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

const FIELD_ROW = (label: string, value: string) => `
  <tr>
    <td style="padding:8px 12px 8px 0;border-bottom:1px solid rgba(10,27,42,0.14);font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#56687c;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:8px 0;border-bottom:1px solid rgba(10,27,42,0.14);font-size:14px;vertical-align:top;">${escapeHtml(value)}</td>
  </tr>`;

export function buildEnquiryEmail(payload: ContactPayload, receivedAt: string) {
  const referral = payload.referred
    ? `${payload.referralSource}: ${payload.referralName}`
    : 'Not referred';

  const fields: [string, string][] = [
    ['From', payload.email],
    ['Subject', payload.interest],
    ['Company size', payload.companySize],
    ['Budget', payload.budget],
    ['Referral', referral],
    ['Received', receivedAt],
  ];

  const text = [
    ...fields.map(([label, value]) => `${label}: ${value}`),
    '',
    'Enquiry',
    payload.message,
    '',
    `Reply directly to this email to reach ${payload.email}.`,
  ].join('\n');

  const html = wrap(
    `Enquiry: ${payload.interest}`,
    `<h1 style="margin:0 0 20px;font-size:19px;font-weight:600;letter-spacing:-0.02em;">New enquiry</h1>
     <table role="presentation" cellpadding="0" cellspacing="0" width="100%">${fields
       .map(([label, value]) => FIELD_ROW(label, value))
       .join('')}</table>
     <p style="margin:24px 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#56687c;">Enquiry</p>
     ${paragraphs(payload.message)
       .map((block) => `<p style="margin:0 0 14px;">${block}</p>`)
       .join('')}
     <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid rgba(10,27,42,0.14);font-size:13px;color:#56687c;">
       Reply directly to this email to reach ${escapeHtml(payload.email)}.
     </p>`,
  );

  return { subject: `Enquiry: ${payload.interest} (${payload.email})`, text, html };
}

/**
 * The acknowledgement repeats the one commitment the contact page makes about
 * timing: a reply within one working day. That phrase has to stay identical in
 * both places, which is why the wording lives in one file and a test compares
 * them. The page also sets out an initial consultation as the step after the
 * reply; the acknowledgement no longer restates it, by editorial decision.
 */
export function buildAcknowledgementEmail() {
  const text = [
    'Thank you for contacting Quiet Gears.',
    '',
    'Your enquiry has been received. We will review the information provided and aim to respond within one working day.',
    '',
    'Kind regards,',
    'Quiet Gears',
    'London · working UK-wide',
  ].join('\n');

  const html = wrap(
    'We received your enquiry',
    `<h1 style="margin:0 0 20px;font-size:19px;font-weight:600;letter-spacing:-0.02em;">Thank you for contacting Quiet Gears.</h1>
     <p style="margin:0 0 16px;">Your enquiry has been received. We will review the information provided and aim to respond <strong>within one working day</strong>.</p>
     <p style="margin:0 0 16px;">Kind regards,<br />Quiet Gears</p>
     <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid rgba(10,27,42,0.14);font-size:13px;color:#56687c;">
       This is an acknowledgement. Your details are used only to answer this enquiry and are not added to a mailing list.
     </p>`,
  );

  return { subject: 'Quiet Gears: we received your enquiry', text, html };
}
