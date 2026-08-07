"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Crown, Rocket, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Plan = {
  id: string;
  name: string;
  icon: typeof Zap;
  monthly: number;
  yearly: number;
  description: string;
  features: string[];
  highlighted?: boolean;
  color: "cyan" | "red" | "purple";
  badge?: string;
};

const plans: Plan[] = [
  {
    id: "starter",
    name: "INICIANTE",
    icon: Zap,
    monthly: 47,
    yearly: 470,
    description: "Para autônomos começando com automação pessoal e IA.",
    color: "cyan",
    features: [
      "1 dispositivo pareado",
      "Até 1.000 comandos/mês",
      "IA Gemini básica",
      "Interface HUD desktop + web",
      "Suporte por email",
      "Atualizações mensais",
    ],
  },
  {
    id: "pro",
    name: "PROFISSIONAL",
    icon: Crown,
    monthly: 97,
    yearly: 970,
    description: "Para profissionais que precisam de escala, voz e multi-device.",
    color: "red",
    highlighted: true,
    badge: "Mais Popular",
    features: [
      "Até 5 dispositivos pareados",
      "Comandos ilimitados",
      "IA multi-provider (Gemini + GPT-4o + Claude)",
      "Controle por voz + Whisper offline",
      "Comandos remotos celular ↔ PC",
      "Automação de tarefas + scheduler",
      "Telemetria em tempo real",
      "Suporte prioritário 24/7",
    ],
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    icon: Rocket,
    monthly: 297,
    yearly: 2970,
    description: "Para equipes e operações com necessidades customizadas.",
    color: "purple",
    features: [
      "Dispositivos ilimitados",
      "Servidor dedicado",
      "IA local (Ollama) + customizada",
      "API privada & SDK",
      "Multi-usuário com permissões",
      "Gerente de conta dedicado",
      "SLA 99.99% garantido",
      "Onboarding & treinamento",
    ],
  },
];

const colorMap = {
  cyan: {
    border: "border-cyan-500/40",
    bg: "bg-cyan-500/5",
    text: "text-cyan-400",
    glow: "hover:glow-cyan",
    btn: "bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black",
  },
  red: {
    border: "border-red-500/50",
    bg: "bg-red-500/5",
    text: "text-red-400",
    glow: "glow-red hover:glow-red-lg",
    btn: "bg-red-500/20 border border-red-500 text-red-300 hover:bg-red-500 hover:text-white",
  },
  purple: {
    border: "border-purple-500/40",
    bg: "bg-purple-500/5",
    text: "text-purple-400",
    glow: "hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]",
    btn: "bg-purple-500/10 border border-purple-500/50 text-purple-400 hover:bg-purple-500 hover:text-white",
  },
};

export function PricingSection() {
  const [yearly, setYearly] = useState(false);

  const handleSubscribe = (plan: Plan) => {
    toast.success(`Iniciando teste grátis — ${plan.name}`, {
      description: "Redirecionando para o checkout Stripe...",
    });
  };

  return (
    <section
      id="planos"
      className="relative py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 mb-4 glass-panel clip-cyber-sm text-[10px] font-mono-cyber uppercase tracking-[0.3em] text-cyan-400"
          >
            <Shield className="h-3 w-3" />
            Planos & Preços
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display font-bold text-3xl sm:text-5xl text-white"
          >
            Escolha seu{" "}
            <span className="text-cyan-400 text-glow-cyan">plano DevFactory</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 max-w-2xl mx-auto text-slate-400 text-base sm:text-lg"
          >
            7 dias de teste grátis em qualquer plano. Sem cartão de crédito.
            Cancele quando quiser.
          </motion.p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1 glass-panel clip-cyber-sm">
          <button
            onClick={() => setYearly(false)}
            className={`px-4 py-1.5 text-xs font-mono-cyber uppercase tracking-wider transition-all clip-cyber-sm ${
              !yearly ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400 hover:text-cyan-400"
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`px-4 py-1.5 text-xs font-mono-cyber uppercase tracking-wider transition-all clip-cyber-sm flex items-center gap-1.5 ${
              yearly ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400 hover:text-cyan-400"
            }`}
          >
            Anual
            <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[9px] rounded">
              -17%
            </span>
          </button>
        </div>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, idx) => {
            const c = colorMap[plan.color];
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative p-6 glass-panel-strong clip-cyber ${c.border} ${c.glow} transition-all duration-300 hover:-translate-y-1 ${
                  plan.highlighted ? "md:scale-105 md:-my-2" : ""
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-red-500 text-white text-[9px] font-mono-cyber uppercase tracking-widest clip-cyber-sm glow-red">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className={`inline-flex items-center justify-center h-12 w-12 ${c.bg} ${c.border} border clip-cyber-sm mb-4`}>
                  <plan.icon className={`h-6 w-6 ${c.text}`} />
                </div>

                {/* Name */}
                <h3 className={`font-display font-bold text-xl ${c.text} mb-1`}>
                  {plan.name}
                </h3>
                <p className="text-xs text-slate-500 mb-5 min-h-[2.5rem]">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-slate-500 text-sm">R$</span>
                    <span className={`font-display font-black text-4xl ${c.text}`}>
                      {yearly ? Math.round(plan.yearly / 12) : plan.monthly}
                    </span>
                    <span className="text-slate-500 text-sm">/mês</span>
                  </div>
                  {yearly && (
                    <div className="mt-1 font-mono-cyber text-[10px] text-green-400">
                      R$ {plan.yearly}/ano economizado
                    </div>
                  )}
                </div>

                {/* CTA */}
                <Button
                  onClick={() => handleSubscribe(plan)}
                  className={`w-full clip-cyber-sm font-mono-cyber text-xs uppercase tracking-wider transition-all ${c.btn}`}
                >
                  <Zap className="h-3.5 w-3.5 mr-1.5" fill="currentColor" />
                  Teste Grátis 7 Dias
                </Button>

                {/* Features */}
                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-slate-300">
                      <Check className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${c.text}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Payment trust */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-mono-cyber uppercase tracking-widest text-slate-500"
        >
          <span className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-green-400" />
            Pagamento Seguro Stripe
          </span>
          <span className="text-slate-700">|</span>
          <span>PIX • Cartão • Boleto</span>
          <span className="text-slate-700">|</span>
          <span>Cancele quando quiser</span>
          <span className="text-slate-700">|</span>
          <span>Sem fidelidade</span>
        </motion.div>
      </div>
    </section>
  );
}
