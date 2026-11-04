# Supabase

This project uses Supabase for the database, auth, and realtime data sync.

## Local development

1. Install the Supabase CLI: `brew install supabase/tap/supabase` (needs Docker).
2. `supabase start` — boots Postgres, Auth and the REST API locally and
   applies every migration. `supabase status -o env` prints the URL and keys
   for `.env.local`.
3. `supabase test db` — runs the RLS tests in `supabase/tests/`.

## Hosted project

1. `supabase login` — opens a browser for one-time auth.
2. `supabase link --project-ref <ref>` — links this repo to the project.
3. `supabase db push` — applies all pending migrations in `supabase/migrations/`.

## Migrations

| File | Purpose |
|------|---------|
| `20260423045335_core_schema.sql` | Tables: `rooms`, `room_members`, `foods`. |
| `20260423045606_rls_and_realtime.sql` | RLS policies, `rooms_public` view, realtime publication. |
| `20261104000000_harden_rls.sql` | Column-level grants, server-decided `is_host`, claim rules, size limits. |

### Applying migrations

- `supabase db push` — apply all pending migrations to the linked project.
- `supabase db diff` — diff the linked project schema vs local migrations.

### Generating TS types

After schema changes:

```
supabase gen types typescript --project-id <ref> > src/lib/supabase/types.ts
```

## Privacy invariant

`rooms.location` is **private** — only members of the room may read it.
Anon / non-member clients read from the `rooms_public` view (defined in
the RLS migration), which omits `location` entirely. The service-role key
bypasses RLS, so any server code using it must query `rooms_public`
explicitly when rendering public surfaces (OG image, metadata, etc.).

## Security model

- **The link is the invite.** Anyone with a room id can read its menu and
  guest list (`rooms_public`, `room_members`, `foods`) and join it.
- **Location is members-only.** `rooms.location` is never readable by
  non-members; public surfaces use `rooms_public`.
- **Host is derived, not chosen.** On join, `is_host` is set by a trigger:
  you are host iff you created the room. Clients cannot write `is_host`,
  `room_id`, `user_id` or `created_by` after insert (column-level grants).
- **Claims are personal.** You can only claim a dish for yourself; only the
  claimer or a host can release a claim (`foods_enforce_claim` trigger).
- **Size limits** on all free-text and jsonb columns.

`supabase/tests/rls_test.sql` covers each rule, including the attacks it
blocks. Run it after every policy change.

Known trade-off: because reads are "anyone with the id", a client can list
every row of `rooms_public`, `room_members` and `foods`. Room ids are not
secret from the database's point of view. If that matters, move public
reads behind a `security definer` RPC that takes a room id.

## No Firestore migration

Existing rooms in Firestore are not migrated. After the Supabase cutover
lands, old Firestore-era URLs stop working. This is intentional — the
user confirmed no data migration was needed.
