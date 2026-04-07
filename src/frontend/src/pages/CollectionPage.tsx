import { ShoppingBag } from "lucide-react";
import { useRef, useState } from "react";
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
  onClick,
}: {
  record: PurchaseRecord;
  accentR: number;
  accentG: number;
  accentB: number;
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
          src={record.videoUrl}
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
              }}
            >
              ${(record.pricePaid / 100).toFixed(2)}
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

export function CollectionPage({ onGoToLibrary }: CollectionPageProps) {
  const { purchases } = useBondingCurve();
  const { activeStyle } = usePackStyle();
  const accentR = activeStyle.accentR;
  const accentG = activeStyle.accentG;
  const accentB = activeStyle.accentB;
  const accentSolid = `rgb(${accentR},${accentG},${accentB})`;
  const accentBg = `rgba(${accentR},${accentG},${accentB},0.07)`;
  const accentBorder = `rgba(${accentR},${accentG},${accentB},0.15)`;

  const [selectedRecord, setSelectedRecord] = useState<PurchaseRecord | null>(
    null,
  );
  const [listedClipIds, setListedClipIds] = useState<Set<string>>(() => {
    // Load already-listed records from localStorage on init
    try {
      const raw = localStorage.getItem("minty_purchases_v1");
      if (!raw) return new Set();
      const records = JSON.parse(raw) as (PurchaseRecord & {
        listed?: boolean;
      })[];
      return new Set(
        records
          .filter((r) => r.listed === true)
          .map((r) => `${r.clipId}_${r.purchasedAt}`),
      );
    } catch {
      return new Set();
    }
  });

  // Filter out listed records
  const visiblePurchases = purchases.filter(
    (r) => !listedClipIds.has(`${r.clipId}_${r.purchasedAt}`),
  );

  function handleListed(clipId: string) {
    // When a record is listed, find its purchasedAt from selectedRecord
    if (selectedRecord && selectedRecord.clipId === clipId) {
      setListedClipIds((prev) => {
        const next = new Set(prev);
        next.add(`${clipId}_${selectedRecord.purchasedAt}`);
        return next;
      });
    }
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
          {visiblePurchases.length} owned moment
          {visiblePurchases.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "16px" }}>
        {visiblePurchases.length === 0 ? (
          /* Empty state */
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
                Your owned moments appear here
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
                Browse the Releases feed and tap "Buy Copy" to own a clip.
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {visiblePurchases.map((record) => (
              <MiniVideoCard
                key={`${record.clipId}-${record.purchasedAt}`}
                record={record}
                accentR={accentR}
                accentG={accentG}
                accentB={accentB}
                onClick={() => setSelectedRecord(record)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
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
