import {
  Camera,
  Check,
  ChevronRight,
  Flame,
  Link2,
  Package,
  Play,
  Star,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CollectibleCard } from "../components/CollectibleCard";
import { PackOpeningOverlay } from "../components/PackOpeningOverlay";
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
  .pack-scroll-row::-webkit-scrollbar { display: none; }
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
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "/assets/generated/minty-pack-wrapper.png";
              (e.currentTarget as HTMLImageElement).style.objectFit = "contain";
              (e.currentTarget as HTMLImageElement).style.padding = "12px";
              (e.currentTarget as HTMLImageElement).style.background =
                "#F9F9F7";
            }}
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

// ─── Tile Row Renderer (3-col grid with inline panel) ─────────────────────────
interface TileItem {
  id: string;
  isPack: boolean;
  pack?: SealedPack;
  nft?: CollectionNFT;
}

// ─── Pack Scroll Card (horizontal scroll row) ─────────────────────────────────
interface PackScrollCardProps {
  item: TileItem;
  ocidIndex: number;
  onTap: (id: string) => void;
}

function PackScrollCard({ item, ocidIndex, onTap }: PackScrollCardProps) {
  return (
    <button
      type="button"
      data-ocid={`collection.item.${ocidIndex}`}
      onClick={() => onTap(item.id)}
      style={{
        width: "110px",
        height: "138px",
        flexShrink: 0,
        borderRadius: "12px",
        background: "#F9F9F7",
        border: "1.5px solid rgba(0,0,0,0.08)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.10)",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        padding: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Pack wrapper image */}
      <img
        src="/assets/generated/minty-pack-wrapper.png"
        alt="Sealed pack"
        draggable={false}
        style={{
          width: "75%",
          height: "75%",
          objectFit: "contain",
          display: "block",
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.18))",
        }}
      />

      {/* SEALED badge — top-left */}
      <div
        style={{
          position: "absolute",
          top: "6px",
          left: "6px",
          background: "rgba(var(--cycle-accent-rgb),0.90)",
          borderRadius: "20px",
          padding: "2px 6px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "7px",
            color: "#fff",
            fontWeight: 700,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
          }}
        >
          SEALED
        </span>
      </div>

      {/* Edition number — bottom-left */}
      {item.pack?.editionNumber !== undefined && (
        <div
          style={{
            position: "absolute",
            bottom: "6px",
            left: "6px",
            background: "rgba(0,0,0,0.42)",
            borderRadius: "20px",
            padding: "2px 6px",
          }}
        >
          <span
            style={{
              fontSize: "8px",
              color: "rgba(255,255,255,0.92)",
              fontWeight: 600,
            }}
          >
            #{item.pack.editionNumber}
          </span>
        </div>
      )}
    </button>
  );
}

