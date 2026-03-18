-- Add billing-related fields to user_settings for plan gating
-- Requires existing public.user_settings table (see prior migration)

BEGIN;

ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS plan_tier TEXT NOT NULL DEFAULT 'free', -- 'free' | 'pro' | 'trial' (optional)
  ADD COLUMN IF NOT EXISTS dodo_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS dodo_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS pro_expires_at TIMESTAMP WITH TIME ZONE;

-- Add constraints and indexes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_settings_dodo_customer_id_unique'
  ) THEN
    ALTER TABLE public.user_settings
      ADD CONSTRAINT user_settings_dodo_customer_id_unique UNIQUE (dodo_customer_id);
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_user_settings_dodo_subscription_id
  ON public.user_settings (dodo_subscription_id);

-- Keep existing RLS policies from original migration.
-- Note: Webhooks will require service role or dedicated admin endpoint to update these rows.

COMMIT;