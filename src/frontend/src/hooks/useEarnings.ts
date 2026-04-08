import { useActor } from "@caffeineai/core-infrastructure";
import { useEffect, useState } from "react";
import { createActor } from "../backend";
import type { EarningsSummary } from "../backend.d";

export interface EarningsData {
  totalUsd: string;
  totalBtc: string;
  fromCopySales: string;
  fromTradeRoyalties: string;
  fromAuctionWins: string;
  transactionCount: number;
  loading: boolean;
  error: string | null;
}

function fmtUsd(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtBtc(btc: number): string {
  return btc.toFixed(8);
}

export function useEarnings(): EarningsData {
  const { actor, isFetching } = useActor(createActor);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!actor || isFetching) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    actor
      .getMyEarnings()
      .then((result) => {
        if (!cancelled) {
          setSummary(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load earnings",
          );
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [actor, isFetching]);

  if (loading || !summary) {
    return {
      totalUsd: "--",
      totalBtc: "--",
      fromCopySales: "--",
      fromTradeRoyalties: "--",
      fromAuctionWins: "--",
      transactionCount: 0,
      loading: loading || isFetching,
      error,
    };
  }

  return {
    totalUsd: fmtUsd(summary.totalUsd),
    // Use backend-computed totalBtcE8s if non-zero; otherwise derive from USD
    totalBtc: fmtBtc(
      summary.totalBtcE8s > 0n
        ? Number(summary.totalBtcE8s) / 100_000_000
        : summary.totalUsd / 50_000,
    ),
    fromCopySales: fmtUsd(summary.fromCopySales),
    fromTradeRoyalties: fmtUsd(summary.fromTradeRoyalties),
    fromAuctionWins: fmtUsd(summary.fromAuctionWins),
    transactionCount: Number(summary.transactionCount),
    loading: false,
    error: null,
  };
}