function TileRows({
  items,
  selectedTileId,
  ocidOffset,
  burnedCounts: _burnedCounts,
  onTap,
  onSecondTap,
  onClosePanel: _onClosePanel,
  onBurn: _onBurn,
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
        return (
          <div key={row[0]?.id ?? `row-${rowIdx}`}>
            {/* Tile grid row — position:relative so expanded CollectibleCards (z-50) display above siblings */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "6px",
                marginBottom: "6px",
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

            {/* Note: NFT items use CollectibleCard which handles inline expansion natively.
                 Packs now use horizontal scroll row (PackScrollCard), so inline panel is not used. */}
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
  onBurn,
}: {
  group: SetGroup;
  selectedTileId: string | null;
  burnedCounts: Record<string, number>;
  onTap: (id: string) => void;
  onSecondTap: (id: string) => void;
  onClosePanel: () => void;
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
      </div>

      {/* Sealed packs — horizontal scroll row */}
      {packItems.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <div
            style={{
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.10em",
              color: MINT_TEXT,
              fontWeight: 700,
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Package size={10} />
            SEALED PACKS · {packItems.length}
          </div>
          {/* Horizontal scroll row */}
          <div
            className="pack-scroll-row"
            style={{
              display: "flex",
              gap: "12px",
              overflowX: "auto",
              paddingBottom: "8px",
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {packItems.map((item, idx) => (
              <PackScrollCard
                key={item.id}
                item={item}
                ocidIndex={idx + 1}
                onTap={onTap}
              />
            ))}
          </div>
        </div>
      )}

      {/* Separator between sections */}
      {packItems.length > 0 && nftItems.length > 0 && (
        <div
          style={{
            height: "1px",
            background: "rgba(0,0,0,0.06)",
            margin: "12px 0 16px",
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
              marginTop: packItems.length > 0 ? "0" : "0",
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
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "/assets/generated/minty-pack-wrapper.png";
              (e.currentTarget as HTMLImageElement).style.objectFit = "contain";
              (e.currentTarget as HTMLImageElement).style.padding = "12px";
              (e.currentTarget as HTMLImageElement).style.background =
                "#F9F9F7";
            }}
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
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "/assets/generated/minty-pack-wrapper.png";
                  (e.currentTarget as HTMLImageElement).style.objectFit =
                    "contain";
                  (e.currentTarget as HTMLImageElement).style.padding = "12px";
                  (e.currentTarget as HTMLImageElement).style.background =
                    "#F9F9F7";
                }}
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
                fontFamily: "DM Sans, sans-serif",
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
            fontFamily: "DM Sans, sans-serif",
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

// ─── Leaderboard Components ───────────────────────────────────────────────────

function LeaderboardCard({ nft, rank }: { nft: CollectionNFT; rank: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || !videoRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) videoRef.current?.play().catch(() => {});
        else videoRef.current?.pause();
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const rankColor =
    rank === 1
      ? "#C9A84C"
      : rank === 2
        ? "#9B9B9B"
        : rank === 3
          ? "#CD7F32"
          : "rgba(0,0,0,0.22)";
  const rankEmoji =
    rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
  const price = nft.purchasePrice ?? 0;

  return (
    <div
      ref={wrapperRef}
      data-ocid={`collection.leaderboard.item.${rank}`}
      style={{
        background: "#fff",
        borderRadius: "14px",
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
        border:
          rank === 1
            ? "1px solid rgba(201,168,76,0.35)"
            : "1px solid rgba(0,0,0,0.05)",
        borderLeft:
          rank === 1
            ? "3px solid #C9A84C"
            : rank === 2
              ? "3px solid #9B9B9B"
              : rank === 3
                ? "3px solid #CD7F32"
                : "1px solid rgba(0,0,0,0.05)",
      }}
    >
      {/* Rank */}
      <div
        style={{
          minWidth: 28,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <span
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: rank <= 3 ? 18 : 15,
            fontWeight: 800,
            color: rankColor,
            lineHeight: 1,
          }}
        >
          {rank}
        </span>
        {rankEmoji && <span style={{ fontSize: 12 }}>{rankEmoji}</span>}
      </div>

      {/* Mini preview */}
      <div
        style={{
          width: 64,
          height: 80,
          borderRadius: 10,
          overflow: "hidden",
          flexShrink: 0,
          background: "#f0f0f0",
        }}
      >
        {nft.previewClipUrl ? (
          <video
            ref={videoRef}
            src={nft.previewClipUrl}
            poster={nft.imageUrl}
            muted
            loop
            playsInline
            preload="none"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <img
            src={nft.imageUrl}
            alt={nft.title}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "/assets/generated/minty-pack-wrapper.png";
              (e.currentTarget as HTMLImageElement).style.objectFit = "contain";
              (e.currentTarget as HTMLImageElement).style.padding = "12px";
              (e.currentTarget as HTMLImageElement).style.background =
                "#F9F9F7";
            }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        )}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 14,
            fontWeight: 700,
            color: "#111",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {nft.title}
        </div>
        <div
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 11,
            fontWeight: 500,
            color: "rgba(0,0,0,0.4)",
            marginTop: 2,
          }}
        >
          @{nft.creator}
        </div>
        {nft.caption && (
          <div
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 11,
              color: "rgba(0,0,0,0.35)",
              marginTop: 2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {nft.caption}
          </div>
        )}
        <div
          style={{
            marginTop: 6,
            display: "flex",
            alignItems: "baseline",
            gap: 5,
          }}
        >
          <span
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 13,
              fontWeight: 700,
              color: "var(--cycle-accent)",
            }}
          >
            $
            {price.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 10,
              color: "rgba(0,0,0,0.28)",
              fontWeight: 500,
            }}
          >
            highest sale
          </span>
        </div>
      </div>
    </div>
  );
}

function LeaderboardView({ nfts }: { nfts: CollectionNFT[] }) {
  const ranked = [...nfts]
    .filter((n) => (n.purchasePrice ?? 0) > 0)
    .sort((a, b) => (b.purchasePrice ?? 0) - (a.purchasePrice ?? 0))
    .slice(0, 10);

  if (ranked.length === 0) {
    return (
      <div
        data-ocid="collection.leaderboard.empty_state"
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "rgba(0,0,0,0.35)",
          fontFamily: "DM Sans, sans-serif",
          fontSize: "14px",
        }}
      >
        No purchase history yet
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        paddingBottom: "20px",
      }}
    >
      {ranked.map((nft, idx) => (
        <LeaderboardCard key={nft.id} nft={nft} rank={idx + 1} />
      ))}
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

  // Burn state
  const [burnTarget, setBurnTarget] = useState<CollectionNFT | null>(null);
  const [showBurnConfirm, setShowBurnConfirm] = useState(false);
  const [burnFeedback, setBurnFeedback] = useState(false);

  const [activeTab, setActiveTab] = useState<"collection" | "leaderboard">(
    "collection",
  );

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

      {/* ── Collection / Leaderboard segmented toggle ── */}
      <div
        style={{
          display: "flex",
          background: "rgba(var(--cycle-accent-rgb),0.08)",
          borderRadius: "100px",
          padding: "3px",
          margin: "0 auto 20px",
          width: "fit-content",
        }}
      >
        {(["collection", "leaderboard"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            data-ocid={
              tab === "collection"
                ? "collection.tab"
                : "collection.leaderboard.tab"
            }
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 20px",
              borderRadius: "100px",
              border: "none",
              cursor: "pointer",
              fontFamily: "DM Sans, sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.02em",
              transition: "all 0.18s ease",
              background:
                activeTab === tab ? "var(--cycle-accent)" : "transparent",
              color: activeTab === tab ? "#fff" : "rgba(0,0,0,0.45)",
            }}
          >
            {tab === "collection" ? "Collection" : "Leaderboard"}
          </button>
        ))}
      </div>

      {activeTab === "leaderboard" ? (
        <LeaderboardView nfts={nfts} />
      ) : isEmpty ? (
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
