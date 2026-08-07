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
