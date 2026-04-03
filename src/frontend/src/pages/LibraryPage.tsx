import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

interface LibraryPageProps {
  onAlbumClick?: (albumId: string) => void;
  onBrowseReleases?: () => void;
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

export function LibraryPage({ onBrowseReleases }: LibraryPageProps) {
  const [packState, setPackState] = useState<PackState>("idle");
  const [currentCollectible, setCurrentCollectible] =
    useState<Collectible | null>(null);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [isAltButtonHovered, setIsAltButtonHovered] = useState(false);

  const pickRandomCollectible = useCallback((): Collectible => {
    return COLLECTIBLES[Math.floor(Math.random() * COLLECTIBLES.length)];
  }, []);

  function handleBuyPack() {
    setPackState("opening");
    const picked = pickRandomCollectible();
    setTimeout(() => {
      setCurrentCollectible(picked);
      setPackState("revealed");
    }, 300);
  }

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
          {/* IDLE — pack card + buy button */}
          {packState === "idle" && (
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

              {/* Buy Pack button */}
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
                onClick={handleBuyPack}
              >
                Buy Pack
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
    </div>
  );
}
