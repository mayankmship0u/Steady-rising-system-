import React, { useState, useEffect } from 'react';
import {
  TestRecord,
  DailyTestSlot,
  UserProfile,
  AppSettings,
  TestCategory,
} from '../../types';
import { getTestXpReward } from '../../utils/progression';
import { soundFx, triggerHaptic } from '../../utils/audio';
import { LogTestModal } from './LogTestModal';
import {
  GraduationCap,
  Trophy,
  Target,
  Clock,
  Calendar,
  PlusCircle,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  BookOpen,
  Edit2,
  Trash2,
  Check,
  X,
  FileText,
  Flame,
  Award,
  Filter,
  Brain,
  HelpCircle,
} from 'lucide-react';

interface TestTrainingScreenProps {
  user: UserProfile;
  testRecords: TestRecord[];
  dailySlot: DailyTestSlot;
  settings: AppSettings;
  onSaveTest: (test: Omit<TestRecord, 'id' | 'timestamp' | 'percentage' | 'xpEarned'>, isDailySlot: boolean) => void;
  onEditTest: (id: string, updated: Partial<TestRecord>) => void;
  onDeleteTest: (id: string) => void;
  onUpdateDailySlot: (slot: DailyTestSlot) => void;
}

const PRESET_CATEGORIES: (TestCategory | string)[] = [
  'Banking',
  'IBPS PO',
  'SSC CGL',
  'Reasoning',
  'Quantitative Aptitude',
  'English',
  'General Awareness',
  'Custom',
];

const PRESET_SUBJECTS = [
  'Quantitative Aptitude',
  'Logical Reasoning',
  'English Language',
  'General & Banking Awareness',
  'Data Interpretation',
  'Computer Aptitude',
  'Full Mock Exam',
];

