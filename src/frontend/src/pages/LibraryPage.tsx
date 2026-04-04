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
  const [imgError, setImgError] = useState(false);

  const WRAP_W = 160;
  const WRAP_H = 230;
  const TILE_W = 108;
  const TILE_H = 150;

  return (
    <>
      <style>{`
        @keyframes mintPackFloat {
          0%   { transform: translateY(0px)   rotateY(-5deg) rotateX(2deg)  scale(1);    }
          33%  { transform: translateY(-5px)  rotateY(2deg)  rotateX(3deg)  scale(1.01); }
          66%  { transform: translateY(-8px)  rotateY(5deg)  rotateX(1deg)  scale(1.01); }
          100% { transform: translateY(0px)   rotateY(-5deg) rotateX(2deg)  scale(1);    }
        }
        @keyframes mintPackGlow {
          0%,100% { opacity: 0.5;  transform: translate(-50%,-50%) scale(1);    }
          50%     { opacity: 0.75; transform: translate(-50%,-50%) scale(1.06); }
        }
        @keyframes mintTopSheen {
          0%,100% { opacity: 0.58; }
          50%     { opacity: 0.76; }
        }
        @keyframes mintSweep {
          0%,4%    { transform: translateX(-160%) skewX(-22deg); opacity: 0; }
          10%      { opacity: 0.50; }
          90%      { opacity: 0.50; }
          96%,100% { transform: translateX(260%) skewX(-22deg); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .mint-pack-float  { animation: none !important; }
          .mint-pack-sweep  { display: none !important; }
          .mint-pack-glow   { animation: none !important; }
          .mint-top-sheen   { animation: none !important; }
        }
      `}</style>

      <div
        data-ocid="library.pack.section"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 20px 36px",
        }}
      >
        {/* Outer product card */}
        <div
          style={{
            width: "100%",
            maxWidth: "340px",
            background: "#F8F7F4",
            borderRadius: "26px",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.06), 0 6px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.90)",
            padding: "30px 24px 28px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Eyebrow label */}
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.24em",
              color: "#b0bab5",
              textTransform: "uppercase" as const,
              marginBottom: 24,
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            MINTY PACK
          </div>

          {/* 3D pack stage */}
          <div
            style={{
              position: "relative",
              width: WRAP_W,
              height: WRAP_H,
              marginBottom: 26,
              perspective: "900px",
              perspectiveOrigin: "50% 38%",
            }}
          >
            {/* Ambient mint bloom */}
            <div
              className="mint-pack-glow"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "240%",
                height: "240%",
                borderRadius: "50%",
                background:
                  "radial-gradient(ellipse at center, rgba(52,211,153,0.26) 0%, rgba(110,231,183,0.12) 42%, transparent 68%)",
                animation: "mintPackGlow 6s ease-in-out infinite",
                pointerEvents: "none",
                zIndex: 0,
              }}
            />

            {/* Glossy plastic wrapper */}
            <div
              className="mint-pack-float"
              style={{
                position: "relative",
                zIndex: 1,
                width: "100%",
                height: "100%",
                borderRadius: 20,
                background:
                  "linear-gradient(168deg, #c8f5e5 0%, #7ee8bc 16%, #3dd4a0 34%, #22c98d 52%, #15b87a 70%, #0a9e65 88%, #077d52 100%)",
                boxShadow:
                  "0 18px 44px rgba(5,120,75,0.35), " +
                  "0 6px 18px rgba(0,0,0,0.16), " +
                  "inset 1.5px 1.5px 0 rgba(255,255,255,0.75), " +
                  "inset -1.5px -1.5px 0 rgba(0,0,0,0.14), " +
                  "inset 0 0 26px rgba(0,55,35,0.16)",
                transformStyle: "preserve-3d" as const,
                animation: "mintPackFloat 8s ease-in-out infinite",
                overflow: "hidden",
              }}
            >
              {/* Top gloss sheen */}
              <div
                className="mint-top-sheen"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "46%",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.68) 0%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0) 100%)",
                  borderRadius: "20px 20px 0 0",
                  animation: "mintTopSheen 5s ease-in-out infinite",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />

              {/* Left edge highlight — plastic thickness */}
              <div
                style={{
                  position: "absolute",
                  top: "10%",
                  bottom: "10%",
                  left: 4,
                  width: 5,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.60) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.38) 100%)",
                  borderRadius: 4,
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              />

              {/* Right edge shadow — plastic thickness */}
              <div
                style={{
                  position: "absolute",
                  top: "10%",
                  bottom: "10%",
                  right: 4,
                  width: 5,
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.07) 0%, rgba(0,0,0,0.18) 50%, rgba(0,0,0,0.07) 100%)",
                  borderRadius: 4,
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              />

              {/* Inset depth shadow */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  boxShadow:
                    "inset 0 0 30px rgba(0,50,28,0.20), inset 0 3px 8px rgba(0,0,0,0.08)",
                  borderRadius: "inherit",
                  pointerEvents: "none",
                  zIndex: 3,
                }}
              />

              {/* Diagonal foil shimmer */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(116deg, rgba(255,255,255,0) 22%, rgba(255,255,255,0.26) 44%, rgba(210,255,235,0.14) 50%, rgba(255,255,255,0) 66%)",
                  pointerEvents: "none",
                  zIndex: 4,
                }}
              />

              {/* Tear-notch perforation line */}
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  left: 14,
                  right: 14,
                  height: 1,
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 25%, rgba(255,255,255,0.35) 75%, transparent 100%)",
                  pointerEvents: "none",
                  zIndex: 5,
                }}
              />

              {/* Rare light sweep */}
              <div
                className="mint-pack-sweep"
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: "48%",
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.36) 50%, rgba(255,255,255,0) 100%)",
                  animation: "mintSweep 18s ease-in-out infinite 9s",
                  pointerEvents: "none",
                  zIndex: 6,
                }}
              />

              {/* Inner tile — portrait card with clear visible gap */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: TILE_W,
                  height: TILE_H,
                  borderRadius: 12,
                  background: "#FAFAF8",
                  boxShadow:
                    "0 8px 24px rgba(0,0,0,0.26), " +
                    "0 2px 8px rgba(0,0,0,0.16), " +
                    "0 0 0 1.5px rgba(255,255,255,0.85), " +
                    "inset 0 1px 0 rgba(255,255,255,0.95)",
                  overflow: "hidden",
                  zIndex: 7,
                }}
              >
                {!imgError ? (
                  <img
                    src="/assets/img_4745-019d55f7-8e43-700c-8e61-2a4442d9b58b.png"
                    onError={() => setImgError(true)}
                    alt="Minty Pack preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center top",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background:
                        "linear-gradient(155deg, #e0faf0 0%, #a7f3d0 50%, #6ee7b7 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 30,
                        fontWeight: 800,
                        color: "rgba(5,120,80,0.40)",
                        fontFamily: "Georgia, serif",
                        letterSpacing: "-0.04em",
                        userSelect: "none" as const,
                      }}
                    >
                      M
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Typography block */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#111111",
                letterSpacing: "-0.025em",
                textAlign: "center",
                marginBottom: 6,
                fontFamily: "system-ui, -apple-system, sans-serif",
                lineHeight: 1.2,
              }}
            >
              Minty Pack
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 400,
                color: "#7d8a84",
                textAlign: "center",
                marginBottom: 8,
                letterSpacing: "0.005em",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              Contains 1 collectible
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#3a4742",
                textAlign: "center",
                letterSpacing: "0.01em",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              $1 per pack
            </div>
          </div>
        </div>

        {/* Supply remaining */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "#b0bab5",
            marginTop: 12,
            textAlign: "center",
            letterSpacing: "0.04em",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Supply remaining: 50,000
        </div>

        {/* CTA button */}
        <div
          style={{
            width: "100%",
            maxWidth: "340px",
            marginTop: 16,
          }}
        >
          {hasDraft ? (
            <>
              <div
                style={{
                  background: "rgba(16,185,129,0.06)",
                  border: "1px solid rgba(16,185,129,0.18)",
                  borderRadius: "16px",
                  padding: "14px 20px",
                  marginBottom: 10,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#059669",
                    marginBottom: 4,
                  }}
                >
                  Your Moment is in progress.
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  Complete capture and print to unlock your next Moment.
                </div>
              </div>
              <button
                data-ocid="library.pack.finish_moment.button"
                type="button"
                onClick={onFinishMoment}
                style={{
                  width: "100%",
                  background: "#EBEBEA",
                  color: "#111111",
                  borderRadius: "14px",
                  fontSize: "15px",
                  fontWeight: 600,
                  padding: "14px 0",
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "0.01em",
                  transition: "opacity 0.15s ease",
                  textAlign: "center",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = "0.82";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                }}
              >
                Finish Current Moment →
              </button>
            </>
          ) : (
            <button
              data-ocid="library.pack.mint_moment.button"
              type="button"
              onClick={onMintClick}
              style={{
                width: "100%",
                background: "#EBEBEA",
                color: "#111111",
                borderRadius: "14px",
                fontSize: "15px",
                fontWeight: 600,
                padding: "14px 0",
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.01em",
                transition: "opacity 0.15s ease",
                textAlign: "center",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = "0.82";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = "1";
              }}
            >
              Mint Moment
            </button>
          )}
        </div>
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
