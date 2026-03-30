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
  grader: "PSA" | "BGS" | "SGC";
  population: number;
  marketPrice: number;
  priceChange: number;
  volume24h: number;
  sparkline: number[];
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
    grader: "PSA",
    population: 121,
    marketPrice: 42800,
    priceChange: 8.4,
    volume24h: 385000,
    sparkline: [310, 330, 320, 360, 400, 390, 420, 428],
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
    grader: "PSA",
    population: 9,
    marketPrice: 375000,
    priceChange: 2.1,
    volume24h: 375000,
    sparkline: [340000, 355000, 348000, 360000, 370000, 365000, 372000, 375000],
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
    grader: "BGS",
    population: 44,
    marketPrice: 98500,
    priceChange: 14.2,
    volume24h: 295000,
    sparkline: [72000, 78000, 81000, 86000, 90000, 92000, 96000, 98500],
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
    grader: "BGS",
    population: 312,
    marketPrice: 1850,
    priceChange: -1.3,
    volume24h: 42000,
    sparkline: [1900, 1870, 1860, 1880, 1850, 1830, 1840, 1850],
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
    grader: "PSA",
    population: 1204,
    marketPrice: 24200,
    priceChange: 3.7,
    volume24h: 510000,
    sparkline: [21000, 21500, 22000, 22800, 23400, 23800, 24000, 24200],
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
    grader: "PSA",
    population: 87,
    marketPrice: 9400,
    priceChange: 5.2,
    volume24h: 78000,
    sparkline: [8200, 8400, 8600, 8900, 9000, 9100, 9300, 9400],
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
    grader: "PSA",
    population: 523,
    marketPrice: 4200,
    priceChange: 11.8,
    volume24h: 188000,
    sparkline: [3100, 3300, 3500, 3700, 3800, 3950, 4050, 4200],
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
    grader: "PSA",
    population: 498,
    marketPrice: 3150,
    priceChange: -2.8,
    volume24h: 62000,
    sparkline: [3400, 3350, 3300, 3250, 3200, 3180, 3160, 3150],
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
    grader: "BGS",
    population: 67,
    marketPrice: 55000,
    priceChange: 6.0,
    volume24h: 220000,
    sparkline: [48000, 49500, 50200, 51000, 52500, 53800, 54500, 55000],
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
    grader: "PSA",
    population: 36,
    marketPrice: 18900,
    priceChange: 4.5,
    volume24h: 94000,
    sparkline: [16500, 17000, 17400, 17800, 18000, 18400, 18700, 18900],
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
    grader: "BGS",
    population: 312,
    marketPrice: 8750,
    priceChange: -0.5,
    volume24h: 430000,
    sparkline: [8900, 8850, 8800, 8780, 8760, 8740, 8750, 8750],
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
    grader: "PSA",
    population: 744,
    marketPrice: 620,
    priceChange: 1.8,
    volume24h: 18000,
    sparkline: [570, 580, 595, 600, 610, 615, 618, 620],
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
    grader: "PSA",
    population: 892,
    marketPrice: 3400,
    priceChange: 9.3,
    volume24h: 142000,
    sparkline: [2600, 2750, 2900, 3000, 3100, 3200, 3300, 3400],
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
    grade: 10,
    grader: "PSA",
    population: 8203,
    marketPrice: 185,
    priceChange: -4.1,
    volume24h: 95000,
    sparkline: [210, 205, 200, 195, 192, 188, 186, 185],
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
    grader: "PSA",
    population: 1144,
    marketPrice: 2100,
    priceChange: 18.5,
    volume24h: 340000,
    sparkline: [1200, 1350, 1450, 1600, 1700, 1850, 1980, 2100],
    imageUrl: "https://picsum.photos/seed/wemby23/200/280",
    verifiedAt: NOW - 6 * 3600000,
    label: "Newly Verified",
    certNumber: "48203917",
  },
];

// ─── Colour constants ────────────────────────────────────────────────────────

const C = {
  accent: "oklch(0.70 0.18 160)",
  accentGlow: "oklch(0.70 0.18 160 / 0.22)",
  bg: "oklch(0.08 0.02 160)",
  panel: "oklch(0.12 0.03 160)",
  panelHover: "oklch(0.14 0.035 160)",
  border: "oklch(0.35 0.12 160 / 0.20)",
  borderActive: "oklch(0.50 0.15 160 / 0.45)",
  text: "oklch(0.95 0.01 160)",
  textSec: "oklch(0.60 0.08 160)",
  pos: "oklch(0.72 0.17 145)",
  neg: "oklch(0.60 0.18 25)",
  accentBar: "oklch(0.70 0.18 160)",
};

