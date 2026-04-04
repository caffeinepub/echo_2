import { MapPin, Play } from "lucide-react";
import { useState } from "react";
import type { CollectionNFT } from "../context/CollectionContext";

// ─── Constants ────────────────────────────────────────────────────────────────
const MINT_ACCENT = "#00C8A0";
const MINT_BORDER = "rgba(0, 200, 160, 0.25)";
const MINT_GLOW = "rgba(0, 200, 160, 0.18)";

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
        padding: "3px 8px",
        fontSize: "10px",
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
        borderRadius: "16px",
        overflow: "hidden",
        cursor: "pointer",
        // Borders & shadows
        border: `1px solid ${isExpanded ? "rgba(0,200,160,0.55)" : MINT_BORDER}`,
        boxShadow: isExpanded
          ? `0 8px 48px rgba(0,0,0,0.70), 0 0 0 1px ${MINT_GLOW}, 0 0 32px ${MINT_GLOW}`
          : "0 4px 24px rgba(0,0,0,0.45)",
        // Scale expand — CSS transform only, no layout shift
        transform: isExpanded ? "scale(1.62)" : "scale(1)",
        transformOrigin: "center center",
        transition:
          "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 300ms ease, border-color 200ms ease",
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
                width: "28px",
                height: "28px",
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
                size={12}
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
          height: "45%",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.52) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
      {/* Bottom scrim */}
      <div
        style={{
          position: "absolute",
          inset: "auto 0 0 0",
          height: "45%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.62) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Top-left: date or video indicator ────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 7,
          left: 7,
          display: "flex",
          alignItems: "center",
          gap: "4px",
          pointerEvents: "none",
        }}
      >
        {isVideo && (
          <Pill>
            <Play size={7} fill="currentColor" style={{ opacity: 0.9 }} />
            <span style={{ fontSize: "9px" }}>VIDEO</span>
          </Pill>
        )}
        {nft.capturedAt && (
          <Pill>
            <span>{formatCapturedAt(nft.capturedAt)}</span>
          </Pill>
        )}
      </div>

      {/* ── Top-right: rarity ────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 7,
          right: 7,
          pointerEvents: "none",
        }}
      >
        <Pill
          style={{
            border: isRare
              ? "1px solid rgba(0,200,160,0.45)"
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
            bottom: 7,
            left: 7,
            pointerEvents: "none",
          }}
        >
          <Pill>
            <MapPin size={7} style={{ opacity: 0.85, flexShrink: 0 }} />
            <span
              style={{
                maxWidth: "80px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
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
          bottom: 7,
          right: 7,
          pointerEvents: "none",
        }}
      >
        <Pill>
          <span style={{ color: MINT_ACCENT, fontWeight: 700 }}>#</span>
          <span>
            {nft.editionNumber}&nbsp;/&nbsp;{nft.totalSupply}
          </span>
        </Pill>
      </div>

      {/* ── Expanded: View CTA ───────────────────────────────── */}
      {isExpanded && onViewMedia && (
        <button
          type="button"
          data-ocid={`collection.secondary_button.${ocidIndex}`}
          aria-label="View full media"
          onClick={(e) => {
            e.stopPropagation();
            onViewMedia();
          }}
          style={{
            position: "absolute",
            bottom: 12,
            left: "50%",
            transform: "translateX(-50%)",
            background: `linear-gradient(135deg, ${MINT_ACCENT}, #00a882)`,
            border: "none",
            borderRadius: "999px",
            padding: "5px 14px",
            fontSize: "10px",
            fontWeight: 700,
            color: "#fff",
            cursor: "pointer",
            letterSpacing: "0.04em",
            boxShadow: "0 2px 12px rgba(0,200,160,0.45)",
            whiteSpace: "nowrap",
            pointerEvents: "auto",
            zIndex: 10,
          }}
        >
          View ↗
        </button>
      )}
    </button>
  );
}
