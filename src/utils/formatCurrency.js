export function formatCurrency(amount) {
  return `₦${Math.round(amount).toLocaleString("en-NG")}`;
}
