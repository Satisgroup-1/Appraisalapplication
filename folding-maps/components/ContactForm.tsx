'use client';

import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

type FormState = 'idle' | 'sending' | 'done' | 'error';

export function ContactForm() {
  const [state, setState] = useState<FormState>('idle');
  const [referred, setReferred] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('sending');
    setErrorMessage('');

    try {
      const formData = new FormData(event.currentTarget);
      const data = {
        email: String(formData.get('email') || ''),
        interest: String(formData.get('interest') || ''),
        companySize: String(formData.get('companySize') || ''),
        budget: String(formData.get('budget') || ''),
        message: String(formData.get('message') || ''),
        consent: formData.has('consent'),
        referred,
        referralSource: referred ? String(formData.get('referralSource') || '') : '',
        referralName: referred ? String(formData.get('referralName') || '') : '',
        website: String(formData.get('website') || ''),
      };

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrorMessage(
          result.error || 'The message did not send. Please email enquiries@quietgears.xyz directly.',
        );
        setState('error');
        return;
      }

      setState('done');
    } catch {
      setErrorMessage(
        'We could not reach the server. Please try again, or email enquiries@quietgears.xyz directly.',
      );
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <div className="form-success" role="status">
        <Check size={20} aria-hidden="true" />
        <h3>Enquiry received.</h3>
        <p>
          One of the two lead consultants will read it and reply within one working day,
          either to arrange an initial consultation or to explain why this is not something
          we should take on. A confirmation is on its way to your inbox. If it is urgent,
          email enquiries@quietgears.xyz and say so in the subject line.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={send} className="contact-form" noValidate={false}>
      <label className="field">
        <span className="field-label">Email</span>
        <input required type="email" name="email" placeholder="you@company.co.uk" autoComplete="email" />
      </label>

      <div className="form-row">
        <label className="field">
          <span className="field-label">Subject</span>
          <select required name="interest" defaultValue="">
            <option value="" disabled>
              Select one
            </option>
            <option>Deciding where to start</option>
            <option>Workflow automation</option>
            <option>A system to be built</option>
            <option>An existing system that is not working</option>
            <option>Training and adoption</option>
            <option>Something else</option>
          </select>
        </label>

        <label className="field">
          <span className="field-label">Company size</span>
          <select required name="companySize" defaultValue="">
            <option value="" disabled>
              Select a range
            </option>
            <option>1–10</option>
            <option>11–50</option>
            <option>51–250</option>
            <option>250+</option>
          </select>
        </label>
      </div>

      <label className="field">
        <span className="field-label">Indicative budget</span>
        <select required name="budget" defaultValue="">
          <option value="" disabled>
            Select a range
          </option>
          <option>£2,000–£5,000</option>
          <option>£5,000–£15,000</option>
          <option>£15,000–£50,000</option>
          <option>£50,000+</option>
          <option>Not sure yet</option>
        </select>
        <small className="field-hint">
          Budget decides the shape of the work, from a short piece of advice through to a
          system built and handed over. It helps us suggest something that fits.
          “Not sure yet” is a fine answer.
        </small>
      </label>

      <label className="field">
        <span className="field-label">Your enquiry</span>
        <textarea required minLength={10} name="message" rows={7} />
        <small className="field-hint">
          A few lines about what you would like help with.
        </small>
      </label>

      <fieldset className="referral-field">
        <legend className="field-label">Referral</legend>
        <label className={`referral-check ${referred ? 'active' : ''}`}>
          <input
            type="checkbox"
            name="referred"
            value="yes"
            checked={referred}
            onChange={(event) => setReferred(event.target.checked)}
          />
          <span className="referral-check-box" aria-hidden="true">
            <Check size={13} />
          </span>
          <span>Someone referred me</span>
        </label>
      </fieldset>

      {referred && (
        <div className="form-row referral-details">
          <label className="field">
            <span className="field-label">How</span>
            <input required name="referralSource" placeholder="Recommendation, event, partner…" />
          </label>
          <label className="field">
            <span className="field-label">Who</span>
            <input required name="referralName" placeholder="Name or organisation" />
          </label>
        </div>
      )}

      <label className="consent">
        <input required type="checkbox" name="consent" />
        <span>
          I agree to Quiet Gears using these details to reply to this enquiry. They are not
          added to a mailing list. <em>Required</em>
        </span>
      </label>

      <button disabled={state === 'sending'} className="button" type="submit">
        {state === 'sending' ? 'Sending…' : 'Send enquiry'}
        <ArrowRight size={17} aria-hidden="true" />
      </button>

      {state === 'error' && (
        <p className="form-error" role="alert">
          {errorMessage}
        </p>
      )}

      {/* Honeypot: a real person never fills this in, and it is hidden from
          assistive technology as well as from sight. */}
      <input className="trap" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
    </form>
  );
}
