'use client';

import { FinanceProvider } from '@/lib/context/FinanceContext';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <FinanceProvider>
        {children}
        <Toaster position="top-center" richColors />
      </FinanceProvider>
    </ThemeProvider>
  );
}
