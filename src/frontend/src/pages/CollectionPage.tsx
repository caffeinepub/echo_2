import { Clock, ShoppingBag } from "lucide-react";
import { useRef, useState } from "react";
import { BtcLogo } from "../components/BtcLogo";
import { NftDetailModal } from "../components/NftDetailModal";
import type { PurchaseRecord } from "../context/BondingCurveContext";
import { useBondingCurve } from "../context/BondingCurveContext";
import { usePackStyle } from "../context/PackStyleContext";

interface CollectionPageProps {
  onGoToLibrary?: () => void;
}

function MiniVideoCard({
  record,
  accentR,
  accentG,
  accentB,
  isListed,
  onClick,
}: {
  record: PurchaseRecord;
  accentR: number;
  accentG: number;
  accentB: number;
  isListed?: boolean;
  onClick: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const accentSolid = `rgb(${accentR},${accentG},${accentB})`;
  const accentBg = `rgba(${accentR},${accentG},${accentB},0.07)`;
  const accentBorder = `rgba(${accentR},${accentG},${accentB},0.15)`;

  const date = new Date(record.purchasedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <button
      type="button"
      data-ocid="collection.owned_clip_card"
      onClick={onClick}
      style={{
        borderRadius: 16,
        background: accentBg,
        border: `1px solid ${accentBorder}`,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
        overflow: "hidden",
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        padding: 0,
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform =
          "translateY(-2px)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          `0 6px 20px rgba(${accentR},${accentG},${accentB},0.18)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform =
          "translateY(0)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)";
      }}
    >
      {/* Video thumbnail */}
      <div
        style={{
          position: "relative",
          aspectRatio: "16/9",
          background: "#0d1520",
          overflow: "hidden",
        }}
      >
        <video
          ref={videoRef}
          src={record.videoUrl || undefined}
          muted
          loop
          playsInline
          autoPlay
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        {/* Edition badge */}
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: accentSolid,
            borderRadius: 20,
            padding: "3px 9px",
            fontSize: 11,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "0.02em",
            fontFamily: "DM Sans, sans-serif",
            lineHeight: 1.4,
          }}
        >
          {record.editionNumber != null ? record.editionNumber : "—"} /{" "}
          {record.totalSupply ?? 1000}
        </div>
        {/* Tap hint */}
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: 8,
            background: "rgba(0,0,0,0.5)",
            borderRadius: 8,
            padding: "2px 7px",
            fontSize: 10,
            color: "rgba(255,255,255,0.75)",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          Tap to view
        </div>
        {/* Listed badge */}
        {isListed && (
          <div
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              background: "rgba(192,160,230,0.75)",
              backdropFilter: "blur(4px)",
              borderRadius: 20,
              padding: "2px 9px",
              fontSize: 10,
              fontWeight: 700,
              color: "#fff",
              fontFamily: "DM Sans, sans-serif",
              letterSpacing: "0.04em",
            }}
          >
            Listed
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "12px 14px 14px" }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--echo-text)",
            fontFamily: "DM Sans, sans-serif",
            marginBottom: 3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {record.clipTitle || "Untitled Moment"}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--echo-text-secondary)",
            fontFamily: "DM Sans, sans-serif",
            marginBottom: 10,
          }}
        >
          by @{record.creatorName}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                color: "var(--echo-text-muted)",
                fontFamily: "DM Sans, sans-serif",
                marginBottom: 1,
              }}
            >
              Paid
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: accentSolid,
                fontFamily: "DM Sans, sans-serif",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <BtcLogo size={14} />${record.pricePaid.toFixed(2)}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 10,
                color: "var(--echo-text-muted)",
                fontFamily: "DM Sans, sans-serif",
                marginBottom: 1,
              }}
            >
              Acquired
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--echo-text-secondary)",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {date}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function PendingCard({
  record,
  copiesMinted,
  totalSupply,
}: {
  record: PurchaseRecord;
  copiesMinted: number;
  totalSupply: number;
}) {
  const amberColor = "#f59e0b";
  const amberBg = "rgba(245,158,11,0.08)";
  const amberBorder = "rgba(245,158,11,0.20)";
  const pct = (copiesMinted / totalSupply) * 100;

  return (
    <div
      data-ocid="collection.pending_clip_card"
      style={{
        borderRadius: 16,
        background: amberBg,
        border: `1px solid ${amberBorder}`,
        boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
        overflow: "hidden",
        opacity: 0.85,
      }}
    >
      {/* Video + overlay */}
      <div
        style={{
          position: "relative",
          aspectRatio: "16/9",
          background: "#0d1520",
          overflow: "hidden",
        }}
      >
        <video
          src={record.videoUrl || undefined}
          muted
          loop
          playsInline
          autoPlay
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            filter: "brightness(0.65) saturate(0.7)",
          }}
        />
        {/* Pending overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.45) 100%)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: 8,
          }}
        >
          {/* Lock badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "rgba(245,158,11,0.90)",
              borderRadius: 20,
              padding: "3px 9px",
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "0.02em",
              fontFamily: "DM Sans, sans-serif",
              lineHeight: 1.4,
            }}
          >
            <Clock size={10} color="#fff" />
            Pending
          </div>
          {/* Edition reserved */}
          <div
            style={{
              background: "rgba(0,0,0,0.55)",
              borderRadius: 20,
              padding: "3px 9px",
              fontSize: 11,
              fontWeight: 700,
              color: "rgba(255,255,255,0.85)",
              fontFamily: "DM Sans, sans-serif",
              lineHeight: 1.4,
            }}
          >
            #{record.editionNumber} reserved
          </div>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "12px 14px 14px" }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "var(--echo-text)",
            fontFamily: "DM Sans, sans-serif",
            marginBottom: 2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {record.clipTitle || "Untitled Moment"}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--echo-text-secondary)",
            fontFamily: "DM Sans, sans-serif",
            marginBottom: 10,
          }}
        >
          by @{record.creatorName}
        </div>

        {/* Sell-out progress */}
        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
              fontSize: 11,
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            <span style={{ color: "var(--echo-text-muted)" }}>
              Sell-out progress
            </span>
            <span style={{ fontWeight: 600, color: amberColor }}>
              {copiesMinted.toLocaleString()} / {totalSupply.toLocaleString()}
            </span>
          </div>
          <div
            style={{
              height: 5,
              borderRadius: 3,
              background: "rgba(0,0,0,0.07)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                borderRadius: 3,
                background: `linear-gradient(90deg, ${amberColor}, rgba(245,158,11,0.6))`,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>

        <div
          style={{
            fontSize: 11,
            color: amberColor,
            fontFamily: "DM Sans, sans-serif",
            fontWeight: 500,
            lineHeight: 1.4,
          }}
        >
          Mints to Collection when all {totalSupply.toLocaleString()} copies
          sell
        </div>
      </div>
    </div>
  );
}

