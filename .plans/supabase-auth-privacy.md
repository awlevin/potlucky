# Supabase Auth & Address Privacy

## Overview

Today, any potluck's address is publicly readable by anyone with the share
link — and leaked further through the OpenGraph image rendered in every
social preview. There is no authentication system: identity is a name in
`localStorage`, and the Firestore `NEXT_PUBLIC_FIREBASE_API_KEY` makes the
database effectively open. This plan fixes that by migrating data +
auth to Supabase, adding real sign-in, and gating the address behind room
membership.

### Why Supabase now, not later

The user has plans to switch to Supabase and no data needs to be migrated.
Given the security goal, a "Firestore + abstraction layer for a future
Supabase swap" path is the wrong trade: the public Firestore API key makes
the browser an untrusted writer, so any `location` privacy would depend on
Firestore Security Rules authored for a system we're about to throw away.
Every hour spent hardening Firestore is hours spent on code that gets
deleted. Supabase ships auth and row-level-security that solve exactly this
problem.

Tradeoff accepted: this plan is ~18 PRs and rewrites the data layer. If
that's too much at once, the emergency hotfix (PR 1) can ship in hours and
the rest of the migration can pause.

### UX target

- **Public, unauthenticated**: room name, date, dish list, host byline,
  share page. Anyone with the link sees the menu board and can view the
  room's existence. This keeps the link-share flow frictionless.
- **Signed-in only**: viewing the address, claiming/unclaiming a dish,
  adding a dish, editing room metadata, creating a new potluck.
- **Sign-in mechanism**: Supabase magic-link (email). No passwords. The
  signed-in user still picks a display name per-room; the email is the
  durable identity, the display name is the social one.
- **OpenGraph image**: drops `location` entirely. OG crawlers can't auth —
  anything in the OG card is public by design.

### Architecture at a glance

```
Browser (Next.js client)
  │
  ├── useRoom(id)           ── Supabase client (realtime subscription)
  ├── useAuth()             ── Supabase auth helpers (cookie-backed)
  └── mutations/*           ── Server Actions  ──►  Supabase server client
                                                      │
                                                      ▼
                                                   Postgres + RLS
```

- Reads: client subscribes via Supabase Realtime using the user's JWT. RLS
  decides whether `location` comes back with the row.
- Mutations: only via Next.js Server Actions using the server-side Supabase
  client bound to the user's session. No direct writes from the browser.
- OG image (Edge): uses a public, read-only Supabase anon client and
  selects only non-sensitive columns.

### Data model (Supabase / Postgres)

```
rooms
  id text primary key                    -- e.g. "pumpkin-pleasant-9x2Qk"
  name text not null
  date text null
  location text null                     -- private; RLS-gated
  created_by uuid not null references auth.users
  created_at timestamptz default now()
  closed_at timestamptz null             -- reserved for future host "close menu"

room_members
  room_id text references rooms on delete cascade
  user_id uuid references auth.users on delete cascade
  display_name text not null
  color text not null
  is_host boolean default false
  dietary_restrictions jsonb default '[]'::jsonb
  dietary_note text null
  joined_at timestamptz default now()
  last_active timestamptz default now()
  primary key (room_id, user_id)

foods
  id uuid primary key default gen_random_uuid()
  room_id text references rooms on delete cascade
  title text not null
  notes text null
  type text null check (type in ('appetizer','main','side','dessert','drink'))
  attributes jsonb default '[]'::jsonb
  claimed_by uuid null references auth.users  -- single-claimer v1
  created_by uuid not null references auth.users
  created_at timestamptz default now()
```

