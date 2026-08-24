import { describe, expect, it } from 'vitest';
import { validateContactPayload } from '@/lib/contactValidation';

const complete = {
  email: 'person@example.com',
  interest: 'AI strategy',
  companySize: '11-50',
  budget: 'Not sure yet',
  message: 'We need help improving a repeated operational workflow.',
  consent: true,
  website: '',
};

describe('contact payload validation', () => {
  it('accepts a complete enquiry without a referral', () => {
    const result = validateContactPayload({ ...complete, referred: false });
    expect(result.missing).toEqual([]);
    expect(result.payload.referred).toBe(false);
  });

  it('accepts a complete referred enquiry from HTML checkbox values', () => {
    const result = validateContactPayload({ ...complete, consent: 'on', referred: 'yes', referralSource: 'Recommendation', referralName: 'A Client' });
    expect(result.missing).toEqual([]);
    expect(result.payload.consent).toBe(true);
    expect(result.payload.referred).toBe(true);
  });

  it('returns precise field guidance instead of a generic error', () => {
    const result = validateContactPayload({ ...complete, message: 'Short', consent: false });
    expect(result.missing).toEqual(['an opportunity description of at least 10 characters', 'privacy consent']);
  });

  it('requires referral details only when referral is selected', () => {
    const result = validateContactPayload({ ...complete, referred: true });
    expect(result.missing).toEqual(['how you were referred', 'who referred you']);
  });
});

