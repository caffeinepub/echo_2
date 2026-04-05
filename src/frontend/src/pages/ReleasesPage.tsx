import {
  Check,
  ChevronRight,
  Flame,
  Gavel,
  Package2,
  ShoppingBag,
  Sparkles,
  Timer,
  TrendingUp,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "../ThemeContext";
import { type AuctionListing, useAuctions } from "../context/AuctionContext";
import { useCollection } from "../context/CollectionContext";
import type { SealedPack } from "../context/CollectionContext";
import { usePackStyle } from "../context/PackStyleContext";
import type { MarketRelease } from "../context/ReleasesMarketContext";
import {
  calcPackPrice,
  useReleasesMarket,
} from "../context/ReleasesMarketContext";
import { useUserSettings } from "../context/UserSettingsContext";

import {
  type TrendingHashtag,
  getTrendingHashtags,
} from "../store/mockDiscoverSets";
// ─── Countdown helper ─────────────────────────────────────────────────────────

function formatCountdown(msLeft: number): string {
  if (msLeft <= 0) return "Burned";
  const totalSec = Math.floor(msLeft / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m left`;
  if (m > 0) return `${m}m ${s}s left`;
  return `${s}s left`;
}

// ─── Ticker Bar ──────────────────────────────────────────────────────────────

interface TickerTransaction {
  id: string;
  cardName: string;
  grade: number;
  priceUsd: number;
  soldAt: number;
}

const NOW_TICKER = Date.now();
const DAY = 86400000;

const RECENT_TRANSACTIONS: TickerTransaction[] = [
  {
    id: "t1",
    cardName: "Sunset Ride",
    grade: 10,
    priceUsd: 3.5,
    soldAt: NOW_TICKER - DAY * 0.1,
  },
  {
    id: "t2",
    cardName: "First Mint Moment",
    grade: 10,
    priceUsd: 5.0,
    soldAt: NOW_TICKER - DAY * 0.3,
  },
  {
    id: "t3",
    cardName: "Golden Hour",
    grade: 9,
    priceUsd: 2.0,
    soldAt: NOW_TICKER - DAY * 0.5,
  },
  {
    id: "t4",
    cardName: "Night Drive Series",
    grade: 10,
    priceUsd: 4.25,
    soldAt: NOW_TICKER - DAY * 0.8,
  },
  {
    id: "t5",
    cardName: "Coastal Drift",
    grade: 10,
    priceUsd: 3.0,
    soldAt: NOW_TICKER - DAY * 1.0,
  },
  {
    id: "t6",
    cardName: "Glacier Pack",
    grade: 9,
    priceUsd: 1.5,
    soldAt: NOW_TICKER - DAY * 1.5,
  },
  {
    id: "t7",
    cardName: "Amber Skies",
    grade: 10,
    priceUsd: 6.0,
    soldAt: NOW_TICKER - DAY * 2,
  },
  {
    id: "t8",
    cardName: "Neon Pulse",
    grade: 9,
    priceUsd: 2.75,
    soldAt: NOW_TICKER - DAY * 2.5,
  },
  {
    id: "t9",
    cardName: "Dusk Ride",
    grade: 10,
    priceUsd: 5.5,
    soldAt: NOW_TICKER - DAY * 3,
  },
  {
    id: "t10",
    cardName: "Sage Series",
    grade: 10,
    priceUsd: 3.25,
    soldAt: NOW_TICKER - DAY * 4,
  },
].sort((a, b) => b.soldAt - a.soldAt);

function TickerBar({
  isDark,
  accentRgb,
  accentSolid,
}: {
  isDark: boolean;
  accentRgb: string;
  accentSolid: string;
}) {
  const [paused, setPaused] = useState(false);
  const items = [...RECENT_TRANSACTIONS, ...RECENT_TRANSACTIONS];
  const mintColor = accentSolid;
  const badgeBg = `rgba(${accentRgb},0.15)`;
  const containerBg = `rgba(${accentRgb},0.07)`;
  const containerBorder = `rgba(${accentRgb},0.18)`;
  const textColor = isDark ? "oklch(0.72 0.06 160)" : "#6b7280";
  const dimDot = isDark ? "oklch(0.38 0.06 160)" : "rgba(0,0,0,0.12)";
  const sepDot = isDark ? "oklch(0.58 0.08 160)" : "#9ca3af";

  return (
    <>
      <style>{`
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes packActivityPulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.35); }
        }
        @keyframes packProgressIn {
          from { width: 0%; }
          to { width: var(--progress-target); }
        }
        @keyframes priceDeltaFade {
          0%   { opacity: 1; transform: translateY(0px); }
          60%  { opacity: 0.9; transform: translateY(-4px); }
          100% { opacity: 0; transform: translateY(-8px); }
        }
      `}</style>
      <div
        style={{
          height: 40,
          borderRadius: 20,
          background: containerBg,
          border: `1px solid ${containerBorder}`,
          overflow: "hidden",
          marginBottom: 8,
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            whiteSpace: "nowrap",
            animation: "tickerScroll 40s linear infinite",
            animationPlayState: paused ? "paused" : "running",
            willChange: "transform",
          }}
        >
          {items.map((tx, idx) => (
            <span
              key={`${tx.id}-${idx}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "0 4px",
                cursor: "default",
              }}
            >
              <span style={{ fontSize: 12, color: textColor, fontWeight: 500 }}>
                {tx.cardName}
              </span>
              <span style={{ fontSize: 11, color: sepDot, margin: "0 2px" }}>
                •
              </span>
              <span
                style={{
                  display: "inline-block",
                  background: badgeBg,
                  color: mintColor,
                  borderRadius: 4,
                  padding: "1px 5px",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.03em",
                }}
              >
                1 pack
              </span>
              <span style={{ fontSize: 11, color: sepDot, margin: "0 2px" }}>
                •
              </span>
              <span style={{ fontSize: 12, color: mintColor, fontWeight: 600 }}>
                ${tx.priceUsd.toFixed(2)}
              </span>
              <span
                style={{ fontSize: 12, color: dimDot, margin: "0 12px 0 8px" }}
              >
                •
              </span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Release card countdown hook ─────────────────────────────────────────────

function useCountdown(expiresAt: number, now: number) {
  const msLeft = expiresAt - now;
  const isBurned = msLeft <= 0;
  const isEndingSoon = msLeft > 0 && msLeft < 4 * 3600000;
  return { msLeft, isBurned, isEndingSoon, label: formatCountdown(msLeft) };
}

// ─── VideoPreviewModal ────────────────────────────────────────────────────────

