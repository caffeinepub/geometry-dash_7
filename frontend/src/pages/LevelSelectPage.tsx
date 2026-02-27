import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PREBUILT_LEVELS } from '@/data/prebuiltLevels';
import { useGetCallerUserProfile } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { PixelCard } from '@/components/PixelCard';
import { PixelButton } from '@/components/PixelButton';
import { Lock, Star, Zap, Flame, Skull } from 'lucide-react';

const DIFFICULTY_CONFIG = {
  easy: { label: 'EASY', color: 'text-neon-green', icon: <Star size={10} />, stars: 1 },
  medium: { label: 'MEDIUM', color: 'text-neon-orange', icon: <Zap size={10} />, stars: 2 },
  hard: { label: 'HARD', color: 'text-neon-pink', icon: <Skull size={10} />, stars: 3 },
};

export function LevelSelectPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: profile } = useGetCallerUserProfile();

  const unlockedLevelIds = profile?.unlockedLevels?.map(n => Number(n)) ?? [0];
  const bestScores = new Map(profile?.bestScoresPerLevel?.map(([id, score]) => [Number(id), Number(score)]) ?? []);

  const isLevelUnlocked = (levelIndex: number): boolean => {
    if (!isAuthenticated) return true;
    if (levelIndex === 0) return true;
    const prevLevel = PREBUILT_LEVELS[levelIndex - 1];
    return bestScores.has(prevLevel.id) || unlockedLevelIds.includes(levelIndex);
  };

  const handlePlay = (levelId: number) => {
    navigate({ to: '/play', search: { levelId: String(levelId), type: 'prebuilt' } });
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-neon-green font-pixel text-xl mb-2" style={{ textShadow: '0 0 20px rgba(57,255,20,0.6)' }}>
            SELECT LEVEL
          </h1>
          <p className="text-muted-foreground font-pixel text-[8px]">
            {isAuthenticated ? 'YOUR PROGRESS IS SAVED' : 'LOGIN TO SAVE PROGRESS'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PREBUILT_LEVELS.map((level, index) => {
            const unlocked = isLevelUnlocked(index);
            const bestScore = bestScores.get(level.id);
            const diff = DIFFICULTY_CONFIG[level.difficulty];

            return (
              <div
                key={level.id}
                className={`relative transition-all ${!unlocked ? 'opacity-60' : 'hover:scale-[1.02]'}`}
              >
                <PixelCard
                  variant={level.difficulty === 'easy' ? 'neon' : level.difficulty === 'medium' ? 'orange' : 'pink'}
                  className="p-0 overflow-hidden"
                >
                  {/* Color preview bar */}
                  <div
                    className="h-16 w-full relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${level.colorTheme.bg1}, ${level.colorTheme.bg2})` }}
                  >
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{ background: `radial-gradient(circle at 50% 50%, ${level.colorTheme.primary}, transparent)` }}
                    />
                    <div className="absolute inset-0 scanlines" />
                    <div className="absolute bottom-2 left-3 flex gap-1">
                      {Array.from({ length: diff.stars }).map((_, i) => (
                        <Flame key={i} size={12} style={{ color: level.colorTheme.primary }} />
                      ))}
                    </div>
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                        <Lock size={24} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-pixel text-[10px] text-foreground">{level.name}</h3>
                      <span className={`font-pixel text-[8px] ${diff.color} flex items-center gap-1 mt-1`}>
                        {diff.icon}
                        {diff.label}
                      </span>
                    </div>

                    {isAuthenticated && (
                      <div className="grid grid-cols-2 gap-2 text-[8px] font-pixel">
                        <div className="bg-secondary p-2 text-center">
                          <div className="text-neon-orange">{bestScore?.toLocaleString() ?? '---'}</div>
                          <div className="text-muted-foreground text-[6px] mt-1">BEST</div>
                        </div>
                        <div className="bg-secondary p-2 text-center">
                          <div className="text-neon-cyan">{bestScore ? '✓' : '✗'}</div>
                          <div className="text-muted-foreground text-[6px] mt-1">DONE</div>
                        </div>
                      </div>
                    )}

                    <PixelButton
                      variant={level.difficulty === 'easy' ? 'green' : level.difficulty === 'medium' ? 'orange' : 'pink'}
                      size="sm"
                      className="w-full"
                      disabled={!unlocked}
                      onClick={() => unlocked && handlePlay(level.id)}
                    >
                      {unlocked ? 'PLAY' : 'LOCKED'}
                    </PixelButton>
                  </div>
                </PixelCard>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground font-pixel text-[8px] mb-4">WANT MORE LEVELS?</p>
          <PixelButton variant="pink" size="md" onClick={() => navigate({ to: '/community' })}>
            COMMUNITY LEVELS
          </PixelButton>
        </div>
      </div>
    </main>
  );
}
