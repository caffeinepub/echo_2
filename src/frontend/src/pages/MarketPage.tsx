import { useActor } from "@caffeineai/core-infrastructure";
import { Search, ShoppingCart, Tag, TrendingUp, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createActor } from "../backend";
import type { Listing, MarketCapEntry, PricePoint } from "../backend";
import { BtcLogo } from "../components/BtcLogo";
import { ClipChartModal } from "../components/ClipChartModal";
import { usePackStyle } from "../context/PackStyleContext";
import type { VideoClip } from "../context/VideoFeedContext";
import { useVideoFeed } from "../context/VideoFeedContext";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ClipDetailState {
  clipId: string;
  title: string;
  creator: string;
  videoUrl: string;
  marketCap: number;
  currentPrice: number;
  listings: Listing[];
  priceHistory: PricePoint[];
  isLoadingDetail: boolean;
}

// ─── Make Offer Modal ──────────────────────────────────────────────────────────

function MakeOfferModal({
  listing,
  onClose,
  onSubmit,
  accentR,
  accentG,
  accentB,
}: {
  listing: Listing;
  onClose: () => void;
  onSubmit: (listingId: bigint, price: number) => Promise<void>;
  accentR: number;
  accentG: number;
  accentB: number;
}) {
  const accent = `rgb(${accentR},${accentG},${accentB})`;
  const accentGlow = `rgba(${accentR},${accentG},${accentB},0.35)`;
  const accentBorder = `rgba(${accentR},${accentG},${accentB},0.3)`;
  const accentBg = `rgba(${accentR},${accentG},${accentB},0.08)`;
  const [price, setPrice] = useState(listing.listPriceUsd.toFixed(2));
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const p = Number.parseFloat(price);
    if (!p || p <= 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(listing.id, p);
      setDone(true);
      setTimeout(onClose, 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to place offer");
      setSubmitting(false);
    }
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: custom modal overlay
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
        zIndex: 400,
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
          padding: "24px 20px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
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
            Make Offer
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

        <div style={{ fontSize: 12, color: "#9070b0" }}>
          Listed at{" "}
          <span style={{ color: accent, fontWeight: 700 }}>
            ${listing.listPriceUsd.toFixed(2)}
          </span>
          {" · "} Edition #{listing.editionNumber.toString()}
        </div>

        <div>
          <label
            htmlFor="offer-price"
            style={{
              fontSize: 12,
              color: "#9070b0",
              display: "block",
              marginBottom: 6,
            }}
          >
            Your Offer Price (USD in BTC)
          </label>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: accent,
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <BtcLogo size={14} />$
            </span>
            <input
              id="offer-price"
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              data-ocid="market.offer_price_input"
              style={{
                width: "100%",
                height: 46,
                borderRadius: 12,
                border: `1px solid ${accentBorder}`,
                background: "rgba(10,0,20,0.6)",
                color: "#f0eaff",
                fontSize: 16,
                fontWeight: 700,
                fontFamily: "DM Sans, sans-serif",
                paddingLeft: 36,
                paddingRight: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {error && (
          <div style={{ fontSize: 12, color: "#f87171", fontWeight: 500 }}>
            ⚠️ {error}
          </div>
        )}

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
            data-ocid="market.offer_submit_button"
            onClick={handleSubmit}
            disabled={submitting || done}
            style={{
              flex: 2,
              height: 48,
              borderRadius: 14,
              border: "none",
              background: done
                ? "rgba(100,80,140,0.5)"
                : `linear-gradient(135deg, rgba(${accentR},${accentG},${accentB},0.9) 0%, rgba(160,100,220,0.9) 100%)`,
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "DM Sans, sans-serif",
              cursor: submitting || done ? "default" : "pointer",
              boxShadow: done ? "none" : `0 4px 16px ${accentGlow}`,
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {done ? (
              "✓ Offer Sent!"
            ) : submitting ? (
              "Sending…"
            ) : (
              <>
                <BtcLogo size={14} style={{ filter: "brightness(10)" }} /> Place
                Offer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ClipDetailModal ───────────────────────────────────────────────────────────

function ClipDetailModal({
  detail,
  onClose,
  onMakeOffer,
  accentR,
  accentG,
  accentB,
}: {
  detail: ClipDetailState;
  onClose: () => void;
  onMakeOffer: (listing: Listing) => void;
  accentR: number;
  accentG: number;
  accentB: number;
}) {
  const accent = `rgb(${accentR},${accentG},${accentB})`;
  const accentBorder = `rgba(${accentR},${accentG},${accentB},0.3)`;
  const accentGlow = `rgba(${accentR},${accentG},${accentB},0.35)`;
  const accentBg = `rgba(${accentR},${accentG},${accentB},0.08)`;

  return (
    // biome-ignore lint/a11y/useSemanticElements: custom modal overlay
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
          maxHeight: "90svh",
          overflowY: "auto",
          borderRadius: "24px 24px 0 0",
          background: "rgba(18,8,30,0.97)",
          border: `1px solid ${accentBorder}`,
          boxShadow: `0 -8px 40px ${accentGlow}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 18px 14px",
            borderBottom: `1px solid ${accentBorder}`,
            position: "sticky",
            top: 0,
            background: "rgba(18,8,30,0.97)",
            zIndex: 2,
          }}
        >
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#f0eaff" }}>
              {detail.title}
            </div>
            <div
              style={{
                fontSize: 12,
                color: accent,
                marginTop: 2,
                fontWeight: 500,
              }}
            >
              @{detail.creator}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-ocid="market.detail_close"
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
            padding: "16px 18px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Looping video */}
          <div
            style={{
              borderRadius: 16,
              overflow: "hidden",
              border: `1px solid ${accentBorder}`,
              background: "#0a0016",
              aspectRatio: "16/9",
            }}
          >
            {detail.videoUrl ? (
              <video
                src={detail.videoUrl}
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
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#7050a0",
                  fontSize: 13,
                }}
              >
                No preview
              </div>
            )}
          </div>

          {/* Stats row */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            {[
              {
                label: "Market Cap",
                value: `$${detail.marketCap.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
              },
              {
                label: "Current Price",
                value: `$${detail.currentPrice.toFixed(2)}`,
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  borderRadius: 12,
                  background: accentBg,
                  border: `1px solid ${accentBorder}`,
                  padding: "10px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "#9070b0",
                    marginBottom: 2,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: accent,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <BtcLogo size={13} />
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Price chart */}
          <div
            style={{
              borderRadius: 14,
              background: accentBg,
              border: `1px solid ${accentBorder}`,
              padding: "14px",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#d4c0f0",
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <TrendingUp size={13} color={accent} /> Price History
            </div>
            {detail.isLoadingDetail ? (
              <div
                style={{
                  height: 60,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#7050a0",
                  fontSize: 12,
                }}
              >
                Loading…
              </div>
            ) : detail.priceHistory.length === 0 ? (
              <div
                style={{
                  height: 60,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#7050a0",
                  fontSize: 12,
                }}
              >
                No price history yet
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    alignItems: "flex-end",
                    height: 60,
                    minWidth: detail.priceHistory.length * 18,
                  }}
                >
                  {detail.priceHistory.map((pt) => {
                    const maxP = Math.max(
                      ...detail.priceHistory.map((p) => p.salePrice),
                    );
                    const h = maxP > 0 ? (pt.salePrice / maxP) * 56 : 10;
                    return (
                      <div
                        key={`${pt.editionNumber.toString()}-${pt.timestamp.toString()}`}
                        title={`$${pt.salePrice.toFixed(2)}`}
                        style={{
                          width: 14,
                          height: h,
                          borderRadius: 3,
                          background: `rgba(${accentR},${accentG},${accentB},0.6)`,
                          flexShrink: 0,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Active listings */}
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#d4c0f0",
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Tag size={13} color={accent} /> Listed for Sale
              <span
                style={{
                  fontSize: 11,
                  color: accent,
                  fontWeight: 600,
                  background: accentBg,
                  borderRadius: 20,
                  padding: "1px 8px",
                }}
              >
                {detail.listings.length}
              </span>
            </div>
            {detail.isLoadingDetail ? (
              <div
                style={{
                  fontSize: 12,
                  color: "#7050a0",
                  textAlign: "center",
                  padding: "12px 0",
                }}
              >
                Loading listings…
              </div>
            ) : detail.listings.length === 0 ? (
              <div
                style={{
                  fontSize: 12,
                  color: "#7050a0",
                  textAlign: "center",
                  padding: "12px 0",
                }}
              >
                No copies listed for sale right now.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {detail.listings.map((l) => (
                  <div
                    key={l.id.toString()}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      background: accentBg,
                      border: `1px solid ${accentBorder}`,
                      borderRadius: 12,
                      padding: "10px 14px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#f0eaff",
                        }}
                      >
                        Edition #{l.editionNumber.toString()} /{" "}
                        {l.totalEditions.toString()}
                      </div>
                      <div
                        style={{ fontSize: 11, color: "#9070b0", marginTop: 2 }}
                      >
                        {l.sellerPrincipal.toString().slice(0, 12)}…
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: accent,
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <BtcLogo size={13} />${l.listPriceUsd.toFixed(2)}
                      </div>
                      <button
                        type="button"
                        data-ocid="market.make_offer_button"
                        onClick={() => onMakeOffer(l)}
                        style={{
                          marginTop: 6,
                          height: 28,
                          paddingLeft: 12,
                          paddingRight: 12,
                          borderRadius: 20,
                          border: "none",
                          background: `linear-gradient(135deg, rgba(${accentR},${accentG},${accentB},0.85) 0%, rgba(160,100,220,0.85) 100%)`,
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: 700,
                          fontFamily: "DM Sans, sans-serif",
                          cursor: "pointer",
                          boxShadow: `0 2px 8px rgba(${accentR},${accentG},${accentB},0.25)`,
                        }}
                      >
                        Make Offer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TopMarketCard ─────────────────────────────────────────────────────────────

function TopMarketCard({
  entry,
  rank,
  accentR,
  accentG,
  accentB,
  onClick,
}: {
  entry: MarketCapEntry;
  rank: number;
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
        borderRadius: 14,
        background: accentBg,
        border: `1.5px solid ${rank <= 3 ? badgeColor.replace("0.90", "0.3") : accentBorder}`,
        boxShadow:
          rank <= 3 ? `0 4px 20px ${glowColor}` : "0 2px 10px rgba(0,0,0,0.06)",
        overflow: "hidden",
        cursor: "pointer",
        textAlign: "left",
        padding: 0,
        width: "100%",
        transition: "transform 0.15s ease",
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "16/9",
          overflow: "hidden",
          background: "#0d1520",
        }}
      >
        {entry.videoUrl ? (
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
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#444",
            }}
          >
            📹
          </div>
        )}
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            background: badgeColor,
            borderRadius: 20,
            padding: "3px 9px",
            fontSize: 12,
            fontWeight: 800,
            color: rank <= 3 ? "#1a0a2e" : "#fff",
            fontFamily: "DM Sans, sans-serif",
            boxShadow: `0 2px 8px ${glowColor}`,
          }}
        >
          #{rank}
        </div>
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "rgba(0,0,0,0.5)",
            borderRadius: 20,
            padding: "3px 8px",
            fontSize: 9,
            color: "#fff",
            fontFamily: "DM Sans, sans-serif",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          📈 Chart
        </div>
      </div>
      <div style={{ padding: "10px 12px 12px" }}>
        <div
          style={{
            fontSize: 13,
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
            marginBottom: 6,
          }}
        >
          @{entry.creatorName}
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
              fontSize: 10,
              color: "var(--echo-text-muted)",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {Number(entry.copiesSold).toLocaleString()} sold
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: accent,
              fontFamily: "DM Sans, sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <BtcLogo size={11} />$
            {entry.marketCapUsd.toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── ListingRow ───────────────────────────────────────────────────────────────

function ListingRow({
  listing,
  clip,
  onBuy,
  accentR,
  accentG,
  accentB,
}: {
  listing: Listing;
  clip: VideoClip | undefined;
  onBuy: () => void;
  accentR: number;
  accentG: number;
  accentB: number;
}) {
  const accent = `rgb(${accentR},${accentG},${accentB})`;
  const accentBorder = `rgba(${accentR},${accentG},${accentB},0.12)`;

  const videoUrl = clip?.videoUrl ?? "";
  const title = clip?.title || listing.clipId;
  const creator =
    clip?.creatorName || listing.sellerPrincipal.toString().slice(0, 8);

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
        {videoUrl ? (
          <video
            src={videoUrl}
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
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#555",
              fontSize: 20,
            }}
          >
            📹
          </div>
        )}
      </div>
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
          {title}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--echo-text-secondary)",
            fontFamily: "DM Sans, sans-serif",
            marginBottom: 4,
          }}
        >
          @{creator}
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
          #{listing.editionNumber.toString()}/{listing.totalEditions.toString()}
        </div>
      </div>
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
          <BtcLogo size={14} />${listing.listPriceUsd.toFixed(2)}
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

// ─── MarketPage ────────────────────────────────────────────────────────────────

export function MarketPage() {
  const { activeStyle } = usePackStyle();
  const { accentR, accentG, accentB } = activeStyle;
  const accent = `rgb(${accentR},${accentG},${accentB})`;
  const accentBorder = `rgba(${accentR},${accentG},${accentB},0.15)`;

  const { actor, isFetching } = useActor(createActor);
  const { clips } = useVideoFeed();

  const [listings, setListings] = useState<Listing[]>([]);
  const [top10, setTop10] = useState<MarketCapEntry[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [isLoadingTop10, setIsLoadingTop10] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"newest" | "trending">(
    "newest",
  );

  const [clipDetail, setClipDetail] = useState<ClipDetailState | null>(null);
  const [offerTarget, setOfferTarget] = useState<Listing | null>(null);

  // Load listings and top 10 from backend with polling
  useEffect(() => {
    if (!actor || isFetching) return;

    function fetchListings() {
      if (!actor) return;
      actor
        .getListings()
        .then((data) => setListings(data))
        .catch((err) => console.error("[Market] getListings failed:", err))
        .finally(() => setIsLoadingListings(false));
    }

    function fetchTop10() {
      if (!actor) return;
      actor
        .getTop10ByMarketCap()
        .then((data) => setTop10(data))
        .catch((err) =>
          console.error("[Market] getTop10ByMarketCap failed:", err),
        )
        .finally(() => setIsLoadingTop10(false));
    }

    // Initial fetch
    setIsLoadingListings(true);
    setIsLoadingTop10(true);
    fetchListings();
    fetchTop10();

    // Poll every 5s for listings, every 10s for top10
    const listingsInterval = setInterval(fetchListings, 5000);
    const top10Interval = setInterval(fetchTop10, 10000);

    return () => {
      clearInterval(listingsInterval);
      clearInterval(top10Interval);
    };
  }, [actor, isFetching]);

  // Open detail view for a clip — load listings + price history
  const openClipDetail = useCallback(
    async (entry: MarketCapEntry) => {
      const clip = clips.find((c) => c.id === entry.clipId);
      const base: ClipDetailState = {
        clipId: entry.clipId,
        title: entry.title || clip?.title || entry.clipId,
        creator: entry.creatorName || clip?.creatorName || "—",
        videoUrl: entry.videoUrl || clip?.videoUrl || "",
        marketCap: entry.marketCapUsd,
        currentPrice: entry.currentPriceUsd,
        listings: [],
        priceHistory: [],
        isLoadingDetail: true,
      };
      setClipDetail(base);

      if (!actor) return;
      try {
        const [detailListings, history] = await Promise.all([
          actor.getListingsByClip(entry.clipId),
          actor.getPriceHistory(entry.clipId),
        ]);
        setClipDetail((prev) =>
          prev
            ? {
                ...prev,
                listings: detailListings,
                priceHistory: history,
                isLoadingDetail: false,
              }
            : null,
        );
      } catch (err) {
        console.error("[Market] loadDetail failed:", err);
        setClipDetail((prev) =>
          prev ? { ...prev, isLoadingDetail: false } : null,
        );
      }
    },
    [actor, clips],
  );

  // Open detail for a listing row click
  const openListingDetail = useCallback(
    async (listing: Listing) => {
      const clip = clips.find((c) => c.id === listing.clipId);
      const base: ClipDetailState = {
        clipId: listing.clipId,
        title: clip?.title || listing.clipId,
        creator:
          clip?.creatorName || listing.sellerPrincipal.toString().slice(0, 8),
        videoUrl: clip?.videoUrl || "",
        marketCap: 0,
        currentPrice: listing.listPriceUsd,
        listings: [],
        priceHistory: [],
        isLoadingDetail: true,
      };
      setClipDetail(base);

      if (!actor) return;
      try {
        const [detailListings, history, mcap] = await Promise.all([
          actor.getListingsByClip(listing.clipId),
          actor.getPriceHistory(listing.clipId),
          actor.getMarketCap(listing.clipId),
        ]);
        setClipDetail((prev) =>
          prev
            ? {
                ...prev,
                listings: detailListings,
                priceHistory: history,
                marketCap: mcap?.marketCapUsd ?? 0,
                currentPrice: mcap?.currentPriceUsd ?? listing.listPriceUsd,
                isLoadingDetail: false,
              }
            : null,
        );
      } catch (err) {
        console.error("[Market] loadListingDetail failed:", err);
        setClipDetail((prev) =>
          prev ? { ...prev, isLoadingDetail: false } : null,
        );
      }
    },
    [actor, clips],
  );

  async function handleMakeOffer(listingId: bigint, price: number) {
    if (!actor) throw new Error("Not connected");
    const result = await actor.makeOffer(listingId, price);
    if (result.__kind__ === "err") throw new Error(result.err);
  }

  // Filtered + sorted listings
  const filteredListings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let result = listings;
    if (q) {
      result = result.filter((l) => {
        const clip = clips.find((c) => c.id === l.clipId);
        const title = (clip?.title || l.clipId).toLowerCase();
        const creator = (clip?.creatorName || "").toLowerCase();
        return title.includes(q) || creator.includes(q);
      });
    }
    if (activeFilter === "newest") {
      result = [...result].sort(
        (a, b) => Number(b.listedAt) - Number(a.listedAt),
      );
    } else {
      result = [...result].sort((a, b) => b.listPriceUsd - a.listPriceUsd);
    }
    return result;
  }, [listings, clips, searchQuery, activeFilter]);

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
            Total market cap = price × copies sold · tap any card for chart
          </p>

          {isLoadingTop10 ? (
            <div
              data-ocid="market.top10_loading"
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "24px 0",
                color: "var(--echo-text-muted)",
                fontSize: 13,
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Loading…
            </div>
          ) : top10.length === 0 ? (
            <div
              data-ocid="market.top10_empty"
              style={{
                textAlign: "center",
                padding: "24px 0",
                color: "var(--echo-text-muted)",
                fontSize: 13,
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              No market data yet. Mint and sell clips to see rankings here.
            </div>
          ) : (
            <>
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
                    accentR={accentR}
                    accentG={accentG}
                    accentB={accentB}
                    onClick={() => openClipDetail(entry)}
                  />
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {top10.slice(3).map((entry, i) => (
                  <button
                    key={entry.clipId}
                    type="button"
                    data-ocid="market.top_row"
                    onClick={() => openClipDetail(entry)}
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
                      {entry.videoUrl && (
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
                      )}
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
                        {Number(entry.copiesSold).toLocaleString()} sold
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
                        {entry.marketCapUsd.toLocaleString("en-US", {
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
            </>
          )}
        </div>

        {/* ── Listed For Sale ────────────────────────────────────────── */}
        <div>
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
          <div style={{ position: "relative", marginBottom: 12 }}>
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
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
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
          {isLoadingListings ? (
            <div
              data-ocid="market.listings_loading"
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "32px 0",
                color: "var(--echo-text-muted)",
                fontSize: 13,
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Loading listings…
            </div>
          ) : filteredListings.length === 0 ? (
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
                  key={listing.id.toString()}
                  listing={listing}
                  clip={clips.find((c) => c.id === listing.clipId)}
                  onBuy={() => openListingDetail(listing)}
                  accentR={accentR}
                  accentG={accentG}
                  accentB={accentB}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Clip detail modal */}
      {clipDetail && !offerTarget && (
        <ClipDetailModal
          detail={clipDetail}
          onClose={() => setClipDetail(null)}
          onMakeOffer={(listing) => setOfferTarget(listing)}
          accentR={accentR}
          accentG={accentG}
          accentB={accentB}
        />
      )}

      {/* Make offer modal */}
      {offerTarget && (
        <MakeOfferModal
          listing={offerTarget}
          onClose={() => setOfferTarget(null)}
          onSubmit={handleMakeOffer}
          accentR={accentR}
          accentG={accentG}
          accentB={accentB}
        />
      )}
    </div>
  );
}
