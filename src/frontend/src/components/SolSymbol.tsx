/**
 * SolSymbol — thin wrapper around EchoSolIcon for backward compatibility.
 * Strips any Tailwind size classes that would force a square container.
 */
import { EchoSolIcon } from "./EchoSolIcon";

export function SolSymbol({
  className,
  size,
  animated,
  large,
}: {
  className?: string;
  size?: number;
  animated?: boolean;
  large?: boolean;
}) {
  // Strip size-related Tailwind classes so they don't constrain the wide aspect ratio.
  const passClass = className
    ? className
        .replace(/\bw-[\d.[\]]+\b/g, "")
        .replace(/\bh-[\d.[\]]+\b/g, "")
        .trim()
    : "";

  return (
    <EchoSolIcon
      size={size}
      large={large}
      animated={animated}
      className={passClass || undefined}
    />
  );
}
