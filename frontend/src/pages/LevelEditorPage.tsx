import React, { useState, useCallback } from 'react';
import { TilePalette } from '@/components/editor/TilePalette';
import { EditorCanvas } from '@/components/editor/EditorCanvas';
import { EditorControls } from '@/components/editor/EditorControls';
import { GameEngine } from '@/components/game/GameEngine';
import { PixelButton } from '@/components/PixelButton';
import { type TileType } from '@/data/prebuiltLevels';
import { X } from 'lucide-react';

const ROWS = 10;
const COLS = 80;

const DEFAULT_THEME = {
  primary: '#39ff14',
  secondary: '#00ff88',
  bg1: '#0a1628',
  bg2: '#0d2040',
  ground: '#1a4a1a',
  spike: '#ff4444',
  jumpPad: '#ffaa00',
};

function createEmptyGrid(rows: number, cols: number): TileType[][] {
  const grid: TileType[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 0 as TileType)
  );
  for (let c = 0; c < cols; c++) {
    grid[rows - 1][c] = 1;
    grid[rows - 2][c] = 1;
  }
  return grid;
}

export function LevelEditorPage() {
  const [grid, setGrid] = useState<TileType[][]>(() => createEmptyGrid(ROWS, COLS));
  const [selectedTile, setSelectedTile] = useState<TileType>(1);
  const [history, setHistory] = useState<TileType[][][]>([]);
  const [future, setFuture] = useState<TileType[][][]>([]);
  const [isPlayTesting, setIsPlayTesting] = useState(false);
  const [playTestKey, setPlayTestKey] = useState(0);

  const handleGridChange = useCallback((newGrid: TileType[][]) => {
    setHistory(prev => [...prev.slice(-49), grid]);
    setFuture([]);
    setGrid(newGrid);
  }, [grid]);

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setFuture(f => [grid, ...f.slice(0, 49)]);
    setHistory(h => h.slice(0, -1));
    setGrid(prev);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory(h => [...h.slice(-49), grid]);
    setFuture(f => f.slice(1));
    setGrid(next);
  };

  const handleClear = () => {
    setHistory(prev => [...prev.slice(-49), grid]);
    setFuture([]);
    setGrid(createEmptyGrid(ROWS, COLS));
  };

  const handlePlayTest = () => {
    setIsPlayTesting(prev => !prev);
    setPlayTestKey(prev => prev + 1);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="mb-4">
          <h1 className="text-neon-green font-pixel text-sm" style={{ textShadow: '0 0 15px rgba(57,255,20,0.6)' }}>
            LEVEL EDITOR
          </h1>
          <p className="text-muted-foreground font-pixel text-[8px] mt-1">
            DRAW YOUR LEVEL · PLAY TEST · PUBLISH TO COMMUNITY
          </p>
        </div>

        <EditorControls
          canUndo={history.length > 0}
          canRedo={future.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onPlayTest={handlePlayTest}
          onClear={handleClear}
          isPlayTesting={isPlayTesting}
          grid={grid}
        />

        {isPlayTesting ? (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neon-orange font-pixel text-[10px]">▶ PLAY TEST MODE</span>
              <PixelButton variant="red" size="sm" onClick={handlePlayTest} className="flex items-center gap-1">
                <X size={10} />
                <span>STOP</span>
              </PixelButton>
            </div>
            <GameEngine
              key={playTestKey}
              tileData={JSON.stringify(grid)}
              speed={300}
              colorTheme={DEFAULT_THEME}
              onComplete={() => {}}
              levelName="PLAY TEST"
            />
          </div>
        ) : (
          <div className="mt-4 flex gap-4">
            {/* Palette sidebar */}
            <div className="w-24 shrink-0 border-4 border-border bg-secondary overflow-y-auto" style={{ maxHeight: '70vh' }}>
              <TilePalette selectedTile={selectedTile} onSelectTile={setSelectedTile} />
            </div>

            {/* Editor canvas */}
            <div className="flex-1 min-w-0">
              <EditorCanvas
                grid={grid}
                selectedTile={selectedTile}
                onGridChange={handleGridChange}
                cols={COLS}
              />
              <div className="mt-2 text-[8px] font-pixel text-muted-foreground">
                CLICK OR DRAG TO PLACE TILES · SCROLL TO PAN
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
