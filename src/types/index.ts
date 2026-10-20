export type HunterRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'Shadow Master';

export type QuestCategory = 'Office' | 'Study' | 'Fitness' | 'Reading' | 'Personal' | 'Custom';
export type QuestDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Boss';

export interface Quest {
  id: string;
  title: string;
  description?: string;
  category: QuestCategory;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  difficulty: QuestDifficulty;
  xpReward: number;
  completed: boolean;
  completedAt?: string;
  notes?: string;
  repeat?: 'none' | 'daily' | 'weekly';
  isBoss?: boolean;
}

export interface BossChallenge {
  id: string;
  title: string;
  description: string;
  weekStart: string; // YYYY-MM-DD
  targetMilestones: {
    id: string;
    text: string;
    completed: boolean;
  }[];
  xpReward: number;
  totalHp: number;
  currentHp: number;
  completed: boolean;
  completedAt?: string;
}

export interface PushUpRecord {
  id: string;
  count: number;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO string
  notes?: string;
  isAllTimeBest?: boolean;
}

export interface PushUpWorkoutSession {
  id: string;
  date: string;
  timestamp: string;
  sets: number[]; // e.g. [25, 20, 18, 15]
  totalReps: number;
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  date: string;
  exercise: string;
  category: 'Push-Ups' | 'Squats' | 'Planks' | 'Walking/Running' | 'Mobility' | 'Custom';
  sets?: number;
  reps?: number;
  durationMinutes?: number;
  distanceKm?: number;
  notes?: string;
  timestamp: string;
}

export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string;
  subject: string;
  durationMinutes: number;
  notes?: string;
  xpEarned: number;
  type: 'focus' | 'reading' | 'skill';
}

export interface TimetableActivity {
  id: string;
  title: string;
  timeRange: string; // e.g., "7:00 AM" or "10:00 AM - 7:00 PM"
  startTime: string; // "07:00"
  endTime?: string; // "19:00"
  category: 'morning' | 'office' | 'fitness' | 'study' | 'night' | 'custom';
  description: string;
  reminderEnabled: boolean;
  daysOfWeek: number[]; // 0 = Sun, 1 = Mon ... 6 = Sat
  completedDates: string[]; // YYYY-MM-DD
}

export interface Achievement {
  id: string;
  title: string;
  codeName: string;
  description: string;
  icon: string;
  category: 'quest' | 'fitness' | 'study' | 'streak' | 'mastery';
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  xpBonus: number;
}

export interface XPTransaction {
  id: string;
  amount: number;
  source: string;
  category: 'quest' | 'pushups' | 'training' | 'study' | 'boss' | 'achievement' | 'streak';
  timestamp: string;
}

export interface UserProfile {
  hunterName: string;
  hunterCode: string;
  level: number;
  currentXp: number;
  totalXpEarned: number;
  rank: HunterRank;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  createdAt: string;
  restDays: string[]; // YYYY-MM-DD
  dailyPushUpXpAwardedToday: {
    date: string;
    amount: number;
  };
}

export interface AppSettings {
  soundEnabled: boolean;
  ambientSoundEnabled: boolean;
  ambientVolume: number; // 0.0 to 1.0
  soundVolume: number; // 0.0 to 1.0
  hapticsEnabled: boolean;
  reducedMotion: boolean;
  notificationsEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "07:00"
  pushUpDailyXpLimit: number; // default 75 XP
}

export type ActiveTab = 'home' | 'quests' | 'training' | 'study' | 'vault';
