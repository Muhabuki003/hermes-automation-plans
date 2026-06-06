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
├── README.md                  ← This file (master plan)
├── prompts/
│   ├── intake-analyzer.md     ← System prompt for Intake Analyzer agent
│   ├── business-researcher.md ← System prompt for Business Researcher agent
│   ├── plan-builder.md        ← System prompt for Plan Builder agent
│   └── site-builder.md        ← System prompt for Site Builder agent
├── templates/
│   ├── intake-form.html       ← Client intake form template
│   ├── client-agreement.md    ← Client agreement template
│   ├── email-inquiry-approved.md
│   ├── email-plan-sent.md
│   └── email-site-delivered.md
└── docs/
    └── stripe-webhook-setup.md ← How to configure Stripe → Cloudflare Worker
```

---

## 🚀 Next Steps

- [ ] Set up Supabase pipeline state table
- [ ] Build Cloudflare Worker for Stripe webhook handler
- [ ] Write system prompts for each sub-agent (see `/prompts/`)
- [ ] Build client intake form template
- [ ] Draft all email templates
- [ ] Give Hermes access to GitHub (Muhabuki003) + Cloudflare
- [ ] Test full flow end-to-end with a dummy client
- [ ] Build client portal page (one URL per client, all steps in one place)

---

*Built by Am Muhabuki — BOOKISTUDIO Founder*
*Cypress/Houston, TX*
