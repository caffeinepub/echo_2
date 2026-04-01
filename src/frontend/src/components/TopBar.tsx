import {
  ArrowLeft,
  Copy,
  Info,
  Moon,
  Send,
  Settings2,
  ShieldCheck,
  Sun,
  Upload,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "../ThemeContext";
import { ADMIN_WALLET_ADDRESS } from "../config/admin";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useWallet } from "../hooks/useWallet";

const MINTY_LOGO =
  "/assets/echo_primary_logo_transparent-019d2c1a-ab89-7669-bf3e-9906cbb6a311.png";

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

// ─── Action pill button ────────────────────────────────────────────────────────
function ActionPill({
  label,
  icon,
  onClick,
  isLight,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  isLight: boolean;
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
        color: isLight ? "oklch(0.52 0.18 160)" : "oklch(0.72 0.18 160)",
        background: isLight
          ? "rgba(52,211,153,0.08)"
          : "oklch(0.45 0.16 160 / 0.10)",
        border: isLight
          ? "1px solid rgba(52,211,153,0.28)"
          : "1px solid oklch(0.55 0.18 160 / 0.25)",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = isLight
          ? "rgba(52,211,153,0.15)"
          : "oklch(0.45 0.16 160 / 0.18)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = isLight
          ? "rgba(52,211,153,0.08)"
          : "oklch(0.45 0.16 160 / 0.10)";
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
  isLight,
  onReceive,
  onSend,
  onInfo,
}: {
  asset: AssetType;
  isLight: boolean;
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
        background: isLight ? "#ffffff" : "oklch(0.18 0.06 165 / 0.85)",
        border: isLight
          ? "1px solid rgba(0,0,0,0.06)"
          : "1px solid oklch(0.50 0.15 160 / 0.25)",
        boxShadow: isLight
          ? "0 2px 10px rgba(0,0,0,0.04)"
          : "0 2px 12px oklch(0.65 0.18 160 / 0.06)",
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      {/* Asset badge */}
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

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div
          className="font-semibold leading-tight truncate"
          style={{
            fontSize: "14px",
            color: isLight ? "#0d1f1a" : "rgba(255,255,255,0.92)",
          }}
        >
          {asset.name}
        </div>
        <div
          className="mt-0.5"
          style={{
            fontSize: "11px",
            color: isLight ? "#6b8a80" : "oklch(0.62 0.08 160)",
          }}
        >
          Balance
        </div>
        <div
          className="font-medium leading-tight"
          style={{
            fontSize: "13px",
            color: isLight ? "#1a3a30" : "oklch(0.85 0.12 160)",
          }}
        >
          {asset.balance < 0.01
            ? asset.balance.toFixed(5)
            : asset.balance.toLocaleString()}{" "}
          {asset.symbol}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1 flex-shrink-0">
        <ActionPill
          label="Receive"
          icon=<ArrowLeft size={10} />
          onClick={onReceive}
          isLight={isLight}
        />
        <ActionPill
          label="Send"
          icon=<Send size={10} />
          onClick={onSend}
          isLight={isLight}
        />
        <ActionPill
          label="Info"
          icon=<Info size={10} />
          onClick={onInfo}
          isLight={isLight}
        />
      </div>
    </div>
  );
}

