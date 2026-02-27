import React from 'react';
import { cn } from '@/lib/utils';

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'green' | 'orange' | 'pink' | 'red' | 'cyan' | 'default';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function PixelButton({
  variant = 'green',
  size = 'md',
  className,
  children,
  ...props
}: PixelButtonProps) {
  const variantClass = {
    green: 'pixel-btn',
    orange: 'pixel-btn pixel-btn-orange',
    pink: 'pixel-btn pixel-btn-pink',
    red: 'pixel-btn pixel-btn-red',
    cyan: 'pixel-btn',
    default: 'pixel-btn',
  }[variant];

  const sizeClass = {
    sm: 'text-[8px] px-2 py-1',
    md: 'text-[10px] px-4 py-2',
    lg: 'text-[12px] px-6 py-3',
  }[size];

  return (
    <button
      className={cn(variantClass, sizeClass, className)}
      {...props}
    >
      {children}
    </button>
  );
}
