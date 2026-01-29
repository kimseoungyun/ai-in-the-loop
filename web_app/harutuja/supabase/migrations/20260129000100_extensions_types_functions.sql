-- =========================================================
-- 하루투자 (Supabase / PostgreSQL) - Extensions / Types / Functions
-- Generated: 2026-01-29
-- =========================================================

-- Extensions
create extension if not exists pgcrypto;

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'delivery_type_enum') then
    create type public.delivery_type_enum as enum ('EMAIL', 'KAKAO');
  end if;
end$$;

-- Common updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Sync auth.users -> public.profiles
-- Note: raw_user_meta_data keys are provider-dependent; use conservatively.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  v_name := nullif(trim(coalesce(new.raw_user_meta_data->>'name', '')), '');

  insert into public.profiles (id, email, name)
  values (new.id, new.email, v_name)
  on conflict (id) do update
    set email = excluded.email,
        name = coalesce(excluded.name, public.profiles.name);

  return new;
end;
$$;

