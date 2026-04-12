-- Mock data for 3 months (Jan/Feb/Mar 2026)
-- This script resolves the current user via email so you do not need to replace a UUID manually.
-- Make sure the email below matches the Supabase auth user email.

INSERT INTO public.users (id, email, name, setup_complete, created_at, updated_at)
SELECT id, email, 'Dabe Nath', TRUE, '2026-01-01T08:00:00Z', '2026-01-01T08:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com'
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    name = EXCLUDED.name,
    setup_complete = EXCLUDED.setup_complete,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.wallets (id, user_id, type, name, balance, created_at, updated_at)
SELECT '11111111-1111-1111-1111-111111111111', id, 'bank', 'Checking Account', 42500.00, '2026-01-01T08:00:00Z', '2026-01-01T08:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.wallets (id, user_id, type, name, balance, created_at, updated_at)
SELECT '22222222-2222-2222-2222-222222222222', id, 'ewallet', 'GCash', 9800.00, '2026-01-01T08:00:00Z', '2026-01-01T08:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.transactions (id, user_id, type, amount, category, description, date, created_at, updated_at)
SELECT 'a1111111-1111-1111-1111-111111111111', id, 'income', 65000.00, 'other', 'January salary', '2026-01-05', '2026-01-05T09:00:00Z', '2026-01-05T09:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.transactions (id, user_id, type, amount, category, description, date, created_at, updated_at)
SELECT 'a1111111-1111-1111-1111-111111111112', id, 'expense', 3200.00, 'food', 'Groceries at SM Supermarket', '2026-01-07', '2026-01-07T13:00:00Z', '2026-01-07T13:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.transactions (id, user_id, type, amount, category, description, date, created_at, updated_at)
SELECT 'a1111111-1111-1111-1111-111111111113', id, 'expense', 950.00, 'transport', 'Grab ride to office', '2026-01-08', '2026-01-08T18:00:00Z', '2026-01-08T18:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.transactions (id, user_id, type, amount, category, description, date, created_at, updated_at)
SELECT 'a1111111-1111-1111-1111-111111111114', id, 'expense', 1200.00, 'utilities', 'PLDT monthly bill', '2026-01-10', '2026-01-10T20:00:00Z', '2026-01-10T20:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.transactions (id, user_id, type, amount, category, description, date, created_at, updated_at)
SELECT 'a1111111-1111-1111-1111-111111111115', id, 'expense', 1800.00, 'food', 'Lunch with team', '2026-01-12', '2026-01-12T13:30:00Z', '2026-01-12T13:30:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.transactions (id, user_id, type, amount, category, description, date, created_at, updated_at)
SELECT 'a1111111-1111-1111-1111-111111111116', id, 'expense', 2500.00, 'shopping', 'New shoes', '2026-01-18', '2026-01-18T16:00:00Z', '2026-01-18T16:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.transactions (id, user_id, type, amount, category, description, date, created_at, updated_at)
SELECT 'a1111111-1111-1111-1111-111111111117', id, 'expense', 850.00, 'health', 'Pharmacy medicines', '2026-01-22', '2026-01-22T11:00:00Z', '2026-01-22T11:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.transactions (id, user_id, type, amount, category, description, date, created_at, updated_at)
SELECT 'a1111111-1111-1111-1111-111111111118', id, 'income', 7500.00, 'other', 'Freelance design gig', '2026-01-25', '2026-01-25T15:00:00Z', '2026-01-25T15:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.transactions (id, user_id, type, amount, category, description, date, created_at, updated_at)
SELECT 'a2222222-2222-2222-2222-222222222221', id, 'income', 65000.00, 'other', 'February salary', '2026-02-05', '2026-02-05T09:00:00Z', '2026-02-05T09:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.transactions (id, user_id, type, amount, category, description, date, created_at, updated_at)
SELECT 'a2222222-2222-2222-2222-222222222222', id, 'expense', 3400.00, 'food', 'Grocery shopping', '2026-02-06', '2026-02-06T14:00:00Z', '2026-02-06T14:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.transactions (id, user_id, type, amount, category, description, date, created_at, updated_at)
SELECT 'a2222222-2222-2222-2222-222222222223', id, 'expense', 1100.00, 'transport', 'Fuel and gas', '2026-02-07', '2026-02-07T09:30:00Z', '2026-02-07T09:30:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.transactions (id, user_id, type, amount, category, description, date, created_at, updated_at)
SELECT 'a2222222-2222-2222-2222-222222222224', id, 'expense', 4300.00, 'utilities', 'Meralco bill', '2026-02-09', '2026-02-09T20:00:00Z', '2026-02-09T20:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.transactions (id, user_id, type, amount, category, description, date, created_at, updated_at)
SELECT 'a2222222-2222-2222-2222-222222222225', id, 'expense', 2100.00, 'entertainment', 'Netflix + Spotify', '2026-02-11', '2026-02-11T21:00:00Z', '2026-02-11T21:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.transactions (id, user_id, type, amount, category, description, date, created_at, updated_at)
SELECT 'a2222222-2222-2222-2222-222222222226', id, 'expense', 6200.00, 'shopping', 'New jacket', '2026-02-18', '2026-02-18T17:00:00Z', '2026-02-18T17:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.transactions (id, user_id, type, amount, category, description, date, created_at, updated_at)
SELECT 'a2222222-2222-2222-2222-222222222227', id, 'income', 4500.00, 'other', 'Weekend tutoring', '2026-02-20', '2026-02-20T10:00:00Z', '2026-02-20T10:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.transactions (id, user_id, type, amount, category, description, date, created_at, updated_at)
SELECT 'a2222222-2222-2222-2222-222222222228', id, 'expense', 700.00, 'food', 'Coffee and snacks', '2026-02-23', '2026-02-23T08:00:00Z', '2026-02-23T08:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.transactions (id, user_id, type, amount, category, description, date, created_at, updated_at)
SELECT 'a3333333-3333-3333-3333-333333333331', id, 'income', 65000.00, 'other', 'March salary', '2026-03-05', '2026-03-05T09:00:00Z', '2026-03-05T09:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.transactions (id, user_id, type, amount, category, description, date, created_at, updated_at)
SELECT 'a3333333-3333-3333-3333-333333333332', id, 'expense', 2800.00, 'food', 'Weekly groceries', '2026-03-06', '2026-03-06T13:00:00Z', '2026-03-06T13:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.transactions (id, user_id, type, amount, category, description, date, created_at, updated_at)
SELECT 'a3333333-3333-3333-3333-333333333333', id, 'expense', 950.00, 'transport', 'Grab to mall', '2026-03-08', '2026-03-08T18:00:00Z', '2026-03-08T18:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.transactions (id, user_id, type, amount, category, description, date, created_at, updated_at)
SELECT 'a3333333-3333-3333-3333-333333333334', id, 'expense', 5200.00, 'utilities', 'Internet + electricity', '2026-03-10', '2026-03-10T20:00:00Z', '2026-03-10T20:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.transactions (id, user_id, type, amount, category, description, date, created_at, updated_at)
SELECT 'a3333333-3333-3333-3333-333333333335', id, 'expense', 3100.00, 'entertainment', 'Concert tickets', '2026-03-14', '2026-03-14T20:30:00Z', '2026-03-14T20:30:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.transactions (id, user_id, type, amount, category, description, date, created_at, updated_at)
SELECT 'a3333333-3333-3333-3333-333333333336', id, 'expense', 1900.00, 'health', 'Gym membership', '2026-03-18', '2026-03-18T07:30:00Z', '2026-03-18T07:30:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.transactions (id, user_id, type, amount, category, description, date, created_at, updated_at)
SELECT 'a3333333-3333-3333-3333-333333333337', id, 'income', 5800.00, 'other', 'Freelance copywriting', '2026-03-22', '2026-03-22T14:00:00Z', '2026-03-22T14:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.transactions (id, user_id, type, amount, category, description, date, created_at, updated_at)
SELECT 'a3333333-3333-3333-3333-333333333338', id, 'expense', 1250.00, 'shopping', 'Office supplies', '2026-03-25', '2026-03-25T16:00:00Z', '2026-03-25T16:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.budgets (id, user_id, category, monthly_limit, month, created_at, updated_at)
SELECT 'b1111111-1111-1111-1111-111111111111', id, 'food', 15000.00, '2026-01', '2026-01-01T08:00:00Z', '2026-01-01T08:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.budgets (id, user_id, category, monthly_limit, month, created_at, updated_at)
SELECT 'b1111111-1111-1111-1111-111111111112', id, 'transport', 8000.00, '2026-01', '2026-01-01T08:00:00Z', '2026-01-01T08:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.budgets (id, user_id, category, monthly_limit, month, created_at, updated_at)
SELECT 'b1111111-1111-1111-1111-111111111113', id, 'utilities', 5000.00, '2026-01', '2026-01-01T08:00:00Z', '2026-01-01T08:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.budgets (id, user_id, category, monthly_limit, month, created_at, updated_at)
SELECT 'b2222222-2222-2222-2222-222222222221', id, 'food', 16000.00, '2026-02', '2026-02-01T08:00:00Z', '2026-02-01T08:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.budgets (id, user_id, category, monthly_limit, month, created_at, updated_at)
SELECT 'b2222222-2222-2222-2222-222222222222', id, 'transport', 8500.00, '2026-02', '2026-02-01T08:00:00Z', '2026-02-01T08:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.budgets (id, user_id, category, monthly_limit, month, created_at, updated_at)
SELECT 'b2222222-2222-2222-2222-222222222223', id, 'entertainment', 4500.00, '2026-02', '2026-02-01T08:00:00Z', '2026-02-01T08:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.budgets (id, user_id, category, monthly_limit, month, created_at, updated_at)
SELECT 'b3333333-3333-3333-3333-333333333331', id, 'food', 15500.00, '2026-03', '2026-03-01T08:00:00Z', '2026-03-01T08:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.budgets (id, user_id, category, monthly_limit, month, created_at, updated_at)
SELECT 'b3333333-3333-3333-3333-333333333332', id, 'transport', 8500.00, '2026-03', '2026-03-01T08:00:00Z', '2026-03-01T08:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.budgets (id, user_id, category, monthly_limit, month, created_at, updated_at)
SELECT 'b3333333-3333-3333-3333-333333333333', id, 'utilities', 5200.00, '2026-03', '2026-03-01T08:00:00Z', '2026-03-01T08:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.subscriptions (id, user_id, name, amount, billing_cycle, next_billing_date, category, color, is_active, created_at, updated_at)
SELECT 's1111111-1111-1111-1111-111111111111', id, 'Netflix', 499.00, 'monthly', '2026-04-01', 'entertainment', '#E50914', TRUE, '2026-01-01T08:00:00Z', '2026-01-01T08:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.subscriptions (id, user_id, name, amount, billing_cycle, next_billing_date, category, color, is_active, created_at, updated_at)
SELECT 's1111111-1111-1111-1111-111111111112', id, 'Spotify', 169.00, 'monthly', '2026-04-03', 'entertainment', '#1DB954', TRUE, '2026-01-01T08:00:00Z', '2026-01-01T08:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.subscriptions (id, user_id, name, amount, billing_cycle, next_billing_date, category, color, is_active, created_at, updated_at)
SELECT 's1111111-1111-1111-1111-111111111113', id, 'Mobile Plan', 799.00, 'monthly', '2026-04-05', 'utilities', '#FF6B6B', TRUE, '2026-01-01T08:00:00Z', '2026-01-01T08:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.subscriptions (id, user_id, name, amount, billing_cycle, next_billing_date, category, color, is_active, created_at, updated_at)
SELECT 's1111111-1111-1111-1111-111111111114', id, 'Gym Membership', 1200.00, 'monthly', '2026-04-10', 'health', '#4ECDC4', TRUE, '2026-01-01T08:00:00Z', '2026-01-01T08:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.savings_accounts (id, user_id, name, bank_name, balance, principal, interest_rate_pa, last_interest_date, color, notes, created_at, updated_at)
SELECT 'sv1111111-1111-1111-1111-111111111111', id, 'Emergency Fund', 'BDO', 25000.00, 25000.00, 4.500, '2026-01-01', '#4ECDC4', '3-month safety buffer', '2026-01-01T08:00:00Z', '2026-01-01T08:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.savings_accounts (id, user_id, name, bank_name, balance, principal, interest_rate_pa, last_interest_date, color, notes, created_at, updated_at)
SELECT 'sv1111111-1111-1111-1111-111111111112', id, 'Vacation Fund', 'BPI', 12000.00, 12000.00, 3.200, '2026-01-01', '#6C5CE7', 'Summer travel', '2026-01-01T08:00:00Z', '2026-01-01T08:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.bnpl_accounts (id, user_id, provider, name, credit_limit, used_credit, due_date, minimum_payment, monthly_installment, is_active, created_at, updated_at)
SELECT 'bn1111111-1111-1111-1111-111111111111', id, 'home_credit', 'Laptop Installment', 50000.00, 26000.00, '2026-04-15', 2050.00, 2050.00, TRUE, '2026-01-05T09:00:00Z', '2026-01-05T09:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.bnpl_accounts (id, user_id, provider, name, credit_limit, used_credit, due_date, minimum_payment, monthly_installment, is_active, created_at, updated_at)
SELECT 'bn1111111-1111-1111-1111-111111111112', id, 'lazpaylater', 'Smartphone Installment', 25000.00, 10200.00, '2026-04-20', 1020.00, 1020.00, TRUE, '2026-01-10T11:00:00Z', '2026-01-10T11:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.alerts (id, user_id, type, title, message, category, severity, read, created_at)
SELECT 'al1111111-1111-1111-1111-111111111111', id, 'budget_exceeded', 'Food budget nearly reached', 'You have spent 90% of your monthly food budget for Mar 2026.', 'food', 'warning', FALSE, '2026-03-25T08:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.alerts (id, user_id, type, title, message, category, severity, read, created_at)
SELECT 'al1111111-1111-1111-1111-111111111112', id, 'upcoming_payment', 'Netflix billing due', 'Netflix subscription is due on 2026-04-01.', 'entertainment', 'info', FALSE, '2026-03-28T10:00:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.chat_messages (id, user_id, role, content, timestamp)
SELECT 'cm1111111-1111-1111-1111-111111111111', id, 'user', 'Show me my spending summary for March.', '2026-03-26T08:15:00Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';

INSERT INTO public.chat_messages (id, user_id, role, content, timestamp)
SELECT 'cm1111111-1111-1111-1111-111111111112', id, 'assistant', 'Your March spending is ₱31,500, with food and utilities as the top categories.', '2026-03-26T08:15:02Z'
FROM auth.users
WHERE email = 'dabenath13@gmail.com';
