/**
 * BtcLogo — small inline Bitcoin "₿" SVG icon, Bitcoin orange (#F7931A).
 * Rendered as an inline-flex element so it sits naturally beside price text.
 */

interface BtcLogoProps {
  size?: number;
  style?: React.CSSProperties;
}

export function BtcLogo({ size = 14, style }: BtcLogoProps) {
  return (
    <span
      aria-label="BTC"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        lineHeight: 1,
        ...style,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        {/* Bitcoin "B" with two vertical serifs */}
        <text
          x="1"
          y="12"
          fontFamily="Arial, sans-serif"
          fontSize="13"
          fontWeight="700"
          fill="#F7931A"
        >
          ₿
        </text>
      </svg>
    </span>
  );
}
