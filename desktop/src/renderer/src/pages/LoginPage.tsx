import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Mail,
  Lock,
  ArrowRight,
  Terminal,
  ShieldCheck,
  Minus,
  Square,
  X,
} from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appVersion, setAppVersion] = useState("");
  const [hwid, setHwid] = useState("");

  useEffect(() => {
    window.devfactory.app.getVersion().then(setAppVersion);
    window.devfactory.auth.getHwid().then((h) => setHwid(h.slice(0, 16)));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await window.devfactory.auth.login(email, password);
      if (result.ok) {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = async () => {
    setLoading(true);
    try {
      await window.devfactory.auth.startTrial();
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#050811] overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 30% 40%, rgba(0, 240, 255, 0.08) 0%, transparent 50%)," +
            "radial-gradient(circle at 70% 60%, rgba(255, 51, 51, 0.06) 0%, transparent 50%)",
        }}
      />

      {/* Custom title bar */}
      <div className="titlebar-drag fixed top-0 left-0 right-0 h-9 bg-black/40 flex items-center justify-between px-3 z-50">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-cyan-400" fill="currentColor" />
          <span className="font-mono-cyber text-[10px] uppercase tracking-widest text-slate-400">
            DevFactory — Agente Inteligente
          </span>
        </div>
        <div className="titlebar-no-drag flex items-center gap-1">
          <button
            onClick={() => window.devfactory.app.minimize()}
            className="p-1.5 hover:bg-cyan-500/10 transition-colors"
          >
            <Minus className="h-3 w-3 text-slate-400" />
          </button>
          <button
            onClick={() => window.devfactory.app.maximize()}
            className="p-1.5 hover:bg-cyan-500/10 transition-colors"
          >
            <Square className="h-2.5 w-2.5 text-slate-400" />
          </button>
          <button
            onClick={() => window.devfactory.app.close()}
            className="p-1.5 hover:bg-red-500/20 transition-colors"
          >
            <X className="h-3 w-3 text-slate-400 hover:text-red-400" />
          </button>
        </div>
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md px-8">
        <div className="glass-panel-strong clip-cyber-lg p-8 glow-cyan">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative h-14 w-14 mb-3">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-radar-sweep" />
              <div className="absolute inset-2 rounded-full border border-cyan-500/50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center bg-black border border-cyan-500/60 clip-cyber-sm glow-cyan">
                  <Zap className="h-6 w-6 text-cyan-400" fill="currentColor" />
                </div>
              </div>
            </div>
            <h1 className="font-display font-black text-2xl text-cyan-400 text-glow-cyan tracking-widest">
              Dev<span className="text-red-500 text-glow-red">Factory</span>
            </h1>
            <p className="font-mono-cyber text-[10px] uppercase tracking-[0.3em] text-slate-500 mt-1">
              Acessar Sistema
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/40 clip-cyber-sm">
              <p className="font-mono-cyber text-[11px] text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-black/60 border border-cyan-500/30 text-cyan-100 placeholder:text-slate-600 font-mono-cyber text-sm outline-none focus:border-cyan-500/60 focus:glow-cyan-sm transition-all clip-cyber-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-black/60 border border-cyan-500/30 text-cyan-100 placeholder:text-slate-600 font-mono-cyber text-sm outline-none focus:border-cyan-500/60 focus:glow-cyan-sm transition-all clip-cyber-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm glow-cyan-sm hover:glow-cyan transition-all disabled:opacity-50"
            >
              <Terminal className="h-3.5 w-3.5" />
              {loading ? "Autenticando..." : "Entrar no Sistema"}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-cyan-500/20" />
            <span className="font-mono-cyber text-[9px] uppercase tracking-widest text-slate-600">
              ou
            </span>
            <div className="flex-1 h-px bg-cyan-500/20" />
          </div>

          {/* Trial button */}
          <button
            onClick={handleStartTrial}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-transparent border border-cyan-500/30 text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 font-mono-cyber text-[11px] uppercase tracking-wider clip-cyber-sm transition-all"
          >
            <Zap className="h-3.5 w-3.5" fill="currentColor" />
            Iniciar Trial 7 Dias
          </button>

          {/* Footer info */}
          <div className="mt-6 pt-4 border-t border-cyan-500/20 space-y-1">
            <div className="flex items-center justify-between font-mono-cyber text-[9px] uppercase tracking-widest text-slate-500">
              <span>Versão</span>
              <span className="text-cyan-400">{appVersion}</span>
            </div>
            <div className="flex items-center justify-between font-mono-cyber text-[9px] uppercase tracking-widest text-slate-500">
              <span>HWID</span>
              <span className="text-cyan-400 font-mono">{hwid}...</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-3 text-[9px] font-mono-cyber uppercase tracking-widest text-slate-600">
              <ShieldCheck className="h-3 w-3 text-green-400" />
              Conexão segura SSL/TLS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
