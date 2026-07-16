-- Benama Cuisines — enable Realtime on orders for the staff dashboard.
-- REPLICA IDENTITY FULL so UPDATE events carry the full row (status changes).
-- RLS still applies: only staff (is_staff()) receive order change events.

alter table orders replica identity full;
alter publication supabase_realtime add table orders;
