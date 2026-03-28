/**
 * SolUsdValue — renders a SOL amount with its USD equivalent.
 *
 * variant="stacked"  — SOL on one line (with icon), USD on the line below
 * variant="inline"   — SOL • USD on the same line, USD is smaller/softer
 */
import { useSolPriceContext } from "../contexts/SolPriceContext";
import { formatUSD } from "../utils/formatUSD";
import { SolSymbol } from "./SolSymbol";

interface SolUsdValueProps {
  sol: number;
  variant?: "stacked" | "inline";
  solClassName?: string;
  usdClassName?: string;
  showIcon?: boolean;
  iconLarge?: boolean;
  animated?: boolean;
}

export function SolUsdValue({
  sol,
  variant = "stacked",
  solClassName = "",
  usdClassName = "",
  showIcon = true,
  iconLarge = false,
  animated = false,
}: SolUsdValueProps) {
  const { solPrice } = useSolPriceContext();
  const usdValue = sol * solPrice;
  const usdStr = formatUSD(usdValue);

  if (variant === "inline") {
    return (
      <span className="inline-flex items-center gap-1 flex-wrap">
        <span className={`inline-flex items-center gap-1.5 ${solClassName}`}>
          {showIcon && <SolSymbol large={iconLarge} animated={animated} />}
          {sol.toFixed(1)}
        </span>
        <span
          className={usdClassName}
          style={{ fontSize: "0.85em", opacity: 0.55 }}
        >
          • {usdStr}
        </span>
      </span>
    );
  }

  // stacked
  return (
    <span className="flex flex-col gap-0.5">
      <span className={`inline-flex items-center gap-1.5 ${solClassName}`}>
        {showIcon && <SolSymbol large={iconLarge} animated={animated} />}
        {sol.toFixed(1)}
      </span>
      <span
        className={usdClassName}
        style={{ fontSize: "0.82em", opacity: 0.55 }}
      >
        {usdStr}
      </span>
    </span>
  );
}
