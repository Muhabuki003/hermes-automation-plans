# Stripe Webhook Setup Guide

This guide walks you through setting up the Stripe webhook handler for the BOOKISTUDIO automation pipeline.

## Overview

When a client pays their deposit or remaining balance via Stripe, a `checkout.session.completed` event fires. A Cloudflare Worker receives this event and updates the Supabase pipeline state accordingly.

## Prerequisites

- A [Stripe](https://stripe.com) account
- A [Cloudflare](https://cloudflare.com) account
- Your Supabase project (see `docs/supabase-schema.sql`)
- The Hermes Cloudflare provider configured (you already have this)

## Step 1: Deploy the Cloudflare Worker

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login
wrangler login

# Create the worker
cd docs/
wrangler init bookistudio-webhook
```

Replace the contents of `src/index.js` with the contents of `stripe-webhook-worker.js`, then:

```bash
# Set secrets
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET

# Deploy
wrangler deploy
```

Note your Worker's URL (e.g., `https://bookistudio-webhook.your-subdomain.workers.dev`).

## Step 2: Configure Stripe Webhook

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Endpoint URL: `https://bookistudio-webhook.your-subdomain.workers.dev`
4. Events to listen for: `checkout.session.completed`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_...`)
7. Set it as `STRIPE_WEBHOOK_SECRET` in your Worker

## Step 3: Create Stripe Products & Prices

1. In Stripe Dashboard → Products, create two products:
   - **BOOKISTUDIO Deposit** (one-time, 50% of project fee)
   - **BOOKISTUDIO Remaining Balance** (one-time, 50% of project fee)
2. Copy the **Price IDs** (starts with `price_...`)
3. Update the `DEPOSIT_PRICE_ID` and `REMAINING_PRICE_ID` constants in `stripe-webhook-worker.js`

## Step 4: Create Payment Links Programmatically

When Hermes sends the plan email, it uses Stripe's API to create checkout sessions:

```bash
# Create a deposit payment link
curl https://api.stripe.com/v1/checkout/sessions \
  -u sk_test_YOUR_STRIPE_SECRET_KEY: \
  -d "mode=payment" \
  -d "line_items[0][price]=price_DEPOSIT_ID" \
  -d "line_items[0][quantity]=1" \
  -d "client_reference_id=CLIENT_ID" \
  -d "success_url=https://bookistudio.com/payment/success" \
  -d "cancel_url=https://bookistudio.com/payment/canceled"
```

The `client_reference_id` must match the client's UUID in the pipeline state table.

## Testing

Use Stripe's test card numbers:
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`

To test the webhook locally:
```bash
stripe listen --forward-to localhost:8787
stripe trigger checkout.session.completed
```

## Troubleshooting

- **Webhook returning 401** → Check `STRIPE_WEBHOOK_SECRET` matches exactly
- **Supabase update failing** → Verify `SUPABASE_URL` and `SUPABASE_KEY` have write access
- **Payment not triggering build** → Check `client_reference_id` is set correctly in the checkout session
- Worker logs can be viewed via `wrangler tail`
