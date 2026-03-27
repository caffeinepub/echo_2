import { Wallet } from "lucide-react";
import { useWallet } from "../hooks/useWallet";

const ECHO_LOGO_DARK =
  "/assets/uploads/echo_primary_logo_transparent-019d2c1a-ab89-7669-bf3e-9906cbb6a311-1.png";

export function TopBar() {
  const { isConnected, connect, disconnect } = useWallet();

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

      {/* Logo — warm off-white with subtle glow + grain */}
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

      <button
        type="button"
        onClick={isConnected ? disconnect : connect}
        data-ocid="wallet.button"
        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border-0 transition-all text-white hover:bg-[#6D28D9] active:bg-[#5B21B6]"
        style={{ backgroundColor: isConnected ? "#5B21B6" : "#7C3AED" }}
      >
        <Wallet size={14} />
        {isConnected ? "Connected" : "Connect Wallet"}
      </button>
    </header>
  );
}
