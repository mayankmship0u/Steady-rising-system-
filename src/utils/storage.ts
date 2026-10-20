import {
  UserProfile,
  Quest,
  BossChallenge,
  PushUpRecord,
  PushUpWorkoutSession,
  WorkoutLog,
  StudySession,
  TimetableActivity,
  Achievement,
  XPTransaction,
  AppSettings,
} from '../types';

const STORAGE_KEYS = {
  USER_PROFILE: 'steady_user_profile',
  QUESTS: 'steady_quests',
  BOSS: 'steady_weekly_boss',
  PUSHUP_RECORDS: 'steady_pushup_records',
  PUSHUP_SESSIONS: 'steady_pushup_sessions',
  WORKOUT_LOGS: 'steady_workout_logs',
  STUDY_SESSIONS: 'steady_study_sessions',
  TIMETABLE: 'steady_timetable',
  ACHIEVEMENTS: 'steady_achievements',
  XP_LEDGER: 'steady_xp_ledger',
  SETTINGS: 'steady_settings',
};

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  ambientSoundEnabled: false,
  ambientVolume: 0.25,
  soundVolume: 0.75,
  hapticsEnabled: true,
  reducedMotion: false,
  notificationsEnabled: true,
  quietHoursStart: '22:30',
  quietHoursEnd: '07:00',
  pushUpDailyXpLimit: 75,
};

export function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const INITIAL_USER_PROFILE: UserProfile = {
  hunterName: 'Shadow Sovereign',
  hunterCode: 'HUNTER-709',
  level: 1,
  currentXp: 0,
  totalXpEarned: 0,
  rank: 'E',
  currentStreak: 1,
  longestStreak: 1,
  lastActiveDate: getTodayDateStr(),
  createdAt: new Date().toISOString(),
  restDays: [],
  dailyPushUpXpAwardedToday: {
    date: getTodayDateStr(),
    amount: 0,
  },
};

