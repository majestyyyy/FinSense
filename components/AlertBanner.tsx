'use client';

import { useFinance } from '@/lib/context/FinanceContext';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AlertBanner() {
  const { alerts, dismissAlert } = useFinance();
  const unreadAlerts = alerts.filter((a) => !a.read).slice(0, 3);

  if (unreadAlerts.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border/60">
      {unreadAlerts.map((alert) => {
        const iconMap = {
          warning: <AlertTriangle className="w-4 h-4 shrink-0" />,
          error: <AlertCircle className="w-4 h-4 shrink-0" />,
          info: <Info className="w-4 h-4 shrink-0" />,
        };

        const styles = {
          warning: 'bg-yellow-50 dark:bg-yellow-500/10 border-l-yellow-500 text-yellow-800 dark:text-yellow-300',
          error: 'bg-red-50 dark:bg-red-500/10 border-l-red-500 text-red-800 dark:text-red-300',
          info: 'bg-blue-50 dark:bg-blue-500/10 border-l-blue-500 text-blue-800 dark:text-blue-300',
        };

        return (
          <div
            key={alert.id}
            className={cn(
              'flex items-start gap-3 px-4 py-2.5 border-l-4 text-sm',
              styles[alert.severity]
            )}
          >
            <div className="mt-0.5">{iconMap[alert.severity]}</div>
            <div className="flex-1 min-w-0">
              <span className="font-semibold">{alert.title}: </span>
              <span className="opacity-90">{alert.message}</span>
            </div>
            <button
              onClick={() => dismissAlert(alert.id)}
              className="shrink-0 opacity-50 hover:opacity-80 transition-opacity mt-0.5 ml-2"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
