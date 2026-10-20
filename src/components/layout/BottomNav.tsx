import React from 'react';
import { ActiveTab } from '../../types';
import { Home, CheckSquare, Dumbbell, BookOpen, Shield } from 'lucide-react';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  pendingQuestsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  pendingQuestsCount = 0,
}) => {
  const tabs = [
    { id: 'home' as ActiveTab, label: 'Status', icon: Home },
    { id: 'quests' as ActiveTab, label: 'Quests', icon: CheckSquare, badge: pendingQuestsCount },
    { id: 'training' as ActiveTab, label: 'Push-Ups', icon: Dumbbell },
    { id: 'study' as ActiveTab, label: 'Study', icon: BookOpen },
    { id: 'vault' as ActiveTab, label: 'Vault', icon: Shield },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/80 bg-[#07090e]/95 backdrop-blur-lg safe-bottom">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex min-w-[56px] min-h-[48px] flex-col items-center justify-center rounded-xl px-2 py-1 transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-500 px-1 text-[9px] font-bold text-black font-orbitron">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                ) : null}
              </div>

              <span
                className={`mt-1 text-[10px] font-rajdhani font-semibold tracking-wider transition-colors ${
                  isActive ? 'text-cyan-300 font-bold' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>

              {/* Active neon dot */}
              {isActive && (
                <span className="absolute -bottom-0.5 h-1 w-6 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
