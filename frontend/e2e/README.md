# Daily Board E2E Notes

Top risks selected from `context/foundation/test-plan.md`:

1. Risk #1: User B can access User A planner or duty through direct endpoint/manual URL even when lists are filtered.
2. Risk #2: Dynamic board/week switching regresses after ownership scoping or filtered loading changes.

Implemented E2E coverage targets Risk #1. It registers isolated users through the real API, creates User A's planner, authenticates User B through Playwright `storageState`/localStorage, checks that User B's rendered planner list does not expose User A data, then verifies direct planner access returns a non-leaking `404`.

Storage state is generated at `playwright/.auth/user.json`. The `playwright/.auth/` directory is ignored by git and must not be committed.

Manual verification commands:

```bash
cd frontend
npm run e2e -- e2e/seed.spec.ts --project=chromium
npm run e2e -- e2e/ownership-boundary.spec.ts --project=chromium
npm run e2e -- --project=chromium
```

These commands start the Angular dev server and a Spring Boot `spring-boot:test-run` backend with H2 through `playwright.config.ts`.
