'use client';

import { useState } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ReallocationSuggestion } from '@/lib/types';
import { ArrowRight } from 'lucide-react';

interface BudgetReallocateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: ReallocationSuggestion | null;
}

export function BudgetReallocateDialog({
  isOpen,
  onClose,
  suggestion,
}: BudgetReallocateDialogProps) {
  const { applyReallocation, categories } = useFinance();
  const [customAmount, setCustomAmount] = useState('');

  if (!suggestion) return null;

  const fromCategory = categories.find((c) => c.id === suggestion.fromCategory);
  const toCategory = categories.find((c) => c.id === suggestion.toCategory);

  const amount = customAmount ? parseFloat(customAmount) : suggestion.amount;

  const handleApply = () => {
    if (customAmount) {
      applyReallocation({
        ...suggestion,
        amount: Math.min(parseFloat(customAmount), suggestion.amount),
      });
    } else {
      applyReallocation(suggestion);
    }
    setCustomAmount('');
    onClose();
  };

  const handleClose = () => {
    setCustomAmount('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Reallocate Budget</DialogTitle>
          <DialogDescription>
            Adjust your budget allocation for the current month
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Suggestion Description */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
            <p className="font-semibold">
              Suggested: ₱{suggestion.amount.toFixed(2)}
            </p>
          </div>

          {/* Visual Flow */}
          <div className="space-y-4">
            {/* From */}
            <div className="space-y-2">
              <label className="text-sm font-medium">From</label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <span className="text-2xl">{fromCategory?.icon}</span>
                <div>
                  <p className="font-semibold">{fromCategory?.name}</p>
                  <p className="text-xs text-muted-foreground">Available to move</p>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>

            {/* To */}
            <div className="space-y-2">
              <label className="text-sm font-medium">To</label>
              <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <span className="text-2xl">{toCategory?.icon}</span>
                <div>
                  <p className="font-semibold">{toCategory?.name}</p>
                  <p className="text-xs text-destructive">Over budget</p>
                </div>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount to Reallocate</label>
            <div className="flex items-center">
              <span className="mr-2 text-muted-foreground">₱</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                max={suggestion.amount}
                placeholder={suggestion.amount.toFixed(2)}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum: ₱{suggestion.amount.toFixed(2)}
            </p>
          </div>

          {/* Summary */}
          <div className="bg-accent/10 p-3 rounded-lg space-y-1">
            <p className="text-sm text-muted-foreground">
              Moving ₱{(customAmount ? parseFloat(customAmount) : suggestion.amount).toFixed(2)}
            </p>
            <p className="text-sm font-semibold">
              {fromCategory?.name} → {toCategory?.name}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleApply}>
              Reallocate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