Notes:
- `room_members.is_host` replaces `hostIds[]`. First member sets it true
  (matching today's "first joiner becomes host" behavior).
- `foods.claimed_by` is `uuid | null` — the current code allows string or
  string[] but the UI only ever sets a single claimer. The plan simplifies
  to single-claimer; if multi-claim re-emerges, add a `food_claims` join
  table.
- No photos / gallery fields yet — out of scope here. Future Supabase
  Storage buckets can be added orthogonally.

### RLS policy summary

- `rooms.select` where room is public **minus the `location` column** — OR
  the requester is a member of the room (then location is included via a
  view; see PR 6).
- `rooms.insert` where `created_by = auth.uid()`.
- `rooms.update` where the requester is a host member (`is_host = true`).
- `room_members.select` public (display name/color are fine to expose).
- `room_members.insert/update` where `user_id = auth.uid()`.
- `foods.select` public.
- `foods.insert/update/delete` where requester is a member of the room.

Address privacy is enforced via a split: a public view `rooms_public` that
omits `location`, and the full `rooms` row gated to members.

---

## PR 1: Hotfix — remove location from OG image
### Depends on
None

### Branch
supabase-auth/pr-1-og-no-location

### Title
fix(security): remove location from OpenGraph image

### Files
- `app/potlucks/[roomId]/opengraph-image.tsx`

### Implementation steps
1. In `app/potlucks/[roomId]/opengraph-image.tsx`, delete the location
   branch around lines 145–149 (the top-right "📍 [location]" block) and
   the upstream variable read on line 47. Retain everything else (title,
   host byline, date).
2. Verify no other call sites reference the removed variable. Run the
   linter.
3. Manually render the OG route in dev (`/potlucks/<id>/opengraph-image`)
   for a room that has a location set, and confirm the location is gone
   and the layout still composes. Screenshot it.

### Acceptance criteria
- The OG image for any room never renders the `location` string, even when
  the room has one set.
- Visual regression: screenshot before vs after captured and attached in
  the PR description.
- No unused import / dead variable in the file.

---

## PR 2: Add Supabase client + env scaffolding
### Depends on
None

### Branch
supabase-auth/pr-2-supabase-deps

### Title
feat: add Supabase client libraries and env scaffolding

### Files
- `package.json`
- `yarn.lock`
- `.env.example`
- `src/lib/supabase/client.ts` (new)
- `src/lib/supabase/server.ts` (new)
- `src/lib/supabase/middleware.ts` (new)
- `src/lib/supabase/types.ts` (new, empty `Database` interface placeholder)

### Implementation steps
1. `yarn add @supabase/supabase-js @supabase/ssr`.
2. Add three env keys to `.env.example` with comments:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only, for privileged ops like OG
     fetches; treated as secret)
3. Create `src/lib/supabase/client.ts` exporting `createBrowserSupabase()`
   using `createBrowserClient` from `@supabase/ssr` — reads the public
   env vars.
4. Create `src/lib/supabase/server.ts` exporting `createServerSupabase()`
   using `createServerClient` from `@supabase/ssr` — wires up Next.js
   cookies via `cookies()` from `next/headers`. Add a separate
   `createServiceSupabase()` using the service role key for trusted
   server-only paths (OG image).
5. Create `src/lib/supabase/middleware.ts` exporting
   `updateSupabaseSession(req)` that refreshes the auth cookie on every
   request — called from `middleware.ts` (added in PR 8).
6. Create `src/lib/supabase/types.ts` with an empty `Database` interface
   stub. Real types regenerated after schema PR lands.
7. Add a placeholder `supabase` folder at repo root with a `.gitkeep` so
   later migrations have somewhere to live.

### Acceptance criteria
- `yarn build` compiles with no type errors.
- `yarn dev` boots with no missing-env warnings when the new vars are
  present (tolerant of them being absent in local dev — log a single
  warning only).
- The three `createXSupabase()` factories are exported but no caller
  imports them yet (wired up in later PRs).
- README or `.env.example` documents how to provision the Supabase project
  (link to Supabase docs; no secrets committed).

---

## PR 3: Define Supabase SQL schema (no RLS yet)
### Depends on
None

### Branch
supabase-auth/pr-3-sql-schema

### Title
feat: add Supabase SQL schema for rooms, members, foods

### Files
- `supabase/migrations/0001_core_schema.sql` (new)
- `supabase/README.md` (new)

### Implementation steps
1. Write `0001_core_schema.sql` creating the three tables (`rooms`,
   `room_members`, `foods`) per the data model in the Overview. Use
   `create table if not exists` for idempotence.
