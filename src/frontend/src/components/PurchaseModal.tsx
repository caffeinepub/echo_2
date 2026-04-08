import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Principal } from "@icp-sdk/core/principal";
import { Check, ChevronRight, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBondingCurve } from "../context/BondingCurveContext";
import { usePackStyle } from "../context/PackStyleContext";
import { usePayment } from "../context/PaymentContext";
import type { VideoClip } from "../context/VideoFeedContext";
import { BtcLogo } from "./BtcLogo";

interface PurchaseModalProps {
  clip: VideoClip;
  onClose: () => void;
}

// ─── Error message mapping ────────────────────────────────────────────────────
// Maps backend error strings to user-friendly BTC-only language.
// Never exposes "ckBTC", "ledger", "principal", "approval", or "allowance".

function mapPurchaseError(raw: string): {
  message: string;
  retryable: boolean;
} {
  const lower = raw.toLowerCase();

  if (lower.includes("insufficient") || lower.includes("balance")) {
    return {
      message: "Not enough BTC in your wallet.",
      retryable: false,
    };
  }
  if (lower.includes("cancelled") || lower.includes("canceled")) {
    return {
      message: "", // dismiss cleanly — no error shown
      retryable: false,
    };
  }
  if (
    lower.includes("processing") ||
    lower.includes("transfer") ||
    lower.includes("ledger") ||
    lower.includes("timeout") ||
    lower.includes("retry")
  ) {
    return {
      message: "Payment processing error. Please try again.",
      retryable: true,
    };
  }
  if (lower.includes("already purchased") || lower.includes("duplicate")) {
    return {
      message: "You already own a copy of this clip.",
      retryable: false,
    };
  }
  if (lower.includes("sold out")) {
    return {
      message: "This clip is sold out.",
      retryable: false,
    };
  }

  // Generic fallback — always retryable
  return {
    message: "Something went wrong. Please try again.",
    retryable: true,
  };
}

// ─── SlideToConfirm ───────────────────────────────────────────────────────────

function SlideToConfirm({
  onConfirm,
  disabled,
  accentR,
  accentG,
  accentB,
}: {
  onConfirm: () => void;
  disabled: boolean;
  accentR: number;
  accentG: number;
  accentB: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [knobX, setKnobX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const dragStart = useRef<{ pointerX: number; startKnob: number } | null>(
    null,
  );

  const TRACK_HEIGHT = 56;
  const KNOB_SIZE = 44;
  const KNOB_PADDING = 6;

  const accentSolid = `rgb(${accentR},${accentG},${accentB})`;
  const accentGradient = `linear-gradient(135deg, rgb(${accentR},${accentG},${accentB}) 0%, rgba(${Math.round(accentR * 0.78)},${Math.round(accentG * 0.78)},${Math.round(accentB * 0.78)},1) 100%)`;
  const accentBorder = `rgba(${accentR},${accentG},${accentB},0.25)`;
  const accentText = `rgba(${Math.round(accentR * 0.5)},${Math.round(accentG * 0.5)},${Math.round(accentB * 0.7)},1)`;

  const getMaxX = useCallback(() => {
    if (!trackRef.current) return 200;
    return trackRef.current.offsetWidth - KNOB_SIZE - KNOB_PADDING * 2;
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || isComplete) return;
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setIsDragging(true);
      dragStart.current = { pointerX: e.clientX, startKnob: knobX };
    },
    [disabled, isComplete, knobX],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !dragStart.current) return;
      const delta = e.clientX - dragStart.current.pointerX;
      const newX = Math.max(
        0,
        Math.min(dragStart.current.startKnob + delta, getMaxX()),
      );
      setKnobX(newX);
      if (newX >= getMaxX() * 0.85) {
        setKnobX(getMaxX());
        setIsComplete(true);
        setIsDragging(false);
        dragStart.current = null;
        setTimeout(onConfirm, 300);
      }
    },
    [isDragging, getMaxX, onConfirm],
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    dragStart.current = null;
    if (!isComplete) setKnobX(0);
  }, [isDragging, isComplete]);

  const maxX = getMaxX();
  const progress = maxX > 0 ? knobX / maxX : 0;
  const labelOpacity = Math.max(0, 1 - progress * 2.5);

  return (
    <div
      ref={trackRef}
      style={{
        position: "relative",
        height: TRACK_HEIGHT,
        borderRadius: TRACK_HEIGHT / 2,
        background: `linear-gradient(135deg, rgba(${accentR},${accentG},${accentB},0.10) 0%, rgba(${accentR},${accentG},${accentB},0.16) 100%)`,
        border: `1.5px solid ${accentBorder}`,
        overflow: "hidden",
        userSelect: "none",
        cursor: "default",
      }}
    >
      {/* Fill track */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: "100%",
          width: `${KNOB_PADDING + KNOB_SIZE / 2 + knobX}px`,
          background: accentGradient,
          borderRadius: TRACK_HEIGHT / 2,
          opacity: isComplete ? 1 : 0.55,
          transition: isDragging
            ? "none"
            : "width 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          pointerEvents: "none",
        }}
      />

      {/* Label */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          opacity: labelOpacity,
          transition: "opacity 0.1s",
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: accentText,
            letterSpacing: "0.01em",
            fontFamily: "DM Sans, sans-serif",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <ChevronRight size={14} color={accentText} />
          Slide to reserve copy
        </span>
      </div>

      {/* Knob */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          position: "absolute",
          top: KNOB_PADDING,
          left: KNOB_PADDING + knobX,
          width: KNOB_SIZE,
          height: KNOB_SIZE,
          borderRadius: "50%",
          background: isComplete ? accentSolid : "#fff",
          boxShadow: isComplete
            ? `0 0 0 3px rgba(${accentR},${accentG},${accentB},0.28), 0 4px 16px rgba(${accentR},${accentG},${accentB},0.40)`
            : "0 2px 10px rgba(0,0,0,0.16), 0 1px 4px rgba(0,0,0,0.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: isDragging ? "grabbing" : "grab",
          transition: isDragging
            ? "none"
            : "left 0.35s cubic-bezier(0.34,1.56,0.64,1), background 0.2s, box-shadow 0.2s",
          touchAction: "none",
          zIndex: 2,
        }}
      >
        {isComplete ? (
          <Check size={20} color="#fff" strokeWidth={2.5} />
        ) : (
          <ChevronRight size={20} color={accentSolid} strokeWidth={2.5} />
        )}
      </div>
    </div>
  );
}

