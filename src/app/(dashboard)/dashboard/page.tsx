import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { SyncNowButton } from "@/components/dashboard/sync-now-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isPro = false;
  let totalItems = 0;
  let totalQuantity = 0;
  let lowStockCount = 0;
  let lowStockItems: Array<{
    id: string;
    name: string;
    sku: string | null;
    quantity: number;
    reorder_point: number;
    category: string | null;
  }> = [];
  let pendingSync = 0;
  let recentMovements: Array<{
    id: string;
    delta: number;
    reason: string;
    notes: string | null;
    created_at: string;
    item: { name: string; sku: string | null } | null;
  }> = [];

  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("is_pro")
      .eq("id", user.id)
      .single();
    isPro = profileData?.is_pro ?? false;

    // Get total items count
    const { count } = await supabase
      .from("items")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", user.id);
    totalItems = count ?? 0;

    // Get all items to calculate total quantity and low stock
    const { data: items } = await supabase
      .from("items")
      .select("quantity, reorder_point")
      .eq("owner_id", user.id);
    
    if (items) {
      totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
      lowStockCount = items.filter((item) => item.quantity <= item.reorder_point).length;
    }

    // Get low stock items details
    if (lowStockCount > 0) {
      const { data } = await supabase
        .from("items")
        .select("id, name, sku, quantity, reorder_point, category")
        .eq("owner_id", user.id)
        .filter("quantity", "lte", "reorder_point")
        .order("quantity", { ascending: true })
        .limit(5);
      lowStockItems = data ?? [];
    }

    // Get pending sync queue count
    const { count: syncCount } = await supabase
      .from("offline_sync_queue")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", user.id)
      .eq("status", "pending");
    pendingSync = syncCount ?? 0;

    // Get recent stock movements
    const { data: movements } = await supabase
      .from("stock_movements")
      .select("id, delta, reason, notes, created_at, item:items(name, sku)")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    recentMovements = movements ?? [];
  }

  return (
    <AppShell
      title="Operations dashboard"
      description="Track inventory health, pending offline sync events, realtime changes, and billing state from one protected workspace."
    >
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Inventory Stats */}
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-300">
              Inventory
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white">Stock overview</h2>
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm text-slate-400">Total items</p>
                <p className="mt-1 text-2xl font-semibold text-white">{totalItems}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Total quantity</p>
                <p className="mt-1 text-2xl font-semibold text-white">{totalQuantity}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Low stock alerts</p>
                <p className="mt-1 text-2xl font-semibold text-white">
                  {lowStockCount}
                  {lowStockCount > 0 && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
                      ⚠
                    </span>
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* Sync Queue Status */}
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-sky-300">Sync</p>
            <h2 className="mt-3 text-xl font-semibold text-white">Offline queue</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              {pendingSync === 0
                ? "All operations synced successfully."
                : `${pendingSync} ${pendingSync === 1 ? "operation" : "operations"} pending sync.`}
            </p>
            <div className="mt-6">
              {pendingSync > 0 ? (
                <SyncNowButton />
              ) : (
                <span className="inline-flex rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-300">
                  Synced
                </span>
              )}
            </div>
          </section>

          {/* Billing */}
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-sky-300">Billing</p>
            {isPro ? (
              <>
                <h2 className="mt-3 text-xl font-semibold text-white">Pro plan active</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  You have full access to all Pro features. Thank you for your support.
                </p>
                <div className="mt-6">
                  <span className="inline-flex rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-300">
                    Pro
                  </span>
                </div>
              </>
            ) : (
              <>
                <h2 className="mt-3 text-xl font-semibold text-white">Upgrade to Pro</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Unlock offline-first sync, advanced inventory reports, and priority support with a
                  one-time Pro upgrade.
                </p>
                <div className="mt-6">
                  <CheckoutButton />
                </div>
              </>
            )}
          </section>
        </div>

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <section className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-lg font-semibold text-white">Low stock alerts</h3>
            </div>
            <div className="mt-4 space-y-3">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/10 p-4"
                >
                  <div>
                    <p className="font-medium text-white">{item.name}</p>
                    {item.sku && <p className="text-sm text-slate-400">SKU: {item.sku}</p>}
                    {item.category && (
                      <span className="mt-1 inline-block rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Quantity</p>
                    <p className="text-lg font-semibold text-amber-300">
                      {item.quantity} / {item.reorder_point}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Stock Movements */}
        {recentMovements.length > 0 && (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-white">Recent stock movements</h3>
            <div className="mt-4 space-y-3">
              {recentMovements.map((movement) => (
                <div
                  key={movement.id}
                  className="flex items-start justify-between border-b border-white/5 pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-white">
                      {movement.item?.name ?? "Unknown item"}
                    </p>
                    {movement.item?.sku && (
                      <p className="text-sm text-slate-400">SKU: {movement.item.sku}</p>
                    )}
                    {movement.notes && (
                      <p className="mt-1 text-sm text-slate-400">{movement.notes}</p>
                    )}
                  </div>
                  <div className="ml-4 text-right">
                    <p
                      className={`text-lg font-semibold ${
                        movement.delta > 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {movement.delta > 0 ? "+" : ""}
                      {movement.delta}
                    </p>
                    <span className="mt-1 inline-block rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
                      {movement.reason}
                    </span>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(movement.created_at).toLocaleDateString("sk-SK", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
