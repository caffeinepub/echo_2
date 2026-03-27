/**
 * Solana gradient mark — purple (#9945FF) → teal → green (#14F195).
 * Used only next to SOL-denominated numeric values.
 * Not used for navigation or decorative icons.
 */
export function SolSymbol({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 16"
      fill="none"
      aria-hidden="true"
      className={className}
      style={{
        display: "inline-block",
        verticalAlign: "-0.1em",
        width: "0.75em",
        height: "0.75em",
        flexShrink: 0,
      }}
    >
      <defs>
        {/* Vertical gradient: purple top → green bottom */}
        <linearGradient id="sol-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9945FF" />
          <stop offset="50%" stopColor="#43B4CA" />
          <stop offset="100%" stopColor="#14F195" />
        </linearGradient>
      </defs>
      {/* top bar */}
      <path
        d="M2.5 0.5H15.5C15.9 0.5 16.1 0.7 15.9 1L14.5 3C14.3 3.3 13.8 3.5 13.4 3.5H0.5C0.1 3.5 -0.1 3.3 0.1 3L1.5 1C1.7 0.7 2.1 0.5 2.5 0.5Z"
        fill="url(#sol-grad)"
      />
      {/* middle bar */}
      <path
        d="M0.5 6.25H13.5C13.9 6.25 14.3 6.45 14.5 6.75L15.9 8.75C16.1 9.05 15.9 9.25 15.5 9.25H2.5C2.1 9.25 1.7 9.05 1.5 8.75L0.1 6.75C-0.1 6.45 0.1 6.25 0.5 6.25Z"
        fill="url(#sol-grad)"
      />
      {/* bottom bar */}
      <path
        d="M2.5 12H15.5C15.9 12 16.1 12.2 15.9 12.5L14.5 14.5C14.3 14.8 13.9 15 13.5 15H0.5C0.1 15 -0.1 14.8 0.1 14.5L1.5 12.5C1.7 12.2 2.1 12 2.5 12Z"
        fill="url(#sol-grad)"
      />
    </svg>
  );
}
