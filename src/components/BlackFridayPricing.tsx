import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import priceData from "../data/black-friday-prices.json";
import { currentLot, discounted, testSchedule, type CampaignStatus } from "../lib/blackFriday";
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

type Period = "mensal" | "semestral" | "anual";
type NetworkCount = 1 | 2 | 6;
type Price = { parcel: number; cash?: number };

const products: { id: Product; label: string; logo: string; description: string[] }[] = [
  { id: "ads", label: "Ratoeira Ads", logo: "/logoraads2.png", description: ["Para validar as primeiras campanhas.", "Para anunciantes que já escalam com consistência.", "Para operações robustas de alto volume.", "Para quem não pode ter limites pela frente."] },
  { id: "pages", label: "Ratoeira Pages", logo: "/logopages2.png", description: ["Para testar a performance da Ratoeira Pages.", "Para quem precisa publicar mais páginas.", "Para ganhar flexibilidade de domínios.", "Para operações de alto tráfego."] },
  { id: "hub", label: "Ratoeira Hub", logo: "/logo_ads_pages.png", description: ["O combo para iniciar sua escala integrada.", "Flexibilidade para testar e escalar.", "Estrutura para não travar sua operação.", "O ecossistema completo, sem teto."] },
];
const periods: { id: Period; label: string; installments: number }[] = [
  { id: "mensal", label: "Mensal", installments: 1 },
  { id: "semestral", label: "Semestral", installments: 6 },
  { id: "anual", label: "Anual", installments: 12 },
];
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

