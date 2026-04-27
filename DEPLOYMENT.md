# Production Deployment Checklist

Complete these steps to deploy the Offline Inventory PWA to production on Vercel.

## Prerequisites

- [ ] Vercel account connected to GitHub repository
- [ ] Supabase project in production mode (not paused)
- [ ] Stripe account with production mode enabled
- [ ] Production domain configured (or using Vercel preview domain)

---

## Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Production readiness: PWA activation, real dashboard data, E2E tests, deployment config"
git push origin main
```

Vercel will automatically detect the push and start a deployment.

---

## Step 2: Configure Vercel Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add these **Production** variables:

### Required Variables (8 total)

1. **NEXT_PUBLIC_APP_URL**
   - Value: `https://your-domain.com` (or Vercel preview URL)
   - Environment: Production, Preview, Development

2. **NEXT_PUBLIC_SUPABASE_URL**
   - Value: Get from Supabase Dashboard → Project Settings → API
   - Format: `https://xxxxx.supabase.co`
   - Environment: Production, Preview, Development

3. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Value: Get from Supabase Dashboard → Project Settings → API → anon/public key
   - Environment: Production, Preview, Development

4. **SUPABASE_SERVICE_ROLE_KEY** ⚠️ **SENSITIVE**
   - Value: Get from Supabase Dashboard → Project Settings → API → service_role key
   - Environment: Production only (do NOT add to Preview/Development)
   - Mark as "Sensitive" in Vercel

5. **STRIPE_SECRET_KEY** ⚠️ **SENSITIVE**
   - Value: Get from Stripe Dashboard → Developers → API keys → Secret key (production mode)
   - Format: `sk_live_xxxxx`
   - Environment: Production only
   - Mark as "Sensitive" in Vercel

6. **STRIPE_WEBHOOK_SECRET** ⚠️ **SENSITIVE**
   - Value: Get after Step 3 (Stripe webhook registration)
   - Format: `whsec_xxxxx`
   - Environment: Production only
   - Mark as "Sensitive" in Vercel

7. **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** (optional, unused in current checkout flow)
   - Value: Get from Stripe Dashboard → Developers → API keys → Publishable key
   - Format: `pk_live_xxxxx`
   - Environment: Production, Preview, Development

8. **STRIPE_INVENTORY_PRICE_ID**
   - Value: Get from Stripe Dashboard → Products → Your Pro Product → Pricing → Price ID
   - Format: `price_xxxxx`
   - Environment: Production only

### After Adding Variables

Click "Redeploy" on the latest deployment to apply the new environment variables.

---

## Step 3: Register Stripe Webhook Endpoint

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. **Endpoint URL**: `https://your-domain.com/api/stripe/webhook`
4. **Listen to**: Select "Events on your account"
5. **Select events**:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
6. Click "Add endpoint"
7. Copy the **Signing secret** (starts with `whsec_`)
8. Go back to Vercel → Environment Variables
9. Add `STRIPE_WEBHOOK_SECRET` with the signing secret value
10. Redeploy in Vercel

---

## Step 4: Push Supabase Migrations to Production

From your local development environment:

```bash
# Link to production Supabase project (if not already linked)
npx supabase link --project-ref your-project-ref

# Push migrations to production database
npx supabase db push
```

This will apply:
- `0001_init.sql` - Initial schema
- `0002_production_hardening.sql` - Indexes, constraints, triggers, Pro entitlement columns

### Verify Migration Success

1. Go to Supabase Dashboard → Table Editor
2. Check `profiles` table has these columns:
   - `is_pro` (boolean, default false)
   - `pro_unlocked_at` (timestamptz, nullable)
   - `stripe_customer_id` (text, nullable)
3. Check indexes exist (Supabase Dashboard → Database → Indexes)
4. Check RLS policies are active (Authentication → Policies)

---

## Step 5: Test Production Deployment

### PWA Functionality

1. Visit `https://your-domain.com`
2. Open DevTools → Application → Manifest
   - Should show "Offline Inventory" with icons
3. Open DevTools → Application → Service Workers
   - Should show `/sw.js` activated
4. Click "Install app" button in header
   - PWA install prompt should appear
5. Go offline (DevTools → Network → Offline)
   - Offline banner should appear
6. Create a test item while offline
   - Should be queued in IndexedDB

### Dashboard Real Data

1. Navigate to `/dashboard`
2. Verify Inventory Stats card shows:
   - Total items count
   - Total quantity
   - Low stock alerts (if any items below reorder point)
3. Verify Recent Stock Movements section appears (if data exists)
4. Verify Sync Queue Status shows correct pending count

### Stripe Checkout Flow

1. Click "Upgrade to Pro" button
2. Should redirect to Stripe Checkout (production mode)
3. Complete test payment with Stripe test card: `4242 4242 4242 4242`
   - Use any future expiry date
   - Use any 3-digit CVC
   - Use any 5-digit ZIP
