# Offline Inventory PWA

Production-oriented Next.js 15 App Router boilerplate for an offline-first inventory workflow.

## Stack

- Next.js 15 + TypeScript
- Tailwind CSS v4
- shadcn/ui-ready component structure
- Supabase auth, database, and realtime scaffolding
- Stripe checkout + webhook skeleton
- Workbox-based PWA runtime setup
- Zod + React Hook Form
- Dark mode via next-themes
- PDF export foundation via react-pdf
- Push notification subscription skeleton

## Current foundation

Implemented in this baseline:

- marketing landing page and protected dashboard route groups
- dark mode provider and theme toggle
- PWA manifest route, service worker registration, install prompt, and offline fallback page
- Supabase browser/server/middleware helpers
- Stripe server client, checkout route, and webhook verification skeleton
- inventory domain types, item form, PDF report component, and sync queue helpers
- initial Supabase SQL migration with Row Level Security policies
- clean lint, type-check, and production build

## Key paths

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/items/page.tsx`
- `src/app/api/auth/callback/route.ts`
- `src/app/api/stripe/checkout/route.ts`
- `src/app/api/stripe/webhooks/route.ts`
- `src/app/api/sync/queue/route.ts`
- `src/app/api/push-notifications/subscribe/route.ts`
- `src/lib/supabase/*`
- `src/lib/stripe/*`
- `src/lib/pwa/*`
- `src/lib/forms/schemas.ts`
- `supabase/migrations/0001_init.sql`

## Environment

Copy `.env.example` to `.env.local` and provide:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `STRIPE_INVENTORY_PRICE_ID`

## Commands

```bash
npm install
npm run dev
npm run lint
npm run type-check
npm run build
```

## Supabase setup

1. Create a Supabase project.
2. Run the SQL from `supabase/migrations/0001_init.sql`.
3. Enable Email auth and Google auth in the Supabase dashboard.
4. Configure the Google callback URL to `/api/auth/callback`.

## Stripe setup

1. Create a one-time price in Stripe.
2. Put the price ID into `STRIPE_INVENTORY_PRICE_ID`.
3. Forward webhooks locally to the Stripe webhook route.
4. Persist successful checkout results into `checkout_sessions` as you finish the entitlement flow.

## PWA notes

- `public/sw.js` contains the current Workbox-based runtime cache shell.
- `src/components/pwa/register-service-worker.tsx` registers the service worker.
- `src/components/pwa/install-prompt.tsx` exposes install CTA behavior.
- Replace placeholder icons in `public/icons/` with production assets before release.

## Next implementation targets

- wire login and signup forms to live Supabase auth mutations
- persist Stripe checkout results into `checkout_sessions`
- connect dashboard and item pages to live Supabase queries and realtime subscriptions
- replay IndexedDB offline queue into `api/sync/queue`
- store and send real push notifications through VAPID and Supabase
- replace placeholder PWA icons with production assets
