import React from 'react';
import { UserProfile, AppSettings } from '../../types';
import { RankEmblem } from '../common/RankEmblem';
import { Volume2, VolumeX, Flame, Download, Waves } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface HeaderProps {
  user: UserProfile;
  settings: AppSettings;
  onToggleSound: () => void;
  onToggleAmbient: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  settings,
  onToggleSound,
  onToggleAmbient,
  onOpenSettings,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#07090e]/95 backdrop-blur-md px-4 py-2.5 transition-all">
      <div className="mx-auto flex max-w-md items-center justify-between">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <RankEmblem rank={user.rank} size="sm" />
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-orbitron text-base font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-400">
                STEADY
              </h1>
              <span className="text-[10px] font-orbitron font-semibold text-cyan-400/90 px-1.5 py-0.2 rounded border border-cyan-500/30 bg-cyan-950/40">
                LV.{user.level}
              </span>
            </div>
            <p className="text-[9px] font-rajdhani font-semibold tracking-widest text-slate-400 uppercase">
              SHADOW LEVEL SYSTEM
            </p>
          </div>
        </div>

        {/* Right Action Icons: Streak, Install, Ambient, Audio */}
        <div className="flex items-center gap-2">
          {/* Streak indicator */}
          <div
            title={`Active Streak: ${user.currentStreak} day${user.currentStreak > 1 ? 's' : ''}`}
            className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-950/30 px-2 py-1 text-xs font-bold text-amber-300 font-orbitron shadow-inner-glow"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
            <span>{user.currentStreak}d</span>
          </div>

          {/* Quick Install Button if installable on Chrome Android */}
          {isInstallable && !isInstalled && (
            <button
              onClick={() => install()}
              title="Install App to Android Home Screen"
              className="flex items-center justify-center p-2 rounded-lg border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/50 transition active:scale-95"
              aria-label="Install App"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* Ambient Dark Fantasy Atmosphere Toggle */}
          <button
            onClick={onToggleAmbient}
            title={
              settings.ambientSoundEnabled
                ? 'Mute Shadow Sanctuary Ambience'
                : 'Enable Shadow Sanctuary Dark Ambience'
            }
            className={`flex items-center justify-center p-2 rounded-lg border transition active:scale-95 ${
              settings.ambientSoundEnabled && settings.soundEnabled
                ? 'border-purple-500/50 bg-purple-950/60 text-purple-300 shadow-neon-violet'
                : 'border-slate-800 bg-slate-900/60 text-slate-500 hover:text-slate-300'
            }`}
            aria-label="Toggle Ambient Atmosphere"
          >
            <Waves className={`w-4 h-4 ${settings.ambientSoundEnabled ? 'animate-pulse' : ''}`} />
          </button>

          {/* Master Sound Effects Toggle */}
          <button
            onClick={onToggleSound}
            title={settings.soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            className="flex items-center justify-center p-2 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white transition active:scale-95"
            aria-label="Toggle Sound"
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
