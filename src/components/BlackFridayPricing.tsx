import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import priceData from "../data/black-friday-prices.json";
import { cashSavingPercent, currentLot, discounted } from "../lib/blackFriday";
import { checkoutLinks } from "../lib/checkoutLinks";
import {
  accountLimits,
  googleEmailLimits,
  plans,
  salesLimits,
  visitLimits,
  type AccountNetwork,
  type Product,
} from "../lib/planCalculator";
import PlanCalculator from "./PlanCalculator";
import OfferButton from "./OfferButton";

type Period = "mensal" | "semestral" | "anual" | "vitalicio";
type NetworkCount = 1 | 2 | 6;
type Price = { parcel: number; cash?: number };

const products: { id: Product; label: string; logo: string; description: string[] }[] = [
  { id: "ads", label: "Ratoeira Ads", logo: "/logoraads2.png", description: ["Para validar as primeiras campanhas.", "Para anunciantes que já escalam com consistência.", "Para operações robustas de alto volume.", "Para quem não pode ter limites pela frente."] },
  { id: "pages", label: "Ratoeira Pages", logo: "/logopages2.png", description: ["Para testar a performance da Ratoeira Pages.", "Para quem precisa publicar mais páginas.", "Para ganhar flexibilidade de domínios.", "Para operações de alto tráfego."] },
  { id: "hub", label: "Ratoeira Hub", logo: "/logo_ads_pages.png", description: ["O combo para iniciar sua escala integrada.", "Flexibilidade para testar e escalar.", "Estrutura para não travar sua operação.", "O ecossistema completo, sem teto."] },
];
const periods: { id: Exclude<Period, "vitalicio">; label: string; installments: number }[] = [
  { id: "mensal", label: "Mensal", installments: 1 },
  { id: "semestral", label: "Semestral", installments: 6 },
  { id: "anual", label: "Anual", installments: 12 },
];
const periodOptions: { id: Period; label: string }[] = [{ id: "vitalicio", label: "Vitalício" }, ...periods];
const lifetimeOptions = [
  { tier: "1", label: "Scale 1 rede", networkCount: 1, description: "Uma rede de tráfego ao mesmo tempo." },
  { tier: "2", label: "Scale 2 redes", networkCount: 2, description: "Duas redes de tráfego ao mesmo tempo." },
  { tier: "all", label: "Scale todas as redes", networkCount: 6, description: "Todas as redes de tráfego disponíveis." },
] as const;
const accountNetworks: { id: AccountNetwork; label: string; logo: string }[] = [
  { id: "google", label: "Google Ads", logo: "/assets/platforms/google-ads.webp" },
  { id: "meta", label: "Meta Ads", logo: "/assets/platforms/meta.svg" },
  { id: "taboola", label: "Taboola", logo: "/assets/platforms/taboola.png" },
  { id: "newsbreak", label: "NewsBreak", logo: "/assets/platforms/newsbreak.svg" },
];
const domains = [10, 20, 40, 100];
const tags = ["15", "80", "300", "Ilimitadas"];
const webhooks = ["7", "15", "Ilimitados", "Ilimitados"];
const extraSaleRates = {
  "1": ["0,15", "0,09", "0,07", "0,05"],
  "2": ["0,26", "0,15", "0,12", "0,07"],
  all: ["0,37", "0,21", "0,15", "0,09"],
};
const prices: Record<string, Record<string, Record<string, Record<string, Price>>>> = priceData.prices;
const lifetime: Record<string, Record<string, Price[]>> = priceData.vitalicio;

function currency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function clock(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return [hours, minutes, seconds % 60].map((value) => String(value).padStart(2, "0")).join(":");
}

function DetailRow({ label, value }: { label: ReactNode; value: ReactNode }) {
  return <div className="flex items-start justify-between gap-3 py-1 text-xs leading-5 text-brand-dark/75"><span>{label}</span><strong className="shrink-0 text-right text-brand-dark">{value}</strong></div>;
}

