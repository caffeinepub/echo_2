import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  ArrowLeft,
  Copy,
  Info,
  Send,
  ShieldCheck,
  UserCircle,
  Wallet,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  PACK_STYLES,
  type PackStyle,
  type PackStyleId,
  usePackStyle,
} from "../context/PackStyleContext";

// Always light mode — dark mode removed
const isLight = true;

let neonStyleEl: HTMLStyleElement | null = null;

function injectNeonStyles(r: number, g: number, b: number, filter: string) {
  if (!neonStyleEl) {
    neonStyleEl = document.createElement("style");
    document.head.appendChild(neonStyleEl);
  }

  neonStyleEl.textContent = `
@keyframes echo-neon-breathe-light {
  0%,100% { filter: ${filter !== "none" ? `${filter} ` : ""}brightness(0.92) drop-shadow(0 0 1px rgba(${r},${g},${b},0.22)) drop-shadow(0 0 3px rgba(${r},${g},${b},0.12)); }
  50%     { filter: ${filter !== "none" ? `${filter} ` : ""}brightness(0.96) drop-shadow(0 0 2px rgba(${r},${g},${b},0.3))  drop-shadow(0 0 6px rgba(${r},${g},${b},0.16)); }
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

// ─── BTC Asset Constant ───────────────────────────────────────────────────────

const BTC_ASSET = {
  id: "btc",
  name: "Bitcoin",
  symbol: "BTC",
  balance: 0.00412,
  color: "#F7931A",
  description: "Bitcoin — the original decentralized cryptocurrency.",
  receiveAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
} as const;

type BtcAssetType = typeof BTC_ASSET;
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

      // Fallback to last known price on fetch failure
      if (price === null) {
        price = lastPriceRef.current;
      }

      let change24h = 2.34; // static fallback
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

      setState({
        price,
        change24h,
        loading: false,
        error: price === null,
      });
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

// ─── Pack Style Selector ──────────────────────────────────────────────────────
function PackStyleSelector() {
  const { activeStyleId, setStyleId } = usePackStyle();

  return (
    <div
      data-ocid="topbar.packstyle.panel"
      style={{ display: "flex", alignItems: "center", gap: "6px" }}
    >
      {(Object.values(PACK_STYLES) as PackStyle[]).map((style) => {
        const isActive = activeStyleId === style.id;
        const cRgb = `${style.accentR},${style.accentG},${style.accentB}`;
        return (
          <button
            key={style.id}
            type="button"
            data-ocid={`topbar.packstyle.${style.name}.button`}
            onClick={() => setStyleId(style.id as PackStyleId)}
            aria-label={`Pack style: ${style.label}`}
            title={style.label}
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              border: isActive
                ? `2px solid oklch(${style.accentOklchLight})`
                : "2px solid transparent",
              background: `oklch(${style.accentOklchLight})`,
              opacity: isActive ? 1 : 0.65,
              cursor: "pointer",
              padding: 0,
              boxShadow: isActive ? `0 0 8px rgba(${cRgb},0.55)` : "none",
              transition: "opacity 0.15s, box-shadow 0.15s, border-color 0.15s",
              flexShrink: 0,
            }}
          />
        );
      })}
    </div>
  );
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
  asset,
  btcPrice,
  onReceive,
  onSend,
  onInfo,
}: {
  asset: BtcAssetType;
  btcPrice: number | null;
  onReceive: () => void;
  onSend: () => void;
  onInfo: () => void;
}) {
  const usdEquivalent = btcPrice !== null ? asset.balance * btcPrice : null;

  return (
    <div
      data-ocid={`wallet.asset.${asset.id}.card`}
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
          background: asset.color,
          fontSize: "11px",
          letterSpacing: "0.02em",
          boxShadow: `0 2px 8px ${asset.color}44`,
        }}
      >
        ₿
      </div>

      <div className="flex-1 min-w-0">
        <div
          className="font-semibold leading-tight truncate"
          style={{ fontSize: "14px", color: "#0D1520" }}
        >
          {asset.name}
        </div>
        <div className="mt-0.5" style={{ fontSize: "11px", color: "#8BAEC8" }}>
          Balance
        </div>
        <div
          className="font-medium leading-tight"
          style={{ fontSize: "13px", color: "var(--cycle-accent)" }}
        >
          {asset.balance.toFixed(5)} {asset.symbol}
        </div>
        {/* USD equivalent line */}
        <div
          style={{
            fontSize: "11px",
            color: "#8BAEC8",
            marginTop: "2px",
          }}
        >
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
          label="Receive"
          icon=<ArrowLeft size={10} />
          onClick={onReceive}
        />
        <ActionPill label="Send" icon=<Send size={10} /> onClick={onSend} />
        <ActionPill label="Info" icon=<Info size={10} /> onClick={onInfo} />
      </div>
    </div>
  );
}

// ─── Wallet Modal ─────────────────────────────────────────────────────────────
function WalletModal({
  open,
  onClose,
  onSignOut,
}: {
  open: boolean;
  onClose: () => void;
  onSignOut: () => void;
}) {
  const [view, setView] = useState<WalletView>("list");
  const [sendAmount, setSendAmount] = useState("");
  const [sendAddress, setSendAddress] = useState("");
  const [copied, setCopied] = useState(false);

  const { price: btcPrice, change24h, loading: priceLoading } = useBtcPrice();

  if (!open) return null;

  const totalBalance = btcPrice !== null ? BTC_ASSET.balance * btcPrice : null;

  function goBack() {
    setView("list");
    setSendAmount("");
    setSendAddress("");
    setCopied(false);
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              background: BTC_ASSET.color,
              fontSize: "16px",
              boxShadow: `0 2px 10px ${BTC_ASSET.color}55`,
            }}
          >
            ₿
          </div>
          <div>
            <div
              style={{ fontSize: "17px", fontWeight: 700, color: titleColor }}
            >
              {BTC_ASSET.name}
            </div>
            <div style={{ fontSize: "12px", color: labelColor }}>
              {BTC_ASSET.symbol}
            </div>
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
          {BTC_ASSET.description}
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
          Receive {BTC_ASSET.symbol}
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
            {BTC_ASSET.receiveAddress}
          </span>
          <button
            type="button"
            data-ocid="wallet.receive.copy_button"
            onClick={() => handleCopy(BTC_ASSET.receiveAddress)}
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
          Only send {BTC_ASSET.symbol} to this address.
        </p>
      </>
    );
  } else if (view === "send") {
    const canSend = sendAmount.trim() !== "" && sendAddress.trim() !== "";
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
            marginBottom: 18,
            fontFamily: "DM Sans, sans-serif",
            lineHeight: 1.1,
          }}
        >
          Send {BTC_ASSET.symbol}
        </div>

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
              placeholder={`0.00 ${BTC_ASSET.symbol}`}
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
              style={inputStyle}
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
              placeholder="Enter address\u2026"
              value={sendAddress}
              onChange={(e) => setSendAddress(e.target.value)}
              style={{
                ...inputStyle,
                fontFamily: "monospace",
                fontSize: "12px",
              }}
            />
          </div>

          <button
            type="button"
            data-ocid="wallet.send.confirm_button"
            disabled={!canSend}
            className="w-full rounded-xl font-semibold transition-all duration-150"
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
            Confirm Send
          </button>
        </div>
      </>
    );
  } else {
    // list view
    content = (
      <>
        <div className="text-center mb-5">
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
              `$${totalBalance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            ) : (
              "$—"
            )}
          </div>
        </div>

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
              asset={BTC_ASSET}
              btcPrice={btcPrice}
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
}: {
  open: boolean;
  onClose: () => void;
}) {
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
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: "18px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img
              src="/assets/generated/minty-cow-mascot-transparent.dim_200x200.png"
              alt="Cow helper"
              style={{ width: "24px", height: "24px", objectFit: "contain" }}
              draggable={false}
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

        {/* Body */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Section 1 */}
          <p style={bodyTextStyle}>
            This BTC wallet is used for Minty deposits and purchasing assets
            inside Minty.
          </p>

          {/* Section 2 */}
          <div>
            <span style={labelStyle}>Funds stored here are used for:</span>
            {bulletItems([
              "minting moments",
              "buying packs",
              "bidding on video NFTs",
            ])}
          </div>

          {/* Section 3 */}
          <p style={bodyTextStyle}>
            This wallet is not intended as a primary external crypto wallet.
          </p>

          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: "rgba(0,0,0,0.06)",
              margin: "0",
            }}
          />

          {/* Section 4 */}
          <div>
            <span style={labelStyle}>
              Your Principal ID is used to send and receive:
            </span>
            {bulletItems(["photos", "videos", "packs", "collectibles"])}
          </div>

          {/* Section 5 */}
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
    // Trigger bounce every 7 seconds
    intervalRef.current = setInterval(() => {
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 800);
    }, 7000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  let animation = "cow-sway 3.5s ease-in-out infinite";
  if (isBouncing) {
    animation = "cow-bounce 0.8s ease-in-out";
  }

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
        src="/assets/generated/minty-cow-mascot-transparent.dim_200x200.png"
        alt="Cow helper"
        draggable={false}
        style={{
          width: "36px",
          height: "36px",
          objectFit: "contain",
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
  const [signInOpen, setSignInOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [cowInfoOpen, setCowInfoOpen] = useState(false);

  const MINTY_LOGO =
    "/assets/generated/minty-wordmark-logo-transparent.dim_600x180.png";

  // Reinject neon styles whenever cycle changes
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
    if (isSignedIn) {
      setWalletOpen(true);
    } else {
      setSignInOpen(true);
    }
  }

  function handleModalSignIn() {
    login();
    setSignInOpen(false);
  }

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
          <img
            src={MINTY_LOGO}
            alt="Minty"
            className="echo-logo-neon select-none"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
            style={{
              width: "180px",
              height: "auto",
              maxWidth: "min(180px, 30vw)",
              objectFit: "contain",
              imageRendering: "auto",
              display: "block",
              background: "transparent",
              filter:
                activeCycle.logoFilter !== "none"
                  ? activeCycle.logoFilter
                  : undefined,
            }}
            draggable={false}
          />
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

          {/* Pack Style Selector */}
          <PackStyleSelector />

          {/* Auth / Wallet button */}
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
            <span className="leading-none text-[13px]">
              {isSignedIn ? "Wallet" : "Sign In"}
            </span>
          </button>

          {/* Cow Helper — sits quietly to the right of the Wallet button */}
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
      />

      <CowInfoModal open={cowInfoOpen} onClose={() => setCowInfoOpen(false)} />
    </>
  );
}

// Re-export for backwards compatibility (isLight is always true now)
export { isLight };
