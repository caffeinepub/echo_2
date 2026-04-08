import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  ArrowDownToLine,
  ArrowLeft,
  Copy,
  Info,
  Loader2,
  Send,
  ShieldCheck,
  UserCircle,
  Wallet,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createActor } from "../backend";
import { usePackStyle } from "../context/PackStyleContext";
import { useWalletContext } from "../context/WalletContext";
import { DepositModal } from "./DepositModal";

// Always light mode — dark mode removed
const isLight = true;

let neonStyleEl: HTMLStyleElement | null = null;

function injectNeonStyles(r: number, g: number, b: number, _filter?: string) {
  if (!neonStyleEl) {
    neonStyleEl = document.createElement("style");
    document.head.appendChild(neonStyleEl);
  }

  neonStyleEl.textContent = `
@keyframes echo-neon-breathe-light {
  0%,100% { filter: drop-shadow(0 0 1px rgba(${r},${g},${b},0.22)) drop-shadow(0 0 3px rgba(${r},${g},${b},0.12)); }
  50%     { filter: drop-shadow(0 0 2px rgba(${r},${g},${b},0.3))  drop-shadow(0 0 6px rgba(${r},${g},${b},0.16)); }
}

.echo-logo-neon {
  animation: echo-neon-breathe-light 3.8s ease-in-out infinite;
  will-change: filter;
}

@keyframes cow-sway {
  0%, 100% { transform: translateX(0px) rotate(0deg); }
  25% { transform: translateX(1.5px) rotate(0.8deg); }
  75% { transform: translateX(-1.5px) rotate(-0.8deg); }
}

@keyframes cow-bounce {
  0%, 100% { transform: translateY(0px); }
  40% { transform: translateY(-4px); }
  60% { transform: translateY(-2px); }
}

@keyframes cow-glow-pulse {
  0%, 100% { filter: drop-shadow(0 0 0px rgba(${r},${g},${b},0)); }
  50% { filter: drop-shadow(0 0 6px rgba(${r},${g},${b},0.35)); }
}
`;
}

type WalletView = "list" | "receive" | "send" | "info";

// ─── Live BTC Price Hook ──────────────────────────────────────────────────────

interface BtcPriceState {
  price: number | null;
  change24h: number;
  loading: boolean;
  error: boolean;
}

function useBtcPrice(): BtcPriceState {
  const [state, setState] = useState<BtcPriceState>({
    price: null,
    change24h: 2.34,
    loading: true,
    error: false,
  });
  const lastPriceRef = useRef<number | null>(null);

  const fetchPrice = useCallback(async () => {
    try {
      const [spotRes, histRes] = await Promise.allSettled([
        fetch("https://api.coinbase.com/v2/prices/BTC-USD/spot"),
        fetch("https://api.coinbase.com/v2/prices/BTC-USD/historic?period=day"),
      ]);

      let price: number | null = null;
      if (spotRes.status === "fulfilled" && spotRes.value.ok) {
        const data = await spotRes.value.json();
        const parsed = Number.parseFloat(data?.data?.amount);
        if (!Number.isNaN(parsed)) {
          price = parsed;
          lastPriceRef.current = parsed;
        }
      }

      if (price === null) {
        price = lastPriceRef.current;
      }

      let change24h = 2.34;
      if (histRes.status === "fulfilled" && histRes.value.ok) {
        try {
          const hData = await histRes.value.json();
          const prices: { price: string }[] = hData?.data?.prices ?? [];
          if (prices.length >= 2) {
            const latest = Number.parseFloat(prices[0]?.price ?? "0");
            const oldest = Number.parseFloat(
              prices[prices.length - 1]?.price ?? "0",
            );
            if (oldest > 0 && latest > 0) {
              change24h = Number.parseFloat(
                (((latest - oldest) / oldest) * 100).toFixed(2),
              );
            }
          }
        } catch {
          // keep static fallback
        }
      }

      setState({ price, change24h, loading: false, error: price === null });
    } catch {
      setState((prev) => ({
        ...prev,
        price: lastPriceRef.current,
        loading: false,
        error: lastPriceRef.current === null,
      }));
    }
  }, []);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 60_000);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  return state;
}

