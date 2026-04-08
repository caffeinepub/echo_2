import { Clock, Tag, TrendingUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PurchaseRecord } from "../context/BondingCurveContext";
import { useBondingCurve } from "../context/BondingCurveContext";
import type { MarketListing } from "../pages/MarketPage";
import { BtcLogo } from "./BtcLogo";

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

const ACCENT_R = 192;
const ACCENT_G = 160;
const ACCENT_B = 230;
const ACCENT = `rgb(${ACCENT_R},${ACCENT_G},${ACCENT_B})`;
const ACCENT_GLOW = `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},0.35)`;
const ACCENT_BORDER = `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},0.3)`;
const ACCENT_BG = `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},0.08)`;
const ACCENT_GRAD = `linear-gradient(135deg, rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},0.9) 0%, rgba(160,100,220,0.9) 100%)`;

const DURATIONS: { label: string; hours: number }[] = [
  { label: "1h", hours: 1 },
  { label: "24h", hours: 24 },
  { label: "7d", hours: 168 },
];

interface Props {
  record: PurchaseRecord;
  onClose: () => void;
  onListed: (clipId: string) => void;
}

export function buildPriceHistory(
  copiesMinted: number,
  startingPriceCents: number,
  priceIncrementCents: number,
) {
  if (copiesMinted === 0) return [];
  const MAX_POINTS = 10;
  const step = Math.max(1, Math.ceil(copiesMinted / MAX_POINTS));
  const points: { copy: number; price: number }[] = [];
  for (let k = 1; k <= copiesMinted; k += step) {
    points.push({
      copy: k,
      price: Number.parseFloat(
        ((startingPriceCents + (k - 1) * priceIncrementCents) / 100).toFixed(2),
      ),
    });
  }
  const last = copiesMinted;
  if (points[points.length - 1]?.copy !== last) {
    points.push({
      copy: last,
      price: Number.parseFloat(
        ((startingPriceCents + (last - 1) * priceIncrementCents) / 100).toFixed(
          2,
        ),
      ),
    });
  }
  return points;
}

