import { Check, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { BtcLogo } from "./BtcLogo";

export interface MintSetConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** Optional upload progress message shown during minting */
  uploadStatus?: string | null;
  /** Optional error message if upload failed — user can retry */
  uploadError?: string | null;
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
  uploadStatus,
  uploadError,
}: MintSetConfirmModalProps) {
  if (!open) return null;

  const isUploading = !!uploadStatus;

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
              padding: "28px 24px 20px",
              borderBottom: "1px solid rgba(52,168,132,0.12)",
            }}
          >
            <h2
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "#111",
                margin: "0 0 10px",
                lineHeight: 1.1,
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Confirm Mint
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "#374151",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Minting costs{" "}
              <strong
                style={{
                  color: "#111",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <BtcLogo size={14} style={{ verticalAlign: "middle" }} />
                $1
              </strong>{" "}
              in BTC. Your 15-second clip will be posted to the Releases feed.
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: "20px 24px 0" }}>
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
                "1 video clip (15 sec max) → 1 NFT posted to Releases",
                "Your clip immediately visible in the feed",
                "Others can buy ownership copies via bonding curve",
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
            {/* Upload error banner */}
            {uploadError && (
              <div
                style={{
                  marginBottom: 12,
                  padding: "10px 14px",
                  background: "rgba(220,38,38,0.08)",
                  border: "1.5px solid rgba(220,38,38,0.25)",
                  borderRadius: 12,
                  fontSize: 13,
                  color: "#dc2626",
                  fontFamily: "DM Sans, sans-serif",
                  fontWeight: 500,
                }}
              >
                ⚠️ {uploadError}
              </div>
            )}

            {/* Upload progress banner */}
            {isUploading && (
              <div
                style={{
                  marginBottom: 12,
                  padding: "10px 14px",
                  background: "rgba(52,168,132,0.08)",
                  border: "1.5px solid rgba(52,168,132,0.20)",
                  borderRadius: 12,
                  fontSize: 13,
                  color: MINT_GREEN,
                  fontFamily: "DM Sans, sans-serif",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(52,168,132,0.25)",
                    borderTopColor: MINT_GREEN,
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    flexShrink: 0,
                  }}
                />
                {uploadStatus}
              </div>
            )}

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
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <BtcLogo size={16} />
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: MINT_GREEN,
                    letterSpacing: "-0.02em",
                  }}
                >
                  $1
                </span>
              </div>
            </div>

            {/* Show spinner overlay while uploading, otherwise show slider */}
            {isUploading ? (
              <div
                style={{
                  height: THUMB_DIAMETER + 4,
                  borderRadius: (THUMB_DIAMETER + 4) / 2,
                  background: MINT_TRACK_BG,
                  border: `1.5px solid ${MINT_TRACK_BORDER}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 600,
                  color: MINT_LABEL,
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {uploadStatus}…
              </div>
            ) : (
              <SlideToConfirm onComplete={onConfirm} />
            )}

            <button
              type="button"
              data-ocid="mint_set.cancel_button"
              onClick={onClose}
              disabled={isUploading}
              style={{
                width: "100%",
                marginTop: "10px",
                padding: "10px",
                background: "transparent",
                border: "none",
                fontSize: "13px",
                color: isUploading ? "#d1d5db" : "#9ca3af",
                cursor: isUploading ? "not-allowed" : "pointer",
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
