import { Check, Timer } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export interface SetPackPriceModalProps {
  onConfirm: (priceUsd: number) => void;
  onClose: () => void;
}

export function SetPackPriceModal({ onConfirm }: SetPackPriceModalProps) {
  function handleConfirm() {
    onConfirm(1);
  }

  function handleMouseDown(e: React.MouseEvent<HTMLButtonElement>) {
    e.currentTarget.style.transform = "scale(0.98)";
  }

  function handleMouseUp(e: React.MouseEvent<HTMLButtonElement>) {
    e.currentTarget.style.transform = "scale(1)";
  }

  function handleMouseLeave(e: React.MouseEvent<HTMLButtonElement>) {
    e.currentTarget.style.transform = "scale(1)";
  }

  return (
    <AnimatePresence>
      <div
        data-ocid="pack_price.modal"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          style={{
            background: "var(--echo-surface, #FCFCFC)",
            borderRadius: "24px",
            maxWidth: "440px",
            width: "100%",
            maxHeight: "90dvh",
            overflowY: "auto",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
          }}
        >
          {/* Header */}
          <div style={{ padding: "28px 24px 20px" }}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#111",
                margin: "0 0 8px",
                letterSpacing: "-0.01em",
              }}
            >
              Pack Price
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: "#6b7280",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Each pack in your release is priced at a fixed rate.
            </p>
          </div>

          {/* Fixed Price Display */}
          <div style={{ padding: "0 24px 20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                padding: "20px",
                borderRadius: "16px",
                background: "rgba(126,214,177,0.08)",
                border: "1.5px solid rgba(126,214,177,0.30)",
              }}
            >
              <span
                style={{
                  fontSize: "40px",
                  fontWeight: 800,
                  color: "#047857",
                  letterSpacing: "-0.03em",
                  fontFamily: "var(--font-ui, DM Sans, sans-serif)",
                }}
              >
                $1
              </span>
              <span
                style={{
                  fontSize: "13px",
                  color: "#5FC49A",
                  fontWeight: 600,
                  fontFamily: "var(--font-ui, DM Sans, sans-serif)",
                }}
              >
                per pack
              </span>
            </div>
          </div>

          {/* Release Timer Info Panel */}
          <div style={{ padding: "0 24px 20px" }}>
            <div
              style={{
                background: "rgba(16,185,129,0.06)",
                border: "1.5px solid rgba(16,185,129,0.18)",
                borderRadius: "16px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "8px",
                }}
              >
                <Timer size={14} color="#047857" />
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#047857",
                  }}
                >
                  Release Timer
                </span>
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#374151",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Your release stays live for 24 hours. Unsold packs are
                permanently burned when the timer ends.
              </p>
            </div>
          </div>

          {/* Set Summary */}
          <div style={{ padding: "0 24px 20px" }}>
            <p
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#374151",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                margin: "0 0 10px",
              }}
            >
              Your Set
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px 12px",
              }}
            >
              {[
                "300 total packs",
                "1 video collectible per pack",
                "$1 per pack — fixed",
                "24h listing window",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "6px",
                  }}
                >
                  <Check
                    size={12}
                    color="#5FC49A"
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

          {/* CTA */}
          <div
            style={{
              padding: "4px 24px 28px",
              borderTop: "1px solid rgba(0,0,0,0.06)",
              marginTop: "4px",
            }}
          >
            <div style={{ height: "16px" }} />
            <button
              type="button"
              data-ocid="pack_price.submit_button"
              onClick={handleConfirm}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              style={{
                width: "100%",
                height: "52px",
                borderRadius: "14px",
                background: "linear-gradient(160deg, #7ED6B1, #5FC49A)",
                color: "#fff",
                fontSize: "15px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(16,185,129,0.30)",
                letterSpacing: "-0.01em",
                transition: "transform 0.1s, box-shadow 0.1s",
              }}
            >
              List on Releases — $1/pack
            </button>
            <p
              style={{
                fontSize: "11px",
                color: "#9ca3af",
                textAlign: "center",
                margin: "8px 0 0",
              }}
            >
              Your set will go live immediately after confirmation.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
