import { HunterRank } from '../types';

export interface MilestoneInfo {
  level: number;
  title: string;
  isUnlocked: boolean;
}

export const MILESTONES: { level: number; title: string }[] = [
  { level: 1, title: 'Discipline' },
  { level: 10, title: 'Consistency' },
  { level: 25, title: 'Momentum' },
  { level: 50, title: 'Progress' },
  { level: 75, title: 'Elite' },
  { level: 100, title: 'Better Self' },
  { level: 101, title: 'Unstoppable' },
];

export function getMilestoneTitle(level: number): string {
  if (level >= 101) return 'Unstoppable';
  if (level >= 100) return 'Better Self';
  if (level >= 75) return 'Elite';
  if (level >= 50) return 'Progress';
  if (level >= 25) return 'Momentum';
  if (level >= 10) return 'Consistency';
  return 'Discipline';
}

export function getRankFromLevel(level: number): HunterRank {
  if (level >= 150) return 'Shadow Master';
  if (level >= 100) return 'S';
  if (level >= 75) return 'A';
  if (level >= 50) return 'B';
  if (level >= 25) return 'C';
  if (level >= 10) return 'D';
  return 'E';
}

export function getRankBadgeColor(rank: HunterRank): {
  border: string;
  bg: string;
  text: string;
  glow: string;
  aura: string;
} {
  switch (rank) {
    case 'Shadow Master':
      return {
        border: 'border-purple-400',
        bg: 'bg-purple-950/80',
        text: 'text-purple-300',
        glow: 'shadow-[0_0_20px_rgba(168,85,247,0.5)]',
        aura: 'from-purple-600 via-indigo-600 to-cyan-400',
      };
    case 'S':
      return {
        border: 'border-amber-400',
        bg: 'bg-amber-950/80',
        text: 'text-amber-300',
        glow: 'shadow-[0_0_20px_rgba(251,191,36,0.5)]',
        aura: 'from-amber-500 via-orange-600 to-yellow-300',
      };
    case 'A':
      return {
        border: 'border-red-400',
        bg: 'bg-red-950/80',
        text: 'text-red-300',
        glow: 'shadow-[0_0_18px_rgba(248,113,113,0.45)]',
        aura: 'from-red-600 via-rose-500 to-pink-500',
      };
    case 'B':
      return {
        border: 'border-cyan-400',
        bg: 'bg-cyan-950/80',
        text: 'text-cyan-300',
        glow: 'shadow-[0_0_18px_rgba(6,182,212,0.45)]',
        aura: 'from-cyan-500 via-blue-600 to-teal-400',
      };
    case 'C':
      return {
        border: 'border-blue-400',
        bg: 'bg-blue-950/80',
        text: 'text-blue-300',
        glow: 'shadow-[0_0_15px_rgba(96,165,250,0.35)]',
        aura: 'from-blue-600 to-cyan-600',
      };
    case 'D':
      return {
        border: 'border-emerald-400',
        bg: 'bg-emerald-950/80',
        text: 'text-emerald-300',
        glow: 'shadow-[0_0_15px_rgba(52,211,153,0.35)]',
        aura: 'from-emerald-600 to-teal-600',
      };
    case 'E':
    default:
      return {
        border: 'border-slate-500',
        bg: 'bg-slate-900/80',
        text: 'text-slate-300',
        glow: 'shadow-[0_0_12px_rgba(148,163,184,0.25)]',
        aura: 'from-slate-700 to-slate-800',
      };
  }
}

/**
 * Calculates XP required to advance from `level` to `level + 1`.
 * Starts at 100 XP and gently curves upward so everyday consistency feels rewarding.
 */
export function getXpRequiredForLevel(level: number): number {
  if (level <= 1) return 100;
  return Math.floor(100 * Math.pow(level, 1.25));
}

export function getNextMilestone(level: number): { targetLevel: number; title: string; levelsRemaining: number } {
  const milestone = MILESTONES.find(m => m.level > level);
  if (!milestone) {
    return {
      targetLevel: level + 10,
      title: 'Ascended Sovereign',
      levelsRemaining: 10,
    };
  }
  return {
    targetLevel: milestone.level,
    title: milestone.title,
    levelsRemaining: milestone.level - level,
  };
}

const HUNTER_QUOTES = [
  { text: "The system only provides the quests. The will to overcome them belongs entirely to you.", author: "Shadow Monarch" },
  { text: "Consistency is not about perfection. It is about never abandoning the domain of your growth.", author: "Hunter Creed" },
  { text: "Every push-up, every focus block, every completed quest adds iron to your shadow armor.", author: "System Architect" },
  { text: "When you feel like stopping, remember: an E-Rank hunter becomes an S-Rank one day at a time.", author: "Monarch's Discipline" },
  { text: "Your office hours are your endurance training. Your evening routine is where your sovereignty awakens.", author: "Daily Directive" },
  { text: "Pain of discipline weighs ounces. The regret of stagnation weighs tons.", author: "Shadow Decree" },
  { text: "True power isn't granted by luck. It is forged in repetitive, quiet repetition when no one is watching.", author: "System Inscription" },
  { text: "Rest is not defeat. Recovery is the recharging of your mana pool before tomorrow's raid.", author: "Sanctuary Codex" },
  { text: "Do not negotiate with the weaker version of yourself. Stand up, breathe deep, and level up.", author: "Hunter Awakening" },
];

export function getDailyQuote(): { text: string; author: string } {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );
  const index = Math.abs(dayOfYear) % HUNTER_QUOTES.length;
  return HUNTER_QUOTES[index];
}
