import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useTheme } from "../ThemeContext";
import { MintMomentModal } from "../components/MintMomentModal";
import { useMomentDraft } from "../context/MomentDraftContext";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_OWNED_CARDS = [
  {
    id: "1",
    name: "Pikachu ex",
    editionNumber: "042/100",
    rarity: "Ultra Rare",
    setName: "Scarlet & Violet",
    imageUrl: "https://placehold.co/200x270/e8f5f0/1db98a?text=Card",
  },
  {
    id: "2",
    name: "Charizard",
    editionNumber: "001/100",
    rarity: "Rare",
    setName: "Base Set",
    imageUrl: "https://placehold.co/200x270/e8f5f0/1db98a?text=Card",
  },
  {
    id: "3",
    name: "Gengar Holo",
    editionNumber: "088/150",
    rarity: "Rare",
    setName: "Pokemon 151",
    imageUrl: "https://placehold.co/200x270/e8f5f0/1db98a?text=Card",
  },
  {
    id: "4",
    name: "Eevee Promo",
    editionNumber: "007/050",
    rarity: "Common",
    setName: "Promo",
    imageUrl: "https://placehold.co/200x270/e8f5f0/1db98a?text=Card",
  },
  {
    id: "5",
    name: "Mewtwo V",
    editionNumber: "023/100",
    rarity: "Ultra Rare",
    setName: "Scarlet & Violet",
    imageUrl: "https://placehold.co/200x270/e8f5f0/1db98a?text=Card",
  },
  {
    id: "6",
    name: "Blastoise",
    editionNumber: "055/100",
    rarity: "Rare",
    setName: "Base Set",
    imageUrl: "https://placehold.co/200x270/e8f5f0/1db98a?text=Card",
  },
];

const MOCK_OWNED_SETS = [
  {
    id: "1",
    name: "Scarlet & Violet Base",
    category: "Pokemon",
    imageUrl: "https://placehold.co/400x225/e8f5f0/1db98a?text=Set",
    totalCards: 198,
    collectedCards: 42,
  },
  {
    id: "2",
    name: "Base Set",
    category: "Pokemon",
    imageUrl: "https://placehold.co/400x225/e8f5f0/1db98a?text=Set",
    totalCards: 102,
    collectedCards: 7,
  },
  {
    id: "3",
    name: "Pokemon 151",
    category: "Pokemon",
    imageUrl: "https://placehold.co/400x225/e8f5f0/1db98a?text=Set",
    totalCards: 165,
    collectedCards: 88,
  },
];

const MOCK_OWNED_MEDIA = [
  {
    id: "1",
    type: "photo",
    title: "Mint Sunrise",
    price: 25,
    imageUrl: "https://placehold.co/300x300/f0fdf4/059669?text=Photo",
  },
  {
    id: "2",
    type: "video",
    title: "Opening Day",
    price: 45,
    imageUrl: "https://placehold.co/300x300/f0f9ff/3b82f6?text=Video",
  },
  {
    id: "3",
    type: "photo",
    title: "Crystal Drop",
    price: 15,
    imageUrl: "https://placehold.co/300x300/f0fdf4/059669?text=Photo",
  },
  {
    id: "4",
    type: "photo",
    title: "Sage Walk",
    price: 20,
    imageUrl: "https://placehold.co/300x300/f0fdf4/059669?text=Photo",
  },
];

const MOCK_OWNED_LISTINGS = [
  {
    id: "1",
    name: "Charizard TAG 10",
    setName: "Base Set",
    price: 2100,
    currency: "USDC",
    offerCount: 3,
    imageUrl: "https://placehold.co/100x100/e8f5f0/1db98a?text=Item",
  },
  {
    id: "2",
    name: "Pikachu SAR TAG 9",
    setName: "Scarlet & Violet",
    price: 420,
    currency: "ETH",
    offerCount: 1,
    imageUrl: "https://placehold.co/100x100/e8f5f0/1db98a?text=Item",
  },
];

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
type FilterType = "all" | "sets" | "cards" | "media" | "listings";

// ─── Props ────────────────────────────────────────────────────────────────────

interface LibraryPageProps {
  onAlbumClick?: () => void;
  onBrowseReleases?: () => void;
  onCaptureMoment?: () => void;
}

// ─── Rarity Badge ─────────────────────────────────────────────────────────────

function RarityBadge({ rarity }: { rarity: string }) {
  let bg = "#e5e7eb";
  let color = "#6b7280";
  if (rarity === "Rare") {
    bg = "#dbeafe";
    color = "#1d4ed8";
  }
  if (rarity === "Ultra Rare") {
    bg = "#fef3c7";
    color = "#b45309";
  }
  return (
    <span
      style={{
        display: "inline-block",
        background: bg,
        color,
        fontSize: "10px",
        fontWeight: 600,
        padding: "2px 7px",
        borderRadius: "99px",
        letterSpacing: "0.02em",
        lineHeight: "1.5",
      }}
    >
      {rarity}
    </span>
  );
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

// ─── Collected: Cards Grid ────────────────────────────────────────────────────

function CollectedCardsGrid({ cards }: { cards: typeof MOCK_OWNED_CARDS }) {
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
          data-ocid="library.cards.item"
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
              #{card.editionNumber}
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
            <RarityBadge rarity={card.rarity} />
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

// ─── Collected: Sets List ─────────────────────────────────────────────────────

function CollectedSetsList({ sets }: { sets: typeof MOCK_OWNED_SETS }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "0 16px 16px",
      }}
    >
      {sets.map((set) => {
        const pct = Math.round((set.collectedCards / set.totalCards) * 100);
        return (
          <div
            key={set.id}
            data-ocid="library.sets.item"
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
              padding: "12px",
              cursor: "pointer",
            }}
          >
            <div
              style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}
            >
              <img
                src={set.imageUrl}
                alt={set.name}
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "10px",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#111",
                    marginBottom: "3px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {set.name}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#059669",
                    fontWeight: 500,
                    marginBottom: "8px",
                  }}
                >
                  {set.collectedCards}/{set.totalCards} collected
                </div>
                <div
                  style={{
                    height: "4px",
                    borderRadius: "99px",
                    background: "#e5e7eb",
                    overflow: "hidden",
                    marginBottom: "6px",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: "#10b981",
                      borderRadius: "99px",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 500,
                    color: "#9ca3af",
                    background: "#f3f4f6",
                    padding: "2px 7px",
                    borderRadius: "99px",
                  }}
                >
                  {set.category}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Collected: Media Grid ────────────────────────────────────────────────────

