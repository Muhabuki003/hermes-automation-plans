# 🤖 Hermes Automation Plans

Full-stack automation pipelines powered by **Hermes AI + GitHub + Cloudflare + Stripe**.

## Plans

| Plan | Description | Status |
|------|-------------|--------|
| [BOOKISTUDIO](BOOKISTUDIO.md) | Client onboarding → site delivery pipeline | 🟡 Ready — infra setup pending |
| [DROPSHPPING](DROPSHIPPING.md) | TBD | 📝 Planning |

## Architecture

Each plan follows the same pattern:

```
[Inbound Trigger] → [Hermes Orchestration] → [Sub-Agent Parallel Pool] → [Approval Gates] → [Auto-Delivery]
```

- **Inbound:** Email, webhook, or scheduled cron
- **Orchestration:** Hermes with DeepSeek reasoning
- **Sub-Agents:** Specialized LLM agents (analyzer, researcher, builder)
- **Approvals:** Manual checkpoints at key decision points
- **Delivery:** Email, deploy, GitHub push, or platform post

## Stack

- **AI:** Hermes Agent + DeepSeek
- **Email:** Microsoft 365 (IMAP/SMTP)
- **Code:** GitHub repos
- **Hosting:** Cloudflare Pages
- **Payments:** Stripe + Cloudflare Workers webhooks
- **State:** Supabase (PostgreSQL + real-time notifications)

---

*Built by Am Muhabuki — Cypress/Houston, TX*
