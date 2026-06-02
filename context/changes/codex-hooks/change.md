---
change_id: codex-hooks
title: Project-local Codex hooks
status: implemented
created: 2026-06-02
updated: 2026-06-02
archived_at: null
---

## Notes

Configured project-local Codex hooks in `.codex/hooks.json`.

- `PostToolUse` on `Edit|Write` runs `.codex/hooks/post-edit-validation.py`.
- Frontend edits under `frontend/` run scoped `npm run lint -- --lint-file-patterns <edited-file>` for edited `.ts` and `.html` files. The repo has no `typecheck` npm script, so no script was invented.
- Backend edits under `backend/dailyboard-backend/` run `./mvnw compile`, the lightest useful Maven validation that still compiles Java and annotation processing.
- Full `./mvnw test` is documented rather than forced because the current local run fails before executing tests: compiled test classes require Java 22 bytecode, while the active runtime only supports up to Java 17 bytecode.
- Full `npm run lint` is also not forced per edit because the current baseline has existing lint failures, mostly generated API files and style issues. The hook keeps validation scoped to edited lintable files.

## Verification

- Frontend scoped lint: `cd frontend && npm run lint -- --lint-file-patterns src/app/core/types/sort.types.ts`
- Frontend Angular typecheck option, not wired per edit: `cd frontend && ./node_modules/.bin/ngc -p tsconfig.app.json --noEmit`
- Backend compile: `cd backend/dailyboard-backend && ./mvnw compile`
- Full backend test currently fails with the Java runtime/class-file mismatch described above.