function CollectedMediaGrid({ media }: { media: typeof MOCK_OWNED_MEDIA }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "10px",
        padding: "0 16px 16px",
      }}
    >
      {media.map((item) => (
        <div
          key={item.id}
          data-ocid="library.media.item"
          style={{
            aspectRatio: "1",
            borderRadius: "12px",
            overflow: "hidden",
            position: "relative",
            cursor: "pointer",
          }}
        >
          <img
            src={item.imageUrl}
            alt={item.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          {/* Type badge */}
          <div
            style={{
              position: "absolute",
              top: "8px",
              left: "8px",
              background:
                item.type === "video"
                  ? "rgba(59,130,246,0.85)"
                  : "rgba(16,185,129,0.85)",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 600,
              padding: "2px 7px",
              borderRadius: "99px",
              backdropFilter: "blur(4px)",
            }}
          >
            {item.type === "video" ? "Video" : "Photo"}
          </div>
          {/* Price overlay */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.55), transparent)",
              padding: "20px 10px 8px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <span style={{ color: "#fff", fontSize: "13px", fontWeight: 600 }}>
              ${item.price}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Collected: Listings List ─────────────────────────────────────────────────

function CollectedListingsList({
  listings,
}: { listings: typeof MOCK_OWNED_LISTINGS }) {
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
          data-ocid="library.listings.item"
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
            <div style={{ fontSize: "12px", color: "#9ca3af" }}>
              {listing.setName}
            </div>
            <div style={{ marginTop: "4px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#059669",
                  background: "rgba(16,185,129,0.10)",
                  border: "1px solid rgba(16,185,129,0.20)",
                  padding: "2px 7px",
                  borderRadius: "99px",
                }}
              >
                {listing.offerCount} offer{listing.offerCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#111" }}>
              ${listing.price.toLocaleString()}
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "#059669",
                background: "rgba(16,185,129,0.08)",
                padding: "2px 7px",
                borderRadius: "99px",
                marginTop: "3px",
                display: "inline-block",
              }}
            >
              {listing.currency}
            </span>
          </div>
        </div>
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
  const [collectedFilter, setCollectedFilter] = useState<FilterType>("all");
  const [createdFilter, setCreatedFilter] = useState<FilterType>("all");
  const [showMintModal, setShowMintModal] = useState(false);

  const pageBg = isLight ? "#F8F8F8" : "oklch(0.08 0.02 160)";
  const _cardBg = isLight ? "#ffffff" : "oklch(0.12 0.04 160 / 0.97)";

  const activeFilter =
    activeTab === "collected" ? collectedFilter : createdFilter;
  const setFilter =
    activeTab === "collected" ? setCollectedFilter : setCreatedFilter;

  const filterChips: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "sets", label: "Sets" },
    { key: "cards", label: "Cards" },
    { key: "media", label: "Media" },
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

  // ─── Collected Content ───────────────────────────────────────────────────

  function renderCollectedContent() {
    const f = collectedFilter;
    if (f === "sets") {
      return <CollectedSetsList sets={MOCK_OWNED_SETS} />;
    }
    if (f === "cards") {
      return <CollectedCardsGrid cards={MOCK_OWNED_CARDS} />;
    }
    if (f === "media") {
      return <CollectedMediaGrid media={MOCK_OWNED_MEDIA} />;
    }
    if (f === "listings") {
      return <CollectedListingsList listings={MOCK_OWNED_LISTINGS} />;
    }
    // All — stacked sections
    return (
      <>
        <SectionHeader label="Sets" />
        <CollectedSetsList sets={MOCK_OWNED_SETS} />
        <SectionHeader label="Cards" />
        <CollectedCardsGrid cards={MOCK_OWNED_CARDS} />
        <SectionHeader label="Media" />
        <CollectedMediaGrid media={MOCK_OWNED_MEDIA} />
        <SectionHeader label="Listings" />
        <CollectedListingsList listings={MOCK_OWNED_LISTINGS} />
      </>
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
    // All — stacked sections (no media for created)
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
            border: `1px solid ${isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.10)"}`,
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
          borderBottom: `1px solid ${isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"}`,
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
            WebkitOverflowScrolling:
              "touch" as React.CSSProperties["WebkitOverflowScrolling"],
          }}
        >
          {filterChips.map(({ key, label }) => {
            const isActive = activeFilter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
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
          key={`${activeTab}-${activeFilter}`}
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
