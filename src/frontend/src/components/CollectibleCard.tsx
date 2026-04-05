import { MapPin, Play } from "lucide-react";
import { useState } from "react";
import type { CollectionNFT } from "../context/CollectionContext";

// ─── Constants ────────────────────────────────────────────────────────────────
const MINT_ACCENT = "var(--cycle-accent)";
const MINT_BORDER = "rgba(var(--cycle-accent-rgb) / 0.25)";

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function formatCapturedAt(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    const month = d.toLocaleString("en-US", { month: "short" });
    const day = d.getDate();
    const hour = d.getHours();
    const min = d.getMinutes().toString().padStart(2, "0");
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${month} ${day} · ${hour12}:${min} ${ampm}`;
  } catch {
    return isoStr;
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface CollectibleCardProps {
  nft: CollectionNFT;
  onViewMedia?: () => void;
  /** Optional index for data-ocid markers */
  ocidIndex?: number;
}

// ─── Pill ─────────────────────────────────────────────────────────────────────
function Pill({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "rgba(0,0,0,0.52)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderRadius: "999px",
        padding: "3px 7px",
        fontSize: "9px",
        color: "rgba(255,255,255,0.92)",
        fontWeight: 500,
        letterSpacing: "0.02em",
        display: "flex",
        alignItems: "center",
        gap: "3px",
        lineHeight: 1.3,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── CollectibleCard ──────────────────────────────────────────────────────────
export function CollectibleCard({
  nft,
  onViewMedia,
  ocidIndex = 1,
}: CollectibleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isRare = nft.rarity === "Rare" || nft.rarity === "Ultra Rare";
  const isVideo = nft.mediaType === "video";

  function handleCardTap(e: React.MouseEvent | React.KeyboardEvent) {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  }

  return (
    <button
      type="button"
      data-ocid={`collection.item.${ocidIndex}`}
      aria-label={`${nft.title} \u2014 ${nft.rarity}`}
      onClick={handleCardTap}
      style={{
        // Reset button styles
        padding: 0,
        background: "none",
        // Layout: hold the grid slot, never cause reflow
        position: "relative",
        aspectRatio: "4/5",
        borderRadius: "14px",
        overflow: "hidden",
        cursor: "pointer",
        // Borders & shadows — subtle inspect-mode expansion
        border: `1px solid ${
          isExpanded ? "rgba(var(--cycle-accent-rgb) / 0.45)" : MINT_BORDER
        }`,
        boxShadow: isExpanded
          ? "0 6px 24px rgba(0,0,0,0.28), 0 0 0 1px rgba(var(--cycle-accent-rgb) / 0.20)"
          : "0 2px 12px rgba(0,0,0,0.18)",
        // Subtle scale — inspect mode, not fullscreen takeover
        transform: isExpanded ? "scale(1.12)" : "scale(1)",
        transformOrigin: "center center",
        transition:
          "transform 280ms cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 280ms ease, border-color 180ms ease",
        zIndex: isExpanded ? 50 : 1,
        // Prevent bleed of scaled card outside parent
        isolation: "isolate",
        willChange: "transform",
        touchAction: "manipulation",
        userSelect: "none",
        // Block-level display so aspect-ratio works on button
        display: "block",
        width: "100%",
      }}
    >
      {/* ── Full-bleed media ─────────────────────────────────── */}
      {isVideo ? (
        /* Video: show static thumbnail + play icon */
        <>
          <img
            src={nft.imageUrl}
            alt={nft.title}
            draggable={false}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          {/* Play icon center overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              <Play
                size={10}
                style={{ color: "#fff", marginLeft: "1px" }}
                fill="#fff"
              />
            </div>
          </div>
        </>
      ) : (
        <img
          src={nft.imageUrl}
          alt={nft.title}
          draggable={false}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      )}

      {/* ── Gradient scrims for legibility ───────────────────── */}
      {/* Top scrim */}
      <div
        style={{
          position: "absolute",
          inset: "0 0 auto 0",
          height: "40%",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.48) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
      {/* Bottom scrim */}
      <div
        style={{
          position: "absolute",
          inset: "auto 0 0 0",
          height: "40%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Top-left: date or video indicator ────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 6,
          left: 6,
          display: "flex",
          alignItems: "center",
          gap: "3px",
          pointerEvents: "none",
        }}
      >
        {isVideo && (
          <Pill>
            <Play size={6} fill="currentColor" style={{ opacity: 0.9 }} />
            <span style={{ fontSize: "8px" }}>VIDEO</span>
          </Pill>
        )}
        {nft.capturedAt && !isVideo && (
          <Pill>
            <span style={{ fontSize: "8px" }}>
              {formatCapturedAt(nft.capturedAt)}
            </span>
          </Pill>
        )}
      </div>

      {/* ── Top-right: rarity ────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 6,
          right: 6,
          pointerEvents: "none",
        }}
      >
        <Pill
          style={{
            border: isRare
              ? "1px solid rgba(var(--cycle-accent-rgb) / 0.45)"
              : "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <span
            style={{
              fontWeight: 700,
              letterSpacing: "0.07em",
              textTransform: "uppercase" as const,
              fontSize: "9px",
              color: isRare ? MINT_ACCENT : "rgba(255,255,255,0.72)",
            }}
          >
            {isRare ? "RARE" : "COMMON"}
          </span>
        </Pill>
      </div>

      {/* ── Bottom-left: location ─────────────────────────────── */}
      {nft.location && (
        <div
          style={{
            position: "absolute",
            bottom: 6,
            left: 6,
            pointerEvents: "none",
          }}
        >
          <Pill>
            <MapPin size={6} style={{ opacity: 0.85, flexShrink: 0 }} />
            <span
              style={{
                maxWidth: "70px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontSize: "8px",
              }}
            >
              {nft.location}
            </span>
          </Pill>
        </div>
      )}

      {/* ── Bottom-right: mint number ─────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 6,
          right: 6,
          pointerEvents: "none",
        }}
      >
        <Pill>
          <span style={{ color: MINT_ACCENT, fontWeight: 700 }}>#</span>
          <span style={{ fontSize: "9px" }}>
            {nft.editionNumber}&nbsp;/&nbsp;{nft.totalSupply}
          </span>
        </Pill>
      </div>

      {/* ── Expanded: View CTA + collapse hint ───────────────── */}
      {isExpanded && (
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "5px",
            pointerEvents: "none",
            width: "100%",
          }}
        >
          {onViewMedia && (
            <button
              type="button"
              data-ocid={`collection.secondary_button.${ocidIndex}`}
              aria-label="View full media"
              onClick={(e) => {
                e.stopPropagation();
                onViewMedia();
              }}
              style={{
                background: "var(--cycle-accent)",
                border: "none",
                borderRadius: "999px",
                padding: "5px 13px",
                fontSize: "9px",
                fontWeight: 700,
                color: "#fff",
                cursor: "pointer",
                letterSpacing: "0.04em",
                boxShadow: "0 2px 10px rgba(var(--cycle-accent-rgb) / 0.40)",
                whiteSpace: "nowrap",
                pointerEvents: "auto",
                zIndex: 10,
              }}
            >
              View ↗
            </button>
          )}
        </div>
      )}
    </button>
  );
}
