import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useTheme } from "../ThemeContext";
import { MintMomentModal } from "../components/MintMomentModal";
import { useMomentDraft } from "../context/MomentDraftContext";
import { MOCK_OWNED_MEDIA, type OwnedMediaItem } from "../store/mockOwnedMedia";

// ─── Created mock data (unchanged) ───────────────────────────────────────────

const MOCK_CREATED_SETS = [
  {
    id: "1",
    name: "My First Moment",
    imageUrl: "https://placehold.co/400x225/e8f5f0/1db98a?text=Set",
    assetCount: 10,
    supply: 100,
    sold: 34,
    remaining: 66,
    status: "Active",
  },
  {
    id: "2",
    name: "Summer Drop",
    imageUrl: "https://placehold.co/400x225/e8f5f0/1db98a?text=Set",
    assetCount: 5,
    supply: 50,
    sold: 0,
    remaining: 50,
    status: "Draft",
  },
];

const MOCK_CREATED_CARDS = [
  {
    id: "1",
    name: "Golden Hour",
    setName: "My First Moment",
    editionNumber: "#001",
    listingStatus: "Listed",
    imageUrl: "https://placehold.co/200x270/e8f5f0/1db98a?text=Card",
  },
  {
    id: "2",
    name: "Crystal Light",
    setName: "My First Moment",
    editionNumber: "#002",
    listingStatus: "Unlisted",
    imageUrl: "https://placehold.co/200x270/e8f5f0/1db98a?text=Card",
  },
  {
    id: "3",
    name: "Mint Dew",
    setName: "My First Moment",
    editionNumber: "#003",
    listingStatus: "Listed",
    imageUrl: "https://placehold.co/200x270/e8f5f0/1db98a?text=Card",
  },
  {
    id: "4",
    name: "Frosted Peak",
    setName: "Summer Drop",
    editionNumber: "#001",
    listingStatus: "Unlisted",
    imageUrl: "https://placehold.co/200x270/e8f5f0/1db98a?text=Card",
  },
];

const MOCK_CREATED_LISTINGS = [
  {
    id: "1",
    name: "Golden Hour #001",
    setName: "My First Moment",
    price: 85,
    currency: "USDC",
    views: 312,
    imageUrl: "https://placehold.co/100x100/e8f5f0/1db98a?text=Item",
  },
  {
    id: "2",
    name: "Mint Dew #003",
    setName: "My First Moment",
    price: 60,
    currency: "USDC",
    views: 148,
    imageUrl: "https://placehold.co/100x100/e8f5f0/1db98a?text=Item",
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveTab = "collected" | "created";
type CollectedFilterType = "all" | "photos" | "videos" | "listed";
type CreatedFilterType = "all" | "sets" | "cards" | "listings";

// ─── Props ────────────────────────────────────────────────────────────────────

interface LibraryPageProps {
  onAlbumClick?: () => void;
  onBrowseReleases?: () => void;
  onCaptureMoment?: () => void;
  onAssetClick?: (id: string) => void;
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        fontSize: "11px",
        fontWeight: 600,
        color: "#9ca3af",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        padding: "4px 16px 8px",
        marginTop: "8px",
      }}
    >
      {label}
    </div>
  );
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

        {/* Subtle dot/grid texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.12,
            backgroundImage:
              "radial-gradient(circle, rgba(0,0,0,0.35) 1px, transparent 1px)",
            backgroundSize: "12px 12px",
          }}
        />

        {/* Centered monogram circle */}
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
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.38)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1.5px solid rgba(255,255,255,0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            <span
              style={{
                fontSize: "22px",
                fontWeight: 900,
                color: "rgba(255,255,255,0.85)",
                letterSpacing: "-0.02em",
                lineHeight: 1,
                fontStyle: "italic",
              }}
            >
              M
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom Info Area ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "38%",
          background: "#F7F6F2",
          padding: "8px 10px 10px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
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

// ─── Created: Sets List ───────────────────────────────────────────────────────

function CreatedSetsList({ sets }: { sets: typeof MOCK_CREATED_SETS }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "0 16px 16px",
      }}
    >
      {sets.map((set) => (
        <div
          key={set.id}
          data-ocid="library.created_sets.item"
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <img
            src={set.imageUrl}
            alt={set.name}
            style={{
              width: "100%",
              aspectRatio: "16/9",
              objectFit: "cover",
              display: "block",
            }}
          />
          <div style={{ padding: "14px 16px 16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#111",
                    marginBottom: "3px",
                  }}
                >
                  {set.name}
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: "99px",
                    background:
                      set.status === "Active"
                        ? "rgba(16,185,129,0.12)"
                        : "#f3f4f6",
                    color: set.status === "Active" ? "#059669" : "#6b7280",
                    border:
                      set.status === "Active"
                        ? "1px solid rgba(16,185,129,0.25)"
                        : "1px solid #e5e7eb",
                    letterSpacing: "0.04em",
                  }}
                >
                  {set.status}
                </span>
              </div>
              <button
                data-ocid="library.created_sets.edit_button"
                type="button"
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#374151",
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  cursor: "pointer",
                }}
              >
                Manage
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {[
                { label: `${set.assetCount} assets`, mint: false },
                { label: `${set.supply} editions`, mint: false },
                { label: `${set.sold} sold`, mint: true },
                { label: `${set.remaining} remaining`, mint: false },
              ].map(({ label, mint }) => (
                <span
                  key={label}
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    padding: "3px 10px",
                    borderRadius: "99px",
                    background: mint ? "rgba(16,185,129,0.10)" : "#f3f4f6",
                    color: mint ? "#059669" : "#6b7280",
                    border: mint
                      ? "1px solid rgba(16,185,129,0.20)"
                      : "1px solid transparent",
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Created: Cards Grid ──────────────────────────────────────────────────────

function CreatedCardsGrid({ cards }: { cards: typeof MOCK_CREATED_CARDS }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "12px",
        padding: "0 16px 16px",
      }}
    >
      {cards.map((card) => (
        <div
          key={card.id}
          data-ocid="library.created_cards.item"
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
            overflow: "hidden",
            cursor: "pointer",
          }}
        >
          <img
            src={card.imageUrl}
            alt={card.name}
            style={{
              width: "100%",
              aspectRatio: "3/4",
              objectFit: "cover",
              display: "block",
            }}
          />
          <div style={{ padding: "8px 10px 10px" }}>
            <div
              style={{
                fontSize: "10px",
                color: "#9ca3af",
                marginBottom: "3px",
              }}
            >
              {card.editionNumber}
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#111",
                marginBottom: "5px",
                lineHeight: "1.3",
              }}
            >
              {card.name}
            </div>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                padding: "2px 7px",
                borderRadius: "99px",
                background:
                  card.listingStatus === "Listed"
                    ? "rgba(16,185,129,0.12)"
                    : "#f3f4f6",
                color: card.listingStatus === "Listed" ? "#059669" : "#6b7280",
              }}
            >
              {card.listingStatus}
            </span>
            <div
              style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}
            >
              {card.setName}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Created: Listings List ───────────────────────────────────────────────────

