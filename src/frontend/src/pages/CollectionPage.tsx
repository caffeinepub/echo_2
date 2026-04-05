import {
  Camera,
  Check,
  ChevronRight,
  Flame,
  Gavel,
  Link2,
  Package,
  Play,
  Star,
  Store,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CollectibleCard } from "../components/CollectibleCard";
import { PackOpeningOverlay } from "../components/PackOpeningOverlay";
import { ReleaseFlowModal } from "../components/ReleaseFlowModal";
import { useAuctions } from "../context/AuctionContext";
import {
  type CollectionNFT,
  type SealedPack,
  useCollection,
} from "../context/CollectionContext";
import { usePackStyle } from "../context/PackStyleContext";

// ─── Constants ────────────────────────────────────────────────────────────────
const MINT = "var(--cycle-accent)";
const MINT_SOFT = "rgba(var(--cycle-accent-rgb),0.12)";
const MINT_TEXT = "var(--cycle-accent)";

const RARITY_COLORS: Record<string, string> = {
  Common: "#9B9B9B",
  Uncommon: "#4A90A4",
  Rare: "#7B6CF6",
  "Ultra Rare": "#C9A84C",
  "Special Illustration Rare": MINT_TEXT,
};

function rarityColor(rarity: string): string {
  return RARITY_COLORS[rarity] ?? MINT_TEXT;
}

function formatDate(isoStr: string): string {
  try {
    return new Date(isoStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoStr;
  }
}

function formatTimestamp(ts: number): string {
  return formatDate(new Date(ts).toISOString());
}

function shortenAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// ─── Set Group type ───────────────────────────────────────────────────────────
interface SetGroup {
  setName: string;
  previewImageUrl: string;
  totalMinted: number;
  sealedCount: number;
  openedCount: number;
  burnedCount: number;
  latestAt: number;
  packs: SealedPack[];
  collectibles: CollectionNFT[];
}

function buildSetGroups(
  sealedPacks: SealedPack[],
  nfts: CollectionNFT[],
): SetGroup[] {
  const map = new Map<string, SetGroup>();

  for (const pack of sealedPacks) {
    const key = pack.setName;
    if (!map.has(key)) {
      map.set(key, {
        setName: key,
        previewImageUrl: "",
        totalMinted: 0,
        sealedCount: 0,
        openedCount: 0,
        burnedCount: 0,
        latestAt: 0,
        packs: [],
        collectibles: [],
      });
    }
    const g = map.get(key)!;
    g.packs.push(pack);
    g.sealedCount += 1;
    g.totalMinted += 1;
    // Use the dedicated cover photo if available (set on first occurrence)
    if (pack.coverPhotoUrl && g.previewImageUrl === "") {
      g.previewImageUrl = pack.coverPhotoUrl;
    }
    if (pack.createdAt > g.latestAt) g.latestAt = pack.createdAt;
  }

  for (const nft of nfts) {
    const key = nft.setName;
    if (!map.has(key)) {
      map.set(key, {
        setName: key,
        previewImageUrl: nft.imageUrl || "",
        totalMinted: 0,
        sealedCount: 0,
        openedCount: 0,
        burnedCount: 0,
        latestAt: 0,
        packs: [],
        collectibles: [],
      });
    }
    const g = map.get(key)!;
    g.collectibles.push(nft);
    g.openedCount += 1;
    g.totalMinted += 1;
    if (g.previewImageUrl === "" && nft.imageUrl) {
      g.previewImageUrl = nft.imageUrl;
    }
    if (nft.addedAt > g.latestAt) g.latestAt = nft.addedAt;
  }

  return Array.from(map.values()).sort((a, b) => b.latestAt - a.latestAt);
}

// ─── Keyframe styles ──────────────────────────────────────────────────────────
const KEYFRAMES = `
  @keyframes vaultPop {
    0%   { transform: scale(1); }
    35%  { transform: scale(1.07); }
    65%  { transform: scale(0.96); }
    100% { transform: scale(1); }
  }
  @keyframes panelReveal {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes mediaModalIn {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes sheetSlideUp {
    from { transform: translateY(100%); opacity: 0.6; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes modalFadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes revealFadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes openingPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  @keyframes burnFadeIn {
    0%   { opacity: 0; transform: translateX(-50%) translateY(8px); }
    15%  { opacity: 1; transform: translateX(-50%) translateY(0); }
    80%  { opacity: 1; transform: translateX(-50%) translateY(0); }
    100% { opacity: 0; transform: translateX(-50%) translateY(0); }
  }
`;

// ─── Vault Tile ───────────────────────────────────────────────────────────────
interface VaultTileProps {
  id: string;
  imageUrl?: string;
  isPack?: boolean;
  mediaType?: "photo" | "video";
  rarity?: string;
  editionNumber?: number;
  isLeader?: boolean;
  isSelected: boolean;
  ocidIndex: number;
  onTap: () => void;
}

function VaultTile({
  id: _id,
  imageUrl,
  isPack,
  mediaType,
  rarity,
  editionNumber,
  isLeader,
  isSelected,
  ocidIndex,
  onTap,
}: VaultTileProps) {
  const [popping, setPopping] = useState(false);

  function handleTap() {
    if (!popping) {
      setPopping(true);
      setTimeout(() => setPopping(false), 350);
    }
    onTap();
  }

  return (
    <button
      type="button"
      data-ocid={`collection.item.${ocidIndex}`}
      onClick={handleTap}
      style={{
        aspectRatio: "4/5",
        borderRadius: isPack ? "0" : "10px",
        overflow: isPack ? "visible" : "hidden",
        border: isPack
          ? "none"
          : `1.5px solid ${isSelected ? "rgba(var(--cycle-accent-rgb) / 0.6)" : "rgba(0,0,0,0.07)"}`,
        boxShadow: isPack
          ? "none"
          : isSelected
            ? "0 0 0 2px rgba(var(--cycle-accent-rgb) / 0.25), 0 4px 16px rgba(0,0,0,0.10)"
            : "0 1px 4px rgba(0,0,0,0.06)",
        background: isPack ? "transparent" : "#fff",
        position: "relative",
        padding: 0,
        cursor: "pointer",
        animation: popping
          ? "vaultPop 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)"
          : undefined,
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        display: "block",
        width: "100%",
      }}
    >
      {/* Image */}
      {isPack ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "8px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#F9F9F7",
          }}
        >
          <img
            src="/assets/generated/minty-pack-wrapper.png"
            alt="Sealed pack"
            style={{
              width: "80%",
              height: "80%",
              objectFit: "contain",
              display: "block",
              filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.14))",
            }}
          />
        </div>
      ) : (
        imageUrl && (
          <img
            src={imageUrl}
            alt="Collectible"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )
      )}

      {/* SEALED badge — top-left for packs */}
      {isPack && (
        <div
          style={{
            position: "absolute",
            top: "5px",
            left: "5px",
            background: "rgba(255,255,255,0.95)",
            borderRadius: "20px",
            padding: "2px 6px",
            border: "1px solid rgba(var(--cycle-accent-rgb) / 0.25)",
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontSize: "8px",
              color: MINT_TEXT,
              fontWeight: 700,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
            }}
          >
            SEALED
          </span>
        </div>
      )}

      {/* Video badge — top-left for NFTs */}
      {!isPack && mediaType === "video" && (
        <div
          style={{
            position: "absolute",
            top: "5px",
            left: "5px",
            background: "rgba(255,255,255,0.90)",
            borderRadius: "20px",
            padding: "2px 5px",
          }}
        >
          <span style={{ fontSize: "9px", color: "rgba(0,0,0,0.6)" }}>▷</span>
        </div>
      )}

      {/* Rarity badge — top-right */}
      {rarity && !isPack && (
        <div
          style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            background: "rgba(255,255,255,0.92)",
            border:
              rarity === "Rare"
                ? "1px solid rgba(var(--cycle-accent-rgb) / 0.35)"
                : "1px solid rgba(0,0,0,0.10)",
            borderRadius: "20px",
            padding: "2px 6px",
          }}
        >
          <span
            style={{
              fontSize: "7px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: rarity === "Rare" ? "var(--cycle-accent)" : "#9B9B9B",
            }}
          >
            {rarity === "Rare" ? "RARE" : "COMMON"}
          </span>
        </div>
      )}

      {/* Leader star — bottom-right */}
      {isLeader && (
        <div
          style={{
            position: "absolute",
            bottom: "5px",
            right: "5px",
            background: "rgba(201,168,76,0.92)",
            borderRadius: "20px",
            padding: "2px 5px",
            display: "flex",
            alignItems: "center",
            gap: "2px",
          }}
        >
          <span style={{ fontSize: "8px", color: "#fff" }}>★</span>
        </div>
      )}

      {/* Edition number — bottom-left */}
      {editionNumber !== undefined && (
        <div
          style={{
            position: "absolute",
            bottom: "5px",
            left: "5px",
            background: "rgba(0,0,0,0.45)",
            borderRadius: "20px",
            padding: "2px 5px",
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontSize: "8px",
              color: "rgba(255,255,255,0.92)",
              fontWeight: 600,
            }}
          >
            #{editionNumber}
          </span>
        </div>
      )}
    </button>
  );
}

