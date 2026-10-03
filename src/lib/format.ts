/** One date/money format app-wide (FRONTEND-WORKING-FLOW.md §11). Dates arrive as UTC ISO and render in local time. */
export const formatDate = (iso?: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
};

export const formatMoney = (amount?: number | null): string => `৳${(amount ?? 0).toLocaleString()}`;
