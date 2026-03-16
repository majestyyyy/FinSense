'use client';

import { useState } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { SavingsAccount } from '@/lib/types';
import { Plus, Trash2, Pencil, X, TrendingUp, PiggyBank, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const SAVINGS_COLORS = [
  { value: 'from-emerald-500 to-teal-600', label: 'Emerald' },
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

const EMPTY_FORM = { name: '', bankName: '', balance: '', interestRatePA: '', color: 'from-emerald-500 to-teal-600', notes: '' };

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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const userAccounts = savingsAccounts.filter((a) => a.userId === user?.id);
  const totalDailyInterest = userAccounts.reduce((sum, a) => sum + dailyInterestEarned(a), 0);
  const totalYearlyInterest = totalDailyInterest * 365;
  const totalMonthlyInterest = totalDailyInterest * 30;

  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setCustomBank(''); setShowForm(true); };
  const openEdit = (acc: SavingsAccount) => {
    setEditId(acc.id);
    setForm({ name: acc.name, bankName: acc.bankName, balance: String(acc.balance), interestRatePA: String(acc.interestRatePA), color: acc.color, notes: acc.notes });
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
      updateSavingsAccount(editId, { name: form.name, bankName, balance: bal, principal: bal, interestRatePA: parseFloat(form.interestRatePA) || 0, color: form.color, notes: form.notes, lastInterestDate: today });
    } else {
      addSavingsAccount({ name: form.name, bankName, balance: bal, principal: bal, interestRatePA: parseFloat(form.interestRatePA) || 0, lastInterestDate: today, color: form.color, notes: form.notes });
    }
    setShowForm(false); setEditId(null); setForm(EMPTY_FORM);
  };

  const inputCls = 'w-full rounded-xl bg-muted/70 border border-border/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40';
  const labelCls = 'text-xs font-semibold text-muted-foreground mb-1.5 block';

  const liveDaily = form.balance && form.interestRatePA && parseFloat(form.interestRatePA) > 0
    ? (parseFloat(form.balance) * parseFloat(form.interestRatePA)) / 100 / 365
    : null;

  return (
    <div className="min-h-screen pb-8">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-800 to-black" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 translate-x-1/3 -translate-y-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-emerald-300/10 translate-y-1/2 blur-2xl" />
        </div>
        <div className="relative px-4 md:px-8 pt-6 pb-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-extrabold text-white">Savings</h1>
              <p className="text-white/60 text-sm mt-0.5">Track &amp; grow your money</p>
            </div>
            <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/15 backdrop-blur-sm text-white text-sm font-semibold border border-white/20 hover:bg-white/25 transition-colors">
              <Plus className="w-4 h-4" /> Add Account
            </button>
          </div>
          <div className="text-center py-2">
            <p className="text-white/60 text-xs uppercase tracking-widest font-semibold">Total Savings</p>
            <p className="text-4xl font-extrabold text-white mt-1 tabular-nums">
              &#8369;{totalSavings.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          {totalDailyInterest > 0 && (
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                { label: 'Daily', value: totalDailyInterest, decimals: 4 },
                { label: 'Monthly', value: totalMonthlyInterest, decimals: 2 },
                { label: 'Yearly', value: totalYearlyInterest, decimals: 2 },
              ].map(({ label, value, decimals }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                  <p className="text-white/60 text-[10px] uppercase tracking-wider">{label}</p>
                  <p className="text-white font-bold text-sm mt-0.5 tabular-nums">
                    +&#8369;{value.toLocaleString('en-PH', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 md:px-8 pt-5 space-y-4 max-w-2xl mx-auto animate-fade-up">
        {showForm && (
          <div className="rounded-2xl bg-card border border-border/50 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/30">
              <p className="font-bold text-sm">{editId ? 'Edit Savings Account' : 'New Savings Account'}</p>
              <button onClick={() => setShowForm(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelCls}>Account Name</label>
                  <input className={inputCls} placeholder="Emergency Fund, Travel Fund..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className={cn(form.bankName === 'Other' ? '' : 'col-span-2')}>
                  <label className={labelCls}>Bank / Institution</label>
                  <select className={inputCls} value={form.bankName} onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))} required>
                    <option value="">Select bank</option>
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
                  <label className={labelCls}>Balance (&#8369;)</label>
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
                  <label className={labelCls}>Notes</label>
                  <input className={inputCls} placeholder="Goal or purpose" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>
              {liveDaily && (
                <div className="rounded-xl border-l-4 border-primary bg-primary/5 px-3 py-2.5">
                  <p className="text-xs font-bold text-primary mb-2">Interest Preview</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Daily', val: liveDaily, d: 4 },
                      { label: 'Monthly', val: liveDaily * 30, d: 2 },
                      { label: 'Yearly', val: liveDaily * 365, d: 2 },
                    ].map(({ label, val, d }) => (
                      <div key={label} className="text-center">
                        <p className="text-[10px] text-muted-foreground">{label}</p>
                        <p className="text-xs font-extrabold text-primary">
                          +&#8369;{val.toLocaleString('en-PH', { minimumFractionDigits: d, maximumFractionDigits: d })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary to-emerald-700 text-white text-sm font-semibold shadow-sm">
                  {editId ? 'Save Changes' : 'Add Account'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-semibold">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {userAccounts.length === 0 && !showForm ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mx-auto mb-4">
              <PiggyBank className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <p className="font-bold text-foreground">No savings accounts yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add your BDO, BPI, Maya, GCash GSave, etc.</p>
            <button onClick={openAdd} className="mt-4 px-6 py-2.5 rounded-xl border-2 border-dashed border-primary/40 text-primary text-sm font-semibold hover:bg-primary/5 transition-colors">
              + Add First Account
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {userAccounts.map((acc) => {
              const daily = dailyInterestEarned(acc);
              const interestEarned = acc.balance - acc.principal;
              const proj3m = projectedBalance(acc, 3);
              const proj12m = projectedBalance(acc, 12);
              const isExpanded = expandedId === acc.id;
              return (
                <div key={acc.id} className="rounded-2xl overflow-hidden shadow-sm border border-border/20 card-lift">
                  <div className={`bg-gradient-to-br ${acc.color} p-5 text-white`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-extrabold text-base leading-tight">{acc.name}</p>
                          <p className="text-white/70 text-xs mt-0.5">{acc.bankName}</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(acc)} className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteSavingsAccount(acc.id)} className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-white/60 text-[10px] uppercase tracking-widest">Balance</p>
                      <p className="text-3xl font-extrabold tabular-nums mt-0.5">
                        &#8369;{acc.balance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      {interestEarned > 0.001 && (
                        <p className="text-white/70 text-xs mt-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          +&#8369;{interestEarned.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} earned since deposit
                        </p>
                      )}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="bg-white/10 rounded-xl p-2.5">
                        <p className="text-white/60 text-[10px]">Interest Rate</p>
                        <p className="text-white font-extrabold">{acc.interestRatePA > 0 ? `${acc.interestRatePA}% p.a.` : 'None'}</p>
                      </div>
                      {daily > 0 && (
                        <div className="bg-white/10 rounded-xl p-2.5">
                          <p className="text-white/60 text-[10px]">Daily Earn</p>
                          <p className="text-white font-extrabold tabular-nums">+&#8369;{daily.toFixed(4)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {acc.interestRatePA > 0 && (
                    <>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : acc.id)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-card border-t border-border/40 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                      >
                        {isExpanded ? <><ChevronUp className="w-3.5 h-3.5" />Hide Projections</> : <><ChevronDown className="w-3.5 h-3.5" />View Projections</>}
                      </button>
                      {isExpanded && (
                        <div className="bg-card border-t border-border/40 p-4">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Projected Growth</p>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { label: '3 Months', value: proj3m, gain: proj3m - acc.balance },
                              { label: '12 Months', value: proj12m, gain: proj12m - acc.balance },
                            ].map(({ label, value, gain }) => (
                              <div key={label} className="rounded-xl bg-muted/50 p-3">
                                <div className="flex items-center gap-1 mb-1.5">
                                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">{label}</p>
                                </div>
                                <p className="font-extrabold text-sm text-foreground tabular-nums">
                                  &#8369;{value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                <p className="text-[10px] text-primary mt-0.5">
                                  +&#8369;{gain.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                              </div>
                            ))}
                          </div>
                          {acc.notes && (
                            <p className="mt-3 text-xs text-muted-foreground italic border-t border-border/30 pt-3">{acc.notes}</p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                  {!acc.interestRatePA && acc.notes && (
                    <div className="bg-card border-t border-border/40 px-4 py-3">
                      <p className="text-xs text-muted-foreground italic">{acc.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
