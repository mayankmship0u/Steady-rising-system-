import React, { useState, useEffect, useCallback } from 'react';
import {
  ActiveTab,
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
  HunterRank,
  TestRecord,
  DailyTestSlot,
} from './types';
import { StorageService, getTodayDateStr } from './utils/storage';
import {
  getXpRequiredForLevel,
  getRankFromLevel,
  getMilestoneTitle,
  getTestXpReward,
} from './utils/progression';
import { soundFx } from './utils/audio';

import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { PWAInstallBanner } from './components/common/PWAInstallBanner';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { LevelUpModal } from './components/common/LevelUpModal';

import { HunterDashboard } from './components/home/HunterDashboard';
import { QuestsScreen } from './components/quests/QuestsScreen';
import { PushUpsScreen } from './components/training/PushUpsScreen';
import { TestTrainingScreen } from './components/tests/TestTrainingScreen';
import { StudyScreen } from './components/study/StudyScreen';
import { VaultScreen } from './components/vault/VaultScreen';
import { TimetableEditorModal } from './components/timetable/TimetableEditorModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Persistent States
  const [user, setUser] = useState<UserProfile>(() => StorageService.getUserProfile());
  const [quests, setQuests] = useState<Quest[]>(() => StorageService.getQuests());
  const [boss, setBoss] = useState<BossChallenge>(() => StorageService.getBossChallenge());
  const [pushUpRecords, setPushUpRecords] = useState<PushUpRecord[]>(() => StorageService.getPushUpRecords());
  const [pushUpSessions, setPushUpSessions] = useState<PushUpWorkoutSession[]>(() => StorageService.getPushUpSessions());
  const [studySessions, setStudySessions] = useState<StudySession[]>(() => StorageService.getStudySessions());
  const [testRecords, setTestRecords] = useState<TestRecord[]>(() => StorageService.getTestRecords());
  const [dailySlot, setDailySlot] = useState<DailyTestSlot>(() => StorageService.getDailyTestSlot());
  const [timetable, setTimetable] = useState<TimetableActivity[]>(() => StorageService.getTimetable());
  const [achievements, setAchievements] = useState<Achievement[]>(() => StorageService.getAchievements());
  const [xpLedger, setXpLedger] = useState<XPTransaction[]>(() => StorageService.getXpLedger());
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());

  // UI Modals
  const [isTimetableOpen, setIsTimetableOpen] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{
    isOpen: boolean;
    oldLevel: number;
    newLevel: number;
    oldRank: HunterRank;
    newRank: HunterRank;
    milestoneTitle: string;
  }>({
    isOpen: false,
    oldLevel: 1,
    newLevel: 1,
    oldRank: 'E',
    newRank: 'E',
    milestoneTitle: '',
  });

  // Sync Audio & Ambient Atmosphere Settings
  useEffect(() => {
    soundFx.setMuted(!settings.soundEnabled);
    if (settings.soundVolume !== undefined) {
      soundFx.setMasterVolume(settings.soundVolume);
    }
    if (settings.ambientVolume !== undefined) {
      soundFx.setAmbientVolume(settings.ambientVolume);
    }
    if (settings.soundEnabled && settings.ambientSoundEnabled) {
      soundFx.startAmbient(settings.ambientVolume ?? 0.25);
    } else {
      soundFx.stopAmbient();
    }
  }, [
    settings.soundEnabled,
    settings.ambientSoundEnabled,
    settings.soundVolume,
    settings.ambientVolume,
  ]);

  // Streak verification on mount
  useEffect(() => {
    const today = getTodayDateStr();
    if (user.lastActiveDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = user.currentStreak;
      // If yesterday was active or marked as a rest day, streak continues
      if (user.lastActiveDate === yesterdayStr || user.restDays.includes(yesterdayStr)) {
        newStreak = user.currentStreak + 1;
      } else {
        // Did not interact and didn't rest, reset to 1
        newStreak = 1;
      }

      const updatedUser: UserProfile = {
        ...user,
        currentStreak: newStreak,
        longestStreak: Math.max(user.longestStreak, newStreak),
        lastActiveDate: today,
      };
      setUser(updatedUser);
      StorageService.saveUserProfile(updatedUser);
    }
  }, [user]);

  // Check achievements helper
  const checkAchievements = useCallback(
    (
      currentQuests: Quest[],
      currentRecords: PushUpRecord[],
      currentStudy: StudySession[],
      currentStreak: number,
      bossCompleted: boolean,
      currentTests?: TestRecord[]
    ) => {
      let updatedAch = [...achievements];
      let hasChanges = false;
      const today = getTodayDateStr();

      const unlock = (id: string) => {
        updatedAch = updatedAch.map((a) => {
          if (a.id === id && !a.unlocked) {
            hasChanges = true;
            return {
              ...a,
              unlocked: true,
              unlockedAt: today,
              progress: a.maxProgress,
            };
          }
          return a;
        });
      };

      const completedQuestsCount = currentQuests.filter((q) => q.completed).length;
      if (completedQuestsCount >= 1) unlock('ach-first-quest');
      if (completedQuestsCount >= 10) unlock('ach-ten-quests');
      if (currentRecords.length >= 1) unlock('ach-first-training');
      if (currentRecords.length >= 1) unlock('ach-pushup-record');
      if (currentStudy.length >= 1) unlock('ach-first-study');
      if (currentStreak >= 7) unlock('ach-seven-streak');
      if (bossCompleted) unlock('ach-boss-slayer');

      const totalPushUps = currentRecords.reduce((sum, r) => sum + r.count, 0);
      if (totalPushUps >= 100) unlock('ach-century-reps');

      const totalFocusMins = currentStudy.reduce((sum, s) => sum + s.durationMinutes, 0);
      if (totalFocusMins >= 120) unlock('ach-master-focus');

      // Test achievements
      const testsToInspect = currentTests || testRecords;
      if (testsToInspect.length >= 5) unlock('ach-test-5');
      if (testsToInspect.length >= 10) unlock('ach-test-10');
      if (testsToInspect.length > 0) {
        const avgPct =
          testsToInspect.reduce((sum, t) => sum + t.percentage, 0) / testsToInspect.length;
        if (avgPct >= 70) unlock('ach-test-70-pct');
        if (avgPct >= 80) unlock('ach-test-80-pct');
        if (avgPct >= 90) unlock('ach-test-90-pct');
      }

      if (hasChanges) {
        setAchievements(updatedAch);
        StorageService.saveAchievements(updatedAch);
      }
    },
    [achievements, testRecords]
  );

  // Core XP & Level-Up Progression Engine
  const grantXP = useCallback(
    (
      amount: number,
      source: string,
      category: XPTransaction['category']
    ) => {
      if (amount <= 0) return;

      setUser((prevUser) => {
        let currentLevel = prevUser.level;
        let currentXp = prevUser.currentXp + amount;
        const totalXp = prevUser.totalXpEarned + amount;
        const oldRank = prevUser.rank;
        const oldLevel = prevUser.level;
        let leveledUp = false;

        // Check if level thresholds crossed
        let xpNeeded = getXpRequiredForLevel(currentLevel);
        while (currentXp >= xpNeeded) {
          currentXp -= xpNeeded;
          currentLevel += 1;
          leveledUp = true;
          xpNeeded = getXpRequiredForLevel(currentLevel);
        }

        const newRank = getRankFromLevel(currentLevel);

        if (leveledUp) {
          setLevelUpData({
            isOpen: true,
            oldLevel,
            newLevel: currentLevel,
            oldRank,
            newRank,
            milestoneTitle: getMilestoneTitle(currentLevel),
          });
        } else {
          soundFx.playXpGain();
        }

        const updatedProfile: UserProfile = {
          ...prevUser,
          level: currentLevel,
          currentXp,
          totalXpEarned: totalXp,
          rank: newRank,
        };

        StorageService.saveUserProfile(updatedProfile);
        return updatedProfile;
      });

      // Log transaction
      const newTx: XPTransaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        amount,
        source,
        category,
        timestamp: new Date().toISOString(),
      };
      setXpLedger((prev) => {
        const next = [newTx, ...prev];
        StorageService.saveXpLedger(next);
        return next;
      });
    },
    []
  );

  // Quest actions
  const handleToggleQuest = (questId: string) => {
    const today = getTodayDateStr();
    let updatedQuests = quests.map((q) => {
      if (q.id === questId) {
        const nextCompleted = !q.completed;
        if (nextCompleted && !q.completed) {
          // Award XP only when completed first time today
          soundFx.playQuestComplete();
          grantXP(q.xpReward, `Quest: ${q.title}`, 'quest');
          return {
            ...q,
            completed: true,
            completedAt: new Date().toISOString(),
          };
        }
        return {
          ...q,
          completed: nextCompleted,
        };
      }
      return q;
    });

    setQuests(updatedQuests);
    StorageService.saveQuests(updatedQuests);
    checkAchievements(updatedQuests, pushUpRecords, studySessions, user.currentStreak, boss.completed);
  };

  const handleAddQuest = (questData: Omit<Quest, 'id' | 'completed' | 'completedAt'>) => {
    const newQuest: Quest = {
      ...questData,
      id: `quest-${Date.now()}`,
      completed: false,
    };
    const updated = [newQuest, ...quests];
    setQuests(updated);
    StorageService.saveQuests(updated);
  };

  const handleDeleteQuest = (questId: string) => {
    const updated = quests.filter((q) => q.id !== questId);
    setQuests(updated);
    StorageService.saveQuests(updated);
  };

  const handlePostponeQuest = (questId: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const updated = quests.map((q) => {
      if (q.id === questId) {
        return { ...q, date: tomorrowStr };
      }
      return q;
    });
    setQuests(updated);
    StorageService.saveQuests(updated);
    soundFx.playClick();
  };

  // Boss actions
  const handleToggleBossMilestone = (milestoneId: string) => {
    let becameCompleted = false;
    const updatedMilestones = boss.targetMilestones.map((m) => {
      if (m.id === milestoneId) {
        return { ...m, completed: !m.completed };
      }
      return m;
    });

    const allDone = updatedMilestones.every((m) => m.completed);
    if (allDone && !boss.completed) {
      becameCompleted = true;
      soundFx.playLevelUp();
      grantXP(boss.xpReward, `Weekly Boss Defeated: ${boss.title}`, 'boss');
    } else {
      soundFx.playBossClash();
    }

    const updatedBoss: BossChallenge = {
      ...boss,
      targetMilestones: updatedMilestones,
      completed: allDone,
      completedAt: becameCompleted ? new Date().toISOString() : boss.completedAt,
    };

    setBoss(updatedBoss);
    StorageService.saveBossChallenge(updatedBoss);
    checkAchievements(quests, pushUpRecords, studySessions, user.currentStreak, allDone);
  };

  // Push-Up actions
  const handleSaveOneGoRecord = (count: number, notes?: string) => {
    const today = getTodayDateStr();
    const allTimeBest = pushUpRecords.length > 0 ? Math.max(...pushUpRecords.map((r) => r.count)) : 0;
    const isNewBest = count > allTimeBest;

    const newRecord: PushUpRecord = {
      id: `pushup-${Date.now()}`,
      count,
      date: today,
      timestamp: new Date().toISOString(),
      notes,
      isAllTimeBest: isNewBest,
    };

    const updatedRecords = [...pushUpRecords, newRecord];
    setPushUpRecords(updatedRecords);
    StorageService.savePushUpRecords(updatedRecords);

    // Calculate XP with daily cap protection
    const todayXpSoFar =
      user.dailyPushUpXpAwardedToday?.date === today
        ? user.dailyPushUpXpAwardedToday.amount
        : 0;
    const availableCap = Math.max(0, settings.pushUpDailyXpLimit - todayXpSoFar);

    const baseReward = Math.min(count, 35); // 1 XP per push-up up to 35 XP per set
    const xpToGrant = Math.min(baseReward, availableCap);

    if (xpToGrant > 0) {
      grantXP(xpToGrant, `One-Go Push-Ups: ${count} reps`, 'pushups');

      // Update user daily pushup XP awarded
      const updatedUser = {
        ...user,
        dailyPushUpXpAwardedToday: {
          date: today,
          amount: todayXpSoFar + xpToGrant,
        },
      };
      setUser(updatedUser);
      StorageService.saveUserProfile(updatedUser);
    }

    checkAchievements(quests, updatedRecords, studySessions, user.currentStreak, boss.completed);
  };

  const handleDeletePushUpRecord = (id: string) => {
    const updated = pushUpRecords.filter((r) => r.id !== id);
    setPushUpRecords(updated);
    StorageService.savePushUpRecords(updated);
  };

  const handleEditPushUpRecord = (id: string, newCount: number, notes?: string) => {
    const updated = pushUpRecords.map((r) => {
      if (r.id === id) {
        return { ...r, count: newCount, notes };
      }
      return r;
    });
    setPushUpRecords(updated);
    StorageService.savePushUpRecords(updated);
  };

  const handleSaveWorkoutSession = (sets: number[], notes?: string) => {
    const today = getTodayDateStr();
    const totalReps = sets.reduce((a, b) => a + b, 0);

    const newSession: PushUpWorkoutSession = {
      id: `session-${Date.now()}`,
      date: today,
      timestamp: new Date().toISOString(),
      sets,
      totalReps,
      notes,
    };

    const updated = [...pushUpSessions, newSession];
    setPushUpSessions(updated);
    StorageService.savePushUpSessions(updated);

    // Small bonus XP for completed full workout
    grantXP(25, `Workout Session: ${totalReps} total push-ups`, 'training');
  };

  const handleDeleteWorkoutSession = (id: string) => {
    const updated = pushUpSessions.filter((s) => s.id !== id);
    setPushUpSessions(updated);
    StorageService.savePushUpSessions(updated);
  };

  // Study actions
  const handleSaveStudySession = (sessionData: Omit<StudySession, 'id' | 'timestamp'>) => {
    const newSession: StudySession = {
      ...sessionData,
      id: `study-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    const updated = [...studySessions, newSession];
    setStudySessions(updated);
    StorageService.saveStudySessions(updated);

    grantXP(sessionData.xpEarned, `Study Focus: ${sessionData.subject}`, 'study');
    checkAchievements(quests, pushUpRecords, updated, user.currentStreak, boss.completed);
  };

  const handleDeleteStudySession = (id: string) => {
    const updated = studySessions.filter((s) => s.id !== id);
    setStudySessions(updated);
    StorageService.saveStudySessions(updated);
  };

  // Test Training handlers
  const handleSaveTest = (
    testData: Omit<TestRecord, 'id' | 'timestamp' | 'percentage' | 'xpEarned'>,
    isDailySlot: boolean
  ) => {
    const total = testData.totalMarks > 0 ? testData.totalMarks : 1;
    const percentage = (testData.marksObtained / total) * 100;
    const xpReward = getTestXpReward(percentage, isDailySlot);

    const newRecord: TestRecord = {
      ...testData,
      id: `test-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      percentage,
      xpEarned: xpReward,
      isDailySlotTest: isDailySlot,
    };

    const updated = [newRecord, ...testRecords];
    setTestRecords(updated);
    StorageService.saveTestRecords(updated);

    // If daily slot, mark today completed
    const today = getTodayDateStr();
    if (isDailySlot && !dailySlot.completedDates.includes(today)) {
      const updatedSlot: DailyTestSlot = {
        ...dailySlot,
        completedDates: [...dailySlot.completedDates, today],
      };
      setDailySlot(updatedSlot);
      StorageService.saveDailyTestSlot(updatedSlot);
    }

    // Award XP only after entering and saving actual test result
    grantXP(
      xpReward,
      `Exam Test: ${testData.testName} (${percentage.toFixed(1)}%)`,
      'test'
    );
    checkAchievements(
      quests,
      pushUpRecords,
      studySessions,
      user.currentStreak,
      boss.completed,
      updated
    );
  };

  const handleEditTest = (id: string, updatedFields: Partial<TestRecord>) => {
    const updated = testRecords.map((t) => {
      if (t.id === id) {
        const marksObtained = updatedFields.marksObtained ?? t.marksObtained;
        const totalMarks = updatedFields.totalMarks ?? t.totalMarks;
        const percentage = totalMarks > 0 ? (marksObtained / totalMarks) * 100 : t.percentage;
        return {
          ...t,
          ...updatedFields,
          percentage,
        };
      }
      return t;
    });
    setTestRecords(updated);
    StorageService.saveTestRecords(updated);
    checkAchievements(
      quests,
      pushUpRecords,
      studySessions,
      user.currentStreak,
      boss.completed,
      updated
    );
  };

  const handleDeleteTest = (id: string) => {
    const target = testRecords.find((t) => t.id === id);
    const updated = testRecords.filter((t) => t.id !== id);
    setTestRecords(updated);
    StorageService.saveTestRecords(updated);

    // Reversing XP if test is deleted
    if (target && target.xpEarned > 0) {
      setUser((prevUser) => {
        const newTotalXp = Math.max(0, prevUser.totalXpEarned - target.xpEarned);
        let newCurrentXp = prevUser.currentXp - target.xpEarned;
        let newLevel = prevUser.level;

        while (newCurrentXp < 0 && newLevel > 1) {
          newLevel -= 1;
          newCurrentXp += getXpRequiredForLevel(newLevel);
        }
        if (newCurrentXp < 0) newCurrentXp = 0;

        const newRank = getRankFromLevel(newLevel);
        const updatedProfile: UserProfile = {
          ...prevUser,
          level: newLevel,
          currentXp: newCurrentXp,
          totalXpEarned: newTotalXp,
          rank: newRank,
        };
        StorageService.saveUserProfile(updatedProfile);
        return updatedProfile;
      });
    }

    checkAchievements(
      quests,
      pushUpRecords,
      studySessions,
      user.currentStreak,
      boss.completed,
      updated
    );
  };

  const handleUpdateDailySlot = (slot: DailyTestSlot) => {
    setDailySlot(slot);
    StorageService.saveDailyTestSlot(slot);
    soundFx.playClick();
  };

  // Timetable
  const handleSaveTimetable = (updated: TimetableActivity[]) => {
    setTimetable(updated);
    StorageService.saveTimetable(updated);
  };

  // Rest day toggle
  const handleToggleRestDay = () => {
    const today = getTodayDateStr();
    const isRest = user.restDays.includes(today);
    let updatedRestDays = isRest
      ? user.restDays.filter((d) => d !== today)
      : [...user.restDays, today];

    const updatedUser = {
      ...user,
      restDays: updatedRestDays,
    };
    setUser(updatedUser);
    StorageService.saveUserProfile(updatedUser);
    soundFx.playClick();
  };

  // Reset all data
  const handleResetAllData = () => {
    StorageService.resetAllData();
    window.location.reload();
  };

  // Pending quests count for badge
  const pendingQuestsCount = quests.filter((q) => q.date === getTodayDateStr() && !q.completed).length;
  const isDailySlotPending = !dailySlot.completedDates.includes(getTodayDateStr());

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* PWA Offline notification */}
      <OfflineIndicator />

      {/* Main Mobile App Frame */}
      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col flex-1 bg-[#07090e] border-x border-slate-900/40 relative shadow-2xl">
        {/* Top Status Header */}
        <Header
          user={user}
          settings={settings}
          onToggleSound={() => {
            const next = !settings.soundEnabled;
            const updated = { ...settings, soundEnabled: next };
            setSettings(updated);
            StorageService.saveSettings(updated);
            soundFx.setMuted(!next);
            if (next) soundFx.playClick();
          }}
          onToggleAmbient={() => {
            const next = !settings.ambientSoundEnabled;
            const updated = { ...settings, ambientSoundEnabled: next };
            setSettings(updated);
            StorageService.saveSettings(updated);
            if (next && settings.soundEnabled) {
              soundFx.startAmbient(settings.ambientVolume ?? 0.25);
            } else {
              soundFx.stopAmbient();
            }
            soundFx.playClick();
          }}
          onOpenSettings={() => setActiveTab('vault')}
        />

        {/* In-app PWA install prompt banner for Android Chrome */}
        <PWAInstallBanner />

        {/* Screen Content Router */}
        <main className="flex-1 px-4 py-2">
          {activeTab === 'home' && (
            <HunterDashboard
              user={user}
              quests={quests}
              pushUpRecords={pushUpRecords}
              studySessions={studySessions}
              timetable={timetable}
              testRecords={testRecords}
              dailySlot={dailySlot}
              onNavigate={(tab) => {
                setActiveTab(tab);
                soundFx.playClick();
              }}
              onOpenAddQuest={() => {
                setActiveTab('quests');
                soundFx.playClick();
              }}
              onToggleQuest={handleToggleQuest}
              onOpenTimetable={() => setIsTimetableOpen(true)}
            />
          )}

          {activeTab === 'quests' && (
            <QuestsScreen
              quests={quests}
              boss={boss}
              settings={settings}
              onToggleQuest={handleToggleQuest}
              onAddQuest={handleAddQuest}
              onDeleteQuest={handleDeleteQuest}
              onPostponeQuest={handlePostponeQuest}
              onToggleBossMilestone={handleToggleBossMilestone}
            />
          )}

          {activeTab === 'tests' && (
            <TestTrainingScreen
              user={user}
              testRecords={testRecords}
              dailySlot={dailySlot}
              settings={settings}
              onSaveTest={handleSaveTest}
              onEditTest={handleEditTest}
              onDeleteTest={handleDeleteTest}
              onUpdateDailySlot={handleUpdateDailySlot}
            />
          )}

          {activeTab === 'training' && (
            <PushUpsScreen
              user={user}
              pushUpRecords={pushUpRecords}
              pushUpSessions={pushUpSessions}
              settings={settings}
              onSaveRecord={handleSaveOneGoRecord}
              onDeleteRecord={handleDeletePushUpRecord}
              onEditRecord={handleEditPushUpRecord}
              onSaveWorkoutSession={handleSaveWorkoutSession}
              onDeleteSession={handleDeleteWorkoutSession}
            />
          )}

          {activeTab === 'study' && (
            <StudyScreen
              studySessions={studySessions}
              settings={settings}
              onSaveStudySession={handleSaveStudySession}
              onDeleteSession={handleDeleteStudySession}
            />
          )}

          {activeTab === 'vault' && (
            <VaultScreen
              user={user}
              achievements={achievements}
              xpLedger={xpLedger}
              settings={settings}
              timetable={timetable}
              quests={quests}
              pushUpRecords={pushUpRecords}
              studySessions={studySessions}
              onUpdateSettings={(newSettings) => {
                setSettings(newSettings);
                StorageService.saveSettings(newSettings);
              }}
              onOpenTimetable={() => setIsTimetableOpen(true)}
              onResetData={handleResetAllData}
              onToggleRestDay={handleToggleRestDay}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={(tab) => {
            setActiveTab(tab);
            soundFx.playClick();
          }}
          pendingQuestsCount={pendingQuestsCount}
          dailyTestSlotPending={isDailySlotPending}
        />

        {/* Timetable Editor Modal */}
        <TimetableEditorModal
          isOpen={isTimetableOpen}
          onClose={() => setIsTimetableOpen(false)}
          timetable={timetable}
          onSaveTimetable={handleSaveTimetable}
        />

        {/* Level Up System Notification Modal */}
        <LevelUpModal
          isOpen={levelUpData.isOpen}
          onClose={() => setLevelUpData((prev) => ({ ...prev, isOpen: false }))}
          oldLevel={levelUpData.oldLevel}
          newLevel={levelUpData.newLevel}
          oldRank={levelUpData.oldRank}
          newRank={levelUpData.newRank}
          milestoneTitle={levelUpData.milestoneTitle}
        />
      </div>
    </div>
  );
}
