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

const EARNINGS_SCENARIOS = [
  { packs: 25, label: "25 packs sold" },
  { packs: 100, label: "100 packs sold" },
  { packs: 300, label: "300 packs sold" },
];

/** Fixed-price earnings estimate (pricePerPack × packs × 0.95) */
function estimateRevenue(packs: number, pricePerPack = 10): number {
  return packs * pricePerPack * 0.95;
}

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
    "Upload 9 photos",
    "Record 1 video (max 30s)",
    "Mint the moment into 300 sealed packs",
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

            <div
              style={{
                position: "relative",
                zIndex: 1,
                overflowY: "auto",
                padding: "28px 24px 36px",
                flex: 1,
              }}
            >
              {/* Handle */}
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
                  Create a sealed collectible moment and distribute it through
                  limited packs.
                </p>
              </div>

              <hr style={DIVIDER} />

              {/* How It Works */}
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

              {/* Pack Structure */}
              <div style={{ marginBottom: 4 }}>
                <span style={SECTION_LABEL}>Pack Structure</span>
                <p
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.45)",
                    margin: "0 0 12px",
                    lineHeight: 1.5,
                    fontFamily: "var(--font-ui)",
                  }}
                >
                  Each Mint a Moment creates:
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {[
                    { label: "300 total packs", accent: false },
                    { label: "9 image collectibles (Common)", accent: false },
                    { label: "1 rare video collectible", accent: true },
                  ].map(({ label, accent }) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: accent
                            ? accentColor
                            : "rgba(255,255,255,0.30)",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: "13px",
                          color: accent
                            ? accentColorDark
                            : "rgba(255,255,255,0.75)",
                          fontWeight: accent ? 600 : 400,
                          fontFamily: "var(--font-ui)",
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
                <p
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.35)",
                    margin: "12px 0 0",
                    lineHeight: 1.55,
                    fontStyle: "italic",
                    fontFamily: "var(--font-ui)",
                  }}
                >
                  The rare video appears only once across the 300 pack supply.
                </p>
              </div>

              <hr style={DIVIDER} />

              {/* Mint Cost */}
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

              {/* Pack Pricing */}
              <div style={{ marginBottom: 4 }}>
                <span style={SECTION_LABEL}>Pack Pricing</span>
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.75)",
                      margin: "0 0 4px",
                      lineHeight: 1.5,
                      fontFamily: "var(--font-ui)",
                    }}
                  >
                    You set a{" "}
                    <span style={{ color: accentColorDark, fontWeight: 600 }}>
                      fixed price per pack
                    </span>{" "}
                    at mint time.
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.38)",
                      margin: 0,
                      lineHeight: 1.5,
                      fontFamily: "var(--font-ui)",
                    }}
                  >
                    Maximum $100 per pack. All 300 packs sell at the same price.
                    After the listing period, unsold packs are burned.
                  </p>
                </div>
              </div>

              <hr style={DIVIDER} />

              {/* Creator Earnings */}
              <div style={{ marginBottom: 4 }}>
                <span style={SECTION_LABEL}>Creator Earnings</span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.75)",
                        margin: "0 0 4px",
                        lineHeight: 1.5,
                        fontFamily: "var(--font-ui)",
                      }}
                    >
                      <span style={{ color: accentColorDark, fontWeight: 600 }}>
                        95%
                      </span>{" "}
                      of pack sales go directly to you.
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.38)",
                        margin: 0,
                        lineHeight: 1.5,
                        fontFamily: "var(--font-ui)",
                      }}
                    >
                      Minty receives 5%. Proceeds are deposited automatically to
                      your Minty wallet in BTC.
                    </p>
                  </div>
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.75)",
                        margin: "0 0 8px",
                        lineHeight: 1.5,
                        fontFamily: "var(--font-ui)",
                      }}
                    >
                      When the rare video NFT is resold:
                    </p>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <div
                        style={{
                          flex: 1,
                          padding: "8px 10px",
                          borderRadius: "8px",
                          background: `rgba(${accentRgb},0.08)`,
                          border: `1px solid rgba(${accentRgb},0.18)`,
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: 800,
                            color: accentColor,
                            fontFamily: "var(--font-ui)",
                          }}
                        >
                          4%
                        </div>
                        <div
                          style={{
                            fontSize: "10px",
                            color: "rgba(255,255,255,0.45)",
                            fontFamily: "var(--font-ui)",
                          }}
                        >
                          to you
                        </div>
                      </div>
                      <div
                        style={{
                          flex: 1,
                          padding: "8px 10px",
                          borderRadius: "8px",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: 800,
                            color: "rgba(255,255,255,0.55)",
                            fontFamily: "var(--font-ui)",
                          }}
                        >
                          1%
                        </div>
                        <div
                          style={{
                            fontSize: "10px",
                            color: "rgba(255,255,255,0.30)",
                            fontFamily: "var(--font-ui)",
                          }}
                        >
                          to Minty
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <hr style={DIVIDER} />

              {/* Earnings Estimator */}
              <div style={{ marginBottom: 4 }}>
                <span style={SECTION_LABEL}>Earnings Estimator</span>
                <p
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.35)",
                    margin: "0 0 12px",
                    fontFamily: "var(--font-ui)",
                    lineHeight: 1.5,
                  }}
                >
                  Estimated creator proceeds at $10/pack (default price):
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {EARNINGS_SCENARIOS.map(({ packs, label }) => {
                    const usd = estimateRevenue(packs, 10);
                    const btc = btcPrice ? (usd / btcPrice).toFixed(6) : "...";
                    return (
                      <div
                        key={packs}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            color: "rgba(255,255,255,0.45)",
                            fontFamily: "var(--font-ui)",
                            minWidth: "90px",
                          }}
                        >
                          {label}
                        </span>
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "rgba(255,255,255,0.85)",
                              fontFamily: "var(--font-ui)",
                            }}
                          >
                            ≈ ${usd.toFixed(0)}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: `rgba(${accentRgb},0.70)`,
                              fontFamily: "var(--font-ui)",
                            }}
                          >
                            ≈ {btc} BTC
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
