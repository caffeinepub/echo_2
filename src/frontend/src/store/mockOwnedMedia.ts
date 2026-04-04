// ─── Shared Mock Owned Media Data ────────────────────────────────────────────
// Import from this file in LibraryPage.tsx and AssetDetailPage.tsx.
// Replace mock data with real backend calls when available.

export interface OwnedMediaItem {
  id: string;
  type: "photo" | "video";
  title: string;
  creator: string;
  editionNumber: string; // e.g. "12/100"
  isListed: boolean;
  price?: number; // only if listed
  duration?: string; // e.g. "0:07", "0:30", "1:00" — only for videos
  thumbnailUrl: string;
  mediaUrl?: string; // actual media URL for detail page viewer
  rarity?: "Common" | "Rare" | "Ultra Rare" | "Legendary";
  totalSupply: number;
  minted: number;
  listed: number;
  held: number;
  lastSalePrice?: number;
  floorPrice?: number;
  totalVolume: number;
  views: number;
  favorites: number;
  ownershipHistory: { address: string; date: string }[];
  badges: string[];
}

export const MOCK_OWNED_MEDIA: OwnedMediaItem[] = [
  {
    id: "1",
    type: "photo",
    title: "Mint Sunrise",
    creator: "lumina.sol",
    editionNumber: "12/100",
    isListed: true,
    price: 25,
    thumbnailUrl:
      "https://placehold.co/400x600/d1fae5/059669?text=Mint+Sunrise",
    mediaUrl:
      "https://placehold.co/800x600/d1fae5/059669?text=Mint+Sunrise+Full",
    rarity: "Rare",
    totalSupply: 100,
    minted: 100,
    listed: 14,
    held: 86,
    lastSalePrice: 28,
    floorPrice: 22,
    totalVolume: 2340,
    views: 4821,
    favorites: 312,
    badges: ["#1 Trending", "Most Viewed"],
    ownershipHistory: [
      { address: "0x3f4a...9c2b", date: "2026-01-18" },
      { address: "0xa8e1...4d77", date: "2025-12-05" },
      { address: "0x21bc...f03a", date: "2025-10-22" },
    ],
  },
  {
    id: "2",
    type: "video",
    title: "Opening Day",
    creator: "drophaus",
    editionNumber: "3/50",
    isListed: false,
    duration: "0:07",
    thumbnailUrl: "https://placehold.co/400x600/bfdbfe/2563eb?text=Opening+Day",
    mediaUrl:
      "https://placehold.co/800x450/bfdbfe/2563eb?text=Opening+Day+Video",
    rarity: "Ultra Rare",
    totalSupply: 50,
    minted: 50,
    listed: 3,
    held: 47,
    lastSalePrice: 145,
    floorPrice: 120,
    totalVolume: 5800,
    views: 9210,
    favorites: 780,
    badges: ["Top Volume", "Creator Featured"],
    ownershipHistory: [
      { address: "0x7bc9...12ea", date: "2026-02-01" },
      { address: "0x3f4a...9c2b", date: "2025-11-14" },
    ],
  },
  {
    id: "3",
    type: "photo",
    title: "Crystal Drop",
    creator: "nova.art",
    editionNumber: "8/200",
    isListed: true,
    price: 15,
    thumbnailUrl:
      "https://placehold.co/400x600/a7f3d0/047857?text=Crystal+Drop",
    mediaUrl:
      "https://placehold.co/800x600/a7f3d0/047857?text=Crystal+Drop+Full",
    rarity: "Common",
    totalSupply: 200,
    minted: 200,
    listed: 31,
    held: 169,
    lastSalePrice: 16,
    floorPrice: 12,
    totalVolume: 1820,
    views: 2130,
    favorites: 94,
    badges: [],
    ownershipHistory: [
      { address: "0x9dc4...a51f", date: "2026-01-28" },
      { address: "0x5502...e8c3", date: "2025-09-10" },
    ],
  },
  {
    id: "4",
    type: "video",
    title: "Drift Season",
    creator: "kira_frames",
    editionNumber: "1/25",
    isListed: true,
    price: 80,
    duration: "0:30",
    thumbnailUrl:
      "https://placehold.co/400x600/c7d2fe/4338ca?text=Drift+Season",
    mediaUrl:
      "https://placehold.co/800x450/c7d2fe/4338ca?text=Drift+Season+Video",
    rarity: "Legendary",
    totalSupply: 25,
    minted: 25,
    listed: 5,
    held: 20,
    lastSalePrice: 210,
    floorPrice: 175,
    totalVolume: 14800,
    views: 18400,
    favorites: 2100,
    badges: ["#1 Trending", "Top Volume", "Most Viewed"],
    ownershipHistory: [
      { address: "0xe3b0...7841", date: "2026-03-02" },
      { address: "0x1a2d...cc99", date: "2026-01-11" },
      { address: "0xf7e5...30ab", date: "2025-11-28" },
      { address: "0x4809...6d1e", date: "2025-08-14" },
    ],
  },
  {
    id: "5",
    type: "photo",
    title: "Sage Walk",
    creator: "earthtones",
    editionNumber: "44/100",
    isListed: false,
    thumbnailUrl: "https://placehold.co/400x600/bbf7d0/16a34a?text=Sage+Walk",
    mediaUrl: "https://placehold.co/800x600/bbf7d0/16a34a?text=Sage+Walk+Full",
    rarity: "Common",
    totalSupply: 100,
    minted: 100,
    listed: 8,
    held: 92,
    lastSalePrice: 11,
    floorPrice: 9,
    totalVolume: 870,
    views: 1240,
    favorites: 55,
    badges: [],
    ownershipHistory: [
      { address: "0xd3c1...8b40", date: "2026-02-14" },
      { address: "0x6af2...e721", date: "2025-12-19" },
    ],
  },
  {
    id: "6",
    type: "video",
    title: "Neon Fog",
    creator: "lumina.sol",
    editionNumber: "2/10",
    isListed: false,
    duration: "1:00",
    thumbnailUrl: "https://placehold.co/400x600/fde68a/b45309?text=Neon+Fog",
    mediaUrl: "https://placehold.co/800x450/fde68a/b45309?text=Neon+Fog+Video",
    rarity: "Legendary",
    totalSupply: 10,
    minted: 10,
    listed: 1,
    held: 9,
    lastSalePrice: 580,
    floorPrice: 500,
    totalVolume: 9200,
    views: 22100,
    favorites: 3400,
    badges: ["Creator Featured", "Most Viewed"],
    ownershipHistory: [
      { address: "0x0f88...b29d", date: "2026-03-10" },
      { address: "0x7bc9...12ea", date: "2026-01-05" },
      { address: "0xa1cc...f994", date: "2025-10-30" },
    ],
  },
  {
    id: "7",
    type: "photo",
    title: "Mirror Pond",
    creator: "nova.art",
    editionNumber: "17/75",
    isListed: true,
    price: 40,
    thumbnailUrl: "https://placehold.co/400x600/cffafe/0e7490?text=Mirror+Pond",
    mediaUrl:
      "https://placehold.co/800x600/cffafe/0e7490?text=Mirror+Pond+Full",
    rarity: "Rare",
    totalSupply: 75,
    minted: 75,
    listed: 9,
    held: 66,
    lastSalePrice: 45,
    floorPrice: 38,
    totalVolume: 3120,
    views: 5600,
    favorites: 420,
    badges: ["Creator Featured"],
    ownershipHistory: [
      { address: "0x5502...e8c3", date: "2026-02-22" },
      { address: "0xc7d3...a104", date: "2025-12-01" },
      { address: "0x9dc4...a51f", date: "2025-09-15" },
    ],
  },
  {
    id: "8",
    type: "photo",
    title: "Frosted Peak",
    creator: "drophaus",
    editionNumber: "99/100",
    isListed: false,
    thumbnailUrl:
      "https://placehold.co/400x600/e0f2fe/0369a1?text=Frosted+Peak",
    mediaUrl:
      "https://placehold.co/800x600/e0f2fe/0369a1?text=Frosted+Peak+Full",
    rarity: "Rare",
    totalSupply: 100,
    minted: 100,
    listed: 6,
    held: 94,
    lastSalePrice: 34,
    floorPrice: 28,
    totalVolume: 2650,
    views: 3780,
    favorites: 244,
    badges: [],
    ownershipHistory: [
      { address: "0x4809...6d1e", date: "2026-01-30" },
      { address: "0xe3b0...7841", date: "2025-11-07" },
    ],
  },
];