// ─── PurchaseModal ─────────────────────────────────────────────────────────────

export function PurchaseModal({ clip, onClose }: PurchaseModalProps) {
  const { activeStyle } = usePackStyle();
  const { purchase, currentPrice, nextPrice, progressPct, getCurveState } =
    useBondingCurve();
  const { recordCopySale } = usePayment();
  const { identity } = useInternetIdentity();
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isRetryable, setIsRetryable] = useState(false);
  const [editionInfo, setEditionInfo] = useState<{
    editionNumber: number;
    totalSupply: number;
    isSoldOut: boolean;
  } | null>(null);

  const accentR = activeStyle.accentR;
  const accentG = activeStyle.accentG;
  const accentB = activeStyle.accentB;
  const accentSolid = `rgb(${accentR},${accentG},${accentB})`;
  const accentBg = `rgba(${accentR},${accentG},${accentB},0.08)`;
  const accentBorder = `rgba(${accentR},${accentG},${accentB},0.20)`;
  const amberColor = "#f59e0b";
  const amberBg = "rgba(245,158,11,0.10)";
  const amberBorder = "rgba(245,158,11,0.25)";

  const price = currentPrice(clip.id);
  const next = nextPrice(clip.id);
  const pct = progressPct(clip.id);
  const curveState = getCurveState(clip.id);
  const copiesMinted = curveState?.copiesMinted ?? 0;
  const totalSupply = curveState?.totalSupply ?? 1000;

  const hasWallet = !!identity;

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleConfirm() {
    if (!hasWallet) {
      setErrorMsg("Connect your wallet to purchase.");
      setIsRetryable(false);
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");
    setIsRetryable(false);

    try {
      const result = await purchase(
        clip.id,
        clip.title,
        clip.videoUrl,
        clip.creatorName,
      );
      setEditionInfo(result);
      setStatus("success");

      // Fire-and-forget: record the copy sale split on the backend
      const priceUsd = currentPrice(clip.id) / 100;
      const creatorPrincipal = Principal.anonymous(); // creator principal not available on frontend clip type
      const buyerPrincipal = identity
        ? identity.getPrincipal()
        : Principal.anonymous();
      recordCopySale(clip.id, creatorPrincipal, buyerPrincipal, priceUsd).catch(
        (err) => console.error("[PurchaseModal] recordCopySale failed:", err),
      );

      setTimeout(onClose, 3200);
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      const { message, retryable } = mapPurchaseError(raw);

      // "cancelled" = dismiss silently
      if (!message) {
        onClose();
        return;
      }

      setErrorMsg(message);
      setIsRetryable(retryable);
      setStatus("error");
    }
  }

  function handleRetry() {
    setStatus("idle");
    setErrorMsg("");
    setIsRetryable(false);
  }

  return (
    <div
      data-ocid="releases.purchase_modal"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 400,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      {/* Backdrop */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Close"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape" || e.key === "Enter") onClose();
        }}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 480,
          background: "rgba(255,255,255,0.98)",
          borderRadius: "24px 24px 0 0",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
          padding: "24px 20px 40px",
          animation: "sheetSlideUp 0.28s cubic-bezier(0.32,0,0.12,1)",
        }}
      >
        {/* Handle */}
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            background: "rgba(0,0,0,0.12)",
            margin: "0 auto 20px",
          }}
        />

        {/* Close button */}
        <button
          type="button"
          data-ocid="releases.purchase_modal.close"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 20,
            right: 16,
            background: "rgba(0,0,0,0.06)",
            border: "none",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <X size={16} color="#374151" />
        </button>

        {status === "success" && editionInfo ? (
          /* Success state */
          <div
            data-ocid="releases.purchase_modal.success"
            style={{ textAlign: "center", padding: "16px 0 8px" }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: editionInfo.isSoldOut
                  ? `linear-gradient(135deg, rgb(${accentR},${accentG},${accentB}), rgba(${Math.round(accentR * 0.78)},${Math.round(accentG * 0.78)},${Math.round(accentB * 0.78)},1))`
                  : amberBg,
                border: editionInfo.isSoldOut
                  ? "none"
                  : `2px solid ${amberBorder}`,
                margin: "0 auto 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: editionInfo.isSoldOut
                  ? `0 0 0 8px rgba(${accentR},${accentG},${accentB},0.15)`
                  : `0 0 0 8px ${amberBg}`,
              }}
            >
              {editionInfo.isSoldOut ? (
                <Check size={28} color="#fff" strokeWidth={2.5} />
              ) : (
                <span style={{ fontSize: 28 }}>⏳</span>
              )}
            </div>

            <p
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#111",
                margin: "0 0 6px",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {editionInfo.isSoldOut
                ? "Minted to your Collection!"
                : "Copy Reserved!"}
            </p>

            {/* Edition badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: editionInfo.isSoldOut ? accentBg : amberBg,
                border: `1px solid ${editionInfo.isSoldOut ? accentBorder : amberBorder}`,
                borderRadius: 20,
                padding: "5px 14px",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: editionInfo.isSoldOut ? accentSolid : amberColor,
                  fontFamily: "DM Sans, sans-serif",
                  letterSpacing: "0.01em",
                }}
              >
                Copy #{editionInfo.editionNumber}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                / {editionInfo.totalSupply.toLocaleString()}
              </span>
            </div>

            {!editionInfo.isSoldOut && (
              <>
                <p
                  style={{
                    fontSize: 13,
                    color: "#374151",
                    fontFamily: "DM Sans, sans-serif",
                    margin: "0 0 12px",
                    lineHeight: 1.5,
                  }}
                >
                  Pending — mints to your Collection when all 1,000 copies sell
                  out.
                </p>

                {/* Progress toward sell-out */}
                <div
                  style={{
                    background: "rgba(0,0,0,0.04)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    marginBottom: 4,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                      fontSize: 12,
                      color: "#6b7280",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    <span>Sell-out progress</span>
                    <span style={{ fontWeight: 600, color: amberColor }}>
                      {editionInfo.editionNumber} /{" "}
                      {editionInfo.totalSupply.toLocaleString()} sold
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      borderRadius: 3,
                      background: "rgba(0,0,0,0.07)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${(editionInfo.editionNumber / editionInfo.totalSupply) * 100}%`,
                        borderRadius: 3,
                        background: `linear-gradient(90deg, ${amberColor}, rgba(245,158,11,0.7))`,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Header */}
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#111",
                margin: "0 0 4px",
                fontFamily: "DM Sans, sans-serif",
                paddingRight: 36,
              }}
            >
              {clip.title || "Untitled Moment"}
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--echo-text-secondary)",
                margin: "0 0 20px",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              by @{clip.creatorName}
            </p>

            {/* No wallet warning */}
            {!hasWallet && (
              <div
                style={{
                  background: "rgba(239,68,68,0.07)",
                  border: "1px solid rgba(239,68,68,0.20)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  marginBottom: 16,
                  fontSize: 13,
                  color: "#dc2626",
                  fontFamily: "DM Sans, sans-serif",
                  textAlign: "center",
                }}
              >
                Connect wallet to purchase
              </div>
            )}

            {/* Price breakdown */}
            <div
              style={{
                background: accentBg,
                border: `1px solid ${accentBorder}`,
                borderRadius: 14,
                padding: "14px 16px",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    color: "#374151",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  Current price
                </span>
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: accentSolid,
                    fontFamily: "DM Sans, sans-serif",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <BtcLogo size={16} />${(price / 100).toFixed(2)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: "#9ca3af",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  Next copy price
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: "#6b7280",
                    fontFamily: "DM Sans, sans-serif",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <BtcLogo size={13} />${(next / 100).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Sell-out mechanic notice */}
            <div
              style={{
                background: amberBg,
                border: `1px solid ${amberBorder}`,
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 16,
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
              }}
            >
              <span style={{ fontSize: 14, flexShrink: 0 }}>⏳</span>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: amberColor,
                    fontFamily: "DM Sans, sans-serif",
                    marginBottom: 2,
                  }}
                >
                  Mints when sold out
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    fontFamily: "DM Sans, sans-serif",
                    lineHeight: 1.4,
                  }}
                >
                  Your copy is reserved now. It moves to your Collection only
                  when all 1,000 copies sell.
                </div>
              </div>
            </div>

            {/* Sell-out progress */}
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 5,
                  fontSize: 11,
                  color: "var(--echo-text-muted)",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                <span>Sell-out progress</span>
                <span>
                  {copiesMinted.toLocaleString()} /{" "}
                  {totalSupply.toLocaleString()} copies sold
                </span>
              </div>
              <div
                style={{
                  height: 4,
                  borderRadius: 2,
                  background: "rgba(0,0,0,0.07)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    borderRadius: 2,
                    background: `linear-gradient(90deg, ${accentSolid}, rgba(${accentR},${accentG},${accentB},0.7))`,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>

            {/* Error */}
            {status === "error" && errorMsg && (
              <div
                data-ocid="releases.purchase_modal.error"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  marginBottom: 16,
                  fontSize: 13,
                  color: "#dc2626",
                  fontFamily: "DM Sans, sans-serif",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <span>{errorMsg}</span>
                {isRetryable && (
                  <button
                    type="button"
                    data-ocid="releases.purchase_modal.retry"
                    onClick={handleRetry}
                    aria-label="Retry payment"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      background: "rgba(239,68,68,0.10)",
                      border: "1px solid rgba(239,68,68,0.28)",
                      borderRadius: 8,
                      padding: "4px 10px",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#dc2626",
                      fontFamily: "DM Sans, sans-serif",
                      flexShrink: 0,
                    }}
                  >
                    <RotateCcw size={12} />
                    Retry
                  </button>
                )}
              </div>
            )}

            {/* Slide to confirm — hidden during loading or after error, replaced by retry */}
            {status !== "error" && (
              <SlideToConfirm
                onConfirm={handleConfirm}
                disabled={status === "loading" || !hasWallet}
                accentR={accentR}
                accentG={accentG}
                accentB={accentB}
              />
            )}

            {/* Re-show slide after non-retryable error (show disabled) */}
            {status === "error" && !isRetryable && errorMsg && (
              <SlideToConfirm
                onConfirm={handleConfirm}
                disabled={true}
                accentR={accentR}
                accentG={accentG}
                accentB={accentB}
              />
            )}

            {/* Retry button shown as slide replacement for retryable errors */}
            {status === "error" && isRetryable && (
              <button
                type="button"
                onClick={handleRetry}
                style={{
                  width: "100%",
                  height: 56,
                  borderRadius: 28,
                  background: `linear-gradient(135deg, rgb(${accentR},${accentG},${accentB}) 0%, rgba(${Math.round(accentR * 0.78)},${Math.round(accentG * 0.78)},${Math.round(accentB * 0.78)},1) 100%)`,
                  border: "none",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily: "DM Sans, sans-serif",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <RotateCcw size={16} />
                Try Again
              </button>
            )}

            {status === "loading" && (
              <p
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "var(--echo-text-muted)",
                  marginTop: 10,
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                Reserving your copy…
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