function CreatedListingsList({
  listings,
}: { listings: typeof MOCK_CREATED_LISTINGS }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "0 16px 16px",
      }}
    >
      {listings.map((listing) => (
        <div
          key={listing.id}
          data-ocid="library.created_listings.item"
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
            padding: "12px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <img
            src={listing.imageUrl}
            alt={listing.name}
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "10px",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#111",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                marginBottom: "2px",
              }}
            >
              {listing.name}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#9ca3af",
                marginBottom: "4px",
              }}
            >
              {listing.setName}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#9ca3af",
              }}
            >
              {listing.views.toLocaleString()} views
            </div>
          </div>
          <div
            style={{
              textAlign: "right",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "6px",
            }}
          >
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#111" }}>
              ${listing.price}
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "#059669",
                background: "rgba(16,185,129,0.08)",
                padding: "2px 7px",
                borderRadius: "99px",
              }}
            >
              {listing.currency}
            </span>
            <button
              data-ocid="library.created_listings.edit_button"
              type="button"
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "#374151",
                background: "transparent",
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: "99px",
                padding: "4px 10px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Edit Listing
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Mint Moment Banner (Created tab) ─────────────────────────────────────────

function MintMomentBanner({
  hasDraft,
  onMint,
  onFinish,
}: {
  hasDraft: boolean;
  onMint: () => void;
  onFinish: () => void;
}) {
  if (hasDraft) {
    return (
      <div
        style={{
          background: "rgba(16,185,129,0.06)",
          border: "1px solid rgba(16,185,129,0.15)",
          borderRadius: "14px",
          padding: "16px",
          margin: "0 16px 16px",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#059669",
            marginBottom: "4px",
          }}
        >
          Your Moment is in progress
        </div>
        <div
          style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}
        >
          Complete capture and print to unlock your next Moment.
        </div>
        <button
          data-ocid="library.finish_moment.button"
          type="button"
          onClick={onFinish}
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#059669",
            background: "rgba(16,185,129,0.10)",
            border: "1px solid rgba(16,185,129,0.25)",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          Finish Current Moment →
        </button>
      </div>
    );
  }

  return (
    <button
      data-ocid="library.mint_moment.button"
      type="button"
      onClick={onMint}
      style={{
        display: "block",
        width: "calc(100% - 32px)",
        margin: "0 16px 16px",
        background: "#111",
        color: "#fff",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: 600,
        padding: "13px 24px",
        border: "none",
        cursor: "pointer",
        letterSpacing: "0.01em",
        transition: "opacity 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.opacity = "0.85";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.opacity = "1";
      }}
    >
      ✦ Mint Moment
    </button>
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
  const [createdFilter, setCreatedFilter] = useState<CreatedFilterType>("all");
  const [showMintModal, setShowMintModal] = useState(false);

  const pageBg = isLight ? "#F8F8F8" : "oklch(0.08 0.02 160)";

  // ─── Collected filter chips ──────────────────────────────────────────────

  const collectedFilterChips: { key: CollectedFilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "photos", label: "Photos" },
    { key: "videos", label: "Videos" },
    { key: "listed", label: "Listed" },
  ];

  const createdFilterChips: { key: CreatedFilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "sets", label: "Sets" },
    { key: "cards", label: "Cards" },
    { key: "listings", label: "Listings" },
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

  // ─── Collected: filtered media ───────────────────────────────────────────

  function getFilteredMedia(): OwnedMediaItem[] {
    if (collectedFilter === "photos")
      return MOCK_OWNED_MEDIA.filter((m) => m.type === "photo");
    if (collectedFilter === "videos")
      return MOCK_OWNED_MEDIA.filter((m) => m.type === "video");
    if (collectedFilter === "listed")
      return MOCK_OWNED_MEDIA.filter((m) => m.isListed);
    return MOCK_OWNED_MEDIA; // "all"
  }

  function handleItemClick(item: OwnedMediaItem) {
    if (onAssetClick) onAssetClick(item.id);
  }

  // ─── Collected Content ───────────────────────────────────────────────────

  function renderCollectedContent() {
    return (
      <CollectedMediaGrid
        media={getFilteredMedia()}
        onItemClick={handleItemClick}
      />
    );
  }

  // ─── Created Content ─────────────────────────────────────────────────────

  function renderCreatedContent() {
    const f = createdFilter;
    if (f === "sets") {
      return <CreatedSetsList sets={MOCK_CREATED_SETS} />;
    }
    if (f === "cards") {
      return <CreatedCardsGrid cards={MOCK_CREATED_CARDS} />;
    }
    if (f === "listings") {
      return <CreatedListingsList listings={MOCK_CREATED_LISTINGS} />;
    }
    // All — stacked sections
    return (
      <>
        <SectionHeader label="Sets" />
        <CreatedSetsList sets={MOCK_CREATED_SETS} />
        <SectionHeader label="Cards" />
        <CreatedCardsGrid cards={MOCK_CREATED_CARDS} />
        <SectionHeader label="Listings" />
        <CreatedListingsList listings={MOCK_CREATED_LISTINGS} />
      </>
    );
  }

  // ─── Active filter chips for current tab ─────────────────────────────────

  const activeChips =
    activeTab === "collected" ? collectedFilterChips : createdFilterChips;
  const activeFilterValue: string =
    activeTab === "collected" ? collectedFilter : createdFilter;

  function handleFilterChange(key: string) {
    if (activeTab === "collected") {
      setCollectedFilter(key as CollectedFilterType);
    } else {
      setCreatedFilter(key as CreatedFilterType);
    }
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
      {/* ── Segmented Toggle ── */}
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
          {(["collected", "created"] as ActiveTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              data-ocid={`library.${tab}.tab`}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "7px 22px",
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

      {/* ── Mint Moment Banner (Created tab only) ── */}
      <AnimatePresence mode="wait">
        {activeTab === "created" && (
          <motion.div
            key="mint-banner"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            style={{ marginTop: "14px" }}
          >
            <MintMomentBanner
              hasDraft={hasDraft}
              onMint={handleMintClick}
              onFinish={() => onCaptureMoment?.()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filter Chips (sticky) ── */}
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
          marginTop: activeTab === "created" ? 0 : "14px",
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
          {activeChips.map(({ key, label }) => {
            const isActive = activeFilterValue === key;
            return (
              <button
                key={key}
                onClick={() => handleFilterChange(key)}
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

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeTab}-${activeFilterValue}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          style={{ paddingTop: "12px" }}
        >
          {activeTab === "collected"
            ? renderCollectedContent()
            : renderCreatedContent()}
        </motion.div>
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
