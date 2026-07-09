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
- [x] Freighter wallet connect
- [x] Admin page
- [x] Pilot landing page
- [x] Status page

## Deployment

- [ ] **Live frontend URL** (Vercel) — _manual: deploy and paste URL_
- [ ] **Live backend URL** (Railway/Render/Fly) — _manual: deploy and set CORS_
- [ ] End-to-end test on production URLs

## Evidence (manual actions required)

- [ ] Screenshot: product UI (desktop)
- [ ] Screenshot: product UI (mobile)
- [ ] Screenshot: analytics dashboard (PostHog)
- [ ] Screenshot: monitoring (Sentry)
- [ ] Screenshot: admin page with wallet interactions
- [ ] Demo video (60–90s) — script in `docs/DEMO_SCRIPT.md`
- [ ] **10+ unique wallet interactions** — recruit pilot users via `/pilot`
- [ ] User feedback summary — export via `/admin` or `GET /admin/export`

## Documentation

- [x] Root README.md with architecture, setup, contract ID
- [x] `docs/architecture.md`
- [x] `docs/PROVENANCE.md`
- [x] `docs/ANALYTICS.md`
- [x] `docs/DEMO_SCRIPT.md`
- [x] `contracts/README.md`
- [x] `CONTRIBUTING.md`

## Not yet satisfied (requires your action)

1. Deploy frontend to Vercel and backend to Railway/Render
2. Set production env vars (`STELLAR_SECRET_KEY`, PostHog key, Sentry DSN)
3. Recruit 10+ pilot testers and collect wallet interaction proof
4. Record demo video
5. Capture 4 screenshots for submission
