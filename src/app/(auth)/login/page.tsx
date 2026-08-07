"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Zap,
  Mail,
  Lock,
  Github,
  Chrome,
  Phone,
  ArrowRight,
  Terminal,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";

type Mode = "credentials" | "phone";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard";
  const error = params.get("error");

  const [mode, setMode] = useState<Mode>("credentials");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);

  if (error) {
    toast.error("Falha na autenticação", {
      description: error === "CredentialsSignin" ? "Credenciais inválidas" : error,
    });
  }

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    setLoading(false);
    if (res?.error) {
      toast.error("Login falhou", { description: "Email ou senha incorretos." });
      return;
    }
    toast.success("Bem-vindo de volta!");
    router.push(callbackUrl);
    router.refresh();
  };

  const handleSendOtp = async () => {
    if (phone.replace(/\D/g, "").length < 10) {
      toast.error("Telefone inválido");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/phone-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.ok) {
        setOtpSent(true);
        if (data.devCode) setDevCode(data.devCode);
        toast.success("Código enviado!", {
          description: data.devCode
            ? `DEV MODE — código: ${data.devCode}`
            : "Verifique seu SMS.",
        });
      } else {
        toast.error("Erro ao enviar código");
      }
    } catch {
      toast.error("Erro de rede");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("phone", {
      phone,
      code,
      redirect: false,
      callbackUrl,
    });
    setLoading(false);
    if (res?.error) {
      toast.error("Código inválido ou expirado");
      return;
    }
    toast.success("Login realizado!");
    router.push(callbackUrl);
    router.refresh();
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
            Acessar Sistema
          </p>
        </div>

        {/* Mode tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 mb-6 glass-panel clip-cyber-sm">
          <button
            onClick={() => setMode("credentials")}
            className={`px-3 py-1.5 text-xs font-mono-cyber uppercase tracking-wider transition-all clip-cyber-sm flex items-center justify-center gap-1.5 ${
              mode === "credentials"
                ? "bg-cyan-500/20 text-cyan-400"
                : "text-slate-400 hover:text-cyan-400"
            }`}
          >
            <Mail className="h-3 w-3" />
            Email
          </button>
          <button
            onClick={() => setMode("phone")}
            className={`px-3 py-1.5 text-xs font-mono-cyber uppercase tracking-wider transition-all clip-cyber-sm flex items-center justify-center gap-1.5 ${
              mode === "phone"
                ? "bg-cyan-500/20 text-cyan-400"
                : "text-slate-400 hover:text-cyan-400"
            }`}
          >
            <Phone className="h-3 w-3" />
            Telefone
          </button>
        </div>

        {/* Credentials form */}
        {mode === "credentials" && (
          <form onSubmit={handleCredentials} className="space-y-4">
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 bg-black/60 border-cyan-500/30 text-cyan-100 placeholder:text-slate-600 font-mono-cyber"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm glow-cyan-sm transition-all"
            >
              {loading ? (
                "Autenticando..."
              ) : (
                <>
                  <Terminal className="h-3.5 w-3.5 mr-1.5" />
                  Entrar no Sistema
                </>
              )}
            </Button>
          </form>
        )}

        {/* Phone form */}
        {mode === "phone" && (
          <form onSubmit={otpSent ? handleVerifyOtp : (e) => { e.preventDefault(); handleSendOtp(); }} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400">
                Telefone
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="tel"
                  required
                  disabled={otpSent}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+55 11 99999-9999"
                  className="pl-10 bg-black/60 border-cyan-500/30 text-cyan-100 placeholder:text-slate-600 font-mono-cyber"
                />
              </div>
            </div>
            {otpSent && (
              <div className="space-y-2">
                <Label className="font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400">
                  Código OTP (6 dígitos)
                </Label>
                <Input
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="bg-black/60 border-cyan-500/30 text-cyan-100 placeholder:text-slate-600 font-mono-cyber tracking-[0.5em] text-center text-lg"
                />
                {devCode && (
                  <p className="text-[10px] font-mono-cyber text-yellow-400 animate-pulse">
                    DEV MODE — código: {devCode}
                  </p>
                )}
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm glow-cyan-sm transition-all"
            >
              {loading
                ? "Processando..."
                : otpSent
                ? "Verificar e Entrar"
                : "Enviar Código SMS"}
            </Button>
            {otpSent && (
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setCode("");
                  setDevCode(null);
                }}
                className="w-full text-[10px] font-mono-cyber uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors"
              >
                ← Trocar número
              </button>
            )}
          </form>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-cyan-500/20" />
          <span className="font-mono-cyber text-[9px] uppercase tracking-widest text-slate-600">
            Ou continue com
          </span>
          <div className="flex-1 h-px bg-cyan-500/20" />
        </div>

        {/* OAuth buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => signIn("google", { callbackUrl })}
            variant="outline"
            className="bg-transparent border border-cyan-500/30 text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 font-mono-cyber text-[10px] uppercase tracking-wider clip-cyber-sm"
          >
            <Chrome className="h-3.5 w-3.5 mr-1.5" />
            Google
          </Button>
          <Button
            onClick={() => signIn("github", { callbackUrl })}
            variant="outline"
            className="bg-transparent border border-cyan-500/30 text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 font-mono-cyber text-[10px] uppercase tracking-wider clip-cyber-sm"
          >
            <Github className="h-3.5 w-3.5 mr-1.5" />
            GitHub
          </Button>
        </div>

        {/* Magic link */}
        <button
          onClick={() => {
            if (!email) {
              toast.error("Digite seu email primeiro");
              return;
            }
            signIn("email", { email, callbackUrl });
          }}
          className="w-full mt-3 text-[10px] font-mono-cyber uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors flex items-center justify-center gap-1.5"
        >
          <Mail className="h-3 w-3" />
          Enviar Magic Link por email
        </button>

        {/* Footer */}
        <p className="mt-6 text-center font-mono-cyber text-[10px] uppercase tracking-widest text-slate-500">
          Não tem conta?{" "}
          <Link
            href="/register"
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
          >
            Criar agora
          </Link>
        </p>

        <div className="mt-4 flex items-center justify-center gap-1 text-[9px] font-mono-cyber uppercase tracking-widest text-slate-600">
          <ShieldCheck className="h-3 w-3 text-green-400" />
          Conexão segura SSL/TLS
        </div>
      </motion.div>
    </div>
  );
}
