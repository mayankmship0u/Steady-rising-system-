import React from 'react';
import {
  UserProfile,
  Quest,
  PushUpRecord,
  StudySession,
  TimetableActivity,
  ActiveTab,
  TestRecord,
  DailyTestSlot,
} from '../../types';
import { RankEmblem } from '../common/RankEmblem';
import {
  getXpRequiredForLevel,
  getNextMilestone,
  getDailyQuote,
  getMilestoneTitle,
} from '../../utils/progression';
import {
  PlusCircle,
  Dumbbell,
  Clock,
  CheckCircle2,
  Calendar,
  Flame,
  Award,
  BookOpen,
  ChevronRight,
  Briefcase,
  Zap,
  GraduationCap,
  Target,
  Check,
  AlertCircle,
} from 'lucide-react';

interface HunterDashboardProps {
  user: UserProfile;
  quests: Quest[];
  pushUpRecords: PushUpRecord[];
  studySessions: StudySession[];
  timetable: TimetableActivity[];
  testRecords?: TestRecord[];
  dailySlot?: DailyTestSlot;
  onNavigate: (tab: ActiveTab) => void;
  onOpenAddQuest: () => void;
  onToggleQuest: (questId: string) => void;
  onOpenTimetable: () => void;
}

export const HunterDashboard: React.FC<HunterDashboardProps> = ({
  user,
  quests,
  pushUpRecords,
  studySessions,
  timetable,
  testRecords = [],
  dailySlot,
  onNavigate,
  onOpenAddQuest,
  onToggleQuest,
  onOpenTimetable,
}) => {
  const xpNeeded = getXpRequiredForLevel(user.level);
  const xpPercent = Math.min(100, Math.round((user.currentXp / xpNeeded) * 100));
  const milestone = getNextMilestone(user.level);
  const currentMilestoneTitle = getMilestoneTitle(user.level);
  const dailyQuote = getDailyQuote();

  // Today's metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayQuests = quests.filter((q) => q.date === todayStr);
  const completedTodayQuests = todayQuests.filter((q) => q.completed);
  const questCompletionRate =
    todayQuests.length > 0
      ? Math.round((completedTodayQuests.length / todayQuests.length) * 100)
      : 0;

  // Pushups today
  const todayPushUps = pushUpRecords.filter((r) => r.date === todayStr);
  const bestPushUpToday =
    todayPushUps.length > 0
      ? Math.max(...todayPushUps.map((r) => r.count))
      : 0;
  const allTimeBestPushUp =
    pushUpRecords.length > 0
      ? Math.max(...pushUpRecords.map((r) => r.count))
      : 0;

  // Study minutes today
  const todayStudyMinutes = studySessions
    .filter((s) => s.date === todayStr)
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  // Current day of week (0 = Sunday, 1 = Monday ...)
  const currentDayOfWeek = new Date().getDay();
  const todayActivities = timetable
    .filter((a) => a.daysOfWeek.includes(currentDayOfWeek))
    .slice(0, 4);

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* 1. HUNTER STATUS SCREEN HERO */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/40 bg-gradient-to-b from-[#0f1422] to-[#080b12] p-5 shadow-neon-cyan hunter-grid-bg">
        {/* Glow ambient spots */}
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-cyan-500/15 blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-purple-600/15 blur-2xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header row with rank & hunter identification */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <RankEmblem rank={user.rank} size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-orbitron text-xs font-semibold tracking-wider text-cyan-400">
                    {user.hunterCode}
                  </span>
                  <span className="text-slate-600">/</span>
                  <span className="font-rajdhani text-xs text-slate-400 uppercase tracking-widest">
                    {currentMilestoneTitle}
                  </span>
                </div>
                <h2 className="font-orbitron text-xl font-black tracking-wide text-white">
                  {user.hunterName}
                </h2>
                <div className="mt-0.5 flex items-center gap-2 text-xs">
                  <span className="font-orbitron font-bold text-cyan-300">
                    LEVEL {user.level}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400 font-rajdhani">
                    {user.rank === 'Shadow Master' ? 'Shadow Sovereign' : `${user.rank}-Rank Hunter`}
                  </span>
                </div>
              </div>
            </div>

            {/* Streak & Rank Badge */}
            <div className="text-right">
              <div className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-950/40 px-2.5 py-1 text-xs font-bold text-amber-300 font-orbitron">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{user.currentStreak} DAYS</span>
              </div>
              <span className="mt-1 block text-[9px] font-rajdhani text-slate-400 uppercase tracking-wider">
                Peak: {user.longestStreak}d
              </span>
            </div>
          </div>

          {/* XP Progress Section */}
          <div className="mt-4 rounded-xl border border-slate-800/80 bg-[#06080e]/80 p-3">
            <div className="flex items-center justify-between text-xs mb-1.5 font-rajdhani">
              <div className="flex items-center gap-1.5 text-cyan-300 font-semibold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>EXP CAPACITY</span>
              </div>
              <div className="font-orbitron text-xs">
                <span className="text-cyan-400 font-bold">{user.currentXp}</span>
                <span className="text-slate-500"> / {xpNeeded} XP</span>
                <span className="ml-1 text-slate-400 font-normal">({xpPercent}%)</span>
              </div>
            </div>

            {/* Animated XP Bar */}
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 transition-all duration-500 shadow-[0_0_12px_#00f0ff]"
                style={{ width: `${xpPercent}%` }}
              />
            </div>

            {/* Next Milestone Subtext */}
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-rajdhani">
              <span>
                Next Milestone: <strong className="text-purple-300 font-orbitron text-[10px]">{milestone.title}</strong>
              </span>
              <span>
                {milestone.levelsRemaining} lvl to LV.{milestone.targetLevel}
              </span>
            </div>
          </div>

          {/* Character Hunter Attributes Grid */}
          <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-1.5">
              <span className="text-[9px] text-slate-400 block font-rajdhani uppercase">Discipline</span>
              <span className="font-orbitron font-bold text-cyan-400 text-xs">{10 + user.level * 2}</span>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-1.5">
              <span className="text-[9px] text-slate-400 block font-rajdhani uppercase">Strength</span>
              <span className="font-orbitron font-bold text-amber-400 text-xs">
                {Math.max(12, allTimeBestPushUp + user.level)}
              </span>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-1.5">
              <span className="text-[9px] text-slate-400 block font-rajdhani uppercase">Knowledge</span>
              <span className="font-orbitron font-bold text-purple-400 text-xs">
                {Math.floor(todayStudyMinutes / 10) + user.level}
              </span>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-1.5">
              <span className="text-[9px] text-slate-400 block font-rajdhani uppercase">Total EXP</span>
              <span className="font-orbitron font-bold text-slate-200 text-xs">{user.totalXpEarned}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DAILY MOTIVATIONAL HUNTER DIRECTIVE */}
      <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-3.5 backdrop-blur-sm">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 rounded-md bg-purple-500/20 p-1 text-purple-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs italic text-purple-200 leading-relaxed font-serif">
              &ldquo;{dailyQuote.text}&rdquo;
            </p>
            <span className="mt-1 block text-[10px] font-rajdhani font-semibold text-purple-400 uppercase tracking-widest">
              — {dailyQuote.author}
            </span>
          </div>
        </div>
      </div>

      {/* 3. QUICK SYSTEM ACTIONS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <button
          onClick={onOpenAddQuest}
          className="flex items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/40 p-3 text-xs font-bold font-orbitron text-cyan-300 transition-all hover:bg-cyan-900/50 active:scale-95 shadow-sm"
        >
          <PlusCircle className="w-4 h-4 text-cyan-400" />
          <span>ADD QUEST</span>
        </button>

        <button
          onClick={() => onNavigate('tests')}
          className="flex items-center justify-center gap-2 rounded-xl border border-sky-500/40 bg-sky-950/40 p-3 text-xs font-bold font-orbitron text-sky-300 transition-all hover:bg-sky-900/50 active:scale-95 shadow-sm"
        >
          <GraduationCap className="w-4 h-4 text-sky-400" />
          <span>TEST TRAINING</span>
        </button>

        <button
          onClick={() => onNavigate('training')}
          className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-950/40 p-3 text-xs font-bold font-orbitron text-amber-300 transition-all hover:bg-amber-900/50 active:scale-95 shadow-sm"
        >
          <Dumbbell className="w-4 h-4 text-amber-400" />
          <span>LOG PUSH-UPS</span>
        </button>

        <button
          onClick={() => onNavigate('study')}
          className="flex items-center justify-center gap-2 rounded-xl border border-purple-500/40 bg-purple-950/40 p-3 text-xs font-bold font-orbitron text-purple-300 transition-all hover:bg-purple-900/50 active:scale-95 shadow-sm"
        >
          <Clock className="w-4 h-4 text-purple-400" />
          <span>STUDY TIMER</span>
        </button>

        <button
          onClick={onOpenTimetable}
          className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-xs font-bold font-orbitron text-slate-300 transition-all hover:bg-slate-800 active:scale-95 shadow-sm"
        >
          <Briefcase className="w-4 h-4 text-slate-400" />
          <span>OFFICE SCHEDULE</span>
        </button>
      </div>

      {/* 3.5. DEDICATED DAILY TEST SLOT CARD */}
      {dailySlot && (
        <div
          onClick={() => onNavigate('tests')}
          className="cursor-pointer rounded-xl border border-sky-500/30 bg-gradient-to-r from-sky-950/30 via-slate-900/60 to-indigo-950/30 p-3.5 transition-all hover:border-sky-500/60 shadow-sm group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div
                className={`p-2 rounded-lg border mt-0.5 ${
                  dailySlot.completedDates.includes(todayStr)
                    ? 'border-emerald-500/40 bg-emerald-950/50 text-emerald-300'
                    : 'border-sky-500/40 bg-sky-950/50 text-sky-300'
                }`}
              >
                <Target className="w-4 h-4" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-orbitron text-xs font-bold text-white uppercase tracking-wider">
                    Today&apos;s Daily Test Slot
                  </span>
                  <span
                    className={`text-[9px] font-orbitron font-bold px-1.5 py-0.5 rounded uppercase border ${
                      dailySlot.completedDates.includes(todayStr)
                        ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300'
                        : 'border-amber-500/40 bg-amber-950/60 text-amber-300'
                    }`}
                  >
                    {dailySlot.completedDates.includes(todayStr) ? 'CLEARED' : 'PENDING'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  {dailySlot.subject} · {dailySlot.category}
                </p>
                <p className="text-[10px] text-slate-400 font-rajdhani">
                  Scheduled: {dailySlot.timeFormatted || '8:00 PM'} (After 10 AM–7 PM office duty)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-sky-400 font-rajdhani font-semibold group-hover:translate-x-0.5 transition-transform shrink-0">
              <span>{dailySlot.completedDates.includes(todayStr) ? 'View Marks' : 'Take Test'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      )}

      {/* 4. TODAY'S PROGRESS STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        {/* Quest Completion Rate */}
        <div
          onClick={() => onNavigate('quests')}
          className="cursor-pointer rounded-xl border border-slate-800 bg-[#0c101a] p-2.5 transition hover:border-cyan-500/40"
        >
          <span className="text-[10px] text-slate-400 font-rajdhani uppercase tracking-wider block">
            Quests Today
          </span>
          <div className="mt-1 flex items-baseline justify-center gap-1">
            <span className="font-orbitron text-base font-bold text-cyan-300">
              {completedTodayQuests.length}
            </span>
            <span className="text-xs text-slate-500">/ {todayQuests.length}</span>
          </div>
          <span className="mt-0.5 block text-[10px] text-cyan-400 font-rajdhani font-semibold">
            {questCompletionRate}% Cleared
          </span>
        </div>

        {/* Test Performance */}
        <div
          onClick={() => onNavigate('tests')}
          className="cursor-pointer rounded-xl border border-slate-800 bg-[#0c101a] p-2.5 transition hover:border-sky-500/40"
        >
          <span className="text-[10px] text-slate-400 font-rajdhani uppercase tracking-wider block">
            Test Avg
          </span>
          <div className="mt-1 font-orbitron text-base font-bold text-sky-300">
            {testRecords.length > 0
              ? `${(
                  testRecords.reduce((acc, t) => acc + t.percentage, 0) / testRecords.length
                ).toFixed(1)}%`
              : '—'}
          </div>
          <span className="mt-0.5 block text-[10px] text-sky-400 font-rajdhani font-semibold">
            {testRecords.length} Taken
          </span>
        </div>

        {/* One-Go Push-Ups Best */}
        <div
          onClick={() => onNavigate('training')}
          className="cursor-pointer rounded-xl border border-slate-800 bg-[#0c101a] p-2.5 transition hover:border-amber-500/40"
        >
          <span className="text-[10px] text-slate-400 font-rajdhani uppercase tracking-wider block">
            Push-Ups Best
          </span>
          <div className="mt-1 font-orbitron text-base font-bold text-amber-300">
            {bestPushUpToday > 0 ? `${bestPushUpToday}` : '—'}
          </div>
          <span className="mt-0.5 block text-[10px] text-slate-500 font-rajdhani">
            Best: {allTimeBestPushUp}
          </span>
        </div>

        {/* Study Focus Minutes */}
        <div
          onClick={() => onNavigate('study')}
          className="cursor-pointer rounded-xl border border-slate-800 bg-[#0c101a] p-2.5 transition hover:border-purple-500/40"
        >
          <span className="text-[10px] text-slate-400 font-rajdhani uppercase tracking-wider block">
            Focus Time
          </span>
          <div className="mt-1 font-orbitron text-base font-bold text-purple-300">
            {todayStudyMinutes}m
          </div>
          <span className="mt-0.5 block text-[10px] text-purple-400 font-rajdhani font-semibold">
            Today
          </span>
        </div>
      </div>

      {/* 5. TODAY'S ACTIVE QUESTS PREVIEW */}
      <div className="rounded-xl border border-slate-800 bg-[#0a0d14] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <h3 className="font-orbitron text-xs font-bold uppercase tracking-wider text-white">
              Today&apos;s Active Quests
            </h3>
          </div>
          <button
            onClick={() => onNavigate('quests')}
            className="flex items-center gap-0.5 text-xs text-cyan-400 hover:text-cyan-300 font-rajdhani font-semibold"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayQuests.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-500">
            No quests scheduled for today. Tap &ldquo;Add Quest&rdquo; to begin.
          </div>
        ) : (
          <div className="space-y-2">
            {todayQuests.slice(0, 3).map((quest) => (
              <div
                key={quest.id}
                onClick={() => onToggleQuest(quest.id)}
                className={`flex items-center justify-between gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                  quest.completed
                    ? 'border-slate-800/80 bg-slate-900/40 text-slate-500 opacity-70'
                    : 'border-slate-800 bg-[#0e121d] hover:border-cyan-500/40 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={quest.completed}
                    onChange={() => onToggleQuest(quest.id)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <div className="truncate">
                    <span
                      className={`text-xs font-medium block truncate ${
                        quest.completed ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {quest.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-rajdhani">
                      {quest.category} · {quest.difficulty}
                    </span>
                  </div>
                </div>

                <span
                  className={`shrink-0 font-orbitron text-[11px] font-bold ${
                    quest.completed ? 'text-slate-600' : 'text-cyan-400'
                  }`}
                >
                  +{quest.xpReward} XP
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. OFFICE HOURS & DAILY SCHEDULE PREVIEW */}
      <div className="rounded-xl border border-slate-800 bg-[#0a0d14] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-400" />
            <h3 className="font-orbitron text-xs font-bold uppercase tracking-wider text-white">
              Daily Schedule (Office: 10AM-7PM)
            </h3>
          </div>
          <button
            onClick={onOpenTimetable}
            className="flex items-center gap-0.5 text-xs text-sky-400 hover:text-sky-300 font-rajdhani font-semibold"
          >
            <span>Edit</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {todayActivities.map((act) => {
            const isOffice = act.category === 'office';
            return (
              <div
                key={act.id}
                className={`flex items-start justify-between gap-3 p-2 rounded-lg border text-xs ${
                  isOffice
                    ? 'border-sky-500/30 bg-sky-950/20 text-sky-200'
                    : 'border-slate-800/80 bg-slate-900/30 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-orbitron text-[10px] font-semibold text-slate-400">
                      {act.timeRange}
                    </span>
                    {isOffice && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded border border-sky-400/40 bg-sky-900/40 text-sky-300 font-rajdhani font-bold uppercase">
                        Work Duty
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 font-medium text-slate-200">{act.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
