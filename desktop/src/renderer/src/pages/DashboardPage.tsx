import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Minus,
  Square,
  X,
  Cpu,
  MemoryStick,
  Thermometer,
  Activity,
  HardDrive,
  Wifi,
  Terminal,
  Mic,
  MicOff,
  Power,
  Settings as SettingsIcon,
  Monitor,
  Clock,
  Send,
  HelpCircle,
  Brain,
  Smartphone,
} from "lucide-react";

type Telemetry = {
  timestamp: number;
  cpu: { usage: number; cores: number[] };
  memory: { total: number; used: number; active: number; usage: number };
  temperature: { cpu: number | null; max: number | null };
  network: { rx_sec: number; tx_sec: number; interfaces: number };
  gpu: { model: string; vendor: string; vram: number }[];
  disk: { fs: string; mount: string; size: number; used: number; available: number; usage: number }[];
  uptime: number;
  loadAvg: number[];
};

type LogLine = {
  id: number;
  type: "SYS" | "OK" | "WARN" | "BOT" | "AI";
  text: string;
  time: string;
};

const seedLogs: Omit<LogLine, "id" | "time">[] = [
  { type: "SYS", text: "DevFactory ativo. Inicializando protocolos..." },
  { type: "OK", text: "Telemetria do sistema iniciada." },
  { type: "OK", text: "Sessão sincronizada com cloud." },
  { type: "AI", text: "IA Gemini carregada. Pronta para comandos." },
  { type: "SYS", text: "Microfone detectado: Default Audio Device" },
  { type: "WARN", text: "Dispositivo mobile não pareado." },
  { type: "BOT", text: "Scheduler ativo: 3 tarefas agendadas." },
];

const logColors = {
  SYS: "text-cyan-400",
  OK: "text-green-400",
  WARN: "text-yellow-400",
  BOT: "text-purple-400",
  AI: "text-yellow-400",
};

