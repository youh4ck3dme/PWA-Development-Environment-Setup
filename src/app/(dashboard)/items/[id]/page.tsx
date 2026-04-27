import { AppShell } from "@/components/layout/app-shell";
import { ItemDetailActions } from "@/components/inventory/item-detail-actions";
import { InventoryRealtimeBridge } from "@/components/inventory/inventory-realtime-bridge";
import { SectionCard } from "@/components/layout/section-card";
import { getInventoryItemDetail } from "@/lib/inventory/queries";

interface ItemDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params;
  const detail = await getInventoryItemDetail(id);

  return (
    <AppShell
      title={detail?.item.name ?? `Item ${id}`}
      description="Item detail backed by Supabase, with movement history, offline replay context, and export entry points."
    >
      <InventoryRealtimeBridge itemId={id} />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <SectionCard
          eyebrow="History"
          title="Movement timeline"
          description="Latest stock movements from Supabase are shown here. This will later expand into live realtime updates and replay conflict summaries."
        >
          <div className="space-y-3 text-sm text-slate-300">
            {detail?.movements.length ? (
              detail.movements.map((movement) => (
                <div
                  key={movement.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-white capitalize">{movement.reason}</p>
                    <p className="text-xs text-slate-400">{new Date(movement.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-300">
                    {movement.delta > 0 ? `+${movement.delta}` : movement.delta}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-400">No stock movement history yet for this item.</p>
            )}
          </div>
        </SectionCard>
        <SectionCard
          eyebrow="Actions"
          title="Offline-safe mutations"
          description="Adjustments, transfers, and recount actions will be queued locally when the network is unavailable."
        >
          <div className="space-y-5 text-sm text-slate-300">
            <p>SKU: <span className="text-white">{detail?.item.sku ?? "Not loaded"}</span></p>
            <p>Category: <span className="text-white">{detail?.item.category ?? "Not loaded"}</span></p>
            <p>Location: <span className="text-white">{detail?.item.location ?? "Not loaded"}</span></p>
            <p>Quantity: <span className="text-white">{detail?.item.quantity ?? 0}</span></p>
            <p>Reorder point: <span className="text-white">{detail?.item.reorderPoint ?? 0}</span></p>
            {detail?.item ? <ItemDetailActions item={detail.item} /> : null}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
