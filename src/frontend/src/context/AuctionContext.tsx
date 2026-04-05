import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { CollectionNFT } from "./CollectionContext";

const LS_KEY = "minty_auctions";
const LS_SEEDED_KEY = "minty_auctions_seeded";

export interface Bid {
  id: string;
  bidderName: string;
  amountUsd: number;
  placedAt: number;
}

export interface AuctionListing {
  id: string;
  nftId: string;
  nftTitle: string;
  nftImageUrl: string;
  nftSetName: string;
  nftRarity: string;
  mediaType: "photo" | "video";
  creatorName: string;
  highestBid: number; // 0 if no bids
  bids: Bid[];
  endsAt: number; // timestamp
  listingFee: number; // 100
  status: "active" | "ended";
}

interface AuctionCtx {
  listings: AuctionListing[];
  createAuction: (nft: CollectionNFT) => void;
  placeBid: (listingId: string, amountUsd: number) => void;
  isListed: (nftId: string) => boolean;
}

const AuctionContext = createContext<AuctionCtx | null>(null);

const NOW = Date.now();
const H24 = 24 * 60 * 60 * 1000;

const SEED_LISTINGS: AuctionListing[] = [
  {
    id: "auction_seed_1",
    nftId: "nft_auction_seed_1",
    nftTitle: "Golden Moment #3",
    nftImageUrl: "https://images.pokemontcg.io/sv1/025_hires.png",
    nftSetName: "Mint Moments Vol. 1",
    nftRarity: "Common",
    mediaType: "video",
    creatorName: "mintcreator.icp",
    highestBid: 42.5,
    bids: [
      {
        id: "bid_s1_1",
        bidderName: "collector_x.icp",
        amountUsd: 20.0,
        placedAt: NOW - 3 * 60 * 60 * 1000,
      },
      {
        id: "bid_s1_2",
        bidderName: "wave_rider.icp",
        amountUsd: 35.0,
        placedAt: NOW - 2 * 60 * 60 * 1000,
      },
      {
        id: "bid_s1_3",
        bidderName: "neon_rider.icp",
        amountUsd: 42.5,
        placedAt: NOW - 45 * 60 * 1000,
      },
    ],
    endsAt: NOW + 6 * 60 * 60 * 1000,
    listingFee: 100,
    status: "active",
  },
  {
    id: "auction_seed_2",
    nftId: "nft_auction_seed_2",
    nftTitle: "Glacier Drift — Video Moment",
    nftImageUrl: "https://images.pokemontcg.io/sv1/025_hires.png",
    nftSetName: "Arctic Series",
    nftRarity: "Rare",
    mediaType: "video",
    creatorName: "light.icp",
    highestBid: 120.0,
    bids: [
      {
        id: "bid_s2_1",
        bidderName: "arc_collector.icp",
        amountUsd: 75.0,
        placedAt: NOW - 8 * 60 * 60 * 1000,
      },
      {
        id: "bid_s2_2",
        bidderName: "frost.icp",
        amountUsd: 120.0,
        placedAt: NOW - 4 * 60 * 60 * 1000,
      },
    ],
    endsAt: NOW + 14 * 60 * 60 * 1000,
    listingFee: 100,
    status: "active",
  },
  {
    id: "auction_seed_3",
    nftId: "nft_auction_seed_3",
    nftTitle: "Sage Leaf #22",
    nftImageUrl: "https://images.pokemontcg.io/sv1/025_hires.png",
    nftSetName: "Nature Drop",
    nftRarity: "Common",
    mediaType: "video",
    creatorName: "sage_creator.icp",
    highestBid: 0,
    bids: [],
    endsAt: NOW + 22 * 60 * 60 * 1000,
    listingFee: 100,
    status: "active",
  },
];

function loadListingsFromStorage(): AuctionListing[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AuctionListing[];
  } catch {
    return [];
  }
}

function saveListingsToStorage(listings: AuctionListing[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(listings));
  } catch {
    // ignore
  }
}

export function AuctionProvider({ children }: { children: React.ReactNode }) {
  const [listings, setListings] = useState<AuctionListing[]>(() =>
    loadListingsFromStorage(),
  );

  // Seed mock listings once
  useEffect(() => {
    const alreadySeeded = localStorage.getItem(LS_SEEDED_KEY);
    if (!alreadySeeded) {
      setListings((prev) => [...SEED_LISTINGS, ...prev]);
      localStorage.setItem(LS_SEEDED_KEY, "1");
    }
  }, []);

  // Persist
  useEffect(() => {
    saveListingsToStorage(listings);
  }, [listings]);

  const createAuction = useCallback((nft: CollectionNFT) => {
    const listing: AuctionListing = {
      id: `auction_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      nftId: nft.id,
      nftTitle: nft.title,
      nftImageUrl: nft.imageUrl,
      nftSetName: nft.setName,
      nftRarity: nft.rarity,
      mediaType: nft.mediaType,
      creatorName: nft.creator,
      highestBid: 0,
      bids: [],
      endsAt: Date.now() + H24,
      listingFee: 100,
      status: "active",
    };
    setListings((prev) => [listing, ...prev]);
  }, []);

  const placeBid = useCallback((listingId: string, amountUsd: number) => {
    setListings((prev) =>
      prev.map((l) => {
        if (l.id !== listingId) return l;
        const newBid: Bid = {
          id: `bid_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
          bidderName: "you",
          amountUsd,
          placedAt: Date.now(),
        };
        const newBids = [...l.bids, newBid];
        const newHighest = Math.max(l.highestBid, amountUsd);
        return { ...l, bids: newBids, highestBid: newHighest };
      }),
    );
  }, []);

  const isListed = useCallback(
    (nftId: string): boolean => {
      return listings.some((l) => l.nftId === nftId && l.status === "active");
    },
    [listings],
  );

  return (
    <AuctionContext.Provider
      value={{ listings, createAuction, placeBid, isListed }}
    >
      {children}
    </AuctionContext.Provider>
  );
}

export function useAuctions(): AuctionCtx {
  const ctx = useContext(AuctionContext);
  if (!ctx) {
    throw new Error("useAuctions must be used inside AuctionProvider");
  }
  return ctx;
}
