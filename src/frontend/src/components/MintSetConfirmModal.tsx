import { Check, ChevronRight, Package, TrendingUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";

export interface MintSetConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const MINT_GREEN = "rgba(52,168,132,1)";
const MINT_TRACK_BG = "rgba(52,168,132,0.12)";
const MINT_TRACK_BORDER = "rgba(52,168,132,0.25)";
const MINT_FILL = "rgba(52,168,132,0.18)";
const MINT_LABEL = "rgba(52,168,132,0.75)";

const THUMB_DIAMETER = 48;
const THUMB_RADIUS = THUMB_DIAMETER / 2;

function SlideToConfirm({ onComplete }: { onComplete: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (completed) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(true);
    },
    [completed],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || completed) return;
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const trackWidth = rect.width - THUMB_DIAMETER;
      const x = e.clientX - rect.left - THUMB_RADIUS;
      const pct = Math.max(0, Math.min(1, x / trackWidth));
      setProgress(pct);
      if (pct >= 0.85) {
        setCompleted(true);
        setProgress(1);
        setIsDragging(false);
        setTimeout(onComplete, 320);
      }
    },
    [isDragging, completed, onComplete],
  );

  const handlePointerUp = useCallback(() => {
    if (completed) return;
    setIsDragging(false);
    setProgress(0);
  }, [completed]);

  const thumbLeft = `calc(${progress * 100}% - ${progress * THUMB_DIAMETER}px)`;

  return (
    <div
      ref={trackRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      data-ocid="mint_set.slider"
      style={{
        position: "relative",
        width: "100%",
        height: THUMB_DIAMETER + 4,
        borderRadius: (THUMB_DIAMETER + 4) / 2,
        background: MINT_TRACK_BG,
        border: `1.5px solid ${MINT_TRACK_BORDER}`,
        overflow: "hidden",
        cursor: completed ? "default" : "grab",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      {/* Fill */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: `calc(${progress * 100}% - ${progress * THUMB_DIAMETER}px + ${THUMB_DIAMETER}px)`,
          background: completed
            ? MINT_GREEN
            : `linear-gradient(90deg, ${MINT_FILL}, rgba(52,168,132,0.28))`,
          transition: completed ? "background 0.3s" : "none",
          pointerEvents: "none",
        }}
      />
      {/* Label */}
      {!completed && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: MINT_LABEL,
              letterSpacing: "0.04em",
              opacity: 1 - progress * 2,
              transition: "opacity 0.1s",
            }}
          >
            Slide to confirm payment
          </span>
        </div>
      )}
      {/* Completed label */}
      {completed && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "0.04em",
            }}
          >
            Payment confirmed ✓
          </span>
        </div>
      )}
      {/* Thumb */}
      <div
        style={{
          position: "absolute",
          top: 2,
          left: thumbLeft,
          width: THUMB_DIAMETER,
          height: THUMB_DIAMETER,
          borderRadius: "50%",
          background: completed
            ? MINT_GREEN
            : "linear-gradient(135deg, rgba(52,168,132,0.95), rgba(16,185,129,1))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: completed
            ? "0 0 0 3px rgba(52,168,132,0.30)"
            : "0 2px 8px rgba(52,168,132,0.35), 0 1px 3px rgba(0,0,0,0.14)",
          cursor: isDragging ? "grabbing" : "grab",
          transition: isDragging
            ? "none"
            : "left 0.35s cubic-bezier(0.34,1.56,0.64,1), background 0.2s, box-shadow 0.2s",
          touchAction: "none",
          zIndex: 2,
        }}
      >
        {completed ? (
          <Check size={20} color="#fff" strokeWidth={2.5} />
        ) : (
          <ChevronRight size={20} color="#fff" strokeWidth={2.5} />
        )}
      </div>
    </div>
  );
}

