import { useActor } from "@caffeineai/core-infrastructure";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { VideoClipSort, createActor } from "../backend";
import type {
  BondingCurveState as BackendCurveState,
  PurchaseRecord as BackendPurchaseRecord,
  PriceHistorySummary,
  PurchaseStatus,
} from "../backend";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Frontend representation of a bonding curve state (cents for prices) */
export interface CurveState {
  clipId: string;
  totalSupply: number;
  copiesMinted: number;
  startingPriceCents: number;
  priceIncrementCents: number;
  soldOut: boolean;
  currentPriceCents: number;
  nextPriceCents: number;
}

export interface PurchaseRecord {
  purchaseId: string;
  clipId: string;
  clipTitle: string;
  editionNumber: number;
  totalSupply: number;
  pricePaid: number; // USD dollars
  purchasedAt: number; // ms timestamp
  videoUrl: string;
  creatorName: string;
  status: "pending" | "minted";
}

export interface PricePoint {
  timestamp: number;
  price: number; // cents
  marketCap: number;
  copiesMinted: number;
  editionNumber: number;
}

export interface OfferRecord {
  id: string;
  clipId: string;
  listingId: string;
  editionNumber: number;
  offerPriceUsd: number;
  offererUsername: string;
  status: "pending" | "accepted" | "declined";
  createdAt: number;
}

// Re-export so consumers can type summary data
export type { PriceHistorySummary };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function backendCurveToFrontend(bc: BackendCurveState): CurveState {
  const copiesMinted = Number(bc.copiesMinted);
  const totalSupply = Number(bc.totalSupply);
  return {
    clipId: bc.clipId,
    totalSupply,
    copiesMinted,
    startingPriceCents: Math.round(bc.startingPrice * 100),
    priceIncrementCents: Math.round(bc.priceIncrementFactor * 100),
    soldOut: bc.soldOut,
    currentPriceCents: Math.round(bc.currentPrice * 100),
    nextPriceCents: Math.round(bc.nextPrice * 100),
  };
}

function isPurchaseStatusPending(s: PurchaseStatus): boolean {
  return (s as unknown as string) === "pending";
}

function backendPurchaseToFrontend(
  bp: BackendPurchaseRecord,
  clipTitle: string,
  videoUrl: string,
  creatorName: string,
): PurchaseRecord {
  return {
    purchaseId: bp.purchaseId,
    clipId: bp.clipId,
    clipTitle,
    editionNumber: Number(bp.editionNumber),
    totalSupply: 1000,
    pricePaid: bp.pricePaid, // already USD
    purchasedAt: Number(bp.purchasedAt) / 1_000_000, // backend ns → ms
    videoUrl,
    creatorName,
    status: isPurchaseStatusPending(bp.status) ? "pending" : "minted",
  };
}

// LocalStorage fallback for clip metadata (title/video url) since PurchaseRecord
// from backend doesn't carry these display fields.
const LS_CLIP_META_KEY = "minty_clip_meta_v1";

function loadClipMeta(): Map<
  string,
  { title: string; videoUrl: string; creatorName: string }
> {
  try {
    const raw = localStorage.getItem(LS_CLIP_META_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<
        string,
        { title: string; videoUrl: string; creatorName: string }
      >;
      return new Map(Object.entries(parsed));
    }
  } catch {
    /* ignore */
  }
  return new Map();
}

function saveClipMeta(
  map: Map<string, { title: string; videoUrl: string; creatorName: string }>,
) {
  try {
    const obj: Record<
      string,
      { title: string; videoUrl: string; creatorName: string }
    > = {};
    for (const [k, v] of map.entries()) obj[k] = v;
    localStorage.setItem(LS_CLIP_META_KEY, JSON.stringify(obj));
  } catch {
    /* ignore */
  }
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
  ) => Promise<{
    editionNumber: number;
    totalSupply: number;
    isSoldOut: boolean;
  }>;
  purchases: PurchaseRecord[];
  hasPurchased: (clipId: string) => boolean;
  currentPrice: (clipId: string) => number; // returns cents
  nextPrice: (clipId: string) => number; // returns cents
  remaining: (clipId: string) => number;
  progressPct: (clipId: string) => number;
  marketCap: (clipId: string) => number; // returns USD
  getAllCurveStates: () => CurveState[];
  getPriceHistory: (clipId: string) => PricePoint[];
  getPriceHistorySummary: (
    clipId: string,
  ) => Promise<PriceHistorySummary | null>;
  getPendingPurchases: () => PurchaseRecord[];
  getMintedPurchases: () => PurchaseRecord[];
  isLoadingCurves: boolean;
  /** Incremented every 8s so subscribers can re-render */
  ticker: number;
}

