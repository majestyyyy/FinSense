WITH user_ctx AS (
  SELECT id
  FROM auth.users
  WHERE email = 'dabenath13@gmail.com'
)
INSERT INTO public.users (id, email, name, setup_complete, created_at, updated_at)
SELECT u.id, 'dabenath13@gmail.com', 'Dabe Nath', TRUE, '2026-01-01T08:00:00Z'::timestamptz, '2026-01-01T08:00:00Z'::timestamptz
FROM user_ctx u
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    name = EXCLUDED.name,
    setup_complete = EXCLUDED.setup_complete,
    updated_at = EXCLUDED.updated_at;

WITH user_ctx AS (
  SELECT id AS user_id FROM auth.users WHERE email = 'dabenath13@gmail.com'
)
INSERT INTO public.wallets (id, user_id, type, name, balance, created_at, updated_at)
SELECT v.id, uc.user_id, v.type, v.name, v.balance, v.created_at, v.updated_at
FROM user_ctx uc,
     (VALUES
       ('11111111-1111-1111-1111-111111111111'::uuid, 'bank', 'Checking Account', 42500.00, '2026-01-01T08:00:00Z'::timestamptz, '2026-01-01T08:00:00Z'::timestamptz),
       ('22222222-2222-2222-2222-222222222222'::uuid, 'ewallet', 'GCash', 9800.00, '2026-01-01T08:00:00Z'::timestamptz, '2026-01-01T08:00:00Z'::timestamptz)
     ) AS v(id, type, name, balance, created_at, updated_at)
ON CONFLICT (id) DO NOTHING;

