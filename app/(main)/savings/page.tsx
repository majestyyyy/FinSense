'use client';

import { useState } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { SavingsAccount } from '@/lib/types';
import { Plus, Trash2, Pencil, X, TrendingUp, PiggyBank, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const SAVINGS_COLORS = [
  { value: 'from-emerald-500 to-teal-600', label: 'Green' },
  { value: 'from-cyan-500 to-blue-600', label: 'Cyan' },
  { value: 'from-violet-500 to-purple-600', label: 'Violet' },
  { value: 'from-amber-400 to-orange-500', label: 'Amber' },
  { value: 'from-pink-500 to-rose-500', label: 'Pink' },
  { value: 'from-slate-500 to-gray-600', label: 'Gray' },
];

const PRESET_BANKS = [
  'BDO', 'BPI', 'Metrobank', 'PNB', 'UnionBank', 'Security Bank',
  'Landbank', 'DBP', 'RCBC', 'Chinabank',
  'GCash GSave', 'Maya Savings', 'Tonik', 'GoTyme', 'Seabank',
  'CIMB', 'ING', 'Other',
];

const EMPTY_FORM = {
  name: '',
  bankName: '',
  balance: '',
  interestRatePA: '',
  color: 'from-emerald-500 to-teal-600',
  notes: '',
};

function dailyInterestEarned(account: SavingsAccount): number {
  if (account.interestRatePA <= 0) return 0;
  return (account.balance * account.interestRatePA) / 100 / 365;
}

function projectedBalance(account: SavingsAccount, months: number): number {
  const dailyRate = account.interestRatePA / 100 / 365;
  return account.balance * Math.pow(1 + dailyRate, months * 30);
}

export default function SavingsPage() {
  const { savingsAccounts, addSavingsAccount, updateSavingsAccount, deleteSavingsAccount, totalSavings, user } = useFinance();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [customBank, setCustomBank] = useState('');

  const userAccounts = savingsAccounts.filter((a) => a.userId === user?.id);
  const totalDailyInterest = userAccounts.reduce((sum, a) => sum + dailyInterestEarned(a), 0);
  const totalYearlyInterest = totalDailyInterest * 365;

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setCustomBank('');
    setShowForm(true);
  };

  const openEdit = (acc: SavingsAccount) => {
    setEditId(acc.id);
    setForm({
      name: acc.name,
      bankName: acc.bankName,
      balance: String(acc.balance),
      interestRatePA: String(acc.interestRatePA),
      color: acc.color,
      notes: acc.notes,
    });
    setCustomBank(PRESET_BANKS.includes(acc.bankName) ? '' : acc.bankName);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bankName = form.bankName === 'Other' ? customBank : form.bankName;
    if (!form.name || !bankName || !form.balance) return;

    const today = new Date().toISOString().split('T')[0];
    const bal = parseFloat(form.balance);

    if (editId) {
      updateSavingsAccount(editId, {
        name: form.name,
        bankName,
        balance: bal,
        principal: bal,
        interestRatePA: parseFloat(form.interestRatePA) || 0,
        color: form.color,
        notes: form.notes,
        lastInterestDate: today,
      });
    } else {
      addSavingsAccount({
        name: form.name,
        bankName,
        balance: bal,
        principal: bal,
        interestRatePA: parseFloat(form.interestRatePA) || 0,
        lastInterestDate: today,
        color: form.color,
        notes: form.notes,
      });
    }
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  };

  const inputCls = 'w-full rounded-xl bg-muted border-0 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40';
  const labelCls = 'text-xs font-semibold text-muted-foreground mb-1 block';

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Savings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track your savings with interest accrual</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-3 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-800 to-black p-5 text-white">
          <p className="text-white/60 text-[10px] uppercase tracking-widest font-semibold">Total Savings</p>
          <p className="text-3xl font-extrabold tabular-nums mt-1">
            ₱{totalSavings.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-white/60 text-[10px] uppercase tracking-wider">Daily Interest</p>
              <p className="text-white font-bold text-sm mt-0.5 tabular-nums">
                +₱{totalDailyInterest.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-white/60 text-[10px] uppercase tracking-wider">Yearly Interest</p>
              <p className="text-white font-bold text-sm mt-0.5 tabular-nums">
                +₱{totalYearlyInterest.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl bg-card border border-border/50 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-bold text-sm">{editId ? 'Edit Account' : 'New Savings Account'}</p>
            <button type="button" onClick={() => setShowForm(false)} className="p-1 rounded-lg text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Account Name</label>
              <input className={inputCls} placeholder="Emergency Fund, Travel Fund…" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className={form.bankName === 'Other' ? '' : 'col-span-2'}>
              <label className={labelCls}>Bank / Institution</label>
              <select className={inputCls} value={form.bankName} onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))} required>
                <option value="">Select bank…</option>
                {PRESET_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            {form.bankName === 'Other' && (
              <div>
                <label className={labelCls}>Bank Name</label>
                <input className={inputCls} placeholder="Enter bank name" value={customBank} onChange={e => setCustomBank(e.target.value)} required />
              </div>
            )}
            <div>
              <label className={labelCls}>Current Balance (₱)</label>
              <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00" value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} required />
            </div>
            <div>
              <label className={labelCls}>Interest Rate (% p.a.)</label>
              <input type="number" min="0" step="0.01" max="100" className={inputCls} placeholder="e.g. 4.5" value={form.interestRatePA} onChange={e => setForm(f => ({ ...f, interestRatePA: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Card Color</label>
              <select className={inputCls} value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}>
                {SAVINGS_COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Notes (optional)</label>
              <input className={inputCls} placeholder="e.g. goal, purpose" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>

          {form.balance && form.interestRatePA && parseFloat(form.interestRatePA) > 0 && (
            <div className="rounded-xl bg-primary/10 px-3 py-2.5 text-xs text-primary font-medium space-y-0.5 border-l-2 border-primary">
              <p>📈 Daily interest: +₱{((parseFloat(form.balance) * parseFloat(form.interestRatePA)) / 100 / 365).toFixed(4)}</p>
              <p>📅 Monthly interest: +₱{((parseFloat(form.balance) * parseFloat(form.interestRatePA)) / 100 / 12).toFixed(2)}</p>
              <p>🗓 Yearly interest: +₱{((parseFloat(form.balance) * parseFloat(form.interestRatePA)) / 100).toFixed(2)}</p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
              {editId ? 'Save Changes' : 'Add Account'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-semibold">Cancel</button>
          </div>
        </form>
      )}

      {/* Account list */}
      {userAccounts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <PiggyBank className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">No savings accounts yet</p>
          <p className="text-xs mt-1">Add your BDO, BPI, Maya, GCash GSave, etc.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {userAccounts.map((acc) => {
            const daily = dailyInterestEarned(acc);
            const interestEarned = acc.balance - acc.principal;
            const proj3m = projectedBalance(acc, 3);
            const proj12m = projectedBalance(acc, 12);

            return (
              <div key={acc.id} className="rounded-2xl overflow-hidden shadow-sm border border-border/30">
                {/* Gradient header */}
                <div className={`bg-gradient-to-br ${acc.color} p-5 text-white`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-base leading-tight">{acc.name}</p>
                        <p className="text-white/70 text-xs mt-0.5">{acc.bankName}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(acc)} className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteSavingsAccount(acc.id)} className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-white/60 text-[10px] uppercase tracking-widest">Balance</p>
                    <p className="text-3xl font-extrabold tabular-nums mt-0.5">
                      ₱{acc.balance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    {interestEarned > 0.001 && (
                      <p className="text-white/70 text-xs mt-1">
                        +₱{interestEarned.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} interest earned
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-card p-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-muted p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Interest Rate</p>
                    <p className="font-extrabold text-lg text-foreground mt-0.5">
                      {acc.interestRatePA > 0 ? `${acc.interestRatePA}% p.a.` : 'None'}
                    </p>
                  </div>
                  {acc.interestRatePA > 0 && (
                    <div className="rounded-xl bg-primary/10 p-3">
                      <p className="text-[10px] text-primary uppercase tracking-wider">Daily Earn</p>
                      <p className="font-extrabold text-lg text-primary mt-0.5 tabular-nums">
                        +₱{daily.toFixed(4)}
                      </p>
                    </div>
                  )}

                  {acc.interestRatePA > 0 && (
                    <>
                      <div className="col-span-2 px-1 pt-1">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Projected Growth</p>
                      </div>
                      <div className="rounded-xl bg-muted p-3">
                        <div className="flex items-center gap-1 mb-1">
                          <TrendingUp className="w-3 h-3 text-muted-foreground" />
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">3 Months</p>
                        </div>
                        <p className="font-bold text-sm text-foreground tabular-nums">
                          ₱{proj3m.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="rounded-xl bg-muted p-3">
                        <div className="flex items-center gap-1 mb-1">
                          <TrendingUp className="w-3 h-3 text-muted-foreground" />
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">12 Months</p>
                        </div>
                        <p className="font-bold text-sm text-foreground tabular-nums">
                          ₱{proj12m.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {acc.notes && (
                  <div className="bg-card px-4 pb-4">
                    <p className="text-xs text-muted-foreground italic">"{acc.notes}"</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
