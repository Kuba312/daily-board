---
project: "Daily Board"
researched_at: "2026-05-24"
recommended_platform: "Railway backend + Railway MySQL + static Angular hosting"
runner_up: "Free-first fallback: static hosting + Render free backend + Aiven MySQL free"
decision_reason: "Prefer ~$5/month pragmatic simplicity over free-tier friction for MVP"
context_type: mvp
tech_stack:
  language:
    frontend: "TypeScript"
    backend: "Java"
  framework:
    frontend: "Angular 21"
    backend: "Spring Boot 3.4"
  runtime:
    frontend: "Node.js (build-time)"
    backend: "JVM (repo currently targets Java 22)"
  database: "MySQL 8"
---

## Recommendation

You have two viable MVP paths:

- **Recommended pragmatic paid path (simple + co-located):** **Railway backend + Railway MySQL + static Angular hosting.**
- **Free-first fallback (if you must go $0):** Angular static hosting + Render free backend (Docker) + free managed MySQL (Aiven) or MySQL-compatible DB (TiDB Cloud).

Both are agent-operable, but the $0 path has real reliability/limit tradeoffs that you should decide on consciously.

## Recommended pragmatic paid path (simple + co-located)

**Railway backend + Railway MySQL + static Angular hosting.**

This is the simplest “it just works” option for your current architecture: Spring Boot deploy is documented, and adding MySQL via a template is straightforward. `https://docs.railway.com/guides/spring-boot` and `https://docs.railway.com/databases/mysql`

It’s not $0: Railway’s Hobby plan is **$5/month minimum** (includes $5 usage credit) and requires a post-paid card. `https://docs.railway.com/pricing/plans`

## Free-first option (aiming for $0 MVP)

### 1) Angular frontend (static) — Cloudflare Pages / Vercel / Netlify

All three can host an Angular build output as a static site on a free plan. Pick based on “free tier clarity” and ergonomics:

- **Cloudflare Pages (Free):** clear limits like 500 builds/month on Free. `https://developers.cloudflare.com/pages/platform/limits/`
- **Vercel Hobby (Free):** polished DX; static files aren’t classed as a build. `https://vercel.com/docs/accounts/plans/hobby`
- **Netlify Free:** free plan exists, but it’s credit/usage-based and can pause sites when limits are hit. `https://www.netlify.com/pricing/`

### 2) Spring Boot backend — Render free web service (with cold starts)

Render free web services spin down after 15 minutes of no inbound traffic and cold-start on the next request (often ~1 minute). This is usually acceptable for a hobby MVP, but it makes the first API call after idle feel broken/slow. `https://render.com/docs/free`

Important for this repo: Render’s **native runtimes do not include Java**, so the backend must be deployed as a **Docker** service (you’ll need a `Dockerfile`). `https://render.com/docs/native-runtimes`

### 3) MySQL options (ranked for “$0 + simplicity”)

#### A) Aiven for MySQL free tier (recommended free DB)

Aiven documents a free MySQL tier with no credit card and no time limit, including backups, but with small resource limits (single node, 1 GB RAM, 1 GB disk) and no SLA. They also reserve the right to power off services that are unused “for some time” (with notification). `https://aiven.io/docs/products/mysql/concepts/mysql-free-tier`

This is the cleanest “real MySQL” free option for your stack, as long as 1 GB storage is enough for MVP.

#### B) TiDB Cloud free tier (MySQL-compatible, but not MySQL)

TiDB is highly compatible with the MySQL protocol and many MySQL 5.7/8.0 features, but it has explicitly unsupported MySQL features (for example stored procedures/functions, triggers, events, and more). If your application (or Flyway migrations) relies on unsupported features, it will break. `https://docs.pingcap.com/tidbcloud/mysql-compatibility/`

#### C) Render self-hosted MySQL (last resort)

Render’s “Deploy MySQL” path is effectively self-hosting MySQL as your own private service with a persistent disk. That increases ops burden (tuning, backups discipline, upgrades), so it’s a last resort for a free-first setup. `https://render.com/docs/deploy-mysql`

## Platform Comparison

Scoring uses the five criteria in `.agents/skills/10x-infra-research/references/agent-friendly-criteria.md` (CLI-first, managed/serverless, agent-readable docs, stable deploy API, MCP/integration), with weights tilted toward cost and simplicity for MVP.

Hard filters applied from your interview answers:
- Persistent connections: **not required**, so serverless-only platforms are not disqualified.
- Stack constraint: you need to run a **JVM backend + MySQL**; “static-site-only” platforms can’t host the backend.

| Platform | CLI-first | Managed / serverless | Agent-readable docs | Stable deploy API | MCP / integration | Total |
|---|---|---|---|---|---|---|
| **Railway** | Pass | Pass | Pass | Pass | Partial | **4P + 1Partial** |
| **Render (Docker for Java)** | Partial | Pass | Pass | Pass | Pass | **4P + 1Partial** |
| **Fly.io** | Pass | Partial | Pass | Pass | Partial | **3P + 2Partial** |
| Cloudflare Pages/Workers | Pass | Pass | Pass | Pass | Pass | Dropped (can’t host JVM + MySQL as-is) |
| Vercel / Netlify | Pass | Pass | Pass | Pass | Pass | Dropped (not a fit for JVM + MySQL backend for this repo) |