// ─── Sparkline SVG ───────────────────────────────────────────────────────────

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 60;
  const h = 24;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const color = positive ? C.pos : C.neg;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      role="img"
      aria-label={positive ? "Price trending up" : "Price trending down"}
    >
      <polyline
        points={pts.join(" ")}
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
    </svg>
  );
}

// ─── Price formatter ─────────────────────────────────────────────────────────

function fmtPrice(usd: number): string {
  if (usd >= 1000000) return `$${(usd / 1000000).toFixed(2)}M`;
  if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}K`;
  return `$${usd.toLocaleString()}`;
}

function fmtVol(usd: number): string {
  if (usd >= 1000000) return `$${(usd / 1000000).toFixed(1)}M`;
  if (usd >= 1000) return `$${(usd / 1000).toFixed(0)}K`;
  return `$${usd}`;
}

// ─── Grade badge ─────────────────────────────────────────────────────────────

function GradeBadge({ grader, grade }: { grader: string; grade: number }) {
  return (
    <span
      style={{
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.04em",
        padding: "2px 6px",
        borderRadius: "4px",
        background: "oklch(0.18 0.05 160)",
        border: `1px solid ${C.borderActive}`,
        color: C.accent,
        whiteSpace: "nowrap" as const,
      }}
    >
      {grader} {grade}
    </span>
  );
}

// ─── Type label badge ─────────────────────────────────────────────────────────

function TypeBadge({ label, type }: { label: string; type: SlabItem["type"] }) {
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
        background: "oklch(0.70 0.18 160 / 0.12)",
        border: "1px solid oklch(0.70 0.18 160 / 0.28)",
        color: C.accent,
        textTransform: "uppercase" as const,
        whiteSpace: "nowrap" as const,
      }}
    >
      {icon}
      {label}
    </span>
  );
}

// ─── Detail sheet ─────────────────────────────────────────────────────────────

const MOCK_GRADE_DIST: Record<string, { grade: string; count: number }[]> = {
  PSA: [
    { grade: "PSA 10", count: 121 },
    { grade: "PSA 9", count: 543 },
    { grade: "PSA 8", count: 812 },
    { grade: "PSA 7", count: 640 },
    { grade: "PSA 6", count: 310 },
  ],
  BGS: [
    { grade: "BGS 10", count: 44 },
    { grade: "BGS 9.5", count: 178 },
    { grade: "BGS 9", count: 512 },
    { grade: "BGS 8.5", count: 388 },
  ],
  SGC: [
    { grade: "SGC 10", count: 37 },
    { grade: "SGC 9.5", count: 120 },
    { grade: "SGC 9", count: 290 },
  ],
};

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
  const gradeDist = MOCK_GRADE_DIST[slab.grader] ?? MOCK_GRADE_DIST.PSA;

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
          background: "oklch(0.10 0.025 160)",
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
                <TypeBadge label={slab.label} type={slab.type} />
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
                <GradeBadge grader={slab.grader} grade={slab.grade} />
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

          {/* Price & Volume */}
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
              Price &amp; Volume
            </p>
            <div className="flex justify-between items-center">
              <div>
                <p style={{ fontSize: 22, fontWeight: 700, color: C.text }}>
                  {fmtPrice(slab.marketPrice)}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: slab.priceChange >= 0 ? C.pos : C.neg,
                    marginTop: 2,
                  }}
                >
                  {slab.priceChange >= 0 ? "+" : ""}
                  {slab.priceChange.toFixed(1)}% (24h)
                </p>
              </div>
              <div className="text-right">
                <p style={{ fontSize: 12, color: C.textSec }}>24h Volume</p>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: C.text,
                    marginTop: 2,
                  }}
                >
                  {fmtVol(slab.volume24h)}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <Sparkline
                data={slab.sparkline}
                positive={slab.priceChange >= 0}
              />
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
                {gradeDist.map((row) => (
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
                  {slab.grader}
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
}: {
  slab: SlabItem;
  index: number;
  onTap: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isTrending = slab.type === "trending" || slab.type === "high_volume";

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
        background: hovered ? C.panelHover : C.panel,
        border: `1px solid ${hovered ? C.borderActive : C.border}`,
        borderRadius: 14,
        overflow: "hidden",
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.15s, border-color 0.15s, box-shadow 0.15s",
        boxShadow: hovered ? "0 0 24px oklch(0.70 0.18 160 / 0.12)" : "none",
        position: "relative",
      }}
    >
      {/* Left accent bar (trending/high-volume only) */}
      {isTrending && (
        <div
          style={{
            width: 2,
            background: C.accentBar,
            flexShrink: 0,
            boxShadow: `0 0 8px ${C.accentGlow}`,
          }}
        />
      )}

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
          border: `1px solid ${C.border}`,
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
        {/* Top: card name + badge */}
        <div className="flex items-start justify-between gap-2">
          <p
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: C.text,
              lineHeight: 1.25,
              flex: 1,
              minWidth: 0,
            }}
          >
            {slab.cardName}
          </p>
          <TypeBadge label={slab.label} type={slab.type} />
        </div>

        {/* Set + year */}
        <p style={{ fontSize: 11, color: C.textSec }}>
          {slab.setName} · {slab.year}
        </p>

        {/* Grade + population */}
        <div className="flex items-center gap-2 flex-wrap">
          <GradeBadge grader={slab.grader} grade={slab.grade} />
          <span style={{ fontSize: 10, color: C.textSec }}>
            Pop {slab.population.toLocaleString()}
          </span>
        </div>

        {/* Bottom: price, change, volume, sparkline */}
        <div
          className="flex items-center justify-between"
          style={{ marginTop: 4 }}
        >
          <div className="flex items-baseline gap-1.5">
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: C.text,
                letterSpacing: "-0.01em",
              }}
            >
              {fmtPrice(slab.marketPrice)}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: slab.priceChange >= 0 ? C.pos : C.neg,
              }}
            >
              {slab.priceChange >= 0 ? "+" : ""}
              {slab.priceChange.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 10, color: C.textSec }}>
              Vol {fmtVol(slab.volume24h)}
            </span>
            <Sparkline data={slab.sparkline} positive={slab.priceChange >= 0} />
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Sort filter bar ──────────────────────────────────────────────────────────

type SortMode = "trending" | "new" | "notable";

const SORT_LABELS: { key: SortMode; label: string }[] = [
  { key: "trending", label: "Trending" },
  { key: "new", label: "New" },
  { key: "notable", label: "Notable" },
];

// ─── Main page ────────────────────────────────────────────────────────────────

interface ReleasesPageProps {
  onAlbumClick?: (albumId: string) => void;
  onRecord?: () => void;
}

export function ReleasesPage(_props: ReleasesPageProps) {
  const { theme } = useTheme();
  const [sortMode, setSortMode] = useState<SortMode>("trending");
  const [selectedSlab, setSelectedSlab] = useState<SlabItem | null>(null);

  const isLight = theme === "light";

  const sorted = useMemo(() => {
    const arr = [...MOCK_SLABS];
    if (sortMode === "trending") {
      arr.sort((a, b) => b.volume24h - a.volume24h);
    } else if (sortMode === "new") {
      arr.sort((a, b) => b.verifiedAt - a.verifiedAt);
    } else {
      arr.sort((a, b) => {
        const aIsNotable = a.type === "notable_sale" ? 0 : 1;
        const bIsNotable = b.type === "notable_sale" ? 0 : 1;
        if (aIsNotable !== bIsNotable) return aIsNotable - bIsNotable;
        return b.priceChange - a.priceChange;
      });
    }
    return arr;
  }, [sortMode]);

  const bgColor = isLight ? "#f0f7f4" : C.bg;

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
            ? "rgba(240,247,244,0.92)"
            : "oklch(0.08 0.02 160 / 0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${isLight ? "#c8e8dc" : C.border}`,
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            display: "flex",
            background: isLight ? "rgba(0,0,0,0.04)" : "oklch(0.15 0.03 160)",
            border: `1px solid ${isLight ? "#c8e8dc" : C.border}`,
            borderRadius: 99,
            padding: "3px",
            gap: 2,
          }}
        >
          {SORT_LABELS.map(({ key, label }) => (
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
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s",
                background: sortMode === key ? C.accent : "transparent",
                color:
                  sortMode === key
                    ? "oklch(0.08 0.02 160)"
                    : isLight
                      ? "#2d6b55"
                      : C.textSec,
                boxShadow:
                  sortMode === key
                    ? "0 0 12px oklch(0.70 0.18 160 / 0.35)"
                    : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <span
          style={{
            marginLeft: "auto",
            fontSize: 11,
            color: C.textSec,
            fontWeight: 500,
          }}
        >
          {sorted.length} slabs
        </span>
      </div>

      {/* Feed */}
      <main
        style={{
          padding: "12px 16px",
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
