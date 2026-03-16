'use client';

import { useState, useMemo } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { BudgetReallocateDialog } from '@/components/BudgetReallocateDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Lightbulb, TrendingDown, CheckCircle2 } from 'lucide-react';

export default function BudgetsPage() {
  const { budgets, setBudget, deleteBudget, categories, financialSummary, suggestReallocation, user } = useFinance();
  const [editingCategory, setEditingCategory] = useState<string>();
  const [newLimits, setNewLimits] = useState<Record<string, string>>({});
  const [reallocationDialogOpen, setReallocationDialogOpen] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);
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

  return (
    <div className="space-y-5 p-4 md:p-8 max-w-2xl mx-auto animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Budgets</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {setBudgetsCount} set · {onTrackCount} on track
          {overBudgetCount > 0 && <span className="text-destructive font-semibold"> · {overBudgetCount} over limit</span>}
        </p>
      </div>

      {/* Summary pills */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {onTrackCount} on track
        </div>
        {overBudgetCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">
            <TrendingDown className="w-3.5 h-3.5" />
            {overBudgetCount} over budget
          </div>
        )}
      </div>

      {/* Reallocation Alert */}
      {suggestion && (
        <div className="rounded-2xl overflow-hidden border border-amber-400/30 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-500/10 dark:to-orange-500/10">
          <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
          <div className="p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Smart Suggestion</p>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">{suggestion.reason}</p>
              <Button onClick={() => setReallocationDialogOpen(true)} size="sm" className="mt-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-8 text-xs shadow-sm">
                Review Suggestion →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Budget List */}
      <div className="space-y-3">
        {categoriesWithoutIncome.map((category) => {
          const budget = monthBudgets.find((b) => b.category === category.id);
          const status = budgetStatus[category.id];
          const isEditing = editingCategory === category.id;
          const pct = status?.percentage ?? 0;
          const statusKey = pct > 100 ? 'over' : pct > 80 ? 'warn' : 'ok';
          const barGradient = { over: 'from-red-500 to-orange-500', warn: 'from-yellow-400 to-amber-500', ok: 'from-accent to-emerald-400' }[statusKey];
          const badgeClass = { over: 'bg-destructive/10 text-destructive', warn: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', ok: 'bg-accent/10 text-accent' }[statusKey];
          const ringClass = { over: 'ring-1 ring-destructive/25', warn: 'ring-1 ring-amber-400/30', ok: '' }[statusKey];

          return (
            <div key={category.id} className={`rounded-2xl border border-border/40 bg-card overflow-hidden ${ringClass}`}>
              {status && (
                <div className="h-1.5 w-full bg-muted overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${barGradient} transition-all duration-700`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-muted flex items-center justify-center text-xl shrink-0">{category.icon}</div>
                    <div>
                      <p className="font-bold text-sm">{category.name}</p>
                      {status ? (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <span className={`font-bold ${statusKey === 'over' ? 'text-destructive' : statusKey === 'warn' ? 'text-amber-600 dark:text-amber-400' : 'text-accent'}`}>
                            ₱{status.spent.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </span>
                          {' '}of ₱{status.limit.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">No budget set</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {status && <span className={`text-xs font-bold px-2 py-1 rounded-full ${badgeClass}`}>{pct.toFixed(0)}%</span>}
                    {budget && (
                      <Button variant="ghost" size="icon" onClick={() => deleteBudget(budget.id)} className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="flex gap-2 mt-1">
                    <div className="flex-1 flex items-center gap-1.5 bg-muted/40 border border-border/60 rounded-xl px-3">
                      <span className="text-muted-foreground text-sm font-semibold">₱</span>
                      <Input
                        type="number" step="0.01" min="0" placeholder="Enter limit"
                        value={newLimits[category.id] || ''}
                        onChange={(e) => setNewLimits({ ...newLimits, [category.id]: e.target.value })}
                        autoFocus
                        className="h-9 border-0 bg-transparent p-0 focus-visible:ring-0 text-sm"
                      />
                    </div>
                    <Button size="sm" onClick={() => handleSetBudget(category.id)} className="h-9 px-4 rounded-xl bg-gradient-to-r from-primary to-emerald-700 shadow-sm">Save</Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditingCategory(undefined); setNewLimits({ ...newLimits, [category.id]: '' }); }} className="h-9 px-3 rounded-xl">✕</Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="w-full mt-1 h-9 text-xs rounded-xl border-border/50 hover:border-primary/40 hover:bg-primary/5" onClick={() => setEditingCategory(category.id)}>
                    {budget ? 'Edit Limit' : <><Plus className="w-3 h-3 mr-1" />Set Budget</>}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-emerald-500/5 border border-primary/15 p-4 space-y-3">
        <p className="text-sm font-bold text-primary">💡 Budget Tips</p>
        <div className="space-y-2">
          {['Follow the 50/30/20 rule: needs / wants / savings', 'Review and adjust budgets every month', 'Set alerts before you hit your limit'].map((tip) => (
            <p key={tip} className="text-xs text-muted-foreground flex items-start gap-2">
              <span className="text-primary mt-0.5 font-bold">→</span>{tip}
            </p>
          ))}
        </div>
      </div>

      <BudgetReallocateDialog isOpen={reallocationDialogOpen} onClose={() => setReallocationDialogOpen(false)} suggestion={suggestion} />
    </div>
  );
}