// ─── Action pill button ───────────────────────────────────────────────────────
function ActionPill({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={`wallet.${label.toLowerCase()}.button`}
      className="flex items-center gap-1 rounded-lg transition-all duration-150"
      style={{
        padding: "4px 10px",
        fontSize: "11px",
        fontWeight: 500,
        color: "var(--cycle-accent)",
        background: "rgba(var(--cycle-accent-rgb),0.08)",
        border: "1px solid rgba(var(--cycle-accent-rgb),0.25)",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "rgba(var(--cycle-accent-rgb),0.14)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "rgba(var(--cycle-accent-rgb),0.08)";
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Asset Row ────────────────────────────────────────────────────────────────
function AssetRow({
  btcBalance,
  btcPrice,
  onDeposit,
  onReceive,
  onSend,
  onInfo,
}: {
  btcBalance: number | null;
  btcPrice: number | null;
  onDeposit: () => void;
  onReceive: () => void;
  onSend: () => void;
  onInfo: () => void;
}) {
  const usdEquivalent =
    btcBalance !== null && btcPrice !== null ? btcBalance * btcPrice : null;
  const BTC_COLOR = "#F7931A";

  return (
    <div
      data-ocid="wallet.asset.btc.card"
      className="rounded-xl"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      {/* BTC Icon */}
      <div
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold"
        style={{
          background: BTC_COLOR,
          fontSize: "11px",
          letterSpacing: "0.02em",
          boxShadow: `0 2px 8px ${BTC_COLOR}44`,
        }}
      >
        ₿
      </div>

      <div className="flex-1 min-w-0">
        <div
          className="font-semibold leading-tight truncate"
          style={{ fontSize: "14px", color: "#0D1520" }}
        >
          Bitcoin
        </div>
        <div className="mt-0.5" style={{ fontSize: "11px", color: "#8BAEC8" }}>
          Balance
        </div>
        <div
          className="font-medium leading-tight"
          data-ocid="wallet.balance.btc"
          style={{ fontSize: "13px", color: "var(--cycle-accent)" }}
        >
          {btcBalance !== null ? `${btcBalance.toFixed(5)} BTC` : "— BTC"}
        </div>
        <div style={{ fontSize: "11px", color: "#8BAEC8", marginTop: "2px" }}>
          {usdEquivalent !== null ? (
            <>
              ≈ $
              {usdEquivalent.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              USD
            </>
          ) : (
            <span style={{ opacity: 0.5 }}>≈ $— USD</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 flex-shrink-0">
        <ActionPill
          label="Deposit"
          icon={<ArrowDownToLine size={10} />}
          onClick={onDeposit}
        />
        <ActionPill
          label="Receive"
          icon={<ArrowLeft size={10} />}
          onClick={onReceive}
        />
        <ActionPill label="Send" icon={<Send size={10} />} onClick={onSend} />
        <ActionPill label="Info" icon={<Info size={10} />} onClick={onInfo} />
      </div>
    </div>
  );
}

// ─── Wallet Modal ─────────────────────────────────────────────────────────────
function WalletModal({
  open,
  onClose,
  onSignOut,
  onOpenDeposit,
}: {
  open: boolean;
  onClose: () => void;
  onSignOut: () => void;
  onOpenDeposit: () => void;
}) {
  const [view, setView] = useState<WalletView>("list");
  const [sendAmount, setSendAmount] = useState("");
  const [sendAddress, setSendAddress] = useState("");
  const [copied, setCopied] = useState(false);

  // Send form state
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  const { price: btcPrice, change24h, loading: priceLoading } = useBtcPrice();
  const { btcBalance, depositAddress, refreshBalance, refreshWalletActivity } =
    useWalletContext();
  const { actor } = useActor(createActor);

  const E8S_PER_BTC = 100_000_000;

  // Auto-refresh balance every 30s while open
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => refreshBalance(), 30_000);
    return () => clearInterval(id);
  }, [open, refreshBalance]);

  if (!open) return null;

  const totalBalance =
    btcBalance !== null && btcPrice !== null ? btcBalance * btcPrice : null;

  function goBack() {
    setView("list");
    setSendAmount("");
    setSendAddress("");
    setCopied(false);
    setSendError(null);
    setSendSuccess(false);
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function validateSend(): string | null {
    if (
      !sendAmount.trim() ||
      Number.isNaN(Number.parseFloat(sendAmount)) ||
      Number.parseFloat(sendAmount) <= 0
    ) {
      return "Enter a valid amount";
    }
    const btcAmt = Number.parseFloat(sendAmount);
    if (btcBalance !== null && btcAmt > btcBalance) {
      return "Insufficient balance";
    }
    const addr = sendAddress.trim();
    if (
      !addr.startsWith("1") &&
      !addr.startsWith("3") &&
      !addr.startsWith("bc1") &&
      !addr.startsWith("tb1")
    ) {
      return "Invalid BTC address";
    }
    return null;
  }

  async function handleConfirmSend() {
    const validationError = validateSend();
    if (validationError) {
      setSendError(validationError);
      return;
    }
    if (!actor) {
      setSendError("Wallet not connected. Please try again.");
      return;
    }

    setSendLoading(true);
    setSendError(null);

    const amountE8s = Math.round(Number.parseFloat(sendAmount) * E8S_PER_BTC);

    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 30_000),
      );

      const result = await Promise.race([
        actor.processWithdrawal(BigInt(amountE8s), sendAddress.trim()),
        timeoutPromise,
      ]);

      if (result.__kind__ === "err") {
        const raw = result.err;
        let msg = "Send failed. Please try again.";
        if (raw === "insufficient_balance") msg = "Insufficient balance";
        else if (raw === "invalid_address") msg = "Invalid BTC address";
        else if (raw.startsWith("send_failed"))
          msg = "Send failed. Please try again.";
        setSendError(msg);
        setSendLoading(false);
        return;
      }

      // Success
      setSendSuccess(true);
      setSendLoading(false);
      await refreshBalance();
      await refreshWalletActivity();

      setTimeout(() => {
        setSendAmount("");
        setSendAddress("");
        setSendError(null);
        setSendSuccess(false);
        setView("list");
      }, 2000);
    } catch (err) {
      const isTimeout = err instanceof Error && err.message === "timeout";
      setSendError(
        isTimeout
          ? "Request timed out. Please try again."
          : "Send failed. Please try again.",
      );
      setSendLoading(false);
    }
  }

  const panelStyle: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid rgba(var(--cycle-accent-rgb),0.18)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.10)",
  };

  const labelColor = "#8BAEC8";
  const titleColor = "#0D1520";
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "10px",
    fontSize: "13px",
    outline: "none",
    background: "rgba(0,0,0,0.03)",
    border: "1px solid #D0DFEF",
    color: "#0D1520",
  };

  let content: React.ReactNode = null;

  if (view === "info") {
    content = (
      <>
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1.5 mb-5"
          style={{
            fontSize: "13px",
            color: "var(--cycle-accent)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold"
            style={{
              background: "#F7931A",
              fontSize: "16px",
              boxShadow: "0 2px 10px #F7931A55",
            }}
          >
            ₿
          </div>
          <div>
            <div
              style={{ fontSize: "17px", fontWeight: 700, color: titleColor }}
            >
              Bitcoin
            </div>
            <div style={{ fontSize: "12px", color: labelColor }}>BTC</div>
          </div>
        </div>
        <p
          style={{
            fontSize: "13px",
            color: "#5B7FA6",
            lineHeight: 1.6,
            marginBottom: 20,
          }}
        >
          Bitcoin — the original decentralized cryptocurrency. Minty uses ckBTC
          behind the scenes for fast, low-cost settlements.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-xl p-3"
            style={{
              background: "rgba(0,0,0,0.02)",
              border: "1px solid #D0DFEF",
            }}
          >
            <div
              style={{ fontSize: "11px", color: labelColor, marginBottom: 4 }}
            >
              Current Price
            </div>
            <div
              style={{ fontSize: "15px", fontWeight: 700, color: titleColor }}
            >
              {priceLoading && btcPrice === null ? (
                <span
                  style={{
                    display: "inline-block",
                    width: "70px",
                    height: "16px",
                    borderRadius: "4px",
                    background: "rgba(0,0,0,0.08)",
                    animation: "pulse 1.4s ease-in-out infinite",
                  }}
                />
              ) : btcPrice !== null ? (
                `$${btcPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              ) : (
                "$—"
              )}
            </div>
          </div>
          <div
            className="rounded-xl p-3"
            style={{
              background: "rgba(0,0,0,0.02)",
              border: "1px solid #D0DFEF",
            }}
          >
            <div
              style={{ fontSize: "11px", color: labelColor, marginBottom: 4 }}
            >
              24h Change
            </div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color:
                  change24h >= 0
                    ? "var(--cycle-accent)"
                    : "oklch(0.60 0.18 25)",
              }}
            >
              {change24h >= 0 ? "+" : ""}
              {change24h}%
            </div>
          </div>
        </div>
      </>
    );
  } else if (view === "receive") {
    const addr = depositAddress ?? "Loading…";
    content = (
      <>
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1.5 mb-5"
          style={{
            fontSize: "13px",
            color: "var(--cycle-accent)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: titleColor,
            marginBottom: 16,
            fontFamily: "DM Sans, sans-serif",
            lineHeight: 1.1,
          }}
        >
          Receive BTC
        </div>

        <div
          className="mx-auto mb-5 flex items-center justify-center rounded-2xl"
          style={{
            width: 140,
            height: 140,
            border: "2px solid rgba(var(--cycle-accent-rgb),0.35)",
            background: "rgba(var(--cycle-accent-rgb),0.04)",
            fontSize: "13px",
            color: "var(--cycle-accent)",
            letterSpacing: "0.08em",
            fontWeight: 600,
          }}
          data-ocid="wallet.receive.qr"
        >
          QR
        </div>

        <div
          style={{
            fontSize: "12px",
            color: labelColor,
            marginBottom: 6,
            textAlign: "center",
          }}
        >
          Deposit Address
        </div>
        <div
          className="rounded-xl flex items-center gap-2 px-3 py-2.5 mb-4"
          style={{
            background: "rgba(0,0,0,0.02)",
            border: "1px solid #D0DFEF",
          }}
        >
          <span
            className="flex-1 truncate font-mono"
            style={{ fontSize: "11px", color: "var(--cycle-accent)" }}
          >
            {addr}
          </span>
          <button
            type="button"
            data-ocid="wallet.receive.copy_button"
            onClick={() => handleCopy(addr)}
            className="flex-shrink-0 flex items-center gap-1 rounded-lg transition-all"
            style={{
              padding: "3px 8px",
              fontSize: "11px",
              color: "var(--cycle-accent)",
              background: "rgba(var(--cycle-accent-rgb),0.08)",
              border: "1px solid rgba(var(--cycle-accent-rgb),0.25)",
              cursor: "pointer",
            }}
          >
            <Copy size={10} />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <p
          style={{
            fontSize: "11px",
            color: labelColor,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Only send BTC to this address.
        </p>
      </>
    );
  } else if (view === "send") {
    const canSend =
      !sendLoading && sendAmount.trim() !== "" && sendAddress.trim() !== "";
    content = (
      <>
        <button
          type="button"
          onClick={goBack}
          disabled={sendLoading}
          className="flex items-center gap-1.5 mb-5"
          style={{
            fontSize: "13px",
            color: "var(--cycle-accent)",
            background: "none",
            border: "none",
            cursor: sendLoading ? "not-allowed" : "pointer",
            padding: 0,
            opacity: sendLoading ? 0.5 : 1,
          }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: titleColor,
            marginBottom: 18,
            fontFamily: "DM Sans, sans-serif",
            lineHeight: 1.1,
          }}
        >
          Send BTC
        </div>

        {sendSuccess ? (
          <div
            data-ocid="wallet.send.success_message"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              padding: "24px 16px",
              borderRadius: 14,
              background: "rgba(16,185,129,0.07)",
              border: "1px solid rgba(16,185,129,0.22)",
            }}
          >
            <div style={{ fontSize: 32 }}>✓</div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#059669",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Withdrawal sent!
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#6b7280",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Returning to wallet…
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label
                style={{
                  fontSize: "12px",
                  color: labelColor,
                  display: "block",
                  marginBottom: 5,
                }}
                htmlFor="send-amount"
              >
                Amount
              </label>
              <input
                id="send-amount"
                type="number"
                data-ocid="wallet.send.amount_input"
                placeholder="0.00 BTC"
                value={sendAmount}
                disabled={sendLoading}
                onChange={(e) => {
                  setSendAmount(e.target.value);
                  setSendError(null);
                }}
                style={{
                  ...inputStyle,
                  opacity: sendLoading ? 0.6 : 1,
                  cursor: sendLoading ? "not-allowed" : "text",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "12px",
                  color: labelColor,
                  display: "block",
                  marginBottom: 5,
                }}
                htmlFor="send-address"
              >
                Recipient Address
              </label>
              <input
                id="send-address"
                type="text"
                data-ocid="wallet.send.recipient_input"
                placeholder="Enter address…"
                value={sendAddress}
                disabled={sendLoading}
                onChange={(e) => {
                  setSendAddress(e.target.value);
                  setSendError(null);
                }}
                style={{
                  ...inputStyle,
                  fontFamily: "monospace",
                  fontSize: "12px",
                  opacity: sendLoading ? 0.6 : 1,
                  cursor: sendLoading ? "not-allowed" : "text",
                }}
              />
            </div>

            {sendError && (
              <div
                data-ocid="wallet.send.error_message"
                style={{
                  fontSize: "12px",
                  color: "#ef4444",
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.20)",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {sendError}
              </div>
            )}

            <button
              type="button"
              data-ocid="wallet.send.confirm_button"
              disabled={!canSend}
              onClick={handleConfirmSend}
              className="w-full rounded-xl font-semibold transition-all duration-150 flex items-center justify-center gap-2"
              style={{
                padding: "12px",
                fontSize: "14px",
                marginTop: 4,
                background: canSend
                  ? "rgba(var(--cycle-accent-rgb),0.12)"
                  : "rgba(0,0,0,0.04)",
                color: canSend ? "var(--cycle-accent)" : "#aaa",
                border: canSend
                  ? "1px solid rgba(var(--cycle-accent-rgb),0.35)"
                  : "1px solid rgba(0,0,0,0.08)",
                cursor: canSend ? "pointer" : "not-allowed",
                opacity: canSend ? 1 : 0.6,
              }}
            >
              {sendLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Sending…
                </>
              ) : (
                "Confirm Send"
              )}
            </button>
          </div>
        )}
      </>
    );
  } else {
    // list view
    content = (
      <>
        <div className="text-center mb-4">
          <div
            style={{
              fontSize: "11px",
              color: labelColor,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Total Balance
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#0D1520",
              letterSpacing: "-0.02em",
            }}
          >
            {priceLoading && totalBalance === null ? (
              <span
                style={{
                  display: "inline-block",
                  width: "120px",
                  height: "28px",
                  borderRadius: "6px",
                  background: "rgba(0,0,0,0.06)",
                  animation: "pulse 1.4s ease-in-out infinite",
                  verticalAlign: "middle",
                }}
              />
            ) : totalBalance !== null ? (
              `$${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            ) : (
              "$—"
            )}
          </div>
          {btcBalance !== null && (
            <div
              data-ocid="wallet.balance.display"
              style={{
                fontSize: "13px",
                color: "var(--cycle-accent)",
                marginTop: 3,
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {btcBalance.toFixed(5)} BTC
              {totalBalance !== null && (
                <span
                  style={{ color: "#8BAEC8", fontWeight: 400, marginLeft: 6 }}
                >
                  ($
                  {totalBalance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  )
                </span>
              )}
            </div>
          )}
        </div>

        {/* Prominent Deposit button */}
        <button
          type="button"
          data-ocid="wallet.deposit.open_button"
          onClick={() => {
            onClose();
            onOpenDeposit();
          }}
          className="w-full flex items-center justify-center gap-2 rounded-xl font-semibold mb-4 transition-all duration-150"
          style={{
            padding: "11px",
            fontSize: "14px",
            color: "#ffffff",
            background: "linear-gradient(135deg, #7C3AED, #9D4FD3)",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(124,58,237,0.30)",
          }}
        >
          <ArrowDownToLine size={15} />
          Deposit BTC
        </button>

        <div
          style={{
            height: 1,
            background: "rgba(0,0,0,0.06)",
            marginBottom: 14,
          }}
        />

        <div className="space-y-2.5" data-ocid="wallet.asset.list">
          <div data-ocid="wallet.asset.item.1">
            <AssetRow
              btcBalance={btcBalance}
              btcPrice={btcPrice}
              onDeposit={() => {
                onClose();
                onOpenDeposit();
              }}
              onReceive={() => setView("receive")}
              onSend={() => setView("send")}
              onInfo={() => setView("info")}
            />
          </div>
        </div>

        <div className="text-center mt-5">
          <button
            type="button"
            data-ocid="wallet.signout.button"
            onClick={() => {
              onClose();
              onSignOut();
            }}
            style={{
              fontSize: "12px",
              color: "#8BAEC8",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Sign Out
          </button>
        </div>
      </>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          goBack();
          onClose();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          goBack();
          onClose();
        }
      }}
    >
      <div
        data-ocid="wallet.modal"
        className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl"
        style={{
          ...panelStyle,
          padding: "20px 16px 24px",
          maxHeight: "85dvh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Wallet
              size={18}
              style={{ color: "var(--cycle-accent)" }}
              strokeWidth={1.8}
            />
            <span
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#0D1520",
                fontFamily: "DM Sans, sans-serif",
                lineHeight: 1,
              }}
            >
              Wallet
            </span>
          </div>
          <button
            type="button"
            data-ocid="wallet.modal.close_button"
            onClick={() => {
              goBack();
              onClose();
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{
              background: "rgba(0,0,0,0.05)",
              color: "#666",
              border: "none",
              cursor: "pointer",
            }}
          >
            <X size={14} />
          </button>
        </div>

        {content}
      </div>
    </div>
  );
}

// ─── Sign In Modal ────────────────────────────────────────────────────────────
function SignInModal({
  open,
  onClose,
  onSignIn,
  isLoggingIn,
}: {
  open: boolean;
  onClose: () => void;
  onSignIn: () => void;
  isLoggingIn: boolean;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-6"
        style={{
          background: "#ffffff",
          border: "1px solid rgba(var(--cycle-accent-rgb),0.18)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.10)",
          position: "relative",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full"
          style={{
            background: "rgba(0,0,0,0.05)",
            color: "#666",
            border: "none",
            cursor: "pointer",
          }}
        >
          <X size={14} />
        </button>

        <div className="flex justify-center mb-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(var(--cycle-accent-rgb),0.08)",
              border: "1px solid rgba(var(--cycle-accent-rgb),0.22)",
            }}
          >
            <ShieldCheck
              size={26}
              style={{ color: "var(--cycle-accent)" }}
              strokeWidth={1.5}
            />
          </div>
        </div>

        <h2
          className="text-center mb-1"
          style={{
            fontSize: "26px",
            color: "#0D1520",
            fontFamily: "DM Sans, sans-serif",
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          Sign in to Minty
        </h2>
        <p
          className="text-center mb-6"
          style={{ fontSize: "13px", color: "#8BAEC8", lineHeight: "1.5" }}
        >
          Sign in securely using Internet Identity
        </p>

        <button
          type="button"
          onClick={onSignIn}
          disabled={isLoggingIn}
          data-ocid="auth.signin.confirm_button"
          className="w-full flex items-center justify-center gap-2.5 rounded-xl font-medium transition-all duration-150"
          style={{
            padding: "12px 16px",
            fontSize: "14px",
            background: isLoggingIn
              ? "rgba(var(--cycle-accent-rgb),0.06)"
              : "rgba(var(--cycle-accent-rgb),0.08)",
            color: "var(--cycle-accent)",
            border: "1px solid rgba(var(--cycle-accent-rgb),0.30)",
            boxShadow: "0 0 20px rgba(var(--cycle-accent-rgb),0.08)",
            cursor: isLoggingIn ? "not-allowed" : "pointer",
            opacity: isLoggingIn ? 0.7 : 1,
          }}
        >
          <ShieldCheck size={16} strokeWidth={1.8} />
          {isLoggingIn
            ? "Opening Internet Identity\u2026"
            : "Continue with Internet Identity"}
        </button>

        <p
          className="text-center mt-4"
          style={{ fontSize: "12px", color: "#8BAEC8", lineHeight: "1.5" }}
        >
          You can also link a Google account to your Internet Identity during
          sign-in.
        </p>
      </div>
    </div>
  );
}

// ─── Cow Info Modal ───────────────────────────────────────────────────────────
function CowInfoModal({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const labelStyle: React.CSSProperties = {
    fontSize: "11px",
    color: "#8BAEC8",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "6px",
    display: "block",
    fontFamily: "DM Sans, sans-serif",
    fontWeight: 500,
  };
  const bodyTextStyle: React.CSSProperties = {
    fontSize: "13px",
    color: "#5B7FA6",
    lineHeight: 1.6,
    fontFamily: "DM Sans, sans-serif",
  };

  const bulletItems = (items: string[]) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {items.map((item) => (
        <div
          key={item}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "var(--cycle-accent)",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: "13px",
              color: "#0D1520",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {item}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
      data-ocid="cow.modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (
          e.key === "Escape" ||
          (e.key === "Enter" && e.target === e.currentTarget)
        )
          onClose();
      }}
    >
      <div
        className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl"
        style={{
          background: "#ffffff",
          border: "1px solid rgba(var(--cycle-accent-rgb),0.18)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.10)",
          padding: "20px 16px 24px",
          maxHeight: "85dvh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: "18px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img
              src="https://dl.dropboxusercontent.com/scl/fi/aoe7dmzh7jqriugs8p9xl/Photo-Apr-05-2026-2-05-53-AM.png?rlkey=6squh6tpozf5ljw7gtiwl0ovz"
              alt="Minty helper"
              style={{
                width: "24px",
                height: "24px",
                objectFit: "contain",
                borderRadius: "4px",
              }}
              draggable={false}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <span
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#0D1520",
                fontFamily: "DM Sans, sans-serif",
                lineHeight: 1,
              }}
            >
              Wallet Info
            </span>
          </div>
          <button
            type="button"
            data-ocid="cow.modal.close_button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{
              background: "rgba(0,0,0,0.05)",
              color: "#666",
              border: "none",
              cursor: "pointer",
            }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <p style={bodyTextStyle}>
            This BTC wallet is used for Minty deposits and purchasing assets
            inside Minty.
          </p>
          <div>
            <span style={labelStyle}>Funds stored here are used for:</span>
            {bulletItems([
              "minting moments",
              "buying copies of clips",
              "bidding on video NFTs",
            ])}
          </div>
          <p style={bodyTextStyle}>
            This wallet is not intended as a primary external crypto wallet.
          </p>
          <div style={{ height: "1px", background: "rgba(0,0,0,0.06)" }} />
          <div>
            <span style={labelStyle}>
              Your Principal ID is used to send and receive:
            </span>
            {bulletItems(["videos", "NFT copies", "collectibles"])}
          </div>
          <p style={bodyTextStyle}>between Minty users.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Cow Helper ───────────────────────────────────────────────────────────────
function CowHelper({ onClick }: { onClick: () => void }) {
  const [isBouncing, setIsBouncing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 800);
    }, 7000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  let animation = "cow-sway 3.5s ease-in-out infinite";
  if (isBouncing) animation = "cow-bounce 0.8s ease-in-out";

  const glowFilter = isHovered
    ? "drop-shadow(0 0 6px rgba(var(--cycle-accent-rgb),0.35))"
    : "none";

  return (
    <button
      type="button"
      data-ocid="cow.open_modal_button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Wallet info"
      title="Wallet info"
      style={{
        width: "36px",
        height: "36px",
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        userSelect: "none",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src="https://dl.dropboxusercontent.com/scl/fi/aoe7dmzh7jqriugs8p9xl/Photo-Apr-05-2026-2-05-53-AM.png?rlkey=6squh6tpozf5ljw7gtiwl0ovz"
        alt="Minty helper"
        draggable={false}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
        style={{
          width: "36px",
          height: "36px",
          objectFit: "contain",
          borderRadius: "8px",
          animation,
          filter: glowFilter,
          transition: "filter 0.3s ease",
          willChange: "transform, filter",
          userSelect: "none",
        }}
      />
    </button>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────
interface TopBarProps {
  onProfileClick?: () => void;
}

export function TopBar({ onProfileClick }: TopBarProps) {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { activeStyle: activeCycle } = usePackStyle();
  const { btcBalance } = useWalletContext();

  const [signInOpen, setSignInOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [cowInfoOpen, setCowInfoOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);

  const { price: btcPrice } = useBtcPrice();

  const MINTY_LOGO =
    "https://dl.dropboxusercontent.com/scl/fi/xvqgzclmz0guu1k2rt8w5/Photo-Apr-07-2026-11-27-28-PM.png?rlkey=zh48w4urma16ow195gnihyvcj&dl=0";
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    injectNeonStyles(
      activeCycle.accentR,
      activeCycle.accentG,
      activeCycle.accentB,
      activeCycle.logoFilter,
    );
  }, [activeCycle]);

  const isSignedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const accentRgb = `${activeCycle.accentR},${activeCycle.accentG},${activeCycle.accentB}`;

  function handleAuthButtonClick() {
    if (isSignedIn) setWalletOpen(true);
    else setSignInOpen(true);
  }

  function handleModalSignIn() {
    login();
    setSignInOpen(false);
  }

  // Format balance for header chip display
  const usdEquiv =
    btcBalance !== null && btcPrice !== null ? btcBalance * btcPrice : null;
  const balanceChip =
    isSignedIn && btcBalance !== null
      ? `${btcBalance.toFixed(5)} BTC${usdEquiv !== null ? ` ($${usdEquiv.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : ""}`
      : null;

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between backdrop-blur-xl border-b"
        style={{
          background: "var(--echo-header-bg)",
          borderColor: "var(--echo-header-border)",
          height: "72px",
          paddingLeft: "16px",
          paddingRight: "20px",
        }}
      >
        {/* Minty Logo */}
        <div
          className="relative flex items-center"
          style={{ paddingTop: "6px" }}
        >
          {logoError ? (
            <span
              style={{
                fontSize: "18px",
                fontWeight: 800,
                color: "var(--cycle-accent)",
                fontFamily: "DM Sans, sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              Minty
            </span>
          ) : (
            <img
              src={MINTY_LOGO}
              alt="Minty"
              className="select-none"
              onError={() => setLogoError(true)}
              style={{
                height: "140px",
                maxHeight: "140px",
                width: "auto",
                maxWidth: "min(340px, 70vw)",
                objectFit: "contain",
                imageRendering: "auto",
                display: "block",
                background: "transparent",
              }}
              draggable={false}
            />
          )}
        </div>

        <div className="flex items-center self-center gap-2">
          {/* Profile button */}
          {onProfileClick && (
            <button
              type="button"
              onClick={onProfileClick}
              data-ocid="topbar.profile.button"
              aria-label="View Profile"
              title="View Profile"
              className="flex items-center gap-1.5 transition-all duration-150"
              style={{
                padding: "5px 12px",
                fontSize: "12px",
                fontWeight: 500,
                letterSpacing: "0.01em",
                color: "var(--cycle-accent)",
                background: `rgba(${accentRgb},0.07)`,
                border: `1px solid rgba(${accentRgb},0.20)`,
                borderRadius: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  `rgba(${accentRgb},0.12)`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  `rgba(${accentRgb},0.07)`;
              }}
            >
              <UserCircle size={14} strokeWidth={1.6} />
              Profile
            </button>
          )}

          {/* Auth / Wallet button — shows real balance when signed in */}
          <button
            type="button"
            onClick={handleAuthButtonClick}
            data-ocid="auth.button"
            aria-label={isSignedIn ? "Open wallet" : "Sign in"}
            className="group flex items-center gap-2 font-medium text-sm transition-all duration-150 select-none"
            style={{
              borderRadius: "20px",
              paddingLeft: "10px",
              paddingRight: "12px",
              paddingTop: "7px",
              paddingBottom: "7px",
              backgroundColor: "rgba(247, 249, 252, 1)",
              color: "#1A2840",
              border: "1px solid #D0DFEF",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.backgroundColor = "rgba(240, 244, 250, 1)";
              el.style.borderColor = "#C0D4EC";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.backgroundColor = "rgba(247, 249, 252, 1)";
              el.style.borderColor = "#D0DFEF";
            }}
          >
            {isSignedIn ? (
              <Wallet
                size={17}
                strokeWidth={1.6}
                style={{ color: "var(--cycle-accent)" }}
              />
            ) : (
              <ShieldCheck
                size={17}
                strokeWidth={1.6}
                style={{ color: "var(--cycle-accent)" }}
              />
            )}
            <span
              className="leading-none text-[13px]"
              data-ocid="topbar.balance.label"
            >
              {balanceChip ?? (isSignedIn ? "Wallet" : "Sign In")}
            </span>
          </button>

          {/* Cow Helper */}
          <CowHelper onClick={() => setCowInfoOpen(true)} />
        </div>
      </header>

      <SignInModal
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        onSignIn={handleModalSignIn}
        isLoggingIn={isLoggingIn}
      />
      <WalletModal
        open={walletOpen}
        onClose={() => setWalletOpen(false)}
        onSignOut={clear}
        onOpenDeposit={() => setDepositOpen(true)}
      />
      <CowInfoModal open={cowInfoOpen} onClose={() => setCowInfoOpen(false)} />
      <DepositModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        btcPrice={btcPrice}
      />
    </>
  );
}

export { isLight };
