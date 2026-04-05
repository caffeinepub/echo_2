import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MintMomentModal } from "../components/MintMomentModal";
import { useCycleTheme } from "../context/CycleThemeContext";
import { useMomentDraft } from "../context/MomentDraftContext";

interface LibraryPageProps {
  onAlbumClick?: (albumId: string) => void;
  onBrowseReleases?: () => void;
  onCaptureMoment?: () => void;
}

type PackState = "idle" | "opening" | "revealed";

interface Collectible {
  name: string;
  rarity: string;
}

const COLLECTIBLES: Collectible[] = [
  { name: "Mint Chip", rarity: "Common" },
  { name: "Glacier", rarity: "Rare" },
  { name: "Sage Leaf", rarity: "Common" },
  { name: "Arctic Bloom", rarity: "Uncommon" },
  { name: "Frosted Peak", rarity: "Rare" },
  { name: "Dew Drop", rarity: "Common" },
  { name: "Crystal Mint", rarity: "Ultra Rare" },
  { name: "Spearmint", rarity: "Uncommon" },
];

const RARITY_COLOR: Record<string, string> = {
  Common: "#9B9B9B",
  Uncommon: "#4A90A4",
  Rare: "#7B6CF6",
  "Ultra Rare": "#C9A84C",
};

// Barcode bar data: [x position, bar width]
const BARCODE_BARS: [number, number][] = [
  [0, 1.5],
  [2, 1],
  [4, 2],
  [7, 1],
  [9, 1.5],
  [11, 1],
  [13, 2],
  [16, 1],
  [18, 1.5],
  [20, 1],
  [22, 2],
  [25, 1],
  [27, 1.5],
  [29, 1],
  [31, 2],
  [34, 1],
  [36, 1.5],
  [38, 1],
  [40, 2],
  [43, 1],
  [45, 1.5],
  [47, 1],
];

const CARD_OUTER_STYLE = {
  width: "280px",
  border: "1px solid rgba(0,0,0,0.06)",
  borderRadius: "20px",
  boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 2px 12px rgba(0,0,0,0.08)",
  overflow: "hidden",
  position: "relative" as const,
  background: "none",
} as const;

const BUTTON_BASE = {
  width: "280px",
  height: "52px",
  borderRadius: "14px",
  fontSize: "15px",
  fontWeight: 500,
  letterSpacing: "0.02em",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.15s ease, transform 0.1s ease",
} as const;

