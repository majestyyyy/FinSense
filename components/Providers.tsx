'use client';

import { FinanceProvider } from '@/lib/context/FinanceContext';
import { ThemeProvider } from 'next-themes';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <FinanceProvider>
        {children}
      </FinanceProvider>
    </ThemeProvider>
  );
}
