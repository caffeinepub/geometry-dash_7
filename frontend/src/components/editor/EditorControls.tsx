import React, { useState } from 'react';
import { PixelButton } from '@/components/PixelButton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Undo2, Redo2, Play, Upload, Trash2 } from 'lucide-react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { usePublishLevel } from '@/hooks/useQueries';
import type { TileType } from '@/data/prebuiltLevels';

interface EditorControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onPlayTest: () => void;
  onClear: () => void;
  isPlayTesting: boolean;
  grid: TileType[][];
}

export function EditorControls({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onPlayTest,
  onClear,
  isPlayTesting,
  grid,
}: EditorControlsProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [publishOpen, setPublishOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const publishLevel = usePublishLevel();
  const [publishSuccess, setPublishSuccess] = useState(false);

  const handlePublishClick = () => {
    if (!isAuthenticated) {
      setLoginPromptOpen(true);
    } else {
      setPublishOpen(true);
    }
  };

  const handlePublish = async () => {
    const trimmed = title.trim();
    if (!trimmed || trimmed.length < 2) {
      setTitleError('Title must be at least 2 characters');
      return;
    }
    setTitleError('');
    try {
      const tileData = JSON.stringify(grid);
      await publishLevel.mutateAsync({ title: trimmed, tileData });
      setPublishSuccess(true);
    } catch {
      setTitleError('Failed to publish. Please try again.');
    }
  };

  const handlePublishClose = () => {
    setPublishOpen(false);
    setTitle('');
    setTitleError('');
    setPublishSuccess(false);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 p-3 bg-secondary border-b-4 border-border">
        <PixelButton
          variant="default"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          className="flex items-center gap-1"
        >
          <Undo2 size={10} />
          <span>UNDO</span>
        </PixelButton>
        <PixelButton
          variant="default"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          className="flex items-center gap-1"
        >
          <Redo2 size={10} />
          <span>REDO</span>
        </PixelButton>
        <div className="w-px h-6 bg-border mx-1" />
        <PixelButton
          variant="orange"
          size="sm"
          onClick={onPlayTest}
          className="flex items-center gap-1"
        >
          <Play size={10} />
          <span>{isPlayTesting ? 'STOP TEST' : 'PLAY TEST'}</span>
        </PixelButton>
        <PixelButton
          variant="green"
          size="sm"
          onClick={handlePublishClick}
          className="flex items-center gap-1"
        >
          <Upload size={10} />
          <span>PUBLISH</span>
        </PixelButton>
        <PixelButton
          variant="red"
          size="sm"
          onClick={onClear}
          className="flex items-center gap-1 ml-auto"
        >
          <Trash2 size={10} />
          <span>CLEAR</span>
        </PixelButton>
      </div>

      {/* Publish Dialog */}
      <Dialog open={publishOpen} onOpenChange={handlePublishClose}>
        <DialogContent className="bg-background border-4 border-neon-green shadow-[8px_8px_0px_rgba(0,0,0,0.8)] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-neon-green text-[12px] font-pixel">PUBLISH LEVEL</DialogTitle>
            <DialogDescription className="text-muted-foreground text-[8px] font-pixel">
              Share your level with the community!
            </DialogDescription>
          </DialogHeader>
          {publishSuccess ? (
            <div className="text-center py-4 space-y-3">
              <p className="text-neon-green font-pixel text-[10px]">LEVEL PUBLISHED!</p>
              <p className="text-muted-foreground font-pixel text-[8px]">Your level is now live in the community hub.</p>
              <PixelButton variant="green" size="sm" onClick={handlePublishClose}>CLOSE</PixelButton>
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label className="text-[8px] font-pixel">LEVEL TITLE</Label>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="My Awesome Level"
                  maxLength={40}
                  className="bg-secondary border-2 border-border font-pixel text-[10px] h-10"
                />
                {titleError && <p className="text-destructive text-[8px] font-pixel">{titleError}</p>}
              </div>
              <PixelButton
                variant="green"
                size="md"
                onClick={handlePublish}
                disabled={publishLevel.isPending}
                className="w-full"
              >
                {publishLevel.isPending ? 'PUBLISHING...' : 'PUBLISH'}
              </PixelButton>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Login Prompt */}
      <Dialog open={loginPromptOpen} onOpenChange={() => setLoginPromptOpen(false)}>
        <DialogContent className="bg-background border-4 border-neon-orange shadow-[8px_8px_0px_rgba(0,0,0,0.8)] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-neon-orange text-[12px] font-pixel">LOGIN REQUIRED</DialogTitle>
            <DialogDescription className="text-muted-foreground text-[8px] font-pixel">
              You need to be logged in to publish levels.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-2">
            <p className="text-muted-foreground font-pixel text-[8px] mb-4">
              Use the LOGIN button in the header to sign in with Internet Identity.
            </p>
            <PixelButton variant="orange" size="sm" onClick={() => setLoginPromptOpen(false)}>
              OK
            </PixelButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