function PackCard({
  previewImage,
  packWrapperUrl,
}: { previewImage?: string; packWrapperUrl?: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  // The image shown inside the display window:
  // — if a first captured photo exists, use it
  // — otherwise fall back to the green pack artwork
  const displaySrc = previewImage
    ? previewImage
    : (packWrapperUrl ??
      "/assets/generated/pack-wrapper-cycle1-mint-transparent.dim_400x560.png");

  return (
    <div style={{ ...CARD_OUTER_STYLE, height: "100%", minHeight: "350px" }}>
      {/* Background image layer — muted/desaturated */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url('/assets/2b94ee04-514b-458f-9635-3478ba602ea8-019d510a-36c0-7224-ac66-ae3f81d2f030.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "saturate(0.65) contrast(0.88)",
          zIndex: 0,
        }}
      />

      {/* Frosted white gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.68) 100%)",
          zIndex: 1,
        }}
      />

      {/* Slow card bg shimmer — rare sweep */}
      <div
        className="card-bg-shimmer"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          borderRadius: "20px",
          overflow: "hidden",
        }}
      />

      {/* Flip hint — top right corner */}
      <div
        style={{
          position: "absolute",
          top: "14px",
          right: "14px",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: "4px",
          opacity: 0.45,
          pointerEvents: "none",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 8c0-3.31 2.69-6 6-6s6 2.69 6 6"
            stroke="#4a5a52"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M14 5.5L14 8M14 8L11.5 8"
            stroke="#4a5a52"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Content layer */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          padding: "44px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0",
        }}
      >
        {/* Small top label */}
        <span
          style={{
            fontSize: "11px",
            letterSpacing: "0.14em",
            color: "#4a5a52",
            fontWeight: 500,
            textTransform: "uppercase",
            textShadow: "0 1px 3px rgba(255,255,255,0.8)",
          }}
        >
          MINTY PACK
        </span>

        {/* Divider */}
        <div
          style={{
            width: "32px",
            height: "1px",
            background: "rgba(0,0,0,0.10)",
            margin: "16px 0",
          }}
        />

        {/* Glass pedestal container */}
        <div
          style={{
            position: "relative",
            width: "120px",
            height: "120px",
            borderRadius: "20px",
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(12px) saturate(1.2)",
            WebkitBackdropFilter: "blur(12px) saturate(1.2)",
            border: "1px solid rgba(200,245,230,0.6)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.9), 0 6px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.05)",
            outline: "1px solid rgba(200,245,230,0.3)",
            filter: "drop-shadow(0 0 18px rgba(120,230,190,0.25))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
            overflow: "hidden",
          }}
        >
          {/* Display image — either first captured photo or fallback pack art */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}
          >
            {previewImage ? (
              // Captured photo: fill the window in 4:5 portrait crop
              // Animated: float + glow pulse + breathing scale
              <div
                className="pack-preview-animate"
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "inherit",
                  overflow: "hidden",
                  animation: isHovered ? undefined : undefined, // animation controlled via CSS class
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onTouchStart={() => setIsHovered(true)}
                onTouchEnd={() => setTimeout(() => setIsHovered(false), 300)}
              >
                <img
                  src={displaySrc}
                  alt="Mint Moment preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center top",
                    display: "block",
                    borderRadius: "inherit",
                  }}
                />
              </div>
            ) : (
              // Fallback: green pack artwork (existing behavior)
              <img
                src={displaySrc}
                alt="Minty Pack"
                className={`pack-hero-animate${isHovered ? " pack-hero-hover" : ""}`}
                style={{
                  width: "75%",
                  height: "75%",
                  objectFit: "contain",
                  display: "block",
                  filter:
                    "drop-shadow(0 0 12px rgba(150,240,200,0.4)) drop-shadow(0 2px 8px rgba(0,0,0,0.12))",
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onTouchStart={() => setIsHovered(true)}
                onTouchEnd={() => setTimeout(() => setIsHovered(false), 300)}
              />
            )}
          </div>

          {/* Ambient mint glow behind pack */}
          <div
            className="pack-glow-pulse"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(140,240,200,0.22) 0%, transparent 70%)",
              pointerEvents: "none",
              borderRadius: "20px",
            }}
          />

          {/* Light sweep overlay */}
          <div
            className="pack-light-sweep"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "20px",
              overflow: "hidden",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Main name */}
        <h2
          style={{
            fontSize: "22px",
            fontWeight: 600,
            color: "#111111",
            letterSpacing: "0.02em",
            margin: 0,
            textAlign: "center",
            textShadow: "0 1px 3px rgba(255,255,255,0.8)",
          }}
        >
          Minty Pack
        </h2>

        {/* Sub text */}
        <p
          style={{
            fontSize: "13px",
            color: "#4a5a52",
            margin: "8px 0 0",
            textAlign: "center",
            textShadow: "0 1px 3px rgba(255,255,255,0.8)",
          }}
        >
          Contains 1 collectible
        </p>

        {/* Price */}
        <p
          style={{
            fontSize: "15px",
            fontWeight: 500,
            color: "#111111",
            margin: "8px 0 0",
            textAlign: "center",
            textShadow: "0 1px 3px rgba(255,255,255,0.8)",
          }}
        >
          $1 per pack
        </p>
      </div>
    </div>
  );
}

