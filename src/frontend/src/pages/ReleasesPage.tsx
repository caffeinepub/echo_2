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
  nftEligible?: boolean;
}

// ─── Live Offer types & helpers ───────────────────────────────────────────────

type PaymentOption = "USDC" | "BTC" | "ETH" | "SOL";

interface LiveOffer {
  id: string;
  slabId: string;
  amountUsd: number;
  currency: PaymentOption;
  expiresAt: number; // timestamp ms
}

const CRYPTO_RATES: Record<PaymentOption, number> = {
  USDC: 1,
  BTC: 65000,
  ETH: 2700,
  SOL: 145,
};

function cryptoAmount(usd: number, currency: PaymentOption): string {
  const amount = usd / CRYPTO_RATES[currency];
  if (currency === "USDC") return amount.toFixed(2);
  if (currency === "BTC") return amount.toFixed(6);
  if (currency === "ETH") return amount.toFixed(4);
  return amount.toFixed(3);
}

function fmtExpiry(expiresAt: number): string {
  const diff = expiresAt - Date.now();
  if (diff <= 0) return "Active";
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${h}h left`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return rh > 0 ? `${d}d ${rh}h left` : `${d}d left`;
}

function seedOffers(): Record<string, LiveOffer[]> {
  const H = 3600000;
  const currencies: PaymentOption[] = ["USDC", "BTC", "ETH", "SOL"];
  const map: Record<string, LiveOffer[]> = {};
  MOCK_SLABS.forEach((slab, si) => {
    map[slab.id] = [
      {
        id: `seed-${slab.id}-0`,
        slabId: slab.id,
        amountUsd: Math.round(slab.marketPrice * 0.97),
        currency: currencies[si % 4],
        expiresAt: Date.now() - H, // already expired → "Active"
      },
      {
        id: `seed-${slab.id}-1`,
        slabId: slab.id,
        amountUsd: Math.round(slab.marketPrice * 0.93),
        currency: currencies[(si + 1) % 4],
        expiresAt: Date.now() + 2 * H, // 2h left
      },
      {
        id: `seed-${slab.id}-2`,
        slabId: slab.id,
        amountUsd: Math.round(slab.marketPrice * 0.89),
        currency: currencies[(si + 2) % 4],
        expiresAt: Date.now() - 2 * H, // already expired → "Active"
      },
    ];
  });
  return map;
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
    nftEligible: true,
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
    nftEligible: false,
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
    nftEligible: true,
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
    nftEligible: false,
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
    nftEligible: true,
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
    nftEligible: false,
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
    nftEligible: false,
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
    nftEligible: true,
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
    nftEligible: true,
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
    nftEligible: false,
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

// Seeded offers — depends on MOCK_SLABS, defined after it
const SEEDED_OFFERS = seedOffers();

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
  title: "#111111",
  secondary: "#6b7280",
  price: "#111111",
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
  title: "#e8f5f0",
  secondary: "rgba(180,220,205,0.55)",
  price: "#f0faf6",
  pos: "oklch(0.72 0.17 145)",
  neg: "oklch(0.62 0.18 25)",
  imgBorder: "oklch(0.55 0.12 160 / 0.20)",
};

// ─── Price formatter ─────────────────────────────────────────────────────────

function fmtPop(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

function fmtPrice(usd: number): string {
  if (usd >= 1000000) return `$${(usd / 1000000).toFixed(2)}M`;
  if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}K`;
  return `$${usd.toLocaleString()}`;
}

// ─── NFT Vault Ice Icon & Modal ──────────────────────────────────────────────

