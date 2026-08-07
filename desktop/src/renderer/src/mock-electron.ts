/**
 * Mock for window.devfactory API — used only in browser dev mode
 * (in Electron, the real preload script provides the actual API)
 */

const memoryStore: Record<string, any> = {
  settings: {
    apiKeys: {},
    aiModels: { gemini: "gemini-2.0-flash" },
    activeAIProvider: "gemini",
  },
  aiSettings: { provider: "gemini", apiKey: "AIza...", model: "gemini-2.0-flash" },
  syncRunning: false,
};

const mockDevFactory = {
  app: {
    getVersion: async () => "3.7.2",
    getPlatform: async () => ({ platform: "linux", arch: "x64", versions: {} }),
    minimize: async () => {},
    maximize: async () => {},
    close: async () => {},
    hide: async () => {},
    show: async () => {},
    relaunch: async () => {},
  },
  system: {
    openExternal: async (url: string) => {
      window.open(url, "_blank");
      return { ok: true };
    },
    openPath: async () => ({ ok: true }),
    showInFolder: async () => ({ ok: true }),
    beep: async () => ({ ok: true }),
    getInfo: async () => ({
      platform: "linux",
      distro: "Ubuntu 22.04",
      hostname: "dev-machine",
      arch: "x64",
      cpu: { manufacturer: "Intel", brand: "i7-12700K", cores: 12, speed: 3.6 },
      memory: { total: 34359738368 },
      graphics: [{ model: "RTX 3070", vendor: "NVIDIA", vram: 8 }],
      userInfo: { username: "dev", homedir: "/home/dev" },
      appVersion: "3.7.2",
    }),
  },
  files: {
    read: async () => ({ data: "", path: "" }),
    write: async () => ({ ok: true, path: "", bytes: 0 }),
    list: async () => [],
    stat: async () => ({}),
    mkdir: async () => ({ ok: true }),
    delete: async () => ({ ok: true }),
    pickOpen: async () => ({ canceled: true, files: [] }),
    pickFolder: async () => ({ canceled: true, path: null }),
    pickSave: async () => ({ canceled: true, path: null }),
    path: {
      join: async (...segs: string[]) => segs.join("/"),
      home: async () => "/home/dev",
      tmp: async () => "/tmp",
      sep: async () => "/",
    },
  },
  exec: {
    openApp: async (name: string) => {
      console.log(`[mock] opening app: ${name}`);
      return { ok: true, pid: 1234 };
    },
    listApps: async () => [
      { name: "vscode", cmd: "code" },
      { name: "chrome", cmd: "google-chrome" },
      { name: "terminal", cmd: "gnome-terminal" },
    ],
    run: async (opts: any) => {
      console.log("[mock] run:", opts);
      return { stdout: "mock output", stderr: "", code: 0 };
    },
    spawn: async () => ({ ok: true, pid: 1234 }),
    kill: async () => ({ ok: true }),
    running: async () => [],
    onStdout: () => () => {},
    onStderr: () => () => {},
    onClose: () => () => {},
  },
  auth: {
    isFirstRun: async () => {
      // Toggle via localStorage for testing
      const isFirst = localStorage.getItem("mock_firstRun") !== "false";
      return { isFirstRun: isFirst };
    },
    setup: async (data: { name: string; email: string; password: string }) => {
      console.log("[mock] setup:", data);
      localStorage.setItem("mock_firstRun", "false");
      localStorage.setItem("mock_user", JSON.stringify({ name: data.name, email: data.email }));
      const token = "mock-token-" + Date.now();
      localStorage.setItem("devfactory_token", token);
      localStorage.setItem("devfactory_user", JSON.stringify({ id: "1", name: data.name, email: data.email, avatarUrl: null }));
      return {
        ok: true,
        token,
        user: { id: "1", name: data.name, email: data.email, avatarUrl: null },
        license: { status: "TRIAL", plan: "PRO", trialEndsAt: new Date(Date.now() + 7 * 86400000).toISOString() },
      };
    },
    login: async (email: string, password: string) => {
      console.log("[mock] login:", email);
      const userStr = localStorage.getItem("mock_user");
      if (!userStr) throw new Error("Nenhum usuário cadastrado. Faça setup primeiro.");
      const user = JSON.parse(userStr);
      if (user.email !== email) throw new Error("Email ou senha incorretos");
      const token = "mock-token-" + Date.now();
      localStorage.setItem("devfactory_token", token);
      localStorage.setItem("devfactory_user", JSON.stringify({ id: "1", ...user, avatarUrl: null }));
      return { ok: true, token, user: { id: "1", ...user, avatarUrl: null } };
    },
    logout: async (token?: string) => {
      localStorage.removeItem("devfactory_token");
      localStorage.removeItem("devfactory_user");
      return { ok: true };
    },
    getSession: async (token?: string) => {
      if (!token) return null;
      const userStr = localStorage.getItem("devfactory_user");
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      return { user, token, expiresAt: new Date(Date.now() + 86400000) };
    },
    changePassword: async () => ({ ok: true }),
    updateProfile: async (token: string, data: any) => {
      const userStr = localStorage.getItem("devfactory_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        localStorage.setItem("devfactory_user", JSON.stringify({ ...user, ...data }));
      }
      return { ok: true };
    },
    getHwid: async () => "a1b2c3d4e5f67890a1b2c3d4e5f67890",
    validateLicense: async (key: string) => {
      if (key.startsWith("DF-") && key.length === 24) {
        return { ok: true, license: { key, status: "ACTIVE", plan: "PRO" } };
      }
      throw new Error("License inválida");
    },
    startTrial: async () => ({ ok: true, trialEndsAt: new Date(Date.now() + 7 * 86400000).toISOString() }),
    getLicense: async () => ({
      key: "TRIAL-ABC123",
      status: "TRIAL",
      plan: "PRO",
      trialEndsAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    }),
  },
  db: {
    stats: async () => ({
      dbPath: "/home/dev/.config/devfactory-desktop/devfactory.db",
      dbSizeBytes: 184320,
      tableCounts: { users: 1, contacts: 0, messages: 0, automations: 3, commandLogs: 47, pairedDevices: 0, aiConversations: 2 },
    }),
    export: async () => ({ canceled: true }),
    wipe: async () => {
      localStorage.clear();
      return { ok: true };
    },
    path: async () => "/home/dev/.config/devfactory-desktop/devfactory.db",
    openFolder: async () => ({ ok: true }),
    backup: async () => ({ ok: true, path: "/tmp/devfactory-backup.db" }),
  },

  // AI (multi-provider)
  ai: {
    chat: async (messages: any[], conversationId?: string) => {
      console.log("[mock] ai.chat:", messages.length, "msgs");
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));
      const lastMsg = messages[messages.length - 1]?.content || "";
      const responses = [
        `Olá! Sou o DevFactory AI. Recebi sua mensagem: "${lastMsg.slice(0, 80)}". Estou pronto para ajudar com qualquer tarefa no seu PC.`,
        `Entendi sua solicitação. Como agente inteligente, posso executar comandos, abrir apps, manipular arquivos e muito mais. O que você gostaria de fazer?`,
        `Processando: "${lastMsg.slice(0, 60)}"... \n\nPosso ajudar com:\n- Abrir aplicativos ("abrir vscode")\n- Executar scripts\n- Capturar screenshots\n- Enviar comandos remotos\n- Análise de sistema`,
        `Boa pergunta! Como IA local rodando no seu PC, tenho acesso ao sistema e posso executar tarefas em tempo real. O que precisa?`,
      ];
      const content = responses[Math.floor(Math.random() * responses.length)];
      const convId = conversationId || "mock-conv-" + Date.now();
      return {
        content,
        model: "gemini-2.0-flash",
        tokensUsed: Math.floor(Math.random() * 500 + 100),
        finishReason: "stop",
        conversationId: convId,
      };
    },
    test: async (provider: string, _apiKey: string, model: string) => {
      await new Promise((r) => setTimeout(r, 800));
      return { ok: true, message: `Conexão OK com ${provider}. Modelo: ${model}` };
    },
    models: async (provider?: string) => {
      const all: any = {
        gemini: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
        openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
        anthropic: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022"],
        groq: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"],
        mistral: ["mistral-large-latest", "mistral-small-latest"],
        huggingface: ["meta-llama/Llama-3.3-70B-Instruct", "mistralai/Mistral-7B-Instruct-v0.3"],
        ollama: ["llama3.1", "mistral", "phi3", "qwen2.5"],
      };
      return provider ? all[provider] || [] : all;
    },
    providers: async () => [
      { id: "gemini", label: "Google Gemini", freeTier: "Free: 1500 req/dia", models: ["gemini-2.0-flash"] },
      { id: "openai", label: "OpenAI GPT", freeTier: "Pago", models: ["gpt-4o"] },
      { id: "anthropic", label: "Anthropic Claude", freeTier: "$5 crédito", models: ["claude-3-5-sonnet-20241022"] },
      { id: "groq", label: "Groq", freeTier: "Free: 14400 req/dia", models: ["llama-3.3-70b-versatile"] },
      { id: "mistral", label: "Mistral AI", freeTier: "~$8/mês", models: ["mistral-large-latest"] },
      { id: "huggingface", label: "HuggingFace", freeTier: "Variável", models: ["meta-llama/Llama-3.3-70B-Instruct"] },
      { id: "ollama", label: "Ollama (Local)", freeTier: "100% Grátis", models: ["llama3.1"] },
    ],
    conversations: async () => [
      { id: "1", title: "Como abrir apps?", provider: "gemini", model: "gemini-2.0-flash", updatedAt: new Date().toISOString(), _count: { messages: 4 } },
      { id: "2", title: "Análise de sistema", provider: "ollama", model: "llama3.1", updatedAt: new Date(Date.now() - 3600000).toISOString(), _count: { messages: 8 } },
    ],
    conversation: async (id: string) => ({
      id,
      title: "Conversa de exemplo",
      provider: "gemini",
      model: "gemini-2.0-flash",
      messages: [
        { role: "user", content: "Olá!", createdAt: new Date().toISOString() },
        { role: "assistant", content: "Oi! Como posso ajudar?", createdAt: new Date().toISOString(), tokens: 12 },
      ],
    }),
    deleteConversation: async () => ({ ok: true }),
    saveSettings: async (settings: any) => {
      memoryStore.aiSettings = settings;
      return { ok: true };
    },
    settings: async () => memoryStore.aiSettings || { provider: "gemini", apiKey: "AIza...", model: "gemini-2.0-flash" },
  },

  // Sync (multi-device LAN)
  sync: {
    start: async () => {
      memoryStore.syncRunning = true;
      return { ok: true, port: 3001, urls: ["http://192.168.0.10:3001", "http://10.0.0.5:3001"] };
    },
    stop: async () => {
      memoryStore.syncRunning = false;
      return { ok: true };
    },
    status: async () => ({
      running: memoryStore.syncRunning || false,
      port: memoryStore.syncRunning ? 3001 : null,
      urls: ["http://192.168.0.10:3001"],
      connectedDevices: 1,
    }),
    pairingCode: async () => ({
      code: String(Math.floor(100000 + Math.random() * 900000)),
      sessionId: "mock-session",
      expiresIn: 300,
    }),
    devices: async () => [
      {
        id: "1",
        name: "iPhone 15 Pro",
        deviceType: "MOBILE",
        os: "iOS 18",
        isOnline: true,
        isRevoked: false,
        lastSeenAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "2",
        name: "iPad Pro",
        deviceType: "TABLET",
        os: "iPadOS 18",
        isOnline: false,
        isRevoked: false,
        lastSeenAt: new Date(Date.now() - 3600000).toISOString(),
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
    ],
    revoke: async () => ({ ok: true }),
    notify: async () => ({ ok: true }),
    localIPs: async () => [
      { name: "eth0", address: "192.168.0.10", family: "IPv4" },
      { name: "wlan0", address: "192.168.0.11", family: "IPv4" },
    ],
    onDeviceConnected: (_callback: (device: any) => void) => () => {},
    onDeviceDisconnected: (_callback: (device: any) => void) => () => {},
  },
  telemetry: {
    start: async () => {
      // Simulate telemetry updates
      const interval = setInterval(() => {
        const snapshot = {
          timestamp: Date.now(),
          cpu: {
            usage: Math.round(Math.random() * 40 + 20),
            cores: Array.from({ length: 12 }, () => Math.round(Math.random() * 60 + 10)),
          },
          memory: {
            total: 34359738368,
            used: 12884901888,
            active: 8589934592,
            usage: Math.round(Math.random() * 30 + 30),
          },
          temperature: { cpu: Math.round(Math.random() * 20 + 45), max: 65 },
          network: {
            rx_sec: Math.round(Math.random() * 50000),
            tx_sec: Math.round(Math.random() * 20000),
            interfaces: 2,
          },
          gpu: [{ model: "RTX 3070", vendor: "NVIDIA", vram: 8 }],
          disk: [
            { fs: "/dev/sda1", mount: "/", size: 512000000000, used: 256000000000, available: 256000000000, usage: 50 },
          ],
          uptime: 3600,
          loadAvg: [0.5, 0.4, 0.3],
        };
        window.dispatchEvent(new CustomEvent("mock-telemetry", { detail: snapshot }));
      }, 2000);
      return { ok: true };
    },
    stop: async () => ({ ok: true }),
    snapshot: async () => null,
    onUpdate: (callback: (snapshot: any) => void) => {
      const listener = (e: Event) => callback((e as CustomEvent).detail);
      window.addEventListener("mock-telemetry", listener as EventListener);
      return () => window.removeEventListener("mock-telemetry", listener as EventListener);
    },
  },
  store: {
    get: async (key: string) => memoryStore[key] ?? null,
    set: async (key: string, value: any) => {
      memoryStore[key] = value;
      return { ok: true };
    },
    delete: async (key: string) => {
      delete memoryStore[key];
      return { ok: true };
    },
  },
  update: {
    check: async () => null,
    download: async () => null,
    install: async () => {},
    onAvailable: (callback: (info: any) => void) => {
      // Trigger a fake update after 3s for testing
      console.log("[mock] update.onAvailable registered — will fire in 3s");
      const timeout = setTimeout(() => {
        console.log("[mock] firing update-available event");
        callback({
          version: "3.8.0",
          releaseDate: new Date().toISOString(),
          releaseNotes: "## Novidades v3.8.0\n\n- Auto-update UI melhorada\n- Detecção automática de API keys\n- Página de Settings completa\n- Manuais em cada seção\n- Bug fixes diversos",
        });
      }, 3000);
      return () => clearTimeout(timeout);
    },
    onDownloaded: (callback: () => void) => () => {},
  },
  onNavigate: () => () => {},
  platform: "linux",
  isElectron: false, // mock mode
};

// Inject only if real Electron API doesn't exist
if (typeof window !== "undefined" && !(window as any).devfactory) {
  (window as any).devfactory = mockDevFactory;
  console.log("[mock] DevFactory API injected (browser dev mode)");
}

export {};