// ─── Inline Description Panel ─────────────────────────────────────────────────
interface InlineDescPanelProps {
  type: "pack" | "nft";
  pack?: SealedPack;
  nft?: CollectionNFT;
  burnedCount?: number;
  onClose: () => void;
  onSecondTap: () => void;
  onBurn?: () => void;
}

function InlineDescPanel({
  type,
  pack,
  nft,
  burnedCount = 0,
  onClose,
  onSecondTap,
  onBurn,
}: InlineDescPanelProps) {
  const rc = nft ? rarityColor(nft.rarity) : MINT_TEXT;

  return (
    <div
      data-ocid="collection.panel"
      style={{
        background: "#FFFFFF",
        borderRadius: "12px",
        border: "1px solid rgba(var(--cycle-accent-rgb) / 0.18)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        padding: "14px 14px 16px",
        margin: "4px 0 4px",
        animation: "panelReveal 0.28s cubic-bezier(0.32,0,0.12,1)",
        position: "relative",
      }}
    >
      {/* Close */}
      <button
        type="button"
        data-ocid="collection.close_button"
        onClick={onClose}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "rgba(0,0,0,0.06)",
          border: "none",
          borderRadius: "50%",
          width: "22px",
          height: "22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#666",
          padding: 0,
        }}
      >
        <X size={12} />
      </button>

      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "8px",
          marginBottom: "10px",
          paddingRight: "28px",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#111",
              marginBottom: "2px",
            }}
          >
            {type === "pack" ? "Sealed Pack" : nft?.title}
          </div>
          <div style={{ fontSize: "11px", color: MINT_TEXT, fontWeight: 600 }}>
            {type === "pack" ? pack?.setName : nft?.setName}
          </div>
        </div>
        <div
          style={{
            background: type === "pack" ? MINT_SOFT : "rgba(123,108,246,0.10)",
            color:
              type === "pack"
                ? MINT_TEXT
                : nft?.mediaType === "video"
                  ? "#7B6CF6"
                  : MINT_TEXT,
            borderRadius: "20px",
            padding: "3px 8px",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            flexShrink: 0,
            marginTop: "1px",
          }}
        >
          {type === "pack"
            ? "SEALED"
            : nft?.mediaType === "video"
              ? "VIDEO 30s"
              : "PHOTO"}
        </div>
        {type === "nft" && nft?.rarity && (
          <div
            style={{
              background:
                nft.rarity === "Rare"
                  ? "rgba(var(--cycle-accent-rgb) / 0.10)"
                  : "rgba(0,0,0,0.05)",
              color: nft.rarity === "Rare" ? "var(--cycle-accent)" : "#9B9B9B",
              border:
                nft.rarity === "Rare"
                  ? "1px solid rgba(var(--cycle-accent-rgb) / 0.25)"
                  : "1px solid rgba(0,0,0,0.08)",
              borderRadius: "20px",
              padding: "3px 8px",
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
              flexShrink: 0,
              marginTop: "1px",
            }}
          >
            {nft.rarity === "Rare" ? "RARE" : "COMMON"}
          </div>
        )}
      </div>

      {/* Separator */}
      <div
        style={{
          height: "1px",
          background: "rgba(0,0,0,0.06)",
          marginBottom: "10px",
        }}
      />

      {/* Metadata rows */}
      {type === "pack" && pack && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "6px 12px",
          }}
        >
          <MetaCell
            label="Print"
            value={`#${pack.editionNumber} of ${pack.totalSupply}`}
          />
          <MetaCell label="Contains" value="1 collectible" />
          <MetaCell label="Minted" value={formatTimestamp(pack.createdAt)} />
          <MetaCell
            label="Type"
            value={
              pack.collectibleType === "video" ? "Video Moment" : "Photo Moment"
            }
          />
        </div>
      )}

      {type === "nft" && nft && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "6px 12px",
          }}
        >
          <MetaCell
            label="Print"
            value={`#${nft.editionNumber} of ${nft.totalSupply}`}
          />
          <MetaCell label="Rarity" value={nft.rarity} valueColor={rc} />
          <MetaCell label="Minted" value={String(nft.totalSupply)} />
          <MetaCell label="Burned" value={String(burnedCount)} />
          <MetaCell
            label="Remaining"
            value={String(nft.totalSupply - burnedCount)}
          />
          <MetaCell label="Creator" value={nft.creator} />
        </div>
      )}

      {/* Separator */}
      <div
        style={{
          height: "1px",
          background: "rgba(0,0,0,0.06)",
          margin: "10px 0 8px",
        }}
      />

      {/* Hint */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        <button
          type="button"
          data-ocid="collection.secondary_button"
          onClick={onSecondTap}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            fontSize: "10px",
            color: MINT_TEXT,
            fontWeight: 600,
            letterSpacing: "0.02em",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span>→</span>
          <span>
            {type === "pack"
              ? "Tap again to open pack detail"
              : "Tap again to view full image"}
          </span>
        </button>

        {type === "nft" && onBurn && (
          <button
            type="button"
            data-ocid="collection.delete_button"
            onClick={onBurn}
            style={{
              background: "none",
              border: "none",
              padding: "2px 0",
              cursor: "pointer",
              fontSize: "10px",
              color: "rgba(var(--cycle-accent-rgb) / 0.60)",
              fontWeight: 600,
              letterSpacing: "0.02em",
              display: "flex",
              alignItems: "center",
              gap: "3px",
              flexShrink: 0,
            }}
          >
            <Flame size={9} style={{ opacity: 0.7 }} />
            Burn
          </button>
        )}
      </div>
    </div>
  );
}

