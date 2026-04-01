'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  // Wallets
  wallets: Wallet[];
  addWallet: (wallet: Omit<Wallet, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateWallet: (id: string, updates: Partial<Wallet>) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  totalWalletBalance: number;
  completeSetup: () => void;

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

    const loadFromSupabase = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase?.auth.getSession() ?? { data: { session: null }, error: null };

        if (sessionError) {
          console.error('Supabase session error:', sessionError);
          return;
        }

        if (!session || !session.user || !session.user.id) {
          console.log('Supabase session missing, continuing with local storage mode.');
          return;
        }

        const authUser = session.user;

        const profile = await supabaseHelpers.getUser(authUser.id).catch((e) => {
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
        }

        const [loadedWallets, loadedTransactions, loadedBudgets, loadedChatMessages, loadedAlerts, loadedSubscriptions, loadedBNPLAccounts, loadedSavingsAccounts] =
          await Promise.all([
            supabaseHelpers.getWallets(authUser.id).catch(() => []),
            supabaseHelpers.getTransactions(authUser.id).catch(() => []),
            supabaseHelpers.getBudgets(authUser.id).catch(() => []),
            supabaseHelpers.getChatMessages(authUser.id).catch(() => []),
            supabaseHelpers.getAlerts(authUser.id).catch(() => []),
            supabaseHelpers.getSubscriptions(authUser.id).catch(() => []),
            supabaseHelpers.getBNPLAccounts(authUser.id).catch(() => []),
            supabaseHelpers.getSavingsAccounts(authUser.id).catch(() => []),
          ]);

        setWallets(loadedWallets.map(mapWallet));
        setTransactions(loadedTransactions.map(mapTransaction));
        setBudgets(loadedBudgets.map(mapBudget));
        setChatMessages(loadedChatMessages.map(mapChatMessage));
        setAlerts(loadedAlerts.map(mapAlert));
        setSubscriptions(loadedSubscriptions.map(mapSubscription));
        setBNPLAccounts(loadedBNPLAccounts.map(mapBNPLAccount));
        setSavingsAccounts(loadedSavingsAccounts.map(mapSavingsAccount));
      } catch (error) {
        console.error('Supabase load error:', error);
      } finally {
        setIsHydrated(true);
      }
    };

    loadFromStorage();
    loadFromSupabase();
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

  // Save wallets to localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY_WALLETS, JSON.stringify(wallets));
    }
  }, [wallets, isHydrated]);

  // Save transactions to localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
    }
  }, [transactions, isHydrated]);

  // Save budgets to localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(budgets));
    }
  }, [budgets, isHydrated]);

  // Save chat messages to localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(chatMessages));
    }
  }, [chatMessages, isHydrated]);

  // Save alerts to localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(alerts));
    }
  }, [alerts, isHydrated]);

  // Save subscriptions to localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY_SUBSCRIPTIONS, JSON.stringify(subscriptions));
    }
  }, [subscriptions, isHydrated]);

  // Save BNPL accounts to localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY_BNPL, JSON.stringify(bnplAccounts));
    }
  }, [bnplAccounts, isHydrated]);

  // Save savings accounts to localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY_SAVINGS, JSON.stringify(savingsAccounts));
    }
  }, [savingsAccounts, isHydrated]);

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

  const completeSetup = () => {
    if (user) {
      const updatedUser = { ...user, setupComplete: true };
      setUser(updatedUser);
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
      return;
    }

    try {
      const newTransaction = await supabaseHelpers.addTransaction(activeUserId, transaction);
      setTransactions((prev) => [...prev, mapTransaction(newTransaction)]);
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
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const updated = await supabaseHelpers.updateTransaction(id, updates);
      setTransactions((prev) => prev.map((t) => (t.id === id ? mapTransaction(updated) : t)));
      return;
    } catch (error) {
      console.error('Supabase updateTransaction error:', error);
      setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await supabaseHelpers.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      return;
    } catch (error) {
      console.error('Supabase deleteTransaction error:', error);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
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

  // Total wallet balance
  const totalWalletBalance = wallets
    .filter((w) => w.userId === user?.id)
    .reduce((sum, w) => sum + w.balance, 0);

  // Calculate financial summary — balance starts from wallet balances
  const calculateFinancialSummary = (): FinancialSummary => {
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

  const totalMonthlySubscriptions = subscriptions
    .filter((s) => s.isActive && s.userId === user?.id)
    .reduce((sum, s) => {
      if (s.billingCycle === 'monthly') return sum + s.amount;
      if (s.billingCycle === 'yearly') return sum + s.amount / 12;
      if (s.billingCycle === 'quarterly') return sum + s.amount / 3;
      if (s.billingCycle === 'weekly') return sum + s.amount * 4.33;
      return sum;
    }, 0);

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

  const totalBNPLDebt = bnplAccounts
    .filter((b) => b.isActive && b.userId === user?.id)
    .reduce((sum, b) => sum + b.usedCredit, 0);

  // ── Daily interest accrual ────────────────────────────────────────────────
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

  const totalSavings = savingsAccounts
    .filter((a) => a.userId === user?.id)
    .reduce((sum, a) => sum + a.balance, 0);

  const value: FinanceContextType = {
    user,
    setUser,
    isLoggedIn: !!user,
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