export const DEFAULT_TIMETABLE: TimetableActivity[] = [
  {
    id: 'act-1',
    title: 'Morning Check-in & Status Screen',
    timeRange: '7:00 AM',
    startTime: '07:00',
    category: 'morning',
    description: 'Awaken, hydrate, review hunter status and today\'s active quests.',
    reminderEnabled: true,
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
    completedDates: [],
  },
  {
    id: 'act-2',
    title: 'Morning Workout & Mobility',
    timeRange: '7:15 AM - 7:45 AM',
    startTime: '07:15',
    endTime: '07:45',
    category: 'fitness',
    description: 'Light mobility, joint warm-up, bodyweight stretch or brisk walk.',
    reminderEnabled: true,
    daysOfWeek: [1, 2, 3, 4, 5],
    completedDates: [],
  },
  {
    id: 'act-3',
    title: 'Breakfast & Energy Preparation',
    timeRange: '8:00 AM - 8:45 AM',
    startTime: '08:00',
    endTime: '08:45',
    category: 'morning',
    description: 'Nutritious meal, vitamins, hydration to charge physical mana pool.',
    reminderEnabled: false,
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
    completedDates: [],
  },
  {
    id: 'act-4',
    title: 'Review Work Priorities',
    timeRange: '9:00 AM - 9:45 AM',
    startTime: '09:00',
    endTime: '09:45',
    category: 'office',
    description: 'Define top 3 mission-critical deliverables before office hours begin.',
    reminderEnabled: true,
    daysOfWeek: [1, 2, 3, 4, 5],
    completedDates: [],
  },
  {
    id: 'act-5',
    title: 'Office Hours (Deep Focus & Execution)',
    timeRange: '10:00 AM - 7:00 PM',
    startTime: '10:00',
    endTime: '19:00',
    category: 'office',
    description: 'Primary work duty. Optional hydration check, no mandatory app interaction.',
    reminderEnabled: false,
    daysOfWeek: [1, 2, 3, 4, 5],
    completedDates: [],
  },
  {
    id: 'act-6',
    title: 'Evening Physical Training / One-Go Test',
    timeRange: '7:30 PM - 8:15 PM',
    startTime: '19:30',
    endTime: '20:15',
    category: 'fitness',
    description: 'Physical training: push-ups, squats, mobility, or endurance.',
    reminderEnabled: true,
    daysOfWeek: [1, 2, 3, 4, 5, 6],
    completedDates: [],
  },
  {
    id: 'act-7',
    title: 'Study, Reading & Skill Mastery',
    timeRange: '8:30 PM - 9:30 PM',
    startTime: '20:30',
    endTime: '21:30',
    category: 'study',
    description: '25-minute Pomodoro study block, technical reading, or creative craft.',
    reminderEnabled: true,
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
    completedDates: [],
  },
  {
    id: 'act-8',
    title: 'Daily Review & Next Day Quest Prep',
    timeRange: '9:30 PM - 10:00 PM',
    startTime: '21:30',
    endTime: '22:00',
    category: 'night',
    description: 'Collect daily quest XP, inspect streak, setup tomorrow\'s challenges.',
    reminderEnabled: true,
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
    completedDates: [],
  },
  {
    id: 'act-9',
    title: 'Wind-Down, Screen-Off & Recovery',
    timeRange: '10:30 PM',
    startTime: '22:30',
    category: 'night',
    description: 'Dim lights, disconnect from screens, restorative sleep for tomorrow.',
    reminderEnabled: true,
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
    completedDates: [],
  },
];

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'quest-1',
    title: 'Morning Status Check-in',
    description: 'Open the status screen, review daily directives, and set focus.',
    category: 'Personal',
    date: getTodayDateStr(),
    difficulty: 'Easy',
    xpReward: 25,
    completed: false,
    repeat: 'daily',
  },
  {
    id: 'quest-2',
    title: 'Office Priority: Complete #1 Work Task',
    description: 'Conquer the primary high-impact deliverable during office hours.',
    category: 'Office',
    date: getTodayDateStr(),
    difficulty: 'Medium',
    xpReward: 50,
    completed: false,
    repeat: 'daily',
  },
  {
    id: 'quest-3',
    title: 'Daily Push-Up Test (One-Go Attempt)',
    description: 'Log your maximum consecutive push-ups with strict, clean form.',
    category: 'Fitness',
    date: getTodayDateStr(),
    difficulty: 'Medium',
    xpReward: 50,
    completed: false,
    repeat: 'daily',
  },
  {
    id: 'quest-4',
    title: 'Deep Study Block (25 Min Focus)',
    description: 'Execute a distraction-free skill session or reading chapter.',
    category: 'Study',
    date: getTodayDateStr(),
    difficulty: 'Medium',
    xpReward: 50,
    completed: false,
    repeat: 'daily',
  },
  {
    id: 'quest-5',
    title: 'Nightly Reflection & Quest Prep',
    description: 'Review today\'s achievements and plan tomorrow\'s schedule.',
    category: 'Personal',
    date: getTodayDateStr(),
    difficulty: 'Easy',
    xpReward: 25,
    completed: false,
    repeat: 'daily',
  },
];

