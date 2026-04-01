import {
  ArrowLeft,
  Calendar,
  Hash,
  Layers,
  Lock,
  Star,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../ThemeContext";
import type { MockCard, MockSet } from "../store/mockCatalog";
import { getCards, getCategories, getSets } from "../store/mockCatalog";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPop(n: number): string {
  if (!n) return "0";
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function formatUSD(n: number): string {
  if (!n || n === 0) return "—";
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatUSDExact(n: number): string {
  if (!n || n === 0) return "—";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ─── Mock recent sales (sample data for modal) ────────────────────────────────
const MOCK_SALES = [
  {
    date: "Mar 28, 2026",
    price: 2150,
    grade: "TAG 10",
    payment: "USDC",
    ref: "TXN-8AF2",
  },
  {
    date: "Mar 21, 2026",
    price: 1980,
    grade: "TAG 10",
    payment: "ETH",
    ref: "TXN-C391",
  },
  {
    date: "Mar 14, 2026",
    price: 1750,
    grade: "TAG 9",
    payment: "BTC",
    ref: "TXN-7D04",
  },
  {
    date: "Mar 08, 2026",
    price: 1650,
    grade: "TAG 9",
    payment: "SOL",
    ref: "TXN-22B1",
  },
  {
    date: "Feb 29, 2026",
    price: 1420,
    grade: "TAG 8",
    payment: "USDC",
    ref: "TXN-A8F5",
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface SetDetailPageProps {
  slug: string;
  onBack: () => void;
  onCardClick?: (id: string) => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatPanel({
  label,
  value,
  isDark,
  accent,
}: {
  label: string;
  value: string;
  isDark: boolean;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        background: isDark
          ? accent
            ? "linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(16,185,129,0.08) 100%)"
            : "linear-gradient(135deg, rgba(10,28,20,0.85) 0%, rgba(14,40,28,0.75) 100%)"
          : accent
            ? "linear-gradient(135deg, rgba(16,185,129,0.10) 0%, rgba(125,223,194,0.06) 100%)"
            : "linear-gradient(135deg, #ffffff 0%, #f0faf5 100%)",
        border: isDark
          ? `1px solid ${accent ? "rgba(16,185,129,0.35)" : "rgba(110,230,185,0.12)"}`
          : `1px solid ${accent ? "rgba(16,185,129,0.25)" : "rgba(16,185,129,0.12)"}`,
        borderRadius: "14px",
        padding: "14px 16px",
        boxShadow: isDark
          ? "0 1px 4px rgba(0,0,0,0.3)"
          : "0 1px 4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
      }}
    >
      <p
        style={{
          fontSize: "10px",
          fontWeight: 500,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: isDark ? "rgba(150,210,185,0.55)" : "#9ca3af",
          marginBottom: "6px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "18px",
          fontWeight: 700,
          color: accent
            ? "#10b981"
            : isDark
              ? "rgba(220,248,235,0.92)"
              : "#111",
          lineHeight: 1.1,
          letterSpacing: "-0.01em",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const isGold = rank === 1;
  const isSilver = rank === 2;
  const isBronze = rank === 3;
  const color = isGold
    ? "#f59e0b"
    : isSilver
      ? "#94a3b8"
      : isBronze
        ? "#b45309"
        : "#9ca3af";
  const bg = isGold
    ? "rgba(245,158,11,0.12)"
    : isSilver
      ? "rgba(148,163,184,0.1)"
      : isBronze
        ? "rgba(180,83,9,0.1)"
        : "transparent";
  return (
    <div
      style={{
        minWidth: "28px",
        height: "28px",
        borderRadius: "8px",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: rank <= 9 ? "14px" : "12px",
        fontWeight: 700,
        color,
        flexShrink: 0,
      }}
    >
      #{rank}
    </div>
  );
}

// ─── Card Detail Modal ────────────────────────────────────────────────────────

function CardDetailModal({
  card,
  setName,
  categoryName,
  isDark,
  onClose,
}: {
  card: MockCard;
  setName: string;
  categoryName: string;
  isDark: boolean;
  onClose: () => void;
}) {
  const textPrimary = isDark ? "rgba(220,248,235,0.92)" : "#111";
  const textSecondary = isDark ? "rgba(150,210,185,0.65)" : "#6b7280";
  const sheetBg = isDark
    ? "linear-gradient(180deg, rgba(8,22,15,0.98) 0%, rgba(5,18,12,0.99) 100%)"
    : "linear-gradient(180deg, #ffffff 0%, #f8fdf9 100%)";
  const cellBg = isDark ? "rgba(16,185,129,0.07)" : "rgba(16,185,129,0.05)";
  const cellBorder = isDark ? "rgba(16,185,129,0.18)" : "rgba(16,185,129,0.15)";
  const dopplerBg = isDark ? "rgba(8,20,16,0.6)" : "rgba(240,252,247,0.8)";

  const cardVolume = card.mintyTransactions * (card.averageSalePriceUsd || 0);

  const popItems = [
    { label: "TAG 10", value: formatPop(card.tagPopulation10), accent: true },
    { label: "TAG 9", value: formatPop(card.tagPopulation9), accent: false },
    { label: "TAG 8", value: formatPop(card.tagPopulation8), accent: false },
    {
      label: "Total Pop",
      value: formatPop(card.totalTagPopulation),
      accent: false,
    },
  ];

  const marketItems = [
    { label: "Volume", value: formatUSD(cardVolume) },
    {
      label: "Transactions",
      value: card.mintyTransactions > 0 ? `${card.mintyTransactions}` : "—",
    },
    { label: "Highest Sale", value: formatUSDExact(card.highestSalePriceUsd) },
    { label: "Lowest Sale", value: formatUSDExact(card.lowestSalePriceUsd) },
    { label: "Avg Sale", value: formatUSDExact(card.averageSalePriceUsd) },
    { label: "Last Sale", value: formatUSDExact(card.lastSalePriceUsd) },
  ];

  const dopplerItems = [
    { label: "Velocity", icon: "⚡" },
    { label: "Liquidity", icon: "💧" },
    { label: "Supply Pressure", icon: "📊" },
    { label: "Price Score", icon: "📈" },
    { label: "Trend Signal", icon: "🔮" },
  ];

  return (
    <div
      data-ocid="card_detail.modal"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        style={{
          position: "relative",
          background: sheetBg,
          borderRadius: "24px 24px 0 0",
          height: "88vh",
          overflowY: "auto",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)",
          border: isDark
            ? "1px solid rgba(110,230,185,0.12)"
            : "1px solid rgba(16,185,129,0.12)",
          borderBottom: "none",
        }}
      >
        {/* Header */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: isDark
              ? "rgba(5,18,12,0.95)"
              : "rgba(255,255,255,0.95)",
            backdropFilter: "blur(12px)",
            padding: "16px 20px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: isDark
              ? "1px solid rgba(110,230,185,0.08)"
              : "1px solid rgba(16,185,129,0.1)",
          }}
        >
          <div>
            <p
              style={{ fontSize: "16px", fontWeight: 700, color: textPrimary }}
            >
              {card.name}
            </p>
            <p style={{ fontSize: "12px", color: textSecondary }}>
              {setName} • {categoryName}
            </p>
          </div>
          <button
            type="button"
            data-ocid="card_detail.close_button"
            onClick={onClose}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: isDark
                ? "rgba(110,230,185,0.1)"
                : "rgba(16,185,129,0.08)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: textSecondary,
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px" }} className="flex flex-col gap-5">
          {/* Card Identity */}
          <div className="flex flex-col items-center gap-3">
            {card.imageUrl ? (
              <div
                style={{
                  background: isDark ? "rgba(10,28,20,0.5)" : "#f0faf5",
                  borderRadius: "16px",
                  padding: "16px",
                  border: isDark
                    ? "1px solid rgba(110,230,185,0.12)"
                    : "1px solid rgba(16,185,129,0.12)",
                  boxShadow: isDark
                    ? "0 0 24px rgba(16,185,129,0.08)"
                    : "0 4px 16px rgba(16,185,129,0.08)",
                }}
              >
                <img
                  src={card.imageUrl}
                  alt={card.name}
                  style={{
                    height: "120px",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: "90px",
                  height: "126px",
                  borderRadius: "12px",
                  background: isDark
                    ? "rgba(16,185,129,0.08)"
                    : "rgba(16,185,129,0.05)",
                  border: isDark
                    ? "1px solid rgba(110,230,185,0.15)"
                    : "1px solid rgba(16,185,129,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  color: "#10b981",
                  opacity: 0.5,
                }}
              >
                ?
              </div>
            )}
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: textPrimary,
                }}
              >
                {card.name}
              </p>
              {card.number && (
                <p
                  style={{
                    fontSize: "13px",
                    color: textSecondary,
                    marginTop: "2px",
                  }}
                >
                  #{card.number}
                </p>
              )}
              {card.rarity && (
                <span
                  style={{
                    display: "inline-block",
                    marginTop: "6px",
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: "8px",
                    background: "rgba(16,185,129,0.12)",
                    color: "#10b981",
                    border: "1px solid rgba(16,185,129,0.25)",
                  }}
                >
                  {card.rarity}
                </span>
              )}
            </div>
          </div>

          {/* Population Data */}
          <div>
            <SectionLabel label="TAG Population" isDark={isDark} />
            <div className="grid grid-cols-2 gap-2">
              {popItems.map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: item.accent
                      ? isDark
                        ? "rgba(16,185,129,0.12)"
                        : "rgba(16,185,129,0.07)"
                      : cellBg,
                    border: `1px solid ${cellBorder}`,
                    borderRadius: "12px",
                    padding: "12px 14px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "10px",
                      color: textSecondary,
                      marginBottom: "4px",
                      fontWeight: 500,
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      color: item.accent ? "#10b981" : textPrimary,
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Market Data */}
          <div>
            <SectionLabel label="Minty Market Data" isDark={isDark} />
            <div className="grid grid-cols-2 gap-2">
              {marketItems.map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: cellBg,
                    border: `1px solid ${cellBorder}`,
                    borderRadius: "12px",
                    padding: "12px 14px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "10px",
                      color: textSecondary,
                      marginBottom: "4px",
                      fontWeight: 500,
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: textPrimary,
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Sales */}
          <div>
            <SectionLabel label="Recent Sales" isDark={isDark} />
            <div
              style={{
                background: cellBg,
                border: `1px solid ${cellBorder}`,
                borderRadius: "14px",
                overflow: "hidden",
              }}
            >
              {MOCK_SALES.map((sale, i) => (
                <div
                  key={sale.ref}
                  style={{
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom:
                      i < MOCK_SALES.length - 1
                        ? isDark
                          ? "1px solid rgba(110,230,185,0.07)"
                          : "1px solid rgba(16,185,129,0.08)"
                        : "none",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: textPrimary,
                        }}
                      >
                        ${sale.price.toLocaleString()}
                      </span>
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: 600,
                          padding: "1px 6px",
                          borderRadius: "5px",
                          background: "rgba(16,185,129,0.12)",
                          color: "#10b981",
                          border: "1px solid rgba(16,185,129,0.2)",
                        }}
                      >
                        {sale.grade}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "11px",
                        color: textSecondary,
                        marginTop: "2px",
                      }}
                    >
                      {sale.date} · {sale.ref}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: isDark ? "rgba(100,130,120,0.2)" : "#f3f4f6",
                      color: textSecondary,
                    }}
                  >
                    {sale.payment}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Doppler Analytics Placeholder */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: isDark ? "rgba(150,210,185,0.5)" : "#9ca3af",
                }}
              >
                Doppler Analytics
              </p>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 600,
                  padding: "1px 7px",
                  borderRadius: "5px",
                  background: "rgba(245,158,11,0.12)",
                  color: "#f59e0b",
                  border: "1px solid rgba(245,158,11,0.25)",
                }}
              >
                Coming Soon
              </span>
            </div>
            <div
              style={{
                background: dopplerBg,
                border: isDark
                  ? "1px solid rgba(110,230,185,0.08)"
                  : "1px solid rgba(16,185,129,0.1)",
                borderRadius: "14px",
                overflow: "hidden",
              }}
            >
              {dopplerItems.map((item, i) => (
                <div
                  key={item.label}
                  style={{
                    padding: "11px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom:
                      i < dopplerItems.length - 1
                        ? isDark
                          ? "1px solid rgba(110,230,185,0.05)"
                          : "1px solid rgba(16,185,129,0.06)"
                        : "none",
                    opacity: 0.65,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: "14px" }}>{item.icon}</span>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: textPrimary,
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: textSecondary,
                      }}
                    >
                      —
                    </span>
                    <Lock size={10} style={{ color: textSecondary }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SectionLabel({ label, isDark }: { label: string; isDark: boolean }) {
  return (
    <p
      style={{
        fontSize: "10px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: isDark ? "rgba(150,210,185,0.5)" : "#9ca3af",
        marginBottom: "10px",
      }}
    >
      {label}
    </p>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function SetDetailPage({
  slug,
  onBack,
  onCardClick: _onCardClick,
}: SetDetailPageProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [set, setSet] = useState<MockSet | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [cards, setCards] = useState<MockCard[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");
  const [selectedCard, setSelectedCard] = useState<MockCard | null>(null);

  useEffect(() => {
    const found = getSets().find((s) => s.slug === slug && s.active) ?? null;
    if (!found) {
      setNotFound(true);
      return;
    }
    setSet(found);
    const cat = getCategories().find((c) => c.id === found.categoryId);
    setCategoryName(cat?.name ?? found.categoryId);
    const activeCards = getCards()
      .filter((c) => c.setId === found.id && c.active)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    console.log("[SetDetail] Loaded cards:", activeCards.length);
    setCards(activeCards);
  }, [slug]);

  // ── Style tokens ──
  const panelStyle: React.CSSProperties = isDark
    ? {
        background: "rgba(10, 28, 20, 0.72)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(110, 230, 185, 0.15)",
        boxShadow:
          "0 0 20px rgba(80,200,150,0.08), inset 0 1px 0 rgba(110,230,185,0.07)",
      }
    : {
        background: "white",
        border: "1px solid oklch(0.9 0.005 185)",
        boxShadow:
          "0 2px 8px oklch(0 0 0 / 0.08), 0 1px 2px oklch(0 0 0 / 0.04)",
      };

  const textPrimary = isDark ? "rgba(220, 248, 235, 0.92)" : "#111";
  const textSecondary = isDark ? "rgba(150, 210, 185, 0.65)" : "#6b7280";
  const pageBg = isDark ? "var(--echo-bg)" : "#f4faf7";
  const placeholderBg = isDark ? "rgba(20, 50, 35, 0.6)" : "#eef0f2";
  const placeholderText = isDark ? "rgba(130, 190, 160, 0.5)" : "#9ca3af";

  const totalCards = set?.cardCount ?? 0;
  const collectedCount = cards.length;
  const completionPct =
    totalCards > 0 ? Math.round((collectedCount / totalCards) * 100) : 0;

  // ── Stats computation ──
  const stats = useMemo(() => {
    if (!cards.length) return null;
    const totalVolume = cards.reduce(
      (sum, c) => sum + c.mintyTransactions * (c.averageSalePriceUsd || 0),
      0,
    );
    const totalTransactions = cards.reduce(
      (sum, c) => sum + c.mintyTransactions,
      0,
    );
    const uniqueCardsTraded = cards.filter(
      (c) => c.mintyTransactions > 0,
    ).length;
    const highestSale = Math.max(
      0,
      ...cards.map((c) => c.highestSalePriceUsd || 0),
    );
    const cardsWithPrices = cards.filter((c) => c.averageSalePriceUsd > 0);
    const averageSale =
      cardsWithPrices.length > 0
        ? cardsWithPrices.reduce((sum, c) => sum + c.averageSalePriceUsd, 0) /
          cardsWithPrices.length
        : 0;
    const mostActiveCard = cards.reduce(
      (best, c) =>
        c.mintyTransactions > (best?.mintyTransactions ?? -1) ? c : best,
      null as MockCard | null,
    );
    const totalPop = cards.reduce(
      (sum, c) => sum + (c.totalTagPopulation || 0),
      0,
    );
    const cardsWithFloor = cards.filter((c) => c.lowestSalePriceUsd > 0);
    const floor =
      cardsWithFloor.length > 0
        ? Math.min(...cardsWithFloor.map((c) => c.lowestSalePriceUsd))
        : 0;
    return {
      totalVolume,
      totalTransactions,
      uniqueCardsTraded,
      highestSale,
      averageSale,
      mostActiveCard,
      totalPop,
      floor,
    };
  }, [cards]);

  // ── Leaderboard sort ──
  const rankedCards = useMemo(() => {
    return [...cards].sort((a, b) => {
      const volA = a.mintyTransactions * (a.averageSalePriceUsd || 0);
      const volB = b.mintyTransactions * (b.averageSalePriceUsd || 0);
      if (volB !== volA) return volB - volA;
      if (b.mintyTransactions !== a.mintyTransactions)
        return b.mintyTransactions - a.mintyTransactions;
      return (b.lastSalePriceUsd || 0) - (a.lastSalePriceUsd || 0);
    });
  }, [cards]);

  // ── Analytics: top 5 by transactions ──
  const top5Cards = useMemo(
    () =>
      [...cards]
        .sort((a, b) => b.mintyTransactions - a.mintyTransactions)
        .slice(0, 5),
    [cards],
  );
  const maxTx = top5Cards[0]?.mintyTransactions ?? 1;

  // ── Grade distribution totals ──
  const gradeTotals = useMemo(() => {
    const t10 = cards.reduce((s, c) => s + c.tagPopulation10, 0);
    const t9 = cards.reduce((s, c) => s + c.tagPopulation9, 0);
    const t8 = cards.reduce((s, c) => s + c.tagPopulation8, 0);
    return { t10, t9, t8, max: Math.max(t10, t9, t8, 1) };
  }, [cards]);

  const hasPop = gradeTotals.t10 + gradeTotals.t9 + gradeTotals.t8 > 0;
  const hasActivity = top5Cards.some((c) => c.mintyTransactions > 0);

  return (
    <div
      style={{ minHeight: "100vh", background: pageBg, paddingBottom: "48px" }}
      className="px-4 md:px-6 pt-4 max-w-2xl mx-auto"
    >
      {/* Back button */}
      <button
        type="button"
        data-ocid="set_detail.back_button"
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

      {/* Not Found */}
      {notFound && (
        <div
          data-ocid="set_detail.error_state"
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <p
            style={{
              color: textPrimary,
              fontSize: "16px",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Set not found
          </p>
          <p style={{ color: textSecondary, fontSize: "13px" }}>
            This set doesn't exist or may have been removed.
          </p>
        </div>
      )}

      {set && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col gap-4"
        >
          {/* ── 1. Set Overview Card ── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              ...panelStyle,
              border: isDark
                ? "1px solid rgba(16,185,129,0.2)"
                : "1px solid rgba(16,185,129,0.15)",
            }}
          >
            {/* Mint gradient image strip */}
            <div
              style={{
                background: isDark
                  ? "linear-gradient(135deg, rgba(4,25,17,1) 0%, rgba(8,40,28,0.9) 50%, rgba(16,185,129,0.08) 100%)"
                  : "linear-gradient(135deg, #e8f9f2 0%, #d0f5e8 60%, #f0fdf9 100%)",
                minHeight: "180px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                position: "relative",
              }}
            >
              {/* Supported badge top-right */}
              {set.featured && (
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    fontSize: "10px",
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: "7px",
                    background: "rgba(16,185,129,0.15)",
                    color: "#10b981",
                    border: "1px solid rgba(16,185,129,0.3)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Star size={9} /> Supported
                </div>
              )}
              {set.imageUrl ? (
                <img
                  src={set.imageUrl}
                  alt={set.name}
                  style={{
                    maxHeight: "156px",
                    maxWidth: "100%",
                    objectFit: "contain",
                    filter: isDark
                      ? "drop-shadow(0 0 16px rgba(16,185,129,0.18))"
                      : "drop-shadow(0 4px 12px rgba(0,0,0,0.1))",
                  }}
                />
              ) : (
                <div
                  style={{
                    background: placeholderBg,
                    minHeight: "100px",
                    minWidth: "120px",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "20px 24px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "22px",
                      fontWeight: 700,
                      color: placeholderText,
                    }}
                  >
                    {set.setCode}
                  </span>
                </div>
              )}
            </div>

            {/* Set info */}
            <div style={{ padding: "18px 20px 20px" }}>
              {/* Name + badges row */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <h1
                  style={{
                    color: textPrimary,
                    fontSize: "22px",
                    fontWeight: 800,
                    lineHeight: 1.2,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {set.name}
                </h1>
              </div>

              {/* Badge row */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span
                  style={{
                    fontSize: "10px",
                    fontFamily: "monospace",
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: "7px",
                    background: isDark
                      ? "rgba(16,185,129,0.15)"
                      : "rgba(16,185,129,0.08)",
                    color: "#10b981",
                    border: "1px solid rgba(16,185,129,0.3)",
                  }}
                >
                  {set.setCode}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: "7px",
                    background: isDark ? "rgba(100,130,120,0.2)" : "#f3f4f6",
                    color: textSecondary,
                    border: isDark
                      ? "1px solid rgba(110,230,185,0.1)"
                      : "1px solid #e5e7eb",
                  }}
                >
                  {categoryName}
                </span>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-5 flex-wrap mb-4">
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} style={{ color: "#10b981" }} />
                  <span style={{ color: textSecondary, fontSize: "12px" }}>
                    {set.releaseYear}
                  </span>
                </div>
                {set.cardCount != null && (
                  <div className="flex items-center gap-1.5">
                    <Layers size={12} style={{ color: "#10b981" }} />
                    <span style={{ color: textSecondary, fontSize: "12px" }}>
                      {set.cardCount} cards
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Hash size={12} style={{ color: "#10b981" }} />
                  <span style={{ color: textSecondary, fontSize: "12px" }}>
                    {set.slug}
                  </span>
                </div>
              </div>

              {/* Completion bar */}
              {totalCards > 0 && (
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#10b981",
                      }}
                    >
                      {collectedCount} / {totalCards} collected
                    </span>
                    <span style={{ fontSize: "10px", color: textSecondary }}>
                      {completionPct}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: "6px",
                      borderRadius: "3px",
                      background: isDark ? "rgba(110,230,185,0.1)" : "#e5e7eb",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${completionPct}%`,
                        borderRadius: "3px",
                        background: "linear-gradient(90deg, #10b981, #7ddfc2)",
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── 2. Set Stat Grid ── */}
          <div>
            <p
              style={{
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: isDark ? "rgba(150,210,185,0.5)" : "#9ca3af",
                marginBottom: "10px",
              }}
            >
              Market Intelligence
            </p>
            <div
              data-ocid="set_detail.stats.panel"
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              <StatPanel
                label="Set Volume"
                value={stats ? formatUSD(stats.totalVolume) : "—"}
                isDark={isDark}
                accent
              />
              <StatPanel
                label="Transactions"
                value={
                  stats
                    ? stats.totalTransactions > 0
                      ? `${stats.totalTransactions}`
                      : "—"
                    : "—"
                }
                isDark={isDark}
              />
              <StatPanel
                label="Active Cards"
                value={
                  stats
                    ? stats.uniqueCardsTraded > 0
                      ? `${stats.uniqueCardsTraded}`
                      : "—"
                    : "—"
                }
                isDark={isDark}
              />
              <StatPanel
                label="Avg Sale"
                value={stats ? formatUSD(stats.averageSale) : "—"}
                isDark={isDark}
              />
              <StatPanel
                label="Highest Sale"
                value={stats ? formatUSD(stats.highestSale) : "—"}
                isDark={isDark}
              />
              <StatPanel
                label="Total Pop"
                value={stats ? formatPop(stats.totalPop) : "—"}
                isDark={isDark}
              />
              <StatPanel
                label="Leader Card"
                value={
                  stats?.mostActiveCard?.mintyTransactions
                    ? stats.mostActiveCard.name.split(" ").slice(0, 2).join(" ")
                    : "—"
                }
                isDark={isDark}
              />
              <StatPanel
                label="Floor"
                value={stats ? formatUSD(stats.floor) : "—"}
                isDark={isDark}
              />
            </div>
          </div>

          {/* ── 3. Analytics Panels Row ── */}
          <div>
            <p
              style={{
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: isDark ? "rgba(150,210,185,0.5)" : "#9ca3af",
                marginBottom: "10px",
              }}
            >
              Analytics
            </p>
            <div
              data-ocid="set_detail.analytics.panel"
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              {/* Volume Trend sparkline */}
              <div
                className="rounded-2xl p-4"
                style={{
                  ...panelStyle,
                  minHeight: "130px",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: textPrimary,
                    marginBottom: "4px",
                  }}
                >
                  Volume Trend
                </p>
                <p
                  style={{
                    fontSize: "9px",
                    color: textSecondary,
                    marginBottom: "12px",
                  }}
                >
                  30-day activity
                </p>
                {cards.length > 0 ? (
                  <svg
                    viewBox="0 0 160 60"
                    style={{ width: "100%", height: "60px" }}
                    preserveAspectRatio="none"
                    aria-label="Volume trend chart"
                    role="img"
                  >
                    <defs>
                      <linearGradient
                        id="sparkGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#10b981"
                          stopOpacity="0.3"
                        />
                        <stop
                          offset="100%"
                          stopColor="#10b981"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,50 C20,48 30,30 50,28 C70,26 75,35 90,22 C105,10 120,18 140,12 C152,8 158,15 160,10"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M0,50 C20,48 30,30 50,28 C70,26 75,35 90,22 C105,10 120,18 140,12 C152,8 158,15 160,10 L160,60 L0,60 Z"
                      fill="url(#sparkGrad)"
                    />
                  </svg>
                ) : (
                  <div
                    style={{
                      height: "50px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: "11px", color: placeholderText }}>
                      No Minty market data yet
                    </span>
                  </div>
                )}
              </div>

              {/* Grade Distribution */}
              <div
                className="rounded-2xl p-4"
                style={{
                  ...panelStyle,
                  minHeight: "130px",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: textPrimary,
                    marginBottom: "4px",
                  }}
                >
                  Grade Distribution
                </p>
                <p
                  style={{
                    fontSize: "9px",
                    color: textSecondary,
                    marginBottom: "10px",
                  }}
                >
                  TAG population breakdown
                </p>
                {hasPop ? (
                  <div className="flex flex-col gap-2">
                    {[
                      {
                        label: "TAG 10",
                        value: gradeTotals.t10,
                        color: "#10b981",
                      },
                      {
                        label: "TAG 9",
                        value: gradeTotals.t9,
                        color: "#5eead4",
                      },
                      {
                        label: "TAG 8",
                        value: gradeTotals.t8,
                        color: "#99f6e4",
                      },
                    ].map((g) => (
                      <div key={g.label}>
                        <div className="flex justify-between mb-0.5">
                          <span
                            style={{
                              fontSize: "9px",
                              color: textSecondary,
                              fontWeight: 500,
                            }}
                          >
                            {g.label}
                          </span>
                          <span
                            style={{ fontSize: "9px", color: textSecondary }}
                          >
                            {formatPop(g.value)}
                          </span>
                        </div>
                        <div
                          style={{
                            height: "5px",
                            borderRadius: "3px",
                            background: isDark
                              ? "rgba(110,230,185,0.1)"
                              : "#e5e7eb",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${(g.value / gradeTotals.max) * 100}%`,
                              height: "100%",
                              background: g.color,
                              borderRadius: "3px",
                              transition: "width 0.6s ease",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      height: "50px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: "11px", color: placeholderText }}>
                      No population data yet
                    </span>
                  </div>
                )}
              </div>

              {/* Market Activity */}
              <div
                className="rounded-2xl p-4"
                style={{
                  ...panelStyle,
                  minHeight: "130px",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: textPrimary,
                    marginBottom: "4px",
                  }}
                >
                  Market Activity
                </p>
                <p
                  style={{
                    fontSize: "9px",
                    color: textSecondary,
                    marginBottom: "10px",
                  }}
                >
                  Top movers by transactions
                </p>
                {hasActivity ? (
                  <div className="flex flex-col gap-1.5">
                    {top5Cards.map((c) => (
                      <div key={c.id}>
                        <div className="flex justify-between mb-0.5">
                          <span
                            style={{
                              fontSize: "9px",
                              color: textSecondary,
                              fontWeight: 500,
                              maxWidth: "110px",
                            }}
                            className="truncate"
                          >
                            {c.name}
                          </span>
                          <span
                            style={{ fontSize: "9px", color: textSecondary }}
                          >
                            {c.mintyTransactions}
                          </span>
                        </div>
                        <div
                          style={{
                            height: "4px",
                            borderRadius: "2px",
                            background: isDark
                              ? "rgba(110,230,185,0.1)"
                              : "#e5e7eb",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${(c.mintyTransactions / maxTx) * 100}%`,
                              height: "100%",
                              background:
                                "linear-gradient(90deg, #10b981, #7ddfc2)",
                              borderRadius: "2px",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      height: "50px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: "11px", color: placeholderText }}>
                      No activity yet
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── 4. Ranked Card Leaderboard ── */}
          <div className="rounded-2xl overflow-hidden" style={panelStyle}>
            <div style={{ padding: "18px 18px 10px" }}>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: textPrimary,
                  marginBottom: "2px",
                }}
              >
                Cards in This Set
              </p>
              <p style={{ fontSize: "11px", color: textSecondary }}>
                Ranked by highest Minty volume
              </p>
            </div>

            {rankedCards.length === 0 ? (
              <div
                data-ocid="set_detail.cards.empty_state"
                style={{ textAlign: "center", padding: "32px 20px" }}
              >
                {/* Elegant empty structure hint */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    marginBottom: "16px",
                    opacity: 0.3,
                  }}
                >
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      style={{
                        height: "56px",
                        borderRadius: "10px",
                        background: isDark
                          ? "rgba(16,185,129,0.08)"
                          : "rgba(16,185,129,0.05)",
                        border: isDark
                          ? "1px solid rgba(110,230,185,0.1)"
                          : "1px solid rgba(16,185,129,0.1)",
                      }}
                    />
                  ))}
                </div>
                <p style={{ color: textSecondary, fontSize: "13px" }}>
                  No Minty market data yet
                </p>
                <p
                  style={{
                    color: placeholderText,
                    fontSize: "11px",
                    marginTop: "4px",
                  }}
                >
                  Cards will appear here once they have market activity.
                </p>
              </div>
            ) : (
              <div style={{ padding: "0 12px 12px" }}>
                {rankedCards.map((card, i) => {
                  const rank = i + 1;
                  const isTop3 = rank <= 3;
                  const cardVolume =
                    card.mintyTransactions * (card.averageSalePriceUsd || 0);
                  const trendUp =
                    card.lastSalePriceUsd > 0 && card.averageSalePriceUsd > 0
                      ? card.lastSalePriceUsd >= card.averageSalePriceUsd
                      : null;

                  return (
                    <motion.button
                      key={card.id}
                      type="button"
                      data-ocid={`set_detail.card.item.${rank}`}
                      onClick={() => setSelectedCard(card)}
                      whileHover={{ scale: 1.005 }}
                      whileTap={{ scale: 0.995 }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px",
                        marginBottom: "6px",
                        borderRadius: "14px",
                        cursor: "pointer",
                        textAlign: "left",
                        border: isTop3
                          ? isDark
                            ? `1px solid rgba(16,185,129,${rank === 1 ? "0.35" : "0.2"})`
                            : `1px solid rgba(16,185,129,${rank === 1 ? "0.3" : "0.15"})`
                          : isDark
                            ? "1px solid rgba(110,230,185,0.07)"
                            : "1px solid rgba(16,185,129,0.06)",
                        background: isTop3
                          ? isDark
                            ? `rgba(16,185,129,${rank === 1 ? "0.07" : "0.04"})`
                            : `rgba(16,185,129,${rank === 1 ? "0.05" : "0.025"})`
                          : "transparent",
                        boxShadow:
                          isTop3 && rank === 1
                            ? isDark
                              ? "0 0 12px rgba(16,185,129,0.1)"
                              : "0 2px 8px rgba(16,185,129,0.08)"
                            : "none",
                      }}
                    >
                      {/* Rank */}
                      <RankBadge rank={rank} />

                      {/* Card image */}
                      <div
                        style={{
                          width: "40px",
                          height: "56px",
                          flexShrink: 0,
                          borderRadius: "6px",
                          overflow: "hidden",
                          background: isDark
                            ? "rgba(16,185,129,0.08)"
                            : "rgba(16,185,129,0.05)",
                          border: isDark
                            ? "1px solid rgba(110,230,185,0.1)"
                            : "1px solid rgba(16,185,129,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {card.imageUrl ? (
                          <img
                            src={card.imageUrl}
                            alt={card.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                          />
                        ) : (
                          <span
                            style={{ fontSize: "10px", color: placeholderText }}
                          >
                            {card.number || "?"}
                          </span>
                        )}
                      </div>

                      {/* Card info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: textPrimary,
                            marginBottom: "1px",
                          }}
                          className="truncate"
                        >
                          {card.name}
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {card.number && (
                            <span
                              style={{ fontSize: "10px", color: textSecondary }}
                            >
                              #{card.number}
                            </span>
                          )}
                          {card.rarity && (
                            <span
                              style={{
                                fontSize: "9px",
                                fontWeight: 600,
                                padding: "1px 5px",
                                borderRadius: "4px",
                                background: "rgba(16,185,129,0.1)",
                                color: "#10b981",
                                border: "1px solid rgba(16,185,129,0.2)",
                              }}
                            >
                              {card.rarity}
                            </span>
                          )}
                        </div>
                        {card.tagPopulation10 > 0 && (
                          <p
                            style={{
                              fontSize: "9px",
                              color: textSecondary,
                              marginTop: "2px",
                            }}
                          >
                            TAG 10 Pop: {formatPop(card.tagPopulation10)}
                          </p>
                        )}
                      </div>

                      {/* Stats right side */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: textPrimary,
                          }}
                        >
                          {formatUSD(cardVolume)}
                        </p>
                        <p style={{ fontSize: "10px", color: textSecondary }}>
                          {card.mintyTransactions > 0
                            ? `${card.mintyTransactions} sales`
                            : "No sales"}
                        </p>
                        {card.lastSalePriceUsd > 0 && (
                          <div className="flex items-center justify-end gap-0.5 mt-0.5">
                            {trendUp !== null &&
                              (trendUp ? (
                                <TrendingUp
                                  size={9}
                                  style={{ color: "#10b981" }}
                                />
                              ) : (
                                <TrendingDown
                                  size={9}
                                  style={{ color: "#ef4444" }}
                                />
                              ))}
                            <p
                              style={{
                                fontSize: "10px",
                                color: trendUp
                                  ? "#10b981"
                                  : trendUp === false
                                    ? "#ef4444"
                                    : textSecondary,
                              }}
                            >
                              {formatUSDExact(card.lastSalePriceUsd)}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── 5. Card Detail Modal ── */}
      <AnimatePresence>
        {selectedCard && set && (
          <CardDetailModal
            key={selectedCard.id}
            card={selectedCard}
            setName={set.name}
            categoryName={categoryName}
            isDark={isDark}
            onClose={() => setSelectedCard(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
