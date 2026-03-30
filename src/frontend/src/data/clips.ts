export interface Clip {
  id: string;
  creatorName: string;
  creatorWallet: string;
  caption: string;
  videoUrl: string;
  thumbnailUrl: string;
  postedAt: number;
  mintWindowMs: number;
  mintedCount: number;
  supply: number;
  mintPriceUSD: number;
}

export const MINT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
export const MINT_PRICE_USD = 5;
export const TOTAL_SUPPLY = 100;

const NOW = Date.now();
const DAY = 86400000;

export const MOCK_CLIPS: Clip[] = [
  {
    id: "clip_001",
    creatorName: "Halo Drift",
    creatorWallet: "7f3k...92x",
    caption: "late night city loop",
    videoUrl:
      "https://videos.pexels.com/video-files/1572846/1572846-sd_960_506_30fps.mp4",
    thumbnailUrl: "/assets/generated/cover-fragments.dim_600x600.jpg",
    postedAt: NOW - 1 * DAY,
    mintWindowMs: MINT_WINDOW_MS,
    mintedCount: 24,
    supply: TOTAL_SUPPLY,
    mintPriceUSD: MINT_PRICE_USD,
  },
  {
    id: "clip_002",
    creatorName: "Vessel",
    creatorWallet: "4xPm...77z",
    caption: "ocean drift 7sec",
    videoUrl:
      "https://videos.pexels.com/video-files/2278095/2278095-sd_640_360_24fps.mp4",
    thumbnailUrl: "/assets/generated/cover-charcoal.dim_600x600.jpg",
    postedAt: NOW - 2 * DAY,
    mintWindowMs: MINT_WINDOW_MS,
    mintedCount: 76,
    supply: TOTAL_SUPPLY,
    mintPriceUSD: MINT_PRICE_USD,
  },
  {
    id: "clip_003",
    creatorName: "Nocturne",
    creatorWallet: "9wKr...11q",
    caption: "smoke & mirrors",
    videoUrl:
      "https://videos.pexels.com/video-files/3045163/3045163-sd_640_360_25fps.mp4",
    thumbnailUrl: "/assets/generated/cover-obsidian.dim_600x600.jpg",
    postedAt: NOW - 3 * DAY,
    mintWindowMs: MINT_WINDOW_MS,
    mintedCount: 90,
    supply: TOTAL_SUPPLY,
    mintPriceUSD: MINT_PRICE_USD,
  },
  {
    id: "clip_004",
    creatorName: "Cypher",
    creatorWallet: "3xKp...88y",
    caption: "neon grid ritual",
    videoUrl:
      "https://videos.pexels.com/video-files/3255584/3255584-sd_640_360_25fps.mp4",
    thumbnailUrl: "/assets/generated/cover-grid.dim_600x600.jpg",
    postedAt: NOW - 1.5 * DAY,
    mintWindowMs: MINT_WINDOW_MS,
    mintedCount: 14,
    supply: TOTAL_SUPPLY,
    mintPriceUSD: MINT_PRICE_USD,
  },
  {
    id: "clip_005",
    creatorName: "Solstice",
    creatorWallet: "8dYs...55r",
    caption: "aurora fragment",
    videoUrl:
      "https://videos.pexels.com/video-files/4067992/4067992-sd_640_360_25fps.mp4",
    thumbnailUrl: "/assets/generated/cover-aurora.dim_600x600.jpg",
    postedAt: NOW - 5 * DAY,
    mintWindowMs: MINT_WINDOW_MS,
    mintedCount: 58,
    supply: TOTAL_SUPPLY,
    mintPriceUSD: MINT_PRICE_USD,
  },
  {
    id: "clip_006",
    creatorName: "Refract",
    creatorWallet: "5nJk...12w",
    caption: "prism dissolve",
    videoUrl:
      "https://videos.pexels.com/video-files/3141208/3141208-sd_640_360_24fps.mp4",
    thumbnailUrl: "/assets/generated/cover-prism.dim_600x600.jpg",
    postedAt: NOW - 6 * DAY,
    mintWindowMs: MINT_WINDOW_MS,
    mintedCount: 100,
    supply: TOTAL_SUPPLY,
    mintPriceUSD: MINT_PRICE_USD,
  },
  {
    id: "clip_007",
    creatorName: "Dark Matter",
    creatorWallet: "6mNr...34t",
    caption: "void state",
    videoUrl:
      "https://videos.pexels.com/video-files/2278095/2278095-sd_640_360_24fps.mp4",
    thumbnailUrl: "/assets/generated/cover-void.dim_600x600.jpg",
    postedAt: NOW - 0.5 * DAY,
    mintWindowMs: MINT_WINDOW_MS,
    mintedCount: 6,
    supply: TOTAL_SUPPLY,
    mintPriceUSD: MINT_PRICE_USD,
  },
  {
    id: "clip_008",
    creatorName: "Luminara",
    creatorWallet: "4dGb...45z",
    caption: "bloom moment",
    videoUrl:
      "https://videos.pexels.com/video-files/1572846/1572846-sd_960_506_30fps.mp4",
    thumbnailUrl: "/assets/generated/cover-bloom.dim_600x600.jpg",
    postedAt: NOW - 4 * DAY,
    mintWindowMs: MINT_WINDOW_MS,
    mintedCount: 42,
    supply: TOTAL_SUPPLY,
    mintPriceUSD: MINT_PRICE_USD,
  },
];
