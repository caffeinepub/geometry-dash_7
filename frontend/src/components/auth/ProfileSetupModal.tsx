import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PixelButton } from '@/components/PixelButton';
import { useSaveCallerUserProfile } from '@/hooks/useQueries';
import type { PlayerProfile } from '../../backend';

interface ProfileSetupModalProps {
  open: boolean;
}

export function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed || trimmed.length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }
    if (trimmed.length > 20) {
      setError('Username must be 20 characters or less');
      return;
    }
    setError('');

    const profile: PlayerProfile = {
      username: trimmed,
      unlockedLevels: [BigInt(0)],
      bestScoresPerLevel: [],
    };

    try {
      await saveProfile.mutateAsync(profile);
    } catch {
      setError('Failed to save profile. Please try again.');
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="bg-background border-4 border-neon-green shadow-[8px_8px_0px_rgba(0,0,0,0.8),0_0_20px_rgba(57,255,20,0.3)] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-neon-green text-sm font-pixel text-center">
            ENTER YOUR NAME
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-[10px] font-pixel text-center mt-2">
            Choose your player name to save progress and appear on leaderboards.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-pixel text-foreground">PLAYER NAME</Label>
            <Input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter name..."
              maxLength={20}
              className="bg-secondary border-2 border-border text-foreground font-pixel text-[10px] h-10"
              autoFocus
            />
            {error && (
              <p className="text-destructive text-[8px] font-pixel">{error}</p>
            )}
          </div>
          <PixelButton
            type="submit"
            variant="green"
            size="md"
            className="w-full"
            disabled={saveProfile.isPending}
          >
            {saveProfile.isPending ? 'SAVING...' : 'START PLAYING'}
          </PixelButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
