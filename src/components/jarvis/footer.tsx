"use client";

import { motion } from "framer-motion";
import { Zap, Github, Twitter, Instagram, Youtube, Mail, ShieldCheck, FileText, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const footerLinks = [
  {
    title: "Produto",
    links: ["Recursos", "Dashboard", "WhatsApp Bot", "Planos", "Roadmap"],
  },
  {
    title: "Recursos",
    links: ["Documentação", "API Reference", "Tutoriais", "Blog", "Status"],
  },
  {
    title: "Empresa",
    links: ["Sobre Nós", "Contato", "Parceiros", "Carreiras", "Imprensa"],
  },
  {
    title: "Legal",
    links: ["Termos de Uso", "Privacidade", "Cookies", "LGPD", "DMCA"],
  },
];

const socials = [
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "YouTube" },
  { icon: Mail, href: "#", label: "Email" },
];

export function Footer() {
  return (
    <footer className="relative mt-auto border-t border-cyan-500/20 bg-black/60 backdrop-blur-md">
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Newsletter / CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 p-6 sm:p-8 glass-panel clip-cyber text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-6"
        >
          <div>
            <h3 className="font-display font-bold text-xl text-white mb-1">
              Pronto para ativar o{" "}
              <span className="text-cyan-400 text-glow-cyan">J.A.R.V.I.S</span>?
            </h3>
            <p className="text-sm text-slate-400">
              Comece seu teste grátis de 7 dias. Sem cartão de crédito.
            </p>
          </div>
          <Button
            asChild
            className="mt-4 sm:mt-0 bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono-cyber uppercase tracking-wider clip-cyber glow-cyan-sm hover:glow-cyan transition-all"
          >
            <a href="#planos">
              <Zap className="h-4 w-4 mr-2" fill="currentColor" />
              Teste Grátis
            </a>
          </Button>
        </motion.div>

        {/* Footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-10">
          {/* Brand col */}
          <div className="col-span-2">
            <a href="#inicio" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center bg-black border border-cyan-500/60 clip-cyber-sm glow-cyan-sm">
                <Zap className="h-5 w-5 text-cyan-400" fill="currentColor" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-lg tracking-widest text-cyan-400 text-glow-cyan">
                  BOTZAP<span className="text-red-500 text-glow-red">BR</span>
                </span>
                <span className="font-mono-cyber text-[9px] uppercase tracking-[0.3em] text-slate-500">
                  J.A.R.V.I.S System
                </span>
              </div>
            </a>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed max-w-xs">
              Plataforma de automação inteligente e assistente virtual que
              combina IA, automação de WhatsApp e controle de sistema com
              interface sci-fi imersiva.
            </p>

            {/* Socials */}
            <div className="flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="p-2 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all clip-cyber-sm border border-cyan-500/20 hover:border-cyan-500/50"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link cols */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 className="font-mono-cyber text-[10px] uppercase tracking-[0.2em] text-cyan-400 mb-3">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-cyan-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono-cyber text-slate-500">
            <span>© 2026 BotZapBR / J.A.R.V.I.S</span>
            <span className="text-slate-700">|</span>
            <a href="#" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Termos
            </a>
            <a href="#" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Privacidade
            </a>
            <span className="flex items-center gap-1 text-green-400">
              <ShieldCheck className="h-3 w-3" />
              LGPD Compliant
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono-cyber uppercase tracking-widest text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            Sistema Operacional
            <span className="text-slate-700">|</span>
            <span className="text-cyan-400">v3.7.2</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
