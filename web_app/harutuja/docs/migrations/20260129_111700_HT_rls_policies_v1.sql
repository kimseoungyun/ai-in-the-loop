-- =========================================================
-- [harutuja] HT_ RLS 정책 적용 (v1)
-- 파일명: 20260129_111700_HT_rls_policies_v1.sql
--
-- 변경 사유:
-- - Supabase 운영 표준: 사용자별 데이터 격리(RLS) 필수
-- - HT_REPORT는 "내 profile + 내 stock" 소유 정합성을 INSERT/UPDATE 시점에 강제
--
-- 영향도(Impact) 평가:
-- - DB: HT_* 테이블에 RLS 활성화 및 정책 추가
-- - APP/API: 클라이언트 쿼리는 auth.uid 기반으로 제한됨. 서비스 롤(서버)은 RLS 우회 가능.
--
-- Rollback(원복) 구문:
-- - DROP 대신 비파괴로 RLS disable 제공(즉시 복구용)
-- =========================================================

-- ---------------------------------------------------------
-- HT_PROFILE
-- ---------------------------------------------------------
alter table public.HT_PROFILE enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='ht_profile' and policyname='HT_PROFILE_select_own'
  ) then
    execute $p$
      create policy "HT_PROFILE_select_own"
        on public.HT_PROFILE for select
        using (auth.uid() = HT_PROFILE_ID)
    $p$;
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='ht_profile' and policyname='HT_PROFILE_update_own'
  ) then
    execute $p$
      create policy "HT_PROFILE_update_own"
        on public.HT_PROFILE for update
        using (auth.uid() = HT_PROFILE_ID)
        with check (auth.uid() = HT_PROFILE_ID)
    $p$;
  end if;
end$$;

-- ---------------------------------------------------------
-- HT_STOCK
-- ---------------------------------------------------------
alter table public.HT_STOCK enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='ht_stock' and policyname='HT_STOCK_select_own'
  ) then
    execute $p$
      create policy "HT_STOCK_select_own"
        on public.HT_STOCK for select
        using (auth.uid() = HT_PROFILE_ID)
    $p$;
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='ht_stock' and policyname='HT_STOCK_insert_own'
  ) then
    execute $p$
      create policy "HT_STOCK_insert_own"
        on public.HT_STOCK for insert
        with check (auth.uid() = HT_PROFILE_ID)
    $p$;
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='ht_stock' and policyname='HT_STOCK_update_own'
  ) then
    execute $p$
      create policy "HT_STOCK_update_own"
        on public.HT_STOCK for update
        using (auth.uid() = HT_PROFILE_ID)
        with check (auth.uid() = HT_PROFILE_ID)
    $p$;
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='ht_stock' and policyname='HT_STOCK_delete_own'
  ) then
    execute $p$
      create policy "HT_STOCK_delete_own"
        on public.HT_STOCK for delete
        using (auth.uid() = HT_PROFILE_ID)
    $p$;
  end if;
end$$;

-- ---------------------------------------------------------
-- HT_REPORT
-- ---------------------------------------------------------
alter table public.HT_REPORT enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='ht_report' and policyname='HT_REPORT_select_own'
  ) then
    execute $p$
      create policy "HT_REPORT_select_own"
        on public.HT_REPORT for select
        using (auth.uid() = HT_PROFILE_ID)
    $p$;
  end if;

  -- 핵심: 내 profile + 내 stock 소유 정합성 검증
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='ht_report' and policyname='HT_REPORT_insert_own_stock'
  ) then
    execute $p$
      create policy "HT_REPORT_insert_own_stock"
        on public.HT_REPORT for insert
        with check (
          auth.uid() = HT_PROFILE_ID
          and exists (
            select 1
            from public.HT_STOCK s
            where s.HT_STOCK_ID = HT_STOCK_ID
              and s.HT_PROFILE_ID = auth.uid()
          )
        )
    $p$;
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='ht_report' and policyname='HT_REPORT_update_own'
  ) then
    execute $p$
      create policy "HT_REPORT_update_own"
        on public.HT_REPORT for update
        using (auth.uid() = HT_PROFILE_ID)
        with check (
          auth.uid() = HT_PROFILE_ID
          and exists (
            select 1
            from public.HT_STOCK s
            where s.HT_STOCK_ID = HT_STOCK_ID
              and s.HT_PROFILE_ID = auth.uid()
          )
        )
    $p$;
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='ht_report' and policyname='HT_REPORT_delete_own'
  ) then
    execute $p$
      create policy "HT_REPORT_delete_own"
        on public.HT_REPORT for delete
        using (auth.uid() = HT_PROFILE_ID)
    $p$;
  end if;
end$$;

