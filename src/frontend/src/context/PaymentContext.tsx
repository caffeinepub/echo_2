import { useActor } from "@caffeineai/core-infrastructure";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { createContext, useCallback, useContext } from "react";
import { createActor } from "../backend";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TransactionType = "mint_fee" | "copy_sale" | "secondary_trade";

// ─── Context value ─────────────────────────────────────────────────────────────

interface PaymentContextValue {
  /**
   * Records a $1 mint fee — 100% goes to platform.
   * Calls actor.processClipMint behind the scenes.
   * Non-blocking: logs error on failure, never throws.
   */
  recordMintFee: (creatorPrincipal: Principal) => Promise<void>;
  /**
   * Records a copy sale — 95% creator, 5% platform.
   * Calls actor.processCopySale behind the scenes.
   * Non-blocking: logs error on failure, never throws.
   */
  recordCopySale: (
    clipId: string,
    creatorPrincipal: Principal,
    buyerPrincipal: Principal,
    priceUsd: number,
  ) => Promise<void>;
  /**
   * Records a secondary trade — 4% original creator, 1% platform, 95% seller.
   * Calls actor.processSecondaryTrade behind the scenes.
   * Non-blocking: logs error on failure, never throws.
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
      if (!actor) {
        console.warn("[PaymentContext] recordCopySale: actor not ready");
        return;
      }
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
      if (!actor) {
        console.warn("[PaymentContext] recordSecondaryTrade: actor not ready");
        return;
      }
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

  // Keep identity in scope so the hook stays valid even if unused directly
  void identity;

  return (
    <PaymentCtx.Provider
      value={{
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
