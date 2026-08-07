import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  Wifi,
  WifiOff,
  Plus,
  Trash2,
  Settings as SettingsIcon,
  MessageSquare,
  Zap,
  Minus,
  Square,
  X,
  CheckCircle2,
  Radio,
  Cloud,
  Send,
  Bell,
  type LucideIcon,
} from "lucide-react";

type PairedDevice = {
  id: string;
  name: string;
  deviceType: string;
  os: string | null;
  isOnline: boolean;
  isRevoked: boolean;
  lastSeenAt: string | null;
  createdAt: string;
};

type SyncStatus = {
  running: boolean;
  port: number | null;
  urls: string[];
  connectedDevices: number;
};

export default function DevicesPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [devices, setDevices] = useState<PairedDevice[]>([]);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");

  const loadStatus = async () => {
    const s = await window.devfactory.sync.status();
    setStatus(s);
  };

  const loadDevices = async () => {
    const d = await window.devfactory.sync.devices();
    setDevices(d);
  };

  useEffect(() => {
    loadStatus();
    loadDevices();

    // Listen for device connect/disconnect events
    const unsubConnected = window.devfactory.sync.onDeviceConnected(() => loadDevices());
    const unsubDisconnected = window.devfactory.sync.onDeviceDisconnected(() => loadDevices());

    return () => {
      unsubConnected();
      unsubDisconnected();
    };
  }, []);

  const handleStart = async () => {
    setLoading(true);
    await window.devfactory.sync.start();
    await loadStatus();
    setLoading(false);
  };

  const handleStop = async () => {
    setLoading(true);
    await window.devfactory.sync.stop();
    await loadStatus();
    setLoading(false);
  };

  const handlePairingCode = async () => {
    const result = await window.devfactory.sync.pairingCode();
    setPairingCode(result.code);
    // Auto-clear after 5 min
    setTimeout(() => setPairingCode(null), 5 * 60 * 1000);
  };

  const handleRevoke = async (deviceId: string) => {
    if (!confirm("Revogar este dispositivo? Ele precisará parear novamente.")) return;
    await window.devfactory.sync.revoke(deviceId);
    loadDevices();
  };

  const handleNotify = async () => {
    if (!notifTitle || !notifBody) return;
    await window.devfactory.sync.notify({
      title: notifTitle,
      body: notifBody,
      level: "info",
    });
    setNotifTitle("");
    setNotifBody("");
    alert("Notificação enviada para todos os dispositivos conectados!");
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#050811] overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <CustomTitleBar navigate={navigate} />

      <div className="relative z-10 flex-1 overflow-y-auto scroll-cyber p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="font-display font-bold text-2xl text-white">
              Dispositivos &{" "}
              <span className="text-cyan-400 text-glow-cyan">Sync LAN</span>
            </h1>
            <p className="font-mono-cyber text-xs uppercase tracking-widest text-slate-500 mt-1">
              Controle seu PC a partir do celular na mesma rede WiFi
            </p>
          </div>

          {/* Help banner */}
          <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 clip-cyber-sm">
            <div className="flex items-start gap-2">
              <Radio className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="font-mono-cyber text-[11px] text-cyan-300 leading-relaxed">
                <strong>Como funciona:</strong> O sync server roda na porta <code className="px-1 py-0.5 bg-black/40 text-cyan-300">3001</code> do seu PC.
                Dispositivos na <strong>mesma rede WiFi</strong> podem se conectar via código de pareamento.
                Sem nuvem, sem custo. 100% local.
              </div>
            </div>
          </div>

          {/* Server status card */}
          <div className="glass-panel clip-cyber p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 border clip-cyber-sm ${status?.running ? "bg-green-500/10 border-green-500/40" : "bg-slate-500/10 border-slate-500/40"}`}>
                  {status?.running ? <Wifi className="h-5 w-5 text-green-400" /> : <WifiOff className="h-5 w-5 text-slate-500" />}
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">Servidor Sync</h3>
                  <p className="font-mono-cyber text-[10px] text-slate-500 mt-0.5">
                    {status?.running ? `Online na porta ${status.port}` : "Desligado"}
                  </p>
                </div>
              </div>
              {status?.running ? (
                <button
                  onClick={handleStop}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm transition-all"
                >
                  <WifiOff className="h-3.5 w-3.5" />
                  Parar
                </button>
              ) : (
                <button
                  onClick={handleStart}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm glow-cyan-sm transition-all"
                >
                  <Wifi className="h-3.5 w-3.5" />
                  Iniciar
                </button>
              )}
            </div>

            {status?.running && (
              <div className="space-y-2">
                <div>
                  <div className="font-mono-cyber text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                    URLs de acesso
                  </div>
                  <div className="space-y-1">
                    {status.urls.map((url) => (
                      <div key={url} className="font-mono-cyber text-xs text-cyan-300 bg-black/40 px-2 py-1 clip-cyber-sm">
                        {url}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-2 bg-cyan-500/5 border border-cyan-500/20 clip-cyber-sm">
                    <div className="font-mono-cyber text-[9px] uppercase tracking-widest text-slate-500">Dispositivos conectados</div>
                    <div className="font-display font-bold text-lg text-green-400">{status.connectedDevices}</div>
                  </div>
                  <div className="p-2 bg-cyan-500/5 border border-cyan-500/20 clip-cyber-sm">
                    <div className="font-mono-cyber text-[9px] uppercase tracking-widest text-slate-500">Porta</div>
                    <div className="font-display font-bold text-lg text-cyan-400">{status.port}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pairing section */}
          {status?.running && (
            <div className="glass-panel clip-cyber p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-cyan-400" />
                  <h3 className="font-display font-bold text-sm text-cyan-400 uppercase tracking-widest">
                    Parear Novo Dispositivo
                  </h3>
                </div>
              </div>
              {pairingCode ? (
                <div className="text-center py-4">
                  <div className="font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400 mb-2">
                    Código de Pareamento (válido por 5 min)
                  </div>
                  <div className="font-display font-black text-5xl text-cyan-300 tracking-[0.3em] glow-cyan">
                    {pairingCode}
                  </div>
                  <p className="font-mono-cyber text-[10px] text-slate-500 mt-3">
                    Abra o DevFactory no celular → Settings → Parear → digite o código
                  </p>
                </div>
              ) : (
                <button
                  onClick={handlePairingCode}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm glow-cyan-sm transition-all"
                >
                  <Zap className="h-3.5 w-3.5" fill="currentColor" />
                  Gerar Código
                </button>
              )}
            </div>
          )}

          {/* Paired devices list */}
          <div className="glass-panel clip-cyber p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-cyan-400" />
                <h3 className="font-display font-bold text-sm text-cyan-400 uppercase tracking-widest">
                  Dispositivos Pareados
                </h3>
              </div>
              <button onClick={loadDevices} className="p-1 text-slate-500 hover:text-cyan-400">
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
            {devices.length === 0 ? (
              <div className="text-center py-8">
                <Smartphone className="h-10 w-10 text-slate-700 mx-auto mb-2" />
                <p className="font-mono-cyber text-xs text-slate-500">
                  Nenhum dispositivo pareado ainda
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {devices.map((device) => (
                  <DeviceRow key={device.id} device={device} onRevoke={handleRevoke} />
                ))}
              </div>
            )}
          </div>

          {/* Send notification */}
          {status?.running && status.connectedDevices > 0 && (
            <div className="glass-panel clip-cyber p-5">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-4 w-4 text-cyan-400" />
                <h3 className="font-display font-bold text-sm text-cyan-400 uppercase tracking-widest">
                  Enviar Notificação
                </h3>
              </div>
              <div className="space-y-3">
                <input
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="Título"
                  className="w-full px-3 py-2 bg-black/60 border border-cyan-500/30 text-cyan-100 placeholder:text-slate-600 font-mono-cyber text-sm outline-none focus:border-cyan-500/60 clip-cyber-sm"
                />
                <textarea
                  value={notifBody}
                  onChange={(e) => setNotifBody(e.target.value)}
                  placeholder="Mensagem"
                  rows={2}
                  className="w-full px-3 py-2 bg-black/60 border border-cyan-500/30 text-cyan-100 placeholder:text-slate-600 font-mono-cyber text-sm outline-none focus:border-cyan-500/60 clip-cyber-sm resize-none"
                />
                <button
                  onClick={handleNotify}
                  disabled={!notifTitle || !notifBody}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm transition-all disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  Enviar para {status.connectedDevices} dispositivo(s)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DeviceRow({ device, onRevoke }: { device: PairedDevice; onRevoke: (id: string) => void }) {
  const Icon: LucideIcon = device.deviceType === "TABLET" ? Tablet : device.deviceType === "DESKTOP" ? Monitor : Smartphone;
  return (
    <div className={`flex items-center justify-between p-3 border clip-cyber-sm ${device.isOnline ? "bg-green-500/5 border-green-500/30" : "bg-slate-500/5 border-slate-500/20"}`}>
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 border clip-cyber-sm flex items-center justify-center ${device.isOnline ? "bg-green-500/10 border-green-500/30" : "bg-slate-500/10 border-slate-500/30"}`}>
          <Icon className={`h-4 w-4 ${device.isOnline ? "text-green-400" : "text-slate-500"}`} />
        </div>
        <div>
          <div className="font-mono-cyber text-xs text-white">
            {device.name}
            {device.isRevoked && <span className="ml-2 text-red-400">(revogado)</span>}
          </div>
          <div className="font-mono-cyber text-[9px] text-slate-500">
            {device.os || device.deviceType} · {device.lastSeenAt ? `Visto ${new Date(device.lastSeenAt).toLocaleString("pt-BR")}` : "Nunca visto"}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1.5 px-2 py-1 clip-cyber-sm ${device.isOnline ? "bg-green-500/10 text-green-400" : "bg-slate-500/10 text-slate-500"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${device.isOnline ? "bg-green-400 animate-pulse" : "bg-slate-500"}`} />
          <span className="font-mono-cyber text-[9px] uppercase tracking-widest">
            {device.isOnline ? "Online" : "Offline"}
          </span>
        </div>
        <button
          onClick={() => onRevoke(device.id)}
          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          title="Revogar"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function CustomTitleBar({ navigate }: { navigate: any }) {
  return (
    <div className="titlebar-drag relative z-20 h-9 bg-black/60 backdrop-blur-md flex items-center justify-between px-3 border-b border-cyan-500/20">
      <div className="flex items-center gap-2">
        <div className="flex h-5 w-5 items-center justify-center bg-black border border-cyan-500/40 clip-cyber-sm">
          <Zap className="h-3 w-3 text-cyan-400" fill="currentColor" />
        </div>
        <span className="font-display font-bold text-xs tracking-widest text-cyan-400">DevFactory</span>
        <span className="font-mono-cyber text-[9px] uppercase tracking-widest text-slate-500 ml-2">
          Dispositivos & Sync
        </span>
      </div>
      <div className="titlebar-no-drag flex items-center gap-2">
        <button onClick={() => navigate("/dashboard")} className="p-1.5 hover:bg-cyan-500/10" title="Dashboard">
          <MessageSquare className="h-3.5 w-3.5 text-slate-400 hover:text-cyan-400" />
        </button>
        <button onClick={() => navigate("/aichat")} className="p-1.5 hover:bg-cyan-500/10" title="AI Chat">
          <Zap className="h-3.5 w-3.5 text-slate-400 hover:text-cyan-400" />
        </button>
        <button onClick={() => navigate("/settings")} className="p-1.5 hover:bg-cyan-500/10" title="Settings">
          <SettingsIcon className="h-3.5 w-3.5 text-slate-400 hover:text-cyan-400" />
        </button>
        <div className="flex items-center gap-1 ml-1">
          <button onClick={() => window.devfactory.app.minimize()} className="p-1.5 hover:bg-cyan-500/10">
            <Minus className="h-3 w-3 text-slate-400" />
          </button>
          <button onClick={() => window.devfactory.app.maximize()} className="p-1.5 hover:bg-cyan-500/10">
            <Square className="h-2.5 w-2.5 text-slate-400" />
          </button>
          <button onClick={() => window.devfactory.app.close()} className="p-1.5 hover:bg-red-500/20">
            <X className="h-3 w-3 text-slate-400 hover:text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
