import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { MintMomentModal } from "../components/MintMomentModal";
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

function PackCard() {
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={CARD_OUTER_STYLE}>
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
          {/* Pack image with float + 3D animate */}
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
            <img
              src="/assets/comfyui_00009-019d510a-371e-750b-b780-72fcb79d8ba5.png"
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

  const { hasDraft, startDraft } = useMomentDraft();

  // Inject pulse animation once
  useEffect(() => {
    const id = "draft-dot-pulse-style";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes draftDotPulse {
        0%, 100% { opacity: 0.5; transform: scale(1); }
        50%       { opacity: 1;   transform: scale(1.25); }
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

  // pickRandomCollectible used in revealed flow when opening another
  const handleRevealRandom = useCallback(() => {
    setPackState("opening");
    const picked = pickRandomCollectible();
    setTimeout(() => {
      setCurrentCollectible(picked);
      setPackState("revealed");
    }, 300);
  }, [pickRandomCollectible]);

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
              <PackCard />
              <div style={{ height: "20px" }} />
              <DraftLockedState onFinish={() => onCaptureMoment?.()} />
            </motion.div>
          )}

          {/* IDLE — normal pack card + mint moment button */}
          {!hasDraft && packState === "idle" && (
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
              <PackCard />

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
                onClick={() => setShowMintModal(true)}
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
            // If no navigation handler, fall back to the pack reveal experience
            if (!onCaptureMoment) {
              handleRevealRandom();
            }
          }}
        />
      )}
    </div>
  );
}