4. After successful payment, redirect to `/dashboard?checkout=success`
5. Dashboard should show "Pro plan active" badge
6. Check Supabase Dashboard → `checkout_sessions` table
   - New row with `payment_status = 'completed'`
7. Check Supabase Dashboard → `profiles` table
   - User has `is_pro = true`, `pro_unlocked_at` timestamp

### Webhook Verification

1. Stripe Dashboard → Developers → Webhooks → Your endpoint
2. Check "Recent deliveries" tab
3. Should see `checkout.session.completed` event with 200 response
4. If webhook failed, check:
   - `STRIPE_WEBHOOK_SECRET` is correct
   - Endpoint URL is correct
   - Vercel deployment logs for errors

---

## Step 6: Run E2E Tests Locally (Optional)

```bash
# Start development server
npm run dev

# In another terminal, run E2E tests
npm run test:e2e
```

Tests should pass:
- Auth flow: 5+ tests
- Checkout flow: 5+ tests
- Offline sync: 7+ tests

View HTML report:
```bash
npx playwright show-report
```

---

## Troubleshooting

### Service Worker Not Registering

- Check Vercel deployment logs for `/sw.js` 404 errors
- Verify `public/sw.js` is committed to Git
- Check `vercel.json` headers are applied (inspect response headers in browser)

### Stripe Webhook 401/403 Errors

- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard signing secret
- Check webhook endpoint URL is exactly `https://your-domain.com/api/stripe/webhook`
- Test webhook with Stripe CLI: `stripe trigger checkout.session.completed`

### RLS Policy Errors in Webhook Handler

- Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel (Production only)
- Check `src/lib/supabase/admin.ts` uses service-role key correctly
- Verify RLS policies allow service-role writes (check migration 0002)

### Supabase Migration Push Fails

- Ensure Supabase project is not paused (Dashboard → Project Settings → Pause project)
- Check local migrations match remote: `npx supabase db diff`
- If conflicts exist, resolve manually or reset: `npx supabase db reset` (⚠️ destroys data)

---

## Monitoring & Observability

### Vercel Logs

- Vercel Dashboard → Your Project → Deployments → [Latest] → Logs
- Monitor for runtime errors, API failures, build warnings

### Supabase Logs

- Supabase Dashboard → Logs → Query logs
- Check for slow queries, RLS policy violations

### Stripe Dashboard

- Webhooks → Recent deliveries (check success rate)
- Payments → Successful/Failed (monitor checkout completion rate)

---

## Security Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is Production-only (not in Preview/Development)
- [ ] `STRIPE_SECRET_KEY` is Production-only
- [ ] `STRIPE_WEBHOOK_SECRET` is Production-only
- [ ] All sensitive keys are marked as "Sensitive" in Vercel
- [ ] RLS policies are enabled on all tables (check Supabase Dashboard)
- [ ] Stripe webhook signature verification is enabled (check `webhook-handler.ts`)
- [ ] HTTPS enforced (Vercel does this by default)
- [ ] Service Worker served with correct headers (check `vercel.json`)

---

## Post-Deployment Tasks

1. **Test User Flows**
   - Sign up new user → Dashboard loads → Create items → Offline sync → Upgrade to Pro
2. **Monitor Errors**
   - Vercel logs, Supabase logs, Stripe webhook logs
3. **Performance Audit**
   - Lighthouse report (PWA score should be 100%)
   - PageSpeed Insights
4. **User Acceptance Testing**
   - Share preview link with team for feedback
5. **Analytics Setup** (optional)
   - Add Vercel Analytics or Google Analytics
   - Track conversion rate for Pro upgrades

---

## Rollback Plan

If deployment has critical issues:

1. Vercel Dashboard → Deployments → [Previous stable deployment] → "Promote to Production"
2. Revert database migrations:
   ```bash
   npx supabase db reset --version [previous-migration-number]
   ```
3. Revert Stripe webhook endpoint to previous URL (if changed)

---

## Success Criteria

✅ Vercel deployment succeeds without build errors  
✅ All 8 environment variables set correctly  
✅ Stripe webhook receives events with 200 response  
✅ Supabase migrations applied successfully  
✅ PWA manifest and Service Worker load correctly  
✅ Dashboard shows real data (not placeholders)  
✅ Offline sync queues operations in IndexedDB  
✅ Pro upgrade flow completes successfully  
✅ Lighthouse PWA audit scores 100%  
✅ No console errors on production site  

---

## Support & Documentation

- Next.js Deployment: https://nextjs.org/docs/deployment
- Vercel Environment Variables: https://vercel.com/docs/projects/environment-variables
- Supabase Migrations: https://supabase.com/docs/guides/cli/managing-migrations
- Stripe Webhooks: https://stripe.com/docs/webhooks
- PWA Best Practices: https://web.dev/progressive-web-apps/