WITH user_ctx AS (
  SELECT id AS user_id FROM auth.users WHERE email = 'dabenath13@gmail.com'
)
INSERT INTO public.transactions (id, user_id, type, amount, category, description, date, created_at, updated_at)
SELECT t.id, uc.user_id, t.type, t.amount, t.category, t.description, t.date, t.created_at, t.updated_at
FROM user_ctx uc,
     (VALUES
       ('a1111111-1111-1111-1111-111111111101'::uuid, 'income',  65000.00, 'other',         'January salary',                   '2026-01-05'::date, '2026-01-05T09:00:00Z'::timestamptz, '2026-01-05T09:00:00Z'::timestamptz),
       ('a1111111-1111-1111-1111-111111111102'::uuid, 'income',   7500.00, 'other',         'Freelance design gig',             '2026-01-25'::date, '2026-01-25T15:00:00Z'::timestamptz, '2026-01-25T15:00:00Z'::timestamptz),
       ('a1111111-1111-1111-1111-111111111103'::uuid, 'expense',  3200.00, 'food',          'SM Supermarket groceries',         '2026-01-07'::date, '2026-01-07T13:00:00Z'::timestamptz, '2026-01-07T13:00:00Z'::timestamptz),
       ('a1111111-1111-1111-1111-111111111104'::uuid, 'expense',  1850.00, 'food',          'Jollibee family dinner',           '2026-01-10'::date, '2026-01-10T19:30:00Z'::timestamptz, '2026-01-10T19:30:00Z'::timestamptz),
       ('a1111111-1111-1111-1111-111111111105'::uuid, 'expense',   420.00, 'food',          'Starbucks coffee runs',            '2026-01-13'::date, '2026-01-13T08:15:00Z'::timestamptz, '2026-01-13T08:15:00Z'::timestamptz),
       ('a1111111-1111-1111-1111-111111111106'::uuid, 'expense',  1200.00, 'food',          'Lunch with officemates',           '2026-01-15'::date, '2026-01-15T12:30:00Z'::timestamptz, '2026-01-15T12:30:00Z'::timestamptz),
       ('a1111111-1111-1111-1111-111111111107'::uuid, 'expense',   580.00, 'food',          'GrabFood delivery',                '2026-01-20'::date, '2026-01-20T20:00:00Z'::timestamptz, '2026-01-20T20:00:00Z'::timestamptz),
       ('a1111111-1111-1111-1111-111111111108'::uuid, 'expense',   950.00, 'transport',     'Grab rides to office',             '2026-01-08'::date, '2026-01-08T18:00:00Z'::timestamptz, '2026-01-08T18:00:00Z'::timestamptz),
       ('a1111111-1111-1111-1111-111111111109'::uuid, 'expense',   600.00, 'transport',     'MRT load top-up',                  '2026-01-14'::date, '2026-01-14T07:45:00Z'::timestamptz, '2026-01-14T07:45:00Z'::timestamptz),
       ('a1111111-1111-1111-1111-111111111110'::uuid, 'expense',   800.00, 'transport',     'Angkas rides weekend',             '2026-01-17'::date, '2026-01-17T14:00:00Z'::timestamptz, '2026-01-17T14:00:00Z'::timestamptz),
       ('a1111111-1111-1111-1111-111111111111'::uuid, 'expense',  1200.00, 'utilities',     'PLDT fiber monthly bill',          '2026-01-10'::date, '2026-01-10T20:00:00Z'::timestamptz, '2026-01-10T20:00:00Z'::timestamptz),
       ('a1111111-1111-1111-1111-111111111112'::uuid, 'expense',  3800.00, 'utilities',     'Meralco electricity bill',         '2026-01-15'::date, '2026-01-15T20:00:00Z'::timestamptz, '2026-01-15T20:00:00Z'::timestamptz),
       ('a1111111-1111-1111-1111-111111111113'::uuid, 'expense',   799.00, 'utilities',     'Globe mobile plan',                '2026-01-18'::date, '2026-01-18T10:00:00Z'::timestamptz, '2026-01-18T10:00:00Z'::timestamptz),
       ('a1111111-1111-1111-1111-111111111114'::uuid, 'expense',  2500.00, 'shopping',      'Uniqlo jeans and shirt',           '2026-01-18'::date, '2026-01-18T16:00:00Z'::timestamptz, '2026-01-18T16:00:00Z'::timestamptz),
       ('a1111111-1111-1111-1111-111111111115'::uuid, 'expense',   850.00, 'health',        'Mercury Drug medicines',           '2026-01-22'::date, '2026-01-22T11:00:00Z'::timestamptz, '2026-01-22T11:00:00Z'::timestamptz),
       ('a1111111-1111-1111-1111-111111111116'::uuid, 'expense',  1200.00, 'health',        'Gym membership January',           '2026-01-03'::date, '2026-01-03T07:00:00Z'::timestamptz, '2026-01-03T07:00:00Z'::timestamptz),
       ('a1111111-1111-1111-1111-111111111117'::uuid, 'expense',   499.00, 'entertainment', 'Netflix subscription',             '2026-01-01'::date, '2026-01-01T10:00:00Z'::timestamptz, '2026-01-01T10:00:00Z'::timestamptz),
       ('a1111111-1111-1111-1111-111111111118'::uuid, 'expense',   169.00, 'entertainment', 'Spotify subscription',             '2026-01-03'::date, '2026-01-03T10:00:00Z'::timestamptz, '2026-01-03T10:00:00Z'::timestamptz),
       ('a1111111-1111-1111-1111-111111111119'::uuid, 'expense',  1500.00, 'entertainment', 'SM Cinema movie dates',            '2026-01-24'::date, '2026-01-24T18:00:00Z'::timestamptz, '2026-01-24T18:00:00Z'::timestamptz),
       ('a2222222-2222-2222-2222-222222222201'::uuid, 'income',  65000.00, 'other',         'February salary',                  '2026-02-05'::date, '2026-02-05T09:00:00Z'::timestamptz, '2026-02-05T09:00:00Z'::timestamptz),
       ('a2222222-2222-2222-2222-222222222202'::uuid, 'income',   4500.00, 'other',         'Weekend tutoring',                 '2026-02-20'::date, '2026-02-20T10:00:00Z'::timestamptz, '2026-02-20T10:00:00Z'::timestamptz),
       ('a2222222-2222-2222-2222-222222222203'::uuid, 'expense',  3400.00, 'food',          'Puregold grocery run',             '2026-02-06'::date, '2026-02-06T14:00:00Z'::timestamptz, '2026-02-06T14:00:00Z'::timestamptz),
       ('a2222222-2222-2222-2222-222222222204'::uuid, 'expense',  2800.00, 'food',          'Valentines dinner at Cyma',        '2026-02-14'::date, '2026-02-14T19:00:00Z'::timestamptz, '2026-02-14T19:00:00Z'::timestamptz),
       ('a2222222-2222-2222-2222-222222222205'::uuid, 'expense',   700.00, 'food',          'Coffee and snacks',                '2026-02-23'::date, '2026-02-23T08:00:00Z'::timestamptz, '2026-02-23T08:00:00Z'::timestamptz),
       ('a2222222-2222-2222-2222-222222222206'::uuid, 'expense',   650.00, 'food',          'GrabFood orders',                  '2026-02-26'::date, '2026-02-26T21:00:00Z'::timestamptz, '2026-02-26T21:00:00Z'::timestamptz),
       ('a2222222-2222-2222-2222-222222222207'::uuid, 'expense',  1100.00, 'transport',     'Fuel refill Petron',               '2026-02-07'::date, '2026-02-07T09:30:00Z'::timestamptz, '2026-02-07T09:30:00Z'::timestamptz),
       ('a2222222-2222-2222-2222-222222222208'::uuid, 'expense',   750.00, 'transport',     'Grab rides week 2',                '2026-02-10'::date, '2026-02-10T18:30:00Z'::timestamptz, '2026-02-10T18:30:00Z'::timestamptz),
       ('a2222222-2222-2222-2222-222222222209'::uuid, 'expense',   500.00, 'transport',     'MRT load top-up',                  '2026-02-17'::date, '2026-02-17T07:30:00Z'::timestamptz, '2026-02-17T07:30:00Z'::timestamptz),
       ('a2222222-2222-2222-2222-222222222210'::uuid, 'expense',  4300.00, 'utilities',     'Meralco bill February',            '2026-02-09'::date, '2026-02-09T20:00:00Z'::timestamptz, '2026-02-09T20:00:00Z'::timestamptz),
       ('a2222222-2222-2222-2222-222222222211'::uuid, 'expense',  1200.00, 'utilities',     'PLDT fiber bill',                  '2026-02-10'::date, '2026-02-10T20:00:00Z'::timestamptz, '2026-02-10T20:00:00Z'::timestamptz),
       ('a2222222-2222-2222-2222-222222222212'::uuid, 'expense',   799.00, 'utilities',     'Globe mobile plan',                '2026-02-18'::date, '2026-02-18T10:00:00Z'::timestamptz, '2026-02-18T10:00:00Z'::timestamptz),
       ('a2222222-2222-2222-2222-222222222213'::uuid, 'expense',  6200.00, 'shopping',      'Nike jacket and rubber shoes',     '2026-02-18'::date, '2026-02-18T17:00:00Z'::timestamptz, '2026-02-18T17:00:00Z'::timestamptz),
       ('a2222222-2222-2222-2222-222222222214'::uuid, 'expense',  1800.00, 'shopping',      'Valentines gift for partner',      '2026-02-13'::date, '2026-02-13T15:00:00Z'::timestamptz, '2026-02-13T15:00:00Z'::timestamptz),
       ('a2222222-2222-2222-2222-222222222215'::uuid, 'expense',   499.00, 'entertainment', 'Netflix subscription',             '2026-02-01'::date, '2026-02-01T10:00:00Z'::timestamptz, '2026-02-01T10:00:00Z'::timestamptz),
       ('a2222222-2222-2222-2222-222222222216'::uuid, 'expense',   169.00, 'entertainment', 'Spotify subscription',             '2026-02-03'::date, '2026-02-03T10:00:00Z'::timestamptz, '2026-02-03T10:00:00Z'::timestamptz),
       ('a2222222-2222-2222-2222-222222222217'::uuid, 'expense',  1200.00, 'health',        'Gym membership February',          '2026-02-03'::date, '2026-02-03T07:00:00Z'::timestamptz, '2026-02-03T07:00:00Z'::timestamptz),
       ('a2222222-2222-2222-2222-222222222218'::uuid, 'expense',  1500.00, 'health',        'Annual physical exam St. Lukes',   '2026-02-22'::date, '2026-02-22T09:00:00Z'::timestamptz, '2026-02-22T09:00:00Z'::timestamptz),
       ('a3333333-3333-3333-3333-333333333301'::uuid, 'income',  65000.00, 'other',         'March salary',                     '2026-03-05'::date, '2026-03-05T09:00:00Z'::timestamptz, '2026-03-05T09:00:00Z'::timestamptz),
       ('a3333333-3333-3333-3333-333333333302'::uuid, 'income',   5800.00, 'other',         'Freelance copywriting',            '2026-03-22'::date, '2026-03-22T14:00:00Z'::timestamptz, '2026-03-22T14:00:00Z'::timestamptz),
       ('a3333333-3333-3333-3333-333333333303'::uuid, 'expense',  2800.00, 'food',          'Robinsons weekly groceries',       '2026-03-06'::date, '2026-03-06T13:00:00Z'::timestamptz, '2026-03-06T13:00:00Z'::timestamptz),
       ('a3333333-3333-3333-3333-333333333304'::uuid, 'expense',  1400.00, 'food',          'Mang Inasal team lunch',           '2026-03-11'::date, '2026-03-11T12:30:00Z'::timestamptz, '2026-03-11T12:30:00Z'::timestamptz),
       ('a3333333-3333-3333-3333-333333333305'::uuid, 'expense',   720.00, 'food',          'GrabFood late night orders',       '2026-03-16'::date, '2026-03-16T22:00:00Z'::timestamptz, '2026-03-16T22:00:00Z'::timestamptz),
       ('a3333333-3333-3333-3333-333333333306'::uuid, 'expense',   480.00, 'food',          'Ministop and 7-Eleven runs',       '2026-03-20'::date, '2026-03-20T23:00:00Z'::timestamptz, '2026-03-20T23:00:00Z'::timestamptz),
       ('a3333333-3333-3333-3333-333333333307'::uuid, 'expense',   950.00, 'transport',     'Grab to mall and back',            '2026-03-08'::date, '2026-03-08T18:00:00Z'::timestamptz, '2026-03-08T18:00:00Z'::timestamptz),
       ('a3333333-3333-3333-3333-333333333308'::uuid, 'expense',  1100.00, 'transport',     'Fuel refill Shell',                '2026-03-13'::date, '2026-03-13T08:00:00Z'::timestamptz, '2026-03-13T08:00:00Z'::timestamptz),
       ('a3333333-3333-3333-3333-333333333309'::uuid, 'expense',   600.00, 'transport',     'MRT and bus fare',                 '2026-03-19'::date, '2026-03-19T07:30:00Z'::timestamptz, '2026-03-19T07:30:00Z'::timestamptz),
       ('a3333333-3333-3333-3333-333333333310'::uuid, 'expense',  5200.00, 'utilities',     'Meralco and PLDT combined',        '2026-03-10'::date, '2026-03-10T20:00:00Z'::timestamptz, '2026-03-10T20:00:00Z'::timestamptz),
       ('a3333333-3333-3333-3333-333333333311'::uuid, 'expense',   799.00, 'utilities',     'Globe mobile plan',                '2026-03-18'::date, '2026-03-18T10:00:00Z'::timestamptz, '2026-03-18T10:00:00Z'::timestamptz),
       ('a3333333-3333-3333-3333-333333333312'::uuid, 'expense',  3100.00, 'entertainment', 'Ben&Ben concert tickets',          '2026-03-14'::date, '2026-03-14T20:30:00Z'::timestamptz, '2026-03-14T20:30:00Z'::timestamptz),
       ('a3333333-3333-3333-3333-333333333313'::uuid, 'expense',   499.00, 'entertainment', 'Netflix subscription',             '2026-03-01'::date, '2026-03-01T10:00:00Z'::timestamptz, '2026-03-01T10:00:00Z'::timestamptz),
       ('a3333333-3333-3333-3333-333333333314'::uuid, 'expense',   169.00, 'entertainment', 'Spotify subscription',             '2026-03-03'::date, '2026-03-03T10:00:00Z'::timestamptz, '2026-03-03T10:00:00Z'::timestamptz),
       ('a3333333-3333-3333-3333-333333333315'::uuid, 'expense',  1900.00, 'health',        'Gym membership March',             '2026-03-03'::date, '2026-03-03T07:00:00Z'::timestamptz, '2026-03-03T07:00:00Z'::timestamptz),
       ('a3333333-3333-3333-3333-333333333316'::uuid, 'expense',   650.00, 'health',        'Vitamins and supplements',         '2026-03-17'::date, '2026-03-17T11:00:00Z'::timestamptz, '2026-03-17T11:00:00Z'::timestamptz),
       ('a3333333-3333-3333-3333-333333333317'::uuid, 'expense',  1250.00, 'shopping',      'Office supplies Officeworks',      '2026-03-25'::date, '2026-03-25T16:00:00Z'::timestamptz, '2026-03-25T16:00:00Z'::timestamptz),
       ('a3333333-3333-3333-3333-333333333318'::uuid, 'expense',  2200.00, 'shopping',      'IKEA home organizers',             '2026-03-28'::date, '2026-03-28T14:00:00Z'::timestamptz, '2026-03-28T14:00:00Z'::timestamptz)
     ) AS t(id, type, amount, category, description, date, created_at, updated_at)
