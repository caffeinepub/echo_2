export interface SongComment {
  id: string;
  walletAddress: string;
  text: string;
  timestamp: number;
}

export interface Song {
  id: string;
  collectionName: string;
  title: string;
  artist: string;
  artworkSrc: string;
  supply: number;
  userEdition: number;
  preview_url: string;
  full_url: string;
  floorPrice: number;
  lastSoldPrice: number;
  owners: number;
  minted: number;
  isSoldOut: boolean;
  mintOpensInMs: number | null;
  editions_in_circulation: number;
  volume_24h_sol: number;
  mintPrice: number;
  nft_mint_address: string;
  signalStrength: number; // 0–1
  likes: number;
  comments: SongComment[];
  coverMotion?: string;
  motionEnabled?: boolean;
}

export const SONGS: Song[] = [
  {
    id: "echo_003",
    collectionName: "ECHO_003",
    title: "Obsidian",
    artist: "Nocturne",
    artworkSrc: "/assets/generated/album-fragments.dim_600x600.jpg",
    supply: 200,
    userEdition: 0,
    preview_url:
      "https://storage.googleapis.com/media-session/sintel/snow-fight.mp3",
    full_url:
      "https://storage.googleapis.com/media-session/sintel/snow-fight.mp3",
    floorPrice: 0,
    lastSoldPrice: 0,
    owners: 0,
    minted: 0,
    isSoldOut: false,
    mintOpensInMs: 5400000,
    editions_in_circulation: 0,
    volume_24h_sol: 0,
    mintPrice: 0.35,
    nft_mint_address: "ObsidianNocturne33333333333333333333333333",
    signalStrength: 0,
    likes: 0,
    comments: [],
    coverMotion:
      "https://videos.pexels.com/video-files/3045163/3045163-sd_640_360_25fps.mp4",
    motionEnabled: true,
  },
  {
    id: "echo_001",
    collectionName: "ECHO_001",
    title: "Fragments",
    artist: "Halo Drift",
    artworkSrc: "/assets/generated/album-fragments.dim_600x600.jpg",
    supply: 150,
    userEdition: 42,
    preview_url:
      "https://storage.googleapis.com/media-session/elephants-dream/the-wires.mp3",
    full_url:
      "https://storage.googleapis.com/media-session/elephants-dream/the-wires.mp3",
    floorPrice: 2.6,
    lastSoldPrice: 2.1,
    owners: 89,
    minted: 89,
    isSoldOut: false,
    mintOpensInMs: 0,
    editions_in_circulation: 89,
    volume_24h_sol: 12.4,
    mintPrice: 1.8,
    nft_mint_address: "FragmentsHaloDrift1111111111111111111111111",
    signalStrength: 0.72,
    likes: 142,
    comments: [
      {
        id: "c1",
        walletAddress: "7f3k...92x",
        text: "This track hits different at 3am. The texture is insane.",
        timestamp: Date.now() - 7200000,
      },
      {
        id: "c2",
        walletAddress: "4xPm...77z",
        text: "Minted edition #23. Absolute gem.",
        timestamp: Date.now() - 3600000,
      },
      {
        id: "c3",
        walletAddress: "9wKr...11q",
        text: "Halo Drift never misses. Instant classic.",
        timestamp: Date.now() - 1800000,
      },
    ],
    coverMotion:
      "https://videos.pexels.com/video-files/1572846/1572846-sd_960_506_30fps.mp4",
    motionEnabled: true,
  },
  {
    id: "echo_002",
    collectionName: "ECHO_002",
    title: "Charcoal",
    artist: "Vessel",
    artworkSrc: "/assets/generated/album-charcoal.dim_600x600.jpg",
    supply: 120,
    userEdition: 7,
    preview_url:
      "https://storage.googleapis.com/media-session/big-buck-bunny/preload.mp3",
    full_url:
      "https://storage.googleapis.com/media-session/big-buck-bunny/preload.mp3",
    floorPrice: 1.8,
    lastSoldPrice: 1.6,
    owners: 61,
    minted: 120,
    isSoldOut: true,
    mintOpensInMs: null,
    editions_in_circulation: 61,
    volume_24h_sol: 7.8,
    mintPrice: 2.0,
    nft_mint_address: "CharcoalVesselNFT222222222222222222222222222",
    signalStrength: 0.55,
    likes: 87,
    comments: [
      {
        id: "c4",
        walletAddress: "2bXn...44f",
        text: "Sold out in 6 minutes. Legendary.",
        timestamp: Date.now() - 86400000,
      },
      {
        id: "c5",
        walletAddress: "8dYs...55r",
        text: "The low end on this is something else. Vessel is on another level.",
        timestamp: Date.now() - 43200000,
      },
    ],
    coverMotion:
      "https://videos.pexels.com/video-files/2278095/2278095-sd_640_360_24fps.mp4",
    motionEnabled: true,
  },
];

export function formatEdition(edition: number): string {
  return `#${String(edition).padStart(3, "0")}`;
}
