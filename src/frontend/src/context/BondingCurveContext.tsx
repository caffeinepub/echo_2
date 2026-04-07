import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CurveState {
  clipId: string;
  totalSupply: number;
  copiesMinted: number;
  startingPriceCents: number; // 100 = $1.00
  priceIncrementCents: number; // 1 = +$0.01 per copy
}

export interface PurchaseRecord {
  clipId: string;
  clipTitle: string;
  editionNumber: number; // 1-based sequential copy order (1 = first buyer)
  totalSupply: number; // always 1000
  pricePaid: number; // in cents
  purchasedAt: number; // timestamp ms
  videoUrl: string;
  creatorName: string;
}

export interface PricePoint {
  timestamp: number; // ms
  price: number; // in cents
  marketCap: number; // USD cents × totalSupply / 100 → USD
  copiesMinted: number;
}

function currentPriceCents(state: CurveState): number {
  return (
    state.startingPriceCents + state.copiesMinted * state.priceIncrementCents
  );
}

function nextPriceCents(state: CurveState): number {
  return (
    state.startingPriceCents +
    (state.copiesMinted + 1) * state.priceIncrementCents
  );
}

function computeMarketCap(state: CurveState): number {
  // marketCap in USD = currentPrice(USD) × totalSupply
  return (currentPriceCents(state) / 100) * state.totalSupply;
}

// Build default curve states for seed clips
const SEED_STATES: CurveState[] = [
  {
    clipId: "clip_1",
    totalSupply: 1000,
    copiesMinted: 127,
    startingPriceCents: 100,
    priceIncrementCents: 1,
  },
  {
    clipId: "clip_2",
    totalSupply: 1000,
    copiesMinted: 53,
    startingPriceCents: 100,
    priceIncrementCents: 1,
  },
  {
    clipId: "clip_3",
    totalSupply: 1000,
    copiesMinted: 341,
    startingPriceCents: 100,
    priceIncrementCents: 1,
  },
  {
    clipId: "clip_4",
    totalSupply: 1000,
    copiesMinted: 78,
    startingPriceCents: 100,
    priceIncrementCents: 1,
  },
  {
    clipId: "clip_5",
    totalSupply: 1000,
    copiesMinted: 512,
    startingPriceCents: 100,
    priceIncrementCents: 1,
  },
  {
    clipId: "clip_6",
    totalSupply: 1000,
    copiesMinted: 9,
    startingPriceCents: 100,
    priceIncrementCents: 1,
  },
  {
    clipId: "clip_7",
    totalSupply: 1000,
    copiesMinted: 205,
    startingPriceCents: 100,
    priceIncrementCents: 1,
  },
  {
    clipId: "clip_8",
    totalSupply: 1000,
    copiesMinted: 88,
    startingPriceCents: 100,
    priceIncrementCents: 1,
  },
];

const LS_CURVE_KEY = "minty_curve_states_v1";
const LS_PURCHASES_KEY = "minty_purchases_v1";
const LS_PRICE_HISTORY_KEY = "minty_price_history_v1";

function loadCurveStates(): Map<string, CurveState> {
  const map = new Map<string, CurveState>();
  for (const s of SEED_STATES) map.set(s.clipId, s);
  try {
    const raw = localStorage.getItem(LS_CURVE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as CurveState[];
      for (const s of saved) map.set(s.clipId, s);
    }
  } catch {
    /* ignore */
  }
  return map;
}

function saveCurveStates(map: Map<string, CurveState>) {
  try {
    localStorage.setItem(LS_CURVE_KEY, JSON.stringify([...map.values()]));
  } catch {
    /* ignore */
  }
}

function loadPurchases(): PurchaseRecord[] {
  try {
    const raw = localStorage.getItem(LS_PURCHASES_KEY);
    return raw ? (JSON.parse(raw) as PurchaseRecord[]) : [];
  } catch {
    return [];
  }
}

function savePurchases(records: PurchaseRecord[]) {
  try {
    localStorage.setItem(LS_PURCHASES_KEY, JSON.stringify(records));
  } catch {
    /* ignore */
  }
}

function loadPriceHistory(): Map<string, PricePoint[]> {
  try {
    const raw = localStorage.getItem(LS_PRICE_HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, PricePoint[]>;
      return new Map(Object.entries(parsed));
    }
  } catch {
    /* ignore */
  }
  return new Map();
}

