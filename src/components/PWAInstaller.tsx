'use client';

import { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('PaceRun SW registrado:', reg.scope))
        .catch((err) => console.warn('PaceRun SW erro:', err));
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  if (!isInstallable || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-xl border border-[#E5E5EA] bg-white p-4 shadow-xl transition-all">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FC4C02] text-white shadow-sm">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#242428]">Instalar PaceRun App</h4>
            <p className="text-xs text-[#6D6D78]">Acesse seus treinos direto da tela de início</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 rounded-lg bg-[#FC4C02] hover:bg-[#E34402] px-3.5 py-2 text-xs font-bold text-white shadow-sm active:scale-95 transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            Instalar
          </button>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Fechar banner de instalação"
            className="p-1.5 text-[#6D6D78] hover:text-[#242428] rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
