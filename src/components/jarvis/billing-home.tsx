"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Zap,
  Crown,
  Rocket,
  Check,
  Receipt,
  Download,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Plan = {
  id: string;
  name: string;
  icon: typeof Zap;
  monthly: number;
  yearly: number;
  features: string[];
  color: "cyan" | "red" | "purple";
  highlighted?: boolean;
};

const plans: Plan[] = [
  {
    id: "starter",
    name: "INICIANTE",
    icon: Zap,
    monthly: 47,
    yearly: 470,
    color: "cyan",
    features: [
      "1 número de WhatsApp",
      "Até 1.000 mensagens/mês",
      "Atendimento automático básico",
      "Suporte por email",
    ],
  },
  {
    id: "pro",
    name: "PROFISSIONAL",
    icon: Crown,
    monthly: 97,
    yearly: 970,
    color: "red",
    highlighted: true,
    features: [
      "Até 5 números de WhatsApp",
      "Mensagens ilimitadas",
      "IA J.A.R.V.I.S completa",
      "Comandos por voz",
      "Integração N8N + Webhooks",
      "Disparo de campanhas",
      "Suporte prioritário 24/7",
    ],
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    icon: Rocket,
    monthly: 297,
    yearly: 2970,
    color: "purple",
    features: [
      "Números ilimitados",
      "Servidor dedicado",
      "IA customizada",
      "API privada & SDK",
      "Gerente dedicado",
      "SLA 99.99%",
    ],
  },
];

const colorMap = {
  cyan: { border: "border-cyan-500/40", text: "text-cyan-400", btn: "bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black" },
  red: { border: "border-red-500/50", text: "text-red-400", btn: "bg-red-500/20 border border-red-500 text-red-300 hover:bg-red-500 hover:text-white" },
  purple: { border: "border-purple-500/40", text: "text-purple-400", btn: "bg-purple-500/10 border border-purple-500/50 text-purple-400 hover:bg-purple-500 hover:text-white" },
};

