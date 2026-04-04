import {
  ArrowLeft,
  Eye,
  Flame,
  Heart,
  Play,
  Star,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import { MOCK_OWNED_MEDIA, type OwnedMediaItem } from "../store/mockOwnedMedia";

// ─── Props ────────────────────────────────────────────────────────────────────

interface AssetDetailPageProps {
  id: string;
  onBack: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatUSD(value: number | undefined): string {
  if (value === undefined) return "—";
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toLocaleString()}`;
}

function rarityColor(rarity: OwnedMediaItem["rarity"]) {
  switch (rarity) {
    case "Legendary":
      return {
        bg: "rgba(251,191,36,0.12)",
        text: "#b45309",
        border: "rgba(251,191,36,0.35)",
      };
    case "Ultra Rare":
      return {
        bg: "rgba(139,92,246,0.10)",
        text: "#7c3aed",
        border: "rgba(139,92,246,0.30)",
      };
    case "Rare":
      return {
        bg: "rgba(59,130,246,0.10)",
        text: "#1d4ed8",
        border: "rgba(59,130,246,0.28)",
      };
    default:
      return {
        bg: "rgba(107,114,128,0.08)",
        text: "#6b7280",
        border: "rgba(107,114,128,0.20)",
      };
  }
}

function badgeIcon(badge: string) {
  if (badge.includes("Trending")) return <Flame size={11} />;
  if (badge.includes("Volume")) return <TrendingUp size={11} />;
  if (badge.includes("Viewed")) return <Eye size={11} />;
  if (badge.includes("Featured")) return <Star size={11} />;
  return <Trophy size={11} />;
}

// ─── Section Label ────────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return (
    <div
      style={{
        fontSize: "11px",
        fontWeight: 600,
        color: "#9ca3af",
        textTransform: "uppercase",
        letterSpacing: "0.09em",
        marginBottom: "10px",
      }}
    >
      {text}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "12px",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: "10px",
          fontWeight: 500,
          color: "#9ca3af",
          marginBottom: "5px",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "17px",
          fontWeight: 700,
          color: accent ? "#059669" : "#111111",
          letterSpacing: "-0.01em",
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AssetDetailPage({ id, onBack }: AssetDetailPageProps) {
  const item = MOCK_OWNED_MEDIA.find((m) => m.id === id);

  if (!item) {
    return (
      <div
        data-ocid="asset_detail.error_state"
        style={{
          minHeight: "100dvh",
          background: "#F8F8F6",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: 24,
        }}
      >
        <p style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>
          Asset not found
        </p>
        <button
          type="button"
          onClick={onBack}
          style={{
            fontSize: 14,
            color: "#059669",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Go back
        </button>
      </div>
    );
  }

  const rc = rarityColor(item.rarity);
  const [editionNum, editionTotal] = item.editionNumber.split("/");

  return (
    <motion.div
      data-ocid="asset_detail.page"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      style={{
        minHeight: "100dvh",
        background: "#F8F8F6",
        paddingBottom: 120,
        overflowX: "hidden",
      }}
    >
      {/* ── Media Viewer ── */}
      <div
        data-ocid="asset_detail.media.panel"
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: item.type === "video" ? "16/9" : "4/3",
          background: "#e8f5f0",
          overflow: "hidden",
        }}
      >
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

        {/* Back button */}
        <button
          data-ocid="asset_detail.back_button"
          type="button"
          onClick={onBack}
          style={{
            position: "absolute",
            top: 56,
            left: 16,
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.60)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
          }}
        >
          <ArrowLeft size={18} color="#111" strokeWidth={2} />
        </button>

        {/* Video play overlay */}
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
                width: 62,
                height: 62,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.24)",
                backdropFilter: "blur(8px)",
                border: "1.5px solid rgba(255,255,255,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
              }}
            >
              <Play
                size={22}
                color="#fff"
                fill="#fff"
                style={{ marginLeft: 3 }}
              />
            </div>
          </div>
        )}

        {/* Duration badge (video) */}
        {item.type === "video" && item.duration && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              right: 12,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(6px)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: 6,
            }}
          >
            {item.duration}
          </div>
        )}

        {/* Full resolution label (photo) */}
        {item.type === "photo" && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(8px)",
              color: "#374151",
              fontSize: 11,
              fontWeight: 500,
              padding: "4px 12px",
              borderRadius: 99,
              whiteSpace: "nowrap",
            }}
          >
            Full Resolution
          </div>
        )}
      </div>

      {/* ── Content Body ── */}
      <div style={{ padding: "20px 16px 0" }}>
        {/* ── Title + Creator ── */}
        <div style={{ marginBottom: "16px" }}>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#111111",
              letterSpacing: "-0.02em",
              marginBottom: "4px",
            }}
          >
            {item.title}
          </h1>
          <div
            style={{
              fontSize: "14px",
              color: "#059669",
              fontWeight: 500,
              marginBottom: "10px",
            }}
          >
            @{item.creator}
          </div>
          <div
            data-ocid="asset_detail.edition.panel"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.22)",
              borderRadius: 99,
              padding: "5px 14px",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 500, color: "#6b7280" }}>
              Edition
            </span>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#059669" }}>
              #{editionNum}/{editionTotal}
            </span>
          </div>
        </div>

        {/* ── Type + Rarity + Badges ── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "7px",
            marginBottom: "22px",
            alignItems: "center",
          }}
        >
          {/* Media type badge */}
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              padding: "4px 10px",
              borderRadius: 99,
              background:
                item.type === "video"
                  ? "rgba(37,99,235,0.10)"
                  : "rgba(16,185,129,0.10)",
              color: item.type === "video" ? "#1d4ed8" : "#059669",
              border:
                item.type === "video"
                  ? "1px solid rgba(37,99,235,0.22)"
                  : "1px solid rgba(16,185,129,0.22)",
            }}
          >
            {item.type === "video" ? "VIDEO" : "PHOTO"}
          </span>

          {/* Rarity badge */}
          {item.rarity && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                padding: "4px 10px",
                borderRadius: 99,
                background: rc.bg,
                color: rc.text,
                border: `1px solid ${rc.border}`,
              }}
            >
              {item.rarity.toUpperCase()}
            </span>
          )}

          {/* Achievement badges */}
          {item.badges.map((badge) => (
            <span
              key={badge}
              style={{
                fontSize: "11px",
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 99,
                background: "rgba(16,185,129,0.08)",
                color: "#059669",
                border: "1px solid rgba(16,185,129,0.22)",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {badgeIcon(badge)}
              {badge}
            </span>
          ))}
        </div>

        {/* ── Scarcity ── */}
        <div
          data-ocid="asset_detail.scarcity.panel"
          style={{ marginBottom: "22px" }}
        >
          <SectionLabel text="Scarcity" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
            }}
          >
            <StatCard
              label="Total Supply"
              value={item.totalSupply.toLocaleString()}
            />
            <StatCard label="Minted" value={item.minted.toLocaleString()} />
            <StatCard
              label="Currently Listed"
              value={item.listed.toLocaleString()}
            />
            <StatCard label="Held" value={item.held.toLocaleString()} />
          </div>
        </div>

        {/* ── Market Data ── */}
        <div
          data-ocid="asset_detail.market.panel"
          style={{ marginBottom: "22px" }}
        >
          <SectionLabel text="Market" />
          <div style={{ display: "flex", gap: "8px" }}>
            <StatCard
              label="Last Sale"
              value={formatUSD(item.lastSalePrice)}
              accent
            />
            <StatCard
              label="Floor Price"
              value={formatUSD(item.floorPrice)}
              accent
            />
            <StatCard
              label="Total Volume"
              value={formatUSD(item.totalVolume)}
              accent
            />
          </div>
        </div>

        {/* ── Activity ── */}
        <div
          data-ocid="asset_detail.activity.panel"
          style={{ marginBottom: "22px" }}
        >
          <SectionLabel text="Activity" />
          <div style={{ display: "flex", gap: "8px" }}>
            <div
              style={{
                flex: 1,
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "14px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Eye size={18} color="#9ca3af" />
              <div>
                <div
                  style={{
                    fontSize: "17px",
                    fontWeight: 700,
                    color: "#111",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {item.views.toLocaleString()}
                </div>
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>Views</div>
              </div>
            </div>
            <div
              style={{
                flex: 1,
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "14px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Heart size={18} color="#f87171" />
              <div>
                <div
                  style={{
                    fontSize: "17px",
                    fontWeight: 700,
                    color: "#111",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {item.favorites.toLocaleString()}
                </div>
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>Saves</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Ownership History ── */}
        <div
          data-ocid="asset_detail.ownership.panel"
          style={{ marginBottom: "22px" }}
        >
          <SectionLabel text="Ownership History" />
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            {item.ownershipHistory.map((entry, idx) => (
              <div
                key={`${entry.address}-${entry.date}`}
                data-ocid={`asset_detail.ownership.item.${idx + 1}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "13px 16px",
                  borderBottom:
                    idx < item.ownershipHistory.length - 1
                      ? "1px solid #f3f4f6"
                      : "none",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#374151",
                    fontFamily: "monospace",
                    letterSpacing: "0.01em",
                  }}
                >
                  {entry.address}
                </div>
                <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                  {new Date(entry.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div
        data-ocid="asset_detail.actions.panel"
        style={{
          position: "fixed",
          bottom: 68,
          left: 0,
          right: 0,
          padding: "12px 16px",
          background: "rgba(248,248,246,0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          zIndex: 50,
        }}
      >
        <button
          data-ocid="asset_detail.list_button"
          type="button"
          style={{
            width: "100%",
            padding: "14px 0",
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
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
            data-ocid="asset_detail.transfer_button"
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
            data-ocid="asset_detail.share_button"
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
  );
}
