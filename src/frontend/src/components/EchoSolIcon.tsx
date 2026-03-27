/**
 * EchoSolIcon — custom Echo Solana neon symbol
 * PNG asset: 3 staggered neon bars, purple-to-cyan gradient glow.
 * Matches Echo logo neon aesthetic.
 *
 * Props:
 *   size      — width/height in px (default 16)
 *   animated  — slow glow-pulse keyframe animation (default false)
 *   className — additional Tailwind / CSS classes
 */
import { useState } from "react";

export function EchoSolIcon({
  size = 16,
  animated = false,
  className = "",
}: {
  size?: number;
  animated?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <>
      <style>{`
        @keyframes echo-sol-neon-pulse {
          0%, 100% { filter: brightness(1) saturate(1); }
          50%       { filter: brightness(1.05) saturate(1.1); }
        }
        .echo-sol-static {
          display: inline-block;
          vertical-align: -0.1em;
          object-fit: contain;
          flex-shrink: 0;
          image-rendering: auto;
          margin-right: 6px;
        }
        .echo-sol-animated {
          animation: echo-sol-neon-pulse 5s ease-in-out infinite;
        }
      `}</style>
      <img
        src="/assets/generated/sol-icon-transparent.dim_128x128.png"
        alt="SOL"
        aria-hidden="true"
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className={`echo-sol-static${animated ? " echo-sol-animated" : ""}${className ? ` ${className}` : ""}`}
      />
    </>
  );
}
