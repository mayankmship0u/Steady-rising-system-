import React, { useState, useEffect } from 'react';
import { StudySession, AppSettings } from '../../types';
import { soundFx, triggerHaptic } from '../../utils/audio';
import {
  BookOpen,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  Book,
  Code,
  Languages,
  Briefcase,
  History,
  Trash2,
} from 'lucide-react';

interface StudyScreenProps {
  studySessions: StudySession[];
  settings: AppSettings;
  onSaveStudySession: (session: Omit<StudySession, 'id' | 'timestamp'>) => void;
  onDeleteSession: (id: string) => void;
}

export const StudyScreen: React.FC<StudyScreenProps> = ({
  studySessions,
  settings,
  onSaveStudySession,
  onDeleteSession,
}) => {
  // Mode: 'focus' | 'reading' | 'history'
  const [activeTab, setActiveTab] = useState<'focus' | 'reading' | 'history'>('focus');

  // Focus Timer States
  const [selectedDuration, setSelectedDuration] = useState<number>(25); // in minutes
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [subject, setSubject] = useState<string>('Software Engineering');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [studyNotes, setStudyNotes] = useState<string>('');
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [completionBanner, setCompletionBanner] = useState<string | null>(null);

  // Reading Session States
  const [bookTitle, setBookTitle] = useState<string>('');
  const [pagesRead, setPagesRead] = useState<number>(15);
  const [readingMinutes, setReadingMinutes] = useState<number>(30);
  const [readingNotes, setReadingNotes] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsRemaining]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    soundFx.playTimerBell();
    triggerHaptic('success', settings.hapticsEnabled);

    if (!isBreak) {
      const activeSubject = customSubject.trim() || subject;
      const xpEarned = Math.round(selectedDuration * 1.5); // ~37 XP for 25 min

      onSaveStudySession({
        date: todayStr,
        subject: activeSubject,
        durationMinutes: selectedDuration,
        notes: studyNotes.trim() || undefined,
        xpEarned,
        type: 'focus',
      });

      setCompletionBanner(`Focus block completed! Earned +${xpEarned} EXP.`);
      setIsBreak(true);
      setSecondsRemaining(5 * 60); // 5 min break
    } else {
      setCompletionBanner('Break completed! Ready for the next focus surge.');
      setIsBreak(false);
      setSecondsRemaining(selectedDuration * 60);
    }
  };

  const handleSelectPreset = (minutes: number) => {
    setIsRunning(false);
    setSelectedDuration(minutes);
    setSecondsRemaining(minutes * 60);
    setIsBreak(false);
    soundFx.playClick();
  };

  const handleSaveManualReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim() || readingMinutes <= 0) return;

    const xpEarned = Math.round(readingMinutes * 1.2);

    onSaveStudySession({
      date: todayStr,
      subject: `Reading: ${bookTitle.trim()}`,
      durationMinutes: readingMinutes,
      notes: `${pagesRead} pages read. ${readingNotes.trim()}`,
      xpEarned,
      type: 'reading',
    });

    soundFx.playQuestComplete();
    triggerHaptic('success', settings.hapticsEnabled);
    setCompletionBanner(`Reading logged: "${bookTitle}" (+${xpEarned} EXP).`);
    setBookTitle('');
    setReadingNotes('');
  };

  // Metrics
  const todayMinutes = studySessions
    .filter((s) => s.date === todayStr)
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  // Weekly minutes (last 7 days)
  const weeklyMinutes = studySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  const presetSubjects = [
    { label: 'Coding / Architecture', icon: Code },
    { label: 'Books / Reading', icon: Book },
    { label: 'Languages', icon: Languages },
    { label: 'Professional Skills', icon: Briefcase },
  ];

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/40 bg-gradient-to-b from-[#180f24] to-[#0a0a14] p-5 shadow-neon-violet hunter-grid-bg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <h2 className="font-orbitron text-lg font-black tracking-wider text-purple-300">
                STUDY &amp; MANA FORGE
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-400 font-rajdhani">
              Pomodoro Focus Timer &amp; Skill Development Tracker
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-rajdhani uppercase">Today&apos;s Focus</span>
            <span className="font-orbitron text-2xl font-black text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
              {todayMinutes}m
            </span>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
          <div className="rounded-lg border border-slate-800 bg-[#080812]/80 p-2">
            <span className="text-[10px] text-slate-400 block font-rajdhani uppercase">Weekly Volume</span>
            <span className="font-orbitron font-bold text-cyan-300 text-sm">
              {weeklyMinutes} mins
            </span>
          </div>
          <div className="rounded-lg border border-slate-800 bg-[#080812]/80 p-2">
            <span className="text-[10px] text-slate-400 block font-rajdhani uppercase">Sessions Logged</span>
            <span className="font-orbitron font-bold text-purple-300 text-sm">
              {studySessions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex rounded-xl border border-slate-800 bg-slate-900/60 p-1">
        <button
          onClick={() => setActiveTab('focus')}
          className={`flex-1 py-2 text-center text-xs font-orbitron font-bold rounded-lg transition-all ${
            activeTab === 'focus'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          FOCUS TIMER
        </button>
        <button
          onClick={() => setActiveTab('reading')}
          className={`flex-1 py-2 text-center text-xs font-orbitron font-bold rounded-lg transition-all ${
            activeTab === 'reading'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          READING LOG
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 text-center text-xs font-orbitron font-bold rounded-lg transition-all ${
            activeTab === 'history'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          HISTORY
        </button>
      </div>

      {/* Completion Toast */}
      {completionBanner && (
        <div className="p-3 rounded-xl border border-purple-500/50 bg-purple-950/80 text-purple-200 text-xs font-medium flex items-center justify-between shadow-neon-violet">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>{completionBanner}</span>
          </div>
          <button onClick={() => setCompletionBanner(null)} className="text-purple-400 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* 1. FOCUS TIMER TAB */}
      {activeTab === 'focus' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-[#0a0d14] p-5 text-center">
            {/* Break vs Focus indicator */}
            <span
              className={`inline-block px-3 py-1 rounded-full text-[10px] font-orbitron font-bold uppercase tracking-wider mb-4 ${
                isBreak
                  ? 'border border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                  : 'border border-purple-500/40 bg-purple-950/40 text-purple-300'
              }`}
            >
              {isBreak ? 'REST / RECOVERY INTERVAL' : 'INTENSE STUDY SURGE'}
            </span>

            {/* Giant Circular Countdown */}
            <div className="relative mx-auto my-4 flex h-48 w-48 items-center justify-center rounded-full border-4 border-purple-500/30 bg-[#080812] shadow-neon-violet">
              <div className="text-center">
                <span className="font-orbitron text-4xl font-black text-white tracking-wider drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                  {Math.floor(secondsRemaining / 60)}:
                  {String(secondsRemaining % 60).padStart(2, '0')}
                </span>
                <span className="block mt-1 text-[11px] font-rajdhani text-purple-400 uppercase font-semibold">
                  {customSubject.trim() || subject}
                </span>
              </div>
            </div>

            {/* Duration Presets */}
            <div className="flex justify-center gap-2 my-4">
              {[15, 25, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleSelectPreset(mins)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-orbitron font-bold transition ${
                    selectedDuration === mins && !isBreak
                      ? 'border-purple-400 bg-purple-950/60 text-purple-300'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setIsRunning(!isRunning);
                  soundFx.playClick();
                  triggerHaptic('light', settings.hapticsEnabled);
                }}
                className={`flex-1 max-w-[180px] py-3 rounded-xl font-orbitron text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95 ${
                  isRunning
                    ? 'bg-amber-500 text-black shadow-neon-amber'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-neon-violet'
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isRunning ? 'PAUSE FOCUS' : 'START FOCUS'}</span>
              </button>

              <button
                onClick={() => {
                  setIsRunning(false);
                  setSecondsRemaining(selectedDuration * 60);
                  setIsBreak(false);
                  soundFx.playClick();
                }}
                className="p-3 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition active:scale-95"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subject Selector */}
          <div className="rounded-xl border border-slate-800 bg-[#0a0d14] p-4">
            <h3 className="font-orbitron text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Focus Domain
            </h3>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {presetSubjects.map((s) => {
                const Icon = s.icon;
                const isSelected = subject === s.label;
                return (
                  <button
                    key={s.label}
                    onClick={() => {
                      setSubject(s.label);
                      setCustomSubject('');
                      soundFx.playClick();
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs transition ${
                      isSelected
                        ? 'border-purple-500/50 bg-purple-950/30 text-purple-200'
                        : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-purple-400" />
                    <span className="truncate font-medium">{s.label}</span>
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              placeholder="Or enter custom topic / book title..."
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-[#07090e] px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-400"
            />
          </div>
        </div>
      )}

      {/* 2. READING LOG TAB */}
      {activeTab === 'reading' && (
        <form onSubmit={handleSaveManualReading} className="rounded-2xl border border-cyan-500/30 bg-[#0a0d14] p-5 space-y-3.5">
          <div>
            <h3 className="font-orbitron text-xs font-bold uppercase tracking-wider text-cyan-300 mb-1">
              Log Reading Session
            </h3>
            <p className="text-[11px] text-slate-400 font-rajdhani">
              Record reading books, documentation, or technical papers.
            </p>
          </div>

          <div>
            <label className="block text-slate-400 font-rajdhani uppercase text-xs mb-1">
              Book / Article Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Atomic Habits, Clean Code, Deep Work..."
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-[#07090e] px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 font-rajdhani uppercase text-xs mb-1">
                Pages Read
              </label>
              <input
                type="number"
                min="1"
                value={pagesRead}
                onChange={(e) => setPagesRead(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-800 bg-[#07090e] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-rajdhani uppercase text-xs mb-1">
                Minutes Spent
              </label>
              <input
                type="number"
                min="1"
                value={readingMinutes}
                onChange={(e) => setReadingMinutes(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-800 bg-[#07090e] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-rajdhani uppercase text-xs mb-1">
              Key Takeaway or Note
            </label>
            <textarea
              rows={2}
              placeholder="What wisdom did you extract?"
              value={readingNotes}
              onChange={(e) => setReadingNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-[#07090e] px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-orbitron text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-indigo-600 text-black shadow-neon-cyan hover:opacity-90 transition active:scale-[0.98]"
          >
            LOG READING (+{Math.round(readingMinutes * 1.2)} EXP)
          </button>
        </form>
      )}

      {/* 3. HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="rounded-2xl border border-slate-800 bg-[#0a0d14] p-4">
          <h3 className="font-orbitron text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <History className="w-4 h-4 text-purple-400" />
            <span>Study &amp; Reading Sessions</span>
          </h3>

          {studySessions.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              No study sessions logged yet. Complete a focus block to earn EXP.
            </div>
          ) : (
            <div className="space-y-2">
              {[...studySessions].reverse().map((session) => (
                <div
                  key={session.id}
                  className="p-3 rounded-xl border border-slate-800 bg-[#07090e] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{session.subject}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded border border-purple-500/40 bg-purple-900/40 text-purple-300 font-orbitron">
                        {session.durationMinutes}m
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-rajdhani block">
                      {session.date}
                    </span>
                    {session.notes && (
                      <p className="mt-1 text-[11px] text-slate-400 italic">
                        {session.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-orbitron font-bold text-purple-400 text-xs">
                      +{session.xpEarned} XP
                    </span>
                    <button
                      onClick={() => onDeleteSession(session.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
