import React, { useState } from 'react';
import {
  UserProfile,
  Achievement,
  XPTransaction,
  AppSettings,
  TimetableActivity,
  Quest,
  PushUpRecord,
  StudySession,
} from '../../types';
import { RankEmblem } from '../common/RankEmblem';
import { soundFx, triggerHaptic } from '../../utils/audio';
import { StorageService } from '../../utils/storage';
import {
  Shield,
  Award,
  History,
  Settings as SettingsIcon,
  Download,
  Trash2,
  Calendar,
  Volume2,
  VolumeX,
  Smartphone,
  CheckCircle2,
  Lock,
  Flame,
  FileText,
  FileSpreadsheet,
  AlertTriangle,
  Briefcase,
  HelpCircle,
  Waves,
  Music,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface VaultScreenProps {
  user: UserProfile;
  achievements: Achievement[];
  xpLedger: XPTransaction[];
  settings: AppSettings;
  timetable: TimetableActivity[];
  quests: Quest[];
  pushUpRecords: PushUpRecord[];
  studySessions: StudySession[];
  onUpdateSettings: (newSettings: AppSettings) => void;
  onOpenTimetable: () => void;
  onResetData: () => void;
  onToggleRestDay: () => void;
}

export const VaultScreen: React.FC<VaultScreenProps> = ({
  user,
  achievements,
  xpLedger,
  settings,
  onOpenTimetable,
  onUpdateSettings,
  onResetData,
  onToggleRestDay,
}) => {
  const [activeTab, setActiveTab] = useState<'id' | 'achievements' | 'ledger' | 'settings'>('id');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const todayStr = new Date().toISOString().split('T')[0];
  const isTodayRestDay = user.restDays.includes(todayStr);

  const handleDownloadJSON = () => {
    const jsonStr = StorageService.exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `steady_shadow_backup_${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    soundFx.playClick();
    setExportNotice('Exported complete backup to JSON.');
    setTimeout(() => setExportNotice(null), 3500);
  };

  const handleDownloadPushUpsCSV = () => {
    const csvStr = StorageService.exportPushUpsCSV();
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `steady_pushups_${todayStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    soundFx.playClick();
    setExportNotice('Exported Push-Ups history to CSV.');
    setTimeout(() => setExportNotice(null), 3500);
  };

  const handleDownloadQuestsCSV = () => {
    const csvStr = StorageService.exportQuestsCSV();
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `steady_quests_${todayStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    soundFx.playClick();
    setExportNotice('Exported Quests history to CSV.');
    setTimeout(() => setExportNotice(null), 3500);
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-[#101422] to-[#07090e] p-5 shadow-neon-cyan hunter-grid-bg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RankEmblem rank={user.rank} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <h2 className="font-orbitron text-lg font-black tracking-wider text-white">
                  THE VAULT
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-rajdhani">
                Hunter Dossier, Shadow Ledger &amp; System Settings
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-rajdhani uppercase">Trophies</span>
            <span className="font-orbitron text-lg font-bold text-amber-400">
              {unlockedCount} / {achievements.length}
            </span>
          </div>
        </div>
      </div>

      {/* Vault Tabs */}
      <div className="flex rounded-xl border border-slate-800 bg-slate-900/60 p-1">
        <button
          onClick={() => {
            setActiveTab('id');
            soundFx.playClick();
          }}
          className={`flex-1 py-2 text-center text-xs font-orbitron font-bold rounded-lg transition-all ${
            activeTab === 'id'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          HUNTER ID
        </button>
        <button
          onClick={() => {
            setActiveTab('achievements');
            soundFx.playClick();
          }}
          className={`flex-1 py-2 text-center text-xs font-orbitron font-bold rounded-lg transition-all ${
            activeTab === 'achievements'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          TROPHIES
        </button>
        <button
          onClick={() => {
            setActiveTab('ledger');
            soundFx.playClick();
          }}
          className={`flex-1 py-2 text-center text-xs font-orbitron font-bold rounded-lg transition-all ${
            activeTab === 'ledger'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          EXP LEDGER
        </button>
        <button
          onClick={() => {
            setActiveTab('settings');
            soundFx.playClick();
          }}
          className={`flex-1 py-2 text-center text-xs font-orbitron font-bold rounded-lg transition-all ${
            activeTab === 'settings'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          SETTINGS
        </button>
      </div>

      {/* Export Notice */}
      {exportNotice && (
        <div className="p-3 rounded-xl border border-cyan-500/40 bg-cyan-950/60 text-cyan-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 1. HUNTER ID CARD TAB */}
      {activeTab === 'id' && (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border-2 border-cyan-500/50 bg-gradient-to-br from-[#0e1424] via-[#090c14] to-[#04060a] p-6 shadow-neon-cyan">
            {/* Holographic Watermark */}
            <div className="absolute right-4 bottom-4 opacity-10 pointer-events-none">
              <Shield className="w-36 h-36 text-cyan-400" />
            </div>

            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-orbitron tracking-widest text-cyan-400 uppercase">
                  ASSOCIATION IDENTIFICATION
                </span>
                <h3 className="font-orbitron text-xl font-black text-white mt-0.5">
                  {user.hunterName}
                </h3>
                <span className="text-xs text-slate-400 font-rajdhani font-semibold">
                  CODE: {user.hunterCode}
                </span>
              </div>
              <RankEmblem rank={user.rank} size="lg" showLabel />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-800 bg-black/40 p-2.5">
                <span className="text-[10px] text-slate-500 font-rajdhani uppercase block">
                  Hunter Grade
                </span>
                <span className="font-orbitron font-bold text-cyan-300">
                  {user.rank === 'Shadow Master' ? 'Shadow Sovereign' : `${user.rank}-Rank`}
                </span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-black/40 p-2.5">
                <span className="text-[10px] text-slate-500 font-rajdhani uppercase block">
                  Current Level
                </span>
                <span className="font-orbitron font-bold text-cyan-300">
                  LEVEL {user.level}
                </span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-black/40 p-2.5">
                <span className="text-[10px] text-slate-500 font-rajdhani uppercase block">
                  Cumulative EXP
                </span>
                <span className="font-orbitron font-bold text-purple-300">
                  {user.totalXpEarned} EXP
                </span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-black/40 p-2.5">
                <span className="text-[10px] text-slate-500 font-rajdhani uppercase block">
                  Active Streak
                </span>
                <span className="font-orbitron font-bold text-amber-300 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {user.currentStreak} Days
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-rajdhani">
              <span>Awakening: {new Date(user.createdAt).toLocaleDateString()}</span>
              <span>Status: ACTIVE SOVEREIGN</span>
            </div>
          </div>

          {/* Rest Day Protocol Button */}
          <div className="rounded-2xl border border-slate-800 bg-[#0a0d14] p-4 flex items-center justify-between">
            <div>
              <h4 className="font-orbitron text-xs font-bold text-white uppercase">
                Rest &amp; Recovery Protocol
              </h4>
              <p className="text-[11px] text-slate-400 font-rajdhani">
                Declare a rest day to recharge mana and heal muscles without breaking streaks.
              </p>
            </div>
            <button
              onClick={onToggleRestDay}
              className={`px-3 py-2 rounded-xl text-xs font-orbitron font-bold uppercase transition ${
                isTodayRestDay
                  ? 'border border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                  : 'border border-slate-700 bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {isTodayRestDay ? 'REST DAY ACTIVE' : 'DECLARE REST DAY'}
            </button>
          </div>
        </div>
      )}

      {/* 2. ACHIEVEMENTS & SHADOW PROGRESSION */}
      {activeTab === 'achievements' && (
        <div className="space-y-3">
          {achievements.map((ach) => {
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border transition ${
                  ach.unlocked
                    ? 'border-amber-500/40 bg-gradient-to-r from-amber-950/20 to-slate-900/60 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                    : 'border-slate-800 bg-[#07090e] opacity-65'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl border ${
                        ach.unlocked
                          ? 'border-amber-500/50 bg-amber-950/40 text-amber-300'
                          : 'border-slate-800 bg-slate-900 text-slate-600'
                      }`}
                    >
                      {ach.unlocked ? (
                        <Award className="w-5 h-5" />
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4
                          className={`font-orbitron text-xs font-bold ${
                            ach.unlocked ? 'text-white' : 'text-slate-400'
                          }`}
                        >
                          {ach.title}
                        </h4>
                        <span className="text-[10px] text-amber-400 font-orbitron font-bold">
                          +{ach.xpBonus} EXP
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400 font-rajdhani leading-relaxed">
                        {ach.description}
                      </p>
                      {ach.unlocked && ach.unlockedAt && (
                        <span className="mt-1 block text-[10px] text-amber-400/80 font-rajdhani">
                          Unlocked: {new Date(ach.unlockedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`font-orbitron text-[10px] font-bold px-2 py-0.5 rounded ${
                      ach.unlocked
                        ? 'border border-amber-500/30 bg-amber-950/40 text-amber-300'
                        : 'border border-slate-800 bg-slate-900 text-slate-600'
                    }`}
                  >
                    {ach.unlocked ? 'UNLOCKED' : 'LOCKED'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. EXP LEDGER */}
      {activeTab === 'ledger' && (
        <div className="rounded-2xl border border-slate-800 bg-[#0a0d14] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              <h3 className="font-orbitron text-xs font-bold uppercase tracking-wider text-white">
                EXP Ledger &amp; Transactions
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-rajdhani">
              {xpLedger.length} events recorded
            </span>
          </div>

          {xpLedger.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No EXP transactions logged yet. Complete quests or workouts to accumulate EXP.
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar">
              {[...xpLedger].reverse().map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-[#07090e] text-xs"
                >
                  <div>
                    <span className="font-medium text-slate-200 block">{tx.source}</span>
                    <span className="text-[10px] text-slate-500 font-rajdhani">
                      {new Date(tx.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <span className="font-orbitron text-xs font-bold text-cyan-400">
                    +{tx.amount} EXP
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. SETTINGS & DATA EXPORTS */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          {/* Quick Timetable Editor Entry */}
          <div className="rounded-xl border border-slate-800 bg-[#0a0d14] p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-orbitron text-xs font-bold text-white uppercase">
                  Daily Timetable (Office 10AM - 7PM)
                </h4>
                <p className="text-[11px] text-slate-400 font-rajdhani">
                  Customize routine intervals, reminders, and office duty slots.
                </p>
              </div>
              <button
                onClick={onOpenTimetable}
                className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-orbitron font-bold text-white transition active:scale-95"
              >
                EDIT TIMETABLE
              </button>
            </div>
          </div>

          {/* Audio, Ambient Atmosphere & Visual Preferences */}
          <div className="rounded-xl border border-slate-800 bg-[#0a0d14] p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-purple-400" />
                <h4 className="font-orbitron text-xs font-bold text-white uppercase">
                  Sound Effects &amp; Dark Atmosphere
                </h4>
              </div>
              <span className="text-[10px] font-rajdhani text-slate-500 uppercase">Web Audio Synthesizer</span>
            </div>

            {/* Master Sound Effects Toggle */}
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-200 block font-medium">Sound Effects</span>
                <span className="text-[10px] text-slate-400 font-rajdhani">
                  Action audio for quest clear, EXP surge, level-up &amp; clicks
                </span>
              </div>
              <button
                onClick={() => {
                  const next = !settings.soundEnabled;
                  onUpdateSettings({ ...settings, soundEnabled: next });
                  soundFx.setMuted(!next);
                  if (next) soundFx.playClick();
                }}
                className={`p-2 rounded-lg border transition ${
                  settings.soundEnabled
                    ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300 shadow-neon-cyan'
                    : 'border-slate-800 bg-slate-900 text-slate-500'
                }`}
                title="Toggle Master Sound"
              >
                {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            {/* Master FX Volume Slider */}
            {settings.soundEnabled && (
              <div className="rounded-lg bg-slate-900/60 p-2.5 border border-slate-800/80 space-y-1.5">
                <div className="flex justify-between text-[11px] font-rajdhani text-slate-400">
                  <span>Sound Effects Volume</span>
                  <span className="font-orbitron text-[10px] text-cyan-400">
                    {Math.round((settings.soundVolume ?? 0.75) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.soundVolume ?? 0.75}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onUpdateSettings({ ...settings, soundVolume: val });
                    soundFx.setMasterVolume(val);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>
            )}

            {/* Shadow Sanctuary Ambient Atmosphere Toggle */}
            <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
              <div>
                <div className="flex items-center gap-1.5">
                  <Waves className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-slate-200 font-medium">Shadow Sanctuary Ambience</span>
                </div>
                <span className="text-[10px] text-slate-400 font-rajdhani">
                  Low-frequency mana drone, dungeon cavern breeze &amp; crystal resonance
                </span>
              </div>
              <button
                onClick={() => {
                  const next = !settings.ambientSoundEnabled;
                  onUpdateSettings({ ...settings, ambientSoundEnabled: next });
                  if (next && settings.soundEnabled) {
                    soundFx.startAmbient(settings.ambientVolume ?? 0.25);
                  } else {
                    soundFx.stopAmbient();
                  }
                  soundFx.playClick();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-orbitron font-bold border transition ${
                  settings.ambientSoundEnabled && settings.soundEnabled
                    ? 'border-purple-500/50 bg-purple-950/60 text-purple-300 shadow-neon-violet'
                    : 'border-slate-800 bg-slate-900 text-slate-500'
                }`}
              >
                {settings.ambientSoundEnabled ? 'ACTIVE' : 'MUTED'}
              </button>
            </div>

            {/* Ambient Atmosphere Volume Slider */}
            {settings.ambientSoundEnabled && settings.soundEnabled && (
              <div className="rounded-lg bg-slate-900/60 p-2.5 border border-purple-500/30 space-y-1.5">
                <div className="flex justify-between text-[11px] font-rajdhani text-purple-300">
                  <span>Sanctuary Ambience Volume</span>
                  <span className="font-orbitron text-[10px] text-purple-400">
                    {Math.round((settings.ambientVolume ?? 0.25) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.8"
                  step="0.05"
                  value={settings.ambientVolume ?? 0.25}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onUpdateSettings({ ...settings, ambientVolume: val });
                    soundFx.setAmbientVolume(val);
                  }}
                  className="w-full accent-purple-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>
            )}

            {/* Interactive Sound Effects Preview Bench */}
            <div className="pt-3 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 mb-2 text-slate-300 text-xs font-orbitron font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Test Hunter Audio FX</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => soundFx.playClick()}
                  className="py-1.5 px-2.5 rounded-lg border border-slate-800 bg-slate-900 hover:border-cyan-500/40 text-slate-300 text-[10px] font-orbitron font-semibold text-left transition active:scale-95"
                >
                  ▶ UI Tap Blip
                </button>
                <button
                  type="button"
                  onClick={() => soundFx.playXpGain()}
                  className="py-1.5 px-2.5 rounded-lg border border-slate-800 bg-slate-900 hover:border-cyan-500/40 text-cyan-300 text-[10px] font-orbitron font-semibold text-left transition active:scale-95"
                >
                  ▶ EXP Mana Surge
                </button>
                <button
                  type="button"
                  onClick={() => soundFx.playQuestComplete()}
                  className="py-1.5 px-2.5 rounded-lg border border-slate-800 bg-slate-900 hover:border-cyan-500/40 text-sky-300 text-[10px] font-orbitron font-semibold text-left transition active:scale-95"
                >
                  ▶ Quest Complete
                </button>
                <button
                  type="button"
                  onClick={() => soundFx.playLevelUp()}
                  className="py-1.5 px-2.5 rounded-lg border border-purple-500/30 bg-purple-950/30 hover:border-purple-400 text-purple-300 text-[10px] font-orbitron font-semibold text-left transition active:scale-95"
                >
                  ▶ Level Up Fanfare
                </button>
                <button
                  type="button"
                  onClick={() => soundFx.playPushUpRecord()}
                  className="py-1.5 px-2.5 rounded-lg border border-amber-500/30 bg-amber-950/30 hover:border-amber-400 text-amber-300 text-[10px] font-orbitron font-semibold text-left transition active:scale-95"
                >
                  ▶ Blade Strike Impact
                </button>
                <button
                  type="button"
                  onClick={() => soundFx.playTimerBell()}
                  className="py-1.5 px-2.5 rounded-lg border border-slate-800 bg-slate-900 hover:border-cyan-500/40 text-slate-300 text-[10px] font-orbitron font-semibold text-left transition active:scale-95"
                >
                  ▶ Sanctum Bell
                </button>
              </div>
            </div>

            {/* Haptics */}
            <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
              <div>
                <span className="text-slate-200 block font-medium">Haptic Vibration</span>
                <span className="text-[10px] text-slate-400 font-rajdhani">
                  Tactile phone vibration on quest clear &amp; timer bells
                </span>
              </div>
              <button
                onClick={() => {
                  const next = !settings.hapticsEnabled;
                  onUpdateSettings({ ...settings, hapticsEnabled: next });
                  triggerHaptic('medium', next);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-orbitron font-bold border transition ${
                  settings.hapticsEnabled
                    ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300'
                    : 'border-slate-800 bg-slate-900 text-slate-500'
                }`}
              >
                {settings.hapticsEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
              <div>
                <span className="text-slate-200 block font-medium">Reduced Motion Option</span>
                <span className="text-[10px] text-slate-400 font-rajdhani">
                  Minimizes transitions, confetti &amp; pulsing glows
                </span>
              </div>
              <button
                onClick={() =>
                  onUpdateSettings({ ...settings, reducedMotion: !settings.reducedMotion })
                }
                className={`px-3 py-1 rounded-lg text-xs font-orbitron font-bold border transition ${
                  settings.reducedMotion
                    ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300'
                    : 'border-slate-800 bg-slate-900 text-slate-500'
                }`}
              >
                {settings.reducedMotion ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>

          {/* Android PWA & Native APK Center */}
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <h4 className="font-orbitron text-xs font-bold text-cyan-300 uppercase">
                  Android Installation &amp; APK
                </h4>
              </div>
              <span className="text-[10px] font-orbitron font-semibold text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30 bg-cyan-950/60">
                Capacitor Ready
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-rajdhani">
              {isInstalled
                ? '✅ STEADY is currently running in Standalone PWA mode on your device.'
                : 'Install STEADY onto your Android home screen via Chrome, or download the compiled native Android APK.'}
            </p>

            {!isInstalled && isInstallable && (
              <button
                onClick={() => install()}
                className="w-full py-2.5 rounded-xl bg-cyan-400 text-black text-xs font-orbitron font-bold uppercase tracking-wider hover:bg-cyan-300 transition"
              >
                INSTALL PWA APP NOW
              </button>
            )}

            {/* Standalone APK GitHub Actions Info */}
            <div className="pt-2 border-t border-slate-800/80 text-xs space-y-1.5 font-rajdhani">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Application ID:</span>
                <span className="font-mono text-[11px] text-cyan-300">com.steady.shadowlevel</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Application Name:</span>
                <span className="text-[11px] text-slate-200">STEADY Shadow Level System</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Automated APK Builder:</span>
                <span className="font-mono text-[11px] text-purple-300">.github/workflows/build-apk.yml</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Push to GitHub → go to <strong>Actions</strong> tab on mobile → run <strong>Build Android Debug APK</strong> → download <code>app-debug.apk</code>.
              </p>
            </div>
          </div>

          {/* Data Export Center */}
          <div className="rounded-xl border border-slate-800 bg-[#0a0d14] p-4 space-y-2.5">
            <h4 className="font-orbitron text-xs font-bold text-white uppercase mb-1">
              Data Storage &amp; Privacy (Offline First)
            </h4>
            <p className="text-[11px] text-slate-400 font-rajdhani">
              All progress is saved persistently in your local device storage. No remote accounts required.
            </p>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={handleDownloadJSON}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-slate-800 bg-slate-900 hover:border-cyan-500/40 text-slate-300 transition"
              >
                <FileText className="w-4 h-4 text-cyan-400 mb-1" />
                <span className="text-[10px] font-orbitron font-bold">ALL (JSON)</span>
              </button>
              <button
                onClick={handleDownloadPushUpsCSV}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-slate-800 bg-slate-900 hover:border-amber-500/40 text-slate-300 transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-400 mb-1" />
                <span className="text-[10px] font-orbitron font-bold">PUSH-UPS</span>
              </button>
              <button
                onClick={handleDownloadQuestsCSV}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-slate-800 bg-slate-900 hover:border-purple-500/40 text-slate-300 transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-purple-400 mb-1" />
                <span className="text-[10px] font-orbitron font-bold">QUESTS</span>
              </button>
            </div>
          </div>

          {/* Nuclear Reset Option with double safety */}
          <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4">
            <h4 className="font-orbitron text-xs font-bold text-red-400 uppercase mb-1">
              Danger Zone
            </h4>
            <p className="text-[11px] text-slate-400 font-rajdhani mb-3">
              Clear all user progress, quests, push-up logs, and reset hunter level to 1.
            </p>

            {showResetConfirm ? (
              <div className="space-y-2 p-3 rounded-lg border border-red-500 bg-red-950/60">
                <p className="text-xs text-red-200 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  Are you completely sure? This action cannot be reversed.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onResetData();
                      setShowResetConfirm(false);
                      soundFx.playClick();
                    }}
                    className="flex-1 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-orbitron text-xs font-bold"
                  >
                    YES, WIPE ALL DATA
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs font-orbitron"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2 rounded-xl border border-red-500/40 bg-red-950/40 text-red-400 text-xs font-orbitron font-bold hover:bg-red-900/50 transition flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>RESET ALL PROGRESS</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
