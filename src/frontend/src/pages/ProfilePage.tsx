import { ArrowLeft, ChevronDown, ChevronRight, UserCircle } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../ThemeContext";

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_PROFILE = {
  displayName: "Collector",
  walletId: "rl6rz-677yl-ujzhg-r6ely-7o6c6-cn3ai-kig5o-mlota-al7xl-u6x2j-uae",
  joinDate: "March 2024",
  setsCreated: 4,
  totalMinted: 400,
};

const MOCK_REVENUE = {
  totalEarned: 284.32,
  fromPackSales: 187.2,
  fromNFTSales: 64.8,
  fromResales: 32.32,
};

const MOCK_SETS = [
  {
    id: "s1",
    title: "Morning Coffee",
    coverUrl: "https://images.pokemontcg.io/sv1/025_hires.png",
    packsMinted: 100,
    sold: 78,
    revenue: 34.2,
    avgSalePrice: 0.44,
    bestSalePrice: 1.2,
    analytics: {
      topCollectible: {
        name: "Sunrise Cup #12",
        soldFor: 18,
        thumbUrl: "https://images.pokemontcg.io/sv1/025_hires.png",
      },
      mostTraded: { name: "Latte Foam Clip", transactions: 14 },
      uniqueCollectors: 32,
      totalTransactions: 89,
      lifetimeVolume: 34.2,
    },
  },
  {
    id: "s2",
    title: "Late Night Drive",
    coverUrl: "https://images.pokemontcg.io/sv1/086_hires.png",
    packsMinted: 60,
    sold: 45,
    revenue: 98.1,
    avgSalePrice: 2.18,
    bestSalePrice: 8.5,
    analytics: {
      topCollectible: {
        name: "Neon Overpass #3",
        soldFor: 8.5,
        thumbUrl: "https://images.pokemontcg.io/sv1/086_hires.png",
      },
      mostTraded: { name: "Rain Drops #7", transactions: 22 },
      uniqueCollectors: 41,
      totalTransactions: 112,
      lifetimeVolume: 98.1,
    },
  },
  {
    id: "s3",
    title: "Sunset Ride",
    coverUrl: "https://images.pokemontcg.io/sv1/198_hires.png",
    packsMinted: 80,
    sold: 80,
    revenue: 112.0,
    avgSalePrice: 1.4,
    bestSalePrice: 6.0,
    analytics: {
      topCollectible: {
        name: "Golden Hour #1",
        soldFor: 6.0,
        thumbUrl: "https://images.pokemontcg.io/sv1/198_hires.png",
      },
      mostTraded: { name: "Dust Trail #9", transactions: 31 },
      uniqueCollectors: 58,
      totalTransactions: 201,
      lifetimeVolume: 112.0,
    },
  },
];

const MOCK_TRANSACTIONS = [
  {
    id: "t1",
    type: "Pack sale",
    amount: 0.03,
    date: "2 hours ago",
    thumbUrl: "https://images.pokemontcg.io/sv1/025_hires.png",
  },
  {
    id: "t2",
    type: "NFT resale",
    amount: 0.18,
    date: "1 day ago",
    thumbUrl: "https://images.pokemontcg.io/sv1/086_hires.png",
  },
  {
    id: "t3",
    type: "Pack sale",
    amount: 0.03,
    date: "2 days ago",
    thumbUrl: "https://images.pokemontcg.io/sv1/198_hires.png",
  },
  {
    id: "t4",
    type: "NFT sale",
    amount: 1.2,
    date: "3 days ago",
    thumbUrl: "https://images.pokemontcg.io/sv1/025_hires.png",
  },
  {
    id: "t5",
    type: "Resale royalty",
    amount: 0.54,
    date: "5 days ago",
    thumbUrl: "https://images.pokemontcg.io/sv1/086_hires.png",
  },
  {
    id: "t6",
    type: "Pack sale",
    amount: 0.03,
    date: "1 week ago",
    thumbUrl: "https://images.pokemontcg.io/sv1/198_hires.png",
  },
];

function shortenWallet(id: string): string {
  if (id.length <= 12) return id;
  return `${id.slice(0, 6)}…${id.slice(-3)}`;
}

