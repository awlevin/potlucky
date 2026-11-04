-- Row-level security tests. Run with `supabase test db` against a local
-- stack (`supabase start`). Every test runs inside one transaction that
-- is rolled back at the end, so nothing persists.
--
-- Cast:
--   alice   – creates "alice-room" and is its host
--   bob     – a regular guest in alice-room
--   mallory – an attacker with a valid (e.g. anonymous) session
begin;
create extension if not exists pgtap with schema extensions;
select plan(30);

-- ---------------------------------------------------------------- fixtures
insert into auth.users (id, aud, role, email)
values
  ('00000000-0000-0000-0000-00000000000a', 'authenticated', 'authenticated', 'alice@example.com'),
  ('00000000-0000-0000-0000-00000000000b', 'authenticated', 'authenticated', 'bob@example.com'),
  ('00000000-0000-0000-0000-00000000000c', 'authenticated', 'authenticated', 'mallory@example.com');

create or replace function pg_temp.act_as(uid uuid) returns void
language plpgsql as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims',
    json_build_object('sub', uid, 'role', 'authenticated')::text, true);
end $$;

create or replace function pg_temp.act_as_anon() returns void
language plpgsql as $$
begin
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
end $$;

-- Alice creates a room and joins it.
select pg_temp.act_as('00000000-0000-0000-0000-00000000000a');
insert into rooms (id, name, location, created_by)
values ('alice-room', 'Friendsgiving', '123 Secret St', '00000000-0000-0000-0000-00000000000a');
insert into room_members (room_id, user_id, display_name, color, is_host)
values ('alice-room', '00000000-0000-0000-0000-00000000000a', 'Alice', '#E8A817', true);
insert into foods (room_id, title, created_by)
values ('alice-room', 'Pie', '00000000-0000-0000-0000-00000000000a');

-- Bob joins and tries to claim host while doing it.
select pg_temp.act_as('00000000-0000-0000-0000-00000000000b');
insert into room_members (room_id, user_id, display_name, color, is_host)
values ('alice-room', '00000000-0000-0000-0000-00000000000b', 'Bob', '#4EA24E', true);
insert into foods (room_id, title, created_by, claimed_by)
values ('alice-room', 'Salad',
        '00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-00000000000b');

reset role;

-- ------------------------------------------------------- host assignment
select is(
  (select is_host from room_members where room_id = 'alice-room' and user_id = '00000000-0000-0000-0000-00000000000a'),
  true, 'room creator who joins is host');
select is(
  (select is_host from room_members where room_id = 'alice-room' and user_id = '00000000-0000-0000-0000-00000000000b'),
  false, 'non-creator cannot self-assign is_host on join');

-- ---------------------------------------------------------- anon access
select pg_temp.act_as_anon();
select is((select count(*) from rooms)::int, 0, 'anon cannot read rooms table (location)');
select is((select count(*) from rooms_public where id = 'alice-room')::int, 1, 'anon can read rooms_public by id');
select throws_ok(
  $$ select location from rooms_public $$, '42703', null, 'rooms_public has no location column');
select is((select count(*) from foods where room_id = 'alice-room')::int, 2, 'anon can read the menu');
select throws_ok(
  $$ insert into rooms (id, name, created_by) values ('x', 'x', '00000000-0000-0000-0000-00000000000c') $$,
  '42501', null, 'anon cannot create rooms');
select throws_ok(
  $$ update foods set title = 'pwned' $$, '42501', null, 'anon cannot update foods');
select throws_ok(
  $$ delete from room_members $$, '42501', null, 'anon cannot delete members');
reset role;

-- ------------------------------------------------- mallory, non-member
select pg_temp.act_as('00000000-0000-0000-0000-00000000000c');
select is((select count(*) from rooms where id = 'alice-room')::int, 0, 'non-member cannot read location');
update rooms set name = 'pwned' where id = 'alice-room';
update foods set title = 'pwned' where room_id = 'alice-room';
delete from foods where room_id = 'alice-room';
select throws_ok(
  $$ insert into foods (room_id, title, created_by) values ('alice-room', 'spam', '00000000-0000-0000-0000-00000000000c') $$,
  '42501', null, 'non-member cannot add foods');
