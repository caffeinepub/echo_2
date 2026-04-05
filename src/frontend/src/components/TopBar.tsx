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
import { useEffect, useRef, useState } from "react";
import {
  PACK_STYLES,
  type PackStyle,
  type PackStyleId,
  usePackStyle,
} from "../context/PackStyleContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

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
`;
}

// ─── Asset Data ──────────────────────────────────────────────────────────────────────────────────

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

// ─── Pack Style Selector ──────────────────────────────────────────────────────────────────────────────
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

// ─── Action pill button ───────────────────────────────────────────────────────────────────────────────────────────
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

// ─── Asset Row ──────────────────────────────────────────────────────────────────────────────────────────────
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

// ─── Wallet Modal ───────────────────────────────────────────────────────────────────────────────────────────
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

// ─── Sign In Modal ────────────────────────────────────────────────────────────────────────────────────
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

// ─── TopBar ────────────────────────────────────────────────────────────────────────────────────────────────────
interface TopBarProps {
  onProfileClick?: () => void;
}

export function TopBar({ onProfileClick }: TopBarProps) {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { activeStyle: activeCycle } = usePackStyle();
  const [signInOpen, setSignInOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);

  const MINTY_LOGO = "/assets/minty-logo.png";

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

          {/* Cycle Selector */}
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
