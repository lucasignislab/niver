export type CampaignStatus = "upcoming" | "active" | "ended";

export const lots = [
  { date: "2026-10-29", end: "31/10", discount: 35, coupon: "BLACK35" },
  { date: "2026-11-01", end: "08/11", discount: 30, coupon: "BLACK30" },
  { date: "2026-11-09", end: "15/11", discount: 27, coupon: "BLACK27" },
  { date: "2026-11-16", end: "22/11", discount: 25, coupon: "BLACK25" },
  { date: "2026-11-23", end: "30/11", discount: 22, coupon: "BLACK22" },
] as const;

function saoPauloDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function currentLot(date: Date) {
  const day = saoPauloDate(date);
  const status: CampaignStatus = day < lots[0].date ? "upcoming" : day > "2026-11-30" ? "ended" : "active";
  const index = status === "upcoming" ? 0 : Math.max(0, lots.findLastIndex((lot) => day >= lot.date));
  return { status, index, ...lots[index] };
}

export function discounted(value: number, percent: number): number {
  return Math.round((value * (100 - percent) + Number.EPSILON) * 100) / 10000;
}
