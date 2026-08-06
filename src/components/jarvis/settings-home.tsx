"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Building2,
  Key,
  Shield,
  Bell,
  Save,
  Copy,
  RefreshCw,
  Trash2,
  Check,
  Smartphone,
  Mail,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function SettingsHome({ user, org }: { user: any; org: any }) {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
          <span className="text-cyan-400 text-glow-cyan">Settings</span>
        </h1>
        <p className="mt-1 font-mono-cyber text-xs uppercase tracking-widest text-slate-500">
          Gerencie sua conta, organização e segurança
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-black/40 border border-cyan-500/20 clip-cyber-sm p-1 h-auto flex-wrap">
          <TabTrigger value="profile" icon={User} label="Perfil" />
          <TabTrigger value="organization" icon={Building2} label="Organização" />
          <TabTrigger value="api" icon={Key} label="API Keys" />
          <TabTrigger value="security" icon={Shield} label="Segurança" />
          <TabTrigger value="notifications" icon={Bell} label="Notificações" />
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <ProfileTab user={user} />
        </TabsContent>
        <TabsContent value="organization" className="mt-4">
          <OrganizationTab org={org} />
        </TabsContent>
        <TabsContent value="api" className="mt-4">
          <ApiTab />
        </TabsContent>
        <TabsContent value="security" className="mt-4">
          <SecurityTab user={user} />
        </TabsContent>
        <TabsContent value="notifications" className="mt-4">
          <NotificationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TabTrigger({ value, icon: Icon, label }: { value: string; icon: LucideIcon; label: string }) {
  return (
    <TabsTrigger
      value={value}
      className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-slate-400 font-mono-cyber text-[10px] uppercase tracking-widest clip-cyber-sm px-3 py-1.5 flex items-center gap-1.5"
    >
      <Icon className="h-3 w-3" />
      {label}
    </TabsTrigger>
  );
}

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="glass-panel clip-cyber p-6">
      <div className="mb-4 pb-3 border-b border-cyan-500/20">
        <h3 className="font-mono-cyber text-xs uppercase tracking-widest text-cyan-400">{title}</h3>
        {description && <p className="font-mono-cyber text-[10px] text-slate-500 mt-1">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function ProfileTab({ user }: { user: any }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const initials = (name || email || "U")
    .split(/[\s@]/)
    .map((p: string) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-4">
      <Card title="Avatar & Identidade">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar className="h-20 w-20 border border-cyan-500/40 clip-cyber">
            <AvatarFallback className="bg-cyan-500/10 text-cyan-400 text-xl font-mono-cyber font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Button variant="outline" className="bg-transparent border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-mono-cyber text-[10px] uppercase tracking-widest clip-cyber-sm">
              <RefreshCw className="h-3 w-3 mr-1.5" />
              Trocar Avatar
            </Button>
            <p className="font-mono-cyber text-[10px] text-slate-500 mt-2">
              PNG, JPG até 2MB. Recomendado 256x256px.
            </p>
          </div>
        </div>
      </Card>

      <Card title="Dados Pessoais">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400">Nome</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-black/60 border-cyan-500/30 text-cyan-100 font-mono-cyber"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400">Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
              className="bg-black/40 border-cyan-500/20 text-slate-400 font-mono-cyber"
            />
            <p className="font-mono-cyber text-[10px] text-slate-500">Email não pode ser alterado.</p>
          </div>
          <Button
            onClick={() => toast.success("Perfil atualizado!")}
            className="bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm glow-cyan-sm"
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Salvar Alterações
          </Button>
        </div>
      </Card>
    </div>
  );
}

function OrganizationTab({ org }: { org: any }) {
  return (
    <div className="space-y-4">
      <Card title="Informações da Organização">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400">Nome</Label>
            <Input
              defaultValue={org?.name || ""}
              className="bg-black/60 border-cyan-500/30 text-cyan-100 font-mono-cyber"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400">Slug (URL)</Label>
            <Input
              defaultValue={org?.slug || ""}
              disabled
              className="bg-black/40 border-cyan-500/20 text-slate-400 font-mono-cyber"
            />
          </div>
          <Button
            onClick={() => toast.success("Organização atualizada!")}
            className="bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm glow-cyan-sm"
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Salvar
          </Button>
        </div>
      </Card>

      <Card title="Plano Atual" description="Gerencie sua assinatura">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display font-bold text-xl text-cyan-400">{org?.plan || "FREE"}</div>
            <div className="font-mono-cyber text-[10px] text-slate-500 mt-1">
              Status: {org?.status || "—"}
            </div>
          </div>
          <Button
            asChild
            className="bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm"
          >
            <a href="/billing">Gerenciar Plano</a>
          </Button>
        </div>
      </Card>

      <Card title="Zona Perigosa" description="Ações irreversíveis">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 clip-cyber-sm">
            <div>
              <div className="font-mono-cyber text-xs text-red-400">Deletar Organização</div>
              <div className="font-mono-cyber text-[10px] text-slate-500 mt-0.5">
                Remove todos os dados permanentemente
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => toast.error("Confirmação necessária", { description: "Esta ação não pode ser desfeita." })}
              className="bg-transparent border-red-500/40 text-red-400 hover:bg-red-500/10 font-mono-cyber text-[10px] uppercase tracking-widest clip-cyber-sm"
            >
              <Trash2 className="h-3 w-3 mr-1.5" />
              Deletar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ApiTab() {
  const [keys] = useState([
    { id: "1", name: "Produção", key: "bz_live_8f3k2j9d4k2l9", created: "2026-07-15", lastUsed: "2 min atrás" },
    { id: "2", name: "Desenvolvimento", key: "bz_test_2j4k9d2k2l9d", created: "2026-06-22", lastUsed: "3 dias atrás" },
  ]);

  return (
    <div className="space-y-4">
      <Card title="Chaves de API" description="Use estas chaves para integrar via API REST">
        <div className="space-y-3">
          {keys.map((k) => (
            <div key={k.id} className="p-3 bg-cyan-500/[0.03] border border-cyan-500/15 clip-cyber-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Key className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="font-mono-cyber text-xs text-white">{k.name}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(k.key);
                    toast.success("Chave copiada!");
                  }}
                  className="p-1 text-slate-400 hover:text-cyan-400"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <code className="block font-mono-cyber text-[11px] text-cyan-300 bg-black/40 p-2 clip-cyber-sm overflow-x-auto">
                {k.key}
              </code>
              <div className="flex items-center justify-between mt-2 font-mono-cyber text-[9px] text-slate-500">
                <span>Criada: {k.created}</span>
                <span>Último uso: {k.lastUsed}</span>
              </div>
            </div>
          ))}
          <Button
            onClick={() => toast.success("Nova chave criada!", { description: "bz_live_x9k2j4..." })}
            className="bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm glow-cyan-sm"
          >
            <Key className="h-3.5 w-3.5 mr-1.5" />
            Gerar Nova Chave
          </Button>
        </div>
      </Card>

      <Card title="Webhooks" description="Endpoints para receber eventos">
        <div className="space-y-2">
          <div className="p-3 bg-cyan-500/[0.03] border border-cyan-500/15 clip-cyber-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-400" />
              <code className="font-mono-cyber text-[11px] text-cyan-300">https://api.minhaapp.com/webhooks/botzapbr</code>
            </div>
            <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-[9px] font-mono-cyber">ATIVO</Badge>
          </div>
          <Button
            onClick={() => toast.info("Adicionar webhook")}
            variant="outline"
            className="bg-transparent border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-mono-cyber text-[10px] uppercase tracking-widest clip-cyber-sm"
          >
            + Adicionar Webhook
          </Button>
        </div>
      </Card>
    </div>
  );
}

function SecurityTab({ user }: { user: any }) {
  const [twoFA, setTwoFA] = useState(false);
  return (
    <div className="space-y-4">
      <Card title="Senha">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400">Senha atual</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input type="password" placeholder="••••••••" className="pl-10 bg-black/60 border-cyan-500/30 text-cyan-100 font-mono-cyber" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400">Nova senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input type="password" placeholder="••••••••" className="pl-10 bg-black/60 border-cyan-500/30 text-cyan-100 font-mono-cyber" />
            </div>
          </div>
          <Button
            onClick={() => toast.success("Senha alterada!")}
            className="bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm glow-cyan-sm"
          >
            <Lock className="h-3.5 w-3.5 mr-1.5" />
            Alterar Senha
          </Button>
        </div>
      </Card>

      <Card title="Autenticação 2 Fatores" description="Camada extra de segurança">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 clip-cyber-sm">
              <Smartphone className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <div className="font-mono-cyber text-xs text-white">App Autenticador</div>
              <div className="font-mono-cyber text-[10px] text-slate-500">
                Google Authenticator, Authy, 1Password
              </div>
            </div>
          </div>
          <Switch
            checked={twoFA}
            onCheckedChange={(v) => {
              setTwoFA(v);
              toast.success(v ? "2FA ativado!" : "2FA desativado");
            }}
          />
        </div>
      </Card>

      <Card title="Sessões Ativas">
        <div className="space-y-2">
          {[
            { device: "Chrome — Windows", location: "São Paulo, BR", current: true, last: "Agora" },
            { device: "Safari — iPhone 15", location: "São Paulo, BR", current: false, last: "2 horas atrás" },
            { device: "Firefox — Linux", location: "Rio de Janeiro, BR", current: false, last: "5 dias atrás" },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-cyan-500/[0.03] border border-cyan-500/15 clip-cyber-sm">
              <div className="flex items-center gap-2.5">
                <Smartphone className="h-4 w-4 text-cyan-400" />
                <div>
                  <div className="font-mono-cyber text-xs text-white flex items-center gap-2">
                    {s.device}
                    {s.current && <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-[9px]">ATUAL</Badge>}
                  </div>
                  <div className="font-mono-cyber text-[10px] text-slate-500">{s.location} • {s.last}</div>
                </div>
              </div>
              {!s.current && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toast.info("Sessão revogada")}
                  className="text-red-400 hover:bg-red-500/10 p-2"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function NotificationsTab() {
  const [settings, setSettings] = useState({
    emailCampaigns: true,
    emailBilling: true,
    emailSecurity: true,
    emailProduct: false,
    pushCampaigns: true,
    pushMessages: true,
    pushSecurity: true,
    whatsappAlerts: true,
  });

  return (
    <div className="space-y-4">
      <Card title="Notificações por Email">
        <div className="space-y-3">
          {[
            { key: "emailCampaigns", label: "Status de campanhas", desc: "Resultados de disparos e relatórios" },
            { key: "emailBilling", label: "Cobrança e faturas", desc: "Recibos, renovações e falhas de pagamento" },
            { key: "emailSecurity", label: "Alertas de segurança", desc: "Novos logins, alterações de senha, 2FA" },
            { key: "emailProduct", label: "Novidades do produto", desc: "Novos recursos, atualizações e tutoriais" },
          ].map((s) => (
            <div key={s.key} className="flex items-center justify-between">
              <div>
                <div className="font-mono-cyber text-xs text-white">{s.label}</div>
                <div className="font-mono-cyber text-[10px] text-slate-500">{s.desc}</div>
              </div>
              <Switch
                checked={settings[s.key as keyof typeof settings]}
                onCheckedChange={(v) => setSettings({ ...settings, [s.key]: v })}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Notificações Push">
        <div className="space-y-3">
          {[
            { key: "pushCampaigns", label: "Campanhas", desc: "Notificações em tempo real sobre disparos" },
            { key: "pushMessages", label: "Novas mensagens", desc: "Quando receber mensagens no WhatsApp" },
            { key: "pushSecurity", label: "Segurança", desc: "Alertas críticos de segurança" },
          ].map((s) => (
            <div key={s.key} className="flex items-center justify-between">
              <div>
                <div className="font-mono-cyber text-xs text-white">{s.label}</div>
                <div className="font-mono-cyber text-[10px] text-slate-500">{s.desc}</div>
              </div>
              <Switch
                checked={settings[s.key as keyof typeof settings]}
                onCheckedChange={(v) => setSettings({ ...settings, [s.key]: v })}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Alertas WhatsApp">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono-cyber text-xs text-white">Receber alertas no WhatsApp</div>
            <div className="font-mono-cyber text-[10px] text-slate-500">Receba notificações críticas via WhatsApp</div>
          </div>
          <Switch
            checked={settings.whatsappAlerts}
            onCheckedChange={(v) => setSettings({ ...settings, whatsappAlerts: v })}
          />
        </div>
      </Card>
    </div>
  );
}
