"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  QrCode,
  RefreshCw,
  CheckCircle2,
  MessageSquare,
  Send,
  Users,
  Webhook,
  Bot,
  Smartphone,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type ConnectionState = "disconnected" | "qr" | "connecting" | "connected";

export function WhatsAppSection() {
  const [state, setState] = useState<ConnectionState>("disconnected");
  const [countdown, setCountdown] = useState(45);

  // Simulated QR countdown — only runs while in `qr` state
  useEffect(() => {
    if (state !== "qr") return;

    let localCount = 45;
    const id = setInterval(() => {
      localCount -= 1;
      if (localCount <= 0) {
        clearInterval(id);
        setState("disconnected");
      } else {
        setCountdown(localCount);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [state]);

  // Auto-connect after 4s in qr state
  useEffect(() => {
    if (state !== "qr") return;
    const id = setTimeout(() => {
      setState("connecting");
      setTimeout(() => {
        setState("connected");
        toast.success("WhatsApp conectado!", {
          description: "+55 11 9****-**** está online.",
        });
      }, 1500);
    }, 5000);
    return () => clearTimeout(id);
  }, [state]);

  const handleGenerateQR = () => {
    setState("qr");
    toast.info("Gerando QR Code...", {
      description: "Escaneie com seu WhatsApp em até 45s.",
    });
  };

  const handleDisconnect = () => {
    setState("disconnected");
    toast.warning("WhatsApp desconectado");
  };

  return (
    <section
      id="whatsapp"
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
            className="inline-flex items-center gap-2 px-3 py-1 mb-4 glass-panel clip-cyber-sm text-[10px] font-mono-cyber uppercase tracking-[0.3em] text-green-400"
          >
            <MessageSquare className="h-3 w-3" />
            Módulo BotZapBR
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display font-bold text-3xl sm:text-5xl text-white"
          >
            Automação Inteligente para{" "}
            <span className="text-green-400 text-glow-cyan">WhatsApp</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 max-w-2xl mx-auto text-slate-400 text-base sm:text-lg"
          >
            Conexão via QR Code, disparo de campanhas em massa, atendimento
            automático 24/7 e integração completa com N8N e Webhooks.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: QR Connection */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="glass-panel-strong clip-cyber p-6 lg:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-cyan-400" />
                <h3 className="font-display font-bold text-lg text-white">
                  Conexão WhatsApp
                </h3>
              </div>
              <ConnectionBadge state={state} />
            </div>

            {/* QR display */}
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative">
                {/* Frame */}
                <div className="relative h-56 w-56 bg-black border-2 border-cyan-500/40 clip-cyber p-3 flex items-center justify-center glow-cyan-sm">
                  {state === "connected" ? (
                    <div className="flex flex-col items-center gap-3">
                      <CheckCircle2 className="h-20 w-20 text-green-400 animate-pulse-glow" />
                      <span className="font-mono-cyber text-xs uppercase tracking-widest text-green-400">
                        Conectado
                      </span>
                    </div>
                  ) : state === "connecting" ? (
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="h-16 w-16 text-cyan-400 animate-spin" />
                      <span className="font-mono-cyber text-xs uppercase tracking-widest text-cyan-400 animate-pulse">
                        Conectando...
                      </span>
                    </div>
                  ) : state === "qr" ? (
                    <div className="relative w-full h-full">
                      <FakeQRCode />
                      {/* Scanning line */}
                      <motion.div
                        className="absolute left-2 right-2 h-px bg-cyan-400"
                        style={{ boxShadow: "0 0 12px #00f0ff" }}
                        animate={{ top: ["8%", "92%", "8%"] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-center">
                      <QrCode className="h-16 w-16 text-slate-600" />
                      <span className="font-mono-cyber text-[10px] uppercase tracking-widest text-slate-500 max-w-[180px]">
                        Clique em Gerar QR para iniciar a conexão
                      </span>
                    </div>
                  )}
                </div>

                {/* Corner brackets */}
                {state === "qr" && (
                  <>
                    <div className="absolute -top-1 -left-1 h-4 w-4 border-t-2 border-l-2 border-cyan-400" />
                    <div className="absolute -top-1 -right-1 h-4 w-4 border-t-2 border-r-2 border-cyan-400" />
                    <div className="absolute -bottom-1 -left-1 h-4 w-4 border-b-2 border-l-2 border-cyan-400" />
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 border-b-2 border-r-2 border-cyan-400" />
                  </>
                )}
              </div>

              {/* Countdown / status */}
              <div className="mt-6 h-6 flex items-center justify-center">
                {state === "qr" && (
                  <span className="font-mono-cyber text-xs text-yellow-400 animate-pulse">
                    QR expira em {countdown}s
                  </span>
                )}
                {state === "connected" && (
                  <span className="font-mono-cyber text-xs text-green-400">
                    +55 11 9****-**** • Online há 14:32
                  </span>
                )}
              </div>

              {/* Action button */}
              <Button
                onClick={state === "connected" ? handleDisconnect : handleGenerateQR}
                disabled={state === "connecting" || state === "qr"}
                className={`mt-4 clip-cyber font-mono-cyber text-xs uppercase tracking-wider transition-all ${
                  state === "connected"
                    ? "bg-red-500/10 border border-red-500/50 text-red-400 hover:bg-red-500/20"
                    : "bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black glow-cyan-sm"
                }`}
              >
                {state === "connected" ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    Desconectar
                  </>
                ) : (
                  <>
                    <QrCode className="h-3.5 w-3.5 mr-1.5" />
                    Gerar QR Code
                  </>
                )}
              </Button>
            </div>

            {/* Step list */}
            <div className="mt-6 pt-6 border-t border-cyan-500/20">
              <ol className="space-y-2 text-xs font-mono-cyber text-slate-400">
                <li className="flex gap-2">
                  <span className="text-cyan-400 font-bold">01.</span>
                  Abra o WhatsApp no celular &gt; Configurações &gt; Aparelhos conectados
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-400 font-bold">02.</span>
                  Toque em "Conectar um aparelho" e aponte para o QR Code
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-400 font-bold">03.</span>
                  Aguarde a sincronização automática dos contatos e conversas
                </li>
              </ol>
            </div>
          </motion.div>

          {/* Right: Campaign features */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-4"
          >
            {/* Campaign launcher */}
            <div className="glass-panel-strong clip-cyber p-6">
              <div className="flex items-center gap-2 mb-4">
                <Send className="h-5 w-5 text-cyan-400" />
                <h3 className="font-display font-bold text-lg text-white">
                  Disparo de Campanhas
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <Stat value="1.247" label="Contatos" color="text-cyan-400" />
                <Stat value="99.2%" label="Entrega" color="text-green-400" />
                <Stat value="47s" label="Tempo" color="text-yellow-400" />
              </div>

              <div className="space-y-2">
                <FakeCampaignRow name="Black Friday 2026" contacts={1247} status="active" />
                <FakeCampaignRow name="Recuperação de Leads" contacts={342} status="paused" />
                <FakeCampaignRow name="Newsletter Semanal" contacts={5891} status="scheduled" />
              </div>

              <Button
                onClick={() => toast.success("Campanha iniciada!", { description: "Disparo em andamento..." })}
                className="w-full mt-4 bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black clip-cyber-sm font-mono-cyber text-xs uppercase tracking-wider glow-cyan-sm"
              >
                <Zap className="h-3.5 w-3.5 mr-1.5" fill="currentColor" />
                Nova Campanha
              </Button>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-3">
              <MiniFeature
                icon={Bot}
                title="Atendimento 24/7"
                description="Respostas automáticas com IA. Resolva 80% dos chamados sem intervenção humana."
                color="cyan"
              />
              <MiniFeature
                icon={Webhook}
                title="Webhooks N8N"
                description="Fluxos customizados conectados a CRM, ERP, planilhas e APIs externas."
                color="purple"
              />
              <MiniFeature
                icon={Users}
                title="Multi-conta"
                description="Gerencie até 10 números simultâneos a partir de um único painel central."
                color="green"
              />
              <MiniFeature
                icon={MessageSquare}
                title="Mensagens em Massa"
                description="Disparo de 10K+ mensagens/hora com anti-bloqueio e rotação de números."
                color="yellow"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ConnectionBadge({ state }: { state: ConnectionState }) {
  const config = {
    disconnected: { label: "Offline", color: "text-slate-400", dot: "bg-slate-500" },
    qr: { label: "Aguardando", color: "text-yellow-400", dot: "bg-yellow-400 animate-pulse" },
    connecting: { label: "Conectando", color: "text-cyan-400", dot: "bg-cyan-400 animate-pulse" },
    connected: { label: "Online", color: "text-green-400", dot: "bg-green-400 animate-pulse" },
  }[state];

  return (
    <div className="flex items-center gap-2 px-2.5 py-1 glass-panel clip-cyber-sm">
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <span className={`font-mono-cyber text-[10px] uppercase tracking-widest ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
}

function FakeQRCode() {
  // Generate a fake QR-like grid
  const cells = Array.from({ length: 25 * 25 }, (_, i) => {
    const x = i % 25;
    const y = Math.floor(i / 25);
    // Position dots
    const isCorner =
      (x < 7 && y < 7) || (x >= 18 && y < 7) || (x < 7 && y >= 18);
    if (isCorner) {
      const cx = x < 7 ? 3 : 21;
      const cy = y < 7 ? 3 : 21;
      const dist = Math.max(Math.abs(x - cx), Math.abs(y - cy));
      return dist === 0 || dist === 2 || dist === 3;
    }
    // Pseudo-random pattern based on coordinates
    return (x * 7 + y * 11 + x * y) % 3 === 0;
  });

  return (
    <div className="w-full h-full grid grid-cols-25 gap-px p-1">
      {cells.map((on, i) => (
        <div
          key={i}
          className={on ? "bg-cyan-400" : "bg-transparent"}
          style={{ aspectRatio: "1" }}
        />
      ))}
    </div>
  );
}

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="p-2 bg-cyan-500/5 border border-cyan-500/20 clip-cyber-sm text-center">
      <div className={`font-display font-bold text-lg ${color}`}>{value}</div>
      <div className="font-mono-cyber text-[8px] uppercase tracking-widest text-slate-500">
        {label}
      </div>
    </div>
  );
}

function FakeCampaignRow({
  name,
  contacts,
  status,
}: {
  name: string;
  contacts: number;
  status: "active" | "paused" | "scheduled";
}) {
  const statusCfg = {
    active: { label: "Ativa", color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
    paused: { label: "Pausada", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
    scheduled: { label: "Agendada", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30" },
  }[status];

  return (
    <div className="flex items-center justify-between p-2.5 bg-cyan-500/[0.03] border border-cyan-500/15 clip-cyber-sm hover:border-cyan-500/30 transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="h-8 w-8 shrink-0 bg-cyan-500/10 border border-cyan-500/30 clip-cyber-sm flex items-center justify-center">
          <MessageSquare className="h-3.5 w-3.5 text-cyan-400" />
        </div>
        <div className="min-w-0">
          <div className="font-mono-cyber text-xs text-white truncate">{name}</div>
          <div className="font-mono-cyber text-[9px] text-slate-500">
            {contacts.toLocaleString("pt-BR")} contatos
          </div>
        </div>
      </div>
      <span className={`px-2 py-0.5 text-[9px] font-mono-cyber uppercase tracking-widest border ${statusCfg.bg} ${statusCfg.color} clip-cyber-sm`}>
        {statusCfg.label}
      </span>
    </div>
  );
}

function MiniFeature({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: typeof Bot;
  title: string;
  description: string;
  color: "cyan" | "green" | "yellow" | "purple";
}) {
  const colors = {
    cyan: "text-cyan-400 border-cyan-500/30 bg-cyan-500/5",
    green: "text-green-400 border-green-500/30 bg-green-500/5",
    yellow: "text-yellow-400 border-yellow-500/30 bg-yellow-500/5",
    purple: "text-purple-400 border-purple-500/30 bg-purple-500/5",
  }[color];

  return (
    <div className={`p-4 border clip-cyber-sm ${colors} hover:scale-[1.02] transition-transform`}>
      <Icon className="h-5 w-5 mb-2" />
      <h4 className="font-display font-bold text-sm text-white mb-1">{title}</h4>
      <p className="text-[11px] text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
