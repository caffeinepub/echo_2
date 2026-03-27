const ECHO_LOGO =
  "/assets/uploads/echo_primary_logo_transparent-019d2c1a-ab89-7669-bf3e-9906cbb6a311-1.png";

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      {/* Hidden SVG grain filter definition */}
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        style={{ position: "absolute" }}
      >
        <defs>
          <filter id="echoGrainSplash">
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

      {/* Logo with glow + grain + warm tint */}
      <div className="relative flex items-center justify-center">
        {/* Soft diffused glow behind logo */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#F5F1E8",
            filter: "blur(32px)",
            opacity: 0.07,
            borderRadius: "9999px",
            transform: "scale(2)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        <img
          src={ECHO_LOGO}
          alt="ECHO"
          className="relative select-none"
          style={{
            width: "clamp(160px, 30vw, 192px)",
            zIndex: 1,
            filter:
              "url(#echoGrainSplash) sepia(0.12) brightness(1.02) contrast(0.97)",
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}
