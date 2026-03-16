'use client';

import { useState, useMemo } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { TransactionForm } from '@/components/TransactionForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2, Search, SlidersHorizontal, Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format, isToday, isYesterday } from 'date-fns';

function groupByDate(transactions: ReturnType<typeof useMemo>[0]) {
  const groups: Record<string, typeof transactions> = {};
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

export default function TransactionsPage() {
  const { transactions, deleteTransaction, categories, user } = useFinance();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string>();
  const [deleteId, setDeleteId] = useState<string>();
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

  const totalIncome = filteredTransactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : 0), 0);
  const totalExpense = filteredTransactions.reduce((sum, t) => sum + (t.type === 'expense' ? t.amount : 0), 0);

  const handleEdit = (id: string) => { setEditingId(id); setIsFormOpen(true); };
  const handleDelete = (id: string) => { deleteTransaction(id); setDeleteId(undefined); };
  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name || id;
  const getCategoryIcon = (id: string) => categories.find((c) => c.id === id)?.icon || '📌';
  const activeFilterCount = [filterCategory, filterType !== 'all'].filter(Boolean).length;

  const dayTotal = (txns: typeof filteredTransactions) =>
    txns.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);

  return (
    <div className="space-y-5 p-4 md:p-8 max-w-2xl mx-auto animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {filteredTransactions.length} record{filteredTransactions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => { setEditingId(undefined); setIsFormOpen(true); }}
          className="gap-1.5 bg-gradient-to-r from-primary to-emerald-700 shadow-md shadow-primary/25 rounded-xl h-10"
        >
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {/* Income / Expense summary strip */}
      <div className="flex gap-2">
        <div className="flex-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 flex items-center gap-2">
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"/>
          <div><p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wider">Income</p><p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">₱{totalIncome.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
        </div>
        <div className="flex-1 rounded-xl bg-rose-500/10 border border-rose-500/20 px-3 py-2 flex items-center gap-2">
          <ArrowDownRight className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0"/>
          <div><p className="text-[10px] text-rose-700 dark:text-rose-400 font-semibold uppercase tracking-wider">Expenses</p><p className="text-sm font-extrabold text-rose-700 dark:text-rose-400 tabular-nums">₱{totalExpense.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
        </div>
      </div>

      {/* Search + Filter toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-muted/40 border-border/60 rounded-xl"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={`relative shrink-0 h-11 w-11 rounded-xl ${showFilters ? 'border-primary text-primary bg-primary/5' : 'bg-muted/40 border-border/60'}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Collapsible filters */}
      {showFilters && (
        <div className="rounded-2xl border border-border/50 bg-card/80 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
                className="w-full px-3 py-2 text-sm border border-input rounded-xl bg-muted/40"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-input rounded-xl bg-muted/40"
              >
                <option value="">All Categories</option>
                {categories.filter((c) => c.id !== 'savings').map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button onClick={() => { setFilterCategory(''); setFilterType('all'); }} className="text-xs text-primary font-semibold hover:underline">
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Grouped Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Receipt className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <div>
            <p className="font-bold text-foreground text-base">No transactions found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || activeFilterCount > 0 ? 'Try adjusting your search or filters' : 'Add your first transaction to get started'}
            </p>
          </div>
          {!searchQuery && activeFilterCount === 0 && (
            <Button onClick={() => { setEditingId(undefined); setIsFormOpen(true); }} variant="outline" className="rounded-xl mt-1">
              <Plus className="w-4 h-4 mr-1.5" /> Add Transaction
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([dateKey, txns]) => {
            const total = dayTotal(txns);
            return (
              <div key={dateKey}>
                {/* Date header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{friendlyDate(dateKey)}</span>
                  <span className={`text-xs font-bold tabular-nums ${total >= 0 ? 'text-accent' : 'text-destructive'}`}>
                    {total >= 0 ? '+' : ''}₱{Math.abs(total).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {/* Transaction rows */}
                <div className="rounded-2xl border border-border/40 bg-card overflow-hidden divide-y divide-border/30">
                  {txns.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center text-xl shrink-0">
                        {getCategoryIcon(transaction.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {getCategoryName(transaction.category)}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60">{format(new Date(transaction.date), 'h:mm a')}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`font-bold text-sm tabular-nums ${transaction.type === 'income' ? 'text-accent' : 'text-destructive'}`}>
                          {transaction.type === 'income' ? '+' : '-'}₱{transaction.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </span>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(transaction.id)} className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary">
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(transaction.id)} className="h-7 w-7 rounded-lg hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 className="w-3 h-3" />
                          </Button>
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

      <TransactionForm isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setEditingId(undefined); }} editingId={editingId} />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(undefined)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)} className="bg-destructive rounded-xl">Delete</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
