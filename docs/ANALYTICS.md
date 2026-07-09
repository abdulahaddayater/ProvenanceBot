# Analytics & Monitoring

ProvenanceBot uses **PostHog** (when `NEXT_PUBLIC_ANALYTICS_WRITE_KEY` is set) for privacy-friendly product analytics.

## Events tracked

| Event | When |
|-------|------|
| `pageview` | Automatic (PostHog default) |
| `wallet_connected` | User connects Freighter |
| `query_submitted` | User submits a research query |
| `query_complete` | Pipeline returns successfully |
| `chip_click` | User opens a source citation chip |
| `onchain_verify` | User runs on-chain verification |
| `feedback_submitted` | User submits pilot feedback |

## Backend

- **Sentry** (`SENTRY_DSN` in agents) captures unhandled API errors.
- **Structured logs** via Pino in the agents service.

## Dashboards

1. **PostHog:** https://app.posthog.com — create project, paste API key into env.
2. **Sentry:** https://sentry.io — create Node + Next.js projects.
3. **Admin page:** `/admin` — wallet interactions and feedback (dev mode or `ADMIN_API_KEY`).

## Privacy

No PII beyond truncated wallet addresses and query text submitted for provenance. Disable analytics by omitting the PostHog key.