const BondingCurveCtx = createContext<BondingCurveContextValue | null>(null);

export function BondingCurveProvider({
  children,
}: { children: React.ReactNode }) {
  const { actor, isFetching } = useActor(createActor);

  const [curveMap, setCurveMap] = useState<Map<string, CurveState>>(new Map());
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [priceHistoryMap, setPriceHistoryMap] = useState<
    Map<string, PricePoint[]>
  >(new Map());
  const [isLoadingCurves, setIsLoadingCurves] = useState(true);
  const [ticker, setTicker] = useState(0);
  const clipMetaRef = useRef<
    Map<string, { title: string; videoUrl: string; creatorName: string }>
  >(loadClipMeta());

  // Load curve states and purchases when actor is ready
  useEffect(() => {
    if (!actor || isFetching) return;

    let cancelled = false;

    async function loadAll() {
      if (!actor) return;
      setIsLoadingCurves(true);
      try {
        // Load clips+curves in one call
        const clipsWithCurves = await actor.getClipsWithCurveState();
        if (cancelled) return;

        const newCurveMap = new Map<string, CurveState>();
        for (const [clip, maybeCurve] of clipsWithCurves) {
          if (maybeCurve !== null) {
            newCurveMap.set(clip.clip_id, backendCurveToFrontend(maybeCurve));
          }
          // Store clip metadata for display in Collection page
          if (!clipMetaRef.current.has(clip.clip_id)) {
            clipMetaRef.current.set(clip.clip_id, {
              title: clip.title ?? "",
              videoUrl: clip.video_file_url,
              creatorName: clip.creator_principal_id.toString().slice(0, 8),
            });
          }
        }
        saveClipMeta(clipMetaRef.current);
        setCurveMap(newCurveMap);

        // Load purchases
        const backendPurchases = await actor.getMyPurchases();
        if (cancelled) return;

        const mapped = backendPurchases.map((bp) => {
          const meta = clipMetaRef.current.get(bp.clipId) ?? {
            title: "",
            videoUrl: "",
            creatorName: "",
          };
          return backendPurchaseToFrontend(
            bp,
            meta.title,
            meta.videoUrl,
            meta.creatorName,
          );
        });
        setPurchases(mapped);
      } catch (err) {
        console.error("[BondingCurve] load failed:", err);
      } finally {
        if (!cancelled) setIsLoadingCurves(false);
      }
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [actor, isFetching]);

  // 8-second polling ticker + curve refresh
  useEffect(() => {
    if (!actor || isFetching) return;

    const id = setInterval(async () => {
      try {
        const clipsWithCurves = await actor.getClipsWithCurveState();
        const newCurveMap = new Map<string, CurveState>();
        for (const [clip, maybeCurve] of clipsWithCurves) {
          if (maybeCurve !== null) {
            newCurveMap.set(clip.clip_id, backendCurveToFrontend(maybeCurve));
          }
          if (!clipMetaRef.current.has(clip.clip_id)) {
            clipMetaRef.current.set(clip.clip_id, {
              title: clip.title ?? "",
              videoUrl: clip.video_file_url,
              creatorName: clip.creator_principal_id.toString().slice(0, 8),
            });
          }
        }
        saveClipMeta(clipMetaRef.current);
        setCurveMap(newCurveMap);
      } catch {
        /* ignore polling errors */
      }
      setTicker((t) => t + 1);
    }, 8000);

    return () => clearInterval(id);
  }, [actor, isFetching]);

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
      // Return a default while backend init is pending
      return {
        clipId,
        totalSupply: 1000,
        copiesMinted: 0,
        startingPriceCents: 100,
        priceIncrementCents: 1,
        soldOut: false,
        currentPriceCents: 100,
        nextPriceCents: 101,
      };
    },
    [curveMap],
  );

  const purchase = useCallback(
    async (
      clipId: string,
      clipTitle: string,
      videoUrl: string,
      creatorName: string,
    ): Promise<{
      editionNumber: number;
      totalSupply: number;
      isSoldOut: boolean;
    }> => {
      if (!actor) throw new Error("Connect wallet to purchase");

      const state = curveMap.get(clipId);
      const pricePaid = state ? state.currentPriceCents / 100 : 1.0;

      const result = await actor.recordPurchase(clipId, pricePaid);
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }

      const bp = result.ok;
      const editionNumber = Number(bp.editionNumber);
      const totalSupply = 1000;
      const isSoldOut = !isPurchaseStatusPending(bp.status);

      // Store clip metadata for display
      if (!clipMetaRef.current.has(clipId)) {
        clipMetaRef.current.set(clipId, {
          title: clipTitle,
          videoUrl,
          creatorName,
        });
        saveClipMeta(clipMetaRef.current);
      }

      // Refresh curve state for this clip
      try {
        const freshCurve = await actor.getBondingCurveState(clipId);
        if (freshCurve !== null) {
          setCurveMap((prev) => {
            const next = new Map(prev);
            next.set(clipId, backendCurveToFrontend(freshCurve));
            return next;
          });

          // Append price history point from backend (edition number = copies minted)
          const newPriceCents = Math.round(freshCurve.currentPrice * 100);
          const newEdition = Number(freshCurve.copiesMinted);
          const newPoint: PricePoint = {
            timestamp: Date.now(),
            price: newPriceCents,
            marketCap: (newPriceCents / 100) * Number(freshCurve.totalSupply),
            copiesMinted: newEdition,
            editionNumber: newEdition,
          };
          setPriceHistoryMap((prev) => {
            const next = new Map(prev);
            const existing = next.get(clipId) ?? [];
            next.set(clipId, [...existing, newPoint]);
            return next;
          });
        }
      } catch {
        /* non-fatal */
      }

      // Refresh purchases
      try {
        const backendPurchases = await actor.getMyPurchases();
        const mapped = backendPurchases.map((bp2) => {
          const meta = clipMetaRef.current.get(bp2.clipId) ?? {
            title: "",
            videoUrl: "",
            creatorName: "",
          };
          return backendPurchaseToFrontend(
            bp2,
            meta.title,
            meta.videoUrl,
            meta.creatorName,
          );
        });
        setPurchases(mapped);
      } catch {
        // Fall back to optimistic update
        const record: PurchaseRecord = {
          purchaseId: bp.purchaseId,
          clipId,
          clipTitle,
          editionNumber,
          totalSupply,
          pricePaid,
          purchasedAt: Date.now(),
          videoUrl,
          creatorName,
          status: isSoldOut ? "minted" : "pending",
        };
        setPurchases((prev) => [record, ...prev]);
      }

      return { editionNumber, totalSupply, isSoldOut };
    },
    [actor, curveMap],
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
      return s.currentPriceCents;
    },
    [curveMap],
  );

  const nextPrice = useCallback(
    (clipId: string): number => {
      const s = curveMap.get(clipId);
      if (!s) return 101;
      return s.nextPriceCents;
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
      return (s.currentPriceCents / 100) * s.totalSupply;
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

  /** Call backend getPriceHistorySummary for a clip — returns null on error */
  const getPriceHistorySummary = useCallback(
    async (clipId: string) => {
      if (!actor) return null;
      try {
        return await actor.getPriceHistorySummary(clipId);
      } catch {
        return null;
      }
    },
    [actor],
  );

  // Load FULL price history from backend when actor is ready
  useEffect(() => {
    if (!actor || isFetching) return;

    async function loadHistory() {
      if (!actor) return;
      const clips = await actor
        .getClips(VideoClipSort.newest, false)
        .catch(() => []);

      const newHistoryMap = new Map<string, PricePoint[]>();
      await Promise.all(
        clips.map(async (clip) => {
          try {
            // Use getPriceHistoryFull to get ALL historical points oldest-first
            const history = await actor.getPriceHistoryFull(clip.clip_id);
            const points: PricePoint[] = history.map((ph) => ({
              timestamp: Number(ph.timestamp) / 1_000_000,
              price: Math.round(ph.salePrice * 100),
              marketCap: ph.salePrice * 1000,
              copiesMinted: Number(ph.editionNumber),
              editionNumber: Number(ph.editionNumber),
            }));
            if (points.length > 0) {
              newHistoryMap.set(clip.clip_id, points);
            }
          } catch {
            /* non-fatal */
          }
        }),
      );

      if (newHistoryMap.size > 0) {
        setPriceHistoryMap(newHistoryMap);
      }
    }

    loadHistory();
  }, [actor, isFetching]);

  const getPendingPurchases = useCallback((): PurchaseRecord[] => {
    return purchases.filter((p) => p.status === "pending");
  }, [purchases]);

  const getMintedPurchases = useCallback((): PurchaseRecord[] => {
    return purchases.filter((p) => p.status === "minted");
  }, [purchases]);

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
        getPriceHistorySummary,
        getPendingPurchases,
        getMintedPurchases,
        isLoadingCurves,
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
