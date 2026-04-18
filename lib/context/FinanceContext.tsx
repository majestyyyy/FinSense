'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import {
  User,
  Transaction,
  Budget,
  ChatMessage,
  Alert,
  ReallocationSuggestion,
  Category,
  FinancialSummary,
  Wallet,
  Subscription,
  BNPLAccount,
  SavingsAccount,
} from '@/lib/types';
import { supabase, supabaseHelpers } from '@/lib/supabase';

interface FinanceContextType {
  // User
  user: User | null;
  setUser: (user: User | null) => void;
  isLoggedIn: boolean;
  isHydrated: boolean;

  // Wallets
  wallets: Wallet[];
  addWallet: (wallet: Omit<Wallet, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateWallet: (id: string, updates: Partial<Wallet>) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  totalWalletBalance: number;
  completeSetup: () => Promise<void>;

  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Budgets
  budgets: Budget[];
  setBudget: (category: string, limit: number) => Promise<void>;
  updateBudget: (id: string, limit: number) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  // Chat Messages
  chatMessages: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'userId' | 'timestamp'>) => Promise<void>;
  clearChatHistory: () => Promise<void>;

  // Alerts
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  dismissAlert: (id: string) => Promise<void>;

  // Categories
  categories: Category[];

  // Financial Summary
  financialSummary: FinancialSummary;

  // Reallocation
  suggestReallocation: () => ReallocationSuggestion | null;
  applyReallocation: (suggestion: ReallocationSuggestion) => void;

  // Subscriptions
  subscriptions: Subscription[];
  addSubscription: (sub: Omit<Subscription, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateSubscription: (id: string, updates: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  totalMonthlySubscriptions: number;

  // BNPL
  bnplAccounts: BNPLAccount[];
  addBNPLAccount: (account: Omit<BNPLAccount, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateBNPLAccount: (id: string, updates: Partial<BNPLAccount>) => Promise<void>;
  deleteBNPLAccount: (id: string) => Promise<void>;
  totalBNPLDebt: number;

  // Savings
  savingsAccounts: SavingsAccount[];
  addSavingsAccount: (account: Omit<SavingsAccount, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateSavingsAccount: (id: string, updates: Partial<SavingsAccount>) => Promise<void>;
  deleteSavingsAccount: (id: string) => Promise<void>;
  totalSavings: number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: '🍔', color: '#FF6B6B' },
  { id: 'transport', name: 'Transport', icon: '🚗', color: '#4ECDC4' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎮', color: '#95E1D3' },
  { id: 'education', name: 'Education', icon: '📚', color: '#6C5CE7' },
  { id: 'utilities', name: 'Utilities', icon: '💡', color: '#00B894' },
  { id: 'health', name: 'Health & Fitness', icon: '⚕️', color: '#FF7675' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#A29BFE' },
  { id: 'savings', name: 'Savings', icon: '🏦', color: '#FDCB6E' },
  { id: 'other', name: 'Other', icon: '📌', color: '#DFE6E9' },
];

const mapWallet = (row: any): Wallet => ({
  id: row.id,
  userId: row.user_id,
  type: row.type,
  name: row.name,
  balance: Number(row.balance),
  createdAt: new Date(row.created_at ?? row.createdAt),
  updatedAt: new Date(row.updated_at ?? row.updatedAt),
});

const mapTransaction = (row: any): Transaction => ({
  id: row.id,
  userId: row.user_id,
  type: row.type,
  amount: Number(row.amount),
  category: row.category,
  description: row.description ?? '',
  date: new Date(row.date ?? row.date),
  walletId: row.wallet_id,
  createdAt: new Date(row.created_at ?? row.createdAt),
});

const mapBudget = (row: any): Budget => ({
  id: row.id,
  userId: row.user_id,
  category: row.category,
  monthlyLimit: Number(row.monthly_limit ?? row.monthlyLimit),
  month: row.month,
  createdAt: new Date(row.created_at ?? row.createdAt),
  updatedAt: new Date(row.updated_at ?? row.updatedAt),
});

const mapChatMessage = (row: any): ChatMessage => ({
  id: row.id,
  userId: row.user_id,
  role: row.role,
  content: row.content,
  timestamp: new Date(row.timestamp ?? row.timestamp),
});

const mapAlert = (row: any): Alert => ({
  id: row.id,
  userId: row.user_id,
  type: row.type,
  title: row.title,
  message: row.message,
  category: row.category,
  severity: row.severity,
  read: Boolean(row.read),
  createdAt: new Date(row.created_at ?? row.createdAt),
});

const mapSubscription = (row: any): Subscription => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  amount: Number(row.amount),
  billingCycle: row.billing_cycle || row.billingCycle,
  nextBillingDate: row.next_billing_date || row.nextBillingDate,
  category: row.category,
  color: row.color,
  isActive: Boolean(row.is_active ?? row.isActive),
  createdAt: new Date(row.created_at ?? row.createdAt),
});

const mapBNPLAccount = (row: any): BNPLAccount => ({
  id: row.id,
  userId: row.user_id,
  provider: row.provider,
  name: row.name,
  creditLimit: Number(row.credit_limit ?? row.creditLimit),
  usedCredit: Number(row.used_credit ?? row.usedCredit),
  dueDate: row.due_date || row.dueDate,
  minimumPayment: Number((row.minimum_payment ?? row.minimumPayment) || 0),
  monthlyInstallment: Number((row.monthly_installment ?? row.monthlyInstallment) || 0),
  isActive: Boolean(row.is_active ?? row.isActive),
  createdAt: new Date(row.created_at ?? row.createdAt),
});

const mapSavingsAccount = (row: any): SavingsAccount => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  bankName: row.bank_name ?? row.bankName,
  balance: Number(row.balance),
  principal: Number(row.principal),
  interestRatePA: Number(row.interest_rate_pa ?? row.interestRatePA),
  lastInterestDate: row.last_interest_date ?? row.lastInterestDate,
  color: row.color,
  notes: row.notes,
  createdAt: new Date(row.created_at ?? row.createdAt),
});

const getActiveUserId = async (currentUser: User | null): Promise<string | null> => {
  if (!supabase || !currentUser) return null;

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.warn('Supabase getSession error:', error);
    return null;
  }

