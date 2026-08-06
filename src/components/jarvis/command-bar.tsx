"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, MicOff, Power, Settings, MessageSquare, Monitor } from "lucide-react";
import { toast } from "sonner";

type QuickAction = {
  label: string;
  icon: typeof Power;
  color: "red" | "cyan";
  action: () => void;
};

const quickActions = (handlers: {
  onWake: () => void;
  onMode: () => void;
  onWhatsApp: () => void;
  onRemote: () => void;
}): QuickAction[] => [
  { label: "Despertar (ESC)", icon: Power, color: "red", action: handlers.onWake },
  { label: "Acessar Modo", icon: Settings, color: "cyan", action: handlers.onMode },
  { label: "Conectar WhatsApp", icon: MessageSquare, color: "cyan", action: handlers.onWhatsApp },
  { label: "Controle Remoto", icon: Monitor, color: "cyan", action: handlers.onRemote },
];

export function CommandBar() {
  const [input, setInput] = useState("");
  const [micOn, setMicOn] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // ESC wakes the system
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        inputRef.current?.focus();
        toast.success("J.A.R.V.I.S despertado", {
          description: "Sistema pronto para comandos.",
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    setHistory((h) => [...h, input]);
    toast.success("Comando enviado ao J.A.R.V.I.S", {
      description: `"${input}"`,
    });
    setInput("");
  };

  const handleAction = (label: string) => {
    toast.info("Ação executada", { description: label });
  };

  const actions = quickActions({
    onWake: () => handleAction("Despertar (ESC)"),
    onMode: () => handleAction("Acessar Modo"),
    onWhatsApp: () => handleAction("Conectar WhatsApp"),
    onRemote: () => handleAction("Controle Remoto"),
  });

  return (
    <div className="space-y-3">
      {/* Command input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-2 p-2 bg-black/60 border border-cyan-500/30 clip-cyber-sm focus-within:border-cyan-500/60 focus-within:glow-cyan-sm transition-all">
          <span className="font-mono-cyber text-cyan-400 pl-2 text-sm">{"›"}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite um comando ou pergunta..."
            className="flex-1 bg-transparent border-none outline-none font-mono-cyber text-sm text-cyan-100 placeholder:text-slate-600"
          />
          <button
            type="button"
            onClick={() => {
              setMicOn(!micOn);
              toast.info(micOn ? "Microfone desativado" : "Microfone ativado", {
                description: micOn ? "MUTED" : "Ouvindo...",
              });
            }}
            className={`p-2 transition-all clip-cyber-sm ${
              micOn
                ? "bg-red-500/20 text-red-400 border border-red-500/50"
                : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20"
            }`}
            aria-label="Microfone"
          >
            {micOn ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
          <button
            type="submit"
            className="p-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500 hover:text-black transition-all clip-cyber-sm glow-cyan-sm"
            aria-label="Enviar"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Quick action buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {actions.map((a) => (
          <motion.button
            key={a.label}
            whileTap={{ scale: 0.97 }}
            onClick={a.action}
            className={`group flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-mono-cyber uppercase tracking-wider clip-cyber-sm transition-all ${
              a.color === "red"
                ? "bg-red-500/10 border border-red-500/50 text-red-400 hover:bg-red-500/20 hover:glow-red"
                : "bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 hover:glow-cyan-sm"
            }`}
          >
            <a.icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{a.label}</span>
            <span className="sm:hidden">{a.label.split(" ")[0]}</span>
          </motion.button>
        ))}
      </div>

      {/* Recent commands (history) */}
      <AnimatePresence>
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="font-mono-cyber text-[9px] uppercase tracking-widest text-slate-500 mb-1.5">
              &gt; Comandos recentes
            </div>
            <div className="flex flex-wrap gap-1.5">
              {history.slice(-5).map((h, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-cyan-500/5 border border-cyan-500/20 text-[10px] font-mono-cyber text-cyan-300 clip-cyber-sm"
                >
                  {h}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
