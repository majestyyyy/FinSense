'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFinance } from '@/lib/context/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { WalletType } from '@/lib/types';
import {
  TrendingUp,
  Banknote,
  Building2,
  Smartphone,
  CreditCard,
  Plus,
  Trash2,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface WalletEntry {
  type: WalletType;
  name: string;
  balance: string;
}

const WALLET_TYPES: {
  type: WalletType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  examples: string;
  gradient: string;
  iconBg: string;
}[] = [
  {
    type: 'cash',
    label: 'Cash',
    icon: Banknote,
    placeholder: 'e.g. Wallet Cash',
    examples: 'Bills & coins in hand',
    gradient: 'from-emerald-500 to-green-600',
    iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  },
  {
    type: 'bank',
    label: 'Bank Account',
    icon: Building2,
    placeholder: 'e.g. BDO Savings',
    examples: 'BDO, BPI, Metrobank…',
    gradient: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  },
  {
    type: 'ewallet',
    label: 'E-Wallet',
    icon: Smartphone,
    placeholder: 'e.g. GCash',
    examples: 'GCash, Maya, ShopeePay…',
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  },
  {
    type: 'digital_bank',
    label: 'Digital Bank',
    icon: CreditCard,
    placeholder: 'e.g. Tonik',
    examples: 'Tonik, SeaBank, Gotyme…',
    gradient: 'from-rose-500 to-pink-600',
    iconBg: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { addWallet, completeSetup, user } = useFinance();
  const [entries, setEntries] = useState<WalletEntry[]>([]);
  const [activeType, setActiveType] = useState<WalletType>('cash');
  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [nameError, setNameError] = useState('');
  const [balanceError, setBalanceError] = useState('');

  const activeMeta = WALLET_TYPES.find((w) => w.type === activeType)!;

  const handleAddEntry = () => {
    setNameError('');
    setBalanceError('');

    if (!newName.trim()) {
      setNameError('Please enter an account name');
      return;
    }
    const bal = parseFloat(newBalance);
    if (isNaN(bal) || bal < 0) {
      setBalanceError('Please enter a valid balance (0 or more)');
      return;
    }

    setEntries((prev) => [
      ...prev,
      { type: activeType, name: newName.trim(), balance: newBalance },
    ]);
    setNewName('');
    setNewBalance('');
  };

  const handleRemoveEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFinish = () => {
    entries.forEach((e) => {
      addWallet({
        type: e.type,
        name: e.name,
        balance: parseFloat(e.balance) || 0,
      });
    });
    completeSetup();
    router.push('/dashboard');
  };

  const handleSkip = () => {
    completeSetup();
    router.push('/dashboard');
  };

  const totalBalance = entries.reduce((sum, e) => sum + (parseFloat(e.balance) || 0), 0);

  return (
    <div className="min-h-screen bg-background px-4 py-10 flex items-start justify-center">
      {/* Background mesh */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden hero-mesh opacity-60" />
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg space-y-6 animate-fade-up">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-black shadow-xl glow-primary mb-1">
            <TrendingUp className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">
            Hi {user?.name?.split(' ')[0]} 👋 Let&apos;s get started!
          </h1>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Tell us how much money you currently have. This becomes your starting balance.
          </p>
        </div>

        {/* Wallet type selector */}
        <div className="grid grid-cols-4 gap-2">
          {WALLET_TYPES.map(({ type, label, icon: Icon, iconBg, gradient }) => (
            <button
              key={type}
              onClick={() => { setActiveType(type); setNameError(''); setBalanceError(''); }}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                activeType === type
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium leading-tight">{label}</span>
            </button>
          ))}
        </div>

        {/* Add wallet form */}
        <div className="rounded-2xl border border-border/40 bg-card/90 backdrop-blur-sm shadow-lg overflow-hidden">
          <div className={`h-1 bg-gradient-to-r ${activeMeta.gradient}`} />
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${activeMeta.iconBg}`}>
                <activeMeta.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Add {activeMeta.label}</p>
                <p className="text-xs text-muted-foreground">{activeMeta.examples}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Account Name</label>
              <Input
                placeholder={activeMeta.placeholder}
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setNameError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleAddEntry()}
              />
              {nameError && <p className="text-xs text-destructive">{nameError}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Current Balance</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₱</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={newBalance}
                  onChange={(e) => { setNewBalance(e.target.value); setBalanceError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddEntry()}
                  className="pl-7"
                />
              </div>
              {balanceError && <p className="text-xs text-destructive">{balanceError}</p>}
            </div>

            <Button onClick={handleAddEntry} className="w-full gap-2" variant="outline">
              <Plus className="w-4 h-4" />
              Add {activeMeta.label}
            </Button>
          </div>
        </div>

        {/* Added wallets list */}
        {entries.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Added Accounts ({entries.length})
            </p>
            {entries.map((entry, index) => {
              const meta = WALLET_TYPES.find((w) => w.type === entry.type)!;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border shadow-sm"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.iconBg}`}>
                    <meta.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">{meta.label}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold text-accent tabular-nums">
                      ₱{parseFloat(entry.balance || '0').toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleRemoveEntry(index)}
                      className="w-7 h-7 rounded-lg hover:bg-destructive/10 hover:text-destructive flex items-center justify-center text-muted-foreground transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Total */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Total Balance</span>
              </div>
              <span className="text-lg font-bold text-primary tabular-nums">
                ₱{totalBalance.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="space-y-2 pt-1">
          <Button
            onClick={handleFinish}
            className="w-full h-12 gap-2 bg-gradient-to-r from-emerald-600 to-black shadow-lg shadow-primary/25 text-base font-semibold rounded-xl"
            disabled={entries.length === 0}
          >
            Start Tracking
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleSkip}
            variant="ghost"
            className="w-full text-muted-foreground h-10"
          >
            Skip for now
          </Button>
        </div>

        {/* Helper text */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          You can always add or edit your wallets later in Settings.
        </p>
      </div>
    </div>
  );
}
