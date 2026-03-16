'use client';

import { useState } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { Subscription, BNPLAccount, BillingCycle, BNPLProvider } from '@/lib/types';
import { Plus, Trash2, ToggleLeft, ToggleRight, CreditCard, CalendarClock, AlertTriangle, Zap, X, Receipt, Wallet2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { differenceInDays, parseISO, format } from 'date-fns';

const SUB_COLORS: Record<string, string> = {
  'from-violet-500 to-purple-600': 'Violet',
  'from-pink-500 to-rose-500': 'Pink',
  'from-cyan-500 to-blue-600': 'Cyan',
  'from-emerald-500 to-teal-600': 'Green',
  'from-amber-400 to-orange-500': 'Amber',
  'from-slate-500 to-gray-600': 'Gray',
};

const CYCLE_LABELS: Record<BillingCycle, string> = {
  weekly: 'Weekly', monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly',
};

function toMonthly(amount: number, cycle: BillingCycle) {
  if (cycle === 'monthly') return amount;
  if (cycle === 'yearly') return amount / 12;
  if (cycle === 'quarterly') return amount / 3;
  if (cycle === 'weekly') return amount * 4.33;
  return amount;
}

const BNPL_PROVIDERS: { value: BNPLProvider; label: string; gradient: string }[] = [
  { value: 'spaylater', label: 'SPayLater', gradient: 'from-orange-400 to-red-500' },
  { value: 'lazpaylater', label: 'LazPayLater', gradient: 'from-blue-500 to-indigo-600' },
  { value: 'billease', label: 'BillEase', gradient: 'from-emerald-500 to-teal-600' },
  { value: 'home_credit', label: 'Home Credit', gradient: 'from-red-500 to-pink-600' },
  { value: 'acom', label: 'ACOM', gradient: 'from-yellow-400 to-amber-500' },
  { value: 'kredivo', label: 'Kredivo', gradient: 'from-cyan-500 to-blue-500' },
  { value: 'other', label: 'Other', gradient: 'from-slate-400 to-gray-500' },
];

function getProvider(p: BNPLProvider) { return BNPL_PROVIDERS.find(x => x.value === p) ?? BNPL_PROVIDERS[6]; }

const EMPTY_SUB = { name: '', amount: '', billingCycle: 'monthly' as BillingCycle, nextBillingDate: '', category: 'entertainment', color: 'from-violet-500 to-purple-600', isActive: true };
const EMPTY_BNPL = { provider: 'spaylater' as BNPLProvider, name: '', creditLimit: '', usedCredit: '', dueDate: '', minimumPayment: '', monthlyInstallment: '', isActive: true };

export default function BillsPage() {
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription, totalMonthlySubscriptions, bnplAccounts, addBNPLAccount, updateBNPLAccount, deleteBNPLAccount, totalBNPLDebt, user } = useFinance();
  const [tab, setTab] = useState<'subscriptions' | 'bnpl'>('subscriptions');
  const [showSubForm, setShowSubForm] = useState(false);
  const [showBNPLForm, setShowBNPLForm] = useState(false);
  const [subForm, setSubForm] = useState(EMPTY_SUB);
  const [bnplForm, setBNPLForm] = useState(EMPTY_BNPL);

  const userSubs = subscriptions.filter((s) => s.userId === user?.id);
  const userBNPL = bnplAccounts.filter((b) => b.userId === user?.id);
  const activeSubs = userSubs.filter(s => s.isActive);

  const handleAddSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subForm.name || !subForm.amount || !subForm.nextBillingDate) return;
    addSubscription({ name: subForm.name, amount: parseFloat(subForm.amount), billingCycle: subForm.billingCycle, nextBillingDate: subForm.nextBillingDate, category: subForm.category, color: subForm.color, isActive: true });
    setSubForm(EMPTY_SUB); setShowSubForm(false);
  };

  const handleAddBNPL = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bnplForm.name || !bnplForm.usedCredit || !bnplForm.dueDate) return;
    addBNPLAccount({ provider: bnplForm.provider, name: bnplForm.name, creditLimit: parseFloat(bnplForm.creditLimit) || 0, usedCredit: parseFloat(bnplForm.usedCredit), dueDate: bnplForm.dueDate, minimumPayment: parseFloat(bnplForm.minimumPayment) || 0, monthlyInstallment: parseFloat(bnplForm.monthlyInstallment) || 0, isActive: true });
    setBNPLForm(EMPTY_BNPL); setShowBNPLForm(false);
  };

  const inputCls = 'w-full rounded-xl bg-muted/70 border border-border/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40';
  const labelCls = 'text-xs font-semibold text-muted-foreground mb-1.5 block';

  return (
    <div className="min-h-screen pb-8">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-violet-500/10 translate-x-1/3 -translate-y-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-rose-500/10 translate-y-1/2 blur-2xl" />
        </div>
        <div className="relative px-4 md:px-8 pt-6 pb-7 max-w-2xl mx-auto">
          <h1 className="text-2xl font-extrabold text-white mb-4">Bills &amp; Payments</h1>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="w-4 h-4 text-violet-300" />
                <p className="text-white/60 text-[10px] uppercase tracking-wider font-semibold">Monthly Subs</p>
              </div>
              <p className="text-2xl font-extrabold text-white tabular-nums">
                &#8369;{totalMonthlySubscriptions.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <p className="text-white/50 text-[10px] mt-1">{activeSubs.length} active subscription{activeSubs.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet2 className="w-4 h-4 text-rose-300" />
                <p className="text-white/60 text-[10px] uppercase tracking-wider font-semibold">BNPL Debt</p>
              </div>
              <p className="text-2xl font-extrabold text-white tabular-nums">
                &#8369;{totalBNPLDebt.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <p className="text-white/50 text-[10px] mt-1">{userBNPL.filter(b => b.isActive).length} active account{userBNPL.filter(b => b.isActive).length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 pt-4 space-y-4 max-w-2xl mx-auto animate-fade-up">
        <div className="flex rounded-2xl bg-muted/60 p-1 gap-1">
          {(['subscriptions', 'bnpl'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn('flex-1 py-2.5 rounded-xl text-xs font-bold transition-all', tab === t ? 'bg-card text-foreground shadow-md' : 'text-muted-foreground hover:text-foreground')}>
              {t === 'subscriptions' ? 'Subscriptions' : 'Pay Later'}
            </button>
          ))}
        </div>

        {tab === 'subscriptions' && (
          <div className="space-y-3">
            <button onClick={() => setShowSubForm(v => !v)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-border text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <Plus className="w-4 h-4" /> Add Subscription
            </button>

            {showSubForm && (
              <div className="rounded-2xl bg-card border border-border/50 shadow-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/30">
                  <p className="font-bold text-sm">New Subscription</p>
                  <button onClick={() => setShowSubForm(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleAddSub} className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Service Name</label>
                      <input className={inputCls} placeholder="Spotify, Netflix..." value={subForm.name} onChange={e => setSubForm(f => ({ ...f, name: e.target.value }))} required />
                    </div>
                    <div>
                      <label className={labelCls}>Amount (&#8369;)</label>
                      <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00" value={subForm.amount} onChange={e => setSubForm(f => ({ ...f, amount: e.target.value }))} required />
                    </div>
                    <div>
                      <label className={labelCls}>Billing Cycle</label>
                      <select className={inputCls} value={subForm.billingCycle} onChange={e => setSubForm(f => ({ ...f, billingCycle: e.target.value as BillingCycle }))}>
                        {Object.entries(CYCLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Next Billing Date</label>
                      <input type="date" className={inputCls} value={subForm.nextBillingDate} onChange={e => setSubForm(f => ({ ...f, nextBillingDate: e.target.value }))} required />
                    </div>
                    <div>
                      <label className={labelCls}>Category</label>
                      <select className={inputCls} value={subForm.category} onChange={e => setSubForm(f => ({ ...f, category: e.target.value }))}>
                        {['entertainment', 'productivity', 'health', 'education', 'utilities', 'other'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Color</label>
                      <select className={inputCls} value={subForm.color} onChange={e => setSubForm(f => ({ ...f, color: e.target.value }))}>
                        {Object.entries(SUB_COLORS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary to-emerald-700 text-white text-sm font-semibold">Add</button>
                    <button type="button" onClick={() => setShowSubForm(false)} className="flex-1 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-semibold">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {userSubs.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-4"><Zap className="w-9 h-9 text-muted-foreground/30" /></div>
                <p className="font-bold text-foreground">No subscriptions yet</p>
                <p className="text-sm text-muted-foreground mt-1">Add Spotify, Netflix, Disney+, etc.</p>
              </div>
            ) : (
              userSubs.map((sub) => {
                const daysUntil = differenceInDays(parseISO(sub.nextBillingDate), new Date());
                const isDueSoon = daysUntil <= 3 && daysUntil >= 0;
                const isOverdue = daysUntil < 0;
                const monthlyEq = toMonthly(sub.amount, sub.billingCycle);
                return (
                  <div key={sub.id} className={cn('rounded-2xl bg-card border overflow-hidden shadow-sm transition-all', !sub.isActive && 'opacity-50', isOverdue ? 'border-destructive/30' : isDueSoon ? 'border-amber-400/30' : 'border-border/30')}>
                    <div className={`bg-gradient-to-r ${sub.color} h-1.5`} />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-sm">{sub.name}</p>
                            {isDueSoon && !isOverdue && (
                              <span className="flex items-center gap-1 text-[9px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />Due soon
                              </span>
                            )}
                            {isOverdue && <span className="text-[9px] font-bold bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full">Overdue</span>}
                          </div>
                          <p className="text-xs text-muted-foreground capitalize mt-0.5">{sub.category} - {CYCLE_LABELS[sub.billingCycle]}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="font-extrabold text-base tabular-nums">&#8369;{sub.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                            {sub.billingCycle !== 'monthly' && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">&#8776; &#8369;{monthlyEq.toFixed(0)}/mo</span>}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <CalendarClock className="w-3 h-3 text-muted-foreground" />
                            <span className={cn('text-[11px]', isOverdue ? 'text-destructive font-semibold' : isDueSoon ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-muted-foreground')}>
                              {daysUntil < 0 ? `Overdue by ${Math.abs(daysUntil)}d` : daysUntil === 0 ? 'Due today' : `${daysUntil}d left`}
                              {' - '}{format(parseISO(sub.nextBillingDate), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2 shrink-0">
                          <button onClick={() => deleteSubscription(sub.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => updateSubscription(sub.id, { isActive: !sub.isActive })} className="text-primary transition-colors">
                            {sub.isActive ? <ToggleRight className="w-7 h-7 text-primary" /> : <ToggleLeft className="w-7 h-7 text-muted-foreground" />}
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

        {tab === 'bnpl' && (
          <div className="space-y-3">
            <button onClick={() => setShowBNPLForm(v => !v)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-border text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <Plus className="w-4 h-4" /> Add Pay Later Account
            </button>

            {showBNPLForm && (
              <div className="rounded-2xl bg-card border border-border/50 shadow-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/30">
                  <p className="font-bold text-sm">New Pay Later Account</p>
                  <button onClick={() => setShowBNPLForm(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleAddBNPL} className="p-4 space-y-3">
                  <div>
                    <label className={labelCls}>Provider</label>
                    <div className="grid grid-cols-4 gap-2">
                      {BNPL_PROVIDERS.map(p => (
                        <button key={p.value} type="button" onClick={() => setBNPLForm(f => ({ ...f, provider: p.value }))}
                          className={cn('flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs transition-all', bnplForm.provider === p.value ? 'border-primary bg-primary/10' : 'border-border/50 bg-muted/30 text-muted-foreground')}>
                          <span className="text-[10px] leading-tight text-center font-semibold">{p.label.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Label / Name</label>
                      <input className={inputCls} placeholder="e.g. SPayLater Main" value={bnplForm.name} onChange={e => setBNPLForm(f => ({ ...f, name: e.target.value }))} required />
                    </div>
                    <div>
                      <label className={labelCls}>Credit Limit (&#8369;)</label>
                      <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00" value={bnplForm.creditLimit} onChange={e => setBNPLForm(f => ({ ...f, creditLimit: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelCls}>Balance Owed (&#8369;)</label>
                      <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00" value={bnplForm.usedCredit} onChange={e => setBNPLForm(f => ({ ...f, usedCredit: e.target.value }))} required />
                    </div>
                    <div>
                      <label className={labelCls}>Due Date</label>
                      <input type="date" className={inputCls} value={bnplForm.dueDate} onChange={e => setBNPLForm(f => ({ ...f, dueDate: e.target.value }))} required />
                    </div>
                    <div>
                      <label className={labelCls}>Min. Payment (&#8369;)</label>
                      <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00" value={bnplForm.minimumPayment} onChange={e => setBNPLForm(f => ({ ...f, minimumPayment: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelCls}>Monthly Install. (&#8369;)</label>
                      <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00" value={bnplForm.monthlyInstallment} onChange={e => setBNPLForm(f => ({ ...f, monthlyInstallment: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary to-emerald-700 text-white text-sm font-semibold">Add</button>
                    <button type="button" onClick={() => setShowBNPLForm(false)} className="flex-1 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-semibold">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {userBNPL.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-4"><CreditCard className="w-9 h-9 text-muted-foreground/30" /></div>
                <p className="font-bold text-foreground">No pay-later accounts</p>
                <p className="text-sm text-muted-foreground mt-1">Add SPayLater, LazPayLater, BillEase...</p>
              </div>
            ) : (
              userBNPL.map((b) => {
                const daysUntil = differenceInDays(parseISO(b.dueDate), new Date());
                const isDueSoon = daysUntil <= 5 && daysUntil >= 0;
                const isOverdue = daysUntil < 0;
                const usagePercent = b.creditLimit > 0 ? (b.usedCredit / b.creditLimit) * 100 : 100;
                const prov = getProvider(b.provider);

                return (
                  <div key={b.id} className={cn('rounded-2xl overflow-hidden shadow-sm border transition-all', isOverdue ? 'border-destructive/40' : isDueSoon ? 'border-amber-400/30' : 'border-border/20', !b.isActive && 'opacity-50')}>
                    <div className={`bg-gradient-to-br ${prov.gradient} p-5 text-white`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">{prov.label}</p>
                          <p className="font-extrabold text-base mt-0.5">{b.name}</p>
                        </div>
                        <div className="flex gap-1.5">
                          <button onClick={() => updateBNPLAccount(b.id, { isActive: !b.isActive })} className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors">
                            {b.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>
                          <button onClick={() => deleteBNPLAccount(b.id)} className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <div className="mt-4 flex items-end justify-between">
                        <div>
                          <p className="text-white/60 text-[10px] uppercase tracking-wider">Balance</p>
                          <p className="text-3xl font-extrabold tabular-nums mt-0.5">
                            &#8369;{b.usedCredit.toLocaleString('en-PH', { minimumFractionDigits: 0 })}
                          </p>
                        </div>
                        {b.creditLimit > 0 && (
                          <div className="text-right">
                            <p className="text-white/60 text-[10px]">Limit</p>
                            <p className="font-extrabold">&#8369;{b.creditLimit.toLocaleString('en-PH', { minimumFractionDigits: 0 })}</p>
                          </div>
                        )}
                      </div>
                      {b.creditLimit > 0 && (
                        <>
                          <div className="mt-3 w-full bg-white/20 rounded-full h-2 overflow-hidden">
                            <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${Math.min(usagePercent, 100)}%` }} />
                          </div>
                          <p className="text-white/50 text-[10px] mt-1.5">
                            {(100 - Math.min(usagePercent, 100)).toFixed(0)}%        &#8369;{(b.creditLimit - b.usedCredit).toLocaleString('en-PH', { minimumFractionDigits: 0 })} remainingavailable 
                          </p>
                        </>
                      )}
                    </div>
                    <div className="bg-card grid grid-cols-3 divide-x divide-border/30">
                      <div className="p-3 text-center">
                        <p className="text-[10px] text-muted-foreground">Due Date</p>
                        <p className={cn('text-xs font-extrabold mt-0.5', isOverdue ? 'text-destructive' : isDueSoon ? 'text-amber-600 dark:text-amber-400' : 'text-foreground')}>
                          {format(parseISO(b.dueDate), 'MMM d')}
                        </p>
                      </div>
                      <div className="p-3 text-center">
                        <p className="text-[10px] text-muted-foreground">Min. Pay</p>
                        <p className="text-xs font-extrabold mt-0.5">&#8369;{b.minimumPayment.toLocaleString('en-PH', { minimumFractionDigits: 0 })}</p>
                      </div>
                      <div className="p-3 text-center">
                        <p className="text-[10px] text-muted-foreground">Monthly</p>
                        <p className="text-xs font-extrabold mt-0.5">&#8369;{b.monthlyInstallment.toLocaleString('en-PH', { minimumFractionDigits: 0 })}</p>
                      </div>
                    </div>
                    {(isOverdue || isDueSoon) && (
                      <div className={cn('px-4 py-3 flex items-center gap-2 text-xs font-semibold', isOverdue ? 'bg-destructive/10 text-destructive' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400')}>
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        {isOverdue
                          ? `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''} - pay now`
                          : `Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''} - pay at least &#8369;${b.minimumPayment.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
