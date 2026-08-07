"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, User, Mail, Lock, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";

const passwordRules = [
  { test: (p: string) => p.length >= 8, label: "Mínimo 8 caracteres" },
  { test: (p: string) => /[A-Z]/.test(p), label: "1 letra maiúscula" },
  { test: (p: string) => /[a-z]/.test(p), label: "1 letra minúscula" },
  { test: (p: string) => /[0-9]/.test(p), label: "1 número" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const passedRules = passwordRules.filter((r) => r.test(password));
  const allPassed = passedRules.length === passwordRules.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allPassed) {
      toast.error("Senha não atende aos requisitos");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao registrar");
        return;
      }
      toast.success("Conta criada! Bem-vindo ao J.A.R.V.I.S 🚀", {
        description: "Fazendo login automático...",
      });
      // Auto-login after register
      const r = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });
      if (r?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        router.push("/login");
      }
    } catch {
      toast.error("Erro de rede");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-panel-strong clip-cyber p-8 glow-cyan-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-14 w-14 items-center justify-center bg-black border border-cyan-500/60 clip-cyber glow-cyan mb-3">
            <Zap className="h-7 w-7 text-cyan-400" fill="currentColor" />
          </div>
          <h1 className="font-display font-black text-2xl text-cyan-400 text-glow-cyan tracking-widest">
            BOTZAP<span className="text-red-500 text-glow-red">BR</span>
          </h1>
          <p className="font-mono-cyber text-[10px] uppercase tracking-[0.3em] text-slate-500 mt-1">
            Criar Conta — Trial 7 dias grátis
          </p>
        </div>

        {/* Benefits */}
        <div className="mb-6 p-3 bg-cyan-500/5 border border-cyan-500/20 clip-cyber-sm space-y-1.5">
          {[
            "Trial 7 dias — sem cartão de crédito",
            "1 número de WhatsApp incluído",
            "IA J.A.R.V.I.S completa + comandos por voz",
            "Cancele quando quiser",
          ].map((b) => (
            <div key={b} className="flex items-center gap-2 text-[11px] text-slate-300 font-mono-cyber">
              <Check className="h-3 w-3 text-green-400 shrink-0" />
              {b}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400">
              Nome
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                type="text"
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="pl-10 bg-black/60 border-cyan-500/30 text-cyan-100 placeholder:text-slate-600 font-mono-cyber"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="pl-10 bg-black/60 border-cyan-500/30 text-cyan-100 placeholder:text-slate-600 font-mono-cyber"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 bg-black/60 border-cyan-500/30 text-cyan-100 placeholder:text-slate-600 font-mono-cyber"
              />
            </div>
            {/* Strength meter */}
            {password.length > 0 && (
              <div className="grid grid-cols-2 gap-1 mt-2">
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

          <Button
            type="submit"
            disabled={loading || !allPassed}
            className="w-full bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm glow-cyan-sm transition-all disabled:opacity-50"
          >
            {loading ? (
              "Criando conta..."
            ) : (
              <>
                <Zap className="h-3.5 w-3.5 mr-1.5" fill="currentColor" />
                Criar Conta Grátis
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </>
            )}
          </Button>
        </form>

        <p className="mt-6 text-center font-mono-cyber text-[10px] uppercase tracking-widest text-slate-500">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
          >
            Fazer login
          </Link>
        </p>

        <p className="mt-4 text-center text-[9px] font-mono-cyber text-slate-600 leading-relaxed">
          Ao criar conta, você concorda com nossos{" "}
          <Link href="/terms" className="text-cyan-500/70 hover:text-cyan-400">Termos</Link> e{" "}
          <Link href="/privacy" className="text-cyan-500/70 hover:text-cyan-400">Política de Privacidade</Link>.
        </p>
      </motion.div>
    </div>
  );
}
