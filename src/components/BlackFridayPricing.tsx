import { useEffect, useState } from "react";
import priceData from "../data/black-friday-prices.json";
import { currentLot, discounted, type CampaignStatus } from "../lib/blackFriday";
import PlanCalculator from "./PlanCalculator";
import type { Product } from "../lib/planCalculator";

type Price = { parcel: number; cash?: number };
type Period = "anual" | "semestral" | "mensal" | "vitalicio";

const products: { id: Product; name: string }[] = [
  { id: "ads", name: "Ratoeira Ads" },
  { id: "pages", name: "Ratoeira Pages" },
  { id: "hub", name: "Ratoeira Hub" },
];
const periods: { id: Period; label: string }[] = [
  { id: "anual", label: "Anual" },
  { id: "semestral", label: "Semestral" },
  { id: "mensal", label: "Mensal" },
  { id: "vitalicio", label: "Vitalício" },
];
const plans = ["Basic", "Starter", "Scale", "Max"];
const savings: Record<Product, { anual: number; semestral: number }> = {
  ads: { anual: 9, semestral: 5 },
  pages: { anual: 11, semestral: 6 },
  hub: { anual: 7, semestral: 4 },
};
const prices: Record<string, Record<string, Record<string, Record<string, Price>>>> = priceData.prices;
const lifetime: Record<string, Record<string, Price[]>> = priceData.vitalicio;

// Preencher com os links das novas ofertas, no formato ads/1/anual/basic.
const checkoutLinks: Record<string, string> = {};

function currency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function checkoutUrl(link: string, coupon: string | null): string {
  const url = new URL(link);
  if (coupon) url.searchParams.set("coupon", coupon);
  else url.searchParams.delete("coupon");
  const page = new URL(window.location.href);
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
    const value = page.searchParams.get(key);
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}

function PriceCard({
  title,
  price,
  period,
  discount,
  saving,
  link,
  coupon,
  status,
  recommended,
}: {
  title: string;
  price: Price;
  period: Period;
  discount: number;
  saving?: number;
  link?: string;
  coupon: string;
  status: CampaignStatus;
  recommended?: boolean;
}) {
  const isLifetime = period === "vitalicio";
  const count = isLifetime ? 0 : period === "semestral" ? 6 : period === "mensal" ? 1 : 12;
  const parcel = isLifetime ? price.parcel : discounted(price.parcel, discount);
  const cash = price.cash === undefined ? undefined : isLifetime ? price.cash : discounted(price.cash, discount);
  const activeLink = status === "active" && link;

  return (
    <article className={`flex h-full flex-col rounded-3xl bg-white p-7 shadow-[0_15px_40px_rgba(0,0,0,0.07)] md:p-8 ${recommended ? "ring-2 ring-brand-yellow" : ""}`}>
      {recommended && <span className="mb-3 w-fit rounded-full bg-brand-yellow px-3 py-1 text-xs font-black text-brand-dark">Indicado para você</span>}
      <h3 className="text-2xl font-black text-brand-dark">{title}</h3>
      <div className="mt-7 flex grow flex-col">
        {!isLifetime && (
          <span className="text-sm font-medium text-brand-dark/60 line-through">
            {count > 1 ? `${count}x ` : ""}{currency(price.parcel)}{count === 1 ? "/mês" : ""}
          </span>
        )}
        {isLifetime && <span className="text-sm font-medium text-brand-dark/70">Parcelado</span>}
        {count > 1 && <span className="mt-2 text-sm font-black text-brand-dark">{count}x</span>}
        <strong className="mt-1 block whitespace-nowrap text-3xl font-black tabular-nums text-brand-dark">
          {currency(parcel)}{count === 1 ? <span className="text-base">/mês</span> : null}
        </strong>
        {cash !== undefined && (
          <p className="mt-4 text-sm text-brand-dark/75">
            ou {!isLifetime && <span className="mr-1 line-through">{currency(price.cash!)}</span>}
            <strong className="font-bold text-brand-dark">{currency(cash)} à vista</strong>
          </p>
        )}
        {!isLifetime && saving !== undefined && (
          <p className="mt-3 w-fit rounded-full bg-brand-yellow/15 px-3 py-1 text-xs font-bold text-brand-dark">
            Economize {saving}% pagando à vista
          </p>
        )}
      </div>
      {activeLink ? (
        <a
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-brand-yellow px-5 py-3 text-center text-sm font-black uppercase text-brand-dark transition-colors hover:bg-brand-yellow-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark"
          href={checkoutUrl(link, isLifetime ? null : coupon)}
          onClick={(event) => {
            const latest = currentLot(new Date());
            if (latest.status !== "active") event.preventDefault();
            else event.currentTarget.href = checkoutUrl(link, isLifetime ? null : latest.coupon);
          }}
        >
          Escolher plano
        </a>
      ) : (
        <button className="mt-8 min-h-12 rounded-full bg-brand-dark/10 px-5 py-3 text-sm font-black uppercase text-brand-dark/55" disabled>
          {status === "upcoming" ? "Disponível em 29/10" : status === "ended" ? "Campanha encerrada" : "Checkout em preparação"}
        </button>
      )}
    </article>
  );
}

