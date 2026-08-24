import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it } from 'vitest';
import { buildAcknowledgementEmail, buildEnquiryEmail, getEmailConfig } from '@/lib/email';
import { checkRateLimit, resetRateLimit, clientKey, RATE_LIMIT } from '@/lib/rateLimit';
import type { ContactPayload } from '@/lib/contactValidation';

const payload: ContactPayload = {
  email: 'ops@example.co.uk',
  interest: 'Workflow automation',
  companySize: '11–50',
  budget: 'Not sure yet',
  message: 'Quotes take three days to assemble.\n\nNobody owns the follow-up.',
  consent: true,
  referred: true,
  referralSource: 'Recommendation',
  referralName: 'A. Partner',
  website: '',
};

describe('email configuration', () => {
  it('refuses to claim it can send without an API key', () => {
    const result = getEmailConfig({});
    expect(result.ok).toBe(false);
  });

  it('falls back to the shared sender and disables acknowledgements', () => {
    const result = getEmailConfig({ RESEND_API_KEY: 're_test' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.config.from).toContain('resend.dev');
    // The shared sender can only deliver to the account owner, so acknowledging
    // a visitor from it would fail silently.
    expect(result.config.canAcknowledge).toBe(false);
    expect(result.config.to).toBe('quietgearsai@gmail.com');
  });

  it('uses the verified sender and its overrides when configured', () => {
    const result = getEmailConfig({
      RESEND_API_KEY: 're_test',
      CONTACT_FROM_EMAIL: 'Quiet Gears <enquiries@quietgears.co.uk>',
      CONTACT_TO_EMAIL: 'team@quietgears.co.uk',
      CONTACT_BCC_EMAIL: 'archive@quietgears.co.uk',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.config.canAcknowledge).toBe(true);
    expect(result.config.to).toBe('team@quietgears.co.uk');
    expect(result.config.bcc).toBe('archive@quietgears.co.uk');
  });
});

describe('enquiry email', () => {
  const email = buildEnquiryEmail(payload, '24 Aug 2026, 19:05 (London)');

  it('carries every submitted field in both parts', () => {
    for (const part of [email.text, email.html]) {
      expect(part).toContain('ops@example.co.uk');
      expect(part).toContain('Workflow automation');
      expect(part).toContain('11–50');
      expect(part).toContain('Not sure yet');
      expect(part).toContain('Recommendation');
      expect(part).toContain('A. Partner');
      expect(part).toContain('Quotes take three days to assemble.');
      expect(part).toContain('24 Aug 2026, 19:05 (London)');
    }
  });

  it('puts the sender in the subject so a full inbox stays sortable', () => {
    expect(email.subject).toContain('Workflow automation');
    expect(email.subject).toContain('ops@example.co.uk');
  });

  it('escapes submitted content instead of interpolating it into the markup', () => {
    const hostile = buildEnquiryEmail(
      { ...payload, message: '<script>alert(1)</script>', referralName: 'A & B <x>' },
      'now',
    );
    expect(hostile.html).not.toContain('<script>');
    expect(hostile.html).toContain('&lt;script&gt;');
    expect(hostile.html).toContain('A &amp; B &lt;x&gt;');
  });

  it('preserves paragraph breaks from the message', () => {
    expect(email.html).toContain('<p style="margin:0 0 14px;">Quotes take three days to assemble.</p>');
    expect(email.html).toContain('Nobody owns the follow-up.');
  });
});

describe('acknowledgement email', () => {
  const email = buildAcknowledgementEmail();

  it('promises exactly what the contact page promises', () => {
    // The page and the email are written in two files and must not drift.
    const page = readFileSync('app/contact/page.tsx', 'utf8');
    expect(page).toContain('A reply within one working day');
    expect(page).toContain('An initial consultation');

    for (const part of [email.text, email.html]) {
      expect(part).toContain('within one working day');
      expect(part).toContain('initial consultation');
    }
  });

  it('says it is not a mailing list, because the consent checkbox says so too', () => {
    expect(email.html).toContain('not a mailing list');
  });
});

describe('rate limit', () => {
  beforeEach(() => resetRateLimit());

  it('allows submissions up to the limit and refuses the next one', () => {
    const now = 1_000_000;
    for (let attempt = 0; attempt < RATE_LIMIT.max; attempt += 1) {
      expect(checkRateLimit('1.2.3.4', now).allowed).toBe(true);
    }
    const blocked = checkRateLimit('1.2.3.4', now);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('keeps separate counts per address', () => {
    const now = 1_000_000;
    for (let attempt = 0; attempt < RATE_LIMIT.max; attempt += 1) checkRateLimit('1.2.3.4', now);
    expect(checkRateLimit('5.6.7.8', now).allowed).toBe(true);
  });

  it('reopens once the window has passed', () => {
    const now = 1_000_000;
    for (let attempt = 0; attempt < RATE_LIMIT.max; attempt += 1) checkRateLimit('1.2.3.4', now);
    expect(checkRateLimit('1.2.3.4', now).allowed).toBe(false);
    expect(checkRateLimit('1.2.3.4', now + RATE_LIMIT.windowMs + 1).allowed).toBe(true);
  });

  it('takes the client from the first forwarded address', () => {
    expect(clientKey(new Headers({ 'x-forwarded-for': '9.9.9.9, 10.0.0.1' }))).toBe('9.9.9.9');
    expect(clientKey(new Headers({ 'x-real-ip': '9.9.9.9' }))).toBe('9.9.9.9');
    // No address means one shared bucket, which fails towards limiting.
    expect(clientKey(new Headers())).toBe('unknown');
  });
});
