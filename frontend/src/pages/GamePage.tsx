import React, { useState, useCallback, useEffect } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { GameEngine } from '@/components/game/GameEngine';
import { LevelCompletionScreen } from '@/components/game/LevelCompletionScreen';
import { RatingDialog } from '@/components/community/RatingDialog';
import { PREBUILT_LEVELS, getLevelById } from '@/data/prebuiltLevels';
import { useGetCommunityLevel, useSubmitScore, useIncrementPlayCount, useSaveCallerUserProfile, useGetCallerUserProfile } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { PixelButton } from '@/components/PixelButton';
import { ArrowLeft } from 'lucide-react';

interface GamePageSearch {
  levelId: string;
  type: 'prebuilt' | 'community';
}

const DEFAULT_THEME = {
  primary: '#39ff14',
  secondary: '#00ff88',
  bg1: '#0a1628',
  bg2: '#0d2040',
  ground: '#1a4a1a',
  spike: '#ff4444',
  jumpPad: '#ffaa00',
};

export function GamePage() {
  const search = useSearch({ from: '/play' }) as GamePageSearch;
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const levelId = search.levelId;
  const levelType = search.type ?? 'prebuilt';

  const communityLevelId = levelType === 'community' ? BigInt(levelId) : undefined;
  const { data: communityLevel } = useGetCommunityLevel(communityLevelId);

  const submitScore = useSubmitScore();
  const incrementPlayCount = useIncrementPlayCount();
  const saveProfile = useSaveCallerUserProfile();
  const { data: profile } = useGetCallerUserProfile();

  const [completed, setCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalAttempts, setFinalAttempts] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [key, setKey] = useState(0);

  const prebuiltLevel = levelType === 'prebuilt' ? getLevelById(Number(levelId)) : undefined;

  const tileData = prebuiltLevel?.tileData ?? communityLevel?.tileData ?? '[]';
  const speed = prebuiltLevel?.speed ?? 300;
  const colorTheme = prebuiltLevel?.colorTheme ?? DEFAULT_THEME;
  const levelName = prebuiltLevel?.name ?? communityLevel?.title ?? 'CUSTOM LEVEL';

  // Increment play count for community levels
  useEffect(() => {
    if (levelType === 'community' && communityLevel && isAuthenticated) {
      incrementPlayCount.mutate(BigInt(levelId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityLevel?.id]);

  const handleComplete = useCallback(async (score: number, attempts: number) => {
    setFinalScore(score);
    setFinalAttempts(attempts);
    setCompleted(true);

    if (isAuthenticated) {
      const numericLevelId = levelType === 'prebuilt'
        ? BigInt(Math.abs(Number(levelId)))
        : BigInt(levelId);
      try {
        await submitScore.mutateAsync({ levelId: numericLevelId, score: BigInt(score) });
      } catch { /* ignore */ }

      if (profile) {
        const levelNumId = Number(levelId);
        const existingScores = new Map(profile.bestScoresPerLevel.map(([id, s]) => [Number(id), Number(s)]));
        const currentBest = existingScores.get(levelNumId) ?? 0;
        if (score > currentBest) {
          existingScores.set(levelNumId, score);
        }
        const unlockedSet = new Set(profile.unlockedLevels.map(n => Number(n)));
        if (levelType === 'prebuilt') {
          const idx = PREBUILT_LEVELS.findIndex(l => l.id === Number(levelId));
          if (idx >= 0 && idx + 1 < PREBUILT_LEVELS.length) {
            unlockedSet.add(idx + 1);
          }
        }
        try {
          await saveProfile.mutateAsync({
            username: profile.username,
            bestScoresPerLevel: Array.from(existingScores.entries()).map(([id, s]) => [BigInt(id), BigInt(s)]),
            unlockedLevels: Array.from(unlockedSet).map(n => BigInt(n)),
          });
        } catch { /* ignore */ }
      }

      if (levelType === 'community') {
        setShowRating(true);
      }
    }
  }, [isAuthenticated, levelId, levelType, profile, submitScore, saveProfile]);

  const handleDeath = useCallback(async (_attempts: number) => {
    // Optionally save attempt data here
  }, []);

  const handleRetry = () => {
    setCompleted(false);
    setKey(prev => prev + 1);
  };

  const handleNextLevel = () => {
    if (levelType === 'prebuilt') {
      const idx = PREBUILT_LEVELS.findIndex(l => l.id === Number(levelId));
      if (idx >= 0 && idx + 1 < PREBUILT_LEVELS.length) {
        const nextLevel = PREBUILT_LEVELS[idx + 1];
        setCompleted(false);
        setKey(prev => prev + 1);
        navigate({ to: '/play', search: { levelId: String(nextLevel.id), type: 'prebuilt' } });
      }
    }
  };

  const hasNextLevel = levelType === 'prebuilt' && (() => {
    const idx = PREBUILT_LEVELS.findIndex(l => l.id === Number(levelId));
    return idx >= 0 && idx + 1 < PREBUILT_LEVELS.length;
  })();

  if (levelType === 'community' && !communityLevel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-neon-green font-pixel text-[10px] animate-pixel-pulse">LOADING LEVEL...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4 mb-4">
          <PixelButton
            variant="default"
            size="sm"
            onClick={() => navigate({ to: levelType === 'community' ? '/community' : '/levels' })}
            className="flex items-center gap-1"
          >
            <ArrowLeft size={10} />
            <span>BACK</span>
          </PixelButton>
          <h1 className="text-neon-green font-pixel text-[10px]">{levelName}</h1>
        </div>

        <GameEngine
          key={key}
          tileData={tileData}
          speed={speed}
          colorTheme={colorTheme}
          onComplete={handleComplete}
          onDeath={handleDeath}
          levelName={levelName}
        />

        <div className="mt-4 pixel-card text-[8px] font-pixel text-muted-foreground text-center">
          PRESS <span className="text-neon-green">SPACE</span> OR <span className="text-neon-green">CLICK</span> TO JUMP
        </div>
      </div>

      {completed && (
        <LevelCompletionScreen
          score={finalScore}
          attempts={finalAttempts}
          levelName={levelName}
          onNextLevel={hasNextLevel ? handleNextLevel : undefined}
          onRetry={handleRetry}
          onBack={() => navigate({ to: levelType === 'community' ? '/community' : '/levels' })}
          hasNextLevel={hasNextLevel}
        />
      )}

      {showRating && communityLevel && (
        <RatingDialog
          open={showRating}
          onClose={() => setShowRating(false)}
          levelId={communityLevel.id}
          levelTitle={communityLevel.title}
        />
      )}
    </main>
  );
}
