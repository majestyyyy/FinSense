'use client';

import { useFinance } from '@/lib/context/FinanceContext';
import { CategoryBreakdownChart, SpendingTrendsChart, IncomeVsExpensesChart } from '@/components/DashboardCharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDownRight, ArrowUpRight, AlertTriangle, TrendingUp, CreditCard, Target, Banknote, Building2, Smartphone, Wallet, Receipt, PiggyBank } from 'lucide-react';
import Link from 'next/link';
import { WalletType } from '@/lib/types';

const walletIcons: Record<WalletType, React.ComponentType<{ className?: string }>> = {
  cash: Banknote,
  bank: Building2,
  ewallet: Smartphone,
  digital_bank: CreditCard,
};

const walletGradients: Record<WalletType, string> = {
  cash: 'from-emerald-500 to-teal-500',
  bank: 'from-cyan-500 to-blue-600',
  ewallet: 'from-emerald-500 to-teal-600',
  digital_bank: 'from-rose-500 to-pink-500',
};

export default function DashboardPage() {
  const { financialSummary, user, wallets, totalWalletBalance, totalMonthlySubscriptions, totalBNPLDebt, totalSavings } = useFinance();

  const {
    totalIncome,
    totalExpenses,
    balance,
    budgetStatus,
  } = financialSummary;

  const budgetsOverLimit = Object.values(budgetStatus).filter((s) => s.percentage > 100).length;
  const budgetsWarning = Object.values(budgetStatus).filter((s) => s.percentage >= 80 && s.percentage <= 100).length;
  const savingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  const userWallets = wallets.filter((w) => w.userId === user?.id);

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-5xl mx-auto animate-fade-up">
      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-2xl shadow-xl glow-primary">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-800 to-black" />
        {/* Mesh overlays */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/8 -translate-y-1/3 translate-x-1/3 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-emerald-200/10 translate-y-1/2 -translate-x-1/4 blur-2xl" />
          <div className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2 blur-xl" />
        </div>
        {/* Content */}
        <div className="relative p-6 md:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">{greeting},</p>
              <h1 className="text-2xl md:text-3xl font-bold text-white mt-0.5">{user?.name} 👋</h1>
              <p className="text-white/60 text-xs mt-1">
                {new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-white/15">
            <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1.5">Total Balance</p>
            <p className={`text-4xl md:text-5xl font-extrabold tracking-tight text-white ${balance < 0 ? 'text-red-300' : ''}`}>
              {balance < 0 ? '-' : ''}₱{Math.abs(balance).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/15 text-white/70 text-xs font-medium">
                Net Worth: ₱{(totalSavings + totalWalletBalance - totalBNPLDebt).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Mini stats row */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-white/60 text-[10px] uppercase tracking-wider">Income</p>
              <p className="text-white font-bold text-sm mt-0.5">₱{totalIncome.toLocaleString('en-PH', { minimumFractionDigits: 0 })}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-white/60 text-[10px] uppercase tracking-wider">Expenses</p>
              <p className="text-white font-bold text-sm mt-0.5">₱{totalExpenses.toLocaleString('en-PH', { minimumFractionDigits: 0 })}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-white/60 text-[10px] uppercase tracking-wider">Saved</p>
              <p className="text-white font-bold text-sm mt-0.5">{savingsRate.toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Cards */}
      {userWallets.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-primary"></div>
              <h2 className="text-sm font-bold text-foreground">My Wallets</h2>
              <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full tabular-nums">
                ₱{totalWalletBalance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <Link href="/settings" className="text-xs text-primary hover:underline font-semibold">Manage →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {userWallets.map((wallet) => {
              const Icon = walletIcons[wallet.type] ?? CreditCard;
              const gradient = walletGradients[wallet.type] ?? 'from-primary to-primary/60';
              return (
                <div
                  key={wallet.id}
                  className="rounded-2xl overflow-hidden card-lift cursor-default"
                >
                  <div className={`bg-gradient-to-br ${gradient} p-4`}>
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-white/80 text-[10px] font-medium truncate mb-0.5">{wallet.name}</p>
                    <p className="text-white font-bold text-sm tabular-nums">₱{wallet.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm card-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
                <ArrowUpRight className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/15 dark:text-emerald-400 px-2 py-0.5 rounded-full">+income</span>
            </div>
            <p className="text-xs text-muted-foreground">Total Income</p>
            <p className="text-xl font-extrabold text-foreground tabular-nums mt-0.5">₱{totalIncome.toLocaleString('en-PH', { minimumFractionDigits: 0 })}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm card-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center shadow-sm">
                <ArrowDownRight className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-500/15 dark:text-rose-400 px-2 py-0.5 rounded-full">-spent</span>
            </div>
            <p className="text-xs text-muted-foreground">Total Expenses</p>
            <p className="text-xl font-extrabold text-foreground tabular-nums mt-0.5">₱{totalExpenses.toLocaleString('en-PH', { minimumFractionDigits: 0 })}</p>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-sm card-lift ${budgetsOverLimit > 0 ? 'ring-1 ring-destructive/30' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${budgetsOverLimit > 0 ? 'bg-gradient-to-br from-red-400 to-orange-500' : 'bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700'}`}>
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              {budgetsOverLimit > 0 && (
                <span className="text-[10px] font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">over</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Over Budget</p>
            <p className={`text-xl font-extrabold tabular-nums mt-0.5 ${budgetsOverLimit > 0 ? 'text-destructive' : 'text-foreground'}`}>{budgetsOverLimit}</p>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-sm card-lift ${budgetsWarning > 0 ? 'ring-1 ring-yellow-400/40' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${budgetsWarning > 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' : 'bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700'}`}>
                <Target className="w-5 h-5 text-white" />
              </div>
              {budgetsWarning > 0 && (
                <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/15 px-2 py-0.5 rounded-full">near</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Near Limit</p>
            <p className={`text-xl font-extrabold tabular-nums mt-0.5 ${budgetsWarning > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>{budgetsWarning}</p>
          </CardContent>
        </Card>
      </div>

      {/* Bills & BNPL Summary */}
      {(totalMonthlySubscriptions > 0 || totalBNPLDebt > 0 || totalSavings > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {totalSavings > 0 && (
            <Link href="/savings">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white card-lift">
                <div className="flex items-center gap-2 mb-2">
                  <PiggyBank className="w-4 h-4 text-white/80" />
                  <p className="text-white/80 text-[10px] font-semibold uppercase tracking-wider">Savings</p>
                </div>
                <p className="text-xl font-extrabold tabular-nums">₱{totalSavings.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              </div>
            </Link>
          )}
          {totalMonthlySubscriptions > 0 && (
            <Link href="/bills">
              <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-4 text-white card-lift">
                <div className="flex items-center gap-2 mb-2">
                  <Receipt className="w-4 h-4 text-white/80" />
                  <p className="text-white/80 text-[10px] font-semibold uppercase tracking-wider">Monthly Subs</p>
                </div>
                <p className="text-xl font-extrabold tabular-nums">₱{totalMonthlySubscriptions.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              </div>
            </Link>
          )}
          {totalBNPLDebt > 0 && (
            <Link href="/bills">
              <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 p-4 text-white card-lift">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-white/80" />
                  <p className="text-white/80 text-[10px] font-semibold uppercase tracking-wider">BNPL Debt</p>
                </div>
                <p className="text-xl font-extrabold tabular-nums">₱{totalBNPLDebt.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Budget Progress */}
      {Object.keys(budgetStatus).length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold">Budget Progress</CardTitle>
              <Link href="/budgets">
                <Button variant="ghost" size="sm" className="text-xs text-primary h-7 px-2">View all →</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(budgetStatus).map(([category, status]) => (
              <div key={category} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium capitalize">{category}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    status.percentage > 100
                      ? 'bg-destructive/10 text-destructive'
                      : status.percentage > 80
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
                        : 'bg-accent/10 text-accent'
                  }`}>
                    {status.percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      status.percentage > 100
                        ? 'bg-gradient-to-r from-red-500 to-orange-500'
                        : status.percentage > 80
                          ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                          : 'bg-gradient-to-r from-accent to-emerald-400'
                    }`}
                    style={{ width: `${Math.min(status.percentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  ₱{status.spent.toFixed(2)} of ₱{status.limit.toFixed(2)} spent
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm"><CardContent className="p-4"><CategoryBreakdownChart /></CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-4"><SpendingTrendsChart /></CardContent></Card>
      </div>
      <Card className="border-0 shadow-sm"><CardContent className="p-4"><IncomeVsExpensesChart /></CardContent></Card>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center gap-2 mb-3"><div className="w-1 h-4 rounded-full bg-primary"></div><h2 className="text-sm font-bold text-foreground">Quick Actions</h2></div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: '/transactions', icon: CreditCard, label: 'Add Transaction', gradient: 'from-cyan-500 to-blue-600' },
            { href: '/budgets', icon: Target, label: 'Set Budgets', gradient: 'from-emerald-500 to-teal-600' },
          ].map(({ href, icon: Icon, label, gradient }) => (
            <Link key={href} href={href}>
              <div className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-card border-0 shadow-sm hover:shadow-md card-lift text-center cursor-pointer">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold leading-tight">{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
