export type ContactPayload = {
  email: string;
  interest: string;
  companySize: string;
  budget: string;
  message: string;
  consent: boolean;
  referred: boolean;
  referralSource: string;
  referralName: string;
  website: string;
};

const clean = (value: unknown, max = 3000) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

const checked = (value: unknown) => {
  if (value === true) return true;
  return ['on', 'true', 'yes', '1'].includes(clean(value, 5).toLowerCase());
};

export function validateContactPayload(body: Record<string, unknown>) {
  const payload: ContactPayload = {
    email: clean(body.email, 254),
    interest: clean(body.interest, 100),
    companySize: clean(body.companySize, 30),
    budget: clean(body.budget, 50),
    message: clean(body.message),
    consent: checked(body.consent),
    referred: checked(body.referred),
    referralSource: clean(body.referralSource, 100),
    referralName: clean(body.referralName, 150),
    website: clean(body.website, 200),
  };

  const missing: string[] = [];
  if (!/^\S+@\S+\.\S+$/.test(payload.email)) missing.push('a valid email address');
  if (!payload.interest) missing.push('the subject');
  if (!payload.companySize) missing.push('company size');
  if (!payload.budget) missing.push('an indicative budget');
  if (payload.message.length < 10) missing.push('your enquiry (at least ten characters)');
  if (!payload.consent) missing.push('consent to reply');
  if (payload.referred && !payload.referralSource) missing.push('how you were referred');
  if (payload.referred && !payload.referralName) missing.push('who referred you');

  return { payload, missing };
}