function VideoPreviewModal({
  clipUrl,
  open,
  onClose,
}: {
  clipUrl: string;
  open: boolean;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Reset muted state each time modal opens
  useEffect(() => {
    if (open) setIsMuted(true);
  }, [open]);

  function toggleMute() {
    setIsMuted((prev) => {
      const next = !prev;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  }

  if (!open) return null;

  return (
    <div
      data-ocid="releases.modal"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
      }}
    >
      {/* Backdrop */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Close video preview"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape" || e.key === "Enter") onClose();
        }}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.80)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          animation: "vpBdIn 0.2s ease",
        }}
      />

      {/* Container */}
      <div
        style={{
          position: "relative",
          background: "var(--echo-surface, #FCFCFC)",
          borderRadius: 24,
          overflow: "hidden",
          maxWidth: 480,
          width: "100%",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.40), 0 0 0 1px rgba(255,255,255,0.08)",
          animation: "vpIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <style>{`
          @keyframes vpBdIn { from{opacity:0} to{opacity:1} }
          @keyframes vpIn {
            from { transform: scale(0.92); opacity: 0; }
            to   { transform: scale(1); opacity: 1; }
          }
        `}</style>

        {/* Video */}
        <div style={{ position: "relative", background: "#000" }}>
          <video
            ref={videoRef}
            src={clipUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            style={{
              display: "block",
              width: "100%",
              aspectRatio: "4/5",
              objectFit: "cover",
            }}
          />

          {/* Mute/Unmute toggle */}
          <button
            type="button"
            data-ocid="releases.toggle"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
            style={{
              position: "absolute",
              bottom: 12,
              left: 12,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              border: "1px solid rgba(255,255,255,0.20)",
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
            }}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              border: "1px solid rgba(255,255,255,0.20)",
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Release Card ─────────────────────────────────────────────────────────────

function ReleaseCard({
  release,
  now,
  onTap,
  accentGradient,
  accentGlow,
  accentSolid,
}: {
  release: MarketRelease;
  now: number;
  onTap: (r: MarketRelease) => void;
  accentGradient: string;
  accentGlow: string;
  accentSolid: string;
}) {
  const { isBurned, isEndingSoon, label } = useCountdown(
    release.expiresAt,
    now,
  );
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const countdownColor = isBurned
    ? "#9ca3af"
    : isEndingSoon
      ? "#f59e0b"
      : "#6b7280";

  const hasClip = !!release.previewClipUrl;
  const packsSold = release.packCount - release.packsAvailable;
  const currentPrice = calcPackPrice(packsSold, release.packCount);
  const nextPackPrice = calcPackPrice(packsSold + 1, release.packCount);
  const percentSold = Math.round((packsSold / release.packCount) * 100);

  const [liveNow, setLiveNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setLiveNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const isEarlyMint = packsSold / release.packCount < 0.2;
  const isAlmostGone = release.packsAvailable / release.packCount < 0.1;
  const isTrending =
    !!release.lastPurchaseAt &&
    (liveNow - release.lastPurchaseAt < 5 * 60 * 1000 ||
      (packsSold > release.packCount * 0.3 &&
        liveNow - release.lastPurchaseAt < 30 * 60 * 1000));

  const prevPriceRef = useRef<number>(currentPrice);
  const [priceFlash, setPriceFlash] = useState<number | null>(null);

  useEffect(() => {
    const prev = prevPriceRef.current;
    if (currentPrice > prev) {
      const delta = currentPrice - prev;
      setPriceFlash(delta);
      const t = setTimeout(() => setPriceFlash(null), 2500);
      prevPriceRef.current = currentPrice;
      return () => clearTimeout(t);
    }
    prevPriceRef.current = currentPrice;
  }, [currentPrice]);

  function lastMintAgo(
    ts: number | undefined,
    now: number = Date.now(),
  ): string | null {
    if (!ts) return null;
    const secs = Math.floor((now - ts) / 1000);
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ago`;
  }

  return (
    <>
      <button
        type="button"
        data-ocid="releases.item.1"
        onClick={() => onTap(release)}
        style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 2px 14px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)",
          border: "1.5px solid rgba(0,0,0,0.05)",
          overflow: "hidden",
          cursor: "pointer",
          textAlign: "left",
          padding: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "box-shadow 0.18s ease, transform 0.15s ease",
          opacity: isBurned ? 0.55 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isBurned) {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              `0 6px 24px ${accentGlow}, 0 2px 8px rgba(0,0,0,0.07)`;
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(-2px)";
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 2px 14px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)";
          (e.currentTarget as HTMLButtonElement).style.transform =
            "translateY(0)";
        }}
      >
        {/* Cover media — video clip or image */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "4/5",
            overflow: "hidden",
          }}
        >
          {hasClip ? (
            <div style={{ position: "absolute", inset: 0 }}>
              <video
                src={release.previewClipUrl}
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              {/* Transparent button overlay to open preview modal */}
              <button
                type="button"
                aria-label="Expand video preview"
                onClick={(e) => {
                  e.stopPropagation();
                  setVideoModalOpen(true);
                }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              />
              {/* Play hint overlay */}
              <div
                style={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  background: "rgba(0,0,0,0.50)",
                  backdropFilter: "blur(4px)",
                  borderRadius: 20,
                  padding: "3px 8px",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  pointerEvents: "none",
                }}
              >
                <VolumeX size={10} color="rgba(255,255,255,0.80)" />
                <span
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.80)",
                    fontWeight: 600,
                  }}
                >
                  tap to expand
                </span>
              </div>
            </div>
          ) : (
            <img
              src={release.coverImageUrl}
              alt={release.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          )}

          {/* Gradient overlay for readability */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.28) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* Sold out / burned overlay */}
          {(isBurned || release.status === "sold_out") && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.42)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <span
                style={{
                  background: isBurned ? "#374151" : accentSolid,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  borderRadius: 20,
                  padding: "5px 14px",
                  letterSpacing: "0.05em",
                }}
              >
                {isBurned ? "🔥 Burned" : "✓ Sold Out"}
              </span>
            </div>
          )}
        </div>

        {/* Content area */}
        <div style={{ padding: "14px 16px 16px" }}>
          {/* Row 1 — creator + type */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 5,
            }}
          >
            <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>
              @{release.creatorName}
            </span>
            <span
              style={{
                fontSize: 10,
                color: "#6b7280",
                background: "rgba(0,0,0,0.05)",
                borderRadius: 6,
                padding: "2px 7px",
                fontWeight: 600,
              }}
            >
              {hasClip ? "🎬 Preview Clip" : "📷 9 + 🎬 1"}
            </span>
          </div>

          {/* Row 2 — title */}
          <p
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#111",
              margin: "0 0 4px",
              lineHeight: 1.25,
            }}
          >
            {release.title}
          </p>

          {/* Row 3 — caption */}
          {release.caption && (
            <p
              style={{
                fontSize: 12,
                color: "#6b7280",
                margin: "0 0 8px",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                lineHeight: 1.45,
              }}
            >
              {release.caption}
            </p>
          )}

          {/* Trending signal */}
          {isTrending && !isBurned && (
            <div
              style={{
                marginBottom: 6,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#d97706",
                  letterSpacing: "0.01em",
                }}
              >
                🔥 trending
              </span>
            </div>
          )}

          {/* Row 4 — Price (most prominent) */}
          <div style={{ marginBottom: 8 }}>
            {/* Main price line */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 6,
                position: "relative",
              }}
            >
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#111",
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.5px",
                  lineHeight: 1,
                  transition: "color 0.3s ease",
                }}
              >
                ${currentPrice.toFixed(2)}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "#9ca3af",
                  fontWeight: 400,
                  marginBottom: 1,
                }}
              >
                per pack
              </span>
              {/* Early price label */}
              {isEarlyMint && !isBurned && (
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 10,
                    fontWeight: 600,
                    color: accentSolid,
                    background: "rgba(0,0,0,0.06)",
                    borderRadius: 6,
                    padding: "2px 7px",
                    marginLeft: 2,
                    letterSpacing: "0.02em",
                    alignSelf: "center",
                  }}
                >
                  Early price
                </span>
              )}
              {/* Price delta flash */}
              {priceFlash !== null && (
                <span
                  style={{
                    position: "absolute",
                    right: 0,
                    top: -2,
                    fontSize: 11,
                    fontWeight: 600,
                    color: accentSolid,
                    fontVariantNumeric: "tabular-nums",
                    animation: "priceDeltaFade 2.5s ease forwards",
                    pointerEvents: "none",
                  }}
                >
                  +{priceFlash.toFixed(2)}
                </span>
              )}
            </div>
            {/* Sub-line: remaining • next price */}
            <div
              style={{
                marginTop: 3,
                display: "flex",
                alignItems: "center",
                gap: 0,
              }}
            >
              {isAlmostGone ? (
                <span
                  style={{
                    fontSize: 12,
                    color: "#d97706",
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  Almost gone · {release.packsAvailable} left
                </span>
              ) : (
                <span
                  style={{
                    fontSize: 12,
                    color:
                      release.packsAvailable < 50
                        ? accentSolid
                        : release.packsAvailable < 100
                          ? "#6b7280"
                          : "#9ca3af",
                    fontWeight: release.packsAvailable < 50 ? 600 : 400,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {release.packsAvailable} remaining
                </span>
              )}
              <span style={{ fontSize: 12, color: "#d1d5db", margin: "0 5px" }}>
                •
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "#9ca3af",
                  fontWeight: 400,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                next ${nextPackPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Row 4b — market signals */}
          <div style={{ marginBottom: 8 }}>
            {/* Percent collected row */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 5,
              }}
            >
              <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400 }}>
                {percentSold}% collected
              </span>
            </div>
            {/* Thin progress bar */}
            <div
              style={{
                height: 3,
                borderRadius: 99,
                background: "rgba(0,0,0,0.06)",
                overflow: "hidden",
                marginBottom: 6,
              }}
            >
              <div
                style={
                  {
                    height: "100%",
                    width: `${percentSold}%`,
                    background: isAlmostGone ? "#d97706" : accentSolid,
                    opacity: isAlmostGone ? 0.75 : 0.55,
                    borderRadius: 99,
                    transition: "width 0.8s ease",
                    animation: "packProgressIn 1s ease forwards",
                    "--progress-target": `${percentSold}%`,
                  } as React.CSSProperties
                }
              />
            </div>
            {/* Last mint activity */}
            {release.lastPurchaseAt && (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: accentSolid,
                    opacity: 0.7,
                    flexShrink: 0,
                    animation: "packActivityPulse 2s ease-in-out infinite",
                  }}
                />
                <span
                  style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400 }}
                >
                  last mint {lastMintAgo(release.lastPurchaseAt, liveNow)}
                </span>
              </div>
            )}
          </div>

          {/* Row 5 — countdown */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginBottom: 12,
            }}
          >
            {isEndingSoon && !isBurned ? (
              <Flame size={12} color="#f59e0b" />
            ) : (
              <Timer size={12} color={countdownColor} />
            )}
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: countdownColor,
              }}
            >
              {label}
            </span>
          </div>

          {/* Row 6 — Buy button */}
          <button
            type="button"
            data-ocid="releases.primary_button"
            disabled={isBurned || release.status !== "active"}
            onClick={(e) => {
              e.stopPropagation();
              console.log("[MintyBuyPack] tapped:", release.id, release.title);
              onTap(release);
            }}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 12,
              background:
                isBurned || release.status !== "active"
                  ? "#f3f4f6"
                  : accentGradient,
              color:
                isBurned || release.status !== "active" ? "#9ca3af" : "#fff",
              fontSize: 14,
              fontWeight: 700,
              border: "none",
              cursor:
                isBurned || release.status !== "active"
                  ? "not-allowed"
                  : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              boxShadow:
                !isBurned && release.status === "active"
                  ? `0 4px 14px ${accentGlow}`
                  : "none",
              transition: "opacity 0.15s",
            }}
          >
            <ShoppingBag size={14} />
            {isBurned
              ? "Burned"
              : release.status === "sold_out"
                ? "Sold Out"
                : "Buy Pack"}
          </button>
        </div>
      </button>

      {/* Video preview modal (per-card) */}
      {hasClip && (
        <VideoPreviewModal
          clipUrl={release.previewClipUrl!}
          open={videoModalOpen}
          onClose={() => setVideoModalOpen(false)}
        />
      )}
    </>
  );
}

