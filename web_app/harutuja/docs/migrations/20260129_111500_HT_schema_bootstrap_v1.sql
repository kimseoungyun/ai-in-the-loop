-- =========================================================
-- [harutuja] HT_ 스키마 부트스트랩 (v1)
-- 파일명: 20260129_111500_HT_schema_bootstrap_v1.sql
--
-- 변경 사유:
-- - 운영 표준(정규화 + HT_ 접두사 + Supabase RLS) 기반의 초기 스키마를 "증분/비파괴" 방식으로 도입
-- - 기존 테이블/데이터를 절대 DROP/TRUNCATE 하지 않으며, 신규 오브젝트는 IF NOT EXISTS + 존재여부 체크로 생성
--
-- 영향도(Impact) 평가:
-- - DB: 신규 테이블(HT_*)/인덱스/함수/트리거/RLS 정책이 추가됨 (기존 오브젝트 변경 없음)
-- - APP/API: 기존 코드가 아직 mock 중심이라 즉시 런타임 영향 낮음. 추후 DB 연동 시 테이블명이 HT_*로 고정됨.
-- - 타입: supabase gen types 실행 시 HT_* 테이블이 포함되어 타입 생성 범위가 확대됨.
--
-- Rollback(원복) 구문:
-- - 운영 정책상 DROP/TRUNCATE 금지이므로 기본 원복은 "비활성화" 방식으로 제공
--   (RLS 비활성/트리거 비활성/권한 회수). 필요 시 별도 승인 하에 DROP을 수행.
-- =========================================================

-- 0) Extensions (비파괴)
create extension if not exists pgcrypto;

-- 1) 공통 코드 마스터/값 (운영 확장용)
create table if not exists public.HT_CODE_MASTER (
  HT_CODE_MASTER_ID bigserial primary key,
  HT_CODE_GROUP text not null,
  HT_CODE_GROUP_NAME text not null,
  HT_IS_ACTIVE boolean not null default true,
  HT_CREATED_AT timestamptz not null default now(),
  HT_UPDATED_AT timestamptz not null default now(),
  constraint HT_CODE_MASTER_GROUP_UQ unique (HT_CODE_GROUP),
  constraint HT_CODE_MASTER_GROUP_NOT_EMPTY check (length(trim(HT_CODE_GROUP)) > 0),
  constraint HT_CODE_MASTER_GROUP_NAME_NOT_EMPTY check (length(trim(HT_CODE_GROUP_NAME)) > 0)
);

create table if not exists public.HT_CODE_VALUE (
  HT_CODE_VALUE_ID bigserial primary key,
  HT_CODE_MASTER_ID bigint not null references public.HT_CODE_MASTER(HT_CODE_MASTER_ID) on delete restrict,
  HT_CODE text not null,
  HT_CODE_NAME text not null,
  HT_SORT_ORDER integer not null default 0,
  HT_IS_ACTIVE boolean not null default true,
  HT_CREATED_AT timestamptz not null default now(),
  HT_UPDATED_AT timestamptz not null default now(),
  constraint HT_CODE_VALUE_UQ unique (HT_CODE_MASTER_ID, HT_CODE),
  constraint HT_CODE_VALUE_CODE_NOT_EMPTY check (length(trim(HT_CODE)) > 0),
  constraint HT_CODE_VALUE_NAME_NOT_EMPTY check (length(trim(HT_CODE_NAME)) > 0)
);

-- 2) updated_at 트리거 함수 (비파괴: create or replace는 안전)
create or replace function public.HT_handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.HT_UPDATED_AT = now();
  return new;
end;
$$;