function PlanDetails({ product, index, networkCount, tier }: { product: Product; index: number; networkCount: NetworkCount; tier: "1" | "2" | "all" }) {
  return (
    <div className="space-y-5 pt-2">
      {product !== "pages" && (
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-brand-dark/60"><img src="/logoraads2.png" alt="" className="h-5 w-5 object-contain" />Ratoeira Ads</div>
          <DetailRow label="Redes simultâneas" value={networkCount === 6 ? "Todas as 7" : networkCount} />
          <DetailRow label="Vendas aprovadas/mês" value={salesLimits[index]} />
          <DetailRow label="Venda extra aprovada" value={`R$ ${extraSaleRates[tier][index]}`} />
          <DetailRow label="Tag Ratoeira Automática" value={tags[index]} />
          <DetailRow label="Integrações / Webhooks" value={webhooks[index]} />
          <DetailRow label="E-mails do Google Ads" value={googleEmailLimits[index] >= 999 ? "Ilimitados" : googleEmailLimits[index]} />
          <p className="mb-1 mt-4 text-[11px] font-black uppercase tracking-wide text-brand-dark/60">Contas de anúncio por rede</p>
          {accountNetworks.map((network) => (
            <DetailRow key={network.id} label={<span className="flex items-center gap-2"><img src={network.logo} alt="" className="h-5 w-5 object-contain" />{network.label}</span>} value={accountLimits[network.id][index] >= 999 ? "Ilimitadas" : accountLimits[network.id][index]} />
          ))}
        </div>
      )}
      {product !== "ads" && (
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-brand-dark/60"><img src="/logopages2.png" alt="" className="h-5 w-5 object-contain" />Ratoeira Pages</div>
          <DetailRow label="Acessos mensais" value={visitLimits[index]} />
          <DetailRow label="Domínios customizados" value={domains[index]} />
          <DetailRow label="Páginas" value="Ilimitadas" />
          <DetailRow label="Hospedagem Turbo" value="Ilimitada" />
          <DetailRow label="Conexão com IA" value={<Check aria-label="Incluída" size={16} />} />
        </div>
      )}
    </div>
  );
}

