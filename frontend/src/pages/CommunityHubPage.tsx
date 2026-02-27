import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllCommunityLevels, useDeleteLevel, useGetCallerUserProfile } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { PixelCard } from '@/components/PixelCard';
import { PixelButton } from '@/components/PixelButton';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Play, Trash2, Users, Trophy } from 'lucide-react';
import type { CommunityLevel } from '../backend';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          size={10}
          className={star <= Math.round(rating) ? 'text-neon-yellow fill-neon-yellow' : 'text-muted-foreground'}
        />
      ))}
    </div>
  );
}

function LevelCard({
  level,
  isOwner,
  onPlay,
  onDelete,
}: {
  level: CommunityLevel;
  isOwner: boolean;
  onPlay: () => void;
  onDelete: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PixelCard variant="default" className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-pixel text-[10px] text-foreground leading-relaxed">{level.title}</h3>
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-destructive hover:text-destructive/80 transition-colors shrink-0"
            title="Delete level"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 text-[8px] font-pixel text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users size={10} />
          <span>{Number(level.playCount)}</span>
        </div>
        <div className="flex items-center gap-1">
          <StarRating rating={level.averageRating} />
          <span>({level.ratings.length})</span>
        </div>
      </div>

      <div className="text-[7px] font-pixel text-muted-foreground truncate">
        ID: {level.id.toString()}
      </div>

      <PixelButton
        variant="green"
        size="sm"
        onClick={onPlay}
        className="w-full flex items-center justify-center gap-1"
      >
        <Play size={10} />
        <span>PLAY</span>
      </PixelButton>
    </PixelCard>
  );
}

export function CommunityHubPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: levels, isLoading } = useGetAllCommunityLevels();
  const { data: profile } = useGetCallerUserProfile();
  const deleteLevel = useDeleteLevel();

  const currentPrincipal = identity?.getPrincipal().toString();

  const handlePlay = (level: CommunityLevel) => {
    navigate({ to: '/play', search: { levelId: level.id.toString(), type: 'community' } });
  };

  const handleDelete = async (levelId: bigint) => {
    try {
      await deleteLevel.mutateAsync(levelId);
    } catch { /* ignore */ }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-neon-pink font-pixel text-xl mb-2" style={{ textShadow: '0 0 20px rgba(255,0,255,0.6)' }}>
            COMMUNITY LEVELS
          </h1>
          <p className="text-muted-foreground font-pixel text-[8px]">
            PLAY LEVELS CREATED BY OTHER PLAYERS
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-[8px] font-pixel text-muted-foreground">
            <Trophy size={12} />
            <span>{levels?.length ?? 0} LEVELS PUBLISHED</span>
          </div>
          <PixelButton variant="pink" size="sm" onClick={() => navigate({ to: '/editor' })}>
            + CREATE LEVEL
          </PixelButton>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : !levels || levels.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground font-pixel text-[10px] mb-4">NO LEVELS YET</p>
            <p className="text-muted-foreground font-pixel text-[8px] mb-6">BE THE FIRST TO CREATE ONE!</p>
            <PixelButton variant="pink" size="md" onClick={() => navigate({ to: '/editor' })}>
              CREATE LEVEL
            </PixelButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {levels.map(level => (
              <LevelCard
                key={level.id.toString()}
                level={level}
                isOwner={isAuthenticated && currentPrincipal === level.creator.toString()}
                onPlay={() => handlePlay(level)}
                onDelete={() => handleDelete(level.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
