import React, { useState } from 'react';
import { useGetLeaderboardEntries, useGetAllCommunityLevels, useGetCallerUserProfile } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { PREBUILT_LEVELS } from '@/data/prebuiltLevels';
import { PixelCard } from '@/components/PixelCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Crown, Medal } from 'lucide-react';
import type { LeaderboardEntry } from '../backend';

interface LevelOption {
  id: bigint;
  name: string;
  type: 'prebuilt' | 'community';
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  const date = new Date(ms);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown size={14} className="text-neon-yellow" />;
  if (rank === 2) return <Medal size={14} className="text-muted-foreground" />;
  if (rank === 3) return <Medal size={14} className="text-neon-orange" />;
  return <span className="text-[10px] font-pixel text-muted-foreground w-4 text-center">{rank}</span>;
}

function LeaderboardRow({
  entry,
  rank,
  isCurrentUser,
}: {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser: boolean;
}) {
  const principal = entry.player.toString();
  const shortPrincipal = principal.slice(0, 8) + '...' + principal.slice(-4);

  return (
    <div
      className={`flex items-center gap-3 p-3 border-2 transition-all ${
        isCurrentUser
          ? 'border-neon-green bg-neon-green/10 shadow-[0_0_8px_rgba(57,255,20,0.3)]'
          : 'border-border bg-secondary hover:border-border/80'
      }`}
    >
      <div className="w-6 flex justify-center shrink-0">
        <RankIcon rank={rank} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-pixel text-[8px] text-foreground truncate">
          {isCurrentUser ? '★ YOU' : shortPrincipal}
        </div>
        <div className="font-pixel text-[6px] text-muted-foreground mt-0.5">
          {formatTimestamp(entry.timestamp)}
        </div>
      </div>
      <div className="font-pixel text-[10px] text-neon-orange shrink-0">
        {Number(entry.score).toLocaleString()}
      </div>
    </div>
  );
}

function LeaderboardPanel({ levelId, currentPrincipal }: { levelId: bigint; currentPrincipal?: string }) {
  const { data: entries, isLoading } = useGetLeaderboardEntries(levelId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground font-pixel text-[8px]">NO SCORES YET</p>
        <p className="text-muted-foreground font-pixel text-[7px] mt-2">BE THE FIRST TO COMPLETE THIS LEVEL!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry, idx) => (
        <LeaderboardRow
          key={entry.player.toString() + idx}
          entry={entry}
          rank={idx + 1}
          isCurrentUser={!!currentPrincipal && entry.player.toString() === currentPrincipal}
        />
      ))}
    </div>
  );
}

export function LeaderboardPage() {
  const { identity } = useInternetIdentity();
  const currentPrincipal = identity?.getPrincipal().toString();
  const { data: communityLevels } = useGetAllCommunityLevels();

  const levelOptions: LevelOption[] = [
    ...PREBUILT_LEVELS.map(l => ({
      id: BigInt(Math.abs(l.id)),
      name: l.name,
      type: 'prebuilt' as const,
    })),
    ...(communityLevels ?? []).map(l => ({
      id: l.id,
      name: l.title,
      type: 'community' as const,
    })),
  ];

  const [selectedIdx, setSelectedIdx] = useState(0);
  const selectedLevel = levelOptions[selectedIdx];

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Trophy size={40} className="text-neon-yellow animate-pixel-bounce" />
          </div>
          <h1 className="text-neon-yellow font-pixel text-xl mb-2" style={{ textShadow: '0 0 20px rgba(255,220,0,0.6)' }}>
            LEADERBOARD
          </h1>
          <p className="text-muted-foreground font-pixel text-[8px]">TOP 10 SCORES PER LEVEL</p>
        </div>

        {/* Level selector */}
        <div className="mb-6">
          <div className="text-[8px] font-pixel text-muted-foreground mb-2">SELECT LEVEL</div>
          <div className="flex flex-wrap gap-2">
            {levelOptions.map((level, idx) => (
              <button
                key={level.id.toString() + level.type}
                onClick={() => setSelectedIdx(idx)}
                className={`px-3 py-1 text-[8px] font-pixel border-2 transition-all ${
                  selectedIdx === idx
                    ? 'border-neon-yellow text-neon-yellow bg-neon-yellow/10'
                    : 'border-border text-muted-foreground hover:border-neon-yellow/50'
                }`}
              >
                {level.type === 'community' ? '★ ' : ''}{level.name}
              </button>
            ))}
          </div>
        </div>

        {selectedLevel ? (
          <PixelCard variant="default" className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={14} className="text-neon-yellow" />
              <h2 className="font-pixel text-[10px] text-foreground">{selectedLevel.name}</h2>
              {selectedLevel.type === 'community' && (
                <span className="text-[7px] font-pixel text-neon-pink border border-neon-pink px-1">COMMUNITY</span>
              )}
            </div>
            <LeaderboardPanel
              levelId={selectedLevel.id}
              currentPrincipal={currentPrincipal}
            />
          </PixelCard>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground font-pixel text-[8px]">SELECT A LEVEL TO VIEW SCORES</p>
          </div>
        )}
      </div>
    </main>
  );
}
