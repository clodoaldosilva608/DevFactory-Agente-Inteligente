"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  CheckCircle2,
  Send,
  Wifi,
  Cloud,
  Radio,
  Zap,
  Bell,
  Terminal,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ConnectionState = "disconnected" | "qr" | "connecting" | "connected";

type Device = {
  id: string;
  name: string;
  type: "desktop" | "mobile" | "tablet";
  os: string;
  status: "online" | "offline" | "syncing";
  lastSeen: string;
  icon: LucideIcon;
};

const mockDevices: Device[] = [
  {
    id: "1",
    name: "PC Principal — Escritório",
    type: "desktop",
    os: "Windows 11 Pro",
    status: "online",
    lastSeen: "Agora",
    icon: Monitor,
  },
  {
    id: "2",
    name: "iPhone 15 Pro",
    type: "mobile",
    os: "iOS 18",
    status: "online",
    lastSeen: "Agora",
    icon: Smartphone,
  },
  {
    id: "3",
    name: "MacBook Air M3",
    type: "desktop",
    os: "macOS Sonoma",
    status: "syncing",
    lastSeen: "2 min atrás",
    icon: Monitor,
  },
  {
    id: "4",
    name: "iPad Pro 12.9",
    type: "tablet",
    os: "iPadOS 18",
    status: "offline",
    lastSeen: "2 dias atrás",
    icon: Tablet,
  },
];

const recentCommands = [
  { cmd: "Abrir VS Code no PC principal", from: "iPhone 15 Pro", time: "há 5 min", status: "success" },
  { cmd: "Iniciar backup automático", from: "Agendador", time: "há 12 min", status: "success" },
  { cmd: "Capturar screenshot e enviar", from: "PC Principal", time: "há 28 min", status: "success" },
  { cmd: "Mutar microfone do PC", from: "iPhone 15 Pro", time: "há 1h", status: "success" },
  { cmd: "Encerrar Chrome", from: "iPad Pro", time: "há 2h", status: "success" },
];

