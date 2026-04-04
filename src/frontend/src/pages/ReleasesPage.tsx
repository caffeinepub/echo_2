import {
  Flame,
  Package2,
  ShoppingBag,
  Sparkles,
  Timer,
  TrendingUp,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../ThemeContext";
import { useCollection } from "../context/CollectionContext";
import type { SealedPack } from "../context/CollectionContext";
import type { MarketRelease } from "../context/ReleasesMarketContext";
import { useReleasesMarket } from "../context/ReleasesMarketContext";

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

function TickerBar({ isDark }: { isDark: boolean }) {
  const [paused, setPaused] = useState(false);
  const items = [...RECENT_TRANSACTIONS, ...RECENT_TRANSACTIONS];
  const mintColor = isDark ? "oklch(0.75 0.14 160)" : "#10b981";
  const badgeBg = isDark
    ? "oklch(0.70 0.18 160 / 0.20)"
    : "rgba(16,185,129,0.15)";
  const containerBg = isDark
    ? "oklch(0.70 0.18 160 / 0.08)"
    : "rgba(16,185,129,0.07)";
  const containerBorder = isDark
    ? "oklch(0.70 0.18 160 / 0.22)"
    : "rgba(16,185,129,0.18)";
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
          background: "#FAFAF8",
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
            data-ocid="releases.close_button"
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

        {/* Footer */}
        <div
          style={{
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: "#9ca3af",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
            {isMuted ? "Tap speaker to unmute" : "Sound on"}
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              fontSize: 12,
              color: "#6b7280",
              fontWeight: 600,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 8px",
            }}
          >
            Close
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
}: {
  release: MarketRelease;
  now: number;
  onTap: (r: MarketRelease) => void;
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
              "0 6px 24px rgba(16,185,129,0.18), 0 2px 8px rgba(0,0,0,0.07)";
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
                  background: isBurned ? "#374151" : "#10b981",
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
              {hasClip
                ? "🎬 Clip"
                : release.collectibleType === "photo"
                  ? "📷 Photo"
                  : "🎬 Video"}
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

          {/* Row 4 — packs + price */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 8,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: "#374151",
                fontWeight: 500,
              }}
            >
              <Package2 size={12} color="#9ca3af" />
              {release.packsAvailable} pack
              {release.packsAvailable !== 1 ? "s" : ""} available
            </span>
            <span style={{ fontSize: 11, color: "#d1d5db" }}>·</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>
              ${release.priceUsd.toFixed(2)}
              <span
                style={{
                  fontSize: 10,
                  color: "#9ca3af",
                  fontWeight: 400,
                  marginLeft: 2,
                }}
              >
                each
              </span>
            </span>
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
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 12,
              background:
                isBurned || release.status !== "active"
                  ? "#f3f4f6"
                  : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
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
                  ? "0 4px 14px rgba(16,185,129,0.28)"
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

// ─── Release Detail Sheet ─────────────────────────────────────────────────────

function ReleaseDetailSheet({
  release,
  now,
  onClose,
}: {
  release: MarketRelease;
  now: number;
  onClose: () => void;
}) {
  const { buyPack } = useReleasesMarket();
  const { addSealedPacks } = useCollection();
  const [buyState, setBuyState] = useState<"idle" | "success">("idle");
  const { isBurned, isEndingSoon, label } = useCountdown(
    release.expiresAt,
    now,
  );

  const countdownColor = isBurned
    ? "#9ca3af"
    : isEndingSoon
      ? "#f59e0b"
      : "#374151";

  function handleBuy() {
    buyPack(release.id);
    // Create a new sealed pack in Collection
    const newPack: SealedPack = {
      id: `pack_bought_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      setName: release.setName,
      editionNumber: 1,
      totalSupply: release.packsAvailable,
      collectibleType: release.collectibleType,
      createdAt: Date.now(),
      pendingNFT: {
        id: `nft_bought_${Date.now()}`,
        title: release.title,
        setName: release.setName,
        editionNumber: 1,
        totalSupply: release.packsAvailable,
        mediaType: release.collectibleType,
        imageUrl: release.coverImageUrl,
        rarity: "Common",
        mintDate: new Date().toISOString(),
        creator: release.creatorName,
        owners: ["you"],
        views: 0,
        isLeader: false,
        hasOwnershipHistory: false,
        addedAt: Date.now(),
      },
    };
    addSealedPacks([newPack]);
    setBuyState("success");
    setTimeout(() => {
      onClose();
      setBuyState("idle");
    }, 1500);
  }

  return (
    <div
      data-ocid="releases.modal"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      {/* Backdrop */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Close"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape" || e.key === "Enter") onClose();
        }}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.50)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          animation: "sheetBdIn 0.2s ease",
        }}
      />
      <div
        data-ocid="releases.sheet"
        style={{
          position: "relative",
          background: "#FAFAF8",
          borderRadius: "28px 28px 0 0",
          width: "100%",
          maxWidth: 520,
          maxHeight: "92dvh",
          overflowY: "auto",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
          animation: "sheetUp 0.28s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <style>{`
          @keyframes sheetBdIn { from{opacity:0} to{opacity:1} }
          @keyframes sheetUp {
            from{transform:translateY(60px);opacity:0}
            to{transform:translateY(0);opacity:1}
          }
        `}</style>

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
            background: "rgba(255,255,255,0.9)",
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
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.35) 100%)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Content */}
        <div style={{ padding: "20px 20px 36px" }}>
          {/* Creator + type */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: 12, color: "#9ca3af" }}>
              @{release.creatorName}
            </span>
            <span
              style={{
                fontSize: 11,
                color: "#6b7280",
                background: "rgba(0,0,0,0.05)",
                borderRadius: 6,
                padding: "2px 8px",
                fontWeight: 600,
              }}
            >
              {release.previewClipUrl
                ? "🎬 Clip"
                : release.collectibleType === "photo"
                  ? "📷 Photo"
                  : "🎬 Video"}
            </span>
          </div>

          {/* Title */}
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#111",
              margin: "0 0 6px",
              lineHeight: 1.2,
            }}
          >
            {release.title}
          </h2>

          {/* Caption */}
          {release.caption && (
            <p
              style={{
                fontSize: 13,
                color: "#6b7280",
                marginBottom: 14,
                lineHeight: 1.5,
              }}
            >
              {release.caption}
            </p>
          )}

          {/* Set name */}
          <p
            style={{
              fontSize: 11,
              color: "#10b981",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            {release.setName}
          </p>

          {/* Price + availability */}
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: "14px 16px",
              border: "1.5px solid rgba(0,0,0,0.06)",
              marginBottom: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 2px" }}>
                Price per pack
              </p>
              <p
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#111",
                  margin: 0,
                }}
              >
                ${release.priceUsd.toFixed(2)}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 2px" }}>
                Available
              </p>
              <p
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#111",
                  margin: 0,
                }}
              >
                {release.packsAvailable}
              </p>
            </div>
          </div>

          {/* Countdown */}
          <div
            style={{
              background: isEndingSoon
                ? "rgba(245,158,11,0.08)"
                : "rgba(0,0,0,0.03)",
              borderRadius: 12,
              padding: "12px 14px",
              border: `1px solid ${
                isEndingSoon ? "rgba(245,158,11,0.22)" : "rgba(0,0,0,0.07)"
              }`,
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {isEndingSoon && !isBurned ? (
              <Flame size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
            ) : (
              <Timer
                size={16}
                color={countdownColor}
                style={{ flexShrink: 0 }}
              />
            )}
            <div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: countdownColor,
                  margin: 0,
                }}
              >
                {label}
              </p>
              {!isBurned && (
                <p
                  style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}
                >
                  {isEndingSoon
                    ? "Ending very soon!"
                    : "Listing active — buy before it burns"}
                </p>
              )}
            </div>
          </div>

          {/* Burn warning */}
          <p
            style={{
              fontSize: 12,
              color: "#9ca3af",
              lineHeight: 1.55,
              marginBottom: 20,
            }}
          >
            Unsold packs are burned after 24 hours. They do not return to the
            seller's Collection.
          </p>

          {/* Buy button */}
          {buyState === "success" ? (
            <div
              data-ocid="releases.success_state"
              style={{
                background: "rgba(16,185,129,0.10)",
                border: "1.5px solid rgba(16,185,129,0.25)",
                borderRadius: 14,
                padding: "16px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#10b981",
                  margin: "0 0 4px",
                }}
              >
                ✓ Pack added to your Collection!
              </p>
              <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
                It's sealed — open it anytime from the Collection tab.
              </p>
            </div>
          ) : (
            <button
              type="button"
              data-ocid="releases.primary_button"
              disabled={isBurned || release.status !== "active"}
              onClick={handleBuy}
              style={{
                width: "100%",
                padding: "15px",
                borderRadius: 14,
                background:
                  isBurned || release.status !== "active"
                    ? "#f3f4f6"
                    : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color:
                  isBurned || release.status !== "active" ? "#9ca3af" : "#fff",
                fontSize: 16,
                fontWeight: 700,
                border: "none",
                cursor:
                  isBurned || release.status !== "active"
                    ? "not-allowed"
                    : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow:
                  !isBurned && release.status === "active"
                    ? "0 6px 20px rgba(16,185,129,0.35)"
                    : "none",
              }}
            >
              <ShoppingBag size={17} />
              {isBurned
                ? "Burned"
                : release.status === "sold_out"
                  ? "Sold Out"
                  : "Buy Pack"}
            </button>
          )}
        </div>
      </div>
    </div>
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

// ─── Filter pills ─────────────────────────────────────────────────────────────

type FilterMode = "live" | "ending" | "new";

const FILTER_LABELS: { key: FilterMode; label: string }[] = [
  { key: "live", label: "Live Releases" },
  { key: "ending", label: "Ending Soon" },
  { key: "new", label: "Newly Released" },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ReleasesPage() {
  const { theme } = useTheme();
  const { releases, burnExpired } = useReleasesMarket();
  const [now, setNow] = useState(Date.now());
  const [selectedRelease, setSelectedRelease] = useState<MarketRelease | null>(
    null,
  );
  const [filterMode, setFilterMode] = useState<FilterMode>("live");

  const isLight = theme === "light";
  const isDark = !isLight;

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

  // Categorise releases
  const activeReleases = releases.filter((r) => r.status === "active");
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
        <TickerBar isDark={isDark} />

        {/* Helper text */}
        <p
          style={{
            fontSize: 11,
            color: "#9ca3af",
            margin: "0 0 8px",
            textAlign: "center",
          }}
        >
          Unsold released packs burn after 24 hours.
        </p>

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
                    ? "1.5px solid rgba(16,185,129,0.35)"
                    : `1.5px solid ${
                        isLight ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.08)"
                      }`,
                  background: isActive
                    ? "rgba(16,185,129,0.10)"
                    : isLight
                      ? "rgba(255,255,255,0.7)"
                      : "rgba(255,255,255,0.05)",
                  color: isActive
                    ? "#10b981"
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
                background: "rgba(16,185,129,0.10)",
                border: "1.5px solid rgba(16,185,129,0.22)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={24} color="#10b981" />
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
                Release your sealed packs from the Collection tab to list them
                here.
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
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Newly released section */}
            {filterMode === "live" && newlyReleased.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <SectionHeader
                  icon={<Sparkles size={14} color="#10b981" />}
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
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Release Detail Sheet */}
      {selectedRelease && (
        <ReleaseDetailSheet
          release={selectedRelease}
          now={now}
          onClose={() => setSelectedRelease(null)}
        />
      )}
    </div>
  );
}
