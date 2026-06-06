/**
 * BOOKISTUDIO Stripe Webhook Handler
 * Cloudflare Worker — Deploy via `wrangler deploy`
 *
 * Listens for Stripe checkout.session.completed events and
 * updates the Supabase pipeline state accordingly.
 *
 * Uses session.metadata.payment_type to distinguish
 * between 'deposit' and 'remaining_balance' payments.
 */

// ─── Configuration ──────────────────────────────────────────────
// Set these in Cloudflare Worker secrets (wrangler secret put)
// SUPABASE_URL, SUPABASE_ANON_KEY, STRIPE_WEBHOOK_SECRET
const SUPABASE_URL = '';    // Set as secret
const SUPABASE_KEY = '';    // Set as secret
const STRIPE_SECRET = '';   // Set as secret

// Products created via stripe-setup.js:
// Deposit:  prod_UehjRocQ39lNRs
// Remaining: prod_UehjCqAnClo4tE

// ─── Main Handler ───────────────────────────────────────────────
export default {
  async fetch(request, env) {
    // Only allow POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return new Response('Missing stripe-signature header', { status: 400 });
    }

    try {
      const body = await request.text();

      // Verify webhook signature
      const isValid = await verifyStripeSignature(body, signature, env.STRIPE_WEBHOOK_SECRET);
      if (!isValid) {
        return new Response('Invalid signature', { status: 401 });
      }

      const event = JSON.parse(body);

      // Handle checkout.session.completed
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const clientId = session.client_reference_id;
        const paymentType = session.metadata?.payment_type;

        if (!clientId) {
          return new Response('Missing client_reference_id', { status: 400 });
        }

        if (!paymentType || !['deposit', 'remaining_balance'].includes(paymentType)) {
          return new Response('Unknown payment_type', { status: 200 }); // Ack Stripe
        }

        let newStage;
        if (paymentType === 'deposit') {
          newStage = 'DEPOSIT_PAID';
        } else {
          newStage = 'REMAINDER_PAID';
        }

        // Update Supabase pipeline state
        await updatePipelineState(env, clientId, newStage);

        // If deposit paid, trigger Hermes to start building
        if (newStage === 'DEPOSIT_PAID') {
          await triggerBuild(env, clientId);
        }

        // If remainder paid, mark complete
        if (newStage === 'REMAINDER_PAID') {
          await updatePipelineState(env, clientId, 'COMPLETE');
        }
      }

      return new Response('OK', { status: 200 });

    } catch (err) {
      console.error('Webhook error:', err);
      return new Response('Internal error', { status: 500 });
    }
  }
};

// ─── Stripe Signature Verification ─────────────────────────────
async function verifyStripeSignature(payload, signature, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['verify']
  );

  const parts = signature.split(',');
  const timestampPart = parts.find(p => p.startsWith('t='));
  const sigPart = parts.find(p => p.startsWith('v1='));
  if (!timestampPart || !sigPart) return false;

  const timestamp = timestampPart.slice(2);
  const expectedSig = sigPart.slice(3);
  const signedPayload = `${timestamp}.${payload}`;

  const valid = await crypto.subtle.verify(
    'HMAC', key,
    hexToBuffer(expectedSig),
    encoder.encode(signedPayload)
  );
  return valid;
}

function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes.buffer;
}

// ─── Supabase Pipeline State ────────────────────────────────────
async function updatePipelineState(env, clientId, stage) {
  const endpoint = `${env.SUPABASE_URL}/rest/v1/pipeline_state?client_id=eq.${clientId}`;

  const response = await fetch(endpoint, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': env.SUPABASE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_KEY}`
    },
    body: JSON.stringify({
      stage,
      updated_at: new Date().toISOString()
    })
  });

  if (!response.ok) {
    throw new Error(`Supabase update failed: ${response.status} ${await response.text()}`);
  }

  console.log(`Client ${clientId} → ${stage}`);
}

// ─── Trigger Hermes Build ──────────────────────────────────────
async function triggerBuild(env, clientId) {
  const endpoint = `${env.SUPABASE_URL}/rest/v1/pipeline_state?client_id=eq.${clientId}`;
  const response = await fetch(endpoint, {
    headers: {
      'apikey': env.SUPABASE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_KEY}`
    }
  });

  if (!response.ok) return;
  const [record] = await response.json();
  if (!record) return;

  console.log(`Build triggered for client ${clientId}: ${record.business_name}`);
  // TODO: Call Hermes webhook or GitHub Actions dispatch
}

// ─── CORS ────────────────────────────────────────────────────────
async function handleOptions(request) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, stripe-signature'
    }
  });
}