export default function BlackFridayPricing() {
  const [now, setNow] = useState<Date | null>(null);
  const [product, setProduct] = useState<Product>("ads");
  const [network, setNetwork] = useState("1");
  const [period, setPeriod] = useState<Period>("anual");
  const [recommendedPlan, setRecommendedPlan] = useState<string | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const lot = currentLot(now ?? new Date("2026-10-29T00:00:00-03:00"));
  const selectedNetwork = product === "pages" ? "single" : network;
  const recurring = prices[product][selectedNetwork]?.[period];
  const lifetimePrice = lifetime[product][selectedNetwork]?.[lot.index];
  const available = now !== null ? lot.status : "upcoming";

  const selectRecommendedPlan = (nextProduct: Product, nextNetwork: "1" | "2" | "all", nextPeriod: "mensal" | "semestral" | "anual", plan: string) => {
    setProduct(nextProduct);
    setNetwork(nextNetwork);
    setPeriod(nextPeriod);
    setRecommendedPlan(plan);
    document.getElementById("planos-valores")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
    <PlanCalculator lot={lot} onSelect={selectRecommendedPlan} />
    <section id="planos" className="bg-brand-light px-4 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-4xl font-black tracking-tight text-brand-dark md:text-6xl">Escolha sua Ratoeira</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-brand-dark/70 md:text-lg">
            Os mesmos preços para novos clientes e assinantes dos planos atuais.
          </p>
          <div className="mx-auto mt-8 max-w-2xl rounded-2xl bg-brand-dark px-5 py-4 text-white">
            <p className="text-lg font-black text-brand-yellow">
              {lot.status === "upcoming" ? "Pré-Black começa em 29/10" : lot.status === "ended" ? "Campanha encerrada" : `${lot.discount}% de desconto até ${lot.end}`}
            </p>
            <p className="mt-1 text-sm text-white/75">
              {lot.status === "upcoming" ? "Prévia dos preços do primeiro lote. A campanha vai até 30/11." : lot.status === "ended" ? "Os preços abaixo são do último lote da campanha." : `Lote atual: ${lot.coupon}. Os preços mudam na próxima virada de lote.`}
            </p>
          </div>
        </div>

        <div className="mt-12 space-y-6">
          <div className="flex flex-wrap justify-center gap-2" aria-label="Produto">
            {products.map((item) => (
              <button key={item.id} type="button" aria-pressed={product === item.id} onClick={() => { setProduct(item.id); setRecommendedPlan(null); }} className={`rounded-full px-5 py-3 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark ${product === item.id ? "bg-brand-dark text-white" : "bg-white text-brand-dark hover:bg-brand-yellow/20"}`}>
                {item.name}
              </button>
            ))}
          </div>
          {product !== "pages" && (
            <div className="flex flex-wrap justify-center gap-2" aria-label="Quantidade de redes">
              {[["1", "1 rede"], ["2", "2 redes"], ["all", "Todas as redes"]].map(([id, label]) => (
                <button key={id} type="button" aria-pressed={network === id} onClick={() => { setNetwork(id); setRecommendedPlan(null); }} className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark ${network === id ? "bg-brand-yellow text-brand-dark" : "bg-white text-brand-dark/75 hover:bg-brand-yellow/20"}`}>
                  {label}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-2" aria-label="Período">
            {periods.map((item) => (
              <button key={item.id} type="button" aria-pressed={period === item.id} onClick={() => setPeriod(item.id)} className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark ${period === item.id ? "bg-brand-yellow text-brand-dark" : "bg-white text-brand-dark/75 hover:bg-brand-yellow/20"}`}>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-4xl rounded-2xl bg-white px-5 py-4 text-center text-sm leading-relaxed text-brand-dark/80">
          Assinantes ativos dos planos Camundongo, Rato, Ratazana ou Ratazana Plus fazem o upgrade direto na <a href="https://ratoeirahub.com/" className="font-bold underline underline-offset-2">plataforma</a>, onde têm condições exclusivas e melhores que as desta página.
        </p>

        <div id="planos-valores" className={`mt-8 grid scroll-mt-24 gap-5 ${period === "vitalicio" ? "mx-auto max-w-sm" : "md:grid-cols-2 xl:grid-cols-4"}`}>
          {period === "vitalicio" ? lifetimePrice && (
            <PriceCard title={`${products.find((item) => item.id === product)?.name} Vitalício`} price={lifetimePrice} period={period} discount={lot.discount} link={checkoutLinks[`${product}/${selectedNetwork}/vitalicio`]} coupon={lot.coupon} status={available} />
          ) : plans.map((plan) => {
            const price = recurring?.[plan.toLowerCase()];
            return price && (
              <PriceCard key={plan} title={plan} price={price} period={period} discount={lot.discount} saving={period === "anual" || period === "semestral" ? savings[product][period] : undefined} link={checkoutLinks[`${product}/${selectedNetwork}/${period}/${plan.toLowerCase()}`]} coupon={lot.coupon} status={available} recommended={recommendedPlan === plan} />
            );
          })}
        </div>
        {period === "vitalicio" && product !== "pages" && <p className="mx-auto mt-4 max-w-lg text-center text-sm text-brand-dark/70">O vitalício de Ads e Hub dá direito a 3 redes.</p>}
        <p className="mx-auto mt-12 max-w-3xl text-center text-sm leading-relaxed text-brand-dark/70">
          O evento presencial é oferecido depois da compra aprovada e pode ser adquirido com um único clique, sem digitar novamente os dados de pagamento.
        </p>
      </div>
    </section>
    </>
  );
}
