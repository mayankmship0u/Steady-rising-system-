import React, { useState } from 'react';
import { TimetableActivity } from '../../types';
import { soundFx } from '../../utils/audio';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Briefcase,
  Bell,
  BellOff,
} from 'lucide-react';

interface TimetableEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  timetable: TimetableActivity[];
  onSaveTimetable: (updated: TimetableActivity[]) => void;
}

export const TimetableEditorModal: React.FC<TimetableEditorModalProps> = ({
  isOpen,
  onClose,
  timetable,
  onSaveTimetable,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [items, setItems] = useState<TimetableActivity[]>(timetable);

  // Edit item form state
  const [editTitle, setEditTitle] = useState('');
  const [editRange, setEditRange] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState<TimetableActivity['category']>('office');
  const [editReminder, setEditReminder] = useState(true);

  if (!isOpen) return null;

  const handleStartEdit = (act: TimetableActivity) => {
    setEditingId(act.id);
    setEditTitle(act.title);
    setEditRange(act.timeRange);
    setEditDesc(act.description);
    setEditCategory(act.category);
    setEditReminder(act.reminderEnabled);
    soundFx.playClick();
  };

  const handleSaveEdit = (id: string) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          title: editTitle.trim(),
          timeRange: editRange.trim(),
          description: editDesc.trim(),
          category: editCategory,
          reminderEnabled: editReminder,
        };
      }
      return item;
    });
    setItems(updated);
    onSaveTimetable(updated);
    setEditingId(null);
    soundFx.playClick();
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    onSaveTimetable(updated);
    soundFx.playClick();
  };

  const handleAddNewItem = () => {
    const newItem: TimetableActivity = {
      id: `act-${Date.now()}`,
      title: 'New Routine Block',
      timeRange: '12:00 PM - 1:00 PM',
      startTime: '12:00',
      category: 'custom',
      description: 'Scheduled focus or recovery routine',
      reminderEnabled: true,
      daysOfWeek: [1, 2, 3, 4, 5],
      completedDates: [],
    };
    const updated = [...items, newItem];
    setItems(updated);
    onSaveTimetable(updated);
    handleStartEdit(newItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-sky-500/40 bg-[#0d111a] p-5 shadow-neon-cyan max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="font-orbitron text-sm font-bold text-white tracking-wider">
                DAILY TIMETABLE &amp; OFFICE HOURS
              </h3>
              <p className="text-[10px] text-slate-400 font-rajdhani">
                Structured around 10:00 AM – 7:00 PM Office Schedule
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of routine blocks */}
        <div className="space-y-2.5 mb-4">
          {items.map((act) => {
            const isEditing = editingId === act.id;

            return (
              <div
                key={act.id}
                className="rounded-xl border border-slate-800 bg-[#07090e] p-3 text-xs"
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-rajdhani">Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-white text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-rajdhani">Time Range</label>
                        <input
                          type="text"
                          value={editRange}
                          onChange={(e) => setEditRange(e.target.value)}
                          placeholder="e.g. 10:00 AM - 7:00 PM"
                          className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-rajdhani">Category</label>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value as TimetableActivity['category'])}
                          className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-white text-xs"
                        >
                          <option value="morning">Morning</option>
                          <option value="office">Office Hours</option>
                          <option value="fitness">Fitness</option>
                          <option value="study">Study</option>
                          <option value="night">Night</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-rajdhani">Description</label>
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-white text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 text-[11px]">
                        <input
                          type="checkbox"
                          checked={editReminder}
                          onChange={(e) => setEditReminder(e.target.checked)}
                          className="rounded border-slate-700 bg-slate-800 text-sky-500"
                        />
                        <span>Enable Local Reminder</span>
                      </label>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveEdit(act.id)}
                          className="px-3 py-1 rounded bg-sky-600 text-white font-orbitron text-[10px] font-bold flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 rounded bg-slate-800 text-slate-300 font-orbitron text-[10px]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-orbitron font-semibold text-sky-400 text-[11px]">
                          {act.timeRange}
                        </span>
                        {act.category === 'office' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded border border-sky-500/40 bg-sky-900/40 text-sky-300 font-rajdhani uppercase font-bold">
                            Office Window
                          </span>
                        )}
                        {act.reminderEnabled ? (
                          <Bell className="w-3 h-3 text-cyan-400" />
                        ) : (
                          <BellOff className="w-3 h-3 text-slate-600" />
                        )}
                      </div>
                      <h4 className="mt-1 font-bold text-slate-200">{act.title}</h4>
                      <p className="mt-0.5 text-[11px] text-slate-400 font-rajdhani">
                        {act.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(act)}
                        className="p-1 text-slate-500 hover:text-sky-400 transition"
                        title="Edit activity"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(act.id)}
                        className="p-1 text-slate-500 hover:text-red-400 transition"
                        title="Delete activity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={handleAddNewItem}
          className="w-full py-2.5 rounded-xl border border-dashed border-sky-500/40 bg-sky-950/20 text-sky-300 text-xs font-orbitron font-bold flex items-center justify-center gap-2 hover:bg-sky-900/30 transition mb-3"
        >
          <Plus className="w-4 h-4" />
          <span>ADD ACTIVITY BLOCK</span>
        </button>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 text-xs font-bold font-orbitron text-white hover:bg-slate-700 transition"
        >
          CLOSE TIMETABLE
        </button>
      </div>
    </div>
  );
};
