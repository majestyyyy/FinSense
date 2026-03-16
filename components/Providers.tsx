'use client';

import { FinanceProvider } from '@/lib/context/FinanceContext';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FinanceProvider>
      {children}
    </FinanceProvider>
  );
}
