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
  "Choose 1 photo as the cover card",
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
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (completed) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(true);
    },
    [completed],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || !trackRef.current || completed) return;
      const rect = trackRef.current.getBoundingClientRect();
      const trackWidth = rect.width;
      const usable = trackWidth - THUMB_DIAMETER - 8;
      const rawX = e.clientX - rect.left - THUMB_RADIUS - 4;
      const clamped = Math.max(0, Math.min(rawX, usable));
      const p = clamped / usable;
      setProgress(p);

      if (p >= 0.88) {
        setCompleted(true);
        setIsDragging(false);
        setTimeout(() => {
          onComplete();
          setProgress(0);
          setCompleted(false);
        }, 200);
      }
    },
    [isDragging, completed, onComplete],
  );

  const handlePointerUp = useCallback(() => {
    if (completed) return;
    setIsDragging(false);
    if (progress < 0.88) {
      setProgress(0);
    }
  }, [completed, progress]);

  return (
    <div style={{ marginTop: "8px" }}>
      <p
        style={{
          textAlign: "center",
          fontSize: "13px",
          color: "#9B9B9B",
          marginBottom: "12px",
          letterSpacing: "0.02em",
        }}
      >
        Slide to Start Mint
      </p>

      <div
        ref={trackRef}
        data-ocid="mint.canvas_target"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{
          position: "relative",
          width: "100%",
          height: `${THUMB_DIAMETER + 8}px`,
          borderRadius: `${THUMB_RADIUS + 4}px`,
          background: MINT_TRACK_BG,
          border: `1px solid ${MINT_TRACK_BORDER}`,
          overflow: "hidden",
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {/* Fill */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `calc(${progress * 100}% + ${THUMB_RADIUS + 4}px)`,
            background: MINT_FILL,
            transition: isDragging ? "none" : "width 0.35s ease",
            borderRadius: `${THUMB_RADIUS + 4}px`,
            pointerEvents: "none",
          }}
        />

        {/* Label inside track */}
        {progress < 0.15 && (
          <span
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              color: MINT_LABEL,
              pointerEvents: "none",
              letterSpacing: "0.03em",
              paddingLeft: `${THUMB_DIAMETER + 8}px`,
            }}
          >
            Slide to start &rarr;
          </span>
        )}

        {/* Thumb */}
        <div
          style={{
            position: "absolute",
            top: "4px",
            left: `calc(4px + ${progress * 100}% - ${progress * THUMB_DIAMETER}px)`,
            width: `${THUMB_DIAMETER}px`,
            height: `${THUMB_DIAMETER}px`,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #34A884, #2d9070)",
            boxShadow: "0 2px 12px rgba(52,168,132,0.45)",
            transition: isDragging ? "none" : "left 0.35s ease",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
              stroke="white"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function MintMomentModal({
  open,
  onClose,
  onConfirm,
}: MintMomentModalProps) {
  const [selectedPayment, setSelectedPayment] = useState<PaymentOption>("USDC");
  const { activeDraft, setPackSupply } = useMomentDraft();
  const packSupplyValue = activeDraft?.packSupply ?? 100;
  const controls = useAnimationControls();

  // Inject CSS keyframes once
  useEffect(() => {
    const id = "mint-bubble-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes mintGlowBreathe {
        from { box-shadow: 0 0 0 1px rgba(52,168,132,0.10), 0 8px 60px rgba(0,0,0,0.18), 0 0 60px rgba(52,168,132,0.08), 0 2px 20px rgba(0,0,0,0.10); }
        to   { box-shadow: 0 0 0 1px rgba(52,168,132,0.20), 0 8px 60px rgba(0,0,0,0.22), 0 0 100px rgba(52,168,132,0.18), 0 2px 20px rgba(0,0,0,0.12); }
      }
      @keyframes driftA {
        0%, 100% { transform: translate(0, 0); }
        50%       { transform: translate(30px, -20px); }
      }
      @keyframes driftB {
        0%, 100% { transform: translate(0, 0); }
        50%       { transform: translate(-20px, 15px); }
      }
    `;
    document.head.appendChild(style);
  }, []);

  // Start floating drift after entry animation completes
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      controls.start({
        y: [0, -7, 0],
        transition: {
          duration: 5,
          ease: "easeInOut",
          repeat: Number.POSITIVE_INFINITY,
        },
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [open, controls]);

  // Reset float when closed
  useEffect(() => {
    if (!open) {
      controls.stop();
      controls.set({ y: 0 });
    }
  }, [open, controls]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="mint-backdrop"
            data-ocid="mint.modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              background: "rgba(8, 20, 14, 0.55)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
          >
            {/* Ambient particle blobs — behind the bubble */}
            {PARTICLES.map((p) => (
              <div
                key={p.id}
                style={{
                  position: "absolute",
                  width: `${p.w}px`,
                  height: `${p.h}px`,
                  top: p.top,
                  left: p.left,
                  borderRadius: "50%",
                  background: p.color,
                  filter: `blur(${p.blur}px)`,
                  opacity: p.opacity,
                  animation: `${p.drift} ${p.duration}s ease-in-out infinite`,
                  pointerEvents: "none",
                }}
              />
            ))}
          </motion.div>

          {/* Centering wrapper */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1001,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            {/* Scale + fade entry */}
            <motion.div
              key="mint-entry"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ pointerEvents: "auto" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Float drift */}
              <motion.div
                animate={controls}
                style={{
                  width: "min(420px, 92vw)",
                  maxHeight: "88vh",
                  overflowY: "auto",
                  borderRadius: "32px",
                  background: "rgba(252, 252, 250, 0.82)",
                  backdropFilter: "blur(24px) saturate(1.6)",
                  WebkitBackdropFilter: "blur(24px) saturate(1.6)",
                  border: "1px solid rgba(200, 245, 225, 0.5)",
                  animation:
                    "mintGlowBreathe 4s ease-in-out infinite alternate",
                  position: "relative",
                  padding: "36px 32px 40px",
                }}
              >
                {/* Light gradient overlay — cosmetic, pointer-events: none */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "32px",
                    background:
                      "linear-gradient(160deg, rgba(255,255,255,0.55) 0%, rgba(235,255,245,0.15) 100%)",
                    pointerEvents: "none",
                    zIndex: 0,
                  }}
                />

                {/* Content — above gradient */}
                <div style={{ position: "relative", zIndex: 1 }}>
                  {/* Close button */}
                  <button
                    type="button"
                    data-ocid="mint.close_button"
                    onClick={onClose}
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "-8px",
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.07)",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      flexShrink: 0,
                    }}
                    aria-label="Close"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M1 1l12 12M13 1L1 13"
                        stroke="#555"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>

                  {/* Title */}
                  <h2
                    style={{
                      fontSize: "24px",
                      fontWeight: 700,
                      color: "#111",
                      margin: 0,
                      lineHeight: 1.2,
                      letterSpacing: "-0.01em",
                      paddingRight: "32px",
                    }}
                  >
                    Mint a Moment
                  </h2>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#5a6a62",
                      lineHeight: 1.65,
                      marginTop: "10px",
                      marginBottom: 0,
                    }}
                  >
                    Create a collectible Moment using your own media.
                  </p>

                  <hr style={DIVIDER_STYLE} />

                  {/* What You Get */}
                  <section>
                    <span style={SECTION_LABEL_STYLE}>What You Get</span>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {DETAILS.map((item) => (
                        <li
                          key={item}
                          style={{
                            fontSize: "14px",
                            color: "#333",
                            lineHeight: 1.8,
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              color: MINT_GREEN,
                              fontWeight: 600,
                              lineHeight: 1.8,
                              flexShrink: 0,
                            }}
                          >
                            &bull;
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <hr style={DIVIDER_STYLE} />

                  {/* Pack Supply */}
                  <section>
                    <span style={SECTION_LABEL_STYLE}>Pack Supply</span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <input
                        type="number"
                        data-ocid="mint.input"
                        min={10}
                        max={10000}
                        step={10}
                        value={packSupplyValue}
                        onChange={(e) => {
                          const v = Number.parseInt(e.target.value, 10);
                          if (!Number.isNaN(v)) setPackSupply(v);
                        }}
                        style={{
                          width: "80px",
                          padding: "6px 10px",
                          borderRadius: "8px",
                          border: "1.5px solid rgba(52,168,132,0.40)",
                          background: "rgba(52,168,132,0.05)",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#111",
                          textAlign: "center",
                          outline: "none",
                        }}
                      />
                    </div>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#9B9B9B",
                        marginTop: "6px",
                        marginBottom: 0,
                      }}
                    >
                      Determines how many collectibles are generated.
                    </p>
                  </section>

                  <hr style={DIVIDER_STYLE} />

                  {/* Mint Price */}
                  <section>
                    <span style={SECTION_LABEL_STYLE}>Mint Price</span>
                    <p
                      style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        color: "#111111",
                        margin: 0,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      $1.00
                    </p>
                  </section>

                  <hr style={DIVIDER_STYLE} />

                  {/* How It Works */}
                  <section>
                    <span style={SECTION_LABEL_STYLE}>How It Works</span>
                    <ol
                      style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {STEPS.map((step, i) => (
                        <li
                          key={step}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <span
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              background: "rgba(52,168,132,0.12)",
                              color: MINT_GREEN,
                              fontSize: "12px",
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {i + 1}
                          </span>
                          <span
                            style={{
                              fontSize: "14px",
                              color: "#333",
                              lineHeight: 1.5,
                            }}
                          >
                            {step}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </section>

                  <hr style={DIVIDER_STYLE} />

                  {/* Pay With */}
                  <section>
                    <span style={SECTION_LABEL_STYLE}>Pay With</span>
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                    >
                      {PAYMENT_OPTIONS.map((opt) => {
                        const isSelected = selectedPayment === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            data-ocid={`mint.${opt.toLowerCase()}.toggle`}
                            onClick={() => setSelectedPayment(opt)}
                            style={{
                              padding: "8px 18px",
                              borderRadius: "999px",
                              fontSize: "13px",
                              fontWeight: isSelected ? 600 : 400,
                              cursor: "pointer",
                              transition: "all 0.18s ease",
                              background: isSelected
                                ? "rgba(52,168,132,0.10)"
                                : "rgba(255,255,255,0.70)",
                              border: isSelected
                                ? "1.5px solid rgba(52,168,132,0.55)"
                                : "1.5px solid rgba(0,0,0,0.10)",
                              boxShadow: isSelected
                                ? "0 0 0 3px rgba(52,168,132,0.12)"
                                : "none",
                              color: isSelected ? "rgb(34,120,90)" : "#555",
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {selectedPayment !== "USDC" && (
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#9B9B9B",
                          fontStyle: "italic",
                          marginTop: "10px",
                          lineHeight: 1.5,
                        }}
                      >
                        If paying with BTC, ETH, or SOL, the equivalent of $1.00
                        will be calculated at the time of purchase.
                      </p>
                    )}
                  </section>

                  <hr style={DIVIDER_STYLE} />

                  {/* Slide to Start Mint */}
                  <SlideToMint onComplete={onConfirm} />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
