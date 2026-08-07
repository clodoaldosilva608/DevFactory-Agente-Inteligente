"use client";

import { motion } from "framer-motion";
import {
  Cpu,
  Zap,
  ShieldCheck,
  MonitorSmartphone,
  Mic,
  Webhook,
  Brain,
  Smartphone,
  Terminal,
  Clock,
  Cloud,
  type LucideIcon,
} from "lucide-react";

const features: {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  tag: string;
}[] = [
  {
    icon: Brain,
    title: "IA Nativa Multi-Provider",
    description:
      "Suporte nativo a Gemini, GPT-4o, Claude e Llama local (Ollama). Fallback automático entre provedores para máxima disponibilidade. A IA aprende com cada comando e otimiza respostas ao longo do tempo.",
    color: "cyan",
    tag: "AI-Powered",
  },
  {
    icon: Mic,
    title: "Controle por Voz",
    description:
      "Despertar com palavra-chave, ditado contínuo e execução de ações complexas usando apenas sua voz. Reconhecimento offline via Whisper + online via Google Speech API para máxima precisão.",
    color: "red",
    tag: "Voice",
  },
  {
    icon: Smartphone,
    title: "Multi-Dispositivo",
    description:
      "Interface HUD idêntica no desktop (Electron) e no navegador mobile. Sincronização em tempo real entre todos os dispositivos conectados à sua conta. Controle o PC do celular ou vice-versa.",
    color: "cyan",
    tag: "Cross-Platform",
  },
  {
    icon: Zap,
    title: "Automação de Tarefas",
    description:
      "Execute scripts, abra apps, manipule arquivos, controle o sistema operacional e crie fluxos de automação personalizados. Scheduler integrado para tarefas recorrentes sem intervenção humana.",
    color: "yellow",
    tag: "Automation",
  },
  {
    icon: ShieldCheck,
    title: "Segurança Avançada",
    description:
      "Criptografia ponta-a-ponta entre dispositivos, autenticação 2FA, sessões protegidas e auditoria completa de logs. Seus comandos e dados ficam protegidos com padrão empresarial.",
    color: "green",
    tag: "Enterprise",
  },
  {
    icon: Webhook,
    title: "Integração N8N / Webhooks",
    description:
      "Conecte o DevFactory a qualquer sistema via webhooks e fluxos N8N. CRM, ERP, planilhas, APIs externas — tudo orquestrado a partir de um único painel central inteligente.",
    color: "purple",
    tag: "API",
  },
];

const colorMap: Record<
  string,
  { text: string; bg: string; border: string; glow: string }
> = {
  cyan: {
    text: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/40",
    glow: "hover:glow-cyan",
  },
  yellow: {
    text: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/40",
    glow: "hover:shadow-[0_0_20px_rgba(250,204,21,0.4)]",
  },
  green: {
    text: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/40",
    glow: "hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]",
  },
  red: {
    text: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/40",
    glow: "hover:glow-red",
  },
  purple: {
    text: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/40",
    glow: "hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]",
  },
};

export function FeaturesSection() {
  return (
    <section id="recursos" className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 mb-4 glass-panel clip-cyber-sm text-[10px] font-mono-cyber uppercase tracking-[0.3em] text-cyan-400"
          >
            <Brain className="h-3 w-3" />
            Capacidades do Sistema
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display font-bold text-3xl sm:text-5xl text-white"
          >
            Tecnologia que{" "}
            <span className="text-cyan-400 text-glow-cyan">
              trabalha por você
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 max-w-2xl mx-auto text-slate-400 text-base sm:text-lg"
          >
            Um agente inteligente que une IA, automação de tarefas e controle
            multi-dispositivo em uma única interface cyberpunk imersiva.
          </motion.p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, idx) => {
            const c = colorMap[feature.color];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className={`group relative p-6 glass-panel clip-cyber ${c.glow} transition-all duration-300 hover:-translate-y-1`}
              >
                <div
                  className={`absolute top-0 right-0 h-12 w-12 ${c.bg} clip-corner-tr opacity-50`}
                />
                <div
                  className={`relative inline-flex items-center justify-center h-12 w-12 ${c.bg} ${c.border} border clip-cyber-sm mb-4`}
                >
                  <feature.icon className={`h-6 w-6 ${c.text}`} />
                </div>
                <div className="absolute top-4 right-4">
                  <span
                    className={`font-mono-cyber text-[9px] uppercase tracking-widest ${c.text} opacity-60`}
                  >
                    [{feature.tag}]
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
                <div
                  className={`absolute bottom-0 left-6 right-6 h-px ${c.bg.replace(
                    "/10",
                    "/40"
                  )} opacity-0 group-hover:opacity-100 transition-opacity`}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 glass-panel-strong clip-cyber"
        >
          {[
            { value: "12K+", label: "Usuários Ativos", color: "text-cyan-400" },
            {
              value: "8.4M",
              label: "Comandos executados/mês",
              color: "text-green-400",
            },
            { value: "99.98%", label: "Uptime", color: "text-yellow-400" },
            {
              value: "<50ms",
              label: "Latência Média",
              color: "text-red-400",
            },
          ].map((stat, idx) => (
            <div
              key={stat.label}
              className={`text-center ${
                idx !== 3 ? "md:border-r md:border-cyan-500/20" : ""
              }`}
            >
              <div
                className={`font-display font-bold text-3xl sm:text-4xl ${stat.color} text-glow-cyan`}
              >
                {stat.value}
              </div>
              <div className="mt-1 font-mono-cyber text-[10px] uppercase tracking-widest text-slate-500">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Platform support */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3 text-[10px] font-mono-cyber uppercase tracking-widest text-slate-500"
        >
          <span className="flex items-center gap-1.5">
            <MonitorSmartphone className="h-3.5 w-3.5 text-cyan-400" />
            Windows 10/11
          </span>
          <span className="text-slate-700">|</span>
          <span className="flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-cyan-400" />
            macOS 12+
          </span>
          <span className="text-slate-700">|</span>
          <span className="flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            Linux (Ubuntu/Fedora)
          </span>
          <span className="text-slate-700">|</span>
          <span className="flex items-center gap-1.5">
            <Smartphone className="h-3.5 w-3.5 text-cyan-400" />
            iOS + Android (Web)
          </span>
        </motion.div>
      </div>
    </section>
  );
}
