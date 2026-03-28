import { useCallback, useEffect, useRef, useState } from "react";

const FALLBACK_PRICE = 150;

export function useSolPrice(): { solPrice: number; loading: boolean } {
  const [solPrice, setSolPrice] = useState<number>(FALLBACK_PRICE);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPrice = useCallback(async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
        { signal: AbortSignal.timeout(8000) },
      );
      if (!res.ok) throw new Error("bad response");
      const data = await res.json();
      const price = data?.solana?.usd;
      if (typeof price === "number" && price > 0) {
        setSolPrice(price);
      }
    } catch {
      // Keep current price on failure
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrice();
    intervalRef.current = setInterval(fetchPrice, 60_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchPrice]);

  return { solPrice, loading };
}