function MetaCell({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: "10px",
          color: "#9B9B9B",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          fontWeight: 600,
          marginBottom: "2px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: valueColor ?? "#111",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ─── Tile Row Renderer (3-col grid with inline panel) ─────────────────────────
interface TileItem {
  id: string;
  isPack: boolean;
  pack?: SealedPack;
  nft?: CollectionNFT;
}

function TileRows({
  items,
  selectedTileId,
  ocidOffset,
  burnedCounts,
  onTap,
  onSecondTap,
  onClosePanel,
  onBurn,
}: {
  items: TileItem[];
  selectedTileId: string | null;
  ocidOffset: number;
  burnedCounts: Record<string, number>;
  onTap: (id: string) => void;
  onSecondTap: (id: string) => void;
  onClosePanel: () => void;
  onBurn: (nft: CollectionNFT) => void;
}) {
  const rows: TileItem[][] = [];
  for (let i = 0; i < items.length; i += 3) {
    rows.push(items.slice(i, i + 3));
  }

  return (
    <div>
      {rows.map((row, rowIdx) => {
        const rowHasSelected = row.some((item) => item.id === selectedTileId);
        const selectedItem = rowHasSelected
          ? row.find((item) => item.id === selectedTileId)
          : undefined;

        return (
          <div key={row[0]?.id ?? `row-${rowIdx}`}>
            {/* Tile grid row — position:relative so expanded CollectibleCards (z-50) display above siblings */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
                marginBottom: rowHasSelected ? "0" : "8px",
                position: "relative",
              }}
            >
              {row.map((item, tileIdx) => {
                const globalIdx = rowIdx * 3 + tileIdx;
                // Opened collectibles use the premium CollectibleCard
                if (!item.isPack && item.nft) {
                  return (
                    <CollectibleCard
                      key={item.id}
                      nft={item.nft}
                      ocidIndex={ocidOffset + globalIdx + 1}
                      onViewMedia={() => onSecondTap(item.id)}
                    />
                  );
                }
                // Sealed packs keep the original VaultTile
                return (
                  <VaultTile
                    key={item.id}
                    id={item.id}
                    isPack={item.isPack}
                    imageUrl={
                      item.isPack
                        ? item.pack?.coverPhotoUrl
                        : item.nft?.imageUrl
                    }
                    mediaType={
                      item.isPack
                        ? item.pack?.collectibleType
                        : item.nft?.mediaType
                    }
                    rarity={item.isPack ? undefined : item.nft?.rarity}
                    editionNumber={
                      item.isPack
                        ? item.pack?.editionNumber
                        : item.nft?.editionNumber
                    }
                    isLeader={item.isPack ? false : item.nft?.isLeader}
                    isSelected={item.id === selectedTileId}
                    ocidIndex={ocidOffset + globalIdx + 1}
                    onTap={() => onTap(item.id)}
                  />
                );
              })}

              {/* Fill empty cells in last row */}
              {row.length === 1 && <div />}
              {row.length === 1 && <div />}
              {row.length === 2 && <div />}
            </div>

            {/* Inline panel after matching row */}
            {rowHasSelected && selectedItem && (
              <div style={{ marginBottom: "8px" }}>
                <InlineDescPanel
                  type={selectedItem.isPack ? "pack" : "nft"}
                  pack={selectedItem.pack}
                  nft={selectedItem.nft}
                  burnedCount={
                    selectedItem.nft
                      ? (burnedCounts[selectedItem.nft.id] ?? 0)
                      : 0
                  }
                  onClose={onClosePanel}
                  onSecondTap={() => onSecondTap(selectedItem.id)}
                  onBurn={
                    selectedItem.nft
                      ? () => onBurn(selectedItem.nft!)
                      : undefined
                  }
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Set Section ──────────────────────────────────────────────────────────────
function SetSection({
  group,
  selectedTileId,
  burnedCounts,
  onTap,
  onSecondTap,
  onClosePanel,
  onRelease,
  onBurn,
}: {
  group: SetGroup;
  selectedTileId: string | null;
  burnedCounts: Record<string, number>;
  onTap: (id: string) => void;
  onSecondTap: (id: string) => void;
  onClosePanel: () => void;
  onRelease: (pack: SealedPack, all: SealedPack[]) => void;
  onBurn: (nft: CollectionNFT) => void;
}) {
  const statParts: { text: string; highlight?: boolean }[] = [
    { text: `${group.totalMinted} minted` },
    { text: `${group.sealedCount} sealed`, highlight: group.sealedCount > 0 },
    { text: `${group.openedCount} opened` },
  ];
  if (group.burnedCount > 0) {
    statParts.push({ text: `${group.burnedCount} burned` });
  }

  const packItems: TileItem[] = group.packs.map((p) => ({
    id: p.id,
    isPack: true,
    pack: p,
  }));

  const nftItems: TileItem[] = group.collectibles.map((n) => ({
    id: n.id,
    isPack: false,
    nft: n,
  }));

  return (
    <div>
      {/* Section header */}
      <div
        style={{
          padding: "12px 0 10px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {/* Mint accent bar */}
        <div
          style={{
            width: "3px",
            height: "32px",
            background: MINT,
            borderRadius: "2px",
            flexShrink: 0,
          }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#111",
              marginBottom: "2px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {group.setName}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              flexWrap: "wrap",
            }}
          >
            {statParts.map((part, i) => (
              <span
                key={part.text}
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    color: part.highlight ? MINT_TEXT : "#6B6B6B",
                    fontWeight: part.highlight ? 700 : 400,
                  }}
                >
                  {part.text}
                </span>
                {i < statParts.length - 1 && (
                  <span style={{ fontSize: "11px", color: "#ccc" }}>·</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {group.sealedCount > 0 && (
          <button
            type="button"
            data-ocid="collection.open_modal_button"
            onClick={() => onRelease(group.packs[0], group.packs)}
            style={{
              background: MINT_SOFT,
              color: MINT_TEXT,
              fontSize: "11px",
              padding: "5px 10px",
              borderRadius: "20px",
              border: "1px solid rgba(var(--cycle-accent-rgb) / 0.25)",
              fontWeight: 700,
              cursor: "pointer",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: "4px",
              letterSpacing: "0.01em",
            }}
          >
            <Store size={10} />
            Release
          </button>
        )}
      </div>

      {/* Sealed packs grid */}
      {packItems.length > 0 && (
        <div style={{ marginBottom: "10px" }}>
          <div
            style={{
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.10em",
              color: MINT_TEXT,
              fontWeight: 700,
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Package size={10} />
            SEALED PACKS · {packItems.length}
          </div>
          <TileRows
            items={packItems}
            selectedTileId={selectedTileId}
            ocidOffset={0}
            burnedCounts={burnedCounts}
            onTap={onTap}
            onSecondTap={onSecondTap}
            onClosePanel={onClosePanel}
            onBurn={onBurn}
          />
        </div>
      )}

      {/* Separator between sections */}
      {packItems.length > 0 && nftItems.length > 0 && (
        <div
          style={{
            height: "1px",
            background: "rgba(0,0,0,0.06)",
            margin: "4px 0 12px",
          }}
        />
      )}

      {/* Collectibles grid */}
      {nftItems.length > 0 && (
        <div style={{ marginBottom: "4px" }}>
          <div
            style={{
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.10em",
              color: MINT_TEXT,
              fontWeight: 700,
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Star size={10} />
            COLLECTIBLES · {nftItems.length}
          </div>
          <TileRows
            items={nftItems}
            selectedTileId={selectedTileId}
            ocidOffset={packItems.length}
            burnedCounts={burnedCounts}
            onTap={onTap}
            onSecondTap={onSecondTap}
            onClosePanel={onClosePanel}
            onBurn={onBurn}
          />
        </div>
      )}
    </div>
  );
}

// ─── Media Viewer Modal ───────────────────────────────────────────────────────
function MediaViewerModal({
  nft,
  onClose,
}: {
  nft: CollectionNFT;
  onClose: () => void;
}) {
  const [muted, setMuted] = useState(true);

  return (
    <div
      data-ocid="collection.modal"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.88)",
        backdropFilter: "blur(8px)",
        padding: "24px",
      }}
      aria-label="Media viewer"
    >
      <div
        style={{
          position: "relative",
          animation: "mediaModalIn 0.24s ease",
          maxWidth: "90vw",
          maxHeight: "80vh",
        }}
      >
        {/* Close button */}
        <button
          type="button"
          data-ocid="collection.close_button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "-14px",
            right: "-14px",
            background: "rgba(255,255,255,0.95)",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#333",
            zIndex: 1,
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
          }}
        >
          <X size={15} />
        </button>

        {nft.mediaType === "video" ? (
          <>
            <video
              src={nft.imageUrl}
              autoPlay
              loop
              muted={muted}
              playsInline
              style={{
                maxWidth: "90vw",
                maxHeight: "72vh",
                borderRadius: "12px",
                display: "block",
                objectFit: "contain",
              }}
            />
            {/* Mute toggle */}
            <button
              type="button"
              data-ocid="collection.toggle"
              onClick={() => setMuted((m) => !m)}
              style={{
                position: "absolute",
                bottom: "12px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(255,255,255,0.92)",
                border: "none",
                borderRadius: "20px",
                padding: "6px 14px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#333",
                cursor: "pointer",
                backdropFilter: "blur(4px)",
              }}
            >
              {muted ? "🔇 Tap to unmute" : "🔊 Mute"}
            </button>
          </>
        ) : (
          <img
            src={nft.imageUrl}
            alt={nft.title}
            style={{
              maxWidth: "90vw",
              maxHeight: "80vh",
              borderRadius: "12px",
              display: "block",
              objectFit: "contain",
            }}
          />
        )}
      </div>

      {/* Backdrop tap to close */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Close"
        style={{ position: "absolute", inset: 0, zIndex: -1 }}
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape" || e.key === "Enter") onClose();
        }}
      />
    </div>
  );
}

// ─── Send to Wallet Modal ─────────────────────────────────────────────────────
function SendToWalletModal({
  nft,
  onClose,
  onConfirm,
}: {
  nft: CollectionNFT;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [address, setAddress] = useState("");
  const [transferred, setTransferred] = useState(false);

  function handleConfirm() {
    if (!address.trim()) return;
    setTransferred(true);
    setTimeout(() => {
      onConfirm();
      onClose();
    }, 900);
  }

  return (
    <div
      data-ocid="collection.modal"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label="Close"
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape" || e.key === "Enter") onClose();
        }}
      />
      <div
        style={{
          position: "relative",
          background: "#fff",
          borderRadius: "24px",
          padding: "24px",
          width: "100%",
          maxWidth: "320px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          animation: "modalFadeIn 0.22s ease",
        }}
      >
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "#111",
            marginBottom: "6px",
          }}
        >
          Send to Wallet
        </h3>
        <p style={{ fontSize: "12px", color: "#6B6B6B", marginBottom: "16px" }}>
          {nft.title} · #{nft.editionNumber} of {nft.totalSupply}
        </p>

        {transferred ? (
          <div
            data-ocid="collection.success_state"
            style={{
              textAlign: "center",
              padding: "16px 0",
              color: MINT_TEXT,
              fontSize: "15px",
              fontWeight: 600,
            }}
          >
            ✓ Transferred!
          </div>
        ) : (
          <>
            <input
              data-ocid="collection.input"
              type="text"
              placeholder="Enter wallet address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{
                width: "100%",
                height: "48px",
                border: "1px solid #e0e0e0",
                borderRadius: "12px",
                padding: "0 14px",
                fontSize: "14px",
                color: "#111",
                outline: "none",
                background: "#fafafa",
                marginBottom: "14px",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                data-ocid="collection.cancel_button"
                onClick={onClose}
                style={{
                  flex: 1,
                  height: "44px",
                  borderRadius: "10px",
                  border: `1.5px solid ${MINT}`,
                  background: "transparent",
                  color: MINT_TEXT,
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                data-ocid="collection.confirm_button"
                onClick={handleConfirm}
                disabled={!address.trim()}
                style={{
                  flex: 1,
                  height: "44px",
                  borderRadius: "10px",
                  border: "none",
                  background: address.trim()
                    ? "linear-gradient(160deg, var(--cycle-accent), #3BA882)"
                    : "#e0e0e0",
                  color: address.trim() ? "#fff" : "#aaa",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: address.trim() ? "pointer" : "not-allowed",
                }}
              >
                Confirm Transfer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── NFT Detail Sheet ─────────────────────────────────────────────────────────
function SendToAuctionButton({ nft }: { nft: CollectionNFT }) {
  const { isListed, createAuction } = useAuctions();
  const { activeStyle } = usePackStyle();
  const aR = activeStyle.accentR;
  const aG = activeStyle.accentG;
  const aB = activeStyle.accentB;
  const accentRgb = `${aR},${aG},${aB}`;
  const accentSolid = `rgb(${accentRgb})`;
  const accentBg = `rgba(${accentRgb},0.09)`;
  const accentBorder = `rgba(${accentRgb},0.28)`;
  const accentText = `rgba(${Math.round(aR * 0.55)},${Math.round(aG * 0.55)},${Math.round(aB * 0.55)},1)`;
  const accentGradient = `linear-gradient(135deg, rgb(${accentRgb}) 0%, rgba(${Math.round(aR * 0.78)},${Math.round(aG * 0.78)},${Math.round(aB * 0.78)},1) 100%)`;
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const listed = isListed(nft.id);

  // Only video NFTs are eligible for auction
  if (nft.mediaType !== "video") {
    return (
      <div
        style={{
          width: "100%",
          padding: "10px 0",
          textAlign: "center",
          fontSize: "12px",
          color: "#9ca3af",
          letterSpacing: "0.01em",
        }}
      >
        Auctions are available for video NFTs only
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        data-ocid="collection.secondary_button"
        disabled={listed}
        onClick={() => !listed && setShowAuctionModal(true)}
        style={{
          width: "100%",
          height: "48px",
          borderRadius: "12px",
          background: "transparent",
          border: listed
            ? "1.5px solid rgba(var(--cycle-accent-rgb) / 0.20)"
            : `1.5px solid ${MINT}`,
          color: listed ? "rgba(var(--cycle-accent-rgb) / 0.40)" : MINT_TEXT,
          fontSize: "14px",
          fontWeight: 600,
          cursor: listed ? "not-allowed" : "pointer",
          letterSpacing: "0.02em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          opacity: listed ? 0.6 : 1,
        }}
      >
        <Gavel size={14} />
        {listed ? "Listed in Market" : "Send to Auction"}
      </button>
      {showAuctionModal && (
        <SendToAuctionModal
          nft={nft}
          onClose={() => setShowAuctionModal(false)}
          onConfirm={() => {
            createAuction(nft);
            setShowAuctionModal(false);
          }}
          accentRgb={accentRgb}
          accentSolid={accentSolid}
          accentBg={accentBg}
          accentBorder={accentBorder}
          accentText={accentText}
          accentGradient={accentGradient}
        />
      )}
    </>
  );
}

// ─── Send To Auction Modal ────────────────────────────────────────────────────

function SlideToConfirmAuction({
  onConfirm,
  disabled,
  accentRgb,
  accentSolid,
  accentGradient,
  accentBorder,
  accentText,
}: {
  onConfirm: () => void;
  disabled: boolean;
  accentRgb: string;
  accentSolid: string;
  accentGradient: string;
  accentBorder: string;
  accentText: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [knobX, setKnobX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const dragStart = useRef<{ pointerX: number; startKnob: number } | null>(
    null,
  );

  const TRACK_HEIGHT = 56;
  const KNOB_SIZE = 44;
  const KNOB_PADDING = 6;

  const getMaxX = useCallback(() => {
    if (!trackRef.current) return 200;
    return trackRef.current.offsetWidth - KNOB_SIZE - KNOB_PADDING * 2;
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || isComplete) return;
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setIsDragging(true);
      dragStart.current = { pointerX: e.clientX, startKnob: knobX };
    },
    [disabled, isComplete, knobX],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !dragStart.current) return;
      const delta = e.clientX - dragStart.current.pointerX;
      const newX = Math.max(
        0,
        Math.min(dragStart.current.startKnob + delta, getMaxX()),
      );
      setKnobX(newX);
      const maxX = getMaxX();
      if (newX >= maxX * 0.85) {
        setKnobX(maxX);
        setIsComplete(true);
        setIsDragging(false);
        dragStart.current = null;
        setTimeout(onConfirm, 300);
      }
    },
    [isDragging, getMaxX, onConfirm],
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    dragStart.current = null;
    if (!isComplete) setKnobX(0);
  }, [isDragging, isComplete]);

  const maxX = typeof window !== "undefined" ? getMaxX() : 200;
  const progress = maxX > 0 ? knobX / maxX : 0;
  const labelOpacity = Math.max(0, 1 - progress * 2.5);

  return (
    <div
      ref={trackRef}
      style={{
        position: "relative",
        height: TRACK_HEIGHT,
        borderRadius: TRACK_HEIGHT / 2,
        background: `linear-gradient(135deg, rgba(${accentRgb},0.15) 0%, rgba(${accentRgb},0.22) 100%)`,
        border: `1.5px solid ${accentBorder}`,
        overflow: "hidden",
        userSelect: "none",
        cursor: "default",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: "100%",
          width: `${KNOB_PADDING + KNOB_SIZE / 2 + knobX}px`,
          background: accentGradient,
          borderRadius: TRACK_HEIGHT / 2,
          opacity: isComplete ? 1 : 0.6,
          transition: isDragging
            ? "none"
            : "width 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          opacity: labelOpacity,
          transition: "opacity 0.1s",
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: accentText,
            letterSpacing: "0.01em",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {!isComplete && <ChevronRight size={14} color={accentText} />}
          Slide to confirm
        </span>
      </div>
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          position: "absolute",
          top: KNOB_PADDING,
          left: KNOB_PADDING + knobX,
          width: KNOB_SIZE,
          height: KNOB_SIZE,
          borderRadius: "50%",
          background: isComplete ? accentSolid : "#fff",
          boxShadow: isComplete
            ? `0 0 0 3px rgba(${accentRgb},0.30), 0 4px 16px rgba(${accentRgb},0.45)`
            : "0 2px 10px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: isDragging ? "grabbing" : "grab",
          transition: isDragging
            ? "none"
            : "left 0.35s cubic-bezier(0.34,1.56,0.64,1), background 0.2s, box-shadow 0.2s",
          touchAction: "none",
          zIndex: 2,
        }}
      >
        {isComplete ? (
          <Check size={20} color="#fff" strokeWidth={2.5} />
        ) : (
          <ChevronRight size={20} color={accentSolid} strokeWidth={2.5} />
        )}
      </div>
    </div>
  );
}

function SendToAuctionModal({
  nft,
  onClose,
  onConfirm,
  accentRgb,
  accentSolid,
  accentBg,
  accentBorder,
  accentText,
  accentGradient,
}: {
  nft: CollectionNFT;
  onClose: () => void;
  onConfirm: () => void;
  accentRgb: string;
  accentSolid: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  accentGradient: string;
}) {
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  function handleConfirm() {
    setConfirmed(true);
    setTimeout(() => {
      onConfirm();
    }, 1200);
  }

  return (
    <div
      data-ocid="collection.auction_modal"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
      }}
    >
      {/* Backdrop */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Close"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape" || e.key === "Enter") onClose();
        }}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      />

      <div
        style={{
          position: "relative",
          background: "#FCFCFC",
          borderRadius: 24,
          width: "100%",
          maxWidth: 400,
          maxHeight: "92dvh",
          overflowY: "auto",
          boxShadow: `0 0 0 1px ${accentBorder}, 0 24px 60px rgba(0,0,0,0.25)`,
          animation: "modalFadeIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Close */}
        <button
          type="button"
          data-ocid="collection.close_button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "rgba(255,255,255,0.92)",
            border: "none",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,0.14)",
          }}
        >
          <X size={16} color="#374151" />
        </button>

        {/* NFT image */}
        <div
          style={{
            position: "relative",
            aspectRatio: "4/5",
            overflow: "hidden",
            background: "#e8e8e4",
            borderRadius: "24px 24px 0 0",
          }}
        >
          <img
            src={nft.imageUrl}
            alt={nft.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.60) 100%)",
              pointerEvents: "none",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: "18px 18px 16px",
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.70)",
                margin: "0 0 4px",
                fontWeight: 500,
              }}
            >
              {nft.setName}
            </p>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#fff",
                margin: 0,
                lineHeight: 1.1,
                fontFamily: "var(--font-brand)",
              }}
            >
              {nft.title}
            </h2>
          </div>
        </div>

        {/* Content */}
        {confirmed ? (
          <div
            data-ocid="collection.success_state"
            style={{ padding: "32px 24px 40px", textAlign: "center" }}
          >
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                background: accentGradient,
                margin: "0 auto 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 0 6px rgba(${accentRgb},0.22)`,
                animation: "successBounce 0.55s cubic-bezier(0.34,1.56,0.64,1)",
              }}
            >
              <Check size={30} color="#fff" strokeWidth={2.5} />
            </div>
            <p
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "#111",
                margin: "0 0 6px",
              }}
            >
              Listed in Minty Market!
            </p>
            <p style={{ fontSize: 13, color: "#6b7280" }}>
              Your NFT is now live in the auction market.
            </p>
          </div>
        ) : (
          <div style={{ padding: "20px 20px 28px" }}>
            <h3
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "#111",
                margin: "0 0 18px",
                fontFamily: "var(--font-brand)",
                lineHeight: 1.1,
              }}
            >
              Send to Auction
            </h3>

            {/* Listing fee */}
            <div
              style={{
                background: accentBg,
                border: `1.5px solid ${accentBorder}`,
                borderRadius: 14,
                padding: "14px 16px",
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                Auction listing fee
              </span>
              <span
                style={{ fontSize: 18, fontWeight: 800, color: accentSolid }}
              >
                $100
              </span>
            </div>

            {/* Duration */}
            <div
              style={{
                background: "rgba(0,0,0,0.04)",
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 12, color: "#6b7280" }}>⏱</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
                Duration: 24 hours
              </span>
            </div>

            {/* Description */}
            <p
              style={{
                fontSize: 13,
                color: "#6b7280",
                lineHeight: 1.6,
                marginBottom: 20,
              }}
            >
              This NFT will be listed in the Minty Market as a timed auction.
              Users will place bids. Highest bid at end of auction wins.
            </p>

            {/* Auction rules */}
            <div
              style={{
                height: 1,
                background: "rgba(0,0,0,0.07)",
                marginBottom: 16,
              }}
            />
            <div style={{ marginBottom: 20 }}>
              {[
                "Only NFTs opened from packs can be listed",
                "Highest bid wins at end of auction",
                "Auction cannot be canceled after first bid",
                "$100 fee will be deducted from your wallet",
              ].map((rule) => (
                <div
                  key={rule}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: accentSolid,
                      marginTop: 1,
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </span>
                  <span
                    style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.45 }}
                  >
                    {rule}
                  </span>
                </div>
              ))}
            </div>

            <SlideToConfirmAuction
              onConfirm={handleConfirm}
              disabled={false}
              accentRgb={accentRgb}
              accentSolid={accentSolid}
              accentGradient={accentGradient}
              accentBorder={accentBorder}
              accentText={accentText}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function NFTDetailSheet({
  nft,
  burnedCount,
  onClose,
  onRemove,
  onBurnConfirm,
}: {
  nft: CollectionNFT;
  burnedCount: number;
  onClose: () => void;
  onRemove: (id: string) => void;
  onBurnConfirm: () => void;
}) {
  const [showSendModal, setShowSendModal] = useState(false);
  const [showBurnConfirm, setShowBurnConfirm] = useState(false);

  return (
    <>
      <div
        data-ocid="collection.sheet"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 350,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <div
          role="button"
          tabIndex={0}
          aria-label="Close"
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(4px)",
          }}
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Enter") onClose();
          }}
        />

        <div
          style={{
            position: "relative",
            background: "#F7F6F2",
            borderRadius: "24px 24px 0 0",
            maxHeight: "92vh",
            overflowY: "auto",
            boxShadow: "0 -4px 32px rgba(0,0,0,0.14)",
            animation: "sheetSlideUp 0.32s cubic-bezier(0.32,0,0.12,1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              paddingTop: "12px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "4px",
                borderRadius: "2px",
                background: "rgba(0,0,0,0.15)",
              }}
            />
          </div>

          <button
            type="button"
            data-ocid="collection.close_button"
            onClick={onClose}
            style={{
              position: "absolute",
              top: "14px",
              right: "16px",
              background: "rgba(0,0,0,0.07)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#555",
            }}
          >
            <X size={16} />
          </button>

          <div style={{ padding: "16px 20px 40px" }}>
            <div
              style={{
                borderRadius: "12px",
                overflow: "hidden",
                position: "relative",
                marginBottom: "20px",
                background: "#e8e8e4",
                aspectRatio: "4/5",
              }}
            >
              <img
                src={nft.imageUrl}
                alt={nft.title}
                style={{
                  width: "100%",
                  height: "100%",
                  display: "block",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "rgba(255,255,255,0.88)",
                  borderRadius: "20px",
                  padding: "3px 8px",
                }}
              >
                {nft.mediaType === "video" ? (
                  <Play size={10} style={{ color: "rgba(0,0,0,0.6)" }} />
                ) : (
                  <Camera size={10} style={{ color: "rgba(0,0,0,0.6)" }} />
                )}
                <span
                  style={{
                    fontSize: "10px",
                    color: "rgba(0,0,0,0.6)",
                    fontWeight: 600,
                    textTransform: "capitalize",
                  }}
                >
                  {nft.mediaType}
                </span>
              </div>
            </div>

            <h2
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "#111",
                margin: "0 0 8px",
                fontFamily: "var(--font-brand)",
                lineHeight: 1.1,
              }}
            >
              {nft.title}
            </h2>

            <span
              style={{
                display: "inline-block",
                background: MINT_SOFT,
                color: MINT_TEXT,
                borderRadius: "20px",
                padding: "3px 10px",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                marginBottom: "20px",
              }}
            >
              {nft.setName}
            </span>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: "24px",
              }}
            >
              {[
                {
                  label: "Print",
                  value: `#${nft.editionNumber} of ${nft.totalSupply}`,
                },
                { label: "Total Minted", value: String(nft.totalSupply) },
                { label: "Total Burned", value: String(burnedCount) },
                {
                  label: "Remaining",
                  value: String(nft.totalSupply - burnedCount),
                },
                {
                  label: "Type",
                  value:
                    nft.mediaType === "photo"
                      ? "Photo Moment"
                      : "Video Moment (30s)",
                },
                {
                  label: "Rarity",
                  value: nft.rarity,
                  valueColor: rarityColor(nft.rarity),
                },
                { label: "Creator", value: nft.creator },
                { label: "Mint Date", value: formatDate(nft.mintDate) },
                { label: "Owners", value: String(nft.owners.length) },
                {
                  label: "Views",
                  value:
                    nft.views >= 1000
                      ? `${(nft.views / 1000).toFixed(1)}k`
                      : String(nft.views),
                },
              ].map(({ label, value, valueColor }) => (
                <div
                  key={label}
                  style={{
                    background: "#fff",
                    borderRadius: "10px",
                    padding: "10px 12px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#9B9B9B",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: "3px",
                      fontWeight: 600,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: valueColor ?? "#111",
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {nft.hasOwnershipHistory && nft.owners.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <h3
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#111",
                    marginBottom: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Ownership History
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {nft.owners.map((owner, position) => (
                    <div
                      key={`owner-${position + 1}`}
                      data-ocid={`collection.row.${position + 1}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        background: "#fff",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div
                        style={{
                          width: "26px",
                          height: "26px",
                          borderRadius: "50%",
                          background: MINT_SOFT,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "10px",
                            color: MINT_TEXT,
                            fontWeight: 700,
                          }}
                        >
                          {position + 1}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#444",
                          fontFamily: "monospace",
                        }}
                      >
                        {shortenAddress(owner)}
                      </span>
                      {position === 0 && (
                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: "10px",
                            color: MINT_TEXT,
                            fontWeight: 600,
                            background: MINT_SOFT,
                            borderRadius: "20px",
                            padding: "2px 7px",
                          }}
                        >
                          Current
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <SendToAuctionButton nft={nft} />

              <button
                type="button"
                data-ocid="collection.primary_button"
                onClick={() => setShowSendModal(true)}
                style={{
                  width: "100%",
                  height: "48px",
                  borderRadius: "12px",
                  border: "none",
                  background:
                    "linear-gradient(160deg, var(--cycle-accent), #3BA882)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  letterSpacing: "0.02em",
                }}
              >
                Send to Wallet
              </button>

              <button
                type="button"
                data-ocid="collection.delete_button"
                onClick={() => setShowBurnConfirm(true)}
                style={{
                  width: "100%",
                  height: "44px",
                  borderRadius: "12px",
                  background: "transparent",
                  border: "1.5px solid rgba(var(--cycle-accent-rgb) / 0.40)",
                  color: MINT_TEXT,
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  letterSpacing: "0.02em",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <Flame size={13} style={{ opacity: 0.8 }} />
                Burn Collectible
              </button>

              <button
                type="button"
                disabled
                title="Coming soon"
                style={{
                  width: "100%",
                  height: "44px",
                  borderRadius: "12px",
                  background: "transparent",
                  border: "1.5px solid rgba(var(--cycle-accent-rgb) / 0.20)",
                  color: "rgba(var(--cycle-accent-rgb) / 0.35)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "not-allowed",
                  letterSpacing: "0.02em",
                }}
              >
                List for Sale · Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSendModal && (
        <SendToWalletModal
          nft={nft}
          onClose={() => setShowSendModal(false)}
          onConfirm={() => {
            onRemove(nft.id);
            onClose();
          }}
        />
      )}

      {showBurnConfirm && (
        <BurnConfirmModal
          nft={nft}
          onClose={() => setShowBurnConfirm(false)}
          onConfirm={() => {
            setShowBurnConfirm(false);
            onBurnConfirm();
          }}
        />
      )}
    </>
  );
}

// ─── Burn Confirm Modal ───────────────────────────────────────────────────────
function BurnConfirmModal({
  nft,
  onClose,
  onConfirm,
}: {
  nft: CollectionNFT;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      data-ocid="collection.modal"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label="Close"
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape" || e.key === "Enter") onClose();
        }}
      />
      <div
        style={{
          position: "relative",
          background: "#fff",
          borderRadius: "24px",
          padding: "24px",
          width: "100%",
          maxWidth: "320px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          animation: "modalFadeIn 0.22s ease",
        }}
      >
        {/* Title */}
        <h3
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "#111",
            marginBottom: "6px",
            fontFamily: "var(--font-brand)",
            lineHeight: 1.1,
          }}
        >
          Burn Collectible?
        </h3>
        <p style={{ fontSize: "12px", color: "#6B6B6B", marginBottom: "14px" }}>
          {nft.title} · #{nft.editionNumber} of {nft.totalSupply}
        </p>

        {/* Info box */}
        <div
          style={{
            background: MINT_SOFT,
            border: "1px solid rgba(var(--cycle-accent-rgb) / 0.25)",
            borderRadius: "12px",
            padding: "12px 14px",
            marginBottom: "18px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          {[
            "This permanently removes the collectible from your vault.",
            "Burning reduces total circulating supply of this collectible.",
            "This action cannot be undone.",
          ].map((line) => (
            <div
              key={line}
              style={{
                fontSize: "12px",
                color: "#444",
                lineHeight: 1.5,
                display: "flex",
                alignItems: "flex-start",
                gap: "6px",
              }}
            >
              <span
                style={{ color: MINT_TEXT, marginTop: "1px", flexShrink: 0 }}
              >
                ·
              </span>
              <span>{line}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            data-ocid="collection.cancel_button"
            onClick={onClose}
            style={{
              flex: 1,
              height: "44px",
              borderRadius: "10px",
              border: `1.5px solid ${MINT}`,
              background: "transparent",
              color: MINT_TEXT,
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            data-ocid="collection.confirm_button"
            onClick={onConfirm}
            style={{
              flex: 1,
              height: "44px",
              borderRadius: "10px",
              border: "none",
              background:
                "linear-gradient(160deg, var(--cycle-accent), #3BA882)",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <Flame size={13} />
            Burn Collectible
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onGoToLibrary }: { onGoToLibrary?: () => void }) {
  return (
    <div
      data-ocid="collection.empty_state"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 32px",
        gap: "12px",
      }}
    >
      <svg
        width="52"
        height="52"
        viewBox="0 0 52 52"
        fill="none"
        aria-hidden="true"
        style={{ opacity: 0.45 }}
      >
        <rect
          x="4"
          y="4"
          width="19"
          height="19"
          rx="4"
          stroke={MINT}
          strokeWidth="1.8"
        />
        <rect
          x="29"
          y="4"
          width="19"
          height="19"
          rx="4"
          stroke={MINT}
          strokeWidth="1.8"
        />
        <rect
          x="4"
          y="29"
          width="19"
          height="19"
          rx="4"
          stroke={MINT}
          strokeWidth="1.8"
        />
        <rect
          x="29"
          y="29"
          width="19"
          height="19"
          rx="4"
          stroke={MINT}
          strokeWidth="1.8"
        />
      </svg>
      <div
        style={{
          fontSize: "16px",
          fontWeight: 600,
          color: "#111",
          textAlign: "center",
        }}
      >
        No collectibles yet
      </div>
      <div
        style={{
          fontSize: "13px",
          color: "#6B6B6B",
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        Mint a Moment to start your collection
      </div>
      {onGoToLibrary && (
        <button
          type="button"
          data-ocid="collection.primary_button"
          onClick={onGoToLibrary}
          style={{
            marginTop: "8px",
            background: "transparent",
            border: `1.5px solid ${MINT}`,
            color: MINT_TEXT,
            borderRadius: "10px",
            padding: "8px 20px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: "0.02em",
          }}
        >
          Go to Library
        </button>
      )}
    </div>
  );
}

// ─── Main CollectionPage ──────────────────────────────────────────────────────
export function CollectionPage({
  onGoToLibrary,
}: {
  onGoToLibrary?: () => void;
}) {
  const { nfts, sealedPacks, burnedCounts, openPack, removeNFT, burnNFT } =
    useCollection();

  // First tap: select tile → show inline panel (for NFTs)
  // For sealed packs: first tap immediately opens overlay
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  // For opened NFTs: second tap opens detail sheet
  const [secondTapId, setSecondTapId] = useState<string | null>(null);

  // Pack opening overlay state
  const [openingPackId, setOpeningPackId] = useState<string | null>(null);
  const [openingNFT, setOpeningNFT] = useState<CollectionNFT | null>(null);
  const [isOpeningPack, setIsOpeningPack] = useState(false);

  const [releaseModalData, setReleaseModalData] = useState<{
    pack: SealedPack;
    all: SealedPack[];
  } | null>(null);
  // Burn state
  const [burnTarget, setBurnTarget] = useState<CollectionNFT | null>(null);
  const [showBurnConfirm, setShowBurnConfirm] = useState(false);
  const [burnFeedback, setBurnFeedback] = useState(false);

  const setGroups = buildSetGroups(sealedPacks, nfts);
  const isEmpty = setGroups.length === 0;

  function handleTap(id: string) {
    // Check if tapped item is a sealed pack
    const tappedPack = sealedPacks.find((p) => p.id === id);
    if (tappedPack) {
      // First tap on sealed pack → immediately open overlay and call backend
      setOpeningPackId(id);
      setIsOpeningPack(true);
      setOpeningNFT(null);
      openPack(id)
        .then((nft) => {
          setOpeningNFT(nft);
          setIsOpeningPack(false);
        })
        .catch(() => {
          setIsOpeningPack(false);
          setOpeningPackId(null);
        });
      return;
    }

    // For opened NFTs: existing double-tap pattern
    if (selectedTileId !== id) {
      setSelectedTileId(id);
    } else {
      setSecondTapId(id);
    }
  }

  function handleSecondTap(id: string) {
    setSecondTapId(id);
  }

  function handleClosePanel() {
    setSelectedTileId(null);
  }

  function closeOpeningOverlay() {
    setOpeningNFT(null);
    setOpeningPackId(null);
    setIsOpeningPack(false);
  }

  // Resolve secondTapId to the actual item (only NFTs use this now)
  const secondTapNFT = secondTapId
    ? (nfts.find((n) => n.id === secondTapId) ?? null)
    : null;

  function clearSecondTap() {
    setSecondTapId(null);
    setSelectedTileId(null);
  }

  function handleBurnRequest(nft: CollectionNFT) {
    setBurnTarget(nft);
    setShowBurnConfirm(true);
  }

  function handleBurnConfirm() {
    if (!burnTarget) return;
    burnNFT(burnTarget.id);
    setShowBurnConfirm(false);
    setBurnTarget(null);
    clearSecondTap();
    setBurnFeedback(true);
  }

  // Auto-dismiss burn feedback banner after 2.5s
  useEffect(() => {
    if (!burnFeedback) return;
    const t = setTimeout(() => setBurnFeedback(false), 2500);
    return () => clearTimeout(t);
  }, [burnFeedback]);

  // Unused var suppression
  void Link2;

  return (
    <div
      data-ocid="collection.page"
      style={{
        background: "#F7F6F2",
        minHeight: "100%",
        padding: "16px 14px 100px",
      }}
    >
      <style>{KEYFRAMES}</style>

      {/* Page header */}
      <div style={{ marginBottom: "20px" }}>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "#111",
            margin: 0,
            fontFamily: "var(--font-brand)",
            lineHeight: 1.1,
          }}
        >
          Collection
        </h1>
        <p style={{ fontSize: "12px", color: "#6B6B6B", margin: "3px 0 0" }}>
          Your digital vault
        </p>
      </div>

      {isEmpty ? (
        <EmptyState onGoToLibrary={onGoToLibrary} />
      ) : (
        <div>
          {setGroups.map((group, groupIdx) => (
            <div key={group.setName}>
              <SetSection
                group={group}
                selectedTileId={selectedTileId}
                burnedCounts={burnedCounts}
                onTap={handleTap}
                onSecondTap={handleSecondTap}
                onClosePanel={handleClosePanel}
                onRelease={(pack, all) => setReleaseModalData({ pack, all })}
                onBurn={handleBurnRequest}
              />
              {/* Separator between sets */}
              {groupIdx < setGroups.length - 1 && (
                <div
                  style={{
                    height: 1,
                    background: "rgba(0,0,0,0.06)",
                    margin: "20px 0 16px",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pack opening overlay — opens immediately on first tap of sealed pack */}
      {openingPackId && (
        <PackOpeningOverlay
          pack={
            sealedPacks.find((p) => p.id === openingPackId) ?? sealedPacks[0]
          }
          nft={openingNFT}
          isLoading={isOpeningPack}
          onComplete={(nft) => {
            void nft;
            closeOpeningOverlay();
          }}
          onClose={closeOpeningOverlay}
        />
      )}

      {/* NFT detail sheet — second tap on opened NFT */}
      {secondTapNFT &&
        (secondTapNFT.mediaType === "video" ? (
          <MediaViewerModal nft={secondTapNFT} onClose={clearSecondTap} />
        ) : (
          <NFTDetailSheet
            nft={secondTapNFT}
            burnedCount={burnedCounts[secondTapNFT.id] ?? 0}
            onClose={clearSecondTap}
            onRemove={(id) => {
              removeNFT(id);
              clearSecondTap();
            }}
            onBurnConfirm={() => {
              burnNFT(secondTapNFT.id);
              clearSecondTap();
              setBurnFeedback(true);
            }}
          />
        ))}

      {/* Release to Market modal */}
      {releaseModalData && (
        <ReleaseFlowModal
          open={!!releaseModalData}
          onClose={() => setReleaseModalData(null)}
          pack={releaseModalData.pack}
          allPacksInSet={releaseModalData.all}
        />
      )}

      {/* Burn confirm modal — triggered from inline panel */}
      {showBurnConfirm && burnTarget && (
        <BurnConfirmModal
          nft={burnTarget}
          onClose={() => {
            setShowBurnConfirm(false);
            setBurnTarget(null);
          }}
          onConfirm={handleBurnConfirm}
        />
      )}

      {/* Burn feedback banner */}
      {burnFeedback && (
        <div
          data-ocid="collection.toast"
          style={{
            position: "fixed",
            bottom: "90px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 600,
            background: "#fff",
            border: "1px solid rgba(var(--cycle-accent-rgb) / 0.35)",
            borderRadius: "100px",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            gap: "7px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
            animation: "burnFadeIn 2.5s ease forwards",
            whiteSpace: "nowrap",
          }}
        >
          <Flame size={13} style={{ color: MINT_TEXT, opacity: 0.8 }} />
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: MINT_TEXT,
              letterSpacing: "0.01em",
            }}
          >
            Collectible burned
          </span>
        </div>
      )}
    </div>
  );
}
