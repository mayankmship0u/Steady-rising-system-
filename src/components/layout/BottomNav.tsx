import React from 'react';
import { ActiveTab } from '../../types';
import { Home, CheckSquare, Dumbbell, BookOpen, Shield, GraduationCap } from 'lucide-react';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  pendingQuestsCount?: number;
  dailyTestSlotPending?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  pendingQuestsCount = 0,
  dailyTestSlotPending = false,
}) => {
  const tabs = [
    { id: 'home' as ActiveTab, label: 'Status', icon: Home },
    { id: 'quests' as ActiveTab, label: 'Quests', icon: CheckSquare, badge: pendingQuestsCount },
    { id: 'tests' as ActiveTab, label: 'Tests', icon: GraduationCap, hasDot: dailyTestSlotPending },
    { id: 'training' as ActiveTab, label: 'Push-Ups', icon: Dumbbell },
    { id: 'study' as ActiveTab, label: 'Study', icon: BookOpen },
    { id: 'vault' as ActiveTab, label: 'Vault', icon: Shield },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/80 bg-[#07090e]/95 backdrop-blur-lg safe-bottom">
      <div className="mx-auto flex max-w-md items-center justify-around px-1 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex min-w-[46px] min-h-[46px] flex-col items-center justify-center rounded-xl px-1 py-1 transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4.5 h-4.5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-cyan-500 px-1 text-[8px] font-bold text-black font-orbitron">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                ) : null}
                {tab.hasDot ? (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]" />
                ) : null}
              </div>

              <span
                className={`mt-1 text-[9px] font-rajdhani font-semibold tracking-wider transition-colors ${
                  isActive ? 'text-cyan-300 font-bold' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>

              {/* Active neon dot */}
              {isActive && (
                <span className="absolute -bottom-0.5 h-0.5 w-5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
