-- Harden row-level security before the repo goes public.
--
-- The first RLS migration checked *which rows* a user could write, but not
-- *which columns*. Any signed-in user (anonymous sign-in included) could:
--   * join any room with `is_host = true`, or flip `is_host` on later, and
--     so read the private `location`, rename the room and evict guests;
--   * move their membership to another room via `room_id`;
--   * claim a dish for someone else, or steal / drop someone else's claim;
--   * rewrite `created_by` / `room_id` on any dish in their room;
--   * store unbounded text in every column.
--
-- Fixes:
--   1. Column-level privileges: clients may only write the columns the app
--      actually edits. Identity columns (ids, room_id, user_id, created_by,
--      is_host, timestamps) are read-only to anon/authenticated.
--   2. `is_host` is decided by the database on join: you are host iff you
--      created the room. Whatever the client sends is ignored.
--   3. A trigger enforces claim rules: you can only claim a dish for
--      yourself, and only the claimer or a host can release a claim.
--   4. Size limits on every free-text / jsonb column.
--   5. Pin `search_path` on trigger functions (Supabase linter 0011).
--
-- The service role bypasses all of this (it bypasses RLS and holds full
-- table privileges), so server-side admin code keeps working.

-- 1. Column-level privileges -------------------------------------------------

revoke all on table public.rooms, public.room_members, public.foods
  from anon, authenticated;

-- rooms: anon keeps SELECT so a stray `from('rooms')` call returns zero rows
-- (RLS) instead of a permission error. Anon should read `rooms_public`.
grant select on public.rooms to anon, authenticated;
grant insert (id, name, date, location, created_by) on public.rooms to authenticated;
grant update (name, date, location, closed_at) on public.rooms to authenticated;

grant select on public.room_members to anon, authenticated;
-- `is_host` stays in the INSERT list so existing clients that send it do
-- not fail; the trigger below overwrites it.
grant insert (room_id, user_id, display_name, color, is_host,
              dietary_restrictions, dietary_note)
  on public.room_members to authenticated;
grant update (display_name, color, dietary_restrictions, dietary_note, last_active)
  on public.room_members to authenticated;
grant delete on public.room_members to authenticated;

grant select on public.foods to anon, authenticated;
grant insert (room_id, title, notes, type, attributes, claimed_by, created_by)
  on public.foods to authenticated;
grant update (title, notes, type, attributes, claimed_by) on public.foods to authenticated;
grant delete on public.foods to authenticated;

-- 2. Host is derived, never client-chosen -------------------------------------

create or replace function public.room_members_before_insert()
returns trigger
language plpgsql
security definer -- must see rooms.created_by before the caller is a member
set search_path = ''
as $$
begin
  new.is_host := exists (
    select 1 from public.rooms r
    where r.id = new.room_id and r.created_by = new.user_id
  );
  new.joined_at := now();
  new.last_active := now();
  return new;
end;
$$;

revoke execute on function public.room_members_before_insert() from public, anon, authenticated;

drop trigger if exists room_members_before_insert on public.room_members;
create trigger room_members_before_insert
  before insert on public.room_members
  for each row execute function public.room_members_before_insert();

-- 3. Claim rules ---------------------------------------------------------------

drop policy if exists "Members add foods" on public.foods;
create policy "Members add foods"
  on public.foods for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and (claimed_by is null or claimed_by = auth.uid())
    and exists (
      select 1 from public.room_members rm
      where rm.room_id = foods.room_id and rm.user_id = auth.uid()
    )
  );

create or replace function public.foods_enforce_claim()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  -- No end-user identity (service role, migrations): trust the caller.
  if uid is null or new.claimed_by is not distinct from old.claimed_by then
    return new;
  end if;

  if new.claimed_by is not null and new.claimed_by <> uid then
    raise exception 'You can only claim a dish for yourself.'
      using errcode = 'P0001';
  end if;

  if old.claimed_by is not null and old.claimed_by <> uid and not exists (
    select 1 from public.room_members rm
    where rm.room_id = old.room_id and rm.user_id = uid and rm.is_host
  ) then
    raise exception 'Only the person who claimed this dish, or a host, can change its claim.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists foods_enforce_claim on public.foods;
create trigger foods_enforce_claim
  before update of claimed_by on public.foods
  for each row execute function public.foods_enforce_claim();

-- 4. Size limits (NOT VALID: enforced for new writes, existing rows untouched) -

alter table public.rooms
  add constraint rooms_id_format check (id ~ '^[A-Za-z0-9_-]{1,64}$') not valid,
  add constraint rooms_name_length check (char_length(name) <= 200) not valid,
  add constraint rooms_date_length check (char_length(date) <= 100) not valid,
  add constraint rooms_location_length check (char_length(location) <= 500) not valid;

alter table public.room_members
  add constraint room_members_display_name_length
    check (char_length(display_name) between 1 and 80) not valid,
  add constraint room_members_color_length check (char_length(color) <= 32) not valid,
  add constraint room_members_dietary_note_length
    check (char_length(dietary_note) <= 500) not valid,
  add constraint room_members_dietary_restrictions_shape
    check (jsonb_typeof(dietary_restrictions) = 'array'
           and jsonb_array_length(dietary_restrictions) <= 20) not valid;

alter table public.foods
  add constraint foods_title_length check (char_length(title) <= 200) not valid,
  add constraint foods_notes_length check (char_length(notes) <= 2000) not valid,
  add constraint foods_attributes_shape
    check (jsonb_typeof(attributes) = 'array'
           and jsonb_array_length(attributes) <= 20) not valid;

-- 5. Pin search_path on the shared updated_at trigger --------------------------

alter function public.set_updated_at() set search_path = '';
