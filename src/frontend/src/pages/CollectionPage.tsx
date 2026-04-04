import {
  Camera,
  ChevronLeft,
  Link2,
  Package,
  Play,
  Star,
  Store,
  X,
} from "lucide-react";
import { useState } from "react";
import { ReleaseFlowModal } from "../components/ReleaseFlowModal";
import {
  type CollectionNFT,
  type SealedPack,
  useCollection,
} from "../context/CollectionContext";

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

function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
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
    // Prefer NFT image as preview if no image is set yet
    if (g.previewImageUrl === PACK_IMAGE && nft.imageUrl) {
      g.previewImageUrl = nft.imageUrl;
    }
    if (nft.addedAt > g.latestAt) g.latestAt = nft.addedAt;
  }

  return Array.from(map.values()).sort((a, b) => b.latestAt - a.latestAt);
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
        <style>{`
          @keyframes modalFadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to   { opacity: 1; transform: scale(1); }
          }
        `}</style>

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

// ─── NFT Detail Sheet ────────────────────────────────────────────────────────
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
          <style>{`
            @keyframes sheetSlideUp {
              from { transform: translateY(100%); opacity: 0.6; }
              to   { transform: translateY(0);    opacity: 1; }
            }
          `}</style>

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
                { label: "Views", value: formatViews(nft.views) },
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
                      key={`owner-position-${position + 1}`}
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
        <style>{`
          @keyframes sheetSlideUp {
            from { transform: translateY(100%); opacity: 0.6; }
            to   { transform: translateY(0);    opacity: 1; }
          }
          @keyframes revealFadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes openingPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>

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
              {/* Pack art */}
              <div
                style={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  background:
                    "linear-gradient(160deg, rgba(52,168,132,0.18) 0%, rgba(42,144,112,0.10) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "32px 0",
                  marginBottom: "20px",
                  position: "relative",
                }}
              >
                <img
                  src={PACK_IMAGE}
                  alt="Sealed Pack"
                  style={{
                    width: "55%",
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

// ─── NFT Tile ────────────────────────────────────────────────────────────────
function NFTTile({
  nft,
  onClick,
  index,
}: {
  nft: CollectionNFT;
  onClick: () => void;
  index: number;
}) {
  const rc = rarityColor(nft.rarity);

  return (
    <button
      type="button"
      data-ocid={`collection.item.${index + 1}`}
      onClick={onClick}
      style={{
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        overflow: "hidden",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        padding: 0,
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform =
          "translateY(-2px)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 6px 20px rgba(0,0,0,0.12), 0 2px 8px rgba(52,168,132,0.12)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform =
          "translateY(0)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 2px 12px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)";
      }}
    >
      <div
        style={{
          aspectRatio: "4/5",
          position: "relative",
          overflow: "hidden",
          background: "#e8e8e4",
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
            top: "8px",
            left: "8px",
            display: "flex",
            alignItems: "center",
            gap: "3px",
            background: "rgba(255,255,255,0.90)",
            borderRadius: "20px",
            padding: "2px 6px",
          }}
        >
          {nft.mediaType === "video" ? (
            <Play size={8} style={{ color: "rgba(0,0,0,0.6)" }} />
          ) : (
            <Camera size={8} style={{ color: "rgba(0,0,0,0.6)" }} />
          )}
          <span
            style={{
              fontSize: "9px",
              color: "rgba(0,0,0,0.6)",
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {nft.mediaType}
          </span>
        </div>

        <div
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            background: `${rc}22`,
            borderRadius: "20px",
            padding: "2px 7px",
            border: `1px solid ${rc}44`,
          }}
        >
          <span style={{ fontSize: "9px", color: rc, fontWeight: 700 }}>
            {nft.rarity}
          </span>
        </div>

        {nft.isLeader && (
          <div
            style={{
              position: "absolute",
              bottom: "8px",
              right: "8px",
              background: "rgba(201,168,76,0.92)",
              borderRadius: "20px",
              padding: "2px 6px",
              display: "flex",
              alignItems: "center",
              gap: "3px",
            }}
          >
            <Star size={8} style={{ color: "#fff" }} />
            <span style={{ fontSize: "9px", color: "#fff", fontWeight: 700 }}>
              #1
            </span>
          </div>
        )}
      </div>

      <div style={{ padding: "10px 10px 12px" }}>
        <div
          style={{
            fontSize: "9px",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#5a9a80",
            fontWeight: 600,
            marginBottom: "3px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {nft.setName}
        </div>

        <div
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#111",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginBottom: "3px",
          }}
        >
          {nft.title}
        </div>

        <div
          style={{ fontSize: "11px", color: "#6B6B6B", marginBottom: "6px" }}
        >
          #{nft.editionNumber} of {nft.totalSupply}
        </div>

        {nft.hasOwnershipHistory && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Link2 size={10} style={{ color: "#5a9a80", flexShrink: 0 }} />
            <span
              style={{ fontSize: "10px", color: "#5a9a80", fontWeight: 500 }}
            >
              Ownership history
            </span>
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Compact Pack Tile (3-col grid inside SetDetailView) ─────────────────────
function CompactPackTile({
  pack,
  onClick,
  index,
}: {
  pack: SealedPack;
  onClick: () => void;
  index: number;
}) {
  return (
    <button
      type="button"
      data-ocid={`collection.item.${index + 1}`}
      onClick={onClick}
      style={{
        aspectRatio: "4/5",
        background:
          "linear-gradient(160deg, rgba(52,168,132,0.16) 0%, rgba(42,144,112,0.08) 100%)",
        borderRadius: "12px",
        border: "none",
        cursor: "pointer",
        padding: 0,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform =
          "translateY(-2px)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 6px 16px rgba(52,168,132,0.22)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform =
          "translateY(0)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 2px 8px rgba(0,0,0,0.08)";
      }}
    >
      <img
        src={PACK_IMAGE}
        alt="Sealed Pack"
        style={{
          width: "60%",
          objectFit: "contain",
          display: "block",
          filter: "drop-shadow(0 3px 8px rgba(52,168,132,0.22))",
        }}
      />

      {/* SEALED badge */}
      <div
        style={{
          position: "absolute",
          top: "6px",
          left: "6px",
          background: "rgba(255,255,255,0.93)",
          borderRadius: "20px",
          padding: "2px 6px",
          border: "1px solid rgba(52,168,132,0.22)",
        }}
      >
        <span
          style={{
            fontSize: "8px",
            color: MINT_TEXT,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Sealed
        </span>
      </div>

      {/* Media type badge */}
      <div
        style={{
          position: "absolute",
          top: "6px",
          right: "6px",
          display: "flex",
          alignItems: "center",
          gap: "2px",
          background: "rgba(255,255,255,0.90)",
          borderRadius: "20px",
          padding: "2px 5px",
        }}
      >
        {pack.collectibleType === "video" ? (
          <Play size={7} style={{ color: "rgba(0,0,0,0.55)" }} />
        ) : (
          <Camera size={7} style={{ color: "rgba(0,0,0,0.55)" }} />
        )}
        <span
          style={{
            fontSize: "8px",
            color: "rgba(0,0,0,0.55)",
            fontWeight: 600,
            textTransform: "capitalize",
          }}
        >
          {pack.collectibleType}
        </span>
      </div>
    </button>
  );
}

// ─── Set Group Card ───────────────────────────────────────────────────────────
function SetGroupCard({
  group,
  onClick,
  index,
}: {
  group: SetGroup;
  onClick: () => void;
  index: number;
}) {
  const statParts = [
    `${group.totalMinted} minted`,
    `${group.sealedCount} sealed`,
    `${group.openedCount} opened`,
  ];
  if (group.burnedCount > 0) statParts.push(`${group.burnedCount} burned`);

  return (
    <button
      type="button"
      data-ocid={`collection.item.${index + 1}`}
      onClick={onClick}
      style={{
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        overflow: "hidden",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        padding: 0,
        display: "flex",
        flexDirection: "column",
        width: "100%",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform =
          "translateY(-2px)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(52,168,132,0.14)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform =
          "translateY(0)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 2px 12px rgba(0,0,0,0.08)";
      }}
    >
      {/* Preview image — 3:2 aspect ratio */}
      <div
        style={{
          aspectRatio: "4/5",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(160deg, rgba(52,168,132,0.14) 0%, rgba(42,144,112,0.07) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={group.previewImageUrl}
          alt={group.setName}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />

        {/* Sealed count pill — top right */}
        {group.sealedCount > 0 && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "rgba(255,255,255,0.92)",
              borderRadius: "20px",
              padding: "3px 9px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              backdropFilter: "blur(4px)",
            }}
          >
            <Package size={10} style={{ color: MINT_TEXT }} />
            <span
              style={{
                fontSize: "10px",
                color: MINT_TEXT,
                fontWeight: 700,
              }}
            >
              {group.sealedCount} sealed
            </span>
          </div>
        )}
      </div>

      {/* Info area */}
      <div style={{ padding: "14px 16px 16px" }}>
        <div
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "#111",
            marginBottom: "6px",
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {group.setName}
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexWrap: "wrap",
          }}
        >
          {statParts.map((part, i) => (
            <span
              key={part}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: i === 1 ? MINT_TEXT : "#6B6B6B",
                  fontWeight: i === 1 ? 700 : 500,
                }}
              >
                {part}
              </span>
              {i < statParts.length - 1 && (
                <span style={{ fontSize: "11px", color: "#ccc" }}>·</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

// ─── Set Detail View (full-screen overlay, slides in) ────────────────────────
function SetDetailView({
  group,
  onClose,
  onSelectPack,
  onSelectNFT,
  onRelease,
}: {
  group: SetGroup;
  onClose: () => void;
  onSelectPack: (pack: SealedPack) => void;
  onSelectNFT: (nft: CollectionNFT) => void;
  onRelease: (pack: SealedPack, all: SealedPack[]) => void;
}) {
  return (
    <div
      data-ocid="collection.panel"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "#F7F6F2",
        display: "flex",
        flexDirection: "column",
        animation: "detailSlideIn 0.28s cubic-bezier(0.32,0,0.12,1)",
        overflowY: "auto",
      }}
    >
      <style>{`
        @keyframes detailSlideIn {
          from { opacity: 0; transform: translateX(28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(247,246,242,0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(52,168,132,0.10)",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <button
          type="button"
          data-ocid="collection.close_button"
          onClick={onClose}
          style={{
            background: "rgba(0,0,0,0.06)",
            border: "none",
            borderRadius: "50%",
            width: "34px",
            height: "34px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#444",
            flexShrink: 0,
          }}
        >
          <ChevronLeft size={18} />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#111",
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {group.setName}
          </div>
          <div style={{ fontSize: "11px", color: "#6B6B6B" }}>
            {group.totalMinted} total · {group.sealedCount} sealed ·{" "}
            {group.openedCount} opened
          </div>
        </div>

        {group.sealedCount > 0 && (
          <button
            type="button"
            data-ocid="collection.open_modal_button"
            onClick={() => onRelease(group.packs[0], group.packs)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              background: MINT_SOFT,
              border: "1.5px solid rgba(52,168,132,0.30)",
              borderRadius: "20px",
              padding: "7px 12px",
              color: MINT_TEXT,
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              flexShrink: 0,
              letterSpacing: "0.01em",
            }}
          >
            <Store size={12} />
            Release
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "20px 16px 40px" }}>
        {/* Sealed Packs section */}
        {group.packs.length > 0 && (
          <div style={{ marginBottom: "28px" }}>
            <div
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: MINT_TEXT,
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              Sealed Packs · {group.packs.length}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "8px",
              }}
            >
              {group.packs.map((pack, idx) => (
                <CompactPackTile
                  key={pack.id}
                  pack={pack}
                  index={idx}
                  onClick={() => onSelectPack(pack)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        {group.packs.length > 0 && group.collectibles.length > 0 && (
          <div
            style={{
              height: "1px",
              background: "rgba(52,168,132,0.12)",
              marginBottom: "28px",
            }}
          />
        )}

        {/* Opened Collectibles section */}
        {group.collectibles.length > 0 && (
          <div>
            <div
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: MINT_TEXT,
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              Opened Collectibles · {group.collectibles.length}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              {group.collectibles.map((nft, idx) => (
                <NFTTile
                  key={nft.id}
                  nft={nft}
                  index={idx}
                  onClick={() => onSelectNFT(nft)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
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

// ─── Main CollectionPage ─────────────────────────────────────────────────────
export function CollectionPage({
  onGoToLibrary,
}: {
  onGoToLibrary?: () => void;
}) {
  const { nfts, sealedPacks, openPack, removeNFT } = useCollection();

  const [selectedSet, setSelectedSet] = useState<SetGroup | null>(null);
  const [selectedNFT, setSelectedNFT] = useState<CollectionNFT | null>(null);
  const [selectedPack, setSelectedPack] = useState<SealedPack | null>(null);
  const [releaseModalData, setReleaseModalData] = useState<{
    pack: SealedPack;
    all: SealedPack[];
  } | null>(null);

  const setGroups = buildSetGroups(sealedPacks, nfts);
  const isEmpty = setGroups.length === 0;

  return (
    <div
      data-ocid="collection.page"
      style={{
        minHeight: "calc(100vh - 68px - 64px)",
        background: "#F7F6F2",
        padding: "20px 16px",
      }}
    >
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
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {setGroups.map((group, idx) => (
            <SetGroupCard
              key={group.setName}
              group={group}
              index={idx}
              onClick={() => setSelectedSet(group)}
            />
          ))}
        </div>
      )}

      {/* Set detail overlay */}
      {selectedSet && (
        <SetDetailView
          group={selectedSet}
          onClose={() => setSelectedSet(null)}
          onSelectPack={(pack) => setSelectedPack(pack)}
          onSelectNFT={(nft) => setSelectedNFT(nft)}
          onRelease={(pack, all) => setReleaseModalData({ pack, all })}
        />
      )}

      {/* Pack detail sheet */}
      {selectedPack && (
        <PackDetailSheet
          pack={selectedPack}
          onClose={() => setSelectedPack(null)}
          onOpen={(packId) => {
            openPack(packId);
            setTimeout(() => setSelectedPack(null), 1700);
          }}
        />
      )}

      {/* NFT detail sheet */}
      {selectedNFT && (
        <NFTDetailSheet
          nft={selectedNFT}
          onClose={() => setSelectedNFT(null)}
          onRemove={(id) => {
            removeNFT(id);
            setSelectedNFT(null);
          }}
        />
      )}

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
