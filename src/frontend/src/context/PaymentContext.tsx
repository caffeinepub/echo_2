import type { Principal } from "@icp-sdk/core/principal";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TransactionType = "mint_fee" | "copy_sale" | "secondary_trade";

export interface TransactionSplit {
  role: "platform" | "creator" | "seller";
  label: string;
  usdAmount: number;
  btcAmount: number;
  address: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  clipId: string;
  totalUsd: number;
  timestamp: number;
  splits: TransactionSplit[];
}

// Simulated BTC rate: $50,000 per BTC
const BTC_RATE = 50_000;
const PLATFORM_ADDRESS = "3GwDfPKRyNH4MZT3Vnc7GkKbAccNBZcVFh";

const LS_KEY = "minty_payment_transactions_v1";

function loadTxns(): Transaction[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Transaction[]) : [];
  } catch {
    return [];
  }
}

function saveTxns(txns: Transaction[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(txns));
  } catch {
    /* ignore */
  }
}

function usdToBtc(usd: number): number {
  return usd / BTC_RATE;
}

function makeId(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Context value ─────────────────────────────────────────────────────────────

interface PaymentContextValue {
  transactions: Transaction[];
  /**
   * Records a $1 mint fee — 100% goes to platform.
   * Non-blocking: logs error on failure, never throws.
   */
  recordMintFee: (creatorPrincipal: Principal) => Promise<void>;
  /**
   * Records a copy sale — 95% creator, 5% platform.
   * Non-blocking: logs error on failure, never throws.
   */
  recordCopySale: (
    clipId: string,
    creatorPrincipal: Principal,
    buyerPrincipal: Principal,
    priceUsd: number,
  ) => Promise<void>;
  /** Returns all transactions for a given principal (creator or buyer). */
  getMyTransactions: (p: Principal) => Transaction[];
  /** Total BTC earned by a principal across all creator/seller splits. */
  getMyEarnings: (p: Principal) => number;
  /** Total simulated BTC balance (sum of all creator/seller splits). */
  totalBtcEarned: number;
}

const PaymentCtx = createContext<PaymentContextValue | null>(null);

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(loadTxns);

  // Keep localStorage in sync
  useEffect(() => {
    saveTxns(transactions);
  }, [transactions]);

  const addTxn = useCallback((txn: Transaction) => {
    setTransactions((prev) => [txn, ...prev]);
  }, []);

  const recordMintFee = useCallback(
    async (creatorPrincipal: Principal): Promise<void> => {
      try {
        const usd = 1;
        const txn: Transaction = {
          id: makeId(),
          type: "mint_fee",
          clipId: `mint_${Date.now()}`,
          totalUsd: usd,
          timestamp: Date.now(),
          splits: [
            {
              role: "platform",
              label: "Platform (100%)",
              usdAmount: usd,
              btcAmount: usdToBtc(usd),
              address: PLATFORM_ADDRESS,
            },
          ],
        };
        addTxn(txn);
        // Fire-and-forget backend call when method becomes available
        // actor.processClipMint(creatorPrincipal) — not yet in bindings
        void creatorPrincipal;
      } catch (err) {
        console.error("[PaymentContext] recordMintFee failed:", err);
      }
    },
    [addTxn],
  );

  const recordCopySale = useCallback(
    async (
      clipId: string,
      creatorPrincipal: Principal,
      buyerPrincipal: Principal,
      priceUsd: number,
    ): Promise<void> => {
      try {
        const creatorCut = priceUsd * 0.95;
        const platformCut = priceUsd * 0.05;
        const creatorAddress = creatorPrincipal.toText();
        const txn: Transaction = {
          id: makeId(),
          type: "copy_sale",
          clipId,
          totalUsd: priceUsd,
          timestamp: Date.now(),
          splits: [
            {
              role: "creator",
              label: "Creator (95%)",
              usdAmount: creatorCut,
              btcAmount: usdToBtc(creatorCut),
              address: creatorAddress,
            },
            {
              role: "platform",
              label: "Platform (5%)",
              usdAmount: platformCut,
              btcAmount: usdToBtc(platformCut),
              address: PLATFORM_ADDRESS,
            },
          ],
        };
        addTxn(txn);
        // actor.processCopySale(clipId, creatorPrincipal, buyerPrincipal, priceUsd)
        void buyerPrincipal;
      } catch (err) {
        console.error("[PaymentContext] recordCopySale failed:", err);
      }
    },
    [addTxn],
  );

  const getMyTransactions = useCallback(
    (p: Principal): Transaction[] => {
      const addr = p.toText();
      return transactions.filter((t) =>
        t.splits.some((s) => s.address === addr),
      );
    },
    [transactions],
  );

  const getMyEarnings = useCallback(
    (p: Principal): number => {
      const addr = p.toText();
      return transactions.reduce((acc, txn) => {
        let total = acc;
        for (const split of txn.splits) {
          if (
            split.address === addr &&
            (split.role === "creator" || split.role === "seller")
          ) {
            total += split.btcAmount;
          }
        }
        return total;
      }, 0);
    },
    [transactions],
  );

  // Sum all non-platform splits as a rough "total earned" figure
  const totalBtcEarned = transactions.reduce((acc, txn) => {
    let total = acc;
    for (const split of txn.splits) {
      if (split.role === "creator" || split.role === "seller") {
        total += split.btcAmount;
      }
    }
    return total;
  }, 0);

  return (
    <PaymentCtx.Provider
      value={{
        transactions,
        recordMintFee,
        recordCopySale,
        getMyTransactions,
        getMyEarnings,
        totalBtcEarned,
      }}
    >
      {children}
    </PaymentCtx.Provider>
  );
}

export function usePayment(): PaymentContextValue {
  const ctx = useContext(PaymentCtx);
  if (!ctx) throw new Error("usePayment must be used inside PaymentProvider");
  return ctx;
}
