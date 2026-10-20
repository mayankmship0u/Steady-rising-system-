import React, { useState, useEffect } from 'react';
import {
  PushUpRecord,
  PushUpWorkoutSession,
  UserProfile,
  AppSettings,
} from '../../types';
import { soundFx, triggerHaptic } from '../../utils/audio';
import {
  Flame,
  Trophy,
  History,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
  Info,
  ShieldCheck,
  BarChart3,
  ListPlus,
} from 'lucide-react';

interface PushUpsScreenProps {
  user: UserProfile;
  pushUpRecords: PushUpRecord[];
  pushUpSessions: PushUpWorkoutSession[];
  settings: AppSettings;
  onSaveRecord: (count: number, notes?: string) => void;
  onDeleteRecord: (id: string) => void;
  onEditRecord: (id: string, newCount: number, notes?: string) => void;
  onSaveWorkoutSession: (sets: number[], notes?: string) => void;
  onDeleteSession: (id: string) => void;
}

export const PushUpsScreen: React.FC<PushUpsScreenProps> = ({
  user,
  pushUpRecords,
  pushUpSessions,
  settings,
  onSaveRecord,
  onDeleteRecord,
  onEditRecord,
  onSaveWorkoutSession,
  onDeleteSession,
}) => {
  // Mode: 'one-go' | 'sets' | 'history'
  const [activeSubTab, setActiveSubTab] = useState<'one-go' | 'sets' | 'history'>('one-go');

  // One-Go Input State
  const [consecutiveCount, setConsecutiveCount] = useState<number>(20);
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Sets & Workout State
  const [currentWorkoutSets, setCurrentWorkoutSets] = useState<number[]>([15]);
  const [newSetInput, setNewSetInput] = useState<number>(15);
  const [workoutNotes, setWorkoutNotes] = useState<string>('');

  // Rest Timer State
  const [restSeconds, setRestSeconds] = useState<number>(60);
  const [timerRemaining, setTimerRemaining] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Edit record state
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editCountVal, setEditCountVal] = useState<number>(0);
  const [editNotesVal, setEditNotesVal] = useState<string>('');

  // Records calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = pushUpRecords.filter((r) => r.date === todayStr);
  const todayBest =
    todayRecords.length > 0 ? Math.max(...todayRecords.map((r) => r.count)) : 0;
  const allTimeBest =
    pushUpRecords.length > 0 ? Math.max(...pushUpRecords.map((r) => r.count)) : 0;

  // Daily XP cap warning
  const todayAwardedXp =
    user.dailyPushUpXpAwardedToday?.date === todayStr
      ? user.dailyPushUpXpAwardedToday.amount
      : 0;
  const xpLimitRemaining = Math.max(0, settings.pushUpDailyXpLimit - todayAwardedXp);

  // Rest Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            soundFx.playTimerBell();
            triggerHaptic('success', settings.hapticsEnabled);
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerRemaining, settings.hapticsEnabled]);

  const handleStartTimer = (duration: number) => {
    setRestSeconds(duration);
    setTimerRemaining(duration);
    setIsTimerRunning(true);
    soundFx.playClick();
  };

  const handleSaveOneGo = () => {
    if (consecutiveCount <= 0 || isNaN(consecutiveCount)) {
      setFeedbackMsg('Enter a valid push-up count greater than 0.');
      return;
    }

    onSaveRecord(consecutiveCount, sessionNotes.trim() || undefined);
    setSessionNotes('');

    if (consecutiveCount > allTimeBest) {
      soundFx.playPushUpRecord();
      triggerHaptic('heavy', settings.hapticsEnabled);
      setFeedbackMsg(`🔥 NEW ALL-TIME RECORD: ${consecutiveCount} REPS! Rank awakened!`);
    } else {
      soundFx.playQuestComplete();
      triggerHaptic('medium', settings.hapticsEnabled);
      setFeedbackMsg(`Recorded ${consecutiveCount} consecutive push-ups!`);
    }

    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleAddSetToWorkout = () => {
    if (newSetInput <= 0) return;
    setCurrentWorkoutSets([...currentWorkoutSets, newSetInput]);
    soundFx.playClick();
    triggerHaptic('light', settings.hapticsEnabled);
  };

  const handleRemoveSet = (idx: number) => {
    setCurrentWorkoutSets(currentWorkoutSets.filter((_, i) => i !== idx));
    soundFx.playClick();
  };

  const handleSaveFullWorkout = () => {
    if (currentWorkoutSets.length === 0) return;
    onSaveWorkoutSession(currentWorkoutSets, workoutNotes.trim() || undefined);
    setCurrentWorkoutSets([15]);
    setWorkoutNotes('');
    soundFx.playQuestComplete();
    triggerHaptic('success', settings.hapticsEnabled);
    setFeedbackMsg(`Workout session saved! Total volume: ${currentWorkoutSets.reduce((a, b) => a + b, 0)} reps.`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Milestone Clubs
  const clubs = [
    { target: 10, name: '10 Reps Scout', unlocked: allTimeBest >= 10 },
    { target: 25, name: '25 Reps Vanguard', unlocked: allTimeBest >= 25 },
    { target: 50, name: '50 Reps Iron Guard', unlocked: allTimeBest >= 50 },
    { target: 75, name: '75 Reps Shadow Striker', unlocked: allTimeBest >= 75 },
    { target: 100, name: '100 Reps Century Monarch', unlocked: allTimeBest >= 100 },
  ];

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-b from-[#19130d] to-[#0c0e14] p-5 shadow-neon-amber hunter-grid-bg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
              <h2 className="font-orbitron text-lg font-black tracking-wider text-amber-300">
                ONE-GO PUSH-UPS
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-400 font-rajdhani">
              Dedicated Maximum Consecutive Repetitions Test
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-rajdhani uppercase">All-Time Peak</span>
            <span className="font-orbitron text-2xl font-black text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
              {allTimeBest}
            </span>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg border border-slate-800 bg-[#080a10]/80 p-2">
            <span className="text-[10px] text-slate-400 block font-rajdhani uppercase">Today&apos;s Best</span>
            <span className="font-orbitron font-bold text-amber-300 text-sm">
              {todayBest > 0 ? `${todayBest} reps` : 'No log yet'}
            </span>
          </div>
          <div className="rounded-lg border border-slate-800 bg-[#080a10]/80 p-2">
            <span className="text-[10px] text-slate-400 block font-rajdhani uppercase">Attempts Today</span>
            <span className="font-orbitron font-bold text-cyan-300 text-sm">
              {todayRecords.length}
            </span>
          </div>
          <div className="rounded-lg border border-slate-800 bg-[#080a10]/80 p-2">
            <span className="text-[10px] text-slate-400 block font-rajdhani uppercase">Daily EXP Available</span>
            <span className="font-orbitron font-bold text-emerald-300 text-sm">
              {xpLimitRemaining} / {settings.pushUpDailyXpLimit}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs: One-Go vs Sets vs History */}
      <div className="flex rounded-xl border border-slate-800 bg-slate-900/60 p-1">
        <button
          onClick={() => {
            setActiveSubTab('one-go');
            soundFx.playClick();
          }}
          className={`flex-1 py-2 text-center text-xs font-orbitron font-bold rounded-lg transition-all ${
            activeSubTab === 'one-go'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          ONE-GO MAX
        </button>
        <button
          onClick={() => {
            setActiveSubTab('sets');
            soundFx.playClick();
          }}
          className={`flex-1 py-2 text-center text-xs font-orbitron font-bold rounded-lg transition-all ${
            activeSubTab === 'sets'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          SETS & WORKOUT
        </button>
        <button
          onClick={() => {
            setActiveSubTab('history');
            soundFx.playClick();
          }}
          className={`flex-1 py-2 text-center text-xs font-orbitron font-bold rounded-lg transition-all ${
            activeSubTab === 'history'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          HISTORY & CHARTS
        </button>
      </div>

      {/* Feedback Alert Toast */}
      {feedbackMsg && (
        <div className="p-3 rounded-xl border border-amber-500/50 bg-amber-950/80 text-amber-200 text-xs font-medium flex items-center justify-between shadow-neon-amber animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)}>
            <X className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      )}

      {/* 1. ONE-GO CONSECUTIVE ATTEMPT PANEL */}
      {activeSubTab === 'one-go' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-[#0a0d14] p-5">
            <div className="text-center mb-4">
              <span className="text-xs font-rajdhani font-semibold uppercase tracking-wider text-slate-400">
                Single Attempt Consecutive Repetitions
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Full range of motion, chest touches floor, lock out at top. No knee resting.
              </p>
            </div>

            {/* Large Interactive Number Control */}
            <div className="flex items-center justify-center gap-4 my-6">
              <button
                onClick={() => {
                  setConsecutiveCount(Math.max(1, consecutiveCount - 1));
                  triggerHaptic('light', settings.hapticsEnabled);
                }}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-200 active:scale-90 transition"
                aria-label="Decrease reps"
              >
                <Minus className="w-6 h-6" />
              </button>

              <div className="relative text-center">
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={consecutiveCount}
                  onChange={(e) => setConsecutiveCount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-28 text-center font-orbitron text-5xl font-black text-amber-400 bg-transparent border-b-2 border-amber-500/50 focus:border-amber-400 focus:outline-none drop-shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                />
                <span className="block text-[10px] font-orbitron font-bold text-slate-500 mt-1 uppercase">
                  REPS IN ONE GO
                </span>
              </div>

              <button
                onClick={() => {
                  setConsecutiveCount(consecutiveCount + 1);
                  triggerHaptic('light', settings.hapticsEnabled);
                }}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-200 active:scale-90 transition"
                aria-label="Increase reps"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Increment Buttons */}
            <div className="flex justify-center gap-2 mb-5">
              {[-10, -5, +5, +10].map((delta) => (
                <button
                  key={delta}
                  onClick={() => {
                    setConsecutiveCount(Math.max(1, consecutiveCount + delta));
                    triggerHaptic('light', settings.hapticsEnabled);
                  }}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-orbitron font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition"
                >
                  {delta > 0 ? `+${delta}` : delta}
                </button>
              ))}
            </div>

            {/* Optional Notes */}
            <div className="mb-4">
              <label className="block text-[11px] font-rajdhani uppercase text-slate-400 mb-1">
                Attempt Notes (Optional: Form, tempo, surface, difficulty)
              </label>
              <input
                type="text"
                placeholder="e.g. Diamond grip, military form, smooth cadence..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-[#07090e] px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-amber-500/60 focus:outline-none"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveOneGo}
              className="w-full py-3.5 rounded-xl font-orbitron text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-neon-amber transition-all duration-200 active:scale-[0.98]"
            >
              SAVE ONE-GO RECORD
            </button>
          </div>

          {/* Milestone Badges Strip */}
          <div className="rounded-xl border border-slate-800 bg-[#0a0d14] p-4">
            <h3 className="font-orbitron text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Consecutive Rep Milestones</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {clubs.map((c) => (
                <div
                  key={c.target}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                    c.unlocked
                      ? 'border-amber-500/40 bg-amber-950/20 text-amber-300'
                      : 'border-slate-800/80 bg-slate-900/30 text-slate-500 opacity-60'
                  }`}
                >
                  <div>
                    <span className="font-orbitron font-bold block">{c.target} Reps Club</span>
                    <span className="text-[10px] font-rajdhani">{c.name}</span>
                  </div>
                  {c.unlocked ? (
                    <Trophy className="w-4 h-4 text-amber-400" />
                  ) : (
                    <span className="text-[10px] font-orbitron text-slate-600">LOCKED</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form & Health Safety Notice */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-3.5 text-xs text-slate-400 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong className="text-slate-300">Sovereign Recovery Rule:</strong> Never force a max attempt every single day. If you feel elbow strain, shoulder impingement, or dizziness, declare a Rest Day in the settings. Rest days preserve your streak!
            </div>
          </div>
        </div>
      )}

      {/* 2. SETS & WORKOUT BUILDER */}
      {activeSubTab === 'sets' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-cyan-500/30 bg-[#0a0d14] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-orbitron text-xs font-bold uppercase tracking-wider text-cyan-300">
                  Multi-Set Workout Session
                </h3>
                <p className="text-[11px] text-slate-400 font-rajdhani">
                  Track total volume across multiple sets (separate from One-Go max).
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-rajdhani uppercase">Total Reps</span>
                <span className="font-orbitron text-xl font-bold text-cyan-400">
                  {currentWorkoutSets.reduce((a, b) => a + b, 0)}
                </span>
              </div>
            </div>

            {/* Current Sets List */}
            <div className="space-y-2 mb-4">
              {currentWorkoutSets.map((reps, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-[#07090e] text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-orbitron text-[11px] font-bold text-cyan-400">
                      SET {idx + 1}
                    </span>
                    <span className="text-slate-400 font-rajdhani">· {reps} reps</span>
                  </div>
                  <button
                    onClick={() => handleRemoveSet(idx)}
                    className="p-1 text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Set Input */}
            <div className="flex items-center gap-2 mb-4">
              <input
                type="number"
                min="1"
                value={newSetInput}
                onChange={(e) => setNewSetInput(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-center text-xs font-orbitron font-bold text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleAddSetToWorkout}
                className="flex-1 py-2 rounded-lg border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 font-orbitron text-xs font-bold hover:bg-cyan-900/50 transition flex items-center justify-center gap-1.5"
              >
                <ListPlus className="w-4 h-4" />
                <span>ADD SET {currentWorkoutSets.length + 1}</span>
              </button>
            </div>

            {/* Workout Notes */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Optional workout notes (e.g., standard push-ups, incline finish)..."
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-[#07090e] px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Save Complete Workout */}
            <button
              onClick={handleSaveFullWorkout}
              disabled={currentWorkoutSets.length === 0}
              className="w-full py-3 rounded-xl font-orbitron text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-indigo-600 text-black shadow-neon-cyan disabled:opacity-50 transition active:scale-[0.98]"
            >
              SAVE WORKOUT SESSION ({currentWorkoutSets.reduce((a, b) => a + b, 0)} TOTAL REPS)
            </button>
          </div>

          {/* Integrated Rest Timer Between Sets */}
          <div className="rounded-2xl border border-slate-800 bg-[#0a0d14] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-cyan-400" />
                <h3 className="font-orbitron text-xs font-bold uppercase tracking-wider text-white">
                  Rest Timer Between Sets
                </h3>
              </div>
              <span className="font-orbitron text-base font-bold text-cyan-300">
                {Math.floor(timerRemaining / 60)}:
                {String(timerRemaining % 60).padStart(2, '0')}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              {[30, 60, 90, 120].map((sec) => (
                <button
                  key={sec}
                  onClick={() => handleStartTimer(sec)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-orbitron transition ${
                    restSeconds === sec && isTimerRunning
                      ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 font-bold'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-orbitron font-bold text-white flex items-center justify-center gap-1.5 transition"
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isTimerRunning ? 'PAUSE REST' : 'START REST'}</span>
              </button>
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerRemaining(restSeconds);
                  soundFx.playClick();
                }}
                className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. HISTORY & CHARTS */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          {/* Progress Visualizer Chart */}
          <div className="rounded-2xl border border-slate-800 bg-[#0a0d14] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <h3 className="font-orbitron text-xs font-bold uppercase tracking-wider text-white">
                  One-Go Records Progression
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-rajdhani">
                Last {Math.min(10, pushUpRecords.length)} attempts
              </span>
            </div>

            {pushUpRecords.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 font-rajdhani">
                No records logged yet. Complete a One-Go push-up test to chart progress!
              </div>
            ) : (
              <div className="pt-2">
                {/* SVG Bar Chart for One-Go records */}
                <div className="h-32 w-full flex items-end gap-1.5 pt-4">
                  {pushUpRecords.slice(-10).map((rec, i) => {
                    const maxCount = Math.max(...pushUpRecords.map((r) => r.count), 1);
                    const heightPercent = Math.max(12, Math.round((rec.count / maxCount) * 100));
                    const isPeak = rec.count === allTimeBest;

                    return (
                      <div key={rec.id} className="flex-1 flex flex-col items-center h-full justify-end group">
                        <span className="text-[9px] font-orbitron font-semibold text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition">
                          {rec.count}
                        </span>
                        <div
                          className={`w-full rounded-t-md transition-all duration-300 ${
                            isPeak
                              ? 'bg-gradient-to-t from-amber-600 to-amber-300 shadow-[0_0_8px_#f59e0b]'
                              : 'bg-gradient-to-t from-cyan-900 to-cyan-500'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[8px] text-slate-500 font-rajdhani mt-1 truncate max-w-full">
                          {rec.date.split('-').slice(1).join('/')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Chronological List of Entries with Edit & Delete */}
          <div className="rounded-2xl border border-slate-800 bg-[#0a0d14] p-4">
            <h3 className="font-orbitron text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <span>One-Go Push-Up History</span>
            </h3>

            {pushUpRecords.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-500">
                No push-up records logged.
              </div>
            ) : (
              <div className="space-y-2">
                {[...pushUpRecords].reverse().map((record) => {
                  const isEditing = editingRecordId === record.id;
                  const isPeak = record.count === allTimeBest;

                  return (
                    <div
                      key={record.id}
                      className={`p-3 rounded-xl border text-xs transition ${
                        isPeak
                          ? 'border-amber-500/40 bg-amber-950/20'
                          : 'border-slate-800 bg-[#07090e]'
                      }`}
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              value={editCountVal}
                              onChange={(e) => setEditCountVal(parseInt(e.target.value) || 0)}
                              className="w-20 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-center font-orbitron font-bold text-white text-xs"
                            />
                            <span className="text-slate-400 font-rajdhani">reps</span>
                          </div>
                          <input
                            type="text"
                            value={editNotesVal}
                            onChange={(e) => setEditNotesVal(e.target.value)}
                            placeholder="Notes..."
                            className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                onEditRecord(record.id, editCountVal, editNotesVal);
                                setEditingRecordId(null);
                                soundFx.playClick();
                              }}
                              className="px-3 py-1 rounded bg-cyan-600 text-white font-orbitron text-[10px] font-bold flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Save
                            </button>
                            <button
                              onClick={() => setEditingRecordId(null)}
                              className="px-3 py-1 rounded bg-slate-800 text-slate-300 font-orbitron text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-orbitron text-base font-bold text-amber-400">
                                {record.count} REPS
                              </span>
                              {isPeak && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded border border-amber-500/40 bg-amber-900/40 text-amber-300 font-orbitron font-bold">
                                  PEAK
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-rajdhani block">
                              {record.date} at{' '}
                              {new Date(record.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {record.notes && (
                              <p className="mt-1 text-[11px] text-slate-300 italic">
                                &ldquo;{record.notes}&rdquo;
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingRecordId(record.id);
                                setEditCountVal(record.count);
                                setEditNotesVal(record.notes || '');
                              }}
                              className="p-1 text-slate-500 hover:text-cyan-400 transition"
                              title="Edit Record"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Delete this push-up record?')) {
                                  onDeleteRecord(record.id);
                                  soundFx.playClick();
                                }
                              }}
                              className="p-1 text-slate-500 hover:text-red-400 transition"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
