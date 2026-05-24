# Deploy Plan (MVP) — Railway (Backend + MySQL) + Static Angular Hosting

This checklist prepares the repo for deployment. It does **not** provision or deploy any external resources.

## Guardrails (must follow)

- No platform actions without explicit approval (no Railway project creation, no billing, no DB provisioning, no deploys).
- Keep Java **22** initially and try Railway deployment first.
- Downgrade to Java **21 LTS** only if Railway buildpack/runtime compatibility becomes a blocker.
- No secrets committed to git. Production DB config must be environment-driven.
- No destructive actions (DB drop, project deletion, secret rotation) without explicit approval.

## Expected active services (when you later deploy)

Single Railway project, only these services:

1) `dailyboard-backend` (Spring Boot)
2) `mysql` (Railway MySQL)

Static hosting (separate provider/project):

3) `daily-board-frontend` (static SPA)

## Backend environment variables (Railway service)

Railway sets:

- `PORT`

You set:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `APP_CORS_ALLOWED_ORIGINS` (comma-separated, e.g. `https://<your-frontend-domain>,http://localhost:4200`)

Optional:

- `SPRING_JPA_SHOW_SQL` (default is `true` in this repo config)
- `HIBERNATE_FORMAT_SQL` (default is `true` in this repo config)

## Frontend runtime config (static host)

Update `frontend/src/assets/app-config.json`:

- `apiBaseUrl`: set to the Railway backend public base URL (e.g. `https://<railway-domain>`)

## CORS plan

Default dev CORS origin is `http://localhost:4200`.

For production, set `APP_CORS_ALLOWED_ORIGINS` to include your static hosting domain (and only what you need).

## Java version policy

Try deploying with Java 22 first. If Railway fails specifically due to Java version support, downgrade to Java 21 LTS and redeploy.