function RevealedCard({ collectible }: { collectible: Collectible }) {
  const rarityColor = RARITY_COLOR[collectible.rarity] ?? "#9B9B9B";

  return (
    <div
      style={{
        width: "280px",
        background: "#FAFAF8",
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: "20px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          padding: "44px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0",
        }}
      >
        {/* Thin accent line */}
        <div
          style={{
            width: "40px",
            height: "2px",
            background: "rgba(52, 168, 132, 0.4)",
            borderRadius: "1px",
            marginBottom: "28px",
          }}
        />

        {/* Collectible illustration placeholder */}
        <div
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "20px",
            background: "rgba(0,0,0,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "28px",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="24"
              cy="24"
              r="16"
              stroke="rgba(0,0,0,0.12)"
              strokeWidth="1.5"
              fill="rgba(52,168,132,0.08)"
            />
            <circle cx="24" cy="24" r="8" fill="rgba(52,168,132,0.18)" />
            <circle cx="24" cy="24" r="3" fill="rgba(52,168,132,0.5)" />
          </svg>
        </div>

        {/* Card name */}
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: "#111111",
            letterSpacing: "0.01em",
            margin: 0,
            textAlign: "center",
          }}
        >
          {collectible.name}
        </h2>

        {/* Rarity */}
        <p
          style={{
            fontSize: "13px",
            color: rarityColor,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            fontWeight: 500,
            margin: "10px 0 0",
            textAlign: "center",
          }}
        >
          {collectible.rarity}
        </p>
      </div>
    </div>
  );
}

