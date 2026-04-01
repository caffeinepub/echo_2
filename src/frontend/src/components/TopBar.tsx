import {
  Moon,
  Settings2,
  ShieldCheck,
  Sun,
  Upload,
  UserCircle2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "../ThemeContext";
import { ADMIN_WALLET_ADDRESS } from "../config/admin";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useWallet } from "../hooks/useWallet";

const MINTY_LOGO =
  "/assets/uploads/da0a37bf-f0f7-4b3e-8435-d339d757ced0-019d3c90-0de4-771f-8b28-c86522af61d6-1.png";

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

// Sign In modal component
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

        {/* Heading */}
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

        {/* Internet Identity button */}
        <button
          type="button"
          onClick={onSignIn}
          disabled={isLoggingIn}
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

        {/* Google hint */}
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

interface TopBarProps {
  onAdminClick?: () => void;
  onUploadClick?: () => void;
}

export function TopBar({ onAdminClick, onUploadClick }: TopBarProps) {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  // Keep wallet context for admin check until full migration
  const { isConnected, walletAddress } = useWallet();
  const { theme, toggleTheme } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);

  injectNeonStyles();

  const isLight = theme === "light";
  const isSignedIn = !!identity && !identity.getPrincipal().isAnonymous();

  // Admin check: wallet-based (legacy) OR signed in via II for admin principal
  const isAdmin =
    (ADMIN_WALLET_ADDRESS !== "" &&
      isConnected &&
      walletAddress === ADMIN_WALLET_ADDRESS) ||
    // II-based admin: any signed-in user can access admin for now
    // (replace with principal check when II admin principal is configured)
    false;

  function handleSignInClick() {
    if (isSignedIn) {
      clear();
    } else {
      setModalOpen(true);
    }
  }

  function handleModalSignIn() {
    login();
    setModalOpen(false);
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
            }}
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

          {/* Sign In / Signed In button */}
          <button
            type="button"
            onClick={handleSignInClick}
            data-ocid="auth.button"
            aria-label={isSignedIn ? "Sign out" : "Sign in"}
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
            <UserCircle2
              size={17}
              strokeWidth={1.6}
              style={{
                color: isLight
                  ? "oklch(0.60 0.18 160)"
                  : "oklch(0.72 0.18 160)",
              }}
            />
            <span className="leading-none text-[13px]">
              {isSignedIn ? "Signed In" : "Sign In"}
            </span>
          </button>
        </div>
      </header>

      <SignInModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSignIn={handleModalSignIn}
        isLoggingIn={isLoggingIn}
        isLight={isLight}
      />
    </>
  );
}
