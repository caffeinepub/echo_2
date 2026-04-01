import { DollarSign, ShieldCheck, Sparkles, TrendingUp, X } from "lucide-react";
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

// ─── Type label badge ─────────────────────────────────────────────────────────

function TypeBadge({
  label,
  type,
  isDark,
}: {
  label: string;
  type: SlabItem["type"];
  isDark?: boolean;
}) {
  const icon =
    type === "trending" ? (
      <TrendingUp size={9} />
    ) : type === "notable_sale" ? (
      <DollarSign size={9} />
    ) : type === "verified" ? (
      <ShieldCheck size={9} />
    ) : (
      <Sparkles size={9} />
    );
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        fontSize: "9px",
        fontWeight: 600,
        letterSpacing: "0.06em",
        padding: "2px 6px",
        borderRadius: "99px",
        background: isDark
          ? "oklch(0.70 0.18 160 / 0.12)"
          : "rgba(16,185,129,0.10)",
        border: isDark
          ? "1px solid oklch(0.70 0.18 160 / 0.22)"
          : "1px solid rgba(16,185,129,0.15)",
        color: isDark ? "oklch(0.78 0.14 160)" : "#1f9d84",
        textTransform: "uppercase" as const,
        whiteSpace: "nowrap" as const,
      }}
    >
      {icon}
      {label}
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
                <TypeBadge label={slab.label} type={slab.type} isDark />
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
  isDark,
}: {
  slab: SlabItem;
  index: number;
  onTap: () => void;
  isDark: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const T = isDark ? DARK_CARD : CARD;

  return (
    <button
      type="button"
      onClick={onTap}
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
        {/* Top: card name + type badge */}
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
          <TypeBadge label={slab.label} type={slab.type} isDark={isDark} />
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

        {/* Bottom: price + listing count */}
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
        </div>
      </div>
    </button>
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
    </div>
  );
}
