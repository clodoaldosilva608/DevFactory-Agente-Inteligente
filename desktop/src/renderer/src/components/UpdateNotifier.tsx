import { useEffect, useState } from "react";
import { RefreshCw, X, Download, CheckCircle2, AlertCircle, Zap } from "lucide-react";

type UpdateStatus =
  | "idle"
  | "checking"
  | "available"
  | "downloading"
  | "downloaded"
  | "error";

type UpdateInfo = {
  version?: string;
  releaseDate?: string;
  releaseNotes?: string;
  progress?: number;
};

export function UpdateNotifier() {
  const [status, setStatus] = useState<UpdateStatus>("idle");
  const [info, setInfo] = useState<UpdateInfo>({});
  const [dismissed, setDismissed] = useState(false);

  // Check on mount + every 30 min
  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      try {
        setStatus("checking");
        await window.devfactory.update.check();
        if (isMounted) setStatus("idle");
      } catch (err) {
        if (isMounted) setStatus("error");
      }
    };

    // Listen for update events from main process
    const unsubAvailable = window.devfactory.update.onAvailable((data: any) => {
      if (!isMounted) return;
      console.log("[UpdateNotifier] received update-available:", data);
      setInfo({
        version: data.version,
        releaseDate: data.releaseDate,
        releaseNotes: data.releaseNotes,
      });
      setStatus("available");
    });

    const unsubDownloaded = window.devfactory.update.onDownloaded(() => {
      if (!isMounted) return;
      setStatus("downloaded");
    });

    // Initial check after 5s (let app settle)
    const t = setTimeout(check, 5000);
    // Re-check every 30 minutes
    const interval = setInterval(check, 30 * 60 * 1000);

    return () => {
      isMounted = false;
      clearTimeout(t);
      clearInterval(interval);
      unsubAvailable();
      unsubDownloaded();
    };
  }, []);

  const handleDownload = async () => {
    try {
      setStatus("downloading");
      setInfo({ ...info, progress: 0 });
      const progressInterval = setInterval(() => {
        setInfo((prev) => ({
          ...prev,
          progress: Math.min((prev.progress || 0) + 10, 90),
        }));
      }, 500);
      await window.devfactory.update.download();
      clearInterval(progressInterval);
      setStatus("downloaded");
    } catch (err) {
      setStatus("error");
    }
  };

  const handleInstall = async () => {
    await window.devfactory.update.install();
  };

  const dismiss = () => {
    setDismissed(true);
    setTimeout(() => setDismissed(false), 30 * 60 * 1000);
  };

  // Don't show if idle, dismissed, or checking silently
  if (status === "idle" || status === "checking" || dismissed) {
    return null;
  }

  return (
    <div className="fixed top-12 right-4 z-50 w-80 animate-[fadeIn_0.3s_ease-out]">
      <div className="glass-panel-strong clip-cyber p-4 glow-cyan border-cyan-500/50">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-500/20 border border-cyan-500/50 clip-cyber-sm">
              {status === "available" && <Zap className="h-3.5 w-3.5 text-cyan-400" fill="currentColor" />}
              {status === "downloading" && <Download className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />}
              {status === "downloaded" && <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />}
              {status === "error" && <AlertCircle className="h-3.5 w-3.5 text-red-400" />}
            </div>
            <div>
              <div className="font-display font-bold text-xs text-cyan-400 uppercase tracking-widest">
                {status === "available" && "Atualização Disponível"}
                {status === "downloading" && "Baixando..."}
                {status === "downloaded" && "Pronto para Instalar"}
                {status === "error" && "Erro ao Atualizar"}
              </div>
              {info.version && (
                <div className="font-mono-cyber text-[10px] text-slate-500 mt-0.5">
                  v{info.version}
                </div>
              )}
            </div>
          </div>
          {status !== "downloaded" && status !== "downloading" && (
            <button
              onClick={dismiss}
              className="p-1 text-slate-500 hover:text-cyan-400 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Body */}
        {status === "available" && (
          <>
            <p className="font-mono-cyber text-[11px] text-slate-300 mb-3 leading-relaxed">
              Uma nova versão do DevFactory está disponível.
              {info.releaseDate && (
                <span className="block text-slate-500 mt-1">
                  Publicada em {new Date(info.releaseDate).toLocaleDateString("pt-BR")}
                </span>
              )}
            </p>
            {info.releaseNotes && (
              <div className="mb-3 p-2 bg-black/40 border border-cyan-500/20 clip-cyber-sm max-h-32 overflow-y-auto scroll-cyber">
                <pre className="font-mono-cyber text-[10px] text-slate-400 whitespace-pre-wrap">
                  {info.releaseNotes}
                </pre>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-[10px] uppercase tracking-widest clip-cyber-sm transition-all glow-cyan-sm"
              >
                <Download className="h-3 w-3" />
                Baixar Agora
              </button>
              <button
                onClick={dismiss}
                className="px-3 py-2 bg-transparent border border-slate-700 text-slate-400 hover:text-cyan-400 font-mono-cyber text-[10px] uppercase tracking-widest clip-cyber-sm transition-all"
              >
                Depois
              </button>
            </div>
          </>
        )}

        {status === "downloading" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono-cyber text-[10px] text-slate-400">
              <span className="uppercase tracking-widest">Progresso</span>
              <span className="text-cyan-400 font-bold">{info.progress || 0}%</span>
            </div>
            <div className="h-1.5 bg-cyan-500/10 overflow-hidden clip-cyber-sm">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 glow-cyan-sm transition-all duration-300"
                style={{ width: `${info.progress || 0}%` }}
              />
            </div>
          </div>
        )}

        {status === "downloaded" && (
          <>
            <p className="font-mono-cyber text-[11px] text-green-300 mb-3 leading-relaxed">
              ✅ Download concluído! Reinicie o app para aplicar a atualização.
            </p>
            <button
              onClick={handleInstall}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500 hover:text-black font-mono-cyber text-[10px] uppercase tracking-widest clip-cyber-sm transition-all"
            >
              <RefreshCw className="h-3 w-3" />
              Reiniciar e Atualizar
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <p className="font-mono-cyber text-[11px] text-red-300 mb-3">
              Não foi possível verificar atualizações. Verifique sua conexão.
            </p>
            <button
              onClick={dismiss}
              className="w-full px-3 py-2 bg-transparent border border-slate-700 text-slate-400 hover:text-cyan-400 font-mono-cyber text-[10px] uppercase tracking-widest clip-cyber-sm"
            >
              Fechar
            </button>
          </>
        )}
      </div>
    </div>
  );
}

