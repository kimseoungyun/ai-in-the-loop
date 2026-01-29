-- =========================================================
-- 하루투자 (Supabase / PostgreSQL) - RLS Policies
-- Generated: 2026-01-29
-- =========================================================

-- profiles
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- stocks
alter table public.stocks enable row level security;

drop policy if exists "stocks_select_own" on public.stocks;
create policy "stocks_select_own"
  on public.stocks for select
  using (auth.uid() = user_id);

drop policy if exists "stocks_insert_own" on public.stocks;
create policy "stocks_insert_own"
  on public.stocks for insert
  with check (auth.uid() = user_id);

drop policy if exists "stocks_update_own" on public.stocks;
create policy "stocks_update_own"
  on public.stocks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "stocks_delete_own" on public.stocks;
create policy "stocks_delete_own"
  on public.stocks for delete
  using (auth.uid() = user_id);

-- reports
alter table public.reports enable row level security;

drop policy if exists "reports_select_own" on public.reports;
create policy "reports_select_own"
  on public.reports for select
  using (auth.uid() = user_id);

-- 핵심: 내 user_id + 내 stock_id(소유)만 insert 허용
drop policy if exists "reports_insert_own_stock" on public.reports;
create policy "reports_insert_own_stock"
  on public.reports for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.stocks s
      where s.id = stock_id
        and s.user_id = auth.uid()
    )
  );

drop policy if exists "reports_update_own" on public.reports;
create policy "reports_update_own"
  on public.reports for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.stocks s
      where s.id = stock_id
        and s.user_id = auth.uid()
    )
  );

drop policy if exists "reports_delete_own" on public.reports;
create policy "reports_delete_own"
  on public.reports for delete
  using (auth.uid() = user_id);

-- notification_channels
alter table public.notification_channels enable row level security;

drop policy if exists "notification_channels_select_own" on public.notification_channels;
create policy "notification_channels_select_own"
  on public.notification_channels for select
  using (auth.uid() = user_id);

drop policy if exists "notification_channels_insert_own" on public.notification_channels;
create policy "notification_channels_insert_own"
  on public.notification_channels for insert
  with check (auth.uid() = user_id);

drop policy if exists "notification_channels_update_own" on public.notification_channels;
create policy "notification_channels_update_own"
  on public.notification_channels for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "notification_channels_delete_own" on public.notification_channels;
create policy "notification_channels_delete_own"
  on public.notification_channels for delete
  using (auth.uid() = user_id);

-- notification_schedules (ownership via channel)
alter table public.notification_schedules enable row level security;

drop policy if exists "notification_schedules_select_own" on public.notification_schedules;
create policy "notification_schedules_select_own"
  on public.notification_schedules for select
  using (
    exists (
      select 1
      from public.notification_channels c
      where c.id = channel_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "notification_schedules_insert_own" on public.notification_schedules;
create policy "notification_schedules_insert_own"
  on public.notification_schedules for insert
  with check (
    exists (
      select 1
      from public.notification_channels c
      where c.id = channel_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "notification_schedules_update_own" on public.notification_schedules;
create policy "notification_schedules_update_own"
  on public.notification_schedules for update
  using (
    exists (
      select 1
      from public.notification_channels c
      where c.id = channel_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.notification_channels c
      where c.id = channel_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "notification_schedules_delete_own" on public.notification_schedules;
create policy "notification_schedules_delete_own"
  on public.notification_schedules for delete
  using (
    exists (
      select 1
      from public.notification_channels c
      where c.id = channel_id
        and c.user_id = auth.uid()
    )
  );

-- notifications
alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

-- 사용자 측에서는 읽음 처리(update)만 허용하는 운영 패턴을 권장
drop policy if exists "notifications_update_read_own" on public.notifications;
create policy "notifications_update_read_own"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 의도적으로 INSERT/DELETE 정책은 만들지 않습니다.
-- - 알림 생성/삭제는 서버(서비스 롤 키, 백그라운드 작업)에서 수행하는 운영 모델을 권장합니다.