const logLabels = {
  SYS: "SYS",
  OK: "OK",
  WARN: "WARN",
  BOT: "BOT",
  AI: "AI",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [micOn, setMicOn] = useState(false);
  const [clock, setClock] = useState(new Date());
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [command, setCommand] = useState("");
  const logCounter = useRef(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Start telemetry polling
  useEffect(() => {
    window.devfactory.telemetry.start();
    const unsub = window.devfactory.telemetry.onUpdate((snap) => {
      setTelemetry(snap);
    });
    return () => {
      unsub();
      window.devfactory.telemetry.stop();
    };
  }, []);

  // Clock
  useEffect(() => {
    const i = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  // Seed logs
  useEffect(() => {
    const now = Date.now();
    const initial = seedLogs.map((l, i) => ({
      ...l,
      id: i,
      time: new Date(now - (seedLogs.length - i) * 5000).toLocaleTimeString("pt-BR", { hour12: false }),
    }));
    setLogs(initial);
    logCounter.current = seedLogs.length;
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    const newLog: LogLine = {
      id: logCounter.current++,
      type: "SYS",
      text: `> ${command}`,
      time: clock.toLocaleTimeString("pt-BR", { hour12: false }),
    };
    setLogs((prev) => [...prev.slice(-30), newLog]);
    // Try to execute as app open
    const cmd = command.toLowerCase().trim();
    const appMatch = cmd.match(/abrir\s+(\w+)/);
    if (appMatch) {
      const appName = appMatch[1];
      window.devfactory.exec
        .openApp(appName)
        .then(() => {
          setLogs((prev) => [
            ...prev,
            {
              id: logCounter.current++,
              type: "OK",
              text: `${appName} iniciado com sucesso.`,
              time: new Date().toLocaleTimeString("pt-BR", { hour12: false }),
            },
          ]);
        })
        .catch((err) => {
          setLogs((prev) => [
            ...prev,
            {
              id: logCounter.current++,
              type: "WARN",
              text: `Falha ao abrir ${appName}: ${err.message}`,
              time: new Date().toLocaleTimeString("pt-BR", { hour12: false }),
            },
          ]);
        });
    } else {
      setLogs((prev) => [
        ...prev,
        {
          id: logCounter.current++,
          type: "AI",
          text: `Comando não reconhecido. Tente: "abrir vscode", "abrir chrome"`,
          time: new Date().toLocaleTimeString("pt-BR", { hour12: false }),
        },
      ]);
    }
    setCommand("");
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("devfactory_token");
    await window.devfactory.auth.logout(token || undefined);
    localStorage.removeItem("devfactory_token");
    localStorage.removeItem("devfactory_user");
    navigate("/login");
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(0)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  };

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#050811] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, rgba(0, 240, 255, 0.08) 0%, transparent 50%)," +
            "radial-gradient(circle at 80% 70%, rgba(255, 51, 51, 0.06) 0%, transparent 50%)",
        }}
      />

      {/* Title bar */}
      <div className="titlebar-drag relative z-20 h-9 bg-black/60 backdrop-blur-md flex items-center justify-between px-3 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center bg-black border border-cyan-500/40 clip-cyber-sm">
            <Zap className="h-3 w-3 text-cyan-400" fill="currentColor" />
          </div>
          <span className="font-display font-bold text-xs tracking-widest text-cyan-400">
            DevFactory
          </span>
          <span className="font-mono-cyber text-[9px] uppercase tracking-widest text-slate-500 ml-2">
            v3.7.2 — Comando & Controle
          </span>
        </div>
        <div className="titlebar-no-drag flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-mono-cyber text-[10px] text-cyan-400">
            <Clock className="h-3 w-3" />
            <span className="tabular-nums">{clock.toLocaleTimeString("pt-BR", { hour12: false })}</span>
          </div>
          <button
            onClick={() => navigate("/aichat")}
            className="p-1.5 hover:bg-cyan-500/10 transition-colors titlebar-no-drag"
            title="AI Chat"
          >
            <Brain className="h-3.5 w-3.5 text-slate-400 hover:text-cyan-400" />
          </button>
          <button
            onClick={() => navigate("/devices")}
            className="p-1.5 hover:bg-cyan-500/10 transition-colors titlebar-no-drag"
            title="Dispositivos & Sync"
          >
            <Smartphone className="h-3.5 w-3.5 text-slate-400 hover:text-cyan-400" />
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="p-1.5 hover:bg-cyan-500/10 transition-colors titlebar-no-drag"
            title="Configurações"
          >
            <SettingsIcon className="h-3.5 w-3.5 text-slate-400 hover:text-cyan-400" />
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="p-1.5 hover:bg-cyan-500/10 transition-colors titlebar-no-drag"
            title="Ajuda"
          >
            <HelpCircle className="h-3.5 w-3.5 text-slate-400 hover:text-cyan-400" />
          </button>
          <div className="flex items-center gap-1 ml-1">
            <button
              onClick={() => window.devfactory.app.minimize()}
              className="p-1.5 hover:bg-cyan-500/10"
            >
              <Minus className="h-3 w-3 text-slate-400" />
            </button>
            <button
              onClick={() => window.devfactory.app.maximize()}
              className="p-1.5 hover:bg-cyan-500/10"
            >
              <Square className="h-2.5 w-2.5 text-slate-400" />
            </button>
            <button
              onClick={() => window.devfactory.app.close()}
              className="p-1.5 hover:bg-red-500/20"
            >
              <X className="h-3 w-3 text-slate-400 hover:text-red-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Status ticker */}
      <div className="relative z-10 h-7 overflow-hidden border-b border-cyan-500/20 bg-cyan-500/[0.02]">
        <div className="flex whitespace-nowrap py-1.5 animate-ticker font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400/70">
          {Array.from({ length: 4 }).map((_, k) => (
            <span key={k} className="flex">
              <span className="px-4">SISTEMA OPERACIONAL</span>
              <span className="px-4 text-slate-600">|</span>
              <span className="px-4 text-green-400">● DEVFACTORY ONLINE</span>
              <span className="px-4 text-slate-600">|</span>
              <span className="px-4 text-yellow-400">{micOn ? "● MICROFONE ATIVO" : "⚠ MICROFONE SILANCIADO"}</span>
              <span className="px-4 text-slate-600">|</span>
              <span className="px-4">CPU: {telemetry?.cpu.usage || 0}%</span>
              <span className="px-4 text-slate-600">|</span>
              <span className="px-4">RAM: {telemetry?.memory.usage || 0}%</span>
              <span className="px-4 text-slate-600">|</span>
              <span className="px-4">UPTIME: {telemetry ? formatUptime(telemetry.uptime) : "00:00:00"}</span>
              <span className="px-4 text-slate-600">|</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main HUD grid */}
      <div className="relative z-10 flex-1 grid grid-cols-[260px_1fr_320px] gap-0 overflow-hidden">
        {/* Left: Telemetry */}
        <div className="p-4 border-r border-cyan-500/20 bg-black/30 overflow-y-auto scroll-cyber">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-cyan-500/20">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              <span className="font-mono-cyber text-xs uppercase tracking-widest text-cyan-400">
                Telemetria
              </span>
            </div>
            <span className="flex items-center gap-1 font-mono-cyber text-[9px] uppercase tracking-widest text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              LIVE
            </span>
          </div>

          <div className="space-y-3">
            <MetricBar
              icon={Cpu}
              label="CPU"
              value={telemetry?.cpu.usage || 0}
              max={100}
              unit="%"
              color="#00f0ff"
            />
            <MetricBar
              icon={MemoryStick}
              label="RAM"
              value={telemetry?.memory.usage || 0}
              max={100}
              unit="%"
              color="#39ff14"
              sub={telemetry ? `${formatBytes(telemetry.memory.active)} / ${formatBytes(telemetry.memory.total)}` : ""}
            />
            <MetricBar
              icon={Thermometer}
              label="TEMP"
              value={telemetry?.temperature.cpu || 0}
              max={100}
              unit="°C"
              color="#ffae00"
            />
            <MetricBar
              icon={Wifi}
              label="REDE ↓"
              value={telemetry ? Math.round(telemetry.network.rx_sec / 1024) : 0}
              max={1000}
              unit="KB/s"
              color="#b400ff"
            />
            <MetricBar
              icon={Wifi}
              label="REDE ↑"
              value={telemetry ? Math.round(telemetry.network.tx_sec / 1024) : 0}
              max={1000}
              unit="KB/s"
              color="#ff3333"
            />
          </div>

          {/* Disks */}
          {telemetry?.disk && telemetry.disk.length > 0 && (
            <div className="mt-4 pt-4 border-t border-cyan-500/20">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="h-3.5 w-3.5 text-cyan-400" />
                <span className="font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400">
                  Discos
                </span>
              </div>
              {telemetry.disk.slice(0, 3).map((d, i) => (
                <div key={i} className="mb-2">
                  <div className="flex justify-between font-mono-cyber text-[10px] mb-0.5">
                    <span className="text-slate-400">{d.mount}</span>
                    <span className="text-cyan-300">{d.usage}%</span>
                  </div>
                  <div className="h-1 bg-cyan-500/10 overflow-hidden clip-cyber-sm">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300"
                      style={{ width: `${d.usage}%` }}
                    />
                  </div>
                  <div className="font-mono-cyber text-[9px] text-slate-500 mt-0.5">
                    {formatBytes(d.used)} / {formatBytes(d.size)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Status grid */}
          <div className="mt-4 pt-4 border-t border-cyan-500/20 grid grid-cols-2 gap-2">
            <StatusBox label="Sistema" value="ATIVO" color="green" />
            <StatusBox label="Uptime" value={telemetry ? formatUptime(telemetry.uptime) : "—"} color="cyan" />
            <StatusBox label="IA" value="GEMINI" color="yellow" />
            <StatusBox label="Cloud" value="SYNC" color="cyan" />
          </div>
        </div>

        {/* Center: Radar + commands */}
        <div className="relative p-6 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.04),transparent_70%)] overflow-y-auto scroll-cyber">
          <div className="absolute inset-0 bg-grid-fine opacity-20 pointer-events-none" />
          <RadarDisplay active={micOn} />
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
          <div className="mt-3 flex items-center gap-2 px-3 py-1.5 glass-panel clip-cyber-sm">
            <span className={`h-2 w-2 rounded-full ${micOn ? "bg-green-400 animate-pulse" : "bg-red-500 animate-pulse"}`} />
            <span className={`font-mono-cyber text-[10px] uppercase tracking-widest ${micOn ? "text-green-400" : "text-red-400"}`}>
              {micOn ? "Microfone Ativo" : "Microfone Silenciado"}
            </span>
          </div>
        </div>

        {/* Right: Logs */}
        <div className="p-4 border-l border-cyan-500/20 bg-black/30 flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-cyan-500/20">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span className="font-mono-cyber text-xs uppercase tracking-widest text-cyan-400">
                Console
              </span>
            </div>
            <span className="font-mono-cyber text-[9px] uppercase tracking-widest text-slate-500">
              tty://devfactory.log
            </span>
          </div>
          <div className="flex-1 overflow-y-auto scroll-cyber font-mono-cyber text-[11px] leading-relaxed space-y-1">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-2">
                <span className="text-slate-600 shrink-0">{log.time}</span>
                <span className={`shrink-0 font-bold ${logColors[log.type]}`}>
                  [{logLabels[log.type]}]
                </span>
                <span className="text-slate-300 break-words">{log.text}</span>
              </div>
            ))}
            <div ref={logEndRef} className="flex gap-2">
              <span className="text-cyan-400">›</span>
              <span className="text-cyan-400 animate-blink">_</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Command bar */}
      <div className="relative z-10 p-3 border-t border-cyan-500/30 bg-black/60 backdrop-blur-md">
        <form onSubmit={handleCommand} className="max-w-3xl mx-auto flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-black/60 border border-cyan-500/30 clip-cyber-sm focus-within:border-cyan-500/60 focus-within:glow-cyan-sm transition-all">
            <span className="font-mono-cyber text-cyan-400 text-sm">›</span>
            <input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder='Digite um comando... (ex: "abrir vscode")'
              className="flex-1 bg-transparent border-none outline-none font-mono-cyber text-sm text-cyan-100 placeholder:text-slate-600"
            />
            <button
              type="button"
              onClick={() => setMicOn(!micOn)}
              className={`p-1.5 transition-all clip-cyber-sm ${
                micOn
                  ? "bg-green-500/20 text-green-400 border border-green-500/50"
                  : "bg-red-500/20 text-red-400 border border-red-500/50"
              }`}
            >
              {micOn ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
            </button>
            <button
              type="submit"
              className="p-1.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500 hover:text-black transition-all clip-cyber-sm glow-cyan-sm"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
        <div className="mt-2 grid grid-cols-4 gap-2 max-w-3xl mx-auto">
          <QuickButton
            icon={Power}
            label="Despertar (ESC)"
            color="red"
            onClick={() => window.devfactory.system.beep()}
          />
          <QuickButton
            icon={SettingsIcon}
            label="Acessar Modo"
            color="cyan"
            onClick={() => alert("Modo de configurações em desenvolvimento")}
          />
          <QuickButton
            icon={Monitor}
            label="Capturar Tela"
            color="cyan"
            onClick={() => {
              setLogs((prev) => [
                ...prev,
                {
                  id: logCounter.current++,
                  type: "OK",
                  text: "Screenshot capturado e salvo em ~/Pictures/DevFactory/",
                  time: new Date().toLocaleTimeString("pt-BR", { hour12: false }),
                },
              ]);
            }}
          />
          <QuickButton
            icon={Terminal}
            label="Terminal"
            color="cyan"
            onClick={() => window.devfactory.exec.openApp("vscode")}
          />
        </div>
      </div>
    </div>
  );
}

function MetricBar({
  icon: Icon,
  label,
  value,
  max,
  unit,
  color,
  sub,
}: {
  icon: any;
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
  sub?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between font-mono-cyber text-[10px] mb-1">
        <span className="flex items-center gap-1.5 text-slate-400 uppercase tracking-wider">
          <Icon className="h-3 w-3" style={{ color }} />
          {label}
        </span>
        <span className="font-bold" style={{ color }}>
          {value}
          <span className="text-slate-500 ml-1 font-normal">{unit}</span>
        </span>
      </div>
      <div className="relative h-1.5 bg-cyan-500/5 overflow-hidden clip-cyber-sm">
        <div
          className="absolute inset-y-0 left-0 transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(to right, ${color}80, ${color})`,
            boxShadow: `0 0 8px ${color}80`,
          }}
        />
      </div>
      {sub && <div className="font-mono-cyber text-[9px] text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function StatusBox({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap = {
    green: "text-green-400",
    cyan: "text-cyan-400",
    yellow: "text-yellow-400",
    red: "text-red-400",
  } as any;
  return (
    <div className="p-2 bg-cyan-500/5 border border-cyan-500/20 clip-cyber-sm">
      <div className="font-mono-cyber text-[8px] uppercase tracking-widest text-slate-500">{label}</div>
      <div className={`font-mono-cyber text-xs font-bold mt-0.5 ${colorMap[color]}`}>{value}</div>
    </div>
  );
}

function QuickButton({
  icon: Icon,
  label,
  color,
  onClick,
}: {
  icon: any;
  label: string;
  color: "red" | "cyan";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center justify-center gap-2 px-3 py-2 text-xs font-mono-cyber uppercase tracking-wider clip-cyber-sm transition-all ${
        color === "red"
          ? "bg-red-500/10 border border-red-500/50 text-red-400 hover:bg-red-500/20 hover:glow-red"
          : "bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 hover:glow-cyan-sm"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function RadarDisplay({ active }: { active: boolean }) {
  const color = active ? "#39ff14" : "#00f0ff";
  return (
    <div className="relative aspect-square w-full max-w-[320px] mx-auto">
      <div
        className="absolute inset-0 rounded-full border-2 animate-radar-sweep"
        style={{ borderColor: `${color}40` }}
      >
        {Array.from({ length: 36 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-0 origin-bottom"
            style={{ transform: `rotate(${i * 10}deg)`, transformOrigin: "center 200%" }}
          >
            <div className={`w-px ${i % 9 === 0 ? "h-3" : "h-1.5"}`} style={{ background: `${color}${i % 9 === 0 ? "cc" : "55"}` }} />
          </div>
        ))}
      </div>
      <div className="absolute inset-[12%] rounded-full border" style={{ borderColor: `${color}30` }} />
      <div className="absolute inset-[28%] rounded-full border-2" style={{ borderColor: `${color}50` }} />
      <div
        className="absolute inset-[42%] rounded-full"
        style={{ background: `radial-gradient(circle, ${color} 0%, ${color}80 40%, transparent 70%)`, filter: "blur(2px)" }}
      />
      <div
        className="absolute left-0 right-0 top-1/2 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${color}60, transparent)` }}
      />
      <div
        className="absolute top-0 bottom-0 left-1/2 w-px"
        style={{ background: `linear-gradient(to bottom, transparent, ${color}60, transparent)` }}
      />
      <div className="absolute top-1 left-1/2 -translate-x-1/2 font-mono-cyber text-[9px] text-slate-500">N</div>
      <div className="absolute right-1 top-1/2 -translate-y-1/2 font-mono-cyber text-[9px] text-slate-500">E</div>
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 font-mono-cyber text-[9px] text-slate-500">S</div>
      <div className="absolute left-1 top-1/2 -translate-y-1/2 font-mono-cyber text-[9px] text-slate-500">W</div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-[60%] text-center">
        <div className="font-mono-cyber text-[9px] uppercase tracking-[0.3em]" style={{ color }}>
          SCANNING
        </div>
      </div>
    </div>
  );
}
