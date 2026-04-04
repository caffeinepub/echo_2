import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMomentDraft } from "../context/MomentDraftContext";

interface MintMomentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const MINT_GREEN = "rgba(52,168,132,1)";
const MINT_TRACK_BG = "rgba(52,168,132,0.12)";
const MINT_TRACK_BORDER = "rgba(52,168,132,0.25)";
const MINT_FILL = "rgba(52,168,132,0.18)";
const MINT_LABEL = "rgba(52,168,132,0.75)";

const SECTION_LABEL_STYLE: React.CSSProperties = {
  fontSize: "10px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontWeight: 600,
  color: MINT_GREEN,
  marginBottom: "10px",
  display: "block",
};

const DIVIDER_STYLE: React.CSSProperties = {
  height: "1px",
  background: "rgba(52,168,132,0.18)",
  margin: "20px 0",
  border: "none",
};

type PaymentOption = "USDC" | "BTC" | "ETH" | "SOL";

const PAYMENT_OPTIONS: PaymentOption[] = ["USDC", "BTC", "ETH", "SOL"];

const DETAILS = [
  "9 photos → Common collectibles",
  "1 video → Rare collectible",
  "Collectibles = pack supply × 90% photos / 10% video",
];

const STEPS = [
  "Capture 9 photos",
  "Record 1 video (max 30 seconds)",
  "Capture 1 cover photo for the pack art",
  "Mint into sealed collectible packs",
];

const THUMB_DIAMETER = 48;
const THUMB_RADIUS = THUMB_DIAMETER / 2;

const PARTICLES = [
  {
    id: "p1",
    w: 320,
    h: 320,
    top: "8%",
    left: "5%",
    color: "rgba(52,200,140,1)",
    blur: 80,
    opacity: 0.06,
    drift: "driftA",
    duration: 14,
  },
  {
    id: "p2",
    w: 240,
    h: 240,
    top: "60%",
    left: "70%",
    color: "rgba(80,220,160,1)",
    blur: 70,
    opacity: 0.05,
    drift: "driftB",
    duration: 18,
  },
  {
    id: "p3",
    w: 180,
    h: 180,
    top: "30%",
    left: "80%",
    color: "rgba(52,168,132,1)",
    blur: 60,
    opacity: 0.04,
    drift: "driftA",
    duration: 12,
  },
  {
    id: "p4",
    w: 280,
    h: 200,
    top: "75%",
    left: "10%",
    color: "rgba(100,230,180,1)",
    blur: 90,
    opacity: 0.05,
    drift: "driftB",
    duration: 20,
  },
  {
    id: "p5",
    w: 150,
    h: 150,
    top: "15%",
    left: "55%",
    color: "rgba(52,168,132,1)",
    blur: 50,
    opacity: 0.04,
    drift: "driftA",
    duration: 16,
  },
  {
    id: "p6",
    w: 200,
    h: 260,
    top: "45%",
    left: "25%",
    color: "rgba(70,200,150,1)",
    blur: 75,
    opacity: 0.05,
    drift: "driftB",
    duration: 22,
  },
  {
    id: "p7",
    w: 120,
    h: 120,
    top: "85%",
    left: "85%",
    color: "rgba(52,168,132,1)",
    blur: 45,
    opacity: 0.06,
    drift: "driftA",
    duration: 10,
  },
];

