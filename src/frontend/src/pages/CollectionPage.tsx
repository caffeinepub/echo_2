import { Camera, Link2, Package, Play, Star, Store, X } from "lucide-react";
import { useState } from "react";
import { ReleaseFlowModal } from "../components/ReleaseFlowModal";
import {
  type CollectionNFT,
  type SealedPack,
  useCollection,
} from "../context/CollectionContext";

// ─── Constants ────────────────────────────────────────────────────────────────
const MINT = "oklch(0.70 0.18 160)";
const MINT_SOFT = "rgba(52,168,132,0.12)";
const MINT_TEXT = "#34a884";
const PACK_IMAGE =
  "/assets/comfyui_00009-019d510a-371e-750b-b780-72fcb79d8ba5.png";

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
        previewImageUrl: PACK_IMAGE,
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
    if (pack.createdAt > g.latestAt) g.latestAt = pack.createdAt;
  }

  for (const nft of nfts) {
    const key = nft.setName;
    if (!map.has(key)) {
      map.set(key, {
        setName: key,
        previewImageUrl: nft.imageUrl || PACK_IMAGE,
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
    if (g.previewImageUrl === PACK_IMAGE && nft.imageUrl) {
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

  const rc = rarity ? rarityColor(rarity) : MINT_TEXT;

  return (
    <button
      type="button"
      data-ocid={`collection.item.${ocidIndex}`}
      onClick={handleTap}
      style={{
        aspectRatio: "4/5",
        borderRadius: "10px",
        overflow: "hidden",
        border: `1.5px solid ${isSelected ? "rgba(52,168,132,0.6)" : "rgba(0,0,0,0.07)"}`,
        boxShadow: isSelected
          ? "0 0 0 2px rgba(52,168,132,0.25), 0 4px 16px rgba(0,0,0,0.10)"
          : "0 1px 4px rgba(0,0,0,0.06)",
        background: isPack
          ? "linear-gradient(135deg, rgba(52,168,132,0.15), rgba(42,144,112,0.08))"
          : "#fff",
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
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            inset: 0,
          }}
        >
          <img
            src={PACK_IMAGE}
            alt="Sealed Pack"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "drop-shadow(0 3px 8px rgba(52,168,132,0.22))",
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
            border: "1px solid rgba(52,168,132,0.25)",
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

      {/* Rarity dot — top-right */}
      {rarity && (
        <div
          style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: rc,
            boxShadow: `0 0 4px ${rc}88`,
          }}
        />
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
  onClose: () => void;
  onSecondTap: () => void;
}

function InlineDescPanel({
  type,
  pack,
  nft,
  onClose,
  onSecondTap,
}: InlineDescPanelProps) {
  const rc = nft ? rarityColor(nft.rarity) : MINT_TEXT;

  return (
    <div
      data-ocid="collection.panel"
      style={{
        background: "#FFFFFF",
        borderRadius: "12px",
        border: "1px solid rgba(52,168,132,0.18)",
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
              ? "VIDEO"
              : "PHOTO"}
        </div>
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
            label="Edition"
            value={`#${nft.editionNumber} of ${nft.totalSupply}`}
          />
          <MetaCell label="Rarity" value={nft.rarity} valueColor={rc} />
          <MetaCell label="Creator" value={nft.creator} />
          <MetaCell label="Minted" value={formatDate(nft.mintDate)} />
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
  onTap,
  onSecondTap,
  onClosePanel,
}: {
  items: TileItem[];
  selectedTileId: string | null;
  ocidOffset: number;
  onTap: (id: string) => void;
  onSecondTap: (id: string) => void;
  onClosePanel: () => void;
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
            {/* Tile grid row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
                marginBottom: rowHasSelected ? "0" : "8px",
              }}
            >
              {row.map((item, tileIdx) => {
                const globalIdx = rowIdx * 3 + tileIdx;
                return (
                  <VaultTile
                    key={item.id}
                    id={item.id}
                    isPack={item.isPack}
                    imageUrl={item.isPack ? undefined : item.nft?.imageUrl}
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
                  onClose={onClosePanel}
                  onSecondTap={() => onSecondTap(selectedItem.id)}
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
  onTap,
  onSecondTap,
  onClosePanel,
  onRelease,
}: {
  group: SetGroup;
  selectedTileId: string | null;
  onTap: (id: string) => void;
  onSecondTap: (id: string) => void;
  onClosePanel: () => void;
  onRelease: (pack: SealedPack, all: SealedPack[]) => void;
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
              border: "1px solid rgba(52,168,132,0.25)",
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
            onTap={onTap}
            onSecondTap={onSecondTap}
            onClosePanel={onClosePanel}
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
            onTap={onTap}
            onSecondTap={onSecondTap}
            onClosePanel={onClosePanel}
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
                    ? "linear-gradient(160deg, #34A884, #2a9070)"
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
function NFTDetailSheet({
  nft,
  onClose,
  onRemove,
}: {
  nft: CollectionNFT;
  onClose: () => void;
  onRemove: (id: string) => void;
}) {
  const [showSendModal, setShowSendModal] = useState(false);

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
                fontSize: "20px",
                fontWeight: 700,
                color: "#111",
                margin: "0 0 8px",
                letterSpacing: "-0.01em",
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
                  label: "Mint Number",
                  value: `#${nft.editionNumber} of ${nft.totalSupply}`,
                },
                { label: "Total Minted", value: String(nft.totalSupply) },
                {
                  label: "Type",
                  value: nft.mediaType === "photo" ? "Photo" : "Video",
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
              <button
                type="button"
                data-ocid="collection.secondary_button"
                disabled
                title="Coming Soon"
                style={{
                  width: "100%",
                  height: "48px",
                  borderRadius: "12px",
                  background: "transparent",
                  border: `1.5px solid ${MINT}`,
                  color: `${MINT_TEXT}88`,
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "not-allowed",
                  letterSpacing: "0.02em",
                  opacity: 0.5,
                }}
              >
                Sell · Coming Soon
              </button>

              <button
                type="button"
                data-ocid="collection.primary_button"
                onClick={() => setShowSendModal(true)}
                style={{
                  width: "100%",
                  height: "48px",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(160deg, #34A884, #2a9070)",
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
                disabled
                title="Coming soon"
                style={{
                  width: "100%",
                  height: "44px",
                  borderRadius: "12px",
                  background: "transparent",
                  border: "1.5px solid rgba(52,168,132,0.20)",
                  color: "rgba(52,168,132,0.35)",
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
    </>
  );
}

// ─── Pack Detail Sheet ────────────────────────────────────────────────────────
function PackDetailSheet({
  pack,
  onClose,
  onOpen,
}: {
  pack: SealedPack;
  onClose: () => void;
  onOpen: (packId: string) => void;
}) {
  const [phase, setPhase] = useState<"idle" | "opening" | "revealed">("idle");

  function handleOpenPack() {
    setPhase("opening");
    setTimeout(() => {
      onOpen(pack.id);
      setPhase("revealed");
    }, 700);
    setTimeout(() => {
      onClose();
    }, 2400);
  }

  const nft = pack.pendingNFT;

  return (
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
        onClick={phase === "idle" ? onClose : undefined}
        onKeyDown={(e) => {
          if ((e.key === "Escape" || e.key === "Enter") && phase === "idle")
            onClose();
        }}
      />

      <div
        style={{
          position: "relative",
          background: "#F7F6F2",
          borderRadius: "24px 24px 0 0",
          maxHeight: "85vh",
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

        {phase === "idle" && (
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
        )}

        <div style={{ padding: "16px 20px 40px" }}>
          {phase !== "revealed" ? (
            <>
              <div
                style={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  background:
                    "linear-gradient(160deg, rgba(52,168,132,0.18) 0%, rgba(42,144,112,0.10) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  aspectRatio: "4/5",
                  marginBottom: "20px",
                  position: "relative",
                }}
              >
                <img
                  src={PACK_IMAGE}
                  alt="Sealed Pack"
                  style={{
                    width: "70%",
                    objectFit: "contain",
                    display: "block",
                    filter: "drop-shadow(0 8px 24px rgba(52,168,132,0.30))",
                    animation:
                      phase === "opening"
                        ? "openingPulse 0.5s ease infinite"
                        : undefined,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    background: "rgba(255,255,255,0.92)",
                    borderRadius: "20px",
                    padding: "3px 9px",
                    border: "1px solid rgba(52,168,132,0.25)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "9px",
                      color: MINT_TEXT,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    Sealed
                  </span>
                </div>
              </div>

              <div
                style={{
                  fontSize: "9px",
                  color: MINT_TEXT,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  fontWeight: 700,
                  marginBottom: "4px",
                }}
              >
                {pack.setName}
              </div>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#111",
                  margin: "0 0 4px",
                  letterSpacing: "-0.01em",
                }}
              >
                Sealed Pack
              </h2>
              <div
                style={{
                  fontSize: "13px",
                  color: "#6B6B6B",
                  marginBottom: "20px",
                }}
              >
                {pack.editionNumber} of {pack.totalSupply} · Contains 1
                collectible
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: MINT_SOFT,
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginBottom: "20px",
                }}
              >
                <Package size={14} style={{ color: MINT_TEXT }} />
                <span
                  style={{
                    fontSize: "13px",
                    color: MINT_TEXT,
                    fontWeight: 500,
                  }}
                >
                  {pack.collectibleType === "video" ? "Video" : "Photo"} Moment
                  inside
                </span>
              </div>

              <button
                type="button"
                data-ocid="collection.primary_button"
                onClick={handleOpenPack}
                disabled={phase === "opening"}
                style={{
                  width: "100%",
                  height: "52px",
                  borderRadius: "14px",
                  border: "none",
                  background:
                    phase === "opening"
                      ? "rgba(52,168,132,0.5)"
                      : "linear-gradient(160deg, #34A884, #2a9070)",
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: 700,
                  cursor: phase === "opening" ? "not-allowed" : "pointer",
                  letterSpacing: "0.01em",
                  animation:
                    phase === "opening"
                      ? "openingPulse 0.5s ease infinite"
                      : undefined,
                }}
              >
                {phase === "opening" ? "Opening..." : "Open Pack"}
              </button>
            </>
          ) : (
            <div style={{ animation: "revealFadeIn 0.4s ease" }}>
              <div
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  marginBottom: "16px",
                  background: "#e8e8e4",
                  position: "relative",
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
              </div>

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
                  marginBottom: "8px",
                }}
              >
                {nft.setName}
              </span>

              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#111",
                  margin: "0 0 12px",
                }}
              >
                {nft.title}
              </h2>

              <div
                data-ocid="collection.success_state"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: MINT_SOFT,
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginBottom: "16px",
                }}
              >
                <span style={{ fontSize: "14px", color: MINT_TEXT }}>✓</span>
                <span
                  style={{
                    fontSize: "13px",
                    color: MINT_TEXT,
                    fontWeight: 600,
                  }}
                >
                  Added to your collection
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                }}
              >
                {[
                  {
                    label: "Mint Number",
                    value: `#${nft.editionNumber} of ${nft.totalSupply}`,
                  },
                  {
                    label: "Type",
                    value: nft.mediaType === "photo" ? "Photo" : "Video",
                  },
                  {
                    label: "Rarity",
                    value: nft.rarity,
                    valueColor: rarityColor(nft.rarity),
                  },
                  { label: "Creator", value: nft.creator },
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
            </div>
          )}
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
  const { nfts, sealedPacks, openPack, removeNFT } = useCollection();

  // First tap: select tile → show inline panel
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  // Second tap: open modal/sheet
  const [secondTapId, setSecondTapId] = useState<string | null>(null);
  const [releaseModalData, setReleaseModalData] = useState<{
    pack: SealedPack;
    all: SealedPack[];
  } | null>(null);

  const setGroups = buildSetGroups(sealedPacks, nfts);
  const isEmpty = setGroups.length === 0;

  function handleTap(id: string) {
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

  // Resolve secondTapId to the actual item
  const secondTapPack = secondTapId
    ? (sealedPacks.find((p) => p.id === secondTapId) ?? null)
    : null;
  const secondTapNFT =
    secondTapId && !secondTapPack
      ? (nfts.find((n) => n.id === secondTapId) ?? null)
      : null;

  function clearSecondTap() {
    setSecondTapId(null);
    setSelectedTileId(null);
  }

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
            fontSize: "18px",
            fontWeight: 700,
            color: "#111",
            margin: 0,
            letterSpacing: "-0.02em",
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
                onTap={handleTap}
                onSecondTap={handleSecondTap}
                onClosePanel={handleClosePanel}
                onRelease={(pack, all) => setReleaseModalData({ pack, all })}
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

      {/* Pack detail sheet — second tap on sealed pack */}
      {secondTapPack && (
        <PackDetailSheet
          pack={secondTapPack}
          onClose={clearSecondTap}
          onOpen={(packId) => {
            openPack(packId);
            setTimeout(() => clearSecondTap(), 1700);
          }}
        />
      )}

      {/* NFT detail sheet — second tap on opened NFT */}
      {secondTapNFT &&
        (secondTapNFT.mediaType === "video" ? (
          <MediaViewerModal nft={secondTapNFT} onClose={clearSecondTap} />
        ) : (
          <NFTDetailSheet
            nft={secondTapNFT}
            onClose={clearSecondTap}
            onRemove={(id) => {
              removeNFT(id);
              clearSecondTap();
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
    </div>
  );
}
