// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  setupComplete?: boolean;
}

// Wallet Types
export type WalletType = 'cash' | 'bank' | 'ewallet' | 'digital_bank';

export interface Wallet {
  id: string;
  userId: string;
  type: WalletType;
  name: string;
  balance: number;
  createdAt: Date;
}

// Transaction Types
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// Budget Types
export interface Budget {
  id: string;
  userId: string;
  category: string;
  monthlyLimit: number;
  month: string; // Format: YYYY-MM
  createdAt: Date;
  updatedAt: Date;
}

// Chat Types
export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Financial Summary
export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categoryBreakdown: Record<string, number>;
  budgetStatus: Record<string, { spent: number; limit: number; percentage: number }>;
}

// Alert Types
export type AlertType = 'budget_warning' | 'budget_exceeded' | 'spending_spike' | 'reallocation_suggested';

export interface Alert {
  id: string;
  userId: string;
  type: AlertType;
  title: string;
  message: string;
  category?: string;
  severity: 'info' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

// Reallocation Suggestion
export interface ReallocationSuggestion {
  id: string;
  fromCategory: string;
  toCategory: string;
  amount: number;
  reason: string;
  timestamp: Date;
}
