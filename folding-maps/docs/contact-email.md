# Contact form email

The enquiry form posts to `app/api/contact/route.ts`, which sends two messages
through [Resend](https://resend.com):

1. **The enquiry**, to `CONTACT_TO_EMAIL`, with `Reply-To` set to the visitor's
   address so a reply goes straight back to them.
2. **An acknowledgement**, to the visitor, stating what the contact page
   promises: a reply within one working day, then an initial consultation.

The acknowledgement only sends when `CONTACT_FROM_EMAIL` is a verified sender.
Resend's shared `onboarding@resend.dev` address can only deliver to the account
owner, so acknowledging a visitor from it would fail silently.

## Setting it up

1. **Create the Resend account** and add the sending domain
   (`quietgears.co.uk`) under Domains.
2. **Add the DNS records Resend gives you.** There are normally three: an MX and
   a TXT for the `send` subdomain, and a DKIM `TXT`. Add a DMARC record too —
   `v=DMARC1; p=none; rua=mailto:dmarc@quietgears.co.uk` is a reasonable start,
   and it can be tightened to `p=quarantine` once reports look clean.
3. **Wait for verification.** DNS propagation is usually minutes; Resend shows
   the domain as Verified when it is done.
4. **Create an API key** with *Sending access* only. The site never reads,
   lists or deletes email, so a full-access key is more authority than it needs.
5. **Set the environment variables** from `.env.example` in the hosting
   platform (Vercel: Project → Settings → Environment Variables). Set them for
   Production and Preview separately if preview deploys should not send.

## Behaviour when something is wrong

The route distinguishes failures rather than collapsing them into one message,
because the right action differs:

| Condition | Status | What the visitor sees |
|---|---|---|
| Honeypot field filled | 200 | The success state. A bot learns nothing. |
| A required field missing or malformed | 400 | Which fields to check. |
| More than 5 submissions from one address in 10 minutes | 429 | A note to email directly, with `Retry-After`. |
| `RESEND_API_KEY` absent | 503 | Delivery is not configured; email directly. |
| Resend rejected the send | 502 | Delivery is temporarily unavailable; email directly. |
| Anything else | 500 | The enquiry could not be sent; email directly. |

Every path names the fallback address, so an enquiry is never simply lost.

The rate limit is held in the instance's memory and is therefore best-effort:
serverless instances are not shared, so someone landing on cold instances gets
more attempts than the number suggests. It stops a script hammering one warm
instance. For a hard limit, add a rule at the edge instead.

## Testing it

Locally, with `.env.local` populated:

```bash
npm run dev
# then submit the form at http://localhost:3000/contact
```

Without an API key the form should show the 503 message and name the fallback
address. That is the state a fresh clone is in, and it is worth seeing once.

To exercise the route directly:

```bash
curl -sS localhost:3000/api/contact -H 'content-type: application/json' -d '{
  "email":"someone@example.com","interest":"Workflow automation",
  "companySize":"11–50","budget":"Not sure yet",
  "message":"Quotes take three days to assemble and nobody owns the follow-up.",
  "consent":true
}'
```

Unit tests cover validation, the rate limiter and both templates:

```bash
npm test
```

## Changing the wording

The acknowledgement text lives in `lib/email.ts`, in one place, because it
repeats the promise made on `/contact`. If the reply time or the consultation
step changes on the page, change it there in the same commit — a test asserts
the two agree.