function clock(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return [hours, minutes, seconds % 60].map((value) => String(value).padStart(2, "0")).join(":");
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

function DetailRow({ label, value }: { label: ReactNode; value: ReactNode }) {
  return <div className="flex items-start justify-between gap-3 py-1 text-xs leading-5 text-brand-dark/75"><span>{label}</span><strong className="shrink-0 text-right text-brand-dark">{value}</strong></div>;
}

function PlanDetails({ product, index, networkCount, tier }: { product: Product; index: number; networkCount: NetworkCount; tier: "1" | "2" | "all" }) {
  return (
    <div className="space-y-5 pt-2">
      {product !== "pages" && (
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-brand-dark/60"><img src="/logoraads2.png" alt="" className="h-5 w-5 object-contain" />Ratoeira Ads</div>
          <DetailRow label="Redes simultâneas" value={networkCount === 6 ? "Todas" : networkCount} />
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

function OfferButton({ link, coupon, status, label }: { link?: string; coupon: string | null; status: CampaignStatus; label: string }) {
  const active = status === "active" && link;
  if (!active) return <button type="button" disabled className="mt-6 min-h-12 w-full rounded-full bg-brand-dark/10 px-4 text-sm font-black text-brand-dark/50">{status === "upcoming" ? testSchedule ? "Disponível hoje às 15:00" : "Disponível em 29/10" : status === "ended" ? "Campanha encerrada" : "Checkout em preparação"}</button>;
  return (
    <a href={checkoutUrl(active, coupon)} onClick={(event) => {
      const latest = currentLot(new Date());
      if (latest.status !== "active") event.preventDefault();
      else event.currentTarget.href = checkoutUrl(active, coupon === null ? null : latest.coupon);
    }} className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand-yellow px-4 text-center text-sm font-black text-brand-dark hover:bg-brand-yellow-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark">{label}</a>
  );
}

export default function BlackFridayPricing() {
  const [now, setNow] = useState<Date | null>(null);
  const [product, setProduct] = useState<Product>("hub");
  const [networkCount, setNetworkCount] = useState<NetworkCount>(1);
  const [period, setPeriod] = useState<Period>("anual");
  const [activeCard, setActiveCard] = useState(0);
  const [recommendedPlan, setRecommendedPlan] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

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
    const index = plans.indexOf(plan as (typeof plans)[number]);
    setProduct(nextProduct);
    setNetworkCount(nextNetwork === "all" ? 6 : Number(nextNetwork) as NetworkCount);
    setPeriod(nextPeriod);
    setRecommendedPlan(plan);
    setActiveCard(index);
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
            <p className="mx-auto mt-4 max-w-3xl text-base text-brand-dark/70 md:text-lg">Escolha o produto, o número de redes simultâneas e o período para visualizar os valores corretos.</p>
          </div>

          <div className="mx-auto mt-8 max-w-2xl rounded-2xl bg-brand-yellow/15 px-5 py-4 text-center text-brand-dark">
            {testSchedule && <p className="mb-2 text-xs font-black uppercase tracking-wide text-brand-dark/60">Teste dos lotes · 23/10 · viradas a cada 10 minutos</p>}
            <p className="font-black" aria-live="polite">{lot.status === "upcoming" ? testSchedule ? "Primeiro lote começa hoje às 15:00" : "Pré-Black começa em 29/10" : lot.status === "ended" ? testSchedule ? "Teste encerrado às 15:50" : "Campanha encerrada" : `${lot.discount}% de desconto até ${lot.end}`}</p>
            <p className="mt-1 text-sm text-brand-dark/75">{lot.status === "upcoming" ? testSchedule ? "Prévia dos preços do primeiro lote." : "Prévia dos preços do primeiro lote. A campanha vai até 30/11." : lot.status === "ended" ? "Os preços abaixo são do último lote da campanha." : `Lote atual: ${lot.coupon}. Os preços mudam na próxima virada de lote.`}</p>
            {lot.nextChange && <p className="mt-3 text-sm font-semibold tabular-nums">{lot.status === "upcoming" ? "Começa em" : "Próxima virada em"} <time className="ml-1 font-black" dateTime={lot.nextChange}>{clock(secondsLeft)}</time></p>}
          </div>

          <div className="mb-10 mt-9 flex flex-col items-center gap-5">
            <div className="grid w-full max-w-3xl gap-2 sm:grid-cols-3" aria-label="Produto">
              {products.map((item) => (
                <button key={item.id} type="button" aria-pressed={product === item.id} onClick={() => { setProduct(item.id); setRecommendedPlan(null); }} className={`flex min-h-14 items-center gap-3 rounded-2xl px-4 text-left text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark ${product === item.id ? "bg-brand-yellow text-brand-dark" : "bg-white text-brand-dark hover:bg-brand-yellow/15"}`}>
                  <img src={item.logo} alt="" className="h-7 w-8 shrink-0 object-contain" />{item.label}
                </button>
              ))}
            </div>
            <div className={`grid w-full max-w-5xl items-end gap-6 ${product === "pages" ? "max-w-lg" : "lg:grid-cols-2"}`}>
              {product !== "pages" && (
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
                <fieldset className="relative grid min-h-14 grid-cols-3 items-center rounded-2xl bg-white p-1">
                  <legend className="sr-only">Período de contratação</legend>
                  <span className="absolute -top-2 right-2 -translate-y-full rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase text-white sm:text-xs">2 meses grátis</span>
                  {periods.map((item) => (
                    <button key={item.id} type="button" aria-pressed={period === item.id} onClick={() => setPeriod(item.id)} className={`min-h-11 min-w-0 rounded-xl px-2 text-sm font-bold focus-visible:outline-2 focus-visible:outline-brand-dark sm:px-4 sm:text-base ${period === item.id ? "bg-brand-yellow text-brand-dark" : "text-brand-dark/65 hover:bg-brand-yellow/10"}`}>{item.label}</button>
                  ))}
                </fieldset>
              </div>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between md:hidden">
            <span className="text-sm font-semibold text-brand-dark" aria-live="polite">Plano {activeCard + 1} de {plans.length}</span>
            <div className="flex gap-2" aria-label="Navegação dos planos">
              <button type="button" aria-label="Ver plano anterior" disabled={activeCard === 0} onClick={() => scrollToCard(activeCard - 1)} className="grid size-11 place-items-center rounded-full bg-white text-brand-dark disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-brand-dark"><ChevronLeft size={20} /></button>
              <button type="button" aria-label="Ver próximo plano" disabled={activeCard === plans.length - 1} onClick={() => scrollToCard(activeCard + 1)} className="grid size-11 place-items-center rounded-full bg-white text-brand-dark disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-brand-dark"><ChevronRight size={20} /></button>
            </div>
          </div>

          <div id="planos-valores" ref={carouselRef} onScroll={updateActiveCard} className="flex snap-x snap-mandatory items-start gap-4 overflow-x-auto pb-3 pt-4 scroll-mt-24 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 md:overflow-visible md:pb-0 md:pt-0 xl:grid-cols-4">
            {plans.map((name, index) => {
              const original = prices[product][selectedTier][period][name.toLowerCase()];
              const parcel = discounted(original.parcel, lot.discount);
              const cash = original.cash === undefined ? undefined : discounted(original.cash, lot.discount);
              const count = periods.find((item) => item.id === period)!.installments;
              const saving = cash === undefined ? 0 : Math.round((1 - cash / (parcel * count)) * 100);
              const featured = index === 1;
              const unlimited = index === plans.length - 1;
              return (
                <article key={name} className={`relative flex min-w-full snap-start flex-col rounded-2xl bg-white p-5 shadow-[0_12px_32px_rgba(0,0,0,0.07)] md:min-w-0 ${featured ? "ring-2 ring-brand-yellow" : ""} ${unlimited ? "ring-2 ring-emerald-500/70" : ""} ${recommendedPlan === name ? "outline-2 outline-offset-4 outline-brand-yellow" : ""}`}>
                  {featured && <span className="absolute -top-3 left-4 rounded-full bg-brand-yellow px-3 py-1 text-xs font-black uppercase text-brand-dark">Mais escolhido</span>}
                  {unlimited && <span className="absolute -top-3 right-4 rounded-full bg-emerald-500 px-3 py-1 text-xs font-black uppercase text-white">Sem limites</span>}
                  {recommendedPlan === name && <span className="absolute right-5 top-5 rounded-full bg-brand-dark px-3 py-1 text-xs font-black text-white">Indicado para você</span>}
                  <h3 className="mt-3 text-3xl font-black text-brand-dark">{name}</h3>
                  <p className="mt-2 min-h-12 text-sm leading-5 text-brand-dark/65">{productInfo.description[index]}</p>
                  <div className="mt-5 min-h-32 tabular-nums">
                    {count > 1 && <span className="text-sm font-black text-brand-dark">{count}x</span>}
                    <p className="flex flex-wrap items-baseline gap-x-1"><strong className="text-4xl font-black tracking-tight text-brand-dark">{currency(parcel)}</strong>{count === 1 && <span className="text-sm text-brand-dark/65">/mês</span>}</p>
                    {cash !== undefined ? <p className="mt-2 text-sm text-brand-dark/75">ou <strong className="text-brand-dark">{currency(cash)}</strong> à vista</p> : <p className="mt-2 text-sm text-brand-dark/65">Cobrança mensal</p>}
                    {saving > 0 && <span className="mt-3 inline-block rounded-full bg-brand-yellow/15 px-3 py-1 text-xs font-bold text-brand-dark">Economize {saving}% pagando à vista</span>}
                  </div>
                  <details className="group border-t border-brand-dark/10">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-bold text-brand-dark/75 hover:text-brand-dark focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-brand-dark [&::-webkit-details-marker]:hidden">
                      <span><span className="group-open:hidden">Veja mais</span><span className="hidden group-open:inline">Veja menos</span></span>
                      <ChevronDown aria-hidden="true" className="size-5 transition-transform group-open:rotate-180" />
                    </summary>
                    <PlanDetails product={product} index={index} networkCount={networkCount} tier={tier} />
                    <OfferButton link={checkoutLinks[`${product}/${selectedTier}/${period}/${name.toLowerCase()}`]} coupon={lot.coupon} status={available} label={`Assinar ${name}`} />
                    <p className="mt-3 text-center text-xs text-brand-dark/55">{count === 1 ? "Cobrança mensal" : `${count}x sem juros ou à vista com desconto`}</p>
                  </details>
                </article>
              );
            })}
          </div>
          <div className="mt-3 flex justify-center gap-2 md:hidden" aria-label="Selecionar plano">
            {plans.map((name, index) => <button key={name} type="button" aria-label={`Ver plano ${name}`} aria-current={activeCard === index ? "true" : undefined} onClick={() => scrollToCard(index)} className={`h-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-brand-dark ${activeCard === index ? "w-8 bg-brand-yellow" : "w-2.5 bg-brand-dark/25"}`} />)}
          </div>

          <p className="mx-auto mt-10 max-w-4xl text-center text-sm leading-relaxed text-brand-dark/75">Assinantes ativos dos planos Camundongo, Rato, Ratazana ou Ratazana Plus fazem o upgrade direto na <a href="https://ratoeirahub.com/" className="font-bold underline underline-offset-2">plataforma</a>, onde têm condições exclusivas e melhores que as desta página.</p>
          <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-relaxed text-brand-dark/70">O evento presencial é oferecido depois da compra aprovada e pode ser adquirido com um único clique, sem digitar novamente os dados de pagamento.</p>
        </div>
      </section>

      <section className="bg-white px-4 py-14 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-black text-brand-dark md:text-3xl">Prefere acesso vitalício?</h2>
          <p className="mt-2 text-sm text-brand-dark/70">Condição vitalícia com pagamento parcelado ou à vista.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2" aria-label="Produto vitalício">
            {products.map((item) => <button key={item.id} type="button" aria-pressed={product === item.id} onClick={() => setProduct(item.id)} className={`rounded-full px-4 py-2 text-sm font-bold ${product === item.id ? "bg-brand-yellow text-brand-dark" : "bg-brand-lighter text-brand-dark"}`}>{item.label}</button>)}
          </div>
          {product !== "pages" && <p className="mt-4 text-sm text-brand-dark/65">O vitalício de Ads e Hub dá direito a 3 redes.</p>}
          {(() => {
            const price = lifetime[product][selectedTier][lot.index];
            return <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-brand-lighter p-6"><p className="text-sm font-bold text-brand-dark/65">{productInfo.label} Vitalício</p><strong className="mt-3 block text-3xl font-black text-brand-dark">{currency(price.parcel)}</strong><p className="mt-2 text-sm text-brand-dark/75">ou <strong>{currency(price.cash ?? price.parcel)} à vista</strong></p><OfferButton link={checkoutLinks[`${product}/${selectedTier}/vitalicio`]} coupon={null} status={available} label="Assinar vitalício" /></div>;
          })()}
        </div>
      </section>
    </>
  );
}
