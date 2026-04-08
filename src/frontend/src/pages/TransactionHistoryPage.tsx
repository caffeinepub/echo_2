import { useActor } from "@caffeineai/core-infrastructure";
import { useEffect, useState } from "react";
import { createActor } from "../backend";
import { TxType } from "../backend";
import type { Transaction as BackendTransaction, TxSplit } from "../backend.d";

// ─── Local display types ───────────────────────────────────────────────────────

type TransactionType = "mint_fee" | "copy_sale" | "secondary_trade";

interface DisplayTransaction {
  id: string;
  type: TransactionType;
  clipId: string;
  totalUsd: number;
  timestamp: number; // ms
  splits: DisplaySplit[];
}

interface DisplaySplit {
  role: string;
  label: string;
  usdAmount: number;
  btcAmount: number;
  address: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BTC_RATE = 50_000;

function toType(tx: BackendTransaction): TransactionType {
  const raw = tx.txType as unknown as string;
  if (raw === "mintFee") return "mint_fee";
  if (raw === "copySale") return "copy_sale";
  return "secondary_trade";
}

function toDisplaySplit(s: TxSplit): DisplaySplit {
  const role = s.role.toLowerCase();
  const labelMap: Record<string, string> = {
    platform: "Platform (fee)",
    creator: "Creator (95%)",
    seller: "Seller (95%)",
  };
  return {
    role,
    label: labelMap[role] ?? s.role,
    usdAmount: s.usdAmount,
    btcAmount:
      s.btcAmountSimulated > 0 ? s.btcAmountSimulated : s.usdAmount / BTC_RATE,
    address: s.btcAddress || s.principal.toText().slice(0, 20),
  };
}

function toDisplay(tx: BackendTransaction): DisplayTransaction {
  return {
    id: String(tx.id),
    type: toType(tx),
    clipId: tx.clipId,
    totalUsd: tx.totalUsd,
    timestamp: Number(tx.timestamp) / 1_000_000, // ns → ms
    splits: tx.splits.map(toDisplaySplit),
  };
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

const PURPLE = "rgba(124,58,237,1)";
const PURPLE_BG = "rgba(124,58,237,0.08)";
const PURPLE_BORDER = "rgba(124,58,237,0.18)";

const TYPE_META: Record<
  TransactionType,
  { label: string; bg: string; color: string; border: string }
> = {
  mint_fee: {
    label: "Mint Fee",
    bg: "rgba(124,58,237,0.10)",
    color: "rgba(109,40,217,1)",
    border: "rgba(124,58,237,0.25)",
  },
  copy_sale: {
    label: "Copy Sale",
    bg: "rgba(16,185,129,0.10)",
    color: "rgba(5,150,105,1)",
    border: "rgba(16,185,129,0.25)",
  },
  secondary_trade: {
    label: "Secondary Trade",
    bg: "rgba(245,158,11,0.10)",
    color: "rgba(180,116,8,1)",
    border: "rgba(245,158,11,0.25)",
  },
};

const ROLE_COLORS: Record<string, string> = {
  platform: "rgba(107,114,128,1)",
  creator: "rgba(5,150,105,1)",
  seller: "rgba(37,99,235,1)",
};

function formatBtc(btc: number): string {
  return `₿ ${btc.toFixed(8)}`;
}

function formatUsd(usd: number): string {
  return `$${usd.toFixed(2)}`;
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(s: string, len = 18): string {
  if (s.length <= len) return s;
  return `${s.slice(0, 8)}…${s.slice(-6)}`;
}

// ─── TxRow ────────────────────────────────────────────────────────────────────

function TxRow({ txn }: { txn: DisplayTransaction }) {
  const [expanded, setExpanded] = useState(false);
  const meta = TYPE_META[txn.type];

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: `1px solid ${PURPLE_BORDER}`,
        borderRadius: 16,
        overflow: "hidden",
        transition: "box-shadow 0.2s",
      }}
    >
      {/* Header row */}
      <button
        type="button"
        data-ocid="transactions.row"
        onClick={() => setExpanded((e) => !e)}
        style={{
          width: "100%",
          padding: "14px 16px",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 12,
          textAlign: "left",
        }}
      >
        {/* Type badge */}
        <span
          style={{
            flexShrink: 0,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            padding: "3px 9px",
            borderRadius: 20,
            background: meta.bg,
            color: meta.color,
            border: `1px solid ${meta.border}`,
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          {meta.label}
        </span>

        {/* Clip ID */}
        <span
          style={{
            flex: 1,
            fontSize: 12,
            color: "#6b7280",
            fontFamily: "DM Sans, sans-serif",
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {truncate(txn.clipId)}
        </span>

        {/* Amount */}
        <span
          style={{
            flexShrink: 0,
            fontSize: 13,
            fontWeight: 700,
            color: PURPLE,
            fontFamily: "DM Sans, sans-serif",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {formatUsd(txn.totalUsd)}
        </span>

        {/* Date */}
        <span
          style={{
            flexShrink: 0,
            fontSize: 11,
            color: "#9ca3af",
            fontFamily: "DM Sans, sans-serif",
            marginLeft: 4,
          }}
        >
          {formatDate(txn.timestamp)}
        </span>

        {/* Expand chevron */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          style={{
            flexShrink: 0,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
          aria-hidden="true"
        >
          <path
            d="M3 5l4 4 4-4"
            stroke="#9ca3af"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Expanded splits */}
      {expanded && (
        <div
          style={{
            borderTop: `1px solid ${PURPLE_BORDER}`,
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: "#9ca3af",
              margin: "0 0 4px",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            Payment Splits
          </p>
          {txn.splits.map((split, idx) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: index is stable here
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                background: "rgba(0,0,0,0.025)",
                borderRadius: 10,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: ROLE_COLORS[split.role] ?? "#9ca3af",
                  flexShrink: 0,
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  flex: 1,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#374151",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {split.label}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "#6b7280",
                  fontFamily: "DM Mono, monospace",
                  maxWidth: 120,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={split.address}
              >
                {truncate(split.address, 14)}
              </span>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: ROLE_COLORS[split.role] ?? "#374151",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  {formatUsd(split.usdAmount)}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#9ca3af",
                    fontFamily: "DM Mono, monospace",
                  }}
                >
                  {formatBtc(split.btcAmount)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface TransactionHistoryPageProps {
  onBack?: () => void;
}

export function TransactionHistoryPage({
  onBack,
}: TransactionHistoryPageProps) {
  const { actor, isFetching } = useActor(createActor);
  const [transactions, setTransactions] = useState<DisplayTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor || isFetching) return;
    let cancelled = false;
    setLoading(true);
    actor
      .getTransactionHistory()
      .then((txns) => {
        if (!cancelled) {
          setTransactions(txns.map(toDisplay));
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("[TransactionHistoryPage] load failed:", err);
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [actor, isFetching]);

  // Suppress unused import warning — TxType imported for enum shape reference
  void TxType;

  return (
    <div
      data-ocid="transactions.page"
      style={{
        minHeight: "calc(100vh - 68px - 64px)",
        background: "#F7F6F2",
        padding: "24px 16px 40px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              color: PURPLE,
              fontWeight: 500,
              padding: "0 0 12px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 3L5 8l5 5"
                stroke={PURPLE}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </button>
        )}

        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#111",
            margin: "0 0 4px",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          Transaction History
        </h1>
        <p
          style={{
            fontSize: 12,
            color: "#9ca3af",
            margin: 0,
            fontFamily: "DM Sans, sans-serif",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "rgba(16,185,129,0.75)",
            }}
          />
          Live — all splits recorded on-chain
        </p>
      </div>

      {/* Stats bar */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {(["mint_fee", "copy_sale", "secondary_trade"] as const).map((type) => {
          const count = transactions.filter((t) => t.type === type).length;
          const meta = TYPE_META[type];
          return (
            <div
              key={type}
              style={{
                flex: "1 1 auto",
                minWidth: 90,
                background: meta.bg,
                border: `1px solid ${meta.border}`,
                borderRadius: 12,
                padding: "10px 14px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: meta.color,
                  fontFamily: "DM Sans, sans-serif",
                  lineHeight: 1,
                }}
              >
                {count}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: meta.color,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontFamily: "DM Sans, sans-serif",
                  marginTop: 3,
                  opacity: 0.75,
                }}
              >
                {meta.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          background: PURPLE_BG,
          border: `1px solid ${PURPLE_BORDER}`,
          borderRadius: 12,
          padding: "10px 14px",
          marginBottom: 16,
          fontSize: 11,
          color: "#6b7280",
          fontFamily: "DM Sans, sans-serif",
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: PURPLE }}>Split rules:</strong> Mint fee → 100%
        platform · Copy sale → 95% creator, 5% platform · Secondary trade → 4%
        original creator, 1% platform, 95% seller
      </div>

      {/* Transaction list */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            color: "#9ca3af",
            fontFamily: "DM Sans, sans-serif",
            fontSize: 14,
          }}
        >
          Loading transactions…
        </div>
      ) : transactions.length === 0 ? (
        <div
          data-ocid="transactions.empty_state"
          style={{
            textAlign: "center",
            padding: "48px 24px",
            background: "rgba(255,255,255,0.75)",
            borderRadius: 16,
            border: `1px solid ${PURPLE_BORDER}`,
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>₿</div>
          <p
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#374151",
              margin: "0 0 6px",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            No transactions yet
          </p>
          <p
            style={{
              fontSize: 13,
              color: "#9ca3af",
              margin: 0,
              fontFamily: "DM Sans, sans-serif",
              lineHeight: 1.5,
            }}
          >
            Mint a clip or buy a copy to see the splits here
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {transactions.map((txn) => (
            <TxRow key={txn.id} txn={txn} />
          ))}
        </div>
      )}
    </div>
  );
}