-- ---------------------------------------------------------
-- HT_NOTIFICATION_CHANNEL
-- ---------------------------------------------------------
alter table public.HT_NOTIFICATION_CHANNEL enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='ht_notification_channel' and policyname='HT_NOTIFICATION_CHANNEL_select_own'
  ) then
    execute $p$
      create policy "HT_NOTIFICATION_CHANNEL_select_own"
        on public.HT_NOTIFICATION_CHANNEL for select
        using (auth.uid() = HT_PROFILE_ID)
    $p$;
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='ht_notification_channel' and policyname='HT_NOTIFICATION_CHANNEL_insert_own'
  ) then
    execute $p$
      create policy "HT_NOTIFICATION_CHANNEL_insert_own"
        on public.HT_NOTIFICATION_CHANNEL for insert
        with check (auth.uid() = HT_PROFILE_ID)
    $p$;
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='ht_notification_channel' and policyname='HT_NOTIFICATION_CHANNEL_update_own'
  ) then
    execute $p$
      create policy "HT_NOTIFICATION_CHANNEL_update_own"
        on public.HT_NOTIFICATION_CHANNEL for update
        using (auth.uid() = HT_PROFILE_ID)
        with check (auth.uid() = HT_PROFILE_ID)
    $p$;
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='ht_notification_channel' and policyname='HT_NOTIFICATION_CHANNEL_delete_own'
  ) then
    execute $p$
      create policy "HT_NOTIFICATION_CHANNEL_delete_own"
        on public.HT_NOTIFICATION_CHANNEL for delete
        using (auth.uid() = HT_PROFILE_ID)
    $p$;
  end if;
end$$;

-- ---------------------------------------------------------
-- HT_NOTIFICATION_SCHEDULE (소유 검증: channel 통해 간접 확인)
-- ---------------------------------------------------------
alter table public.HT_NOTIFICATION_SCHEDULE enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='ht_notification_schedule' and policyname='HT_NOTIFICATION_SCHEDULE_select_own'
  ) then
    execute $p$
      create policy "HT_NOTIFICATION_SCHEDULE_select_own"
        on public.HT_NOTIFICATION_SCHEDULE for select
        using (
          exists (
            select 1
            from public.HT_NOTIFICATION_CHANNEL c
            where c.HT_NOTIFICATION_CHANNEL_ID = HT_NOTIFICATION_CHANNEL_ID
              and c.HT_PROFILE_ID = auth.uid()
          )
        )
    $p$;
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='ht_notification_schedule' and policyname='HT_NOTIFICATION_SCHEDULE_insert_own'
  ) then
    execute $p$
      create policy "HT_NOTIFICATION_SCHEDULE_insert_own"
        on public.HT_NOTIFICATION_SCHEDULE for insert
        with check (
          exists (
            select 1
            from public.HT_NOTIFICATION_CHANNEL c
            where c.HT_NOTIFICATION_CHANNEL_ID = HT_NOTIFICATION_CHANNEL_ID
              and c.HT_PROFILE_ID = auth.uid()
          )
        )
    $p$;
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='ht_notification_schedule' and policyname='HT_NOTIFICATION_SCHEDULE_update_own'
  ) then
    execute $p$
      create policy "HT_NOTIFICATION_SCHEDULE_update_own"
        on public.HT_NOTIFICATION_SCHEDULE for update
        using (
          exists (
            select 1
            from public.HT_NOTIFICATION_CHANNEL c
            where c.HT_NOTIFICATION_CHANNEL_ID = HT_NOTIFICATION_CHANNEL_ID
              and c.HT_PROFILE_ID = auth.uid()
          )
        )
        with check (
          exists (
            select 1
            from public.HT_NOTIFICATION_CHANNEL c
            where c.HT_NOTIFICATION_CHANNEL_ID = HT_NOTIFICATION_CHANNEL_ID
              and c.HT_PROFILE_ID = auth.uid()
          )
        )
    $p$;
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='ht_notification_schedule' and policyname='HT_NOTIFICATION_SCHEDULE_delete_own'
  ) then
    execute $p$
      create policy "HT_NOTIFICATION_SCHEDULE_delete_own"
        on public.HT_NOTIFICATION_SCHEDULE for delete
        using (
          exists (
            select 1
            from public.HT_NOTIFICATION_CHANNEL c
            where c.HT_NOTIFICATION_CHANNEL_ID = HT_NOTIFICATION_CHANNEL_ID
              and c.HT_PROFILE_ID = auth.uid()
          )
        )
    $p$;
  end if;
end$$;

-- ---------------------------------------------------------
-- HT_NOTIFICATION (사용자 측은 읽음처리 update + 조회만)
-- ---------------------------------------------------------
alter table public.HT_NOTIFICATION enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='ht_notification' and policyname='HT_NOTIFICATION_select_own'
  ) then
    execute $p$
      create policy "HT_NOTIFICATION_select_own"
        on public.HT_NOTIFICATION for select
        using (auth.uid() = HT_PROFILE_ID)
    $p$;
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='ht_notification' and policyname='HT_NOTIFICATION_update_read_own'
  ) then
    execute $p$
      create policy "HT_NOTIFICATION_update_read_own"
        on public.HT_NOTIFICATION for update
        using (auth.uid() = HT_PROFILE_ID)
        with check (auth.uid() = HT_PROFILE_ID)
    $p$;
  end if;
end$$;

-- =========================================================
-- Verification Query
-- =========================================================
-- select schemaname, tablename, policyname from pg_policies where schemaname='public' and tablename like 'ht_%' order by tablename, policyname;

-- =========================================================
-- Rollback SQL (비파괴)
-- =========================================================
-- alter table public.HT_PROFILE disable row level security;
-- alter table public.HT_STOCK disable row level security;
-- alter table public.HT_REPORT disable row level security;
-- alter table public.HT_NOTIFICATION_CHANNEL disable row level security;
-- alter table public.HT_NOTIFICATION_SCHEDULE disable row level security;
-- alter table public.HT_NOTIFICATION disable row level security;