### Shortlisted Platforms

#### 1) Free-first stack: Static hosting + Render (free) + Aiven MySQL (free)

- **Why it fits your “free/near-free” constraint:** frontend can be $0, backend can be $0 (with cold starts), and the DB can be $0 (with small limits).
- **Main drawbacks:** cold starts and free-tier limit/policy risk; Java requires Docker on Render; external DB calls can be a reliability risk if you hit free-tier restrictions.

#### 2) Railway (Recommended pragmatic paid path)

- **Why it wins for this MVP:** you can deploy Spring Boot directly from GitHub or via CLI, and add a MySQL service from Railway’s templates; Railway documents both flows.
- **Cost reality:** this is typically the “cheapest simple” option for co-located app + DB, but it is not $0: Hobby is $5/month minimum, plus usage, and requires a post-paid card.

#### 3) Fly.io

- **Why it’s here:** strong CLI, strong docs, and it runs Docker well in Europe regions.
- **Why it’s not the free-first answer:** Fly.io documents that it has **no free tier**, and it tends to be “very cheap if careful” rather than “clean $0”.

## Direct answers (what you asked explicitly)

- **Is there a realistic $0 MVP path for this stack?** Yes, but it’s not “clean”: static frontend + Render free backend (Docker) + Aiven free MySQL (or TiDB Cloud after compatibility verification) can work, but you must accept cold starts and free-tier policy/limits risk.
- **What are the exact tradeoffs versus Railway?** $0 path has idle spin-down/cold starts, more moving parts (external DB), and more risk of suspensions/limits; Railway costs money but reduces moving parts, keeps app+DB co-located, and is typically smoother for iterative development.
- **If $0 is not clean/reliable, what is the cheapest pragmatic path?** Railway Hobby (plan minimum) with backend + MySQL in one place, plus free static hosting for the frontend.
- **What changes are needed in the repo before deploy?**
  - **Java version:** keep **Java 22** initially and try deploying to Railway first; downgrade to **Java 21 LTS** only if Railway’s build/runtime compatibility becomes a real blocker.
  - **Remove plaintext DB credentials:** delete the hardcoded `spring.datasource.username/password` from `backend/dailyboard-backend/src/main/resources/application.yml` and read DB config from environment variables (platform secrets) instead.
  - **Split config by environment:** keep local dev DB settings in a local-only override (not committed), keep production config fully env-driven.

## Anti-Bias Cross-Check: Free-first (Render + external DB) vs Railway

### Devil’s Advocate — Weaknesses

1) **$0 is achievable, but “always-on” is not.** Render free web services spin down on idle and cold-start; the first request after idle will be slow.
2) **External DB increases fragility.** Render notes it may suspend a free service that initiates an “uncommonly high volume” of public internet traffic, and lists external DB access as an example. That’s a risk if your backend talks to an external DB heavily. `https://render.com/docs/free`
3) **Java on Render requires Docker.** You’ll need a correct Dockerfile + port/health-check setup; misconfigurations are a common first-deploy failure.
4) **Free DB tiers have constraints and policy risk.** Aiven free MySQL is small (1 GB disk) and can be powered off if unused; TiDB is compatible but not identical to MySQL and has unsupported features.
5) **Railway is not free, but it reduces moving parts.** Paying $5+ monthly is often cheaper than days spent debugging free-tier edge cases.

### Pre-Mortem — How This Could Fail

Six months later, the team regrets Railway—not because it couldn’t run the app, but because they treated “$5/month” as the whole story. They deployed the Spring Boot backend as-is (Java 22) and spent days chasing buildpack/runtime edge cases that would’ve disappeared by pinning to Java 21. They provisioned MySQL but didn’t validate restores; a bad migration or accidental data loss turned into a scramble with incomplete backups. As the app grew, usage-based billing became unpredictable: memory overhead from the JVM and DB crept up, and egress spikes during debugging or data export pushed costs beyond what felt “MVP cheap”. Meanwhile, secrets and connection strings drifted across environments, and early shortcuts (like plaintext credentials in config) made it harder to tighten security when auth and per-user data arrived. The platform choice wasn’t wrong—but the team underestimated the operational discipline they’d still need for databases, Java versioning, and cost controls.

### Unknown Unknowns

- Render free tier spin-down is not just “slower”: it changes behavior of time-sensitive flows (OAuth callbacks, email verification links, etc.).
- Aiven free MySQL is real MySQL with backups, but it’s **1 GB disk** and not SLA-backed; it can be powered off if unused.
- TiDB Cloud can be “MySQL-compatible enough”, but it explicitly has unsupported MySQL features (for example triggers and stored procedures/functions).
- Railway’s Spring Boot guide examples target Java 17; your repo targets Java 22, which is a likely friction point.

