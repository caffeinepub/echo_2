import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMomentDraft } from "../context/MomentDraftContext";
import { usePackStyle } from "../context/PackStyleContext";

interface MintMomentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const THUMB_DIAMETER = 48;
const THUMB_RADIUS = THUMB_DIAMETER / 2;

function SlideToMint({
  onComplete,
  accentRgb,
  accentOklch,
}: {
  onComplete: () => void;
  accentRgb: string;
  accentOklch: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [completed, setCompleted] = useState(false);

  const accentColor = `oklch(${accentOklch})`;
  const trackBg = `rgba(${accentRgb},0.12)`;
  const trackBorder = `rgba(${accentRgb},0.25)`;
  const fillGradient = `linear-gradient(90deg, rgba(${accentRgb},0.18), rgba(${accentRgb},0.28))`;
  const labelColor = `rgba(${accentRgb},0.75)`;

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
        background: trackBg,
        border: `1.5px solid ${trackBorder}`,
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
          background: completed ? accentColor : fillGradient,
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
              color: labelColor,
              letterSpacing: "0.04em",
              opacity: 1 - progress * 2,
              transition: "opacity 0.1s",
              fontFamily: "var(--font-ui)",
            }}
          >
            Slide to mint
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
              fontFamily: "var(--font-ui)",
            }}
          >
            ✓ Minting…
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
            background: `linear-gradient(145deg, oklch(${accentOklch}), rgba(${accentRgb},0.85))`,
            boxShadow: isDragging
              ? `0 4px 18px rgba(${accentRgb},0.45)`
              : `0 2px 10px rgba(${accentRgb},0.28)`,
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
  const { activeStyle } = usePackStyle();
  const controls = useAnimationControls();
  const [btcPrice, setBtcPrice] = useState<number | null>(null);

  const accentRgb = `${activeStyle.accentR},${activeStyle.accentG},${activeStyle.accentB}`;
  const accentColor = `oklch(${activeStyle.accentOklch})`;
  const accentColorDark = `oklch(${activeStyle.accentOklchDark})`;
  const dividerColor = `rgba(${accentRgb},0.15)`;
  const sectionLabelColor = `oklch(${activeStyle.accentOklchDark})`;

  // Fetch BTC price from Coinbase
  useEffect(() => {
    if (!open) return;
    async function fetchBtcPrice() {
      try {
        const res = await fetch(
          "https://api.coinbase.com/v2/prices/BTC-USD/spot",
        );
        const data = await res.json();
        setBtcPrice(Number.parseFloat(data.data.amount));
      } catch {
        setBtcPrice(null);
      }
    }
    fetchBtcPrice();
  }, [open]);

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

  function usdToBtc(usd: number): string {
    if (!btcPrice) return "...";
    return (usd / btcPrice).toFixed(6);
  }

  const SECTION_LABEL: React.CSSProperties = {
    fontSize: "10px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    fontWeight: 600,
    color: sectionLabelColor,
    marginBottom: "12px",
    display: "block",
    fontFamily: "var(--font-ui)",
  };

  const DIVIDER: React.CSSProperties = {
    height: "1px",
    background: dividerColor,
    margin: "22px 0",
    border: "none",
  };

  // Ambient particles — tinted to accent color
  const PARTICLES = [
    {
      id: "p1",
      w: 320,
      h: 320,
      top: "8%",
      left: "5%",
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
      blur: 50,
      opacity: 0.04,
      drift: "driftA",
      duration: 16,
    },
  ];

  const STEPS = [
    "Capture 1 photo",
    "Enter a title (optional)",
    "Slide to pay $1 in BTC",
    "NFT is created and posted to Releases",
  ];

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
                    background: `rgba(${accentRgb},1)`,
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
                padding: "28px 24px 36px",
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

              {/* ── Title ─────────────────────────────────────────────────── */}
              <div style={{ marginBottom: 6 }}>
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: 800,
                    color: "#fff",
                    margin: "0 0 8px",
                    letterSpacing: "-0.02em",
                    fontFamily: "var(--font-ui)",
                  }}
                >
                  Mint a Moment
                </h2>
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.50)",
                    margin: 0,
                    lineHeight: 1.55,
                    fontFamily: "var(--font-ui)",
                  }}
                >
                  Mint a photo NFT and compete for likes during the weekly
                  round.
                </p>
              </div>

              <hr style={DIVIDER} />

              {/* ── How It Works ──────────────────────────────────────────── */}
              <div style={{ marginBottom: 4 }}>
                <span style={SECTION_LABEL}>How It Works</span>
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
                          background: `rgba(${accentRgb},0.15)`,
                          border: `1px solid rgba(${accentRgb},0.35)`,
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
                            color: accentColor,
                            fontFamily: "var(--font-ui)",
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
                          fontFamily: "var(--font-ui)",
                        }}
                      >
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <hr style={DIVIDER} />

              {/* ── Mint Cost ─────────────────────────────────────────────── */}
              <div style={{ marginBottom: 4 }}>
                <span style={SECTION_LABEL}>Mint Cost</span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "14px 16px",
                    borderRadius: "14px",
                    background: `rgba(${accentRgb},0.06)`,
                    border: `1px solid rgba(${accentRgb},0.18)`,
                  }}
                >
                  {/* BTC icon */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "rgba(247,147,26,0.15)",
                      border: "1px solid rgba(247,147,26,0.30)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "#f7931a",
                      }}
                    >
                      ₿
                    </span>
                  </div>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "24px",
                          fontWeight: 800,
                          color: "#fff",
                          letterSpacing: "-0.02em",
                          fontFamily: "var(--font-ui)",
                        }}
                      >
                        $1
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "rgba(255,255,255,0.40)",
                          fontFamily: "var(--font-ui)",
                        }}
                      >
                        USD
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.45)",
                        fontFamily: "var(--font-ui)",
                      }}
                    >
                      ≈ {usdToBtc(1)} BTC
                    </span>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    <div
                      style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        background: "rgba(247,147,26,0.12)",
                        border: "1px solid rgba(247,147,26,0.25)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#f7931a",
                          letterSpacing: "0.04em",
                          fontFamily: "var(--font-ui)",
                        }}
                      >
                        BTC only
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <hr style={DIVIDER} />

              {/* ── Weekly Round Rules ────────────────────────────────────── */}
              <div style={{ marginBottom: 4 }}>
                <span style={SECTION_LABEL}>Weekly Round Rules</span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {[
                    "Unlimited mints per round",
                    "Only the Top 25 most liked NFTs survive",
                    "All other NFTs are deleted when the round ends",
                  ].map((rule) => (
                    <div
                      key={rule}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          flexShrink: 0,
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: accentColor,
                          marginTop: 6,
                        }}
                      />
                      <span
                        style={{
                          fontSize: "13px",
                          color: "rgba(255,255,255,0.75)",
                          lineHeight: 1.5,
                          fontFamily: "var(--font-ui)",
                        }}
                      >
                        {rule}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <hr style={DIVIDER} />

              {/* ── Survival Info ─────────────────────────────────────────── */}
              <div
                style={{
                  marginBottom: 4,
                  padding: "14px 16px",
                  borderRadius: "14px",
                  background: `rgba(${accentRgb},0.06)`,
                  border: `1px solid rgba(${accentRgb},0.18)`,
                }}
              >
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.70)",
                    margin: 0,
                    lineHeight: 1.6,
                    fontFamily: "var(--font-ui)",
                  }}
                >
                  Your NFT competes for likes during the 7-day round.{" "}
                  <span
                    style={{
                      color: accentColorDark,
                      fontWeight: 600,
                    }}
                  >
                    At the end of each round, only the top 25 most liked NFTs
                    remain permanently.
                  </span>{" "}
                  All others are removed.
                </p>
              </div>

              <hr style={DIVIDER} />

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
                      fontFamily: "var(--font-ui)",
                    }}
                  >
                    You have an active draft. Starting a new Moment will resume
                    it.
                  </p>
                </div>
              )}

              {/* Slide to mint */}
              <SlideToMint
                onComplete={handleSlideComplete}
                accentRgb={accentRgb}
                accentOklch={activeStyle.accentOklch}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
