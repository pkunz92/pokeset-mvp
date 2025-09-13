# PokéSet MVP — Next.js + Tailwind

A minimal, deploy-ready MVP landing page with brand colors, logo, and two ways to collect leads:
- **Airtable Form (iframe)** — turns submissions into rows automatically.
- **FormSubmit fallback** — sends submissions to your email.

## Quick start

```bash
npm i
npm run dev
# visit http://localhost:3000
```

## Configure inputs

### Option A) Airtable
1) Create an Airtable **Form** with fields: `name, email, region, language, budget, sets, condition, wantlist, file (attachment), reverse_ok, booster_optin, notes`.
2) Click "Share form" → "Embed" → Copy the URL and **replace** `YOUR_AIRTABLE_FORM_ID` in `pages/index.tsx`.
3) Leave the toggle on "Use Airtable form" (default).

### Option B) FormSubmit (email)
1) Replace `YOUR_EMAIL_HERE` in the `<form action="https://formsubmit.co/YOUR_EMAIL_HERE">` in `pages/index.tsx`.
2) First time you submit, confirm the FormSubmit activation email.
3) Submissions will arrive in your inbox.

## Brand
- Primary color: `brand-500` (#ffb100)
- Text color: `ink` (#0f172a)
- Logo: `/public/logo.svg` (placeholder — swap with your brand later)

## Deploy
- Perfect for **Vercel**: connect repo → deploy.
- Or build static and host anywhere: `npm run build && npm start`.
