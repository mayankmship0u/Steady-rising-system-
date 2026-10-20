import React from 'react';
import { HunterRank } from '../../types';
import { getRankBadgeColor } from '../../utils/progression';

interface RankEmblemProps {
  rank: HunterRank;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

export const RankEmblem: React.FC<RankEmblemProps> = ({ rank, size = 'md', showLabel = false }) => {
  const colors = getRankBadgeColor(rank);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm font-bold',
    lg: 'w-14 h-14 text-lg font-extrabold',
    xl: 'w-20 h-20 text-2xl font-black',
  };

  const displayText = rank === 'Shadow Master' ? 'M' : rank;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative flex items-center justify-center rounded-xl border ${colors.border} ${colors.bg} ${colors.glow} ${sizeClasses[size]} transition-all duration-300`}
        style={{
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        }}
      >
        {/* Inner glow ring */}
        <div className="absolute inset-0.5 rounded-lg border border-white/15 opacity-60 pointer-events-none" />
        
        {/* Core glyph */}
        <span className={`font-orbitron tracking-wider ${colors.text} drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]`}>
          {displayText}
        </span>
      </div>
      {showLabel && (
        <span className={`mt-1.5 text-[10px] font-orbitron tracking-widest uppercase ${colors.text}`}>
          {rank === 'Shadow Master' ? 'Shadow Monarch' : `${rank}-Rank`}
        </span>
      )}
    </div>
  );
};
