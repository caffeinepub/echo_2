/**
 * EchoSolIcon — official Solana stacked-bar symbol, inline SVG.
 * Vibrant purple → teal gradient matching official Solana branding.
 * Optimized for dark backgrounds, crisp at small sizes.
 *
 * Props:
 *   size      — height in px (default 14); width scales with aspect ratio
 *   large     — if true, height is 16px (for stat cards)
 *   animated  — slow glow-pulse keyframe animation (default false)
 *   className — additional CSS classes
 */
export function EchoSolIcon({
  size,
  large = false,
  animated = false,
  className = "",
}: {
  size?: number;
  large?: boolean;
  animated?: boolean;
  className?: string;
}) {
  const height = size ?? (large ? 16 : 14);
  // viewBox is 20x16; preserve aspect ratio
  const width = Math.round((height * 20) / 16);

  return (
    <>
      {animated && (
        <style>{`
          @keyframes echo-sol-pulse {
            0%, 100% { filter: drop-shadow(0 0 2px rgba(20,241,149,0.2)) drop-shadow(0 0 4px rgba(153,69,255,0.18)) brightness(1); }
            50%       { filter: drop-shadow(0 0 4px rgba(20,241,149,0.38)) drop-shadow(0 0 6px rgba(153,69,255,0.30)) brightness(1.06); }
          }
          .echo-sol-animated { animation: echo-sol-pulse 5s ease-in-out infinite; }
        `}</style>
      )}
      <svg
        viewBox="0 0 20 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        width={width}
        height={height}
        className={
          animated
            ? `echo-sol-animated${className ? ` ${className}` : ""}`
            : className || undefined
        }
        style={{
          display: "inline-block",
          flexShrink: 0,
          verticalAlign: "middle",
          marginRight: 6,
          filter: animated
            ? undefined
            : "drop-shadow(0 0 2px rgba(20,241,149,0.25)) drop-shadow(0 0 3px rgba(153,69,255,0.20))",
        }}
      >
        <defs>
          {/* Official Solana gradient: deep purple left → bright teal right */}
          <linearGradient id="sol-grad-top" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9945FF" />
            <stop offset="100%" stopColor="#14F195" />
          </linearGradient>
          <linearGradient id="sol-grad-mid" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9945FF" />
            <stop offset="100%" stopColor="#14F195" />
          </linearGradient>
          <linearGradient id="sol-grad-bot" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9945FF" />
            <stop offset="100%" stopColor="#14F195" />
          </linearGradient>
        </defs>
        {/* Top bar */}
        <path
          d="M2 0.5 L14.5 0.5 L18 3.5 L5.5 3.5 Z"
          fill="url(#sol-grad-top)"
        />
        {/* Middle bar */}
        <path
          d="M1 6.5 L13.5 6.5 L17 9.5 L4.5 9.5 Z"
          fill="url(#sol-grad-mid)"
        />
        {/* Bottom bar */}
        <path
          d="M2 12.5 L14.5 12.5 L18 15.5 L5.5 15.5 Z"
          fill="url(#sol-grad-bot)"
        />
      </svg>
    </>
  );
}
