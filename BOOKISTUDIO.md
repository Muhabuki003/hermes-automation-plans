# 🤖 BOOKISTUDIO × Hermes Automation Pipeline

> Full autonomous client onboarding, site building, and delivery system powered by Hermes AI + GitHub + Cloudflare + Stripe.

---

## 🎯 Overview

This repo documents the architecture and implementation plan for automating BOOKISTUDIO's entire client workflow — from first inquiry to deployed website — using Hermes as the AI orchestrator.

**Goal:** Zero manual work except two approval checkpoints (plan approval + site approval).

---

## 🔄 Full Client Pipeline Flow

```
[Inquiry Received]
       ↓
[Hermes notifies Am → Am approves]
       ↓
[Auto-send: Thank You + Intake Form] ← founder@bookistudios.com
       ↓
[Client submits Intake Form]
       ↓
[Sub-agents run IN PARALLEL]
   ├── Agent 1: Intake Analyzer — dissects form, extracts requirements
   ├── Agent 2: Business Researcher — scrapes online presence, socials, reviews
   └── Agent 3: Plan Builder — creates site plan based on above
       ↓
[Hermes drafts: Project Plan Email + Client Agreement Form + Payment Link (deposit)]
       ↓
[Am reviews plan → approves]
       ↓
[Auto-send: Plan + Agreement + Deposit Payment Link] ← founder@bookistudios.com
       ↓
[Client signs agreement + pays deposit]
       ↓
[Stripe webhook confirms payment → triggers Hermes]
       ↓
[Agent 4: Site Builder]
   ├── References all past BOOKISTUDIO Cloudflare deployments for style consistency
   ├── Builds in Am's style (Three.js, GSAP, cinematic single-file HTML)
   ├── Ensures NO two sites look the same
   └── Pushes to GitHub repo (new repo per client)
       ↓
[Hermes notifies Am → Am reviews site → approves]
       ↓
[Cloudflare Pages auto-deploys via GitHub push]
       ↓
[Auto-send: Site Delivered Email + Remaining Balance Payment Link] ← founder@bookistudios.com
       ↓
[Client pays remainder → DONE ✅]
```

---

## 🤖 Sub-Agent Breakdown

| Agent | Role | Inputs | Outputs |
|---|---|---|---|
| **Intake Analyzer** | Parses client intake form | Intake form submission | Structured requirements JSON |
| **Business Researcher** | Scrapes client's online presence | Business name, location | Competitor analysis, brand notes |
| **Plan Builder** | Creates site plan | Requirements + research | Project plan markdown + email draft |
| **Site Builder** | Builds the website | Plan + style references | Single-file HTML pushed to GitHub |

---

## 🛠️ Tech Stack & Integrations

| Layer | Tool |
|---|---|
| AI Orchestrator | Hermes + DeepSeek |
| Email | founder@bookistudios.com (Microsoft 365 via IMAP/SMTP) |
| Repos | GitHub (Muhabuki003) — one repo per client |
| Deployment | Cloudflare Pages (auto-deploy on push) |
| Payments | Stripe (deposit + remainder, webhook triggers) |
| Pipeline State | Supabase (`nrxbexwzshsnlxyqqgag`) or GitHub Issues |
| Client Portal | Single-file HTML per client (hosted on Cloudflare Pages) |
| Style Reference | All past BOOKISTUDIO Cloudflare deployments |

---

## ✅ Am's Two Approval Checkpoints

1. **Inquiry approval** — Is this a legit lead worth pursuing?
2. **Plan approval** — Does the project plan match the client's vision?
3. **Site approval** — Does the finished site meet BOOKISTUDIO standards?

Everything else is autonomous.

---

## 📧 Email Touchpoints (All from founder@bookistudios.com)

| Trigger | Email Sent |
|---|---|
| Inquiry approved | Thank you + Intake Form link |
| Plan approved by Am | Project Plan + Client Agreement + Deposit link |
| Site approved by Am | Site delivered + Remaining balance link |

---

## 🏗️ Pipeline State Machine

Each client is tracked as a record in Supabase with these stages:

```
INQUIRY → INTAKE_SENT → INTAKE_RECEIVED → PLANNING → PLAN_SENT → 
AGREEMENT_SIGNED → DEPOSIT_PAID → BUILDING → SITE_REVIEW → 
SITE_APPROVED → SITE_DELIVERED → REMAINDER_PAID → COMPLETE
```

Hermes reads and writes to this state on every action. Stripe webhooks update `DEPOSIT_PAID` and `REMAINDER_PAID` stages automatically.

---

## 🎨 Site Builder Style Rules

- Always single-file HTML (embedded CSS + JS)
- Three.js for 3D elements
- GSAP ScrollTrigger for scroll animations
- Cinematic, dark, high-impact aesthetic
- Reference all past deployed sites for brand consistency
- **No two sites should look the same** — vary layout, color, motion style per client industry
- Deploy to Cloudflare Pages via new GitHub repo per client

---

## 📁 Repo Structure (This Repo)

```
hermes-automation-plans/
├── BOOKISTUDIO.md             ← Master plan (this file)
├── DROPSHIPPING.md            ← Dropshipping automation plan
├── README.md                  ← Repo overview
├── prompts/                   ← ✅ System prompts for all 4 sub-agents
│   ├── intake-analyzer.md     ← Intake Analyzer — parses client form → structured JSON
│   ├── business-researcher.md ← Business Researcher — scrapes online presence, competitors
│   ├── plan-builder.md        ← Plan Builder — synthesizes research → project plan
│   └── site-builder.md        ← Site Builder — builds single-file HTML, pushes to GitHub
├── templates/                 ← ✅ All templates built
│   ├── intake-form.html       ← Cinematic dark-mode intake form (BOOKISTUDIO branded)
│   ├── client-agreement.md    ← Service contract with pricing, revisions, IP terms
│   ├── email-inquiry-approved.md  ← Sent after Am approves the lead
│   ├── email-plan-sent.md         ← Sent with project plan + agreement + deposit link
│   └── email-site-delivered.md    ← Sent with live URL + remaining balance link
└── docs/                      ← ✅ Infrastructure docs & code
    ├── supabase-schema.sql    ← Full pipeline state table + triggers + RLS + notifications
    ├── stripe-webhook-worker.js  ← Cloudflare Worker (HMAC-verified Stripe webhook handler)
    └── stripe-webhook-setup.md   ← Step-by-step: deploy worker, configure Stripe, test
```

---

## 🚀 Next Steps

- [x] Write system prompts for each sub-agent (see `/prompts/`)
- [x] Build client intake form template (`templates/intake-form.html`)
- [x] Draft all email templates (`templates/email-*.md`)
- [x] Client agreement template (`templates/client-agreement.md`)
- [x] Supabase pipeline state schema (`docs/supabase-schema.sql`)
- [x] Stripe webhook Cloudflare Worker (`docs/stripe-webhook-worker.js`)
- [x] Stripe webhook setup documentation (`docs/stripe-webhook-setup.md`)
- [ ] Set up Supabase project — run `docs/supabase-schema.sql` in SQL Editor
- [ ] Deploy Cloudflare Worker — follow `docs/stripe-webhook-setup.md`
- [ ] Configure Stripe products & webhook endpoint
- [ ] Create Hermes cron job / trigger for the pipeline
- [ ] Give Hermes access to GitHub (Muhabuki003) + Cloudflare
- [ ] Test full flow end-to-end with a dummy client
- [ ] Build client portal page (one URL per client, all steps in one place)

---

*Built by Am Muhabuki — BOOKISTUDIO Founder*
*Cypress/Houston, TX*
