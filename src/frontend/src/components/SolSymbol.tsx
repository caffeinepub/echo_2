/**
 * SolSymbol — thin wrapper around EchoSolIcon for backward compatibility.
 * All existing usages of <SolSymbol className="w-3.5 h-3.5" /> continue to work.
 * The className is forwarded; Tailwind width/height classes still apply.
 */
import { EchoSolIcon } from "./EchoSolIcon";

export function SolSymbol({
  className,
  size,
  animated,
}: {
  className?: string;
  size?: number;
  animated?: boolean;
}) {
  // If no explicit size is given, resolve a sensible default from common
  // Tailwind class names used in the codebase (w-3 → 12, w-3.5 → 14).
  let resolvedSize = size;
  if (!resolvedSize) {
    if (className?.includes("w-3.5")) resolvedSize = 14;
    else if (className?.includes("w-3")) resolvedSize = 12;
    else resolvedSize = 14;
  }

  // Strip size-related Tailwind classes so they don't fight the explicit width/height.
  const passClass = className
    ? className
        .replace(/\bw-[\d.]+\b/g, "")
        .replace(/\bh-[\d.]+\b/g, "")
        .trim()
    : "";

  return (
    <EchoSolIcon
      size={resolvedSize}
      animated={animated}
      className={passClass}
    />
  );
}
