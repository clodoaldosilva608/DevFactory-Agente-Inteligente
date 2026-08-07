import { useEffect, useState } from "react";

const bootMessages = [
  "[SYS] DevFactory v3.7.2 inicializando...",
  "[OK] Carregando módulos cyberpunk...",
  "[OK] Estabelecendo conexão segura...",
  "[OK] Inicializando telemetria do sistema...",
  "[OK] Carregando protocolos de IA...",
  "[SYS] DevFactory pronto. Bem-vindo, Chefe.",
];

export function BootScreen() {
  const [visibleLines, setVisibleLines] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines((n) => Math.min(n + 1, bootMessages.length));
    }, 380);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#050811]">
      <div className="bg-grid-fine absolute inset-0 opacity-30" />
      <div className="relative z-10 w-full max-w-md px-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative h-20 w-20 mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-radar-sweep" />
            <div className="absolute inset-2 rounded-full border border-cyan-500/40" />
            <div className="absolute inset-4 rounded-full border border-cyan-500/60 animate-pulse-glow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-cyan-400" fill="currentColor">
                <path d="M13 2L3 14h7v8l10-12h-7V2z" />
              </svg>
            </div>
          </div>
          <h1 className="font-display font-black text-3xl text-cyan-400 text-glow-cyan tracking-widest">
            Dev<span className="text-red-500 text-glow-red">Factory</span>
          </h1>
          <p className="font-mono-cyber text-[10px] uppercase tracking-[0.3em] text-slate-500 mt-1">
            Agente Inteligente
          </p>
        </div>

        {/* Boot messages */}
        <div className="font-mono-cyber text-[11px] space-y-1 min-h-[140px]">
          {bootMessages.slice(0, visibleLines).map((msg, i) => {
            const isOk = msg.startsWith("[OK]");
            const isSys = msg.startsWith("[SYS]");
            return (
              <div key={i} className="flex gap-2">
                <span className={isOk ? "text-green-400" : isSys ? "text-cyan-400" : "text-slate-400"}>
                  {msg.split("]")[0]}]
                </span>
                <span className="text-slate-300">{msg.split("]")[1]}</span>
              </div>
            );
          })}
          {visibleLines < bootMessages.length && (
            <div className="flex gap-2 mt-1">
              <span className="text-cyan-400">›</span>
              <span className="text-cyan-400 animate-blink">_</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-6 h-1 bg-cyan-500/10 overflow-hidden clip-cyber-sm">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 glow-cyan-sm transition-all duration-300"
            style={{ width: `${(visibleLines / bootMessages.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
