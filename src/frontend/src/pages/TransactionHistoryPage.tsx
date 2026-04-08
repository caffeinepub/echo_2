import { useActor } from "@caffeineai/core-infrastructure";
import { useEffect, useState } from "react";
import { createActor } from "../backend";
import { TxType } from "../backend";
import { Variant_pending_confirmed, WalletActivityType } from "../backend.d";
import type {
  Transaction as BackendTransaction,
  TxSplit,
  WalletActivity,
} from "../backend.d";

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

interface DisplayActivity {
  id: string;
  activityType: WalletActivityType;
  btcAmountE8s: bigint;
  description: string;
  timestamp: number; // ms
  status: Variant_pending_confirmed;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BTC_RATE = 50_000;
const E8S_PER_BTC = 100_000_000;

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

function toDisplayActivity(act: WalletActivity, idx: number): DisplayActivity {
  return {
    id: `activity-${idx}`,
    activityType: act.activityType,
    btcAmountE8s: act.btcAmountE8s,
    description: act.description,
    timestamp: Number(act.timestamp) / 1_000_000,
    status: act.status,
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

const ACTIVITY_META: Record<
  WalletActivityType,
  { label: string; icon: string; color: string; bg: string; border: string }
> = {
  [WalletActivityType.deposit]: {
    label: "Deposit",
    icon: "↓",
    color: "#059669",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.20)",
  },
  [WalletActivityType.mintCost]: {
    label: "Mint Cost",
    icon: "🔥",
    color: "#7C3AED",
    bg: "rgba(124,58,237,0.08)",
    border: "rgba(124,58,237,0.20)",
  },
  [WalletActivityType.auctionPayout]: {
    label: "Auction Payout",
    icon: "⭐",
    color: "#d97706",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.20)",
  },
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

function e8sToBtcStr(e8s: bigint): string {
  return (Number(e8s) / E8S_PER_BTC).toFixed(8);
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
              key={String(idx)}
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

// ─── Activity Row ─────────────────────────────────────────────────────────────

function ActivityRow({ act }: { act: DisplayActivity }) {
  const meta = ACTIVITY_META[act.activityType];
  const isPending = act.status === Variant_pending_confirmed.pending;

  return (
    <div
      data-ocid="transactions.activity_row"
      style={{
        background: meta.bg,
        border: `1px solid ${meta.border}`,
        borderRadius: 14,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0 }}>{meta.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: meta.color,
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {meta.label}
          </span>
          {isPending && (
            <span
              style={{
                fontSize: 10,
                color: "#d97706",
                background: "rgba(245,158,11,0.12)",
                border: "1px solid rgba(245,158,11,0.25)",
                borderRadius: 20,
                padding: "2px 7px",
                fontWeight: 600,
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Pending
            </span>
          )}
        </div>
        {act.description && (
          <div
            style={{
              fontSize: 11,
              color: "#6b7280",
              fontFamily: "DM Sans, sans-serif",
              marginTop: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {act.description}
          </div>
        )}
        <div
          style={{
            fontSize: 11,
            color: "#9ca3af",
            fontFamily: "DM Sans, sans-serif",
            marginTop: 2,
          }}
        >
          {formatDate(act.timestamp)}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color:
              act.activityType === WalletActivityType.deposit
                ? "#059669"
                : meta.color,
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          {act.activityType === WalletActivityType.deposit ? "+" : "-"}
          {e8sToBtcStr(act.btcAmountE8s)} BTC
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type ActiveTab = "transactions" | "activity";

interface TransactionHistoryPageProps {
  onBack?: () => void;
}

export function TransactionHistoryPage({
  onBack,
}: TransactionHistoryPageProps) {
  const { actor, isFetching } = useActor(createActor);
  const [transactions, setTransactions] = useState<DisplayTransaction[]>([]);
  const [walletActivity, setWalletActivity] = useState<DisplayActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("transactions");

  useEffect(() => {
    if (!actor || isFetching) return;
    let cancelled = false;
    setLoading(true);

    Promise.allSettled([
      actor.getTransactionHistory(),
      actor.getAllWalletActivity(),
    ]).then(([txResult, actResult]) => {
      if (cancelled) return;
      if (txResult.status === "fulfilled")
        setTransactions(txResult.value.map(toDisplay));
      if (actResult.status === "fulfilled")
        setWalletActivity(actResult.value.map(toDisplayActivity));
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [actor, isFetching]);

  // Suppress unused import warning — TxType imported for enum shape reference
  void TxType;

  const depositCount = walletActivity.filter(
    (a) => a.activityType === WalletActivityType.deposit,
  ).length;

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

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 18,
          background: "rgba(0,0,0,0.04)",
          borderRadius: 12,
          padding: 4,
        }}
      >
        {(["transactions", "activity"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            data-ocid={`transactions.tab.${tab}`}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: "8px 12px",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 9,
              border: "none",
              cursor: "pointer",
              fontFamily: "DM Sans, sans-serif",
              background: activeTab === tab ? "#ffffff" : "transparent",
              color: activeTab === tab ? PURPLE : "#9ca3af",
              boxShadow:
                activeTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            {tab === "transactions"
              ? `Payments (${transactions.length})`
              : `Wallet Activity (${depositCount} deposits)`}
          </button>
        ))}
      </div>

      {activeTab === "transactions" && (
        <>
          {/* Stats bar */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            {(["mint_fee", "copy_sale", "secondary_trade"] as const).map(
              (type) => {
                const count = transactions.filter(
                  (t) => t.type === type,
                ).length;
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
              },
            )}
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
            <strong style={{ color: PURPLE }}>Split rules:</strong> Mint fee →
            100% platform · Copy sale → 95% creator, 5% platform · Secondary
            trade → 4% original creator, 1% platform, 95% seller
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
        </>
      )}

      {activeTab === "activity" &&
        (loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              color: "#9ca3af",
              fontFamily: "DM Sans, sans-serif",
              fontSize: 14,
            }}
          >
            Loading activity…
          </div>
        ) : walletActivity.length === 0 ? (
          <div
            data-ocid="transactions.activity_empty"
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
              No wallet activity yet
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
              Deposit BTC to see your activity here
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {walletActivity.map((act) => (
              <ActivityRow key={act.id} act={act} />
            ))}
          </div>
        ))}
    </div>
  );
}
