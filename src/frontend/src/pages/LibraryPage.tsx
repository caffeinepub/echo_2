import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useTheme } from "../ThemeContext";
import { MintMomentModal } from "../components/MintMomentModal";
import { useMomentDraft } from "../context/MomentDraftContext";

// ─── Mock Data ────────────────────────────────────────────────────────────────

// ── Collected: Owned Media ────────────────────────────────────────────────────

interface OwnedMediaItem {
  id: string;
  type: "photo" | "video";
  title: string;
  creator: string;
  editionNumber: string; // e.g. "12/100"
  isListed: boolean;
  price?: number; // only if listed
  duration?: string; // e.g. "0:07", "0:30", "1:00" — only for videos
  thumbnailUrl: string;
}

const MOCK_OWNED_MEDIA: OwnedMediaItem[] = [
  {
    id: "1",
    type: "photo",
    title: "Mint Sunrise",
    creator: "lumina.sol",
    editionNumber: "12/100",
    isListed: true,
    price: 25,
    thumbnailUrl: "https://placehold.co/400x400/e8f5f0/059669?text=Photo",
  },
  {
    id: "2",
    type: "video",
    title: "Opening Day",
    creator: "drophaus",
    editionNumber: "3/50",
    isListed: false,
    duration: "0:07",
    thumbnailUrl: "https://placehold.co/400x400/f0f9ff/2563eb?text=Video",
  },
  {
    id: "3",
    type: "photo",
    title: "Crystal Drop",
    creator: "nova.art",
    editionNumber: "8/200",
    isListed: true,
    price: 15,
    thumbnailUrl: "https://placehold.co/400x400/e8f5f0/059669?text=Photo",
  },
  {
    id: "4",
    type: "video",
    title: "Drift Season",
    creator: "kira_frames",
    editionNumber: "1/25",
    isListed: true,
    price: 80,
    duration: "0:30",
    thumbnailUrl: "https://placehold.co/400x400/f0f9ff/2563eb?text=Video",
  },
  {
    id: "5",
    type: "photo",
    title: "Sage Walk",
    creator: "earthtones",
    editionNumber: "44/100",
    isListed: false,
    thumbnailUrl: "https://placehold.co/400x400/e8f5f0/059669?text=Photo",
  },
  {
    id: "6",
    type: "video",
    title: "Neon Fog",
    creator: "lumina.sol",
    editionNumber: "2/10",
    isListed: false,
    duration: "1:00",
    thumbnailUrl: "https://placehold.co/400x400/f0f9ff/2563eb?text=Video",
  },
  {
    id: "7",
    type: "photo",
    title: "Mirror Pond",
    creator: "nova.art",
    editionNumber: "17/75",
    isListed: true,
    price: 40,
    thumbnailUrl: "https://placehold.co/400x400/e8f5f0/059669?text=Photo",
  },
  {
    id: "8",
    type: "photo",
    title: "Frosted Peak",
    creator: "drophaus",
    editionNumber: "99/100",
    isListed: false,
    thumbnailUrl: "https://placehold.co/400x400/e8f5f0/059669?text=Photo",
  },
];

// ── Created mock data (untouched) ─────────────────────────────────────────────

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

// ─── Media Detail Sheet ───────────────────────────────────────────────────────

