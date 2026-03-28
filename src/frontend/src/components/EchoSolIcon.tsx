/**
 * EchoSolIcon — Official Solana mark (three stacked parallelogram bars).
 * Uses the exact official path geometry with the canonical purple → teal gradient.
 * Optimized for dark backgrounds, crisp at 14–16px.
 *
 * Props:
 *   size      — height in px (default 14)
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
  // Official Solana mark viewBox is 397.7 x 311.7; aspect ratio ≈ 1.277
  const width = Math.round(height * 1.277);

  return (
    <>
      {animated && (
        <style>{`
          @keyframes echo-sol-pulse {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.82; }
          }
          .echo-sol-animated { animation: echo-sol-pulse 5s ease-in-out infinite; }
        `}</style>
      )}
      <svg
        viewBox="0 0 397.7 311.7"
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
        }}
      >
        <defs>
          <linearGradient
            id="sol-official-grad-top"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#9945FF" />
            <stop offset="100%" stopColor="#14F195" />
          </linearGradient>
          <linearGradient
            id="sol-official-grad-mid"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#9945FF" />
            <stop offset="100%" stopColor="#14F195" />
          </linearGradient>
          <linearGradient
            id="sol-official-grad-bot"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#9945FF" />
            <stop offset="100%" stopColor="#14F195" />
          </linearGradient>
        </defs>
        {/* Top bar */}
        <path
          d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z"
          fill="url(#sol-official-grad-top)"
        />
        {/* Middle bar */}
        <path
          d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z"
          fill="url(#sol-official-grad-mid)"
        />
        {/* Bottom bar */}
        <path
          d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"
          fill="url(#sol-official-grad-bot)"
        />
      </svg>
    </>
  );
}