ON CONFLICT (id) DO NOTHING;

WITH user_ctx AS (
  SELECT id AS user_id FROM auth.users WHERE email = 'dabenath13@gmail.com'
)
INSERT INTO public.budgets (id, user_id, category, monthly_limit, month, created_at, updated_at)
SELECT b.id, uc.user_id, b.category, b.monthly_limit, b.month, b.created_at, b.updated_at
FROM user_ctx uc,
     (VALUES
       ('b1111111-1111-1111-1111-111111111111'::uuid, 'food',          15000.00, '2026-01', '2026-01-01T08:00:00Z'::timestamptz, '2026-01-01T08:00:00Z'::timestamptz),
       ('b1111111-1111-1111-1111-111111111112'::uuid, 'transport',      8000.00, '2026-01', '2026-01-01T08:00:00Z'::timestamptz, '2026-01-01T08:00:00Z'::timestamptz),
       ('b1111111-1111-1111-1111-111111111113'::uuid, 'utilities',      6000.00, '2026-01', '2026-01-01T08:00:00Z'::timestamptz, '2026-01-01T08:00:00Z'::timestamptz),
       ('b1111111-1111-1111-1111-111111111114'::uuid, 'entertainment',  3000.00, '2026-01', '2026-01-01T08:00:00Z'::timestamptz, '2026-01-01T08:00:00Z'::timestamptz),
       ('b1111111-1111-1111-1111-111111111115'::uuid, 'health',         3000.00, '2026-01', '2026-01-01T08:00:00Z'::timestamptz, '2026-01-01T08:00:00Z'::timestamptz),
       ('b2222222-2222-2222-2222-222222222221'::uuid, 'food',          16000.00, '2026-02', '2026-02-01T08:00:00Z'::timestamptz, '2026-02-01T08:00:00Z'::timestamptz),
       ('b2222222-2222-2222-2222-222222222222'::uuid, 'transport',      8500.00, '2026-02', '2026-02-01T08:00:00Z'::timestamptz, '2026-02-01T08:00:00Z'::timestamptz),
       ('b2222222-2222-2222-2222-222222222223'::uuid, 'utilities',      6500.00, '2026-02', '2026-02-01T08:00:00Z'::timestamptz, '2026-02-01T08:00:00Z'::timestamptz),
       ('b2222222-2222-2222-2222-222222222224'::uuid, 'entertainment',  4500.00, '2026-02', '2026-02-01T08:00:00Z'::timestamptz, '2026-02-01T08:00:00Z'::timestamptz),
       ('b2222222-2222-2222-2222-222222222225'::uuid, 'health',         3500.00, '2026-02', '2026-02-01T08:00:00Z'::timestamptz, '2026-02-01T08:00:00Z'::timestamptz),
       ('b3333333-3333-3333-3333-333333333331'::uuid, 'food',          15500.00, '2026-03', '2026-03-01T08:00:00Z'::timestamptz, '2026-03-01T08:00:00Z'::timestamptz),
       ('b3333333-3333-3333-3333-333333333332'::uuid, 'transport',      8500.00, '2026-03', '2026-03-01T08:00:00Z'::timestamptz, '2026-03-01T08:00:00Z'::timestamptz),
       ('b3333333-3333-3333-3333-333333333333'::uuid, 'utilities',      6000.00, '2026-03', '2026-03-01T08:00:00Z'::timestamptz, '2026-03-01T08:00:00Z'::timestamptz),
       ('b3333333-3333-3333-3333-333333333334'::uuid, 'entertainment',  4000.00, '2026-03', '2026-03-01T08:00:00Z'::timestamptz, '2026-03-01T08:00:00Z'::timestamptz),
       ('b3333333-3333-3333-3333-333333333335'::uuid, 'health',         3000.00, '2026-03', '2026-03-01T08:00:00Z'::timestamptz, '2026-03-01T08:00:00Z'::timestamptz)
     ) AS b(id, category, monthly_limit, month, created_at, updated_at)