export function CollectionPage({ onGoToLibrary }: CollectionPageProps) {
  const {
    getMintedPurchases,
    getPendingPurchases,
    getCurveState,
    isLoadingCurves,
  } = useBondingCurve();
  const { activeStyle } = usePackStyle();
  const accentR = activeStyle.accentR;
  const accentG = activeStyle.accentG;
  const accentB = activeStyle.accentB;
  const accentSolid = `rgb(${accentR},${accentG},${accentB})`;
  const accentBg = `rgba(${accentR},${accentG},${accentB},0.07)`;
  const accentBorder = `rgba(${accentR},${accentG},${accentB},0.15)`;

  const mintedPurchases = getMintedPurchases();
  const pendingPurchases = getPendingPurchases();

  const [selectedRecord, setSelectedRecord] = useState<PurchaseRecord | null>(
    null,
  );
  // Track listed clip IDs locally — key = `${clipId}_${editionNumber}`
  const [listedKeys, setListedKeys] = useState<Set<string>>(new Set());

  const listedKeyFor = (r: PurchaseRecord) => `${r.clipId}_${r.editionNumber}`;

  // Filter out listed records from minted
  const visibleMinted = mintedPurchases.filter(
    (r) => !listedKeys.has(listedKeyFor(r)),
  );

  function handleListed(clipId: string) {
    if (selectedRecord && selectedRecord.clipId === clipId) {
      setListedKeys((prev) => {
        const next = new Set(prev);
        next.add(listedKeyFor(selectedRecord));
        return next;
      });
    }
  }

  const hasAny = visibleMinted.length > 0 || pendingPurchases.length > 0;

  // Loading skeleton
  if (isLoadingCurves && !hasAny) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100%",
          background: "var(--echo-bg)",
        }}
      >
        <div
          style={{
            padding: "20px 16px 12px",
            borderBottom: "1px solid var(--echo-border)",
            background: "var(--echo-surface)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShoppingBag size={18} color={accentSolid} />
            <h1
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--echo-text)",
                fontFamily: "DM Sans, sans-serif",
                margin: 0,
              }}
            >
              My Collection
            </h1>
          </div>
        </div>
        <div
          style={{
            flex: 1,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                borderRadius: 16,
                background: accentBg,
                height: 180,
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        background: "var(--echo-bg)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 16px 12px",
          borderBottom: "1px solid var(--echo-border)",
          background: "var(--echo-surface)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ShoppingBag size={18} color={accentSolid} />
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--echo-text)",
              fontFamily: "DM Sans, sans-serif",
              margin: 0,
            }}
          >
            My Collection
          </h1>
        </div>
        <p
          style={{
            fontSize: 13,
            color: "var(--echo-text-secondary)",
            fontFamily: "DM Sans, sans-serif",
            margin: "4px 0 0",
          }}
        >
          {visibleMinted.length} minted · {pendingPurchases.length} pending
        </p>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "16px" }}>
        {!hasAny ? (
          /* Full empty state */
          <div
            data-ocid="collection.empty_state"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 320,
              gap: 16,
              textAlign: "center",
              padding: "0 24px",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: accentBg,
                border: `1.5px solid ${accentBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShoppingBag size={28} color={accentSolid} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--echo-text)",
                  fontFamily: "DM Sans, sans-serif",
                  margin: "0 0 6px",
                }}
              >
                No minted NFTs yet
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--echo-text-secondary)",
                  fontFamily: "DM Sans, sans-serif",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                Buy copies and wait for clips to sell out. When all 1,000 copies
                of a clip sell, your copy mints here.
              </p>
            </div>
            {onGoToLibrary && (
              <button
                type="button"
                data-ocid="collection.browse_releases_button"
                onClick={onGoToLibrary}
                style={{
                  height: 44,
                  paddingLeft: 24,
                  paddingRight: 24,
                  borderRadius: 22,
                  border: "none",
                  background: accentSolid,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "DM Sans, sans-serif",
                  cursor: "pointer",
                  boxShadow: `0 4px 14px rgba(${accentR},${accentG},${accentB},0.30)`,
                }}
              >
                Browse Releases
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* ── Minted Section ── */}
            {visibleMinted.length > 0 && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: accentSolid,
                      flexShrink: 0,
                    }}
                  />
                  <h2
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--echo-text)",
                      fontFamily: "DM Sans, sans-serif",
                      margin: 0,
                    }}
                  >
                    My Collection
                  </h2>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--echo-text-muted)",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    {visibleMinted.length} NFT
                    {visibleMinted.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  {visibleMinted.map((record) => (
                    <MiniVideoCard
                      key={`${record.clipId}-${record.editionNumber}`}
                      record={record}
                      accentR={accentR}
                      accentG={accentG}
                      accentB={accentB}
                      isListed={listedKeys.has(listedKeyFor(record))}
                      onClick={() => setSelectedRecord(record)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Pending Section ── */}
            {pendingPurchases.length > 0 && (
              <div>
                {/* Divider if minted section also present */}
                {visibleMinted.length > 0 && (
                  <div
                    style={{
                      height: 1,
                      background: "var(--echo-border)",
                      marginBottom: 20,
                    }}
                  />
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <Clock size={14} color="#f59e0b" />
                  <h2
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--echo-text)",
                      fontFamily: "DM Sans, sans-serif",
                      margin: 0,
                    }}
                  >
                    Pending
                  </h2>
                  <span
                    style={{
                      fontSize: 12,
                      color: "#f59e0b",
                      fontFamily: "DM Sans, sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    {pendingPurchases.length} reserved
                  </span>
                </div>

                <p
                  style={{
                    fontSize: 12,
                    color: "var(--echo-text-muted)",
                    fontFamily: "DM Sans, sans-serif",
                    margin: "0 0 12px",
                    lineHeight: 1.4,
                  }}
                >
                  Mints to Collection when all 1,000 copies of each clip sell
                </p>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {pendingPurchases.map((record) => {
                    const state = getCurveState(record.clipId);
                    return (
                      <PendingCard
                        key={`${record.clipId}-${record.editionNumber}`}
                        record={record}
                        copiesMinted={
                          state?.copiesMinted ?? record.editionNumber
                        }
                        totalSupply={state?.totalSupply ?? 1000}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty minted state (with pending items showing) */}
            {visibleMinted.length === 0 && pendingPurchases.length > 0 && (
              <div
                style={{
                  borderRadius: 14,
                  background: accentBg,
                  border: `1px solid ${accentBorder}`,
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: -8,
                }}
              >
                <ShoppingBag size={20} color={accentSolid} />
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--echo-text)",
                      fontFamily: "DM Sans, sans-serif",
                      marginBottom: 2,
                    }}
                  >
                    No minted NFTs yet
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--echo-text-secondary)",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    Your reserved copies above appear here once their clip sells
                    out.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail modal — only for minted */}
      {selectedRecord && (
        <NftDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onListed={handleListed}
        />
      )}
    </div>
  );
}
