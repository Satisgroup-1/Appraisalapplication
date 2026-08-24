import { NextResponse } from 'next/server';
import { validateContactPayload } from '@/lib/contactValidation';
import {
  buildAcknowledgementEmail,
  buildEnquiryEmail,
  FALLBACK_ADDRESS,
  getEmailConfig,
  getResend,
} from '@/lib/email';
import { checkRateLimit, clientKey } from '@/lib/rateLimit';

export const runtime = 'nodejs';
/* An enquiry is never cached and never prerendered. */
export const dynamic = 'force-dynamic';

const fallback = (message: string) =>
  `${message} Please email ${FALLBACK_ADDRESS} directly.`;

export async function POST(request: Request) {
  const now = Date.now();

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const { payload, missing } = validateContactPayload(body);

    // Honeypot. Answer exactly as a success does, so a bot learns nothing from
    // the response, and stop before spending a send.
    if (payload.website) return NextResponse.json({ ok: true });

    if (missing.length) {
      return NextResponse.json(
        { error: `Please check: ${missing.join(', ')}.`, fields: missing },
        { status: 400 },
      );
    }

    const limit = checkRateLimit(clientKey(request.headers), now);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: fallback('Too many enquiries from this address in a short period.') },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
      );
    }

    const configured = getEmailConfig();
    if (!configured.ok) {
      // A deployment without credentials must say so rather than pretend to send.
      console.error(`[contact] email not configured: ${configured.reason}`);
      return NextResponse.json(
        { error: fallback('Email delivery is not configured on this site.') },
        { status: 503 },
      );
    }

    const { apiKey, from, to, bcc, canAcknowledge } = configured.config;
    const resend = getResend(apiKey);

    const receivedAt = new Date(now).toLocaleString('en-GB', {
      timeZone: 'Europe/London',
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    const enquiryEmail = buildEnquiryEmail(payload, `${receivedAt} (London)`);

    const enquiry = await resend.emails.send({
      from,
      to,
      ...(bcc ? { bcc } : {}),
      replyTo: payload.email,
      subject: enquiryEmail.subject,
      text: enquiryEmail.text,
      html: enquiryEmail.html,
      tags: [{ name: 'source', value: 'website-contact' }],
    });

    if (enquiry.error) {
      // Log the provider's reason, never the enquiry itself.
      console.error('[contact] enquiry delivery failed', enquiry.error);
      return NextResponse.json(
        { error: fallback('Email delivery is temporarily unavailable.') },
        { status: 502 },
      );
    }

    // The acknowledgement is secondary: the enquiry is already delivered, so a
    // failure here is logged and does not fail the request.
    if (canAcknowledge) {
      const acknowledgement = buildAcknowledgementEmail();
      const sent = await resend.emails
        .send({
          from,
          to: payload.email,
          replyTo: to,
          subject: acknowledgement.subject,
          text: acknowledgement.text,
          html: acknowledgement.html,
          tags: [{ name: 'source', value: 'website-contact-ack' }],
        })
        .catch((error: unknown) => ({ error }));

      if ('error' in sent && sent.error) {
        console.error('[contact] acknowledgement delivery failed', sent.error);
      }
    }

    return NextResponse.json({ ok: true, acknowledged: canAcknowledge });
  } catch (error) {
    console.error('[contact] request failed', error);
    return NextResponse.json(
      { error: fallback('Your enquiry could not be sent.') },
      { status: 500 },
    );
  }
}
