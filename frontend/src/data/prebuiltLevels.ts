export type TileType = 0 | 1 | 2 | 3 | 4 | 5;
// 0 = empty, 1 = ground, 2 = spike, 3 = jump pad, 4 = deco block, 5 = ceiling

export interface PrebuiltLevel {
  id: number; // negative IDs for prebuilt levels to avoid collision with community levels
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  colorTheme: {
    primary: string;
    secondary: string;
    bg1: string;
    bg2: string;
    ground: string;
    spike: string;
    jumpPad: string;
  };
  speed: number; // pixels per second
  tileData: string; // encoded as JSON string of 2D array
}

// Grid: rows = 10 (0=top, 9=bottom), cols = variable width
// Row 8 = ground level, Row 9 = below ground
// Tiles: 0=empty, 1=ground, 2=spike, 3=jump pad, 4=deco, 5=ceiling

function buildLevel(rows: number, cols: number, placements: Array<[number, number, TileType]>): string {
  const grid: TileType[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 0 as TileType)
  );
  // Fill bottom two rows with ground
  for (let c = 0; c < cols; c++) {
    grid[rows - 1][c] = 1;
    grid[rows - 2][c] = 1;
  }
  for (const [r, c, t] of placements) {
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      grid[r][c] = t;
    }
  }
  return JSON.stringify(grid);
}

const ROWS = 10;

// Level 1: Easy - sparse spikes, wide gaps
const level1Placements: Array<[number, number, TileType]> = [
  // Spikes
  [7, 8, 2], [7, 9, 2],
  [7, 15, 2],
  [7, 22, 2], [7, 23, 2], [7, 24, 2],
  [7, 30, 2],
  [7, 36, 2], [7, 37, 2],
  [7, 44, 2],
  [7, 50, 2], [7, 51, 2],
  [7, 58, 2],
  [7, 64, 2], [7, 65, 2], [7, 66, 2],
  // Platforms
  [5, 12, 1], [5, 13, 1], [5, 14, 1],
  [5, 27, 1], [5, 28, 1],
  [5, 40, 1], [5, 41, 1], [5, 42, 1],
  // Jump pads
  [7, 18, 3],
  [7, 33, 3],
  [7, 47, 3],
  // Deco
  [4, 5, 4], [4, 20, 4], [4, 35, 4], [4, 55, 4],
];

// Level 2: Medium - denser obstacles, platforms
const level2Placements: Array<[number, number, TileType]> = [
  // Spikes
  [7, 5, 2], [7, 6, 2],
  [7, 10, 2], [7, 11, 2], [7, 12, 2],
  [7, 17, 2],
  [7, 20, 2], [7, 21, 2],
  [7, 26, 2], [7, 27, 2], [7, 28, 2],
  [7, 33, 2],
  [7, 36, 2], [7, 37, 2], [7, 38, 2],
  [7, 43, 2], [7, 44, 2],
  [7, 48, 2], [7, 49, 2], [7, 50, 2],
  [7, 55, 2],
  [7, 58, 2], [7, 59, 2],
  [7, 63, 2], [7, 64, 2], [7, 65, 2], [7, 66, 2],
  [7, 70, 2], [7, 71, 2],
  // Platforms
  [5, 8, 1], [5, 9, 1],
  [4, 15, 1], [4, 16, 1], [4, 17, 1],
  [5, 23, 1], [5, 24, 1],
  [4, 30, 1], [4, 31, 1],
  [5, 40, 1], [5, 41, 1],
  [4, 52, 1], [4, 53, 1], [4, 54, 1],
  [5, 61, 1], [5, 62, 1],
  // Jump pads
  [7, 3, 3],
  [7, 14, 3],
  [7, 24, 3],
  [7, 46, 3],
  [7, 68, 3],
  // Ceiling obstacles
  [0, 20, 5], [0, 21, 5], [0, 22, 5],
  [0, 45, 5], [0, 46, 5],
  [0, 60, 5], [0, 61, 5], [0, 62, 5],
  // Deco
  [3, 7, 4], [3, 25, 4], [3, 42, 4], [3, 60, 4],
];

