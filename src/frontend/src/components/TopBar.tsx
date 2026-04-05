import {
  ArrowLeft,
  Copy,
  Info,
  Send,
  Settings2,
  ShieldCheck,
  UserCircle,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { isAdminPrincipal } from "../config/admin";
import {
  CYCLE_THEMES,
  type CycleId,
  useCycleTheme,
} from "../context/CycleThemeContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

// Always light mode — dark mode removed
const isLight = true;

let neonStyleEl: HTMLStyleElement | null = null;

function injectNeonStyles(
  r: number,
  g: number,
  b: number,
  filter: string,
  cycleId: number,
) {
  if (!neonStyleEl) {
    neonStyleEl = document.createElement("style");
    document.head.appendChild(neonStyleEl);
  }

  const isGold = cycleId === 6;

  // Base breathe animation — overridden for gold
  const baseBreathe = isGold
    ? `
@keyframes echo-neon-breathe-light {
  0%,100% { filter: drop-shadow(0 0 3px rgba(212,175,55,0.40)) drop-shadow(0 0 8px rgba(212,175,55,0.20)); }
  50%     { filter: drop-shadow(0 0 6px rgba(212,175,55,0.58)) drop-shadow(0 0 16px rgba(212,175,55,0.28)); }
}
`
    : `
@keyframes echo-neon-breathe-light {
  0%,100% { filter: ${filter !== "none" ? `${filter} ` : ""}brightness(0.92) drop-shadow(0 0 1px rgba(${r},${g},${b},0.22)) drop-shadow(0 0 3px rgba(${r},${g},${b},0.12)); }
  50%     { filter: ${filter !== "none" ? `${filter} ` : ""}brightness(0.96) drop-shadow(0 0 2px rgba(${r},${g},${b},0.3))  drop-shadow(0 0 6px rgba(${r},${g},${b},0.16)); }
}
`;

  const goldExtras = isGold
    ? `
/* ── Gold shimmer sweep ─────────────────────────────────────────── */
.gold-shimmer-sweep {
  background: linear-gradient(
    118deg,
    transparent 20%,
    rgba(255, 252, 210, 0.00) 30%,
    rgba(255, 248, 190, 0.38) 46%,
    rgba(255, 255, 235, 0.55) 50%,
    rgba(255, 248, 190, 0.38) 54%,
    rgba(255, 252, 210, 0.00) 70%,
    transparent 80%
  );
  background-size: 300% 100%;
  animation: gold-sweep 5.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
  border-radius: 4px;
}

@keyframes gold-sweep {
  0%   { background-position: 160% center; opacity: 0; }
  4%   { opacity: 1; }
  42%  { background-position: -60% center; opacity: 1; }
  54%  { opacity: 0; }
  100% { background-position: -60% center; opacity: 0; }
}

/* ── Star gleams ─────────────────────────────────────────────────── */
.gold-gleam {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 228, 0.96);
  box-shadow:
    0 0 3px 1px rgba(255, 248, 150, 0.9),
    0 0 7px 3px rgba(255, 220, 60, 0.45),
    0 0 12px 5px rgba(212, 175, 55, 0.20);
  pointer-events: none;
  opacity: 0;
}

.gold-gleam-1 {
  top: 28%;
  left: 10%;
  animation: gold-gleam-pulse 8s ease-in-out 0.6s infinite;
}
.gold-gleam-2 {
  top: 52%;
  left: 52%;
  animation: gold-gleam-pulse 8s ease-in-out 3.1s infinite;
}
.gold-gleam-3 {
  top: 22%;
  left: 80%;
  animation: gold-gleam-pulse 8s ease-in-out 5.8s infinite;
}

@keyframes gold-gleam-pulse {
  0%, 82%  { opacity: 0; transform: scale(0.5); }
  87%      { opacity: 0.92; transform: scale(1.3); }
  91%      { opacity: 0.65; transform: scale(1.05); }
  96%      { opacity: 0; transform: scale(0.4); }
  100%     { opacity: 0; transform: scale(0.5); }
}
`
    : "";

  neonStyleEl.textContent = `
${baseBreathe}

.echo-logo-neon {
  animation: echo-neon-breathe-light ${isGold ? "4.2s" : "3.8s"} ease-in-out infinite;
  will-change: filter;
}
${goldExtras}`;
}

// ─── Asset Data ────────────────────────────────────────────────────────────────
const ASSETS = [
  {
    id: "usdc",
    name: "USDC",
    symbol: "USDC",
    balance: 245.5,
    usdValue: 245.5,
    color: "#2775CA",
    description: "USD Coin — a fully-backed US dollar stablecoin.",
    price: 1.0,
    change24h: 0.01,
    receiveAddress: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
  },
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    balance: 0.00412,
    usdValue: 412.87,
    color: "#F7931A",
    description: "Bitcoin — the original decentralized cryptocurrency.",
    price: 100211.65,
    change24h: 2.34,
    receiveAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    balance: 0.185,
    usdValue: 389.4,
    color: "#627EEA",
    description: "Ethereum — a decentralized platform for smart contracts.",
    price: 2105.41,
    change24h: -1.12,
    receiveAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  },
  {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    balance: 14.2,
    usdValue: 198.8,
    color: "#9945FF",
    description: "Solana — high-performance blockchain for decentralized apps.",
    price: 13.99,
    change24h: 0.88,
    receiveAddress: "7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV1",
  },
];