  if (session?.user?.id) {
    return session.user.id;
  }

  return currentUser.id ?? null;
};

const STORAGE_KEY_USER = 'finance_user';
const STORAGE_KEY_TRANSACTIONS = 'finance_transactions';
const STORAGE_KEY_BUDGETS = 'finance_budgets';
const STORAGE_KEY_CHAT = 'finance_chat';
const STORAGE_KEY_ALERTS = 'finance_alerts';
const STORAGE_KEY_WALLETS = 'finance_wallets';
const STORAGE_KEY_SUBSCRIPTIONS = 'finance_subscriptions';
const STORAGE_KEY_BNPL = 'finance_bnpl';
const STORAGE_KEY_SAVINGS = 'finance_savings';

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [bnplAccounts, setBNPLAccounts] = useState<BNPLAccount[]>([]);
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage and Supabase on mount
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEY_USER);
        if (storedUser) setUser(JSON.parse(storedUser));

        const storedWallets = localStorage.getItem(STORAGE_KEY_WALLETS);
        if (storedWallets) {
          const parsed = JSON.parse(storedWallets);
          setWallets(
            parsed.map((w: any) => ({
              ...w,
              createdAt: new Date(w.createdAt),
            }))
          );
        }

        const storedTransactions = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
        if (storedTransactions) {
          const parsed = JSON.parse(storedTransactions);
          setTransactions(
            parsed.map((t: any) => ({
              ...t,
              date: new Date(t.date),
              createdAt: new Date(t.createdAt),
            }))
          );
        }

        const storedBudgets = localStorage.getItem(STORAGE_KEY_BUDGETS);
        if (storedBudgets) {
          const parsed = JSON.parse(storedBudgets);
          setBudgets(
            parsed.map((b: any) => ({
              ...b,
              createdAt: new Date(b.createdAt),
              updatedAt: new Date(b.updatedAt),
            }))
          );
        }

        const storedChat = localStorage.getItem(STORAGE_KEY_CHAT);
        if (storedChat) {
          const parsed = JSON.parse(storedChat);
          setChatMessages(
            parsed.map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            }))
          );
        }

        const storedAlerts = localStorage.getItem(STORAGE_KEY_ALERTS);
        if (storedAlerts) {
          const parsed = JSON.parse(storedAlerts);
          setAlerts(
            parsed.map((a: any) => ({
              ...a,
              createdAt: new Date(a.createdAt),
            }))
          );
        }

        const storedSubs = localStorage.getItem(STORAGE_KEY_SUBSCRIPTIONS);
        if (storedSubs) {
          const parsed = JSON.parse(storedSubs);
          setSubscriptions(parsed.map((s: any) => ({ ...s, createdAt: new Date(s.createdAt) })));
        }

        const storedBNPL = localStorage.getItem(STORAGE_KEY_BNPL);
        if (storedBNPL) {
          const parsed = JSON.parse(storedBNPL);
          setBNPLAccounts(parsed.map((b: any) => ({ ...b, createdAt: new Date(b.createdAt) })));
        }

        const storedSavings = localStorage.getItem(STORAGE_KEY_SAVINGS);
        if (storedSavings) {
          const parsed = JSON.parse(storedSavings);
          setSavingsAccounts(parsed.map((s: any) => ({ ...s, createdAt: new Date(s.createdAt) })));
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
    };

    const loadDataForUser = async (userId: string) => {
      try {
        const profile = await supabaseHelpers.getUser(userId).catch((e) => {
          console.warn('Supabase getUser fallback for profile:', e);
          return null;
        });

        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.name ?? '',
            setupComplete: profile.setup_complete ?? false,
            createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
          });
        } else {
          setUser({
            id: userId,
            email: '',
            name: '',
            setupComplete: false,
            createdAt: new Date(),
          });
        }

        // Load critical data first (wallets, transactions, budgets) in parallel
        const [loadedWallets, loadedTransactions, loadedBudgets] = await Promise.all([
          supabaseHelpers.getWallets(userId).catch(() => []),
          supabaseHelpers.getTransactions(userId).catch(() => []),
          supabaseHelpers.getBudgets(userId).catch(() => []),
        ]);

        setWallets(loadedWallets.map(mapWallet));
        setTransactions(loadedTransactions.map(mapTransaction));
        setBudgets(loadedBudgets.map(mapBudget));

        // Load non-critical data in background (alerts, chat, subscriptions, BNPL, savings)
        // These don't block the main UI
        Promise.all([
          supabaseHelpers.getChatMessages(userId).catch(() => []),
          supabaseHelpers.getAlerts(userId).catch(() => []),
          supabaseHelpers.getSubscriptions(userId).catch(() => []),
          supabaseHelpers.getBNPLAccounts(userId).catch(() => []),
          supabaseHelpers.getSavingsAccounts(userId).catch(() => []),
        ])
          .then(([chatMsgs, alerts, subs, bnplAccts, savingsAccts]) => {
            setChatMessages(chatMsgs.map(mapChatMessage));
            setAlerts(alerts.map(mapAlert));
            setSubscriptions(subs.map(mapSubscription));
            setBNPLAccounts(bnplAccts.map(mapBNPLAccount));
            setSavingsAccounts(savingsAccts.map(mapSavingsAccount));
          })
          .catch((error) => {
            console.error('Error loading non-critical data:', error);
          });
      } catch (error) {
        console.error('Data load error:', error);
      }
    };

    loadFromStorage();
    // Mark as hydrated immediately after loading cache so UI shows instantly
    // Supabase data will update in background
    setIsHydrated(true);

    // Listen to auth state changes - this will fire on initial mount with current session
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user?.id) {
          await loadDataForUser(session.user.id);
        } else {
          setUser(null);
          setWallets([]);
          setTransactions([]);
          setBudgets([]);
          setChatMessages([]);
          setAlerts([]);
          setSubscriptions([]);
          setBNPLAccounts([]);
          setSavingsAccounts([]);
        }
      });

      return () => subscription?.unsubscribe();
    }
  }, []);

  // Save user to localStorage
  useEffect(() => {
    if (isHydrated) {
      if (user) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
        localStorage.removeItem(STORAGE_KEY_WALLETS);
        localStorage.removeItem(STORAGE_KEY_TRANSACTIONS);
        localStorage.removeItem(STORAGE_KEY_BUDGETS);
        localStorage.removeItem(STORAGE_KEY_CHAT);
        localStorage.removeItem(STORAGE_KEY_ALERTS);
        localStorage.removeItem(STORAGE_KEY_SUBSCRIPTIONS);
        localStorage.removeItem(STORAGE_KEY_BNPL);
        localStorage.removeItem(STORAGE_KEY_SAVINGS);
        setWallets([]);
        setTransactions([]);
        setBudgets([]);
        setChatMessages([]);
        setAlerts([]);
        setSubscriptions([]);
        setBNPLAccounts([]);
        setSavingsAccounts([]);
      }
    }
  }, [user, isHydrated]);

  // Debounce localStorage writes to batch operations instead of individual writes
  const localStorageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!isHydrated) return;

    // Clear previous timeout
    if (localStorageTimeoutRef.current) clearTimeout(localStorageTimeoutRef.current);

    // Batch write after 800ms of inactivity
    localStorageTimeoutRef.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY_WALLETS, JSON.stringify(wallets));
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
      localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(budgets));
      localStorage.setItem(STORAGE_KEY_SUBSCRIPTIONS, JSON.stringify(subscriptions));
      localStorage.setItem(STORAGE_KEY_BNPL, JSON.stringify(bnplAccounts));
      localStorage.setItem(STORAGE_KEY_SAVINGS, JSON.stringify(savingsAccounts));
    }, 800);

    return () => {
      if (localStorageTimeoutRef.current) clearTimeout(localStorageTimeoutRef.current);
    };
  }, [wallets, transactions, budgets, subscriptions, bnplAccounts, savingsAccounts, isHydrated]);

  // Wallet operations
  const addWallet = async (wallet: Omit<Wallet, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    const activeUserId = await getActiveUserId(user);

    if (!activeUserId) {
      console.warn('No Supabase session found; falling back to local storage for addWallet.');
      const fallbackWallet: Wallet = {
        ...wallet,
        id: `wlt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        userId: user.id,
        createdAt: new Date(),
      };
      setWallets((prev) => [...prev, fallbackWallet]);
      return;
    }

    try {
      const newWallet = await supabaseHelpers.addWallet(activeUserId, wallet);
      setWallets((prev) => [...prev, mapWallet(newWallet)]);
      return;
    } catch (error: unknown) {
      console.error('Supabase addWallet error:', error);

      if ((error as any)?.code === '42501' || (error as any)?.message?.includes?.('row-level security')) {
        console.warn('RLS blocked addWallet; falling back to local storage.');
      } else {
        console.warn('addWallet error, fallback to local storage.');
      }
    }

    const fallbackWallet: Wallet = {
      ...wallet,
      id: `wlt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: user.id,
      createdAt: new Date(),
    };
    setWallets((prev) => [...prev, fallbackWallet]);
  };

  const updateWallet = async (id: string, updates: Partial<Wallet>) => {
    try {
      const updated = await supabaseHelpers.updateWallet(id, updates);
      setWallets((prev) => prev.map((w) => (w.id === id ? mapWallet(updated) : w)));
      return;
    } catch (error) {
      console.error('Supabase updateWallet error:', error);
      setWallets((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
    }
  };

  const deleteWallet = async (id: string) => {
    try {
      await supabaseHelpers.deleteWallet(id);
      setWallets((prev) => prev.filter((w) => w.id !== id));
      return;
    } catch (error) {
      console.error('Supabase deleteWallet error:', error);
      setWallets((prev) => prev.filter((w) => w.id !== id));
    }
  };

  const completeSetup = async () => {
    if (user) {
      const updatedUser = { ...user, setupComplete: true };
      setUser(updatedUser);

      try {
        await supabaseHelpers.updateUser(user.id, { setup_complete: true });
      } catch (error) {
        console.warn('Failed to persist setupComplete to Supabase:', error);
      }
    }
  };

  // Transaction operations
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    const activeUserId = await getActiveUserId(user);
    if (!activeUserId) {
      console.warn('No Supabase session found; falling back to local storage for addTransaction.');
      const fallbackTransaction: Transaction = {
        ...transaction,
        id: `txn_${Date.now()}`,
        userId: user.id,
        createdAt: new Date(),
      };
      setTransactions((prev) => [...prev, fallbackTransaction]);

      // Update wallet balance locally
      if (transaction.walletId) {
        const amount = transaction.type === 'income' ? transaction.amount : -transaction.amount;
        setWallets((prev) =>
          prev.map((w) =>
            w.id === transaction.walletId ? { ...w, balance: w.balance + amount } : w
          )
        );
      }
      return;
    }

    try {
      const newTransaction = await supabaseHelpers.addTransaction(activeUserId, transaction);
      setTransactions((prev) => [...prev, mapTransaction(newTransaction)]);

      // Update wallet balance
      if (transaction.walletId) {
        const amount = transaction.type === 'income' ? transaction.amount : -transaction.amount;
        await updateWallet(transaction.walletId, {
          balance: wallets.find((w) => w.id === transaction.walletId)!.balance + amount,
        });
      }
      return;
    } catch (error) {
      console.error('Supabase addTransaction error:', error);
    }

    const fallbackTransaction: Transaction = {
      ...transaction,
      id: `txn_${Date.now()}`,
      userId: user.id,
      createdAt: new Date(),
    };
    setTransactions((prev) => [...prev, fallbackTransaction]);

    // Update wallet balance locally
    if (transaction.walletId) {
      const amount = transaction.type === 'income' ? transaction.amount : -transaction.amount;
      setWallets((prev) =>
        prev.map((w) =>
          w.id === transaction.walletId ? { ...w, balance: w.balance + amount } : w
        )
      );
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const oldTransaction = transactions.find((t) => t.id === id);
    if (!oldTransaction) return;

    try {
      const updated = await supabaseHelpers.updateTransaction(id, updates);
      setTransactions((prev) => prev.map((t) => (t.id === id ? mapTransaction(updated) : t)));

      // Handle wallet balance updates
      // Reverse old transaction
      if (oldTransaction.walletId) {
        const reverseAmount = oldTransaction.type === 'income' ? -oldTransaction.amount : oldTransaction.amount;
        const oldWallet = wallets.find((w) => w.id === oldTransaction.walletId);
        if (oldWallet) {
          await updateWallet(oldTransaction.walletId, {
            balance: oldWallet.balance + reverseAmount,
          });
        }
      }

      // Apply new transaction
      const newWalletId = updates.walletId || oldTransaction.walletId;
      const newType = updates.type || oldTransaction.type;
      const newAmount = updates.amount ?? oldTransaction.amount;

      if (newWalletId) {
        const newWallet = wallets.find((w) => w.id === newWalletId);
        if (newWallet) {
          const applyAmount = newType === 'income' ? newAmount : -newAmount;
          await updateWallet(newWalletId, {
            balance: newWallet.balance + applyAmount,
          });
        }
      }
      return;
    } catch (error) {
      console.error('Supabase updateTransaction error:', error);
      setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    }
  };

  const deleteTransaction = async (id: string) => {
    const transaction = transactions.find((t) => t.id === id);
    if (!transaction) return;

    try {
      await supabaseHelpers.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));

      // Reverse wallet balance
      if (transaction.walletId) {
        const reverseAmount = transaction.type === 'income' ? -transaction.amount : transaction.amount;
        const wallet = wallets.find((w) => w.id === transaction.walletId);
        if (wallet) {
          await updateWallet(transaction.walletId, {
            balance: wallet.balance + reverseAmount,
          });
        }
      }
      return;
    } catch (error) {
      console.error('Supabase deleteTransaction error:', error);
      setTransactions((prev) => prev.filter((t) => t.id !== id));

      // Still reverse wallet balance locally on error
      if (transaction.walletId) {
        const reverseAmount = transaction.type === 'income' ? -transaction.amount : transaction.amount;
        setWallets((prev) =>
          prev.map((w) =>
            w.id === transaction.walletId ? { ...w, balance: w.balance + reverseAmount } : w
          )
        );
      }
    }
  };

  // Budget operations
  const setBudget = async (category: string, limit: number) => {
    if (!user) return;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const existingBudget = budgets.find(
      (b) => b.userId === user.id && b.category === category && b.month === currentMonth
    );

    if (existingBudget) {
      await updateBudget(existingBudget.id, limit);
      return;
    }

    try {
      const activeUserId = await getActiveUserId(user);
      if (!activeUserId) {
        console.warn('No Supabase session found; falling back to local storage for setBudget.');
        throw new Error('No active Supabase session');
      }

      const newBudget = await supabaseHelpers.setBudget(activeUserId, category, limit, currentMonth);
      setBudgets((prev) => [...prev, mapBudget(newBudget)]);
      return;
    } catch (error) {
      console.error('Supabase setBudget error:', error);
    }

    const fallbackBudget: Budget = {
      id: `bgt_${Date.now()}`,
      userId: user.id,
      category,
      monthlyLimit: limit,
      month: currentMonth,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setBudgets((prev) => [...prev, fallbackBudget]);
  };

  const updateBudget = async (id: string, limit: number) => {
    try {
      const updated = await supabaseHelpers.updateBudget(id, { monthly_limit: limit });
      setBudgets((prev) =>
        prev.map((b) =>
          b.id === id ? mapBudget(updated) : b
        )
      );
      return;
    } catch (error) {
      console.error('Supabase updateBudget error:', error);
      setBudgets((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, monthlyLimit: limit, updatedAt: new Date() } : b
        )
      );
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      await supabaseHelpers.deleteBudget(id);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
      return;
    } catch (error) {
      console.error('Supabase deleteBudget error:', error);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    }
  };

  // Chat operations
  const addChatMessage = async (message: Omit<ChatMessage, 'id' | 'userId' | 'timestamp'>) => {
    if (!user) return;

    const activeUserId = await getActiveUserId(user);
    if (!activeUserId) {
      console.warn('No Supabase session found; falling back to local storage for addChatMessage.');
      const fallbackMessage: ChatMessage = {
        ...message,
        id: `msg_${Date.now()}`,
        userId: user.id,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, fallbackMessage]);
      return;
    }

    try {
      const newMessage = await supabaseHelpers.addChatMessage(activeUserId, message);
      setChatMessages((prev) => [...prev, mapChatMessage(newMessage)]);
      return;
    } catch (error) {
      console.error('Supabase addChatMessage error:', error);
    }

    const fallbackMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}`,
      userId: user.id,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, fallbackMessage]);
  };

  const clearChatHistory = async () => {
    try {
      await supabaseHelpers.clearChatHistory(user?.id ?? '');
    } catch (error) {
      console.error('Supabase clearChatHistory error:', error);
    }
    setChatMessages([]);
  };

  // Alert operations
  const addAlert = async (alert: Omit<Alert, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    const activeUserId = await getActiveUserId(user);
    if (!activeUserId) {
      console.warn('No Supabase session found; falling back to local storage for addAlert.');
      const fallbackAlert: Alert = {
        ...alert,
        id: `alt_${Date.now()}`,
        userId: user.id,
        createdAt: new Date(),
      };
      setAlerts((prev) => [...prev, fallbackAlert]);
      return;
    }

    try {
      const newAlert = await supabaseHelpers.addAlert(activeUserId, alert);
      setAlerts((prev) => [...prev, mapAlert(newAlert)]);
      return;
    } catch (error) {
      console.error('Supabase addAlert error:', error);
    }

    const fallbackAlert: Alert = {
      ...alert,
      id: `alt_${Date.now()}`,
      userId: user.id,
      createdAt: new Date(),
    };
    setAlerts((prev) => [...prev, fallbackAlert]);
  };

  const dismissAlert = async (id: string) => {
    try {
      await supabaseHelpers.dismissAlert(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
      return;
    } catch (error) {
      console.error('Supabase dismissAlert error:', error);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
    }
  };

  // Memoize wallet balance calculation
  const totalWalletBalance = useMemo(
    () =>
      wallets
        .filter((w) => w.userId === user?.id)
        .reduce((sum, w) => sum + w.balance, 0),
    [wallets, user?.id]
  );

  // Calculate financial summary — memoized to prevent expensive recalculations
  const calculateFinancialSummary = useMemo(() => {
    return (): FinancialSummary => {
      const userTransactions = transactions.filter((t) => t.userId === user?.id);
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthTransactions = userTransactions.filter(
        (t) => t.date.toISOString().slice(0, 7) === currentMonth
      );

    const totalIncome = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // All-time net income/expenses offset against wallet starting balance
    const allTimeIncome = userTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const allTimeExpenses = userTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown: Record<string, number> = {};
    monthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      });

    const budgetStatus: Record<string, { spent: number; limit: number; percentage: number }> = {};
    const monthBudgets = budgets.filter(
      (b) => b.userId === user?.id && b.month === currentMonth
    );

    monthBudgets.forEach((b) => {
      const spent = categoryBreakdown[b.category] || 0;
      budgetStatus[b.category] = {
        spent,
        limit: b.monthlyLimit,
        percentage: (spent / b.monthlyLimit) * 100,
      };
    });

      return {
        totalIncome,
        totalExpenses,
        // True balance = initial wallets + all-time income - all-time expenses
        balance: totalWalletBalance + allTimeIncome - allTimeExpenses,
        categoryBreakdown,
        budgetStatus,
      };
    };
  }, [transactions, user?.id, totalWalletBalance, budgets]);

  // Debounce alert checks to prevent feedback loops
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAlertCheckRef = useRef<number>(0);

  useEffect(() => {
    if (!isHydrated || !user) return;

    // Define the function first, before using it
    const checkAndCreateAlerts = async () => {
      const today = new Date();
      const currentMonth = today.toISOString().slice(0, 7);
      const todayTime = today.getTime();

      // Build alert index for O(1) lookups instead of O(n) array searches
      const alertIndex = new Set<string>();
      alerts.forEach((a) => {
        if (a.userId === user.id) {
          if (a.type === 'budget_exceeded' || a.type === 'upcoming_payment') {
            alertIndex.add(`${a.type}:${a.category}`);
          } else {
            alertIndex.add(`${a.type}:${a.message.substring(0, 20)}`);
          }
        }
      });

      const monthTransactions = transactions.filter(
        (t) => t.userId === user.id && t.date.toISOString().slice(0, 7) === currentMonth && t.type === 'expense'
      );

      // Check budgets for alerts
      const monthBudgets = budgets.filter((b) => b.userId === user.id && b.month === currentMonth);
      for (const budget of monthBudgets) {
        const spent = monthTransactions
          .filter((t) => t.category === budget.category)
          .reduce((sum, t) => sum + t.amount, 0);
        const percentage = (spent / budget.monthlyLimit) * 100;

        const alertType = percentage > 100 ? 'budget_exceeded' : 'upcoming_payment';
        const key = `${alertType}:${budget.category}`;

        if (percentage > 100 && !alertIndex.has(key)) {
          await addAlert({
            type: 'budget_exceeded',
            title: 'Budget Exceeded',
            message: `Your ${budget.category} budget has been exceeded by ₱${(spent - budget.monthlyLimit).toFixed(2)}`,
            category: budget.category,
            severity: 'error',
            read: false,
          });
        } else if (percentage >= 80 && percentage <= 100 && !alertIndex.has(key)) {
          await addAlert({
            type: 'upcoming_payment',
            title: 'Budget Warning',
            message: `Your ${budget.category} budget is ${percentage.toFixed(0)}% spent (₱${spent.toFixed(2)} of ₱${budget.monthlyLimit.toFixed(2)})`,
            category: budget.category,
            severity: 'warning',
            read: false,
          });
        }
      }

      // Check subscriptions due
      const activeSubs = subscriptions.filter((s) => s.userId === user.id && s.isActive);
      for (const sub of activeSubs) {
        const dueDate = new Date(sub.nextBillingDate);
        const daysUntil = Math.floor((dueDate.getTime() - todayTime) / (1000 * 60 * 60 * 24));
        const key = `subscription_due:${sub.name}`;

        if (daysUntil <= 3 && daysUntil >= 0 && !alertIndex.has(key)) {
          await addAlert({
            type: 'subscription_due',
            title: 'Subscription Due Soon',
            message: `${sub.name} is due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''} (₱${sub.amount.toFixed(2)})`,
            severity: daysUntil === 0 ? 'error' : 'warning',
            read: false,
          });
        } else if (daysUntil < 0 && !alertIndex.has(`${key}_overdue`)) {
          await addAlert({
            type: 'subscription_due',
            title: 'Subscription Overdue',
            message: `${sub.name} was due ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''} ago`,
            severity: 'error',
            read: false,
          });
        }
      }

      // Check BNPL due dates
      const activeBNPL = bnplAccounts.filter((b) => b.userId === user.id && b.isActive);
      for (const bnpl of activeBNPL) {
        const dueDate = new Date(bnpl.dueDate);
        const daysUntil = Math.floor((dueDate.getTime() - todayTime) / (1000 * 60 * 60 * 24));
        const key = `bnpl_due:${bnpl.name}`;

        if (daysUntil <= 5 && daysUntil >= 0 && !alertIndex.has(key)) {
          await addAlert({
            type: 'bnpl_due',
            title: 'BNPL Payment Due',
            message: `${bnpl.name} payment due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''} (₱${bnpl.usedCredit.toFixed(2)})`,
            severity: daysUntil <= 2 ? 'error' : 'warning',
            read: false,
          });
        } else if (daysUntil < 0 && !alertIndex.has(`${key}_overdue`)) {
          await addAlert({
            type: 'bnpl_due',
            title: 'BNPL Payment Overdue',
            message: `${bnpl.name} was due ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''} ago`,
            severity: 'error',
            read: false,
          });
        }
      }

      // Check for low balance
      const walletBalance = wallets
        .filter((w) => w.userId === user.id)
        .reduce((sum, w) => sum + w.balance, 0);
      if (walletBalance < 500 && walletBalance > 0 && !alertIndex.has('low_balance')) {
        await addAlert({
          type: 'low_balance',
          title: 'Low Balance Warning',
          message: `Your total balance is only ₱${walletBalance.toFixed(2)}. Consider topping up.`,
          severity: 'warning',
          read: false,
        });
      }
    };

    // Clear previous timeout
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);

    const now = Date.now();
    // Only check alerts max once per minute to reduce CPU usage
    if (now - lastAlertCheckRef.current < 60000) {
      alertTimeoutRef.current = setTimeout(() => {
        lastAlertCheckRef.current = Date.now();
        checkAndCreateAlerts();
      }, 2000);
      return;
    }

    lastAlertCheckRef.current = now;

    checkAndCreateAlerts();
  }, [isHydrated, user, transactions, budgets, subscriptions, bnplAccounts, wallets, alerts]);

  // Suggest reallocation
  const suggestReallocation = (): ReallocationSuggestion | null => {
    const summary = calculateFinancialSummary();

    for (const [category, status] of Object.entries(summary.budgetStatus)) {
      if (status.percentage > 100) {
        const excess = status.spent - status.limit;

        for (const [otherCategory, otherStatus] of Object.entries(summary.budgetStatus)) {
          if (otherCategory !== category && otherStatus.percentage < 80) {
            const available = otherStatus.limit - otherStatus.spent;
            if (available > excess) {
              return {
                id: `real_${Date.now()}`,
                fromCategory: otherCategory,
                toCategory: category,
                amount: Math.min(excess, available),
                reason: `Reallocate from ${otherCategory} to cover ${category} overspend`,
                timestamp: new Date(),
              };
            }
          }
        }
      }
    }

    return null;
  };

  const applyReallocation = (suggestion: ReallocationSuggestion) => {
    const currentMonth = new Date().toISOString().slice(0, 7);

    const fromBudget = budgets.find(
      (b) =>
        b.userId === user?.id &&
        b.category === suggestion.fromCategory &&
        b.month === currentMonth
    );

    const toBudget = budgets.find(
      (b) =>
        b.userId === user?.id &&
        b.category === suggestion.toCategory &&
        b.month === currentMonth
    );

    if (fromBudget && toBudget) {
      updateBudget(fromBudget.id, Math.max(0, fromBudget.monthlyLimit - suggestion.amount));
      updateBudget(toBudget.id, toBudget.monthlyLimit + suggestion.amount);

      addAlert({
        type: 'general',
        title: 'Budget Reallocated',
        message: `₱${suggestion.amount.toFixed(2)} moved from ${suggestion.fromCategory} to ${suggestion.toCategory}`,
        severity: 'info',
        read: false,
      });
    }
  };

  const financialSummary = calculateFinancialSummary();

  // Subscription operations
  const addSubscription = async (sub: Omit<Subscription, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    try {
      const newSub = await supabaseHelpers.addSubscription(user.id, sub);
      setSubscriptions((prev) => [...prev, mapSubscription(newSub)]);
      return;
    } catch (error) {
      console.error('Supabase addSubscription error:', error);
    }

    const fallbackSub: Subscription = {
      ...sub,
      id: `sub_${Date.now()}`,
      userId: user.id,
      createdAt: new Date(),
    };
    setSubscriptions((prev) => [...prev, fallbackSub]);
  };

  const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
    try {
      const updated = await supabaseHelpers.updateSubscription(id, updates);
      setSubscriptions((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return;
    } catch (error) {
      console.error('Supabase updateSubscription error:', error);
      setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    }
  };

  const deleteSubscription = async (id: string) => {
    try {
      await supabaseHelpers.deleteSubscription(id);
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
      return;
    } catch (error) {
      console.error('Supabase deleteSubscription error:', error);
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // Memoize subscription totals
  const totalMonthlySubscriptions = useMemo(
    () =>
      subscriptions
        .filter((s) => s.isActive && s.userId === user?.id)
        .reduce((sum, s) => {
          if (s.billingCycle === 'monthly') return sum + s.amount;
          if (s.billingCycle === 'yearly') return sum + s.amount / 12;
          if (s.billingCycle === 'quarterly') return sum + s.amount / 3;
          if (s.billingCycle === 'weekly') return sum + s.amount * 4.33;
          return sum;
        }, 0),
    [subscriptions, user?.id]
  );

  // BNPL operations
  const addBNPLAccount = async (account: Omit<BNPLAccount, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    try {
      const newAccount = await supabaseHelpers.addBNPLAccount(user.id, account);
      setBNPLAccounts((prev) => [...prev, mapBNPLAccount(newAccount)]);
      return;
    } catch (error) {
      console.error('Supabase addBNPLAccount error:', error);
    }

    const fallbackAccount: BNPLAccount = {
      ...account,
      id: `bnpl_${Date.now()}`,
      userId: user.id,
      createdAt: new Date(),
    };
    setBNPLAccounts((prev) => [...prev, fallbackAccount]);
  };

  const updateBNPLAccount = async (id: string, updates: Partial<BNPLAccount>) => {
    try {
      const updated = await supabaseHelpers.updateBNPLAccount(id, updates);
      setBNPLAccounts((prev) => prev.map((b) => (b.id === id ? updated : b)));
      return;
    } catch (error) {
      console.error('Supabase updateBNPLAccount error:', error);
      setBNPLAccounts((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    }
  };

  const deleteBNPLAccount = async (id: string) => {
    try {
      await supabaseHelpers.deleteBNPLAccount(id);
      setBNPLAccounts((prev) => prev.filter((b) => b.id !== id));
      return;
    } catch (error) {
      console.error('Supabase deleteBNPLAccount error:', error);
      setBNPLAccounts((prev) => prev.filter((b) => b.id !== id));
    }
  };

  // Memoize BNPL debt calculation
  const totalBNPLDebt = useMemo(
    () =>
      bnplAccounts
        .filter((b) => b.isActive && b.userId === user?.id)
        .reduce((sum, b) => sum + b.usedCredit, 0),
    [bnplAccounts, user?.id]
  );

  // Save chat and alerts separately (less frequent updates)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(chatMessages));
    }
  }, [chatMessages, isHydrated]);

  useEffect(() => {
    if (isHydrated && alerts.length > 0) {
      // Keep only recent 50 alerts to prevent localStorage bloat
      const recentAlerts = alerts.slice(-50);
      localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(recentAlerts));
    }
  }, [alerts, isHydrated]);
  // Runs once on hydration: applies outstanding daily compounding interest
  useEffect(() => {
    if (!isHydrated || savingsAccounts.length === 0) return;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    setSavingsAccounts((prev) =>
      prev.map((acc) => {
        if (acc.interestRatePA <= 0) return acc;
        const last = new Date(acc.lastInterestDate);
        const now = new Date(today);
        const daysDiff = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 0) return acc;
        // Daily compounding: B * (1 + r/365)^days
        const dailyRate = acc.interestRatePA / 100 / 365;
        const newBalance = acc.balance * Math.pow(1 + dailyRate, daysDiff);
        return { ...acc, balance: Math.round(newBalance * 100) / 100, lastInterestDate: today };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  // Savings CRUD
  const addSavingsAccount = async (account: Omit<SavingsAccount, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    try {
      const newAcc = await supabaseHelpers.addSavingsAccount(user.id, account);
      setSavingsAccounts((prev) => [...prev, mapSavingsAccount(newAcc)]);
      return;
    } catch (error) {
      console.error('Supabase addSavingsAccount error:', error);
    }

    const fallbackAcc: SavingsAccount = {
      ...account,
      id: `sav_${Date.now()}`,
      userId: user.id,
      createdAt: new Date(),
    };
    setSavingsAccounts((prev) => [...prev, fallbackAcc]);
  };

  const updateSavingsAccount = async (id: string, updates: Partial<SavingsAccount>) => {
    try {
      const updated = await supabaseHelpers.updateSavingsAccount(id, updates);
      setSavingsAccounts((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return;
    } catch (error) {
      console.error('Supabase updateSavingsAccount error:', error);
      setSavingsAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    }
  };

  const deleteSavingsAccount = async (id: string) => {
    try {
      await supabaseHelpers.deleteSavingsAccount(id);
      setSavingsAccounts((prev) => prev.filter((a) => a.id !== id));
      return;
    } catch (error) {
      console.error('Supabase deleteSavingsAccount error:', error);
      setSavingsAccounts((prev) => prev.filter((a) => a.id !== id));
    }
  };

  // Memoize savings total calculation
  const totalSavings = useMemo(
    () =>
      savingsAccounts
        .filter((a) => a.userId === user?.id)
        .reduce((sum, a) => sum + a.balance, 0),
    [savingsAccounts, user?.id]
  );

  const value: FinanceContextType = {
    user,
    setUser,
    isLoggedIn: !!user,
    isHydrated,
    wallets,
    addWallet,
    updateWallet,
    deleteWallet,
    totalWalletBalance,
    completeSetup,
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    budgets,
    setBudget,
    updateBudget,
    deleteBudget,
    chatMessages,
    addChatMessage,
    clearChatHistory,
    alerts,
    addAlert,
    dismissAlert,
    categories: DEFAULT_CATEGORIES,
    financialSummary,
    suggestReallocation,
    applyReallocation,
    subscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    totalMonthlySubscriptions,
    bnplAccounts,
    addBNPLAccount,
    updateBNPLAccount,
    deleteBNPLAccount,
    totalBNPLDebt,
    savingsAccounts,
    addSavingsAccount,
    updateSavingsAccount,
    deleteSavingsAccount,
    totalSavings,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }
  return context;
};
