import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { createContext, useCallback, useContext } from "react";
import { createActor } from "../backend";
import { useWalletContext } from "./WalletContext";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TransactionType = "mint_fee" | "copy_sale" | "secondary_trade";

interface PaymentContextValue {
  /**
   * Process a $1 mint fee from the user's in-app BTC wallet balance.
   * Returns #err("insufficient balance") if the user cannot afford it.
   */
  processWalletMint: (
    clipId: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  /**
   * Records a $1 mint fee via ckBTC — 100% platform.
   * Calls actor.processClipMint behind the scenes.
   */
  recordMintFee: (creatorPrincipal: Principal) => Promise<void>;
  /**
   * Records a copy sale — 95% creator, 5% platform.
   */
  recordCopySale: (
    clipId: string,
    creatorPrincipal: Principal,
    buyerPrincipal: Principal,
    priceUsd: number,
  ) => Promise<void>;
  /**
   * Records a secondary trade — 4% original creator, 1% platform, 95% seller.
   */
  recordSecondaryTrade: (
    clipId: string,
    originalCreatorPrincipal: Principal,
    sellerPrincipal: Principal,
    buyerPrincipal: Principal,
    priceUsd: number,
  ) => Promise<void>;
}

const PaymentCtx = createContext<PaymentContextValue | null>(null);

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const { actor } = useActor(createActor);
  const { identity } = useInternetIdentity();
  const { refreshBalance } = useWalletContext();

  const processWalletMint = useCallback(
    async (clipId: string): Promise<{ ok: boolean; error?: string }> => {
      if (!actor) {
        console.warn("[PaymentContext] processWalletMint: actor not ready");
        return { ok: false, error: "Wallet not connected" };
      }
      try {
        const result = await actor.processWalletMint(clipId);
        if (result.__kind__ === "err") {
          return {
            ok: false,
            error:
              result.err === "insufficient balance"
                ? "Insufficient balance. Deposit BTC to continue."
                : result.err,
          };
        }
        // Refresh balance after successful deduction
        await refreshBalance();
        return { ok: true };
      } catch (err) {
        console.error("[PaymentContext] processWalletMint failed:", err);
        return { ok: false, error: "Payment failed. Please try again." };
      }
    },
    [actor, refreshBalance],
  );

  const recordMintFee = useCallback(
    async (creatorPrincipal: Principal): Promise<void> => {
      if (!actor) {
        console.warn("[PaymentContext] recordMintFee: actor not ready");
        return;
      }
      try {
        await actor.processClipMint(creatorPrincipal);
      } catch (err) {
        console.error("[PaymentContext] recordMintFee failed:", err);
      }
    },
    [actor],
  );

  const recordCopySale = useCallback(
    async (
      clipId: string,
      creatorPrincipal: Principal,
      buyerPrincipal: Principal,
      priceUsd: number,
    ): Promise<void> => {
      if (!actor) return;
      try {
        await actor.processCopySale(
          clipId,
          creatorPrincipal,
          buyerPrincipal,
          priceUsd,
        );
      } catch (err) {
        console.error("[PaymentContext] recordCopySale failed:", err);
      }
    },
    [actor],
  );

  const recordSecondaryTrade = useCallback(
    async (
      clipId: string,
      originalCreatorPrincipal: Principal,
      sellerPrincipal: Principal,
      buyerPrincipal: Principal,
      priceUsd: number,
    ): Promise<void> => {
      if (!actor) return;
      try {
        await actor.processSecondaryTrade(
          clipId,
          originalCreatorPrincipal,
          sellerPrincipal,
          buyerPrincipal,
          priceUsd,
        );
      } catch (err) {
        console.error("[PaymentContext] recordSecondaryTrade failed:", err);
      }
    },
    [actor],
  );

  void identity;

  return (
    <PaymentCtx.Provider
      value={{
        processWalletMint,
        recordMintFee,
        recordCopySale,
        recordSecondaryTrade,
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
