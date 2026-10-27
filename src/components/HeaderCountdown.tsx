import { useEffect, useState } from "react";
import { currentLot } from "../lib/blackFriday";

function formatCountdown(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return [hours, minutes, seconds % 60].map((value) => String(value).padStart(2, "0")).join(":");
}

export default function HeaderCountdown() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const lot = now ? currentLot(now) : null;
  const secondsLeft = lot?.nextChange && now
    ? Math.max(0, Math.ceil((Date.parse(lot.nextChange) - now.getTime()) / 1_000))
    : 0;
  const label = lot?.status === "active" ? "Próximo lote" : lot?.status === "ended" ? "Black Friday" : "Começa em";
  const value = lot?.status === "ended" ? "Encerrada" : lot ? formatCountdown(secondsLeft) : "--:--:--";

  return (
    <a href="#planos" aria-label={`${label}: ${value}. Ver planos`} className="flex h-10 w-[122px] shrink-0 flex-col items-center justify-center rounded-full bg-brand-yellow text-brand-dark shadow-[0_0_15px_rgba(255,184,0,0.3)] transition-colors hover:bg-brand-yellow-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark md:w-40">
      <span className="text-[9px] font-black uppercase leading-none tracking-wide">{label}</span>
      <span className="mt-0.5 font-mono text-sm font-black leading-none tabular-nums md:text-base" aria-live="off">{value}</span>
    </a>
  );
}
