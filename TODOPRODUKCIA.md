# 📋 TO-DO PRODUKCIA - Presné Kroky

**Status:** 92% hotový, zostáva deployment a testovanie  
**Čas potrebný:** ~1 hodina

---

## ✅ HOTOVÉ (92%)

- [x] Kompletná PWA infraštruktúra (Service Worker, manifest, offline sync)
- [x] Dashboard s reálnymi dátami (inventory stats, alerts, movements)
- [x] Billing system (Stripe checkout + webhooks)
- [x] Database schema s indexami a RLS policies
- [x] 19 E2E testov (Playwright)
- [x] Deployment config (vercel.json)
- [x] Dokumentácia (DEPLOYMENT.md)
- [x] Build prechádza bez chýb
- [x] Git repository inicializovaný a commitnutý

---

## ⏳ ZOSTÁVA (8%)

### 1️⃣ VYTVORIŤ GITHUB REPOSITORY (5 min)

**Manuálne kroky:**

1. **Choď na:** https://github.com/new
2. **Repository name:** `offline-inventory-pwa` (alebo iný názov)
3. **Visibility:** Private alebo Public (odporúčam Private)
4. **Inicializácia:** 
   - ❌ NEOZNAČUJ "Add a README file"
   - ❌ NEOZNAČUJ ".gitignore"
   - ❌ NEOZNAČUJ "Choose a license"
5. **Klikni:** "Create repository"
6. **Skopíruj URL:** `https://github.com/tvoj-username/offline-inventory-pwa.git`

---

### 2️⃣ PUSHNÚŤ KÓD NA GITHUB (2 min)

**V terminále:**

```bash
cd /Users/erikbabcan/offline-inventory-pwa

# Pridaj remote (nahraď svojim URL z kroku 1)
git remote add origin https://github.com/tvoj-username/offline-inventory-pwa.git

# Pushni na GitHub
git push -u origin main
```

**Overenie:**
- Otvor GitHub repository v prehliadači
- Mali by si vidieť všetkých 92 súborov

---

### 3️⃣ VYTVORIŤ SUPABASE PROJECT (10 min)

**Manuálne kroky:**

1. **Choď na:** https://supabase.com/dashboard
2. **Klikni:** "New project"
3. **Vyplň:**
   - **Name:** `offline-inventory-pwa`
   - **Database Password:** (vygeneruj silné heslo, ulož si ho!)
   - **Region:** Europe Central (Frankfurt) - najbližšie k EU
   - **Pricing Plan:** Free (postačuje na začiatok)
4. **Klikni:** "Create new project" (trvá ~2 minúty)

**Po vytvorení projektu:**

5. **Settings → API**
   - Skopíruj `Project URL` (začína `https://xxxxx.supabase.co`)
   - Skopíruj `anon/public key` (začína `eyJ...`)
   - Skopíruj `service_role key` (začína `eyJ...`) ⚠️ **CITLIVÉ!**

6. **Ulož tieto 3 hodnoty** - potrebuješ ich v kroku 4

---

### 4️⃣ PUSHNÚŤ DATABASE MIGRATIONS (5 min)

**V terminále:**

```bash
cd /Users/erikbabcan/offline-inventory-pwa

# Nainštaluj Supabase CLI (ak nemáš)
brew install supabase/tap/supabase

# Link na Supabase project
npx supabase link --project-ref [tvoj-project-ref]
# Project ref nájdeš v Supabase Dashboard → Settings → General → Reference ID

# Push migrations
npx supabase db push
```

**Overenie:**
- Supabase Dashboard → Table Editor
- Mal by si vidieť tabuľky: `profiles`, `items`, `stock_movements`, `offline_sync_queue`, `checkout_sessions`, `notification_subscriptions`

---

### 5️⃣ VYTVORIŤ STRIPE ACCOUNT (10 min)

**Ak nemáš Stripe account:**

1. **Choď na:** https://dashboard.stripe.com/register
2. **Vytvor account** (potrebuješ email, heslo)
3. **Aktivuj test mode** (prepínač vpravo hore)

**Vytvor produkt:**