2. Add indices: `room_members(room_id)`, `foods(room_id)`,
   `foods(claimed_by)`.
3. Add a `set_updated_at` trigger on `rooms` (cheap; useful later).
4. In `supabase/README.md`, document:
   - How to apply migrations (`supabase db push` via the Supabase CLI or
     run SQL manually in the dashboard).
   - That this project does not migrate old Firestore data — existing
     Firestore room URLs stop working after the cutover.
5. Do NOT enable RLS in this PR. RLS lands in PR 6 — leaving it off here
   keeps the migration testable in isolation.

### Acceptance criteria
- The SQL file applies cleanly to an empty Supabase project (manually
  verified once and documented).
- No Next.js app code changes — pure migration + docs.
- Schema matches the Overview's data model exactly; any deviation is
  called out in the PR description.

---

## PR 4: Define data-access-layer interface (types only)
### Depends on
None

### Branch
supabase-auth/pr-4-dal-interface

### Title
feat: define data-access-layer interface

### Files
- `src/lib/data/types.ts` (new)
- `src/lib/data/repository.ts` (new)
- `src/lib/data/index.ts` (new)

### Implementation steps
1. In `src/lib/data/types.ts`, define domain types that mirror the
   Supabase schema but stay decoupled from it: `Room`, `RoomMember`,
   `Food`. Mark `Room.location` as `string | null` with a JSDoc comment
   that it is **only populated for members**.
2. In `src/lib/data/repository.ts`, define a `RoomRepository` interface
   with methods:
   - `getRoom(id): Promise<Room | null>` — public view; no location.
   - `getRoomWithLocation(id): Promise<Room | null>` — member-only.
   - `createRoom(input): Promise<Room>`
   - `updateRoomMetadata(id, patch): Promise<void>`
   - `subscribeToRoom(id, onChange): Unsubscribe`
   - Plus `listMembers`, `addMember`, `updateMember`, `removeMember`,
     `listFoods`, `addFood`, `updateFood`, `removeFood`.
3. `index.ts` re-exports the interface and types. No concrete
   implementation yet — that's PR 7.
4. Add a unit test file `src/lib/data/types.test.ts` that just asserts the
   exported type surface compiles (belt-and-suspenders; detects breaking
   interface changes in later PRs).

### Acceptance criteria
- Interfaces and types are exported; no runtime code.
- `yarn tsc --noEmit` passes.
- Zero imports of Firestore or Supabase in this file (keeps the interface
  agnostic).

---

## PR 5: Set up vitest test scaffolding
### Depends on
None

### Branch
supabase-auth/pr-5-vitest-setup

### Title
chore: add vitest for unit tests

### Files
- `package.json`
- `vitest.config.ts` (new)
- `src/lib/test-helpers.ts` (new)
- `src/lib/data/types.test.ts` (moved from PR 4 if that lands first — or
  created here)

### Implementation steps
1. `yarn add -D vitest @testing-library/react @testing-library/dom jsdom`.
2. Add a `vitest.config.ts` with `environment: 'jsdom'`, a `resolve.alias`
   that mirrors `tsconfig.json` paths, and `setupFiles` for
   `@testing-library/jest-dom`-style matchers if we add them.
3. Add scripts to `package.json`: `"test": "vitest run"`,
   `"test:watch": "vitest"`.
4. Create `src/lib/test-helpers.ts` with a stub `fakeRoom()` factory used
   by later tests.
5. Wire vitest into CI (if there's a `.github/workflows/` file — check and
   update; otherwise skip and leave a note).

### Acceptance criteria
- `yarn test` runs and passes (no real tests yet, or the trivial type
  test from PR 4).
- `yarn build` still works.
- CI config (if any) runs `yarn test`.

---

## PR 6: Add RLS policies + split rooms into public/member views
### Depends on
PR 3

### Branch
supabase-auth/pr-6-rls

### Title
feat: enforce row-level security and split rooms into public/private views

