# TikTok & Instagram API Setup Guide

Set up API credentials for automated content posting to TikTok and Instagram.

---

# Part A: TikTok API

## 1. Create a TikTok Developer App

1. Go to [developers.tiktok.com](https://developers.tiktok.com)
2. Click **Create App** (log in with your TikTok account if prompted)
3. Fill in the app details:

   | Field | Value |
   |-------|-------|
   | **App Name** | `Hermes Content Publisher` |
   | **App Description** | Automated video content scheduling |
   | **Platform** | Web |
   | **Redirect URI** | `https://bukimind-office.pages.dev/tiktok-callback` |

4. Click **Create**

## 2. Configure Permissions

1. In your app dashboard, go to **Permissions**
2. Enable these permissions:
   - ✅ **Video.Upload** — upload and post videos
   - ✅ **User.Info** — read basic user profile info
   - ✅ **Video.List** — list uploaded videos (for verification)

3. Click **Save**

## 3. Get Your Credentials

From the app dashboard's **Basic Info** tab, copy:

| Credential | Description | Example |
|------------|-------------|---------|
| **Client Key** | App identifier | `aw7e...` |
| **Client Secret** | App authentication secret | `d9f3...` |

> ⚠️ Client Secret is shown only once after creation. Store it securely.

---

## 4. TikTok OAuth Flow

### Step 1: Get Authorization Code

Open this URL in a browser to prompt the user to authorize:

```
https://www.tiktok.com/v2/auth/authorize?client_key={CLIENT_KEY}&scope=user.info.basic,video.upload,video.list&response_type=code&redirect_uri=https://bukimind-office.pages.dev/tiktok-callback&state={STATE}
```

Replace:
- `{CLIENT_KEY}` — your app's Client Key
- `{STATE}` — a random string for CSRF protection (e.g. a UUID)

The user logs in, authorizes the app, and TikTok redirects to:
```
https://bukimind-office.pages.dev/tiktok-callback?code={AUTH_CODE}&state={STATE}
```

### Step 2: Exchange Code for Access Token

```bash
curl -X POST "https://open.tiktokapis.com/v2/oauth/token/" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_key={CLIENT_KEY}" \
  -d "client_secret={CLIENT_SECRET}" \
  -d "code={AUTH_CODE}" \
  -d "grant_type=authorization_code" \
  -d "redirect_uri=https://bukimind-office.pages.dev/tiktok-callback"
```

**Response:**
```json
{
  "access_token": "clt.exampletoken...",
  "expires_in": 86400,
  "refresh_token": "rft.example...",
  "open_id": "...",
  "token_type": "Bearer"
}
```

### Step 3: Refresh Token (When Expired)

Access tokens expire in 24 hours. Use the refresh token to get a new one:

```bash
curl -X POST "https://open.tiktokapis.com/v2/oauth/token/" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_key={CLIENT_KEY}" \
  -d "client_secret={CLIENT_SECRET}" \
  -d "grant_type=refresh_token" \
  -d "refresh_token={REFRESH_TOKEN}"
```

---

## 5. TikTok API — Upload Video

```bash
# Step 1: Initialize upload
curl -X POST "https://open.tiktokapis.com/v2/video/upload/init/" \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "source_info": {
      "source": "FILE_UPLOAD",
      "video_size": 5242880,
      "chunk_size": 1048576,
      "total_chunk_count": 5
    }
  }'

# Response includes an upload_url — use that to upload video chunks
# (See TikTok docs for full chunked upload workflow)
```

---

## 6. Credentials Storage

Store the following for your automation:

```json
{
  "tiktok": {
    "client_key": "aw7e...",
    "client_secret": "d9f3...",
    "access_token": "clt.exampletoken...",
    "refresh_token": "rft.example...",
    "open_id": "...",
    "expires_at": "2025-07-05T12:00:00Z"
  }
}
```

---

# Part B: Instagram Graph API

## 1. Prerequisites

You need these before starting:

- ✅ **Facebook Business Page** — create at [facebook.com/business](https://facebook.com/business)
- ✅ **Instagram Professional Account** — convert your personal IG to a Business or Creator account at Settings → Account → Switch to Professional
- ✅ **Facebook Page connected to Instagram** — Go to Instagram settings → Linked Accounts → Facebook

---

## 2. Create a Facebook App

1. Go to [developers.facebook.com](https://developers.facebook.com) and log in
2. Click **Create App**
3. Choose **Business** as the app type
4. Fill in:

   | Field | Value |
   |-------|-------|
   | **App Name** | `Hermes Social Publisher` |
   | **Contact Email** | your email |
   | **Business Account** | Select or create a business account |

5. Click **Create App ID**

---

## 3. Add Instagram Graph API Product

1. In your app dashboard, go to **Add Products**
2. Find **Instagram Graph API** and click **Set Up**
3. Go to **Instagram Graph API** → **Basic Display** or **Manage** section

### Required Permissions

Go to **App Review** → **Permissions and Features** and request these:

| Permission | Purpose |
|------------|---------|
| `instagram_basic` | Read IG profile info |
| `instagram_content_publish` | Post photos, videos, carousels |
| `pages_manage_posts` | Post to Facebook Page |
| `pages_read_engagement` | Read Page insights |

These require **App Review** approval for production use. For development, you can use your app in Development Mode with test users.

---

## 4. Get a Page Access Token

### Step 1: Generate Token via Graph API Explorer

1. Go to [developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer)
2. Select your app
3. Select **User Token** (or **Page Token**)
4. Add permissions: `instagram_basic`, `instagram_content_publish`, `pages_manage_posts`
5. Click **Generate Access Token**
6. Log in as the Facebook Page admin and authorize

### Step 2: Exchange for a Long-Lived Page Token (60 days)

```bash
# Exchange short-lived user token for long-lived
curl -X GET "https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&client_id={APP_ID}&client_secret={APP_SECRET}&fb_exchange_token={SHORT_LIVED_TOKEN}"
```

### Step 3: Get Your Instagram Business Account ID

```bash
# Get Instagram Business Account ID
curl -X GET "https://graph.facebook.com/v20.0/me/accounts?access_token={PAGE_ACCESS_TOKEN}"
# Find your page, then:
curl -X GET "https://graph.facebook.com/v20.0/{PAGE_ID}?fields=instagram_business_account&access_token={PAGE_ACCESS_TOKEN}"
```

The response will contain your `instagram_business_account` ID.

---

## 5. Instagram — Post Media

### Post a Single Image

```bash
# Step 1: Create media container
curl -X POST "https://graph.facebook.com/v20.0/{IG_USER_ID}/media" \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://example.com/photo.jpg",
    "caption": "Check out our new product! #launch",
    "access_token": "{PAGE_ACCESS_TOKEN}"
  }'

# Response: { "id": "17898765432109876" }

# Step 2: Publish the container
curl -X POST "https://graph.facebook.com/v20.0/{IG_USER_ID}/media_publish" \
  -H "Content-Type: application/json" \
  -d '{
    "creation_id": "17898765432109876",
    "access_token": "{PAGE_ACCESS_TOKEN}"
  }'
```

### Post a Video

```bash
curl -X POST "https://graph.facebook.com/v20.0/{IG_USER_ID}/media" \
  -H "Content-Type: application/json" \
  -d '{
    "media_type": "VIDEO",
    "video_url": "https://example.com/video.mp4",
    "caption": "New video drop!",
    "access_token": "{PAGE_ACCESS_TOKEN}"
  }'
```

### Post a Carousel (Multiple Images)

```bash
# Step 1: Create individual image containers with is_carousel_item=true
# Step 2: Create carousel container referencing the children
curl -X POST "https://graph.facebook.com/v20.0/{IG_USER_ID}/media" \
  -H "Content-Type: application/json" \
  -d '{
    "media_type": "CAROUSEL",
    "children": ["{child_container_id_1}", "{child_container_id_2}", "{child_container_id_3}"],
    "caption": "Check out our collection!",
    "access_token": "{PAGE_ACCESS_TOKEN}"
  }'

# Step 3: Publish the carousel container
```

---

## 6. Credentials Summary

| Item | Where to Find |
|------|---------------|
| **Facebook App ID** | developers.facebook.com → My Apps → [App Name] → Dashboard |
| **Facebook App Secret** | Same dashboard → Show |
| **Page Access Token** | Graph API Explorer or long-lived exchange |
| **Instagram Business Account ID** | Graph API query on your Page |
| **Long-lived token expiry** | 60 days (refresh before expiry) |

---

## 7. Notes & Best Practices

- **TikTok:** Access tokens expire in 24 hours. You must have a refresh flow in your automation.
- **TikTok video restrictions:** Max 10 min, 500 MB, MP4/AVI/MOV format. Rate limit: 200 uploads/day per user.
- **Instagram:** Media URLs must be publicly accessible (no localhost, no auth-protected URLs).
- **Instagram rate limits:** 200 API calls per hour per user. 25 media posts per day per account.
- **App Review:** Both TikTok and Facebook require app review for production use. For testing, add test users in the developer dashboards.
- **Webhook fallback:** Set up Facebook Webhooks for Instagram to receive content publish confirmations.
