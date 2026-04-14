'use client';

import { useFinance } from '@/lib/context/FinanceContext';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

const STORAGE_KEY = 'finsense_shown_alerts';

// Helper to get shown alerts from localStorage
function getShownAlerts(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch (e) {
    console.error('Failed to read shown alerts from localStorage:', e);
    return new Set();
  }
}

// Helper to save shown alerts to localStorage
function saveShownAlerts(alertIds: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(alertIds)));
  } catch (e) {
    console.error('Failed to save shown alerts to localStorage:', e);
  }
}

export function AlertBanner() {
  const { alerts, dismissAlert } = useFinance();

  useEffect(() => {
    // Always read from localStorage to ensure persistence across re-renders
    const shownAlerts = getShownAlerts();
    const unreadAlerts = alerts.filter((a) => !a.read);

    for (const alert of unreadAlerts) {
      // Only show toast if we haven't shown this alert ID yet
      if (!shownAlerts.has(alert.id)) {
        shownAlerts.add(alert.id);
        saveShownAlerts(shownAlerts);

        const iconMap = {
          warning: <AlertTriangle className="w-4 h-4" />,
          error: <AlertCircle className="w-4 h-4" />,
          info: <Info className="w-4 h-4" />,
        };

        const toastFn = toast[alert.severity as 'info' | 'warning' | 'error'] || toast.info;
        toastFn(alert.title, {
          description: alert.message,
          icon: iconMap[alert.severity],
          duration: 5000,
        });

        // Automatically dismiss the alert after showing it
        dismissAlert(alert.id);
      }
    }
  }, [alerts, dismissAlert]);

  return null;
}