### Files
- `supabase/migrations/0002_rls.sql` (new)
- `supabase/README.md` (updated)

### Implementation steps
1. Enable RLS on `rooms`, `room_members`, `foods` via `alter table ...
   enable row level security`.
2. Create a view `rooms_public` that selects everything from `rooms`
   **except `location`**. Grant `select` on the view to `anon` and
   `authenticated`.
3. Policies on `rooms`:
   - `select` for `authenticated` where `id` appears in a
     `room_members` row for `auth.uid()` — this is the only way to read
     `location`.
   - `insert` where `created_by = auth.uid()`.
   - `update` where the caller has `is_host = true` in `room_members`.
   - No public `select` policy (forces anon through `rooms_public`).
4. Policies on `room_members`:
   - `select` for everyone (anon + authenticated). Display names are fine
     to expose.
   - `insert/update` where `user_id = auth.uid()`.
   - `delete` where `user_id = auth.uid()` or caller is host in the same
     room.
5. Policies on `foods`:
   - `select` public.
   - `insert/update/delete` where caller is a member of the room.
6. Update `supabase/README.md` with the policy rationale so future
   editors understand the privacy invariant (location is visible **only**
   to members).

### Acceptance criteria
- Anonymous SQL queries on `rooms` return zero rows (forced through the
  view).
- Anonymous queries on `rooms_public` return rows without `location`.
- An authenticated user who is a member of a room receives `location`
  when querying `rooms`.
- An authenticated user who is NOT a member receives zero rows from
  `rooms`.
- Verification SQL snippets are committed in `supabase/README.md` and
  can be pasted into the Supabase SQL console to re-verify.

---

## PR 7: Implement Supabase repository
### Depends on
PR 2, PR 3, PR 4

### Branch
supabase-auth/pr-7-supabase-repo

### Title
feat: implement Supabase-backed repository

### Files
- `src/lib/data/supabase-repository.ts` (new)
- `src/lib/data/supabase-repository.test.ts` (new)
- `src/lib/supabase/types.ts` (regenerated Database types from schema)

### Implementation steps
1. Regenerate `src/lib/supabase/types.ts` using `supabase gen types
   typescript` against the project schema. Commit the output.
2. Implement `SupabaseRoomRepository` in
   `src/lib/data/supabase-repository.ts` satisfying the
   `RoomRepository` interface from PR 4. Accept a `SupabaseClient` in
   the constructor so the same class works server-side and client-side.
3. `getRoom` queries `rooms_public`. `getRoomWithLocation` queries
   `rooms`. Both translate Supabase shape → domain `Room` type.
4. `subscribeToRoom` uses `supabase.channel()` + `postgres_changes` on
   the `rooms`, `room_members`, and `foods` tables filtered by
   `room_id`. Collapses changes into a single `onChange(room)` callback
   (the UI expects a whole-room snapshot today).
5. Mutation methods call their respective Supabase inserts/updates,
   returning `void` or the new row where applicable.
6. Tests in `supabase-repository.test.ts` use the `@supabase/supabase-js`
   mock patterns (or a thin in-memory stub) to assert call wiring. No
   integration tests yet — those require a live Supabase instance and
   can come later.

### Acceptance criteria
- All methods on `RoomRepository` have concrete implementations.
- Unit tests cover the happy path and the "location is only populated by
  `getRoomWithLocation`" invariant.
- `yarn tsc --noEmit` passes with regenerated types.

---

## PR 8: Supabase auth middleware + OAuth callback route
### Depends on
PR 2

### Branch
supabase-auth/pr-8-auth-middleware

### Title
feat: add Supabase auth middleware and callback route

### Files
- `middleware.ts` (new, at repo root)
- `app/auth/callback/route.ts` (new)
- `app/auth/sign-out/route.ts` (new)

### Implementation steps
1. Create root-level `middleware.ts` that calls
   `updateSupabaseSession(req)` from
   `src/lib/supabase/middleware.ts`. Configure the matcher to exclude
   static assets, the OG image route, and `/api/recipes`.