export function BillingHome({ org, subscription, invoices }: { org: any; subscription: any; invoices: any[] }) {
  const [yearly, setYearly] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "pix">("card");

  const handleSubscribe = (plan: Plan) => {
    toast.success(`Iniciando checkout — ${plan.name}`, {
      description: paymentMethod === "pix"
        ? `Gerando QR PIX de R$ ${yearly ? plan.yearly : plan.monthly}...`
        : `Redirecionando para Stripe (R$ ${yearly ? Math.round(plan.yearly / 12) : plan.monthly}/mês)...`,
    });
  };

  const currentPlan = subscription?.plan || "FREE";
  const trialDaysLeft = org?.trialEndsAt
    ? Math.max(0, Math.ceil((org.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
          Billing &{" "}
          <span className="text-cyan-400 text-glow-cyan">Assinatura</span>
        </h1>
        <p className="mt-1 font-mono-cyber text-xs uppercase tracking-widest text-slate-500">
          Gerencie seu plano, pagamentos e faturas
        </p>
      </motion.div>

      {/* Current plan card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel-strong clip-cyber p-6 glow-cyan-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/40 clip-cyber-sm">
              <Crown className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <div className="font-mono-cyber text-[10px] uppercase tracking-widest text-slate-500">
                Plano atual
              </div>
              <div className="font-display font-bold text-2xl text-cyan-400">
                {currentPlan}
                {subscription?.status === "TRIALING" && (
                  <span className="ml-2 text-xs text-yellow-400">TRIAL</span>
                )}
              </div>
              <div className="font-mono-cyber text-[11px] text-slate-400 mt-1">
                {subscription?.billingCycle === "YEARLY" ? "Anual" : "Mensal"} •{" "}
                {subscription?.amount
                  ? `R$ ${(subscription.amount / 100).toFixed(2).replace(".", ",")}`
                  : "—"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 clip-cyber-sm">
              <div className="font-mono-cyber text-[9px] uppercase tracking-widest text-slate-500">
                Status
              </div>
              <div className="font-mono-cyber text-sm text-green-400 font-bold mt-0.5">
                {subscription?.status || "—"}
              </div>
            </div>
            <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 clip-cyber-sm">
              <div className="font-mono-cyber text-[9px] uppercase tracking-widest text-slate-500">
                Renovação
              </div>
              <div className="font-mono-cyber text-sm text-cyan-400 font-bold mt-0.5">
                {subscription?.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString("pt-BR")
                  : trialDaysLeft > 0
                  ? `${trialDaysLeft}d trial`
                  : "—"}
              </div>
            </div>
          </div>
        </div>

        {subscription?.status === "TRIALING" && trialDaysLeft > 0 && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 clip-cyber-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-400 shrink-0" />
            <p className="text-xs font-mono-cyber text-yellow-300">
              Seu trial termina em <span className="font-bold">{trialDaysLeft} dias</span>.
              Escolha um plano abaixo para continuar usando todos os recursos sem interrupção.
            </p>
          </div>
        )}
      </motion.div>

      {/* Billing toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="inline-flex items-center gap-3 p-1 glass-panel clip-cyber-sm">
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

        {/* Payment method selector */}
        <div className="inline-flex items-center gap-2">
          <span className="font-mono-cyber text-[10px] uppercase tracking-widest text-slate-500">
            Pagamento:
          </span>
          <button
            onClick={() => setPaymentMethod("card")}
            className={`px-3 py-1.5 text-xs font-mono-cyber uppercase tracking-wider transition-all clip-cyber-sm flex items-center gap-1.5 border ${
              paymentMethod === "card"
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
                : "bg-transparent text-slate-400 border-slate-700 hover:text-cyan-400"
            }`}
          >
            <CreditCard className="h-3 w-3" />
            Cartão
          </button>
          <button
            onClick={() => setPaymentMethod("pix")}
            className={`px-3 py-1.5 text-xs font-mono-cyber uppercase tracking-wider transition-all clip-cyber-sm flex items-center gap-1.5 border ${
              paymentMethod === "pix"
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
                : "bg-transparent text-slate-400 border-slate-700 hover:text-cyan-400"
            }`}
          >
            <Zap className="h-3 w-3" fill="currentColor" />
            PIX
          </button>
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan, idx) => {
          const c = colorMap[plan.color];
          const isCurrent = currentPlan === plan.id.toUpperCase();
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className={`relative p-5 glass-panel-strong clip-cyber ${c.border} ${
                plan.highlighted ? "md:scale-105 glow-cyan-sm" : ""
              } transition-all hover:-translate-y-1`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-red-500 text-white text-[9px] font-mono-cyber uppercase tracking-widest clip-cyber-sm glow-red">
                    Recomendado
                  </span>
                </div>
              )}

              <div className={`inline-flex p-2 ${c.border.replace("border-", "bg-").replace("/40", "/10").replace("/50", "/10")} border clip-cyber-sm mb-3`}>
                <plan.icon className={`h-5 w-5 ${c.text}`} />
              </div>
              <h3 className={`font-display font-bold text-lg ${c.text}`}>{plan.name}</h3>

              <div className="mt-3 mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-slate-500 text-xs">R$</span>
                  <span className={`font-display font-black text-3xl ${c.text}`}>
                    {yearly ? Math.round(plan.yearly / 12) : plan.monthly}
                  </span>
                  <span className="text-slate-500 text-xs">/mês</span>
                </div>
                {yearly && (
                  <div className="font-mono-cyber text-[10px] text-green-400 mt-1">
                    R$ {plan.yearly}/ano economizado
                  </div>
                )}
              </div>

              <Button
                onClick={() => handleSubscribe(plan)}
                disabled={isCurrent}
                className={`w-full clip-cyber-sm font-mono-cyber text-xs uppercase tracking-wider transition-all ${c.btn} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isCurrent ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                    Plano Atual
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5 mr-1.5" fill="currentColor" />
                    Assinar agora
                  </>
                )}
              </Button>

              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[11px] text-slate-300">
                    <Check className={`h-3 w-3 mt-0.5 shrink-0 ${c.text}`} />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>

      {/* Invoices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-panel clip-cyber p-5"
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-cyan-400" />
            <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-cyan-400">
              Histórico de Faturas
            </h3>
          </div>
          <span className="font-mono-cyber text-[9px] uppercase tracking-widest text-slate-500">
            {invoices.length} faturas
          </span>
        </div>
        {invoices.length === 0 ? (
          <div className="py-8 text-center">
            <Receipt className="h-10 w-10 text-slate-700 mx-auto mb-2" />
            <p className="font-mono-cyber text-xs text-slate-500">
              Nenhuma fatura ainda. Suas faturas aparecerão aqui após o primeiro pagamento.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-3 bg-cyan-500/[0.03] border border-cyan-500/15 clip-cyber-sm"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 shrink-0 ${
                    inv.status === "PAID" ? "bg-green-500/10 border-green-500/30" : "bg-yellow-500/10 border-yellow-500/30"
                  } border clip-cyber-sm flex items-center justify-center`}>
                    {inv.status === "PAID" ? (
                      <Check className="h-3.5 w-3.5 text-green-400" />
                    ) : (
                      <Clock className="h-3.5 w-3.5 text-yellow-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-mono-cyber text-xs text-white">#{inv.number}</div>
                    <div className="font-mono-cyber text-[10px] text-slate-500">
                      {new Date(inv.createdAt).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-mono-cyber text-sm text-white font-bold">
                      R$ {(inv.amount / 100).toFixed(2).replace(".", ",")}
                    </div>
                    <div className={`font-mono-cyber text-[9px] uppercase tracking-widest ${
                      inv.status === "PAID" ? "text-green-400" : "text-yellow-400"
                    }`}>
                      {inv.status}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10"
                    onClick={() => toast.info("Download iniciado", { description: `Fatura #${inv.number}` })}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Mock notice */}
      <div className="p-3 bg-blue-500/5 border border-blue-500/20 clip-cyber-sm flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-[11px] font-mono-cyber text-blue-300 leading-relaxed">
          <span className="font-bold">MODO DEMO:</span> Os pagamentos estão mockados para demonstração.
          Para ativar cobranças reais, configure as chaves do Stripe (NEXT_PUBLIC_STRIPE_KEY, STRIPE_SECRET_KEY)
          e integração PIX no arquivo <code className="px-1 py-0.5 bg-blue-500/10 rounded">.env</code>.
        </p>
      </div>
    </div>
  );
}