// Level 3: Hard - very dense, complex patterns
const level3Placements: Array<[number, number, TileType]> = [
  // Dense spikes
  [7, 3, 2], [7, 4, 2], [7, 5, 2],
  [7, 8, 2], [7, 9, 2],
  [7, 12, 2], [7, 13, 2], [7, 14, 2], [7, 15, 2],
  [7, 18, 2], [7, 19, 2],
  [7, 22, 2], [7, 23, 2], [7, 24, 2],
  [7, 27, 2], [7, 28, 2], [7, 29, 2], [7, 30, 2],
  [7, 33, 2], [7, 34, 2],
  [7, 37, 2], [7, 38, 2], [7, 39, 2],
  [7, 42, 2], [7, 43, 2], [7, 44, 2], [7, 45, 2],
  [7, 48, 2], [7, 49, 2],
  [7, 52, 2], [7, 53, 2], [7, 54, 2],
  [7, 57, 2], [7, 58, 2], [7, 59, 2], [7, 60, 2],
  [7, 63, 2], [7, 64, 2],
  [7, 67, 2], [7, 68, 2], [7, 69, 2],
  [7, 72, 2], [7, 73, 2], [7, 74, 2], [7, 75, 2],
  // Platforms
  [5, 6, 1], [5, 7, 1],
  [4, 10, 1], [4, 11, 1],
  [5, 16, 1], [5, 17, 1],
  [4, 20, 1], [4, 21, 1],
  [5, 25, 1], [5, 26, 1],
  [4, 31, 1], [4, 32, 1],
  [5, 35, 1], [5, 36, 1],
  [4, 40, 1], [4, 41, 1],
  [5, 46, 1], [5, 47, 1],
  [4, 50, 1], [4, 51, 1],
  [5, 55, 1], [5, 56, 1],
  [4, 61, 1], [4, 62, 1],
  [5, 65, 1], [5, 66, 1],
  [4, 70, 1], [4, 71, 1],
  // Jump pads
  [7, 1, 3],
  [7, 10, 3],
  [7, 20, 3],
  [7, 31, 3],
  [7, 41, 3],
  [7, 51, 3],
  [7, 61, 3],
  [7, 71, 3],
  // Ceiling
  [0, 6, 5], [0, 7, 5], [0, 8, 5],
  [0, 18, 5], [0, 19, 5], [0, 20, 5],
  [0, 30, 5], [0, 31, 5],
  [0, 42, 5], [0, 43, 5], [0, 44, 5],
  [0, 55, 5], [0, 56, 5],
  [0, 67, 5], [0, 68, 5], [0, 69, 5],
  // Deco
  [3, 5, 4], [3, 15, 4], [3, 25, 4], [3, 35, 4], [3, 50, 4], [3, 65, 4],
];

export const PREBUILT_LEVELS: PrebuiltLevel[] = [
  {
    id: -1,
    name: 'STEREO MADNESS',
    difficulty: 'easy',
    colorTheme: {
      primary: '#39ff14',
      secondary: '#00ff88',
      bg1: '#0a1628',
      bg2: '#0d2040',
      ground: '#1a4a1a',
      spike: '#ff4444',
      jumpPad: '#ffaa00',
    },
    speed: 280,
    tileData: buildLevel(ROWS, 80, level1Placements),
  },
  {
    id: -2,
    name: 'BACK ON TRACK',
    difficulty: 'medium',
    colorTheme: {
      primary: '#ff6b35',
      secondary: '#ff9500',
      bg1: '#1a0a00',
      bg2: '#2a1200',
      ground: '#3a1a00',
      spike: '#ff2244',
      jumpPad: '#ffdd00',
    },
    speed: 340,
    tileData: buildLevel(ROWS, 80, level2Placements),
  },
  {
    id: -3,
    name: 'POLARGEIST',
    difficulty: 'hard',
    colorTheme: {
      primary: '#ff00ff',
      secondary: '#cc00ff',
      bg1: '#0a0015',
      bg2: '#150025',
      ground: '#2a0040',
      spike: '#ff0055',
      jumpPad: '#00ffff',
    },
    speed: 400,
    tileData: buildLevel(ROWS, 80, level3Placements),
  },
];

export function getLevelById(id: number): PrebuiltLevel | undefined {
  return PREBUILT_LEVELS.find(l => l.id === id);
}

export function parseTileData(tileData: string): TileType[][] {
  try {
    return JSON.parse(tileData) as TileType[][];
  } catch {
    return [];
  }
}
