'use client';

import { useFinance } from '@/lib/context/FinanceContext';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

const STORAGE_KEY = 'finsense_shown_alerts';

// Helper to get shown/dismissed alerts from localStorage
function getProcessedAlerts(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch (e) {
    console.error('Failed to read processed alerts from localStorage:', e);
    return new Set();
  }
}

// Helper to save processed alerts to localStorage
function saveProcessedAlerts(alertIds: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(alertIds)));
  } catch (e) {
    console.error('Failed to save processed alerts to localStorage:', e);
  }
}

export function AlertBanner() {
  const { alerts, dismissAlert } = useFinance();
  const processedAlertsRef = useRef<Set<string>>(getProcessedAlerts());
  const previousAlertsRef = useRef<string[]>([]);

  useEffect(() => {
    // Filter to only unread alerts that haven't been shown yet
    const unreadAlerts = alerts.filter((a) => !a.read && !processedAlertsRef.current.has(a.id));

    // Only process if there are new unread alerts
    if (unreadAlerts.length === 0) return;

    for (const alert of unreadAlerts) {
      // Double-check it hasn't been processed
      if (processedAlertsRef.current.has(alert.id)) continue;

      // Mark as processed immediately
      processedAlertsRef.current.add(alert.id);
      saveProcessedAlerts(processedAlertsRef.current);

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

    // Track current alert IDs to detect changes
    previousAlertsRef.current = alerts.map(a => a.id);
  }, [alerts, dismissAlert]);

  return null;
}
