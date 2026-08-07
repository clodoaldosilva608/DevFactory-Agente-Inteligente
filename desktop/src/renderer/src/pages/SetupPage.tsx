import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  User,
  Mail,
  Lock,
  ArrowRight,
  Check,
  ShieldCheck,
  Database,
  Cpu,
  Minus,
  Square,
  X,
} from "lucide-react";

export default function SetupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordRules = [
    { test: (p: string) => p.length >= 8, label: "Mínimo 8 caracteres" },
    { test: (p: string) => /[A-Z]/.test(p), label: "1 letra maiúscula" },
    { test: (p: string) => /[a-z]/.test(p), label: "1 letra minúscula" },
    { test: (p: string) => /[0-9]/.test(p), label: "1 número" },
  ];
  const passedRules = passwordRules.filter((r) => r.test(password));
  const allPassed = passedRules.length === passwordRules.length;

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allPassed) {
      setError("Senha não atende aos requisitos");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await window.devfactory.auth.setup({ name, email, password });
      if (result.ok) {
        // Store token in localStorage (will be moved to secure storage later)
        localStorage.setItem("devfactory_token", result.token);
        localStorage.setItem("devfactory_user", JSON.stringify(result.user));
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao configurar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#050811] overflow-hidden">
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
            DevFactory — Configuração Inicial
          </span>
        </div>
        <div className="titlebar-no-drag flex items-center gap-1">
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

      <div className="relative z-10 w-full max-w-md px-8">
        <div className="glass-panel-strong clip-cyber-lg p-8 glow-cyan">
          {/* Logo */}
          <div className="flex flex-col items-center mb-5">
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
              Bem-vindo — Configuração Inicial
            </p>
          </div>

          {/* Welcome message */}
          <div className="mb-5 p-3 bg-cyan-500/5 border border-cyan-500/20 clip-cyber-sm">
            <p className="font-mono-cyber text-[11px] text-cyan-300 leading-relaxed mb-2">
              <Database className="inline h-3 w-3 mr-1" />
              <span className="font-bold">100% Local & Privado</span>
            </p>
            <p className="font-mono-cyber text-[10px] text-slate-400 leading-relaxed">
              Seus dados ficam apenas neste PC. Nada é enviado para a nuvem.
              Crie sua conta master para começar.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/40 clip-cyber-sm">
              <p className="font-mono-cyber text-[11px] text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSetup} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400">
                Nome
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  minLength={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full pl-10 pr-3 py-2.5 bg-black/60 border border-cyan-500/30 text-cyan-100 placeholder:text-slate-600 font-mono-cyber text-sm outline-none focus:border-cyan-500/60 focus:glow-cyan-sm transition-all clip-cyber-sm"
                />
              </div>
            </div>

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
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-black/60 border border-cyan-500/30 text-cyan-100 placeholder:text-slate-600 font-mono-cyber text-sm outline-none focus:border-cyan-500/60 focus:glow-cyan-sm transition-all clip-cyber-sm"
                />
              </div>
              {password.length > 0 && (
                <div className="grid grid-cols-2 gap-1 mt-1.5">
                  {passwordRules.map((r) => {
                    const ok = r.test(password);
                    return (
                      <div
                        key={r.label}
                        className={`flex items-center gap-1 text-[9px] font-mono-cyber ${
                          ok ? "text-green-400" : "text-slate-600"
                        }`}
                      >
                        <Check className={`h-2.5 w-2.5 ${ok ? "opacity-100" : "opacity-30"}`} />
                        {r.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !allPassed}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm glow-cyan-sm hover:glow-cyan transition-all disabled:opacity-50"
            >
              <Zap className="h-3.5 w-3.5" fill="currentColor" />
              {loading ? "Configurando..." : "Criar Conta Master"}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Privacy badges */}
          <div className="mt-5 pt-4 border-t border-cyan-500/20 grid grid-cols-3 gap-2 text-center">
            <div>
              <Database className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
              <div className="font-mono-cyber text-[9px] uppercase tracking-widest text-slate-500">
                Local DB
              </div>
            </div>
            <div>
              <ShieldCheck className="h-4 w-4 text-green-400 mx-auto mb-1" />
              <div className="font-mono-cyber text-[9px] uppercase tracking-widest text-slate-500">
                Privado
              </div>
            </div>
            <div>
              <Cpu className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
              <div className="font-mono-cyber text-[9px] uppercase tracking-widest text-slate-500">
                Offline
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