select throws_ok(
  $$ insert into room_members (room_id, user_id, display_name, color)
     values ('alice-room', '00000000-0000-0000-0000-00000000000b', 'Fake Bob', '#000000') $$,
  '42501', null, 'cannot insert a membership for someone else');

-- Mallory joins (this is allowed: the link is the invite) and tries to
-- escalate in every way she can.
insert into room_members (room_id, user_id, display_name, color, is_host)
values ('alice-room', '00000000-0000-0000-0000-00000000000c', 'Mallory', '#000000', true);
select is(
  (select is_host from room_members where room_id = 'alice-room' and user_id = '00000000-0000-0000-0000-00000000000c'),
  false, 'joining with is_host=true does not make you host');
select throws_ok(
  $$ update room_members set is_host = true
     where room_id = 'alice-room' and user_id = '00000000-0000-0000-0000-00000000000c' $$,
  '42501', null, 'member cannot promote themselves to host');
select throws_ok(
  $$ update room_members set room_id = 'other'
     where room_id = 'alice-room' and user_id = '00000000-0000-0000-0000-00000000000c' $$,
  '42501', null, 'member cannot move their membership to another room');
select lives_ok(
  $$ update room_members set display_name = 'Mal', dietary_note = 'no cilantro'
     where room_id = 'alice-room' and user_id = '00000000-0000-0000-0000-00000000000c' $$,
  'member can edit their own profile fields');
select throws_ok(
  $$ update foods set claimed_by = '00000000-0000-0000-0000-00000000000a'
     where title = 'Pie' $$,
  'P0001', null, 'member cannot claim a dish on behalf of someone else');
select throws_ok(
  $$ update foods set claimed_by = '00000000-0000-0000-0000-00000000000c'
     where title = 'Salad' $$,
  'P0001', null, 'member cannot steal a dish someone else claimed');
select throws_ok(
  $$ update foods set claimed_by = null
     where title = 'Salad' $$,
  'P0001', null, 'member cannot unclaim a dish someone else claimed');
select throws_ok(
  $$ update foods set created_by = '00000000-0000-0000-0000-00000000000c'
     where title = 'Pie' $$,
  '42501', null, 'member cannot rewrite who created a dish');
select throws_ok(
  $$ insert into foods (room_id, title, created_by, claimed_by)
     values ('alice-room', 'x', '00000000-0000-0000-0000-00000000000c', '00000000-0000-0000-0000-00000000000a') $$,
  '42501', null, 'member cannot add a dish pre-claimed by someone else');
select throws_ok(
  $$ insert into foods (room_id, title, created_by)
     values ('alice-room', repeat('x', 10000), '00000000-0000-0000-0000-00000000000c') $$,
  '23514', null, 'dish titles are length-limited');
select lives_ok(
  $$ update foods set claimed_by = '00000000-0000-0000-0000-00000000000c'
     where title = 'Pie' $$,
  'member can claim an open dish for themselves');
select lives_ok(
  $$ update foods set claimed_by = null
     where title = 'Pie' $$,
  'member can unclaim their own dish');
reset role;

select is((select name from rooms where id = 'alice-room'), 'Friendsgiving', 'non-host could not rename the room');
select is((select count(*) from foods where room_id = 'alice-room' and title = 'pwned')::int, 0, 'non-member updates were no-ops');

-- --------------------------------------------------------------- alice
select pg_temp.act_as('00000000-0000-0000-0000-00000000000a');
select is((select location from rooms where id = 'alice-room'), '123 Secret St', 'host can read location');
select lives_ok(
  $$ update rooms set name = 'Friendsgiving 2026', location = '456 New St' where id = 'alice-room' $$,
  'host can edit room details');
select throws_ok(
  $$ update rooms set created_by = '00000000-0000-0000-0000-00000000000c' where id = 'alice-room' $$,
  '42501', null, 'host cannot reassign room ownership');
select lives_ok(
  $$ update foods set claimed_by = null where title = 'Salad' $$,
  'host can release a dish someone else claimed');
reset role;

select * from finish();
rollback;
