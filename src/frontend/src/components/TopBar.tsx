import { Moon, Settings2, Sun, Upload } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { ADMIN_WALLET_ADDRESS } from "../config/admin";
import { useWallet } from "../hooks/useWallet";

const MINTY_LOGO = "/assets/generated/minty-logo-transparent.dim_600x200.png";

// Mint teal glow — subtle, premium, cursive-logo-friendly
const NEON_STYLES = `
@keyframes echo-neon-breathe {
  0%   { filter: brightness(1.0)  drop-shadow(0 0 2px rgba(52,211,153,0.60)) drop-shadow(0 0 8px rgba(52,211,153,0.25)) drop-shadow(0 0 18px rgba(52,211,153,0.12)); }
  50%  { filter: brightness(1.05) drop-shadow(0 0 3px rgba(52,211,153,0.75)) drop-shadow(0 0 12px rgba(52,211,153,0.35)) drop-shadow(0 0 24px rgba(52,211,153,0.18)); }
  100% { filter: brightness(1.0)  drop-shadow(0 0 2px rgba(52,211,153,0.60)) drop-shadow(0 0 8px rgba(52,211,153,0.25)) drop-shadow(0 0 18px rgba(52,211,153,0.12)); }
}

.echo-logo-neon {
  filter: drop-shadow(0 0 2px rgba(52,211,153,0.55)) drop-shadow(0 0 8px rgba(52,211,153,0.22)) drop-shadow(0 0 16px rgba(52,211,153,0.12));
  animation: echo-neon-breathe 4s ease-in-out infinite;
  will-change: filter;
}
`;

let styleInjected = false;
function injectNeonStyles() {
  if (styleInjected) return;
  const el = document.createElement("style");
  el.textContent = NEON_STYLES;
  document.head.appendChild(el);
  styleInjected = true;
}

// Phantom ghost logo
function PhantomLogo({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
      role="img"
      aria-label="Phantom"
    >
      <rect width="40" height="40" rx="10" fill="#AB9FF2" />
      <path
        d="M20 7C13.373 7 8 12.373 8 19v9.5c0 .828.672 1.5 1.5 1.5.398 0 .76-.155 1.03-.408L12.5 27.5l2 2 2-2 2 2 2-2 2 2 2-2 1.97 1.592c.27.253.632.408 1.03.408.828 0 1.5-.672 1.5-1.5V19c0-6.627-5.373-12-12-12z"
        fill="white"
      />
      <circle cx="16" cy="19" r="2" fill="#AB9FF2" />
      <circle cx="24" cy="19" r="2" fill="#AB9FF2" />
    </svg>
  );
}

function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 3)}...${address.slice(-3)}`;
}

function OwnershipLine({ count }: { count: number }) {
  const label =
    count === 0
      ? "Connected"
      : count === 1
        ? "1 album owned"
        : `${count} albums owned`;
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 400,
        lineHeight: "1.2",
        opacity: 0.65,
        letterSpacing: "0.02em",
      }}
    >
      {label}
    </span>
  );
}

interface TopBarProps {
  onAdminClick?: () => void;
  onUploadClick?: () => void;
}

export function TopBar({ onAdminClick, onUploadClick }: TopBarProps) {
  const { isConnected, walletAddress, ownedAlbumIds, connect, disconnect } =
    useWallet();
  const { theme, toggleTheme } = useTheme();

  injectNeonStyles();

  const isLight = theme === "light";

  // Only show admin button if wallet is connected and matches the configured admin address
  const isAdmin =
    ADMIN_WALLET_ADDRESS !== "" &&
    isConnected &&
    walletAddress === ADMIN_WALLET_ADDRESS;

  return (
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
      <div className="relative flex items-center" style={{ paddingTop: "6px" }}>
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
          }}
          draggable={false}
        />
      </div>

      <div className="flex items-center self-center gap-2">
        {/* Admin Manage button — only visible to admin wallet */}
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

        {/* Upload button — only visible to non-admin connected wallets */}
        {isConnected && !isAdmin && onUploadClick && (
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
          aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
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

        {/* Phantom wallet button */}
        <button
          type="button"
          onClick={isConnected ? disconnect : connect}
          data-ocid="wallet.button"
          className="group flex items-center gap-2 rounded-xl font-medium text-sm transition-all duration-150 select-none"
          style={{
            backgroundColor: "oklch(0.16 0.06 165)",
            color: "white",
            paddingLeft: "10px",
            paddingRight: "12px",
            paddingTop: "7px",
            paddingBottom: "7px",
            border: "1px solid oklch(0.50 0.18 160 / 0.4)",
            boxShadow: "0 0 14px oklch(0.65 0.18 160 / 0.12)",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.backgroundColor = "oklch(0.20 0.08 165)";
            el.style.borderColor = "oklch(0.65 0.18 160 / 0.65)";
            el.style.boxShadow = "0 0 20px oklch(0.65 0.18 160 / 0.22)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.backgroundColor = "oklch(0.16 0.06 165)";
            el.style.borderColor = "oklch(0.50 0.18 160 / 0.4)";
            el.style.boxShadow = "0 0 14px oklch(0.65 0.18 160 / 0.12)";
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "oklch(0.12 0.04 165)";
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "oklch(0.20 0.08 165)";
          }}
        >
          <PhantomLogo size={18} />
          {isConnected && walletAddress ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "1px",
              }}
            >
              <span
                style={{ fontSize: "12px", fontWeight: 500, lineHeight: "1.2" }}
              >
                Phantom &bull; {truncateAddress(walletAddress)}
              </span>
              <OwnershipLine count={ownedAlbumIds.length} />
            </div>
          ) : (
            <span className="leading-none text-[13px]">Connect Phantom</span>
          )}
        </button>
      </div>
    </header>
  );
}
