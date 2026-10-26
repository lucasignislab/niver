import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { currentLot, type CampaignStatus } from "../lib/blackFriday";
import { checkoutUrl } from "../lib/checkout";
import type { Product } from "../lib/planCalculator";

export default function OfferButton({ link, coupon, status, label, product, buttonClassName, allowPreview = false }: { link?: string; coupon: string | null; status: CampaignStatus; label: ReactNode; product: Product; buttonClassName?: string; allowPreview?: boolean }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedBilling, setAcceptedBilling] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const availableLink = status === "active" && link;
  const termsHref = product === "ads" ? "/termos-de-uso" : product === "pages" ? "/termos-de-uso-ratoeira-pages" : "/termos-de-uso-ratoeira-combo-ads-pages";
  if (!link || status === "ended" || (status === "upcoming" && !allowPreview)) return <button type="button" disabled className="mt-6 min-h-12 w-full rounded-full bg-brand-dark/10 px-4 text-sm font-black text-brand-dark/50">{status === "upcoming" && link ? "Disponível quando o contador zerar" : status === "ended" ? "Campanha encerrada" : "Checkout em preparação"}</button>;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!acceptedTerms || !acceptedBilling) return;
    const fullName = name.trim().replace(/\s+/g, " ");
    const digits = whatsapp.replace(/\D/g, "");
    const phone = digits.startsWith("55") && digits.length > 11 ? digits.slice(2) : digits;
    if (!fullName.includes(" ")) {
      setError("Informe nome e sobrenome.");
      nameRef.current?.focus();
      return;
    }
    if (!/^\d{10,11}$/.test(phone)) {
      setError("Informe um WhatsApp com DDD válido.");
      phoneRef.current?.focus();
      return;
    }
    const latest = currentLot(new Date());
    if (latest.status !== "active" || !availableLink) {
      setError("Esta oferta não está disponível neste momento.");
      return;
    }
    window.location.assign(checkoutUrl(availableLink, coupon === null ? null : latest.coupon, { name: fullName, email: email.trim(), phone }, window.location.href));
  };

  return (
    <>
      <button type="button" aria-haspopup="dialog" onClick={() => { dialogRef.current?.showModal(); nameRef.current?.focus(); }} className={buttonClassName ?? "mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand-yellow px-4 text-center text-sm font-black text-brand-dark hover:bg-brand-yellow-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark"}>{label}</button>
      <dialog ref={dialogRef} aria-label="Seus dados para o checkout" onClose={() => { setError(""); setAcceptedTerms(false); setAcceptedBilling(false); }} className="m-auto max-h-[90vh] w-[min(92vw,460px)] overflow-y-auto rounded-2xl bg-white p-6 text-brand-dark shadow-2xl backdrop:bg-black/60 md:p-8">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-brand-dark">Seus dados para o checkout</h3>
            <p className="mt-1 text-sm text-brand-dark/65">Preencha para continuar na Guru.</p>
            {status === "upcoming" && <p className="mt-2 text-sm font-semibold text-brand-dark">O checkout ficará disponível quando o contador zerar.</p>}
          </div>
          <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Fechar" className="rounded-full px-2 py-1 text-xl text-brand-dark/60 hover:bg-brand-dark/10 focus-visible:outline-2 focus-visible:outline-brand-yellow">×</button>
        </div>
        <form onSubmit={submit} className="grid gap-4">
          <label className="grid gap-1 text-xs font-bold text-brand-dark/75">Nome completo
            <input ref={nameRef} type="text" autoComplete="name" required value={name} onChange={(event) => { setName(event.target.value); setError(""); }} className="min-h-11 w-full rounded-xl border border-brand-dark/20 bg-white px-3 text-sm text-brand-dark focus-visible:outline-2 focus-visible:outline-brand-yellow" />
          </label>
          <label className="grid gap-1 text-xs font-bold text-brand-dark/75">E-mail
            <input type="email" autoComplete="email" required value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} className="min-h-11 w-full rounded-xl border border-brand-dark/20 bg-white px-3 text-sm text-brand-dark focus-visible:outline-2 focus-visible:outline-brand-yellow" />
          </label>
          <label className="grid gap-1 text-xs font-bold text-brand-dark/75">WhatsApp com DDD
            <input ref={phoneRef} type="tel" inputMode="tel" autoComplete="tel-national" required placeholder="11 99999-9999" value={whatsapp} onChange={(event) => { setWhatsapp(event.target.value); setError(""); }} className="min-h-11 w-full rounded-xl border border-brand-dark/20 bg-white px-3 text-sm text-brand-dark focus-visible:outline-2 focus-visible:outline-brand-yellow" />
          </label>
          <div className="grid gap-4 border-t border-brand-dark/15 pt-4 text-sm leading-6 text-brand-dark/80">
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" required checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="mt-1 size-5 shrink-0 accent-brand-yellow" />
              <span>Li e concordo com os <a href={termsHref} target="_blank" rel="noopener noreferrer" className="font-bold text-brand-dark underline decoration-brand-yellow decoration-2 underline-offset-2">Termos de Uso</a> e a <a href="/politica-de-privacidade" target="_blank" rel="noopener noreferrer" className="font-bold text-brand-dark underline decoration-brand-yellow decoration-2 underline-offset-2">Política de Privacidade</a>.</span>
            </label>
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" required checked={acceptedBilling} onChange={(event) => setAcceptedBilling(event.target.checked)} className="mt-1 size-5 shrink-0 accent-brand-yellow" />
              <span>{coupon === null ? "Estou ciente de que esta compra é de pagamento único, sem renovação automática." : "Ao continuar, autorizo a Ratoeira a cobrar automaticamente as renovações das minhas assinaturas. A renovação automática pode ser cancelada a qualquer momento."}</span>
            </label>
          </div>
          {error && <p role="alert" className="text-xs font-semibold text-red-700">{error}</p>}
          <button type="submit" disabled={status !== "active" || !acceptedTerms || !acceptedBilling} className="min-h-11 w-full rounded-full bg-brand-dark px-4 text-sm font-black text-white hover:bg-brand-dark/85 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark">Ir para o checkout</button>
        </form>
      </dialog>
    </>
  );
}
