# Manual Smoke: Minimal Account-Owned Planner

## Preconditions

- Backend is running with the Phase 1 and Phase 2 auth/ownership changes.
- Frontend is running against that backend.
- Browser storage can be cleared before starting if stale auth state exists.

## Flow

1. Open the frontend and navigate to `/planners`.
2. Confirm the app redirects to `/auth`.
3. Register User A with a unique email.
4. Confirm User A lands on `/planners`.
5. Create a planner with a name that clearly identifies User A.
6. Use the side menu logout action.
7. Register or log in as User B with a different email.
8. Confirm User B does not see User A's planner.
9. Use the side menu logout action.
10. Log back in as User A.
11. Confirm User A sees the planner created earlier.
12. Open User A's planner and confirm the planner route renders.
13. If the planner has duties, confirm dynamic week switching still behaves as before.

## Result

Completed on 2026-05-26.

- Logged-out `/planners` redirects to `/auth`.
- Registration works.
- Login works.
- User A can create a planner and sees their own planner.
- Logout works and clears planner-route access.
- User B can register or log in in the same browser.
- User B does not see User A's planner.
- After logging back in as User A, User A sees the created planner.
- Existing planner route renders.
- Week switching was checked and is not visibly regressed.
- UI roughness is accepted as out of scope for this change.
