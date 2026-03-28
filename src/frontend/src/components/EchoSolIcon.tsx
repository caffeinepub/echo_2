/**
 * EchoSolIcon — official Solana stacked-bar symbol, inline SVG.
 * Flat vector, no background, no badge container.
 * Colors: top bar cyan, middle bar purple, bottom bar magenta.
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
            0%, 100% { filter: drop-shadow(0 0 2px rgba(26,235,212,0.15)) drop-shadow(0 0 3px rgba(143,82,232,0.12)) brightness(1); }
            50%       { filter: drop-shadow(0 0 3px rgba(26,235,212,0.28)) drop-shadow(0 0 4px rgba(143,82,232,0.22)) brightness(1.05); }
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
            : "drop-shadow(0 0 2px rgba(26,235,212,0.15)) drop-shadow(0 0 3px rgba(143,82,232,0.12))",
        }}
      >
        {/* Top bar — cyan (slightly desaturated) */}
        <path d="M2 0.5 L14.5 0.5 L18 3.5 L5.5 3.5 Z" fill="#1AEBD4" />
        {/* Middle bar — purple (slightly desaturated) */}
        <path d="M1 6.5 L13.5 6.5 L17 9.5 L4.5 9.5 Z" fill="#8F52E8" />
        {/* Bottom bar — magenta (slightly desaturated) */}
        <path d="M2 12.5 L14.5 12.5 L18 15.5 L5.5 15.5 Z" fill="#E83D78" />
      </svg>
    </>
  );
}