## Operational Story

- **Preview deploys**: Use Railway “Deploy from GitHub repo” per environment for preview/staging, and keep production as a separate environment/service; Railway provides real-time deploy logs and a generated domain per service.
- **Secrets**: Store backend secrets as Railway environment variables; never commit DB creds. Keep frontend config as build-time environment or runtime config endpoint.
- **Rollback**: Roll back by redeploying a previous Railway deploy (or pinning to a previous commit) and treat DB migrations as forward-only unless you have an explicit rollback plan.
- **Approval**: Human-only: destructive DB actions (drop/reset), secret rotation for primary credentials, and production DB restores. Agent-allowed: deploys, log inspection, and non-destructive config changes.
- **Logs**: Prefer CLI / platform log streams for runtime logs; keep structured app logs in Spring Boot to make tailing useful.

## Risk Register

| Risk | Source lens | Why it matters | Mitigation (MVP) |
|---|---|---|---|
| $0 path has cold starts and limit edge cases | Devil’s advocate / Research finding | UX + reliability hit | If choosing free-first: add a warm-up ping, handle timeouts gracefully, and accept occasional downtime; otherwise pay for always-on |
| Free-first backend may be suspended due to outbound traffic patterns | Devil’s advocate / Research finding | External DB calls can trigger free-tier enforcement | Prefer co-located paid path, or reduce outbound DB chatter (caching, batching) and monitor usage |
| Hobby plan isn’t $0 and requires a post-paid card | Devil’s advocate / Research finding | Breaks “free-first” expectations | Accept $5/month minimum as MVP infra budget, or choose a $0-but-limited stack (Render free compute + non-MySQL DB tradeoffs) |
| Java 22 runtime mismatch on PaaS defaults | Devil’s advocate / Unknown unknowns | Deploy/build friction and wasted time | Try deploying with **Java 22** first; downgrade to **Java 21 LTS** only if deployment compatibility becomes a blocker |
| No tested DB restore path | Devil’s advocate | Data loss is the fastest way to lose trust | Enable automated backups (or manual `mysqldump`), and do one real restore drill early |
| External DB connections add cost + complexity | Unknown unknowns / Research finding | Hidden cost + fragility | Keep app+DB co-located when paid; on free-first, keep DB simple and measure latency early |
| Secrets/config drift and accidental credential leaks | Devil’s advocate | Auth + per-user ownership raises stakes | Move all secrets to platform env vars; remove plaintext passwords from repo; add guardrails in review/CI if possible |

## Getting Started (MVP)

### Cheapest realistic $0-ish path

1) Frontend: deploy Angular to Cloudflare Pages / Vercel / Netlify free static hosting.
2) Backend: deploy Spring Boot to Render free web service **using Docker**.
3) DB: start with Aiven free MySQL (preferred “real MySQL” free option). If blocked, evaluate TiDB Cloud free tier with a compatibility check. Avoid self-hosting MySQL on Render unless forced.

### Cheapest pragmatic “works reliably” path

1) Backend: Railway deploy from GitHub (or CLI).
2) DB: Railway MySQL template in the same project.
3) Frontend: static hosting pointing at the backend.

## Shutdown / cancellation

If the MVP is abandoned and you want to stop all costs:

- **Export DB data first (if needed):** dump the database (and keep it somewhere safe) before deleting the MySQL service.
- **Cancel Railway plan:** Billing → Active Plan → Cancel Plan.
- **Verify everything is stopped:** ensure all services are stopped and no new deployments are running.
- **Delete the Railway project:** only after you’ve exported data you care about and confirmed you won’t need the environments.

## References (checked 2026-05-24)

- Cloudflare Pages limits (Free plan): `https://developers.cloudflare.com/pages/platform/limits/`
- Vercel Hobby plan (Free): `https://vercel.com/docs/accounts/plans/hobby`
- Netlify pricing / Free plan: `https://www.netlify.com/pricing/`
- Render free tier behavior/limits (spin-down, suspension conditions): `https://render.com/docs/free`
- Render native runtimes (no Java native runtime): `https://render.com/docs/native-runtimes`
- Render “Deploy MySQL” (self-hosted MySQL as a private service + disk): `https://render.com/docs/deploy-mysql`
- Railway Spring Boot deploy guide: `https://docs.railway.com/guides/spring-boot`
- Railway MySQL template docs: `https://docs.railway.com/databases/mysql`
- Railway plan/pricing notes (Hobby is $5/month minimum, post-paid card required): `https://docs.railway.com/pricing/plans`
- Aiven for MySQL free tier (limits + backups + policy notes): `https://aiven.io/docs/products/mysql/concepts/mysql-free-tier`
- TiDB Cloud MySQL compatibility and unsupported features: `https://docs.pingcap.com/tidbcloud/mysql-compatibility/`

## Out of Scope

- Dockerfile authoring and optimization
- CI/CD pipelines and multi-environment promotion workflows
- Production-scale architecture (multi-region HA/DR, advanced observability)