// ─── Wallet Modal ──────────────────────────────────────────────────────────────
function WalletModal({
  open,
  onClose,
  onSignOut,
  isLight,
}: {
  open: boolean;
  onClose: () => void;
  onSignOut: () => void;
  isLight: boolean;
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
    background: isLight ? "#ffffff" : "oklch(0.14 0.05 165 / 0.97)",
    border: isLight
      ? "1px solid rgba(52,211,153,0.20)"
      : "1px solid oklch(0.55 0.18 160 / 0.30)",
    boxShadow: isLight
      ? "0 20px 60px rgba(0,0,0,0.10)"
      : "0 20px 60px rgba(0,0,0,0.55), 0 0 40px oklch(0.65 0.18 160 / 0.08)",
  };

  const labelColor = isLight ? "#6b8a80" : "oklch(0.62 0.08 160)";
  const titleColor = isLight ? "#0d1f1a" : "rgba(255,255,255,0.92)";
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "10px",
    fontSize: "13px",
    outline: "none",
    background: isLight ? "rgba(0,0,0,0.03)" : "oklch(0.18 0.06 165 / 0.70)",
    border: isLight
      ? "1px solid rgba(0,0,0,0.10)"
      : "1px solid oklch(0.50 0.15 160 / 0.30)",
    color: isLight ? "#0d1f1a" : "rgba(255,255,255,0.88)",
  };

  // ── Sub-views ────────────────────────────────────────────────────────────────
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
            color: "oklch(0.68 0.18 160)",
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
            color: isLight ? "#3a5a50" : "oklch(0.75 0.10 160)",
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
              background: isLight
                ? "rgba(0,0,0,0.03)"
                : "oklch(0.18 0.06 165 / 0.70)",
              border: isLight
                ? "1px solid rgba(0,0,0,0.06)"
                : "1px solid oklch(0.50 0.15 160 / 0.20)",
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
              background: isLight
                ? "rgba(0,0,0,0.03)"
                : "oklch(0.18 0.06 165 / 0.70)",
              border: isLight
                ? "1px solid rgba(0,0,0,0.06)"
                : "1px solid oklch(0.50 0.15 160 / 0.20)",
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
                    ? "oklch(0.68 0.18 160)"
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
            color: "oklch(0.68 0.18 160)",
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

        {/* QR Placeholder */}
        <div
          className="mx-auto mb-5 flex items-center justify-center rounded-2xl"
          style={{
            width: 140,
            height: 140,
            border: isLight
              ? "2px solid rgba(52,211,153,0.40)"
              : "2px solid oklch(0.60 0.18 160 / 0.45)",
            background: isLight
              ? "rgba(52,211,153,0.04)"
              : "oklch(0.18 0.06 165 / 0.60)",
            fontSize: "13px",
            color: isLight ? "oklch(0.62 0.14 160)" : "oklch(0.65 0.18 160)",
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
            background: isLight
              ? "rgba(0,0,0,0.03)"
              : "oklch(0.18 0.06 165 / 0.70)",
            border: isLight
              ? "1px solid rgba(0,0,0,0.08)"
              : "1px solid oklch(0.50 0.15 160 / 0.20)",
          }}
        >
          <span
            className="flex-1 truncate font-mono"
            style={{
              fontSize: "11px",
              color: isLight ? "#1a3a30" : "oklch(0.80 0.10 160)",
            }}
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
              color: "oklch(0.68 0.18 160)",
              background: isLight
                ? "rgba(52,211,153,0.08)"
                : "oklch(0.45 0.16 160 / 0.12)",
              border: isLight
                ? "1px solid rgba(52,211,153,0.28)"
                : "1px solid oklch(0.55 0.18 160 / 0.25)",
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
            color: "oklch(0.68 0.18 160)",
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
              placeholder="Enter address…"
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
                ? isLight
                  ? "rgba(52,211,153,0.14)"
                  : "oklch(0.45 0.16 160 / 0.25)"
                : isLight
                  ? "rgba(0,0,0,0.04)"
                  : "oklch(0.20 0.03 165 / 0.50)",
              color: canSend
                ? "oklch(0.65 0.18 160)"
                : isLight
                  ? "#aaa"
                  : "oklch(0.45 0.05 160)",
              border: canSend
                ? isLight
                  ? "1px solid rgba(52,211,153,0.40)"
                  : "1px solid oklch(0.55 0.18 160 / 0.40)"
                : isLight
                  ? "1px solid rgba(0,0,0,0.08)"
                  : "1px solid oklch(0.35 0.05 160 / 0.30)",
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
    // ── Main List View ─────────────────────────────────────────────────────────
    content = (
      <>
        {/* Total Balance */}
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
              color: isLight ? "#0d1f1a" : "rgba(255,255,255,0.96)",
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

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: isLight
              ? "rgba(0,0,0,0.06)"
              : "oklch(0.55 0.18 160 / 0.15)",
            marginBottom: 14,
          }}
        />

        {/* Asset list */}
        <div className="space-y-2.5" data-ocid="wallet.asset.list">
          {ASSETS.map((asset, i) => (
            <div key={asset.id} data-ocid={`wallet.asset.item.${i + 1}`}>
              <AssetRow
                asset={asset}
                isLight={isLight}
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

        {/* Sign Out */}
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
              color: isLight ? "#a0b8b0" : "oklch(0.50 0.06 160)",
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
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
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
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Wallet
              size={18}
              style={{
                color: isLight
                  ? "oklch(0.60 0.18 160)"
                  : "oklch(0.72 0.18 160)",
              }}
              strokeWidth={1.8}
            />
            <span
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: isLight ? "#0d1f1a" : "rgba(255,255,255,0.92)",
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
              background: isLight
                ? "rgba(0,0,0,0.05)"
                : "rgba(255,255,255,0.06)",
              color: isLight ? "#666" : "rgba(255,255,255,0.45)",
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
  isLight,
}: {
  open: boolean;
  onClose: () => void;
  onSignIn: () => void;
  isLoggingIn: boolean;
  isLight: boolean;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
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
          background: isLight ? "#ffffff" : "oklch(0.14 0.05 165 / 0.97)",
          border: isLight
            ? "1px solid rgba(52,211,153,0.20)"
            : "1px solid oklch(0.55 0.18 160 / 0.30)",
          boxShadow: isLight
            ? "0 20px 60px rgba(0,0,0,0.10)"
            : "0 20px 60px rgba(0,0,0,0.50), 0 0 40px oklch(0.65 0.18 160 / 0.08)",
        }}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full"
          style={{
            background: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.06)",
            color: isLight ? "#666" : "rgba(255,255,255,0.45)",
            border: "none",
            cursor: "pointer",
            position: "absolute",
          }}
        >
          <X size={14} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: isLight
                ? "rgba(52,211,153,0.10)"
                : "oklch(0.45 0.16 160 / 0.15)",
              border: isLight
                ? "1px solid rgba(52,211,153,0.25)"
                : "1px solid oklch(0.55 0.18 160 / 0.35)",
            }}
          >
            <ShieldCheck
              size={26}
              style={{ color: "oklch(0.70 0.18 160)" }}
              strokeWidth={1.5}
            />
          </div>
        </div>

        <h2
          className="text-center font-semibold mb-1"
          style={{
            fontSize: "17px",
            color: isLight ? "#0d1f1a" : "rgba(255,255,255,0.92)",
          }}
        >
          Sign in to Minty
        </h2>
        <p
          className="text-center mb-6"
          style={{
            fontSize: "13px",
            color: isLight ? "#6b8a80" : "oklch(0.62 0.08 160)",
            lineHeight: "1.5",
          }}
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
              ? isLight
                ? "rgba(52,211,153,0.08)"
                : "oklch(0.45 0.16 160 / 0.18)"
              : isLight
                ? "rgba(52,211,153,0.10)"
                : "oklch(0.45 0.16 160 / 0.22)",
            color: "oklch(0.68 0.18 160)",
            border: isLight
              ? "1px solid rgba(52,211,153,0.35)"
              : "1px solid oklch(0.55 0.18 160 / 0.45)",
            boxShadow: isLight
              ? "0 0 16px rgba(52,211,153,0.08)"
              : "0 0 20px oklch(0.65 0.18 160 / 0.10)",
            cursor: isLoggingIn ? "not-allowed" : "pointer",
            opacity: isLoggingIn ? 0.7 : 1,
          }}
        >
          <ShieldCheck size={16} strokeWidth={1.8} />
          {isLoggingIn
            ? "Opening Internet Identity…"
            : "Continue with Internet Identity"}
        </button>

        <p
          className="text-center mt-4"
          style={{
            fontSize: "12px",
            color: isLight ? "#a0b8b0" : "oklch(0.50 0.06 160)",
            lineHeight: "1.5",
          }}
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
  onUploadClick?: () => void;
}

