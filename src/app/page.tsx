export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(180deg,_var(--background),_color-mix(in_oklab,var(--background)_90%,black))]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-6 py-10 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-400">
              Offline Inventory
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Inventory operations that survive weak signal, failed sync, and real
              warehouse noise.
            </h1>
          </div>
          <span className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-white/80 backdrop-blur">
            Next.js 15 App Router PWA
          </span>
        </header>

        <section className="grid gap-6 py-12 lg:grid-cols-[1.5fr_1fr] lg:items-end">
          <div className="space-y-6">
            <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              This boilerplate is being prepared for secure offline-first stock control
              with Supabase auth and realtime, Stripe billing, Workbox caching, PDF
              exports, push notifications, and sync-safe mutations.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/signup"
                className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Create account
              </a>
              <a
                href="/login"
                className="rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Sign in
              </a>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-200">
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">
                Supabase auth + RLS
              </span>
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">
                Offline sync queue
              </span>
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">
                Stripe checkout + webhooks
              </span>
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">
                Push notifications + PDF
              </span>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-2xl shadow-black/30 backdrop-blur">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
              Build phases
            </p>
            <ol className="mt-4 space-y-3 text-sm text-slate-300">
              <li>1. Foundation scaffold and UI shell</li>
              <li>2. Supabase clients, auth, schema, and RLS</li>
              <li>3. Inventory flows, sync queue, and realtime</li>
              <li>4. Stripe checkout, PWA install, push, and PDF export</li>
            </ol>
          </aside>
        </section>
      </section>
    </main>
  );
}
