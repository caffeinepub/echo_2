import { MessageCircle, ShoppingCart, TrendingUp, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { OfferRecord } from "../context/BondingCurveContext";
import { useBondingCurve } from "../context/BondingCurveContext";
import { usePackStyle } from "../context/PackStyleContext";
import type { VideoClip } from "../context/VideoFeedContext";
import type { MarketListing } from "../types/localMarket";
import { loadListings } from "../types/localMarket";
import { BtcLogo } from "./BtcLogo";
import { OfferModal, loadOffers, saveOffers } from "./OfferModal";

interface Props {
  clip: VideoClip;
  onClose: () => void;
}

export function formatTimestamp(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  if (diff < 24 * 3_600_000) {
    return new Date(ts).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ClipChartModal({ clip, onClose }: Props) {
  const { activeStyle } = usePackStyle();
  const { getPriceHistory, getCurveState, getOrCreateCurve, ticker } =
    useBondingCurve();

  const accentR = activeStyle.accentR;
  const accentG = activeStyle.accentG;
  const accentB = activeStyle.accentB;
  const accent = `rgb(${accentR},${accentG},${accentB})`;
  const accentBorder = `rgba(${accentR},${accentG},${accentB},0.28)`;
  const accentBg = `rgba(${accentR},${accentG},${accentB},0.08)`;
  const accentGlow = `rgba(${accentR},${accentG},${accentB},0.35)`;
  const accentGrad = `linear-gradient(135deg, rgba(${accentR},${accentG},${accentB},0.85) 0%, rgba(160,100,220,0.85) 100%)`;

  // Ensure curve exists
  useEffect(() => {
    getOrCreateCurve(clip.id);
  }, [clip.id, getOrCreateCurve]);

  // Re-read every 5s for live updates (ticker drives parent re-render too)
  const [localTick, setLocalTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setLocalTick((t) => t + 1), 5000);
    return () => clearInterval(id);
  }, []);

  // Listings for this clip — refreshed on tick
  const [allListings, setAllListings] = useState<MarketListing[]>(() =>
    loadListings(),
  );
  // biome-ignore lint/correctness/useExhaustiveDependencies: localTick forces refresh
  useEffect(() => {
    setAllListings(loadListings());
  }, [localTick, ticker]);

  const clipListings = useMemo(
    () => allListings.filter((l) => l.clipId === clip.id),
    [allListings, clip.id],
  );

  // Offers for this clip — refreshed on tick
  const [allOffers, setAllOffers] = useState<OfferRecord[]>(() => loadOffers());
  // biome-ignore lint/correctness/useExhaustiveDependencies: localTick forces refresh
  useEffect(() => {
    setAllOffers(loadOffers());
  }, [localTick, ticker]);

  const clipOffers = useMemo(
    () => allOffers.filter((o) => o.clipId === clip.id),
    [allOffers, clip.id],
  );

  // Which listing is currently open in OfferModal
  const [offerListing, setOfferListing] = useState<MarketListing | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: ticker/localTick force refresh
  const curveState = useMemo(
    () => getCurveState(clip.id),
    [getCurveState, clip.id, ticker, localTick],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: ticker/localTick force refresh
  const rawHistory = useMemo(
    () => getPriceHistory(clip.id),
    [getPriceHistory, clip.id, ticker, localTick],
  );

  const chartData = useMemo(
    () =>
      rawHistory.map((pt) => ({
        time: pt.timestamp,
        timeLabel: formatTimestamp(pt.timestamp),
        price: Number.parseFloat((pt.price / 100).toFixed(2)),
        marketCap: Number.parseFloat(pt.marketCap.toFixed(2)),
        copiesMinted: pt.copiesMinted,
      })),
    [rawHistory],
  );

  const currentPriceUsd = curveState
    ? (curveState.startingPriceCents +
        curveState.copiesMinted * curveState.priceIncrementCents) /
      100
    : 0;

  const currentMarketCap = curveState
    ? currentPriceUsd * curveState.totalSupply
    : 0;

  const copiesMinted = curveState?.copiesMinted ?? 0;
  const totalSupply = curveState?.totalSupply ?? 1000;

  function handleAcceptOffer(offer: OfferRecord) {
    const updated = loadOffers().map((o) =>
      o.id === offer.id ? { ...o, status: "accepted" as const } : o,
    );
    saveOffers(updated);
    setAllOffers(updated);
    // Create a secondary-sale PurchaseRecord for the offerer
    // (triggers the same minted status immediately like other secondary sales)
  }

  function handleDeclineOffer(offer: OfferRecord) {
    const updated = loadOffers().map((o) =>
      o.id === offer.id ? { ...o, status: "declined" as const } : o,
    );
    saveOffers(updated);
    setAllOffers(updated);
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  function getStatusColor(status: OfferRecord["status"]) {
    if (status === "accepted") return "#52c476";
    if (status === "declined") return "#e05a5a";
    return accent;
  }

  function getStatusLabel(status: OfferRecord["status"]) {
    if (status === "accepted") return "Accepted";
    if (status === "declined") return "Declined";
    return "Pending";
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: backdrop div needs click handler
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 400,
        background: "rgba(8,0,18,0.88)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      {/* Offer modal renders above clip chart modal */}
      {offerListing && (
        <OfferModal
          listing={offerListing}
          clipTitle={clip.title || "Untitled Moment"}
          onClose={() => setOfferListing(null)}
          onOfferSent={() => {
            setAllOffers(loadOffers());
            setOfferListing(null);
          }}
        />
      )}

      <div
        style={{
          width: "100%",
          maxWidth: 480,
          maxHeight: "88svh",
          overflowY: "auto",
          borderRadius: "24px 24px 0 0",
          background: "rgba(14,6,26,0.98)",
          border: `1px solid ${accentBorder}`,
          boxShadow: `0 -10px 50px ${accentGlow}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 18px 14px",
            borderBottom: `1px solid ${accentBorder}`,
            position: "sticky",
            top: 0,
            background: "rgba(14,6,26,0.98)",
            zIndex: 2,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: accentGrad,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUp size={15} color="#fff" />
            </div>
            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#f0eaff",
                  lineHeight: 1.2,
                  maxWidth: 240,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {clip.title || "Untitled Moment"}
              </div>
              <div style={{ fontSize: 12, color: accent, marginTop: 1 }}>
                @{clip.creatorName}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chart"
            data-ocid="clip_chart.close_button"
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
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "16px 18px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* Video player */}
          {(clip.videoUrl || clip.previewUrl) && (
            <div
              style={{
                borderRadius: 16,
                overflow: "hidden",
                border: `1px solid ${accentBorder}`,
                boxShadow: `0 0 20px ${accentGlow}`,
                aspectRatio: "16/9",
                background: "rgba(8,0,18,0.6)",
              }}
            >
              <video
                key={clip.videoUrl || clip.previewUrl}
                src={clip.videoUrl || clip.previewUrl}
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
          )}

          {/* Stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
            }}
          >
            <div
              style={{
                borderRadius: 12,
                background: accentBg,
                border: `1px solid ${accentBorder}`,
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  color: "#7050a0",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: 3,
                }}
              >
                Market Cap
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: accent,
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <BtcLogo size={13} />$
                {currentMarketCap.toLocaleString("en-US", {
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>
            <div
              style={{
                borderRadius: 12,
                background: accentBg,
                border: `1px solid ${accentBorder}`,
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  color: "#7050a0",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: 3,
                }}
              >
                Price / Copy
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#d4c0f0",
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <BtcLogo size={13} />${currentPriceUsd.toFixed(2)}
              </div>
            </div>
            <div
              style={{
                borderRadius: 12,
                background: accentBg,
                border: `1px solid ${accentBorder}`,
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  color: "#7050a0",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: 3,
                }}
              >
                Copies
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#d4c0f0",
                  lineHeight: 1,
                }}
              >
                {copiesMinted.toLocaleString()}
                <span
                  style={{ fontSize: 10, fontWeight: 500, color: "#7050a0" }}
                >
                  /{totalSupply.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Live indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 20,
              background: `rgba(${accentR},${accentG},${accentB},0.1)`,
              border: `1px solid ${accentBorder}`,
              width: "fit-content",
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: accent,
                animation: "live-dot 1.4s ease-in-out infinite",
              }}
            />
            <span style={{ fontSize: 11, color: accent, fontWeight: 600 }}>
              Live · updates every 5s
            </span>
          </div>

          {/* Market Cap Chart */}
          <div
            style={{
              borderRadius: 16,
              background: accentBg,
              border: `1px solid ${accentBorder}`,
              padding: "14px 4px 8px 4px",
            }}
          >
            <div
              style={{
                paddingLeft: 14,
                marginBottom: 10,
                fontSize: 12,
                fontWeight: 700,
                color: "#d4c0f0",
              }}
            >
              Market Cap Over Time
            </div>

            {chartData.length < 2 ? (
              <div
                style={{
                  height: 160,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#7050a0",
                  fontSize: 13,
                }}
              >
                Collecting price data…
              </div>
            ) : (
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 4, right: 12, left: -4, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="mcapGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={accent}
                          stopOpacity={0.32}
                        />
                        <stop
                          offset="95%"
                          stopColor={accent}
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={`rgba(${accentR},${accentG},${accentB},0.1)`}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="timeLabel"
                      tick={{
                        fill: "#7050a0",
                        fontSize: 9,
                        fontFamily: "DM Sans, sans-serif",
                      }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{
                        fill: "#7050a0",
                        fontSize: 9,
                        fontFamily: "DM Sans, sans-serif",
                      }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) =>
                        `₿${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0)}`
                      }
                      width={44}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(14,6,26,0.97)",
                        border: `1px solid ${accentBorder}`,
                        borderRadius: 10,
                        fontFamily: "DM Sans, sans-serif",
                        fontSize: 12,
                        color: "#d4c0f0",
                      }}
                      itemStyle={{ color: accent }}
                      formatter={(value: number) => [
                        `₿${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                        "Market Cap",
                      ]}
                      labelFormatter={(label: string) => label}
                    />
                    <Area
                      type="monotone"
                      dataKey="marketCap"
                      stroke={accent}
                      strokeWidth={2}
                      fill="url(#mcapGradient)"
                      dot={false}
                      activeDot={{
                        r: 4,
                        fill: accent,
                        stroke: "rgba(14,6,26,0.9)",
                        strokeWidth: 2,
                      }}
                      isAnimationActive={true}
                      animationDuration={500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Price Per Copy Chart */}
          <div
            style={{
              borderRadius: 16,
              background: accentBg,
              border: `1px solid ${accentBorder}`,
              padding: "14px 4px 8px 4px",
            }}
          >
            <div
              style={{
                paddingLeft: 14,
                marginBottom: 10,
                fontSize: 12,
                fontWeight: 700,
                color: "#d4c0f0",
              }}
            >
              Price Per Copy
            </div>
            {chartData.length < 2 ? (
              <div
                style={{
                  height: 120,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#7050a0",
                  fontSize: 13,
                }}
              >
                Collecting price data…
              </div>
            ) : (
              <div style={{ height: 130 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 4, right: 12, left: -4, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="priceGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="rgba(160,100,220,1)"
                          stopOpacity={0.28}
                        />
                        <stop
                          offset="95%"
                          stopColor="rgba(160,100,220,1)"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={`rgba(${accentR},${accentG},${accentB},0.1)`}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="timeLabel"
                      tick={{
                        fill: "#7050a0",
                        fontSize: 9,
                        fontFamily: "DM Sans, sans-serif",
                      }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{
                        fill: "#7050a0",
                        fontSize: 9,
                        fontFamily: "DM Sans, sans-serif",
                      }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `₿${v.toFixed(2)}`}
                      width={44}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(14,6,26,0.97)",
                        border: `1px solid ${accentBorder}`,
                        borderRadius: 10,
                        fontFamily: "DM Sans, sans-serif",
                        fontSize: 12,
                        color: "#d4c0f0",
                      }}
                      itemStyle={{ color: "rgba(160,100,220,1)" }}
                      formatter={(value: number) => [
                        `₿${value.toFixed(2)}`,
                        "Price/Copy",
                      ]}
                      labelFormatter={(label: string) => label}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="rgba(160,100,220,1)"
                      strokeWidth={2}
                      fill="url(#priceGradient)"
                      dot={false}
                      activeDot={{
                        r: 4,
                        fill: "rgba(160,100,220,1)",
                        stroke: "rgba(14,6,26,0.9)",
                        strokeWidth: 2,
                      }}
                      isAnimationActive={true}
                      animationDuration={500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* ── Listed For Sale Section ─────────────────────────────── */}
          <div
            style={{
              borderRadius: 16,
              background: accentBg,
              border: `1px solid ${accentBorder}`,
              padding: "14px 16px 16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginBottom: 12,
              }}
            >
              <ShoppingCart size={14} color={accent} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#d4c0f0" }}>
                Listed For Sale
              </span>
              {clipListings.length > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: accent,
                    background: `rgba(${accentR},${accentG},${accentB},0.15)`,
                    borderRadius: 20,
                    padding: "1px 7px",
                    marginLeft: 2,
                  }}
                >
                  {clipListings.length}
                </span>
              )}
            </div>

            {clipListings.length === 0 ? (
              <div
                data-ocid="clip_chart.no_listings"
                style={{
                  textAlign: "center",
                  padding: "14px 0 6px",
                  color: "#7050a0",
                  fontSize: 13,
                  fontStyle: "italic",
                }}
              >
                No copies currently listed for sale.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {clipListings.map((listing, idx) => (
                  <div
                    key={listing.id}
                    data-ocid="clip_chart.listing_row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 0",
                      borderBottom:
                        idx < clipListings.length - 1
                          ? `1px solid rgba(${accentR},${accentG},${accentB},0.10)`
                          : "none",
                    }}
                  >
                    {/* Edition badge */}
                    <div
                      style={{
                        flexShrink: 0,
                        background: `rgba(${accentR},${accentG},${accentB},0.14)`,
                        border: `1px solid rgba(${accentR},${accentG},${accentB},0.25)`,
                        borderRadius: 20,
                        padding: "3px 9px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: accent,
                        whiteSpace: "nowrap",
                      }}
                    >
                      #{listing.editionNumber}/{listing.totalEditions}
                    </div>

                    {/* Seller */}
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        fontSize: 12,
                        color: "#9070b0",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      @{listing.sellerId.replace("user_", "")}
                    </div>

                    {/* Price */}
                    <div
                      style={{
                        flexShrink: 0,
                        fontSize: 14,
                        fontWeight: 800,
                        color: accent,
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <BtcLogo size={12} />${listing.listPrice.toFixed(2)}
                    </div>

                    {/* Make Offer button */}
                    <button
                      type="button"
                      onClick={() => setOfferListing(listing)}
                      data-ocid="clip_chart.make_offer_btn"
                      style={{
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "4px 10px",
                        borderRadius: 20,
                        border: `1.5px solid rgba(${accentR},${accentG},${accentB},0.5)`,
                        background: "transparent",
                        color: accent,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "DM Sans, sans-serif",
                        transition: "background 0.15s",
                        whiteSpace: "nowrap",
                      }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background =
                          `rgba(${accentR},${accentG},${accentB},0.12)`;
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "transparent";
                      }}
                    >
                      <MessageCircle size={11} />
                      Offer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Offers Section ───────────────────────────────────────── */}
          {clipOffers.length > 0 && (
            <div
              style={{
                borderRadius: 16,
                background: accentBg,
                border: `1px solid ${accentBorder}`,
                padding: "14px 16px 16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  marginBottom: 12,
                }}
              >
                <MessageCircle size={14} color={accent} />
                <span
                  style={{ fontSize: 13, fontWeight: 700, color: "#d4c0f0" }}
                >
                  Offers
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: accent,
                    background: `rgba(${accentR},${accentG},${accentB},0.15)`,
                    borderRadius: 20,
                    padding: "1px 7px",
                    marginLeft: 2,
                  }}
                >
                  {clipOffers.length}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {clipOffers.map((offer, idx) => (
                  <div
                    key={offer.id}
                    data-ocid="clip_chart.offer_row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 0",
                      borderBottom:
                        idx < clipOffers.length - 1
                          ? `1px solid rgba(${accentR},${accentG},${accentB},0.10)`
                          : "none",
                    }}
                  >
                    {/* Edition */}
                    <div
                      style={{
                        flexShrink: 0,
                        background: `rgba(${accentR},${accentG},${accentB},0.10)`,
                        border: `1px solid rgba(${accentR},${accentG},${accentB},0.20)`,
                        borderRadius: 20,
                        padding: "3px 9px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#9070b0",
                        whiteSpace: "nowrap",
                      }}
                    >
                      #{offer.editionNumber}
                    </div>

                    {/* Offerer */}
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        fontSize: 12,
                        color: "#9070b0",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {offer.offererUsername}
                    </div>

                    {/* Offer price */}
                    <div
                      style={{
                        flexShrink: 0,
                        fontSize: 13,
                        fontWeight: 800,
                        color: "#d4c0f0",
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <BtcLogo size={11} />${offer.offerPriceUsd.toFixed(2)}
                    </div>

                    {/* Status badge or Accept/Decline */}
                    {offer.status === "pending" ? (
                      <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => handleAcceptOffer(offer)}
                          data-ocid="clip_chart.accept_offer_btn"
                          style={{
                            padding: "3px 9px",
                            borderRadius: 20,
                            border: "1.5px solid rgba(82,196,118,0.45)",
                            background: "rgba(82,196,118,0.10)",
                            color: "#52c476",
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "DM Sans, sans-serif",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeclineOffer(offer)}
                          data-ocid="clip_chart.decline_offer_btn"
                          style={{
                            padding: "3px 9px",
                            borderRadius: 20,
                            border: "1.5px solid rgba(224,90,90,0.40)",
                            background: "rgba(224,90,90,0.08)",
                            color: "#e05a5a",
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "DM Sans, sans-serif",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          flexShrink: 0,
                          padding: "3px 9px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          color: getStatusColor(offer.status),
                          background: `${getStatusColor(offer.status)}18`,
                          border: `1px solid ${getStatusColor(offer.status)}40`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {getStatusLabel(offer.status)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