function savePriceHistory(map: Map<string, PricePoint[]>) {
  try {
    const obj: Record<string, PricePoint[]> = {};
    for (const [k, v] of map.entries()) obj[k] = v;
    localStorage.setItem(LS_PRICE_HISTORY_KEY, JSON.stringify(obj));
  } catch {
    /* ignore */
  }
}

/** Initialise price history for seed states if none exists yet */
function initSeedHistory(
  curveMap: Map<string, CurveState>,
  historyMap: Map<string, PricePoint[]>,
): Map<string, PricePoint[]> {
  let dirty = false;
  const now = Date.now();
  for (const state of curveMap.values()) {
    if (!historyMap.has(state.clipId)) {
      // Derive sparse history from current minted count
      const points: PricePoint[] = [];
      const step = Math.max(1, Math.ceil(state.copiesMinted / 8));
      const baseTime = now - state.copiesMinted * 60_000 * 5; // ~5 min per copy
      for (let k = 0; k <= state.copiesMinted; k += step) {
        const priceCents =
          state.startingPriceCents + k * state.priceIncrementCents;
        points.push({
          timestamp: baseTime + k * 60_000 * 5,
          price: priceCents,
          marketCap: (priceCents / 100) * state.totalSupply,
          copiesMinted: k,
        });
      }
      // Always include current state as final point
      const finalPrice = currentPriceCents(state);
      if (points[points.length - 1]?.copiesMinted !== state.copiesMinted) {
        points.push({
          timestamp: now,
          price: finalPrice,
          marketCap: (finalPrice / 100) * state.totalSupply,
          copiesMinted: state.copiesMinted,
        });
      }
      historyMap.set(state.clipId, points);
      dirty = true;
    }
  }
  if (dirty) savePriceHistory(historyMap);
  return historyMap;
}

// ─── Context Value ─────────────────────────────────────────────────────────────

interface BondingCurveContextValue {
  getCurveState: (clipId: string) => CurveState | null;
  getOrCreateCurve: (clipId: string) => CurveState;
  purchase: (
    clipId: string,
    clipTitle: string,
    videoUrl: string,
    creatorName: string,
  ) => Promise<{ editionNumber: number; totalSupply: number }>;
  purchases: PurchaseRecord[];
  hasPurchased: (clipId: string) => boolean;
  currentPrice: (clipId: string) => number; // returns cents
  nextPrice: (clipId: string) => number; // returns cents
  remaining: (clipId: string) => number;
  progressPct: (clipId: string) => number;
  marketCap: (clipId: string) => number; // returns USD
  getAllCurveStates: () => CurveState[];
  getPriceHistory: (clipId: string) => PricePoint[];
  /** Incremented every 8s so subscribers can re-render */
  ticker: number;
}

const BondingCurveCtx = createContext<BondingCurveContextValue | null>(null);

