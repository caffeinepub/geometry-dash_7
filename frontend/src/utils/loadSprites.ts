// Sprite sheet loader and cache utility

const spriteCache: Map<string, HTMLImageElement> = new Map();

export function loadImage(src: string): Promise<HTMLImageElement> {
  if (spriteCache.has(src)) {
    return Promise.resolve(spriteCache.get(src)!);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      spriteCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => {
      // Return a placeholder on error
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(0, 0, 64, 64);
      const placeholder = new Image();
      placeholder.src = canvas.toDataURL();
      spriteCache.set(src, placeholder);
      resolve(placeholder);
    };
    img.src = src;
  });
}

export const SPRITE_PATHS = {
  cube: '/assets/generated/cube-sprites.dim_256x64.png',
  tiles: '/assets/generated/tile-sprites.dim_512x64.png',
  bg: '/assets/generated/level-bg.dim_1920x360.png',
  logo: '/assets/generated/logo.dim_512x128.png',
};

// Cube sprite frames: 256x64 sheet, 4 frames of 64x64
// Frame 0: idle, Frame 1: jumping, Frame 2: dead, Frame 3: extra
export function drawCubeSprite(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  frame: 0 | 1 | 2 | 3,
  x: number,
  y: number,
  size: number,
  rotation: number = 0
) {
  const frameW = 64;
  const frameH = 64;
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.rotate(rotation);
  ctx.drawImage(img, frame * frameW, 0, frameW, frameH, -size / 2, -size / 2, size, size);
  ctx.restore();
}

// Tile sprite frames: 512x64 sheet, 8 frames of 64x64
// Frame 0: ground, Frame 1: spike, Frame 2: jump pad, Frame 3: deco, Frame 4: ceiling, Frame 5-7: extra
export function drawTileSprite(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  frame: number,
  x: number,
  y: number,
  size: number
) {
  const frameW = 64;
  const frameH = 64;
  ctx.drawImage(img, frame * frameW, 0, frameW, frameH, x, y, size, size);
}

export async function preloadAllSprites(): Promise<{
  cube: HTMLImageElement;
  tiles: HTMLImageElement;
  bg: HTMLImageElement;
}> {
  const [cube, tiles, bg] = await Promise.all([
    loadImage(SPRITE_PATHS.cube),
    loadImage(SPRITE_PATHS.tiles),
    loadImage(SPRITE_PATHS.bg),
  ]);
  return { cube, tiles, bg };
}
