# Shopify API Setup Guide

Set up Shopify Admin REST API and Storefront GraphQL API for product management and theme automation.

---

## 1. Shopify Store Prerequisites

You need a Shopify store (or create a development store):

- **Create a dev store:** Go to [shopify.com](https://shopify.com) → Get Started → select "Development store" during signup
- **Existing store:** Log in to your Shopify admin at `admin.shopify.com`

---

## 2. Admin API Setup (Product Management)

The Admin API lets you create, read, update, and delete products, orders, customers, and more.

### Create a Custom App

1. From Shopify Admin, go to **Settings** → **Apps** → **Develop apps**
2. Click **Create an app**
3. Name it (e.g. `hermes-automation`)
4. Click **Create app**

### Configure API Scopes

1. In your new app, go to the **Configuration** tab
2. Click **Configure Admin API scopes**
3. Enable the following scopes:

   | Scope | Permission | Why |
   |-------|------------|-----|
   | `write_products` | Full product CRUD | Create/update listings |
   | `read_products` | Read products | Fetch existing inventory |
   | `write_themes` | Modify theme files | Inject code into theme |
   | `read_themes` | Read theme files | Inspect current theme |
   | `write_script_tags` | Add script tags | Deploy tracking/embedded widgets |

4. Click **Save**

### Install the App & Get Token

1. Go to the **API credentials** tab
2. Click **Install app**
3. Confirm installation
4. Copy the **Admin API access token** — this is your `shpat_***` token

> ⚠️ Store this token securely. It has write access to your store.

---

## 3. Admin API — REST Examples

Your store domain format: `my-store.myshopify.com`

Base URL: `https://{store-domain}/admin/api/2024-10`

### List All Products

```bash
curl -X GET "https://my-store.myshopify.com/admin/api/2024-10/products.json" \
  -H "X-Shopify-Access-Token: shpat_***"
```

### Create a Product

```bash
curl -X POST "https://my-store.myshopify.com/admin/api/2024-10/products.json" \
  -H "X-Shopify-Access-Token: shpat_***" \
  -H "Content-Type: application/json" \
  -d '{
    "product": {
      "title": "Wireless Bluetooth Headphones",
      "body_html": "<strong>Premium sound quality</strong> with 30-hour battery life.",
      "vendor": "TechBrand",
      "product_type": "Electronics",
      "status": "draft",
      "variants": [
        {
          "price": "49.99",
          "compare_at_price": "79.99",
          "sku": "WBH-001-BLK",
          "inventory_management": "shopify",
          "inventory_quantity": 100
        }
      ],
      "images": [
        {
          "src": "https://example.com/headphones.jpg"
        }
      ]
    }
  }'
```

### Update Product Inventory

```bash
curl -X PUT "https://my-store.myshopify.com/admin/api/2024-10/variants/{variant_id}.json" \
  -H "X-Shopify-Access-Token: shpat_***" \
  -H "Content-Type: application/json" \
  -d '{
    "variant": {
      "id": 123456789,
      "inventory_quantity": 50
    }
  }'
```

---

## 4. Storefront API Setup (Headless / Customer-Facing)

The Storefront API lets you query products, collections, and cart data from the customer-facing side.

### Get a Storefront Access Token

1. Go to **Settings** → **Sales channels** → **Custom storefront**
2. Click **Create a private storefront**
3. Name it (e.g. `hermes-automation-frontend`)
4. After creation, copy the **Storefront API access token** (starts with `gid://`)

---

## 5. Storefront API — GraphQL Examples

Base URL: `https://{store-domain}/api/2024-10/graphql`

Auth header: `X-Shopify-Storefront-Access-Token: {token}`

### Search Products

```graphql
{
  products(first: 10, query: "title:headphones") {
    edges {
      node {
        id
        title
        description
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 1) {
          edges {
            node {
              url
            }
          }
        }
      }
    }
  }
}
```

```bash
curl -X POST "https://my-store.myshopify.com/api/2024-10/graphql" \
  -H "X-Shopify-Storefront-Access-Token: {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ products(first: 10, query: \"title:headphones\") { edges { node { id title description priceRange { minVariantPrice { amount currencyCode } } } } } }"
  }'
```

### Get Product by Handle

```graphql
{
  productByHandle(handle: "wireless-bluetooth-headphones") {
    id
    title
    description
    availableForSale
    variants(first: 5) {
      edges {
        node {
          id
          title
          price {
            amount
            currencyCode
          }
        }
      }
    }
  }
}
```

---

## 6. Credentials Summary

| Item | Value / Location |
|------|-----------------|
| **Store domain** | `my-store.myshopify.com` |
| **Admin API token** | Apps → Develop apps → [App Name] → API credentials |
| **Storefront API token** | Settings → Sales channels → Custom storefront |
| **Admin API version** | `2024-10` (or latest stable) |
| **Admin auth header** | `X-Shopify-Access-Token: {token}` |
| **Storefront auth header** | `X-Shopify-Storefront-Access-Token: {token}` |

---

## 7. Notes & Best Practices

- **Rate limits:** Admin API allows 40 requests per second per app per store. Use `X-Shopify-Shop-Api-Call-Limit` response header to monitor usage.
- **GraphQL cost model:** Storefront API uses a query cost model (max 1,000 points per query, 2,000 per second). Use the `cost` field in responses to track.
- **Webhooks:** Set up product update webhooks in Settings → Notifications → Webhooks for real-time sync.
- **Theme editing:** Use the Admin API's `/themes/{theme_id}/assets.json` endpoints to update Liquid theme files.
- **Test mode:** Create products with `status: "draft"` to avoid publishing during testing.
