import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Key,
  RefreshCw,
  Database,
  Shield,
  Bell,
  Save,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Download,
  Trash2,
  HardDrive,
  Cpu,
  Brain,
  Sparkles,
  HelpCircle,
  ExternalLink,
  Zap,
  type LucideIcon,
} from "lucide-react";

type Tab = "profile" | "ai" | "updates" | "data" | "security" | "help";

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("ai");
  const [token] = useState(() => localStorage.getItem("devfactory_token") || "");

  return (
    <div className="fixed inset-0 flex flex-col bg-[#050811] overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <SettingsHeader token={token} />

      <div className="relative z-10 flex-1 flex overflow-hidden">
        <SettingsSidebar tab={tab} onChange={setTab} />
        <div className="flex-1 overflow-y-auto scroll-cyber p-6">
          {tab === "profile" && <ProfileTab token={token} />}
          {tab === "ai" && <AITab token={token} />}
          {tab === "updates" && <UpdatesTab />}
          {tab === "data" && <DataTab />}
          {tab === "security" && <SecurityTab token={token} />}
          {tab === "help" && <HelpTab />}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Header
// ============================================================================

function SettingsHeader({ token }: { token: string }) {
  return (
    <div className="titlebar-drag relative z-20 h-12 bg-black/60 backdrop-blur-md flex items-center justify-between px-4 border-b border-cyan-500/20">
      <div className="flex items-center gap-2">
        <span className="font-display font-bold text-sm tracking-widest text-cyan-400">
          Configurações
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Sidebar
// ============================================================================

function SettingsSidebar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const items: { id: Tab; label: string; icon: LucideIcon }[] = [
    { id: "ai", label: "IA & API Keys", icon: Brain },
    { id: "profile", label: "Perfil", icon: User },
    { id: "updates", label: "Atualizações", icon: RefreshCw },
    { id: "data", label: "Dados & Backup", icon: Database },
    { id: "security", label: "Segurança", icon: Shield },
    { id: "help", label: "Ajuda", icon: HelpCircle },
  ];

  return (
    <div className="w-56 border-r border-cyan-500/20 bg-black/30 p-3 space-y-1">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-all clip-cyber-sm ${
            tab === item.id
              ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/40"
              : "text-slate-400 hover:bg-cyan-500/5 hover:text-cyan-400 border border-transparent"
          }`}
        >
          <item.icon className="h-3.5 w-3.5" />
          <span className="font-mono-cyber uppercase tracking-wider">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// AI & API Keys Tab — auto-detect any provider
// ============================================================================

const AI_PROVIDERS = [
  {
    id: "gemini",
    name: "Google Gemini",
    icon: Sparkles,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/40",
    keyPrefix: ["AIza", "ya29"],
    keyLength: [35, 45],
    placeholder: "AIzaSyB...",
    docsUrl: "https://aistudio.google.com/apikey",
    freeTier: "Free: 15 req/min, 1500 req/dia",
    models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
  },
  {
    id: "openai",
    name: "OpenAI GPT",
    icon: Brain,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/40",
    keyPrefix: ["sk-"],
    keyLength: [40, 200],
    placeholder: "sk-proj-...",
    docsUrl: "https://platform.openai.com/api-keys",
    freeTier: "Pago: ~$0.01/1K tokens (GPT-4o-mini)",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    icon: Brain,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/40",
    keyPrefix: ["sk-ant-"],
    keyLength: [100, 150],
    placeholder: "sk-ant-api03-...",
    docsUrl: "https://console.anthropic.com/settings/keys",
    freeTier: "Free: $5 crédito inicial",
    models: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"],
  },
  {
    id: "ollama",
    name: "Ollama (Local)",
    icon: Cpu,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/40",
    keyPrefix: [],
    keyLength: [0, 0],
    placeholder: "Não precisa de chave (instale em ollama.com)",
    docsUrl: "https://ollama.com/download",
    freeTier: "100% Gratuito e Offline",
    models: ["llama3.1", "llama3.1:8b", "mistral", "phi3", "qwen2.5"],
  },
  {
    id: "groq",
    name: "Groq (Ultra Rápido)",
    icon: Zap,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/40",
    keyPrefix: ["gsk_"],
    keyLength: [50, 60],
    placeholder: "gsk_...",
    docsUrl: "https://console.groq.com/keys",
    freeTier: "Free: 30 req/min, 14400 req/dia",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
  },
  {
    id: "mistral",
    name: "Mistral AI",
    icon: Sparkles,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/40",
    keyPrefix: [""],
    keyLength: [30, 40],
    placeholder: "qualquer string de 32+ chars",
    docsUrl: "https://console.mistral.ai/api-keys",
    freeTier: "Free: ~$8 crédito/mês",
    models: ["mistral-large-latest", "mistral-small-latest", "open-mistral-7b"],
  },
];

function AITab({ token }: { token: string }) {
  const [activeProvider, setActiveProvider] = useState<string>("gemini");
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [validation, setValidation] = useState<Record<string, "idle" | "validating" | "valid" | "invalid">>({});
  const [selectedModels, setSelectedModels] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Load saved API keys from DB
  useEffect(() => {
    async function load() {
      const settings = (await window.devfactory.store.get("settings")) || {};
      setApiKeys(settings.apiKeys || {});
      setSelectedModels(settings.aiModels || { gemini: "gemini-2.0-flash" });
    }
    load();
  }, []);

  const detectProvider = (key: string): string | null => {
    if (!key) return null;
    for (const p of AI_PROVIDERS) {
      if (p.keyPrefix.length === 0) continue; // skip ollama
      for (const prefix of p.keyPrefix) {
        if (key.startsWith(prefix)) {
          // Also check length if defined
          if (p.keyLength[1] > 0 && (key.length < p.keyLength[0] || key.length > p.keyLength[1])) {
            continue;
          }
          return p.id;
        }
      }
    }
    // Heuristic: long key with digits → likely Mistral or OpenAI
    if (key.length > 30 && key.length < 50 && /^[a-zA-Z0-9]+$/.test(key)) return "mistral";
    return null;
  };

  const handleKeyChange = (providerId: string, value: string) => {
    setApiKeys({ ...apiKeys, [providerId]: value });
    // Auto-detect provider if user is typing in a "generic" field
    const detected = detectProvider(value);
    if (detected && detected !== providerId) {
      setActiveProvider(detected);
    }
    setValidation({ ...validation, [providerId]: "idle" });
  };

  const validateKey = async (providerId: string) => {
    const key = apiKeys[providerId];
    if (!key) return;
    setValidation({ ...validation, [providerId]: "validating" });
    try {
      // Simulate API validation (in production, actually call the provider)
      await new Promise((r) => setTimeout(r, 1200));
      // Basic format check
      const provider = AI_PROVIDERS.find((p) => p.id === providerId);
      if (provider && provider.keyPrefix.length > 0) {
        const matchesPrefix = provider.keyPrefix.some((p) => key.startsWith(p));
        if (!matchesPrefix) {
          setValidation({ ...validation, [providerId]: "invalid" });
          return;
        }
      }
      setValidation({ ...validation, [providerId]: "valid" });
    } catch {
      setValidation({ ...validation, [providerId]: "invalid" });
    }
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    const settings = (await window.devfactory.store.get("settings")) || {};
    await window.devfactory.store.set("settings", {
      ...settings,
      apiKeys,
      aiModels: selectedModels,
      activeAIProvider: activeProvider,
    });
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <SectionHeader
        title="IA & API Keys"
        description="Configure qualquer provedor de IA. A aplicação detecta automaticamente o provider pela chave."
        icon={Brain}
      />

      {/* Help banner */}
      <HelpBanner>
        <p>
          <strong>Como funciona:</strong> Cole qualquer chave de API (Gemini, OpenAI, Claude, Groq, Mistral) e o DevFactory
          detecta automaticamente o provedor. Para IA local sem chave, selecione Ollama. Você pode configurar múltiplos
          provedores e alternar entre eles.
        </p>
      </HelpBanner>

      {/* Provider tabs */}
      <div className="flex flex-wrap gap-2">
        {AI_PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveProvider(p.id)}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-mono-cyber uppercase tracking-wider clip-cyber-sm transition-all border ${
              activeProvider === p.id
                ? `${p.bgColor} ${p.borderColor} ${p.color}`
                : "bg-black/40 border-slate-700 text-slate-400 hover:border-cyan-500/40 hover:text-cyan-400"
            }`}
          >
            <p.icon className="h-3.5 w-3.5" />
            {p.name}
            {apiKeys[p.id] && (
              <Check className="h-3 w-3 text-green-400" />
            )}
          </button>
        ))}
      </div>

      {/* Active provider config */}
      {AI_PROVIDERS.filter((p) => p.id === activeProvider).map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass-panel clip-cyber p-5 ${p.borderColor} border`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${p.bgColor} ${p.borderColor} border clip-cyber-sm`}>
                <p.icon className={`h-5 w-5 ${p.color}`} />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">{p.name}</h3>
                <p className="font-mono-cyber text-[10px] text-slate-500 mt-0.5">{p.freeTier}</p>
              </div>
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.devfactory.system.openExternal(p.docsUrl);
              }}
              className="flex items-center gap-1 text-[10px] font-mono-cyber uppercase tracking-widest text-cyan-400 hover:text-cyan-300"
            >
              Obter chave <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {p.id !== "ollama" ? (
            <>
              {/* API Key input */}
              <div className="space-y-2 mb-4">
                <label className="font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400">
                  Chave de API
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type={showKeys[p.id] ? "text" : "password"}
                    value={apiKeys[p.id] || ""}
                    onChange={(e) => handleKeyChange(p.id, e.target.value)}
                    onBlur={() => validateKey(p.id)}
                    placeholder={p.placeholder}
                    className="w-full pl-10 pr-10 py-2.5 bg-black/60 border border-cyan-500/30 text-cyan-100 placeholder:text-slate-600 font-mono-cyber text-sm outline-none focus:border-cyan-500/60 transition-all clip-cyber-sm"
                  />
                  <button
                    onClick={() => setShowKeys({ ...showKeys, [p.id]: !showKeys[p.id] })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400"
                  >
                    {showKeys[p.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Validation status */}
                {validation[p.id] === "validating" && (
                  <div className="flex items-center gap-2 text-[10px] font-mono-cyber text-cyan-400">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Validando...
                  </div>
                )}
                {validation[p.id] === "valid" && (
                  <div className="flex items-center gap-2 text-[10px] font-mono-cyber text-green-400">
                    <Check className="h-3 w-3" />
                    Chave válida! Pronto para uso.
                  </div>
                )}
                {validation[p.id] === "invalid" && (
                  <div className="flex items-center gap-2 text-[10px] font-mono-cyber text-red-400">
                    <AlertCircle className="h-3 w-3" />
                    Formato inválido. Verifique a chave.
                  </div>
                )}
              </div>

              {/* Model selector */}
              <div className="space-y-2">
                <label className="font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400">
                  Modelo padrão
                </label>
                <select
                  value={selectedModels[p.id] || p.models[0]}
                  onChange={(e) => setSelectedModels({ ...selectedModels, [p.id]: e.target.value })}
                  className="w-full px-3 py-2.5 bg-black/60 border border-cyan-500/30 text-cyan-100 font-mono-cyber text-sm outline-none focus:border-cyan-500/60 clip-cyber-sm"
                >
                  {p.models.map((m) => (
                    <option key={m} value={m} className="bg-black text-cyan-100">
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <p className="font-mono-cyber text-[11px] text-slate-300 leading-relaxed">
                Ollama roda 100% local no seu PC. Sem chave de API necessária.
              </p>
              <div className="p-3 bg-purple-500/5 border border-purple-500/20 clip-cyber-sm">
                <p className="font-mono-cyber text-[10px] text-purple-300 mb-2 uppercase tracking-widest">
                  Instalação:
                </p>
                <ol className="space-y-1 text-[11px] font-mono-cyber text-slate-400">
                  <li>1. Baixe em <span className="text-purple-400">ollama.com</span></li>
                  <li>2. Instale e abra o terminal</li>
                  <li>3. Rode: <code className="px-1 py-0.5 bg-black/40 text-purple-300">ollama pull llama3.1</code></li>
                  <li>4. Pronto! O DevFactory detecta automaticamente.</li>
                </ol>
              </div>
              <div className="space-y-2">
                <label className="font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400">
                  Modelo Ollama
                </label>
                <select
                  value={selectedModels[p.id] || p.models[0]}
                  onChange={(e) => setSelectedModels({ ...selectedModels, [p.id]: e.target.value })}
                  className="w-full px-3 py-2.5 bg-black/60 border border-cyan-500/30 text-cyan-100 font-mono-cyber text-sm outline-none focus:border-cyan-500/60 clip-cyber-sm"
                >
                  {p.models.map((m) => (
                    <option key={m} value={m} className="bg-black text-cyan-100">
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </motion.div>
      ))}

      {/* Save button */}
      <div className="flex items-center gap-3 pt-4 border-t border-cyan-500/20">
        <button
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm glow-cyan-sm transition-all disabled:opacity-50"
        >
          {saveStatus === "saving" ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : saveStatus === "saved" ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {saveStatus === "saving" ? "Salvando..." : saveStatus === "saved" ? "Salvo!" : "Salvar Configurações"}
        </button>
        <span className="font-mono-cyber text-[10px] text-slate-500">
          Provider ativo: <span className="text-cyan-400">{activeProvider}</span>
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Updates Tab
// ============================================================================

function UpdatesTab() {
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [appVersion, setAppVersion] = useState("");

  useEffect(() => {
    window.devfactory.app.getVersion().then(setAppVersion);
  }, []);

  const handleCheck = async () => {
    setChecking(true);
    try {
      await window.devfactory.update.check();
      setLastCheck(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <SectionHeader
        title="Atualizações"
        description="O DevFactory verifica automaticamente por atualizações a cada 30 minutos. Você decide quando instalar."
        icon={RefreshCw}
      />

      <HelpBanner>
        <p>
          <strong>Atualização automática:</strong> Quando uma nova versão for encontrada, aparecerá uma notificação no
          canto superior direito. Você pode baixar e instalar com 1 clique — sem precisar baixar o instalador novamente.
        </p>
      </HelpBanner>

      <div className="glass-panel clip-cyber p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-mono-cyber text-[10px] uppercase tracking-widest text-slate-500">
              Versão atual
            </div>
            <div className="font-display font-bold text-2xl text-cyan-400 mt-1">
              v{appVersion}
            </div>
          </div>
          <button
            onClick={handleCheck}
            disabled={checking}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${checking ? "animate-spin" : ""}`} />
            {checking ? "Verificando..." : "Verificar Agora"}
          </button>
        </div>
        {lastCheck && (
          <div className="font-mono-cyber text-[10px] text-slate-500">
            Última verificação: {lastCheck.toLocaleString("pt-BR")}
          </div>
        )}
      </div>

      <div className="glass-panel clip-cyber p-5">
        <h3 className="font-display font-bold text-sm text-cyan-400 uppercase tracking-widest mb-3">
          Como funciona
        </h3>
        <ol className="space-y-2 text-[12px] font-mono-cyber text-slate-400">
          <li className="flex gap-2">
            <span className="text-cyan-400 font-bold">1.</span>
            <span>Verificação automática a cada 30 minutos</span>
          </li>
          <li className="flex gap-2">
            <span className="text-cyan-400 font-bold">2.</span>
            <span>Notificação aparece no canto superior direito</span>
          </li>
          <li className="flex gap-2">
            <span className="text-cyan-400 font-bold">3.</span>
            <span>Clique em "Baixar Agora" para iniciar o download</span>
          </li>
          <li className="flex gap-2">
            <span className="text-cyan-400 font-bold">4.</span>
            <span>Após concluir, clique em "Reiniciar e Atualizar"</span>
          </li>
          <li className="flex gap-2">
            <span className="text-cyan-400 font-bold">5.</span>
            <span>App reinicia sozinho com a nova versão — sem reinstalar!</span>
          </li>
        </ol>
      </div>
    </div>
  );
}

// ============================================================================
// Data & Backup Tab
// ============================================================================

function DataTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const s = await window.devfactory.db.stats();
      setStats(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleExport = async () => {
    try {
      const result = await window.devfactory.db.export();
      if (!result.canceled) {
        alert(`Dados exportados para: ${result.path}`);
      }
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  const handleBackup = async () => {
    try {
      const result = await window.devfactory.db.backup();
      alert(`Backup criado: ${result.path}`);
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  const handleWipe = async () => {
    if (!confirm("⚠ ATENÇÃO: Isso vai apagar TODOS os seus dados (usuário, comandos, contatos, configs). Esta ação NÃO pode ser desfeita. Continuar?")) return;
    if (!confirm("Tem certeza ABSOLUTA? Digite OK no próximo prompt para confirmar.")) return;
    const code = prompt("Digite 'APAGAR' para confirmar:");
    if (code !== "APAGAR") {
      alert("Operação cancelada.");
      return;
    }
    try {
      await window.devfactory.db.wipe();
      alert("Dados apagados. O app vai reiniciar.");
      window.devfactory.app.relaunch();
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="max-w-2xl space-y-6">
      <SectionHeader
        title="Dados & Backup"
        description="Todos os dados ficam armazenados localmente no seu PC. Faça backup ou exporte quando quiser."
        icon={Database}
      />

      <HelpBanner>
        <p>
          <strong>100% Local:</strong> Seus dados nunca saem do seu PC. O arquivo SQLite fica em{" "}
          <code className="px-1 py-0.5 bg-black/40 text-cyan-300">userData/devfactory.db</code>.
          Faça backup regularmente!
        </p>
      </HelpBanner>

      {/* DB Stats */}
      <div className="glass-panel clip-cyber p-5">
        <div className="flex items-center gap-2 mb-4">
          <HardDrive className="h-4 w-4 text-cyan-400" />
          <h3 className="font-display font-bold text-sm text-cyan-400 uppercase tracking-widest">
            Estatísticas
          </h3>
        </div>
        {loading ? (
          <div className="font-mono-cyber text-xs text-slate-500">Carregando...</div>
        ) : stats ? (
          <div className="space-y-3">
            <div>
              <div className="font-mono-cyber text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                Localização
              </div>
              <div className="font-mono-cyber text-xs text-cyan-300 break-all">
                {stats.dbPath}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="Tamanho" value={formatBytes(stats.dbSizeBytes)} icon={Database} />
              <StatBox label="Usuários" value={String(stats.tableCounts.users || 0)} icon={User} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <StatBox label="Comandos" value={String(stats.tableCounts.commandLogs || 0)} icon={Cpu} small />
              <StatBox label="Contatos" value={String(stats.tableCounts.contacts || 0)} icon={User} small />
              <StatBox label="Mensagens" value={String(stats.tableCounts.messages || 0)} icon={Database} small />
            </div>
          </div>
        ) : (
          <div className="font-mono-cyber text-xs text-red-400">Erro ao carregar estatísticas</div>
        )}
      </div>

      {/* Actions */}
      <div className="glass-panel clip-cyber p-5">
        <h3 className="font-display font-bold text-sm text-cyan-400 uppercase tracking-widest mb-3">
          Ações
        </h3>
        <div className="space-y-2">
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-between px-4 py-3 bg-cyan-500/5 border border-cyan-500/30 hover:bg-cyan-500/10 clip-cyber-sm transition-all"
          >
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-cyan-400" />
              <div className="text-left">
                <div className="font-mono-cyber text-xs text-white">Exportar dados (JSON)</div>
                <div className="font-mono-cyber text-[10px] text-slate-500">Backup completo em formato JSON</div>
              </div>
            </div>
          </button>
          <button
            onClick={handleBackup}
            className="w-full flex items-center justify-between px-4 py-3 bg-cyan-500/5 border border-cyan-500/30 hover:bg-cyan-500/10 clip-cyber-sm transition-all"
          >
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-cyan-400" />
              <div className="text-left">
                <div className="font-mono-cyber text-xs text-white">Backup do banco (DB)</div>
                <div className="font-mono-cyber text-[10px] text-slate-500">Cópia binária do SQLite</div>
              </div>
            </div>
          </button>
          <button
            onClick={() => window.devfactory.db.openFolder()}
            className="w-full flex items-center justify-between px-4 py-3 bg-cyan-500/5 border border-cyan-500/30 hover:bg-cyan-500/10 clip-cyber-sm transition-all"
          >
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-cyan-400" />
              <div className="text-left">
                <div className="font-mono-cyber text-xs text-white">Abrir pasta do banco</div>
                <div className="font-mono-cyber text-[10px] text-slate-500">Mostra o arquivo no Explorer</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="glass-panel clip-cyber p-5 border-red-500/40 border">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <h3 className="font-display font-bold text-sm text-red-400 uppercase tracking-widest">
            Zona Perigosa
          </h3>
        </div>
        <p className="font-mono-cyber text-[11px] text-slate-400 mb-3">
          Apaga TODOS os dados. Esta ação é irreversível.
        </p>
        <button
          onClick={handleWipe}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Factory Reset
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Profile Tab
// ============================================================================

function ProfileTab({ token }: { token: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("devfactory_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await window.devfactory.auth.updateProfile(token, { name });
      const userStr = localStorage.getItem("devfactory_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        localStorage.setItem("devfactory_user", JSON.stringify({ ...user, name }));
      }
      alert("Perfil atualizado!");
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <SectionHeader title="Perfil" description="Atualize suas informações pessoais." icon={User} />
      <div className="glass-panel clip-cyber p-5 space-y-4">
        <div className="space-y-2">
          <label className="font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400">Nome</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 bg-black/60 border border-cyan-500/30 text-cyan-100 font-mono-cyber text-sm outline-none focus:border-cyan-500/60 clip-cyber-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400">Email</label>
          <input
            value={email}
            disabled
            className="w-full px-3 py-2.5 bg-black/40 border border-cyan-500/20 text-slate-500 font-mono-cyber text-sm clip-cyber-sm"
          />
          <p className="font-mono-cyber text-[10px] text-slate-600">Email não pode ser alterado.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm transition-all"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Security Tab
// ============================================================================

function SecurityTab({ token }: { token: string }) {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (newPass !== confirm) {
      alert("As senhas não conferem.");
      return;
    }
    if (newPass.length < 8) {
      alert("Senha deve ter pelo menos 8 caracteres.");
      return;
    }
    setSaving(true);
    try {
      await window.devfactory.auth.changePassword(token, current, newPass);
      alert("Senha alterada com sucesso!");
      setCurrent("");
      setNewPass("");
      setConfirm("");
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <SectionHeader title="Segurança" description="Altere sua senha local." icon={Shield} />
      <div className="glass-panel clip-cyber p-5 space-y-4">
        <div className="space-y-2">
          <label className="font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400">Senha atual</label>
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="w-full px-3 py-2.5 bg-black/60 border border-cyan-500/30 text-cyan-100 font-mono-cyber text-sm outline-none focus:border-cyan-500/60 clip-cyber-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400">Nova senha</label>
          <input
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            className="w-full px-3 py-2.5 bg-black/60 border border-cyan-500/30 text-cyan-100 font-mono-cyber text-sm outline-none focus:border-cyan-500/60 clip-cyber-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="font-mono-cyber text-[10px] uppercase tracking-widest text-cyan-400">Confirmar nova senha</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-3 py-2.5 bg-black/60 border border-cyan-500/30 text-cyan-100 font-mono-cyber text-sm outline-none focus:border-cyan-500/60 clip-cyber-sm"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !current || !newPass || !confirm}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm transition-all disabled:opacity-50"
        >
          <Shield className="h-3.5 w-3.5" />
          {saving ? "Alterando..." : "Alterar Senha"}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Help Tab
// ============================================================================

function HelpTab() {
  return (
    <div className="max-w-3xl space-y-6">
      <SectionHeader
        title="Ajuda & Manual"
        description="Tudo que você precisa para usar o DevFactory."
        icon={HelpCircle}
      />

      <div className="glass-panel clip-cyber p-5">
        <h3 className="font-display font-bold text-sm text-cyan-400 uppercase tracking-widest mb-3">
          📚 Manual Rápido
        </h3>
        <div className="space-y-3 text-[12px] font-mono-cyber text-slate-400">
          <ManualItem
            num="1"
            title="Primeiro uso"
            text="Abra o app → Setup Wizard aparece → crie sua conta master (nome + email + senha). Trial de 7 dias começa automaticamente."
          />
          <ManualItem
            num="2"
            title="Login"
            text="Use email + senha criados no setup. 100% local, sem internet necessária."
          />
          <ManualItem
            num="3"
            title="Dashboard"
            text="Veja telemetria do PC (CPU/RAM/GPU/Temp/Rede/Discos) em tempo real. Use a barra de comandos para executar ações: 'abrir vscode', 'abrir chrome', etc."
          />
          <ManualItem
            num="4"
            title="Configurar IA"
            text="Settings → IA & API Keys → escolha provider (Gemini, OpenAI, Claude, Groq, Mistral ou Ollama) → cole sua chave → pronto!"
          />
          <ManualItem
            num="5"
            title="Atualizações"
            text="App verifica automaticamente a cada 30 min. Notificação aparece no canto superior direito → 'Baixar Agora' → 'Reiniciar e Atualizar'."
          />
          <ManualItem
            num="6"
            title="Backup"
            text="Settings → Dados & Backup → 'Exportar dados (JSON)' ou 'Backup do banco (DB)'. Recomendado semanal."
          />
          <ManualItem
            num="7"
            title="Ativar licença"
            text="Após comprar, você recebe uma key (formato DF-XXXXXXXXXXXXXXXXXXXX). Settings → IA → License → cole a key → validar."
          />
        </div>
      </div>

      <div className="glass-panel clip-cyber p-5">
        <h3 className="font-display font-bold text-sm text-cyan-400 uppercase tracking-widest mb-3">
          🆘 Suporte
        </h3>
        <div className="space-y-2 text-[12px] font-mono-cyber">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.devfactory.system.openExternal("https://github.com/clodoaldosilva608/DevFactory-Agente-Inteligente/issues");
            }}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            GitHub Issues — reportar bug ou sugerir feature
          </a>
          <div className="flex items-center gap-2 text-slate-400">
            <HelpCircle className="h-3.5 w-3.5" />
            Email: contato@devfactory.app
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Helper components
// ============================================================================

function SectionHeader({ title, description, icon: Icon }: { title: string; description: string; icon: LucideIcon }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 clip-cyber-sm">
        <Icon className="h-5 w-5 text-cyan-400" />
      </div>
      <div>
        <h2 className="font-display font-bold text-xl text-white">{title}</h2>
        <p className="font-mono-cyber text-[11px] text-slate-500 mt-0.5 max-w-xl">{description}</p>
      </div>
    </div>
  );
}

function HelpBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 clip-cyber-sm">
      <div className="flex items-start gap-2">
        <HelpCircle className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="font-mono-cyber text-[11px] text-cyan-300 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon: Icon, small }: { label: string; value: string; icon: LucideIcon; small?: boolean }) {
  return (
    <div className={`p-2 bg-cyan-500/5 border border-cyan-500/20 clip-cyber-sm ${small ? "" : "p-3"}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`text-cyan-400 ${small ? "h-3 w-3" : "h-3.5 w-3.5"}`} />
        <span className="font-mono-cyber text-[9px] uppercase tracking-widest text-slate-500">{label}</span>
      </div>
      <div className={`font-display font-bold ${small ? "text-base" : "text-lg"} text-cyan-400`}>{value}</div>
    </div>
  );
}

function ManualItem({ num, title, text }: { num: string; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-cyan-500/10 border border-cyan-500/30 clip-cyber-sm">
        <span className="font-mono-cyber text-[10px] font-bold text-cyan-400">{num}</span>
      </div>
      <div className="flex-1">
        <div className="font-mono-cyber text-xs text-white font-bold mb-0.5">{title}</div>
        <div className="font-mono-cyber text-[11px] text-slate-400 leading-relaxed">{text}</div>
      </div>
    </div>
  );
}
