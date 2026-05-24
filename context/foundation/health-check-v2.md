---
project: "Daily Board"
created: 2026-05-23
context_type: brownfield
verdict: ready-with-notes
inputs:
  prd: context/foundation/prd.md
  stack_assessment: context/foundation/stack-assessment.md
---

# Health Check — Project Agent-Readiness (v2)

This repository is a multi-project layout (no top-level project marker). Checks are run against:
- `frontend/` (Angular + TypeScript)
- `backend/dailyboard-backend/` (Spring Boot + Maven)

PRD scope context (from `context/foundation/prd.md`): upcoming work touches authentication, per-user ownership, data migration concerns, and must preserve board/week-switching behavior.

## Pre-check (dependencies, lockfiles, security)

### Frontend (`frontend/`)

- Lockfile: `frontend/package-lock.json` present (good).
- Security audit: attempted `npm audit --json` but it could not reach the npm registry (DNS / network restricted in this environment). Additionally, npm reported it couldn’t write logs under `~/.npm/_logs`.
  - Action: run locally (outside this sandbox) in `frontend/`:
    - `npm audit` (or `npm audit --json`)
    - `npm outdated`

### Backend (`backend/dailyboard-backend/`)

- Dependency management: Maven (`backend/dailyboard-backend/pom.xml`) with Spring Boot parent `3.4.0`.
- There is no built-in Maven equivalent of `npm audit` by default.
  - Action (optional, but recommended before release): add OWASP Dependency-Check or enable Snyk/Dependabot for Maven.

## In-check (tests, CI/CD, configuration)

### Test runner detection

- Frontend: Karma/Jasmine via Angular CLI (`frontend/package.json` has `test: ng test`).
- Backend: Spring Boot test + Surefire (`backend/dailyboard-backend/pom.xml` includes `spring-boot-starter-test` and `maven-surefire-plugin`).

Dry-running tests was skipped here because it would require dependency installs/downloads in a network-restricted environment. Recommended commands:
- Frontend: `cd frontend && npm ci && npm test`
- Backend: `cd backend/dailyboard-backend && ./mvnw test`

### CI/CD evaluation

- CI detected: GitHub Actions workflow in `frontend/.github/workflows/ci-cd-pipeline.yml`.
  - Stages present: test ✓, build ✓
  - Stages missing (recommended): lint ✗, type-check ✗ (separate `ng lint` / `tsc -p tsconfig.json` step), backend CI ✗, security scan ✗ (npm audit, Dependabot, CodeQL/Snyk)
- No CI found for `backend/dailyboard-backend/` at repo root (only frontend workflow exists).

### Missing / notable config

- Root `.gitignore`: present (`.gitignore`).
- Root `.editorconfig`: missing (low/medium).
- Frontend lint config: present (`frontend/eslint.config.js`), but CI does not run `npm run lint`.
- Agent instruction file: `AGENTS.md` exists at repo root (good).

## Post-check (ops readiness + deploy shape)

No deploy target is defined in PRD (expected — PRD is product-level). For this stack, pick one of these and codify it in a lightweight “Deployment” doc + CI job:

- **VM/VPS**: Nginx serves Angular build; Spring Boot runs under `systemd`; MySQL local or managed.
- **Docker Compose**: `nginx` (Angular static) + `backend` + `mysql` for repeatable environments; later migrate to managed container runtime.
- **PaaS split**: frontend on static hosting (Netlify/Vercel/Cloudflare Pages), backend on PaaS (Render/Fly.io/etc.), DB as managed MySQL.

Minimum deploy checklist for the PRD scope:
- environment variables documented (`.env.example` equivalents for both frontend and backend)
- DB migration path defined (Flyway is present — ensure baseline/rollback strategy)
- auth/secrets handling defined (password hashing, JWT/session secret, CORS config)

## Prioritized fixes

### Category A (do soon)

1. Add backend CI workflow (build + test at minimum) and run frontend lint in CI.
2. Run dependency/security audits outside the sandbox:
   - `frontend/`: `npm audit`, `npm outdated`
   - `backend/`: choose OWASP Dependency-Check / Snyk / Dependabot

### Category B (nice to have / later infra lesson)

1. Add `.editorconfig`.
2. Add a small `docs/deploy.md` (or equivalent) that records the chosen deploy option and the exact commands.

## Agent-readiness verdict

**ready-with-notes**: the stack is agent-friendly and the project has tests + some CI, but operational hygiene is incomplete (no backend CI, and security audit not runnable in this environment). Addressing the Category A items will materially reduce agent iteration loops and deploy risk.
