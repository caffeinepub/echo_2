import { useActor } from "@caffeineai/core-infrastructure";
import { useEffect, useState } from "react";
import { createActor } from "../backend";
import type { EarningsSummary } from "../backend.d";

const BTC_RATE = 50_000; // USD per BTC

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

function fmtBtc(usd: number): string {
  const btc = usd / BTC_RATE;
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
    totalBtc: fmtBtc(summary.totalUsd),
    fromCopySales: fmtUsd(summary.fromCopySales),
    fromTradeRoyalties: fmtUsd(summary.fromTradeRoyalties),
    fromAuctionWins: fmtUsd(summary.fromAuctionWins),
    transactionCount: Number(summary.transactionCount),
    loading: false,
    error: null,
  };
}
