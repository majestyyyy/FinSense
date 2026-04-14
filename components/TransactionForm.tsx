'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TransactionType } from '@/lib/types';
import { Plus, Minus } from 'lucide-react';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingId?: string;
}

export function TransactionForm({ isOpen, onClose, editingId }: TransactionFormProps) {
  const { addTransaction, updateTransaction, transactions, categories, wallets, user } = useFinance();
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [walletId, setWalletId] = useState('');
  const [error, setError] = useState('');

  // Get user's wallets - memoized to prevent useEffect triggering on every render
  const userWallets = useMemo(
    () => wallets.filter((w) => w.userId === user?.id),
    [wallets, user?.id]
  );

  // Load editing data if provided
  const editingTransaction = editingId
    ? transactions.find((t) => t.id === editingId)
    : null;

  // Initialize form state when editing transaction
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
      setAmount(editingTransaction.amount.toString());
      setDescription(editingTransaction.description);
      setDate(editingTransaction.date.toISOString().split('T')[0]);
      setWalletId(editingTransaction.walletId || '');
    } else {
      // Reset form when dialog opens for new transaction
      setType('expense');
      setCategory('');
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setWalletId(userWallets[0]?.id || '');
      setError('');
    }
  }, [editingTransaction, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate - category only required for expenses
    if (!amount || !description || !walletId) {
      setError('Please fill in all fields');
      return;
    }

    if (type === 'expense' && !category) {
      setError('Please select a category');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // For income, auto-set category to 'income'
    const transactionCategory = type === 'income' ? 'income' : category;

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        type,
        category: transactionCategory,
        amount: numAmount,
        description,
        date: new Date(date),
        walletId,
      });
    } else {
      addTransaction({
        type,
        category: transactionCategory,
        amount: numAmount,
        description,
        date: new Date(date),
        walletId,
      });
    }

    // Reset form
    setType('expense');
    setCategory('');
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setWalletId(userWallets[0]?.id || '');
    onClose();
  };

  const handleClose = () => {
    setType('expense');
    setCategory('');
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setWalletId(userWallets[0]?.id || '');
    setError('');
    onClose();
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selection */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                type === 'expense'
                  ? 'border-destructive bg-destructive/10 text-destructive'
                  : 'border-border text-muted-foreground hover:border-border'
              }`}
            >
              <Minus className="w-4 h-4" />
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                type === 'income'
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-muted-foreground hover:border-border'
              }`}
            >
              <Plus className="w-4 h-4" />
              Income
            </button>
          </div>

          {/* Category - only show for expenses */}
          {type === 'expense' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="">Select a category</option>
                {categories
                  .filter((c) => c.id !== 'savings' && c.id !== 'income')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Wallet Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {type === 'income' ? 'Receive to' : 'Deduct from'} Wallet
            </label>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              <option value="">Select a wallet</option>
              {userWallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name} (₱{wallet.balance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <div className="flex items-center">
              <span className="mr-2 text-muted-foreground">₱</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              type="text"
              placeholder="What is this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editingTransaction ? 'Update' : 'Add'} Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
