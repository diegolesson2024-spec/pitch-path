export const fmtDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export const fmtShort = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

export function fmtHeight(cm?: number | null) {
  if (!cm) return "–";
  const inches = Math.round(cm / 2.54);
  return `${cm} cm · ${Math.floor(inches / 12)}'${inches % 12}"`;
}

export const fullName = (p: { firstName: string; lastName: string }) => `${p.firstName} ${p.lastName}`;

export function pct(n: number, d: number) {
  return d ? Math.round((n / d) * 100) : 0;
}