function SlideToMint({ onComplete }: { onComplete: () => void }) {
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
            Slide to start
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
              fontWeight: 600,
              color: "#fff",
              letterSpacing: "0.04em",
            }}
          >
            ✓ Starting…
          </span>
        </div>
      )}
      {/* Thumb */}
      {!completed && (
        <div
          style={{
            position: "absolute",
            top: "2px",
            left: thumbLeft,
            width: THUMB_DIAMETER,
            height: THUMB_DIAMETER,
            borderRadius: "50%",
            background: `linear-gradient(145deg, ${MINT_GREEN}, rgba(42,144,112,1))`,
            boxShadow: isDragging
              ? "0 4px 18px rgba(52,168,132,0.45)"
              : "0 2px 10px rgba(52,168,132,0.28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: isDragging
              ? "none"
              : "left 0.25s cubic-bezier(0.34,1.56,0.64,1)",
            pointerEvents: "none",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 9h6M9 6l3 3-3 3"
              stroke="#fff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

export function MintMomentModal({
  open,
  onClose,
  onConfirm,
}: MintMomentModalProps) {
  const { hasDraft } = useMomentDraft();
  const controls = useAnimationControls();
  const [selectedPayment, setSelectedPayment] = useState<PaymentOption>("USDC");

  // Inject keyframes once
  useEffect(() => {
    const id = "mint-modal-keyframes";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes driftA {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33%       { transform: translate(18px, -12px) scale(1.04); }
        66%       { transform: translate(-10px, 8px) scale(0.97); }
      }
      @keyframes driftB {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33%       { transform: translate(-14px, 10px) scale(1.03); }
        66%       { transform: translate(12px, -8px) scale(0.98); }
      }
      @keyframes pulseRing {
        0%   { transform: scale(0.88); opacity: 0.8; }
        60%  { transform: scale(1.10); opacity: 0.35; }
        100% { transform: scale(0.88); opacity: 0.8; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  const handleSlideComplete = useCallback(() => {
    controls.start({
      scale: [1, 1.04, 0.97, 1],
      transition: { duration: 0.45, ease: "easeInOut" },
    });
    setTimeout(onConfirm, 480);
  }, [controls, onConfirm]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            animate={controls}
            initial={{ y: 60, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "480px",
              background: "rgba(8,16,12,0.97)",
              borderRadius: "28px 28px 0 0",
              overflow: "hidden",
              maxHeight: "92dvh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Ambient particles */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                overflow: "hidden",
                zIndex: 0,
              }}
            >
              {PARTICLES.map((p) => (
                <div
                  key={p.id}
                  style={{
                    position: "absolute",
                    top: p.top,
                    left: p.left,
                    width: p.w,
                    height: p.h,
                    borderRadius: "50%",
                    background: p.color,
                    filter: `blur(${p.blur}px)`,
                    opacity: p.opacity,
                    animation: `${p.drift} ${p.duration}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>

            {/* Scrollable content */}
            <div
              style={{
                position: "relative",
                zIndex: 1,
                overflowY: "auto",
                padding: "28px 24px 32px",
                flex: 1,
              }}
            >
              {/* Handle bar */}
              <div
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.18)",
                  margin: "0 auto 24px",
                }}
              />

              {/* Title */}
              <div style={{ marginBottom: 24 }}>
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: 800,
                    color: "#fff",
                    margin: "0 0 6px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Mint a Moment
                </h2>
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.50)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  Capture 9 photos + 1 video to create a sealed collectible set.
                </p>
              </div>

              <hr style={DIVIDER_STYLE} />

              {/* Steps */}
              <div style={{ marginBottom: 24 }}>
                <span style={SECTION_LABEL_STYLE}>Creation Flow</span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {STEPS.map((step, i) => (
                    <div
                      key={step}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          flexShrink: 0,
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: "rgba(52,168,132,0.15)",
                          border: "1px solid rgba(52,168,132,0.35)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginTop: 1,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            color: MINT_GREEN,
                          }}
                        >
                          {i + 1}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "13px",
                          color: "rgba(255,255,255,0.80)",
                          lineHeight: 1.5,
                          paddingTop: "2px",
                        }}
                      >
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <hr style={DIVIDER_STYLE} />

              {/* Collectible Details */}
              <div style={{ marginBottom: 24 }}>
                <span style={SECTION_LABEL_STYLE}>Collectible Contents</span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {DETAILS.map((d) => (
                    <div
                      key={d}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          background: MINT_GREEN,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: "12px",
                          color: "rgba(255,255,255,0.55)",
                        }}
                      >
                        {d}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <hr style={DIVIDER_STYLE} />

              {/* Payment preference */}
              <div style={{ marginBottom: 28 }}>
                <span style={SECTION_LABEL_STYLE}>Preferred Payment</span>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {PAYMENT_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedPayment(opt)}
                      style={{
                        padding: "7px 16px",
                        borderRadius: "20px",
                        border:
                          selectedPayment === opt
                            ? `1.5px solid ${MINT_GREEN}`
                            : "1.5px solid rgba(255,255,255,0.12)",
                        background:
                          selectedPayment === opt
                            ? "rgba(52,168,132,0.15)"
                            : "rgba(255,255,255,0.05)",
                        color:
                          selectedPayment === opt
                            ? MINT_GREEN
                            : "rgba(255,255,255,0.55)",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Draft warning */}
              {hasDraft && (
                <div
                  style={{
                    marginBottom: 20,
                    padding: "10px 14px",
                    borderRadius: "12px",
                    background: "rgba(245,158,11,0.10)",
                    border: "1px solid rgba(245,158,11,0.25)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    style={{ flexShrink: 0, marginTop: 1 }}
                    aria-hidden="true"
                  >
                    <path
                      d="M7 2L12 11H2L7 2z"
                      stroke="#f59e0b"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7 5.5v3"
                      stroke="#f59e0b"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                    <circle cx="7" cy="10" r="0.6" fill="#f59e0b" />
                  </svg>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "rgba(245,158,11,0.85)",
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    You have an active draft. Starting a new Moment will resume
                    it.
                  </p>
                </div>
              )}

              {/* Slide to start */}
              <SlideToMint onComplete={handleSlideComplete} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
