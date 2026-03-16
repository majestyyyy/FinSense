'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useFinance } from '@/lib/context/FinanceContext';
import { BottomNav } from '@/components/BottomNav';
import { AlertBanner } from '@/components/AlertBanner';
import { InstallPrompt } from '@/components/InstallPrompt';
import { FloatingChat } from '@/components/FloatingChat';
import { TrendingUp, Home, CreditCard, Target, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/transactions', label: 'Transactions', icon: CreditCard },
  { href: '/budgets', label: 'Budgets', icon: Target },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, user, setUser } = useFinance();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    } else if (isLoggedIn && user && !user.setupComplete) {
      router.push('/onboarding');
    }
  }, [isLoggedIn, user, router]);

  if (!isLoggedIn || !user?.setupComplete) {
    return null;
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Sidebar — desktop only */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-50 w-60 flex-col border-r border-border/50 bg-card backdrop-blur-xl dark:bg-[oklch(0.09_0.012_150)]">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border/40">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md glow-primary shrink-0">
            <TrendingUp className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-bold text-lg text-gradient leading-none">FinSense</span>
            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Personal Finance</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-3">Menu</p>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm glow-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-border/40 p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-muted/50 transition-colors group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[11px] font-bold text-white shadow-sm shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate leading-tight">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground truncate leading-tight">{user?.email}</p>
            </div>
            <button
              onClick={() => { setUser(null); router.push('/login'); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-destructive/10 hover:text-destructive"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col md:ml-60 min-h-screen">
        <AlertBanner />
        <main className="flex-1 overflow-auto pb-28 md:pb-8" style={{ paddingBottom: 'max(7rem, calc(5rem + env(safe-area-inset-bottom)))' }}>
          {children}
        </main>
        <BottomNav />
        <FloatingChat />
        <InstallPrompt />
      </div>
    </div>
  );
}
