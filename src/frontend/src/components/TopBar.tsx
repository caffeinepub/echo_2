import { Moon, Sun } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useWallet } from "../hooks/useWallet";

const ECHO_NEON_LOGO =
  "/assets/uploads/c81a43c7-e2ef-4dd2-a448-b114380c0703-019d30f2-572d-719b-99c5-08653714f110-1.png";

// Crisp neon feel: tighter glow radii, sharper tube edges, controlled purple aura
const NEON_STYLES = `
@keyframes echo-neon-flicker {
  0%   { opacity: 1;    filter: brightness(1.0) drop-shadow(0 0 1.5px rgba(255,240,210,0.90)) drop-shadow(0 0 4.5px rgba(170,120,255,0.42)) drop-shadow(0 0 13px rgba(130,60,255,0.22)); }
  5%   { opacity: 0.88; filter: brightness(0.92); }
  9%   { opacity: 1;    filter: brightness(1.03) drop-shadow(0 0 2px rgba(255,240,210,0.95)) drop-shadow(0 0 5px rgba(170,120,255,0.46)); }
  12%  { opacity: 0.84; filter: brightness(0.90); }
  15%  { opacity: 1;    filter: brightness(1.0)  drop-shadow(0 0 1.5px rgba(255,240,210,0.90)) drop-shadow(0 0 4.5px rgba(170,120,255,0.42)); }
  18%  { opacity: 0.93; filter: brightness(0.96); }
  22%  { opacity: 1;    filter: brightness(1.01) drop-shadow(0 0 1.5px rgba(255,240,210,0.90)) drop-shadow(0 0 4.5px rgba(170,120,255,0.42)) drop-shadow(0 0 13px rgba(130,60,255,0.22)); }
  100% { opacity: 1;    filter: brightness(1.01) drop-shadow(0 0 1.5px rgba(255,240,210,0.90)) drop-shadow(0 0 4.5px rgba(170,120,255,0.42)) drop-shadow(0 0 13px rgba(130,60,255,0.22)); }
}

@keyframes echo-neon-breathe {
  0%   { filter: brightness(1.0)  drop-shadow(0 0 1.5px rgba(255,240,210,0.88)) drop-shadow(0 0 4px rgba(160,100,255,0.34)) drop-shadow(0 0 13px rgba(130,60,255,0.18)); }
  50%  { filter: brightness(1.04) drop-shadow(0 0 2px rgba(255,240,210,0.95)) drop-shadow(0 0 6.5px rgba(170,110,255,0.46)) drop-shadow(0 0 17px rgba(140,70,255,0.25)); }
  100% { filter: brightness(1.0)  drop-shadow(0 0 1.5px rgba(255,240,210,0.88)) drop-shadow(0 0 4px rgba(160,100,255,0.34)) drop-shadow(0 0 13px rgba(130,60,255,0.18)); }
}

.echo-logo-neon {
  animation:
    echo-neon-flicker 0.75s ease-out forwards,
    echo-neon-breathe 3.8s ease-in-out 0.75s infinite;
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

export function TopBar() {
  const { isConnected, walletAddress, ownedAlbumIds, connect, disconnect } =
    useWallet();
  const { theme, toggleTheme } = useTheme();

  injectNeonStyles();

  const isLight = theme === "light";

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
      {/* Neon Logo */}
      <div className="relative flex items-center" style={{ paddingTop: "6px" }}>
        <img
          src={ECHO_NEON_LOGO}
          alt="ECHO"
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
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          data-ocid="topbar.toggle"
          aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
          className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-150"
          style={{
            color: isLight ? "#0F172A" : "oklch(0.55 0.008 240)",
            background: "transparent",
            border: isLight ? "1px solid #E6EAF2" : "1px solid transparent",
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
            backgroundColor: "oklch(0.22 0.12 290)",
            color: "white",
            paddingLeft: "10px",
            paddingRight: "12px",
            paddingTop: "7px",
            paddingBottom: "7px",
            border: "1px solid oklch(0.55 0.25 290 / 0.4)",
            boxShadow: "0 0 14px oklch(0.55 0.25 290 / 0.12)",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.backgroundColor = "oklch(0.27 0.15 290)";
            el.style.borderColor = "oklch(0.55 0.25 290 / 0.65)";
            el.style.boxShadow = "0 0 20px oklch(0.55 0.25 290 / 0.22)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.backgroundColor = "oklch(0.22 0.12 290)";
            el.style.borderColor = "oklch(0.55 0.25 290 / 0.4)";
            el.style.boxShadow = "0 0 14px oklch(0.55 0.25 290 / 0.12)";
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "oklch(0.18 0.10 290)";
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "oklch(0.27 0.15 290)";
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