function MediaDetailSheet({
  item,
  onClose,
}: {
  item: OwnedMediaItem;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 200,
        }}
      />

      {/* Sheet */}
      <motion.div
        key="sheet"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 320 }}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 201,
          background: "#ffffff",
          borderRadius: "20px 20px 0 0",
          maxHeight: "90dvh",
          overflowY: "auto",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.14)",
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "12px 0 4px",
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 99,
              background: "#e5e7eb",
            }}
          />
        </div>

        {/* Preview */}
        <div style={{ position: "relative" }}>
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            style={{
              width: "100%",
              aspectRatio: item.type === "video" ? "16/9" : "1",
              objectFit: "cover",
              display: "block",
            }}
          />
          {item.type === "video" && (
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
                  background: "rgba(255,255,255,0.22)",
                  backdropFilter: "blur(8px)",
                  border: "1.5px solid rgba(255,255,255,0.50)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 20, color: "#fff", marginLeft: 3 }}>
                  ▶
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "20px 20px 8px" }}>
          <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
            by {item.creator}
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#111",
              marginBottom: 6,
            }}
          >
            {item.title}
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 500,
              color: "#6b7280",
              background: "#f3f4f6",
              borderRadius: 99,
              padding: "4px 12px",
              marginBottom: 14,
            }}
          >
            <span>Edition</span>
            <span style={{ fontWeight: 700, color: "#111" }}>
              {item.editionNumber}
            </span>
          </div>

          {item.isListed && item.price !== undefined && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 18,
                padding: "12px 16px",
                background: "rgba(16,185,129,0.06)",
                border: "1px solid rgba(16,185,129,0.18)",
                borderRadius: 12,
              }}
            >
              <span style={{ fontSize: 13, color: "#059669", fontWeight: 500 }}>
                Listed for
              </span>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#059669" }}>
                ${item.price}
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#059669",
                  background: "rgba(16,185,129,0.12)",
                  border: "1px solid rgba(16,185,129,0.25)",
                  borderRadius: 99,
                  padding: "2px 9px",
                }}
              >
                LISTED
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          style={{
            padding: "0 20px 32px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <button
            data-ocid="library.media_detail.list_button"
            type="button"
            style={{
              width: "100%",
              padding: "13px 0",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              color: "#ffffff",
              background: "#111111",
              border: "none",
              cursor: "pointer",
              letterSpacing: "0.01em",
            }}
          >
            {item.isListed ? "Update Listing" : "List for Sale"}
          </button>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              data-ocid="library.media_detail.transfer_button"
              type="button"
              style={{
                flex: 1,
                padding: "12px 0",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                color: "#374151",
                background: "#f3f4f6",
                border: "1px solid #e5e7eb",
                cursor: "pointer",
              }}
            >
              Transfer
            </button>
            <button
              data-ocid="library.media_detail.share_button"
              type="button"
              style={{
                flex: 1,
                padding: "12px 0",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                color: "#374151",
                background: "#f3f4f6",
                border: "1px solid #e5e7eb",
                cursor: "pointer",
              }}
            >
              Share
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Collected: Media Grid ────────────────────────────────────────────────────

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
        <motion.div
          key={item.id}
          data-ocid={`library.media.item.${idx + 1}`}
          whileTap={{ scale: 0.97 }}
          onClick={() => onItemClick(item)}
          style={{
            borderRadius: "14px",
            overflow: "hidden",
            position: "relative",
            cursor: "pointer",
            background: "#ffffff",
            boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
            aspectRatio: "1",
          }}
        >
          {/* Thumbnail */}
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />

          {/* Top-left: type badge */}
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              background:
                item.type === "video"
                  ? "rgba(37,99,235,0.82)"
                  : "rgba(5,150,105,0.82)",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 99,
              backdropFilter: "blur(4px)",
              letterSpacing: "0.03em",
            }}
          >
            {item.type === "video" ? "Video" : "Photo"}
          </div>

          {/* Top-right: listed indicator */}
          {item.isListed && (
            <div
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#10b981",
                boxShadow:
                  "0 0 0 2.5px rgba(255,255,255,0.85), 0 0 6px rgba(16,185,129,0.60)",
              }}
              title="Listed for sale"
            />
          )}

          {/* Video: play icon overlay */}
          {item.type === "video" && (
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
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.22)",
                  backdropFilter: "blur(6px)",
                  border: "1.5px solid rgba(255,255,255,0.50)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 14, color: "#fff", marginLeft: 2 }}>
                  ▶
                </span>
              </div>
            </div>
          )}

          {/* Bottom overlay: edition + optional duration */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.58) 0%, transparent 100%)",
              padding: "22px 8px 8px",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "rgba(255,255,255,0.92)",
                letterSpacing: "0.02em",
              }}
            >
              {item.editionNumber}
            </span>
            {item.type === "video" && item.duration && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.88)",
                  background: "rgba(0,0,0,0.35)",
                  borderRadius: 4,
                  padding: "1px 5px",
                }}
              >
                {item.duration}
              </span>
            )}
          </div>
        </motion.div>
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

export function LibraryPage({ onCaptureMoment }: LibraryPageProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const { hasDraft, startDraft } = useMomentDraft();

  const [activeTab, setActiveTab] = useState<ActiveTab>("collected");
  const [collectedFilter, setCollectedFilter] =
    useState<CollectedFilterType>("all");
  const [createdFilter, setCreatedFilter] = useState<CreatedFilterType>("all");
  const [showMintModal, setShowMintModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<OwnedMediaItem | null>(
    null,
  );

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

  // ─── Collected Content ───────────────────────────────────────────────────

  function renderCollectedContent() {
    return (
      <CollectedMediaGrid
        media={getFilteredMedia()}
        onItemClick={(item) => setSelectedMedia(item)}
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

      {/* ── Media Detail Sheet ── */}
      {selectedMedia && (
        <MediaDetailSheet
          item={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}

      {/* ── Mint Moment Modal ── */}
      <MintMomentModal
        open={showMintModal}
        onClose={() => setShowMintModal(false)}
        onConfirm={handleMintConfirm}
      />
    </div>
  );
}
