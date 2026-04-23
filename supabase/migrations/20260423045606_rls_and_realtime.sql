-- Enforce row-level security and enable realtime broadcasts.
-- See supabase/README.md for the full privacy invariant.

alter table rooms enable row level security;
alter table room_members enable row level security;
alter table foods enable row level security;

-- Public view that omits `location`. Anon callers read this instead of
-- the `rooms` table. The room page's OG image also reads this view.
create or replace view rooms_public as
select
  id,
  name,
  date,
  created_by,
  created_at,
  closed_at
from rooms;

grant select on rooms_public to anon, authenticated;

-- rooms: full-row select is members-only. No `to anon` policy means
-- anonymous callers see zero rows through `select * from rooms` and must
-- use rooms_public instead.
create policy "Members read full rooms row"
  on rooms for select
  to authenticated
  using (
    exists (
      select 1 from room_members rm
      where rm.room_id = rooms.id and rm.user_id = auth.uid()
    )
  );

create policy "Any authed user can create a room"
  on rooms for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "Hosts update rooms"
  on rooms for update
  to authenticated
  using (
    exists (
      select 1 from room_members rm
      where rm.room_id = rooms.id and rm.user_id = auth.uid() and rm.is_host
    )
  )
  with check (
    exists (
      select 1 from room_members rm
      where rm.room_id = rooms.id and rm.user_id = auth.uid() and rm.is_host
    )
  );

-- room_members: display name / color / host flag are public.
create policy "Members visible to everyone"
  on room_members for select
  to anon, authenticated
  using (true);

create policy "Users insert their own membership"
  on room_members for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users update their own membership"
  on room_members for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users leave, hosts evict"
  on room_members for delete
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from room_members rm
      where rm.room_id = room_members.room_id
        and rm.user_id = auth.uid()
        and rm.is_host
    )
  );

-- foods: menu board is public; mutations gated to members.
create policy "Foods visible to everyone"
  on foods for select
  to anon, authenticated
  using (true);

create policy "Members add foods"
  on foods for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from room_members rm
      where rm.room_id = foods.room_id and rm.user_id = auth.uid()
    )
  );

create policy "Members update foods in their room"
  on foods for update
  to authenticated
  using (
    exists (
      select 1 from room_members rm
      where rm.room_id = foods.room_id and rm.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from room_members rm
      where rm.room_id = foods.room_id and rm.user_id = auth.uid()
    )
  );

create policy "Members delete their food, hosts delete any"
  on foods for delete
  to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1 from room_members rm
      where rm.room_id = foods.room_id
        and rm.user_id = auth.uid()
        and rm.is_host
    )
  );

-- Enable realtime broadcasts on the three tables so clients can
-- subscribe to room-scoped updates.
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table room_members;
alter publication supabase_realtime add table foods;