// ─── Rate limit helpers ───────────────────────────────────────────────────────

const RL_KEY = "minty_purchase_limits";
const RL_WINDOW = 3600000; // 60 minutes
const RL_MAX = 5;

interface RLEntry {
  count: number;
  windowStart: number;
}

function getRLEntry(releaseId: string): RLEntry {
  try {
    const raw = localStorage.getItem(RL_KEY);
    const store: Record<string, RLEntry> = raw ? JSON.parse(raw) : {};
    const entry = store[releaseId];
    if (!entry) return { count: 0, windowStart: Date.now() };
    const elapsed = Date.now() - entry.windowStart;
    if (elapsed > RL_WINDOW) return { count: 0, windowStart: Date.now() };
    return entry;
  } catch {
    return { count: 0, windowStart: Date.now() };
  }
}

function setRLEntry(releaseId: string, entry: RLEntry) {
  try {
    const raw = localStorage.getItem(RL_KEY);
    const store: Record<string, RLEntry> = raw ? JSON.parse(raw) : {};
    store[releaseId] = entry;
    localStorage.setItem(RL_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

// ─── Slide-to-Buy component ───────────────────────────────────────────────────

function SlideToBuy({
  onConfirm,
  disabled,
  accentRgb,
  accentSolid,
  accentGradient,
  accentBorder,
  accentText,
}: {
  onConfirm: () => void;
  disabled: boolean;
  accentRgb: string;
  accentSolid: string;
  accentGradient: string;
  accentBorder: string;
  accentText: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [knobX, setKnobX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const dragStart = useRef<{ pointerX: number; startKnob: number } | null>(
    null,
  );

  const TRACK_HEIGHT = 56;
  const KNOB_SIZE = 44;
  const KNOB_PADDING = 6;

  const getMaxX = useCallback(() => {
    if (!trackRef.current) return 200;
    return trackRef.current.offsetWidth - KNOB_SIZE - KNOB_PADDING * 2;
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || isComplete) return;
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setIsDragging(true);
      dragStart.current = { pointerX: e.clientX, startKnob: knobX };
    },
    [disabled, isComplete, knobX],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !dragStart.current) return;
      const delta = e.clientX - dragStart.current.pointerX;
      const newX = Math.max(
        0,
        Math.min(dragStart.current.startKnob + delta, getMaxX()),
      );
      setKnobX(newX);

      // Trigger at 85%
      const maxX = getMaxX();
      if (newX >= maxX * 0.85) {
        setKnobX(maxX);
        setIsComplete(true);
        setIsDragging(false);
        dragStart.current = null;
        setTimeout(onConfirm, 300);
      }
    },
    [isDragging, getMaxX, onConfirm],
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    dragStart.current = null;
    // Snap back if not complete
    if (!isComplete) {
      setKnobX(0);
    }
  }, [isDragging, isComplete]);

  const maxX = typeof window !== "undefined" ? getMaxX() : 200;
  const progress = maxX > 0 ? knobX / maxX : 0;
  const labelOpacity = Math.max(0, 1 - progress * 2.5);

  return (
    <div
      ref={trackRef}
      style={{
        position: "relative",
        height: TRACK_HEIGHT,
        borderRadius: TRACK_HEIGHT / 2,
        background: disabled
          ? "#f3f4f6"
          : `linear-gradient(135deg, rgba(${accentRgb},0.15) 0%, rgba(${accentRgb},0.22) 100%)`,
        border: disabled
          ? "1.5px solid #e5e7eb"
          : `1.5px solid ${accentBorder}`,
        overflow: "hidden",
        userSelect: "none",
        cursor: disabled ? "not-allowed" : "default",
      }}
    >
      {/* Fill track */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: "100%",
          width: `${KNOB_PADDING + KNOB_SIZE / 2 + knobX}px`,
          background: accentGradient,
          borderRadius: TRACK_HEIGHT / 2,
          opacity: isComplete ? 1 : 0.6,
          transition: isDragging
            ? "none"
            : "width 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          pointerEvents: "none",
        }}
      />

      {/* Label */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          opacity: labelOpacity,
          transition: "opacity 0.1s",
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: disabled ? "#9ca3af" : accentText,
            letterSpacing: "0.01em",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {!isComplete && (
            <ChevronRight size={14} color={disabled ? "#9ca3af" : accentText} />
          )}
          {disabled ? "Unavailable" : "Slide to confirm purchase"}
        </span>
      </div>

      {/* Knob */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          position: "absolute",
          top: KNOB_PADDING,
          left: KNOB_PADDING + knobX,
          width: KNOB_SIZE,
          height: KNOB_SIZE,
          borderRadius: "50%",
          background: isComplete ? accentSolid : disabled ? "#d1d5db" : "#fff",
          boxShadow: disabled
            ? "none"
            : isComplete
              ? `0 0 0 3px rgba(${accentRgb},0.30), 0 4px 16px rgba(${accentRgb},0.45)`
              : "0 2px 10px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: disabled ? "not-allowed" : isDragging ? "grabbing" : "grab",
          transition: isDragging
            ? "none"
            : "left 0.35s cubic-bezier(0.34,1.56,0.64,1), background 0.2s, box-shadow 0.2s",
          touchAction: "none",
          zIndex: 2,
        }}
      >
        {isComplete ? (
          <Check size={20} color="#fff" strokeWidth={2.5} />
        ) : (
          <ChevronRight
            size={20}
            color={disabled ? "#9ca3af" : accentSolid}
            strokeWidth={2.5}
          />
        )}
      </div>
    </div>
  );
}

// ─── Buy Packs Modal ──────────────────────────────────────────────────────────

type PaymentMethod = "USDC" | "BTC" | "ETH" | "SOL";

const PAYMENT_METHODS: PaymentMethod[] = ["USDC", "BTC", "ETH", "SOL"];