ON CONFLICT (id) DO NOTHING;

WITH user_ctx AS (
  SELECT id AS user_id FROM auth.users WHERE email = 'dabenath13@gmail.com'
)
INSERT INTO public.subscriptions (id, user_id, name, amount, billing_cycle, next_billing_date, category, color, is_active, created_at, updated_at)
SELECT s.id, uc.user_id, s.name, s.amount, s.billing_cycle, s.next_billing_date, s.category, s.color, s.is_active, s.created_at, s.updated_at
FROM user_ctx uc,
     (VALUES
       ('51111111-1111-1111-1111-111111111111'::uuid, 'Netflix',        499.00, 'monthly', '2026-04-01'::date, 'entertainment', '#E50914', TRUE, '2026-01-01T08:00:00Z'::timestamptz, '2026-01-01T08:00:00Z'::timestamptz),
       ('51111111-1111-1111-1111-111111111112'::uuid, 'Spotify',        169.00, 'monthly', '2026-04-03'::date, 'entertainment', '#1DB954', TRUE, '2026-01-01T08:00:00Z'::timestamptz, '2026-01-01T08:00:00Z'::timestamptz),
       ('51111111-1111-1111-1111-111111111113'::uuid, 'Globe Mobile',   799.00, 'monthly', '2026-04-05'::date, 'utilities',     '#FF6B6B', TRUE, '2026-01-01T08:00:00Z'::timestamptz, '2026-01-01T08:00:00Z'::timestamptz),
       ('51111111-1111-1111-1111-111111111114'::uuid, 'Gym Membership', 1200.00,'monthly', '2026-04-10'::date, 'health',        '#4ECDC4', TRUE, '2026-01-01T08:00:00Z'::timestamptz, '2026-01-01T08:00:00Z'::timestamptz)
     ) AS s(id, name, amount, billing_cycle, next_billing_date, category, color, is_active, created_at, updated_at)