export function CommandsSection() {
  const [pairing, setPairing] = useState(false);
  const [pairingCode, setPairingCode] = useState<string | null>(null);

  const handlePairDevice = () => {
    setPairing(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setPairingCode(code);
    toast.info("Gerando código de pareamento...", {
      description: `Código: ${code} (válido por 5 minutos)`,
    });
    setTimeout(() => {
      setPairing(false);
      toast.success("Dispositivo pareado!", {
        description: "Novo dispositivo conectado à sua conta.",
      });
      setPairingCode(null);
    }, 4000);
  };

  return (
    <section id="comandos" className="relative py-24 px-4 sm:px-6 lg:px-8">
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
            <Radio className="h-3 w-3" />
            Comandos Remotos
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display font-bold text-3xl sm:text-5xl text-white"
          >
            Controle seus{" "}
            <span className="text-cyan-400 text-glow-cyan">dispositivos</span> de
            qualquer lugar
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 max-w-2xl mx-auto text-slate-400 text-base sm:text-lg"
          >
            Pareie todos os seus dispositivos (PC, celular, tablet) e execute
            comandos remotos com sincronização em tempo real via nuvem.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Devices + pairing */}
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
                  Dispositivos Conectados
                </h3>
              </div>
              <Button
                onClick={handlePairDevice}
                disabled={pairing}
                className="bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm glow-cyan-sm transition-all"
              >
                {pairing ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Pareando...
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5 mr-1.5" fill="currentColor" />
                    Parear Novo
                  </>
                )}
              </Button>
            </div>

            {/* Pairing code display */}
            {pairingCode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-4 bg-cyan-500/5 border border-cyan-500/30 clip-cyber-sm text-center"
              >
                <p className="font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400 mb-2">
                  Código de Pareamento
                </p>
                <p className="font-display font-bold text-3xl text-cyan-300 tracking-[0.3em] glow-cyan-sm">
                  {pairingCode}
                </p>
                <p className="mt-2 font-mono-cyber text-[10px] text-slate-500">
                  Digite este código no novo dispositivo
                </p>
              </motion.div>
            )}

            {/* Devices list */}
            <div className="space-y-2.5">
              {mockDevices.map((device, idx) => (
                <motion.div
                  key={device.id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-3 bg-cyan-500/[0.03] border border-cyan-500/15 clip-cyber-sm hover:border-cyan-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 shrink-0 bg-cyan-500/10 border border-cyan-500/30 clip-cyber-sm flex items-center justify-center">
                      <device.icon className="h-4 w-4 text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-mono-cyber text-xs text-white truncate">
                        {device.name}
                      </div>
                      <div className="font-mono-cyber text-[9px] text-slate-500">
                        {device.os} • {device.lastSeen}
                      </div>
                    </div>
                  </div>
                  <DeviceStatusBadge status={device.status} />
                </motion.div>
              ))}
            </div>

            {/* Cloud sync info */}
            <div className="mt-6 pt-6 border-t border-cyan-500/20 grid grid-cols-3 gap-3">
              <SyncStat icon={Cloud} label="Sincronização" value="Tempo Real" />
              <SyncStat icon={Wifi} label="Conexão" value="P2P + Cloud" />
              <SyncStat icon={Bell} label="Notificações" value="Push" />
            </div>
          </motion.div>

          {/* Right: Recent commands + features */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-4"
          >
            {/* Recent commands */}
            <div className="glass-panel-strong clip-cyber p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-cyan-400" />
                  <h3 className="font-display font-bold text-lg text-white">
                    Comandos Recentes
                  </h3>
                </div>
                <span className="font-mono-cyber text-[9px] uppercase tracking-widest text-green-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  Ao Vivo
                </span>
              </div>

              <div className="space-y-2">
                {recentCommands.map((cmd, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2.5 bg-cyan-500/[0.03] border border-cyan-500/15 clip-cyber-sm"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono-cyber text-[11px] text-white truncate">
                        {cmd.cmd}
                      </div>
                      <div className="font-mono-cyber text-[9px] text-slate-500">
                        via <span className="text-cyan-400">{cmd.from}</span> • {cmd.time}
                      </div>
                    </div>
                    <ChevronRight className="h-3 w-3 text-slate-600" />
                  </div>
                ))}
              </div>

              <Button
                onClick={() => toast.success("Abrindo terminal de comandos...")}
                className="w-full mt-4 bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm glow-cyan-sm"
              >
                <Terminal className="h-3.5 w-3.5 mr-1.5" />
                Abrir Terminal Remoto
              </Button>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-3">
              <MiniFeature
                icon={Send}
                title="Comandos Remotos"
                description="Execute qualquer ação no PC a partir do celular, em tempo real."
                color="cyan"
              />
              <MiniFeature
                icon={Cloud}
                title="Sync na Nuvem"
                description="Histórico e configurações sincronizados entre todos dispositivos."
                color="purple"
              />
              <MiniFeature
                icon={Radio}
                title="P2P direto"
                description="Quando possível, conexão direta entre dispositivos (menor latência)."
                color="green"
              />
              <MiniFeature
                icon={Bell}
                title="Notificações Push"
                description="Receba alertas do PC no celular: tarefas concluídas, erros, eventos."
                color="yellow"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function DeviceStatusBadge({ status }: { status: Device["status"] }) {
  const cfg = {
    online: { label: "Online", color: "text-green-400", dot: "bg-green-400 animate-pulse" },
    syncing: { label: "Sincronizando", color: "text-yellow-400", dot: "bg-yellow-400 animate-pulse" },
    offline: { label: "Offline", color: "text-slate-400", dot: "bg-slate-500" },
  }[status];

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 glass-panel clip-cyber-sm shrink-0">
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      <span className={`font-mono-cyber text-[9px] uppercase tracking-widest ${cfg.color}`}>
        {cfg.label}
      </span>
    </div>
  );
}

function SyncStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="text-center">
      <Icon className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
      <div className="font-mono-cyber text-[10px] uppercase tracking-widest text-slate-500">
        {label}
      </div>
      <div className="font-mono-cyber text-[10px] text-cyan-300 font-bold mt-0.5">
        {value}
      </div>
    </div>
  );
}

function MiniFeature({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: LucideIcon;
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
