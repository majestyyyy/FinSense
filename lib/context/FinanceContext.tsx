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
} from '@/lib/types';

interface FinanceContextType {
  // User
  user: User | null;
  setUser: (user: User | null) => void;
  isLoggedIn: boolean;

  // Wallets
  wallets: Wallet[];
  addWallet: (wallet: Omit<Wallet, 'id' | 'userId' | 'createdAt'>) => void;
  updateWallet: (id: string, updates: Partial<Wallet>) => void;
  deleteWallet: (id: string) => void;
  totalWalletBalance: number;
  completeSetup: () => void;

  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Budgets
  budgets: Budget[];
  setBudget: (category: string, limit: number) => void;
  updateBudget: (id: string, limit: number) => void;
  deleteBudget: (id: string) => void;

  // Chat Messages
  chatMessages: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'userId' | 'timestamp'>) => void;
  clearChatHistory: () => void;

  // Alerts
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'userId' | 'createdAt'>) => void;
  dismissAlert: (id: string) => void;

  // Categories
  categories: Category[];

  // Financial Summary
  financialSummary: FinancialSummary;

  // Reallocation
  suggestReallocation: () => ReallocationSuggestion | null;
  applyReallocation: (suggestion: ReallocationSuggestion) => void;

  // Subscriptions
  subscriptions: Subscription[];
  addSubscription: (sub: Omit<Subscription, 'id' | 'userId' | 'createdAt'>) => void;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  totalMonthlySubscriptions: number;

  // BNPL
  bnplAccounts: BNPLAccount[];
  addBNPLAccount: (account: Omit<BNPLAccount, 'id' | 'userId' | 'createdAt'>) => void;
  updateBNPLAccount: (id: string, updates: Partial<BNPLAccount>) => void;
  deleteBNPLAccount: (id: string) => void;
  totalBNPLDebt: number;
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

const STORAGE_KEY_USER = 'finance_user';
const STORAGE_KEY_TRANSACTIONS = 'finance_transactions';
const STORAGE_KEY_BUDGETS = 'finance_budgets';
const STORAGE_KEY_CHAT = 'finance_chat';
const STORAGE_KEY_ALERTS = 'finance_alerts';
const STORAGE_KEY_WALLETS = 'finance_wallets';
const STORAGE_KEY_SUBSCRIPTIONS = 'finance_subscriptions';
const STORAGE_KEY_BNPL = 'finance_bnpl';

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [bnplAccounts, setBNPLAccounts] = useState<BNPLAccount[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
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
      } catch (error) {
        console.error('Error loading from storage:', error);
      }
      setIsHydrated(true);
    };

    loadFromStorage();
  }, []);

  // Save user to localStorage
  useEffect(() => {
    if (isHydrated) {
      if (user) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
        // Clear wallets when user logs out
        localStorage.removeItem(STORAGE_KEY_WALLETS);
        localStorage.removeItem(STORAGE_KEY_SUBSCRIPTIONS);
        localStorage.removeItem(STORAGE_KEY_BNPL);
        setWallets([]);
        setSubscriptions([]);
        setBNPLAccounts([]);
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

  // Wallet operations
  const addWallet = (wallet: Omit<Wallet, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const newWallet: Wallet = {
      ...wallet,
      id: `wlt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: user.id,
      createdAt: new Date(),
    };
    setWallets((prev) => [...prev, newWallet]);
  };

  const updateWallet = (id: string, updates: Partial<Wallet>) => {
    setWallets((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
  };

  const deleteWallet = (id: string) => {
    setWallets((prev) => prev.filter((w) => w.id !== id));
  };

  const completeSetup = () => {
    if (user) {
      const updatedUser = { ...user, setupComplete: true };
      setUser(updatedUser);
    }
  };

  // Transaction operations
  const addTransaction = (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    const newTransaction: Transaction = {
      ...transaction,
      id: `txn_${Date.now()}`,
      userId: user.id,
      createdAt: new Date(),
    };

    setTransactions((prev) => [...prev, newTransaction]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Budget operations
  const setBudget = (category: string, limit: number) => {
    if (!user) return;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const existingBudget = budgets.find(
      (b) => b.userId === user.id && b.category === category && b.month === currentMonth
    );

    if (existingBudget) {
      updateBudget(existingBudget.id, limit);
    } else {
      const newBudget: Budget = {
        id: `bgt_${Date.now()}`,
        userId: user.id,
        category,
        monthlyLimit: limit,
        month: currentMonth,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setBudgets((prev) => [...prev, newBudget]);
    }
  };

  const updateBudget = (id: string, limit: number) => {
    setBudgets((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, monthlyLimit: limit, updatedAt: new Date() } : b
      )
    );
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  // Chat operations
  const addChatMessage = (message: Omit<ChatMessage, 'id' | 'userId' | 'timestamp'>) => {
    if (!user) return;

    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}`,
      userId: user.id,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, newMessage]);
  };

  const clearChatHistory = () => {
    setChatMessages([]);
  };

  // Alert operations
  const addAlert = (alert: Omit<Alert, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    const newAlert: Alert = {
      ...alert,
      id: `alt_${Date.now()}`,
      userId: user.id,
      createdAt: new Date(),
    };

    setAlerts((prev) => [...prev, newAlert]);
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
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
        type: 'info',
        title: 'Budget Reallocated',
        message: `₱${suggestion.amount.toFixed(2)} moved from ${suggestion.fromCategory} to ${suggestion.toCategory}`,
        severity: 'info',
        read: false,
      });
    }
  };

  const financialSummary = calculateFinancialSummary();

  // Subscription operations
  const addSubscription = (sub: Omit<Subscription, 'id' | 'userId' | 'createdAt'>) => {
    const newSub: Subscription = {
      ...sub,
      id: `sub_${Date.now()}`,
      userId: user?.id ?? '',
      createdAt: new Date(),
    };
    setSubscriptions((prev) => [...prev, newSub]);
  };

  const updateSubscription = (id: string, updates: Partial<Subscription>) => {
    setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
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
  const addBNPLAccount = (account: Omit<BNPLAccount, 'id' | 'userId' | 'createdAt'>) => {
    const newAccount: BNPLAccount = {
      ...account,
      id: `bnpl_${Date.now()}`,
      userId: user?.id ?? '',
      createdAt: new Date(),
    };
    setBNPLAccounts((prev) => [...prev, newAccount]);
  };

  const updateBNPLAccount = (id: string, updates: Partial<BNPLAccount>) => {
    setBNPLAccounts((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const deleteBNPLAccount = (id: string) => {
    setBNPLAccounts((prev) => prev.filter((b) => b.id !== id));
  };

  const totalBNPLDebt = bnplAccounts
    .filter((b) => b.isActive && b.userId === user?.id)
    .reduce((sum, b) => sum + b.usedCredit, 0);

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