export function BondingCurveProvider({
  children,
}: { children: React.ReactNode }) {
  const [curveMap, setCurveMap] =
    useState<Map<string, CurveState>>(loadCurveStates);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>(loadPurchases);
  const [priceHistoryMap, setPriceHistoryMap] = useState<
    Map<string, PricePoint[]>
  >(() => {
    const base = loadPriceHistory();
    return initSeedHistory(loadCurveStates(), base);
  });
  const [ticker, setTicker] = useState(0);

  // 8-second polling: re-read from localStorage, refresh ticker
  useEffect(() => {
    const id = setInterval(() => {
      // Re-sync curve states from localStorage (other tabs / future backend writes)
      const fresh = loadCurveStates();
      setCurveMap(fresh);
      // Re-sync history
      const freshHistory = loadPriceHistory();
      setPriceHistoryMap(new Map(freshHistory));
      setTicker((t) => t + 1);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const getCurveState = useCallback(
    (clipId: string): CurveState | null => {
      return curveMap.get(clipId) ?? null;
    },
    [curveMap],
  );

  const getOrCreateCurve = useCallback(
    (clipId: string): CurveState => {
      const existing = curveMap.get(clipId);
      if (existing) return existing;
      const fresh: CurveState = {
        clipId,
        totalSupply: 1000,
        copiesMinted: 0,
        startingPriceCents: 100,
        priceIncrementCents: 1,
      };
      setCurveMap((prev) => {
        const next = new Map(prev);
        next.set(clipId, fresh);
        saveCurveStates(next);
        return next;
      });
      return fresh;
    },
    [curveMap],
  );

  const purchase = useCallback(
    async (
      clipId: string,
      clipTitle: string,
      videoUrl: string,
      creatorName: string,
    ): Promise<{ editionNumber: number; totalSupply: number }> => {
      const state = curveMap.get(clipId);
      if (!state) throw new Error("Curve state not found");
      if (state.copiesMinted >= state.totalSupply) throw new Error("Sold out");

      const pricePaid = currentPriceCents(state);
      const editionNumber = state.copiesMinted + 1;
      const totalSupply = state.totalSupply;

      await new Promise((r) => setTimeout(r, 600));

      setCurveMap((prev) => {
        const next = new Map(prev);
        const cur = prev.get(clipId);
        if (!cur) return prev;
        const updated = { ...cur, copiesMinted: cur.copiesMinted + 1 };
        next.set(clipId, updated);
        saveCurveStates(next);

        // Append a new price point to history immediately after purchase
        const newPriceCents = currentPriceCents(updated);
        const newPoint: PricePoint = {
          timestamp: Date.now(),
          price: newPriceCents,
          marketCap: (newPriceCents / 100) * updated.totalSupply,
          copiesMinted: updated.copiesMinted,
        };
        setPriceHistoryMap((prevH) => {
          const nextH = new Map(prevH);
          const existing = nextH.get(clipId) ?? [];
          const appended = [...existing, newPoint];
          nextH.set(clipId, appended);
          savePriceHistory(nextH);
          return nextH;
        });

        return next;
      });

      setPurchases((prev) => {
        const record: PurchaseRecord = {
          clipId,
          clipTitle,
          editionNumber,
          totalSupply,
          pricePaid,
          purchasedAt: Date.now(),
          videoUrl,
          creatorName,
        };
        const next = [record, ...prev];
        savePurchases(next);
        return next;
      });

      return { editionNumber, totalSupply };
    },
    [curveMap],
  );

  const hasPurchased = useCallback(
    (clipId: string): boolean => {
      return purchases.some((p) => p.clipId === clipId);
    },
    [purchases],
  );

  const currentPrice = useCallback(
    (clipId: string): number => {
      const s = curveMap.get(clipId);
      if (!s) return 100;
      return currentPriceCents(s);
    },
    [curveMap],
  );

  const nextPrice = useCallback(
    (clipId: string): number => {
      const s = curveMap.get(clipId);
      if (!s) return 101;
      return nextPriceCents(s);
    },
    [curveMap],
  );

  const remaining = useCallback(
    (clipId: string): number => {
      const s = curveMap.get(clipId);
      if (!s) return 1000;
      return s.totalSupply - s.copiesMinted;
    },
    [curveMap],
  );

  const progressPct = useCallback(
    (clipId: string): number => {
      const s = curveMap.get(clipId);
      if (!s) return 0;
      return (s.copiesMinted / s.totalSupply) * 100;
    },
    [curveMap],
  );

  const marketCap = useCallback(
    (clipId: string): number => {
      const s = curveMap.get(clipId);
      if (!s) return 0;
      return computeMarketCap(s);
    },
    [curveMap],
  );

  const getAllCurveStates = useCallback((): CurveState[] => {
    return [...curveMap.values()];
  }, [curveMap]);

  const getPriceHistory = useCallback(
    (clipId: string): PricePoint[] => {
      return priceHistoryMap.get(clipId) ?? [];
    },
    [priceHistoryMap],
  );

  return (
    <BondingCurveCtx.Provider
      value={{
        getCurveState,
        getOrCreateCurve,
        purchase,
        purchases,
        hasPurchased,
        currentPrice,
        nextPrice,
        remaining,
        progressPct,
        marketCap,
        getAllCurveStates,
        getPriceHistory,
        ticker,
      }}
    >
      {children}
    </BondingCurveCtx.Provider>
  );
}

export function useBondingCurve(): BondingCurveContextValue {
  const ctx = useContext(BondingCurveCtx);
  if (!ctx)
    throw new Error("useBondingCurve must be used inside BondingCurveProvider");
  return ctx;
}
