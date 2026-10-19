"use client";
import { useEffect, useMemo, useState } from "react";

type PromoStep = {
  date: string;
  displayDate: string;
  discount: number;
};

const promoSteps: PromoStep[] = [
  { date: "2026-04-30", displayDate: "30/04", discount: 25 },
];

type CountdownState = {
  status: "waiting" | "active" | "expired";
  discount: number;
  progress: number;
  secondsLeft: number;
  label: string;
  title: string;
};

const getCountdownState = (now: Date): CountdownState => {
  const nowTime = now.getTime();
  const startTime = new Date("2026-04-30T00:00:00-03:00").getTime();
  const endTime = new Date("2026-05-01T08:00:00-03:00").getTime();
  const totalDurationSeconds = Math.max(1, Math.floor((endTime - startTime) / 1000));

  // 1. Antes da promoção
  if (nowTime < startTime) {
    return {
      status: "waiting",
      discount: 25,
      progress: 1,
      secondsLeft: Math.floor((startTime - nowTime) / 1000),
      label: "A promoção inicia em:",
      title: "Reabertura Especial da Promoção",
    };
  }

  // 2. Após a promoção
  if (nowTime >= endTime) {
    return {
      status: "expired",
      discount: 25,
      progress: 0,
      secondsLeft: 0,
      label: "Promoção encerrada",
      title: "Vocês pediram um tempinho a mais? Então corre!",
    };
  }

  // 3. Durante a promoção
  const dateKey = now.toLocaleDateString("en-CA");
  const currentStepIndex = promoSteps.findIndex(s => s.date === dateKey);
  const currentStep = currentStepIndex !== -1 ? promoSteps[currentStepIndex] : promoSteps[promoSteps.length - 1];
  
  // Restante até o encerramento oficial da campanha
  const secondsLeft = Math.max(0, Math.floor((endTime - nowTime) / 1000));
  const progress = Math.max(0, Math.min(1, secondsLeft / totalDurationSeconds));

  return {
    status: "active",
    discount: currentStep.discount,
    progress,
    secondsLeft,
    label: "A oferta encerra em:",
    title: "Promoção Reaberta: 25% OFF",
  };
};

const formatClock = (totalSeconds: number) => {
  if (totalSeconds <= 0) return "00:00:00";
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  
  if (d > 0) {
    return `${d}d ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
};

export default function PromoCountdown() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const getNowSp = () =>
      new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    setNow(getNowSp());
    const timer = setInterval(() => setNow(getNowSp()), 1000);
    return () => clearInterval(timer);
  }, []);

  const countdown = useMemo(() => {
    if (!now) return null;
    return getCountdownState(now);
  }, [now]);

  if (!now || !countdown) return <div className="min-h-[280px]" />;

  const radius = 84;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - countdown.progress);

  return (
    <div className="w-full rounded-3xl border border-brand-yellow/25 bg-brand-dark p-4 md:p-6 shadow-2xl">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="text-center lg:text-left flex-1">
          <p className="text-brand-yellow font-black uppercase tracking-[0.2em] text-[10px] mb-3 opactiy-80">
            PROMOÇÃO 2 ANOS DE RATOEIRA
          </p>
          <h3 className="text-2xl md:text-3xl font-black text-white leading-tight uppercase tracking-tight">
            {countdown.title}
          </h3>
          <div className="mt-4 inline-flex items-center gap-3 bg-brand-yellow/10 border border-brand-yellow/20 px-4 py-2 rounded-xl">
            <span className="text-brand-yellow font-black text-sm uppercase tracking-wider">
              {countdown.label}
            </span>
            <span className="text-white font-mono text-xl md:text-2xl font-black">
              {countdown.secondsLeft > 0 ? formatClock(countdown.secondsLeft) : "00:00:00"}
            </span>
          </div>
        </div>

        <div className="relative w-[160px] h-[160px] shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 220 220">
            <circle
              cx="110"
              cy="110"
              r={radius}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="14"
              fill="transparent"
            />
            <circle
              cx="110"
              cy="110"
              r={radius}
              stroke="#FFB800"
              strokeWidth="14"
              strokeLinecap="round"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="drop-shadow-[0_0_8px_rgba(255,184,0,0.5)]"
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-brand-yellow leading-none">
              {countdown.discount}%
            </span>
            <span className="text-[9px] uppercase tracking-[0.3em] text-white/50 mt-2 font-bold">
              OFF HOJE
            </span>
          </div>
        </div>
      </div>

      {/* Desktop: Cronograma Completo */}
      <div className="mt-8 hidden md:grid grid-cols-7 gap-2">
        {promoSteps.map((step) => {
          const nowDateKey = now.toLocaleDateString("en-CA");
          const isDatePassed = nowDateKey > step.date;
          const isDateActive = 
            nowDateKey === step.date && countdown.status === "active";
          
          return (
            <div
              key={step.date}
              className={`rounded-xl p-3 text-center border transition-all duration-300 ${
                isDateActive
                  ? "border-brand-yellow bg-brand-yellow shadow-[0_0_15px_rgba(255,184,0,0.2)]"
                  : isDatePassed
                  ? "border-white/5 bg-white/5 opacity-30"
                  : "border-white/10 bg-white/5 opacity-60"
              }`}
            >
              <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${isDateActive ? "text-brand-dark" : "text-white/40"}`}>
                {step.displayDate}
              </p>
              <p className={`text-base font-black ${isDateActive ? "text-brand-dark" : "text-white"}`}>
                {step.discount}%
              </p>
            </div>
          );
        })}
      </div>

      {/* Mobile: Indicador de progresso simplificado */}
      <div className="mt-6 flex md:hidden items-center justify-between bg-white/5 rounded-2xl p-4 border border-white/10">
        <div className="flex flex-col">
          <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Desconto Atual</span>
          <span className="text-2xl font-black text-brand-yellow">{countdown.discount}% OFF</span>
        </div>
        <div className="h-10 w-[1px] bg-white/10" />
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Status</span>
          <span className={`text-xs font-black uppercase px-2 py-1 rounded-md mt-1 ${
            countdown.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
          }`}>
            {countdown.status === "active" ? "Ativo" : countdown.status === "waiting" ? "Em breve" : "Encerrado"}
          </span>
        </div>
      </div>
    </div>
  );
}
