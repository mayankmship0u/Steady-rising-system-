import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, X, Check, HelpCircle } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // If already running standalone or user dismissed for this session
  if (isInstalled || dismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <div className="relative mx-4 my-2.5 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/60 to-slate-900/80 p-3.5 shadow-neon-cyan backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-orbitron text-xs font-bold tracking-wider text-cyan-300">
                  INSTALL ON ANDROID
                </span>
                <span className="text-[10px] text-cyan-400/80 font-rajdhani">PWA SYSTEM</span>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-1">
                Install as a full-screen app on your phone with offline access.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-bold font-orbitron text-black transition-all hover:bg-cyan-300 active:scale-95 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>INSTALL</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-slate-400 hover:text-white transition"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Manual Android Chrome & iOS Install Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-cyan-500/40 bg-[#0d111a] p-6 shadow-neon-cyan">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <h3 className="font-orbitron text-sm font-bold tracking-wider text-white">
                  INSTALLATION GUIDE
                </h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs text-slate-300">
                <p className="text-cyan-300 font-semibold">For iPhone & Safari:</p>
                <ol className="list-decimal list-inside space-y-2 text-slate-300">
                  <li>Tap the <strong>Share</strong> button (box with upward arrow) in Safari.</li>
                  <li>Scroll down the actions list and tap <strong>Add to Home Screen</strong>.</li>
                  <li>Confirm by tapping <strong>Add</strong> at top right.</li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-300">
                <p className="text-cyan-300 font-semibold">For Android Chrome:</p>
                <ol className="list-decimal list-inside space-y-2 text-slate-300">
                  <li>Tap the <strong>three dots menu (⋮)</strong> at top-right of Chrome.</li>
                  <li>Select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.</li>
                  <li>Confirm <strong>Install</strong> when the system prompt appears.</li>
                  <li>STEADY will appear in your app drawer and home screen like a native app!</li>
                </ol>
              </div>
            )}

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>Runs offline</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>Zero horizontal scroll</span>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-white hover:bg-slate-700 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
