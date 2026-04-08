import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { CollectionNFT } from "./CollectionContext";

const LS_KEY = "minty_auctions";

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
      endsAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
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
