export type Product = "ads" | "pages" | "hub";
export type Network = "google" | "meta" | "taboola" | "newsbreak" | "mgid" | "tiktok" | "revcontent";
export type AccountNetwork = Exclude<Network, "mgid" | "tiktok" | "revcontent">;

export const plans = ["Basic", "Starter", "Scale", "Max"] as const;
export const salesOptions = ["Até 500", "500 a 1 mil", "1 a 2,5 mil", "2,5 a 5 mil", "5 a 15 mil", "+ de 15 mil"];
export const visitOptions = ["Até 200 mil", "200 a 500 mil", "500 mil a 1 milhão", "1 a 3 milhões", "+ de 3 milhões"];
export const salesLimits = ["1.000", "2.500", "5.000", "15.000"];
export const visitLimits = ["200.000", "500.000", "1.000.000", "3.000.000"];
export const accountLimits: Record<AccountNetwork, number[]> = {
  google: [10, 20, 999, 999],
  meta: [3, 7, 999, 999],
  taboola: [2, 5, 999, 999],
  newsbreak: [2, 5, 999, 999],
};
export const googleEmailLimits = [3, 10, 30, 999];

export function supportsAdAccounts(network: Network): network is AccountNetwork {
  return network in accountLimits;
}

export function networkTier(count: number): "1" | "2" | "all" {
  return count <= 1 ? "1" : count === 2 ? "2" : "all";
}

export function recommendPlan(
  product: Product,
  networks: Network[],
  volume: number,
  accounts: Record<AccountNetwork, number>,
  googleEmails: number,
): number {
  const volumePlan = (product === "pages" ? [0, 1, 2, 3, 3] : [0, 0, 1, 2, 3, 3])[volume] ?? 0;
  if (product === "pages") return volumePlan;

  const accountPlan = networks.filter(supportsAdAccounts).reduce((highest, network) => {
    const index = accountLimits[network].findIndex((limit) => accounts[network] <= limit);
    return Math.max(highest, index < 0 ? 3 : index);
  }, 0);
  const emailPlan = networks.includes("google")
    ? googleEmailLimits.findIndex((limit) => googleEmails <= limit)
    : 0;

  return Math.max(volumePlan, accountPlan, emailPlan < 0 ? 3 : emailPlan);
}