function BuyPacksModal({
  release,
  onClose,
  accentRgb,
  accentSolid,
  accentBg,
  accentBorder,
  accentBorderStrong,
  accentText,
  accentGradient,
}: {
  release: MarketRelease;
  onClose: () => void;
  accentRgb: string;
  accentSolid: string;
  accentBg: string;
  accentBorder: string;
  accentBorderStrong: string;
  accentText: string;
  accentGradient: string;
}) {
  const { buyPacks } = useReleasesMarket();
  const { addSealedPacks } = useCollection();

  // Compute rate limit state on mount
  const rlEntry = getRLEntry(release.id);
  const boughtThisHour = rlEntry.count;
  const remaining = Math.max(0, RL_MAX - boughtThisHour);
  const msElapsed = Date.now() - rlEntry.windowStart;
  const msUntilReset = Math.max(0, RL_WINDOW - msElapsed);
  const minutesUntilReset = Math.ceil(msUntilReset / 60000);

  const maxQty = Math.min(remaining, release.packsAvailable, RL_MAX);

  const [qty, setQty] = useState<number>(() => Math.min(1, maxQty));
  const [payment, setPayment] = useState<PaymentMethod>("USDC");
  const [purchaseState, setPurchaseState] = useState<"idle" | "success">(
    "idle",
  );
  const [purchasedQty, setPurchasedQty] = useState(0);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const isBurned = release.expiresAt - Date.now() <= 0;
  const isDisabled =
    isBurned || release.status !== "active" || remaining === 0 || maxQty === 0;

  const packsSold = release.packCount - release.packsAvailable;
  const currentPrice = calcPackPrice(packsSold, release.packCount);
  const total = (qty * currentPrice).toFixed(2);

  function handleConfirmPurchase() {
    if (isDisabled) return;

    // Update rate limit
    const newCount = boughtThisHour + qty;
    setRLEntry(release.id, {
      count: newCount,
      windowStart: rlEntry.windowStart,
    });

    // Update releases market (decrement supply)
    buyPacks(release.id, qty);

    // Create sealed packs in Collection
    const totalPacks = release.packsAvailable;
    const videoCount = Math.max(1, Math.round(totalPacks * 0.1));
    const photoCount = totalPacks - videoCount;

    const newPacks: SealedPack[] = Array.from({ length: qty }, (_, i) => {
      const isVideo = Math.random() < 0.1;
      const assignedType: "photo" | "video" = isVideo ? "video" : "photo";
      const typeSupply = isVideo ? videoCount : photoCount;
      const collectibleNum = isVideo
        ? Math.ceil(Math.random() * videoCount)
        : Math.ceil(Math.random() * photoCount);
      const rarity = isVideo ? "Rare" : "Common";
      const packId = `pack_bought_${Date.now()}_${i}_${Math.random()
        .toString(36)
        .slice(2, 5)}`;

      return {
        id: packId,
        setName: release.setName,
        editionNumber: collectibleNum,
        totalSupply: totalPacks,
        collectibleType: assignedType,
        collectibleNumber: collectibleNum,
        typeSupply,
        createdAt: Date.now(),
        coverPhotoUrl: release.coverImageUrl,
        pendingNFT: {
          id: `nft_bought_${Date.now()}_${i}`,
          title: release.title,
          setName: release.setName,
          editionNumber: collectibleNum,
          totalSupply: assignedType === "video" ? videoCount : photoCount,
          mediaType: assignedType,
          imageUrl: release.coverImageUrl,
          rarity,
          mintDate: new Date().toISOString(),
          creator: release.creatorName,
          owners: ["you"],
          views: 0,
          isLeader: false,
          hasOwnershipHistory: false,
          addedAt: Date.now(),
        },
      };
    });

    addSealedPacks(newPacks);
    setPurchasedQty(qty);
    setPurchaseState("success");

    // Auto-close after 2.5 seconds
    setTimeout(() => {
      onClose();
    }, 2500);
  }

  return (
    <>
      <style>{`
        @keyframes modalBdIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes successBounce {
          0%   { transform: scale(0.75); opacity: 0; }
          60%  { transform: scale(1.12); opacity: 1; }
          80%  { transform: scale(0.96); }
          100% { transform: scale(1); }
        }
        @keyframes glowPulse {
          0%   { box-shadow: 0 0 0 0 rgba(var(--cycle-accent-rgb),0.55), 0 0 0 6px rgba(var(--cycle-accent-rgb),0.22); }
          50%  { box-shadow: 0 0 0 10px rgba(var(--cycle-accent-rgb),0.18), 0 0 0 20px rgba(var(--cycle-accent-rgb),0.08); }
          100% { box-shadow: 0 0 0 0 rgba(var(--cycle-accent-rgb),0.55), 0 0 0 6px rgba(var(--cycle-accent-rgb),0.22); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        data-ocid="releases.modal"
        role="button"
        tabIndex={0}
        aria-label="Close"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape" || e.key === "Enter") onClose();
        }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 400,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          animation: "modalBdIn 0.2s ease",
        }}
      />

      {/* Modal panel */}
      <div
        data-ocid="releases.buy_packs_modal"
        aria-modal="true"
        aria-label={`Buy packs for ${release.title}`}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 401,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            background: "var(--echo-surface, #FCFCFC)",
            borderRadius: 24,
            width: "100%",
            maxWidth: 420,
            maxHeight: "88dvh",
            overflowY: "auto",
            boxShadow: `0 0 0 1px ${accentBorder}, 0 24px 60px rgba(0,0,0,0.22)`,
            animation: "modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
            pointerEvents: "auto",
            position: "relative",
          }}
        >
          {/* Close button */}
          <button
            type="button"
            data-ocid="releases.close_button"
            onClick={onClose}
            aria-label="Close"
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              background: "rgba(255,255,255,0.92)",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
              boxShadow: "0 2px 8px rgba(0,0,0,0.14)",
            }}
          >
            <X size={16} color="#374151" />
          </button>

          {/* Cover media */}
          <div
            style={{
              position: "relative",
              aspectRatio: "4/5",
              overflow: "hidden",
              background: "#000",
              borderRadius: "24px 24px 0 0",
            }}
          >
            {release.previewClipUrl ? (
              <video
                src={release.previewClipUrl}
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <img
                src={release.coverImageUrl}
                alt={release.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            )}
            {/* Gradient overlay with title */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.62) 100%)",
                pointerEvents: "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: "18px 18px 16px",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.70)",
                  margin: "0 0 4px",
                  fontWeight: 500,
                }}
              >
                @{release.creatorName}
              </p>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#fff",
                  margin: 0,
                  lineHeight: 1.2,
                  textShadow: "0 1px 6px rgba(0,0,0,0.35)",
                }}
              >
                {release.title}
              </h2>
            </div>
          </div>

          {/* White content area */}
          {purchaseState === "success" ? (
            /* Success state */
            <div
              data-ocid="releases.success_state"
              style={{
                padding: "36px 24px 40px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                textAlign: "center",
                animation: "fadeInUp 0.35s ease",
              }}
            >
              {/* Animated checkmark */}
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: accentGradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation:
                    "successBounce 0.55s cubic-bezier(0.34,1.56,0.64,1), glowPulse 1.8s ease-in-out infinite",
                  boxShadow: `0 0 0 6px rgba(${accentRgb},0.22), 0 8px 28px rgba(${accentRgb},0.40)`,
                }}
              >
                <Check size={32} color="#fff" strokeWidth={2.5} />
              </div>

              <div>
                <p
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#111",
                    margin: "0 0 6px",
                  }}
                >
                  Packs added to your Collection
                </p>
                <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                  {purchasedQty} pack{purchasedQty > 1 ? "s" : ""} from{" "}
                  <span style={{ color: accentSolid, fontWeight: 600 }}>
                    {release.setName}
                  </span>
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  marginTop: 4,
                  background: accentBg,
                  borderRadius: 12,
                  padding: "10px 16px",
                  border: `1px solid ${accentBorder}`,
                }}
              >
                <Package2 size={14} color={accentSolid} />
                <span
                  style={{ fontSize: 12, color: accentText, fontWeight: 600 }}
                >
                  Open your packs in the Collection tab
                </span>
              </div>
            </div>
          ) : (
            /* Purchase form */
            <div style={{ padding: "20px 20px 28px" }}>
              {/* Header */}
              <div style={{ marginBottom: 16 }}>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#111",
                    margin: "0 0 6px",
                  }}
                >
                  Buy Packs
                </h3>
                <p
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    margin: 0,
                    lineHeight: 1.55,
                  }}
                >
                  Each pack contains 1 collectible from this Mint Moment.
                  Collectibles include:{" "}
                  <span style={{ color: "#374151", fontWeight: 500 }}>
                    9 photos (Common) · 1 video (Rare)
                  </span>
                </p>
              </div>

              {/* Divider */}
              <div
                style={{
                  height: 1,
                  background: "rgba(0,0,0,0.06)",
                  marginBottom: 16,
                }}
              />

              {/* Quantity section */}
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#374151",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    How many packs?
                  </span>
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>
                    {boughtThisHour === 0
                      ? "Limit: 5 packs per hour per set"
                      : remaining === 0
                        ? `Come back in ${minutesUntilReset}m`
                        : `You can buy ${remaining} more pack${
                            remaining !== 1 ? "s" : ""
                          } in this hour`}
                  </span>
                </div>

                {/* Qty pills */}
                <div style={{ display: "flex", gap: 8 }}>
                  {[1, 2, 3, 4, 5].map((n) => {
                    const isSelected = qty === n;
                    const isOver = n > maxQty;
                    return (
                      <button
                        key={n}
                        type="button"
                        data-ocid="releases.toggle"
                        disabled={isOver}
                        onClick={() => !isOver && setQty(n)}
                        style={{
                          flex: 1,
                          padding: "10px 0",
                          borderRadius: 12,
                          border: isSelected
                            ? `2px solid ${accentBorderStrong}`
                            : "1.5px solid rgba(0,0,0,0.09)",
                          background: isSelected
                            ? accentBg
                            : isOver
                              ? "#f9fafb"
                              : "#fff",
                          color: isSelected
                            ? accentText
                            : isOver
                              ? "#d1d5db"
                              : "#374151",
                          fontSize: 15,
                          fontWeight: isSelected ? 800 : 500,
                          cursor: isOver ? "not-allowed" : "pointer",
                          transition: "all 0.12s",
                        }}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment section */}
              <div style={{ marginBottom: 16 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#374151",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Pay with
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = payment === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        data-ocid="releases.toggle"
                        onClick={() => setPayment(method)}
                        style={{
                          flex: 1,
                          padding: "10px 0",
                          borderRadius: 12,
                          border: isSelected
                            ? `2px solid ${accentBorderStrong}`
                            : "1.5px solid rgba(0,0,0,0.09)",
                          background: isSelected ? accentBg : "#fff",
                          color: isSelected ? accentText : "#374151",
                          fontSize: 12,
                          fontWeight: isSelected ? 700 : 500,
                          cursor: "pointer",
                          transition: "all 0.12s",
                        }}
                      >
                        {method}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price summary */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  padding: "14px 16px",
                  border: "1.5px solid rgba(0,0,0,0.06)",
                  marginBottom: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 13, color: "#6b7280" }}>
                  {qty} pack{qty > 1 ? "s" : ""} × ${currentPrice.toFixed(2)}
                </span>
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#111",
                    letterSpacing: "-0.02em",
                  }}
                >
                  ${total}
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#9ca3af",
                      marginLeft: 4,
                    }}
                  >
                    {payment}
                  </span>
                </span>
              </div>

              {/* Bonding curve note */}
              <p
                style={{
                  fontSize: 11,
                  color: "#9ca3af",
                  textAlign: "center",
                  marginBottom: 12,
                  marginTop: -4,
                }}
              >
                Price updates with each purchase
              </p>

              {/* Rate limit warning when 0 remaining */}
              {remaining === 0 && (
                <div
                  style={{
                    background: "rgba(245,158,11,0.08)",
                    border: "1px solid rgba(245,158,11,0.22)",
                    borderRadius: 12,
                    padding: "12px 14px",
                    marginBottom: 14,
                    fontSize: 12,
                    color: "#92400e",
                    textAlign: "center",
                    fontWeight: 500,
                  }}
                >
                  ⏱ Limit reached. Come back in {minutesUntilReset} minute
                  {minutesUntilReset !== 1 ? "s" : ""} to buy more packs.
                </div>
              )}

              {/* Slide to buy */}
              <SlideToBuy
                onConfirm={handleConfirmPurchase}
                disabled={isDisabled}
                accentRgb={accentRgb}
                accentSolid={accentSolid}
                accentGradient={accentGradient}
                accentBorder={accentBorder}
                accentText={accentText}
              />

              {/* Subtle burn notice */}
              <p
                style={{
                  fontSize: 11,
                  color: "#9ca3af",
                  textAlign: "center",
                  margin: "12px 0 0",
                  lineHeight: 1.5,
                }}
              >
                Unsold packs burn after 24 hours. Purchases are final.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        marginBottom: 14,
        marginTop: 4,
      }}
    >
      {icon}
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#111",
          letterSpacing: "0.01em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 11,
          color: "#9ca3af",
          background: "rgba(0,0,0,0.05)",
          borderRadius: 20,
          padding: "1px 7px",
          fontWeight: 600,
        }}
      >
        {count}
      </span>
    </div>
  );
}

// ─── Trending Hashtags Section ───────────────────────────────────────────────

function TrendingHashtagsSection({
  hashtags,
  accentRgb,
}: {
  hashtags: TrendingHashtag[];
  accentRgb: string;
}) {
  if (hashtags.length === 0) return null;

  // Secondary, lightweight styling — intentionally softer than filter pills
  const [r, g, b] = accentRgb.split(",").map(Number);
  const tagBg = `rgba(${accentRgb},0.06)`;
  const tagBorder = `rgba(${accentRgb},0.13)`;
  // Muted text: darken the accent toward 45% brightness
  const tagText = `rgba(${Math.round(r * 0.5)},${Math.round(g * 0.5)},${Math.round(b * 0.5)},0.85)`;

  return (
    <div style={{ marginBottom: 2 }}>
      <style>{".hashtag-scroll::-webkit-scrollbar { display: none }"}</style>
      <div
        className="hashtag-scroll"
        style={{
          display: "flex",
          flexWrap: "nowrap",
          gap: 6,
          overflowX: "auto",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
          paddingBottom: 2,
        }}
      >
        {hashtags.map(({ tag, hot }) => (
          <span
            key={tag}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              padding: "4px 9px",
              height: 28,
              boxSizing: "border-box",
              borderRadius: 20,
              fontSize: 11.5,
              fontWeight: 500,
              letterSpacing: "0.01em",
              cursor: "default",
              flexShrink: 0,
              whiteSpace: "nowrap",
              background: tagBg,
              border: `1px solid ${tagBorder}`,
              color: tagText,
            }}
          >
            <span style={{ opacity: 0.55, fontSize: 10 }}>#</span>
            {tag.replace(/^#/, "")}
            {hot ? (
              <span style={{ fontSize: 10, marginLeft: 2 }}>🔥</span>
            ) : null}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Auction Countdown helper ────────────────────────────────────────────────

function useAuctionCountdown(endsAt: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const msLeft = endsAt - now;
  if (msLeft <= 0) return "Auction ended";
  const totalSec = Math.floor(msLeft / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s left`;
  if (m > 0) return `${m}m ${s}s left`;
  return `${s}s left`;
}

// ─── Slide To Confirm (auction) ───────────────────────────────────────────────

function SlideToConfirm({
  onConfirm,
  disabled,
  accentRgb,
  accentSolid,
  accentGradient,
  accentBorder,
  accentText,
}: {
  onConfirm: () => void;
  disabled: boolean;
  accentRgb: string;
  accentSolid: string;
  accentGradient: string;
  accentBorder: string;
  accentText: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [knobX, setKnobX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const dragStart = useRef<{ pointerX: number; startKnob: number } | null>(
    null,
  );

  const TRACK_HEIGHT = 56;
  const KNOB_SIZE = 44;
  const KNOB_PADDING = 6;

  const getMaxX = useCallback(() => {
    if (!trackRef.current) return 200;
    return trackRef.current.offsetWidth - KNOB_SIZE - KNOB_PADDING * 2;
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || isComplete) return;
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setIsDragging(true);
      dragStart.current = { pointerX: e.clientX, startKnob: knobX };
    },
    [disabled, isComplete, knobX],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !dragStart.current) return;
      const delta = e.clientX - dragStart.current.pointerX;
      const newX = Math.max(
        0,
        Math.min(dragStart.current.startKnob + delta, getMaxX()),
      );
      setKnobX(newX);
      const maxX = getMaxX();
      if (newX >= maxX * 0.85) {
        setKnobX(maxX);
        setIsComplete(true);
        setIsDragging(false);
        dragStart.current = null;
        setTimeout(onConfirm, 300);
      }
    },
    [isDragging, getMaxX, onConfirm],
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    dragStart.current = null;
    if (!isComplete) setKnobX(0);
  }, [isDragging, isComplete]);

  const maxX = typeof window !== "undefined" ? getMaxX() : 200;
  const progress = maxX > 0 ? knobX / maxX : 0;
  const labelOpacity = Math.max(0, 1 - progress * 2.5);

  return (
    <div
      ref={trackRef}
      style={{
        position: "relative",
        height: TRACK_HEIGHT,
        borderRadius: TRACK_HEIGHT / 2,
        background: disabled
          ? "#f3f4f6"
          : `linear-gradient(135deg, rgba(${accentRgb},0.15) 0%, rgba(${accentRgb},0.22) 100%)`,
        border: disabled
          ? "1.5px solid #e5e7eb"
          : `1.5px solid ${accentBorder}`,
        overflow: "hidden",
        userSelect: "none",
        cursor: disabled ? "not-allowed" : "default",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: "100%",
          width: `${KNOB_PADDING + KNOB_SIZE / 2 + knobX}px`,
          background: accentGradient,
          borderRadius: TRACK_HEIGHT / 2,
          opacity: isComplete ? 1 : 0.6,
          transition: isDragging
            ? "none"
            : "width 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          opacity: labelOpacity,
          transition: "opacity 0.1s",
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: disabled ? "#9ca3af" : accentText,
            letterSpacing: "0.01em",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {!isComplete && (
            <ChevronRight size={14} color={disabled ? "#9ca3af" : accentText} />
          )}
          {disabled ? "Unavailable" : "Slide to confirm"}
        </span>
      </div>
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          position: "absolute",
          top: KNOB_PADDING,
          left: KNOB_PADDING + knobX,
          width: KNOB_SIZE,
          height: KNOB_SIZE,
          borderRadius: "50%",
          background: isComplete ? accentSolid : disabled ? "#d1d5db" : "#fff",
          boxShadow: disabled
            ? "none"
            : isComplete
              ? `0 0 0 3px rgba(${accentRgb},0.30), 0 4px 16px rgba(${accentRgb},0.45)`
              : "0 2px 10px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: disabled ? "not-allowed" : isDragging ? "grabbing" : "grab",
          transition: isDragging
            ? "none"
            : "left 0.35s cubic-bezier(0.34,1.56,0.64,1), background 0.2s, box-shadow 0.2s",
          touchAction: "none",
          zIndex: 2,
        }}
      >
        {isComplete ? (
          <Check size={20} color="#fff" strokeWidth={2.5} />
        ) : (
          <ChevronRight
            size={20}
            color={disabled ? "#9ca3af" : accentSolid}
            strokeWidth={2.5}
          />
        )}
      </div>
    </div>
  );
}

