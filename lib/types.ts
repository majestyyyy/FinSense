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

// Subscription Types
export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  nextBillingDate: string; // ISO date string
  category: string; // entertainment, productivity, health, etc.
  color: string; // tailwind gradient classes
  isActive: boolean;
  createdAt: Date;
}

// Buy Now Pay Later Types
export type BNPLProvider = 'spaylater' | 'lazpaylater' | 'billease' | 'home_credit' | 'acom' | 'kredivo' | 'other';

export interface BNPLAccount {
  id: string;
  userId: string;
  provider: BNPLProvider;
  name: string; // custom label e.g. "SPayLater - Main"
  creditLimit: number;
  usedCredit: number;
  dueDate: string; // ISO date string
  minimumPayment: number;
  monthlyInstallment: number;
  isActive: boolean;
  createdAt: Date;
}



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
