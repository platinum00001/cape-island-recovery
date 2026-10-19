-- Cape Island Recovery — schema `cape_island_recovery` in Supabase project james-sites (oiousqgzqcjanikglkxl).
-- Row Level Security on every table: members see only their own rows; admins see all.
-- Idempotent: safe to re-run.
create schema if not exists cape_island_recovery;

create table if not exists cape_island_recovery.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  note text, created_at timestamptz not null default now());

create table if not exists cape_island_recovery.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  phone text check (char_length(phone) <= 30),
  contact_pref text check (contact_pref in ('email','phone','text')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now());

-- Help requests + volunteer sign-ups (account required).
create table if not exists cape_island_recovery.requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind text not null check (kind in ('food_delivery','resource_connection','ride_interest','volunteer')),
  topics text[] not null default '{}' check (cardinality(topics) <= 12),
  details text check (char_length(details) <= 2000),
  town text check (char_length(town) <= 80),
  contact_pref text check (contact_pref in ('email','phone','text')),
  phone text check (char_length(phone) <= 30),
  status text not null default 'new' check (status in ('new','contacted','in_progress','done','closed')),
  admin_note text,
  created_at timestamptz not null default now());
create index if not exists cir_requests_user_idx on cape_island_recovery.requests(user_id, created_at desc);

-- Donation pledges until a donation platform exists (no money collected here).
create table if not exists cape_island_recovery.pledges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text check (char_length(name) <= 120),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 200),
  pledge_type text not null check (pledge_type in ('money','food','time','other')),
  message text check (char_length(message) <= 1000),
  status text not null default 'new' check (status in ('new','contacted','closed')),
  created_at timestamptz not null default now());

create or replace function cape_island_recovery.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from cape_island_recovery.admins a where a.user_id = auth.uid())
$$;

-- Abuse guards (rate limits) on public inserts.
create or replace function cape_island_recovery.guard_request() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.status := 'new'; new.admin_note := null; new.user_id := auth.uid();
  if new.user_id is null then raise exception 'Please sign in first' using errcode = '28000'; end if;
  if (select count(*) from cape_island_recovery.requests r where r.user_id = new.user_id and r.created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Too many requests in the last hour. Please call or email us instead.' using errcode = '54000';
  end if;
  return new;
end $$;
drop trigger if exists cir_requests_guard on cape_island_recovery.requests;
create trigger cir_requests_guard before insert on cape_island_recovery.requests
  for each row execute function cape_island_recovery.guard_request();

create or replace function cape_island_recovery.guard_pledge() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.status := 'new'; new.email := lower(trim(new.email));
  if new.user_id is not null and new.user_id is distinct from auth.uid() then new.user_id := null; end if;
  if (select count(*) from cape_island_recovery.pledges p where p.email = new.email and p.created_at > now() - interval '1 hour') >= 3 then
    raise exception 'Thanks! We already have your pledge. Please try again later.' using errcode = '54000';
  end if;
  if (select count(*) from cape_island_recovery.pledges p where p.created_at > now() - interval '10 minutes') >= 60 then
    raise exception 'The site is busy. Please try again in a few minutes.' using errcode = '54000';
  end if;
  return new;
end $$;
drop trigger if exists cir_pledges_guard on cape_island_recovery.pledges;
create trigger cir_pledges_guard before insert on cape_island_recovery.pledges
  for each row execute function cape_island_recovery.guard_pledge();

alter table cape_island_recovery.admins   enable row level security;
alter table cape_island_recovery.profiles enable row level security;
alter table cape_island_recovery.requests enable row level security;
alter table cape_island_recovery.pledges  enable row level security;

drop policy if exists admins_self on cape_island_recovery.admins;
create policy admins_self on cape_island_recovery.admins for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists profiles_select on cape_island_recovery.profiles;
drop policy if exists profiles_insert on cape_island_recovery.profiles;
drop policy if exists profiles_update on cape_island_recovery.profiles;
drop policy if exists profiles_delete on cape_island_recovery.profiles;
create policy profiles_select on cape_island_recovery.profiles for select to authenticated using (id = (select auth.uid()) or (select cape_island_recovery.is_admin()));
create policy profiles_insert on cape_island_recovery.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy profiles_update on cape_island_recovery.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy profiles_delete on cape_island_recovery.profiles for delete to authenticated using (id = (select auth.uid()));

drop policy if exists requests_select on cape_island_recovery.requests;
drop policy if exists requests_insert on cape_island_recovery.requests;
drop policy if exists requests_update on cape_island_recovery.requests;
drop policy if exists requests_delete on cape_island_recovery.requests;
create policy requests_select on cape_island_recovery.requests for select to authenticated using (user_id = (select auth.uid()) or (select cape_island_recovery.is_admin()));
create policy requests_insert on cape_island_recovery.requests for insert to authenticated with check (user_id = (select auth.uid()) and status = 'new');
create policy requests_update on cape_island_recovery.requests for update to authenticated using ((select cape_island_recovery.is_admin())) with check ((select cape_island_recovery.is_admin()));
create policy requests_delete on cape_island_recovery.requests for delete to authenticated using (user_id = (select auth.uid()) or (select cape_island_recovery.is_admin()));

drop policy if exists pledges_insert on cape_island_recovery.pledges;
drop policy if exists pledges_select on cape_island_recovery.pledges;
drop policy if exists pledges_update on cape_island_recovery.pledges;
drop policy if exists pledges_delete on cape_island_recovery.pledges;
create policy pledges_insert on cape_island_recovery.pledges for insert to anon, authenticated with check (status = 'new' and (user_id is null or user_id = (select auth.uid())));
create policy pledges_select on cape_island_recovery.pledges for select to authenticated using ((user_id is not null and user_id = (select auth.uid())) or (select cape_island_recovery.is_admin()));
create policy pledges_update on cape_island_recovery.pledges for update to authenticated using ((select cape_island_recovery.is_admin())) with check ((select cape_island_recovery.is_admin()));
create policy pledges_delete on cape_island_recovery.pledges for delete to authenticated using ((user_id is not null and user_id = (select auth.uid())) or (select cape_island_recovery.is_admin()));

create or replace function cape_island_recovery.delete_my_data() returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Please sign in first' using errcode = '28000'; end if;
  delete from cape_island_recovery.requests where user_id = uid;
  delete from cape_island_recovery.pledges where user_id = uid;
  delete from cape_island_recovery.profiles where id = uid;
end $$;

create or replace function cape_island_recovery.health() returns jsonb
language sql stable set search_path = '' as $$ select jsonb_build_object('ok', true, 'schema', 'cape_island_recovery', 'version', 'v1') $$;

revoke all on all tables in schema cape_island_recovery from anon, authenticated, public;
revoke all on all functions in schema cape_island_recovery from anon, authenticated, public;
grant usage on schema cape_island_recovery to anon, authenticated, service_role;
grant select on cape_island_recovery.admins to authenticated;
grant select, insert, update, delete on cape_island_recovery.profiles to authenticated;
grant select, insert, update, delete on cape_island_recovery.requests to authenticated;
grant insert on cape_island_recovery.pledges to anon;
grant select, insert, update, delete on cape_island_recovery.pledges to authenticated;
grant all on all tables in schema cape_island_recovery to service_role;
grant execute on function cape_island_recovery.health(), cape_island_recovery.is_admin() to anon, authenticated;
grant execute on function cape_island_recovery.delete_my_data() to authenticated;
alter default privileges in schema cape_island_recovery revoke execute on functions from public;
