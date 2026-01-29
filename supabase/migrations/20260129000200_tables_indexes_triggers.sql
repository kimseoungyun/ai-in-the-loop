-- =========================================================
-- 하루투자 (Supabase / PostgreSQL) - Tables / Indexes / Triggers
-- Generated: 2026-01-29
-- =========================================================

-- 1) profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key, -- must match auth.users.id
  email text,
  name text,
  default_timezone text not null default 'Asia/Seoul',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_status_check check (status in ('active', 'disabled')),
  constraint profiles_email_not_empty check (email is null or length(trim(email)) > 0),
  constraint profiles_name_not_empty check (name is null or length(trim(name)) > 0)
);

create unique index if not exists ux_profiles_email
  on public.profiles (lower(email))
  where email is not null;

drop trigger if exists set_updated_at_profiles on public.profiles;
create trigger set_updated_at_profiles
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- auth.users -> profiles trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();

-- 2) stocks (user-owned)
create table if not exists public.stocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  ticker text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stocks_name_not_empty check (length(trim(name)) > 0),
  constraint stocks_ticker_not_empty check (ticker is null or length(trim(ticker)) > 0)
);

create unique index if not exists ux_stocks_user_ticker
  on public.stocks (user_id, lower(ticker))
  where ticker is not null;

create index if not exists ix_stocks_user_created
  on public.stocks (user_id, created_at desc);

drop trigger if exists set_updated_at_stocks on public.stocks;
create trigger set_updated_at_stocks
  before update on public.stocks
  for each row
  execute function public.handle_updated_at();

-- 3) reports (user-owned + stock-owned)
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stock_id uuid not null references public.stocks(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reports_content_not_empty check (length(trim(content)) > 0)
);

create index if not exists ix_reports_stock_created
  on public.reports (stock_id, created_at desc);

create index if not exists ix_reports_user_created
  on public.reports (user_id, created_at desc);

drop trigger if exists set_updated_at_reports on public.reports;
create trigger set_updated_at_reports
  before update on public.reports
  for each row
  execute function public.handle_updated_at();

-- 4) notification_channels (Phase 2 / 운영)
create table if not exists public.notification_channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  delivery_type public.delivery_type_enum not null,
  delivery_target text not null,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notification_channels_target_not_empty check (length(trim(delivery_target)) > 0)
);

create unique index if not exists ux_notification_channels_user_type_target
  on public.notification_channels (user_id, delivery_type, lower(delivery_target));

create index if not exists ix_notification_channels_user
  on public.notification_channels (user_id);

drop trigger if exists set_updated_at_notification_channels on public.notification_channels;
create trigger set_updated_at_notification_channels
  before update on public.notification_channels
  for each row
  execute function public.handle_updated_at();

-- 5) notification_schedules (Phase 2 / 운영)
-- days_mask: 7bit (Mon..Sun) => 1..127
create table if not exists public.notification_schedules (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.notification_channels(id) on delete cascade,
  days_mask integer not null,
  delivery_time time not null,
  timezone text,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notification_schedules_days_mask_check check (days_mask between 1 and 127),
  constraint notification_schedules_timezone_not_empty check (timezone is null or length(trim(timezone)) > 0)
);

create unique index if not exists ux_notification_schedules_channel_days_time
  on public.notification_schedules (channel_id, days_mask, delivery_time);

create index if not exists ix_notification_schedules_channel
  on public.notification_schedules (channel_id);

drop trigger if exists set_updated_at_notification_schedules on public.notification_schedules;
create trigger set_updated_at_notification_schedules
  before update on public.notification_schedules
  for each row
  execute function public.handle_updated_at();

-- 6) notifications (Phase 2 / 운영)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  report_id uuid references public.reports(id) on delete set null,
  type text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_type_not_empty check (length(trim(type)) > 0),
  constraint notifications_message_not_empty check (length(trim(message)) > 0)
);

create index if not exists ix_notifications_user_created
  on public.notifications (user_id, created_at desc);

create index if not exists ix_notifications_report
  on public.notifications (report_id);

