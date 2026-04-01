# Supabase Setup Guide for FinSense PWA

## Prerequisites
- A Supabase project (create one at https://supabase.com)
- Node.js and npm/pnpm installed

## Setup Steps

### 1. Create Supabase Project
- Go to https://supabase.com/dashboard
- Click "New Project"
- Fill in project details and wait for it to initialize

### 2. Get Your Credentials
In your Supabase dashboard:
- Go to **Settings** → **API**
- Copy `Project URL` and paste in `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`
- Copy `anon public` key and paste in `.env.local` as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Initialize Database Schema
- In Supabase dashboard, go to **SQL Editor**
- Click **New Query**
- Copy all SQL from `/supabase/migrations/001_init_schema.sql`
- Paste into the query editor
- Click **Run** button

### 4. Environment Variables
Update `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
```

### 5. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 6. Run Development Server
```bash
npm run dev
# or
pnpm dev
```

## Database Tables Created
- **users** - Extended user profiles
- **wallets** - Cash/bank accounts
- **transactions** - Income/expense records
- **categories** - Transaction categories (pre-populated)
- **budgets** - Monthly budget limits
- **chat_messages** - AI chatbot history
- **alerts** - User notifications
- **savings_accounts** - Savings with interest tracking
- **subscriptions** - Recurring subscriptions
- **bnpl_accounts** - Buy Now Pay Later accounts

## Security Features
✅ Row Level Security (RLS) enabled on all tables
✅ All tables are scoped to authenticated users
✅ Users can only access their own data
✅ Automatic cascading deletes

## Using Supabase in Your Code

### Basic Usage
```typescript
import { supabaseHelpers } from '@/lib/supabase';

// Get user's transactions
const transactions = await supabaseHelpers.getTransactions(userId);

// Add new transaction
const newTx = await supabaseHelpers.addTransaction(userId, {
  type: 'expense',
  amount: 5000,
  category: 'food',
  description: 'Lunch',
  date: new Date()
});
```

### Available Helper Functions
All CRUD operations are available in `lib/supabase.ts`:
- `getWallets()`, `addWallet()`, `updateWallet()`, `deleteWallet()`
- `getTransactions()`, `addTransaction()`, `updateTransaction()`, `deleteTransaction()`
- `getBudgets()`, `setBudget()`, `deleteBudget()`
- `getChatMessages()`, `addChatMessage()`, `clearChatHistory()`
- `getAlerts()`, `addAlert()`, `dismissAlert()`
- `getSavingsAccounts()`, `addSavingsAccount()`, `updateSavingsAccount()`, `deleteSavingsAccount()`
- `getSubscriptions()`, `addSubscription()`, `updateSubscription()`, `deleteSubscription()`
- `getBNPLAccounts()`, `addBNPLAccount()`, `updateBNPLAccount()`, `deleteBNPLAccount()`

## Troubleshooting

### Missing Env Variables Error
Make sure `.env.local` has both Supabase keys (not just the Gemini key)

### RLS Policy Errors
- Ensure user is authenticated (check auth.uid() matches)
- RLS policies prevent accessing other users' data by design

### Database Connection Issues
- Verify Supabase project is active
- Check that API keys are correct
- Ensure `.env.local` is properly loaded (restart dev server)

## Next Steps
- Connect your Supabase auth with the app
- Update FinanceContext to use Supabase helpers instead of localStorage
- Add real-time subscriptions for live updates