// biome-ignore lint/correctness/noUnusedVariables: reserved for buyer checkout
function IceNftIcon({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      aria-label="Minty Vault NFT Available"
      data-ocid="releases.nft_vault.button"
      style={{
        background: "none",
        border: "none",
        padding: 2,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        opacity: 0.85,
        transition: "opacity 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.opacity = "1";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.opacity = "0.85";
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#7ddfc2"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-label="NFT eligible snowflake"
        role="img"
      >
        {/* Center vertical */}
        <line x1="12" y1="2" x2="12" y2="22" />
        {/* Center horizontal */}
        <line x1="2" y1="12" x2="22" y2="12" />
        {/* Diagonal 1 */}
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        {/* Diagonal 2 */}
        <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
        {/* Branch tips - top */}
        <polyline points="9,5 12,2 15,5" />
        {/* Branch tips - bottom */}
        <polyline points="9,19 12,22 15,19" />
        {/* Branch tips - left */}
        <polyline points="5,9 2,12 5,15" />
        {/* Branch tips - right */}
        <polyline points="19,9 22,12 19,15" />
        {/* Small center diamond */}
        <circle cx="12" cy="12" r="1.5" fill="#7ddfc2" stroke="none" />
      </svg>
    </button>
  );
}

// biome-ignore lint/correctness/noUnusedVariables: reserved for buyer checkout
function NftVaultModal({
  isDark,
  onClose,
}: {
  isDark: boolean;
  onClose: () => void;
}) {
  const bg = isDark ? "oklch(0.12 0.04 160 / 0.97)" : "#ffffff";
  const border = isDark
    ? "oklch(0.70 0.18 160 / 0.25)"
    : "rgba(125,223,194,0.25)";
  const titleColor = isDark ? "oklch(0.92 0.04 160)" : "#0f2a25";
  const bodyColor = isDark ? "oklch(0.72 0.06 160)" : "#374151";
  const bulletColor = "#7ddfc2";

  const benefits = [
    "Instant settlement",
    "No shipping delays",
    "Secure storage",
    "Tradable digitally",
    "Verified ownership history",
  ];

  return (
    <div
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      role="presentation"
      data-ocid="releases.nft_vault.modal"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        padding: "0 16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        style={{
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: 16,
          boxShadow: isDark
            ? "0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px oklch(0.70 0.18 160 / 0.12)"
            : "0 12px 40px rgba(0,0,0,0.12)",
          backdropFilter: isDark ? "blur(20px)" : undefined,
          WebkitBackdropFilter: isDark ? "blur(20px)" : undefined,
          maxWidth: 300,
          width: "100%",
          padding: "20px 20px 20px 20px",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          data-ocid="releases.nft_vault.close_button"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: bodyColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 4,
            borderRadius: 6,
            minWidth: 28,
            minHeight: 28,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="1" y1="1" x2="13" y2="13" />
            <line x1="13" y1="1" x2="1" y2="13" />
          </svg>
        </button>

        {/* Title row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
            paddingRight: 20,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#7ddfc2"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="12" y1="2" x2="12" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
            <polyline points="9,5 12,2 15,5" />
            <polyline points="9,19 12,22 15,19" />
            <polyline points="5,9 2,12 5,15" />
            <polyline points="19,9 22,12 19,15" />
            <circle cx="12" cy="12" r="1.5" fill="#7ddfc2" stroke="none" />
          </svg>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: titleColor,
              lineHeight: 1.3,
            }}
          >
            Minty Vault NFT Available
          </span>
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: 12,
            color: bodyColor,
            lineHeight: 1.55,
            marginBottom: 12,
          }}
        >
          This slab can be stored securely with Minty and minted as a 1 of 1
          NFT. Ownership can be transferred instantly while the physical slab
          remains secured in the vault.
        </p>

        {/* Benefits */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {benefits.map((b) => (
            <div
              key={b}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke={bulletColor}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="1.5,6 4.5,9 10.5,3" />
              </svg>
              <span style={{ fontSize: 12, color: bodyColor }}>{b}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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

function CryptoIcon({ currency }: { currency: PaymentOption }) {
  if (currency === "USDC") return <USDCIcon />;
  if (currency === "BTC") return <BTCIcon />;
  if (currency === "ETH") return <ETHIcon />;
  return <SOLIcon />;
}

// ─── Preferred Payment Badge ──────────────────────────────────────────────────

function PreferredPaymentBadge({
  payment,
  isDark,
}: {
  payment: SlabItem["preferredPayment"];
  isDark?: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 8px",
        borderRadius: 99,
        background: isDark ? "rgba(255,255,255,0.07)" : "#f3f4f6",
        border: "none",
        whiteSpace: "nowrap" as const,
        flexShrink: 0,
      }}
    >
      <CryptoIcon currency={payment} />
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.02em",
          color: isDark ? "oklch(0.85 0.06 160)" : "#374151",
        }}
      >
        {payment}
      </span>
    </span>
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

// ─── Payment Chip ─────────────────────────────────────────────────────────────

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
      <CryptoIcon currency={payment} />
      {payment}
    </button>
  );
}

// ─── Mini currency pill (non-interactive, for offer rows) ────────────────────

function CurrencyPill({ currency }: { currency: PaymentOption }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 7px 2px 5px",
        borderRadius: 99,
        background: "oklch(0.70 0.18 160 / 0.10)",
        border: "1px solid oklch(0.70 0.18 160 / 0.20)",
        fontSize: 10,
        fontWeight: 600,
        color: "oklch(0.78 0.12 160)",
        letterSpacing: "0.03em",
        whiteSpace: "nowrap" as const,
      }}
    >
      <CryptoIcon currency={currency} />
      {currency}
    </span>
  );
}

// ─── Buy / Offer Modal ────────────────────────────────────────────────────────

type ExpiryOption = "1h" | "6h" | "24h" | "3d";
const EXPIRY_OPTIONS: { label: string; value: ExpiryOption; ms: number }[] = [
  { label: "1h", value: "1h", ms: 3600000 },
  { label: "6h", value: "6h", ms: 6 * 3600000 },
  { label: "24h", value: "24h", ms: 24 * 3600000 },
  { label: "3d", value: "3d", ms: 3 * 86400000 },
];

function BuyOfferModal({
  slab,
  isDark,
  onClose,
  onSubmitOffer,
  initialStage = "choose",
}: {
  slab: SlabItem;
  isDark: boolean;
  onClose: () => void;
  onSubmitOffer: (slabId: string, offer: LiveOffer) => void;
  initialStage?: "choose" | "buy" | "offer";
}) {
  const [stage, setStage] = useState<"choose" | "buy" | "offer">(initialStage);
  const [selectedPayment, setSelectedPayment] = useState<PaymentOption | null>(
    null,
  );
  const [offerAmountStr, setOfferAmountStr] = useState("");
  const [offerExpiry, setOfferExpiry] = useState<ExpiryOption>("24h");

  const panelBg = isDark ? "oklch(0.12 0.04 160 / 0.95)" : "#ffffff";
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

  const mintBtn = {
    width: "100%",
    padding: "12px 18px",
    borderRadius: 16,
    background: "linear-gradient(180deg, #6de8c0 0%, #3ecfa0 100%)",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    boxShadow:
      "0 4px 14px rgba(62,207,160,0.25), inset 0 1px 0 rgba(255,255,255,0.25)",
    letterSpacing: "0.01em",
    transition: "all 0.18s ease",
    transform: "scale(1)",
  } as const;

  function goBack() {
    setStage("choose");
    setSelectedPayment(null);
    setOfferAmountStr("");
  }

  function handleChoose(action: "buy" | "offer") {
    if (action === "buy") {
      setSelectedPayment(slab.preferredPayment);
      setStage("buy");
    } else {
      setSelectedPayment(null);
      setStage("offer");
    }
  }

  function handleConfirmBuy() {
    onClose();
  }

  function handleSubmitOffer() {
    const amount = Number.parseFloat(offerAmountStr);
    if (!amount || !selectedPayment) return;
    const expiryMs =
      EXPIRY_OPTIONS.find((e) => e.value === offerExpiry)?.ms ?? 86400000;
    const offer: LiveOffer = {
      id: `offer-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      slabId: slab.id,
      amountUsd: amount,
      currency: selectedPayment,
      expiresAt: Date.now() + expiryMs,
    };
    onSubmitOffer(slab.id, offer);
    onClose();
  }

  const headerRow = (title: string, showBack = true) => (
    <div
      className="flex items-center justify-between"
      style={{ marginBottom: 6 }}
    >
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            type="button"
            onClick={goBack}
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
        )}
        <p style={{ fontSize: 16, fontWeight: 700, color: titleColor }}>
          {title}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        data-ocid="buy_offer.close_button"
        aria-label="Close"
        style={{
          background: isDark ? "oklch(0.18 0.04 160)" : "rgba(0,0,0,0.05)",
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
  );

  const slabHint = (
    <p style={{ fontSize: 11, color: secColor, marginBottom: 14 }}>
      {slab.cardName} · {fmtPrice(slab.marketPrice)}
    </p>
  );

  const offerAmt = Number.parseFloat(offerAmountStr);

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
        {/* ── CHOOSE ── */}
        {stage === "choose" && (
          <div style={{ padding: "22px 20px 24px" }}>
            {headerRow("Choose action", false)}
            {slabHint}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(["Buy now", "Make offer"] as const).map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() =>
                    handleChoose(action === "Buy now" ? "buy" : "offer")
                  }
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
        )}

        {/* ── BUY NOW ── */}
        {stage === "buy" && (
          <div style={{ padding: "22px 20px 24px" }}>
            {headerRow("Buy Now")}

            {/* List price row */}
            <div
              style={{
                background: isDark ? "oklch(0.18 0.06 160 / 0.40)" : "#f9fafb",
                border: isDark
                  ? "1px solid oklch(0.55 0.12 160 / 0.18)"
                  : "1px solid rgba(0,0,0,0.06)",
                borderRadius: 12,
                padding: "12px 14px",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: secColor,
                    marginBottom: 4,
                  }}
                >
                  List Price
                </p>
                <p style={{ fontSize: 22, fontWeight: 700, color: titleColor }}>
                  {fmtPrice(slab.marketPrice)}
                </p>
              </div>
              <PreferredPaymentBadge
                payment={slab.preferredPayment}
                isDark={isDark}
              />
            </div>

            {/* Select payment */}
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: secColor,
                marginBottom: 8,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Select payment
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 14,
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

            {/* Conversion preview */}
            {selectedPayment && (
              <p
                style={{
                  fontSize: 13,
                  color: "oklch(0.68 0.14 160)",
                  marginBottom: 16,
                  fontWeight: 500,
                }}
              >
                ≈ {cryptoAmount(slab.marketPrice, selectedPayment)}{" "}
                {selectedPayment}
              </p>
            )}

            <button
              type="button"
              onClick={handleConfirmBuy}
              disabled={!selectedPayment}
              data-ocid="buy_offer.confirm_button"
              className="minty-primary-btn"
              style={{
                ...mintBtn,
                opacity: selectedPayment ? 1 : 0.45,
                cursor: selectedPayment ? "pointer" : "not-allowed",
              }}
            >
              Confirm Purchase
            </button>
          </div>
        )}

        {/* ── MAKE OFFER ── */}
        {stage === "offer" && (
          <div style={{ padding: "22px 20px 24px" }}>
            {headerRow("Make Offer")}
            {slabHint}

            {/* USD input */}
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: secColor,
                marginBottom: 6,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Your offer (USD)
            </p>
            <div style={{ position: "relative", marginBottom: 14 }}>
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 15,
                  fontWeight: 600,
                  color: isDark ? "oklch(0.60 0.08 160)" : "#9ca3af",
                  pointerEvents: "none",
                }}
              >
                $
              </span>
              <input
                type="number"
                value={offerAmountStr}
                onChange={(e) => setOfferAmountStr(e.target.value)}
                placeholder="0.00"
                min="0"
                data-ocid="buy_offer.input"
                style={{
                  width: "100%",
                  padding: "11px 14px 11px 26px",
                  borderRadius: 10,
                  background: isDark
                    ? "oklch(0.16 0.05 160 / 0.55)"
                    : "#f9fafb",
                  border: isDark
                    ? "1px solid oklch(0.55 0.12 160 / 0.20)"
                    : "1px solid rgba(0,0,0,0.08)",
                  color: titleColor,
                  fontSize: 15,
                  fontWeight: 600,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Currency chips */}
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: secColor,
                marginBottom: 6,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Currency
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 14,
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

            {/* Expiry selector */}
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: secColor,
                marginBottom: 6,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Expires in
            </p>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {EXPIRY_OPTIONS.map((opt) => {
                const isActive = offerExpiry === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setOfferExpiry(opt.value)}
                    data-ocid={`buy_offer.expiry_${opt.value}.toggle`}
                    style={{
                      flex: 1,
                      padding: "6px 0",
                      borderRadius: 99,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: isActive
                        ? "1.5px solid rgba(125,223,194,0.60)"
                        : isDark
                          ? "1px solid oklch(0.70 0.18 160 / 0.18)"
                          : "1px solid rgba(0,0,0,0.08)",
                      background: isActive
                        ? "linear-gradient(135deg, #c8f5e6, #9fe8d0, #7ddfc2)"
                        : isDark
                          ? "oklch(0.70 0.18 160 / 0.08)"
                          : "rgba(0,0,0,0.04)",
                      color: isActive
                        ? "#0f2a25"
                        : isDark
                          ? "oklch(0.85 0.06 160)"
                          : "#374151",
                      transition: "all 0.15s",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Conversion preview */}
            {offerAmt > 0 && selectedPayment && (
              <p
                style={{
                  fontSize: 13,
                  color: "oklch(0.68 0.14 160)",
                  marginBottom: 16,
                  fontWeight: 500,
                }}
              >
                ≈ {cryptoAmount(offerAmt, selectedPayment)} {selectedPayment}
              </p>
            )}

            <button
              type="button"
              onClick={handleSubmitOffer}
              disabled={!(offerAmt > 0 && selectedPayment)}
              data-ocid="buy_offer.submit_button"
              className="minty-primary-btn"
              style={{
                ...mintBtn,
                opacity: offerAmt > 0 && selectedPayment ? 1 : 0.45,
                cursor:
                  offerAmt > 0 && selectedPayment ? "pointer" : "not-allowed",
              }}
            >
              Submit Offer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Live Offers Section ──────────────────────────────────────────────────────

function LiveOffersSection({ offers }: { offers: LiveOffer[] }) {
  const sorted = [...offers]
    .sort((a, b) => b.amountUsd - a.amountUsd)
    .slice(0, 10);

  return (
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
        Live Offers
      </p>

      {sorted.length === 0 ? (
        <p style={{ fontSize: 12, color: C.textSec }}>No offers yet</p>
      ) : (
        <div>
          {sorted.map((offer, idx) => {
            const expiry = fmtExpiry(offer.expiresAt);
            const isActive = expiry === "Active";
            return (
              <div key={offer.id}>
                <div
                  className="flex items-center justify-between"
                  style={{ paddingTop: idx > 0 ? 10 : 0, paddingBottom: 10 }}
                  data-ocid={`offers.item.${idx + 1}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      style={{ fontSize: 14, fontWeight: 600, color: C.text }}
                    >
                      ${offer.amountUsd.toLocaleString()}
                    </span>
                    <CurrencyPill currency={offer.currency} />
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: isActive ? "oklch(0.68 0.14 160)" : C.textSec,
                    }}
                  >
                    {expiry}
                  </span>
                </div>
                {idx < sorted.length - 1 && (
                  <div style={{ height: 1, background: C.border }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ─── Slab detail sheet ────────────────────────────────────────────────────────

function SlabDetailSheet({
  slab,
  offers,
  onClose,
}: {
  slab: SlabItem;
  offers: LiveOffer[];
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

          {/* Live Offers */}
          <LiveOffersSection offers={offers} />

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
  onOffers,
  isDark,
}: {
  slab: SlabItem;
  index: number;
  onTap: () => void;
  onBuyOffer: (slab: SlabItem) => void;
  onOffers: (slab: SlabItem) => void;
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
          gap: 6,
          minWidth: 0,
        }}
      >
        {/* Top: card name + preferred payment badge */}
        <div className="flex items-start justify-between gap-2">
          <p
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: T.title,
              lineHeight: 1.25,
              flex: 1,
              minWidth: 0,
            }}
          >
            {slab.cardName}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              flexShrink: 0,
            }}
          >
            <PreferredPaymentBadge
              payment={slab.preferredPayment}
              isDark={isDark}
            />
          </div>
        </div>
        {/* Set + year */}
        <p style={{ fontSize: 11, color: T.secondary }}>
          {slab.setName} {slab.year}
        </p>

        {/* TAG grade badge + population */}
        <div className="flex items-center gap-2 flex-wrap">
          <GradeBadge grade={slab.grade} isDark={isDark} />
          <span style={{ fontSize: 10, color: T.secondary }}>
            • Pop {fmtPop(slab.population)}
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
                fontSize: 17,
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
              {slab.listingCount} listings
            </span>
          </div>

          {/* Buy + Offers buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              alignItems: "stretch",
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBuyOffer(slab);
              }}
              data-ocid={`releases.item.${index + 1}.buy_button`}
              className="minty-primary-btn"
              style={{
                borderRadius: 99,
                padding: "5px 12px",
                fontWeight: 600,
                fontSize: 11,
                background: "linear-gradient(180deg, #6de8c0 0%, #3ecfa0 100%)",
                color: "#ffffff",
                boxShadow:
                  "0 4px 14px rgba(62,207,160,0.25), inset 0 1px 0 rgba(255,255,255,0.25)",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap" as const,
                letterSpacing: "0.01em",
              }}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOffers(slab);
              }}
              data-ocid={`releases.item.${index + 1}.offers_button`}
              style={{
                borderRadius: 99,
                padding: "5px 12px",
                fontWeight: 600,
                fontSize: 11,
                background: isDark ? "oklch(0.70 0.18 160 / 0.10)" : "#f0fdf9",
                border: isDark
                  ? "1.5px solid oklch(0.70 0.18 160 / 0.50)"
                  : "1.5px solid rgba(16,185,129,0.30)",
                color: isDark ? "oklch(0.78 0.14 160)" : "#1f9d84",
                cursor: "pointer",
                whiteSpace: "nowrap" as const,
                letterSpacing: "0.01em",
              }}
            >
              Offers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Live Offers Modal ────────────────────────────────────────────────────────

function LiveOffersModal({
  slab,
  offers,
  isDark,
  onClose,
  onMakeOffer,
}: {
  slab: SlabItem;
  offers: LiveOffer[];
  isDark: boolean;
  onClose: () => void;
  onMakeOffer: () => void;
}) {
  const sorted = [...offers].sort((a, b) => b.amountUsd - a.amountUsd);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      data-ocid="live_offers.modal"
      style={{ background: "rgba(0,0,0,0.65)" }}
    >
      <div
        className="w-full"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        style={{
          background: isDark ? "oklch(0.12 0.04 160 / 0.95)" : "#ffffff",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: isDark
            ? "1px solid oklch(0.55 0.12 160 / 0.22)"
            : "1px solid rgba(0,0,0,0.08)",
          borderRadius: "20px 20px 0 0",
          maxHeight: "75dvh",
          boxShadow: isDark
            ? "0 -4px 40px oklch(0.70 0.18 160 / 0.10)"
            : "0 -4px 40px rgba(0,0,0,0.10)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Drag handle */}
        <div
          className="flex justify-center pt-3 pb-1"
          style={{ flexShrink: 0 }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 99,
              background: isDark ? "oklch(0.35 0.05 160)" : "rgba(0,0,0,0.12)",
            }}
          />
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              padding: "16px 20px 12px",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: isDark ? "oklch(0.92 0.04 160)" : "#1a1a1a",
                  margin: 0,
                }}
              >
                Live Offers
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: isDark ? "oklch(0.58 0.08 160)" : "#6b7280",
                  margin: "3px 0 0",
                }}
              >
                {slab.cardName} • {fmtPrice(slab.marketPrice)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              data-ocid="live_offers.close_button"
              aria-label="Close"
              style={{
                background: isDark
                  ? "oklch(0.18 0.04 160)"
                  : "rgba(0,0,0,0.05)",
                border: isDark
                  ? "1px solid oklch(0.55 0.12 160 / 0.22)"
                  : "1px solid rgba(0,0,0,0.08)",
                borderRadius: 99,
                minWidth: 44,
                minHeight: 44,
                color: isDark ? "oklch(0.58 0.08 160)" : "#6b7280",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginLeft: 12,
                marginTop: -4,
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Offer rows */}
          <div style={{ padding: "0 20px 8px" }}>
            {sorted.length === 0 ? (
              <p
                style={{
                  fontSize: 13,
                  color: isDark ? "oklch(0.58 0.08 160)" : "#9ca3af",
                  textAlign: "center",
                  padding: "32px 0",
                }}
              >
                No offers yet
              </p>
            ) : (
              <div>
                {sorted.map((offer, idx) => {
                  const expiry = fmtExpiry(offer.expiresAt);
                  const cryptoAmt = cryptoAmount(
                    offer.amountUsd,
                    offer.currency,
                  );
                  return (
                    <div key={offer.id}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: 4,
                          paddingTop: 16,
                          paddingBottom: 16,
                        }}
                        data-ocid={`live_offers.item.${idx + 1}`}
                      >
                        {/* Line 1 — USD value */}
                        <span
                          style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: isDark ? "oklch(0.93 0.04 160)" : "#111827",
                            lineHeight: 1.1,
                          }}
                        >
                          ${offer.amountUsd.toLocaleString()}
                        </span>
                        {/* Line 2 — currency + crypto amount */}
                        <span
                          style={{
                            fontSize: 13,
                            color: isDark ? "oklch(0.60 0.08 160)" : "#6b7280",
                          }}
                        >
                          {offer.currency} • {cryptoAmt} {offer.currency}
                        </span>
                        {/* Line 3 — status/expiry */}
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: isDark ? "oklch(0.70 0.15 160)" : "#10b981",
                          }}
                        >
                          {expiry}
                        </span>
                      </div>
                      {idx < sorted.length - 1 && (
                        <div
                          style={{
                            height: 1,
                            background: isDark
                              ? "oklch(0.55 0.12 160 / 0.18)"
                              : "rgba(0,0,0,0.06)",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sticky footer */}
        <div
          style={{
            padding: "12px 20px",
            paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
            borderTop: isDark
              ? "1px solid oklch(0.55 0.12 160 / 0.18)"
              : "1px solid rgba(0,0,0,0.07)",
            background: isDark ? "oklch(0.12 0.04 160 / 0.95)" : "#ffffff",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={onMakeOffer}
            data-ocid="live_offers.primary_button"
            className="minty-primary-btn"
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 14,
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 15,
              background: "linear-gradient(180deg, #6de8c0 0%, #3ecfa0 100%)",
              color: "#ffffff",
              boxShadow:
                "0 4px 14px rgba(62,207,160,0.25), inset 0 1px 0 rgba(255,255,255,0.25)",
              transition: "all 0.18s ease",
            }}
          >
            Make Offer
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
  const [offersModalSlab, setOffersModalSlab] = useState<SlabItem | null>(null);
  const [offersMap, setOffersMap] =
    useState<Record<string, LiveOffer[]>>(SEEDED_OFFERS);

  const isLight = theme === "light";
  const isDark = !isLight;

  function handleSubmitOffer(slabId: string, offer: LiveOffer) {
    setOffersMap((prev) => ({
      ...prev,
      [slabId]: [offer, ...(prev[slabId] ?? [])],
    }));
  }

  const sorted = useMemo(() => {
    const arr = [...MOCK_SLABS];
    if (sortMode === "most_viewed") {
      arr.sort((a, b) => b.listingCount - a.listingCount);
    } else if (sortMode === "new") {
      arr.sort((a, b) => b.verifiedAt - a.verifiedAt);
    } else {
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
                    : isDark
                      ? "rgba(255,255,255,0.06)"
                      : "#f3f4f6",
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
          {sorted.length} listings
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
            onOffers={(s) => setOffersModalSlab(s)}
            isDark={isDark}
          />
        ))}
      </main>

      {/* Detail sheet */}
      {selectedSlab && (
        <SlabDetailSheet
          slab={selectedSlab}
          offers={offersMap[selectedSlab.id] ?? []}
          onClose={() => setSelectedSlab(null)}
        />
      )}

      {/* Buy modal */}
      {buyOfferSlab && (
        <BuyOfferModal
          slab={buyOfferSlab}
          isDark={isDark}
          initialStage="buy"
          onClose={() => setBuyOfferSlab(null)}
          onSubmitOffer={handleSubmitOffer}
        />
      )}

      {/* Live Offers modal */}
      {offersModalSlab && (
        <LiveOffersModal
          slab={offersModalSlab}
          offers={offersMap[offersModalSlab.id] ?? []}
          isDark={isDark}
          onClose={() => setOffersModalSlab(null)}
          onMakeOffer={() => {
            const s = offersModalSlab;
            setOffersModalSlab(null);
            setBuyOfferSlab(s);
          }}
        />
      )}
    </div>
  );
}