type AssetType = (typeof ASSETS)[number];
type WalletView = "list" | "receive" | "send" | "info";

// ─── Cycle Selector ────────────────────────────────────────────────────────────
function CycleSelector() {
  const { activeCycleId, activeCycle, setCycleId } = useCycleTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const accentRgb = `${activeCycle.accentR},${activeCycle.accentG},${activeCycle.accentB}`;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        data-ocid="topbar.cycle.button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change cycle theme"
        title="Change cycle theme"
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          border: `2px solid rgba(${accentRgb},0.50)`,
          background: `rgba(${accentRgb},0.12)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: `0 0 8px rgba(${accentRgb},0.20)`,
          transition: "border-color 0.2s, box-shadow 0.2s",
          flexShrink: 0,
          padding: 0,
        }}
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: `oklch(${activeCycle.accentOklchLight})`,
            boxShadow: `0 0 6px rgba(${accentRgb},0.5)`,
          }}
        />
      </button>

      {/* Dropdown panel — light surface */}
      {open && (
        <div
          data-ocid="topbar.cycle.dropdown_menu"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            zIndex: 200,
            background: "#FFFFFF",
            border: `1px solid rgba(${accentRgb},0.20)`,
            borderRadius: "14px",
            padding: "10px",
            width: "185px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}
        >
          <div
            style={{
              fontSize: "9px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(0,0,0,0.38)",
              marginBottom: "8px",
              paddingLeft: "4px",
            }}
          >
            Supply Cycle
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {(
              Object.values(CYCLE_THEMES) as (typeof CYCLE_THEMES)[CycleId][]
            ).map((cycle) => {
              const isActive = activeCycleId === cycle.id;
              const cRgb = `${cycle.accentR},${cycle.accentG},${cycle.accentB}`;
              return (
                <button
                  key={cycle.id}
                  type="button"
                  data-ocid={`topbar.cycle.item.${cycle.id}`}
                  onClick={() => {
                    setCycleId(cycle.id as CycleId);
                    setOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    padding: "7px 8px",
                    borderRadius: "9px",
                    border: isActive
                      ? `1px solid rgba(${cRgb},0.20)`
                      : "1px solid transparent",
                    cursor: "pointer",
                    background: isActive ? `rgba(${cRgb},0.10)` : "transparent",
                    transition: "background 0.15s",
                    width: "100%",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLButtonElement).style.background =
                        `rgba(${cRgb},0.06)`;
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "transparent";
                  }}
                >
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: `oklch(${cycle.accentOklchLight})`,
                      flexShrink: 0,
                      boxShadow: isActive
                        ? `0 0 6px rgba(${cRgb},0.5)`
                        : "none",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "12px",
                      color: isActive
                        ? `oklch(${cycle.accentOklchLight})`
                        : "rgba(0,0,0,0.62)",
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {cycle.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Action pill button ────────────────────────────────────────────────────────
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

// ─── Asset Row ─────────────────────────────────────────────────────────────────
function AssetRow({
  asset,
  onReceive,
  onSend,
  onInfo,
}: {
  asset: AssetType;
  onReceive: () => void;
  onSend: () => void;
  onInfo: () => void;
}) {
  const initials = asset.symbol.slice(0, 2).toUpperCase();

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
      <div
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold"
        style={{
          background: asset.color,
          fontSize: "11px",
          letterSpacing: "0.02em",
          boxShadow: `0 2px 8px ${asset.color}44`,
        }}
      >
        {initials}
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
          {asset.balance < 0.01
            ? asset.balance.toFixed(5)
            : asset.balance.toLocaleString()}{" "}
          {asset.symbol}
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

// ─── Wallet Modal ──────────────────────────────────────────────────────────────
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
  const [activeAsset, setActiveAsset] = useState<AssetType | null>(null);
  const [sendAmount, setSendAmount] = useState("");
  const [sendAddress, setSendAddress] = useState("");
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const totalBalance = ASSETS.reduce((sum, a) => sum + a.usdValue, 0);

  function goBack() {
    setView("list");
    setActiveAsset(null);
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

  if (view === "info" && activeAsset) {
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
              background: activeAsset.color,
              fontSize: "12px",
              boxShadow: `0 2px 10px ${activeAsset.color}55`,
            }}
          >
            {activeAsset.symbol.slice(0, 2)}
          </div>
          <div>
            <div
              style={{ fontSize: "17px", fontWeight: 700, color: titleColor }}
            >
              {activeAsset.name}
            </div>
            <div style={{ fontSize: "12px", color: labelColor }}>
              {activeAsset.symbol}
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
          {activeAsset.description}
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
              ${activeAsset.price.toLocaleString()}
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
                  activeAsset.change24h >= 0
                    ? "var(--cycle-accent)"
                    : "oklch(0.60 0.18 25)",
              }}
            >
              {activeAsset.change24h >= 0 ? "+" : ""}
              {activeAsset.change24h}%
            </div>
          </div>
        </div>
      </>
    );
  } else if (view === "receive" && activeAsset) {
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
            fontSize: "17px",
            fontWeight: 700,
            color: titleColor,
            marginBottom: 16,
          }}
        >
          Receive {activeAsset.symbol}
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
            {activeAsset.receiveAddress}
          </span>
          <button
            type="button"
            data-ocid="wallet.receive.copy_button"
            onClick={() => handleCopy(activeAsset.receiveAddress)}
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
          Only send {activeAsset.symbol} to this address.
        </p>
      </>
    );
  } else if (view === "send" && activeAsset) {
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
            fontSize: "17px",
            fontWeight: 700,
            color: titleColor,
            marginBottom: 18,
          }}
        >
          Send {activeAsset.symbol}
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
              placeholder={`0.00 ${activeAsset.symbol}`}
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
            $
            {totalBalance.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
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
          {ASSETS.map((asset, i) => (
            <div key={asset.id} data-ocid={`wallet.asset.item.${i + 1}`}>
              <AssetRow
                asset={asset}
                onReceive={() => {
                  setActiveAsset(asset);
                  setView("receive");
                }}
                onSend={() => {
                  setActiveAsset(asset);
                  setView("send");
                }}
                onInfo={() => {
                  setActiveAsset(asset);
                  setView("info");
                }}
              />
            </div>
          ))}
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
              style={{ fontSize: "16px", fontWeight: 700, color: "#0D1520" }}
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

// ─── Sign In Modal ─────────────────────────────────────────────────────────────
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
          className="text-center font-semibold mb-1"
          style={{ fontSize: "17px", color: "#0D1520" }}
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

// ─── TopBar ────────────────────────────────────────────────────────────────────
interface TopBarProps {
  onAdminClick?: () => void;
  onProfileClick?: () => void;
}

export function TopBar({ onAdminClick, onProfileClick }: TopBarProps) {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { activeCycle, activeCycleId } = useCycleTheme();
  const [signInOpen, setSignInOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);

  const isGoldCycle = activeCycleId === 6;

  // Gold cycle uses dedicated champagne-gold logo; other cycles use original with CSS filter
  const MINTY_LOGO = isGoldCycle
    ? "/assets/generated/minty-logo-gold-prestige-transparent.dim_540x120.png"
    : "/assets/minty-logo.png";

  // Reinject neon styles whenever cycle changes
  useEffect(() => {
    injectNeonStyles(
      activeCycle.accentR,
      activeCycle.accentG,
      activeCycle.accentB,
      isGoldCycle ? "" : activeCycle.logoFilter, // Gold uses dedicated image, no filter
      activeCycleId,
    );
  }, [activeCycle, activeCycleId, isGoldCycle]);

  const isSignedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const isAdmin = isAdminPrincipal(identity?.getPrincipal().toText());

  const uploadBg = isGoldCycle
    ? "#FFFFFF"
    : "rgba(var(--cycle-accent-rgb),0.07)";
  const uploadBgHover = isGoldCycle
    ? "#FFFEF8"
    : "rgba(var(--cycle-accent-rgb),0.12)";
  const uploadBorder = isGoldCycle
    ? "1px solid rgba(212,175,55,0.65)"
    : "1px solid rgba(var(--cycle-accent-rgb),0.20)";
  const uploadColor = isGoldCycle ? "#9A7B1C" : "var(--cycle-accent)";
  const uploadShadow = isGoldCycle
    ? "0 0 10px rgba(212,175,55,0.22), 0 0 3px rgba(212,175,55,0.10), 0 1px 3px rgba(0,0,0,0.05)"
    : "0 1px 3px rgba(0,0,0,0.06)";

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
        {/* Minty Logo — gold cycle gets shimmer overlay treatment */}
        <div
          className={`relative flex items-center${isGoldCycle ? " gold-cycle-active" : ""}`}
          style={{
            paddingTop: "6px",
            // Clip the shimmer sweep to the logo bounds when gold cycle is active
            overflow: isGoldCycle ? "hidden" : "visible",
            borderRadius: isGoldCycle ? "4px" : undefined,
          }}
        >
          <img
            src={MINTY_LOGO}
            alt="Minty"
            className="echo-logo-neon select-none"
            style={{
              width: "180px",
              height: "auto",
              maxWidth: "min(180px, 30vw)",
              objectFit: "contain",
              imageRendering: "auto",
              display: "block",
              background: "transparent",
              filter: isGoldCycle
                ? undefined
                : activeCycle.logoFilter !== "none"
                  ? activeCycle.logoFilter
                  : undefined,
            }}
            draggable={false}
          />

          {/* Gold prestige shimmer — only rendered for Cycle 6 */}
          {isGoldCycle && (
            <>
              {/* Light sweep across the logo surface */}
              <div
                className="gold-shimmer-sweep"
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />
              {/* Star gleams at strategic positions on the logo */}
              <span
                className="gold-gleam gold-gleam-1"
                style={{ position: "absolute", zIndex: 2 }}
              />
              <span
                className="gold-gleam gold-gleam-2"
                style={{ position: "absolute", zIndex: 2 }}
              />
              <span
                className="gold-gleam gold-gleam-3"
                style={{ position: "absolute", zIndex: 2 }}
              />
            </>
          )}
        </div>

        <div className="flex items-center self-center gap-2">
          {/* Admin Manage button */}
          {isAdmin && onAdminClick && (
            <button
              type="button"
              onClick={onAdminClick}
              data-ocid="topbar.admin.button"
              aria-label="Manage Catalog"
              title="Manage Catalog"
              className="flex items-center gap-1.5 transition-all duration-150"
              style={{
                padding: "5px 12px",
                fontSize: "12px",
                fontWeight: 500,
                letterSpacing: "0.01em",
                color: uploadColor,
                background: uploadBg,
                border: uploadBorder,
                borderRadius: "20px",
                boxShadow: uploadShadow,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  uploadBgHover;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  uploadBg;
              }}
            >
              <Settings2 size={13} />
              Manage
            </button>
          )}

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
                color: uploadColor,
                background: uploadBg,
                border: uploadBorder,
                borderRadius: "20px",
                boxShadow: uploadShadow,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  uploadBgHover;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  uploadBg;
              }}
            >
              <UserCircle size={14} strokeWidth={1.6} />
              Profile
            </button>
          )}

          {/* Cycle Selector */}
          <CycleSelector />

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
              backgroundColor: isGoldCycle
                ? "#FFFFFF"
                : "rgba(247, 249, 252, 1)",
              color: isGoldCycle ? "#9A7B1C" : "#1A2840",
              border: isGoldCycle
                ? "1px solid rgba(212,175,55,0.65)"
                : "1px solid #D0DFEF",
              boxShadow: isGoldCycle
                ? "0 0 12px rgba(212,175,55,0.24), 0 1px 3px rgba(0,0,0,0.05)"
                : "0 1px 3px rgba(0,0,0,0.06)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              if (isGoldCycle) {
                el.style.backgroundColor = "#FFFEF8";
                el.style.borderColor = "rgba(212,175,55,0.88)";
                el.style.boxShadow =
                  "0 0 18px rgba(212,175,55,0.35), 0 0 6px rgba(212,175,55,0.18), 0 1px 4px rgba(0,0,0,0.07)";
              } else {
                el.style.backgroundColor = "rgba(240, 244, 250, 1)";
                el.style.borderColor = "#C0D4EC";
              }
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              if (isGoldCycle) {
                el.style.backgroundColor = "#FFFFFF";
                el.style.borderColor = "rgba(212,175,55,0.65)";
                el.style.boxShadow =
                  "0 0 12px rgba(212,175,55,0.24), 0 1px 3px rgba(0,0,0,0.05)";
              } else {
                el.style.backgroundColor = "rgba(247, 249, 252, 1)";
                el.style.borderColor = "#D0DFEF";
              }
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
    </>
  );
}

// Re-export for backwards compatibility (isLight is always true now)
export { isLight };