ON CONFLICT (id) DO NOTHING;

WITH user_ctx AS (
  SELECT id AS user_id FROM auth.users WHERE email = 'dabenath13@gmail.com'
)
INSERT INTO public.savings_accounts (id, user_id, name, bank_name, balance, principal, interest_rate_pa, last_interest_date, color, notes, created_at, updated_at)
SELECT sv.id, uc.user_id, sv.name, sv.bank_name, sv.balance, sv.principal, sv.interest_rate_pa, sv.last_interest_date, sv.color, sv.notes, sv.created_at, sv.updated_at
FROM user_ctx uc,
     (VALUES
       ('59111111-1111-1111-1111-111111111111'::uuid, 'Emergency Fund', 'BDO', 25000.00, 25000.00, 4.500, '2026-01-01'::date, '#4ECDC4', '3-month safety buffer', '2026-01-01T08:00:00Z'::timestamptz, '2026-01-01T08:00:00Z'::timestamptz),
       ('59111111-1111-1111-1111-111111111112'::uuid, 'Vacation Fund',  'BPI', 12000.00, 12000.00, 3.200, '2026-01-01'::date, '#6C5CE7', 'Summer travel',         '2026-01-01T08:00:00Z'::timestamptz, '2026-01-01T08:00:00Z'::timestamptz)
     ) AS sv(id, name, bank_name, balance, principal, interest_rate_pa, last_interest_date, color, notes, created_at, updated_at)
