import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { MintMomentModal } from "../components/MintMomentModal";
import { useMomentDraft } from "../context/MomentDraftContext";
import { usePackStyle } from "../context/PackStyleContext";

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

const WRAPPER_IMG =
  "/assets/generated/pack-wrapper-cycle4-offwhite-transparent.dim_400x560.png";

function PackCard({
  accentRgb: _accentRgb,
  accentText,
}: {
  accentRgb: string;
  accentText: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ ...CARD_OUTER_STYLE, height: "100%", minHeight: "350px" }}>
      {/* Background layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
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

      {/* Slow card bg shimmer */}
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

      {/* Content layer */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          padding: "36px 32px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0",
          height: "100%",
        }}
      >
        {/* Small top label */}
        <span
          style={{
            fontSize: "11px",
            letterSpacing: "0.14em",
            color: accentText,
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
            margin: "12px 0",
          }}
        />

        {/* Off-white wrapper image — main visual */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
            width: "100%",
          }}
        >
          <img
            src={WRAPPER_IMG}
            alt="Minty Pack"
            style={{
              maxHeight: "190px",
              maxWidth: "100%",
              objectFit: "contain",
              display: "block",
              filter:
                "drop-shadow(0 8px 24px rgba(0,0,0,0.18)) drop-shadow(0 2px 6px rgba(0,0,0,0.10))",
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
            margin: "16px 0 0",
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
            color: accentText,
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

function RevealedCard({
  collectible,
  accentRgb,
}: {
  collectible: Collectible;
  accentRgb: string;
}) {
  const rarityColor = RARITY_COLOR[collectible.rarity] ?? "#9B9B9B";

  return (
    <div
      style={{
        width: "280px",
        background: "var(--echo-surface, #FCFCFC)",
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
            background: `rgba(${accentRgb},0.4)`,
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
              fill={`rgba(${accentRgb},0.08)`}
            />
            <circle cx="24" cy="24" r="8" fill={`rgba(${accentRgb},0.18)`} />
            <circle cx="24" cy="24" r="3" fill={`rgba(${accentRgb},0.5)`} />
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

// ── Locked state shown when a draft is in progress ───────────────────────────
function DraftLockedState({
  onFinish,
  accentRgb,
  accentColor,
  accentOklch,
  accentOklchLight,
}: {
  onFinish: () => void;
  accentRgb: string;
  accentColor: string;
  accentOklch: string;
  accentOklchLight: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const { activeDraft } = useMomentDraft();

  const photoCount = activeDraft?.photos.length ?? 0;
  const hasVideo = activeDraft?.video !== null;

  const mintButtonStyle = {
    ...BUTTON_BASE,
    background: isActive
      ? `linear-gradient(160deg, oklch(${accentOklchLight}), oklch(${accentOklch}))`
      : isHovered
        ? `linear-gradient(160deg, oklch(${accentOklch}), oklch(${accentOklchLight}))`
        : `linear-gradient(160deg, oklch(${accentOklch}), oklch(${accentOklchLight}))`,
    color: "#ffffff",
    boxShadow: isHovered
      ? `0 4px 20px rgba(${accentRgb},0.38), 0 1px 6px rgba(${accentRgb},0.25), inset 0 1px 0 rgba(255,255,255,0.20)`
      : `0 2px 12px rgba(${accentRgb},0.28), inset 0 1px 0 rgba(255,255,255,0.18)`,
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
          background: `rgba(${accentRgb},0.06)`,
          border: `1px solid rgba(${accentRgb},0.18)`,
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
            background: `rgba(${accentRgb},0.75)`,
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
            borderTop: `1px solid rgba(${accentRgb},0.12)`,
            display: "flex",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: photoCount === 9 ? accentColor : "#7a9a8a",
              fontWeight: photoCount === 9 ? 600 : 400,
            }}
          >
            {photoCount}/9 photos
          </span>
          <span
            style={{
              fontSize: "12px",
              color: hasVideo ? accentColor : "#7a9a8a",
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

  const { activeStyle: activeCycle } = usePackStyle();
  const { hasDraft, startDraft } = useMomentDraft();

  // Derive accent values from active cycle
  const accentColor = `oklch(${activeCycle.accentOklchDark})`;
  const accentRgb = `${activeCycle.accentR},${activeCycle.accentG},${activeCycle.accentB}`;
  const accentText = `rgba(${activeCycle.accentR},${activeCycle.accentG},${activeCycle.accentB},0.85)`;
  const accentGlow = `rgba(${accentRgb},0.28)`;

  // Inject keyframes once — uses CSS custom property var(--cycle-accent-rgb) for the glow
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
      /* Soft glow pulse on the wrapper — uses CSS custom property set by PackStyleContext */
      @keyframes packPreviewGlow {
        0%, 100% { box-shadow: inset 0 1px 0 rgba(255,255,255,0.9),
                               0 6px 24px rgba(0,0,0,0.08),
                               0 2px 8px rgba(0,0,0,0.05),
                               0 0 0px rgba(var(--cycle-accent-rgb),0); }
        50%       { box-shadow: inset 0 1px 0 rgba(255,255,255,0.9),
                               0 6px 24px rgba(0,0,0,0.08),
                               0 2px 8px rgba(0,0,0,0.05),
                               0 0 18px rgba(var(--cycle-accent-rgb),0.28); }
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
  }

  function handleViewLibrary() {
    if (onBrowseReleases) {
      onBrowseReleases();
    } else {
      setPackState("idle");
      setCurrentCollectible(null);
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

  // Primary button — cycle-accent filled gradient
  const primaryButtonStyle = {
    ...BUTTON_BASE,
    background: isButtonActive
      ? `linear-gradient(160deg, oklch(${activeCycle.accentOklchLight}), oklch(${activeCycle.accentOklch}))`
      : isButtonHovered
        ? `linear-gradient(160deg, oklch(${activeCycle.accentOklch}), oklch(${activeCycle.accentOklchLight}))`
        : `linear-gradient(160deg, oklch(${activeCycle.accentOklch}), oklch(${activeCycle.accentOklchLight}))`,
    color: "#ffffff",
    boxShadow: isButtonHovered
      ? `0 4px 20px rgba(${accentRgb},0.35), 0 1px 6px rgba(${accentRgb},0.20), inset 0 1px 0 rgba(255,255,255,0.18)`
      : `0 2px 12px rgba(${accentRgb},0.22), inset 0 1px 0 rgba(255,255,255,0.15)`,
    transform: isButtonActive ? "scale(0.98)" : "scale(1)",
  };

  // Secondary button — subtle accent border + tinted background
  const secondaryButtonStyle = {
    ...BUTTON_BASE,
    background: isAltButtonHovered
      ? `rgba(${accentRgb},0.08)`
      : `rgba(${accentRgb},0.04)`,
    color: accentColor,
    border: `1px solid rgba(${accentRgb},0.22)`,
  };

  // Determine if we show the flippable pack or the revealed card / draft locked
  const showFlippable = !hasDraft && packState === "idle";

  // Suppress unused variable warning — accentGlow is available for future use
  void accentGlow;

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
              <PackCard accentRgb={accentRgb} accentText={accentText} />
              <div style={{ height: "20px" }} />
              <DraftLockedState
                onFinish={() => onCaptureMoment?.()}
                accentRgb={accentRgb}
                accentColor={accentColor}
                accentOklch={activeCycle.accentOklch}
                accentOklchLight={activeCycle.accentOklchLight}
              />
            </motion.div>
          )}

          {/* IDLE — pack card display */}
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
              <PackCard accentRgb={accentRgb} accentText={accentText} />

              <p
                style={{
                  fontSize: "12px",
                  color: `rgba(${accentRgb},0.55)`,
                  marginTop: "16px",
                  letterSpacing: "0.02em",
                }}
              >
                Supply remaining: 50,000
              </p>

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
                background: "var(--echo-surface, #FCFCFC)",
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
              <RevealedCard
                collectible={currentCollectible}
                accentRgb={accentRgb}
              />

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
