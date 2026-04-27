import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { InventoryRealtimeBridge } from "@/components/inventory/inventory-realtime-bridge";
import { InventoryWorkspace } from "@/components/inventory/inventory-workspace";
import { getInventoryItems } from "@/lib/inventory/queries";

export default async function ItemsPage() {
  const items = await getInventoryItems();

  return (
    <AppShell
      title="Inventory items"
      description="Authenticated item index backed by Supabase queries, optimistic offline-safe mutations, and replay-ready sync flows."
    >
      <InventoryRealtimeBridge />
      <InventoryWorkspace />

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm text-slate-200">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-400">
            <tr>
              <th className="px-4 py-4">Item</th>
              <th className="px-4 py-4">SKU</th>
              <th className="px-4 py-4">Location</th>
              <th className="px-4 py-4">Qty</th>
              <th className="px-4 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map((item) => (
              <tr key={item.id} className="transition hover:bg-white/4">
                <td className="px-4 py-4 font-medium text-white">
                  <Link href={`/items/${item.id}`} className="transition hover:text-emerald-300">
                    {item.name}
                  </Link>
                </td>
                <td className="px-4 py-4">{item.sku}</td>
                <td className="px-4 py-4">{item.location}</td>
                <td className="px-4 py-4">{item.quantity}</td>
                <td className="px-4 py-4 capitalize">{item.status.replace("_", " ")}</td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                  No live inventory items yet. Add one above or configure Supabase env keys to
                  load real data.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
