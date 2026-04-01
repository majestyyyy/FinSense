# Supabase Integration Guide

This guide explains how to integrate Supabase database with your FinanceContext to replace localStorage.

## File Structure

```
supabase/
├── migrations/
│   └── 001_init_schema.sql          # Database schema (run this in Supabase)
└── README.md                         # Setup instructions

lib/
├── supabase.ts                       # Supabase client & helper functions
├── context/
│   └── FinanceContext.tsx            # Update this to use Supabase
├── services/
│   └── chatbot.ts                    # AI service
└── types.ts                          # TypeScript types

.env.local                            # Add your Supabase credentials here
```

## Quick Start

### 1. Install Dependencies
```bash
npm install @supabase/supabase-js
```

### 2. Add Supabase Credentials
Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Initialize Database
- Go to Supabase Dashboard → SQL Editor
- Create New Query
- Copy all SQL from `supabase/migrations/001_init_schema.sql`
- Click Run

## Using Supabase Helpers in Your Code

### Example: Fetching User's Transactions

**Before (localStorage):**
```typescript
const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
```

**After (Supabase):**
```typescript
import { supabaseHelpers } from '@/lib/supabase';

const transactions = await supabaseHelpers.getTransactions(userId);
```

### Example: Adding a Transaction

**Before:**
```typescript
const newTx = { id: generateId(), ...transaction };
const all = JSON.parse(localStorage.getItem('transactions') || '[]');
all.push(newTx);
localStorage.setItem('transactions', JSON.stringify(all));
```

**After:**
```typescript
import { supabaseHelpers } from '@/lib/supabase';

const newTx = await supabaseHelpers.addTransaction(userId, {
  type: 'expense',
  amount: 5000,
  category: 'food',
  description: 'Lunch',
  date: new Date()
});
```

## Updating FinanceContext

The FinanceContext already has all the methods you need. To make it use Supabase:

### Step 1: Import Supabase Helpers
```typescript
import { supabaseHelpers } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
```

### Step 2: Update useEffect to Load from Supabase
```typescript
useEffect(() => {
  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const wallets = await supabaseHelpers.getWallets(user.id);
      const transactions = await supabaseHelpers.getTransactions(user.id);
      // ... load other data
      setWallets(wallets);
      setTransactions(transactions);
    }
  };

  loadData();
}, []);
```

### Step 3: Update Add Methods
```typescript
const addTransaction = async (transaction: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const newTx = await supabaseHelpers.addTransaction(user.id, transaction);
    setTransactions([newTx, ...transactions]);
  }
};
```

## Supabase Helper Functions Reference

### Wallets
```typescript
await supabaseHelpers.getWallets(userId)
await supabaseHelpers.addWallet(userId, wallet)
await supabaseHelpers.updateWallet(walletId, updates)
await supabaseHelpers.deleteWallet(walletId)
```

### Transactions
```typescript
await supabaseHelpers.getTransactions(userId, limit)
await supabaseHelpers.addTransaction(userId, transaction)
await supabaseHelpers.updateTransaction(txId, updates)
await supabaseHelpers.deleteTransaction(txId)
```

### Budgets
```typescript
await supabaseHelpers.getBudgets(userId)
await supabaseHelpers.setBudget(userId, category, limit, month)
await supabaseHelpers.deleteBudget(budgetId)
```

### Chat Messages
```typescript
await supabaseHelpers.getChatMessages(userId)
await supabaseHelpers.addChatMessage(userId, message)
await supabaseHelpers.clearChatHistory(userId)
```

### Alerts
```typescript
await supabaseHelpers.getAlerts(userId, unreadOnly)
await supabaseHelpers.addAlert(userId, alert)
await supabaseHelpers.dismissAlert(alertId)
```

### Savings Accounts
```typescript
await supabaseHelpers.getSavingsAccounts(userId)
await supabaseHelpers.addSavingsAccount(userId, account)
await supabaseHelpers.updateSavingsAccount(accountId, updates)
await supabaseHelpers.deleteSavingsAccount(accountId)
```

### Subscriptions
```typescript
await supabaseHelpers.getSubscriptions(userId)
await supabaseHelpers.addSubscription(userId, subscription)
await supabaseHelpers.updateSubscription(subscriptionId, updates)
await supabaseHelpers.deleteSubscription(subscriptionId)
```

### BNPL Accounts
```typescript
await supabaseHelpers.getBNPLAccounts(userId)
await supabaseHelpers.addBNPLAccount(userId, account)
await supabaseHelpers.updateBNPLAccount(accountId, updates)
await supabaseHelpers.deleteBNPLAccount(accountId)
```

## Authentication

You'll need to set up Supabase Auth. This is separate from the database but required for RLS.

### Sign Up
```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});
```

### Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

### Get Current User
```typescript
const { data: { user } } = await supabase.auth.getUser();
console.log(user?.id); // UUID of current user
```

## Error Handling

All helper functions throw errors if something goes wrong:

```typescript
try {
  const tx = await supabaseHelpers.addTransaction(userId, transaction);
} catch (error) {
  console.error('Failed to add transaction:', error);
  // Handle error in UI
}
```

## Next Steps

1. ✅ Create Supabase project
2. ✅ Run the SQL migrations
3. ✅ Add environment variables
4. ⬜ Set up Supabase Auth in your app
5. ⬜ Update FinanceContext to use Supabase helpers
6. ⬜ Replace localStorage with Supabase

## Best Practices

1. **Always check for authenticated user before DB calls**
   ```typescript
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) return; // Not authenticated
   ```

2. **Use proper error handling**
   ```typescript
   try {
     const data = await supabaseHelpers.getTransactions(userId);
   } catch (error) {
     // Show error toast to user
   }
   ```

3. **Load data on mount and after mutations**
   ```typescript
   const addAndReload = async (tx) => {
     await supabaseHelpers.addTransaction(userId, tx);
     const updated = await supabaseHelpers.getTransactions(userId);
     setTransactions(updated);
   };
   ```

4. **Consider using Real-time Subscriptions for live updates**
   ```typescript
   const channel = supabase
     .channel(`transactions:user_id=eq.${userId}`)
     .on(
       'postgres_changes',
       { event: '*', schema: 'public', table: 'transactions' },
       (payload) => console.log(payload)
     )
     .subscribe();
   ```

## Security Notes

✅ All data is protected by Row Level Security (RLS)
✅ Users can only see their own data
✅ Anon key is safe to expose in client (read-only for authenticated users)
✅ Never expose service role key in client code
✅ Always authenticate users before allowing data access

## Troubleshooting

### "permission denied" errors
- User is not authenticated
- RLS policies blocking access
- Check that auth.uid() matches user_id in tables

### "relation does not exist" errors
- Database schema not created
- Re-run the SQL from supabase/migrations/001_init_schema.sql

### Missing environment variables
- Check .env.local has both SUPABASE_URL and SUPABASE_ANON_KEY
- Restart dev server after changing .env.local
