import React from 'react';
import { TestRecord, DailyTestSlot, UserProfile } from '../../types';
import {
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Sparkles,
  Award,
  AlertCircle,
  Brain,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  PlusCircle,
  Edit2,
  GraduationCap,
} from 'lucide-react';

interface TestDashboardProps {
  user: UserProfile;
  testRecords: TestRecord[];
  dailySlot: DailyTestSlot;
  onOpenLogModal: () => void;
  onOpenSlotModal: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const TestDashboard: React.FC<TestDashboardProps> = ({
  user,
  testRecords,
  dailySlot,
  onOpenLogModal,
  onOpenSlotModal,
  onNavigateToTab,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const isTodaySlotCompleted = dailySlot.completedDates.includes(todayStr);

  // Core metrics
  const totalTests = testRecords.length;
  const avgPercentage =
    totalTests > 0
      ? testRecords.reduce((acc, t) => acc + t.percentage, 0) / totalTests
      : 0;
  const bestScore = totalTests > 0 ? Math.max(...testRecords.map((t) => t.percentage)) : 0;
  const totalXpEarned = testRecords.reduce((acc, t) => acc + t.xpEarned, 0);

  // Latest vs previous test
  const latestTest = totalTests > 0 ? testRecords[0] : null;
  const previousTest = totalTests > 1 ? testRecords[1] : null;
  const scoreImprovement =
    latestTest && previousTest ? latestTest.percentage - previousTest.percentage : 0;

  // Calculate daily test slot streak
  const sortedSlotDates = [...dailySlot.completedDates].sort().reverse();
  let testStreak = 0;
  if (sortedSlotDates.length > 0) {
    const checkDate = new Date();
    // If today is completed or yesterday was completed
    const today = checkDate.toISOString().split('T')[0];
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterday = checkDate.toISOString().split('T')[0];

    if (sortedSlotDates.includes(today) || sortedSlotDates.includes(yesterday)) {
      let iter = new Date(sortedSlotDates.includes(today) ? today : yesterday);
      while (sortedSlotDates.includes(iter.toISOString().split('T')[0])) {
        testStreak += 1;
        iter.setDate(iter.getDate() - 1);
      }
    }
  }

  // Subject-wise stats calculation
  const subjectsMap = new Map<
    string,
    { count: number; totalPct: number; bestPct: number; xp: number; scores: number[] }
  >();

  testRecords.forEach((t) => {
    const key = t.subject || 'General';
    const entry = subjectsMap.get(key) || {
      count: 0,
      totalPct: 0,
      bestPct: 0,
      xp: 0,
      scores: [],
    };
    entry.count += 1;
    entry.totalPct += t.percentage;
    entry.bestPct = Math.max(entry.bestPct, t.percentage);
    entry.xp += t.xpEarned;
    entry.scores.push(t.percentage);
    subjectsMap.set(key, entry);
  });

  const subjectStatsList = Array.from(subjectsMap.entries()).map(([subj, data]) => ({
    subject: subj,
    count: data.count,
    avg: data.totalPct / data.count,
    best: data.bestPct,
    xp: data.xp,
    recentScores: data.scores.slice(0, 5),
  }));

  const sortedByAvg = [...subjectStatsList].sort((a, b) => b.avg - a.avg);
  const strongestSubject = sortedByAvg.length > 0 ? sortedByAvg[0] : null;
  const weakestSubject = sortedByAvg.length > 1 ? sortedByAvg[sortedByAvg.length - 1] : null;

  // Weekly & Monthly calculations
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

  const pastWeekTests = testRecords.filter((t) => new Date(t.date) >= oneWeekAgo);
  const pastMonthTests = testRecords.filter((t) => new Date(t.date) >= oneMonthAgo);

  const weeklyAvg =
    pastWeekTests.length > 0
      ? pastWeekTests.reduce((acc, t) => acc + t.percentage, 0) / pastWeekTests.length
      : 0;
  const monthlyAvg =
    pastMonthTests.length > 0
      ? pastMonthTests.reduce((acc, t) => acc + t.percentage, 0) / pastMonthTests.length
      : 0;

  // Chronological list for the chart (oldest to newest, max 10)
  const chartTests = [...testRecords].reverse().slice(-10);

  return (
    <div className="space-y-4">
      {/* 1. Daily Test Slot Directive Card */}
      <div className="rounded-2xl border border-sky-500/40 bg-gradient-to-r from-sky-950/40 via-slate-900/60 to-indigo-950/40 p-4 backdrop-blur-md relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-xl border mt-0.5 ${
                isTodaySlotCompleted
                  ? 'border-emerald-500/50 bg-emerald-950/50 text-emerald-300'
                  : 'border-sky-500/40 bg-sky-950/50 text-sky-300'
              }`}
            >
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-orbitron text-xs font-bold uppercase tracking-wider text-white">
                  Daily Test Slot ({dailySlot.timeFormatted || '8:00 PM'})
                </span>
                <span
                  className={`text-[9px] font-orbitron font-bold px-2 py-0.5 rounded-full uppercase border ${
                    isTodaySlotCompleted
                      ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300'
                      : 'border-amber-500/40 bg-amber-950/60 text-amber-300'
                  }`}
                >
                  {isTodaySlotCompleted ? 'CLEARED' : 'PENDING'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 font-rajdhani">
                Scheduled after 10 AM–7 PM office duty: <strong>{dailySlot.subject}</strong> ({dailySlot.category})
              </p>
              <p className="text-[10px] text-slate-400 font-rajdhani mt-0.5">
                Take this test daily to build unwavering exam stamina (+10 XP bonus).
              </p>
            </div>
          </div>

          <button
            onClick={onOpenSlotModal}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition shrink-0"
            title="Edit daily test slot settings"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-rajdhani">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400">Target Time:</span>
            <span className="font-orbitron font-semibold text-slate-200">
              {dailySlot.timeFormatted || '8:00 PM'}
            </span>
          </div>

          <button
            onClick={onOpenLogModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-black font-orbitron text-[11px] font-bold uppercase tracking-wider hover:from-sky-400 hover:to-cyan-400 shadow-sm transition active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{isTodaySlotCompleted ? 'Log Extra Test' : 'Record Today\'s Test'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
        <div className="rounded-xl border border-slate-800 bg-[#0c101a] p-3">
          <span className="text-[10px] text-slate-400 font-rajdhani uppercase tracking-wider block">
            Avg Accuracy
          </span>
          <div className="mt-1 font-orbitron text-xl font-black text-cyan-300">
            {totalTests > 0 ? `${avgPercentage.toFixed(1)}%` : '—'}
          </div>
          <span className="text-[10px] text-slate-500 font-rajdhani">
            Across {totalTests} exams
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0c101a] p-3">
          <span className="text-[10px] text-slate-400 font-rajdhani uppercase tracking-wider block">
            Peak Score
          </span>
          <div className="mt-1 font-orbitron text-xl font-black text-amber-300">
            {bestScore > 0 ? `${bestScore.toFixed(1)}%` : '—'}
          </div>
          <span className="text-[10px] text-amber-400/80 font-rajdhani">Personal Record</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0c101a] p-3">
          <span className="text-[10px] text-slate-400 font-rajdhani uppercase tracking-wider block">
            Daily Slot Streak
          </span>
          <div className="mt-1 font-orbitron text-xl font-black text-emerald-400">
            {testStreak} <span className="text-xs font-normal">DAYS</span>
          </div>
          <span className="text-[10px] text-slate-500 font-rajdhani">Exam consistency</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0c101a] p-3">
          <span className="text-[10px] text-slate-400 font-rajdhani uppercase tracking-wider block">
            Test EXP Earned
          </span>
          <div className="mt-1 font-orbitron text-xl font-black text-purple-300">
            +{totalXpEarned}
          </div>
          <span className="text-[10px] text-purple-400/80 font-rajdhani">Added to Rank</span>
        </div>
      </div>

      {/* 3. Latest Test & Score Improvement Banner */}
      {latestTest && (
        <div className="rounded-xl border border-slate-800 bg-[#090d16] p-3.5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-orbitron font-semibold text-cyan-400 uppercase">
                Latest Test:
              </span>
              <span className="text-xs font-bold text-white truncate max-w-[180px]">
                {latestTest.testName}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-rajdhani mt-0.5">
              {latestTest.subject} · {latestTest.marksObtained}/{latestTest.totalMarks} marks on {latestTest.date}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="font-orbitron text-lg font-black text-cyan-300">
              {latestTest.percentage.toFixed(1)}%
            </span>
            {previousTest && (
              <div
                className={`flex items-center justify-end gap-1 text-[10px] font-orbitron font-bold ${
                  scoreImprovement >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {scoreImprovement >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>
                  {scoreImprovement >= 0 ? `+${scoreImprovement.toFixed(1)}%` : `${scoreImprovement.toFixed(1)}%`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. PERFORMANCE PROGRESS CHART */}
      <div className="rounded-2xl border border-slate-800 bg-[#0a0e18] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h3 className="font-orbitron text-xs font-bold text-white uppercase tracking-wider">
              Score Trajectory Over Time
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-rajdhani">
            Recent {chartTests.length} tests
          </span>
        </div>

        {totalTests === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500 font-rajdhani space-y-2">
            <GraduationCap className="w-8 h-8 text-slate-700 mx-auto" />
            <p>No tests recorded yet. Take your first test to chart your trajectory!</p>
            <button
              onClick={onOpenLogModal}
              className="px-3.5 py-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 font-orbitron text-[10px] font-bold"
            >
              LOG FIRST TEST
            </button>
          </div>
        ) : (
          <div className="pt-2">
            {/* Visual Bar Graph */}
            <div className="h-36 flex items-end gap-2 px-1 border-b border-slate-800 pb-2">
              {chartTests.map((t, idx) => {
                const heightPct = Math.max(8, Math.min(100, t.percentage));
                const isHigh = t.percentage >= 80;
                const isMed = t.percentage >= 60;

                return (
                  <div key={t.id || idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {/* Tooltip on hover/touch */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-cyan-500/50 px-2 py-0.5 rounded text-[9px] font-orbitron text-cyan-300 whitespace-nowrap z-20 pointer-events-none">
                      {t.percentage.toFixed(1)}% · {t.subject}
                    </div>

                    <div className="w-full flex justify-center">
                      <span className="text-[8px] font-orbitron text-slate-400">
                        {t.percentage.toFixed(0)}%
                      </span>
                    </div>

                    <div
                      className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                        isHigh
                          ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                          : isMed
                          ? 'bg-gradient-to-t from-sky-700 to-sky-500'
                          : 'bg-gradient-to-t from-slate-700 to-slate-500'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[9px] font-rajdhani text-slate-500 pt-1.5">
              <span>Oldest</span>
              <span>Target: 80%+ Accuracy</span>
              <span>Latest</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. Strongest & Weakest Subjects Analysis */}
      {subjectStatsList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {strongestSubject && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-orbitron text-[11px] font-bold uppercase">
                <Brain className="w-4 h-4 text-emerald-400" />
                <span>Strongest Domain</span>
              </div>
              <h4 className="text-sm font-bold text-white truncate">
                {strongestSubject.subject}
              </h4>
              <div className="flex items-center justify-between text-xs font-rajdhani pt-1 text-slate-300">
                <span>Average: <strong className="font-orbitron text-emerald-300">{strongestSubject.avg.toFixed(1)}%</strong></span>
                <span>Peak: <strong className="font-orbitron text-white">{strongestSubject.best.toFixed(1)}%</strong></span>
              </div>
            </div>
          )}

          {weakestSubject && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/15 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-orbitron text-[11px] font-bold uppercase">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Priority Revision</span>
              </div>
              <h4 className="text-sm font-bold text-white truncate">
                {weakestSubject.subject}
              </h4>
              <div className="flex items-center justify-between text-xs font-rajdhani pt-1 text-slate-300">
                <span>Average: <strong className="font-orbitron text-amber-300">{weakestSubject.avg.toFixed(1)}%</strong></span>
                <span>Attempts: <strong className="font-orbitron text-white">{weakestSubject.count}</strong></span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Weekly & Monthly Progress Summary */}
      <div className="rounded-xl border border-slate-800 bg-[#0a0d14] p-3.5">
        <h4 className="font-orbitron text-xs font-bold text-white uppercase tracking-wider mb-2.5">
          Exam Period Performance
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2.5 rounded-lg border border-slate-800/80 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 font-rajdhani uppercase block">
              Past 7 Days
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-orbitron text-base font-bold text-cyan-300">
                {pastWeekTests.length > 0 ? `${weeklyAvg.toFixed(1)}%` : '—'}
              </span>
              <span className="text-[10px] text-slate-500 font-rajdhani">
                ({pastWeekTests.length} tests)
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg border border-slate-800/80 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 font-rajdhani uppercase block">
              Past 30 Days
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-orbitron text-base font-bold text-purple-300">
                {pastMonthTests.length > 0 ? `${monthlyAvg.toFixed(1)}%` : '—'}
              </span>
              <span className="text-[10px] text-slate-500 font-rajdhani">
                ({pastMonthTests.length} tests)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
