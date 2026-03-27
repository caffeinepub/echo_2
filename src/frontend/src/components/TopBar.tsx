import { useWallet } from "../hooks/useWallet";

const ECHO_LOGO_DARK =
  "/assets/uploads/echo_primary_logo_transparent-019d2c1a-ab89-7669-bf3e-9906cbb6a311-1.png";

// Official Phantom ghost logomark (simplified SVG path)
function PhantomLogo({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Phantom"
      style={{ flexShrink: 0 }}
    >
      <rect width="128" height="128" rx="28" fill="#AB9FF2" />
      <path
        d="M110.584 64.993c0 25.514-20.682 46.196-46.196 46.196-9.894 0-19.087-3.107-26.64-8.402-3.17-2.245-3.97-6.613-1.748-9.803l1.523-2.154a6.858 6.858 0 0 1 9.532-1.58 33.17 33.17 0 0 0 17.333 4.87c18.384 0 33.29-14.906 33.29-33.29 0-18.384-14.906-33.29-33.29-33.29A33.29 33.29 0 0 0 31.1 60.833v16.042c0 2.558-2.073 4.631-4.631 4.631-2.558 0-4.631-2.073-4.631-4.631V60.833C21.838 39.24 39.796 21.28 61.39 21.28c21.594 0 39.552 17.958 39.552 39.552v4.161h9.642v-.001Z"
        fill="white"
      />
      <ellipse cx="52.5" cy="67" rx="7" ry="8.5" fill="#AB9FF2" />
      <ellipse cx="75.5" cy="67" rx="7" ry="8.5" fill="#AB9FF2" />
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
          backgroundColor: isConnected ? "#1a1a2e" : "#1a1a2e",
          border: "1px solid rgba(171, 159, 242, 0.25)",
          paddingLeft: "12px",
          paddingRight: "14px",
          paddingTop: "7px",
          paddingBottom: "7px",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "#22213a";
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            "rgba(171, 159, 242, 0.45)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "#1a1a2e";
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            "rgba(171, 159, 242, 0.25)";
        }}
        onMouseDown={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "#161527";
        }}
        onMouseUp={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "#22213a";
        }}
      >
        <PhantomLogo size={18} />
        <span className="leading-none">
          {isConnected && walletAddress
            ? `Phantom \u2022 ${truncateAddress(walletAddress)}`
            : "Connect Phantom"}
        </span>
      </button>
    </header>
  );
}
