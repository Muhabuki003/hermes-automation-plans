# Client Intake Form Template

The BOOKISTUDIO client intake form is **already built and deployed** in the [BOOKIWEBSTUDIO](https://github.com/Muhabuki003/BOOKIWEBSTUDIO) repo at `intake/index.html`.

## What It Is

A multi-step, 5-section intake form with:

1. **Business Info** — name, industry, address, hours, social media
2. **Owner / Team** — owner details, team members, business story
3. **Design & Brand** — logo status, color palette picker, vibe selection, reference sites
4. **Site Goals & Features** — primary goal, features checklist, services list, domain
5. **Final Details** — budget (Starter/Standard/Premium/Discuss), timeline, referral, notes

## How It Works

- Submit → inserts into **Supabase** `public.inquiries` table
- Fallback → sends via **Web3Forms API** → email to founder@bookistudios.com
- Queues to localStorage if both fail

## No Changes Needed

This form is production-ready. The intake form template in this automation repo is a **reference** to the real one — don't duplicate it. Hermes reads new submissions from the `public.inquiries` table directly.

## Reference Location

```
https://github.com/Muhabuki003/BOOKIWEBSTUDIO/blob/main/intake/index.html
```
