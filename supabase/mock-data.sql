-- Mock Data for parungao.johnlloyd@ue.edu.ph (2 months: March-April 2026)
-- Run this SQL in Supabase SQL Editor

-- First, get or create the user
-- Note: Replace the UUID with the actual user ID from auth.users table
-- You can find it in Supabase Auth > Users

-- For this example, we'll use a placeholder UUID - replace with actual user ID

-- Clean up existing data for this user first
DELETE FROM public.transactions WHERE user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1);
DELETE FROM public.budgets WHERE user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1);
DELETE FROM public.savings_accounts WHERE user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1);
DELETE FROM public.subscriptions WHERE user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1);
DELETE FROM public.alerts WHERE user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1);
DELETE FROM public.wallets WHERE user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1);

-- Insert Wallets
WITH user_data AS (
  SELECT id FROM public.users 
  WHERE email = 'parungao.johnlloyd@ue.edu.ph'
  LIMIT 1
)
INSERT INTO public.wallets (user_id, type, name, balance, created_at, updated_at)
SELECT 
  id,
  'bank'::text,
  'BDO Checking',
  15000.00,
  NOW(),
  NOW()
FROM user_data
UNION ALL
SELECT 
  id,
  'ewallet'::text,
  'GCash',
  5500.00,
  NOW(),
  NOW()
FROM user_data
UNION ALL
SELECT 
  id,
  'bank'::text,
  'BPI Savings',
  8200.00,
  NOW(),
  NOW()
FROM user_data
UNION ALL
SELECT 
  id,
  'cash'::text,
  'Cash',
  2300.00,
  NOW(),
  NOW()
FROM user_data;

