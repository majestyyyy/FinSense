'use client';

import { useState, useMemo } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { TransactionForm } from '@/components/TransactionForm';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2, Search, SlidersHorizontal, Receipt, ArrowUpRight, ArrowDownRight, TrendingUp, X } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format, isToday, isYesterday } from 'date-fns';

function groupByDate(transactions: any[]) {
  const groups: Record<string, any[]> = {};
  for (const t of transactions) {
    const key = format(new Date(t.date), 'yyyy-MM-dd');
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  }
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
}

function friendlyDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMMM d, yyyy');
}

function formatPeso(n: number) {
  return n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
];

export default function TransactionsPage() {
  const { transactions, deleteTransaction, categories, user } = useFinance();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | undefined>(undefined);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => t.userId === user?.id)
      .filter((t) => {
        if (filterCategory && t.category !== filterCategory) return false;
        if (filterType !== 'all' && t.type !== filterType) return false;
        if (searchQuery && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterCategory, filterType, searchQuery, user?.id]);

  const grouped = useMemo(() => groupByDate(filteredTransactions), [filteredTransactions]);

  const totalIncome = useMemo(() => filteredTransactions.reduce((s, t) => s + (t.type === 'income' ? t.amount : 0), 0), [filteredTransactions]);
  const totalExpense = useMemo(() => filteredTransactions.reduce((s, t) => s + (t.type === 'expense' ? t.amount : 0), 0), [filteredTransactions]);
  const net = totalIncome - totalExpense;

  const handleEdit = (id: string) => { setEditingId(id); setIsFormOpen(true); };
  const handleDelete = (id: string) => { deleteTransaction(id); setDeleteId(undefined); };
  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name || id;
  const getCategoryIcon = (id: string) => categories.find((c) => c.id === id)?.icon || '💰';
  const activeFilterCount = [filterCategory, filterType !== 'all'].filter(Boolean).length;
  const dayTotal = (txns: any[]) => txns.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);

  return (
    <div className="min-h-screen pb-8">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40 px-4 pt-4 pb-3 md:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Transactions</h1>
              <p className="text-muted-foreground text-xs mt-0.5">{filteredTransactions.length} record{filteredTransactions.length !== 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={() => { setEditingId(undefined); setIsFormOpen(true); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-emerald-700 text-white text-sm font-semibold shadow-md shadow-primary/25"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {/* Type filter pills */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 flex-1">
              {TYPE_FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilterType(f.value as 'all' | 'income' | 'expense')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterType === f.value ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative p-2 rounded-xl transition-colors ${showFilters || activeFilterCount > 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 pt-4 space-y-4 max-w-2xl mx-auto animate-fade-up">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/10 border border-emerald-500/20 p-3">
            <div className="flex items-center gap-1 mb-1">
              <ArrowUpRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <p className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider">Income</p>
            </div>
            <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums leading-tight">
              &#8369;{totalIncome.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-rose-500/15 to-red-500/10 border border-rose-500/20 p-3">
            <div className="flex items-center gap-1 mb-1">
              <ArrowDownRight className="w-3 h-3 text-rose-600 dark:text-rose-400" />
              <p className="text-[9px] text-rose-700 dark:text-rose-400 font-bold uppercase tracking-wider">Expenses</p>
            </div>
            <p className="text-sm font-extrabold text-rose-700 dark:text-rose-400 tabular-nums leading-tight">
              &#8369;{totalExpense.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className={`rounded-2xl p-3 border ${net >= 0 ? 'bg-gradient-to-br from-primary/15 to-emerald-500/10 border-primary/20' : 'bg-gradient-to-br from-orange-500/15 to-red-500/10 border-orange-500/20'}`}>
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="w-3 h-3 text-muted-foreground" />
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Net</p>
            </div>
            <p className={`text-sm font-extrabold tabular-nums leading-tight ${net >= 0 ? 'text-primary' : 'text-orange-600 dark:text-orange-400'}`}>
              {net >= 0 ? '+' : ''}&#8369;{Math.abs(net).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-muted/50 border-border/40 rounded-2xl text-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Collapsible category filter */}
        {showFilters && (
          <div className="rounded-2xl border border-border/50 bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-foreground">Filter by Category</p>
              {filterCategory && (
                <button onClick={() => setFilterCategory('')} className="text-xs text-primary font-semibold">Clear</button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {categories.filter((c) => c.id !== 'savings').map((c) => (
                <button
                  key={c.id}
                  onClick={() => setFilterCategory(filterCategory === c.id ? '' : c.id)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-semibold transition-all ${filterCategory === c.id ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/30'}`}
                >
                  <span className="text-lg leading-none">{c.icon}</span>
                  <span className="text-[10px] leading-tight text-center">{c.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <Receipt className="w-9 h-9 text-muted-foreground/40" />
            </div>
            <div>
              <p className="font-bold text-foreground">No transactions found</p>
              <p className="text-sm text-muted-foreground mt-1">{searchQuery || activeFilterCount > 0 ? 'Try adjusting your filters' : 'Start tracking your money'}</p>
            </div>
            {!searchQuery && activeFilterCount === 0 && (
              <button onClick={() => { setEditingId(undefined); setIsFormOpen(true); }} className="px-5 py-2.5 rounded-xl border-2 border-dashed border-primary/40 text-primary text-sm font-semibold hover:bg-primary/5 transition-colors">
                + Add First Transaction
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(([dateKey, txns]) => {
              const total = dayTotal(txns);
              return (
                <div key={dateKey}>
                  {/* Date header */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-xs font-bold text-foreground uppercase tracking-wider">{friendlyDate(dateKey)}</span>
                    </div>
                    <span className={`text-xs font-bold tabular-nums px-2.5 py-1 rounded-full ${total >= 0 ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                      {total >= 0 ? '+' : ''}&#8369;{Math.abs(total).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2">
                    {txns.map((transaction) => (
                      <div key={transaction.id} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-card border border-border/30 hover:border-border/60 hover:shadow-sm transition-all group">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${transaction.type === 'income' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                          {getCategoryIcon(transaction.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{transaction.description}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-muted-foreground truncate">{getCategoryName(transaction.category)}</span>
                            <span className="text-[10px] text-muted-foreground/50">{format(new Date(transaction.date), 'h:mm a')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`font-extrabold text-sm tabular-nums ${transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {transaction.type === 'income' ? '+' : '-'}&#8369;{transaction.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </span>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity ml-1">
                            <button onClick={() => handleEdit(transaction.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button onClick={() => setDeleteId(transaction.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TransactionForm isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setEditingId(undefined); }} editingId={editingId} />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(undefined)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 mt-2">
            <AlertDialogCancel className="flex-1 rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)} className="flex-1 bg-destructive rounded-xl">Delete</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
