# Contributing to ProvenanceBot

Thanks for helping build a verifiable content-sourcing agent on Stellar/Soroban.

## Commit message convention

We use [Conventional Commits](https://www.conventionalcommits.org/). Every commit message starts with a type prefix:

| Prefix   | When to use                                 |
| -------- | ------------------------------------------- |
| `feat:`  | A new user-facing capability or API surface |
| `fix:`   | A bug fix                                   |
| `docs:`  | Documentation only                          |
| `chore:` | Tooling, scaffolding, deps, CI, formatting  |

Examples:

```
feat: add Retriever source fetch stub
fix: correct Soroban RPC env default on testnet
docs: document hash-linking in PROVENANCE.md
chore: add pnpm workspace and root lint scripts
```

### Atomic commits

Prefer **small, meaningful commits** over large dumps. Aim for one logical change per commit so the history stays reviewable. This project targets **15+ meaningful commits** by the time core features land — commit as you build, not only at the end.

Optional scope is allowed: `feat(agents):`, `chore(ci):`, `docs(architecture):`.

## Development setup

See the root [README.md](./README.md) for package-specific setup (`contracts`, `agents`, `frontend`).

```bash
pnpm install
pnpm lint
pnpm test
```

## Pull requests

1. Branch from `main`.
2. Keep commits conventional and focused.
3. Ensure CI (lint + test) passes.
4. Describe what changed and how to verify it.

## Code style

- ESLint + Prettier are configured at the repo root; run `pnpm format` before pushing if you touched JS/TS/Markdown.
- Do not commit `.env` files or secrets — use `.env.example` as the template.
