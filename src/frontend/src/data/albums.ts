export interface Track {
  number: number;
  title: string;
  duration: string;
  preview_url: string;
  full_url: string;
}

export interface Album {
  id: string;
  collectionName: string;
  title: string;
  artist: string;
  artworkSrc: string;
  supply: number;
  userEdition: number;
  tracks: Track[];
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
}

export const ALBUMS: Album[] = [
  {
    id: "echo_001",
    collectionName: "ECHO_001",
    title: "Fragments",
    artist: "Halo Drift",
    artworkSrc: "/assets/generated/album-fragments.dim_600x600.jpg",
    supply: 150,
    userEdition: 42,
    tracks: [
      {
        number: 1,
        title: "Glass Wings",
        duration: "3:42",
        preview_url: "",
        full_url: "",
      },
      {
        number: 2,
        title: "Fade Protocol",
        duration: "4:11",
        preview_url: "",
        full_url: "",
      },
      {
        number: 3,
        title: "Infrared",
        duration: "2:58",
        preview_url: "",
        full_url: "",
      },
      {
        number: 4,
        title: "Hollow Pulse",
        duration: "5:03",
        preview_url: "",
        full_url: "",
      },
      {
        number: 5,
        title: "Drift",
        duration: "3:27",
        preview_url: "",
        full_url: "",
      },
    ],
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
  },
  {
    id: "echo_002",
    collectionName: "ECHO_002",
    title: "Charcoal",
    artist: "Vessel",
    artworkSrc: "/assets/generated/album-charcoal.dim_600x600.jpg",
    supply: 120,
    userEdition: 7,
    tracks: [
      {
        number: 1,
        title: "Ember",
        duration: "4:22",
        preview_url: "",
        full_url: "",
      },
      {
        number: 2,
        title: "Smoke Signal",
        duration: "3:55",
        preview_url: "",
        full_url: "",
      },
      {
        number: 3,
        title: "Ash",
        duration: "5:14",
        preview_url: "",
        full_url: "",
      },
      {
        number: 4,
        title: "Residue",
        duration: "3:33",
        preview_url: "",
        full_url: "",
      },
      {
        number: 5,
        title: "Kindling",
        duration: "4:01",
        preview_url: "",
        full_url: "",
      },
    ],
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
  },
];

export function formatEdition(edition: number): string {
  return `#${String(edition).padStart(3, "0")}`;
}