export const INITIAL_BOSS: BossChallenge = {
  id: 'boss-week-1',
  title: 'Weekly Boss: The Sloth Overlord',
  description: 'A manifestation of procrastination and distraction. Defeat by fulfilling weekly milestones!',
  weekStart: getTodayDateStr(),
  targetMilestones: [
    { id: 'm-1', text: 'Complete at least 15 daily quests this week', completed: false },
    { id: 'm-2', text: 'Log 4 separate One-Go Push-Up attempts', completed: false },
    { id: 'm-3', text: 'Accumulate 100+ minutes of focused study', completed: false },
    { id: 'm-4', text: 'Zero unapproved skips during office hours', completed: false },
  ],
  xpReward: 350,
  totalHp: 400,
  currentHp: 400,
  completed: false,
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-first-quest',
    title: 'Hunter Awakening',
    codeName: 'FIRST_QUEST',
    description: 'Complete your very first quest within the Shadow System.',
    icon: 'Sword',
    category: 'quest',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    xpBonus: 50,
  },
  {
    id: 'ach-first-training',
    title: 'Iron Will',
    codeName: 'FIRST_TRAINING',
    description: 'Log your first fitness workout or exercise session.',
    icon: 'Dumbbell',
    category: 'fitness',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    xpBonus: 50,
  },
  {
    id: 'ach-first-study',
    title: 'Mana Accumulation',
    codeName: 'FIRST_STUDY',
    description: 'Complete your first focused study timer session.',
    icon: 'BookOpen',
    category: 'study',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    xpBonus: 50,
  },
  {
    id: 'ach-pushup-record',
    title: 'Strength Sovereign',
    codeName: 'PUSHUP_RECORD',
    description: 'Record your first One-Go Push-Up milestone entry.',
    icon: 'Flame',
    category: 'fitness',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    xpBonus: 60,
  },
  {
    id: 'ach-ten-quests',
    title: 'Dungeon Cleaner',
    codeName: 'TEN_QUESTS',
    description: 'Clear 10 quests across your hunter journey.',
    icon: 'CheckCircle2',
    category: 'quest',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    xpBonus: 100,
  },
  {
    id: 'ach-seven-streak',
    title: 'Shadow Discipline',
    codeName: 'SEVEN_STREAK',
    description: 'Maintain a 7-day active consistency streak without quitting.',
    icon: 'Zap',
    category: 'streak',
    unlocked: false,
    progress: 1,
    maxProgress: 7,
    xpBonus: 200,
  },
  {
    id: 'ach-boss-slayer',
    title: 'Monarch Slayer',
    codeName: 'BOSS_SLAYER',
    description: 'Defeat your first Weekly Boss Challenge.',
    icon: 'Crown',
    category: 'mastery',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    xpBonus: 250,
  },
  {
    id: 'ach-century-reps',
    title: 'Century Reps Club',
    codeName: 'CENTURY_REPS',
    description: 'Reach 100 cumulative push-ups across all logged sessions.',
    icon: 'Shield',
    category: 'fitness',
    unlocked: false,
    progress: 0,
    maxProgress: 100,
    xpBonus: 150,
  },
  {
    id: 'ach-master-focus',
    title: 'Singular Focus',
    codeName: 'FOCUS_120',
    description: 'Accumulate 120 total minutes of deep focus timer sessions.',
    icon: 'Clock',
    category: 'study',
    unlocked: false,
    progress: 0,
    maxProgress: 120,
    xpBonus: 150,
  },
];

// Helper to safe load JSON with fallback
function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading key ${key}:`, e);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving key ${key}:`, e);
  }
}

