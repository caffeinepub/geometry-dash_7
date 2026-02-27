import React, { useEffect, useRef, useCallback, useState } from 'react';
import { parseTileData, type TileType } from '@/data/prebuiltLevels';
import { preloadAllSprites, drawCubeSprite, drawTileSprite } from '@/utils/loadSprites';

const TILE_SIZE = 64;
const ROWS = 10;
const GRAVITY = 0.6;
const JUMP_FORCE = -13;
const CUBE_SIZE = 52;

interface GameEngineProps {
  tileData: string;
  speed: number;
  colorTheme: {
    primary: string;
    secondary: string;
    bg1: string;
    bg2: string;
    ground: string;
    spike: string;
    jumpPad: string;
  };
  onComplete: (score: number, attempts: number) => void;
  onDeath?: (attempts: number) => void;
  levelName?: string;
}

interface GameState {
  running: boolean;
  dead: boolean;
  completed: boolean;
  cubeX: number;
  cubeY: number;
  velY: number;
  onGround: boolean;
  rotation: number;
  cameraX: number;
  attempts: number;
  score: number;
  percentage: number;
  jumpPressed: boolean;
}

export function GameEngine({
  tileData,
  speed,
  colorTheme,
  onComplete,
  onDeath,
  levelName,
}: GameEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>({
    running: false,
    dead: false,
    completed: false,
    cubeX: 120,
    cubeY: 0,
    velY: 0,
    onGround: false,
    rotation: 0,
    cameraX: 0,
    attempts: 0,
    score: 0,
    percentage: 0,
    jumpPressed: false,
  });
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const spritesRef = useRef<{ cube: HTMLImageElement; tiles: HTMLImageElement; bg: HTMLImageElement } | null>(null);
  const tilesRef = useRef<TileType[][]>([]);
  const [uiState, setUiState] = useState({ percentage: 0, attempts: 0, started: false });
  const [spritesLoaded, setSpritesLoaded] = useState(false);

  // Load sprites
  useEffect(() => {
    preloadAllSprites().then(sprites => {
      spritesRef.current = sprites;
      setSpritesLoaded(true);
    });
  }, []);

  // Parse tile data
  useEffect(() => {
    tilesRef.current = parseTileData(tileData);
  }, [tileData]);

  const resetGame = useCallback(() => {
    const gs = gameStateRef.current;
    const groundY = (ROWS - 2) * TILE_SIZE - CUBE_SIZE;
    gs.running = false;
    gs.dead = false;
    gs.completed = false;
    gs.cubeX = 120;
    gs.cubeY = groundY;
    gs.velY = 0;
    gs.onGround = true;
    gs.rotation = 0;
    gs.cameraX = 0;
    gs.score = 0;
    gs.percentage = 0;
    gs.jumpPressed = false;
    setUiState(prev => ({ ...prev, percentage: 0, started: false }));
  }, []);

  const startGame = useCallback(() => {
    const gs = gameStateRef.current;
    gs.running = true;
    gs.attempts += 1;
    setUiState(prev => ({ ...prev, started: true, attempts: gs.attempts }));
  }, []);

  const handleJump = useCallback(() => {
    const gs = gameStateRef.current;
    if (!gs.running) {
      startGame();
      return;
    }
    if (gs.dead || gs.completed) return;
    if (gs.onGround) {
      gs.velY = JUMP_FORCE;
      gs.onGround = false;
    }
  }, [startGame]);

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump]);

  // Draw functions
  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, cameraX: number) => {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, colorTheme.bg1);
    grad.addColorStop(1, colorTheme.bg2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (spritesRef.current?.bg) {
      const bgImg = spritesRef.current.bg;
      const bgW = 1920;
      const bgH = 360;
      const scale = canvas.height / bgH;
      const scaledW = bgW * scale;
      const offset = (cameraX * 0.3) % scaledW;
      ctx.globalAlpha = 0.4;
      ctx.drawImage(bgImg, -offset, 0, scaledW, canvas.height);
      ctx.drawImage(bgImg, scaledW - offset, 0, scaledW, canvas.height);
      ctx.globalAlpha = 1;
    }

    ctx.strokeStyle = colorTheme.primary + '22';
    ctx.lineWidth = 1;
    const gridSize = TILE_SIZE;
    const startX = -(cameraX % gridSize);
    for (let x = startX; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }, [colorTheme]);

  const drawTiles = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, cameraX: number) => {
    const tiles = tilesRef.current;
    if (!tiles.length) return;
    const cols = tiles[0].length;
    const startCol = Math.max(0, Math.floor(cameraX / TILE_SIZE) - 1);
    const endCol = Math.min(cols - 1, Math.ceil((cameraX + canvas.width) / TILE_SIZE) + 1);

    for (let row = 0; row < ROWS; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const tile = tiles[row]?.[col];
        // Skip empty/undefined tiles
        if (tile === undefined || (tile as number) === 0) continue;
        const x = col * TILE_SIZE - cameraX;
        const y = row * TILE_SIZE;

        if (spritesRef.current?.tiles) {
          const frameMap: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 };
          const frame = frameMap[tile as number] ?? 0;
          drawTileSprite(ctx, spritesRef.current.tiles, frame, x, y, TILE_SIZE);
        } else {
          const colors: Record<number, string> = {
            1: colorTheme.ground,
            2: colorTheme.spike,
            3: colorTheme.jumpPad,
            4: colorTheme.secondary + '88',
            5: '#444466',
          };
          ctx.fillStyle = colors[tile as number] || '#888';
          if (tile === 2) {
            ctx.beginPath();
            ctx.moveTo(x + TILE_SIZE / 2, y);
            ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE);
            ctx.lineTo(x, y + TILE_SIZE);
            ctx.closePath();
            ctx.fill();
          } else {
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = colorTheme.primary + '44';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
          }
        }
      }
    }
  }, [colorTheme]);

  const drawCube = useCallback((ctx: CanvasRenderingContext2D, gs: GameState) => {
    const x = gs.cubeX - gs.cameraX;
    const y = gs.cubeY;

    if (spritesRef.current?.cube) {
      let frame: 0 | 1 | 2 | 3 = 0;
      if (gs.dead) frame = 2;
      else if (!gs.onGround) frame = 1;
      drawCubeSprite(ctx, spritesRef.current.cube, frame, x, y, CUBE_SIZE, gs.rotation);
    } else {
      ctx.save();
      ctx.translate(x + CUBE_SIZE / 2, y + CUBE_SIZE / 2);
      ctx.rotate(gs.rotation);
      ctx.fillStyle = gs.dead ? '#ff4444' : colorTheme.primary;
      ctx.fillRect(-CUBE_SIZE / 2, -CUBE_SIZE / 2, CUBE_SIZE, CUBE_SIZE);
      ctx.strokeStyle = '#ffffff44';
      ctx.lineWidth = 3;
      ctx.strokeRect(-CUBE_SIZE / 2, -CUBE_SIZE / 2, CUBE_SIZE, CUBE_SIZE);
      if (!gs.dead) {
        ctx.fillStyle = '#000';
        ctx.fillRect(8, -8, 8, 8);
        ctx.fillRect(20, -8, 8, 8);
      } else {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(6, -10); ctx.lineTo(14, -2);
        ctx.moveTo(14, -10); ctx.lineTo(6, -2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(18, -10); ctx.lineTo(26, -2);
        ctx.moveTo(26, -10); ctx.lineTo(18, -2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }, [colorTheme]);

  const drawHUD = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, gs: GameState) => {
    const barW = canvas.width - 40;
    const barH = 8;
    const barX = 20;
    const barY = canvas.height - 24;

    ctx.fillStyle = '#00000088';
    ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = colorTheme.primary;
    ctx.fillRect(barX, barY, barW * (gs.percentage / 100), barH);

    ctx.fillStyle = '#fff';
    ctx.font = '10px "Press Start 2P"';
    ctx.fillText(`${Math.floor(gs.percentage)}%`, barX, barY - 6);

    ctx.fillStyle = colorTheme.secondary + 'cc';
    ctx.font = '8px "Press Start 2P"';
    ctx.fillText(`ATT: ${gs.attempts}`, canvas.width - 100, 20);

    if (levelName) {
      ctx.fillStyle = colorTheme.primary + 'cc';
      ctx.font = '8px "Press Start 2P"';
      ctx.fillText(levelName, 20, 20);
    }

    if (!gs.running && !gs.dead) {
      ctx.fillStyle = '#00000088';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = colorTheme.primary;
      ctx.font = '14px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillText('CLICK OR PRESS SPACE', canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = '10px "Press Start 2P"';
      ctx.fillStyle = '#aaa';
      ctx.fillText('TO START', canvas.width / 2, canvas.height / 2 + 14);
      ctx.textAlign = 'left';
    }

    if (gs.dead) {
      ctx.fillStyle = '#00000088';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ff4444';
      ctx.font = '16px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillText('YOU DIED', canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = '8px "Press Start 2P"';
      ctx.fillStyle = '#aaa';
      ctx.fillText('CLICK OR SPACE TO RETRY', canvas.width / 2, canvas.height / 2 + 16);
      ctx.textAlign = 'left';
    }
  }, [colorTheme, levelName]);

  // Collision detection
  const checkCollision = useCallback((gs: GameState): boolean => {
    const tiles = tilesRef.current;
    if (!tiles.length) return false;

    const cubeLeft = gs.cubeX + 4;
    const cubeRight = gs.cubeX + CUBE_SIZE - 4;
    const cubeTop = gs.cubeY + 4;
    const cubeBottom = gs.cubeY + CUBE_SIZE - 4;

    const colStart = Math.floor(cubeLeft / TILE_SIZE);
    const colEnd = Math.floor(cubeRight / TILE_SIZE);
    const rowStart = Math.floor(cubeTop / TILE_SIZE);
    const rowEnd = Math.floor(cubeBottom / TILE_SIZE);

    for (let row = Math.max(0, rowStart); row <= Math.min(ROWS - 1, rowEnd); row++) {
      for (let col = Math.max(0, colStart); col <= Math.min((tiles[0]?.length ?? 0) - 1, colEnd); col++) {
        const tile = tiles[row]?.[col];
        // Skip empty/undefined tiles
        if (tile === undefined || (tile as number) === 0) continue;

        const tileLeft = col * TILE_SIZE;
        const tileRight = tileLeft + TILE_SIZE;
        const tileTop = row * TILE_SIZE;
        const tileBottom = tileTop + TILE_SIZE;

        const overlaps =
          cubeRight > tileLeft &&
          cubeLeft < tileRight &&
          cubeBottom > tileTop &&
          cubeTop < tileBottom;

        if (!overlaps) continue;

        if (tile === 2) {
          const spikeApexX = tileLeft + TILE_SIZE / 2;
          const spikeApexY = tileTop;
          const cubeCenterX = gs.cubeX + CUBE_SIZE / 2;
          const cubeCenterY = gs.cubeY + CUBE_SIZE / 2;
          const dist = Math.sqrt(
            Math.pow(cubeCenterX - spikeApexX, 2) + Math.pow(cubeCenterY - spikeApexY, 2)
          );
          if (dist < CUBE_SIZE * 0.6) return true;
        } else if (tile === 5) {
          return true;
        } else if (tile === 1 || tile === 4) {
          if (gs.velY >= 0 && cubeBottom > tileTop && cubeBottom < tileTop + 20) {
            gs.cubeY = tileTop - CUBE_SIZE;
            gs.velY = 0;
            gs.onGround = true;
          } else if (gs.velY < 0 && cubeTop < tileBottom && cubeTop > tileBottom - 20) {
            gs.velY = 0;
          } else if (cubeRight > tileLeft && cubeLeft < tileLeft + 10) {
            return true;
          }
        } else if (tile === 3) {
          gs.velY = JUMP_FORCE * 1.5;
          gs.onGround = false;
        }
      }
    }
    return false;
  }, []);

  // Main game loop
  const gameLoop = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = timestamp;

    const gs = gameStateRef.current;
    const tiles = tilesRef.current;
    const totalCols = tiles[0]?.length ?? 80;
    const totalWidth = totalCols * TILE_SIZE;

    if (gs.running && !gs.dead && !gs.completed) {
      const pixelsPerFrame = speed * dt;
      gs.cubeX += pixelsPerFrame;
      gs.cameraX = Math.max(0, gs.cubeX - 120);

      gs.velY += GRAVITY;
      gs.cubeY += gs.velY;
      gs.onGround = false;

      if (!gs.onGround) {
        gs.rotation += 0.08;
      } else {
        gs.rotation = Math.round(gs.rotation / (Math.PI / 2)) * (Math.PI / 2);
      }

      const groundY = (ROWS - 2) * TILE_SIZE - CUBE_SIZE;
      if (gs.cubeY >= groundY) {
        gs.cubeY = groundY;
        gs.velY = 0;
        gs.onGround = true;
      }

      if (gs.cubeY < 0) {
        gs.cubeY = 0;
        gs.velY = 0;
      }

      const died = checkCollision(gs);
      if (died) {
        gs.dead = true;
        gs.running = false;
        onDeath?.(gs.attempts);
        setUiState(prev => ({ ...prev, attempts: gs.attempts }));
      }

      if (gs.cubeX >= totalWidth - TILE_SIZE * 2) {
        gs.completed = true;
        gs.running = false;
        gs.percentage = 100;
        const finalScore = Math.floor(10000 / Math.max(1, gs.attempts));
        gs.score = finalScore;
        onComplete(finalScore, gs.attempts);
      }

      gs.percentage = Math.min(100, (gs.cubeX / (totalWidth - TILE_SIZE * 2)) * 100);
      setUiState(prev => ({ ...prev, percentage: gs.percentage }));
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(ctx, canvas, gs.cameraX);
    drawTiles(ctx, canvas, gs.cameraX);
    drawCube(ctx, gs);
    drawHUD(ctx, canvas, gs);

    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [speed, checkCollision, drawBackground, drawTiles, drawCube, drawHUD, onComplete, onDeath]);

  // Start/stop loop
  useEffect(() => {
    if (!spritesLoaded) return;
    resetGame();
    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [spritesLoaded, gameLoop, resetGame]);

  const handleCanvasClick = () => {
    const gs = gameStateRef.current;
    if (gs.dead) {
      resetGame();
      setTimeout(() => {
        startGame();
      }, 50);
    } else {
      handleJump();
    }
  };

  // suppress unused warning
  void uiState;

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        width={800}
        height={ROWS * TILE_SIZE}
        className="w-full border-4 border-neon-green cursor-pointer block"
        style={{
          imageRendering: 'pixelated',
          boxShadow: '0 0 20px rgba(57,255,20,0.3)',
          maxHeight: '70vh',
          objectFit: 'contain',
        }}
        onClick={handleCanvasClick}
        tabIndex={0}
      />
      {!spritesLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <span className="text-neon-green font-pixel text-[10px] animate-pixel-pulse">LOADING...</span>
        </div>
      )}
    </div>
  );
}
