"use client";

import { motion } from "framer-motion";
import {
  Activity,
  MessageSquare,
  Users,
  Send,
  TrendingUp,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Server,
} from "lucide-react";
import { TelemetryPanel } from "./telemetry-panel";
import { LogsTerminal } from "./logs-terminal";
import { RadarDisplay } from "./radar-display";

type Props = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    createdAt: Date;
  } | null;
  org: any;
  whatsappSessions: any[];
  campaigns: any[];
  recentMessages: any[];
  commandLogs: any[];
};

export function DashboardHome({
  user,
  org,
  whatsappSessions,
  campaigns,
  recentMessages,
  commandLogs,
}: Props) {
  const connectedSessions = whatsappSessions.filter((s) => s.status === "CONNECTED").length;
  const activeCampaigns = campaigns.filter((c) => c.status === "RUNNING").length;
  const totalContacts = org?._count?.contacts || 0;
  const totalMessages = org?._count?.campaigns || 0;

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
            Bem-vindo,{" "}
            <span className="text-cyan-400 text-glow-cyan">
              {user?.name?.split(" ")[0] || "Chefe"}
            </span>
          </h1>
          <p className="mt-1 font-mono-cyber text-xs uppercase tracking-widest text-slate-500">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        {org?.subscriptions?.[0]?.status === "TRIALING" && (
          <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/40 clip-cyber-sm">
            <Clock className="h-4 w-4 text-yellow-400" />
            <div>
              <div className="font-mono-cyber text-[10px] uppercase tracking-widest text-yellow-400">
                Trial ativo
              </div>
              <div className="font-mono-cyber text-[11px] text-yellow-300">
                {org.trialEndsAt
                  ? `${Math.ceil((org.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias restantes`
                  : "—"}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* KPI grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <KpiCard
          label="WhatsApp Conectados"
          value={connectedSessions}
          total={whatsappSessions.length}
          icon={MessageSquare}
          color="cyan"
          trend="+2 hoje"
        />
        <KpiCard
          label="Campanhas Ativas"
          value={activeCampaigns}
          total={campaigns.length}
          icon={Send}
          color="green"
          trend="+12% semana"
        />
        <KpiCard
          label="Contatos Totais"
          value={totalContacts}
          icon={Users}
          color="purple"
          trend="+89 hoje"
        />
        <KpiCard
          label="Mensagens Enviadas"
          value={recentMessages.length}
          icon={TrendingUp}
          color="yellow"
          trend="+24% mês"
        />
      </motion.div>

      {/* Main HUD grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-4">
        {/* Left: Telemetry */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel clip-cyber p-5"
        >
          <TelemetryPanel />
        </motion.div>

        {/* Center: Radar + status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel clip-cyber p-6 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.04),transparent_70%)]"
        >
          <div className="w-full max-w-sm">
            <RadarDisplay status="active" />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
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
          <div className="mt-4 flex items-center gap-2 px-3 py-1.5 glass-panel clip-cyber-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="font-mono-cyber text-[10px] uppercase tracking-widest text-red-400">
              Microfone Silenciado
            </span>
          </div>
        </motion.div>

        {/* Right: Logs */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel clip-cyber p-5"
        >
          <LogsTerminal />
        </motion.div>
      </div>

      {/* Bottom: WhatsApp sessions + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* WhatsApp sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel clip-cyber p-5"
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-500/20">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-cyan-400" />
              <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-cyan-400">
                Sessões WhatsApp
              </h3>
            </div>
            <a
              href="/whatsapp"
              className="font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400 hover:text-cyan-300"
            >
              Ver todas →
            </a>
          </div>
          {whatsappSessions.length === 0 ? (
            <div className="py-8 text-center">
              <MessageSquare className="h-10 w-10 text-slate-700 mx-auto mb-2" />
              <p className="font-mono-cyber text-xs text-slate-500 mb-3">
                Nenhuma sessão conectada
              </p>
              <a
                href="/whatsapp"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-[10px] uppercase tracking-widest clip-cyber-sm transition-all"
              >
                <Zap className="h-3 w-3" fill="currentColor" />
                Conectar agora
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              {whatsappSessions.slice(0, 4).map((s) => (
                <SessionRow key={s.id} session={s} />
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-panel clip-cyber p-5"
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-500/20">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-cyan-400">
                Atividade Recente
              </h3>
            </div>
            <span className="font-mono-cyber text-[9px] uppercase tracking-widest text-slate-500">
              {commandLogs.length} comandos
            </span>
          </div>
          {commandLogs.length === 0 ? (
            <div className="py-8 text-center">
              <Activity className="h-10 w-10 text-slate-700 mx-auto mb-2" />
              <p className="font-mono-cyber text-xs text-slate-500">
                Nenhuma atividade ainda
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto scroll-cyber">
              {commandLogs.map((log) => (
                <ActivityRow key={log.id} log={log} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  total,
  icon: Icon,
  color,
  trend,
}: {
  label: string;
  value: number | string;
  total?: number;
  icon: typeof Cpu;
  color: "cyan" | "green" | "yellow" | "purple";
  trend?: string;
}) {
  const colors = {
    cyan: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30" },
    green: { text: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" },
    yellow: { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
    purple: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
  }[color];

  return (
    <div className={`relative p-4 glass-panel clip-cyber-sm ${colors.border} overflow-hidden`}>
      <div className={`absolute -top-6 -right-6 h-20 w-20 ${colors.bg} rounded-full blur-2xl`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-1.5 ${colors.bg} ${colors.border} border clip-cyber-sm`}>
            <Icon className={`h-3.5 w-3.5 ${colors.text}`} />
          </div>
          {trend && (
            <span className="font-mono-cyber text-[9px] uppercase tracking-widest text-slate-500">
              {trend}
            </span>
          )}
        </div>
        <div className={`font-display font-bold text-2xl ${colors.text}`}>
          {value}
          {total !== undefined && (
            <span className="text-sm text-slate-600 ml-1">/{total}</span>
          )}
        </div>
        <div className="font-mono-cyber text-[10px] uppercase tracking-widest text-slate-500 mt-0.5">
          {label}
        </div>
      </div>
    </div>
  );
}

function SessionRow({ session }: { session: any }) {
  const status = {
    CONNECTED: { label: "Online", color: "text-green-400", dot: "bg-green-400 animate-pulse" },
    QR_PENDING: { label: "Aguardando QR", color: "text-yellow-400", dot: "bg-yellow-400 animate-pulse" },
    CONNECTING: { label: "Conectando", color: "text-cyan-400", dot: "bg-cyan-400 animate-pulse" },
    DISCONNECTED: { label: "Offline", color: "text-slate-400", dot: "bg-slate-500" },
    BANNED: { label: "Banido", color: "text-red-400", dot: "bg-red-400" },
    ERROR: { label: "Erro", color: "text-red-400", dot: "bg-red-400" },
  }[session.status as string] || { label: session.status, color: "text-slate-400", dot: "bg-slate-500" };

  return (
    <div className="flex items-center justify-between p-2.5 bg-cyan-500/[0.03] border border-cyan-500/15 clip-cyber-sm hover:border-cyan-500/30 transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="h-8 w-8 shrink-0 bg-cyan-500/10 border border-cyan-500/30 clip-cyber-sm flex items-center justify-center">
          <MessageSquare className="h-3.5 w-3.5 text-cyan-400" />
        </div>
        <div className="min-w-0">
          <div className="font-mono-cyber text-xs text-white truncate">
            {session.phoneNumber || session.sessionName}
          </div>
          <div className="font-mono-cyber text-[9px] text-slate-500">
            {session.messagesSent} enviadas • {session.messagesReceived} recebidas
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
        <span className={`font-mono-cyber text-[9px] uppercase tracking-widest ${status.color}`}>
          {status.label}
        </span>
      </div>
    </div>
  );
}

function ActivityRow({ log }: { log: any }) {
  const statusIcon = {
    SUCCESS: <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />,
    ERROR: <AlertCircle className="h-3.5 w-3.5 text-red-400" />,
    TIMEOUT: <Clock className="h-3.5 w-3.5 text-yellow-400" />,
    PENDING: <Clock className="h-3.5 w-3.5 text-cyan-400" />,
  }[log.status as string] || <Activity className="h-3.5 w-3.5 text-slate-400" />;

  return (
    <div className="flex items-start gap-2.5 p-2 hover:bg-cyan-500/[0.03] transition-colors">
      <div className="mt-0.5 shrink-0">{statusIcon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-mono-cyber text-[11px] text-cyan-100 truncate">
          {log.command}
        </div>
        <div className="font-mono-cyber text-[9px] text-slate-500">
          {new Date(log.createdAt).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
          {log.duration ? ` • ${log.duration}ms` : ""}
        </div>
      </div>
    </div>
  );
}