ON CONFLICT (id) DO NOTHING;

WITH user_ctx AS (
  SELECT id AS user_id FROM auth.users WHERE email = 'dabenath13@gmail.com'
)
INSERT INTO public.bnpl_accounts (id, user_id, provider, name, credit_limit, used_credit, due_date, minimum_payment, monthly_installment, is_active, created_at, updated_at)
SELECT bn.id, uc.user_id, bn.provider, bn.name, bn.credit_limit, bn.used_credit, bn.due_date, bn.minimum_payment, bn.monthly_installment, bn.is_active, bn.created_at, bn.updated_at
FROM user_ctx uc,
     (VALUES
       ('b4111111-1111-1111-1111-111111111111'::uuid, 'home_credit', 'Laptop Installment',     50000.00, 26000.00, '2026-04-15'::date, 2050.00, 2050.00, TRUE, '2026-01-05T09:00:00Z'::timestamptz, '2026-01-05T09:00:00Z'::timestamptz),
       ('b4111111-1111-1111-1111-111111111112'::uuid, 'lazpaylater', 'Smartphone Installment', 25000.00, 10200.00, '2026-04-20'::date, 1020.00, 1020.00, TRUE, '2026-01-10T11:00:00Z'::timestamptz, '2026-01-10T11:00:00Z'::timestamptz)
     ) AS bn(id, provider, name, credit_limit, used_credit, due_date, minimum_payment, monthly_installment, is_active, created_at, updated_at)
