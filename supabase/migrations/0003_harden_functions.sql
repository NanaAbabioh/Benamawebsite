-- Benama Cuisines — function hardening (resolves security advisor WARNs)
--   * set_updated_at: pin search_path (0011_function_search_path_mutable)
--   * is_staff / handle_new_user: move SECURITY DEFINER helpers out of the
--     API-exposed `public` schema so they aren't callable as REST RPCs
--     (0028/0029). Policies and the auth trigger reference them by OID, so
--     they keep working; RLS still needs EXECUTE for is_staff.

alter function public.set_updated_at() set search_path = public;

create schema if not exists private;
grant usage on schema private to anon, authenticated, service_role;

alter function public.is_staff() set schema private;
alter function public.handle_new_user() set schema private;

-- RLS policies evaluate is_staff() as the querying role.
grant execute on function private.is_staff() to anon, authenticated;
-- handle_new_user runs only from the auth.users trigger; deny direct calls.
revoke execute on function private.handle_new_user() from public;
