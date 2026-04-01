import { ArrowLeft, ShieldCheck, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useTheme } from "../ThemeContext";

// ─── Data model ──────────────────────────────────────────────────────────────

interface SlabItem {
  id: string;
  type: "verified" | "trending" | "notable_sale" | "new_set" | "high_volume";
  cardName: string;
  setName: string;
  year: string;
  grade: number;
  grader: "TAG";
  population: number;
  marketPrice: number;
  condition: "Mint" | "Near Mint" | "Excellent" | "Good";
  listingCount: number;
  imageUrl: string;
  verifiedAt: number;
  label: string;
  certNumber: string;
  preferredPayment: "USDC" | "BTC" | "ETH" | "SOL";
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const NOW = Date.now();
const DAY = 86400000;

const MOCK_SLABS: SlabItem[] = [
  {
    id: "s1",
    type: "trending",
    cardName: "Charizard Holo",
    setName: "Base Set",
    year: "1999",
    grade: 10,
    grader: "TAG",
    population: 121,
    marketPrice: 42800,
    condition: "Mint",
    listingCount: 8,
    imageUrl: "https://picsum.photos/seed/charizard/200/280",
    verifiedAt: NOW - 2 * DAY,
    label: "Trending",
    certNumber: "84792341",
    preferredPayment: "SOL",
  },
  {
    id: "s2",
    type: "verified",
    cardName: "Pikachu Illustrator",
    setName: "CoroCoro Promo",
    year: "1998",
    grade: 9,
    grader: "TAG",
    population: 9,
    marketPrice: 375000,
    condition: "Near Mint",
    listingCount: 2,
    imageUrl: "https://picsum.photos/seed/pikachu98/200/280",
    verifiedAt: NOW - 1 * DAY,
    label: "Newly Verified",
    certNumber: "10245678",
    preferredPayment: "BTC",
  },
  {
    id: "s3",
    type: "notable_sale",
    cardName: "LeBron James RC",
    setName: "Topps Chrome",
    year: "2003",
    grade: 10,
    grader: "TAG",
    population: 44,
    marketPrice: 98500,
    condition: "Mint",
    listingCount: 5,
    imageUrl: "https://picsum.photos/seed/lebron2003/200/280",
    verifiedAt: NOW - 3 * DAY,
    label: "Notable Sale",
    certNumber: "0013847219",
    preferredPayment: "ETH",
  },
  {
    id: "s4",
    type: "new_set",
    cardName: "Mewtwo Holo",
    setName: "Base Set",
    year: "1999",
    grade: 9.5,
    grader: "TAG",
    population: 312,
    marketPrice: 1850,
    condition: "Near Mint",
    listingCount: 19,
    imageUrl: "https://picsum.photos/seed/mewtwo99/200/280",
    verifiedAt: NOW - 6 * DAY,
    label: "New Set Added",
    certNumber: "27654321",
    preferredPayment: "USDC",
  },
  {
    id: "s5",
    type: "high_volume",
    cardName: "Michael Jordan RC",
    setName: "Fleer",
    year: "1986",
    grade: 8,
    grader: "TAG",
    population: 1204,
    marketPrice: 24200,
    condition: "Excellent",
    listingCount: 34,
    imageUrl: "https://picsum.photos/seed/jordan86/200/280",
    verifiedAt: NOW - 4 * DAY,
    label: "High Volume",
    certNumber: "00493821",
    preferredPayment: "BTC",
  },
  {
    id: "s6",
    type: "verified",
    cardName: "Venusaur Holo",
    setName: "Base Set",
    year: "1999",
    grade: 10,
    grader: "TAG",
    population: 87,
    marketPrice: 9400,
    condition: "Mint",
    listingCount: 11,
    imageUrl: "https://picsum.photos/seed/venusaur99/200/280",
    verifiedAt: NOW - 12 * 3600000,
    label: "Newly Verified",
    certNumber: "84103928",
    preferredPayment: "SOL",
  },
  {
    id: "s7",
    type: "notable_sale",
    cardName: "Patrick Mahomes RC",
    setName: "Panini Prizm",
    year: "2017",
    grade: 10,
    grader: "TAG",
    population: 523,
    marketPrice: 4200,
    condition: "Mint",
    listingCount: 27,
    imageUrl: "https://picsum.photos/seed/mahomes17/200/280",
    verifiedAt: NOW - 5 * DAY,
    label: "Notable Sale",
    certNumber: "61209384",
    preferredPayment: "USDC",
  },
  {
    id: "s8",
    type: "trending",
    cardName: "Blastoise Holo",
    setName: "Base Set",
    year: "1999",
    grade: 9,
    grader: "TAG",
    population: 498,
    marketPrice: 3150,
    condition: "Near Mint",
    listingCount: 22,
    imageUrl: "https://picsum.photos/seed/blastoise99/200/280",
    verifiedAt: NOW - 7 * DAY,
    label: "Trending",
    certNumber: "74839201",
    preferredPayment: "ETH",
  },
  {
    id: "s9",
    type: "verified",
    cardName: "Kobe Bryant RC",
    setName: "Topps Chrome",
    year: "1996",
    grade: 9.5,
    grader: "TAG",
    population: 67,
    marketPrice: 55000,
    condition: "Near Mint",
    listingCount: 4,
    imageUrl: "https://picsum.photos/seed/kobe96/200/280",
    verifiedAt: NOW - 8 * 3600000,
    label: "Newly Verified",
    certNumber: "09812374",
    preferredPayment: "BTC",
  },
  {
    id: "s10",
    type: "new_set",
    cardName: "Lugia 1st Edition",
    setName: "Neo Genesis",
    year: "2000",
    grade: 10,
    grader: "TAG",
    population: 36,
    marketPrice: 18900,
    condition: "Mint",
    listingCount: 6,
    imageUrl: "https://picsum.photos/seed/lugia2000/200/280",
    verifiedAt: NOW - 2 * DAY,
    label: "New Set Added",
    certNumber: "55023847",
    preferredPayment: "SOL",
  },
  {
    id: "s11",
    type: "high_volume",
    cardName: "Tom Brady RC",
    setName: "Playoff Contenders",
    year: "2000",
    grade: 8.5,
    grader: "TAG",
    population: 312,
    marketPrice: 8750,
    condition: "Excellent",
    listingCount: 41,
    imageUrl: "https://picsum.photos/seed/brady2000/200/280",
    verifiedAt: NOW - 3 * DAY,
    label: "High Volume",
    certNumber: "38201948",
    preferredPayment: "USDC",
  },
  {
    id: "s12",
    type: "verified",
    cardName: "Gengar Holo",
    setName: "Fossil",
    year: "1999",
    grade: 9,
    grader: "TAG",
    population: 744,
    marketPrice: 620,
    condition: "Near Mint",
    listingCount: 58,
    imageUrl: "https://picsum.photos/seed/gengar99/200/280",
    verifiedAt: NOW - 4 * 3600000,
    label: "Newly Verified",
    certNumber: "66312098",
    preferredPayment: "ETH",
  },
  {
    id: "s13",
    type: "notable_sale",
    cardName: "Luka Doncic RC",
    setName: "Panini Prizm Silver",
    year: "2018",
    grade: 10,
    grader: "TAG",
    population: 892,
    marketPrice: 3400,
    condition: "Mint",
    listingCount: 47,
    imageUrl: "https://picsum.photos/seed/luka18/200/280",
    verifiedAt: NOW - 6 * DAY,
    label: "Notable Sale",
    certNumber: "72039481",
    preferredPayment: "SOL",
  },
  {
    id: "s14",
    type: "trending",
    cardName: "Eevee Promo",
    setName: "McDonald's",
    year: "2021",
    grade: 7,
    grader: "TAG",
    population: 8203,
    marketPrice: 185,
    condition: "Good",
    listingCount: 113,
    imageUrl: "https://picsum.photos/seed/eevee21/200/280",
    verifiedAt: NOW - 5 * DAY,
    label: "Trending",
    certNumber: "91038274",
    preferredPayment: "BTC",
  },
  {
    id: "s15",
    type: "verified",
    cardName: "Victor Wembanyama RC",
    setName: "Panini Prizm",
    year: "2023",
    grade: 10,
    grader: "TAG",
    population: 1144,
    marketPrice: 2100,
    condition: "Mint",
    listingCount: 63,
    imageUrl: "https://picsum.photos/seed/wemby23/200/280",
    verifiedAt: NOW - 6 * 3600000,
    label: "Newly Verified",
    certNumber: "48203917",
    preferredPayment: "USDC",
  },
];

// ─── Colour constants (detail sheet — unchanged dark palette) ────────────────

const C = {
  accent: "oklch(0.70 0.18 160)",
  accentGlow: "oklch(0.70 0.18 160 / 0.22)",
  bg: "oklch(0.08 0.02 160)",
  panel: "oklch(0.18 0.06 160 / 0.42)",
  border: "oklch(0.55 0.12 160 / 0.18)",
  text: "oklch(0.95 0.01 160)",
  textSec: "oklch(0.60 0.08 160)",
  pos: "oklch(0.72 0.17 145)",
  neg: "oklch(0.60 0.18 25)",
};

// ─── Card surface tokens (light mode — white marketplace style) ──────────────

const CARD = {
  bg: "#FFFFFF",
  bgHover: "#fafafa",
  border: "rgba(0,0,0,0.05)",
  borderHover: "rgba(0,0,0,0.08)",
  shadow: "0 8px 22px rgba(0,0,0,0.05)",
  shadowHover: "0 10px 28px rgba(0,0,0,0.09)",
  radius: 16,
  title: "#1a1a1a",
  secondary: "#6b7280",
  price: "#1a1a1a",
  pos: "#10b981",
  neg: "#f43f5e",
  imgBorder: "rgba(0,0,0,0.08)",
};

// ─── Card surface tokens (dark mode — crystal-green glass) ───────────────────

const DARK_CARD = {
  bg: "oklch(0.10 0.04 160 / 0.55)",
  bgHover: "oklch(0.13 0.05 160 / 0.62)",
  border: "oklch(0.55 0.14 160 / 0.22)",
  borderHover: "oklch(0.55 0.14 160 / 0.30)",
  shadow:
    "0 4px 24px oklch(0.70 0.18 160 / 0.12), inset 0 1px 0 oklch(0.80 0.12 160 / 0.08)",
  shadowHover:
    "0 6px 30px oklch(0.70 0.18 160 / 0.18), inset 0 1px 0 oklch(0.80 0.12 160 / 0.10)",
  radius: 16,
  title: "oklch(0.92 0.04 160)",
  secondary: "oklch(0.58 0.08 160)",
  price: "oklch(0.92 0.04 160)",
  pos: "oklch(0.72 0.17 145)",
  neg: "oklch(0.62 0.18 25)",
  imgBorder: "oklch(0.55 0.12 160 / 0.20)",
};

// ─── Price formatter ─────────────────────────────────────────────────────────

function fmtPrice(usd: number): string {
  if (usd >= 1000000) return `$${(usd / 1000000).toFixed(2)}M`;
  if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}K`;
  return `$${usd.toLocaleString()}`;
}

// ─── Grade badge ─────────────────────────────────────────────────────────────

function GradeBadge({
  grade,
  isDark,
}: {
  grade: number;
  isDark?: boolean;
}) {
  return (
    <span
      style={{
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.04em",
        padding: "2px 6px",
        borderRadius: "4px",
        background: isDark
          ? "oklch(0.70 0.18 160 / 0.12)"
          : "rgba(16,185,129,0.10)",
        border: isDark
          ? "1px solid oklch(0.70 0.18 160 / 0.22)"
          : "1px solid rgba(16,185,129,0.15)",
        color: isDark ? "oklch(0.78 0.14 160)" : "#1f9d84",
        whiteSpace: "nowrap" as const,
      }}
    >
      TAG {grade}
    </span>
  );
}

// ─── Crypto icons ─────────────────────────────────────────────────────────────

function USDCIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      role="img"
      aria-label="USDC"
    >
      <circle cx="7" cy="7" r="6.5" fill="#2775ca" />
      <text
        x="7"
        y="10.5"
        textAnchor="middle"
        fontSize="8"
        fontWeight="700"
        fill="white"
        fontFamily="system-ui"
      >
        $
      </text>
    </svg>
  );
}

function BTCIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      role="img"
      aria-label="BTC"
    >
      <text
        x="7"
        y="11"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="#f7931a"
        fontFamily="system-ui"
      >
        ₿
      </text>
    </svg>
  );
}

function ETHIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      role="img"
      aria-label="ETH"
    >
      <polygon points="7,1 12,7 7,9.5 2,7" fill="#627eea" opacity="0.85" />
      <polygon points="7,9.5 12,7 7,13 2,7" fill="#627eea" />
    </svg>
  );
}

function SOLIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      role="img"
      aria-label="SOL"
    >
      <defs>
        <linearGradient
          id="sol-grad"
          x1="0"
          y1="0"
          x2="14"
          y2="14"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9945FF" />
          <stop offset="1" stopColor="#14F195" />
        </linearGradient>
      </defs>
      <rect
        x="1"
        y="2.5"
        width="12"
        height="2"
        rx="1"
        fill="url(#sol-grad)"
        transform="rotate(-8 7 3.5)"
      />
      <rect x="1" y="6" width="12" height="2" rx="1" fill="url(#sol-grad)" />
      <rect
        x="1"
        y="9.5"
        width="12"
        height="2"
        rx="1"
        fill="url(#sol-grad)"
        transform="rotate(8 7 10.5)"
      />
    </svg>
  );
}

// ─── Preferred Payment Badge ──────────────────────────────────────────────────

function PreferredPaymentBadge({
  payment,
  isDark,
}: {
  payment: SlabItem["preferredPayment"];
  isDark?: boolean;
}) {
  const icon =
    payment === "USDC" ? (
      <USDCIcon />
    ) : payment === "BTC" ? (
      <BTCIcon />
    ) : payment === "ETH" ? (
      <ETHIcon />
    ) : (
      <SOLIcon />
    );

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 2,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "3px 8px 3px 5px",
          borderRadius: 99,
          background: isDark
            ? "oklch(0.70 0.18 160 / 0.08)"
            : "rgba(0,0,0,0.04)",
          border: isDark
            ? "1px solid oklch(0.70 0.18 160 / 0.18)"
            : "1px solid rgba(0,0,0,0.08)",
          whiteSpace: "nowrap" as const,
        }}
      >
        {icon}
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.03em",
            color: isDark ? "oklch(0.85 0.06 160)" : "#374151",
          }}
        >
          {payment}
        </span>
      </span>
      <span
        style={{
          fontSize: "9px",
          fontWeight: 500,
          letterSpacing: "0.03em",
          color: isDark ? "oklch(0.55 0.07 160)" : "#9ca3af",
          paddingRight: 2,
        }}
      >
        Preferred Payment
      </span>
    </div>
  );
}

// ─── TAG grade distribution (for detail sheet) ────────────────────────────────

const TAG_GRADE_DIST: { grade: string; count: number }[] = [
  { grade: "TAG 10", count: 121 },
  { grade: "TAG 9.5", count: 284 },
  { grade: "TAG 9", count: 543 },
  { grade: "TAG 8.5", count: 388 },
  { grade: "TAG 8", count: 210 },
];

function mockSales(price: number) {
  return [
    { date: "Jun 18, 2025", price: Math.round(price * 0.97) },
    { date: "Jun 14, 2025", price: Math.round(price * 0.93) },
    { date: "Jun 9, 2025", price: Math.round(price * 0.91) },
    { date: "May 31, 2025", price: Math.round(price * 0.88) },
  ];
}

// ─── Buy / Offer Modal ────────────────────────────────────────────────────────

type PaymentOption = "USDC" | "BTC" | "ETH" | "SOL";
const PAYMENT_OPTIONS: PaymentOption[] = ["USDC", "BTC", "ETH", "SOL"];

function PaymentChip({
  payment,
  selected,
  isDark,
  onClick,
}: {
  payment: PaymentOption;
  selected: boolean;
  isDark: boolean;
  onClick: () => void;
}) {
  const icon =
    payment === "USDC" ? (
      <USDCIcon />
    ) : payment === "BTC" ? (
      <BTCIcon />
    ) : payment === "ETH" ? (
      <ETHIcon />
    ) : (
      <SOLIcon />
    );

  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={`buy_offer.${payment.toLowerCase()}.toggle`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "6px 12px 6px 8px",
        borderRadius: 99,
        border: selected
          ? "1.5px solid rgba(125,223,194,0.60)"
          : isDark
            ? "1px solid oklch(0.70 0.18 160 / 0.18)"
            : "1px solid rgba(0,0,0,0.08)",
        background: selected
          ? "linear-gradient(135deg, #c8f5e6, #9fe8d0, #7ddfc2)"
          : isDark
            ? "oklch(0.70 0.18 160 / 0.08)"
            : "rgba(0,0,0,0.04)",
        color: selected
          ? "#0f2a25"
          : isDark
            ? "oklch(0.85 0.06 160)"
            : "#374151",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: 12,
        letterSpacing: "0.03em",
        transition: "all 0.15s",
        whiteSpace: "nowrap" as const,
      }}
    >
      {icon}
      {payment}
    </button>
  );
}

function BuyOfferModal({
  slab,
  isDark,
  onClose,
}: {
  slab: SlabItem;
  isDark: boolean;
  onClose: () => void;
}) {
  const [stage, setStage] = useState<"choose" | "payment">("choose");
  const [chosenAction, setChosenAction] = useState<
    "Buy now" | "Make offer" | null
  >(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentOption | null>(
    null,
  );

  const panelBg = isDark ? "oklch(0.12 0.04 160 / 0.92)" : "#ffffff";
  const panelBorder = isDark
    ? "1px solid oklch(0.55 0.12 160 / 0.22)"
    : "1px solid rgba(0,0,0,0.08)";
  const titleColor = isDark ? "oklch(0.92 0.04 160)" : "#1a1a1a";
  const secColor = isDark ? "oklch(0.58 0.08 160)" : "#6b7280";
  const optionBg = isDark ? "oklch(0.18 0.06 160 / 0.50)" : "#f9fafb";
  const optionBorder = isDark
    ? "1px solid oklch(0.55 0.12 160 / 0.20)"
    : "1px solid rgba(0,0,0,0.06)";
  const optionColor = isDark ? "oklch(0.88 0.04 160)" : "#1a1a1a";

  function handleChoose(action: "Buy now" | "Make offer") {
    setChosenAction(action);
    setSelectedPayment(null);
    setStage("payment");
  }

  function handleConfirm() {
    // Placeholder confirm action
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.65)", padding: "0 16px" }}
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      data-ocid="buy_offer.modal"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 340,
          background: panelBg,
          backdropFilter: isDark ? "blur(20px)" : undefined,
          WebkitBackdropFilter: isDark ? "blur(20px)" : undefined,
          border: panelBorder,
          borderRadius: 20,
          boxShadow: isDark
            ? "0 20px 60px oklch(0.70 0.18 160 / 0.14)"
            : "0 20px 60px rgba(0,0,0,0.12)",
          overflow: "hidden",
        }}
      >
        {stage === "choose" ? (
          <div style={{ padding: "22px 20px 24px" }}>
            {/* Header */}
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: 18 }}
            >
              <p style={{ fontSize: 16, fontWeight: 700, color: titleColor }}>
                Choose action
              </p>
              <button
                type="button"
                onClick={onClose}
                data-ocid="buy_offer.close_button"
                aria-label="Close"
                style={{
                  background: isDark
                    ? "oklch(0.18 0.04 160)"
                    : "rgba(0,0,0,0.05)",
                  border: panelBorder,
                  borderRadius: 99,
                  padding: 6,
                  color: secColor,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Slab hint */}
            <p style={{ fontSize: 11, color: secColor, marginBottom: 14 }}>
              {slab.cardName} · {fmtPrice(slab.marketPrice)}
            </p>

            {/* Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(["Buy now", "Make offer"] as const).map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => handleChoose(action)}
                  data-ocid={`buy_offer.${action === "Buy now" ? "buy_now" : "make_offer"}.button`}
                  style={{
                    width: "100%",
                    padding: "13px 18px",
                    borderRadius: 12,
                    background: optionBg,
                    border: optionBorder,
                    color: optionColor,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.12s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {action}
                  <span style={{ fontSize: 16, opacity: 0.4 }}>›</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ padding: "22px 20px 24px" }}>
            {/* Header */}
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: 6 }}
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStage("choose")}
                  data-ocid="buy_offer.back_button"
                  aria-label="Back"
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    color: secColor,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <ArrowLeft size={16} />
                </button>
                <p style={{ fontSize: 16, fontWeight: 700, color: titleColor }}>
                  {chosenAction}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                data-ocid="buy_offer.close_button"
                aria-label="Close"
                style={{
                  background: isDark
                    ? "oklch(0.18 0.04 160)"
                    : "rgba(0,0,0,0.05)",
                  border: panelBorder,
                  borderRadius: 99,
                  padding: 6,
                  color: secColor,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={14} />
              </button>
            </div>

            <p style={{ fontSize: 11, color: secColor, marginBottom: 18 }}>
              Select payment method
            </p>

            {/* Payment chips */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 20,
              }}
            >
              {PAYMENT_OPTIONS.map((p) => (
                <PaymentChip
                  key={p}
                  payment={p}
                  selected={selectedPayment === p}
                  isDark={isDark}
                  onClick={() =>
                    setSelectedPayment(selectedPayment === p ? null : p)
                  }
                />
              ))}
            </div>

            {/* Confirm button */}
            {selectedPayment && (
              <button
                type="button"
                onClick={handleConfirm}
                data-ocid="buy_offer.confirm_button"
                style={{
                  width: "100%",
                  padding: "12px 18px",
                  borderRadius: 16,
                  background:
                    "linear-gradient(135deg, #c8f5e6, #9fe8d0, #7ddfc2)",
                  color: "#0f2a25",
                  fontSize: 14,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  boxShadow:
                    "0 2px 6px rgba(0,0,0,0.06), 0 0 0 1px rgba(125,223,194,0.35)",
                  transition: "opacity 0.15s",
                  letterSpacing: "0.01em",
                }}
              >
                Confirm — {selectedPayment}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Slab detail sheet ────────────────────────────────────────────────────────

function SlabDetailSheet({
  slab,
  onClose,
}: {
  slab: SlabItem;
  onClose: () => void;
}) {
  const sales = mockSales(slab.marketPrice);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      data-ocid="releases.modal"
      style={{ background: "rgba(0,0,0,0.72)" }}
    >
      <div
        className="w-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        style={{
          background: "oklch(0.12 0.04 160 / 0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${C.border}`,
          borderRadius: "20px 20px 0 0",
          maxHeight: "90dvh",
          boxShadow: "0 -4px 40px oklch(0.70 0.18 160 / 0.10)",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 99,
              background: "oklch(0.35 0.05 160)",
            }}
          />
        </div>

        <div className="px-5 pb-10 pt-2">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex gap-4">
              <img
                src={slab.imageUrl}
                alt={slab.cardName}
                style={{
                  width: 96,
                  height: 134,
                  borderRadius: 10,
                  objectFit: "cover",
                  border: `1px solid ${C.border}`,
                  boxShadow: "0 0 20px oklch(0.70 0.18 160 / 0.14)",
                  flexShrink: 0,
                }}
              />
              <div className="flex flex-col gap-1.5 justify-center">
                <PreferredPaymentBadge payment={slab.preferredPayment} isDark />
                <p
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: C.text,
                    lineHeight: 1.2,
                  }}
                >
                  {slab.cardName}
                </p>
                <p style={{ fontSize: 12, color: C.textSec }}>
                  {slab.setName} · {slab.year}
                </p>
                <GradeBadge grade={slab.grade} isDark />
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              data-ocid="releases.close_button"
              aria-label="Close"
              style={{
                background: "oklch(0.18 0.04 160)",
                border: `1px solid ${C.border}`,
                borderRadius: 99,
                padding: 6,
                color: C.textSec,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* List Price */}
          <section
            style={{
              background: C.panel,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "14px 16px",
              marginBottom: 12,
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: C.textSec,
                marginBottom: 10,
              }}
            >
              List Price
            </p>
            <div className="flex items-baseline gap-3">
              <p style={{ fontSize: 26, fontWeight: 700, color: C.text }}>
                {fmtPrice(slab.marketPrice)}
              </p>
              <p style={{ fontSize: 12, color: C.textSec }}>
                {slab.listingCount} listed
              </p>
            </div>
          </section>

          {/* Population */}
          <section
            style={{
              background: C.panel,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "14px 16px",
              marginBottom: 12,
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: C.textSec,
                marginBottom: 10,
              }}
            >
              Population Data
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {TAG_GRADE_DIST.map((row) => (
                  <tr key={row.grade}>
                    <td
                      style={{
                        fontSize: 12,
                        color: C.textSec,
                        paddingBottom: 6,
                        width: "60%",
                      }}
                    >
                      {row.grade}
                    </td>
                    <td
                      style={{
                        fontSize: 12,
                        color: C.text,
                        fontWeight: 600,
                        textAlign: "right",
                        paddingBottom: 6,
                      }}
                    >
                      {row.count.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Recent Sales */}
          <section
            style={{
              background: C.panel,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "14px 16px",
              marginBottom: 12,
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: C.textSec,
                marginBottom: 10,
              }}
            >
              Recent Sales
            </p>
            {sales.map((s) => (
              <div
                key={s.date}
                className="flex justify-between items-center"
                style={{ paddingBottom: 8 }}
              >
                <span style={{ fontSize: 12, color: C.textSec }}>{s.date}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                  {fmtPrice(s.price)}
                </span>
              </div>
            ))}
          </section>

          {/* Verification */}
          <section
            style={{
              background: C.panel,
              border: "1px solid oklch(0.70 0.18 160 / 0.20)",
              borderRadius: 12,
              padding: "14px 16px",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={14} color={C.accent} />
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: C.textSec,
                }}
              >
                Verification Status
              </p>
            </div>
            <div className="flex justify-between">
              <div>
                <p style={{ fontSize: 11, color: C.textSec }}>
                  Grading Company
                </p>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: C.accent,
                    marginTop: 2,
                  }}
                >
                  TAG
                </p>
              </div>
              <div className="text-right">
                <p style={{ fontSize: 11, color: C.textSec }}>Cert #</p>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.text,
                    fontFamily: "monospace",
                    marginTop: 2,
                  }}
                >
                  {slab.certNumber}
                </p>
              </div>
            </div>
            <div
              style={{
                marginTop: 10,
                padding: "6px 10px",
                borderRadius: 8,
                background: "oklch(0.70 0.18 160 / 0.08)",
                border: "1px solid oklch(0.70 0.18 160 / 0.20)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <ShieldCheck size={12} color={C.accent} />
              <span style={{ fontSize: 11, color: C.accent, fontWeight: 600 }}>
                Verified Authentic
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ─── Slab card ────────────────────────────────────────────────────────────────

function SlabCard({
  slab,
  index,
  onTap,
  onBuyOffer,
  isDark,
}: {
  slab: SlabItem;
  index: number;
  onTap: () => void;
  onBuyOffer: (slab: SlabItem) => void;
  isDark: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const T = isDark ? DARK_CARD : CARD;

  return (
    // biome-ignore lint/a11y/useSemanticElements: outer div needed to allow nested button
    <div
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTap();
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-ocid={`releases.item.${index + 1}`}
      style={{
        display: "flex",
        width: "100%",
        alignItems: "stretch",
        background: hovered ? T.bgHover : T.bg,
        border: `1px solid ${hovered ? T.borderHover : T.border}`,
        borderRadius: T.radius,
        overflow: "hidden",
        cursor: "pointer",
        textAlign: "left",
        transition:
          "background 0.15s, border-color 0.15s, box-shadow 0.15s, transform 0.15s",
        boxShadow: hovered ? T.shadowHover : T.shadow,
        backdropFilter: isDark ? "blur(14px)" : undefined,
        WebkitBackdropFilter: isDark ? "blur(14px)" : undefined,
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
        position: "relative",
      }}
    >
      {/* Thumbnail */}
      <img
        src={slab.imageUrl}
        alt={slab.cardName}
        style={{
          width: 64,
          height: 90,
          objectFit: "cover",
          flexShrink: 0,
          margin: "12px 0 12px 12px",
          borderRadius: 8,
          border: `1px solid ${T.imgBorder}`,
        }}
        loading="lazy"
      />

      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: "10px 12px 10px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          minWidth: 0,
        }}
      >
        {/* Top: card name + preferred payment badge */}
        <div className="flex items-start justify-between gap-2">
          <p
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: T.title,
              lineHeight: 1.25,
              flex: 1,
              minWidth: 0,
            }}
          >
            {slab.cardName}
          </p>
          <PreferredPaymentBadge
            payment={slab.preferredPayment}
            isDark={isDark}
          />
        </div>

        {/* Set + year */}
        <p style={{ fontSize: 11, color: T.secondary }}>
          {slab.setName} · {slab.year}
        </p>

        {/* TAG grade badge + population */}
        <div className="flex items-center gap-2 flex-wrap">
          <GradeBadge grade={slab.grade} isDark={isDark} />
          <span style={{ fontSize: 10, color: T.secondary }}>
            Pop {slab.population.toLocaleString()}
          </span>
        </div>

        {/* Bottom: price + Buy/Offer button */}
        <div
          className="flex items-end justify-between"
          style={{ marginTop: 4 }}
        >
          <div>
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: T.price,
                letterSpacing: "-0.01em",
                display: "block",
              }}
            >
              {fmtPrice(slab.marketPrice)}
            </span>
            <span
              style={{
                fontSize: 10,
                color: T.secondary,
                display: "block",
                marginTop: 1,
              }}
            >
              {slab.listingCount} listed
            </span>
          </div>

          {/* Buy / Offer button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBuyOffer(slab);
            }}
            data-ocid={`releases.item.${index + 1}.button`}
            style={{
              borderRadius: 16,
              padding: "6px 14px",
              fontWeight: 600,
              fontSize: 12,
              background: "linear-gradient(135deg, #c8f5e6, #9fe8d0, #7ddfc2)",
              color: "#0f2a25",
              boxShadow:
                "0 2px 6px rgba(0,0,0,0.06), 0 0 0 1px rgba(125,223,194,0.35)",
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap" as const,
              letterSpacing: "0.01em",
              flexShrink: 0,
            }}
          >
            Buy / Offer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sort filter bar ──────────────────────────────────────────────────────────

type SortMode = "most_viewed" | "new" | "minted";

const SORT_LABELS: { key: SortMode; label: string }[] = [
  { key: "most_viewed", label: "Most Viewed" },
  { key: "new", label: "New" },
  { key: "minted", label: "Minted" },
];

// ─── Main page ────────────────────────────────────────────────────────────────

interface ReleasesPageProps {
  onAlbumClick?: (albumId: string) => void;
  onRecord?: () => void;
}

export function ReleasesPage(_props: ReleasesPageProps) {
  const { theme } = useTheme();
  const [sortMode, setSortMode] = useState<SortMode>("most_viewed");
  const [selectedSlab, setSelectedSlab] = useState<SlabItem | null>(null);
  const [buyOfferSlab, setBuyOfferSlab] = useState<SlabItem | null>(null);

  const isLight = theme === "light";
  const isDark = !isLight;

  const sorted = useMemo(() => {
    const arr = [...MOCK_SLABS];
    if (sortMode === "most_viewed") {
      arr.sort((a, b) => b.listingCount - a.listingCount);
    } else if (sortMode === "new") {
      arr.sort((a, b) => b.verifiedAt - a.verifiedAt);
    } else {
      // minted: sort by highest market price
      arr.sort((a, b) => b.marketPrice - a.marketPrice);
    }
    return arr;
  }, [sortMode]);

  const bgColor = isLight ? "#f8f8f8" : C.bg;

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: bgColor,
        paddingTop: 72,
        paddingBottom: 68,
      }}
    >
      {/* Filter bar */}
      <div
        style={{
          position: "sticky",
          top: 72,
          zIndex: 20,
          background: isLight
            ? "rgba(248,248,248,0.95)"
            : "oklch(0.08 0.02 160 / 0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${isLight ? "rgba(0,0,0,0.06)" : C.border}`,
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            display: "flex",
            background: isDark
              ? "oklch(0.14 0.04 160 / 0.50)"
              : "rgba(0,0,0,0.04)",
            border: isDark
              ? "1px solid oklch(0.55 0.12 160 / 0.18)"
              : "1px solid rgba(0,0,0,0.08)",
            borderRadius: 99,
            padding: "3px",
            gap: 2,
          }}
        >
          {SORT_LABELS.map(({ key, label }) => {
            const isActive = sortMode === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSortMode(key)}
                data-ocid={`releases.${key}.tab`}
                style={{
                  padding: "5px 14px",
                  borderRadius: 99,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  border:
                    isDark && isActive
                      ? "1px solid oklch(0.70 0.18 160 / 0.30)"
                      : "none",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  background: isActive
                    ? isDark
                      ? "oklch(0.70 0.18 160 / 0.22)"
                      : "#10b981"
                    : "transparent",
                  color: isActive
                    ? isDark
                      ? "oklch(0.85 0.10 160)"
                      : "#ffffff"
                    : isDark
                      ? "oklch(0.58 0.08 160)"
                      : "#6b7280",
                  boxShadow: "none",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <span
          style={{
            marginLeft: "auto",
            fontSize: 11,
            color: isDark ? "oklch(0.58 0.08 160)" : "#6b7280",
            fontWeight: 500,
          }}
        >
          {sorted.length} slabs
        </span>
      </div>

      {/* Feed */}
      <main
        style={{
          padding: "6px 16px 12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {sorted.map((slab, i) => (
          <SlabCard
            key={slab.id}
            slab={slab}
            index={i}
            onTap={() => setSelectedSlab(slab)}
            onBuyOffer={(s) => setBuyOfferSlab(s)}
            isDark={isDark}
          />
        ))}
      </main>

      {/* Detail sheet */}
      {selectedSlab && (
        <SlabDetailSheet
          slab={selectedSlab}
          onClose={() => setSelectedSlab(null)}
        />
      )}

      {/* Buy / Offer modal */}
      {buyOfferSlab && (
        <BuyOfferModal
          slab={buyOfferSlab}
          isDark={isDark}
          onClose={() => setBuyOfferSlab(null)}
        />
      )}
    </div>
  );
}