-- 3) 프로필 테이블(= auth.users 1:1 확장)
create table if not exists public.HT_PROFILE (
  HT_PROFILE_ID uuid primary key, -- auth.users.id와 동일
  HT_EMAIL text,
  HT_NAME text,
  HT_DEFAULT_TIMEZONE text not null default 'Asia/Seoul',
  HT_STATUS_CODE_VALUE_ID bigint null references public.HT_CODE_VALUE(HT_CODE_VALUE_ID) on delete restrict,
  HT_CREATED_AT timestamptz not null default now(),
  HT_UPDATED_AT timestamptz not null default now(),
  constraint HT_PROFILE_EMAIL_NOT_EMPTY check (HT_EMAIL is null or length(trim(HT_EMAIL)) > 0),
  constraint HT_PROFILE_NAME_NOT_EMPTY check (HT_NAME is null or length(trim(HT_NAME)) > 0),
  constraint HT_PROFILE_TZ_NOT_EMPTY check (length(trim(HT_DEFAULT_TIMEZONE)) > 0)
);

create unique index if not exists HT_PROFILE_EMAIL_UX
  on public.HT_PROFILE (lower(HT_EMAIL))
  where HT_EMAIL is not null;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'HT_set_updated_at_profile'
  ) then
    create trigger HT_set_updated_at_profile
      before update on public.HT_PROFILE
      for each row execute function public.HT_handle_updated_at();
  end if;
end$$;

-- 4) auth.users -> HT_PROFILE 동기화 함수/트리거
-- NOTE: raw_user_meta_data 의 키는 provider별로 달라질 수 있으므로 name만 "있으면" 채움
create or replace function public.HT_handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  v_name := nullif(trim(coalesce(new.raw_user_meta_data->>'name', '')), '');

  insert into public.HT_PROFILE (HT_PROFILE_ID, HT_EMAIL, HT_NAME)
  values (new.id, new.email, v_name)
  on conflict (HT_PROFILE_ID) do update
    set HT_EMAIL = excluded.HT_EMAIL,
        HT_NAME = coalesce(excluded.HT_NAME, public.HT_PROFILE.HT_NAME);

  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where t.tgname = 'HT_on_auth_user_created'
      and n.nspname = 'auth'
      and c.relname = 'users'
  ) then
    create trigger HT_on_auth_user_created
      after insert on auth.users
      for each row execute function public.HT_handle_new_auth_user();
  end if;
end$$;

-- 5) 관심 종목
create table if not exists public.HT_STOCK (
  HT_STOCK_ID uuid primary key default gen_random_uuid(),
  HT_PROFILE_ID uuid not null references public.HT_PROFILE(HT_PROFILE_ID) on delete cascade,
  HT_NAME text not null,
  HT_TICKER text,
  HT_CREATED_AT timestamptz not null default now(),
  HT_UPDATED_AT timestamptz not null default now(),
  constraint HT_STOCK_NAME_NOT_EMPTY check (length(trim(HT_NAME)) > 0),
  constraint HT_STOCK_TICKER_NOT_EMPTY check (HT_TICKER is null or length(trim(HT_TICKER)) > 0)
);

create unique index if not exists HT_STOCK_PROFILE_TICKER_UX
  on public.HT_STOCK (HT_PROFILE_ID, lower(HT_TICKER))
  where HT_TICKER is not null;

create index if not exists HT_STOCK_PROFILE_CREATED_IX
  on public.HT_STOCK (HT_PROFILE_ID, HT_CREATED_AT desc);

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'HT_set_updated_at_stock') then
    create trigger HT_set_updated_at_stock
      before update on public.HT_STOCK
      for each row execute function public.HT_handle_updated_at();
  end if;
end$$;

-- 6) 리포트(종목별 히스토리)
create table if not exists public.HT_REPORT (
  HT_REPORT_ID uuid primary key default gen_random_uuid(),
  HT_PROFILE_ID uuid not null references public.HT_PROFILE(HT_PROFILE_ID) on delete cascade,
  HT_STOCK_ID uuid not null references public.HT_STOCK(HT_STOCK_ID) on delete cascade,
  HT_CONTENT text not null,
  HT_CREATED_AT timestamptz not null default now(),
  HT_UPDATED_AT timestamptz not null default now(),
  constraint HT_REPORT_CONTENT_NOT_EMPTY check (length(trim(HT_CONTENT)) > 0)
);