// ── Pack Backside — Premium TCG Booster Pack Information Back ─────────────────
function PackBackside({ onFlipBack }: { onFlipBack: () => void }) {
  const dividerStyle = {
    height: "1px",
    background: "rgba(52,168,132,0.18)",
    margin: "0 0 14px",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "9px",
    letterSpacing: "0.18em",
    color: "#3d6b58",
    fontWeight: 700,
    textTransform: "uppercase",
    margin: "0 0 8px",
    display: "block",
  };

  const bulletStyle: React.CSSProperties = {
    margin: "2px 0",
    fontSize: "10px",
    color: "#3d4a42",
    lineHeight: 1.5,
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "20px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 2px 12px rgba(0,0,0,0.08)",
        border: "1px solid rgba(0,0,0,0.06)",
        overflow: "hidden",
        background: "#EFF8F3",
        position: "relative",
      }}
    >
      {/* Noise/grain texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          opacity: 0.035,
          mixBlendMode: "multiply",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Gloss sheen at top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "38%",
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.0) 100%)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* Flip back button — top-right corner */}
      <button
        type="button"
        data-ocid="library.secondary_button"
        onClick={(e) => {
          e.stopPropagation();
          onFlipBack();
        }}
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          zIndex: 10,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          opacity: 0.4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
        }}
        aria-label="Flip back to pack front"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M14 8c0 3.31-2.69 6-6 6s-6-2.69-6-6"
            stroke="#3d6b58"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M2 10.5L2 8M2 8L4.5 8"
            stroke="#3d6b58"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Scrollable content area */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          padding: "22px 20px",
          fontSize: "11px",
          overflowY: "auto",
          maxHeight: "350px",
        }}
      >
        {/* 1. Top label */}
        <p
          style={{
            fontSize: "10px",
            letterSpacing: "0.2em",
            color: "#3d6b58",
            fontWeight: 600,
            textTransform: "uppercase",
            textAlign: "center",
            marginBottom: "12px",
            marginTop: 0,
          }}
        >
          MINTY PACK
        </p>

        {/* 2. Description */}
        <p
          style={{
            fontSize: "10px",
            color: "#5a7a6a",
            lineHeight: 1.55,
            textAlign: "center",
            margin: "0 0 14px",
          }}
        >
          This pack contains 1 collectible from a Mint Moment set. Each Mint
          Moment is created from real photos and video captured by the creator.
        </p>

        {/* 3. Divider */}
        <div style={dividerStyle} />

        {/* 4. Contents section */}
        <div style={{ margin: "0 0 14px" }}>
          <span style={sectionTitleStyle}>CONTENTS</span>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
            }}
          >
            {[
              "1 collectible card",
              "photo or video moment",
              "web3 verified ownership",
              "limited supply",
              "part of a creator set",
            ].map((item) => (
              <li key={item} style={bulletStyle}>
                • {item}
              </li>
            ))}
          </ul>
        </div>

        {/* 5. Divider */}
        <div style={dividerStyle} />

        {/* 6. Collectible Structure section */}
        <div style={{ margin: "0 0 14px" }}>
          <span style={sectionTitleStyle}>COLLECTIBLE STRUCTURE</span>
          <p
            style={{
              fontSize: "10px",
              color: "#3d4a42",
              lineHeight: 1.55,
              margin: "0 0 8px",
            }}
          >
            Each Mint Moment produces a limited number of collectibles.
          </p>
          <p
            style={{
              fontSize: "9px",
              color: "#5a7a6a",
              fontWeight: 600,
              margin: "8px 0 4px",
            }}
          >
            Possible content types:
          </p>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
            }}
          >
            {["Photo Moments", "Video Moments"].map((item) => (
              <li key={item} style={bulletStyle}>
                • {item}
              </li>
            ))}
          </ul>
          <p
            style={{
              fontSize: "9.5px",
              color: "#6a8a7a",
              fontStyle: "italic",
              margin: "8px 0 0",
            }}
          >
            Some collectibles may be more limited than others.
          </p>
        </div>

        {/* 7. Divider */}
        <div style={dividerStyle} />

        {/* 8. Footer */}
        <div>
          <p
            style={{
              fontSize: "9px",
              color: "#6a8a7a",
              textAlign: "center",
              lineHeight: 1.55,
              margin: "0 0 6px",
            }}
          >
            Minty Moments are creator-generated collectibles stored with
            verifiable ownership.
          </p>
          <p
            style={{
              fontSize: "9px",
              fontWeight: 600,
              color: "#34a884",
              textAlign: "center",
              margin: 0,
            }}
          >
            minty.xyz
          </p>
        </div>

        {/* 9. Micro details row */}
        <div
          style={{
            marginTop: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            opacity: 0.5,
          }}
        >
          {/* Barcode SVG — using x position as stable key */}
          <svg
            width="48"
            height="14"
            viewBox="0 0 48 14"
            fill="none"
            aria-hidden="true"
          >
            {BARCODE_BARS.map(([x, w]) => (
              <rect
                key={`bar-${x}`}
                x={x}
                y="0"
                width={w}
                height="12"
                fill="#3d6b58"
              />
            ))}
          </svg>

          {/* Recycling icon SVG */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 1.5L8 4H7v2.5H5V4H4L6 1.5Z"
              fill="#3d6b58"
              opacity="0.8"
            />
            <path
              d="M9.5 7.5L7 9.5v-1.2H5v-1.8h2V5.2L9.5 7.5Z"
              fill="#3d6b58"
              opacity="0.8"
            />
            <path
              d="M2.5 7.5L4 5l.7 1.2L6 5.5l.9 1.5L5.5 9H4.3L2.5 7.5Z"
              fill="#3d6b58"
              opacity="0.8"
            />
          </svg>

          {/* web3 collectible text */}
          <span
            style={{
              fontSize: "8px",
              color: "#5a7a6a",
              letterSpacing: "0.08em",
            }}
          >
            web3 collectible
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Locked state shown when a draft is in progress ───────────────────────────
function DraftLockedState({ onFinish }: { onFinish: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const { activeDraft } = useMomentDraft();

  const photoCount = activeDraft?.photos.length ?? 0;
  const hasVideo = activeDraft?.video !== null;

  const mintButtonStyle = {
    ...BUTTON_BASE,
    background: isActive
      ? "linear-gradient(160deg, #28a07c, #1e8a68)"
      : isHovered
        ? "linear-gradient(160deg, #2eaa88, #259474)"
        : "linear-gradient(160deg, #34A884, #2a9070)",
    color: "#ffffff",
    boxShadow: isHovered
      ? "0 4px 20px rgba(52,168,132,0.38), 0 1px 6px rgba(52,168,132,0.25), inset 0 1px 0 rgba(255,255,255,0.20)"
      : "0 2px 12px rgba(52,168,132,0.28), inset 0 1px 0 rgba(255,255,255,0.18)",
    transform: isActive ? "scale(0.97)" : "scale(1)",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "280px",
      }}
    >
      {/* Status message box */}
      <div
        data-ocid="library.loading_state"
        style={{
          background: "rgba(52,168,132,0.06)",
          border: "1px solid rgba(52,168,132,0.18)",
          borderRadius: "14px",
          padding: "16px 20px",
          width: "100%",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        {/* Soft pulsing dot */}
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "rgba(52,168,132,0.75)",
            margin: "0 auto 12px",
            animation: "draftDotPulse 2s ease-in-out infinite",
          }}
        />
        <p
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "#2a4a3a",
            margin: "0 0 6px",
            lineHeight: 1.4,
          }}
        >
          Your Moment is in progress.
        </p>
        <p
          style={{
            fontSize: "13px",
            fontWeight: 400,
            color: "#5a7a6a",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Complete capture and print to unlock your next Moment.
        </p>

        {/* Progress summary */}
        <div
          style={{
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: "1px solid rgba(52,168,132,0.12)",
            display: "flex",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: photoCount === 9 ? "rgba(52,168,132,1)" : "#7a9a8a",
              fontWeight: photoCount === 9 ? 600 : 400,
            }}
          >
            {photoCount}/9 photos
          </span>
          <span
            style={{
              fontSize: "12px",
              color: hasVideo ? "rgba(52,168,132,1)" : "#7a9a8a",
              fontWeight: hasVideo ? 600 : 400,
            }}
          >
            {hasVideo ? "1" : "0"}/1 video
          </span>
        </div>
      </div>

      {/* Finish Current Moment button */}
      <button
        type="button"
        data-ocid="library.primary_button"
        style={mintButtonStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsActive(false);
        }}
        onMouseDown={() => setIsActive(true)}
        onMouseUp={() => setIsActive(false)}
        onClick={onFinish}
      >
        Finish Current Moment
      </button>
    </motion.div>
  );
}