1. **Products → Add product**
2. **Name:** `Inventory Pro`
3. **Description:** `30-day Pro access to Offline Inventory`
4. **Pricing:**
   - **Model:** One-time payment
   - **Price:** €9.99 EUR
   - **Tax behavior:** Tax exclusive
5. **Klikni:** "Add product"
6. **Skopíruj Price ID** (začína `price_xxxxx`)

**Získaj API klúče:**

1. **Developers → API keys**
2. **Skopíruj:**
   - `Publishable key` (začína `pk_test_xxxxx`)
   - `Secret key` (začína `sk_test_xxxxx`) ⚠️ **CITLIVÉ!**

---

### 6️⃣ DEPLOY NA VERCEL (15 min)

**Manuálne kroky:**

1. **Choď na:** https://vercel.com/new
2. **Import Git Repository:**
   - Klikni "Import Git Repository"
   - Vyber `offline-inventory-pwa` zo svojho GitHub accountu
3. **Configure Project:**
   - **Framework Preset:** Next.js (auto-detect)
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** .next
4. **Pridaj Environment Variables** (klikni "Add" 8x):

| Name | Value | Production | Preview | Development |
|------|-------|------------|---------|-------------|
| `NEXT_PUBLIC_APP_URL` | `https://tvoja-domena.vercel.app` | ✅ | ✅ | ❌ |
| `NEXT_PUBLIC_SUPABASE_URL` | Z kroku 3 | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Z kroku 3 | ✅ | ✅ | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Z kroku 3 ⚠️ | ✅ | ❌ | ❌ |
| `STRIPE_SECRET_KEY` | Z kroku 5 ⚠️ | ✅ | ❌ | ❌ |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Z kroku 5 | ✅ | ✅ | ✅ |
| `STRIPE_INVENTORY_PRICE_ID` | Z kroku 5 | ✅ | ❌ | ❌ |
| `STRIPE_WEBHOOK_SECRET` | Dostaneš v kroku 7 | ✅ | ❌ | ❌ |

**Poznámka:** `STRIPE_WEBHOOK_SECRET` pridaj neskôr (po kroku 7)

5. **Klikni:** "Deploy" (trvá ~2 minúty)
6. **Skopíruj URL:** `https://tvoja-domena.vercel.app`

---

### 7️⃣ ZAREGISTRUJ STRIPE WEBHOOK (5 min)

**V Stripe Dashboard:**

1. **Developers → Webhooks**
2. **Klikni:** "Add endpoint"
3. **Endpoint URL:** `https://tvoja-domena.vercel.app/api/stripe/webhooks`
4. **Listen to:** "Events on your account"
5. **Select events:**
   - ✅ `checkout.session.completed`
   - ✅ `checkout.session.async_payment_succeeded`
   - ✅ `checkout.session.async_payment_failed`
6. **Klikni:** "Add endpoint"
7. **Skopíruj Signing secret** (začína `whsec_xxxxx`)

**Pridaj do Vercel:**

```bash
# Vercel Dashboard → Tvoj projekt → Settings → Environment Variables
# Pridaj:
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_xxxxx (z kroku 7)
Environment: Production only
```

8. **Redeploy:** Vercel Dashboard → Deployments → Latest → "Redeploy"

---

### 8️⃣ OTESTUJ PRODUCTION DEPLOY (15 min)

**Test Checklist:**

#### A) PWA Funkcie

1. **Otvor:** `https://tvoja-domena.vercel.app`
2. **DevTools → Application → Manifest**
   - ✅ "Offline Inventory" manifest zobrazený
   - ✅ Ikony načítané
3. **DevTools → Application → Service Workers**
   - ✅ `/sw.js` activated
4. **Klikni "Install app" v headeri**
   - ✅ PWA install prompt sa zobrazí
5. **DevTools → Network → Offline**
   - ✅ Offline banner sa zobrazí
   - ✅ Dashboard ostane funkčný

#### B) Autentifikácia

1. **Klikni "Sign up"**
2. **Registruj test usera** (email + heslo)
   - ✅ Redirect na `/dashboard`
3. **Logout**
4. **Login znova**
   - ✅ Dashboard loads

#### C) Dashboard Data

