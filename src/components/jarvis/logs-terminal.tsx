"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type LogLine = {
  id: number;
  type: "SYS" | "JARVIS" | "BOT" | "WARN" | "OK";
  text: string;
  time: string;
};

const seedLogs: Omit<LogLine, "id" | "time">[] = [
  { type: "SYS", text: "J.A.R.V.I.S ativo. Inicializando protocolos..." },
  { type: "OK", text: "Conexão com Supabase estabelecida." },
  { type: "JARVIS", text: "Às ordens, Chefe! 02:27 por voz, tô pronto pra te ajudar." },
  { type: "BOT", text: "WhatsApp #1 conectado: +55 11 9****-****" },
  { type: "BOT", text: "Campanha 'Black Friday' iniciada — 1.247 contatos." },
  { type: "OK", text: "Disparo concluído em 47s. Taxa de entrega: 99.2%" },
  { type: "WARN", text: "Microfone silenciado pelo usuário." },
  { type: "SYS", text: "Telemetria: CPU 24% | RAM 205MB/s | GPU 18%" },
  { type: "JARVIS", text: "Detectei 3 novas mensagens. Deseja que eu responda?" },
  { type: "BOT", text: "Webhook N8N acionado: fluxo 'atendimento.xlsx'" },
  { type: "OK", text: "Backup automático realizado com sucesso." },
  { type: "SYS", text: "Scan de segurança completo. Nenhuma ameaça." },
];

const typeColors: Record<LogLine["type"], string> = {
  SYS: "text-cyan-400",
  JARVIS: "text-yellow-400",
  BOT: "text-green-400",
  WARN: "text-orange-400",
  OK: "text-green-400",
};

const typeLabels: Record<LogLine["type"], string> = {
  SYS: "SYS",
  JARVIS: "JARVIS",
  BOT: "BOT",
  WARN: "WARN",
  OK: "OK",
};

export function LogsTerminal() {
  const [logs, setLogs] = useState<LogLine[]>(() => {
    // Initialize lazily so we don't trigger cascading renders
    const now = new Date();
    return seedLogs.map((l, i) => ({
      ...l,
      id: i,
      time: new Date(now.getTime() - (seedLogs.length - i) * 8000).toLocaleTimeString("pt-BR", { hour12: false }),
    }));
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef(seedLogs.length);

  useEffect(() => {
    // Append new logs periodically
    const interval = setInterval(() => {
      const pick = seedLogs[Math.floor(Math.random() * seedLogs.length)];
      const newLog: LogLine = {
        ...pick,
        id: counterRef.current++,
        time: new Date().toLocaleTimeString("pt-BR", { hour12: false }),
      };
      setLogs((prev) => [...prev.slice(-50), newLog]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-mono-cyber text-xs uppercase tracking-widest text-cyan-400">
            Console de Atividades
          </span>
        </div>
        <span className="font-mono-cyber text-[9px] uppercase tracking-widest text-slate-500">
          tty://jarvis.log
        </span>
      </div>

      {/* Terminal body */}
      <div
        ref={scrollRef}
        className="flex-1 mt-2 overflow-y-auto scroll-cyber font-mono-cyber text-[11px] leading-relaxed space-y-1 min-h-[280px] max-h-[360px]"
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-2"
            >
              <span className="text-slate-600 shrink-0">{log.time}</span>
              <span className={`shrink-0 font-bold ${typeColors[log.type]}`}>
                [{typeLabels[log.type]}]
              </span>
              <span className="text-slate-300 break-words">{log.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {/* Cursor */}
        <div className="flex gap-2 mt-1">
          <span className="text-cyan-400">{"›"}</span>
          <span className="text-cyan-400 animate-blink">_</span>
        </div>
      </div>
    </div>
  );
}
