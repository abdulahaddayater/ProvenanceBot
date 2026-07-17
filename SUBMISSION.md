# Level 4 Submission Checklist

Use this checklist before submitting ProvenanceBot for Green Belt / Level 4 review.

## Repository & Code

- [x] Public GitHub repo: https://github.com/abdulahaddayater/ProvenanceBot
- [x] Monorepo: `/contracts`, `/agents`, `/frontend`, `/docs`
- [x] 15+ meaningful commits (conventional commits)
- [x] CI: lint + test on push (`.github/workflows/ci.yml`)
- [x] ESLint + Prettier across packages

## Smart Contract

- [x] `provenance_log` Soroban contract implemented
- [x] Unit tests (7 passing)
- [x] Deployed to Stellar **testnet**
- [x] Contract ID: `CAB2CE4EYPPZ6WKNVNBR3OM2AQETZFUISXDV2AJATYZTWCTMJ64EHP32`
- [x] Saved in `contracts/testnet-contract-id.txt`

## Backend (`/agents`)

- [x] POST `/api/query` — full Retriever → Notary → Synthesizer → Notary pipeline
- [x] GET `/api/verify/:sourceHash` — archived content + live URL drift check
- [x] GET `/api/health` + GET `/status`
- [x] POST `/api/feedback`
- [x] Admin export routes
- [x] Content archive for source persistence
- [x] Unit tests for hashing and claim mappings
- [x] Integration test against live testnet (`pnpm --filter @provenancebot/agents test:integration`)

## Frontend (`/frontend`)

- [x] Query input + results with citation chips
- [x] Source panel (modal / mobile bottom-sheet)
- [x] On-chain verify badge
- [x] Loading progress + error states
- [x] Mobile-responsive (375px+)
- [x] Trust explainer section
- [x] Feedback widget
- [x] Freighter wallet connect (`hooks/useWallet.tsx`)
- [x] Stellar SDK contract integration module (`lib/stellar.ts` — maps `lib.rs` methods)
- [x] Admin page
- [x] Pilot landing page
- [x] Status page (lists contract methods + integration paths)

## Deployment

- [x] **Live frontend URL** (Vercel): https://provenance-bot-agents-uk4v-iota.vercel.app
- [x] Embedded Next.js `/api/*` (no separate agents URL required for production)
- [x] CD: `.github/workflows/cd.yml` builds frontend + contract wasm; optional Vercel / testnet deploy via secrets
- [ ] End-to-end test on production with `STELLAR_SECRET_KEY` set (on-chain anchoring)

## Evidence (manual actions required)

- [x] Screenshot: product UI (desktop) — `docs/screenshots/desktop-*.png`
- [x] Screenshot: product UI (mobile) — `docs/screenshots/mobile-*.png`
- [x] Screenshot: admin / monitoring page — `docs/screenshots/desktop-admin.png`
- [ ] Screenshot: analytics dashboard (PostHog) — optional if key set
- [ ] Screenshot: monitoring (Sentry) — optional if DSN set
- [x] Demo video — linked in README
- [ ] **10+ unique wallet interactions** — recruit pilot users via `/pilot`
- [ ] User feedback summary — export via `/admin` or `GET /admin/export`

## Documentation

- [x] Root README.md with architecture, setup, contract ID
- [x] `docs/architecture.md`
- [x] `docs/PROVENANCE.md`
- [x] `docs/ANALYTICS.md`
- [x] `docs/DEMO_SCRIPT.md`
- [x] `docs/SMART_CONTRACT_INTEGRATION.md` — contract method ↔ frontend mapping
- [x] `contracts/README.md`
- [x] `CONTRIBUTING.md`
- [x] CD workflow: `.github/workflows/cd.yml` (frontend build + Vercel deploy, contract wasm + testnet deploy)

## Not yet satisfied (requires your action)

1. Set production `STELLAR_SECRET_KEY` on Vercel so wallet queries can anchor on-chain
2. Optional: add GitHub Actions secrets for automated CD (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `STELLAR_SECRET_KEY`)
3. Recruit 10+ pilot testers and collect wallet interaction proof
4. Capture PostHog/Sentry screenshots if those keys are configured
5. Export a user feedback summary from `/admin`