1. **Dashboard page**
   - ✅ Inventory Stats card zobrazuje 0 items (prázdny DB)
   - ✅ No low stock alerts (žiadne dáta)
   - ✅ Sync queue: 0 pending
   - ✅ No recent movements

#### D) Inventory

1. **Choď na `/items`**
2. **Klikni "Add Item"**
3. **Pridaj test položku:**
   - Name: Test Product
   - SKU: TEST001
   - Quantity: 10
   - Unit: pcs
   - Reorder Point: 5
   - Unit Price: 9.99
4. **Save**
   - ✅ Item sa zobrazí v liste
5. **Vráť sa na Dashboard**
   - ✅ Inventory Stats: 1 item, 10 quantity

#### E) Stripe Checkout

1. **Dashboard → "Upgrade to Pro" button**
   - ✅ Redirect na Stripe Checkout
2. **Testovacia karta:**
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
   - ZIP: `12345`
3. **Complete Payment**
   - ✅ Redirect na `/dashboard?checkout=success`
   - ✅ "Pro plan active" badge
4. **Supabase Dashboard → `profiles` table**
   - ✅ `is_pro = true`
   - ✅ `pro_unlocked_at` má timestamp
5. **Stripe Dashboard → Webhooks → Recent deliveries**
   - ✅ `checkout.session.completed` delivered
   - ✅ Response: 200

#### F) Offline Sync

1. **Vytvor item na `/items/new`**
2. **DevTools → Network → Offline**
3. **Zmeň množstvo položky**
4. **Dashboard → Sync Queue**
   - ✅ Pending: 1 operation
5. **DevTools → Network → Online**
6. **Klikni "Sync Now"**
   - ✅ Pending: 0 operations
   - ✅ Zmena sa syncla do DB

---

### 9️⃣ SPUSTI E2E TESTY (5 min)

**Lokálne (optional, ale odporúčané):**

```bash
cd /Users/erikbabcan/offline-inventory-pwa

# Start dev server
npm run dev

# V druhom terminále:
npm run test:e2e
```

**Očakávaný výsledok:**
- ✅ 19 testov passed (auth, checkout, offline)
- ❌ Ak niektoré failujú, skontroluj `.env` premenné

**View report:**
```bash
npx playwright show-report
```

---

### 🔟 AKTIVUJ PRODUCTION MODE V STRIPE (10 min)

**⚠️ TEN KROK UROB AŽ KEĎ SI PRIPRAVENÝ NA REAL PLATBY!**

**Stripe Dashboard:**

1. **Activate Stripe Account** (potrebuješ business info, bank account)
2. **Prepni na Production mode** (prepínač vpravo hore)
3. **Vytvor produkt znova** (v production mode):
   - Name: `Inventory Pro`
   - Price: €9.99 EUR
   - Skopíruj production `price_xxxxx` ID
4. **Získaj production API keys:**
   - `pk_live_xxxxx` (Publishable key)
   - `sk_live_xxxxx` (Secret key)
5. **Zaregistruj production webhook:**
   - URL: `https://tvoja-domena.vercel.app/api/stripe/webhooks`
   - Events: tie isté ako v test mode
   - Skopíruj production `whsec_xxxxx`

**Update Vercel env vars:**

```bash
# Vercel Dashboard → Settings → Environment Variables
# Update tieto 3 na production values:
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_INVENTORY_PRICE_ID=price_xxxxx (production)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx (production)
```

**Redeploy Vercel**

**Test s reálnou kartou** (⚠️ bude charged!):
- Použi svoju reálnu kartu
- €9.99 platba by mala prejsť
- Overíš, že webhook funguje s production keys

---

## 📊 PROGRESS TRACKER

| Krok | Status | Čas | Poznámka |
|------|--------|-----|----------|
| 1. GitHub repo | ⏳ TODO | 5 min | Manuálne |
| 2. Git push | ⏳ TODO | 2 min | Potrebuješ URL z kroku 1 |
| 3. Supabase project | ⏳ TODO | 10 min | Ulož si credentials! |
| 4. DB migrations | ⏳ TODO | 5 min | Po kroku 3 |
| 5. Stripe setup | ⏳ TODO | 10 min | Test mode OK |
| 6. Vercel deploy | ⏳ TODO | 15 min | 8 env vars |
| 7. Stripe webhook | ⏳ TODO | 5 min | Po kroku 6 |
| 8. Production test | ⏳ TODO | 15 min | 6 test areas |
| 9. E2E tests | ⏳ TODO | 5 min | Optional |
| 10. Production Stripe | ⏳ TODO | 10 min | Až neskôr! |

