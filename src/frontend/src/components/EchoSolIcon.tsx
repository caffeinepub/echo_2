/**
 * EchoSolIcon — custom Echo Solana symbol
 * 3 staggered glowing bars with per-bar tonal emphasis:
 *   top bar: cyan, middle bar: violet, bottom bar: purple-magenta
 * Crisp glass-strip look, readable at 14px–48px.
 *
 * Props:
 *   size      — width/height in px (default 16)
 *   animated  — slow glow-pulse keyframe animation (default false)
 *   className — additional Tailwind / CSS classes
 */
export function EchoSolIcon({
  size = 16,
  animated = false,
  className = "",
}: {
  size?: number;
  animated?: boolean;
  className?: string;
}) {
  return (
    <>
      {animated && (
        <style>{`
          @keyframes echo-sol-glow {
            0%, 100% { filter: brightness(1) opacity(0.95); }
            50%       { filter: brightness(1.3) opacity(1); }
          }
        `}</style>
      )}
      <img
        src="/assets/generated/echo-sol-icon-refined-transparent.dim_128x128.png"
        alt="SOL"
        aria-hidden="true"
        width={size}
        height={size}
        className={className}
        style={{
          display: "inline-block",
          verticalAlign: "-0.1em",
          objectFit: "contain",
          flexShrink: 0,
          imageRendering: "auto",
          animation: animated
            ? "echo-sol-glow 3s ease-in-out infinite"
            : undefined,
        }}
      />
    </>
  );
}
