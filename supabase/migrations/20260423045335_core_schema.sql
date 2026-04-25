-- Core schema for Potlucky: rooms, room_members, foods.
--
-- Notes:
-- - `rooms.id` is a text slug (e.g. "pumpkin-pleasant-9x2Qk"), not a uuid.
-- - `rooms.location` is private; a public view (see 0002_rls.sql) omits it.
-- - `room_members` replaces the legacy `hostIds[]` array — the host flag
--   lives on the membership row.

create table if not exists rooms (
  id text primary key,
  name text not null,
  date text null,
  location text null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz null
);

create table if not exists room_members (
  room_id text not null references rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  color text not null,
  is_host boolean not null default false,
  dietary_restrictions jsonb not null default '[]'::jsonb,
  dietary_note text null,
  joined_at timestamptz not null default now(),
  last_active timestamptz not null default now(),
  primary key (room_id, user_id)
);

create index if not exists idx_room_members_room_id on room_members(room_id);

create table if not exists foods (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references rooms(id) on delete cascade,
  title text not null,
  notes text null,
  type text null check (type in ('appetizer','main','side','dessert','drink')),
  attributes jsonb not null default '[]'::jsonb,
  claimed_by uuid null references auth.users(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_foods_room_id on foods(room_id);
create index if not exists idx_foods_claimed_by on foods(claimed_by);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists rooms_updated_at on rooms;
create trigger rooms_updated_at
  before update on rooms
  for each row execute function set_updated_at();

drop trigger if exists foods_updated_at on foods;
create trigger foods_updated_at
  before update on foods
  for each row execute function set_updated_at();
