-- ============================================================
-- Migration: 0002_production_hardening
-- Additive only — no DROP, no data migrations.
-- ============================================================


-- ============================================================
-- 1. profiles: Pro entitlement columns
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_pro           BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS pro_unlocked_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;


-- ============================================================
-- 2. Owner-scoped indexes for common query patterns
-- ============================================================

-- items: list by owner, most recently updated first
CREATE INDEX IF NOT EXISTS idx_items_owner_updated
  ON public.items (owner_id, updated_at DESC);

-- stock_movements: audit trail per owner
CREATE INDEX IF NOT EXISTS idx_stock_movements_owner_created
  ON public.stock_movements (owner_id, created_at DESC);

-- stock_movements: per-item movement history
CREATE INDEX IF NOT EXISTS idx_stock_movements_item
  ON public.stock_movements (item_id);

-- offline_sync_queue: sync polling loop (owner + status filter)
CREATE INDEX IF NOT EXISTS idx_offline_sync_queue_owner_status
  ON public.offline_sync_queue (owner_id, status);

-- checkout_sessions: billing history per owner
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_owner_created
  ON public.checkout_sessions (owner_id, created_at DESC);

-- notification_subscriptions: lookup by owner
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_owner
  ON public.notification_subscriptions (owner_id);


-- ============================================================
-- 3. CHECK constraints for domain integrity
-- ============================================================

ALTER TABLE public.items
  ADD CONSTRAINT chk_items_quantity_non_negative
    CHECK (quantity >= 0),
  ADD CONSTRAINT chk_items_reorder_point_non_negative
    CHECK (reorder_point >= 0);

ALTER TABLE public.offline_sync_queue
  ADD CONSTRAINT chk_offline_sync_queue_status
    CHECK (status IN ('pending', 'processing', 'completed', 'failed'));


-- ============================================================
-- 4. updated_at trigger (shared function)
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- items already has updated_at; attach trigger
CREATE TRIGGER trg_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- 5. checkout_sessions: add updated_at for webhook audit trail
-- ============================================================
ALTER TABLE public.checkout_sessions
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TRIGGER trg_checkout_sessions_updated_at
  BEFORE UPDATE ON public.checkout_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