create index if not exists HT_REPORT_STOCK_CREATED_IX
  on public.HT_REPORT (HT_STOCK_ID, HT_CREATED_AT desc);

create index if not exists HT_REPORT_PROFILE_CREATED_IX
  on public.HT_REPORT (HT_PROFILE_ID, HT_CREATED_AT desc);

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'HT_set_updated_at_report') then
    create trigger HT_set_updated_at_report
      before update on public.HT_REPORT
      for each row execute function public.HT_handle_updated_at();
  end if;
end$$;

-- 7) 알림 채널/스케줄/히스토리 (Phase 2 대비)
create table if not exists public.HT_NOTIFICATION_CHANNEL (
  HT_NOTIFICATION_CHANNEL_ID uuid primary key default gen_random_uuid(),
  HT_PROFILE_ID uuid not null references public.HT_PROFILE(HT_PROFILE_ID) on delete cascade,
  HT_DELIVERY_TYPE_CODE_VALUE_ID bigint not null references public.HT_CODE_VALUE(HT_CODE_VALUE_ID) on delete restrict,
  HT_DELIVERY_TARGET text not null,
  HT_IS_ENABLED boolean not null default true,
  HT_CREATED_AT timestamptz not null default now(),
  HT_UPDATED_AT timestamptz not null default now(),
  constraint HT_NOTIFICATION_CHANNEL_TARGET_NOT_EMPTY check (length(trim(HT_DELIVERY_TARGET)) > 0)
);

create unique index if not exists HT_NOTIFICATION_CHANNEL_PROFILE_TYPE_TARGET_UX
  on public.HT_NOTIFICATION_CHANNEL (HT_PROFILE_ID, HT_DELIVERY_TYPE_CODE_VALUE_ID, lower(HT_DELIVERY_TARGET));

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'HT_set_updated_at_notification_channel') then
    create trigger HT_set_updated_at_notification_channel
      before update on public.HT_NOTIFICATION_CHANNEL
      for each row execute function public.HT_handle_updated_at();
  end if;
end$$;

-- days_mask: 7bit(Mon..Sun) => 1..127
create table if not exists public.HT_NOTIFICATION_SCHEDULE (
  HT_NOTIFICATION_SCHEDULE_ID uuid primary key default gen_random_uuid(),
  HT_NOTIFICATION_CHANNEL_ID uuid not null references public.HT_NOTIFICATION_CHANNEL(HT_NOTIFICATION_CHANNEL_ID) on delete cascade,
  HT_DAYS_MASK integer not null,
  HT_DELIVERY_TIME time not null,
  HT_TIMEZONE text,
  HT_IS_ENABLED boolean not null default true,
  HT_CREATED_AT timestamptz not null default now(),
  HT_UPDATED_AT timestamptz not null default now(),
  constraint HT_NOTIFICATION_SCHEDULE_DAYS_MASK_CHECK check (HT_DAYS_MASK between 1 and 127),
  constraint HT_NOTIFICATION_SCHEDULE_TZ_NOT_EMPTY check (HT_TIMEZONE is null or length(trim(HT_TIMEZONE)) > 0)
);

create unique index if not exists HT_NOTIFICATION_SCHEDULE_UX
  on public.HT_NOTIFICATION_SCHEDULE (HT_NOTIFICATION_CHANNEL_ID, HT_DAYS_MASK, HT_DELIVERY_TIME);

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'HT_set_updated_at_notification_schedule') then
    create trigger HT_set_updated_at_notification_schedule
      before update on public.HT_NOTIFICATION_SCHEDULE
      for each row execute function public.HT_handle_updated_at();
  end if;
end$$;