2. Create `app/auth/callback/route.ts` — a GET handler that receives the
   magic-link `code` query param, calls
   `supabase.auth.exchangeCodeForSession(code)`, and redirects to the
   `next` query param (defaulted to `/`).
3. Create `app/auth/sign-out/route.ts` — a POST handler that signs the
   user out and redirects home.
4. Verify with the Supabase CLI's local email testing harness (or the
   dashboard) that the magic-link round-trip works. Document the redirect
   URL that must be added to Supabase dashboard
   ("Authentication → URL Configuration").

### Acceptance criteria
- Cookies are refreshed on server navigations (can verify in devtools:
  `sb-*` cookies rotate).
- Hitting `/auth/callback?code=...` completes a session and redirects.
- Hitting `/auth/sign-out` clears the session.
- `/potlucks/[roomId]` still renders unauthenticated (the middleware is
  session-refresh only, not a gate).

---

## PR 9: useRoom hook — realtime subscription over the DAL
### Depends on
PR 7

### Branch
supabase-auth/pr-9-use-room-hook

### Title
feat: useRoom realtime hook over repository

### Files
- `src/hooks/useRoom.ts` (new)
- `src/hooks/useRoom.test.tsx` (new)
- `src/components/RepositoryProvider.tsx` (new)
- `app/providers.tsx` (modified to wrap in RepositoryProvider)

### Implementation steps
1. Create a React context `RepositoryContext` with a default
   `SupabaseRoomRepository` instance (constructed from the browser
   client).
2. `useRoom(roomId)` reads the repo from context, calls `getRoom` for
   initial fetch, sets up `subscribeToRoom` on mount, and returns
   `{ room, loading, error }`.
3. Add a second hook `useRoomWithLocation(roomId)` that calls
   `getRoomWithLocation` — it returns the same shape but with `location`
   populated when the user is a member. Throws a `NotAMemberError` if
   access is denied (translated from Supabase error codes).
4. Tests exercise mount/unmount unsubscribes, the location inclusion
   behavior (with mocked repository), and error propagation.
5. Wrap `app/providers.tsx` with `RepositoryProvider`.

### Acceptance criteria
- Unit tests pass for subscribe/unsubscribe lifecycle and location
  gating.
- The hook is exported but no component uses it yet (wired up in PR 12).

---

## PR 10: Sign-in page with magic-link form
### Depends on
PR 8

### Branch
supabase-auth/pr-10-sign-in

### Title
feat: add magic-link sign-in page

### Files
- `app/auth/sign-in/page.tsx` (new)
- `app/auth/sign-in/actions.ts` (new)
- `src/components/AuthPrompt.tsx` (new — shared "sign in to continue"
  component)

### Implementation steps
1. `app/auth/sign-in/page.tsx`: a server component rendering a form with
   `email` + hidden `next` input. Design consistent with the rest of the
   app (Chakra v3, matches `EventHeader` aesthetics).
2. `app/auth/sign-in/actions.ts`: server action
   `sendMagicLink(formData)` that calls
   `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo:
   '<origin>/auth/callback?next=<next>' } })`. Handles errors (invalid
   email, rate limits) gracefully.
3. After submit, render a "check your inbox" state. No client JS required
   for the happy path.
4. `AuthPrompt` is a small reusable banner component used later wherever
   we need a "sign in to do this" moment.
5. Add copy that matches the product's tone: friendly, short, not
   corporate. E.g. "drop your email and we'll send a sign-in link" — not
   "Enter your credentials to authenticate."

### Acceptance criteria
- Submitting a valid email sends a magic link (verified against Supabase
  dashboard logs).
- Error states render inline; no unhandled exceptions.
- Page passes basic a11y: label associations, focus ring, correct form
  semantics.

---

## PR 11: useAuth hook and AuthProvider context
### Depends on
PR 8

### Branch
supabase-auth/pr-11-use-auth

### Title
feat: useAuth hook with AuthProvider context

### Files
- `src/hooks/useAuth.ts` (new)
- `src/components/AuthProvider.tsx` (new)
- `src/hooks/useAuth.test.tsx` (new)
- `app/providers.tsx` (wrapped)

