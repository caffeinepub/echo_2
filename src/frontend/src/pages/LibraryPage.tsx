import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useTheme } from "../ThemeContext";
import { MintMomentModal } from "../components/MintMomentModal";
import { useMomentDraft } from "../context/MomentDraftContext";
import { MOCK_OWNED_MEDIA, type OwnedMediaItem } from "../store/mockOwnedMedia";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveTab = "collected" | "pack";
type CollectedFilterType = "all" | "photos" | "videos" | "listed";

// ─── Props ────────────────────────────────────────────────────────────────────

interface LibraryPageProps {
  onBrowseReleases?: () => void;
  onCaptureMoment?: () => void;
  onAssetClick?: (id: string) => void;
}

// ─── Rarity color helper ──────────────────────────────────────────────────────

function rarityStyle(rarity: OwnedMediaItem["rarity"]) {
  switch (rarity) {
    case "Legendary":
      return {
        bg: "rgba(251,191,36,0.13)",
        text: "#b45309",
        border: "rgba(251,191,36,0.35)",
      };
    case "Ultra Rare":
      return {
        bg: "rgba(139,92,246,0.11)",
        text: "#7c3aed",
        border: "rgba(139,92,246,0.30)",
      };
    case "Rare":
      return {
        bg: "rgba(59,130,246,0.10)",
        text: "#1d4ed8",
        border: "rgba(59,130,246,0.25)",
      };
    default:
      return {
        bg: "rgba(107,114,128,0.08)",
        text: "#6b7280",
        border: "rgba(107,114,128,0.18)",
      };
  }
}

// ─── NFT Art Panel gradient ───────────────────────────────────────────────────

function nftGradient(item: OwnedMediaItem): string {
  if (item.type === "video") {
    if (item.rarity === "Legendary")
      return "linear-gradient(135deg, #fef3c7 0%, #fde68a 40%, #f59e0b 100%)";
    if (item.rarity === "Ultra Rare")
      return "linear-gradient(135deg, #ede9fe 0%, #c4b5fd 40%, #8b5cf6 100%)";
    return "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 40%, #93c5fd 100%)";
  }
  if (item.rarity === "Legendary")
    return "linear-gradient(135deg, #fef9c3 0%, #fef08a 40%, #eab308 100%)";
  if (item.rarity === "Ultra Rare")
    return "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 40%, #c084fc 100%)";
  if (item.rarity === "Rare")
    return "linear-gradient(135deg, #cffafe 0%, #a5f3fc 40%, #22d3ee 100%)";
  return "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 40%, #6ee7b7 100%)";
}

// ─── Collected: NFT Tile ──────────────────────────────────────────────────────

function NFTCollectibleTile({
  item,
  index,
  onItemClick,
}: {
  item: OwnedMediaItem;
  index: number;
  onItemClick: (item: OwnedMediaItem) => void;
}) {
  const rs = item.rarity ? rarityStyle(item.rarity) : null;
  const gradient = nftGradient(item);

  return (
    <motion.button
      type="button"
      key={item.id}
      data-ocid={`library.media.item.${index + 1}`}
      whileTap={{ scale: 0.96 }}
      onClick={() => onItemClick(item)}
      style={{
        all: "unset",
        display: "block",
        borderRadius: "14px",
        overflow: "hidden",
        position: "relative",
        cursor: "pointer",
        background: "#F7F6F2",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)",
        aspectRatio: "3/4",
        border: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      {/* ── Pack Art Panel (top 62%) ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: "38%",
          background: gradient,
          overflow: "hidden",
        }}
      >
        {/* Shimmer overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 55%, rgba(255,255,255,0.10) 100%)",
          }}
        />

        {/* Stylized Monogram */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "36px",
              fontWeight: 800,
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "-0.04em",
              fontFamily: "Georgia, serif",
              userSelect: "none",
              textShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            M
          </div>
        </div>
      </div>

      {/* ── Info row (bottom 38%) ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "38%",
          background: "#ffffff",
          padding: "8px 9px 9px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#111111",
            lineHeight: 1.3,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {item.title}
        </div>

        {/* Creator */}
        <div
          style={{
            fontSize: "10px",
            color: "#9ca3af",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          @{item.creator}
        </div>

        {/* Edition strip */}
        <div
          style={{
            background: "rgba(0,0,0,0.06)",
            borderRadius: 6,
            padding: "3px 7px",
            textAlign: "center",
            fontSize: "11px",
            fontWeight: 700,
            color: "#374151",
            letterSpacing: "0.03em",
          }}
        >
          #{item.editionNumber}
        </div>
      </div>

      {/* ── Type badge (top-left) ── */}
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          background: "rgba(0,0,0,0.52)",
          color: "#fff",
          fontSize: 9,
          fontWeight: 700,
          padding: "2px 7px",
          borderRadius: 99,
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          letterSpacing: "0.07em",
        }}
      >
        {item.type === "video" ? "VIDEO" : "PHOTO"}
      </div>

      {/* ── Rarity badge (top-right) ── */}
      {item.rarity && rs && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: item.isListed ? 20 : 8,
            background: rs.bg,
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            color: rs.text,
            fontSize: 9,
            fontWeight: 700,
            padding: "2px 7px",
            borderRadius: 99,
            border: `1px solid ${rs.border}`,
            letterSpacing: "0.05em",
          }}
        >
          {item.rarity === "Ultra Rare"
            ? "UR"
            : item.rarity === "Legendary"
              ? "★"
              : item.rarity.toUpperCase().slice(0, 4)}
        </div>
      )}

      {/* ── Listed pulse dot ── */}
      {item.isListed && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#10b981",
            boxShadow:
              "0 0 0 2.5px rgba(255,255,255,0.9), 0 0 8px rgba(16,185,129,0.60)",
          }}
          title="Listed for sale"
        />
      )}

      {/* ── Video duration ── */}
      {item.type === "video" && item.duration && (
        <div
          style={{
            position: "absolute",
            bottom: "40%",
            right: 8,
            background: "rgba(0,0,0,0.50)",
            color: "#fff",
            fontSize: 9,
            fontWeight: 600,
            padding: "2px 6px",
            borderRadius: 4,
          }}
        >
          {item.duration}
        </div>
      )}
    </motion.button>
  );
}