create table if not exists public.HT_NOTIFICATION (
  HT_NOTIFICATION_ID uuid primary key default gen_random_uuid(),
  HT_PROFILE_ID uuid not null references public.HT_PROFILE(HT_PROFILE_ID) on delete cascade,
  HT_REPORT_ID uuid references public.HT_REPORT(HT_REPORT_ID) on delete set null,
  HT_TYPE text not null,
  HT_MESSAGE text not null,
  HT_READ_AT timestamptz,
  HT_CREATED_AT timestamptz not null default now(),
  constraint HT_NOTIFICATION_TYPE_NOT_EMPTY check (length(trim(HT_TYPE)) > 0),
  constraint HT_NOTIFICATION_MESSAGE_NOT_EMPTY check (length(trim(HT_MESSAGE)) > 0)
);

create index if not exists HT_NOTIFICATION_PROFILE_CREATED_IX
  on public.HT_NOTIFICATION (HT_PROFILE_ID, HT_CREATED_AT desc);

-- 8) 기본 코드 삽입(DELIVERY_TYPE / PROFILE_STATUS)
-- 기존 데이터/코드 보존을 위해 upsert 패턴(존재여부 체크)으로만 추가
do $$
declare
  v_delivery_master_id bigint;
  v_status_master_id bigint;
begin
  -- DELIVERY_TYPE
  insert into public.HT_CODE_MASTER (HT_CODE_GROUP, HT_CODE_GROUP_NAME)
  values ('DELIVERY_TYPE', '알림 전달 방식')
  on conflict (HT_CODE_GROUP) do nothing;

  select HT_CODE_MASTER_ID into v_delivery_master_id
  from public.HT_CODE_MASTER
  where HT_CODE_GROUP = 'DELIVERY_TYPE';

  insert into public.HT_CODE_VALUE (HT_CODE_MASTER_ID, HT_CODE, HT_CODE_NAME, HT_SORT_ORDER)
  values
    (v_delivery_master_id, 'EMAIL', '이메일', 10),
    (v_delivery_master_id, 'KAKAO', '카카오', 20)
  on conflict (HT_CODE_MASTER_ID, HT_CODE) do nothing;

  -- PROFILE_STATUS
  insert into public.HT_CODE_MASTER (HT_CODE_GROUP, HT_CODE_GROUP_NAME)
  values ('PROFILE_STATUS', '프로필 상태')
  on conflict (HT_CODE_GROUP) do nothing;

  select HT_CODE_MASTER_ID into v_status_master_id
  from public.HT_CODE_MASTER
  where HT_CODE_GROUP = 'PROFILE_STATUS';

  insert into public.HT_CODE_VALUE (HT_CODE_MASTER_ID, HT_CODE, HT_CODE_NAME, HT_SORT_ORDER)
  values
    (v_status_master_id, 'ACTIVE', '활성', 10),
    (v_status_master_id, 'DISABLED', '비활성', 20)
  on conflict (HT_CODE_MASTER_ID, HT_CODE) do nothing;
end$$;

-- =========================================================
-- Verification Query (적용 확인)
-- =========================================================
-- select table_name from information_schema.tables where table_schema='public' and table_name like 'ht_%' order by 1;
-- select * from public.HT_CODE_MASTER where HT_CODE_GROUP in ('DELIVERY_TYPE','PROFILE_STATUS');
-- select m.HT_CODE_GROUP, v.HT_CODE, v.HT_CODE_NAME from public.HT_CODE_MASTER m join public.HT_CODE_VALUE v on v.HT_CODE_MASTER_ID=m.HT_CODE_MASTER_ID
--  where m.HT_CODE_GROUP='DELIVERY_TYPE' order by v.HT_SORT_ORDER;

-- =========================================================
-- Rollback SQL (비파괴 기본안)
-- =========================================================
-- 1) RLS/정책은 별도 파일에서 적용. 문제 시 해당 파일의 정책을 disable/revoke 하는 방식 권장.
-- 2) 트리거 비활성화(필요 시):
--    alter table public.HT_PROFILE disable trigger HT_set_updated_at_profile;
--    alter table auth.users disable trigger HT_on_auth_user_created;
-- 3) (승인 필요) 신규 테이블 DROP은 운영 정책상 금지. 꼭 필요하면 별도 승인 후 수행.

