export function SolSymbol({
  color = "#C8C4BC",
  className,
}: { color?: string; className?: string }) {
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
      }}
    >
      {/* top bar - left-slash notch */}
      <path d="M3.5 0H17.5L16.5 3H2.5L3.5 0Z" fill={color} />
      {/* middle bar - right-slash notch */}
      <path d="M2.5 6.5H16.5L17.5 9.5H3.5L2.5 6.5Z" fill={color} />
      {/* bottom bar - left-slash notch */}
      <path d="M3.5 13H17.5L16.5 16H2.5L3.5 13Z" fill={color} />
    </svg>
  );
}