function fmt(n: number) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ─── Set Performance Card ──────────────────────────────────────────────────────
function SetCard({
  set,
  isLight,
  index,
}: { set: (typeof MOCK_SETS)[number]; isLight: boolean; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const mintColor = isLight ? "oklch(0.52 0.18 160)" : "oklch(0.72 0.18 160)";
  const cardBg = isLight ? "#ffffff" : "oklch(0.16 0.05 165 / 0.90)";
  const cardBorder = isLight
    ? "1px solid rgba(0,0,0,0.07)"
    : "1px solid oklch(0.50 0.15 160 / 0.20)";
  const cardShadow = isLight
    ? "0 2px 10px rgba(0,0,0,0.05)"
    : "0 2px 14px rgba(0,0,0,0.20)";
  const labelColor = isLight ? "#6b8a80" : "oklch(0.62 0.08 160)";
  const titleColor = isLight ? "#0d1f1a" : "rgba(255,255,255,0.92)";
  const analyticsAccent = isLight
    ? "rgba(126,214,177,0.60)"
    : "oklch(0.62 0.18 160 / 0.50)";

  return (
    <div
      data-ocid={`profile.set.item.${index}`}
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: cardBg,
        border: cardBorder,
        boxShadow: cardShadow,
      }}
    >
      {/* Main set row */}
      <button
        type="button"
        data-ocid={`profile.set.toggle.${index}`}
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 text-left transition-all duration-150"
        style={{
          padding: "14px 14px",
          cursor: "pointer",
          background: "transparent",
          border: "none",
        }}
      >
        {/* Cover */}
        <div
          className="flex-shrink-0 rounded-xl overflow-hidden"
          style={{ width: 48, height: 60, aspectRatio: "4/5" }}
        >
          <img
            src={set.coverUrl}
            alt={set.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Stats */}
        <div className="flex-1 min-w-0">
          <div
            className="font-semibold truncate"
            style={{ fontSize: "14px", color: titleColor, marginBottom: 4 }}
          >
            {set.title}
          </div>
          <div style={{ fontSize: "11px", color: labelColor, lineHeight: 1.7 }}>
            <div>
              {set.packsMinted} packs minted · {set.sold} sold
            </div>
            <div style={{ color: mintColor, fontWeight: 600 }}>
              Earned ${fmt(set.revenue)}
            </div>
            <div>
              Avg ${set.avgSalePrice.toFixed(2)} · Best $
              {set.bestSalePrice.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Chevron */}
        <div style={{ color: labelColor, flexShrink: 0 }}>
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </button>

      {/* Analytics expansion */}
      {expanded && (
        <div
          data-ocid={`profile.set.analytics.${index}`}
          style={{
            borderTop: isLight
              ? "1px solid rgba(0,0,0,0.06)"
              : "1px solid oklch(0.50 0.15 160 / 0.18)",
            borderLeft: `3px solid ${analyticsAccent}`,
            padding: "12px 14px 14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {/* Top collectible */}
          <div className="flex items-center gap-3">
            <img
              src={set.analytics.topCollectible.thumbUrl}
              alt={set.analytics.topCollectible.name}
              className="flex-shrink-0 rounded-lg object-cover"
              style={{ width: 32, height: 32 }}
            />
            <div className="flex-1 min-w-0">
              <div
                style={{
                  fontSize: "10px",
                  color: labelColor,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Top collectible
              </div>
              <div
                className="truncate"
                style={{
                  fontSize: "12px",
                  color: titleColor,
                  fontWeight: 500,
                }}
              >
                {set.analytics.topCollectible.name}
              </div>
            </div>
            <div
              style={{
                fontSize: "12px",
                color: mintColor,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              Sold ${set.analytics.topCollectible.soldFor}
            </div>
          </div>

          <div
            style={{
              height: 1,
              background: isLight
                ? "rgba(0,0,0,0.05)"
                : "oklch(0.50 0.15 160 / 0.12)",
            }}
          />

          {/* Analytics rows */}
          {[
            {
              label: "Most traded",
              value: `${set.analytics.mostTraded.name} · ${set.analytics.mostTraded.transactions} transactions`,
            },
            {
              label: "Unique collectors",
              value: `${set.analytics.uniqueCollectors} wallets`,
            },
            {
              label: "Total transactions",
              value: `${set.analytics.totalTransactions}`,
            },
            {
              label: "Lifetime volume",
              value: `$${fmt(set.analytics.lifetimeVolume)}`,
            },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-2"
            >
              <span style={{ fontSize: "11px", color: labelColor }}>
                {row.label}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: titleColor,
                  fontWeight: 500,
                  textAlign: "right",
                  flex: "0 0 auto",
                  maxWidth: "60%",
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ProfilePage ───────────────────────────────────────────────────────────────
interface ProfilePageProps {
  onBack: () => void;
}

export function ProfilePage({ onBack }: ProfilePageProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const mintColor = isLight ? "oklch(0.52 0.18 160)" : "oklch(0.72 0.18 160)";
  const bgColor = isLight ? "#f8faf9" : "var(--echo-bg, #0d1a16)";
  const panelBg = isLight ? "#ffffff" : "oklch(0.16 0.05 165 / 0.90)";
  const panelBorder = isLight
    ? "1px solid rgba(0,0,0,0.07)"
    : "1px solid oklch(0.50 0.15 160 / 0.20)";
  const panelShadow = isLight
    ? "0 2px 10px rgba(0,0,0,0.05)"
    : "0 2px 14px rgba(0,0,0,0.20)";
  const labelColor = isLight ? "#6b8a80" : "oklch(0.62 0.08 160)";
  const titleColor = isLight ? "#0d1f1a" : "rgba(255,255,255,0.92)";
  const mutedColor = isLight ? "#9ab4aa" : "oklch(0.50 0.06 160)";
  const dividerColor = isLight
    ? "rgba(0,0,0,0.06)"
    : "oklch(0.50 0.15 160 / 0.14)";

  const headerBg = isLight
    ? "rgba(255,255,255,0.90)"
    : "oklch(0.14 0.05 165 / 0.95)";
  const headerBorder = isLight
    ? "rgba(0,0,0,0.07)"
    : "oklch(0.50 0.15 160 / 0.18)";

  const revenuePanelBg = isLight
    ? "rgba(126,214,177,0.05)"
    : "oklch(0.20 0.08 160 / 0.60)";
  const revenuePanelBorder = isLight
    ? "1px solid rgba(126,214,177,0.18)"
    : "1px solid oklch(0.73 0.11 160 / 0.22)";

  return (
    <div
      data-ocid="profile.page"
      className="min-h-screen"
      style={{ background: bgColor, paddingBottom: 32 }}
    >
      {/* Header */}
      <header
        className="sticky top-16 z-40 flex items-center justify-between backdrop-blur-xl border-b"
        style={{
          background: headerBg,
          borderColor: headerBorder,
          height: 52,
          paddingLeft: 12,
          paddingRight: 16,
        }}
      >
        <button
          type="button"
          data-ocid="profile.back.button"
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-lg transition-all duration-150"
          style={{
            padding: "6px 8px",
            fontSize: "13px",
            color: mintColor,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          <span>Back</span>
        </button>

        <h1
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            fontSize: 22,
            color: titleColor,
            fontFamily: "var(--font-brand)",
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          Profile
        </h1>

        <div style={{ width: 56 }} />
      </header>

      <div className="px-4 pt-4 flex flex-col gap-3">
        {/* ── Section 1: Identity ──────────────────────────────────────────── */}
        <section
          data-ocid="profile.identity.card"
          className="rounded-2xl"
          style={{
            background: panelBg,
            border: panelBorder,
            boxShadow: panelShadow,
            padding: "20px 16px",
          }}
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-full"
              style={{
                width: 56,
                height: 56,
                background: isLight
                  ? "rgba(126,214,177,0.08)"
                  : "oklch(0.45 0.16 160 / 0.14)",
                border: isLight
                  ? "1.5px solid rgba(126,214,177,0.22)"
                  : "1.5px solid oklch(0.73 0.11 160 / 0.28)",
              }}
            >
              <UserCircle
                size={28}
                style={{ color: mintColor }}
                strokeWidth={1.4}
              />
            </div>

            {/* Name + wallet */}
            <div className="flex-1 min-w-0">
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: titleColor,
                  marginBottom: 2,
                }}
              >
                {MOCK_PROFILE.displayName}
              </div>
              <div
                className="font-mono truncate"
                style={{
                  fontSize: 12,
                  color: labelColor,
                  letterSpacing: "0.02em",
                }}
              >
                {shortenWallet(MOCK_PROFILE.walletId)}
              </div>
              <div style={{ fontSize: 11, color: mutedColor, marginTop: 3 }}>
                Joined {MOCK_PROFILE.joinDate}
              </div>
            </div>
          </div>

          {/* Stat pills */}
          <div className="flex gap-2 mt-4">
            <div
              className="flex-1 flex flex-col items-center rounded-xl py-2.5"
              style={{
                background: isLight
                  ? "rgba(126,214,177,0.06)"
                  : "oklch(0.20 0.08 160 / 0.40)",
                border: isLight
                  ? "1px solid rgba(126,214,177,0.14)"
                  : "1px solid oklch(0.73 0.11 160 / 0.18)",
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 800, color: mintColor }}>
                {MOCK_PROFILE.setsCreated}
              </span>
              <span style={{ fontSize: 11, color: labelColor, marginTop: 1 }}>
                sets created
              </span>
            </div>
            <div
              className="flex-1 flex flex-col items-center rounded-xl py-2.5"
              style={{
                background: isLight
                  ? "rgba(126,214,177,0.06)"
                  : "oklch(0.20 0.08 160 / 0.40)",
                border: isLight
                  ? "1px solid rgba(126,214,177,0.14)"
                  : "1px solid oklch(0.73 0.11 160 / 0.18)",
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 800, color: mintColor }}>
                {MOCK_PROFILE.totalMinted.toLocaleString()}
              </span>
              <span style={{ fontSize: 11, color: labelColor, marginTop: 1 }}>
                packs minted
              </span>
            </div>
          </div>
        </section>

        {/* ── Section 2: Revenue Summary ────────────────────────────────────── */}
        <section
          data-ocid="profile.revenue.card"
          className="rounded-2xl"
          style={{
            background: revenuePanelBg,
            border: revenuePanelBorder,
            padding: "18px 16px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: labelColor,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Total Earned
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 900,
              color: mintColor,
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            ${fmt(MOCK_REVENUE.totalEarned)}
          </div>
          <div
            style={{
              fontSize: 10,
              color: mutedColor,
              marginTop: 6,
              marginBottom: 14,
            }}
          >
            Royalties are automatically applied: 3% to creator · 1% to Minty
            platform
          </div>

          {/* Breakdown rows */}
          <div className="flex flex-col" style={{ gap: 0 }}>
            {[
              { label: "From pack sales", amount: MOCK_REVENUE.fromPackSales },
              { label: "From NFT sales", amount: MOCK_REVENUE.fromNFTSales },
              { label: "From resales", amount: MOCK_REVENUE.fromResales },
            ].map((row, i) => (
              <div key={row.label}>
                {i > 0 && (
                  <div style={{ height: 1, background: dividerColor }} />
                )}
                <div
                  className="flex items-center justify-between"
                  style={{ paddingTop: 9, paddingBottom: 9 }}
                >
                  <span style={{ fontSize: 13, color: titleColor }}>
                    {row.label}
                  </span>
                  <span
                    style={{ fontSize: 13, fontWeight: 600, color: mintColor }}
                  >
                    ${fmt(row.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 3: Sets Performance ───────────────────────────────────── */}
        <section data-ocid="profile.sets.section">
          <h2
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: labelColor,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 10,
              marginTop: 4,
              paddingLeft: 2,
            }}
          >
            Your Sets
          </h2>
          <div className="flex flex-col gap-2.5" data-ocid="profile.sets.list">
            {MOCK_SETS.map((set, i) => (
              <SetCard key={set.id} set={set} isLight={isLight} index={i + 1} />
            ))}
          </div>
        </section>

        {/* ── Section 4: Transaction Activity ──────────────────────────────── */}
        <section data-ocid="profile.transactions.section">
          <h2
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: labelColor,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 10,
              marginTop: 4,
              paddingLeft: 2,
            }}
          >
            Recent Royalties
          </h2>
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: panelBg,
              border: panelBorder,
              boxShadow: panelShadow,
            }}
            data-ocid="profile.transactions.list"
          >
            {MOCK_TRANSACTIONS.map((tx, i) => (
              <div key={tx.id} data-ocid={`profile.transaction.item.${i + 1}`}>
                {i > 0 && (
                  <div
                    style={{
                      height: 1,
                      background: dividerColor,
                      marginLeft: 62,
                    }}
                  />
                )}
                <div
                  className="flex items-center gap-3"
                  style={{ padding: "12px 14px" }}
                >
                  {/* Thumbnail */}
                  <img
                    src={tx.thumbUrl}
                    alt={tx.type}
                    className="flex-shrink-0 rounded-xl object-cover"
                    style={{ width: 36, height: 36 }}
                    loading="lazy"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: titleColor,
                      }}
                    >
                      {tx.type}
                    </div>
                    <div
                      style={{ fontSize: 11, color: mutedColor, marginTop: 1 }}
                    >
                      {tx.date}
                    </div>
                  </div>

                  {/* Amount */}
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: mintColor,
                      flexShrink: 0,
                    }}
                  >
                    +${fmt(tx.amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center pt-4 pb-2">
          <p style={{ fontSize: 11, color: mutedColor }}>
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: mutedColor, textDecoration: "underline" }}
            >
              Built with love using caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
