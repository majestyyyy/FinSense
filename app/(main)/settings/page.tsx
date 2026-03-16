'use client';

import { useRouter } from 'next/navigation';
import { useFinance } from '@/lib/context/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogOut, Trash2, Download, AlertCircle, User, Mail, Calendar, Banknote, Building2, Smartphone, CreditCard, Plus, Pencil, Check, X, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { WalletType } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const WALLET_METAS: Record<WalletType, { label: string; icon: React.ComponentType<{ className?: string }>; gradient: string; color: string }> = {
  cash: { label: 'Cash', icon: Banknote, gradient: 'from-emerald-500 to-teal-500', color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400' },
  bank: { label: 'Bank Account', icon: Building2, gradient: 'from-cyan-500 to-blue-600', color: 'text-blue-600 bg-blue-100 dark:bg-blue-500/20 dark:text-blue-400' },
  ewallet: { label: 'E-Wallet', icon: Smartphone, gradient: 'from-emerald-500 to-teal-600', color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400' },
  digital_bank: { label: 'Digital Bank', icon: CreditCard, gradient: 'from-rose-500 to-pink-500', color: 'text-rose-600 bg-rose-100 dark:bg-rose-500/20 dark:text-rose-400' },
};

export default function SettingsPage() {
  const router = useRouter();
  const { user, setUser, transactions, budgets, chatMessages, wallets, addWallet, updateWallet, deleteWallet, totalWalletBalance } = useFinance();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [newWalletType, setNewWalletType] = useState<WalletType>('cash');
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletBalance, setNewWalletBalance] = useState('');

  const { resolvedTheme, setTheme } = useTheme();
  const userWallets = wallets.filter((w) => w.userId === user?.id);

  const handleLogout = () => { setUser(null); router.push('/login'); };
  const handleClearData = () => { setUser(null); setDeleteDialogOpen(false); router.push('/login'); };

  const handleExportData = () => {
    const exportData = { user, transactions, budgets, chatMessages, wallets, exportDate: new Date().toISOString() };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finsense-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveBalance = (walletId: string) => {
    const val = parseFloat(editBalance);
    if (!isNaN(val) && val >= 0) updateWallet(walletId, { balance: val });
    setEditingWalletId(null);
    setEditBalance('');
  };

  const handleAddWallet = () => {
    if (!newWalletName.trim()) return;
    addWallet({ type: newWalletType, name: newWalletName.trim(), balance: parseFloat(newWalletBalance) || 0 });
    setNewWalletName(''); setNewWalletBalance(''); setShowAddWallet(false);
  };

  const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '??';

  return (
    <div className="space-y-5 p-4 md:p-8 max-w-2xl mx-auto animate-fade-up">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage your account and wallets</p>
      </div>

      {/* Profile Hero */}
      <div className="rounded-2xl overflow-hidden">
        <div className="h-24 bg-gradient-to-br from-emerald-600 via-emerald-800 to-black relative">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 translate-x-1/3 -translate-y-1/3 blur-2xl" />
          </div>
        </div>
        <div className="bg-card border border-border/40 border-t-0 rounded-b-2xl px-5 pb-5 -mt-1">
          <div className="flex items-end gap-4 -mt-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-xl font-bold text-white shadow-xl border-4 border-card shrink-0">
              {initials}
            </div>
            <div className="pb-1">
              <h2 className="font-extrabold text-lg leading-tight">{user?.name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { value: transactions.length, label: 'Transactions', color: 'text-primary' },
              { value: budgets.length, label: 'Budgets', color: 'text-accent' },
              { value: chatMessages.length, label: 'Messages', color: 'text-emerald-500' },
            ].map(({ value, label, color }) => (
              <div key={label} className="text-center py-3 rounded-xl bg-muted/50">
                <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/30">
          <p className="text-sm font-bold">Account Information</p>
        </div>
        <div className="divide-y divide-border/20">
          {[
            { icon: User, label: 'Name', value: user?.name },
            { icon: Mail, label: 'Email', value: user?.email },
            { icon: Calendar, label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/30"><p className="text-sm font-bold">Appearance</p></div>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              {resolvedTheme === 'dark' ? <Moon className="w-4 h-4 text-primary"/> : <Sun className="w-4 h-4 text-primary"/>}
            </div>
            <div>
              <p className="text-sm font-semibold">{resolvedTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
              <p className="text-xs text-muted-foreground">Tap to toggle theme</p>
            </div>
          </div>
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${resolvedTheme === 'dark' ? 'bg-primary' : 'bg-muted-foreground/30'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${resolvedTheme === 'dark' ? 'left-6' : 'left-0.5'}`}/>
          </button>
        </div>
      </div>

      {/* Wallets */}
      <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold">My Wallets</p>
            <p className="text-xs text-muted-foreground">Total: <span className="font-bold text-foreground">₱{totalWalletBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span></p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowAddWallet(!showAddWallet)} className="h-8 gap-1 text-xs rounded-xl">
            <Plus className="w-3.5 h-3.5" /> Add
          </Button>
        </div>

        {showAddWallet && (
          <div className="p-4 border-b border-border/30 bg-muted/30 space-y-3">
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(WALLET_METAS) as WalletType[]).map((type) => {
                const { label, icon: Icon, color } = WALLET_METAS[type];
                return (
                  <button key={type} onClick={() => setNewWalletType(type)} className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all ${newWalletType === type ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/50 hover:border-primary/40'}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}><Icon className="w-4 h-4" /></div>
                    <span className="text-[10px] font-semibold leading-tight">{label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
            <Input placeholder={`Name (e.g. ${WALLET_METAS[newWalletType].label})`} value={newWalletName} onChange={(e) => setNewWalletName(e.target.value)} className="h-10 rounded-xl bg-muted/40 border-border/60 text-sm" />
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">₱</span>
              <Input type="number" min="0" step="0.01" placeholder="0.00" value={newWalletBalance} onChange={(e) => setNewWalletBalance(e.target.value)} className="pl-8 h-10 rounded-xl bg-muted/40 border-border/60 text-sm" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 h-9 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-800 shadow-sm" onClick={handleAddWallet} disabled={!newWalletName.trim()}>Add Wallet</Button>
              <Button size="sm" variant="ghost" className="h-9 px-3 rounded-xl" onClick={() => setShowAddWallet(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="divide-y divide-border/20">
          {userWallets.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No wallets added yet</p>
          ) : userWallets.map((wallet) => {
            const { icon: Icon, gradient, label } = WALLET_METAS[wallet.type] ?? WALLET_METAS.cash;
            const isEditing = editingWalletId === wallet.id;
            return (
              <div key={wallet.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{wallet.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                </div>
                {isEditing ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="relative w-24">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold">₱</span>
                      <Input type="number" min="0" step="0.01" value={editBalance} onChange={(e) => setEditBalance(e.target.value)} className="pl-5 h-8 text-sm rounded-lg" autoFocus />
                    </div>
                    <button onClick={() => handleSaveBalance(wallet.id)} className="w-8 h-8 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 flex items-center justify-center"><Check className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setEditingWalletId(null)} className="w-8 h-8 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-extrabold tabular-nums">₱{wallet.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    <button onClick={() => { setEditingWalletId(wallet.id); setEditBalance(wallet.balance.toString()); }} className="w-8 h-8 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-primary"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteWallet(wallet.id)} className="w-8 h-8 rounded-xl hover:bg-destructive/10 hover:text-destructive flex items-center justify-center text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Management */}
      <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/30">
          <p className="text-sm font-bold">Data Management</p>
        </div>
        <div className="p-4 space-y-3">
          <Button onClick={handleExportData} variant="outline" className="w-full justify-start gap-2.5 h-11 rounded-xl border-border/50 hover:border-primary/40 hover:bg-primary/5">
            <Download className="w-4 h-4 text-primary" />
            Export My Data (JSON)
          </Button>
          <p className="text-xs text-muted-foreground">Download all transactions, budgets, and chat history.</p>
        </div>
      </div>

      {/* About */}
      <div className="rounded-2xl border border-border/30 bg-muted/30 p-4 space-y-2">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">About FinSense</p>
        <p className="text-sm text-muted-foreground leading-relaxed">A personal finance tracker for Filipino students — track expenses, set budgets, and get AI advice.</p>
        <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
          <span>v1.0.0</span>
          <span>Next.js 16 · React 19 · Tailwind CSS 4</span>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-destructive/20">
          <p className="text-sm font-bold text-destructive flex items-center gap-2"><AlertCircle className="w-4 h-4" />Danger Zone</p>
        </div>
        <div className="p-4 space-y-2">
          <Button onClick={() => setLogoutDialogOpen(true)} variant="outline" className="w-full justify-start gap-2.5 h-11 rounded-xl text-destructive border-destructive/25 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
          <Button onClick={() => setDeleteDialogOpen(true)} variant="outline" className="w-full justify-start gap-2.5 h-11 rounded-xl text-destructive border-destructive/25 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40">
            <Trash2 className="w-4 h-4" /> Delete All Data & Logout
          </Button>
          <p className="text-xs text-muted-foreground pt-1">Deleting permanently removes all your data. This cannot be undone.</p>
        </div>
      </div>

      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out</AlertDialogTitle>
            <AlertDialogDescription>You will be signed out. You can log back in anytime.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive rounded-xl">Sign Out</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Data</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone. All transactions, budgets, and chat history will be permanently deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearData} className="bg-destructive rounded-xl">Delete Everything</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