export default function BlackFridayPricing() {
  const [now, setNow] = useState<Date | null>(null);
  const [product, setProduct] = useState<Product>("hub");
  const [networkCount, setNetworkCount] = useState<NetworkCount>(1);
  const [period, setPeriod] = useState<Period>("vitalicio");
  const [activeCard, setActiveCard] = useState(0);
  const [recommendedPlan, setRecommendedPlan] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const plansDetailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const lot = currentLot(now ?? new Date(0));
  const secondsLeft = lot.nextChange && now ? Math.max(0, Math.ceil((Date.parse(lot.nextChange) - now.getTime()) / 1_000)) : 0;
  const available = now !== null ? lot.status : "upcoming";
  const tier = networkCount === 1 ? "1" : networkCount === 2 ? "2" : "all";
  const selectedTier = product === "pages" ? "single" : tier;
  const productInfo = products.find((item) => item.id === product)!;
  const isLifetime = period === "vitalicio";
  const visibleCardCount = isLifetime ? product === "pages" ? 1 : lifetimeOptions.length : plans.length;

  const scrollToCard = (index: number) => {
    const container = carouselRef.current;
    const card = container?.children.item(index) as HTMLElement | null;
    if (!container || !card) return;
    container.scrollTo({ left: card.offsetLeft - container.offsetLeft, behavior: "smooth" });
    setActiveCard(index);
  };

  const updateActiveCard = () => {
    const container = carouselRef.current;
    if (!container) return;
    const cards = Array.from(container.children) as HTMLElement[];
    const index = cards.reduce((closest, card, current) => {
      const distance = Math.abs(card.offsetLeft - container.offsetLeft - container.scrollLeft);
      const closestDistance = Math.abs(cards[closest].offsetLeft - container.offsetLeft - container.scrollLeft);
      return distance < closestDistance ? current : closest;
    }, 0);
    setActiveCard(index);
  };

  const selectRecommendedPlan = (nextProduct: Product, nextNetwork: "1" | "2" | "all", nextPeriod: Period, plan: string) => {
    const index = nextPeriod === "vitalicio" ? nextProduct === "pages" ? 0 : lifetimeOptions.findIndex((item) => item.tier === nextNetwork) : plans.indexOf(plan as (typeof plans)[number]);
    setProduct(nextProduct);
    setNetworkCount(nextNetwork === "all" ? 6 : Number(nextNetwork) as NetworkCount);
    setPeriod(nextPeriod);
    setRecommendedPlan(nextPeriod === "vitalicio" ? `vitalicio:${nextProduct === "pages" ? "single" : nextNetwork}` : plan);
    setActiveCard(index);
    if (plansDetailsRef.current) plansDetailsRef.current.open = true;
    requestAnimationFrame(() => {
      document.getElementById("planos-valores")?.scrollIntoView({ behavior: "smooth", block: "start" });
      scrollToCard(index);
    });
  };

  return (
    <>
      <PlanCalculator lot={lot} onSelect={selectRecommendedPlan} />
      <section id="planos" className="scroll-mt-24 bg-brand-lighter px-4 py-16 md:py-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="mx-auto max-w-3xl text-center lg:max-w-5xl">
            <h2 className="text-4xl font-black tracking-tight text-brand-dark md:text-6xl lg:whitespace-nowrap">Escolha como quer começar</h2>
            <p className="mx-auto mt-4 max-w-3xl text-base text-brand-dark/70 md:text-lg">Produtos, períodos, lotes e preços — tudo a um clique.</p>
          </div>

          <div className="mx-auto mt-8 max-w-2xl rounded-2xl bg-brand-yellow/15 px-5 py-4 text-center text-brand-dark">
            {lot.isTest && <p className="mb-2 text-xs font-black uppercase tracking-wide text-brand-dark/60">Teste dos lotes · 26/10 · viradas a cada 10 minutos</p>}
            {lot.status !== "ended" && <p className="mb-2 text-xs font-black uppercase tracking-wide text-brand-dark/60">{isLifetime ? `Lote ${lot.index + 1} · Vitalício` : `Lote ${lot.index + 1} · ${lot.discount}% de desconto`}</p>}
            <p className="font-black" aria-live="polite">{lot.status === "upcoming" ? lot.isTest ? "Teste começa hoje às 17:00" : "A Black começa em 29/10 às 20:00" : lot.status === "ended" ? "Campanha encerrada" : isLifetime ? `Preço do lote até ${lot.end}` : `${lot.discount}% de desconto até ${lot.end}`}</p>
            <p className="mt-1 text-sm text-brand-dark/75">{lot.status === "upcoming" ? "Os descontos passam a valer quando o primeiro lote abrir." : lot.status === "ended" ? "A campanha de Black Friday terminou." : isLifetime ? "O preço do vitalício muda na próxima virada de lote." : `Lote atual: ${lot.coupon}. Os preços mudam na próxima virada de lote.`}</p>
            {lot.nextChange && <p className="mt-3 text-sm font-semibold tabular-nums">{lot.status === "upcoming" ? "Começa em" : "Próxima virada em"} <time className="ml-1 font-black" dateTime={lot.nextChange}>{clock(secondsLeft)}</time></p>}
          </div>

          <details ref={plansDetailsRef} className="mt-10">
            <summary className="mx-auto flex w-full max-w-2xl cursor-pointer list-none items-center justify-center gap-3 rounded-full bg-brand-yellow px-8 py-5 text-center text-base font-black text-brand-dark shadow-[0_10px_30px_rgba(0,0,0,0.10)] hover:bg-brand-yellow-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark [&::-webkit-details-marker]:hidden">
              Ver todos os planos, períodos e preços
              <ChevronDown aria-hidden="true" className="size-5 shrink-0" />
            </summary>
          <div className="mb-10 mt-9 flex flex-col items-center gap-5">
            <div className="grid w-full max-w-3xl gap-2 sm:grid-cols-3" aria-label="Produto">
              {products.map((item) => (
                <button key={item.id} type="button" aria-pressed={product === item.id} onClick={() => { setProduct(item.id); setActiveCard(0); setRecommendedPlan(null); carouselRef.current?.scrollTo({ left: 0 }); }} className={`flex min-h-14 items-center gap-3 rounded-2xl px-4 text-left text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark ${product === item.id ? "bg-brand-yellow text-brand-dark" : "bg-white text-brand-dark hover:bg-brand-yellow/15"}`}>
                  <img src={item.logo} alt="" className="h-7 w-8 shrink-0 object-contain" />{item.label}
                </button>
              ))}
            </div>
            <div className={`grid w-full max-w-5xl items-end gap-6 ${product === "pages" || isLifetime ? "max-w-lg" : "lg:grid-cols-2"}`}>
              {product !== "pages" && !isLifetime && (
                <div>
                  <label htmlFor="network-count" className="mb-2 block text-xs font-black uppercase tracking-wide text-brand-dark/65">Quantas redes de tráfego</label>
                  <div className="relative">
                    <select id="network-count" value={networkCount} onChange={(event) => { setNetworkCount(Number(event.target.value) as NetworkCount); setRecommendedPlan(null); }} className="min-h-14 w-full appearance-none rounded-2xl bg-white px-5 pr-12 font-semibold text-brand-dark outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow">
                      <option value={1}>1 rede de tráfego disponível</option>
                      <option value={2}>2 redes de tráfego disponíveis</option>
                      <option value={6}>Todas as redes de tráfego disponíveis</option>
                    </select>
                    <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-5 top-1/2 size-5 -translate-y-1/2 text-brand-dark/60" />
                  </div>
                </div>
              )}
              <div>
                <span className="mb-2 block text-xs font-black uppercase tracking-wide text-brand-dark/65">Por quanto tempo</span>
                <p className="mb-2 text-center"><span className="inline-block rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase text-white sm:text-xs">Anual: 2 meses grátis</span></p>
                <fieldset className="grid min-h-14 grid-cols-4 items-center rounded-2xl bg-white p-1">
                  <legend className="sr-only">Período de contratação</legend>
                  {periodOptions.map((item) => (
                    <button key={item.id} type="button" aria-pressed={period === item.id} onClick={() => { setPeriod(item.id); setActiveCard(0); setRecommendedPlan(null); carouselRef.current?.scrollTo({ left: 0 }); }} className={`min-h-11 min-w-0 rounded-xl px-1 text-xs font-bold focus-visible:outline-2 focus-visible:outline-brand-dark sm:px-4 sm:text-base ${period === item.id ? "bg-brand-yellow text-brand-dark" : "text-brand-dark/65 hover:bg-brand-yellow/10"}`}>{item.label}</button>
                  ))}
                </fieldset>
              </div>
            </div>
          </div>

          {visibleCardCount > 1 && <div className="mb-4 flex items-center justify-between md:hidden">
            <span className="text-sm font-semibold text-brand-dark" aria-live="polite">Plano {activeCard + 1} de {visibleCardCount}</span>
            <div className="flex gap-2" aria-label="Navegação dos planos">
              <button type="button" aria-label="Ver plano anterior" disabled={activeCard === 0} onClick={() => scrollToCard(activeCard - 1)} className="grid size-11 place-items-center rounded-full bg-white text-brand-dark disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-brand-dark"><ChevronLeft size={20} /></button>
              <button type="button" aria-label="Ver próximo plano" disabled={activeCard === visibleCardCount - 1} onClick={() => scrollToCard(activeCard + 1)} className="grid size-11 place-items-center rounded-full bg-white text-brand-dark disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-brand-dark"><ChevronRight size={20} /></button>
            </div>
          </div>}

          <div id="planos-valores" ref={carouselRef} onScroll={updateActiveCard} className={`flex snap-x snap-mandatory items-start gap-4 overflow-x-auto pb-3 pt-4 scroll-mt-24 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:overflow-visible md:pb-0 md:pt-0 ${isLifetime ? product === "pages" ? "mx-auto max-w-xl md:grid-cols-1" : "md:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-4"}`}>
            {!isLifetime && plans.map((name, index) => {
              const original = prices[product][selectedTier][period][name.toLowerCase()];
              const parcel = discounted(original.parcel, lot.appliedDiscount);
              const cash = original.cash === undefined ? undefined : discounted(original.cash, lot.appliedDiscount);
              const count = periods.find((item) => item.id === period)!.installments;
              const saving = cashSavingPercent(parcel, cash, count, lot.appliedDiscount);
              const promotionalCash = lot.appliedDiscount > 0 && original.cash !== undefined && cash !== undefined;
              const featured = index === 1;
              const unlimited = index === plans.length - 1;
              return (
                <article key={name} className={`relative flex min-w-full snap-start flex-col rounded-2xl bg-white p-5 shadow-[0_12px_32px_rgba(0,0,0,0.07)] md:min-w-0 ${featured ? "ring-2 ring-brand-yellow" : ""} ${unlimited ? "ring-2 ring-emerald-500/70" : ""} ${recommendedPlan === name ? "outline-2 outline-offset-4 outline-brand-yellow" : ""}`}>
                  {featured && <span className="absolute -top-3 left-4 rounded-full bg-brand-yellow px-3 py-1 text-xs font-black uppercase text-brand-dark">Mais escolhido</span>}
                  {unlimited && <span className="absolute -top-3 right-4 rounded-full bg-emerald-500 px-3 py-1 text-xs font-black uppercase text-white">Sem limites</span>}
                  {recommendedPlan === name && <span className="absolute right-5 top-5 rounded-full bg-brand-dark px-3 py-1 text-xs font-black text-white">Indicado para você</span>}
                  <h3 className="mt-3 text-3xl font-black text-brand-dark">{name}</h3>
                  <p className="mt-2 min-h-12 text-sm leading-5 text-brand-dark/65">{productInfo.description[index]}</p>
                  <div className="mt-5 min-h-36 tabular-nums">
                    {lot.appliedDiscount > 0 && <p className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-brand-dark/60"><span>De <s>{count > 1 ? `${count}x ` : ""}{currency(original.parcel)}{count === 1 ? "/mês" : ""}</s></span><span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 font-black text-emerald-700">{lot.appliedDiscount}% OFF</span></p>}
                    {count > 1 && <span className="text-sm font-black text-brand-dark">{count}x</span>}
                    <p className="flex flex-wrap items-baseline gap-x-1"><strong className="text-3xl font-black tracking-tight text-brand-dark 2xl:text-4xl">{currency(parcel)}</strong>{count === 1 && <span className="text-sm text-brand-dark/65">/mês</span>}</p>
                    {cash !== undefined ? promotionalCash ? <p className="mt-2 text-sm text-brand-dark/75"><span className="block">ou {original.cash !== undefined && <s className="text-brand-dark/50">{currency(original.cash)}</s>}</span><span className="block"><strong className="text-brand-dark">{currency(cash)}</strong> à vista</span></p> : <p className="mt-2 text-sm text-brand-dark/75">ou <strong className="text-brand-dark">{currency(cash)}</strong> à vista</p> : <p className="mt-2 text-sm text-brand-dark/65">Cobrança mensal</p>}
                    {saving > 0 && <span className="mt-3 inline-block rounded-full bg-brand-yellow/15 px-3 py-1 text-xs font-bold text-brand-dark">Economize {saving}% pagando à vista</span>}
                  </div>
                  <div className="border-t border-brand-dark/10 pt-4">
                    <PlanDetails product={product} index={index} networkCount={networkCount} tier={tier} />
                    <OfferButton link={checkoutLinks[`${product}/${selectedTier}/${period}/${name.toLowerCase()}`]} coupon={lot.coupon} status={available} product={product} label={`Assinar ${name}`} />
                    <p className="mt-3 text-center text-xs text-brand-dark/55">{count === 1 ? "Cobrança mensal" : `${count}x sem juros ou à vista com desconto`}</p>
                  </div>
                </article>
              );
            })}
            {isLifetime && (product === "pages" ? [{ tier: "single", label: "Scale", networkCount: 1, description: "Ratoeira Pages sem renovação de assinatura." } as const] : lifetimeOptions).map((option) => {
              const price = lifetime[product][option.tier][lot.index];
              const optionTier = option.tier === "single" ? "1" : option.tier;
              const saving = price.cash === undefined ? 0 : Math.round((1 - price.cash / price.parcel) * 100);
              return (
                <article key={option.tier} className={`relative flex min-w-full snap-start flex-col rounded-2xl bg-white p-5 shadow-[0_12px_32px_rgba(0,0,0,0.07)] md:min-w-0 ${option.tier === "2" ? "ring-2 ring-brand-yellow" : ""} ${option.tier === "all" ? "ring-2 ring-emerald-500/70" : ""} ${recommendedPlan === `vitalicio:${option.tier}` ? "outline-2 outline-offset-4 outline-brand-yellow" : ""}`}>
                  {option.tier === "2" && <span className="absolute -top-3 left-4 rounded-full bg-brand-yellow px-3 py-1 text-xs font-black uppercase text-brand-dark">Meio-termo</span>}
                  {option.tier === "all" && <span className="absolute -top-3 right-4 rounded-full bg-emerald-500 px-3 py-1 text-xs font-black uppercase text-white">GANHA INGRESSO DO EVENTO</span>}
                  {recommendedPlan === `vitalicio:${option.tier}` && <span className="absolute right-5 top-5 rounded-full bg-brand-dark px-3 py-1 text-xs font-black text-white">Indicado para você</span>}
                  <h3 className="mt-3 text-3xl font-black text-brand-dark">{option.label}</h3>
                  <p className="mt-2 min-h-12 text-sm leading-5 text-brand-dark/65">{option.description}</p>
                  <div className="mt-5 min-h-36 tabular-nums">
                    {lot.status === "ended" ? <p className="text-sm text-brand-dark/75">Oferta encerrada.</p> : <>
                      <span className="text-sm font-black text-brand-dark">Pagamento único</span>
                      <p><strong className="text-3xl font-black tracking-tight text-brand-dark 2xl:text-4xl">{currency(price.parcel)}</strong></p>
                      {price.cash !== undefined && <p className="mt-2 text-sm text-brand-dark/75">ou <strong className="text-brand-dark">{currency(price.cash)}</strong> à vista</p>}
                      {saving > 0 && <span className="mt-3 inline-block rounded-full bg-brand-yellow/15 px-3 py-1 text-xs font-bold text-brand-dark">Economize {saving}% pagando à vista</span>}
                    </>}
                  </div>
                  <div className="border-t border-brand-dark/10 pt-4">
                    <PlanDetails product={product} index={2} networkCount={option.networkCount} tier={optionTier} />
                    <DetailRow label="Renovação" value="Nunca" />
                    <OfferButton link={checkoutLinks[`${product}/${option.tier}/vitalicio`]} coupon={null} status={available} product={product} label="Assinar vitalício" />
                    <p className="mt-3 text-center text-xs text-brand-dark/55">Pagamento único, sem renovação</p>
                  </div>
                </article>
              );
            })}
          </div>
          {visibleCardCount > 1 && <div className="mt-3 flex justify-center gap-2 md:hidden" aria-label="Selecionar plano">
            {Array.from({ length: visibleCardCount }, (_, index) => <button key={index} type="button" aria-label={isLifetime ? `Ver vitalício ${index + 1}` : `Ver plano ${plans[index]}`} aria-current={activeCard === index ? "true" : undefined} onClick={() => scrollToCard(index)} className={`h-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-brand-dark ${activeCard === index ? "w-8 bg-brand-yellow" : "w-2.5 bg-brand-dark/25"}`} />)}
          </div>}
          {isLifetime && <p className="mt-4 text-center text-xs text-brand-dark/55">Sem valor riscado e sem cupom — o vitalício já é o preço final do lote. O que sobe de um lote para o outro é o próprio preço.</p>}
          </details>
        </div>
      </section>

    </>
  );
}
