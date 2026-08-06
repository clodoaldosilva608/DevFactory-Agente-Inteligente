"use client";

import { motion } from "framer-motion";
import {
  Bot,
  Zap,
  ShieldCheck,
  MonitorSmartphone,
  Mic,
  MessageSquare,
  Webhook,
  Brain,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "Automação Inteligente",
    description:
      "Disparo de campanhas em massa, atendimento automático 24/7 e fluxos N8N customizáveis. O J.A.R.V.I.S aprende com cada interação para otimizar suas respostas e maximizar conversões.",
    color: "cyan",
    tag: "AI-Powered",
  },
  {
    icon: Zap,
    title: "Desempenho Máximo",
    description:
      "Processamento otimizado com monitoramento em tempo real de CPU, RAM, GPU e latência. Mantenha sua operação rodando lisa mesmo sob alta carga de mensagens simultâneas.",
    color: "yellow",
    tag: "Real-Time",
  },
  {
    icon: ShieldCheck,
    title: "Segurança Avançada",
    description:
      "Criptografia ponta-a-ponta, sessões protegidas e auditoria completa de logs. Seus dados e os de seus clientes ficam protegidos com padrão empresarial em todas as camadas.",
    color: "green",
    tag: "Enterprise",
  },
  {
    icon: MonitorSmartphone,
    title: "100% Compatível Windows",
    description:
      "App nativo para Windows 10/11 com interface HUD imersiva estilo sci-fi. Atalhos globais, comandos por voz e integração profunda com o sistema operacional.",
    color: "cyan",
    tag: "Native",
  },
  {
    icon: Mic,
    title: "Comandos por Voz",
    description:
      "Controle total do J.A.R.V.I.S usando apenas sua voz. Despertar com palavra-chave, ditado de mensagens e execução de ações complexas sem tocar no teclado.",
    color: "red",
    tag: "Voice",
  },
  {
    icon: Webhook,
    title: "Integração N8N / Webhooks",
    description:
      "Conecte o BotZapBR a qualquer sistema via webhooks e fluxos N8N. CRM, ERP, planilhas, APIs externas — tudo orquestrado a partir de um único painel central.",
    color: "purple",
    tag: "API",
  },
];

const colorMap: Record<string, { text: string; bg: string; border: string; glow: string }> = {
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
    <section
      id="recursos"
      className="relative py-24 px-4 sm:px-6 lg:px-8"
    >
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
            Diferenciais do Sistema
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display font-bold text-3xl sm:text-5xl text-white"
          >
            Tecnologia que{" "}
            <span className="text-cyan-400 text-glow-cyan">trabalha por você</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 max-w-2xl mx-auto text-slate-400 text-base sm:text-lg"
          >
            Uma plataforma completa que une IA, automação de WhatsApp e controle
            de sistema em uma única interface cyberpunk imersiva.
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
                {/* Corner accent */}
                <div className={`absolute top-0 right-0 h-12 w-12 ${c.bg} clip-corner-tr opacity-50`} />

                {/* Icon */}
                <div className={`relative inline-flex items-center justify-center h-12 w-12 ${c.bg} ${c.border} border clip-cyber-sm mb-4`}>
                  <feature.icon className={`h-6 w-6 ${c.text}`} />
                </div>

                {/* Tag */}
                <div className="absolute top-4 right-4">
                  <span className={`font-mono-cyber text-[9px] uppercase tracking-widest ${c.text} opacity-60`}>
                    [{feature.tag}]
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-display font-bold text-lg text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-6 right-6 h-px ${c.bg.replace('/10', '/40')} opacity-0 group-hover:opacity-100 transition-opacity`} />
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
            { value: "8.4M", label: "Mensagens/mês", color: "text-green-400" },
            { value: "99.98%", label: "Uptime", color: "text-yellow-400" },
            { value: "<50ms", label: "Latência Média", color: "text-red-400" },
          ].map((stat, idx) => (
            <div
              key={stat.label}
              className={`text-center ${idx !== 3 ? "md:border-r md:border-cyan-500/20" : ""}`}
            >
              <div className={`font-display font-bold text-3xl sm:text-4xl ${stat.color} text-glow-cyan`}>
                {stat.value}
              </div>
              <div className="mt-1 font-mono-cyber text-[10px] uppercase tracking-widest text-slate-500">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
