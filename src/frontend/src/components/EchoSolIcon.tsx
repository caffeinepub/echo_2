/**
 * EchoSolIcon — custom Echo Solana neon symbol
 * PNG asset: wide horizontal 3-bar neon mark, 96×32 (3:1 ratio).
 * Matches Echo logo neon aesthetic.
 *
 * Props:
 *   size      — height in px (default 16); width is always auto to preserve aspect ratio
 *   large     — if true, height is 18px (for use in stat cards)
 *   animated  — slow glow-pulse keyframe animation (default false)
 *   className — additional CSS classes
 */
import { useState } from "react";

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
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  const height = size ?? (large ? 18 : 16);

  return (
    <>
      <style>{`
        @keyframes echo-sol-neon-pulse {
          0%, 100% { filter: drop-shadow(0 0 3px rgba(139,92,246,0.7)) drop-shadow(0 0 5px rgba(34,211,238,0.4)) brightness(1); }
          50%       { filter: drop-shadow(0 0 4px rgba(139,92,246,0.9)) drop-shadow(0 0 7px rgba(34,211,238,0.6)) brightness(1.06); }
        }
        .echo-sol-animated {
          animation: echo-sol-neon-pulse 5s ease-in-out infinite;
        }
      `}</style>
      <img
        src="/assets/generated/sol-icon-echo.dim_96x32.png"
        alt="SOL"
        aria-hidden="true"
        onError={() => setFailed(true)}
        className={
          animated
            ? `echo-sol-animated${className ? ` ${className}` : ""}`
            : className || undefined
        }
        style={{
          height: `${height}px`,
          width: "auto",
          objectFit: "contain",
          display: "inline-block",
          flexShrink: 0,
          verticalAlign: "middle",
          marginRight: 6,
          filter: animated
            ? undefined
            : "drop-shadow(0 0 3px rgba(139,92,246,0.7)) drop-shadow(0 0 5px rgba(34,211,238,0.4))",
        }}
      />
    </>
  );
}
