import { useState } from "react";
import { ArrowLeft, ArrowRight, Minus, Plus } from "lucide-react";
import priceData from "../data/black-friday-prices.json";
import { currentLot, discounted } from "../lib/blackFriday";
import {
  accountLimits,
  googleEmailLimits,
  networkTier,
  plans,
  recommendPlan,
  salesLimits,
  salesOptions,
  supportsAdAccounts,
  visitLimits,
  visitOptions,
  type AccountNetwork,
  type Network,
  type Product,
} from "../lib/planCalculator";
import OfferButton from "./OfferButton";

type Step = "payment" | "product" | "networks" | "volume" | "accounts" | "emails" | "result";
type Payment = "lifetime" | "discount";
type Period = "mensal" | "semestral" | "anual";
type Price = { parcel: number; cash?: number };
type LifetimeTier = "1" | "2" | "all" | "single";

const productLabels: Record<Product, string> = {
  ads: "Ratoeira Ads",
  pages: "Ratoeira Pages",
  hub: "Ratoeira Hub",
};
const productDescriptions: Record<Product, string> = {
  ads: "Rastrear minhas campanhas",
  pages: "Criar minhas páginas",
  hub: "As duas coisas",
};
const networks: { id: Network; label: string; logo: string }[] = [
  { id: "google", label: "Google Ads", logo: "/assets/platforms/google-ads.webp" },
  { id: "meta", label: "Meta Ads", logo: "/assets/platforms/meta.svg" },
  { id: "taboola", label: "Taboola", logo: "/assets/platforms/taboola.png" },
  { id: "newsbreak", label: "NewsBreak", logo: "/assets/platforms/newsbreak.svg" },
  { id: "mgid", label: "MGID", logo: "/assets/platforms/mgid.svg" },
  { id: "tiktok", label: "TikTok Ads", logo: "/assets/platforms/tiktok.svg" },
  { id: "revcontent", label: "RevContent", logo: "/assets/platforms/revcontent.svg" },
];
const prices = priceData.prices as Record<string, Record<string, Record<string, Record<string, Price>>>>;
const lifetimePrices = priceData.vitalicio as Record<Product, Partial<Record<LifetimeTier, Price[]>>>;
const periods: { id: Period; label: string; installments: number }[] = [
  { id: "mensal", label: "Mensal", installments: 1 },
  { id: "semestral", label: "Semestral", installments: 6 },
  { id: "anual", label: "Anual", installments: 12 },
];
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });

function stepsFor(payment: Payment | null, product: Product, selected: Network[]): Step[] {
  if (!payment) return ["payment"];
  if (payment === "lifetime") return ["payment", "product", "result"];
  if (product === "pages") return ["payment", "product", "volume", "result"];
  const steps: Step[] = ["payment", "product", "networks", "volume"];
  if (selected.some(supportsAdAccounts)) steps.push("accounts");
  if (selected.includes("google")) steps.push("emails");
  return [...steps, "result"];
}

