"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  LayoutDashboard,
  MessageSquare,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "WhatsApp", href: "/whatsapp", icon: MessageSquare, badge: "3" },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
];

type Session = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    plan?: string;
  };
};

export function AppShell({ session, children }: { session: Session; children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = (session.user.name || session.user.email || "U")
    .split(/[\s@]/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative min-h-screen flex bg-[#050811]">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-cyan-500/20 bg-black/40 backdrop-blur-md">
        <SidebarContent session={session} pathname={pathname} initials={initials} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-cyan-500/30 bg-[#050811] lg:hidden"
            >
              <SidebarContent
                session={session}
                pathname={pathname}
                initials={initials}
                onNavigate={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 flex items-center gap-3 px-4 sm:px-6 border-b border-cyan-500/20 bg-black/40 backdrop-blur-md">
          {/* Mobile menu */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 text-cyan-400 hover:bg-cyan-500/10 clip-cyber-sm"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono-cyber uppercase tracking-widest text-slate-500">
            <span className="text-cyan-400">J.A.R.V.I.S</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-300">{pathname.split("/")[1] || "dashboard"}</span>
          </div>

          {/* Search */}
          <div className="ml-auto hidden md:flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-cyan-500/20 clip-cyber-sm w-64">
            <Search className="h-3.5 w-3.5 text-slate-500" />
            <input
              placeholder="Buscar..."
              className="bg-transparent border-none outline-none text-xs font-mono-cyber text-cyan-100 placeholder:text-slate-600 w-full"
            />
            <kbd className="text-[9px] font-mono-cyber text-slate-500 px-1 py-0.5 border border-slate-700 rounded">⌘K</kbd>
          </div>

          {/* Status indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/30 clip-cyber-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
            </span>
            <span className="font-mono-cyber text-[9px] uppercase tracking-widest text-green-400">
              Online
            </span>
          </div>

          {/* Plan badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 clip-cyber-sm">
            <Zap className="h-3 w-3 text-cyan-400" fill="currentColor" />
            <span className="font-mono-cyber text-[9px] uppercase tracking-widest text-cyan-400">
              {session.user.plan || "FREE"}
            </span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 clip-cyber-sm transition-all">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          </button>

          {/* User avatar */}
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 border border-cyan-500/40 clip-cyber-sm">
              <AvatarFallback className="bg-cyan-500/10 text-cyan-400 text-xs font-mono-cyber font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  session,
  pathname,
  initials,
  onNavigate,
}: {
  session: Session;
  pathname: string;
  initials: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-cyan-500/20">
        <Link href="/dashboard" className="flex items-center gap-2.5 group" onClick={onNavigate}>
          <div className="flex h-9 w-9 items-center justify-center bg-black border border-cyan-500/60 clip-cyber-sm glow-cyan-sm group-hover:glow-cyan transition-all">
            <Zap className="h-5 w-5 text-cyan-400" fill="currentColor" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-bold text-base tracking-widest text-cyan-400 text-glow-cyan">
              BOTZAP<span className="text-red-500 text-glow-red">BR</span>
            </span>
            <span className="font-mono-cyber text-[8px] uppercase tracking-[0.3em] text-slate-500">
              J.A.R.V.I.S Console
            </span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scroll-cyber">
        <div className="px-3 py-2 font-mono-cyber text-[9px] uppercase tracking-[0.3em] text-slate-600">
          Menu Principal
        </div>
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-all relative group ${
                active
                  ? "bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400"
                  : "text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/5 border-l-2 border-transparent"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 bg-cyan-500/5 pointer-events-none"
                />
              )}
              <item.icon className="h-4 w-4 shrink-0 relative z-10" />
              <span className="relative z-10 font-mono-cyber text-xs uppercase tracking-wider">
                {item.label}
              </span>
              {item.badge && (
                <Badge className="ml-auto bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[9px] font-mono-cyber">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}

        {/* Quick stats */}
        <div className="mt-6 px-3 py-3 bg-cyan-500/5 border border-cyan-500/20 clip-cyber-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono-cyber text-[9px] uppercase tracking-widest text-slate-500">
              Sistema
            </span>
            <Activity className="h-3 w-3 text-green-400" />
          </div>
          <div className="space-y-1.5">
            <Stat label="Mensagens hoje" value="1.247" color="text-cyan-400" />
            <Stat label="Contatos ativos" value="589" color="text-green-400" />
            <Stat label="Campanhas" value="3" color="text-yellow-400" />
          </div>
        </div>
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-cyan-500/20">
        <div className="flex items-center gap-2 px-2 py-2 hover:bg-cyan-500/5 transition-colors">
          <Avatar className="h-8 w-8 border border-cyan-500/40 clip-cyber-sm shrink-0">
            <AvatarFallback className="bg-cyan-500/10 text-cyan-400 text-xs font-mono-cyber font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-mono-cyber text-cyan-100 truncate">
              {session.user.name || "Usuário"}
            </div>
            <div className="text-[10px] font-mono-cyber text-slate-500 truncate">
              {session.user.email}
            </div>
          </div>
        </div>
        <Button
          onClick={() => signOut({ callbackUrl: "/" })}
          variant="ghost"
          className="w-full mt-1 justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10 font-mono-cyber text-xs uppercase tracking-wider"
        >
          <LogOut className="h-3.5 w-3.5 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between text-[10px] font-mono-cyber">
      <span className="text-slate-500">{label}</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  );
}
