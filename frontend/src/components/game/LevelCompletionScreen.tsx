import React from 'react';
import { PixelButton } from '@/components/PixelButton';
import { PixelCard } from '@/components/PixelCard';
import { Trophy, RotateCcw, ChevronRight } from 'lucide-react';

interface LevelCompletionScreenProps {
  score: number;
  attempts: number;
  levelName: string;
  onNextLevel?: () => void;
  onRetry: () => void;
  onBack: () => void;
  hasNextLevel: boolean;
}

export function LevelCompletionScreen({
  score,
  attempts,
  levelName,
  onNextLevel,
  onRetry,
  onBack,
  hasNextLevel,
}: LevelCompletionScreenProps) {
  return (
    <div className="fixed inset-0 bg-background/90 flex items-center justify-center z-50 p-4">
      <PixelCard variant="neon" className="max-w-md w-full p-8 text-center space-y-6">
        <div className="flex justify-center">
          <Trophy size={48} className="text-neon-yellow animate-pixel-bounce" />
        </div>
        <div>
          <h2 className="text-neon-green font-pixel text-sm mb-2">LEVEL COMPLETE!</h2>
          <p className="text-muted-foreground font-pixel text-[8px]">{levelName}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="pixel-card text-center">
            <div className="text-neon-orange font-pixel text-lg">{score.toLocaleString()}</div>
            <div className="text-muted-foreground font-pixel text-[8px] mt-1">SCORE</div>
          </div>
          <div className="pixel-card text-center">
            <div className="text-neon-pink font-pixel text-lg">{attempts}</div>
            <div className="text-muted-foreground font-pixel text-[8px] mt-1">ATTEMPTS</div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {hasNextLevel && onNextLevel && (
            <PixelButton variant="green" size="md" onClick={onNextLevel} className="w-full flex items-center justify-center gap-2">
              <span>NEXT LEVEL</span>
              <ChevronRight size={12} />
            </PixelButton>
          )}
          <PixelButton variant="orange" size="md" onClick={onRetry} className="w-full flex items-center justify-center gap-2">
            <RotateCcw size={12} />
            <span>RETRY</span>
          </PixelButton>
          <PixelButton variant="pink" size="md" onClick={onBack} className="w-full">
            BACK TO LEVELS
          </PixelButton>
        </div>
      </PixelCard>
    </div>
  );
}
