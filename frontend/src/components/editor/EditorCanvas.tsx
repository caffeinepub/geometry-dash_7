import React, { useRef, useEffect, useCallback, useState } from 'react';
import { type TileType } from '@/data/prebuiltLevels';

const TILE_SIZE = 40;
const ROWS = 10;

const TILE_COLORS: Record<number, string> = {
  0: 'transparent',
  1: '#2a6a2a',
  2: '#ff4444',
  3: '#ffaa00',
  4: '#4466aa',
  5: '#664466',
};

interface EditorCanvasProps {
  grid: TileType[][];
  selectedTile: TileType;
  onGridChange: (newGrid: TileType[][]) => void;
  cols: number;
}

export function EditorCanvas({ grid, selectedTile, onGridChange, cols }: EditorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const [scrollX, setScrollX] = useState(0);

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = '#ffffff11';
    ctx.lineWidth = 1;
    for (let c = 0; c <= cols; c++) {
      const x = c * TILE_SIZE - scrollX;
      if (x < -TILE_SIZE || x > canvas.width + TILE_SIZE) continue;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * TILE_SIZE);
      ctx.lineTo(canvas.width, r * TILE_SIZE);
      ctx.stroke();
    }

    // Tiles
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < cols; c++) {
        const tile = grid[r]?.[c];
        // Skip empty tiles (value 0)
        if (tile === undefined || (tile as number) === 0) continue;
        const x = c * TILE_SIZE - scrollX;
        if (x < -TILE_SIZE || x > canvas.width + TILE_SIZE) continue;
        const y = r * TILE_SIZE;
        const color = TILE_COLORS[tile as number] || '#888';

        if (tile === 2) {
          // Spike
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(x + TILE_SIZE / 2, y + 2);
          ctx.lineTo(x + TILE_SIZE - 2, y + TILE_SIZE - 2);
          ctx.lineTo(x + 2, y + TILE_SIZE - 2);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#ff8888';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (tile === 3) {
          // Jump pad
          ctx.fillStyle = color;
          ctx.fillRect(x + 2, y + TILE_SIZE / 2, TILE_SIZE - 4, TILE_SIZE / 2 - 2);
          ctx.beginPath();
          ctx.moveTo(x + TILE_SIZE / 2, y + 2);
          ctx.lineTo(x + TILE_SIZE - 4, y + TILE_SIZE / 2);
          ctx.lineTo(x + 4, y + TILE_SIZE / 2);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = color;
          ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
          ctx.strokeStyle = '#ffffff22';
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
        }
      }
    }

    // Row labels
    ctx.fillStyle = '#ffffff33';
    ctx.font = '8px monospace';
    for (let r = 0; r < ROWS; r++) {
      ctx.fillText(`${r}`, 2, r * TILE_SIZE + 12);
    }
  }, [grid, cols, scrollX]);

  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  const getGridPos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX + scrollX;
    const y = (e.clientY - rect.top) * scaleY;
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    if (row < 0 || row >= ROWS || col < 0 || col >= cols) return null;
    return { row, col };
  }, [scrollX, cols]);

  const placeTile = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getGridPos(e);
    if (!pos) return;
    const newGrid = grid.map(row => [...row]);
    newGrid[pos.row][pos.col] = selectedTile;
    onGridChange(newGrid);
  }, [getGridPos, grid, selectedTile, onGridChange]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    placeTile(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    placeTile(e);
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
  };

  const handleScroll = (e: React.WheelEvent) => {
    const maxScroll = Math.max(0, cols * TILE_SIZE - (canvasRef.current?.width ?? 800));
    setScrollX(prev => Math.max(0, Math.min(maxScroll, prev + e.deltaX + e.deltaY)));
  };

  const canvasWidth = 800;
  const canvasHeight = ROWS * TILE_SIZE;

  return (
    <div ref={containerRef} className="relative overflow-hidden border-4 border-border">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="w-full cursor-crosshair block"
        style={{ imageRendering: 'pixelated', maxHeight: '60vh' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleScroll}
      />
      <div className="absolute bottom-2 right-2 text-[8px] font-pixel text-muted-foreground">
        SCROLL TO PAN
      </div>
    </div>
  );
}