export function NftDetailModal({ record, onClose, onListed }: Props) {
  const { getCurveState, getOrCreateCurve } = useBondingCurve();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showListing, setShowListing] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(DURATIONS[1]);
  const [listed, setListed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Ensure curve state exists
  useEffect(() => {
    getOrCreateCurve(record.clipId);
  }, [record.clipId, getOrCreateCurve]);

  const curveState = getCurveState(record.clipId);

  const priceHistory = curveState
    ? buildPriceHistory(
        curveState.copiesMinted,
        curveState.startingPriceCents,
        curveState.priceIncrementCents,
      )
    : [];

  const currentMarketPrice = curveState
    ? (curveState.startingPriceCents +
        curveState.copiesMinted * curveState.priceIncrementCents) /
      100
    : record.pricePaid / 100;

  const [priceInput, setPriceInput] = useState(currentMarketPrice.toFixed(2));

  // Update price input when curve loads
  useEffect(() => {
    if (curveState) {
      setPriceInput(currentMarketPrice.toFixed(2));
    }
  }, [curveState, currentMarketPrice]);

  const acquiredDate = new Date(record.purchasedAt).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" },
  );

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleConfirmListing() {
    const listPriceNum = Number.parseFloat(priceInput);
    if (!listPriceNum || listPriceNum <= 0) return;

    // Build a new MarketListing entry
    const newListing: MarketListing = {
      id: `listing_${record.clipId}_${record.purchasedAt}_${Date.now()}`,
      clipId: record.clipId,
      clipTitle: record.clipTitle,
      creatorUsername: record.creatorName,
      imageUrl: record.videoUrl,
      videoUrl: record.videoUrl,
      listPrice: listPriceNum,
      editionNumber: record.editionNumber ?? 1,
      totalEditions: record.totalSupply ?? 1000,
      listedAt: Date.now(),
      sellerId: `user_${record.creatorName.replace(/\s/g, "_")}`,
    };

    // Push to minty_market_listings
    const existing = loadListings();
    saveListings([newListing, ...existing]);

    // Mark purchase record as listed in minty_purchases_v1
    try {
      const raw = localStorage.getItem("minty_purchases_v1");
      const records: (PurchaseRecord & { listed?: boolean })[] = raw
        ? JSON.parse(raw)
        : [];
      const updated = records.map((r) =>
        r.clipId === record.clipId && r.purchasedAt === record.purchasedAt
          ? { ...r, listed: true }
          : r,
      );
      localStorage.setItem("minty_purchases_v1", JSON.stringify(updated));
    } catch {
      // ignore
    }

    setListed(true);
    showToast("Listed for sale! 🎉");

    setTimeout(() => {
      onListed(record.clipId);
      onClose();
    }, 1400);
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: custom modal overlay needs div for backdrop click
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
        zIndex: 200,
        background: "rgba(10,0,20,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      {/* Toast notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 500,
            background: `linear-gradient(135deg, rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},0.95) 0%, rgba(160,100,220,0.95) 100%)`,
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "DM Sans, sans-serif",
            padding: "12px 22px",
            borderRadius: 30,
            boxShadow: `0 4px 20px ${ACCENT_GLOW}`,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            animation: "fadeInUp 0.25s ease",
          }}
        >
          {toast}
        </div>
      )}

      <div
        style={{
          width: "100%",
          maxWidth: 480,
          maxHeight: "90svh",
          overflowY: "auto",
          borderRadius: "24px 24px 0 0",
          background: "rgba(18,8,30,0.97)",
          border: `1px solid ${ACCENT_BORDER}`,
          boxShadow: `0 -8px 40px ${ACCENT_GLOW}`,
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
            borderBottom: `1px solid ${ACCENT_BORDER}`,
            position: "sticky",
            top: 0,
            background: "rgba(18,8,30,0.97)",
            zIndex: 2,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "#f0eaff",
                lineHeight: 1.2,
              }}
            >
              {record.clipTitle || "Untitled Moment"}
            </div>
            <div
              style={{
                fontSize: 12,
                color: ACCENT,
                marginTop: 2,
                fontWeight: 500,
              }}
            >
              by @{record.creatorName}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-ocid="nft_detail.close_button"
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: `1px solid ${ACCENT_BORDER}`,
              background: ACCENT_BG,
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
            padding: "16px 18px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Video */}
          <div
            style={{
              borderRadius: 16,
              overflow: "hidden",
              border: `1px solid ${ACCENT_BORDER}`,
              background: "#0a0016",
              aspectRatio: "16/9",
              position: "relative",
            }}
          >
            <video
              ref={videoRef}
              src={record.videoUrl}
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
            {/* Edition badge */}
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: ACCENT_GRAD,
                borderRadius: 20,
                padding: "4px 11px",
                fontSize: 12,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              Copy #{record.editionNumber ?? "—"} / {record.totalSupply ?? 1000}
            </div>
          </div>

          {/* Meta row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            <div
              style={{
                borderRadius: 12,
                background: ACCENT_BG,
                border: `1px solid ${ACCENT_BORDER}`,
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
                Price Paid
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: ACCENT,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <BtcLogo size={15} />${(record.pricePaid / 100).toFixed(2)}
              </div>
            </div>
            <div
              style={{
                borderRadius: 12,
                background: ACCENT_BG,
                border: `1px solid ${ACCENT_BORDER}`,
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
                Acquired
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#d4c0f0",
                  marginTop: 2,
                }}
              >
                {acquiredDate}
              </div>
            </div>
          </div>

          {/* Price History Chart or Listing Form */}
          {!showListing ? (
            <>
              {/* Chart section */}
              <div
                style={{
                  borderRadius: 16,
                  background: ACCENT_BG,
                  border: `1px solid ${ACCENT_BORDER}`,
                  padding: "14px 14px 10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 12,
                  }}
                >
                  <TrendingUp size={14} color={ACCENT} />
                  <span
                    style={{ fontSize: 13, fontWeight: 700, color: "#d4c0f0" }}
                  >
                    Price History
                  </span>
                </div>

                {priceHistory.length === 0 ? (
                  <div
                    style={{
                      height: 100,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#7050a0",
                      fontSize: 13,
                    }}
                  >
                    No price history yet
                  </div>
                ) : (
                  <div style={{ height: 160 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={priceHistory}
                        margin={{ top: 4, right: 8, left: -12, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(192,160,230,0.12)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="copy"
                          tick={{
                            fill: "#7050a0",
                            fontSize: 10,
                            fontFamily: "DM Sans, sans-serif",
                          }}
                          axisLine={false}
                          tickLine={false}
                          label={{
                            value: "Copy",
                            position: "insideBottom",
                            offset: -2,
                            fill: "#7050a0",
                            fontSize: 10,
                            fontFamily: "DM Sans, sans-serif",
                          }}
                        />
                        <YAxis
                          tick={{
                            fill: "#7050a0",
                            fontSize: 10,
                            fontFamily: "DM Sans, sans-serif",
                          }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v: number) => `₿${v.toFixed(2)}`}
                          width={46}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "rgba(18,8,30,0.95)",
                            border: `1px solid ${ACCENT_BORDER}`,
                            borderRadius: 10,
                            fontFamily: "DM Sans, sans-serif",
                            fontSize: 12,
                            color: "#d4c0f0",
                          }}
                          itemStyle={{ color: ACCENT }}
                          formatter={(value: number) => [
                            `₿${value.toFixed(2)}`,
                            "Price",
                          ]}
                          labelFormatter={(label: number) => `Copy #${label}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke={ACCENT}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{
                            r: 4,
                            fill: ACCENT,
                            stroke: "rgba(18,8,30,0.9)",
                            strokeWidth: 2,
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* List for Sale button */}
              <button
                type="button"
                data-ocid="nft_detail.list_for_sale_button"
                onClick={() => setShowListing(true)}
                style={{
                  width: "100%",
                  height: 48,
                  borderRadius: 14,
                  border: "none",
                  background: ACCENT_GRAD,
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily: "DM Sans, sans-serif",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: `0 4px 20px ${ACCENT_GLOW}`,
                }}
              >
                <Tag size={16} />
                List for Sale
              </button>
            </>
          ) : (
            /* Listing Form */
            <div
              style={{
                borderRadius: 16,
                background: ACCENT_BG,
                border: `1px solid ${ACCENT_BORDER}`,
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: "#d4c0f0" }}>
                List for Sale
              </div>

              {/* Price input */}
              <div>
                <label
                  htmlFor="listing-price"
                  style={{
                    fontSize: 12,
                    color: "#9070b0",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Listing Price (USD in BTC)
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 15,
                      fontWeight: 700,
                      color: ACCENT,
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <BtcLogo size={14} />$
                  </span>
                  <input
                    id="listing-price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    data-ocid="nft_detail.price_input"
                    style={{
                      width: "100%",
                      height: 46,
                      borderRadius: 12,
                      border: `1px solid ${ACCENT_BORDER}`,
                      background: "rgba(10,0,20,0.6)",
                      color: "#f0eaff",
                      fontSize: 16,
                      fontWeight: 700,
                      fontFamily: "DM Sans, sans-serif",
                      paddingLeft: 30,
                      paddingRight: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Duration selector */}
              <div>
                <div
                  style={{ fontSize: 12, color: "#9070b0", marginBottom: 8 }}
                >
                  Duration
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {DURATIONS.map((d) => (
                    <button
                      key={d.label}
                      type="button"
                      data-ocid={`nft_detail.duration_${d.label}`}
                      onClick={() => setSelectedDuration(d)}
                      style={{
                        flex: 1,
                        height: 38,
                        borderRadius: 20,
                        border: `1px solid ${selectedDuration.hours === d.hours ? ACCENT : ACCENT_BORDER}`,
                        background:
                          selectedDuration.hours === d.hours
                            ? `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},0.18)`
                            : "transparent",
                        color:
                          selectedDuration.hours === d.hours
                            ? ACCENT
                            : "#7050a0",
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: "DM Sans, sans-serif",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                      }}
                    >
                      <Clock size={12} />
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  data-ocid="nft_detail.cancel_listing_button"
                  onClick={() => setShowListing(false)}
                  style={{
                    flex: 1,
                    height: 46,
                    borderRadius: 12,
                    border: `1px solid ${ACCENT_BORDER}`,
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
                  data-ocid="nft_detail.confirm_listing_button"
                  onClick={handleConfirmListing}
                  disabled={listed}
                  style={{
                    flex: 2,
                    height: 46,
                    borderRadius: 12,
                    border: "none",
                    background: listed ? "rgba(100,80,140,0.5)" : ACCENT_GRAD,
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: "DM Sans, sans-serif",
                    cursor: listed ? "default" : "pointer",
                    boxShadow: listed ? "none" : `0 4px 16px ${ACCENT_GLOW}`,
                    transition: "all 0.2s ease",
                  }}
                >
                  {listed ? "✓ Listed!" : "Confirm Listing"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
