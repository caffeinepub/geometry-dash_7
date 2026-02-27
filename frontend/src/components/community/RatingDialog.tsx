import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { PixelButton } from '@/components/PixelButton';
import { useRateLevel } from '@/hooks/useQueries';
import { Star } from 'lucide-react';

interface RatingDialogProps {
  open: boolean;
  onClose: () => void;
  levelId: bigint;
  levelTitle: string;
}

export function RatingDialog({ open, onClose, levelId, levelTitle }: RatingDialogProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const rateLevel = useRateLevel();

  const handleSubmit = async () => {
    if (rating === 0) return;
    try {
      await rateLevel.mutateAsync({ levelId, rating: BigInt(rating) });
      setSubmitted(true);
    } catch {
      // ignore
    }
  };

  const handleClose = () => {
    setRating(0);
    setHovered(0);
    setSubmitted(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-background border-4 border-neon-pink shadow-[8px_8px_0px_rgba(0,0,0,0.8),0_0_20px_rgba(255,0,255,0.3)] max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-neon-pink text-[12px] font-pixel text-center">
            RATE THIS LEVEL
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-[8px] font-pixel text-center">
            {levelTitle}
          </DialogDescription>
        </DialogHeader>
        {submitted ? (
          <div className="text-center py-4">
            <p className="text-neon-green font-pixel text-[10px]">THANKS FOR RATING!</p>
            <PixelButton variant="green" size="sm" onClick={handleClose} className="mt-4">
              CLOSE
            </PixelButton>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={28}
                    className={`transition-colors ${
                      star <= (hovered || rating)
                        ? 'text-neon-yellow fill-neon-yellow'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <PixelButton
                variant="pink"
                size="sm"
                onClick={handleSubmit}
                disabled={rating === 0 || rateLevel.isPending}
                className="flex-1"
              >
                {rateLevel.isPending ? 'SAVING...' : 'SUBMIT'}
              </PixelButton>
              <PixelButton variant="default" size="sm" onClick={handleClose} className="flex-1">
                SKIP
              </PixelButton>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