ON CONFLICT (id) DO NOTHING;

WITH user_ctx AS (
  SELECT id AS user_id FROM auth.users WHERE email = 'dabenath13@gmail.com'
)
INSERT INTO public.alerts (id, user_id, type, title, message, category, severity, read, created_at)
SELECT al.id, uc.user_id, al.type, al.title, al.message, al.category, al.severity, al.read, al.created_at
FROM user_ctx uc,
     (VALUES
       ('a4111111-1111-1111-1111-111111111111'::uuid, 'budget_exceeded',  'Food budget nearly reached', 'You have spent 90% of your monthly food budget for Mar 2026.',  'food',          'warning', FALSE, '2026-03-25T08:00:00Z'::timestamptz),
       ('a4111111-1111-1111-1111-111111111112'::uuid, 'upcoming_payment', 'Netflix billing due',        'Netflix subscription is due on 2026-04-01.',                    'entertainment', 'info',    FALSE, '2026-03-28T10:00:00Z'::timestamptz),
       ('a4111111-1111-1111-1111-111111111113'::uuid, 'upcoming_payment', 'Home Credit payment due',    'Your laptop installment of 2,050 is due on 2026-04-15.',        'shopping',      'warning', FALSE, '2026-04-08T09:00:00Z'::timestamptz),
       ('a4111111-1111-1111-1111-111111111114'::uuid, 'budget_exceeded',  'Entertainment over budget',  'You exceeded your entertainment budget by 768 in March 2026.',  'entertainment', 'error',   FALSE, '2026-03-31T23:00:00Z'::timestamptz)
     ) AS al(id, type, title, message, category, severity, read, created_at)
ON CONFLICT (id) DO NOTHING;

