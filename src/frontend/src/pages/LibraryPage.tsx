import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";

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

const CARD_STYLE = {
  width: "280px",
  background: "#FAFAF8",
  border: "1px solid rgba(0,0,0,0.06)",
  borderRadius: "20px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
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
  return (
    <div style={CARD_STYLE}>
      <div
        style={{
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
            color: "#6B6B6B",
            fontWeight: 500,
            textTransform: "uppercase",
          }}
        >
          MINTY PACK
        </span>

        {/* Divider */}
        <div
          style={{
            width: "32px",
            height: "1px",
            background: "rgba(0,0,0,0.08)",
            margin: "16px 0",
          }}
        />

        {/* Pack icon placeholder */}
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "16px",
            background: "rgba(0,0,0,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="6"
              y="4"
              width="24"
              height="28"
              rx="4"
              stroke="rgba(0,0,0,0.15)"
              strokeWidth="1.5"
              fill="none"
            />
            <rect
              x="6"
              y="4"
              width="24"
              height="10"
              rx="4"
              fill="rgba(0,0,0,0.06)"
            />
            <line
              x1="11"
              y1="20"
              x2="25"
              y2="20"
              stroke="rgba(0,0,0,0.12)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="11"
              y1="25"
              x2="20"
              y2="25"
              stroke="rgba(0,0,0,0.08)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
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
          }}
        >
          Minty Pack
        </h2>

        {/* Sub text */}
        <p
          style={{
            fontSize: "13px",
            color: "#6B6B6B",
            margin: "8px 0 0",
            textAlign: "center",
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
    <div style={CARD_STYLE}>
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
