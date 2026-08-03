// ₦10M / ₦7.5M / ₦2.5M — the design drops the trailing zero on whole millions
// but keeps one decimal on halves, which `toLocaleString` won't do on its own.
export function formatNairaShort(value) {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `₦${Number.isInteger(millions) ? millions : millions.toFixed(1)}M`;
  }
  if (value >= 1_000) return `₦${Math.round(value / 1_000)}K`;
  return `₦${Math.round(value)}`;
}

