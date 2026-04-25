-- Realtime needs full row identity to broadcast UPDATE/DELETE events
-- with all column values; without this the WebSocket connections fail
-- when the client subscribes to postgres_changes for these tables.

alter table rooms replica identity full;
alter table room_members replica identity full;
alter table foods replica identity full;
