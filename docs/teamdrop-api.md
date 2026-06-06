# TeamDrop API Setup Guide

Get API credentials and start integrating with TeamDrop's product sourcing and dropshipping platform.

---

## 1. Create a TeamDrop Account

1. Go to [teamdrop.com](https://teamdrop.com) and click **Sign Up**
2. Complete registration (email + password or Google OAuth)
3. Verify your email address

> If you already have an account, just log in.

---

## 2. Generate an API Key

1. From the dashboard, go to **Settings** → **Developer** → **API Keys**
2. Click **Create New Key**
3. Set a name (e.g. `hermes-automation`)
4. Enable these **scopes**:
   - ✅ **Products** — read product listings, search inventory
   - ✅ **Orders** — create and manage orders
5. Click **Generate**
6. **Copy the key immediately** — it will not be shown again

---

## 3. API Credentials Summary

| Item | Value |
|------|-------|
| **Base URL** | `https://api.teamdrop.com/v1` |
| **Auth Header** | `Authorization: Bearer <your_api_key>` |
| **Content-Type** | `application/json` |

---

## 4. Rate Limits

| Limit | Value |
|-------|-------|
| Requests per minute | 60 |
| Requests per hour | 1,000 |
| Burst allowance | 10 concurrent requests |

If you exceed the limit, you'll receive a `429 Too Many Requests` response. Implement exponential backoff in your automation.

---

## 5. Common API Operations

### Search Products

```bash
curl -X GET "https://api.teamdrop.com/v1/products" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -G \
  --data-urlencode "query=wireless headphones" \
  --data-urlencode "page=1" \
  --data-urlencode "limit=50"
```

**Search parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Full-text search term |
| `category_id` | integer | Filter by category |
| `min_price` | float | Minimum price filter |
| `max_price` | float | Maximum price filter |
| `sort` | string | `price_asc`, `price_desc`, `popularity` |
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Results per page (default: 20, max: 100) |

### Get Product Pricing

```bash
curl -X GET "https://api.teamdrop.com/v1/products/{product_id}/pricing" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

Returns product cost, suggested retail price, and supplier info.

### Create an Order

```bash
curl -X POST "https://api.teamdrop.com/v1/orders" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product_id": 12345,
        "variant_id": 67890,
        "quantity": 1
      }
    ],
    "shipping_address": {
      "first_name": "Jane",
      "last_name": "Doe",
      "address_line1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001",
      "country": "US"
    }
  }'
```

---

## 6. Integration Notes

- **Webhooks:** Configure order status webhooks in Settings → Developer → Webhooks. Payloads are sent to your endpoint on `order.created`, `order.shipped`, `order.delivered`.
- **Caching:** Product data changes daily — cache for no more than 24 hours.
- **Images:** Product image URLs are CDN-hosted and publicly accessible.
- **Error codes:** `401` = invalid/missing key, `403` = insufficient scopes, `404` = not found, `429` = rate limited.

---

## 7. Testing

Use the sandbox environment for testing before going live:

- **Sandbox URL:** `https://api.sandbox.teamdrop.com/v1`
- **Test key:** Generate from Settings → Developer → Sandbox API Keys
- Orders in sandbox are simulated — no real charges or shipments occur
