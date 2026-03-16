'use client';

import { useState, useMemo } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { BudgetReallocateDialog } from '@/components/BudgetReallocateDialog';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Lightbulb, TrendingDown, CheckCircle2, Target, AlertTriangle, X } from 'lucide-react';

export default function BudgetsPage() {
  const { budgets, setBudget, deleteBudget, categories, financialSummary, suggestReallocation, user } = useFinance();
  const [editingCategory, setEditingCategory] = useState<string | undefined>(undefined);
  const [newLimits, setNewLimits] = useState<Record<string, string>>({});
  const [reallocationDialogOpen, setReallocationDialogOpen] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthName = new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });
  const monthBudgets = budgets.filter((b) => b.month === currentMonth && b.userId === user?.id);
  const { budgetStatus } = financialSummary;
  const categoriesWithoutIncome = categories.filter((c) => c.id !== 'savings');
  const suggestion = useMemo(() => suggestReallocation(), [suggestReallocation]);

  const handleSetBudget = (categoryId: string) => {
    const amount = parseFloat(newLimits[categoryId] || '0');
    if (amount > 0) {
      setBudget(categoryId, amount);
      setNewLimits({ ...newLimits, [categoryId]: '' });
      setEditingCategory(undefined);
    }
  };

  const setBudgetsCount = monthBudgets.length;
  const overBudgetCount = Object.values(budgetStatus).filter((s) => s.percentage > 100).length;
  const onTrackCount = Object.values(budgetStatus).filter((s) => s.percentage <= 80).length;
  const warnCount = Object.values(budgetStatus).filter((s) => s.percentage > 80 && s.percentage <= 100).length;

  const totalBudgeted = Object.values(budgetStatus).reduce((s, v) => s + v.limit, 0);
  const totalSpent = Object.values(budgetStatus).reduce((s, v) => s + v.spent, 0);
  const overallPct = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  return (
    <div className="min-h-screen pb-8">
      {/* Hero header */}
      <div className="px-4 md:px-8 pt-5 pb-4 max-w-2xl mx-auto">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Budgets</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{monthName}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center shadow-md glow-primary">
            <Target className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 space-y-4 max-w-2xl mx-auto animate-fade-up">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/5 border border-emerald-500/20 p-3 text-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
            <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">{onTrackCount}</p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mt-0.5">On Track</p>
          </div>
          <div className={`rounded-2xl border p-3 text-center ${warnCount > 0 ? 'bg-gradient-to-br from-amber-500/15 to-orange-500/5 border-amber-500/20' : 'bg-muted/30 border-border/30'}`}>
            <AlertTriangle className={`w-4 h-4 mx-auto mb-1 ${warnCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground/40'}`} />
            <p className={`text-xl font-extrabold ${warnCount > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground'}`}>{warnCount}</p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mt-0.5">Warning</p>
          </div>
          <div className={`rounded-2xl border p-3 text-center ${overBudgetCount > 0 ? 'bg-gradient-to-br from-destructive/15 to-red-500/5 border-destructive/20' : 'bg-muted/30 border-border/30'}`}>
            <TrendingDown className={`w-4 h-4 mx-auto mb-1 ${overBudgetCount > 0 ? 'text-destructive' : 'text-muted-foreground/40'}`} />
            <p className={`text-xl font-extrabold ${overBudgetCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>{overBudgetCount}</p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mt-0.5">Over</p>
          </div>
        </div>

        {/* Overall health bar */}
        {Object.keys(budgetStatus).length > 0 && (
          <div className="rounded-2xl bg-card border border-border/40 p-4">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-xs font-bold text-foreground">Overall Budget Health</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${overallPct > 100 ? 'bg-destructive/10 text-destructive' : overallPct > 80 ? 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400' : 'bg-primary/10 text-primary'}`}>
                {overallPct.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${overallPct > 100 ? 'bg-gradient-to-r from-red-500 to-orange-500' : overallPct > 80 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-gradient-to-r from-primary to-emerald-400'}`}
                style={{ width: `${Math.min(overallPct, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-[10px] text-muted-foreground">
{totalSpent.toLocaleString('en-PH', { minimumFractionDigits: 0 })} spent {totalBudgeted.toLocaleString('en-PH', { minimumFractionDigits: 0 })} budgetedof                 
              </p>
              <p className="text-[10px] text-muted-foreground font-semibold">
{Math.max(0, totalBudgeted - totalSpent).toLocaleString('en-PH', { minimumFractionDigits: 0 })} left                
              </p>
            </div>
          </div>
        )}

        {/* Reallocation suggestion */}
        {suggestion && (
          <div className="rounded-2xl overflow-hidden border border-amber-400/30">
            <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
            <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/60 dark:from-amber-500/10 dark:to-orange-500/5 p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
                <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Smart Suggestion</p>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5 leading-relaxed">{suggestion.reason}</p>
                <button onClick={() => setReallocationDialogOpen(true)} className="mt-2.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors">
                  Apply Suggestion
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section title */}
        <div className="flex items-center gap-2 pt-1">
          <div className="w-1 h-4 rounded-full bg-primary" />
          <p className="text-sm font-bold">Categories</p>
          <span className="ml-auto text-xs text-muted-foreground">{setBudgetsCount} of {categoriesWithoutIncome.length} set</span>
        </div>

        {/* Budget cards */}
        <div className="space-y-3">
          {categoriesWithoutIncome.map((category) => {
            const budget = monthBudgets.find((b) => b.category === category.id);
            const status = budgetStatus[category.id];
            const isEditing = editingCategory === category.id;
            const pct = status?.percentage ?? 0;
            const statusKey = pct > 100 ? 'over' : pct > 80 ? 'warn' : 'ok';
            const hasStatus = !!status;

            const barGradient = { over: 'from-red-500 to-orange-500', warn: 'from-yellow-400 to-amber-500', ok: 'from-primary to-emerald-400' }[statusKey];
            const badgeClass = {
              over: 'bg-destructive/10 text-destructive border-destructive/20',
              warn: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border-amber-300/30',
              ok: 'bg-primary/10 text-primary border-primary/20',
            }[statusKey];

            return (
              <div key={category.id} className={`rounded-2xl bg-card border overflow-hidden transition-all ${statusKey === 'over' ? 'border-destructive/30 shadow-sm shadow-destructive/10' : statusKey === 'warn' ? 'border-amber-400/30' : 'border-border/40'}`}>
                <div className="h-1.5 bg-muted overflow-hidden">
                  {hasStatus && (
                    <div className={`h-full bg-gradient-to-r ${barGradient} transition-all duration-700`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${!hasStatus ? 'bg-muted/50' : statusKey === 'over' ? 'bg-destructive/10' : statusKey === 'warn' ? 'bg-amber-100 dark:bg-amber-500/10' : 'bg-primary/10'}`}>
                      {category.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm">{category.name}</p>
                        {hasStatus && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>{pct.toFixed(0)}%</span>
                        )}
                      </div>
                      {hasStatus ? (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <span className={`font-bold ${statusKey === 'over' ? 'text-destructive' : statusKey === 'warn' ? 'text-amber-600 dark:text-amber-400' : 'text-primary'}`}>
                            &#8369;{status.spent.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </span>
                          {' '}of &#8369;{status.limit.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          {status.limit > status.spent && (
                            <span className="text-muted-foreground/60"> · &#8369;{(status.limit - status.spent).toLocaleString('en-PH', { minimumFractionDigits: 0 })} left</span>
                          )}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">No budget set</p>
                      )}
                    </div>

                    {budget && !isEditing && (
                      <button onClick={() => deleteBudget(budget.id)} className="w-8 h-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="flex gap-2 mt-3">
                      <div className="flex-1 flex items-center gap-1.5 bg-muted/60 rounded-xl px-3 border border-border/50">
                        <span className="text-muted-foreground text-sm font-semibold">&#8369;</span>
                        <Input
                          type="number" step="0.01" min="0" placeholder="Enter limit"
                          value={newLimits[category.id] || ''}
                          onChange={(e) => setNewLimits({ ...newLimits, [category.id]: e.target.value })}
                          autoFocus
                          className="h-10 border-0 bg-transparent p-0 focus-visible:ring-0 text-sm font-semibold"
                        />
                      </div>
                      <button onClick={() => handleSetBudget(category.id)} className="px-4 h-10 rounded-xl bg-gradient-to-r from-primary to-emerald-700 text-white text-sm font-semibold shadow-sm">
                        Save
                      </button>
                      <button onClick={() => { setEditingCategory(undefined); setNewLimits({ ...newLimits, [category.id]: '' }); }} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      className="w-full mt-3 h-9 rounded-xl border-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 text-xs text-muted-foreground hover:text-primary font-semibold transition-all flex items-center justify-center gap-1"
                      onClick={() => setEditingCategory(category.id)}
                    >
                      {budget ? (
                        <><span className="text-base leading-none">✏️</span> Edit Limit</>
                      ) : (
                        <><Plus className="w-3.5 h-3.5" /> Set Budget</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Budget tips */}
        <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-emerald-500/5 border border-primary/15 p-4">
          <p className="text-sm font-bold text-primary mb-3">Budget Tips</p>
          <div className="space-y-2.5">
            {[
              { icon: '📊', tip: '50/30/20 rule: needs / wants / savings' },
              { icon: '🎯', tip: 'Set realistic limits based on last month\'s spending' },
              { icon: '⚡', tip: 'Review and adjust budgets each month' },
            ].map(({ icon, tip }) => (
              <div key={tip} className="flex items-start gap-2.5">
                <span className="text-sm shrink-0 mt-0.5">{icon}</span>
                <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BudgetReallocateDialog isOpen={reallocationDialogOpen} onClose={() => setReallocationDialogOpen(false)} suggestion={suggestion} />
    </div>
  );
}
