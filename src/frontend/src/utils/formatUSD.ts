/**
 * Format a USD value cleanly:
 * - >= $1: integer with commas, e.g. "$34,710"
 * - < $1: two decimals, e.g. "$0.42"
 */
export function formatUSD(usdValue: number): string {
  if (!Number.isFinite(usdValue)) return "$0";
  if (usdValue === 0) return "$0";
  if (usdValue >= 1) {
    return `$${Math.round(usdValue).toLocaleString("en-US")}`;
  }
  return `$${usdValue.toFixed(2)}`;
}
