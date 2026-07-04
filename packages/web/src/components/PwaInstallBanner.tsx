import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PwaInstallBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('pwa-install-dismissed') === '1',
  );
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (isStandalone || dismissed || !deferred) return null;

  async function handleInstall() {
    await deferred!.prompt();
    const { outcome } = await deferred!.userChoice;
    if (outcome === 'accepted') setDeferred(null);
  }

  function handleDismiss() {
    localStorage.setItem('pwa-install-dismissed', '1');
    setDismissed(true);
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-3">
      <div className="flex items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3 text-sm">
        <span className="text-xl">📲</span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-brand-700">添加到主屏幕</p>
          <p className="text-xs text-brand-600/80">像 App 一样快速打开</p>
        </div>
        <button
          type="button"
          onClick={() => void handleInstall()}
          className="shrink-0 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white"
        >
          安装
        </button>
        <button type="button" onClick={handleDismiss} className="shrink-0 text-slate-400">
          ✕
        </button>
      </div>
    </div>
  );
}
