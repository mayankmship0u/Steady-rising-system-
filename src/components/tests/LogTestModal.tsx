import React, { useState, useEffect } from 'react';
import { TestRecord, TestCategory, AppSettings } from '../../types';
import { getTestXpReward } from '../../utils/progression';
import { soundFx, triggerHaptic } from '../../utils/audio';
import {
  X,
  GraduationCap,
  Sparkles,
  Target,
  Clock,
  Calendar,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

interface LogTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTest: (
    test: Omit<TestRecord, 'id' | 'timestamp' | 'percentage' | 'xpEarned'>,
    isDailySlot: boolean
  ) => void;
  initialData?: TestRecord | null;
  onUpdateTest?: (id: string, updated: Partial<TestRecord>) => void;
  defaultSubject?: string;
  defaultCategory?: string;
  isDailySlotDefault?: boolean;
  settings: AppSettings;
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
  'Reasoning',
  'Quantitative Aptitude',
  'English Language',
  'General Awareness',
  'Banking Awareness',
  'Computer Aptitude',
  'Full Mock Exam',
];

export const LogTestModal: React.FC<LogTestModalProps> = ({
  isOpen,
  onClose,
  onSaveTest,
  initialData,
  onUpdateTest,
  defaultSubject = 'Reasoning',
  defaultCategory = 'IBPS PO',
  isDailySlotDefault = false,
  settings,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [testName, setTestName] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [customSubject, setCustomSubject] = useState('');
  const [category, setCategory] = useState<TestCategory | string>(defaultCategory);
  const [customCategory, setCustomCategory] = useState('');
  const [testDate, setTestDate] = useState(todayStr);
  const [marksObtained, setMarksObtained] = useState<number | ''>(28);
  const [totalMarks, setTotalMarks] = useState<number | ''>(35);
  const [questionsAttempted, setQuestionsAttempted] = useState<number | ''>('');
  const [correctAnswers, setCorrectAnswers] = useState<number | ''>('');
  const [wrongAnswers, setWrongAnswers] = useState<number | ''>('');
  const [timeTaken, setTimeTaken] = useState<number | ''>('');
  const [topicsToRevise, setTopicsToRevise] = useState('');
  const [notes, setNotes] = useState('');
  const [isDailySlotChecked, setIsDailySlotChecked] = useState(isDailySlotDefault);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTestName(initialData.testName);
      if (PRESET_SUBJECTS.includes(initialData.subject)) {
        setSubject(initialData.subject);
        setCustomSubject('');
      } else {
        setSubject('Custom');
        setCustomSubject(initialData.subject);
      }

      if (PRESET_CATEGORIES.includes(initialData.category)) {
        setCategory(initialData.category);
        setCustomCategory('');
      } else {
        setCategory('Custom');
        setCustomCategory(initialData.category);
      }

      setTestDate(initialData.date);
      setMarksObtained(initialData.marksObtained);
      setTotalMarks(initialData.totalMarks);
      setQuestionsAttempted(initialData.questionsAttempted ?? '');
      setCorrectAnswers(initialData.correctAnswers ?? '');
      setWrongAnswers(initialData.wrongAnswers ?? '');
      setTimeTaken(initialData.timeTakenMinutes ?? '');
      setTopicsToRevise(initialData.topicsToRevise ?? '');
      setNotes(initialData.notes ?? '');
      setIsDailySlotChecked(!!initialData.isDailySlotTest);
    } else {
      setTestName('');
      setSubject(defaultSubject);
      setCustomSubject('');
      setCategory(defaultCategory);
      setCustomCategory('');
      setTestDate(todayStr);
      setMarksObtained(28);
      setTotalMarks(35);
      setQuestionsAttempted('');
      setCorrectAnswers('');
      setWrongAnswers('');
      setTimeTaken('');
      setTopicsToRevise('');
      setNotes('');
      setIsDailySlotChecked(isDailySlotDefault);
      setFormError(null);
    }
  }, [initialData, isOpen, defaultSubject, defaultCategory, isDailySlotDefault, todayStr]);

  if (!isOpen) return null;

  // Real-time calculation
  const numObtained = typeof marksObtained === 'number' ? marksObtained : 0;
  const numTotal = typeof totalMarks === 'number' ? totalMarks : 0;
  const calculatedPercentage = numTotal > 0 ? (numObtained / numTotal) * 100 : 0;
  const previewXp = getTestXpReward(calculatedPercentage, isDailySlotChecked);

  const handleSubmit = (e: React.FormEvent) => {
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

    const finalSubject = subject === 'Custom' ? customSubject.trim() || 'Custom Subject' : subject;
    const finalCategory = category === 'Custom' ? customCategory.trim() || 'Custom Exam' : category;
    const finalName = testName.trim() || `${finalSubject} Practice Test`;

    if (initialData && onUpdateTest) {
      onUpdateTest(initialData.id, {
        testName: finalName,
        subject: finalSubject,
        category: finalCategory,
        date: testDate,
        marksObtained: obtained,
        totalMarks: total,
        percentage: (obtained / total) * 100,
        questionsAttempted: questionsAttempted !== '' ? Number(questionsAttempted) : undefined,
        correctAnswers: correctAnswers !== '' ? Number(correctAnswers) : undefined,
        wrongAnswers: wrongAnswers !== '' ? Number(wrongAnswers) : undefined,
        timeTakenMinutes: timeTaken !== '' ? Number(timeTaken) : undefined,
        topicsToRevise: topicsToRevise.trim() || undefined,
        notes: notes.trim() || undefined,
        isDailySlotTest: isDailySlotChecked,
      });
      soundFx.playClick();
      triggerHaptic('success', settings.hapticsEnabled);
      onClose();
      return;
    }

    onSaveTest(
      {
        testName: finalName,
        subject: finalSubject,
        category: finalCategory,
        date: testDate,
        marksObtained: obtained,
        totalMarks: total,
        questionsAttempted: questionsAttempted !== '' ? Number(questionsAttempted) : undefined,
        correctAnswers: correctAnswers !== '' ? Number(correctAnswers) : undefined,
        wrongAnswers: wrongAnswers !== '' ? Number(wrongAnswers) : undefined,
        timeTakenMinutes: timeTaken !== '' ? Number(timeTaken) : undefined,
        topicsToRevise: topicsToRevise.trim() || undefined,
        notes: notes.trim() || undefined,
        isDailySlotTest: isDailySlotChecked,
      },
      isDailySlotChecked
    );

    soundFx.playQuestComplete();
    triggerHaptic('success', settings.hapticsEnabled);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm safe-bottom overflow-y-auto">
      <div className="w-full max-w-lg my-auto rounded-2xl border border-cyan-500/40 bg-[#0a0d16] p-5 shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-orbitron text-sm font-black uppercase text-white tracking-wider">
                {initialData ? 'EDIT TEST RECORD' : 'LOG COMPLETED TEST'}
              </h3>
              <p className="text-[10px] text-slate-400 font-rajdhani">
                Record your performance to forge exam mastery and earn Rank EXP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto py-3 space-y-3.5 pr-1 text-xs">
          {formError && (
            <div className="p-2.5 rounded-lg border border-red-500/40 bg-red-950/40 text-red-300 flex items-center gap-2 font-rajdhani text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{formError}</span>
            </div>
          )}

          {/* Test Name & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-rajdhani uppercase text-slate-300 mb-1">
                Test Name / Mock Label
              </label>
              <input
                type="text"
                placeholder="e.g. IBPS PO Prelims Mock 04"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-[#07090f] text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-rajdhani uppercase text-slate-300 mb-1">
                Test Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-[#07090f] text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Subject & Exam Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-rajdhani uppercase text-slate-300 mb-1">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-[#07090f] text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                {PRESET_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
                <option value="Custom">+ Custom Subject</option>
              </select>
              {subject === 'Custom' && (
                <input
                  type="text"
                  placeholder="Enter custom subject..."
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="mt-1.5 w-full px-3 py-1.5 rounded-xl border border-cyan-500/40 bg-[#07090f] text-slate-200 focus:outline-none"
                />
              )}
            </div>

            <div>
              <label className="block text-[11px] font-rajdhani uppercase text-slate-300 mb-1">
                Exam Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-[#07090f] text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                {PRESET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {category === 'Custom' && (
                <input
                  type="text"
                  placeholder="Enter custom category..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="mt-1.5 w-full px-3 py-1.5 rounded-xl border border-cyan-500/40 bg-[#07090f] text-slate-200 focus:outline-none"
                />
              )}
            </div>
          </div>

          {/* MARKS SECTION - Primary Inputs & Live Calculation */}
          <div className="rounded-xl border border-cyan-500/30 bg-[#070a14] p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-orbitron font-bold text-cyan-300 uppercase">
                Score &amp; Marks Evaluation
              </span>
              <span className="text-[10px] font-rajdhani text-slate-400">
                Formula: (Marks ÷ Total) × 100
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-rajdhani uppercase text-slate-400 mb-1">
                  Marks Obtained <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  placeholder="e.g. 28.5"
                  value={marksObtained}
                  onChange={(e) =>
                    setMarksObtained(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-[#04060b] font-orbitron text-cyan-300 text-sm font-bold focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-rajdhani uppercase text-slate-400 mb-1">
                  Total Marks <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0.1"
                  placeholder="e.g. 35"
                  value={totalMarks}
                  onChange={(e) =>
                    setTotalMarks(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-[#04060b] font-orbitron text-slate-200 text-sm font-bold focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Live Percentage & EXP Calculation Preview Bar */}
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-cyan-500/20 bg-cyan-950/30">
              <div>
                <span className="text-[10px] font-rajdhani uppercase text-slate-400 block">
                  Calculated Percentage
                </span>
                <span className="font-orbitron text-lg font-black text-cyan-300">
                  {calculatedPercentage.toFixed(1)}%
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-rajdhani uppercase text-slate-400 block">
                  EXP Reward
                </span>
                <div className="flex items-center gap-1 font-orbitron text-sm font-bold text-amber-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>+{previewXp} XP</span>
                  {isDailySlotChecked && (
                    <span className="text-[9px] text-cyan-300 font-rajdhani font-normal">
                      (+10 Slot Bonus)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Optional Detailed Metrics */}
          <div className="rounded-xl border border-slate-800/80 bg-[#080b12] p-3 space-y-2">
            <span className="text-[10px] font-orbitron font-semibold text-slate-400 uppercase block">
              Additional Test Analytics (Optional)
            </span>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[9px] font-rajdhani uppercase text-slate-400 mb-1">
                  Attempted
                </label>
                <input
                  type="number"
                  placeholder="e.g. 32"
                  value={questionsAttempted}
                  onChange={(e) =>
                    setQuestionsAttempted(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-800 bg-[#05070c] text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-rajdhani uppercase text-slate-400 mb-1">
                  Correct
                </label>
                <input
                  type="number"
                  placeholder="e.g. 29"
                  value={correctAnswers}
                  onChange={(e) =>
                    setCorrectAnswers(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-800 bg-[#05070c] text-emerald-400 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-rajdhani uppercase text-slate-400 mb-1">
                  Wrong
                </label>
                <input
                  type="number"
                  placeholder="e.g. 3"
                  value={wrongAnswers}
                  onChange={(e) =>
                    setWrongAnswers(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-800 bg-[#05070c] text-red-400 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-rajdhani uppercase text-slate-400 mb-1">
                Time Taken (Minutes)
              </label>
              <input
                type="number"
                placeholder="e.g. 20"
                value={timeTaken}
                onChange={(e) =>
                  setTimeTaken(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-800 bg-[#05070c] text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Topics to Revise & Notes */}
          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-rajdhani uppercase text-amber-300 mb-1 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>Topics to Revise (Weak Areas)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Syllogisms, Circular Seating with facing in/out"
                value={topicsToRevise}
                onChange={(e) => setTopicsToRevise(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-[#07090f] text-slate-200 placeholder-slate-600 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-rajdhani uppercase text-slate-400 mb-1">
                General Notes / Reflections
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Felt rush during puzzle 2; need to skip faster next time."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-[#07090f] text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Daily Slot Checkbox */}
          {!initialData && (
            <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-sky-500/30 bg-sky-950/20 cursor-pointer">
              <input
                type="checkbox"
                checked={isDailySlotChecked}
                onChange={(e) => setIsDailySlotChecked(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer"
              />
              <div className="text-[11px]">
                <span className="font-semibold text-sky-200 block">
                  Mark as Today&apos;s Daily Test Slot
                </span>
                <span className="text-slate-400 font-rajdhani">
                  Awards an extra +10 XP bonus for honoring your scheduled daily test routine.
                </span>
              </div>
            </label>
          )}

          {/* Modal Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 font-rajdhani font-semibold hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-black font-orbitron font-bold text-xs uppercase tracking-wider hover:from-cyan-400 hover:to-sky-400 shadow-neon-cyan transition active:scale-95"
            >
              {initialData ? 'Update Record' : 'Save & Claim EXP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
