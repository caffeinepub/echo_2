import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { MockCard, MockCategory, MockSet } from "../store/mockCatalog";
import { getCards, getCategories, getSets } from "../store/mockCatalog";

function fmtUsd(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

interface CardDetailPageProps {
  id: string;
  onBack: () => void;
}

function StatCell({
  label,
  value,
  accent,
  isDark,
}: {
  label: string;
  value: string;
  accent?: boolean;
  isDark: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px 8px",
        borderRadius: "12px",
        background: isDark ? "rgba(16,185,129,0.06)" : "rgba(16,185,129,0.04)",
        border: isDark
          ? "1px solid rgba(110,230,185,0.12)"
          : "1px solid rgba(16,185,129,0.12)",
      }}
    >
      <span
        style={{
          fontSize: "20px",
          fontWeight: 700,
          fontFamily: "monospace",
          color: accent ? "#5FC49A" : isDark ? "rgba(220,248,235,0.9)" : "#111",
          lineHeight: 1,
          marginBottom: "4px",
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: "9px",
          fontWeight: 500,
          color: isDark ? "rgba(150,210,185,0.55)" : "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          textAlign: "center",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export function CardDetailPage({ id, onBack }: CardDetailPageProps) {
  const isDark = false; // always light mode
  const [card, setCard] = useState<MockCard | null>(null);
  const [parentSet, setParentSet] = useState<MockSet | null>(null);
  const [parentCategory, setParentCategory] = useState<MockCategory | null>(
    null,
  );
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const found = getCards().find((c) => c.id === id) ?? null;
    if (!found) {
      setNotFound(true);
      return;
    }
    setCard(found);
    const s = getSets().find((s) => s.id === found.setId) ?? null;
    setParentSet(s);
    if (s) {
      const cat = getCategories().find((c) => c.id === s.categoryId) ?? null;
      setParentCategory(cat);
    }
  }, [id]);

  const panelStyle: React.CSSProperties = isDark
    ? {
        background: "rgba(10, 28, 20, 0.72)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(110, 230, 185, 0.15)",
        boxShadow:
          "0 0 20px rgba(80, 200, 150, 0.08), 0 0 0 1px rgba(110,230,185,0.05) inset",
        borderRadius: "16px",
      }
    : {
        background: "white",
        border: "1px solid oklch(0.9 0.005 185)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
        borderRadius: "16px",
      };

  const textPrimary = isDark ? "rgba(220, 248, 235, 0.92)" : "#111";
  const textSecondary = isDark ? "rgba(150, 210, 185, 0.65)" : "#6b7280";
  const pageBg = isDark ? "var(--echo-bg)" : "#f8f9fc";
  const placeholderBg = isDark ? "rgba(20, 50, 35, 0.6)" : "#eef0f2";
  const placeholderText = isDark ? "rgba(130, 190, 160, 0.5)" : "#9ca3af";

  return (
    <div
      style={{ minHeight: "100vh", background: pageBg, paddingBottom: "40px" }}
      className="px-4 md:px-6 pt-4 max-w-2xl mx-auto"
    >
      {/* Back */}
      <button
        type="button"
        data-ocid="card_detail.back_button"
        onClick={onBack}
        className="flex items-center gap-2 mb-5 transition-opacity hover:opacity-70"
        style={{
          color: textSecondary,
          fontSize: "14px",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      {notFound && (
        <div
          data-ocid="card_detail.error_state"
          style={{ textAlign: "center", padding: "60px 0" }}
        >
          <p
            style={{
              color: textPrimary,
              fontSize: "16px",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Card not found
          </p>
          <p style={{ color: textSecondary, fontSize: "13px" }}>
            This card doesn't exist or may have been removed.
          </p>
        </div>
      )}

      {card && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          {/* Hero image */}
          <div
            data-ocid="card_detail.panel"
            style={{
              ...panelStyle,
              minHeight: "280px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isDark ? "rgba(8, 22, 15, 0.65)" : "#f8f9fa",
              padding: "24px",
            }}
          >
            {card.imageUrl ? (
              <img
                src={card.imageUrl}
                alt={card.name}
                style={{
                  maxHeight: "240px",
                  maxWidth: "100%",
                  objectFit: "contain",
                  borderRadius: "12px",
                }}
              />
            ) : (
              <div
                style={{
                  background: placeholderBg,
                  borderRadius: "12px",
                  width: "160px",
                  height: "220px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "16px",
                    color: placeholderText,
                  }}
                >
                  #{card.number || "N/A"}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    color: placeholderText,
                    letterSpacing: "0.1em",
                  }}
                >
                  NO IMAGE
                </span>
              </div>
            )}
          </div>

          {/* Card info strip */}
          <div style={{ ...panelStyle, padding: "18px 20px" }}>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: textPrimary,
                lineHeight: 1.2,
                marginBottom: "6px",
              }}
            >
              {card.name}
            </h1>
            <p
              style={{
                fontSize: "12px",
                color: textSecondary,
                marginBottom: "10px",
              }}
            >
              {card.number && `#${card.number}`}
              {card.number && card.rarity && " \u2022 "}
              {card.rarity}
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {parentSet && (
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: "8px",
                    background: isDark
                      ? "rgba(16,185,129,0.12)"
                      : "rgba(16,185,129,0.08)",
                    color: "#5FC49A",
                    border: "1px solid rgba(16,185,129,0.25)",
                  }}
                >
                  {parentSet.name}
                </span>
              )}
              {parentCategory && (
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: "8px",
                    background: isDark ? "rgba(100,130,120,0.2)" : "#f3f4f6",
                    color: textSecondary,
                    border: isDark
                      ? "1px solid rgba(110,230,185,0.1)"
                      : "1px solid #e5e7eb",
                  }}
                >
                  {parentCategory.name}
                </span>
              )}
            </div>
          </div>

          {/* TAG Population */}
          <div
            style={{ ...panelStyle, padding: "18px 20px" }}
            data-ocid="card_detail.tag_population.panel"
          >
            <p
              style={{
                fontSize: "9px",
                fontWeight: 600,
                color: "#5FC49A",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                marginBottom: "14px",
              }}
            >
              TAG Population
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <StatCell
                label="Pop 10"
                value={String(card.tagPopulation10)}
                accent
                isDark={isDark}
              />
              <StatCell
                label="Pop 9"
                value={String(card.tagPopulation9)}
                accent
                isDark={isDark}
              />
              <StatCell
                label="Pop 8"
                value={String(card.tagPopulation8)}
                accent
                isDark={isDark}
              />
              <StatCell
                label="Total Population"
                value={String(card.totalTagPopulation)}
                accent
                isDark={isDark}
              />
            </div>
          </div>

          {/* Minty Data */}
          <div
            style={{ ...panelStyle, padding: "18px 20px" }}
            data-ocid="card_detail.minty_data.panel"
          >
            <p
              style={{
                fontSize: "9px",
                fontWeight: 600,
                color: "#5FC49A",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                marginBottom: "14px",
              }}
            >
              Minty Data
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {[
                {
                  label: "Total Transactions",
                  value: String(card.mintyTransactions),
                },
                {
                  label: "Last Sale",
                  value: `$${fmtUsd(card.lastSalePriceUsd)}`,
                },
                {
                  label: "Avg Sale",
                  value: `$${fmtUsd(card.averageSalePriceUsd)}`,
                },
                {
                  label: "Price Range",
                  value: `$${fmtUsd(card.lowestSalePriceUsd)} \u2013 $${fmtUsd(card.highestSalePriceUsd)}`,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: isDark
                      ? "rgba(16,185,129,0.04)"
                      : "rgba(16,185,129,0.03)",
                    border: isDark
                      ? "1px solid rgba(110,230,185,0.08)"
                      : "1px solid rgba(16,185,129,0.1)",
                  }}
                >
                  <span style={{ fontSize: "12px", color: textSecondary }}>
                    {row.label}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      fontFamily: "monospace",
                      color: textPrimary,
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Market Data — Coming Soon */}
          <div
            style={{
              ...panelStyle,
              padding: "18px 20px",
              position: "relative",
              overflow: "hidden",
            }}
            data-ocid="card_detail.market_data.panel"
          >
            {/* Frosted overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "16px",
                background: isDark
                  ? "rgba(10,28,20,0.55)"
                  : "rgba(248,250,252,0.65)",
                backdropFilter: "blur(2px)",
                WebkitBackdropFilter: "blur(2px)",
                zIndex: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: isDark ? "rgba(220,248,235,0.6)" : "#6b7280",
                }}
              >
                Doppler Integration
              </span>
              <span
                style={{
                  fontSize: "10px",
                  padding: "3px 10px",
                  borderRadius: "8px",
                  background: isDark
                    ? "rgba(16,185,129,0.12)"
                    : "rgba(16,185,129,0.08)",
                  color: "#5FC49A",
                  border: "1px solid rgba(16,185,129,0.25)",
                }}
              >
                Coming Soon
              </span>
            </div>

            <p
              style={{
                fontSize: "9px",
                fontWeight: 600,
                color: "#5FC49A",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                marginBottom: "14px",
                opacity: 0.4,
              }}
            >
              Market Data
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                opacity: 0.35,
              }}
            >
              {[
                "Price Velocity",
                "Liquidity Indicator",
                "Transaction Frequency",
                "Supply Pressure",
              ].map((row) => (
                <div
                  key={row}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: isDark
                      ? "rgba(16,185,129,0.04)"
                      : "rgba(16,185,129,0.03)",
                    border: isDark
                      ? "1px solid rgba(110,230,185,0.08)"
                      : "1px solid rgba(16,185,129,0.1)",
                  }}
                >
                  <span style={{ fontSize: "12px", color: textSecondary }}>
                    {row}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        fontFamily: "monospace",
                        color: textPrimary,
                      }}
                    >
                      \u2014
                    </span>
                    <span
                      style={{
                        fontSize: "9px",
                        padding: "1px 6px",
                        borderRadius: "6px",
                        background: isDark
                          ? "rgba(16,185,129,0.08)"
                          : "#f3f4f6",
                        color: textSecondary,
                        border: isDark
                          ? "1px solid rgba(110,230,185,0.1)"
                          : "1px solid #e5e7eb",
                      }}
                    >
                      Soon
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
