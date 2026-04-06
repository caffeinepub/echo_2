import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const LS_KEY = "minty_weekly_auctions";
const LS_SEEDED_KEY = "minty_weekly_auction_seeded_v1";

const BTC_PER_USD = 1 / 83000;

export interface WeeklyBid {
  id: string;
  bidderName: string;
  amountBtc: number;
  amountUsd: number;
  placedAt: number;
}

export interface WeeklyAuctionItem {
  id: string;
  rank: number;
  roundId: number;
  title: string;
  creatorName: string;
  imageUrl: string;
  videoUrl?: string;
  previewClipUrl?: string;
  likes: number;
  startedAt: number | null;
  endsAt: number | null;
  bids: WeeklyBid[];
  highestBid: number; // in BTC
  winner: string | null;
  status: "queued" | "active" | "ended";
}

export interface AuctionTimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

interface WeeklyAuctionCtx {
  activeAuction: WeeklyAuctionItem | null;
  upcomingAuctions: WeeklyAuctionItem[];
  completedAuctions: WeeklyAuctionItem[];
  timeRemaining: AuctionTimeRemaining;
  placeBid: (amountBtc: number) => void;
  addRoundWinners: (items: WeeklyAuctionItem[]) => void;
  justEndedWinner: { name: string; amountBtc: number } | null;
  clearJustEnded: () => void;
}

const ONE_HOUR_MS = 3600000;

const NOW = Date.now();

// Seed: 1 active (started 20 mins ago ~40 mins remain), 9 queued
const SEED_ITEMS: WeeklyAuctionItem[] = [
  {
    id: "wa_1",
    rank: 1,
    roundId: 1,
    title: "Northern Lights",
    creatorName: "arctic.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    previewClipUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    likes: 12482,
    startedAt: NOW - 20 * 60 * 1000,
    endsAt: NOW - 20 * 60 * 1000 + ONE_HOUR_MS,
    bids: [
      {
        id: "wb_1_1",
        bidderName: "collector_x.icp",
        amountBtc: 0.00025,
        amountUsd: 0.00025 * 83000,
        placedAt: NOW - 18 * 60 * 1000,
      },
      {
        id: "wb_1_2",
        bidderName: "wave_rider.icp",
        amountBtc: 0.00037,
        amountUsd: 0.00037 * 83000,
        placedAt: NOW - 12 * 60 * 1000,
      },
      {
        id: "wb_1_3",
        bidderName: "frost.icp",
        amountBtc: 0.00045,
        amountUsd: 0.00045 * 83000,
        placedAt: NOW - 5 * 60 * 1000,
      },
    ],
    highestBid: 0.00045,
    winner: null,
    status: "active",
  },
  {
    id: "wa_2",
    rank: 2,
    roundId: 1,
    title: "Midsummer Drift",
    creatorName: "solstice",
    imageUrl:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    previewClipUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    likes: 8301,
    startedAt: null,
    endsAt: null,
    bids: [],
    highestBid: 0,
    winner: null,
    status: "queued",
  },
  {
    id: "wa_3",
    rank: 3,
    roundId: 1,
    title: "Coastal Fog",
    creatorName: "drifter.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    previewClipUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    likes: 6744,
    startedAt: null,
    endsAt: null,
    bids: [],
    highestBid: 0,
    winner: null,
    status: "queued",
  },
  {
    id: "wa_4",
    rank: 4,
    roundId: 1,
    title: "Supernova Pulse",
    creatorName: "nova_clips",
    imageUrl:
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    previewClipUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    likes: 3210,
    startedAt: null,
    endsAt: null,
    bids: [],
    highestBid: 0,
    winner: null,
    status: "queued",
  },
  {
    id: "wa_5",
    rank: 5,
    roundId: 1,
    title: "Ryokan Morning",
    creatorName: "east.light",
    imageUrl:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600&q=80",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    previewClipUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    likes: 1987,
    startedAt: null,
    endsAt: null,
    bids: [],
    highestBid: 0,
    winner: null,
    status: "queued",
  },
  {
    id: "wa_6",
    rank: 6,
    roundId: 1,
    title: "Night Circuit",
    creatorName: "pulse_rider",
    imageUrl:
      "https://images.unsplash.com/photo-1492551557933-34265f7af79e?w=600&q=80",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    previewClipUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    likes: 1203,
    startedAt: null,
    endsAt: null,
    bids: [],
    highestBid: 0,
    winner: null,
    status: "queued",
  },
  {
    id: "wa_7",
    rank: 7,
    roundId: 1,
    title: "Velvet Hour",
    creatorName: "velvet_fog",
    imageUrl:
      "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=600&q=80",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    previewClipUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    likes: 870,
    startedAt: null,
    endsAt: null,
    bids: [],
    highestBid: 0,
    winner: null,
    status: "queued",
  },
  {
    id: "wa_8",
    rank: 8,
    roundId: 1,
    title: "Sunset Ride",
    creatorName: "mintcreator",
    imageUrl:
      "https://images.unsplash.com/photo-1511300636408-a63a89df3482?w=600&q=80",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoing.mp4",
    previewClipUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoing.mp4",
    likes: 512,
    startedAt: null,
    endsAt: null,
    bids: [],
    highestBid: 0,
    winner: null,
    status: "queued",
  },
  {
    id: "wa_9",
    rank: 9,
    roundId: 1,
    title: "First Mint Moment",
    creatorName: "neon_rider",
    imageUrl:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    previewClipUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    likes: 241,
    startedAt: null,
    endsAt: null,
    bids: [],
    highestBid: 0,
    winner: null,
    status: "queued",
  },
  {
    id: "wa_10",
    rank: 10,
    roundId: 1,
    title: "Golden Hour",
    creatorName: "light.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    previewClipUrl: "https://www.w3schools.com/html/movie.mp4",
    likes: 87,
    startedAt: null,
    endsAt: null,
    bids: [],
    highestBid: 0,
    winner: null,
    status: "queued",
  },
];