export function TopBar({ onAdminClick, onUploadClick }: TopBarProps) {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { isConnected, walletAddress } = useWallet();
  const { theme, toggleTheme } = useTheme();
  const [signInOpen, setSignInOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);

  const isLight = theme === "light";
  const isSignedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const isAdmin =
    (ADMIN_WALLET_ADDRESS !== "" &&
      isConnected &&
      walletAddress === ADMIN_WALLET_ADDRESS) ||
    false;

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
          style={{
            marginRight: "14px",
            display: "flex",
            alignItems: "center",
            minHeight: "64px",
          }}
        >
          <img
            src={MINTY_LOGO}
            alt="Minty"
            className="minty-logo-brand"
            style={{ background: "transparent", imageRendering: "auto" }}
            draggable={false}
          />
        </div>

        <div className="flex items-center self-center gap-2">
          {/* Admin Manage button */}
          {isAdmin && onAdminClick && (
            <button
              type="button"
              onClick={onAdminClick}
              data-ocid="topbar.admin.button"
              aria-label="Manage Releases"
              title="Manage Releases"
              className="flex items-center gap-1.5 rounded-lg transition-all duration-150"
              style={{
                padding: "5px 10px",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "oklch(0.70 0.16 160)",
                background: "oklch(0.45 0.16 160 / 0.12)",
                border: "1px solid oklch(0.60 0.18 160 / 0.25)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "oklch(0.45 0.16 160 / 0.22)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "oklch(0.45 0.16 160 / 0.12)";
              }}
            >
              <Settings2 size={12} />
              Manage
            </button>
          )}

          {/* Upload button */}
          {isSignedIn && !isAdmin && onUploadClick && (
            <button
              type="button"
              onClick={onUploadClick}
              data-ocid="topbar.upload.button"
              aria-label="Submit a Release"
              title="Submit a Release"
              className="flex items-center gap-1.5 rounded-lg transition-all duration-150"
              style={{
                padding: "5px 10px",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "oklch(0.70 0.16 160)",
                background: "oklch(0.45 0.16 160 / 0.12)",
                border: "1px solid oklch(0.60 0.18 160 / 0.25)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "oklch(0.45 0.16 160 / 0.22)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "oklch(0.45 0.16 160 / 0.12)";
              }}
            >
              <Upload size={12} />
              Upload
            </button>
          )}

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            data-ocid="topbar.toggle"
            aria-label={
              isLight ? "Switch to dark mode" : "Switch to light mode"
            }
            className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-150"
            style={{
              color: isLight ? "#0a1f1a" : "oklch(0.55 0.008 160)",
              background: "transparent",
              border: isLight ? "1px solid #d4ede6" : "1px solid transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = isLight
                ? "oklch(0 0 0 / 0.05)"
                : "oklch(1 0 0 / 0.07)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
            }}
          >
            {isLight ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {/* Auth / Wallet button */}
          <button
            type="button"
            onClick={handleAuthButtonClick}
            data-ocid="auth.button"
            aria-label={isSignedIn ? "Open wallet" : "Sign in"}
            className="group flex items-center gap-2 rounded-xl font-medium text-sm transition-all duration-150 select-none"
            style={
              isLight
                ? {
                    backgroundColor: "#ffffff",
                    color: "oklch(0.55 0.18 160)",
                    paddingLeft: "10px",
                    paddingRight: "12px",
                    paddingTop: "7px",
                    paddingBottom: "7px",
                    border: "1px solid rgba(52,211,153,0.40)",
                    boxShadow: "0 2px 8px rgba(52,211,153,0.06)",
                  }
                : {
                    backgroundColor: "oklch(0.16 0.06 165)",
                    color: "oklch(0.72 0.18 160)",
                    paddingLeft: "10px",
                    paddingRight: "12px",
                    paddingTop: "7px",
                    paddingBottom: "7px",
                    border: "1px solid oklch(0.50 0.18 160 / 0.4)",
                    boxShadow: "0 0 14px oklch(0.65 0.18 160 / 0.12)",
                  }
            }
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              if (isLight) {
                el.style.borderColor = "rgba(52,211,153,0.65)";
                el.style.boxShadow = "0 0 14px rgba(52,211,153,0.14)";
              } else {
                el.style.backgroundColor = "oklch(0.20 0.08 165)";
                el.style.borderColor = "oklch(0.65 0.18 160 / 0.65)";
                el.style.boxShadow = "0 0 20px oklch(0.65 0.18 160 / 0.22)";
              }
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              if (isLight) {
                el.style.borderColor = "rgba(52,211,153,0.40)";
                el.style.boxShadow = "0 2px 8px rgba(52,211,153,0.06)";
              } else {
                el.style.backgroundColor = "oklch(0.16 0.06 165)";
                el.style.borderColor = "oklch(0.50 0.18 160 / 0.4)";
                el.style.boxShadow = "0 0 14px oklch(0.65 0.18 160 / 0.12)";
              }
            }}
          >
            {isSignedIn ? (
              <Wallet
                size={17}
                strokeWidth={1.6}
                style={{
                  color: isLight
                    ? "oklch(0.60 0.18 160)"
                    : "oklch(0.72 0.18 160)",
                }}
              />
            ) : (
              <ShieldCheck
                size={17}
                strokeWidth={1.6}
                style={{
                  color: isLight
                    ? "oklch(0.60 0.18 160)"
                    : "oklch(0.72 0.18 160)",
                }}
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
        isLight={isLight}
      />

      <WalletModal
        open={walletOpen}
        onClose={() => setWalletOpen(false)}
        onSignOut={clear}
        isLight={isLight}
      />
    </>
  );
}
