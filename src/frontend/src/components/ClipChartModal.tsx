import { TrendingUp, X } from "lucide-react";
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
import { useBondingCurve } from "../context/BondingCurveContext";
import { usePackStyle } from "../context/PackStyleContext";
import type { VideoClip } from "../context/VideoFeedContext";

interface Props {
  clip: VideoClip;
  onClose: () => void;
}

function formatTimestamp(ts: number): string {
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

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
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
                }}
              >
                $
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
                }}
              >
                ${currentPriceUsd.toFixed(2)}
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

          {/* Chart */}
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
                        `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0)}`
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
                        `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
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

          {/* Price chart */}
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
                      tickFormatter={(v: number) => `$${v.toFixed(2)}`}
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
                        `$${value.toFixed(2)}`,
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
        </div>
      </div>
    </div>
  );
}
