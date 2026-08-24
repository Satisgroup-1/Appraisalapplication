'use client';

import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export function ContactForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [referred, setReferred] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('sending');
    setErrorMessage('');

    try {
      const formData = new FormData(e.currentTarget);
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
        setErrorMessage(result.error || 'Something went wrong. Please email us directly.');
        setState('error');
        return;
      }

      setState('done');
    } catch {
      setErrorMessage('Unable to connect. Please try again or email us directly.');
      setState('error');
    }
  }

  if (state === 'done') {
    return <div className="form-success"><Check/><h2>Thank you.</h2><p>Your message is in the gears. We&apos;ll reply within one working day.</p></div>;
  }

  return (
    <form onSubmit={send} className="contact-form">
      <label>Email<input required type="email" name="email" placeholder="you@company.co.uk"/></label>
      <div className="form-row">
        <label>What can we help with?<select required name="interest" defaultValue=""><option value="" disabled>Select a service</option><option>AI strategy</option><option>Workflow automation</option><option>AI agents & integration</option><option>Website or application</option><option>Training</option><option>Something else</option></select></label>
        <label>Company size<select required name="companySize" defaultValue=""><option value="" disabled>Select a range</option><option>1–10</option><option>11–50</option><option>51–250</option><option>250+</option></select></label>
      </div>
      <label>Indicative budget<select required name="budget" defaultValue=""><option value="" disabled>Select a range</option><option>£2,000–£5,000</option><option>£5,000–£15,000</option><option>£15,000–£50,000</option><option>£50,000+</option><option>Not sure yet</option></select></label>
      <label>Tell us about the opportunity<textarea required minLength={10} name="message" rows={6} placeholder="What would you like to improve, automate or build?"/><small className="field-hint">Please provide at least 10 characters.</small></label>
      <fieldset className="referral-field">
        <legend>Referral</legend>
        <label className={`referral-check ${referred ? 'active' : ''}`}>
          <input type="checkbox" name="referred" value="yes" checked={referred} onChange={(event) => setReferred(event.target.checked)}/>
          <span className="referral-check-box" aria-hidden="true"><Check size={14}/></span>
          <span>I was referred to Quiet Gears</span>
        </label>
      </fieldset>
      {referred && (
        <div className="form-row referral-details">
          <label>How were you referred?<input required name="referralSource" placeholder="Partner, event, recommendation…"/></label>
          <label>Who referred you?<input required name="referralName" placeholder="Name or organisation"/></label>
        </div>
      )}
      <label className="consent"><input required type="checkbox" name="consent"/> I agree to Quiet Gears using my details to respond to this enquiry. <strong>Required</strong></label>
      <button disabled={state === 'sending'} className="button dark" type="submit">{state === 'sending' ? 'Sending…' : 'Send enquiry'} <ArrowRight size={17}/></button>
      {state === 'error' && <p className="error" role="alert">{errorMessage}</p>}
      <small>Protected by a hidden honeypot field and server-side validation.</small>
      <input className="trap" name="website" tabIndex={-1} autoComplete="off"/>
    </form>
  );
}

