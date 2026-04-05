import { Check, Timer } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const PRICE_OPTIONS = [1, 5, 20, 50, 100];

const PRICE_LABELS: Record<number, string> = {
  1: "24h",
  5: "12h",
  20: "8h",
  50: "4h",
  100: "1h",
};

const DURATION_ROWS = [
  { price: "$1", duration: "24 hours", value: 1 },
  { price: "$5", duration: "12 hours", value: 5 },
  { price: "$20", duration: "8 hours", value: 20 },
  { price: "$50", duration: "4 hours", value: 50 },
  { price: "$100", duration: "1 hour", value: 100 },
];

const SET_SUMMARY = [
  "100 total packs",
  "9 photo collectibles",
  "1 video collectible",
  "each pack contains 1 random collectible",
];

export interface SetPackPriceModalProps {
  onConfirm: (priceUsd: number) => void;
  onClose: () => void;
}

export function SetPackPriceModal({ onConfirm }: SetPackPriceModalProps) {
  const [selectedPrice, setSelectedPrice] = useState<number>(1);

  function handleConfirm() {
    onConfirm(selectedPrice);
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
              Set Pack Price
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: "#6b7280",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Choose how much each pack will cost.
              <br />
              Your price affects how long this set stays live on the Releases
              tab before unsold packs burn.
            </p>
          </div>

          {/* Price Selector */}
          <div style={{ padding: "0 24px 20px" }}>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#374151",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                margin: "0 0 12px",
              }}
            >
              Price per pack
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              {PRICE_OPTIONS.map((price, idx) => {
                const isSelected = selectedPrice === price;
                return (
                  <button
                    type="button"
                    key={price}
                    data-ocid={`pack_price.button.${idx + 1}`}
                    onClick={() => setSelectedPrice(price)}
                    style={{
                      flex: 1,
                      padding: "12px 0 8px",
                      borderRadius: "14px",
                      border: isSelected
                        ? "2px solid #10b981"
                        : "1.5px solid rgba(0,0,0,0.09)",
                      background: isSelected ? "rgba(16,185,129,0.09)" : "#fff",
                      color: isSelected ? "#047857" : "#374151",
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: "15px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      transition:
                        "border-color 0.15s, background 0.15s, color 0.15s",
                      outline: "none",
                    }}
                  >
                    <span>${price}</span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 400,
                        color: isSelected ? "#10b981" : "#9ca3af",
                      }}
                    >
                      {PRICE_LABELS[price]}
                    </span>
                  </button>
                );
              })}
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
                  margin: "0 0 12px",
                }}
              >
                Higher pack prices shorten how long the set stays live on
                Releases.
                <br />
                Unsold packs are permanently burned when the timer ends.
              </p>

              {/* Duration table */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  marginBottom: "10px",
                }}
              >
                {DURATION_ROWS.map((row) => {
                  const isActive = selectedPrice === row.value;
                  return (
                    <div
                      key={row.value}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "5px 8px",
                        borderRadius: "8px",
                        background: isActive
                          ? "rgba(16,185,129,0.10)"
                          : "transparent",
                        transition: "background 0.15s",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: isActive ? 700 : 600,
                          color: isActive ? "#047857" : "#111",
                        }}
                      >
                        {row.price}
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#10b981",
                        }}
                      >
                        {row.duration}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p
                style={{
                  fontSize: "11px",
                  fontStyle: "italic",
                  color: "#6b7280",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Lower prices give the set more time to sell. Higher prices
                increase burn risk.
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
              {SET_SUMMARY.map((item) => (
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
                    color="#10b981"
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
                background: "linear-gradient(160deg, #10b981, #059669)",
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
              List on Releases
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