### Implementation steps
1. `AuthProvider` initializes the browser Supabase client and subscribes
   to `onAuthStateChange`. Exposes `{ user, session, isLoading }` via
   context.
2. `useAuth()` consumes context. Also exposes `signOut()` which POSTs to
   `/auth/sign-out`.
3. Add a second hook `useRoomMembership(roomId)` that, given the current
   user, returns `{ isMember, isHost }` by looking up
   `room_members` via the repository. Used extensively in PR 16 to gate
   UI.
4. Tests cover the unauth / signed-in / signing-out states.
5. Wire `AuthProvider` into `app/providers.tsx` (outside of
   `RepositoryProvider` so the repo can consume auth if needed).

### Acceptance criteria
- `useAuth()` returns `{ user: null }` when anonymous and the full user
  object after sign-in completes.
- `useRoomMembership` returns `{ isMember: false, isHost: false }` for
  non-members and the correct values for members/hosts.
- Tests pass.

---

## PR 12: Swap room page + EventHeader to the repository
### Depends on
PR 9, PR 11

### Branch
supabase-auth/pr-12-swap-room-page

### Title
refactor: room page + EventHeader read via repository

### Files
- `app/potlucks/[roomId]/page.tsx`
- `src/components/EventHeader.tsx`
- `app/potlucks/[roomId]/actions.ts` (new — server actions for metadata
  edits)

### Implementation steps
1. Replace `useRealtimeData<IRoomObj>(roomId)` in
   `app/potlucks/[roomId]/page.tsx` with `useRoom(roomId)`. Update the
   prop threading where `IRoomObj` was used; introduce a shim that
   translates `Room` (domain) → what the downstream components currently
   expect (minimize the blast radius in this PR).
2. In `EventHeader.tsx`, replace `addData({ ... })` calls for name, date,
   and location with three new server actions:
   `updateRoomName(roomId, name)`, `updateRoomDate(roomId, date)`,
   `updateRoomLocation(roomId, location)`. Actions live in
   `app/potlucks/[roomId]/actions.ts` and use the server Supabase client.
