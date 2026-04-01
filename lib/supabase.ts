import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase not configured: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. Using localStorage fallback.');
}

const getSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  }
  return supabase;
};

// Helper functions for common operations
export const supabaseHelpers = {
  // Users
  async getUser(id: string) {
    const { data, error } = await getSupabase()
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async updateUser(id: string, updates: any) {
    const { data, error } = await getSupabase()
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Wallets
  async getWallets(userId: string) {
    const { data, error } = await getSupabase()
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async addWallet(userId: string, wallet: any) {
    const { data, error } = await getSupabase()
      .from('wallets')
      .insert([{ ...wallet, user_id: userId }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateWallet(id: string, updates: any) {
    const { data, error } = await getSupabase()
      .from('wallets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteWallet(id: string) {
    const { error } = await getSupabase()
      .from('wallets')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Transactions
  async getTransactions(userId: string, limit = 100) {
    const { data, error } = await getSupabase()
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async addTransaction(userId: string, transaction: any) {
    const { data, error } = await getSupabase()
      .from('transactions')
      .insert([{ ...transaction, user_id: userId }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateTransaction(id: string, updates: any) {
    const { data, error } = await getSupabase()
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteTransaction(id: string) {
    const { error } = await getSupabase()
      .from('transactions')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Budgets
  async getBudgets(userId: string) {
    const { data, error } = await getSupabase()
      .from('budgets')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  },

  async setBudget(userId: string, category: string, monthlyLimit: number, month: string) {
    const { data, error } = await getSupabase()
      .from('budgets')
      .upsert([
        {
          user_id: userId,
          category,
          monthly_limit: monthlyLimit,
          month,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteBudget(id: string) {
    const { error } = await getSupabase()
      .from('budgets')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Chat Messages
  async getChatMessages(userId: string) {
    const { data, error } = await getSupabase()
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });
    if (error) throw error;
    return data;
  },

  async addChatMessage(userId: string, message: any) {
    const { data, error } = await getSupabase()
      .from('chat_messages')
      .insert([{ ...message, user_id: userId }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async clearChatHistory(userId: string) {
    const { error } = await getSupabase()
      .from('chat_messages')
      .delete()
      .eq('user_id', userId);
    if (error) throw error;
  },

  // Alerts
  async getAlerts(userId: string, unreadOnly = false) {
    let query = supabase
      .from('alerts')
      .select('*')
      .eq('user_id', userId);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async addAlert(userId: string, alert: any) {
    const { data, error } = await getSupabase()
      .from('alerts')
      .insert([{ ...alert, user_id: userId }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async dismissAlert(id: string) {
    const { data, error } = await getSupabase()
      .from('alerts')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Savings Accounts
  async getSavingsAccounts(userId: string) {
    const { data, error } = await getSupabase()
      .from('savings_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async addSavingsAccount(userId: string, account: any) {
    const { data, error } = await getSupabase()
      .from('savings_accounts')
      .insert([{ ...account, user_id: userId }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateSavingsAccount(id: string, updates: any) {
    const { data, error } = await getSupabase()
      .from('savings_accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteSavingsAccount(id: string) {
    const { error } = await getSupabase()
      .from('savings_accounts')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Subscriptions
  async getSubscriptions(userId: string) {
    const { data, error } = await getSupabase()
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async addSubscription(userId: string, subscription: any) {
    const { data, error } = await getSupabase()
      .from('subscriptions')
      .insert([{ ...subscription, user_id: userId }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateSubscription(id: string, updates: any) {
    const { data, error } = await getSupabase()
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteSubscription(id: string) {
    const { error } = await getSupabase()
      .from('subscriptions')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // BNPL Accounts
  async getBNPLAccounts(userId: string) {
    const { data, error } = await getSupabase()
      .from('bnpl_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async addBNPLAccount(userId: string, account: any) {
    const { data, error } = await getSupabase()
      .from('bnpl_accounts')
      .insert([{ ...account, user_id: userId }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateBNPLAccount(id: string, updates: any) {
    const { data, error } = await getSupabase()
      .from('bnpl_accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteBNPLAccount(id: string) {
    const { error } = await getSupabase()
      .from('bnpl_accounts')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Categories
  async getCategories() {
    const { data, error } = await getSupabase()
      .from('categories')
      .select('*');
    if (error) throw error;
    return data;
  },
};

export default supabase;