function Quantity({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  const update = (next: number) => onChange(Math.min(999, Math.max(1, next)));
  return (
    <div className="flex min-h-16 items-center justify-between gap-3 rounded-2xl bg-white px-4 py-2">
      <span className="text-sm font-semibold text-brand-dark">{label}</span>
      <div className="flex shrink-0 items-center gap-1">
        <button type="button" aria-label={`Diminuir ${label}`} onClick={() => update(value - 1)} className="grid size-10 place-items-center rounded-full text-brand-dark hover:bg-brand-yellow/15 focus-visible:outline-2 focus-visible:outline-brand-yellow"><Minus size={16} /></button>
        <input aria-label={`Quantidade de ${label}`} inputMode="numeric" min={1} max={999} value={value} onChange={(event) => update(Number(event.target.value.replace(/\D/g, "")) || 1)} className="w-10 bg-transparent text-center font-bold tabular-nums text-brand-dark outline-none sm:w-12" />
        <button type="button" aria-label={`Aumentar ${label}`} onClick={() => update(value + 1)} className="grid size-10 place-items-center rounded-full text-brand-dark hover:bg-brand-yellow/15 focus-visible:outline-2 focus-visible:outline-brand-yellow"><Plus size={16} /></button>
      </div>
    </div>
  );
}

export default function PlanCalculator({
  lot,
  onSelect,
}: {
  lot: ReturnType<typeof currentLot>;
  onSelect: (product: Product, network: "1" | "2" | "all", period: Period | "vitalicio", plan: string) => void;
}) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [product, setProduct] = useState<Product>("hub");
  const [productChosen, setProductChosen] = useState(false);
  const [selectedNetworks, setSelectedNetworks] = useState<Network[]>([]);
  const [volume, setVolume] = useState<number | null>(null);
  const [accounts, setAccounts] = useState<Record<AccountNetwork, number>>({ google: 1, meta: 1, taboola: 1, newsbreak: 1 });
  const [googleEmails, setGoogleEmails] = useState(1);
  const [stepIndex, setStepIndex] = useState(0);
  const steps = stepsFor(payment, product, selectedNetworks);
  const currentIndex = Math.min(stepIndex, payment === "discount" && volume === null ? steps.indexOf("volume") : steps.length - 1);
  const step = steps[currentIndex];
  const questionCount = payment ? steps.length - 1 : 1;
  const progress = step === "result" ? 100 : payment ? Math.round((currentIndex / questionCount) * 100) : 0;
  const recommended = recommendPlan(product, selectedNetworks, volume ?? 0, accounts, googleEmails);
  const tier = product === "pages" ? "single" : networkTier(selectedNetworks.length);
  const plan = plans[recommended];
  const selectedPrices = prices[product][tier];
  const volumeOptions = product === "pages" ? visitOptions : salesOptions;
  const lifetimeChoices: { tier: LifetimeTier; label: string; description: string }[] = product === "pages"
    ? [{ tier: "single", label: "Scale", description: "Ratoeira Pages sem renovação de assinatura." }]
    : [
      { tier: "1", label: "Scale 1 rede", description: "Uma rede de tráfego ao mesmo tempo." },
      { tier: "2", label: "Scale 2 redes", description: "Duas redes de tráfego ao mesmo tempo." },
      { tier: "all", label: "Scale todas as redes", description: "Todas as redes de tráfego disponíveis." },
    ];

  const choiceClass = (active: boolean) => `min-h-16 w-full rounded-2xl px-5 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow ${active ? "bg-brand-yellow text-brand-dark" : "bg-white text-brand-dark hover:bg-brand-yellow/15"}`;
  const summary: { step: Step; label: string }[] = [
    ...(payment ? [{ step: "payment" as Step, label: payment === "lifetime" ? "Vitalício" : "Plano com desconto" }] : []),
    ...(productChosen ? [{ step: "product" as Step, label: productLabels[product] }] : []),
    ...(payment !== "discount" || product === "pages" ? [] : [{ step: "networks" as Step, label: selectedNetworks.map((id) => networks.find((item) => item.id === id)?.label).join(", ") }]),
    ...(payment !== "discount" || volume === null ? [] : [{ step: "volume" as Step, label: volumeOptions[volume] }]),
    ...(payment !== "discount" || product === "pages" || !selectedNetworks.some(supportsAdAccounts) ? [] : [{ step: "accounts" as Step, label: "Contas de anúncio" }]),
    ...(payment === "discount" && selectedNetworks.includes("google") ? [{ step: "emails" as Step, label: `${googleEmails} ${googleEmails === 1 ? "e-mail" : "e-mails"} do Google` }] : []),
  ].filter((item) => item.label && steps.includes(item.step) && steps.indexOf(item.step) < currentIndex);

  return (
    <section id="calculadora" className="bg-white px-4 py-16 text-brand-dark md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black tracking-tight md:text-5xl">Descubra o plano certo para você</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-brand-dark/70">Responda algumas perguntas e veja a recomendação com os preços da Black Friday.</p>
        </div>
        <div className="rounded-3xl bg-brand-lighter p-5 ring-[3px] ring-brand-yellow shadow-[0_30px_70px_rgba(23,23,23,0.22)] sm:p-8">
          <div className="mb-7 flex items-center justify-between gap-4 text-sm font-semibold">
            <span>{step === "result" ? "Resultado" : `Etapa ${currentIndex + 1}${payment && currentIndex > 1 ? ` de ${questionCount}` : ""}`}</span>
            <span className="text-brand-dark">{progress}%</span>
          </div>
          <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-brand-dark/10" aria-hidden="true">
            <div className="h-full rounded-full bg-brand-yellow transition-[width]" style={{ width: `${progress}%` }} />
          </div>

          {summary.length > 0 && (
            <div className="mb-7 flex flex-wrap gap-2" aria-label="Respostas anteriores">
              {summary.map((item) => (
                <button key={item.step} type="button" onClick={() => setStepIndex(steps.indexOf(item.step))} className="rounded-full bg-white px-3 py-2 text-left text-xs font-semibold text-brand-dark hover:bg-brand-yellow/15 focus-visible:outline-2 focus-visible:outline-brand-yellow">
                  {item.label} <span className="ml-1 text-brand-dark/60">editar</span>
                </button>
              ))}
            </div>
          )}

          {step === "payment" && (
            <fieldset>
              <legend className="mb-2 text-2xl font-black">Vitalício ou desconto no plano?</legend>
              <p className="mb-6 text-sm text-brand-dark/70">As duas condições existem na Black. A escolha muda os preços que você vai ver no fim.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" aria-pressed={payment === "lifetime"} onClick={() => { setPayment("lifetime"); setStepIndex(1); }} className={choiceClass(payment === "lifetime")}>
                  <strong className="block">Quero o vitalício</strong><span className="mt-1 block text-sm opacity-80">Pago uma vez e nunca mais renovo</span>
                </button>
                <button type="button" aria-pressed={payment === "discount"} onClick={() => { setPayment("discount"); setStepIndex(1); }} className={choiceClass(payment === "discount")}>
                  <strong className="block">Quero desconto no plano vigente</strong><span className="mt-1 block text-sm opacity-80">Mensal, semestral ou anual com o desconto do lote</span>
                </button>
              </div>
            </fieldset>
          )}

          {step === "product" && (
            <fieldset>
              <legend className="mb-2 text-2xl font-black">{payment === "lifetime" ? "Vitalício de qual produto?" : "O que você precisa?"}</legend>
              <p className="mb-6 text-sm text-brand-dark/70">{payment === "lifetime" ? "Escolha o produto para ver as opções de acesso vitalício." : "Escolha o produto que melhor representa sua operação."}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {(["ads", "pages", "hub"] as Product[]).map((item) => (
                  <button key={item} type="button" aria-pressed={productChosen && product === item} onClick={() => { setProduct(item); setProductChosen(true); setSelectedNetworks([]); setVolume(null); setStepIndex(2); }} className={choiceClass(productChosen && product === item)}>
                    <strong className="block">{productLabels[item]}</strong><span className="mt-1 block text-sm opacity-80">{productDescriptions[item]}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {step === "networks" && (
            <fieldset>
              <legend className="mb-2 text-2xl font-black">Em quais redes você anuncia ao mesmo tempo?</legend>
              <p className="mb-6 text-sm text-brand-dark/70">Marque todas as redes que fazem parte da sua operação.</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {networks.map((network) => {
                  const active = selectedNetworks.includes(network.id);
                  return (
                    <button key={network.id} type="button" aria-label={network.label} aria-pressed={active} onClick={() => setSelectedNetworks((current) => active ? current.filter((id) => id !== network.id) : [...current, network.id])} className={choiceClass(active)}>
                      <span className="flex items-center gap-3"><img src={network.logo} alt="" className={`h-7 w-10 object-contain ${network.id === "taboola" ? "scale-125" : ""}`} /><span className="font-semibold">{network.label}</span></span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {step === "volume" && (
            <fieldset>
              <legend className="mb-2 text-2xl font-black">{product === "pages" ? "Quantos acessos suas páginas recebem por mês?" : "Quantas vendas aprovadas você faz por mês?"}</legend>
              <p className="mb-6 text-sm text-brand-dark/70">Escolha a faixa mais próxima do seu volume atual.</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {volumeOptions.map((option, index) => <button key={option} type="button" aria-pressed={volume === index} onClick={() => setVolume(index)} className={choiceClass(volume === index)}>{option}</button>)}
              </div>
            </fieldset>
          )}

          {step === "accounts" && (
            <fieldset>
              <legend className="mb-2 text-2xl font-black">Quantas contas de anúncio você usa em cada rede?</legend>
              <p className="mb-6 text-sm text-brand-dark/70">Se não souber o número exato, use uma estimativa.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {selectedNetworks.filter(supportsAdAccounts).map((id) => (
                  <Quantity key={id} label={networks.find((item) => item.id === id)?.label ?? id} value={accounts[id]} onChange={(value) => setAccounts((current) => ({ ...current, [id]: value }))} />
                ))}
              </div>
              {selectedNetworks.some((id) => !supportsAdAccounts(id)) && <p className="mt-5 rounded-2xl bg-brand-yellow/15 p-4 text-sm leading-relaxed text-brand-dark/80">MGID, TikTok Ads e RevContent usam envio de eventos e não exigem integração de contas de anúncio.</p>}
            </fieldset>
          )}

          {step === "emails" && (
            <fieldset>
              <legend className="mb-2 text-2xl font-black">Quantos e-mails diferentes você usa no Google Ads?</legend>
              <p className="mb-6 text-sm text-brand-dark/70">Conte cada e-mail com acesso às suas contas do Google Ads.</p>
              <div className="max-w-lg"><Quantity label="E-mails do Google Ads" value={googleEmails} onChange={setGoogleEmails} /></div>
            </fieldset>
          )}

          {step === "result" && payment === "lifetime" && (
            <div aria-live="polite">
              <h3 className="text-2xl font-black md:text-3xl">Escolha seu <span className="underline decoration-brand-yellow decoration-4 underline-offset-4">{productLabels[product]} Vitalício</span></h3>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-brand-dark/75">Pagamento único, sem renovação. {product === "pages" ? "Confira o acesso vitalício à Ratoeira Pages." : "Compare as opções Scale com 1, 2 ou todas as redes de tráfego."}</p>
              <div className={`mt-6 grid gap-4 ${product === "pages" ? "max-w-lg" : "md:grid-cols-3"}`}>
                {lifetimeChoices.map((choice) => {
                  const price = lifetimePrices[product][choice.tier]![lot.index];
                  return (
                    <article key={choice.tier} className={`relative flex flex-col rounded-2xl bg-white p-5 text-brand-dark ${choice.tier === "all" ? "ring-2 ring-emerald-500/70" : ""}`}>
                      {choice.tier === "all" && <span className="absolute -top-3 right-4 rounded-full bg-emerald-500 px-3 py-1 text-xs font-black uppercase text-white">GANHA INGRESSO DO EVENTO</span>}
                      <h4 className="text-lg font-black">{choice.label}</h4>
                      <p className="mt-2 text-sm text-brand-dark/70">{choice.description}</p>
                      {lot.status !== "ended" ? (
                        <div className="mt-4 tabular-nums">
                          <p className="text-sm font-black">Pagamento único</p>
                          <p className="text-2xl font-black">{money.format(price.parcel)}</p>
                          {price.cash !== undefined && <p className="mt-2 text-sm">ou <strong>{money.format(price.cash)} à vista</strong></p>}
                        </div>
                      ) : <p className="mt-4 text-sm text-brand-dark/70">Oferta encerrada.</p>}
                      <div className="mt-auto pt-6">
                        <button type="button" onClick={() => onSelect(product, choice.tier === "single" ? "1" : choice.tier, "vitalicio", "Vitalício")} className="mb-4 flex min-h-10 items-center gap-2 text-left text-sm font-bold text-brand-dark underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-brand-yellow"><Plus aria-hidden="true" className="size-4 shrink-0" /> Ver todos os limites desse plano</button>
                        <OfferButton />
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {step === "result" && payment === "discount" && volume !== null && (
            <div aria-live="polite">
              <h3 className="text-2xl font-black md:text-3xl">Plano indicado: <span className="underline decoration-brand-yellow decoration-4 underline-offset-4">{productLabels[product]} {plan}</span></h3>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-brand-dark/75">A indicação considera {product === "pages" ? "os acessos mensais" : "as vendas mensais, as redes e os limites de contas informados"}. {lot.appliedDiscount > 0 ? `Os valores abaixo incluem ${lot.appliedDiscount}% de desconto do lote atual.` : "Os valores abaixo estão sem desconto."}</p>
              {volume === volumeOptions.length - 1 && <p className="mt-3 rounded-xl bg-brand-yellow/15 p-3 text-sm text-brand-dark">Seu volume ultrapassa o limite incluído no Max. Consulte as condições para volumes maiores.</p>}
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {periods.map((period) => {
                  const price = selectedPrices[period.id][plan.toLowerCase()];
                  const parcel = discounted(price.parcel, lot.appliedDiscount);
                  const cash = price.cash === undefined ? undefined : discounted(price.cash, lot.appliedDiscount);
                  return (
                    <article key={period.id} className={`flex flex-col rounded-2xl p-5 ${period.id === "anual" ? "bg-brand-yellow text-brand-dark" : "bg-white text-brand-dark"}`}>
                      <h4 className="text-sm font-black uppercase tracking-wide">{period.label}</h4>
                      {lot.appliedDiscount > 0 && <p className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-brand-dark/60"><span>De <s>{period.installments > 1 ? `${period.installments}x ` : ""}{money.format(price.parcel)}{period.installments === 1 ? "/mês" : ""}</s></span><span className="rounded-full bg-emerald-100 px-2 py-0.5 font-black text-emerald-700">{lot.appliedDiscount}% OFF</span></p>}
                      <p className={`${lot.appliedDiscount > 0 ? "mt-2" : "mt-4"} text-2xl font-black tabular-nums`}>{period.installments > 1 ? `${period.installments}x ` : ""}{money.format(parcel)}{period.installments === 1 ? "/mês" : ""}</p>
                      {cash !== undefined && <p className="mt-2 text-sm">ou <strong>{money.format(cash)} à vista</strong></p>}
                      <div className="mt-auto pt-6">
                        <button type="button" onClick={() => onSelect(product, tier === "single" ? "1" : tier, period.id, plan)} className="mb-4 flex min-h-10 items-center gap-2 text-left text-sm font-bold text-brand-dark underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-brand-dark"><Plus aria-hidden="true" className="size-4 shrink-0" /> Ver todos os limites desse plano</button>
                        <OfferButton />
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="mt-6 grid gap-2 text-sm text-brand-dark/75 sm:grid-cols-2">
                {product !== "pages" && <p>Até {salesLimits[recommended]} vendas aprovadas por mês{selectedNetworks.includes("google") ? ` · ${googleEmailLimits[recommended] >= 999 ? "E-mails ilimitados" : `${googleEmailLimits[recommended]} e-mails do Google Ads`}` : ""}.</p>}
                {product !== "ads" && <p>Até {visitLimits[recommended]} acessos mensais em Pages.</p>}
                {product !== "pages" && selectedNetworks.filter(supportsAdAccounts).map((id) => <p key={id}>{networks.find((item) => item.id === id)?.label}: {accountLimits[id][recommended] >= 999 ? "contas ilimitadas" : `até ${accountLimits[id][recommended]} contas`}.</p>)}
              </div>
            </div>
          )}

          {step !== "result" && (
            <div className="mt-8 flex gap-3 border-t border-brand-dark/10 pt-6">
              <button type="button" disabled={currentIndex === 0} onClick={() => setStepIndex(currentIndex - 1)} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-white px-5 font-bold text-brand-dark disabled:cursor-not-allowed disabled:opacity-40 hover:bg-brand-yellow/15 focus-visible:outline-2 focus-visible:outline-brand-yellow"><ArrowLeft size={17} /> Voltar</button>
              <button type="button" disabled={(step === "payment" && payment === null) || (step === "product" && !productChosen) || (step === "networks" && selectedNetworks.length === 0) || (step === "volume" && volume === null)} onClick={() => setStepIndex(currentIndex + 1)} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-brand-yellow px-5 font-black text-brand-dark disabled:cursor-not-allowed disabled:opacity-40 hover:bg-brand-yellow-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow">Continuar <ArrowRight size={17} /></button>
            </div>
          )}
        </div>
        <div className="mx-auto mt-6 grid max-w-4xl gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-brand-dark/10 bg-brand-lighter p-5 text-sm leading-relaxed text-brand-dark/80">
            <strong className="mb-1 block text-brand-dark">Já é assinante?</strong>
            Quem está nos planos Camundongo, Rato, Ratazana ou Ratazana Plus faz o upgrade direto na <a href="https://ratoeirahub.com/" className="font-bold underline underline-offset-2">plataforma</a>, com condições exclusivas e melhores que as desta página.
          </div>
          <div className="rounded-2xl border border-brand-dark/10 bg-brand-lighter p-5 text-sm leading-relaxed text-brand-dark/80">
            <strong className="mb-1 block text-brand-dark">Evento presencial</strong>
            Oferecido depois da compra aprovada e adquirido com um clique, sem digitar os dados de pagamento de novo.
          </div>
        </div>
      </div>
    </section>
  );
}