**Celkový čas:** ~1 hodina (bez kroku 10)

---

## 🚨 CRITICAL NOTES

### ⚠️ SENSITIVE DATA

Tieto hodnoty **NIKDY** nezverejňuj verejne:
- `SUPABASE_SERVICE_ROLE_KEY` - full DB access
- `STRIPE_SECRET_KEY` - môže vytvárať platby
- `STRIPE_WEBHOOK_SECRET` - overuje webhooks
- Supabase Database Password

### 📝 ULOŽ SI

Vytvor si súbor `CREDENTIALS.txt` (lokálne, NEPUSHUJ NA GIT!):

```
# SUPABASE
Project URL: https://xxxxx.supabase.co
Anon Key: eyJ...
Service Role Key: eyJ... (SENSITIVE)
DB Password: xxxxx (SENSITIVE)
Project Ref: xxxxx

# STRIPE (TEST MODE)
Publishable Key: pk_test_xxxxx
Secret Key: sk_test_xxxxx (SENSITIVE)
Webhook Secret: whsec_xxxxx (SENSITIVE)
Price ID: price_xxxxx

# STRIPE (PRODUCTION) - až neskôr
Publishable Key: pk_live_xxxxx
Secret Key: sk_live_xxxxx (SENSITIVE)
Webhook Secret: whsec_xxxxx (SENSITIVE)
Price ID: price_xxxxx

# VERCEL
Deployment URL: https://xxxxx.vercel.app
```

---

## ✅ SUCCESS CRITERIA

Po dokončení všetkých krokov:

- ✅ GitHub repository má všetkých 92 súborov
- ✅ Supabase DB má 6 tabuliek s dátami
- ✅ Vercel deployment je live bez errors
- ✅ PWA manifest a Service Worker fungujú
- ✅ Dashboard zobrazuje reálne dáta
- ✅ Stripe checkout flow funguje (test mode)
- ✅ Webhook updates DB po platbe
- ✅ Offline sync ukladá do IndexedDB a replayuje
- ✅ E2E testy prechádzajú (ak spustené)
- ✅ Žiadne console errors na production site

---

## 🆘 AK NIEČO NEFUNGUJE

Pozri `DEPLOYMENT.md` → **Troubleshooting** sekciu.

**Časté problémy:**

1. **Service Worker sa neregistruje**
   - Check `vercel.json` headers sú aplikované
   - Verify `/sw.js` je dostupný (nie 404)

2. **Stripe webhook failuje**
   - Verify `STRIPE_WEBHOOK_SECRET` je správny
   - Check endpoint URL je presne `https://domena/api/stripe/webhooks`
   - Test s `stripe trigger checkout.session.completed`

3. **RLS errors v dashboard**
   - Verify migrations boli pushed (`npx supabase db push`)
   - Check user je authenticated (logout + login)

4. **Build fails na Vercel**
   - Check TypeScript errors lokálne: `npm run build`
   - Verify všetky env vars sú nastavené

---

## 📚 DOKUMENTÁCIA

- **DEPLOYMENT.md** - Kompletný deployment guide s troubleshooting
- **README.md** - Project overview a local development setup
- **.github/copilot-instructions.md** - Copilot context pre development

---

## 🎯 PRIORITA TERAZ

**Nasledujúce kroky (v poradí):**

1. ✅ GitHub repository (5 min) → **UROB TERAZ**
2. ✅ Git push (2 min) → **UROB TERAZ**
3. Supabase project (10 min)
4. DB migrations (5 min)
5. Stripe setup (10 min)
6. Vercel deploy (15 min)
7. Stripe webhook (5 min)
8. Production test (15 min)

**Začni tu:** https://github.com/new

---

_Last updated: 27. apríla 2026_
