import React, { useState } from 'react';
import {
  Quest,
  BossChallenge,
  QuestCategory,
  QuestDifficulty,
  AppSettings,
} from '../../types';
import { soundFx, triggerHaptic } from '../../utils/audio';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Swords,
  ChevronRight,
  Filter,
  ArrowRight,
  Edit2,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';

interface QuestsScreenProps {
  quests: Quest[];
  boss: BossChallenge;
  settings: AppSettings;
  onToggleQuest: (questId: string) => void;
  onAddQuest: (quest: Omit<Quest, 'id' | 'completed' | 'completedAt'>) => void;
  onDeleteQuest: (questId: string) => void;
  onPostponeQuest: (questId: string) => void;
  onToggleBossMilestone: (milestoneId: string) => void;
}

export const QuestsScreen: React.FC<QuestsScreenProps> = ({
  quests,
  boss,
  settings,
  onToggleQuest,
  onAddQuest,
  onDeleteQuest,
  onPostponeQuest,
  onToggleBossMilestone,
}) => {
  // Filter States
  const [statusFilter, setStatusFilter] = useState<'all' | 'today' | 'pending' | 'completed'>('today');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Add Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCat, setNewCat] = useState<QuestCategory>('Office');
  const [newDate, setNewDate] = useState(todayStr);
  const [newTime, setNewTime] = useState('');
  const [newDiff, setNewDiff] = useState<QuestDifficulty>('Medium');
  const [newRepeat, setNewRepeat] = useState<'none' | 'daily' | 'weekly'>('none');
  const [newNotes, setNewNotes] = useState('');

  const difficultyXpMap: Record<QuestDifficulty, number> = {
    Easy: 25,
    Medium: 50,
    Hard: 100,
    Boss: 250,
  };

  const handleCreateQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddQuest({
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      category: newCat,
      date: newDate,
      time: newTime || undefined,
      difficulty: newDiff,
      xpReward: difficultyXpMap[newDiff],
      repeat: newRepeat,
      notes: newNotes.trim() || undefined,
    });

    soundFx.playClick();
    triggerHaptic('light', settings.hapticsEnabled);

    // Reset Form
    setNewTitle('');
    setNewDesc('');
    setNewNotes('');
    setNewTime('');
    setShowAddModal(false);
  };

  // Filter Logic
  const filteredQuests = quests.filter((q) => {
    if (statusFilter === 'today' && q.date !== todayStr) return false;
    if (statusFilter === 'pending' && q.completed) return false;
    if (statusFilter === 'completed' && !q.completed) return false;
    if (categoryFilter !== 'all' && q.category !== categoryFilter) return false;
    return true;
  });

  const categories: QuestCategory[] = ['Office', 'Study', 'Fitness', 'Reading', 'Personal', 'Custom'];

  // Boss progress
  const completedMilestones = boss.targetMilestones.filter((m) => m.completed).length;
  const bossHpPercent = Math.max(
    0,
    Math.round(((boss.targetMilestones.length - completedMilestones) / boss.targetMilestones.length) * 100)
  );

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* 1. WEEKLY BOSS CHALLENGE BANNER */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/40 bg-gradient-to-b from-[#220d0f] to-[#0d0910] p-4 shadow-[0_0_15px_rgba(239,68,68,0.25)] hunter-grid-bg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-red-500/20 p-2 text-red-400 border border-red-500/30">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-orbitron font-bold text-red-400 tracking-wider uppercase">
                RAID EVENT · WEEKLY BOSS
              </span>
              <h2 className="font-orbitron text-sm font-black text-white">
                {boss.title}
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="font-orbitron text-xs font-bold text-red-400">
              +{boss.xpReward} EXP
            </span>
            <span className="text-[10px] block text-slate-400 font-rajdhani">
              {boss.completed ? 'DEFEATED' : `HP: ${bossHpPercent}%`}
            </span>
          </div>
        </div>

        <p className="mt-2 text-xs text-slate-300 font-rajdhani leading-relaxed">
          {boss.description}
        </p>

        {/* Boss HP Bar */}
        <div className="mt-3 relative h-2.5 w-full overflow-hidden rounded-full bg-slate-900 border border-red-950">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 transition-all duration-500"
            style={{ width: `${bossHpPercent}%` }}
          />
        </div>

        {/* Boss Sub-Milestones */}
        <div className="mt-3 space-y-1.5">
          {boss.targetMilestones.map((m) => (
            <div
              key={m.id}
              onClick={() => onToggleBossMilestone(m.id)}
              className="flex items-center gap-2 p-1.5 rounded-lg bg-black/40 border border-slate-800/80 cursor-pointer hover:border-red-500/30 transition text-xs"
            >
              <input
                type="checkbox"
                checked={m.completed}
                onChange={() => onToggleBossMilestone(m.id)}
                className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-red-500 focus:ring-0 cursor-pointer"
              />
              <span className={`text-xs ${m.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                {m.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. QUEST CONTROLS & FILTERS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-cyan-400" />
            <h2 className="font-orbitron text-sm font-bold uppercase tracking-wider text-white">
              Quest Log
            </h2>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-400 px-3 py-1.5 text-xs font-bold font-orbitron text-black transition-all hover:bg-cyan-300 active:scale-95 shadow-neon-cyan"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>NEW QUEST</span>
          </button>
        </div>

        {/* Status Filters: All, Today, Pending, Completed */}
        <div className="flex rounded-xl border border-slate-800 bg-[#0a0d14] p-1 text-xs font-orbitron">
          {(['today', 'pending', 'completed', 'all'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex-1 py-1.5 text-center rounded-lg uppercase tracking-wider transition ${
                statusFilter === s
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Category Horizontal Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-rajdhani font-semibold transition ${
              categoryFilter === 'all'
                ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-rajdhani font-semibold transition ${
                categoryFilter === c
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 3. QUEST LIST */}
      {filteredQuests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500">
          No quests match the selected filter.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredQuests.map((quest) => {
            const isCompleted = quest.completed;

            return (
              <div
                key={quest.id}
                className={`relative overflow-hidden rounded-xl border p-3.5 transition-all duration-200 ${
                  isCompleted
                    ? 'border-slate-800/80 bg-slate-900/30 opacity-70'
                    : 'border-slate-800 bg-[#0c101a] hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left Checkbox & Info */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => onToggleQuest(quest.id)}
                      className="mt-0.5 shrink-0 text-cyan-400 hover:text-cyan-300 transition"
                      aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {isCompleted ? (
                        <CheckSquare className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-medium text-sm leading-snug ${
                            isCompleted ? 'line-through text-slate-500' : 'text-slate-100'
                          }`}
                        >
                          {quest.title}
                        </span>
                      </div>

                      {quest.description && (
                        <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {quest.description}
                        </p>
                      )}

                      {/* Metadata Row: Category, Date, Time, Difficulty */}
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 font-rajdhani flex-wrap">
                        <span className="text-slate-400 font-semibold">{quest.category}</span>
                        <span>·</span>
                        <span
                          className={`font-semibold ${
                            quest.difficulty === 'Hard' || quest.difficulty === 'Boss'
                              ? 'text-red-400'
                              : quest.difficulty === 'Medium'
                              ? 'text-amber-400'
                              : 'text-cyan-400'
                          }`}
                        >
                          {quest.difficulty}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {quest.date}
                        </span>
                        {quest.time && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {quest.time}
                            </span>
                          </>
                        )}
                        {quest.repeat && quest.repeat !== 'none' && (
                          <>
                            <span>·</span>
                            <span className="text-purple-400 uppercase text-[9px] font-orbitron">
                              ↻ {quest.repeat}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right XP Reward & Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                      className={`font-orbitron text-xs font-bold ${
                        isCompleted ? 'text-slate-600' : 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                      }`}
                    >
                      +{quest.xpReward} EXP
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Postpone to Tomorrow */}
                      {!isCompleted && (
                        <button
                          onClick={() => onPostponeQuest(quest.id)}
                          title="Postpone to tomorrow"
                          className="p-1 rounded text-slate-500 hover:text-amber-400 transition"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {/* Delete */}
                      <button
                        onClick={() => onDeleteQuest(quest.id)}
                        title="Delete Quest"
                        className="p-1 rounded text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. ADD QUEST MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-cyan-500/50 bg-[#0d111a] p-5 shadow-neon-cyan max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <h3 className="font-orbitron text-sm font-bold text-white tracking-wider">
                  DISPATCH NEW QUEST
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuest} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-rajdhani uppercase mb-1">
                  Quest Objective / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete quarterly office report"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-[#07090e] px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-rajdhani uppercase mb-1">
                  Description / Sub-Tasks
                </label>
                <textarea
                  rows={2}
                  placeholder="Details, requirements, or steps..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-[#07090e] px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-rajdhani uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value as QuestCategory)}
                    className="w-full rounded-xl border border-slate-800 bg-[#07090e] px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Office">Office</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Study">Study</option>
                    <option value="Reading">Reading</option>
                    <option value="Personal">Personal</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-rajdhani uppercase mb-1">
                    Difficulty & EXP
                  </label>
                  <select
                    value={newDiff}
                    onChange={(e) => setNewDiff(e.target.value as QuestDifficulty)}
                    className="w-full rounded-xl border border-slate-800 bg-[#07090e] px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Easy">Easy (+25 XP)</option>
                    <option value="Medium">Medium (+50 XP)</option>
                    <option value="Hard">Hard (+100 XP)</option>
                    <option value="Boss">Boss (+250 XP)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-rajdhani uppercase mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-[#07090e] px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-rajdhani uppercase mb-1">
                    Optional Time
                  </label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-[#07090e] px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-rajdhani uppercase mb-1">
                  Recurrence
                </label>
                <div className="flex gap-2">
                  {(['none', 'daily', 'weekly'] as const).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setNewRepeat(r)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs capitalize transition ${
                        newRepeat === r
                          ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 font-bold'
                          : 'border-slate-800 bg-slate-900 text-slate-400'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-orbitron text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-indigo-600 text-black shadow-neon-cyan hover:opacity-90 transition active:scale-[0.98]"
                >
                  DISPATCH QUEST (+{difficultyXpMap[newDiff]} XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