export function LibraryPage({
  onBrowseReleases,
  onCaptureMoment,
}: LibraryPageProps) {
  const [packState, setPackState] = useState<PackState>("idle");
  const [currentCollectible, setCurrentCollectible] =
    useState<Collectible | null>(null);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [isAltButtonHovered, setIsAltButtonHovered] = useState(false);
  const [showMintModal, setShowMintModal] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const { activeCycle } = useCycleTheme();
  const { hasDraft, startDraft, activeDraft } = useMomentDraft();

  // First captured photo from any active or completed draft
  const firstPhoto: string | undefined = activeDraft?.photos[0] ?? undefined;

  // Track touch start position for swipe detection
  const touchStartX = useRef<number | null>(null);

  // Inject keyframes once
  useEffect(() => {
    const id = "library-keyframes-style";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes draftDotPulse {
        0%, 100% { opacity: 0.5; transform: scale(1); }
        50%       { opacity: 1;   transform: scale(1.25); }
      }
      /* ── Pack preview image animations ─────────────────────────────── */
      /* Gentle float: 6px vertical travel over 5s */
      @keyframes packPreviewFloat {
        0%, 100% { transform: translateY(0px) scale(1); }
        50%       { transform: translateY(-5px) scale(1.012); }
      }
      /* Soft glow pulse on the wrapper */
      @keyframes packPreviewGlow {
        0%, 100% { box-shadow: inset 0 1px 0 rgba(255,255,255,0.9),
                               0 6px 24px rgba(0,0,0,0.08),
                               0 2px 8px rgba(0,0,0,0.05),
                               0 0 0px rgba(120,230,190,0); }
        50%       { box-shadow: inset 0 1px 0 rgba(255,255,255,0.9),
                               0 6px 24px rgba(0,0,0,0.08),
                               0 2px 8px rgba(0,0,0,0.05),
                               0 0 18px rgba(120,230,190,0.32); }
      }
      .pack-preview-animate {
        animation:
          packPreviewFloat 5s ease-in-out infinite,
          packPreviewGlow  4s ease-in-out infinite;
        will-change: transform;
        transform-origin: center center;
      }
      @media (prefers-reduced-motion: reduce) {
        .pack-hero-animate  { animation: none !important; }
        .pack-preview-animate { animation: none !important; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  const pickRandomCollectible = useCallback((): Collectible => {
    return COLLECTIBLES[Math.floor(Math.random() * COLLECTIBLES.length)];
  }, []);

  function handleOpenAnother() {
    setPackState("idle");
    setCurrentCollectible(null);
    setIsFlipped(false);
  }

  function handleViewLibrary() {
    if (onBrowseReleases) {
      onBrowseReleases();
    } else {
      setPackState("idle");
      setCurrentCollectible(null);
      setIsFlipped(false);
    }
  }

  const handleRevealRandom = useCallback(() => {
    setPackState("opening");
    const picked = pickRandomCollectible();
    setTimeout(() => {
      setCurrentCollectible(picked);
      setPackState("revealed");
    }, 300);
  }, [pickRandomCollectible]);

  // Handle swipe to flip
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 40) {
      setIsFlipped((f) => !f);
    }
    touchStartX.current = null;
  }

  function handleCardAreaClick(e: React.MouseEvent) {
    // Only flip if the click target is NOT a button or anchor
    if (
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest("a")
    ) {
      return;
    }
    setIsFlipped((f) => !f);
  }

  const primaryButtonStyle = {
    ...BUTTON_BASE,
    background: isButtonActive
      ? "#CCCAC8"
      : isButtonHovered
        ? "#DDDBD9"
        : "#E8E8E6",
    color: "#111111",
    transform: isButtonActive ? "scale(0.98)" : "scale(1)",
  };

  const secondaryButtonStyle = {
    ...BUTTON_BASE,
    background: isAltButtonHovered ? "#E6E4E2" : "#F0EEEC",
    color: "#6B6B6B",
  };

  // Determine if we show the flippable pack or the revealed card / draft locked
  const showFlippable = !hasDraft && packState === "idle";

  return (
    <div
      data-ocid="library.page"
      style={{
        minHeight: "calc(100vh - 68px - 64px)",
        background: "#F7F6F2",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        position: "relative",
      }}
    >
      {/* Dim overlay during opening transition */}
      <AnimatePresence>
        {packState === "opening" && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.03)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0",
          position: "relative",
          zIndex: 1,
        }}
      >
        <AnimatePresence mode="wait">
          {/* LOCKED STATE — draft in progress */}
          {hasDraft && packState === "idle" && (
            <motion.div
              key="locked"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* Show pack card with first captured photo as preview */}
              <PackCard
                previewImage={firstPhoto}
                packWrapperUrl={activeCycle.packWrapperUrl}
              />
              <div style={{ height: "20px" }} />
              <DraftLockedState onFinish={() => onCaptureMoment?.()} />
            </motion.div>
          )}

          {/* IDLE with FLIP — normal flippable pack card */}
          {showFlippable && (
            <motion.div
              key="pack"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/*
               * 3D FLIP — correct two-layer structure:
               *
               * Layer 1 (perspective wrapper): sets the perspective depth.
               *   — NO overflow:hidden here; that would flatten the 3D context.
               *
               * Layer 2 (overflow clip): clips visual bleed at card edges.
               *   — border-radius + overflow:hidden, but NOT a transform context.
               *
               * Layer 3 (inner rotating card): transform-style:preserve-3d,
               *   rotates on Y axis, carries both faces.
               *
               * Layer 4a/4b (faces): absolute, backface-visibility:hidden,
               *   explicit rotateY(0deg) / rotateY(180deg).
               */}

              {/* Layer 1 — perspective only, no overflow */}
              <div
                style={{
                  perspective: "1200px",
                  width: "280px",
                  height: "350px",
                }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {/* Layer 2 — click/keyboard handler (no overflow, no transform context) */}
                <button
                  type="button"
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "none",
                    border: "none",
                    padding: 0,
                    margin: 0,
                    display: "block",
                    cursor: "pointer",
                  }}
                  onClick={handleCardAreaClick}
                  aria-label={
                    isFlipped
                      ? "Flip to pack front"
                      : "Flip to pack information"
                  }
                  aria-pressed={isFlipped}
                >
                  {/* Layer 2.5 — overflow clip (child of button, separate from perspective) */}
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "20px",
                      overflow: "hidden",
                    }}
                  >
                    {/* Layer 3 — rotating inner card */}
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        transformStyle: "preserve-3d",
                        transition: "transform 0.6s ease",
                        transform: isFlipped
                          ? "rotateY(180deg)"
                          : "rotateY(0deg)",
                      }}
                    >
                      {/* Layer 4a — FRONT FACE */}
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          transform: "rotateY(0deg)",
                        }}
                      >
                        {/* Pass first captured photo (if any) as the preview */}
                        <PackCard
                          previewImage={firstPhoto}
                          packWrapperUrl={activeCycle.packWrapperUrl}
                        />
                      </div>

                      {/* Layer 4b — BACK FACE */}
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                        }}
                      >
                        <PackBackside onFlipBack={() => setIsFlipped(false)} />
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Supply + Mint Moment button — only when NOT flipped */}
              <AnimatePresence>
                {!isFlipped && (
                  <motion.div
                    key="actions"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    {/* Supply text */}
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#9B9B9B",
                        marginTop: "16px",
                        letterSpacing: "0.02em",
                      }}
                    >
                      Supply remaining: 50,000
                    </p>

                    {/* Mint Moment button */}
                    <button
                      type="button"
                      data-ocid="library.primary_button"
                      style={{ ...primaryButtonStyle, marginTop: "32px" }}
                      onMouseEnter={() => setIsButtonHovered(true)}
                      onMouseLeave={() => {
                        setIsButtonHovered(false);
                        setIsButtonActive(false);
                      }}
                      onMouseDown={() => setIsButtonActive(true)}
                      onMouseUp={() => setIsButtonActive(false)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMintModal(true);
                      }}
                    >
                      Mint Moment
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* OPENING — brief transition state */}
          {packState === "opening" && (
            <motion.div
              key="opening"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                width: "280px",
                height: "373px",
                background: "#FAFAF8",
                borderRadius: "20px",
              }}
            />
          )}

          {/* REVEALED — collectible card + action buttons */}
          {packState === "revealed" && currentCollectible && (
            <motion.div
              key="revealed"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <RevealedCard collectible={currentCollectible} />

              {/* Action buttons */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginTop: "28px",
                  width: "280px",
                }}
              >
                <button
                  type="button"
                  data-ocid="library.primary_button"
                  style={primaryButtonStyle}
                  onMouseEnter={() => setIsButtonHovered(true)}
                  onMouseLeave={() => {
                    setIsButtonHovered(false);
                    setIsButtonActive(false);
                  }}
                  onMouseDown={() => setIsButtonActive(true)}
                  onMouseUp={() => setIsButtonActive(false)}
                  onClick={handleOpenAnother}
                >
                  Open Another
                </button>

                <button
                  type="button"
                  data-ocid="library.secondary_button"
                  style={secondaryButtonStyle}
                  onMouseEnter={() => setIsAltButtonHovered(true)}
                  onMouseLeave={() => setIsAltButtonHovered(false)}
                  onClick={handleViewLibrary}
                >
                  View Library
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mint Moment Modal — only shown when no active draft */}
      {!hasDraft && (
        <MintMomentModal
          open={showMintModal}
          onClose={() => setShowMintModal(false)}
          onConfirm={() => {
            setShowMintModal(false);
            startDraft();
            onCaptureMoment?.();
            if (!onCaptureMoment) {
              handleRevealRandom();
            }
          }}
        />
      )}
    </div>
  );
}