// ─── Place Bid Modal ──────────────────────────────────────────────────────────

function PlaceBidModal({
  listing,
  onClose,
  accentRgb,
  accentSolid,
  accentBg,
  accentBorder,
  accentText,
  accentGradient,
}: {
  listing: AuctionListing;
  onClose: () => void;
  accentRgb: string;
  accentSolid: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  accentGradient: string;
}) {
  const { placeBid } = useAuctions();
  const minBid = listing.highestBid > 0 ? listing.highestBid + 1 : 1;
  const [bidAmount, setBidAmount] = useState(String(minBid));
  const [bidState, setBidState] = useState<"idle" | "success">("idle");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const amountVal = Number.parseFloat(bidAmount);
  const isValidBid = !Number.isNaN(amountVal) && amountVal >= minBid;

  function handleConfirm() {
    if (!isValidBid) return;
    placeBid(listing.id, amountVal);
    setBidState("success");
    setTimeout(() => onClose(), 2000);
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label="Close"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape" || e.key === "Enter") onClose();
        }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 450,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      />
      <div
        data-ocid="releases.bid_modal"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 451,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            background: "#FCFCFC",
            borderRadius: 24,
            width: "100%",
            maxWidth: 400,
            maxHeight: "88dvh",
            overflowY: "auto",
            boxShadow: `0 0 0 1px ${accentBorder}, 0 24px 60px rgba(0,0,0,0.22)`,
            animation: "modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
            pointerEvents: "auto",
            position: "relative",
          }}
        >
          <button
            type="button"
            data-ocid="releases.close_button"
            onClick={onClose}
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              background: "rgba(255,255,255,0.92)",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
              boxShadow: "0 2px 8px rgba(0,0,0,0.14)",
            }}
          >
            <X size={16} color="#374151" />
          </button>

          {/* NFT image header */}
          <div
            style={{
              position: "relative",
              aspectRatio: "4/5",
              overflow: "hidden",
              background: "#000",
              borderRadius: "24px 24px 0 0",
            }}
          >
            <img
              src={listing.nftImageUrl}
              alt={listing.nftTitle}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.62) 100%)",
                pointerEvents: "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: "18px 18px 16px",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.70)",
                  margin: "0 0 4px",
                  fontWeight: 500,
                }}
              >
                {listing.nftSetName}
              </p>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#fff",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {listing.nftTitle}
              </h2>
            </div>
          </div>

          <div style={{ padding: "20px 20px 28px" }}>
            {bidState === "success" ? (
              <div
                data-ocid="releases.success_state"
                style={{
                  textAlign: "center",
                  padding: "24px 0",
                  animation: "fadeInUp 0.35s ease",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: accentGradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    boxShadow: `0 0 0 6px rgba(${accentRgb},0.22)`,
                  }}
                >
                  <Check size={28} color="#fff" strokeWidth={2.5} />
                </div>
                <p
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#111",
                    margin: "0 0 6px",
                  }}
                >
                  Bid placed!
                </p>
                <p style={{ fontSize: 13, color: "#6b7280" }}>
                  ${amountVal.toFixed(2)} bid on {listing.nftTitle}
                </p>
              </div>
            ) : (
              <>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#111",
                    margin: "0 0 4px",
                  }}
                >
                  Place a Bid
                </h3>
                <p
                  style={{ fontSize: 12, color: "#6b7280", margin: "0 0 18px" }}
                >
                  {listing.highestBid > 0
                    ? `Current highest bid: $${listing.highestBid.toFixed(2)}`
                    : "No bids yet — be the first!"}
                </p>

                <div
                  style={{
                    background: accentBg,
                    border: `1px solid ${accentBorder}`,
                    borderRadius: 12,
                    padding: "10px 14px",
                    marginBottom: 16,
                    fontSize: 12,
                    color: accentText,
                    fontWeight: 600,
                  }}
                >
                  Minimum bid: ${minBid.toFixed(2)}
                </div>

                <label
                  htmlFor="bid-amount-input"
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#374151",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Your Bid (USD)
                </label>
                <div style={{ position: "relative", marginBottom: 20 }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#374151",
                    }}
                  >
                    $
                  </span>
                  <input
                    id="bid-amount-input"
                    data-ocid="releases.input"
                    type="number"
                    min={minBid}
                    step="0.01"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    style={{
                      width: "100%",
                      height: 52,
                      borderRadius: 12,
                      border: `1.5px solid ${isValidBid ? accentBorder : "rgba(0,0,0,0.12)"}`,
                      paddingLeft: 28,
                      paddingRight: 14,
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#111",
                      background: "#fff",
                      outline: "none",
                      boxSizing: "border-box",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  />
                </div>

                <SlideToConfirm
                  onConfirm={handleConfirm}
                  disabled={!isValidBid}
                  accentRgb={accentRgb}
                  accentSolid={accentSolid}
                  accentGradient={accentGradient}
                  accentBorder={accentBorder}
                  accentText={accentText}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Auction Card ─────────────────────────────────────────────────────────────

function AuctionCard({
  listing,
  accentGradient,
  accentGlow,
  accentSolid,
  accentRgb,
  accentBg,
  accentBorder,
  accentText,
}: {
  listing: AuctionListing;
  accentGradient: string;
  accentGlow: string;
  accentSolid: string;
  accentRgb: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
}) {
  const [showBidModal, setShowBidModal] = useState(false);
  const countdown = useAuctionCountdown(listing.endsAt);
  const isEnded = countdown === "Auction ended";

  return (
    <>
      <div
        data-ocid="releases.item.1"
        style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 2px 14px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)",
          border: "1.5px solid rgba(0,0,0,0.05)",
          overflow: "hidden",
          opacity: isEnded ? 0.55 : 1,
        }}
      >
        {/* Cover image */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "4/5",
            overflow: "hidden",
          }}
        >
          <img
            src={listing.nftImageUrl}
            alt={listing.nftTitle}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          {listing.mediaType === "video" && (
            <div
              style={{
                position: "absolute",
                bottom: 8,
                right: 8,
                background: "rgba(0,0,0,0.50)",
                backdropFilter: "blur(4px)",
                borderRadius: 20,
                padding: "3px 8px",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.85)",
                  fontWeight: 600,
                }}
              >
                ▷ Video
              </span>
            </div>
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.28) 100%)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Content */}
        <div style={{ padding: "14px 16px 16px" }}>
          {/* Row 1: creator + rarity */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 5,
            }}
          >
            <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>
              @{listing.creatorName}
            </span>
            <span
              style={{
                fontSize: 10,
                color: listing.nftRarity === "Rare" ? accentSolid : "#9ca3af",
                background:
                  listing.nftRarity === "Rare" ? accentBg : "rgba(0,0,0,0.05)",
                border:
                  listing.nftRarity === "Rare"
                    ? `1px solid ${accentBorder}`
                    : "1px solid rgba(0,0,0,0.06)",
                borderRadius: 6,
                padding: "2px 7px",
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              {listing.nftRarity === "Rare" ? "RARE" : "COMMON"}
            </span>
          </div>

          {/* Row 2: title */}
          <p
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#111",
              margin: "0 0 10px",
              lineHeight: 1.25,
            }}
          >
            {listing.nftTitle}
          </p>

          {/* Row 3: highest bid */}
          <div style={{ marginBottom: 6 }}>
            <div
              style={{
                fontSize: 11,
                color: "#9ca3af",
                fontWeight: 500,
                marginBottom: 2,
              }}
            >
              Highest bid
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: listing.highestBid > 0 ? "#111" : "#9ca3af",
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.5px",
                  lineHeight: 1,
                }}
              >
                {listing.highestBid > 0
                  ? `$${listing.highestBid.toFixed(2)}`
                  : "No bids yet"}
              </span>
            </div>
          </div>

          {/* Row 4: bids count + time */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
              {listing.bids.length} bid{listing.bids.length !== 1 ? "s" : ""}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Timer size={12} color={isEnded ? "#9ca3af" : accentSolid} />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: isEnded ? "#9ca3af" : accentText,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {countdown}
              </span>
            </div>
          </div>

          {/* Row 5: Place Bid button */}
          <button
            type="button"
            data-ocid="releases.primary_button"
            disabled={isEnded}
            onClick={() => setShowBidModal(true)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 12,
              background: isEnded ? "#f3f4f6" : accentGradient,
              color: isEnded ? "#9ca3af" : "#fff",
              fontSize: 14,
              fontWeight: 700,
              border: "none",
              cursor: isEnded ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              boxShadow: !isEnded ? `0 4px 14px ${accentGlow}` : "none",
              transition: "opacity 0.15s",
            }}
          >
            <Gavel size={14} />
            {isEnded ? "Auction Ended" : "Place Bid"}
          </button>
        </div>
      </div>

      {showBidModal && (
        <PlaceBidModal
          listing={listing}
          onClose={() => setShowBidModal(false)}
          accentRgb={accentRgb}
          accentSolid={accentSolid}
          accentBg={accentBg}
          accentBorder={accentBorder}
          accentText={accentText}
          accentGradient={accentGradient}
        />
      )}
    </>
  );
}