export function MintSetConfirmModal({
  open,
  onClose,
  onConfirm,
}: MintSetConfirmModalProps) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <div
        data-ocid="mint_set.modal"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          background: "rgba(0,0,0,0.60)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          style={{
            background: "#FCFCFC",
            borderRadius: "24px",
            maxWidth: "420px",
            width: "100%",
            maxHeight: "90dvh",
            overflowY: "auto",
            boxShadow:
              "0 24px 64px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.10), 0 0 0 1px rgba(52,168,132,0.12)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "28px 24px 0",
              borderBottom: "1px solid rgba(52,168,132,0.12)",
              paddingBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "12px",
                  background: "rgba(52,168,132,0.10)",
                  border: "1.5px solid rgba(52,168,132,0.22)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Package size={18} color={MINT_GREEN} />
              </div>
              <div>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "#111",
                    margin: 0,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                  }}
                >
                  Mint Set
                </h2>
              </div>
            </div>
            <p
              style={{
                fontSize: "14px",
                color: "#374151",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Minting a set costs{" "}
              <strong style={{ color: "#111" }}>$100</strong>.
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: "20px 24px 0" }}>
            {/* Description */}
            <div
              style={{
                background: "rgba(52,168,132,0.05)",
                border: "1.5px solid rgba(52,168,132,0.15)",
                borderRadius: "14px",
                padding: "14px 16px",
                marginBottom: "16px",
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  color: "#374151",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                Your set will be published to the{" "}
                <strong style={{ color: "#111" }}>Releases page</strong> as a
                pack collection for collectors. Each set automatically generates{" "}
                <strong style={{ color: "#111" }}>300 packs</strong>.
              </p>
            </div>

            {/* Pack economics — informational */}
            <p
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#6b7280",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                margin: "0 0 10px",
              }}
            >
              Pack Economics
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              {[
                { icon: "📦", label: "Total Packs", value: "300" },
                { icon: "💵", label: "Starting Price", value: "$10" },
                { icon: "🎯", label: "Max Price", value: "$60" },
                { icon: "📈", label: "Pricing Model", value: "Bonding Curve" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: "#fff",
                    border: "1px solid rgba(0,0,0,0.07)",
                    borderRadius: "12px",
                    padding: "10px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  <span style={{ fontSize: "13px" }}>{item.icon}</span>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#9ca3af",
                      fontWeight: 500,
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#111",
                      lineHeight: 1.2,
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Bonding curve note */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                marginBottom: "20px",
                padding: "10px 12px",
                background: "rgba(52,168,132,0.04)",
                borderRadius: "10px",
                border: "1px solid rgba(52,168,132,0.12)",
              }}
            >
              <TrendingUp
                size={14}
                color={MINT_GREEN}
                style={{ marginTop: "1px", flexShrink: 0 }}
              />
              <p
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                Price increases with each purchase — early collectors get the
                best rate. Price formula:{" "}
                <span style={{ fontFamily: "monospace", color: "#374151" }}>
                  $10 + (sold/300)² × $50
                </span>
              </p>
            </div>

            {/* What's included */}
            <p
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#6b7280",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                margin: "0 0 10px",
              }}
            >
              What's included
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                marginBottom: "20px",
              }}
            >
              {[
                "9 photos → Common collectibles",
                "1 video → Rare collectible",
                "Each pack contains 1 random collectible",
                "90% photo packs · 10% video packs",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "7px",
                  }}
                >
                  <Check
                    size={12}
                    color={MINT_GREEN}
                    style={{ marginTop: "2px", flexShrink: 0 }}
                  />
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      lineHeight: 1.4,
                    }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer / slider */}
          <div
            style={{
              padding: "0 24px 28px",
              borderTop: "1px solid rgba(0,0,0,0.06)",
              paddingTop: "16px",
            }}
          >
            {/* Fee summary */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
                padding: "12px 14px",
                background: "rgba(52,168,132,0.07)",
                border: "1.5px solid rgba(52,168,132,0.20)",
                borderRadius: "12px",
              }}
            >
              <span
                style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}
              >
                Minting fee
              </span>
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: MINT_GREEN,
                  letterSpacing: "-0.02em",
                }}
              >
                $100
              </span>
            </div>

            <SlideToConfirm onComplete={onConfirm} />

            <button
              type="button"
              data-ocid="mint_set.cancel_button"
              onClick={onClose}
              style={{
                width: "100%",
                marginTop: "10px",
                padding: "10px",
                background: "transparent",
                border: "none",
                fontSize: "13px",
                color: "#9ca3af",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
