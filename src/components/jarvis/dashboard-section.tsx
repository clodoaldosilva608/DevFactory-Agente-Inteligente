"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Minus,
  Square,
  X,
  Clock,
  Wifi,
  Battery,
  Volume2,
  Signal,
} from "lucide-react";
import { RadarDisplay } from "./radar-display";
import { TelemetryPanel } from "./telemetry-panel";
import { LogsTerminal } from "./logs-terminal";
import { CommandBar } from "./command-bar";

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function DashboardSection() {
  const now = useClock();
  const time = now.toLocaleTimeString("pt-BR", { hour12: false });
  const date = now.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  return (
    <section
      id="dashboard"
      className="relative py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 mb-4 glass-panel clip-cyber-sm text-[10px] font-mono-cyber uppercase tracking-[0.3em] text-cyan-400"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Interface do Sistema
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display font-bold text-3xl sm:text-5xl text-white"
          >
            Painel de Controle{" "}
            <span className="text-cyan-400 text-glow-cyan">J.A.R.V.I.S</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 max-w-2xl mx-auto text-slate-400 text-base sm:text-lg"
          >
            Simulador interativo do app desktop. Telemetria em tempo real, radar
            holográfico, console de logs sci-fi e comandos rápidos — tudo em um
            único HUD imersivo.
          </motion.p>
        </div>

        {/* Window frame */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="relative glass-panel-strong clip-cyber-lg glow-cyan"
        >
          {/* Title bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-cyan-500/30 bg-black/40">
            <div className="flex items-center gap-3">
              {/* Traffic lights (cyberpunk) */}
              <div className="flex items-center gap-1.5">
                <button className="h-3 w-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors" />
                <button className="h-3 w-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors" />
                <button className="h-3 w-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors" />
              </div>
              <div className="h-4 w-px bg-cyan-500/30" />
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-cyan-500/20 border border-cyan-500/50 clip-cyber-sm flex items-center justify-center">
                  <span className="text-[8px] font-bold text-cyan-400">J</span>
                </div>
                <span className="font-display font-bold text-xs tracking-widest text-cyan-400">
                  J.A.R.V.I.S
                </span>
                <span className="font-mono-cyber text-[9px] uppercase tracking-widest text-slate-500">
                  v3.7.2 — Comando & Controle
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* System tray */}
              <div className="hidden md:flex items-center gap-2 text-cyan-400/70">
                <Wifi className="h-3.5 w-3.5" />
                <Volume2 className="h-3.5 w-3.5" />
                <Battery className="h-3.5 w-3.5" />
                <Signal className="h-3.5 w-3.5" />
              </div>
              <div className="hidden md:block h-4 w-px bg-cyan-500/30" />
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Clock className="h-3 w-3" />
                <span className="font-mono-cyber text-[11px] tabular-nums">{time}</span>
              </div>
              <span className="hidden sm:inline font-mono-cyber text-[9px] uppercase tracking-widest text-slate-500">
                {date}
              </span>
              <div className="flex items-center gap-1 ml-1">
                <button className="p-1 text-slate-500 hover:text-cyan-400 transition-colors">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button className="p-1 text-slate-500 hover:text-cyan-400 transition-colors">
                  <Square className="h-3 w-3" />
                </button>
                <button className="p-1 text-slate-500 hover:text-red-400 transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Status ticker */}
          <div className="relative overflow-hidden border-b border-cyan-500/20 bg-cyan-500/[0.02]">
            <div className="flex whitespace-nowrap py-1.5 animate-ticker font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400/70">
              {Array.from({ length: 3 }).map((_, k) => (
                <span key={k} className="flex">
                  <span className="px-4">SISTEMA OPERACIONAL</span>
                  <span className="px-4 text-slate-600">|</span>
                  <span className="px-4 text-green-400">● JARVIS ONLINE</span>
                  <span className="px-4 text-slate-600">|</span>
                  <span className="px-4">PROT: CYBERPUNK-7</span>
                  <span className="px-4 text-slate-600">|</span>
                  <span className="px-4 text-yellow-400">⚠ MICROFONE SILANCIADO</span>
                  <span className="px-4 text-slate-600">|</span>
                  <span className="px-4">LAT: 32MS</span>
                  <span className="px-4 text-slate-600">|</span>
                  <span className="px-4 text-cyan-400">SAUDAÇÃO INICIAL ENVIADA</span>
                  <span className="px-4 text-slate-600">|</span>
                  <span className="px-4">REDE: 154MBPS</span>
                  <span className="px-4 text-slate-600">|</span>
                </span>
              ))}
            </div>
          </div>

          {/* Main HUD grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] gap-0">
            {/* Left: Telemetry */}
            <div className="p-5 border-b lg:border-b-0 lg:border-r border-cyan-500/20 bg-black/30">
              <TelemetryPanel />
            </div>

            {/* Center: Radar */}
            <div className="relative p-6 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.04),transparent_70%)]">
              <div className="absolute inset-0 bg-grid-fine opacity-30 pointer-events-none" />
              <div className="relative w-full max-w-md">
                <RadarDisplay status="active" />
              </div>
              {/* Audio status */}
              <div className="mt-4 flex items-center gap-2 px-3 py-1.5 glass-panel clip-cyber-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className="font-mono-cyber text-[10px] uppercase tracking-widest text-red-400">
                  Microfone Silenciado
                </span>
              </div>
              {/* Vision mode chips */}
              <div className="mt-3 flex items-center gap-2">
                {["TÉRMICO", "NIGHT VISION", "CYBER SCAN", "AI VISION"].map((mode, i) => (
                  <span
                    key={mode}
                    className={`px-2 py-1 font-mono-cyber text-[9px] uppercase tracking-widest clip-cyber-sm transition-all ${
                      i === 2
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 glow-cyan-sm"
                        : "bg-cyan-500/5 text-slate-500 border border-cyan-500/20"
                    }`}
                  >
                    {mode}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Logs */}
            <div className="p-5 border-t lg:border-t-0 lg:border-l border-cyan-500/20 bg-black/30">
              <LogsTerminal />
            </div>
          </div>

          {/* Bottom: Command bar */}
          <div className="p-4 border-t border-cyan-500/30 bg-black/40">
            <CommandBar />
          </div>
        </motion.div>

        {/* Window footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center font-mono-cyber text-[10px] uppercase tracking-widest text-slate-600"
        >
          {"// Demonstração interativa — clique nos botões para testar o J.A.R.V.I.S"}
        </motion.p>
      </div>
    </section>
  );
}
