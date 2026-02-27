import React from 'react';
import { cn } from '@/lib/utils';

interface PixelCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'neon' | 'orange' | 'pink';
  onClick?: () => void;
}

export function PixelCard({ children, className, variant = 'default', onClick }: PixelCardProps) {
  const variantClass = {
    default: 'pixel-card',
    neon: 'pixel-card pixel-card-neon',
    orange: 'pixel-card border-[3px] border-neon-orange shadow-[4px_4px_0px_rgba(0,0,0,0.8),0_0_10px_rgba(255,107,53,0.2)]',
    pink: 'pixel-card border-[3px] border-neon-pink shadow-[4px_4px_0px_rgba(0,0,0,0.8),0_0_10px_rgba(255,0,255,0.2)]',
  }[variant];

  return (
    <div
      className={cn(variantClass, onClick && 'cursor-pointer hover:brightness-110 transition-all', className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
