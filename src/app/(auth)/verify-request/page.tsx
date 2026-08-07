"use client";

import { motion } from "framer-motion";
import { MailCheck, Zap } from "lucide-react";
import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-panel-strong clip-cyber p-8 text-center glow-cyan-sm"
      >
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center bg-cyan-500/10 border border-cyan-500/50 clip-cyber glow-cyan animate-pulse-glow">
            <MailCheck className="h-8 w-8 text-cyan-400" />
          </div>
        </div>
        <h1 className="font-display font-bold text-2xl text-cyan-400 text-glow-cyan mb-2">
          Verifique seu email
        </h1>
        <p className="text-sm text-slate-300 mb-4 font-mono-cyber">
          Enviamos um link de login mágico para seu endereço de email.
          Clique no link para acessar o sistema.
        </p>
        <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 clip-cyber-sm mb-6">
          <p className="text-[10px] font-mono-cyber uppercase tracking-widest text-yellow-400">
            ⚠ O link expira em 24 horas
          </p>
        </div>
        <p className="text-[11px] font-mono-cyber text-slate-500">
          Não recebeu? Verifique a pasta de spam ou{" "}
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300 underline">
            tente novamente
          </Link>
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-[9px] font-mono-cyber uppercase tracking-widest text-slate-600">
          <Zap className="h-3 w-3 text-cyan-400" fill="currentColor" />
          DevFactory
        </div>
      </motion.div>
    </div>
  );
}
