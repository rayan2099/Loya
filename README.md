# Loya

Loya is a bilingual scan-to-win loyalty SaaS for cafes, restaurants, retail, and service businesses. Customers scan a business QR code, enter their details, spin for an instant reward, and collect digital loyalty stamps. Owners manage QR codes, customers, rewards, and business settings from a dark dashboard.

## Current Product Status

This repository is a hardened Vite + React + Express product build. It is no longer an AI Studio-only prototype:

- Signed owner sessions with server-side password hashing
- Server-side lottery decisions only
- Per-business customer and reward records
- Claim-code verification with hashed cashier PINs
- Owner dashboard with analytics, QR, customers, rewards, and settings
- Arabic RTL and English LTR interface
- Supabase production schema included in `supabase/migrations/001_initial_schema.sql`
- Supabase Auth/Postgres integration when Supabase env vars are configured

The server automatically uses Supabase when `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are present. If they are missing, it falls back to local `data/db.json` storage for development demos.

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set at least:

```bash
SESSION_SECRET=use-a-long-random-value
DEFAULT_CASHIER_PIN=choose-a-temporary-owner-onboarding-pin
APP_URL=http://localhost:3000
```

3. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

Demo owner:

- Email: `demo@loya.sa`
- Password: `password123`

## Production Build

```bash
npm run lint
npm run build
npm start
```

The Express server serves both `/api/*` and the built React app from `dist`.

## Deployment

### Vercel

This repo includes Vercel serverless API routes in `api/`. The frontend still calls the same URLs, such as `/api/auth/register` and `/api/scan`, but Vercel now runs those through individual serverless handlers instead of `server.ts`.

- Build command: `npm run build:vercel`
- Output directory: `dist`
- Required env vars: `NODE_ENV=production`, `SESSION_SECRET`, `DEFAULT_CASHIER_PIN`, `APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### Node Hosts

The Express server in `server.ts` can still be deployed on Render, Fly.io, Railway, or a VPS:

- Build command: `npm ci && npm run build`
- Start command: `npm start`
- Required env vars: `NODE_ENV=production`, `SESSION_SECRET`, `DEFAULT_CASHIER_PIN`, `APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## Supabase Setup

1. Create a Supabase project.
2. Apply `supabase/migrations/001_initial_schema.sql`.
3. Configure these env vars:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

4. Start the server. Registration and login will use Supabase Auth, while business/customer/scan/reward records will use Supabase Postgres.
5. Keep `/api/scan` server-side. Do not expose lottery win calculation to the frontend.

Local demo credentials only exist in JSON fallback mode. In Supabase mode, create an owner through `/register`.

## Launch Checklist

- Add logo upload through Supabase Storage.
- Replace external QR image generation with an internal QR generator.
- Implement real Apple Wallet `.pkpass` and Google Wallet JWT pass issuing.
- Add branch/team roles if multiple cashiers need separate access.
- Add subscription billing and plan limits.
- Add export/consent controls for customer phone data.
- Add monitoring, backups, and error logging before onboarding paying businesses.

## Key Routes

- `/` marketing page
- `/register` owner signup
- `/login` owner login
- `/onboarding` guided setup
- `/dashboard` owner dashboard
- `/b/:slug` customer scan experience
- `/claim/:code` cashier reward verification
