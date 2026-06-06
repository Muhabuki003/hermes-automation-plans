# 🛒 Dropshipping × Hermes Automation Pipeline

> Fully autonomous product discovery, store creation, social media, and growth engine powered by Hermes AI + TikTok + TeamDrop + Shopify + Cloudflare.

---

## 🎯 Overview

Hermes handles the entire dropshipping operation — finding viral products, sourcing them, building branded stores, registering domains, creating social accounts, posting content aggressively, and recommending when to go paid. The only approval gate is domain purchase.

---

## 🔄 Full Pipeline Flow

```
[TikTok Trend Detected]
       ↓
[Discovery Agent flags viral product]
       ↓
[Sourcing Agent searches TeamDrop]
   ├── Found → pull product details, pricing, variants
   └── Not found → trigger Alibaba/TeamDrop marketplace sourcing (3-day wait)
       ↓
[Shopify Agent adds product to store]
   ├── AI-generated product description
   ├── Images from TikTok + TeamDrop listing
   ├── Price set with configured margin
   └── TeamDrop fulfillment auto-connected
       ↓
[Brand Agent generates unique store identity]
   ├── Brand name, logo concept, color palette
   ├── Unique theme per product niche
   └── Headless frontend built + connected to Shopify API
       ↓
[Domain Agent searches Cloudflare for domain]
       ↓
[⚠️ APPROVAL GATE — Am approves domain purchase]
       ↓
[Domain registered → DNS configured → Site live]
       ↓
[Social Agent creates accounts]
   ├── TikTok account (brand-specific)
   └── Instagram account (connected to Facebook Page — posts to both)
       ↓
[Content Agent begins aggressive posting]
   ├── Downloads viral TikToks related to product
   ├── Reposts with branded captions + product link
   ├── Posts multiple times per day
   └── Tracks engagement per post
       ↓
[Analytics Agent monitors performance]
   ├── Identifies top-performing videos
   ├── Pushes more content in that style
   └── When organic performance crosses threshold → notifies Am:
       "This product is popping. Ready to run paid ads?"
       ↓
[Am approves paid ad budget → Hermes launches TikTok/Meta ads]
```

---

## 🤖 Sub-Agent Breakdown

| Agent | Role | Inputs | Outputs |
|---|---|---|---|
| **Discovery Agent** | Scans TikTok for viral products | TikTok trending feed | Product name, video URL, engagement data |
| **Sourcing Agent** | Finds product on TeamDrop/Alibaba | Product name/description | TeamDrop product link + pricing |
| **Shopify Agent** | Adds product to Shopify store | TeamDrop product data | Live Shopify product listing |
| **Brand Agent** | Creates unique store identity | Product niche | Brand name, theme, headless frontend |
| **Domain Agent** | Registers domain on Cloudflare | Brand name | Domain + DNS configured |
| **Social Agent** | Creates TikTok + Instagram accounts | Brand identity | Live social accounts |
| **Content Agent** | Downloads + posts viral content | TikTok videos + product link | Scheduled posts across platforms |
| **Analytics Agent** | Tracks performance + recommends ads | Post engagement data | Performance reports + ad recommendations |

---

## 🛠️ Tech Stack & Integrations

| Layer | Tool |
|---|---|
| Trend Discovery | TikTok API / scraper |
| Supplier | TeamDrop (primary) + Alibaba (fallback) |
| E-commerce Backend | Shopify (Storefront API + Admin API) |
| Storefront | Headless HTML frontend (Shopify Storefront API) |
| Domains | Cloudflare Registrar |
| Deployment | Cloudflare Pages |
| Social Posting | TikTok API + Instagram Graph API (Meta) |
| Content Sourcing | TikTok video downloader |
| Analytics | TikTok Analytics API + Meta Insights API |
| Paid Ads | TikTok Ads Manager + Meta Ads Manager |
| Orchestrator | Hermes + DeepSeek |

---

## ⚠️ Am's Approval Gates

| Gate | Trigger | Action Required |
|---|---|---|
| **Domain Purchase** | Domain found on Cloudflare | Am pays for domain |
| **Paid Ads** | Organic content performing above threshold | Am approves ad budget |

Everything else runs fully autonomously.

---

## 📊 Content Strategy

**Posting frequency:** Multiple times per day per platform

**Content sources:**
- Download viral TikToks featuring the product (credit original creator in caption)
- AI-generated captions with product link + CTA
- Repurposed content adapted for Instagram Reels + Facebook

**Performance logic:**
- Analytics Agent scores each post (views, likes, shares, saves, link clicks)
- Top-performing video styles get replicated/pushed more
- Underperforming content paused
- When a video hits organic threshold → Ad recommendation sent to Am

**Ad recommendation trigger (configurable):**
- e.g., 50k+ organic views in 48 hours → "This is popping, let's put money on it"

---

## 🎨 Store Branding Rules

- Every store gets a **unique brand identity** — no two stores look the same
- Brand name generated based on product niche (e.g., "GlowKit" for skincare, "FitFlow" for fitness)
- Color palette, logo concept, and theme all auto-generated per store
- Headless frontend connects to Shopify Storefront API for automatic product population
- Deployed to Cloudflare Pages under the new custom domain

---

## 🏗️ Pipeline State Machine

Each product/store is tracked with these stages:

```
DISCOVERED → SOURCING → SOURCED → SHOPIFY_LISTED → STORE_BUILT → 
DOMAIN_PENDING → DOMAIN_APPROVED → DOMAIN_LIVE → SOCIAL_CREATED → 
CONTENT_LIVE → ORGANIC_GROWING → ADS_RECOMMENDED → ADS_APPROVED → 
ADS_RUNNING → SCALING
```

---

## ⚖️ Content Reposting Note

- Always credit original TikTok creator in caption
- Include product link + brand CTA
- Monitor for DMCA or platform flags
- Long term: transition to original AI-generated product content

---

## 📁 Repo Structure

```
hermes-automation-plans/
├── DROPSHIPPING.md            ← This file
├── prompts/
│   ├── discovery-agent.md     ← TikTok trend scanner prompt
│   ├── sourcing-agent.md      ← TeamDrop/Alibaba sourcer prompt
│   ├── shopify-agent.md       ← Shopify product lister prompt
│   ├── brand-agent.md         ← Store brand generator prompt
│   ├── content-agent.md       ← Social content poster prompt
│   └── analytics-agent.md     ← Performance tracker + ad recommender prompt
├── templates/
│   ├── storefront-template.html  ← Headless Shopify frontend base
│   └── ad-recommendation.md      ← Ad recommendation message template
└── docs/
    ├── teamdrop-api.md           ← TeamDrop integration notes
    ├── shopify-api.md            ← Shopify Storefront + Admin API setup
    └── tiktok-instagram-setup.md ← Social account creation + API setup
```

---

## 🚀 Next Steps

- [ ] Set up TikTok scraper / API access for trend discovery
- [ ] Connect TeamDrop API credentials to Hermes
- [ ] Set up Shopify store + get Admin API key
- [ ] Build headless storefront template
- [ ] Set up Cloudflare Registrar API access
- [ ] Create TikTok + Instagram developer accounts for posting API
- [ ] Build content download + scheduler pipeline
- [ ] Configure analytics thresholds for ad recommendations
- [ ] Test full flow end-to-end with one product

---

*Built by Am Muhabuki*
*Cypress/Houston, TX*
