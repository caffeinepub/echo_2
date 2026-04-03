import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";

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
  "9 photo cards (common)",
  "1 video card (rare)",
  "5 sealed packs generated",
  "You receive all packs after minting",
  "Packs can be opened, kept, or shared",
];

const STEPS = [
  "Capture 9 photos",
  "Record 1 video (max 30 seconds)",
  "Choose 1 photo as the cover card",
  "Mint into sealed collectible packs",
];

const THUMB_DIAMETER = 48;
const THUMB_RADIUS = THUMB_DIAMETER / 2;

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
      const usable = trackWidth - THUMB_DIAMETER - 8; // 4px each side
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
            Slide to start →
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
          {/* Arrow icon */}
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

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            data-ocid="mint.modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              background: "rgba(0,0,0,0.45)",
            }}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1001,
              borderRadius: "24px 24px 0 0",
              background: "#F7F6F2",
              maxHeight: "92vh",
              overflowY: "auto",
              padding: "28px 24px 40px",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.16)",
            }}
          >
            {/* Drag handle */}
            <div
              style={{
                width: "36px",
                height: "4px",
                background: "rgba(0,0,0,0.1)",
                borderRadius: "2px",
                margin: "0 auto 20px",
              }}
            />

            {/* Close button */}
            <button
              type="button"
              data-ocid="mint.close_button"
              onClick={onClose}
              style={{
                position: "absolute",
                top: "28px",
                right: "20px",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.06)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
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
                fontSize: "22px",
                fontWeight: 700,
                color: "#111111",
                margin: "8px 0 0",
                lineHeight: 1.2,
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
              Create a collectible Moment using your own media. Capture 9 photos
              and 1 short video. These will be minted into 5 sealed packs that
              you will fully own.
            </p>

            <hr style={DIVIDER_STYLE} />

            {/* Details — What You Get */}
            <section>
              <span style={SECTION_LABEL_STYLE}>What You Get</span>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                }}
              >
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
                      •
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
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

            {/* Process Steps */}
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

            {/* Payment Options */}
            <section>
              <span style={SECTION_LABEL_STYLE}>Pay With</span>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
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
                        padding: "7px 16px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: isSelected ? 600 : 400,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        background: isSelected
                          ? "rgba(52,168,132,0.14)"
                          : "#fff",
                        border: isSelected
                          ? "1.5px solid rgba(52,168,132,0.5)"
                          : "1.5px solid #ddd",
                        color: isSelected ? MINT_GREEN : "#666",
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
                  If paying with BTC, ETH, or SOL, the equivalent of $1.00 will
                  be calculated at the time of purchase.
                </p>
              )}
            </section>

            <hr style={DIVIDER_STYLE} />

            {/* Slide to Start Mint */}
            <SlideToMint onComplete={onConfirm} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
