import { useEffect, useState } from "react";
import { useBondingCurve } from "../context/BondingCurveContext";
import { usePackStyle } from "../context/PackStyleContext";
import type { VideoClip } from "../context/VideoFeedContext";
import { BtcLogo } from "./BtcLogo";
import { PurchaseModal } from "./PurchaseModal";

interface BondingCurveModuleProps {
  clip: VideoClip;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function BondingCurveModule({ clip }: BondingCurveModuleProps) {
  const { activeStyle } = usePackStyle();
  const {
    getOrCreateCurve,
    currentPrice,
    nextPrice,
    remaining,
    progressPct,
    hasPurchased,
    getCurveState,
  } = useBondingCurve();
  const [showModal, setShowModal] = useState(false);
  const [justSoldOut, setJustSoldOut] = useState(false);

  // Ensure curve state exists
  getOrCreateCurve(clip.id);

  const accentR = activeStyle.accentR;
  const accentG = activeStyle.accentG;
  const accentB = activeStyle.accentB;
  const accentSolid = `rgb(${accentR},${accentG},${accentB})`;
  const accentBg = `rgba(${accentR},${accentG},${accentB},0.08)`;
  const accentBorder = `rgba(${accentR},${accentG},${accentB},0.18)`;
  const accentGlow = `rgba(${accentR},${accentG},${accentB},0.12)`;

  const price = currentPrice(clip.id);
  const next = nextPrice(clip.id);
  const rem = remaining(clip.id);
  const pct = progressPct(clip.id);
  const owned = hasPurchased(clip.id);
  const soldOut = rem === 0;

  // Watch for sell-out moment and trigger celebration animation
  const curveState = getCurveState(clip.id);
  useEffect(() => {
    if (curveState && curveState.copiesMinted >= curveState.totalSupply) {
      setJustSoldOut(true);
      const t = setTimeout(() => setJustSoldOut(false), 3000);
      return () => clearTimeout(t);
    }
  }, [curveState]);

  return (
    <>
      <div
        data-ocid="releases.ownership_module"
        style={{
          marginTop: 8,
          borderRadius: 16,
          background: soldOut
            ? `rgba(${accentR},${accentG},${accentB},0.04)`
            : "rgba(255,255,255,0.75)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: `1px solid ${soldOut ? accentBorder : accentBorder}`,
          boxShadow: justSoldOut
            ? `0 0 0 2px ${accentSolid}, 0 4px 20px ${accentGlow}`
            : `0 2px 12px ${accentGlow}, 0 1px 3px rgba(0,0,0,0.05)`,
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          transition: "box-shadow 0.4s ease",
        }}
      >
        {/* Label row */}
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: accentSolid,
            opacity: soldOut ? 1 : 0.65,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "DM Sans, sans-serif",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {soldOut ? (
            <>
              <span
                style={{
                  animation: justSoldOut
                    ? "glow-pulse 1s ease-in-out 3"
                    : "none",
                  display: "inline-block",
                }}
              >
                ✦
              </span>
              SOLD OUT — Minting to Collections
            </>
          ) : (
            "Own this moment"
          )}
        </div>

        {soldOut ? (
          /* Sold-out state */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: accentSolid,
                fontFamily: "DM Sans, sans-serif",
                animation: justSoldOut
                  ? "glow-pulse 1.2s ease-in-out 3"
                  : "none",
              }}
            >
              All 1,000 copies sold!
            </div>
            {owned && (
              <div
                style={{
                  fontSize: 12,
                  color: "var(--echo-text-secondary)",
                  fontFamily: "DM Sans, sans-serif",
                  lineHeight: 1.4,
                }}
              >
                Your copy is now in your Collection ✓
              </div>
            )}
          </div>
        ) : (
          /* Normal state: price row + buy button */
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            {/* Price info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <BtcLogo size={15} style={{ marginBottom: 1 }} />
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#0d1520",
                    fontFamily: "DM Sans, sans-serif",
                    lineHeight: 1,
                  }}
                >
                  {formatCents(price)}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--echo-text-muted)",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  per copy
                </span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--echo-text-secondary)",
                  fontFamily: "DM Sans, sans-serif",
                  marginTop: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                {rem.toLocaleString()} left · next <BtcLogo size={11} />
                {formatCents(next)}
              </div>
            </div>

            {/* Buy button */}
            <button
              type="button"
              data-ocid="releases.buy_copy_button"
              disabled={owned}
              onClick={() => !owned && setShowModal(true)}
              style={{
                flexShrink: 0,
                height: 36,
                paddingLeft: 16,
                paddingRight: 16,
                borderRadius: 18,
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "DM Sans, sans-serif",
                border: "none",
                cursor: owned ? "not-allowed" : "pointer",
                background: owned
                  ? accentBg
                  : `linear-gradient(135deg, rgb(${accentR},${accentG},${accentB}), rgba(${Math.round(accentR * 0.82)},${Math.round(accentG * 0.82)},${Math.round(accentB * 0.82)},1))`,
                color: owned ? accentSolid : "#fff",
                boxShadow: owned
                  ? "none"
                  : `0 2px 8px rgba(${accentR},${accentG},${accentB},0.30)`,
                transition: "opacity 0.15s ease, transform 0.1s ease",
                letterSpacing: "0.01em",
              }}
            >
              {owned ? "Reserved ✓" : "Buy Copy"}
            </button>
          </div>
        )}

        {/* Progress bar */}
        <div
          style={{
            height: 3,
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

        {/* Footer label */}
        <div
          style={{
            fontSize: 10,
            color: "var(--echo-text-muted)",
            fontFamily: "DM Sans, sans-serif",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{pct.toFixed(1)}% collected · 1,000 total copies</span>
          {!soldOut && !owned && (
            <span style={{ opacity: 0.7 }}>Held until sold out</span>
          )}
        </div>
      </div>

      {showModal && (
        <PurchaseModal clip={clip} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
