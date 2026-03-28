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
}

export const SONGS: Song[] = [
  {
    id: "echo_001",
    collectionName: "ECHO_001",
    title: "Fragments",
    artist: "Halo Drift",
    artworkSrc: "/assets/generated/album-fragments.dim_600x600.jpg",
    supply: 150,
    userEdition: 42,
    preview_url: "",
    full_url: "",
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
  },
  {
    id: "echo_002",
    collectionName: "ECHO_002",
    title: "Charcoal",
    artist: "Vessel",
    artworkSrc: "/assets/generated/album-charcoal.dim_600x600.jpg",
    supply: 120,
    userEdition: 7,
    preview_url: "",
    full_url: "",
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
  },
];

export function formatEdition(edition: number): string {
  return `#${String(edition).padStart(3, "0")}`;
}
