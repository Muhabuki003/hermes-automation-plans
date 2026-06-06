-- BOOKISTUDIO Pipeline State Schema
-- Run this in your Supabase SQL Editor
-- Replace your-project-ref with your actual Supabase project ref

-- ─── Pipeline State Table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS pipeline_state (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Pipeline stage
  stage         TEXT NOT NULL DEFAULT 'INQUIRY'
                CHECK (stage IN (
                  'INQUIRY',
                  'INTAKE_SENT',
                  'INTAKE_RECEIVED',
                  'PLANNING',
                  'PLAN_SENT',
                  'AGREEMENT_SIGNED',
                  'DEPOSIT_PAID',
                  'BUILDING',
                  'SITE_REVIEW',
                  'SITE_APPROVED',
                  'SITE_DELIVERED',
                  'REMAINDER_PAID',
                  'COMPLETE',
                  'CANCELLED'
                )),

  -- Client info
  email         TEXT,
  phone         TEXT,
  location      TEXT,
  industry      TEXT,

  -- Intake data (JSON — full intake analyzer output)
  intake_data   JSONB,

  -- Research data (JSON — business researcher output)
  research_data JSONB,

  -- Project plan (markdown)
  project_plan  TEXT,

  -- Site info
  site_url      TEXT,
  github_repo   TEXT,

  -- Stripe payment IDs
  deposit_session_id     TEXT,
  deposit_paid_at        TIMESTAMPTZ,
  remaining_session_id   TEXT,
  remaining_paid_at      TIMESTAMPTZ,

  -- Pricing
  total_amount   INTEGER,  -- in cents
  deposit_amount INTEGER,  -- in cents

  -- Metadata
  notes         TEXT,
  tags          TEXT[] DEFAULT '{}'
);

-- ─── Indexes ────────────────────────────────────────────────────
CREATE INDEX idx_pipeline_stage ON pipeline_state(stage);
CREATE INDEX idx_pipeline_client ON pipeline_state(client_id);
CREATE INDEX idx_pipeline_created ON pipeline_state(created_at DESC);

-- ─── Auto-update updated_at ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pipeline_updated
  BEFORE UPDATE ON pipeline_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ─── Row Level Security ─────────────────────────────────────────
ALTER TABLE pipeline_state ENABLE ROW LEVEL SECURITY;

-- Allow Hermes (via anon key with proper permissions) to read/write
CREATE POLICY "Allow all for service role"
  ON pipeline_state
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ─── Notify Hermes on stage changes ────────────────────────────
-- This lets Hermes listen for real-time updates
CREATE OR REPLACE FUNCTION notify_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    PERFORM pg_notify(
      'pipeline_stage_change',
      json_build_object(
        'client_id', NEW.client_id,
        'business_name', NEW.business_name,
        'old_stage', OLD.stage,
        'new_stage', NEW.stage,
        'updated_at', NEW.updated_at
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pipeline_notify
  AFTER UPDATE ON pipeline_state
  FOR EACH ROW
  EXECUTE FUNCTION notify_stage_change();
