"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  QrCode,
  RefreshCw,
  CheckCircle2,
  Send,
  Users,
  Plus,
  MoreVertical,
  Phone,
  Activity,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type ConnectionState = "disconnected" | "qr" | "connecting" | "connected";

export function WhatsAppHome({ sessions, campaigns, contacts }: { sessions: any[]; campaigns: any[]; contacts: any[] }) {
  const [showQR, setShowQR] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleNewSession = () => {
    setShowQR(true);
    toast.info("Iniciando conexão WhatsApp", {
      description: "Gere o QR Code e escaneie com seu celular.",
    });
  };

  const handleGenerateQR = () => {
    setConnecting(true);
    toast.success("QR Code gerado!", {
      description: "Escaneie em até 45s. (DEMO: conexão simulada)",
    });
    setTimeout(() => {
      setConnecting(false);
      setShowQR(false);
      toast.success("WhatsApp conectado!", {
        description: "+55 11 9****-**** está online.",
      });
    }, 4000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            WhatsApp{" "}
            <span className="text-green-400 text-glow-cyan">BotZapBR</span>
          </h1>
          <p className="mt-1 font-mono-cyber text-xs uppercase tracking-widest text-slate-500">
            Gerencie sessões, campanhas e contatos
          </p>
        </div>
        <Button
          onClick={handleNewSession}
          className="bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm glow-cyan-sm"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Nova Sessão
        </Button>
      </motion.div>

      {/* KPIs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Stat label="Sessões" value={sessions.length} icon={MessageSquare} color="text-cyan-400" />
        <Stat label="Online" value={sessions.filter(s => s.status === "CONNECTED").length} icon={Activity} color="text-green-400" />
        <Stat label="Campanhas" value={campaigns.length} icon={Send} color="text-yellow-400" />
        <Stat label="Contatos" value={contacts.length} icon={Users} color="text-purple-400" />
      </motion.div>

      {/* QR Modal */}
      {showQR && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel-strong clip-cyber p-6 glow-cyan max-w-md mx-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <QrCode className="h-4 w-4 text-cyan-400" />
              <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-cyan-400">
                Conectar WhatsApp
              </h3>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowQR(false)}
              className="p-1 text-slate-500 hover:text-red-400"
            >
              ✕
            </Button>
          </div>

          <div className="flex flex-col items-center py-4">
            <div className="relative h-56 w-56 bg-black border-2 border-cyan-500/40 clip-cyber p-3 flex items-center justify-center glow-cyan-sm">
              {connecting ? (
                <RefreshCw className="h-16 w-16 text-cyan-400 animate-spin" />
              ) : (
                <FakeQRCode />
              )}
              {connecting && (
                <motion.div
                  className="absolute left-2 right-2 h-px bg-cyan-400"
                  style={{ boxShadow: "0 0 12px #00f0ff" }}
                  animate={{ top: ["8%", "92%", "8%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </div>
            <Button
              onClick={handleGenerateQR}
              disabled={connecting}
              className="mt-4 bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm glow-cyan-sm"
            >
              <QrCode className="h-3.5 w-3.5 mr-1.5" />
              {connecting ? "Conectando..." : "Gerar QR Code"}
            </Button>
          </div>

          <div className="mt-4 pt-4 border-t border-cyan-500/20 space-y-1.5 text-[11px] font-mono-cyber text-slate-400">
            <p><span className="text-cyan-400 font-bold">01.</span> Abra WhatsApp → Configurações → Aparelhos conectados</p>
            <p><span className="text-cyan-400 font-bold">02.</span> Toque em "Conectar um aparelho"</p>
            <p><span className="text-cyan-400 font-bold">03.</span> Escaneie o QR Code acima</p>
          </div>
        </motion.div>
      )}

      {/* Sessions list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel clip-cyber p-5"
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-500/20">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-cyan-400" />
              <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-cyan-400">
                Sessões
              </h3>
            </div>
          </div>
          {sessions.length === 0 ? (
            <div className="py-8 text-center">
              <MessageSquare className="h-10 w-10 text-slate-700 mx-auto mb-2" />
              <p className="font-mono-cyber text-xs text-slate-500 mb-3">
                Nenhuma sessão ainda
              </p>
              <Button
                onClick={handleNewSession}
                className="bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-[10px] uppercase tracking-widest clip-cyber-sm"
              >
                <Plus className="h-3 w-3 mr-1.5" />
                Conectar primeira sessão
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => (
                <SessionCard key={s.id} session={s} />
              ))}
            </div>
          )}
        </motion.div>

        {/* Campaigns */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel clip-cyber p-5"
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-500/20">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-cyan-400" />
              <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-cyan-400">
                Campanhas
              </h3>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => toast.info("Criar campanha", { description: "Modal de criação em breve" })}
              className="text-cyan-400 hover:bg-cyan-500/10 font-mono-cyber text-[10px] uppercase tracking-widest"
            >
              <Plus className="h-3 w-3 mr-1" />
              Nova
            </Button>
          </div>
          {campaigns.length === 0 ? (
            <div className="py-8 text-center">
              <Send className="h-10 w-10 text-slate-700 mx-auto mb-2" />
              <p className="font-mono-cyber text-xs text-slate-500">
                Nenhuma campanha criada
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {campaigns.slice(0, 5).map((c) => (
                <CampaignRow key={c.id} campaign={c} />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent contacts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-panel clip-cyber p-5"
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-cyan-400" />
            <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-cyan-400">
              Contatos Recentes
            </h3>
          </div>
        </div>
        {contacts.length === 0 ? (
          <div className="py-8 text-center">
            <Users className="h-10 w-10 text-slate-700 mx-auto mb-2" />
            <p className="font-mono-cyber text-xs text-slate-500">
              Conecte um WhatsApp para sincronizar contatos
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {contacts.slice(0, 12).map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2.5 p-2.5 bg-cyan-500/[0.03] border border-cyan-500/15 clip-cyber-sm hover:border-cyan-500/30 transition-colors"
              >
                <div className="h-8 w-8 shrink-0 bg-cyan-500/10 border border-cyan-500/30 clip-cyber-sm flex items-center justify-center">
                  <Phone className="h-3 w-3 text-cyan-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-mono-cyber text-xs text-white truncate">
                    {c.name || c.phoneNumber}
                  </div>
                  <div className="font-mono-cyber text-[9px] text-slate-500">
                    {c.phoneNumber}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Demo notice */}
      <div className="p-3 bg-blue-500/5 border border-blue-500/20 clip-cyber-sm flex items-start gap-2">
        <Activity className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-[11px] font-mono-cyber text-blue-300 leading-relaxed">
          <span className="font-bold">DEMO:</span> Integração real com whatsapp-web.js (Puppeteer)
          disponível após configurar servidor Node separado em <code className="px-1 py-0.5 bg-blue-500/10 rounded">services/whatsapp-server/</code>.
          Consulte a documentação técnica para detalhes.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  return (
    <div className="p-4 glass-panel clip-cyber-sm border-cyan-500/20">
      <Icon className={`h-4 w-4 ${color} mb-2`} />
      <div className={`font-display font-bold text-2xl ${color}`}>{value}</div>
      <div className="font-mono-cyber text-[10px] uppercase tracking-widest text-slate-500">{label}</div>
    </div>
  );
}

function SessionCard({ session }: { session: any }) {
  const statusCfg = {
    CONNECTED: { label: "Online", color: "text-green-400", dot: "bg-green-400 animate-pulse", border: "border-green-500/30 bg-green-500/5" },
    QR_PENDING: { label: "QR Pendente", color: "text-yellow-400", dot: "bg-yellow-400 animate-pulse", border: "border-yellow-500/30 bg-yellow-500/5" },
    CONNECTING: { label: "Conectando", color: "text-cyan-400", dot: "bg-cyan-400 animate-pulse", border: "border-cyan-500/30 bg-cyan-500/5" },
    DISCONNECTED: { label: "Offline", color: "text-slate-400", dot: "bg-slate-500", border: "border-slate-700 bg-slate-500/5" },
    BANNED: { label: "Banido", color: "text-red-400", dot: "bg-red-400", border: "border-red-500/30 bg-red-500/5" },
    ERROR: { label: "Erro", color: "text-red-400", dot: "bg-red-400", border: "border-red-500/30 bg-red-500/5" },
  }[session.status as string] || { label: session.status, color: "text-slate-400", dot: "bg-slate-500", border: "border-slate-700" };

  return (
    <div className={`p-3 border clip-cyber-sm ${statusCfg.border}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 bg-black/40 border border-cyan-500/30 clip-cyber-sm flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <div className="font-mono-cyber text-xs text-white">
              {session.phoneNumber || session.sessionName}
            </div>
            <div className="font-mono-cyber text-[9px] text-slate-500">
              Conectado em {session.connectedAt ? new Date(session.connectedAt).toLocaleDateString("pt-BR") : "—"}
            </div>
          </div>
        </div>
        <button className="p-1 text-slate-500 hover:text-cyan-400">
          <MoreVertical className="h-3 w-3" />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
          <span className={`font-mono-cyber text-[9px] uppercase tracking-widest ${statusCfg.color}`}>
            {statusCfg.label}
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono-cyber text-[9px] text-slate-500">
          <span><span className="text-cyan-400">{session.messagesSent}</span> env</span>
          <span><span className="text-green-400">{session.messagesReceived}</span> rec</span>
        </div>
      </div>
    </div>
  );
}

function CampaignRow({ campaign }: { campaign: any }) {
  const statusCfg = {
    RUNNING: { label: "Ativa", color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
    DRAFT: { label: "Rascunho", color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/30" },
    SCHEDULED: { label: "Agendada", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30" },
    PAUSED: { label: "Pausada", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
    COMPLETED: { label: "Concluída", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30" },
    FAILED: { label: "Falhou", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
  }[campaign.status as string] || { label: campaign.status, color: "text-slate-400", bg: "bg-slate-500/10" };

  return (
    <div className="flex items-center justify-between p-2.5 bg-cyan-500/[0.03] border border-cyan-500/15 clip-cyber-sm hover:border-cyan-500/30 transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="h-8 w-8 shrink-0 bg-cyan-500/10 border border-cyan-500/30 clip-cyber-sm flex items-center justify-center">
          <Send className="h-3.5 w-3.5 text-cyan-400" />
        </div>
        <div className="min-w-0">
          <div className="font-mono-cyber text-xs text-white truncate">{campaign.name}</div>
          <div className="font-mono-cyber text-[9px] text-slate-500">
            {campaign.sentCount}/{campaign.recipientCount} enviadas
          </div>
        </div>
      </div>
      <span className={`px-2 py-0.5 text-[9px] font-mono-cyber uppercase tracking-widest border ${statusCfg.bg} ${statusCfg.color} clip-cyber-sm shrink-0`}>
        {statusCfg.label}
      </span>
    </div>
  );
}

function FakeQRCode() {
  const cells = Array.from({ length: 25 * 25 }, (_, i) => {
    const x = i % 25;
    const y = Math.floor(i / 25);
    const isCorner =
      (x < 7 && y < 7) || (x >= 18 && y < 7) || (x < 7 && y >= 18);
    if (isCorner) {
      const cx = x < 7 ? 3 : 21;
      const cy = y < 7 ? 3 : 21;
      const dist = Math.max(Math.abs(x - cx), Math.abs(y - cy));
      return dist === 0 || dist === 2 || dist === 3;
    }
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
