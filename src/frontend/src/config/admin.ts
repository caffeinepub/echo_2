/**
 * Admin principals for the Minty app.
 * Uses Internet Identity principals for authentication.
 * Only these principals will see the ⚙ Manage button and have access to admin features.
 */
export const ADMIN_PRINCIPALS: string[] = [
  "tkbly-majk2-g7e23-c77xd-uspgz-miwas-lubyu-3ym64-hgogk-dogbt-sae",
  "rl6rz-677yl-ujzhg-r6ely-7o6c6-cn3ai-kig5o-mlota-al7xl-u6x2j-uae",
];

/** Helper to check if a principal string is an admin */
export function isAdminPrincipal(principal: string | undefined): boolean {
  if (!principal) return false;
  return ADMIN_PRINCIPALS.includes(principal);
}

/** @deprecated Use ADMIN_PRINCIPALS instead */
export const ADMIN_PRINCIPAL: string = ADMIN_PRINCIPALS[0];

/** @deprecated Use ADMIN_PRINCIPALS instead */
export const ADMIN_WALLET_ADDRESS: string = "";
