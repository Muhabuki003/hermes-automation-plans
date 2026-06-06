-- BOOKISTUDIO — Extended Schema
-- Run this in your Supabase SQL Editor (Project → SQL Editor → New query → Paste → Run).
-- Extends the existing `public.inquiries` and `public.sites` tables with a
-- `public.pipeline_state` table for full pipeline tracking.

-- ── Table: inquiries (already exists) ──
-- This table already has: id, created_at, type, name, email, business, budget, read, data
-- No changes needed — Hermes reads this to detect new submissions.

-- ── Table: sites (already exists) ──
-- This table already has: id, created_at, name, url, industry, description, image_data, active
-- Hermes reads this for style reference and past work context.

-- ── New Table: pipeline_state ──
-- Tracks each client through the BOOKISTUDIO automation pipeline.
create table if not exists public.pipeline_state (
  id              uuid primary key default gen_random_uuid(),
  inquiry_id      bigint references public.inquiries(id) on delete cascade,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- Pipeline stage
  stage           text not null default 'INQUIRY_RECEIVED' check (stage in (
                    'INQUIRY_RECEIVED',
                    'AM_REVIEW',
                    'PLANNING',
                    'PLAN_SENT',
                    'AGREEMENT_SENT',
                    'DEPOSIT_PAID',
                    'BUILDING',
                    'SITE_REVIEW',
                    'SITE_APPROVED',
                    'SITE_DELIVERED',
                    'REMAINDER_PAID',
                    'COMPLETE',
                    'CANCELLED'
                  )),

  -- Client info (mirrored from inquiries for quick access)
  business_name   text,
  client_email    text,
  client_phone    text,

  -- Outputs from each stage
  intake_analysis   jsonb,  -- output from Intake Analyzer agent
  research_report   jsonb,  -- output from Business Researcher agent
  project_plan      text,   -- markdown plan from Plan Builder agent

  -- Deployment
  github_repo       text,   -- e.g. "Muhabuki003/bookistudio-salon-name"
  site_url          text,   -- Cloudflare Pages URL

  -- Stripe
  deposit_session_id    text,
  deposit_paid_at       timestamptz,
  remaining_session_id  text,
  remaining_paid_at     timestamptz,

  -- Pricing (in cents)
  total_amount    integer,
  deposit_amount  integer,

  -- Notes
  notes           text
);

-- Indexes
create index if not exists idx_pipeline_stage on public.pipeline_state(stage);
create index if not exists idx_pipeline_inquiry on public.pipeline_state(inquiry_id);

-- Auto-update updated_at
create or replace function public.update_pipeline_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_pipeline_updated on public.pipeline_state;
create trigger trg_pipeline_updated
  before update on public.pipeline_state
  for each row
  execute function public.update_pipeline_updated_at();

-- Row Level Security
alter table public.pipeline_state enable row level security;

-- Allow anonymous inserts (for Hermes API calls)
drop policy if exists "Allow service insert" on public.pipeline_state;
create policy "Allow service insert"
  on public.pipeline_state
  for insert
  to anon, authenticated
  with check (true);

-- Only authenticated admins can read/update/delete
drop policy if exists "Authenticated can read pipeline" on public.pipeline_state;
create policy "Authenticated can read pipeline"
  on public.pipeline_state
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can update pipeline" on public.pipeline_state;
create policy "Authenticated can update pipeline"
  on public.pipeline_state
  for update
  to authenticated
  using (true)
  with check (true);

-- Notify Hermes on stage changes
create or replace function public.notify_pipeline_stage()
returns trigger as $$
begin
  if old.stage is distinct from new.stage then
    perform pg_notify(
      'pipeline_stage_change',
      json_build_object(
        'inquiry_id', new.inquiry_id,
        'business_name', new.business_name,
        'old_stage', old.stage,
        'new_stage', new.stage,
        'updated_at', new.updated_at
      )::text
    );
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_pipeline_notify on public.pipeline_state;
create trigger trg_pipeline_notify
  after update on public.pipeline_state
  for each row
  execute function public.notify_pipeline_stage();
