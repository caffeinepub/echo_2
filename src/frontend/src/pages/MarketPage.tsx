import { Search, ShoppingCart, Tag, TrendingUp, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BtcLogo } from "../components/BtcLogo";
import { ClipChartModal } from "../components/ClipChartModal";
import type { PurchaseRecord } from "../context/BondingCurveContext";
import { useBondingCurve } from "../context/BondingCurveContext";
import { usePackStyle } from "../context/PackStyleContext";
import { useReleasesMarket } from "../context/ReleasesMarketContext";
import type { VideoClip } from "../context/VideoFeedContext";
import { useVideoFeed } from "../context/VideoFeedContext";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface MarketListing {
  id: string;
  clipId: string;
  clipTitle: string;
  creatorUsername: string;
  imageUrl: string;
  videoUrl?: string;
  listPrice: number; // USD
  editionNumber: number;
  totalEditions: number;
  listedAt: number;
  sellerId: string;
}

const LS_LISTINGS_KEY = "minty_market_listings";

function loadListings(): MarketListing[] {
  try {
    const raw = localStorage.getItem(LS_LISTINGS_KEY);
    return raw ? (JSON.parse(raw) as MarketListing[]) : [];
  } catch {
    return [];
  }
}

function saveListings(listings: MarketListing[]) {
  try {
    localStorage.setItem(LS_LISTINGS_KEY, JSON.stringify(listings));
  } catch {
    // ignore
  }
}

const NOW = Date.now();
const SEED_LISTINGS: MarketListing[] = [
  {
    id: "listing_1",
    clipId: "clip_3",
    clipTitle: "Golden Hour",
    creatorUsername: "light.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&q=80",
    listPrice: 8.5,
    editionNumber: 42,
    totalEditions: 1000,
    listedAt: NOW - 3600000 * 2,
    sellerId: "user_light",
  },
  {
    id: "listing_2",
    clipId: "clip_1",
    clipTitle: "Sunset Ride",
    creatorUsername: "mintcreator.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
    listPrice: 14.99,
    editionNumber: 7,
    totalEditions: 1000,
    listedAt: NOW - 3600000 * 5,
    sellerId: "user_mint",
  },
  {
    id: "listing_3",
    clipId: "clip_2",
    clipTitle: "Night Drive",
    creatorUsername: "neon_rider.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1492551557933-34265f7af79e?w=400&q=80",
    listPrice: 6.0,
    editionNumber: 113,
    totalEditions: 1000,
    listedAt: NOW - 3600000 * 10,
    sellerId: "user_neon",
  },
  {
    id: "listing_4",
    clipId: "clip_5",
    clipTitle: "Foggy Morning",
    creatorUsername: "driftlens.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80",
    listPrice: 22.0,
    editionNumber: 3,
    totalEditions: 1000,
    listedAt: NOW - 3600000 * 1,
    sellerId: "user_drift",
  },
  {
    id: "listing_5",
    clipId: "clip_7",
    clipTitle: "City Lights",
    creatorUsername: "neonframes.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80",
    listPrice: 3.5,
    editionNumber: 200,
    totalEditions: 1000,
    listedAt: NOW - 3600000 * 8,
    sellerId: "user_neo",
  },
  {
    id: "listing_6",
    clipId: "clip_4",
    clipTitle: "Mountain Air",
    creatorUsername: "alpineshot.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80",
    listPrice: 11.0,
    editionNumber: 55,
    totalEditions: 1000,
    listedAt: NOW - 3600000 * 14,
    sellerId: "user_alpine",
  },
  {
    id: "listing_7",
    clipId: "clip_8",
    clipTitle: "Ocean Horizon",
    creatorUsername: "wavecatcher.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=80",
    listPrice: 18.75,
    editionNumber: 18,
    totalEditions: 1000,
    listedAt: NOW - 3600000 * 3,
    sellerId: "user_wave",
  },
];

const LS_LISTINGS_SEEDED = "minty_market_listings_seeded";
function ensureSeeded() {
  if (localStorage.getItem(LS_LISTINGS_SEEDED)) return;
  const existing = loadListings();
  if (existing.length === 0) {
    saveListings(SEED_LISTINGS);
  }
  localStorage.setItem(LS_LISTINGS_SEEDED, "1");
}
ensureSeeded();

