"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Início", href: "#inicio" },
  { label: "Recursos", href: "#recursos" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "WhatsApp Bot", href: "#whatsapp" },
  { label: "Planos", href: "#planos" },
];

export function SiteHeader({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-panel-strong border-b border-cyan-500/30"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="#inicio" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center bg-black border border-cyan-500/60 clip-cyber-sm glow-cyan-sm group-hover:glow-cyan transition-all">
                <Zap className="h-5 w-5 text-cyan-400" fill="currentColor" />
              </div>
              <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-lg tracking-widest text-cyan-400 text-glow-cyan">
                BOTZAP
                <span className="text-red-500 text-glow-red">BR</span>
              </span>
              <span className="font-mono-cyber text-[9px] uppercase tracking-[0.3em] text-slate-500">
                J.A.R.V.I.S System
              </span>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors relative group"
              >
                {link.label}
                <span className="absolute inset-x-3 -bottom-0.5 h-px bg-cyan-400/0 group-hover:bg-cyan-400 transition-colors" />
              </a>
            ))}
          </nav>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10 font-mono-cyber text-xs uppercase tracking-wider"
                >
                  <a href="/dashboard">
                    <Terminal className="h-3.5 w-3.5 mr-1.5" />
                    Dashboard
                  </a>
                </Button>
                <Button
                  asChild
                  className="bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm glow-cyan-sm hover:glow-cyan transition-all"
                >
                  <a href="/dashboard">
                    <Zap className="h-3.5 w-3.5 mr-1.5" fill="currentColor" />
                    Abrir Sistema
                  </a>
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10 font-mono-cyber text-xs uppercase tracking-wider"
                >
                  <a href="/login">
                    <Terminal className="h-3.5 w-3.5 mr-1.5" />
                    Login
                  </a>
                </Button>
                <Button
                  asChild
                  className="bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm glow-cyan-sm hover:glow-cyan transition-all"
                >
                  <a href="/register">
                    <Zap className="h-3.5 w-3.5 mr-1.5" fill="currentColor" />
                    Teste Grátis
                  </a>
                </Button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-cyan-400 hover:bg-cyan-500/10 rounded"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-cyan-500/20"
            >
              <div className="flex flex-col gap-1 py-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="px-4 py-2.5 text-sm text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/5 transition-colors font-mono-cyber"
                  >
                    &gt; {link.label}
                  </a>
                ))}
                <div className="px-4 pt-2 flex flex-col gap-2">
                  {isAuthenticated ? (
                    <Button
                      asChild
                      className="bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm"
                    >
                      <a href="/dashboard">
                        <Zap className="h-3.5 w-3.5 mr-1.5" fill="currentColor" />
                        Abrir Sistema
                      </a>
                    </Button>
                  ) : (
                    <>
                      <Button
                        asChild
                        variant="ghost"
                        className="justify-start text-slate-300 font-mono-cyber text-xs uppercase tracking-wider"
                      >
                        <a href="/login">Login</a>
                      </Button>
                      <Button
                        asChild
                        className="bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm"
                      >
                        <a href="/register">Teste Grátis</a>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