export const StorageService = {
  getUserProfile(): UserProfile {
    const profile = safeGet<UserProfile>(STORAGE_KEYS.USER_PROFILE, INITIAL_USER_PROFILE);
    // Daily reset check for push-up daily XP limit
    const today = getTodayDateStr();
    if (profile.dailyPushUpXpAwardedToday?.date !== today) {
      profile.dailyPushUpXpAwardedToday = { date: today, amount: 0 };
      safeSet(STORAGE_KEYS.USER_PROFILE, profile);
    }
    return profile;
  },

  saveUserProfile(profile: UserProfile): void {
    safeSet(STORAGE_KEYS.USER_PROFILE, profile);
  },

  getQuests(): Quest[] {
    const quests = safeGet<Quest[]>(STORAGE_KEYS.QUESTS, INITIAL_QUESTS);
    const today = getTodayDateStr();

    // Ensure daily repeating quests exist for today
    const hasTodayDaily = quests.some(q => q.date === today);
    if (!hasTodayDaily) {
      const dailyTemplates = INITIAL_QUESTS.map(q => ({
        ...q,
        id: `quest-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        date: today,
        completed: false,
        completedAt: undefined,
      }));
      const updated = [...dailyTemplates, ...quests];
      safeSet(STORAGE_KEYS.QUESTS, updated);
      return updated;
    }
    return quests;
  },

  saveQuests(quests: Quest[]): void {
    safeSet(STORAGE_KEYS.QUESTS, quests);
  },

  getBossChallenge(): BossChallenge {
    return safeGet<BossChallenge>(STORAGE_KEYS.BOSS, INITIAL_BOSS);
  },

  saveBossChallenge(boss: BossChallenge): void {
    safeSet(STORAGE_KEYS.BOSS, boss);
  },

  getPushUpRecords(): PushUpRecord[] {
    return safeGet<PushUpRecord[]>(STORAGE_KEYS.PUSHUP_RECORDS, []);
  },

  savePushUpRecords(records: PushUpRecord[]): void {
    safeSet(STORAGE_KEYS.PUSHUP_RECORDS, records);
  },

  getPushUpSessions(): PushUpWorkoutSession[] {
    return safeGet<PushUpWorkoutSession[]>(STORAGE_KEYS.PUSHUP_SESSIONS, []);
  },

  savePushUpSessions(sessions: PushUpWorkoutSession[]): void {
    safeSet(STORAGE_KEYS.PUSHUP_SESSIONS, sessions);
  },

  getWorkoutLogs(): WorkoutLog[] {
    return safeGet<WorkoutLog[]>(STORAGE_KEYS.WORKOUT_LOGS, []);
  },

  saveWorkoutLogs(logs: WorkoutLog[]): void {
    safeSet(STORAGE_KEYS.WORKOUT_LOGS, logs);
  },

  getStudySessions(): StudySession[] {
    return safeGet<StudySession[]>(STORAGE_KEYS.STUDY_SESSIONS, []);
  },

  saveStudySessions(sessions: StudySession[]): void {
    safeSet(STORAGE_KEYS.STUDY_SESSIONS, sessions);
  },

  getTimetable(): TimetableActivity[] {
    return safeGet<TimetableActivity[]>(STORAGE_KEYS.TIMETABLE, DEFAULT_TIMETABLE);
  },

  saveTimetable(timetable: TimetableActivity[]): void {
    safeSet(STORAGE_KEYS.TIMETABLE, timetable);
  },

  getAchievements(): Achievement[] {
    return safeGet<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, INITIAL_ACHIEVEMENTS);
  },

  saveAchievements(achievements: Achievement[]): void {
    safeSet(STORAGE_KEYS.ACHIEVEMENTS, achievements);
  },

  getXpLedger(): XPTransaction[] {
    return safeGet<XPTransaction[]>(STORAGE_KEYS.XP_LEDGER, []);
  },

  saveXpLedger(ledger: XPTransaction[]): void {
    safeSet(STORAGE_KEYS.XP_LEDGER, ledger);
  },

  getSettings(): AppSettings {
    const s = safeGet<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS, ...s };
  },

  saveSettings(settings: AppSettings): void {
    safeSet(STORAGE_KEYS.SETTINGS, settings);
  },

  exportAllDataJSON(): string {
    const payload = {
      exportedAt: new Date().toISOString(),
      userProfile: this.getUserProfile(),
      quests: this.getQuests(),
      bossChallenge: this.getBossChallenge(),
      pushUpRecords: this.getPushUpRecords(),
      pushUpSessions: this.getPushUpSessions(),
      workoutLogs: this.getWorkoutLogs(),
      studySessions: this.getStudySessions(),
      timetable: this.getTimetable(),
      achievements: this.getAchievements(),
      xpLedger: this.getXpLedger(),
      settings: this.getSettings(),
    };
    return JSON.stringify(payload, null, 2);
  },

  exportPushUpsCSV(): string {
    const records = this.getPushUpRecords();
    const rows = [
      ['Date', 'Time', 'Consecutive Reps (One-Go)', 'All Time Best', 'Notes'],
      ...records.map(r => [
        r.date,
        new Date(r.timestamp).toLocaleTimeString(),
        r.count.toString(),
        r.isAllTimeBest ? 'YES' : 'NO',
        `"${(r.notes || '').replace(/"/g, '""')}"`,
      ]),
    ];
    return rows.map(r => r.join(',')).join('\n');
  },

  exportQuestsCSV(): string {
    const quests = this.getQuests();
    const rows = [
      ['Title', 'Category', 'Difficulty', 'XP Reward', 'Status', 'Date', 'Notes'],
      ...quests.map(q => [
        `"${q.title.replace(/"/g, '""')}"`,
        q.category,
        q.difficulty,
        q.xpReward.toString(),
        q.completed ? 'Completed' : 'Pending',
        q.date,
        `"${(q.notes || '').replace(/"/g, '""')}"`,
      ]),
    ];
    return rows.map(r => r.join(',')).join('\n');
  },

  resetAllData(): void {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  },
};
