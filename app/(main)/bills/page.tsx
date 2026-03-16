'use client';

import { useState } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { Subscription, BNPLAccount, BillingCycle, BNPLProvider } from '@/lib/types';
import { Plus, Trash2, ToggleLeft, ToggleRight, CreditCard, CalendarClock, AlertTriangle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { differenceInDays, parseISO, format } from 'date-fns';

// ─── Subscription helpers ─────────────────────────────────────────────────────
const SUB_COLORS: Record<string, string> = {
  'from-violet-500 to-purple-600': 'Violet',
  'from-pink-500 to-rose-500': 'Pink',
  'from-cyan-500 to-blue-600': 'Cyan',
  'from-emerald-500 to-teal-600': 'Green',
  'from-amber-400 to-orange-500': 'Amber',
  'from-slate-500 to-gray-600': 'Gray',
};

const CYCLE_LABELS: Record<BillingCycle, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

function toMonthly(amount: number, cycle: BillingCycle) {
  if (cycle === 'monthly') return amount;
  if (cycle === 'yearly') return amount / 12;
  if (cycle === 'quarterly') return amount / 3;
  if (cycle === 'weekly') return amount * 4.33;
  return amount;
}

// ─── BNPL helpers ─────────────────────────────────────────────────────────────
const BNPL_PROVIDERS: { value: BNPLProvider; label: string; gradient: string }[] = [
  { value: 'spaylater', label: 'SPayLater', gradient: 'from-orange-400 to-red-500' },
  { value: 'lazpaylater', label: 'LazPayLater', gradient: 'from-blue-500 to-indigo-600' },
  { value: 'billease', label: 'BillEase', gradient: 'from-emerald-500 to-teal-600' },
  { value: 'home_credit', label: 'Home Credit', gradient: 'from-red-500 to-pink-600' },
  { value: 'acom', label: 'ACOM', gradient: 'from-yellow-400 to-amber-500' },
  { value: 'kredivo', label: 'Kredivo', gradient: 'from-cyan-500 to-blue-500' },
  { value: 'other', label: 'Other', gradient: 'from-slate-400 to-gray-500' },
];

function getProviderGradient(provider: BNPLProvider) {
  return BNPL_PROVIDERS.find((p) => p.value === provider)?.gradient ?? 'from-slate-400 to-gray-500';
}
function getProviderLabel(provider: BNPLProvider) {
  return BNPL_PROVIDERS.find((p) => p.value === provider)?.label ?? 'Other';
}

// ─── Empty subscription form ───────────────────────────────────────────────────
const EMPTY_SUB = {
  name: '',
  amount: '',
  billingCycle: 'monthly' as BillingCycle,
  nextBillingDate: '',
  category: 'entertainment',
  color: 'from-violet-500 to-purple-600',
  isActive: true,
};

const EMPTY_BNPL = {
  provider: 'spaylater' as BNPLProvider,
  name: '',
  creditLimit: '',
  usedCredit: '',
  dueDate: '',
  minimumPayment: '',
  monthlyInstallment: '',
  isActive: true,
};

export default function BillsPage() {
  const {
    subscriptions, addSubscription, updateSubscription, deleteSubscription, totalMonthlySubscriptions,
    bnplAccounts, addBNPLAccount, updateBNPLAccount, deleteBNPLAccount, totalBNPLDebt,
    user,
  } = useFinance();

  const [tab, setTab] = useState<'subscriptions' | 'bnpl'>('subscriptions');
  const [showSubForm, setShowSubForm] = useState(false);
  const [showBNPLForm, setShowBNPLForm] = useState(false);
  const [subForm, setSubForm] = useState(EMPTY_SUB);
  const [bnplForm, setBNPLForm] = useState(EMPTY_BNPL);

  const userSubs = subscriptions.filter((s) => s.userId === user?.id);
  const userBNPL = bnplAccounts.filter((b) => b.userId === user?.id);

  // ── Submit subscription ──────────────────────────────────────────────────────
  const handleAddSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subForm.name || !subForm.amount || !subForm.nextBillingDate) return;
    addSubscription({
      name: subForm.name,
      amount: parseFloat(subForm.amount),
      billingCycle: subForm.billingCycle,
      nextBillingDate: subForm.nextBillingDate,
      category: subForm.category,
      color: subForm.color,
      isActive: subForm.isActive,
    });
    setSubForm(EMPTY_SUB);
    setShowSubForm(false);
  };

  // ── Submit BNPL ──────────────────────────────────────────────────────────────
  const handleAddBNPL = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bnplForm.name || !bnplForm.usedCredit || !bnplForm.dueDate) return;
    addBNPLAccount({
      provider: bnplForm.provider,
      name: bnplForm.name,
      creditLimit: parseFloat(bnplForm.creditLimit) || 0,
      usedCredit: parseFloat(bnplForm.usedCredit),
      dueDate: bnplForm.dueDate,
      minimumPayment: parseFloat(bnplForm.minimumPayment) || 0,
      monthlyInstallment: parseFloat(bnplForm.monthlyInstallment) || 0,
      isActive: bnplForm.isActive,
    });
    setBNPLForm(EMPTY_BNPL);
    setShowBNPLForm(false);
  };

  const inputCls = 'w-full rounded-xl bg-muted border-0 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40';
  const labelCls = 'text-xs font-semibold text-muted-foreground mb-1 block';

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-5 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Bills & Payments</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track subscriptions and pay-later balances</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-4 text-white">
          <p className="text-white/70 text-[10px] uppercase tracking-wider font-semibold">Monthly Subs</p>
          <p className="text-2xl font-extrabold mt-1 tabular-nums">₱{totalMonthlySubscriptions.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
          <p className="text-white/60 text-[10px] mt-0.5">{userSubs.filter(s => s.isActive).length} active</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 p-4 text-white">
          <p className="text-white/70 text-[10px] uppercase tracking-wider font-semibold">BNPL Debt</p>
          <p className="text-2xl font-extrabold mt-1 tabular-nums">₱{totalBNPLDebt.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
          <p className="text-white/60 text-[10px] mt-0.5">{userBNPL.filter(b => b.isActive).length} accounts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-muted p-1 gap-1">
        {(['subscriptions', 'bnpl'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2 rounded-lg text-xs font-semibold transition-all',
              tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            )}
          >
            {t === 'subscriptions' ? '📦 Subscriptions' : '💳 Pay Later'}
          </button>
        ))}
      </div>

      {/* ── Subscriptions Tab ── */}
      {tab === 'subscriptions' && (
        <div className="space-y-3">
          <button
            onClick={() => setShowSubForm((v) => !v)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-border text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Subscription
          </button>

          {showSubForm && (
            <form onSubmit={handleAddSub} className="rounded-2xl bg-card p-4 space-y-3 border border-border/50 shadow-sm">
              <p className="font-bold text-sm">New Subscription</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Name</label>
                  <input className={inputCls} placeholder="Spotify, Netflix…" value={subForm.name} onChange={e => setSubForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label className={labelCls}>Amount (₱)</label>
                  <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00" value={subForm.amount} onChange={e => setSubForm(f => ({ ...f, amount: e.target.value }))} required />
                </div>
                <div>
                  <label className={labelCls}>Billing Cycle</label>
                  <select className={inputCls} value={subForm.billingCycle} onChange={e => setSubForm(f => ({ ...f, billingCycle: e.target.value as BillingCycle }))}>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Next Billing Date</label>
                  <input type="date" className={inputCls} value={subForm.nextBillingDate} onChange={e => setSubForm(f => ({ ...f, nextBillingDate: e.target.value }))} required />
                </div>
                <div>
                  <label className={labelCls}>Category</label>
                  <select className={inputCls} value={subForm.category} onChange={e => setSubForm(f => ({ ...f, category: e.target.value }))}>
                    {['entertainment', 'productivity', 'health', 'education', 'utilities', 'other'].map(c => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Color</label>
                  <select className={inputCls} value={subForm.color} onChange={e => setSubForm(f => ({ ...f, color: e.target.value }))}>
                    {Object.entries(SUB_COLORS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">Add</button>
                <button type="button" onClick={() => setShowSubForm(false)} className="flex-1 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-semibold">Cancel</button>
              </div>
            </form>
          )}

          {userSubs.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Zap className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">No subscriptions yet</p>
              <p className="text-xs mt-1">Add Spotify, Netflix, Disney+, etc.</p>
            </div>
          ) : (
            userSubs.map((sub) => {
              const daysUntil = differenceInDays(parseISO(sub.nextBillingDate), new Date());
              const isDueSoon = daysUntil <= 3 && daysUntil >= 0;
              const monthlyEq = toMonthly(sub.amount, sub.billingCycle);
              return (
                <div key={sub.id} className={cn('rounded-2xl bg-card border border-border/40 overflow-hidden shadow-sm', !sub.isActive && 'opacity-50')}>
                  <div className={`bg-gradient-to-r ${sub.color} h-1.5`} />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm truncate">{sub.name}</p>
                          {isDueSoon && <span className="text-[9px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full whitespace-nowrap">Due soon</span>}
                        </div>
                        <p className="text-xs text-muted-foreground capitalize mt-0.5">{sub.category} · {CYCLE_LABELS[sub.billingCycle]}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="font-extrabold text-base tabular-nums">₱{sub.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                          {sub.billingCycle !== 'monthly' && (
                            <span className="text-xs text-muted-foreground">≈ ₱{monthlyEq.toFixed(0)}/mo</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <CalendarClock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">
                            {daysUntil < 0 ? 'Overdue' : daysUntil === 0 ? 'Due today' : `In ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}
                            {' · '}{format(parseISO(sub.nextBillingDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button onClick={() => deleteSubscription(sub.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => updateSubscription(sub.id, { isActive: !sub.isActive })} className="text-primary">
                          {sub.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── BNPL Tab ── */}
      {tab === 'bnpl' && (
        <div className="space-y-3">
          <button
            onClick={() => setShowBNPLForm((v) => !v)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-border text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Pay Later Account
          </button>

          {showBNPLForm && (
            <form onSubmit={handleAddBNPL} className="rounded-2xl bg-card p-4 space-y-3 border border-border/50 shadow-sm">
              <p className="font-bold text-sm">New Pay Later Account</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Provider</label>
                  <select className={inputCls} value={bnplForm.provider} onChange={e => setBNPLForm(f => ({ ...f, provider: e.target.value as BNPLProvider }))}>
                    {BNPL_PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Label / Name</label>
                  <input className={inputCls} placeholder="e.g. SPayLater Main" value={bnplForm.name} onChange={e => setBNPLForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label className={labelCls}>Credit Limit (₱)</label>
                  <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00" value={bnplForm.creditLimit} onChange={e => setBNPLForm(f => ({ ...f, creditLimit: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Used / Balance (₱)</label>
                  <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00" value={bnplForm.usedCredit} onChange={e => setBNPLForm(f => ({ ...f, usedCredit: e.target.value }))} required />
                </div>
                <div>
                  <label className={labelCls}>Due Date</label>
                  <input type="date" className={inputCls} value={bnplForm.dueDate} onChange={e => setBNPLForm(f => ({ ...f, dueDate: e.target.value }))} required />
                </div>
                <div>
                  <label className={labelCls}>Min. Payment (₱)</label>
                  <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00" value={bnplForm.minimumPayment} onChange={e => setBNPLForm(f => ({ ...f, minimumPayment: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Monthly Installment (₱)</label>
                  <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00" value={bnplForm.monthlyInstallment} onChange={e => setBNPLForm(f => ({ ...f, monthlyInstallment: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">Add</button>
                <button type="button" onClick={() => setShowBNPLForm(false)} className="flex-1 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-semibold">Cancel</button>
              </div>
            </form>
          )}

          {userBNPL.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">No pay-later accounts</p>
              <p className="text-xs mt-1">Add SPayLater, LazPayLater, BillEase, etc.</p>
            </div>
          ) : (
            userBNPL.map((b) => {
              const daysUntil = differenceInDays(parseISO(b.dueDate), new Date());
              const isDueSoon = daysUntil <= 5 && daysUntil >= 0;
              const isOverdue = daysUntil < 0;
              const usagePercent = b.creditLimit > 0 ? (b.usedCredit / b.creditLimit) * 100 : 100;
              const gradient = getProviderGradient(b.provider);
              return (
                <div key={b.id} className={cn('rounded-2xl bg-card border overflow-hidden shadow-sm', isOverdue ? 'border-destructive/40' : isDueSoon ? 'border-amber-400/40' : 'border-border/40', !b.isActive && 'opacity-50')}>
                  <div className={`bg-gradient-to-r ${gradient} p-4 text-white`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-[10px] font-semibold uppercase tracking-wider">{getProviderLabel(b.provider)}</p>
                        <p className="font-bold text-base mt-0.5">{b.name}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => updateBNPLAccount(b.id, { isActive: !b.isActive })} className="p-1.5 rounded-lg bg-white/20">
                          {b.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button onClick={() => deleteBNPLAccount(b.id)} className="p-1.5 rounded-lg bg-white/20">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <p className="text-white/70 text-[10px]">Balance</p>
                        <p className="text-2xl font-extrabold tabular-nums">₱{b.usedCredit.toLocaleString('en-PH', { minimumFractionDigits: 0 })}</p>
                      </div>
                      {b.creditLimit > 0 && (
                        <div className="text-right">
                          <p className="text-white/70 text-[10px]">Limit</p>
                          <p className="font-bold text-sm">₱{b.creditLimit.toLocaleString('en-PH', { minimumFractionDigits: 0 })}</p>
                        </div>
                      )}
                    </div>
                    {b.creditLimit > 0 && (
                      <div className="mt-2 w-full bg-white/20 rounded-full h-1.5">
                        <div className="bg-white rounded-full h-1.5 transition-all" style={{ width: `${Math.min(usagePercent, 100)}%` }} />
                      </div>
                    )}
                  </div>
                  <div className="p-3 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Due Date</p>
                      <p className={cn('text-xs font-bold mt-0.5', isOverdue ? 'text-destructive' : isDueSoon ? 'text-amber-600 dark:text-amber-400' : 'text-foreground')}>
                        {isOverdue && <AlertTriangle className="w-3 h-3 inline mr-0.5" />}
                        {format(parseISO(b.dueDate), 'MMM d')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Min. Pay</p>
                      <p className="text-xs font-bold mt-0.5">₱{b.minimumPayment.toLocaleString('en-PH', { minimumFractionDigits: 0 })}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Monthly</p>
                      <p className="text-xs font-bold mt-0.5">₱{b.monthlyInstallment.toLocaleString('en-PH', { minimumFractionDigits: 0 })}</p>
                    </div>
                  </div>
                  {(isOverdue || isDueSoon) && (
                    <div className={cn('px-3 pb-3')}>
                      <div className={cn('rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5', isOverdue ? 'bg-destructive/10 text-destructive' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400')}>
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        {isOverdue ? `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''}` : `Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''} — pay at least ₱${b.minimumPayment.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
