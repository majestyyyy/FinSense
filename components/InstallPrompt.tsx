'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if ((navigator as { standalone?: boolean }).standalone) return;

    // Check dismissed state
    if (localStorage.getItem('pwa-install-dismissed')) return;

    // iOS detection
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    if (ios) {
      setIsIOS(true);
      setShowBanner(true);
      return;
    }

    // Android / Chrome install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowBanner(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', '1');
  };

  if (!showBanner || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-3 md:hidden" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
      <div className="rounded-2xl bg-foreground text-background p-4 shadow-2xl flex items-start gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-primary-foreground" />
        </div>
        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">Install FinSense</p>
          {isIOS ? (
            <p className="text-xs opacity-70 mt-0.5 leading-snug">
              Tap <span className="font-semibold">Share</span> then <span className="font-semibold">"Add to Home Screen"</span> to install
            </p>
          ) : (
            <p className="text-xs opacity-70 mt-0.5 leading-snug">
              Add to your home screen for the best experience
            </p>
          )}
          {!isIOS && (
            <button
              onClick={handleInstall}
              className="mt-2 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
            >
              Install App
            </button>
          )}
        </div>
        {/* Dismiss */}
        <button onClick={handleDismiss} className="p-1 rounded-lg opacity-60 hover:opacity-100 shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
