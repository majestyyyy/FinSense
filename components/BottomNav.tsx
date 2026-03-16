'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CreditCard, Target, Settings, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/transactions', label: 'Txns', icon: CreditCard },
    { href: '/budgets', label: 'Budgets', icon: Target },
    { href: '/bills', label: 'Bills', icon: Receipt },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden z-50 px-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
      <div className="flex justify-around items-center px-2 py-2 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl shadow-black/20 dark:shadow-black/60 mb-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-all"
            >
              <span
                className={cn(
                  'flex items-center justify-center w-11 h-8 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-br from-primary to-primary/80 shadow-sm'
                    : 'bg-transparent'
                )}
              >
                <Icon
                  className={cn(
                    'w-[18px] h-[18px] transition-colors',
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                  )}
                />
              </span>
              <span
                className={cn(
                  'text-[9px] font-semibold leading-none tracking-wide transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground/70'
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
