# Supabase

This project uses Supabase for the database, auth, and realtime data sync.

## Setup

1. Install the Supabase CLI: `brew install supabase/tap/supabase`.
2. `supabase login` — opens a browser for one-time auth.
3. `supabase link --project-ref <ref>` — links this repo to the project.
4. `supabase db push` — applies all migrations in `supabase/migrations/`.

## Migrations

| File | Purpose |
|------|---------|
| `20260423045335_core_schema.sql` | Tables: `rooms`, `room_members`, `foods`. |
| `20260423XXXXXX_rls.sql` (later) | RLS policies + `rooms_public` view. |

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

## No Firestore migration

Existing rooms in Firestore are not migrated. After the Supabase cutover
lands, old Firestore-era URLs stop working. This is intentional — the
user confirmed no data migration was needed.
