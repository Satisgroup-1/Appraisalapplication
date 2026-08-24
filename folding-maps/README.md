# quiet gears

Marketing website for quiet gears Ltd, a London-based AI and software consultancy serving UK SMEs.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

The website works without environment variables, but contact form delivery requires a Resend API key and a verified sending domain. See `.env.example`.

## Production

Run `npm run build`, configure the two email variables, and deploy to Vercel or a Next.js-compatible Cloudflare setup.
