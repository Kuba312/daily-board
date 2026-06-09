# Manual Smoke: Owned Manual Planning Board

Date: 2026-06-09
Change: `owned-manual-planning-board`
Scope: P-02 auth-scoped manual planning board behavior.

## Preconditions

- Backend is running with the current P-02 branch.
- Frontend is running against that backend.
- Browser storage can be cleared between user/account checks when needed.
- At least two test users can be registered or logged in.

## Checklist

### Auth-Success State Reset

1. Log in or register as User A.
2. Create or load at least one planner and, if available, one duty.
3. Navigate to `/auth` without relying on the logout path.
4. Log in or register as User B.
5. Confirm User A planner and duty data is not visible while User B data loads.

Expected: successful auth clears account-owned planner/duty store state before entering `/planners`.

### Expired Or Invalid Token Cleanup

1. Put the app into a state with a stale/invalid persisted token.
2. Open a protected backend-backed route such as `/planners`.
3. Confirm the app redirects to `/auth`.
4. Confirm protected planner/duty data is not left visible.

Expected: `401` recovery clears auth state, resets planner/duty stores, and routes to `/auth`.

### Cross-User Direct URL Rejection

1. Log in as User A and create a planner.
2. Copy User A planner board URL.
3. Log out and log in as User B.
4. Open User A planner board URL.

Expected: backend rejects access, frontend routes to `/planners`, User A planner title/duties are not displayed, and User B remains logged in.

### Constant Planner Duty Creation

1. Log in as a user with an owned constant planner.
2. Add a manual duty for that planner.
3. Open the constant planner board.

Expected: the new duty appears on the owned planner board and is not visible to another user.

### Dynamic Planner Duty Creation

1. Log in as a user with an owned dynamic planner.
2. In the task form, choose a date and time.
3. Click **Add date** so the date appears as a chip.
4. Submit the form.
5. Confirm the board opens on the saved duty's week and shows the duty.

Expected: dated duty creation succeeds for the owned planner and the board shows the correct week.

### Dynamic Date-Chip Validation

1. Open the task form for a dynamic planner.
2. Type/select a valid date and time.
3. Do not click **Add date**.
4. Submit the form.

Expected: the form does not submit an empty duty payload, the invalid-form snackbar appears, and the typed form values remain available for correction.

### Dynamic Week Switching

1. Open a dynamic planner board with duties on at least one week.
2. Switch to an unloaded week.
3. Switch back to a previously loaded week.

Expected: unloaded ranges fetch once, already loaded ranges do not duplicate fetches, and the visible week remains consistent.

## Result

Latest manual retest passed for:

- owned dynamic planner duties,
- correct-week display after dynamic duty save,
- dynamic week switching,
- per-user dynamic planner/duty visibility.
