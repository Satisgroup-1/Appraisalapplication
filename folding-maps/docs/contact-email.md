# Contact form email

The enquiry form posts to `app/api/contact/route.ts`, which sends two messages
through [Resend](https://resend.com):

1. **The enquiry**, to `CONTACT_TO_EMAIL`, with `Reply-To` set to the visitor's
   address so a reply goes straight back to them.
2. **An acknowledgement**, to the visitor, stating what the contact page
   promises: a reply within one working day, then an initial consultation.

The acknowledgement only sends when `CONTACT_FROM_EMAIL` is set to an address on
a verified domain. Resend's shared `onboarding@resend.dev` address can only
deliver to the account owner, so acknowledging a visitor from it would fail.

---

## Part 1: link the domain to Resend

You need a domain you control. **A Gmail, Outlook or Yahoo address cannot be a
sending address** — nobody can prove ownership of those domains, so Resend will
never verify one. The site now refuses to start a send from one and says so in
the log rather than letting Resend reject it as an unexplained failure.

Enquiries can still be *delivered* to a Gmail address. That is
`CONTACT_TO_EMAIL`, and it has no such restriction.

### 1.1 Add the domain

1. Sign in at [resend.com](https://resend.com) and open **Domains → Add Domain**.
2. Enter the root domain, `quietgears.co.uk`, not a subdomain.
3. Choose the **region**. Pick the one closest to the recipients; for a UK firm
   that is normally **Ireland (eu-west-1)**. Note which one you chose: the MX
   value in the next step contains it, and every MX record on the domain has to
   point at the same region.

Resend then shows a table of DNS records. Leave that page open.

### 1.2 Add the DNS records at your registrar

Four records. The first three come from the Resend page verbatim; the fourth is
yours to write.

| # | Type | Host / Name | Value | Priority |
|---|---|---|---|---|
| 1 | `MX` | `send` | `feedback-smtp.eu-west-1.amazonses.com.` | `10` |
| 2 | `TXT` | `send` | the SPF string Resend shows, beginning `v=spf1` | — |
| 3 | `TXT` | `resend._domainkey` | the long DKIM key Resend shows, beginning `p=` | — |
| 4 | `TXT` | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc@quietgears.co.uk` | — |

Copy records 1 to 3 from the Resend dashboard rather than from this table. The
DKIM key is unique to the domain, and the SPF value and MX region have both
changed across Resend's own documentation. What this table is for is telling you
**where** each record goes and **what shape** to expect, which is the part
registrars get wrong.

Five things that cause most failures:

- **Host field conventions differ.** Most registrars want the subdomain only
  (`send`, `resend._domainkey`, `_dmarc`). A few want the full name
  (`send.quietgears.co.uk`). If your registrar shows existing records as full
  names, use full names.
- **Do not let the registrar append the domain twice.** After saving, check the
  record does not read `send.quietgears.co.uk.quietgears.co.uk`.
- **Keep the trailing dot** on the MX value if the registrar accepts one. It
  stops the domain being appended to it.
- **The DKIM value is one string** and is long. Paste it whole. Some registrars
  split long TXT records across quoted chunks automatically, which is fine; a
  manual line break is not.
- **One region only.** If the domain already has MX records pointing at another
  AWS region, remove them or verification will stall.

### 1.3 Verify

Back in Resend, press **Verify DNS Records**. Propagation is usually minutes and
occasionally hours.

To check independently before blaming Resend:

```bash
dig +short MX  send.quietgears.co.uk
dig +short TXT send.quietgears.co.uk
dig +short TXT resend._domainkey.quietgears.co.uk
dig +short TXT _dmarc.quietgears.co.uk
```

Each should return the value you entered. An empty answer means the record has
not propagated or is on the wrong host.

The domain reads **Verified** when it is done. Until then, sending fails.

### 1.4 Create an API key

**API Keys → Create API Key.** Give it **Sending access** only — the site never
reads, lists or deletes email, and a full-access key is more authority than it
needs. Restrict it to the verified domain if the option is offered.

The key is shown once. Copy it now; it begins `re_`.

---

## Part 2: set the environment variables

Four variables, two of them optional. `.env.example` is the canonical list.

| Variable | Required | Value |
|---|---|---|
| `RESEND_API_KEY` | Yes | The key from 1.4. Begins `re_`. |
| `CONTACT_FROM_EMAIL` | In production | `Quiet Gears <enquiries@quietgears.co.uk>`. Must be on the verified domain. |
| `CONTACT_TO_EMAIL` | No | Where enquiries land. Defaults to `quietgearsai@gmail.com`. |
| `CONTACT_BCC_EMAIL` | No | A second copy, for a shared archive. |

### Locally

```bash
cp .env.example .env.local
# then edit .env.local
npm run dev
```

`.env.local` is git-ignored (`.gitignore` covers `.env*` and re-includes only
`.env.example`). Never commit a key.

### On Vercel

**Project → Settings → Environment Variables.** Add each variable and tick the
environments it applies to.

Set them for **Production** and **Preview** separately. Leaving them off Preview
is a reasonable choice: preview deploys then return the 503 and tell the visitor
to email directly, rather than sending real mail from a branch.

**Redeploy after adding them.** Vercel injects environment variables at build
and boot; an existing deployment does not pick up a new variable on its own.

### On another host

Any platform that can set process environment variables works. The route runs on
the Node runtime (`export const runtime = 'nodejs'`) and reads `process.env` at
request time, so no rebuild is needed if the platform can restart the process
with new values.

---

## Part 3: confirm it works

### A first send, before DNS is verified

Set only `RESEND_API_KEY` and leave `CONTACT_FROM_EMAIL` unset. The site falls
back to `onboarding@resend.dev`, which delivers **only to the email address that
owns the Resend account**. Set `CONTACT_TO_EMAIL` to that address and submit the
form. If it arrives, the key and the route are working and only DNS is
outstanding. The visitor acknowledgement is suppressed in this state, by design.

### A real send

With the domain verified and `CONTACT_FROM_EMAIL` set, submit the form once.
Two messages should arrive: the enquiry at `CONTACT_TO_EMAIL`, and an
acknowledgement at whatever address you entered in the form. Check the enquiry's
**Reply-To** is the address from the form, not the firm's own.

Then check **Resend → Emails**. Both sends appear there with their status, and
this is the first place to look when something is wrong: it distinguishes "never
reached Resend" from "Resend accepted it and the mailbox bounced it".

### Exercising the route directly

```bash
curl -sS localhost:3000/api/contact -H 'content-type: application/json' -d '{
  "email":"someone@example.com","interest":"Workflow automation",
  "companySize":"11-50","budget":"Not sure yet",
  "message":"Quotes take three days to assemble and nobody owns the follow-up.",
  "consent":true
}'
```

### Unit tests

```bash
npm test
```

Covers validation, the rate limiter, both templates, the configuration guards,
and a check that the acknowledgement wording still matches the contact page.

---

## What happens when something is wrong

The route distinguishes failures rather than collapsing them into one message,
because the right action differs. Every path names the fallback address, so an
enquiry is never simply lost.

| Condition | Status | What the visitor sees |
|---|---|---|
| Honeypot field filled | 200 | The success state, byte for byte. A bot learns nothing. |
| A required field missing or malformed | 400 | Which fields to check. |
| More than 5 submissions from one address in 10 minutes | 429 | A note to email directly, with `Retry-After`. |
| `RESEND_API_KEY` absent, malformed, or `CONTACT_FROM_EMAIL` unusable | 503 | Delivery is not configured; email directly. |
| Resend rejected the send | 502 | Delivery is temporarily unavailable; email directly. |
| Anything else | 500 | The enquiry could not be sent; email directly. |

### Reading the log

The visitor sees a general message; the server log carries the specific reason.
Every line is prefixed `[contact]`. On Vercel: **Deployment → Runtime Logs**.

| Log line | Cause | Fix |
|---|---|---|
| `email not configured: RESEND_API_KEY is not set` | Variable missing, or added without redeploying | Add it and redeploy |
| `email not configured: RESEND_API_KEY does not look like a Resend key` | Wrong key pasted, such as one from another provider | Use the key beginning `re_` |
| `email not configured: CONTACT_FROM_EMAIL uses gmail.com…` | Sending address on a mailbox provider | Send from the verified domain; put the Gmail address in `CONTACT_TO_EMAIL` |
| `email not configured: CONTACT_FROM_EMAIL is not an address` | A display name with no address | Use `Name <addr@domain>` or a bare address |
| `enquiry delivery failed` + a Resend error | Domain unverified, key revoked, or Resend rejected the recipient | Check **Resend → Emails**; the error names which |
| `acknowledgement delivery failed` | The enquiry was delivered; only the visitor's copy failed | Usually a bounce at the visitor's address. No action needed |
| `enquiry delivered; acknowledgement skipped, unverified sender` | Working, on the shared onboarding sender | Set `CONTACT_FROM_EMAIL` once DNS is verified |

The enquiry itself is never logged, only the provider's reason.

### The rate limit

Held in the instance's memory, and therefore best-effort: serverless instances
are not shared, so someone landing on cold instances gets more attempts than the
number suggests. It stops a script hammering one warm instance. For a hard
limit, add a rule at the edge (Vercel WAF, Cloudflare) instead.

---

## Changing the wording

The acknowledgement text lives in `lib/email.ts`, in one place, because it
repeats the promise made on `/contact`. If the reply time or the consultation
step changes on the page, change it there in the same commit: a test asserts the
two agree.