3. Use optimistic UI (React's `useOptimistic`) so the typing feel doesn't
   regress — the current Firestore flow feels instant.
4. Leave the existing Firestore imports intact in other components; they
   swap in PRs 13–14.

### Acceptance criteria
- Navigating to `/potlucks/<id>` reads from Supabase; changing
  name/date/location round-trips through server actions.
- Real-time updates still propagate (open two tabs, edit in one, see it
  in the other).
- No regressions in the existing host byline / farewell banner.
- Manual QA: verified in browser with screenshots (golden path + edge
  cases — empty state, long title, long location).

---

## PR 13: Swap food + user mutations to the repository
### Depends on
PR 9, PR 11

### Branch
supabase-auth/pr-13-swap-mutations

### Title
refactor: food + user hooks use repository

### Files
- `src/hooks/useFoods.ts`
- `src/hooks/useUsers.ts`
- `src/components/MenuBoard.tsx` (any lingering direct `addData` calls)
- `app/potlucks/[roomId]/actions.ts`

### Implementation steps
1. In `useFoods.ts`, replace every `addData(...)` with a server action
   call: `addFoodAction`, `removeFoodAction`, `claimFoodAction`,
   `unclaimFoodAction`. Actions go in the shared
   `app/potlucks/[roomId]/actions.ts` from PR 12.
2. In `useUsers.ts`, replace identity/member operations with
   `joinRoomAction`, `updateDietaryAction`, `leaveRoomAction`. The "first
   joiner becomes host" logic moves server-side into `joinRoomAction` —
   it checks for existing hosts in `room_members` and, if none, sets
   `is_host = true` on the new member.
3. Delete the `hostIds[]` reads/writes; use `room_members.is_host`
   directly. The `src/utils/hosts.ts` helpers now derive hosts from the
   members array.
4. Audit `MenuBoard.tsx` and any sibling components for stray `addData`
   imports and replace them.
5. Add tests for `joinRoomAction` covering the first-joiner promotion
   rule.

### Acceptance criteria
- All mutations go through server actions; no `addData` import remains
  in `src/hooks/useFoods.ts` or `src/hooks/useUsers.ts`.
- Host promotion still works (first person to join a brand new room gets
  the ✦ mark).
- Two-tab test: claims and joins propagate in realtime.

---

## PR 14: Swap room creation flow
### Depends on
PR 9, PR 11

### Branch
supabase-auth/pr-14-swap-create

### Title
refactor: room creation uses Supabase, requires sign-in

### Files
- `src/components/StartPotluckCTA.tsx`
- `app/HomePage.tsx` (if it composes StartPotluckCTA conditionally)
- `app/actions.ts` (new — root-level create-room action)

### Implementation steps
1. `createRoomAction(input)` in `app/actions.ts`: a server action that
   requires an authenticated session (redirects to
   `/auth/sign-in?next=/` if not). Inserts a new `rooms` row with the
   generated slug, creates a `room_members` row for the creator with
   `is_host = true`, and redirects to `/potlucks/<slug>`.
2. `StartPotluckCTA.tsx` invokes the server action instead of the direct
   Firestore write. If unauthenticated, the click routes the user to
   sign-in with `next=/` — upon return, the action fires automatically
   (store the intent in a short-lived cookie or query param).
3. Preserve the existing slug generation (adjective-adjective-nanoid) —
   it's a product/copy choice, not an implementation detail.

### Acceptance criteria
- Signed-out user clicking "Start a potluck" lands on sign-in, and after
  magic-link round-trip lands inside a freshly created room with
  themselves as host.
- Signed-in user goes straight to the room.
- Slug format unchanged.

---

## PR 15: Swap OG image data fetch to Supabase
### Depends on
PR 7

### Branch
supabase-auth/pr-15-og-supabase

### Title
refactor: OG image fetches from Supabase via service role

### Files
- `app/potlucks/[roomId]/opengraph-image.tsx`
- `src/lib/supabase/server.ts` (uses `createServiceSupabase()`)

### Implementation steps
1. Replace `fetchRoomRest(roomId)` with a service-role Supabase query
   that selects from `rooms_public` (NEVER the full `rooms` table — the
   service role bypasses RLS, so we use the view explicitly to enforce
   the "no location" invariant at the query level).
2. Drop the Firestore REST path entirely.
3. Confirm the OG route still runs on Edge — if
   `@supabase/supabase-js` isn't Edge-compatible in your Supabase
   version, downgrade the route to the Node runtime. Note: Edge Functions
   are no longer the recommended Vercel runtime anyway; Fluid Compute /
   Node is fine here. Update the route segment's `runtime = 'nodejs'` if
   needed.

### Acceptance criteria
- Rendering the OG route produces the same visual output as PR 1, now
  sourced from Supabase.
- A curl of the Supabase REST endpoint (with anon key) returns rows from
  `rooms_public` without `location`, proving the data source matches
  the privacy invariant end-to-end.
- OG route response time is not materially worse than before.

---

## PR 16: Gate location visibility behind membership
### Depends on
PR 12

### Branch
supabase-auth/pr-16-gate-location

### Title
feat: show location only to signed-in room members

### Files
- `src/components/EventHeader.tsx`
- `src/components/LocationGate.tsx` (new)
- `src/components/EventHeader.test.tsx` (new)

### Implementation steps
1. Inside `EventHeader`, call `useRoomWithLocation(roomId)` in parallel
   with `useRoom(roomId)`. Use `useAuth()` +
   `useRoomMembership(roomId)` to decide what to render:
   - signed-out: render `<LocationGate state="signed-out" />` — shows
     "🔒 Sign in to see the location" with a link to
     `/auth/sign-in?next=/potlucks/<id>`.
   - signed-in, not a member: render
     `<LocationGate state="not-member" />` — shows "Join this potluck
     to see the location" with a "Join" button that calls
     `joinRoomAction`.
   - signed-in, member: render the existing editable location field
     with the value from `useRoomWithLocation`.
2. Component tests cover all three states with mocked hooks.
3. Make sure the OG byline and the main room info still render in all
   three states — only the location line changes.
4. Screenshot all three states and attach to the PR.

### Acceptance criteria
- An anonymous browser to `/potlucks/<id>` never receives `location`
  in the network payload (verified via devtools → XHR).
- The UI correctly adapts per state.
- No network call reveals the location to non-members (enforced by
  RLS + the UI just doesn't ask for it).

---

## PR 17: Gate mutations behind auth
### Depends on
PR 12, PR 13, PR 14

### Branch
supabase-auth/pr-17-gate-mutations

### Title
feat: require sign-in for claims, edits, and adds

### Files
- `src/components/MenuBoard.tsx` (claim/unclaim interactions)
- `src/components/EventHeader.tsx` (name/date/location edits)
- `src/components/*` any component with a mutating action
- `src/components/AuthPrompt.tsx` (from PR 10)

### Implementation steps
1. In every place where a user can mutate (claim a dish, add a dish,
   edit the title, edit the date, leave a dietary note), check
   `useAuth()` — if not signed in, render the interaction as a signed-out
   affordance: the element stays visible but clicking it opens
   `AuthPrompt` ("Sign in to claim this dish") rather than firing the
   action.
2. Server actions already enforce auth (they use `getUser()` from the
   server client and return early if null) — this PR's job is making the
   UI match so we never let the user get halfway into an action.
3. Don't break the anonymous *read* experience: the menu board, host
   byline, and dish list all keep rendering exactly as today for signed
   out users.
4. Add tests for `AuthPrompt` and for one representative mutation site
   (claim-a-dish) covering both the signed-in and signed-out branches.

### Acceptance criteria
- Anonymous user can still browse everything except location.
- Any mutation attempt from an anonymous user surfaces the sign-in
  prompt, never a silent failure.
- Signed-in users continue to interact exactly as before.
- Server actions reject forged requests from an anonymous client
  (return a typed error, no 500s).

---

## PR 18: Remove Firebase dependencies and dead code
### Depends on
PR 12, PR 13, PR 14, PR 15

### Branch
supabase-auth/pr-18-remove-firebase

### Title
chore: remove Firebase dependencies and dead code

### Files
- `src/lib/firebase/` (delete entire directory)
- `package.json`, `yarn.lock`
- `.env.example` (remove `NEXT_PUBLIC_FIREBASE_*` keys)
- any stragglers surfaced by a grep

### Implementation steps
1. Grep for `firebase`, `firestore`, `FIREBASE_` across the repo; confirm
   every reference is inside files slated for deletion (or update the
   outlier).
2. `yarn remove firebase`.
3. Delete `src/lib/firebase/` entirely.
4. Remove firebase-specific env vars from `.env.example`.
5. In the deploy environment (Vercel dashboard), rotate/revoke the old
   Firestore API key to prevent it from being replayed against the old
   DB — this is a follow-up action documented in the PR description, not
   a code change.
6. Verify `yarn build` still passes and all pages render.

### Acceptance criteria
- `grep -r 'firebase\|firestore' src app` returns nothing.
- Bundle size decreases (measure via `yarn build` output before/after).
- No runtime errors in a full browser walkthrough.
- Deployment notes: action item to revoke the Firestore key is called
  out in the PR description.

---

## Waves

```
Wave 1 (parallel): PR 1, PR 2, PR 3, PR 4, PR 5
Wave 2 (parallel): PR 6, PR 7, PR 8
Wave 3 (parallel): PR 9, PR 10, PR 11
Wave 4 (parallel): PR 12, PR 13, PR 14, PR 15
Wave 5 (parallel): PR 16, PR 17
Wave 6:            PR 18
Total: 18 PRs across 6 waves (vs 18 sequential)
```

Wave 1's PR 1 is an *independent* security hotfix — even if the rest of the
plan stalls, PR 1 alone fixes the most public leak (the OG card in social
previews). It's safe to merge and deploy to main without the other 17.
