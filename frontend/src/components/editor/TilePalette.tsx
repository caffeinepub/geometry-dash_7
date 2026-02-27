import React from 'react';
import { type TileType } from '@/data/prebuiltLevels';

interface TilePaletteProps {
  selectedTile: TileType;
  onSelectTile: (tile: TileType) => void;
}

const TILE_DEFS: Array<{ type: TileType; label: string; color: string; shape: 'rect' | 'triangle' | 'pad' | 'deco' | 'ceil' }> = [
  { type: 0, label: 'ERASE', color: '#333', shape: 'rect' },
  { type: 1, label: 'GROUND', color: '#2a6a2a', shape: 'rect' },
  { type: 2, label: 'SPIKE', color: '#ff4444', shape: 'triangle' },
  { type: 3, label: 'JUMP PAD', color: '#ffaa00', shape: 'pad' },
  { type: 4, label: 'DECO', color: '#4466aa', shape: 'deco' },
  { type: 5, label: 'CEILING', color: '#664466', shape: 'ceil' },
];

function TilePreview({ color, shape }: { color: string; shape: string }) {
  if (shape === 'triangle') {
    return (
      <svg width="32" height="32" viewBox="0 0 32 32">
        <polygon points="16,2 30,30 2,30" fill={color} stroke="#fff" strokeWidth="1" />
      </svg>
    );
  }
  if (shape === 'pad') {
    return (
      <svg width="32" height="32" viewBox="0 0 32 32">
        <rect x="2" y="20" width="28" height="10" fill={color} stroke="#fff" strokeWidth="1" />
        <polygon points="16,2 26,20 6,20" fill={color} stroke="#fff" strokeWidth="1" />
      </svg>
    );
  }
  if (shape === 'deco') {
    return (
      <svg width="32" height="32" viewBox="0 0 32 32">
        <rect x="2" y="2" width="28" height="28" fill={color} stroke="#fff" strokeWidth="1" />
        <line x1="2" y1="2" x2="30" y2="30" stroke="#fff" strokeWidth="1" />
        <line x1="30" y1="2" x2="2" y2="30" stroke="#fff" strokeWidth="1" />
      </svg>
    );
  }
  if (shape === 'ceil') {
    return (
      <svg width="32" height="32" viewBox="0 0 32 32">
        <rect x="2" y="2" width="28" height="28" fill={color} stroke="#fff" strokeWidth="1" />
        <rect x="6" y="6" width="20" height="8" fill="#fff4" />
      </svg>
    );
  }
  // rect (ground or erase)
  return (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <rect x="2" y="2" width="28" height="28" fill={color} stroke="#fff" strokeWidth="1" />
      {shape === 'rect' && color !== '#333' && (
        <>
          <line x1="2" y1="10" x2="30" y2="10" stroke="#fff4" strokeWidth="1" />
          <line x1="10" y1="2" x2="10" y2="30" stroke="#fff4" strokeWidth="1" />
        </>
      )}
    </svg>
  );
}

export function TilePalette({ selectedTile, onSelectTile }: TilePaletteProps) {
  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="text-neon-green font-pixel text-[8px] mb-2 text-center">TILES</div>
      {TILE_DEFS.map(tile => (
        <button
          key={tile.type}
          onClick={() => onSelectTile(tile.type)}
          className={`flex flex-col items-center gap-1 p-2 border-2 transition-all ${
            selectedTile === tile.type
              ? 'border-neon-green bg-neon-green/10 shadow-[0_0_8px_rgba(57,255,20,0.4)]'
              : 'border-border hover:border-neon-green/50 bg-secondary'
          }`}
        >
          <TilePreview color={tile.color} shape={tile.shape} />
          <span className="text-[6px] font-pixel text-muted-foreground">{tile.label}</span>
        </button>
      ))}
    </div>
  );
}