function loadFromStorage(): WeeklyAuctionItem[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WeeklyAuctionItem[];
  } catch {
    return [];
  }
}

function saveToStorage(items: WeeklyAuctionItem[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {}
}

function calcAuctionTimeRemaining(endsAt: number | null): AuctionTimeRemaining {
  if (!endsAt)
    return { hours: 1, minutes: 0, seconds: 0, totalMs: ONE_HOUR_MS };
  const totalMs = Math.max(0, endsAt - Date.now());
  const totalSecs = Math.floor(totalMs / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;
  return { hours, minutes, seconds, totalMs };
}

const WeeklyAuctionContext = createContext<WeeklyAuctionCtx | null>(null);

export function WeeklyAuctionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<WeeklyAuctionItem[]>(() =>
    loadFromStorage(),
  );
  const [timeRemaining, setTimeRemaining] = useState<AuctionTimeRemaining>(
    () => {
      const active = loadFromStorage().find((i) => i.status === "active");
      return calcAuctionTimeRemaining(active?.endsAt ?? null);
    },
  );
  const [justEndedWinner, setJustEndedWinner] = useState<{
    name: string;
    amountBtc: number;
  } | null>(null);
  const endedRef = useRef<Set<string>>(new Set());

  // Seed on first mount
  useEffect(() => {
    const alreadySeeded = localStorage.getItem(LS_SEEDED_KEY);
    if (!alreadySeeded) {
      setItems(SEED_ITEMS);
      localStorage.setItem(LS_SEEDED_KEY, "1");
    }
  }, []);

  // Persist
  useEffect(() => {
    saveToStorage(items);
  }, [items]);

  // Countdown + auto-advance logic
  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) => {
        const active = prev.find((i) => i.status === "active");
        if (!active || !active.endsAt) return prev;

        // Update time remaining
        const now = Date.now();
        if (now < active.endsAt) {
          setTimeRemaining(calcAuctionTimeRemaining(active.endsAt));
          return prev;
        }

        // Auction has ended — process it
        if (endedRef.current.has(active.id)) return prev;
        endedRef.current.add(active.id);

        const winner =
          active.bids.length > 0
            ? active.bids[active.bids.length - 1].bidderName
            : null;
        const winnerBtc = active.highestBid;

        if (winner) {
          setJustEndedWinner({ name: winner, amountBtc: winnerBtc });
        }

        // Find next queued item
        const sorted = [...prev].sort((a, b) => a.rank - b.rank);
        const nextQueued = sorted.find((i) => i.status === "queued");

        const auctionNow = Date.now();
        return prev.map((item) => {
          if (item.id === active.id) {
            return { ...item, status: "ended" as const, winner };
          }
          if (nextQueued && item.id === nextQueued.id) {
            return {
              ...item,
              status: "active" as const,
              startedAt: auctionNow,
              endsAt: auctionNow + ONE_HOUR_MS,
            };
          }
          return item;
        });
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keep timeRemaining in sync with current active
  useEffect(() => {
    const active = items.find((i) => i.status === "active");
    setTimeRemaining(calcAuctionTimeRemaining(active?.endsAt ?? null));
  }, [items]);

  const placeBid = useCallback((amountBtc: number) => {
    setItems((prev) => {
      const active = prev.find((i) => i.status === "active");
      if (!active) return prev;
      if (amountBtc <= active.highestBid) return prev;

      const newBid: WeeklyBid = {
        id: `wb_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        bidderName: "you",
        amountBtc,
        amountUsd: amountBtc * 83000,
        placedAt: Date.now(),
      };

      return prev.map((item) =>
        item.id === active.id
          ? {
              ...item,
              bids: [...item.bids, newBid],
              highestBid: amountBtc,
            }
          : item,
      );
    });
  }, []);

  const addRoundWinners = useCallback((newItems: WeeklyAuctionItem[]) => {
    setItems((prev) => {
      // Don't duplicate
      const existingIds = new Set(prev.map((i) => i.id));
      const filtered = newItems.filter((i) => !existingIds.has(i.id));
      // If no active auction, start the first one
      const hasActive = prev.some((i) => i.status === "active");
      const sorted = [...filtered].sort((a, b) => a.rank - b.rank);
      if (!hasActive && sorted.length > 0) {
        const now = Date.now();
        sorted[0] = {
          ...sorted[0],
          status: "active",
          startedAt: now,
          endsAt: now + ONE_HOUR_MS,
        };
      }
      return [...prev, ...sorted];
    });
  }, []);

  const clearJustEnded = useCallback(() => {
    setJustEndedWinner(null);
  }, []);

  const activeAuction = items.find((i) => i.status === "active") ?? null;
  const upcomingAuctions = items
    .filter((i) => i.status === "queued")
    .sort((a, b) => a.rank - b.rank);
  const completedAuctions = items
    .filter((i) => i.status === "ended")
    .sort((a, b) => a.rank - b.rank);

  return (
    <WeeklyAuctionContext.Provider
      value={{
        activeAuction,
        upcomingAuctions,
        completedAuctions,
        timeRemaining,
        placeBid,
        addRoundWinners,
        justEndedWinner,
        clearJustEnded,
      }}
    >
      {children}
    </WeeklyAuctionContext.Provider>
  );
}

export function useWeeklyAuction(): WeeklyAuctionCtx {
  const ctx = useContext(WeeklyAuctionContext);
  if (!ctx)
    throw new Error(
      "useWeeklyAuction must be used inside WeeklyAuctionProvider",
    );
  return ctx;
}

export { BTC_PER_USD };
