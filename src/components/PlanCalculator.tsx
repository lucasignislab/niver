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

type Step = "product" | "networks" | "volume" | "accounts" | "emails" | "result";
type Period = "mensal" | "semestral" | "anual";
type Price = { parcel: number; cash?: number };

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
const periods: { id: Period; label: string; installments: number }[] = [
  { id: "mensal", label: "Mensal", installments: 1 },
  { id: "semestral", label: "Semestral", installments: 6 },
  { id: "anual", label: "Anual", installments: 12 },
];
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });

function stepsFor(product: Product, selected: Network[]): Step[] {
  if (product === "pages") return ["product", "volume", "result"];
  const steps: Step[] = ["product", "networks", "volume"];
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
  onSelect: (product: Product, network: "1" | "2" | "all", period: Period, plan: string) => void;
}) {
  const [product, setProduct] = useState<Product>("hub");
  const [selectedNetworks, setSelectedNetworks] = useState<Network[]>([]);
  const [volume, setVolume] = useState<number | null>(null);
  const [accounts, setAccounts] = useState<Record<AccountNetwork, number>>({ google: 1, meta: 1, taboola: 1, newsbreak: 1 });
  const [googleEmails, setGoogleEmails] = useState(1);
  const [stepIndex, setStepIndex] = useState(0);
  const steps = stepsFor(product, selectedNetworks);
  const currentIndex = Math.min(stepIndex, volume === null ? steps.indexOf("volume") : steps.length - 1);
  const step = steps[currentIndex];
  const recommended = recommendPlan(product, selectedNetworks, volume ?? 0, accounts, googleEmails);
  const tier = product === "pages" ? "single" : networkTier(selectedNetworks.length);
  const plan = plans[recommended];
  const selectedPrices = prices[product][tier];
  const volumeOptions = product === "pages" ? visitOptions : salesOptions;

  const choiceClass = (active: boolean) => `min-h-16 w-full rounded-2xl px-5 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow ${active ? "bg-brand-yellow text-brand-dark" : "bg-white text-brand-dark hover:bg-brand-yellow/15"}`;
  const summary: { step: Step; label: string }[] = [
    { step: "product", label: productLabels[product] },
    ...(product === "pages" ? [] : [{ step: "networks" as Step, label: selectedNetworks.map((id) => networks.find((item) => item.id === id)?.label).join(", ") }]),
    ...(volume === null ? [] : [{ step: "volume" as Step, label: volumeOptions[volume] }]),
    ...(product === "pages" || !selectedNetworks.some(supportsAdAccounts) ? [] : [{ step: "accounts" as Step, label: "Contas de anúncio" }]),
    ...(selectedNetworks.includes("google") ? [{ step: "emails" as Step, label: `${googleEmails} ${googleEmails === 1 ? "e-mail" : "e-mails"} do Google` }] : []),
  ].filter((item) => item.label && steps.includes(item.step) && steps.indexOf(item.step) < currentIndex);

  return (
    <section id="calculadora" className="bg-white px-4 py-16 text-brand-dark md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black tracking-tight md:text-5xl">Descubra o plano certo para você</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-brand-dark/70">Responda algumas perguntas e veja a recomendação com os preços da Black Friday.</p>
        </div>
        <div className="rounded-3xl bg-brand-lighter p-5 shadow-[0_18px_48px_rgba(0,0,0,0.08)] sm:p-8">
          <div className="mb-7 flex items-center justify-between gap-4 text-sm font-semibold">
            <span>Etapa {currentIndex + 1} de {steps.length}</span>
            <span className="text-brand-dark">{Math.round(((currentIndex + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-brand-dark/10" aria-hidden="true">
            <div className="h-full rounded-full bg-brand-yellow transition-[width]" style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }} />
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

          {step === "product" && (
            <fieldset>
              <legend className="mb-2 text-2xl font-black">O que você precisa?</legend>
              <p className="mb-6 text-sm text-brand-dark/70">Escolha o produto que melhor representa sua operação.</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {(["ads", "pages", "hub"] as Product[]).map((item) => (
                  <button key={item} type="button" aria-pressed={product === item} onClick={() => setProduct(item)} className={choiceClass(product === item)}>
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

          {step === "result" && volume !== null && (
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
                      <p className="mt-4 text-2xl font-black tabular-nums">{period.installments > 1 ? `${period.installments}x ` : ""}{money.format(parcel)}{period.installments === 1 ? "/mês" : ""}</p>
                      {cash !== undefined && <p className="mt-2 text-sm">ou <strong>{money.format(cash)} à vista</strong></p>}
                      <button type="button" onClick={() => onSelect(product, tier === "single" ? "1" : tier, period.id, plan)} className={`mt-6 min-h-11 rounded-full px-4 text-sm font-black uppercase focus-visible:outline-2 focus-visible:outline-offset-2 ${period.id === "anual" ? "bg-brand-dark text-white focus-visible:outline-brand-dark" : "bg-brand-yellow text-brand-dark focus-visible:outline-brand-yellow"}`}>Ver plano <ArrowRight className="ml-1 inline size-4" /></button>
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
              <button type="button" disabled={(step === "networks" && selectedNetworks.length === 0) || (step === "volume" && volume === null)} onClick={() => setStepIndex(currentIndex + 1)} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-brand-yellow px-5 font-black text-brand-dark disabled:cursor-not-allowed disabled:opacity-40 hover:bg-brand-yellow-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow">Continuar <ArrowRight size={17} /></button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