WITH user_ctx AS (
  SELECT id AS user_id FROM auth.users WHERE email = 'dabenath13@gmail.com'
)
INSERT INTO public.chat_messages (id, user_id, role, content, timestamp)
SELECT cm.id, uc.user_id, cm.role, cm.content, cm.timestamp
FROM user_ctx uc,
     (VALUES
       ('c1111111-1111-1111-1111-111111111111'::uuid, 'user',      'Show me my spending summary for March.',                                                                         '2026-03-26T08:15:00Z'::timestamptz),
       ('c1111111-1111-1111-1111-111111111112'::uuid, 'assistant', 'Your March spending is 31,500, with food and utilities as the top categories.',                                  '2026-03-26T08:15:02Z'::timestamptz),
       ('c1111111-1111-1111-1111-111111111113'::uuid, 'user',      'Am I over budget on entertainment?',                                                                             '2026-03-31T22:00:00Z'::timestamptz),
       ('c1111111-1111-1111-1111-111111111114'::uuid, 'assistant', 'Yes. You spent 3,768 on entertainment in March against a 3,000 budget. The concert tickets pushed you over.',   '2026-03-31T22:00:03Z'::timestamptz)
     ) AS cm(id, role, content, timestamp)
ON CONFLICT (id) DO NOTHING;

WITH user_ctx AS (
  SELECT id AS user_id FROM auth.users WHERE email = 'dabenath13@gmail.com'
)
INSERT INTO public.transactions (id, user_id, type, amount, category, description, date, created_at, updated_at)
SELECT t.id, uc.user_id, t.type, t.amount, t.category, t.description, t.date, t.created_at, t.updated_at
FROM user_ctx uc,
     (VALUES
       ('a4444444-4444-4444-4444-444444444401'::uuid, 'income',  65000.00, 'other',         'April salary',              '2026-04-05'::date, '2026-04-05T09:00:00Z'::timestamptz, '2026-04-05T09:00:00Z'::timestamptz),
       ('a4444444-4444-4444-4444-444444444402'::uuid, 'expense',  3500.00, 'food',          'SM Supermarket groceries',  '2026-04-07'::date, '2026-04-07T13:00:00Z'::timestamptz, '2026-04-07T13:00:00Z'::timestamptz),
       ('a4444444-4444-4444-4444-444444444403'::uuid, 'expense',   950.00, 'transport',     'Grab rides to office',      '2026-04-08'::date, '2026-04-08T18:00:00Z'::timestamptz, '2026-04-08T18:00:00Z'::timestamptz),
       ('a4444444-4444-4444-4444-444444444404'::uuid, 'expense',  3800.00, 'utilities',     'Meralco electricity bill',  '2026-04-09'::date, '2026-04-09T20:00:00Z'::timestamptz, '2026-04-09T20:00:00Z'::timestamptz),
       ('a4444444-4444-4444-4444-444444444405'::uuid, 'expense',  1200.00, 'utilities',     'PLDT fiber bill',           '2026-04-10'::date, '2026-04-10T20:00:00Z'::timestamptz, '2026-04-10T20:00:00Z'::timestamptz),
       ('a4444444-4444-4444-4444-444444444406'::uuid, 'expense',   499.00, 'entertainment', 'Netflix subscription',      '2026-04-01'::date, '2026-04-01T10:00:00Z'::timestamptz, '2026-04-01T10:00:00Z'::timestamptz),
       ('a4444444-4444-4444-4444-444444444407'::uuid, 'expense',   169.00, 'entertainment', 'Spotify subscription',      '2026-04-03'::date, '2026-04-03T10:00:00Z'::timestamptz, '2026-04-03T10:00:00Z'::timestamptz),
       ('a4444444-4444-4444-4444-444444444408'::uuid, 'expense',  1200.00, 'health',        'Gym membership April',      '2026-04-03'::date, '2026-04-03T07:00:00Z'::timestamptz, '2026-04-03T07:00:00Z'::timestamptz),
       ('a4444444-4444-4444-4444-444444444409'::uuid, 'expense',   799.00, 'utilities',     'Globe mobile plan',         '2026-04-05'::date, '2026-04-05T10:00:00Z'::timestamptz, '2026-04-05T10:00:00Z'::timestamptz),
       ('a4444444-4444-4444-4444-444444444410'::uuid, 'expense',  1400.00, 'food',          'Lunch with team',           '2026-04-11'::date, '2026-04-11T12:30:00Z'::timestamptz, '2026-04-11T12:30:00Z'::timestamptz)
     ) AS t(id, type, amount, category, description, date, created_at, updated_at)
ON CONFLICT (id) DO NOTHING;