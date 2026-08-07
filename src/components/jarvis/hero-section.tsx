"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Mic,
  Smartphone,
  Zap,
  Terminal,
  Star,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const badges = [
  { icon: Brain, label: "IA Nativa" },
  { icon: Mic, label: "Controle por Voz" },
  { icon: Smartphone, label: "Multi-Dispositivo" },
  { icon: Zap, label: "Automação de Tarefas" },
];

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-4"
    >
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Top status pill */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 glass-panel clip-cyber-sm text-xs font-mono-cyber uppercase tracking-widest"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="text-green-400">Sistema Online</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400">v3.7.2 // build 2026.08</span>
        </motion.div>

        {/* H1 — DevFactory */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-black text-5xl sm:text-7xl md:text-8xl tracking-tight leading-none"
        >
          <span className="text-glow-cyan-strong text-cyan-400">DevFactory</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-3 font-mono-cyber text-xs sm:text-sm uppercase tracking-[0.4em] text-slate-400"
        >
          {"// Agente Inteligente"}
        </motion.p>

        {/* Subtitle */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 font-display font-bold text-2xl sm:text-4xl md:text-5xl text-white"
        >
          <span className="text-holographic">Seu PC obedece.</span>{" "}
          <span className="text-slate-300">Seu celular comanda.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6 max-w-3xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed"
        >
          Agente inteligente que executa tarefas no seu PC, recebe comandos do
          celular e opera com interface HUD tanto no desktop quanto no mobile.
          IA + automação + controle remoto em um único sistema.
        </motion.p>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-2.5"
        >
          {badges.map((b) => (
            <div
              key={b.label}
              className="inline-flex items-center gap-2 px-3 py-1.5 glass-panel clip-cyber-sm text-xs font-mono-cyber uppercase tracking-wider text-cyan-300 hover:glow-cyan-sm hover:text-cyan-400 transition-all"
            >
              <b.icon className="h-3.5 w-3.5" />
              {b.label}
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            asChild
            size="lg"
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono-cyber uppercase tracking-wider clip-cyber glow-cyan hover:glow-cyan-lg transition-all px-8 py-6 text-sm"
          >
            <a href="#planos">
              <Zap className="h-4 w-4 mr-2" fill="currentColor" />
              Iniciar Teste Grátis
              <ArrowRight className="h-4 w-4 ml-2" />
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="bg-transparent border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-400 font-mono-cyber uppercase tracking-wider clip-cyber transition-all px-8 py-6 text-sm"
          >
            <a href="#dashboard">
              <Terminal className="h-4 w-4 mr-2" />
              Ver Demonstração
            </a>
          </Button>
        </motion.div>

        {/* Trust line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-mono-cyber uppercase tracking-widest text-slate-600"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-green-400" />
            SSL Seguro
          </span>
          <span className="text-slate-700">|</span>
          <span className="flex items-center gap-1.5">
            <span className="text-green-400">+12.000</span> Usuários Ativos
          </span>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className="hidden sm:flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-cyan-400" />
            4.9/5 Avaliação
          </span>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className="hidden sm:flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            Windows + Mac + Linux
          </span>
        </motion.div>
      </div>
    </section>
  );
}
