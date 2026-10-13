/**
 * Formats a number as Pakistani Rupees: "PKR 249,000".
 * All customer-facing prices in LUXORA WATCHES use this — never USD/$.
 */
export function formatPKR(amount) {
  const n = Number(amount) || 0;
  return `PKR ${n.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
}

/**
 * Compact variant for tight spaces (cards, badges): "PKR 249,000" — same as
 * formatPKR for now, kept separate so a future compact form (e.g. "249K")
 * can be introduced without touching every call site.
 */
export const formatPKRCompact = formatPKR;