-- Insert Transactions
INSERT INTO public.transactions (user_id, type, amount, category, description, date, wallet_id, created_at)
-- Income Transactions March
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'income'::text, 25000, 'income', 'Monthly Allowance', '2026-03-01'::date, 
  (SELECT id FROM public.wallets WHERE name = 'BDO Checking' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'income'::text, 3500, 'income', 'Freelance Work', '2026-03-05'::date, 
  (SELECT id FROM public.wallets WHERE name = 'GCash' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'income'::text, 2000, 'income', 'Tutoring Gig', '2026-03-12'::date, 
  (SELECT id FROM public.wallets WHERE name = 'BDO Checking' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
-- Expense Transactions March
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'expense'::text, 450, 'food', 'Grocery Shopping', '2026-03-02'::date, 
  (SELECT id FROM public.wallets WHERE name = 'BDO Checking' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'expense'::text, 280, 'food', 'Restaurant - Lunch', '2026-03-03'::date, 
  (SELECT id FROM public.wallets WHERE name = 'GCash' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'expense'::text, 1200, 'transport', 'GrabCar - Monthly', '2026-03-04'::date, 
  (SELECT id FROM public.wallets WHERE name = 'GCash' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'expense'::text, 600, 'utilities', 'Internet Bill', '2026-03-05'::date, 
  (SELECT id FROM public.wallets WHERE name = 'BDO Checking' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'expense'::text, 299, 'entertainment', 'Netflix Subscription', '2026-03-06'::date, 
  (SELECT id FROM public.wallets WHERE name = 'BDO Checking' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'expense'::text, 350, 'shopping', 'Laptop Accessories', '2026-03-08'::date, 
  (SELECT id FROM public.wallets WHERE name = 'BDO Checking' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'expense'::text, 400, 'health', 'Pharmacy & Vitamins', '2026-03-10'::date, 
  (SELECT id FROM public.wallets WHERE name = 'Cash' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'expense'::text, 520, 'food', 'Grocery Shopping', '2026-03-12'::date, 
  (SELECT id FROM public.wallets WHERE name = 'BDO Checking' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'expense'::text, 180, 'transport', 'Jeepney fare', '2026-03-13'::date, 
  (SELECT id FROM public.wallets WHERE name = 'Cash' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'expense'::text, 850, 'education', 'Tuition Payment', '2026-03-15'::date, 
  (SELECT id FROM public.wallets WHERE name = 'BDO Checking' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'expense'::text, 200, 'food', 'Coffee & Snacks', '2026-03-15'::date, 
  (SELECT id FROM public.wallets WHERE name = 'GCash' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'expense'::text, 1500, 'shopping', 'New Shoes', '2026-03-18'::date, 
  (SELECT id FROM public.wallets WHERE name = 'BPI Savings' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'expense'::text, 350, 'entertainment', 'Movie tickets', '2026-03-20'::date, 
  (SELECT id FROM public.wallets WHERE name = 'GCash' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'expense'::text, 400, 'food', 'Restaurant - Dinner', '2026-03-22'::date, 
  (SELECT id FROM public.wallets WHERE name = 'BDO Checking' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'expense'::text, 2500, 'other', 'Medical checkup', '2026-03-25'::date, 
  (SELECT id FROM public.wallets WHERE name = 'BDO Checking' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
-- Income Transactions April 2026
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'income'::text, 25000, 'income', 'Monthly Allowance', '2026-04-01'::date, 
  (SELECT id FROM public.wallets WHERE name = 'BDO Checking' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'income'::text, 3000, 'income', 'Freelance Work', '2026-04-03'::date, 
  (SELECT id FROM public.wallets WHERE name = 'GCash' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'income'::text, 1500, 'income', 'Online selling profit', '2026-04-07'::date, 
  (SELECT id FROM public.wallets WHERE name = 'BDO Checking' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
-- Expense Transactions April
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'expense'::text, 480, 'food', 'Grocery Shopping', '2026-04-02'::date, 
  (SELECT id FROM public.wallets WHERE name = 'BDO Checking' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'expense'::text, 250, 'food', 'Restaurant - Lunch', '2026-04-04'::date, 
  (SELECT id FROM public.wallets WHERE name = 'GCash' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'expense'::text, 600, 'utilities', 'Internet Bill', '2026-04-05'::date, 
  (SELECT id FROM public.wallets WHERE name = 'BDO Checking' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'expense'::text, 150, 'transport', 'Jeepney fare', '2026-04-06'::date, 
  (SELECT id FROM public.wallets WHERE name = 'Cash' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'expense'::text, 799, 'entertainment', 'ASUS ROG Phone case', '2026-04-08'::date, 
  (SELECT id FROM public.wallets WHERE name = 'BDO Checking' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'expense'::text, 320, 'food', 'Grocery Shopping', '2026-04-09'::date, 
  (SELECT id FROM public.wallets WHERE name = 'BDO Checking' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'expense'::text, 200, 'health', 'Skincare products', '2026-04-10'::date, 
  (SELECT id FROM public.wallets WHERE name = 'GCash' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'expense'::text, 1200, 'education', 'Course fee', '2026-04-12'::date, 
  (SELECT id FROM public.wallets WHERE name = 'BDO Checking' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW() 
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'expense'::text, 450, 'food', 'Restaurant - Dinner with friends', '2026-04-14'::date, 
  (SELECT id FROM public.wallets WHERE name = 'BPI Savings' AND user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1) LIMIT 1),
  NOW();

-- Insert Budgets (March & April 2026)
INSERT INTO public.budgets (user_id, category, monthly_limit, month, created_at, updated_at)
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'food', 4500, '2026-03', NOW(), NOW()
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'transport', 2000, '2026-03', NOW(), NOW()
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'entertainment', 1500, '2026-03', NOW(), NOW()
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'shopping', 3000, '2026-03', NOW(), NOW()
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'education', 2000, '2026-03', NOW(), NOW()
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'utilities', 1000, '2026-03', NOW(), NOW()
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'health', 1500, '2026-03', NOW(), NOW()
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'food', 4500, '2026-04', NOW(), NOW()
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'transport', 2000, '2026-04', NOW(), NOW()
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'entertainment', 1500, '2026-04', NOW(), NOW()
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'shopping', 3000, '2026-04', NOW(), NOW()
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'education', 2000, '2026-04', NOW(), NOW()
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'utilities', 1000, '2026-04', NOW(), NOW()
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'health', 1500, '2026-04', NOW(), NOW();

-- Insert Savings Accounts
INSERT INTO public.savings_accounts (user_id, name, bank_name, balance, principal, interest_rate_pa, last_interest_date, color, notes, created_at)
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'Emergency Fund', 
  'GCash GSave', 
  12500.00, 
  12000.00, 
  4.5, 
  '2026-03-01'::date, 
  'from-cyan-500 to-blue-600',
  'For unexpected expenses',
  NOW()
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'Summer Vacation Fund', 
  'BPISave', 
  8750.50, 
  8000.00, 
  3.5, 
  '2026-03-01'::date, 
  'from-emerald-500 to-teal-600',
  'Target: ₱15,000 by May',
  NOW()
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'New Laptop Fund', 
  'Maya Savings', 
  5200.75, 
  4500.00, 
  5.0, 
  '2026-03-01'::date, 
  'from-amber-400 to-orange-500',
  'Target: ₱50,000 by Dec 2026',
  NOW();

-- Insert Subscriptions/Bills
INSERT INTO public.subscriptions (user_id, name, amount, billing_cycle, next_billing_date, category, created_at)
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'Netflix', 549, 'monthly', '2026-04-06'::date, 'entertainment', NOW()
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'Internet Bill', 600, 'monthly', '2026-04-05'::date, 'utilities', NOW()
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'Spotify', 129, 'monthly', '2026-04-10'::date, 'entertainment', NOW()
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'Globe Postpaid', 999, 'monthly', '2026-04-15'::date, 'utilities', NOW();

-- Insert Alerts
INSERT INTO public.alerts (user_id, type, title, message, category, severity, read, created_at)
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'budget_warning', 'Food Budget Warning', 'You are at 78% of your food budget this month', 'food', 'warning', false, NOW()
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'savings_milestone', 'Savings Goal Reached!', 'Your Emergency Fund has reached ₱12,500!', NULL, 'info', false, NOW()
UNION ALL
SELECT 
  (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1),
  'upcoming_payment', 'Upcoming Bill: Internet', 'Your internet bill of ₱600 is due on April 5', 'utilities', 'info', false, NOW();

-- Summary: Show all inserted data
SELECT '=== WALLETS ===' as info;
SELECT name, type, balance FROM public.wallets 
WHERE user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1)
ORDER BY created_at;

SELECT '' as blank;
SELECT '=== TRANSACTIONS (April 2026) ===' as info;
SELECT date, type, amount, category, description, wallet_id 
FROM public.transactions 
WHERE user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1)
AND date >= '2026-04-01'
ORDER BY date DESC;

SELECT '' as blank;
SELECT '=== BUDGETS (April 2026) ===' as info;
SELECT category, monthly_limit FROM public.budgets 
WHERE user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1)
AND month = '2026-04'
ORDER BY category;

SELECT '' as blank;
SELECT '=== SAVINGS ACCOUNTS ===' as info;
SELECT name, bank_name, balance, interest_rate_pa, principal FROM public.savings_accounts 
WHERE user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1);

SELECT '' as blank;
SELECT '=== SUBSCRIPTIONS ===' as info;
SELECT name, amount, billing_cycle, next_billing_date FROM public.subscriptions 
WHERE user_id = (SELECT id FROM public.users WHERE email = 'parungao.johnlloyd@ue.edu.ph' LIMIT 1);