// ─── Collected: NFT Grid ──────────────────────────────────────────────────────

function CollectedMediaGrid({
  media,
  onItemClick,
}: {
  media: OwnedMediaItem[];
  onItemClick: (item: OwnedMediaItem) => void;
}) {
  if (media.length === 0) {
    return (
      <div
        data-ocid="library.media.empty_state"
        style={{
          textAlign: "center",
          padding: "48px 24px",
          color: "#9ca3af",
          fontSize: 14,
        }}
      >
        No media found
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "12px",
        padding: "0 16px 16px",
      }}
    >
      {media.map((item, idx) => (
        <NFTCollectibleTile
          key={item.id}
          item={item}
          index={idx}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  );
}

// ─── Pack View ────────────────────────────────────────────────────────────────

function PackView({
  hasDraft,
  onMintClick,
  onFinishMoment,
}: {
  hasDraft: boolean;
  onMintClick: () => void;
  onFinishMoment: () => void;
}) {
  return (
    <>
      {/* Keyframe animation injected once */}
      <style>{`
        @keyframes packFloat {
          0%   { transform: rotateY(-7deg) rotateX(3deg) translateY(0px); }
          50%  { transform: rotateY(7deg)  rotateX(2deg) translateY(-7px); }
          100% { transform: rotateY(-7deg) rotateX(3deg) translateY(0px); }
        }
        @keyframes packGlow {
          0%   { opacity: 0.45; }
          50%  { opacity: 0.65; }
          100% { opacity: 0.45; }
        }
        @keyframes packSweep {
          0%   { transform: translateX(-120%) skewX(-20deg); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateX(220%) skewX(-20deg); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pack-float-anim { animation: none !important; }
          .pack-sweep-anim { display: none !important; }
        }
      `}</style>

      <div
        data-ocid="library.pack.section"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 24px 32px",
          gap: "24px",
        }}
      >
        {/* ── Large Pack Card ── */}
        <div
          style={{
            width: "100%",
            maxWidth: "340px",
            background: "#F7F6F2",
            borderRadius: "22px",
            boxShadow:
              "0 8px 40px rgba(0,0,0,0.10), 0 2px 10px rgba(0,0,0,0.06)",
            overflow: "hidden",
            border: "1px solid rgba(0,0,0,0.06)",
            position: "relative",
          }}
        >
          {/* Inner gradient background */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(160deg, rgba(209,250,229,0.55) 0%, rgba(255,255,255,0) 55%, rgba(167,243,208,0.28) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* Pack artwork area */}
          <div
            style={{
              padding: "32px 24px 20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
              position: "relative",
            }}
          >
            {/* Glass pedestal with floating pack */}
            <div
              style={{
                position: "relative",
                width: "160px",
                height: "160px",
                perspective: "600px",
              }}
            >
              {/* Ambient glow */}
              <div
                className="pack-float-anim"
                style={{
                  position: "absolute",
                  inset: "-20px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(16,185,129,0) 70%)",
                  animation: "packGlow 6s ease-in-out infinite",
                  pointerEvents: "none",
                }}
              />

              {/* Glass pedestal square */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "20px",
                  background: "rgba(255,255,255,0.72)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1.5px solid rgba(255,255,255,0.85)",
                  boxShadow:
                    "0 4px 20px rgba(16,185,129,0.08), 0 1px 6px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {/* Floating pack monogram */}
                <div
                  className="pack-float-anim"
                  style={{
                    position: "relative",
                    width: "110px",
                    height: "110px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: "packFloat 7s ease-in-out infinite",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Pack body */}
                  <div
                    style={{
                      width: "90px",
                      height: "110px",
                      borderRadius: "12px",
                      background:
                        "linear-gradient(145deg, #d1fae5 0%, #a7f3d0 45%, #6ee7b7 100%)",
                      boxShadow:
                        "0 6px 24px rgba(16,185,129,0.25), 0 2px 8px rgba(0,0,0,0.10)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      gap: "4px",
                      position: "relative",
                      overflow: "hidden",
                      border: "1.5px solid rgba(255,255,255,0.6)",
                    }}
                  >
                    {/* Foil shimmer line */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.15) 100%)",
                      }}
                    />
                    {/* Rare sweep effect */}
                    <div
                      className="pack-sweep-anim"
                      style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        width: "40%",
                        background:
                          "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.40) 50%, rgba(255,255,255,0) 100%)",
                        animation: "packSweep 12s ease-in-out infinite 4s",
                        pointerEvents: "none",
                      }}
                    />
                    {/* M monogram */}
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: 800,
                        color: "rgba(5,150,105,0.85)",
                        fontFamily: "Georgia, serif",
                        letterSpacing: "-0.04em",
                        textShadow: "0 1px 3px rgba(255,255,255,0.6)",
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      M
                    </div>
                    <div
                      style={{
                        fontSize: "8px",
                        fontWeight: 700,
                        color: "rgba(5,150,105,0.70)",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      MINTY
                    </div>
                  </div>
                </div>

                {/* Inner highlight at top */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "50%",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.50) 0%, rgba(255,255,255,0) 100%)",
                    borderRadius: "20px 20px 0 0",
                    pointerEvents: "none",
                  }}
                />
              </div>

              {/* Pedestal shadow */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "100px",
                  height: "12px",
                  background:
                    "radial-gradient(ellipse, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0) 70%)",
                  pointerEvents: "none",
                }}
              />
            </div>

            {/* Pack info text */}
            <div
              style={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#111111",
                  letterSpacing: "-0.01em",
                }}
              >
                Minty Pack
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  fontWeight: 400,
                }}
              >
                Contains 1 collectible
              </div>
            </div>

            {/* Price */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "4px",
                position: "relative",
                zIndex: 1,
              }}
            >
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: "#111111",
                  letterSpacing: "-0.02em",
                }}
              >
                $1
              </span>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#6b7280",
                }}
              >
                per pack
              </span>
            </div>

            {/* Supply */}
            <div
              style={{
                fontSize: "12px",
                color: "#9ca3af",
                position: "relative",
                zIndex: 1,
              }}
            >
              Supply remaining: 50,000
            </div>
          </div>
        </div>

        {/* ── CTA area ── */}
        {hasDraft ? (
          <div
            style={{
              width: "100%",
              maxWidth: "340px",
              background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.18)",
              borderRadius: "16px",
              padding: "18px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#059669",
                lineHeight: 1.4,
              }}
            >
              Your Moment is in progress.
            </div>
            <div
              style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.5 }}
            >
              Complete capture and print to unlock your next Moment.
            </div>
            <button
              data-ocid="library.pack.finish_moment.button"
              type="button"
              onClick={onFinishMoment}
              style={{
                marginTop: "4px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#059669",
                background: "rgba(16,185,129,0.10)",
                border: "1px solid rgba(16,185,129,0.28)",
                borderRadius: "10px",
                padding: "11px 20px",
                cursor: "pointer",
                transition: "opacity 0.15s ease",
                letterSpacing: "0.01em",
                textAlign: "center",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = "0.80";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = "1";
              }}
            >
              Finish Current Moment →
            </button>
          </div>
        ) : (
          <button
            data-ocid="library.pack.mint_moment.button"
            type="button"
            onClick={onMintClick}
            style={{
              width: "100%",
              maxWidth: "340px",
              background: "#111111",
              color: "#ffffff",
              borderRadius: "14px",
              fontSize: "15px",
              fontWeight: 600,
              padding: "15px 24px",
              border: "none",
              cursor: "pointer",
              letterSpacing: "0.02em",
              transition: "opacity 0.15s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "0.85";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "1";
            }}
          >
            <span style={{ fontSize: "16px" }}>✦</span> Mint Moment
          </button>
        )}
      </div>
    </>
  );
}

