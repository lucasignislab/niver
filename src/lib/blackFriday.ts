export type CampaignStatus = "upcoming" | "active" | "ended";

const productionLots = [
  { start: "2026-10-29T20:00:00-03:00", end: "31/10", discount: 35, coupon: "BLACK35" },
  { start: "2026-11-01T00:00:00-03:00", end: "08/11", discount: 30, coupon: "BLACK30" },
  { start: "2026-11-09T00:00:00-03:00", end: "15/11", discount: 27, coupon: "BLACK27" },
  { start: "2026-11-16T00:00:00-03:00", end: "22/11", discount: 25, coupon: "BLACK25" },
  { start: "2026-11-23T00:00:00-03:00", end: "30/11", discount: 22, coupon: "BLACK22" },
] as const;

const testLots = [
  { start: "2026-10-26T17:00:00-03:00", end: "17:10", discount: 35, coupon: "BLACK35" },
  { start: "2026-10-26T17:10:00-03:00", end: "17:20", discount: 30, coupon: "BLACK30" },
  { start: "2026-10-26T17:20:00-03:00", end: "17:30", discount: 27, coupon: "BLACK27" },
  { start: "2026-10-26T17:30:00-03:00", end: "17:40", discount: 25, coupon: "BLACK25" },
  { start: "2026-10-26T17:40:00-03:00", end: "17:50", discount: 22, coupon: "BLACK22" },
] as const;
const testEnd = "2026-10-26T17:50:00-03:00";

export function currentLot(date: Date) {
  const time = date.getTime();
  const isTest = time < Date.parse(testEnd);
  const lots = isTest ? testLots : productionLots;
  const campaignEnd = "2026-12-01T00:00:00-03:00";
  const status: CampaignStatus = time < Date.parse(lots[0].start) ? "upcoming" : time >= Date.parse(campaignEnd) ? "ended" : "active";
  const index = status === "upcoming" ? 0 : Math.max(0, lots.findLastIndex((lot) => time >= Date.parse(lot.start)));
  const nextChange = status === "ended" ? null : status === "upcoming" ? lots[0].start : lots[index + 1]?.start ?? (isTest ? testEnd : campaignEnd);
  return { status, index, nextChange, isTest, ...lots[index], appliedDiscount: status === "active" ? lots[index].discount : 0 };
}

export function discounted(value: number, percent: number): number {
  return Math.round((value * (100 - percent) + Number.EPSILON) * 100) / 10000;
}

export function cashSavingPercent(parcel: number, cash: number | undefined, installments: number, lotDiscount: number): number {
  return cash === undefined || lotDiscount > 0 ? 0 : Math.round((1 - cash / (parcel * installments)) * 100);
}
