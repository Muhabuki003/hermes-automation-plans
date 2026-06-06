#!/usr/bin/env node
/**
 * BOOKISTUDIO Stripe Setup
 * Creates products and prices for the automation pipeline.
 */
const https = require('https');

const STRIPE_KEY = process.env.STRIPE_KEY || process.argv[2];
if (!STRIPE_KEY) {
  console.error('Usage: node stripe-setup.js sk_live_...');
  process.exit(1);
}

const BASE = 'api.stripe.com';
const AUTH = Buffer.from(STRIPE_KEY + ':').toString('base64');
const headers = {
  'Authorization': `Basic ${AUTH}`,
  'Content-Type': 'application/x-www-form-urlencoded',
};

function post(path, data) {
  return new Promise((resolve, reject) => {
    const body = Object.entries(data).map(([k, v]) =>
      `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
    ).join('&');
    const req = https.request({
      hostname: BASE,
      path,
      method: 'POST',
      headers: { ...headers, 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        const json = JSON.parse(raw);
        if (json.error) reject(new Error(json.error.message));
        else resolve(json);
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('=== BOOKISTUDIO Stripe Setup ===\n');

  // 1. Create Deposit product
  const depositProduct = await post('/v1/products', {
    name: 'BOOKISTUDIO Deposit',
    description: '50% deposit to secure your project slot — amount varies per client',
    'metadata[purpose]': 'deposit',
  });
  console.log(`✅ Deposit product: ${depositProduct.id} — "${depositProduct.name}"`);

  // 2. Create Remaining Balance product
  const remainingProduct = await post('/v1/products', {
    name: 'BOOKISTUDIO Remaining Balance',
    description: 'Remaining 50% balance due on project completion',
    'metadata[purpose]': 'remaining_balance',
  });
  console.log(`✅ Remaining product: ${remainingProduct.id} — "${remainingProduct.name}"`);

  // 3. Create a reference price for each (webhook uses metadata, not price IDs)
  // These are flexible — Hermes creates dynamic prices per client via price_data
  const depositPrice = await post('/v1/prices', {
    product: depositProduct.id,
    currency: 'usd',
    unit_amount: '1',  // $0.01 placeholder — real amounts set per client
    'metadata[is_placeholder]': 'true',
  });
  console.log(`✅ Deposit price ref: ${depositPrice.id}`);

  const remainingPrice = await post('/v1/prices', {
    product: remainingProduct.id,
    currency: 'usd',
    unit_amount: '1',  // $0.01 placeholder
    'metadata[is_placeholder]': 'true',
  });
  console.log(`✅ Remaining price ref: ${remainingPrice.id}`);

  console.log('\n=== DONE ===');
  console.log('Webhook uses metadata.payment_type to distinguish deposit vs remaining.');
  console.log('Hermes creates checkout sessions with price_data for exact client amounts.');
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
