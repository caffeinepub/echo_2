import { useWallet } from "../hooks/useWallet";

const ECHO_LOGO_DARK =
  "/assets/uploads/echo_primary_logo_transparent-019d2c1a-ab89-7669-bf3e-9906cbb6a311-1.png";

// Phantom ghost logo - official ghost shape
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

export function TopBar() {
  const { isConnected, walletAddress, connect, disconnect } = useWallet();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 bg-background/80 backdrop-blur-xl border-b border-border">
      {/* Hidden SVG grain filter */}
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        style={{ position: "absolute" }}
      >
        <defs>
          <filter id="echoGrainHeader">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              type="saturate"
              values="0"
              in="noise"
              result="grayNoise"
            />
            <feBlend
              in="SourceGraphic"
              in2="grayNoise"
              mode="overlay"
              result="blend"
            />
            <feComposite in="blend" in2="SourceGraphic" operator="in" />
          </filter>
        </defs>
      </svg>

      {/* Logo */}
      <div className="relative flex items-center">
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#F5F1E8",
            filter: "blur(18px)",
            opacity: 0.06,
            borderRadius: "9999px",
            transform: "scale(1.7)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        <img
          src={ECHO_LOGO_DARK}
          alt="ECHO"
          className="relative select-none object-contain"
          style={{
            height: "clamp(26px, 4vw, 34px)",
            width: "auto",
            zIndex: 1,
            filter:
              "url(#echoGrainHeader) sepia(0.12) brightness(1.02) contrast(0.97)",
          }}
          draggable={false}
        />
      </div>

      {/* Phantom wallet button */}
      <button
        type="button"
        onClick={isConnected ? disconnect : connect}
        data-ocid="wallet.button"
        className="group flex items-center gap-2.5 rounded-xl text-white font-medium text-sm transition-all duration-150 select-none"
        style={{
          backgroundColor: "#7C3AED",
          paddingLeft: "12px",
          paddingRight: "14px",
          paddingTop: "7px",
          paddingBottom: "7px",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "#6D28D9";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "#7C3AED";
        }}
        onMouseDown={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "#5B21B6";
        }}
        onMouseUp={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "#6D28D9";
        }}
      >
        <PhantomLogo size={20} />
        <span className="leading-none">
          {isConnected && walletAddress
            ? `Phantom \u2022 ${truncateAddress(walletAddress)}`
            : "Connect Phantom"}
        </span>
      </button>
    </header>
  );
}