export const TestTrainingScreen: React.FC<TestTrainingScreenProps> = ({
  user,
  testRecords,
  dailySlot,
  settings,
  onSaveTest,
  onEditTest,
  onDeleteTest,
  onUpdateDailySlot,
}) => {
  // Navigation Sub-tabs: 'progress' | 'log' | 'history' | 'subjects' | 'start'
  const [subTab, setSubTab] = useState<'progress' | 'log' | 'history' | 'subjects' | 'start'>('progress');

  // Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [testName, setTestName] = useState('');
  const [subject, setSubject] = useState('Reasoning');
  const [customSubject, setCustomSubject] = useState('');
  const [category, setCategory] = useState<TestCategory | string>('IBPS PO');
  const [testDate, setTestDate] = useState(todayStr);
  const [marksObtained, setMarksObtained] = useState<number | ''>(28);
  const [totalMarks, setTotalMarks] = useState<number | ''>(35);
  const [questionsAttempted, setQuestionsAttempted] = useState<number | ''>(32);
  const [correctAnswers, setCorrectAnswers] = useState<number | ''>(29);
  const [wrongAnswers, setWrongAnswers] = useState<number | ''>(3);
  const [timeTaken, setTimeTaken] = useState<number | ''>(20);
  const [topicsToRevise, setTopicsToRevise] = useState('');
  const [notes, setNotes] = useState('');
  const [isDailySlotChecked, setIsDailySlotChecked] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Daily Slot Editor Modal
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotTime, setSlotTime] = useState(dailySlot.time || '20:00');
  const [slotSubject, setSlotSubject] = useState(dailySlot.subject || 'Reasoning');
  const [slotCategory, setSlotCategory] = useState(dailySlot.category || 'Banking / IBPS PO');

  // Log Test Modal Popup State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<TestRecord | null>(null);

  // Live Test Timer State ("Start Test" mode)
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(30 * 60);
  const [testAttemptsCount, setTestAttemptsCount] = useState(0);

  // Edit record state
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [editMarksObtained, setEditMarksObtained] = useState<number>(0);
  const [editTotalMarks, setEditTotalMarks] = useState<number>(100);
  const [editNotes, setEditNotes] = useState('');
  const [editTopics, setEditTopics] = useState('');

  // Subject filter for history
  const [historySubjectFilter, setHistorySubjectFilter] = useState('all');

  // Live Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            soundFx.playTimerBell();
            triggerHaptic('success', settings.hapticsEnabled);
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timerSecondsLeft, settings.hapticsEnabled]);

  // Daily test status check
  const isTodaySlotCompleted = dailySlot.completedDates.includes(todayStr);

  // Calculate live preview percentage & XP in form
  const numObtained = typeof marksObtained === 'number' ? marksObtained : 0;
  const numTotal = typeof totalMarks === 'number' ? totalMarks : 0;
  const livePercentage = numTotal > 0 ? (numObtained / numTotal) * 100 : 0;
  const liveXp = getTestXpReward(livePercentage, isDailySlotChecked && !isTodaySlotCompleted);

  // Aggregate Stats
  const totalTests = testRecords.length;
  const avgPercentage =
    totalTests > 0
      ? testRecords.reduce((acc, t) => acc + t.percentage, 0) / totalTests
      : 0;
  const bestScore =
    totalTests > 0 ? Math.max(...testRecords.map((t) => t.percentage)) : 0;
  const latestTest = testRecords.length > 0 ? testRecords[testRecords.length - 1] : null;
  const previousTest = testRecords.length > 1 ? testRecords[testRecords.length - 2] : null;
  const improvement =
    latestTest && previousTest
      ? latestTest.percentage - previousTest.percentage
      : 0;
  const totalTestXp = testRecords.reduce((acc, t) => acc + t.xpEarned, 0);

  // Subject-wise stats calculation
  const subjectsMap = new Map<
    string,
    { count: number; totalPct: number; bestPct: number; xp: number; topics: string[]; scores: number[] }
  >();

  testRecords.forEach((t) => {
    const key = t.subject || 'General';
    const entry = subjectsMap.get(key) || {
      count: 0,
      totalPct: 0,
      bestPct: 0,
      xp: 0,
      topics: [],
      scores: [],
    };
    entry.count += 1;
    entry.totalPct += t.percentage;
    entry.bestPct = Math.max(entry.bestPct, t.percentage);
    entry.xp += t.xpEarned;
    entry.scores.push(t.percentage);
    if (t.topicsToRevise?.trim()) {
      entry.topics.push(t.topicsToRevise.trim());
    }
    subjectsMap.set(key, entry);
  });

  const subjectStatsList = Array.from(subjectsMap.entries()).map(([subj, data]) => ({
    subject: subj,
    count: data.count,
    avg: data.totalPct / data.count,
    best: data.bestPct,
    xp: data.xp,
    topics: data.topics,
    recentScores: data.scores.slice(-3),
  }));

  // Identify Strongest & Weakest Subjects
  const sortedByAvg = [...subjectStatsList].sort((a, b) => b.avg - a.avg);
  const strongestSubject = sortedByAvg.length > 0 ? sortedByAvg[0] : null;
  const weakestSubject = sortedByAvg.length > 1 ? sortedByAvg[sortedByAvg.length - 1] : null;

  // Handle Log Test Submission
  const handleSubmitTest = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const obtained = Number(marksObtained);
    const total = Number(totalMarks);

    if (isNaN(total) || total <= 0) {
      setFormError('Total marks must be greater than zero.');
      return;
    }
    if (isNaN(obtained) || obtained < 0 || obtained > total) {
      setFormError(`Marks obtained must be between 0 and ${total}.`);
      return;
    }

    const finalSubject = customSubject.trim() || subject;
    const finalName = testName.trim() || `${finalSubject} Practice Test`;

    onSaveTest(
      {
        testName: finalName,
        subject: finalSubject,
        category,
        date: testDate,
        marksObtained: obtained,
        totalMarks: total,
        questionsAttempted: questionsAttempted !== '' ? Number(questionsAttempted) : undefined,
        correctAnswers: correctAnswers !== '' ? Number(correctAnswers) : undefined,
        wrongAnswers: wrongAnswers !== '' ? Number(wrongAnswers) : undefined,
        timeTakenMinutes: timeTaken !== '' ? Number(timeTaken) : undefined,
        topicsToRevise: topicsToRevise.trim() || undefined,
        notes: notes.trim() || undefined,
        isDailySlotTest: isDailySlotChecked && !isTodaySlotCompleted,
      },
      isDailySlotChecked && !isTodaySlotCompleted
    );

    soundFx.playQuestComplete();
    triggerHaptic('success', settings.hapticsEnabled);

    setFeedbackNotice(
      `Test saved! Scored ${((obtained / total) * 100).toFixed(1)}% (+${liveXp} EXP awarded).`
    );
    setTimeout(() => setFeedbackNotice(null), 4000);

    // Reset Form
    setTestName('');
    setTopicsToRevise('');
    setNotes('');
    setSubTab('progress');
  };

  const handleSaveSlotModal = () => {
    // Format 24h to 12h AM/PM
    const [hStr, mStr] = slotTime.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const formatted = `${h}:${m} ${ampm}`;

    onUpdateDailySlot({
      ...dailySlot,
      time: slotTime,
      timeFormatted: formatted,
      subject: slotSubject,
      category: slotCategory,
    });
    setIsSlotModalOpen(false);
    soundFx.playClick();
  };

  const handleStartTestTimer = (mins: number) => {
    setTimerMinutes(mins);
    setTimerSecondsLeft(mins * 60);
    setTimerRunning(true);
    setTestAttemptsCount(0);
    soundFx.playClick();
  };

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* 1. HEADER BANNER */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/40 bg-gradient-to-b from-[#0e1626] to-[#070b14] p-5 shadow-neon-cyan hunter-grid-bg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-cyan-400" />
              <h2 className="font-orbitron text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300">
                TEST TRAINING &amp; EXAM FORGE
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-400 font-rajdhani">
              Competitive Mock Tests, Marks Tracking &amp; Rank XP Progression
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-rajdhani uppercase">Avg Accuracy</span>
            <span className="font-orbitron text-2xl font-black text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
              {totalTests > 0 ? `${avgPercentage.toFixed(1)}%` : '—'}
            </span>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg border border-slate-800 bg-[#060810]/80 p-2">
            <span className="text-[10px] text-slate-400 block font-rajdhani uppercase">Total Tests</span>
            <span className="font-orbitron font-bold text-white text-sm">{totalTests}</span>
          </div>
          <div className="rounded-lg border border-slate-800 bg-[#060810]/80 p-2">
            <span className="text-[10px] text-slate-400 block font-rajdhani uppercase">Peak Score</span>
            <span className="font-orbitron font-bold text-amber-300 text-sm">
              {bestScore > 0 ? `${bestScore.toFixed(1)}%` : '—'}
            </span>
          </div>
          <div className="rounded-lg border border-slate-800 bg-[#060810]/80 p-2">
            <span className="text-[10px] text-slate-400 block font-rajdhani uppercase">Test EXP Earned</span>
            <span className="font-orbitron font-bold text-purple-300 text-sm">+{totalTestXp} XP</span>
          </div>
        </div>
      </div>

      {/* 2. DAILY TEST SLOT CARD (Default 8:00 PM, after office hours 10 AM - 7 PM) */}
      <div className="rounded-xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 via-slate-900/60 to-indigo-950/40 p-4 backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-xl border mt-0.5 ${
                isTodaySlotCompleted
                  ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                  : 'border-sky-500/40 bg-sky-950/40 text-sky-300'
              }`}
            >
              <Target className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-orbitron text-xs font-bold text-white">
                  DAILY TEST SLOT
                </span>
                <span className="font-orbitron text-[10px] px-2 py-0.5 rounded border border-sky-400/40 bg-sky-950/60 text-sky-300">
                  {dailySlot.timeFormatted || '8:00 PM'}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                {dailySlot.subject} · {dailySlot.category}
              </p>
              <p className="text-[10px] text-slate-400 font-rajdhani mt-0.5">
                Target scheduled after office hours (10:00 AM – 7:00 PM). Earns +10 Bonus EXP on completion.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span
              className={`px-2 py-0.5 rounded font-orbitron text-[10px] font-bold ${
                isTodaySlotCompleted
                  ? 'border border-emerald-500/40 bg-emerald-950/60 text-emerald-300'
                  : 'border border-amber-500/40 bg-amber-950/40 text-amber-300'
              }`}
            >
              {isTodaySlotCompleted ? 'COMPLETED' : 'PENDING'}
            </span>

            <button
              onClick={() => setIsSlotModalOpen(true)}
              className="text-[11px] text-sky-400 hover:text-sky-300 font-rajdhani font-semibold underline"
            >
              Reschedule Slot
            </button>
          </div>
        </div>

        {/* Quick Action to log today's scheduled slot */}
        {!isTodaySlotCompleted && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-rajdhani">
              Ready to take today&apos;s scheduled test?
            </span>
            <button
              onClick={() => {
                setSubject(dailySlot.subject);
                setCategory(dailySlot.category);
                setIsDailySlotChecked(true);
                setSubTab('log');
                soundFx.playClick();
              }}
              className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-black text-xs font-orbitron font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>LOG TODAY&apos;S TEST (+10 XP BONUS)</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. SUB-TABS NAVIGATION */}
      <div className="flex rounded-xl border border-slate-800 bg-slate-900/60 p-1 text-xs font-orbitron">
        <button
          onClick={() => {
            setSubTab('progress');
            soundFx.playClick();
          }}
          className={`flex-1 py-2 text-center rounded-lg transition font-bold ${
            subTab === 'progress'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          PROGRESS
        </button>
        <button
          onClick={() => {
            setSubTab('log');
            soundFx.playClick();
          }}
          className={`flex-1 py-2 text-center rounded-lg transition font-bold ${
            subTab === 'log'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          LOG TEST
        </button>
        <button
          onClick={() => {
            setSubTab('start');
            soundFx.playClick();
          }}
          className={`flex-1 py-2 text-center rounded-lg transition font-bold ${
            subTab === 'start'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          START TEST
        </button>
        <button
          onClick={() => {
            setSubTab('subjects');
            soundFx.playClick();
          }}
          className={`flex-1 py-2 text-center rounded-lg transition font-bold ${
            subTab === 'subjects'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          SUBJECTS
        </button>
        <button
          onClick={() => {
            setSubTab('history');
            soundFx.playClick();
          }}
          className={`flex-1 py-2 text-center rounded-lg transition font-bold ${
            subTab === 'history'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          HISTORY
        </button>
      </div>

      {/* Notification Toast */}
      {feedbackNotice && (
        <div className="p-3 rounded-xl border border-cyan-500/50 bg-cyan-950/80 text-cyan-200 text-xs font-medium flex items-center justify-between shadow-neon-cyan animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{feedbackNotice}</span>
          </div>
          <button onClick={() => setFeedbackNotice(null)} className="text-cyan-400 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* 4. SUB-TAB 1: TEST PROGRESS & ANALYTICS DASHBOARD */}
      {subTab === 'progress' && (
        <div className="space-y-4">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-slate-800 bg-[#0a0d14] p-3.5">
              <span className="text-[10px] text-slate-400 font-rajdhani uppercase tracking-wider block">
                Latest Score Trend
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-orbitron text-xl font-bold text-white">
                  {latestTest ? `${latestTest.percentage.toFixed(1)}%` : '—'}
                </span>
                {previousTest && (
                  <span
                    className={`flex items-center text-xs font-semibold ${
                      improvement >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {improvement >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                    )}
                    {improvement > 0 ? `+${improvement.toFixed(1)}%` : `${improvement.toFixed(1)}%`}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-rajdhani block mt-0.5">
                {latestTest ? latestTest.testName : 'No tests recorded'}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0a0d14] p-3.5">
              <span className="text-[10px] text-slate-400 font-rajdhani uppercase tracking-wider block">
                Daily Slot Completed
              </span>
              <div className="mt-1 font-orbitron text-xl font-bold text-amber-300">
                {dailySlot.completedDates.length} Days
              </div>
              <span className="text-[10px] text-slate-500 font-rajdhani block mt-0.5">
                Target: {dailySlot.timeFormatted}
              </span>
            </div>
          </div>

          {/* Interactive Progress Chart */}
          <div className="rounded-2xl border border-slate-800 bg-[#0a0d14] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <h3 className="font-orbitron text-xs font-bold uppercase tracking-wider text-white">
                  Score Percentage Progression
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-rajdhani">
                Last {Math.min(10, testRecords.length)} Tests
              </span>
            </div>

            {testRecords.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 font-rajdhani">
                No tests recorded yet. Tap &ldquo;Log Test&rdquo; or &ldquo;Start Test&rdquo; to begin tracking!
              </div>
            ) : (
              <div className="pt-2">
                <div className="h-36 w-full flex items-end gap-1.5 pt-4">
                  {testRecords.slice(-10).map((t, idx) => {
                    const heightPercent = Math.max(10, Math.min(100, Math.round(t.percentage)));
                    const isPassed = t.percentage >= 70;

                    return (
                      <div key={t.id || idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                        <span className="text-[9px] font-orbitron font-semibold text-cyan-300 mb-1 opacity-0 group-hover:opacity-100 transition truncate max-w-full">
                          {t.percentage.toFixed(0)}%
                        </span>
                        <div
                          className={`w-full rounded-t-md transition-all duration-300 ${
                            isPassed
                              ? 'bg-gradient-to-t from-cyan-600 to-sky-300 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                              : 'bg-gradient-to-t from-slate-700 to-amber-500'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[8px] text-slate-500 font-rajdhani mt-1 truncate max-w-full">
                          {t.subject.slice(0, 4)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-between text-[10px] text-slate-500 font-rajdhani">
                  <span>0%</span>
                  <span>50% Target</span>
                  <span>70% Merit</span>
                  <span>100% Sovereign</span>
                </div>
              </div>
            )}
          </div>

          {/* Strongest & Weakest Subjects Banner */}
          {strongestSubject && (
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3">
                <span className="text-[9px] font-orbitron font-bold text-emerald-400 uppercase tracking-wider block">
                  STRONGEST DOMAIN
                </span>
                <span className="text-xs font-bold text-white block mt-0.5 truncate">
                  {strongestSubject.subject}
                </span>
                <span className="text-[11px] font-orbitron font-semibold text-emerald-300">
                  {strongestSubject.avg.toFixed(1)}% Avg
                </span>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3">
                <span className="text-[9px] font-orbitron font-bold text-amber-400 uppercase tracking-wider block">
                  FOCUS / REVISE NEEDED
                </span>
                <span className="text-xs font-bold text-white block mt-0.5 truncate">
                  {weakestSubject ? weakestSubject.subject : strongestSubject.subject}
                </span>
                <span className="text-[11px] font-orbitron font-semibold text-amber-300">
                  {weakestSubject ? `${weakestSubject.avg.toFixed(1)}% Avg` : 'Keep Practicing'}
                </span>
              </div>
            </div>
          )}

          {/* Quick Shortcuts */}
          <div className="flex gap-2.5">
            <button
              onClick={() => {
                setSubTab('log');
                soundFx.playClick();
              }}
              className="flex-1 py-3 rounded-xl border border-amber-500/40 bg-amber-950/30 text-amber-300 text-xs font-orbitron font-bold flex items-center justify-center gap-2 hover:bg-amber-900/40 transition active:scale-95 shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>RECORD TEST RESULT</span>
            </button>

            <button
              onClick={() => {
                setSubTab('start');
                soundFx.playClick();
              }}
              className="flex-1 py-3 rounded-xl border border-purple-500/40 bg-purple-950/30 text-purple-300 text-xs font-orbitron font-bold flex items-center justify-center gap-2 hover:bg-purple-900/40 transition active:scale-95 shadow-sm"
            >
              <Play className="w-4 h-4 text-purple-400" />
              <span>START LIVE TEST</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. SUB-TAB 2: LOG COMPLETED TEST FORM */}
      {subTab === 'log' && (
        <form onSubmit={handleSubmitTest} className="rounded-2xl border border-cyan-500/40 bg-[#0a0d14] p-5 space-y-3.5">
          <div>
            <h3 className="font-orbitron text-xs font-bold uppercase tracking-wider text-cyan-300 mb-0.5">
              Record Test Marks &amp; Calculate EXP
            </h3>
            <p className="text-[11px] text-slate-400 font-rajdhani">
              Validation: Percentage = (Marks Obtained ÷ Total Marks) × 100.
            </p>
          </div>

          {formError && (
            <div className="p-2.5 rounded-lg border border-red-500/50 bg-red-950/50 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Test Name */}
          <div>
            <label className="block text-slate-400 font-rajdhani uppercase text-xs mb-1">
              Test / Mock Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Oliveboard IBPS PO Prelims Mock #3"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-[#07090e] px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Subject & Category Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 font-rajdhani uppercase text-xs mb-1">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setCustomSubject('');
                }}
                className="w-full rounded-xl border border-slate-800 bg-[#07090e] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {PRESET_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
                <option value="Custom">Custom Subject...</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-rajdhani uppercase text-xs mb-1">
                Exam / Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-[#07090e] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {PRESET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {subject === 'Custom' && (
            <div>
              <label className="block text-slate-400 font-rajdhani uppercase text-xs mb-1">
                Specify Custom Subject
              </label>
              <input
                type="text"
                placeholder="e.g. Indian Financial System"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-[#07090e] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          )}

          {/* Marks Obtained & Total Marks */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 font-rajdhani uppercase text-xs mb-1">
                Marks Obtained *
              </label>
              <input
                type="number"
                step="0.25"
                required
                min="0"
                value={marksObtained}
                onChange={(e) => setMarksObtained(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full rounded-xl border border-slate-800 bg-[#07090e] px-3 py-2 text-xs font-orbitron font-bold text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-rajdhani uppercase text-xs mb-1">
                Total Marks *
              </label>
              <input
                type="number"
                step="1"
                required
                min="1"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full rounded-xl border border-slate-800 bg-[#07090e] px-3 py-2 text-xs font-orbitron font-bold text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Live Automatic Percentage & XP Preview Box */}
          <div className="p-3 rounded-xl border border-slate-800 bg-[#07090e] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-rajdhani block">
                Calculated Score Percentage
              </span>
              <span className="font-orbitron text-lg font-black text-cyan-300">
                {livePercentage > 0 ? `${livePercentage.toFixed(1)}%` : '0%'}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-rajdhani block">
                EXP Reward Bracket
              </span>
              <span className="font-orbitron text-sm font-bold text-purple-400">
                +{liveXp} EXP
              </span>
            </div>
          </div>

          {/* Questions Analytics (Optional) */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-slate-400 font-rajdhani uppercase text-[10px] mb-1">
                Attempted
              </label>
              <input
                type="number"
                min="0"
                placeholder="Optional"
                value={questionsAttempted}
                onChange={(e) => setQuestionsAttempted(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className="w-full rounded-lg border border-slate-800 bg-[#07090e] px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-rajdhani uppercase text-[10px] mb-1">
                Correct
              </label>
              <input
                type="number"
                min="0"
                placeholder="Optional"
                value={correctAnswers}
                onChange={(e) => setCorrectAnswers(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className="w-full rounded-lg border border-slate-800 bg-[#07090e] px-2 py-1.5 text-xs text-emerald-300 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-rajdhani uppercase text-[10px] mb-1">
                Wrong
              </label>
              <input
                type="number"
                min="0"
                placeholder="Optional"
                value={wrongAnswers}
                onChange={(e) => setWrongAnswers(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className="w-full rounded-lg border border-slate-800 bg-[#07090e] px-2 py-1.5 text-xs text-red-300 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Date & Time taken */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 font-rajdhani uppercase text-xs mb-1">
                Test Date
              </label>
              <input
                type="date"
                required
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-[#07090e] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-rajdhani uppercase text-xs mb-1">
                Time Taken (Mins)
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 25"
                value={timeTaken}
                onChange={(e) => setTimeTaken(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className="w-full rounded-xl border border-slate-800 bg-[#07090e] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Topics to Revise */}
          <div>
            <label className="block text-slate-400 font-rajdhani uppercase text-xs mb-1">
              Topics to Revise (Weak areas discovered in this test)
            </label>
            <input
              type="text"
              placeholder="e.g. Syllogisms 'Only a few' cases, Quadratic equations speed..."
              value={topicsToRevise}
              onChange={(e) => setTopicsToRevise(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-[#07090e] px-3 py-2 text-xs text-amber-300 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* General Notes */}
          <div>
            <label className="block text-slate-400 font-rajdhani uppercase text-xs mb-1">
              Test Reflections &amp; Notes
            </label>
            <textarea
              rows={2}
              placeholder="Strategy insights, pacing, silly mistakes to avoid..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-[#07090e] px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Daily Slot Completion Checkbox */}
          {!isTodaySlotCompleted && (
            <label className="flex items-center gap-2 p-2.5 rounded-xl border border-sky-500/30 bg-sky-950/20 text-xs text-sky-200 cursor-pointer">
              <input
                type="checkbox"
                checked={isDailySlotChecked}
                onChange={(e) => setIsDailySlotChecked(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-0"
              />
              <span>Fulfill today&apos;s scheduled Daily Test Slot (+10 Bonus EXP)</span>
            </label>
          )}

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl font-orbitron text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-600 text-black shadow-neon-cyan hover:opacity-95 transition active:scale-[0.98]"
          >
            SAVE TEST RESULT (+{liveXp} EXP)
          </button>
        </form>
      )}

      {/* 6. SUB-TAB 3: LIVE START TEST TIMER */}
      {subTab === 'start' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-purple-500/40 bg-[#0a0d14] p-5 text-center shadow-neon-violet">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-orbitron font-bold uppercase tracking-wider mb-4 border border-purple-500/40 bg-purple-950/40 text-purple-300">
              SIMULATED EXAM ENVIRONMENT
            </span>

            {/* Circular Timer Display */}
            <div className="relative mx-auto my-3 flex h-44 w-44 items-center justify-center rounded-full border-4 border-purple-500/30 bg-[#080812] shadow-neon-violet">
              <div className="text-center">
                <span className="font-orbitron text-4xl font-black text-white tracking-wider">
                  {Math.floor(timerSecondsLeft / 60)}:
                  {String(timerSecondsLeft % 60).padStart(2, '0')}
                </span>
                <span className="block mt-1 text-[11px] font-rajdhani text-purple-400 uppercase font-semibold">
                  {subject}
                </span>
              </div>
            </div>

            {/* Presets */}
            <div className="flex justify-center gap-2 my-3">
              {[15, 20, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleStartTestTimer(mins)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-orbitron font-bold transition ${
                    timerMinutes === mins && timerRunning
                      ? 'border-purple-400 bg-purple-950/60 text-purple-300'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setTimerRunning(!timerRunning);
                  soundFx.playClick();
                  triggerHaptic('light', settings.hapticsEnabled);
                }}
                className={`flex-1 max-w-[160px] py-2.5 rounded-xl font-orbitron text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95 ${
                  timerRunning
                    ? 'bg-amber-500 text-black shadow-neon-amber'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-neon-violet'
                }`}
              >
                {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{timerRunning ? 'PAUSE TEST' : 'START TEST'}</span>
              </button>

              <button
                onClick={() => {
                  setTimerRunning(false);
                  setTimerSecondsLeft(timerMinutes * 60);
                  soundFx.playClick();
                }}
                className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Live Question Counter Widget */}
          <div className="rounded-xl border border-slate-800 bg-[#0a0d14] p-4 flex items-center justify-between">
            <div>
              <h4 className="font-orbitron text-xs font-bold text-white uppercase">
                Questions Attempted Tracker
              </h4>
              <p className="text-[11px] text-slate-400 font-rajdhani">
                Tap as you answer questions in your physical test booklet or online portal.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setTestAttemptsCount(Math.max(0, testAttemptsCount - 1));
                  soundFx.playClick();
                }}
                className="h-9 w-9 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 font-bold"
              >
                -
              </button>
              <span className="font-orbitron text-xl font-bold text-cyan-300 min-w-8 text-center">
                {testAttemptsCount}
              </span>
              <button
                onClick={() => {
                  setTestAttemptsCount(testAttemptsCount + 1);
                  soundFx.playClick();
                }}
                className="h-9 w-9 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Finish & Grade Test Button */}
          <button
            onClick={() => {
              setTimeTaken(Math.round((timerMinutes * 60 - timerSecondsLeft) / 60));
              setQuestionsAttempted(testAttemptsCount > 0 ? testAttemptsCount : '');
              setSubTab('log');
              soundFx.playClick();
            }}
            className="w-full py-3 rounded-xl font-orbitron text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-neon-amber transition active:scale-95"
          >
            FINISH TEST &amp; ENTER MARKS
          </button>
        </div>
      )}

      {/* 7. SUB-TAB 4: SUBJECT-WISE PERFORMANCE & REVISION */}
      {subTab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-orbitron text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>Subject Performance &amp; Revision</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-rajdhani">
              {subjectStatsList.length} Subjects Tracked
            </span>
          </div>

          {subjectStatsList.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 font-rajdhani rounded-2xl border border-dashed border-slate-800">
              No subject-specific test results yet. Log tests to view domain analytics and revision topics.
            </div>
          ) : (
            <div className="space-y-3">
              {subjectStatsList.map((stat) => (
                <div
                  key={stat.subject}
                  className="rounded-xl border border-slate-800 bg-[#0a0d14] p-4 space-y-2.5 transition hover:border-cyan-500/30"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-orbitron text-xs font-bold text-cyan-300">
                        {stat.subject}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-rajdhani">
                        {stat.count} {stat.count === 1 ? 'Test' : 'Tests'} Completed · +{stat.xp} EXP
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-orbitron text-sm font-bold text-white">
                        {stat.avg.toFixed(1)}%
                      </span>
                      <span className="text-[9px] text-slate-400 font-rajdhani block">
                        Best: {stat.best.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500"
                      style={{ width: `${Math.min(100, stat.avg)}%` }}
                    />
                  </div>

                  {/* Topics to Revise Notebook */}
                  {stat.topics.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] font-orbitron font-semibold text-amber-400 uppercase tracking-wider block mb-1">
                        Topics to Revise:
                      </span>
                      <ul className="space-y-1">
                        {stat.topics.slice(-4).map((topic, i) => (
                          <li
                            key={i}
                            className="text-[11px] text-slate-300 font-rajdhani flex items-start gap-1.5"
                          >
                            <span className="text-amber-400 text-xs">•</span>
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 8. SUB-TAB 5: TEST HISTORY */}
      {subTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-orbitron text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Test Records History</span>
            </h3>

            {/* Filter by Subject */}
            <select
              value={historySubjectFilter}
              onChange={(e) => setHistorySubjectFilter(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-[11px] text-cyan-300 font-rajdhani"
            >
              <option value="all">All Subjects</option>
              {Array.from(new Set(testRecords.map((t) => t.subject))).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {testRecords.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 font-rajdhani rounded-2xl border border-dashed border-slate-800">
              No test history found.
            </div>
          ) : (
            <div className="space-y-2.5">
              {[...testRecords]
                .reverse()
                .filter((t) => historySubjectFilter === 'all' || t.subject === historySubjectFilter)
                .map((record) => {
                  const isEditing = editingTestId === record.id;
                  const isPassed = record.percentage >= 70;

                  return (
                    <div
                      key={record.id}
                      className="p-3.5 rounded-xl border border-slate-800 bg-[#07090e] text-xs space-y-2"
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400 uppercase font-rajdhani">
                                Marks Obtained
                              </label>
                              <input
                                type="number"
                                step="0.25"
                                value={editMarksObtained}
                                onChange={(e) => setEditMarksObtained(parseFloat(e.target.value) || 0)}
                                className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 font-orbitron text-white text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 uppercase font-rajdhani">
                                Total Marks
                              </label>
                              <input
                                type="number"
                                step="1"
                                value={editTotalMarks}
                                onChange={(e) => setEditTotalMarks(parseFloat(e.target.value) || 1)}
                                className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 font-orbitron text-white text-xs"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-400 uppercase font-rajdhani">
                              Topics to Revise
                            </label>
                            <input
                              type="text"
                              value={editTopics}
                              onChange={(e) => setEditTopics(e.target.value)}
                              className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-white text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-400 uppercase font-rajdhani">
                              Notes
                            </label>
                            <input
                              type="text"
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-white text-xs"
                            />
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => {
                                onEditTest(record.id, {
                                  marksObtained: editMarksObtained,
                                  totalMarks: editTotalMarks,
                                  percentage: editTotalMarks > 0 ? (editMarksObtained / editTotalMarks) * 100 : 0,
                                  notes: editNotes.trim(),
                                  topicsToRevise: editTopics.trim(),
                                });
                                setEditingTestId(null);
                                soundFx.playClick();
                              }}
                              className="px-3 py-1 rounded bg-cyan-600 text-white font-orbitron text-[10px] font-bold flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Save Changes
                            </button>
                            <button
                              onClick={() => setEditingTestId(null)}
                              className="px-3 py-1 rounded bg-slate-800 text-slate-300 font-orbitron text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-white text-sm">{record.testName}</h4>
                                {record.isDailySlotTest && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded border border-sky-400/40 bg-sky-950/40 text-sky-300 font-orbitron font-bold">
                                    DAILY SLOT (+10 XP)
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-rajdhani mt-0.5">
                                <span>{record.subject}</span>
                                <span>·</span>
                                <span>{record.category}</span>
                                <span>·</span>
                                <span>{record.date}</span>
                                {record.timeTakenMinutes && (
                                  <>
                                    <span>·</span>
                                    <span>{record.timeTakenMinutes} mins</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span
                                className={`font-orbitron text-base font-black ${
                                  isPassed ? 'text-cyan-300' : 'text-amber-400'
                                }`}
                              >
                                {record.percentage.toFixed(1)}%
                              </span>
                              <span className="block text-[10px] font-orbitron text-purple-400">
                                +{record.xpEarned} EXP
                              </span>
                            </div>
                          </div>

                          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-rajdhani pt-2 border-t border-slate-800/80">
                            <div>
                              Score: <strong className="text-slate-200">{record.marksObtained}</strong> / {record.totalMarks}
                              {record.questionsAttempted !== undefined && (
                                <span className="ml-2">
                                  ({record.correctAnswers ?? 0} Correct / {record.wrongAnswers ?? 0} Wrong)
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingTestId(record.id);
                                  setEditMarksObtained(record.marksObtained);
                                  setEditTotalMarks(record.totalMarks);
                                  setEditNotes(record.notes || '');
                                  setEditTopics(record.topicsToRevise || '');
                                }}
                                className="p-1 text-slate-500 hover:text-cyan-400 transition"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete this test record? This will reverse ${record.xpEarned} earned EXP.`)) {
                                    onDeleteTest(record.id);
                                    soundFx.playClick();
                                  }
                                }}
                                className="p-1 text-slate-500 hover:text-red-400 transition"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {record.topicsToRevise && (
                            <div className="mt-1.5 p-2 rounded bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-200 font-rajdhani">
                              <strong>Revision:</strong> {record.topicsToRevise}
                            </div>
                          )}
                          {record.notes && (
                            <p className="text-[11px] text-slate-400 italic">
                              &ldquo;{record.notes}&rdquo;
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* 9. RESCHEDULE DAILY SLOT MODAL */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-sky-500/40 bg-[#0d111a] p-5 shadow-neon-cyan">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-sky-400" />
                <h3 className="font-orbitron text-xs font-bold text-white uppercase tracking-wider">
                  Configure Daily Test Slot
                </h3>
              </div>
              <button onClick={() => setIsSlotModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-rajdhani uppercase text-xs mb-1">
                  Daily Test Time (Default: 8:00 PM)
                </label>
                <input
                  type="time"
                  value={slotTime}
                  onChange={(e) => setSlotTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-[#07090e] px-3 py-2 text-white font-orbitron font-bold focus:outline-none focus:border-sky-400"
                />
                <span className="text-[10px] text-slate-500 font-rajdhani mt-0.5 block">
                  Suggested right after office duty (10:00 AM – 7:00 PM).
                </span>
              </div>

              <div>
                <label className="block text-slate-400 font-rajdhani uppercase text-xs mb-1">
                  Slot Subject
                </label>
                <select
                  value={slotSubject}
                  onChange={(e) => setSlotSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-[#07090e] px-3 py-2 text-white focus:outline-none focus:border-sky-400"
                >
                  {PRESET_SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-rajdhani uppercase text-xs mb-1">
                  Target Exam
                </label>
                <select
                  value={slotCategory}
                  onChange={(e) => setSlotCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-[#07090e] px-3 py-2 text-white focus:outline-none focus:border-sky-400"
                >
                  {PRESET_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveSlotModal}
                  className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-orbitron text-xs font-bold uppercase tracking-wider transition active:scale-95"
                >
                  SAVE DAILY SLOT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up Log Test Modal */}
      <LogTestModal
        isOpen={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false);
          setModalInitialData(null);
        }}
        onSaveTest={onSaveTest}
        initialData={modalInitialData}
        onUpdateTest={onEditTest}
        defaultSubject={dailySlot.subject || 'Reasoning'}
        defaultCategory={dailySlot.category || 'Banking'}
        isDailySlotDefault={!isTodaySlotCompleted}
        settings={settings}
      />
    </div>
  );
};