// ─── Main LibraryPage ─────────────────────────────────────────────────────────

export function LibraryPage({
  onCaptureMoment,
  onAssetClick,
}: LibraryPageProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const { hasDraft, startDraft } = useMomentDraft();

  const [activeTab, setActiveTab] = useState<ActiveTab>("collected");
  const [collectedFilter, setCollectedFilter] =
    useState<CollectedFilterType>("all");
  const [showMintModal, setShowMintModal] = useState(false);

  const pageBg = isLight ? "#F8F8F8" : "oklch(0.08 0.02 160)";

  const collectedFilterChips: { key: CollectedFilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "photos", label: "Photos" },
    { key: "videos", label: "Videos" },
    { key: "listed", label: "Listed" },
  ];

  function handleMintClick() {
    if (!hasDraft) {
      setShowMintModal(true);
    } else if (onCaptureMoment) {
      onCaptureMoment();
    }
  }

  function handleMintConfirm() {
    startDraft();
    setShowMintModal(false);
    if (onCaptureMoment) onCaptureMoment();
  }

  function getFilteredMedia(): OwnedMediaItem[] {
    if (collectedFilter === "photos")
      return MOCK_OWNED_MEDIA.filter((m) => m.type === "photo");
    if (collectedFilter === "videos")
      return MOCK_OWNED_MEDIA.filter((m) => m.type === "video");
    if (collectedFilter === "listed")
      return MOCK_OWNED_MEDIA.filter((m) => m.isListed);
    return MOCK_OWNED_MEDIA;
  }

  function handleItemClick(item: OwnedMediaItem) {
    if (onAssetClick) onAssetClick(item.id);
  }

  return (
    <div
      data-ocid="library.page"
      style={{
        minHeight: "100dvh",
        background: pageBg,
        paddingTop: 72,
        paddingBottom: 88,
      }}
    >
      {/* ── Segmented Toggle: Collected | Pack ── */}
      <div
        style={{
          padding: "14px 16px 0",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            background: isLight ? "#f3f4f6" : "rgba(255,255,255,0.08)",
            borderRadius: "99px",
            padding: "3px",
            border: `1px solid ${
              isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.10)"
            }`,
          }}
        >
          {(["collected", "pack"] as ActiveTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              data-ocid={`library.${tab}.tab`}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "7px 24px",
                borderRadius: "99px",
                fontSize: "14px",
                fontWeight: activeTab === tab ? 600 : 500,
                color: activeTab === tab ? "#111" : "#6b7280",
                background:
                  activeTab === tab
                    ? isLight
                      ? "#ffffff"
                      : "rgba(255,255,255,0.12)"
                    : "transparent",
                boxShadow:
                  activeTab === tab ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                border: "none",
                cursor: "pointer",
                transition: "all 0.18s ease",
                letterSpacing: "0.01em",
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Filter Chips — only when Collected is active ── */}
      <AnimatePresence initial={false}>
        {activeTab === "collected" && (
          <motion.div
            key="filter-chips"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div
              data-ocid="library.filter.tab"
              style={{
                position: "sticky",
                top: 56,
                zIndex: 20,
                background: isLight
                  ? "rgba(248,248,248,0.90)"
                  : "rgba(10,15,12,0.90)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                borderBottom: `1px solid ${
                  isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"
                }`,
                marginTop: "14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  padding: "10px 16px",
                  overflowX: "auto",
                  scrollbarWidth: "none",
                }}
              >
                {collectedFilterChips.map(({ key, label }) => {
                  const isActive = collectedFilter === key;
                  return (
                    <button
                      key={key}
                      onClick={() =>
                        setCollectedFilter(key as CollectedFilterType)
                      }
                      type="button"
                      style={{
                        flexShrink: 0,
                        padding: "6px 14px",
                        borderRadius: "99px",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: isActive ? "#059669" : "#6b7280",
                        background: isActive
                          ? "rgba(16,185,129,0.10)"
                          : isLight
                            ? "#f3f4f6"
                            : "rgba(255,255,255,0.06)",
                        border: isActive
                          ? "1px solid rgba(16,185,129,0.30)"
                          : "1px solid transparent",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        {activeTab === "collected" ? (
          <motion.div
            key={`collected-${collectedFilter}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{ paddingTop: "12px" }}
          >
            <CollectedMediaGrid
              media={getFilteredMedia()}
              onItemClick={handleItemClick}
            />
          </motion.div>
        ) : (
          <motion.div
            key="pack"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{ paddingTop: "20px" }}
          >
            <PackView
              hasDraft={hasDraft}
              onMintClick={handleMintClick}
              onFinishMoment={() => onCaptureMoment?.()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mint Moment Modal ── */}
      <MintMomentModal
        open={showMintModal}
        onClose={() => setShowMintModal(false)}
        onConfirm={handleMintConfirm}
      />
    </div>
  );
}
