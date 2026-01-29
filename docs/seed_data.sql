-- =====================================================
-- harutuja Seed Data
-- Purpose: Local / Initial Supabase Seeding
-- Policy: No Destructive Change, Idempotent Inserts
-- =====================================================

-- =====================================================
-- 1. Test Users (profiles)
-- =====================================================
-- NOTE:
-- - Must be executed with service_role
-- - profiles.id must match auth.users.id
-- =====================================================

insert into public.profiles (id, email, name)
values
  ('11111111-1111-1111-1111-111111111111', 'minsu@harutuja.dev', '김민수'),
  ('22222222-2222-2222-2222-222222222222', 'jiyoon@harutuja.dev', '박지윤'),
  ('33333333-3333-3333-3333-333333333333', 'seojun@harutuja.dev', '이서준'),
  ('44444444-4444-4444-4444-444444444444', 'hyerin@harutuja.dev', '정혜린'),
  ('55555555-5555-5555-5555-555555555555', 'taehyun@harutuja.dev', '최태현')
on conflict do nothing;

-- =====================================================
-- 2. Test Stocks
-- =====================================================

insert into public.stocks (id, user_id, name, ticker)
values
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '삼성전자', '005930'),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '카카오', '035720'),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', '네이버', '035420'),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', '현대차', '005380'),
  (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'LG에너지솔루션', '373220')
on conflict do nothing;

-- =====================================================
-- 3. Sample Reports
-- =====================================================
-- Each report references a stock owned by the same user
-- =====================================================

insert into public.reports (id, user_id, stock_id, content)
select
  gen_random_uuid(),
  s.user_id,
  s.id,
  case s.name
    when '삼성전자' then '반도체 업황 회복 기대감으로 장기 보유 관점 유지'
    when '카카오' then '플랫폼 규제 리스크는 있으나 중장기 성장성 유효'
    when '네이버' then 'AI 및 글로벌 사업 확장 가능성 긍정적'
    when '현대차' then '전기차 라인업 강화로 실적 개선 기대'
    else '2차전지 수요 증가에 따른 성장 가능성 확인'
  end
from public.stocks s
on conflict do nothing;

-- =====================================================
-- END OF SEED DATA
-- =====================================================
