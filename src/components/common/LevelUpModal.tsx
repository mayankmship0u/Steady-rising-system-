import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { HunterRank } from '../../types';
import { RankEmblem } from './RankEmblem';
import { getMilestoneTitle } from '../../utils/progression';
import { soundFx } from '../../utils/audio';
import { Sparkles, ArrowRight, X } from 'lucide-react';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  oldLevel: number;
  newLevel: number;
  oldRank: HunterRank;
  newRank: HunterRank;
  milestoneTitle: string;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  oldLevel,
  newLevel,
  oldRank,
  newRank,
  milestoneTitle,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundFx.playLevelUp();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#8b5cf6', '#38bdf8', '#c084fc', '#ffffff'],
        });
      } catch {
        // Fallback if confetti fails
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isRankUp = oldRank !== newRank;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl border border-cyan-500/50 bg-[#0d111a] p-6 text-center shadow-neon-cyan overflow-hidden">
        {/* Atmospheric background glows */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* System Alert Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-400/30 bg-cyan-950/40 text-[11px] font-orbitron tracking-widest text-cyan-400 uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" style={{ animationDuration: '6s' }} />
          System Directive Alert
        </div>

        <h2 className="text-2xl font-black font-orbitron tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-purple-400">
          LEVEL UP!
        </h2>

        <p className="text-xs text-slate-400 mt-1 font-rajdhani uppercase tracking-widest">
          Shadow Capacity Expanded
        </p>

        {/* Level Progression Display */}
        <div className="my-5 p-4 rounded-xl border border-slate-800 bg-[#080b12]/90 flex items-center justify-around">
          <div className="text-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-rajdhani">Previous</span>
            <span className="text-xl font-bold font-orbitron text-slate-400">LV.{oldLevel}</span>
          </div>

          <ArrowRight className="w-5 h-5 text-cyan-400 animate-pulse" />

          <div className="text-center">
            <span className="text-[10px] text-cyan-400 uppercase tracking-wider block font-rajdhani font-semibold">Awakened</span>
            <span className="text-2xl font-black font-orbitron text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]">
              LV.{newLevel}
            </span>
          </div>
        </div>

        {/* Milestone Title */}
        <div className="mb-4">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-rajdhani">Milestone Title</span>
          <span className="text-base font-bold font-orbitron text-purple-300">
            {milestoneTitle || getMilestoneTitle(newLevel)}
          </span>
        </div>

        {/* Rank Upgrade Section if applicable */}
        {isRankUp && (
          <div className="mb-5 p-3 rounded-xl border border-purple-500/40 bg-purple-950/30 flex items-center justify-center gap-4">
            <RankEmblem rank={newRank} size="md" />
            <div className="text-left">
              <span className="text-[10px] text-purple-300 font-semibold uppercase tracking-wider block">Rank Promoted</span>
              <span className="text-sm font-bold font-orbitron text-white">
                {newRank === 'Shadow Master' ? 'Shadow Monarch' : `${newRank}-Rank Hunter`}
              </span>
            </div>
          </div>
        )}

        {/* Confirmation Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl font-orbitron text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black shadow-neon-cyan transition-all duration-200 active:scale-[0.98]"
        >
          Accept Sovereign Power
        </button>
      </div>
    </div>
  );
};