// ─── Buy Confirm Modal ─────────────────────────────────────────────────────────

function BuyConfirmModal({
  listing,
  onClose,
  onConfirm,
  accentR,
  accentG,
  accentB,
}: {
  listing: MarketListing;
  onClose: () => void;
  onConfirm: () => void;
  accentR: number;
  accentG: number;
  accentB: number;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const accent = `rgb(${accentR},${accentG},${accentB})`;
  const accentGlow = `rgba(${accentR},${accentG},${accentB},0.35)`;
  const accentBorder = `rgba(${accentR},${accentG},${accentB},0.3)`;
  const accentBg = `rgba(${accentR},${accentG},${accentB},0.08)`;

  function handleConfirm() {
    setConfirmed(true);
    setTimeout(() => {
      onConfirm();
      onClose();
    }, 900);
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: custom modal overlay needs div for backdrop click
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(10,0,20,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          borderRadius: "24px 24px 0 0",
          background: "rgba(18,8,30,0.97)",
          border: `1px solid ${accentBorder}`,
          boxShadow: `0 -8px 40px ${accentGlow}`,
          padding: "24px 20px 36px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 17, fontWeight: 700, color: "#f0eaff" }}>
            Confirm Purchase
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: `1px solid ${accentBorder}`,
              background: accentBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#c0a8e6",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: 14,
            alignItems: "center",
            background: accentBg,
            border: `1px solid ${accentBorder}`,
            borderRadius: 14,
            padding: "12px 14px",
          }}
        >
          <img
            src={listing.imageUrl}
            alt={listing.clipTitle}
            style={{
              width: 56,
              height: 56,
              borderRadius: 10,
              objectFit: "cover",
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#f0eaff",
                marginBottom: 2,
              }}
            >
              {listing.clipTitle}
            </div>
            <div style={{ fontSize: 12, color: accent }}>
              @{listing.creatorUsername}
            </div>
            <div style={{ fontSize: 11, color: "#9070b0", marginTop: 2 }}>
              Copy #{listing.editionNumber} / {listing.totalEditions}
            </div>
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: accent,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <BtcLogo size={16} />${listing.listPrice.toFixed(2)}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              height: 48,
              borderRadius: 14,
              border: `1px solid ${accentBorder}`,
              background: "transparent",
              color: "#9070b0",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "DM Sans, sans-serif",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            data-ocid="market.buy_confirm_button"
            onClick={handleConfirm}
            disabled={confirmed}
            style={{
              flex: 2,
              height: 48,
              borderRadius: 14,
              border: "none",
              background: confirmed
                ? "rgba(100,80,140,0.5)"
                : `linear-gradient(135deg, rgba(${accentR},${accentG},${accentB},0.9) 0%, rgba(160,100,220,0.9) 100%)`,
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "DM Sans, sans-serif",
              cursor: confirmed ? "default" : "pointer",
              boxShadow: confirmed ? "none" : `0 4px 16px ${accentGlow}`,
              transition: "all 0.2s ease",
            }}
          >
            {confirmed ? (
              "✓ Purchased!"
            ) : (
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
              >
                <BtcLogo size={14} style={{ filter: "brightness(10)" }} />
                Buy for ${listing.listPrice.toFixed(2)}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ListingRow ───────────────────────────────────────────────────────────────

function ListingRow({
  listing,
  onBuy,
  accentR,
  accentG,
  accentB,
}: {
  listing: MarketListing;
  onBuy: () => void;
  accentR: number;
  accentG: number;
  accentB: number;
}) {
  const accent = `rgb(${accentR},${accentG},${accentB})`;
  const accentBorder = `rgba(${accentR},${accentG},${accentB},0.12)`;

  return (
    <div
      data-ocid="market.listing_row"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 4px",
        borderBottom: `1px solid ${accentBorder}`,
        transition: "background 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background =
          "rgba(255,255,255,0.04)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "transparent";
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: 68,
          height: 68,
          borderRadius: 10,
          overflow: "hidden",
          flexShrink: 0,
          background: "#0d1520",
        }}
      >
        {listing.videoUrl ? (
          <video
            key={listing.videoUrl}
            src={listing.videoUrl}
            muted
            loop
            playsInline
            autoPlay
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <img
            src={listing.imageUrl}
            alt={listing.clipTitle}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "/assets/generated/minty-pack-wrapper.png";
            }}
          />
        )}
      </div>

      {/* Text stack */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "var(--echo-text)",
            fontFamily: "DM Sans, sans-serif",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginBottom: 2,
          }}
        >
          {listing.clipTitle}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--echo-text-secondary)",
            fontFamily: "DM Sans, sans-serif",
            marginBottom: 4,
          }}
        >
          @{listing.creatorUsername}
        </div>
        <div
          style={{
            display: "inline-block",
            fontSize: 10,
            fontWeight: 700,
            color: accent,
            background: `rgba(${accentR},${accentG},${accentB},0.10)`,
            borderRadius: 20,
            padding: "2px 7px",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          #{listing.editionNumber}/{listing.totalEditions}
        </div>
      </div>

      {/* Price + Buy */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 6,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: accent,
            fontFamily: "DM Sans, sans-serif",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <BtcLogo size={14} />${listing.listPrice.toFixed(2)}
        </div>
        <button
          type="button"
          data-ocid="market.buy_now_button"
          onClick={onBuy}
          style={{
            height: 30,
            paddingLeft: 14,
            paddingRight: 14,
            borderRadius: 20,
            border: "none",
            background: `linear-gradient(135deg, rgba(${accentR},${accentG},${accentB},0.9) 0%, rgba(160,100,220,0.9) 100%)`,
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "DM Sans, sans-serif",
            cursor: "pointer",
            boxShadow: `0 2px 10px rgba(${accentR},${accentG},${accentB},0.28)`,
          }}
        >
          Buy
        </button>
      </div>
    </div>
  );
}

// ─── TopMarketCard ─────────────────────────────────────────────────────────────

interface TopMarketEntry {
  clipId: string;
  title: string;
  creator: string;
  videoUrl: string;
  marketCap: number; // USD
  currentPrice: number; // USD
  copiesMinted: number;
}

function TopMarketCard({
  entry,
  rank,
  large,
  accentR,
  accentG,
  accentB,
  onClick,
}: {
  entry: TopMarketEntry;
  rank: number;
  large: boolean;
  accentR: number;
  accentG: number;
  accentB: number;
  onClick: () => void;
}) {
  const accent = `rgb(${accentR},${accentG},${accentB})`;
  const accentBorder = `rgba(${accentR},${accentG},${accentB},0.18)`;
  const accentBg = `rgba(${accentR},${accentG},${accentB},0.07)`;

  const medalColors: Record<number, string> = {
    1: "rgba(255,215,0,0.90)",
    2: "rgba(192,192,192,0.90)",
    3: "rgba(205,127,50,0.90)",
  };
  const medalGlows: Record<number, string> = {
    1: "rgba(255,215,0,0.4)",
    2: "rgba(192,192,192,0.3)",
    3: "rgba(205,127,50,0.3)",
  };
  const badgeColor = medalColors[rank] ?? accent;
  const glowColor =
    medalGlows[rank] ?? `rgba(${accentR},${accentG},${accentB},0.2)`;

  return (
    <button
      type="button"
      data-ocid="market.top_market_card"
      onClick={onClick}
      style={{
        borderRadius: large ? 20 : 14,
        background: accentBg,
        border: `1.5px solid ${rank <= 3 ? badgeColor.replace("0.90", "0.3") : accentBorder}`,
        boxShadow:
          rank <= 3
            ? `0 4px 20px ${glowColor}, 0 1px 4px rgba(0,0,0,0.08)`
            : "0 2px 10px rgba(0,0,0,0.06)",
        overflow: "hidden",
        cursor: "pointer",
        textAlign: "left",
        padding: 0,
        width: "100%",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
    >
      {/* Thumbnail (video) */}
      <div
        style={{
          position: "relative",
          aspectRatio: large ? "4/3" : "16/9",
          overflow: "hidden",
          background: "#0d1520",
        }}
      >
        <video
          src={entry.videoUrl}
          muted
          loop
          playsInline
          autoPlay
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        {/* Rank badge */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            background: badgeColor,
            borderRadius: 20,
            padding: "4px 10px",
            fontSize: large ? 15 : 12,
            fontWeight: 800,
            color: rank <= 3 ? "#1a0a2e" : "#fff",
            fontFamily: "DM Sans, sans-serif",
            boxShadow: `0 2px 8px ${glowColor}`,
          }}
        >
          #{rank}
        </div>
        {/* Chart hint overlay */}
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "rgba(0,0,0,0.5)",
            borderRadius: 20,
            padding: "3px 8px",
            fontSize: 10,
            color: "#fff",
            fontFamily: "DM Sans, sans-serif",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          📈 Chart
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: large ? "14px 16px 16px" : "10px 12px 12px" }}>
        <div
          style={{
            fontSize: large ? 16 : 13,
            fontWeight: 700,
            color: "var(--echo-text)",
            fontFamily: "DM Sans, sans-serif",
            marginBottom: 2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {entry.title}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--echo-text-secondary)",
            fontFamily: "DM Sans, sans-serif",
            marginBottom: 8,
          }}
        >
          @{entry.creator}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "var(--echo-text-muted)",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {entry.copiesMinted.toLocaleString()} minted
          </div>
          <div
            style={{
              fontSize: large ? 14 : 12,
              fontWeight: 800,
              color: accent,
              fontFamily: "DM Sans, sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <BtcLogo size={large ? 13 : 11} />$
            {entry.marketCap.toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}
          </div>
        </div>
      </div>
    </button>
  );
}

export function MarketPage() {
  const { activeStyle } = usePackStyle();
  const { accentR, accentG, accentB } = activeStyle;
  const accent = `rgb(${accentR},${accentG},${accentB})`;
  const accentBorder = `rgba(${accentR},${accentG},${accentB},0.15)`;

  const [listings, setListings] = useState<MarketListing[]>(() =>
    loadListings(),
  );
  const [buyTarget, setBuyTarget] = useState<MarketListing | null>(null);
  const [chartClip, setChartClip] = useState<VideoClip | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"newest" | "trending">(
    "newest",
  );

  const { getAllCurveStates, marketCap, ticker } = useBondingCurve();
  const { clips } = useVideoFeed();
  useReleasesMarket();

  // Build top 10 by market cap — re-sorts every ticker tick (8s)
  // biome-ignore lint/correctness/useExhaustiveDependencies: ticker forces re-sort
  const top10 = useMemo(() => {
    const states = getAllCurveStates();
    return states
      .map((s) => {
        const clip = clips.find((c) => c.id === s.clipId);
        const mcap = marketCap(s.clipId);
        const priceUsd =
          (s.startingPriceCents + s.copiesMinted * s.priceIncrementCents) / 100;
        return {
          clipId: s.clipId,
          title: clip?.title ?? s.clipId,
          creator: clip?.creatorName ?? "—",
          videoUrl: clip?.videoUrl ?? "",
          marketCap: mcap,
          currentPrice: priceUsd,
          copiesMinted: s.copiesMinted,
          clip: clip ?? null,
        };
      })
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, 10);
  }, [getAllCurveStates, clips, marketCap, ticker]);

  const handleTopCardClick = useCallback((entry: (typeof top10)[0]) => {
    if (entry.clip) setChartClip(entry.clip);
  }, []);

  // Filtered + sorted listings
  const filteredListings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let result = listings;
    if (q) {
      result = result.filter(
        (l) =>
          l.clipTitle.toLowerCase().includes(q) ||
          l.creatorUsername.toLowerCase().includes(q),
      );
    }
    if (activeFilter === "newest") {
      result = [...result].sort((a, b) => b.listedAt - a.listedAt);
    } else {
      // trending = highest price first
      result = [...result].sort((a, b) => b.listPrice - a.listPrice);
    }
    return result;
  }, [listings, searchQuery, activeFilter]);

  function handleBuyConfirm() {
    if (!buyTarget) return;

    // Remove listing
    const next = listings.filter((l) => l.id !== buyTarget.id);
    setListings(next);
    saveListings(next);

    // Create a new PurchaseRecord for the buyer (secondary sale → minted immediately)
    try {
      const raw = localStorage.getItem("minty_purchases_v1");
      const records: (PurchaseRecord & { listed?: boolean })[] = raw
        ? JSON.parse(raw)
        : [];
      const newRecord: PurchaseRecord & { listed?: boolean } = {
        clipId: buyTarget.clipId,
        clipTitle: buyTarget.clipTitle,
        editionNumber: buyTarget.editionNumber,
        totalSupply: buyTarget.totalEditions,
        pricePaid: Math.round(buyTarget.listPrice * 100),
        purchasedAt: Date.now(),
        videoUrl: buyTarget.videoUrl ?? buyTarget.imageUrl,
        creatorName: buyTarget.creatorUsername,
        status: "minted",
        listed: false,
      };
      localStorage.setItem(
        "minty_purchases_v1",
        JSON.stringify([newRecord, ...records]),
      );
    } catch {
      // ignore
    }

    setBuyTarget(null);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        background: "var(--echo-bg)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 16px 14px",
          borderBottom: "1px solid var(--echo-border)",
          background: "var(--echo-surface)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Tag size={18} color={accent} />
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--echo-text)",
              fontFamily: "DM Sans, sans-serif",
              margin: 0,
            }}
          >
            Market
          </h1>
        </div>
        <p
          style={{
            fontSize: 13,
            color: "var(--echo-text-secondary)",
            fontFamily: "DM Sans, sans-serif",
            margin: "4px 0 0",
          }}
        >
          Buy and discover trending moments
        </p>
      </div>

      <div style={{ flex: 1, padding: "16px" }}>
        {/* ── Top 10 by Market Cap ──────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <TrendingUp size={16} color={accent} />
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--echo-text)",
                fontFamily: "DM Sans, sans-serif",
                margin: 0,
              }}
            >
              Top 10 by Market Cap
            </h2>
          </div>
          <p
            style={{
              fontSize: 11,
              color: "var(--echo-text-muted)",
              fontFamily: "DM Sans, sans-serif",
              margin: "0 0 14px",
            }}
          >
            Total market cap = price × 1,000 copies · tap any card for chart
          </p>

          {/* Top 3 — larger cards in a row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
              marginBottom: 10,
            }}
          >
            {top10.slice(0, 3).map((entry, i) => (
              <TopMarketCard
                key={entry.clipId}
                entry={entry}
                rank={i + 1}
                large={false}
                accentR={accentR}
                accentG={accentG}
                accentB={accentB}
                onClick={() => handleTopCardClick(entry)}
              />
            ))}
          </div>

          {/* Ranks 4–10 — compact horizontal rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {top10.slice(3).map((entry, i) => (
              <button
                key={entry.clipId}
                type="button"
                data-ocid="market.top_row"
                onClick={() => handleTopCardClick(entry)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: `rgba(${accentR},${accentG},${accentB},0.05)`,
                  border: `1px solid ${accentBorder}`,
                  borderRadius: 12,
                  padding: "10px 12px",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  transition: "background 0.15s ease",
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: accent,
                    fontFamily: "DM Sans, sans-serif",
                    width: 24,
                    flexShrink: 0,
                  }}
                >
                  #{i + 4}
                </span>
                {/* Mini video thumb */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    overflow: "hidden",
                    flexShrink: 0,
                    background: "#0d1520",
                  }}
                >
                  <video
                    src={entry.videoUrl}
                    muted
                    loop
                    playsInline
                    autoPlay
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--echo-text)",
                      fontFamily: "DM Sans, sans-serif",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {entry.title}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--echo-text-muted)",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    {entry.copiesMinted.toLocaleString()} minted
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 2,
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: accent,
                      fontFamily: "DM Sans, sans-serif",
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <BtcLogo size={12} />$
                    {entry.marketCap.toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--echo-text-muted)",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    📈 chart
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Listed For Sale ────────────────────────────────────────── */}
        <div>
          {/* Section header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <ShoppingCart size={16} color={accent} />
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--echo-text)",
                fontFamily: "DM Sans, sans-serif",
                margin: 0,
              }}
            >
              Listed For Sale
            </h2>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: accent,
                background: `rgba(${accentR},${accentG},${accentB},0.12)`,
                border: `1px solid ${accentBorder}`,
                borderRadius: 20,
                padding: "2px 8px",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {listings.length}
            </span>
          </div>

          {/* Search bar */}
          <div
            style={{
              position: "relative",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Search
                size={15}
                color={`rgba(${accentR},${accentG},${accentB},0.6)`}
              />
            </div>
            <input
              data-ocid="market.search_input"
              type="text"
              placeholder="Search clips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                height: 42,
                paddingLeft: 38,
                paddingRight: 14,
                borderRadius: 21,
                border: `1.5px solid rgba(${accentR},${accentG},${accentB},0.25)`,
                background: `rgba(${accentR},${accentG},${accentB},0.05)`,
                color: "var(--echo-text)",
                fontSize: 14,
                fontFamily: "DM Sans, sans-serif",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.15s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = accent;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = `rgba(${accentR},${accentG},${accentB},0.25)`;
              }}
            />
          </div>

          {/* Filter pills */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 16,
            }}
          >
            {(["newest", "trending"] as const).map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  data-ocid={`market.filter_${filter}`}
                  onClick={() => setActiveFilter(filter)}
                  style={{
                    height: 32,
                    paddingLeft: 16,
                    paddingRight: 16,
                    borderRadius: 20,
                    border: isActive
                      ? "none"
                      : `1.5px solid rgba(${accentR},${accentG},${accentB},0.30)`,
                    background: isActive
                      ? `linear-gradient(135deg, rgba(${accentR},${accentG},${accentB},0.9) 0%, rgba(160,100,220,0.9) 100%)`
                      : "transparent",
                    color: isActive
                      ? "#fff"
                      : `rgba(${accentR},${accentG},${accentB},0.85)`,
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "DM Sans, sans-serif",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    transition: "all 0.15s ease",
                    boxShadow: isActive
                      ? `0 2px 10px rgba(${accentR},${accentG},${accentB},0.28)`
                      : "none",
                  }}
                >
                  {filter === "trending" && <TrendingUp size={12} />}
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              );
            })}
          </div>

          {/* Listings */}
          {filteredListings.length === 0 ? (
            <div
              data-ocid="market.empty_state"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 180,
                gap: 12,
                textAlign: "center",
              }}
            >
              <ShoppingCart
                size={32}
                color={`rgba(${accentR},${accentG},${accentB},0.4)`}
              />
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--echo-text)",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {searchQuery ? "No results found" : "No listings yet"}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--echo-text-secondary)",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {searchQuery
                  ? "Try a different search term."
                  : "List a clip from your Collection to sell here."}
              </div>
            </div>
          ) : (
            <div
              style={{
                borderRadius: 14,
                border: `1px solid rgba(${accentR},${accentG},${accentB},0.10)`,
                background: `rgba(${accentR},${accentG},${accentB},0.03)`,
                padding: "0 12px",
                overflow: "hidden",
              }}
            >
              {filteredListings.map((listing) => (
                <ListingRow
                  key={listing.id}
                  listing={listing}
                  onBuy={() => setBuyTarget(listing)}
                  accentR={accentR}
                  accentG={accentG}
                  accentB={accentB}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Buy Confirm Modal */}
      {buyTarget && (
        <BuyConfirmModal
          listing={buyTarget}
          onClose={() => setBuyTarget(null)}
          onConfirm={handleBuyConfirm}
          accentR={accentR}
          accentG={accentG}
          accentB={accentB}
        />
      )}

      {/* Chart Modal */}
      {chartClip && (
        <ClipChartModal clip={chartClip} onClose={() => setChartClip(null)} />
      )}
    </div>
  );
}