// ─── Filter pills ─────────────────────────────────────────────────────────────

type FilterMode = "live" | "ending" | "new";

const FILTER_LABELS: { key: FilterMode; label: string }[] = [
  { key: "live", label: "Newest Moments" },
  { key: "ending", label: "Hot Packs" },
  { key: "new", label: "Newly Released" },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ReleasesPage() {
  const { theme } = useTheme();
  const { releases, burnExpired } = useReleasesMarket();
  const { explicitModeOn, setExplicitModeOn } = useUserSettings();
  const [now, setNow] = useState(Date.now());
  const [selectedRelease, setSelectedRelease] = useState<MarketRelease | null>(
    null,
  );
  const [filterMode, setFilterMode] = useState<FilterMode>("live");
  const [viewMode, setViewMode] = useState<"packs" | "market">("packs");
  const trendingHashtags = getTrendingHashtags("ALL_TIME");
  const { listings: auctionListings } = useAuctions();

  const isLight = theme === "light";
  const isDark = !isLight;

  // ─── Cycle theme accent derivations ─────────────────────────────────────────
  const { activeStyle: activeCycle } = usePackStyle();
  const aR = activeCycle.accentR;
  const aG = activeCycle.accentG;
  const aB = activeCycle.accentB;
  const accentRgb = `${aR},${aG},${aB}`;
  const accentSolid = `rgb(${accentRgb})`;
  const accentBg = `rgba(${accentRgb},0.09)`;
  const accentBgStrong = `rgba(${accentRgb},0.14)`;
  const accentBorder = `rgba(${accentRgb},0.28)`;
  const accentBorderStrong = `rgba(${accentRgb},0.55)`;
  const accentText = `rgba(${Math.round(aR * 0.55)},${Math.round(aG * 0.55)},${Math.round(aB * 0.55)},1)`;
  const accentGlow = `rgba(${accentRgb},0.28)`;
  const accentGradient = `linear-gradient(135deg, rgb(${accentRgb}) 0%, rgba(${Math.round(aR * 0.78)},${Math.round(aG * 0.78)},${Math.round(aB * 0.78)},1) 100%)`;
  // Suppress unused variable
  void accentBgStrong;

  // Burn expired releases every minute, update clock every second
  useEffect(() => {
    const burnInterval = setInterval(() => {
      burnExpired();
      setNow(Date.now());
    }, 60_000);
    const clockInterval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      clearInterval(burnInterval);
      clearInterval(clockInterval);
    };
  }, [burnExpired]);

  // Categorise releases — explicit filtering happens here at data level
  const visibleReleases = releases.filter((r) => explicitModeOn || !r.explicit);
  const activeReleases = visibleReleases.filter((r) => r.status === "active");
  const endingSoon = activeReleases.filter(
    (r) => r.expiresAt - now < 4 * 3600000,
  );
  const newlyReleased = activeReleases.filter(
    (r) => now - r.listedAt < 2 * 3600000,
  );
  const endingSoonIds = new Set(endingSoon.map((r) => r.id));
  const newlyReleasedIds = new Set(newlyReleased.map((r) => r.id));
  const liveReleases = activeReleases.filter(
    (r) => !endingSoonIds.has(r.id) && !newlyReleasedIds.has(r.id),
  );

  const bgColor = isLight ? "#F7F6F2" : "oklch(0.08 0.02 160)";

  function getFilteredReleases() {
    if (filterMode === "ending") return endingSoon;
    if (filterMode === "new") return newlyReleased;
    return liveReleases;
  }

  const filteredReleases = getFilteredReleases();
  const hasAnyActive = activeReleases.length > 0;

  return (
    <div
      data-ocid="releases.page"
      style={{
        minHeight: "100dvh",
        background: bgColor,
        paddingTop: 72,
        paddingBottom: 80,
      }}
    >
      {/* ── Packs | Market segmented toggle ────────────────────────────── */}
      <div
        style={{
          position: "sticky",
          top: 64,
          zIndex: 25,
          background: bgColor,
          paddingTop: 8,
          paddingBottom: 0,
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            background: "rgba(0,0,0,0.05)",
            borderRadius: 12,
            padding: 3,
            gap: 2,
          }}
        >
          {(["packs", "market"] as const).map((seg) => {
            const isActive = viewMode === seg;
            return (
              <button
                key={seg}
                type="button"
                data-ocid={`releases.${seg}_tab`}
                onClick={() => setViewMode(seg)}
                style={{
                  flex: 1,
                  padding: "9px 0",
                  borderRadius: 10,
                  border: "none",
                  background: isActive ? accentGradient : "transparent",
                  color: isActive ? "#fff" : "#6b7280",
                  fontSize: 14,
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  boxShadow: isActive ? `0 2px 10px ${accentGlow}` : "none",
                  transition: "all 0.18s ease",
                }}
              >
                {seg === "packs" ? (
                  <ShoppingBag size={14} />
                ) : (
                  <Gavel size={14} />
                )}
                {seg === "packs" ? "Packs" : "Market"}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Market view ─────────────────────────────────────────────────── */}
      {viewMode === "market" && (
        <div style={{ padding: "12px 16px 24px" }}>
          {auctionListings.filter((l) => l.status === "active").length === 0 ? (
            <div
              data-ocid="releases.empty_state"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "40vh",
                gap: 14,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 20,
                  background: accentBg,
                  border: `1.5px solid ${accentBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Gavel size={24} color={accentSolid} />
              </div>
              <div>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#111",
                    margin: "0 0 6px",
                  }}
                >
                  No active auctions
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "#9ca3af",
                    maxWidth: 260,
                    lineHeight: 1.5,
                  }}
                >
                  Send NFTs to auction from your Collection tab to list them
                  here.
                </p>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                paddingTop: 12,
              }}
            >
              {auctionListings
                .filter((l) => l.status === "active")
                .map((listing) => (
                  <AuctionCard
                    key={listing.id}
                    listing={listing}
                    accentGradient={accentGradient}
                    accentGlow={accentGlow}
                    accentSolid={accentSolid}
                    accentRgb={accentRgb}
                    accentBg={accentBg}
                    accentBorder={accentBorder}
                    accentText={accentText}
                  />
                ))}
            </div>
          )}
        </div>
      )}

      {/* ── Packs view (existing content) ───────────────────────────────── */}
      {viewMode === "packs" && (
        <>
          {/* Sticky header */}
          <div
            style={{
              position: "sticky",
              top: 72,
              zIndex: 20,
              background: isLight
                ? "rgba(247,246,242,0.96)"
                : "oklch(0.08 0.02 160 / 0.92)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderBottom: `1px solid ${
                isLight ? "rgba(0,0,0,0.06)" : "oklch(0.55 0.12 160 / 0.18)"
              }`,
              padding: "8px 16px 10px",
            }}
          >
            <TickerBar
              isDark={isDark}
              accentRgb={accentRgb}
              accentSolid={accentSolid}
            />

            {/* Helper text row with safe viewing toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                margin: "0 0 8px",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: "#9ca3af",
                  margin: 0,
                }}
              >
                Unsold released packs burn after 24 hours.
              </p>
              {/* Safe Viewing Toggle */}
              <button
                type="button"
                onClick={() => setExplicitModeOn(!explicitModeOn)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  background: explicitModeOn
                    ? "rgba(245,158,11,0.10)"
                    : accentBg,
                  border: explicitModeOn
                    ? "1.5px solid rgba(245,158,11,0.30)"
                    : `1.5px solid ${accentBorder}`,
                  borderRadius: "20px",
                  padding: "4px 10px",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: "26px",
                    height: "14px",
                    borderRadius: "7px",
                    background: explicitModeOn
                      ? "rgba(245,158,11,0.75)"
                      : `rgba(${accentRgb},0.75)`,
                    position: "relative",
                    transition: "background 0.2s",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "2px",
                      left: explicitModeOn ? "14px" : "2px",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: "#fff",
                      transition: "left 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    color: explicitModeOn ? "#92400e" : accentText,
                  }}
                >
                  {explicitModeOn ? "EXPLICIT ON" : "SAFE VIEW"}
                </span>
              </button>
            </div>

            {/* Filter pills */}
            <div
              style={{
                display: "flex",
                gap: 7,
                overflowX: "auto",
                scrollbarWidth: "none",
                paddingBottom: 2,
              }}
            >
              {FILTER_LABELS.map(({ key, label }) => {
                const isActive = filterMode === key;
                return (
                  <button
                    key={key}
                    type="button"
                    data-ocid="releases.tab"
                    onClick={() => setFilterMode(key)}
                    style={{
                      flexShrink: 0,
                      padding: "7px 14px",
                      borderRadius: 20,
                      border: isActive
                        ? `1.5px solid ${accentBorder}`
                        : `1.5px solid ${
                            isLight
                              ? "rgba(0,0,0,0.09)"
                              : "rgba(255,255,255,0.08)"
                          }`,
                      background: isActive
                        ? accentBg
                        : isLight
                          ? "rgba(255,255,255,0.7)"
                          : "rgba(255,255,255,0.05)",
                      color: isActive
                        ? accentSolid
                        : isLight
                          ? "#374151"
                          : "rgba(255,255,255,0.7)",
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 500,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {label}
                    {key === "ending" && endingSoon.length > 0 && (
                      <span
                        style={{
                          marginLeft: 5,
                          background: "#f59e0b",
                          color: "#fff",
                          fontSize: 9,
                          fontWeight: 700,
                          borderRadius: 20,
                          padding: "1px 5px",
                        }}
                      >
                        {endingSoon.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Trending Hashtags */}
            <div style={{ paddingTop: 6 }}>
              <TrendingHashtagsSection
                hashtags={trendingHashtags}
                accentRgb={accentRgb}
              />
            </div>
          </div>

          {/* Main content */}
          <div style={{ padding: "20px 16px" }}>
            {!hasAnyActive ? (
              /* Empty state */
              <div
                data-ocid="releases.empty_state"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "40vh",
                  gap: 14,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 20,
                    background: accentBg,
                    border: `1.5px solid ${accentBorder}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Sparkles size={24} color={accentSolid} />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: isLight ? "#111" : "#e8f5f0",
                      margin: "0 0 6px",
                    }}
                  >
                    No active releases right now
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#9ca3af",
                      maxWidth: 260,
                      lineHeight: 1.5,
                    }}
                  >
                    Release your sealed packs from the Collection tab to list
                    them here.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {/* Ending soon section */}
                {filterMode === "live" && endingSoon.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <SectionHeader
                      icon={<Flame size={14} color="#f59e0b" />}
                      label="Ending Soon"
                      count={endingSoon.length}
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 14,
                      }}
                    >
                      {endingSoon.map((r) => (
                        <ReleaseCard
                          key={r.id}
                          release={r}
                          now={now}
                          onTap={setSelectedRelease}
                          accentGradient={accentGradient}
                          accentGlow={accentGlow}
                          accentSolid={accentSolid}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Newly released section */}
                {filterMode === "live" && newlyReleased.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <SectionHeader
                      icon={<Sparkles size={14} color={accentSolid} />}
                      label="Newly Released"
                      count={newlyReleased.length}
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 14,
                      }}
                    >
                      {newlyReleased.map((r) => (
                        <ReleaseCard
                          key={r.id}
                          release={r}
                          now={now}
                          onTap={setSelectedRelease}
                          accentGradient={accentGradient}
                          accentGlow={accentGlow}
                          accentSolid={accentSolid}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Live releases section or filtered view */}
                {filterMode === "live" && liveReleases.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <SectionHeader
                      icon={<TrendingUp size={14} color="#6b7280" />}
                      label="Live Releases"
                      count={liveReleases.length}
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 14,
                      }}
                    >
                      {liveReleases.map((r) => (
                        <ReleaseCard
                          key={r.id}
                          release={r}
                          now={now}
                          onTap={setSelectedRelease}
                          accentGradient={accentGradient}
                          accentGlow={accentGlow}
                          accentSolid={accentSolid}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Filtered views (Ending Soon or Newly Released tab) */}
                {filterMode !== "live" && (
                  <div style={{ marginBottom: 24 }}>
                    {filteredReleases.length === 0 ? (
                      <div
                        data-ocid="releases.empty_state"
                        style={{
                          textAlign: "center",
                          padding: "40px 16px",
                          color: "#9ca3af",
                          fontSize: 13,
                        }}
                      >
                        No releases in this category right now.
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 14,
                        }}
                      >
                        {filteredReleases.map((r) => (
                          <ReleaseCard
                            key={r.id}
                            release={r}
                            now={now}
                            onTap={setSelectedRelease}
                            accentGradient={accentGradient}
                            accentGlow={accentGlow}
                            accentSolid={accentSolid}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Buy Packs Modal */}
      {selectedRelease && (
        <BuyPacksModal
          release={selectedRelease}
          onClose={() => setSelectedRelease(null)}
          accentRgb={accentRgb}
          accentSolid={accentSolid}
          accentBg={accentBg}
          accentBorder={accentBorder}
          accentBorderStrong={accentBorderStrong}
          accentText={accentText}
          accentGradient={accentGradient}
        />
      )}
    </div>
  );
}
