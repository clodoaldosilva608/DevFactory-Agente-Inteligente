/**
 * DevFactory Desktop — Preload Script
 *
 * Secure bridge between renderer (React) and main process (Node).
 * Exposes ONLY the IPC channels we explicitly allow via contextBridge.
 */

import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

// ============================================================================
// Type definitions
// ============================================================================

export interface SystemInfo {
  platform: string;
  distro: string;
  release: string;
  hostname: string;
  arch: string;
  cpu: { manufacturer: string; brand: string; cores: number; speed: number };
  memory: { total: number };
  graphics: { model: string; vendor: string; vram: number }[];
  userInfo: { username: string; homedir: string };
  appVersion: string;
}

export interface TelemetrySnapshot {
  timestamp: number;
  cpu: { usage: number; cores: number[] };
  memory: { total: number; used: number; active: number; usage: number };
  temperature: { cpu: number | null; max: number | null };
  network: { rx_sec: number; tx_sec: number; interfaces: number };
  gpu: { model: string; vendor: string; vram: number }[];
  disk: { fs: string; mount: string; size: number; used: number; available: number; usage: number }[];
  uptime: number;
  loadAvg: number[];
}

// ============================================================================
// API exposed to renderer
// ============================================================================

const api = {
  // App
  app: {
    getVersion: () => ipcRenderer.invoke("app:version"),
    getPlatform: () => ipcRenderer.invoke("app:platform"),
    minimize: () => ipcRenderer.invoke("app:minimize"),
    maximize: () => ipcRenderer.invoke("app:maximize"),
    close: () => ipcRenderer.invoke("app:close"),
    hide: () => ipcRenderer.invoke("app:hide"),
    show: () => ipcRenderer.invoke("app:show"),
    relaunch: () => ipcRenderer.invoke("app:relaunch"),
  },

  // System
  system: {
    openExternal: (url: string) => ipcRenderer.invoke("system:openExternal", url),
    openPath: (path: string) => ipcRenderer.invoke("system:openPath", path),
    showInFolder: (fullPath: string) => ipcRenderer.invoke("system:showInFolder", fullPath),
    beep: () => ipcRenderer.invoke("system:beep"),
    getInfo: (): Promise<SystemInfo> => ipcRenderer.invoke("system:info"),
  },

  // Files
  files: {
    read: (path: string, encoding?: BufferEncoding) =>
      ipcRenderer.invoke("file:read", path, encoding),
    write: (path: string, data: string) =>
      ipcRenderer.invoke("file:write", path, data),
    list: (dirPath: string) => ipcRenderer.invoke("file:list", dirPath),
    stat: (path: string) => ipcRenderer.invoke("file:stat", path),
    mkdir: (dirPath: string) => ipcRenderer.invoke("file:mkdir", dirPath),
    delete: (path: string) => ipcRenderer.invoke("file:delete", path),
    pickOpen: (opts?: any) => ipcRenderer.invoke("file:pickOpen", opts),
    pickFolder: (opts?: any) => ipcRenderer.invoke("file:pickFolder", opts),
    pickSave: (opts?: any) => ipcRenderer.invoke("file:pickSave", opts),
    path: {
      join: (...segments: string[]) => ipcRenderer.invoke("file:path:join", ...segments),
      home: () => ipcRenderer.invoke("file:path:home"),
      tmp: () => ipcRenderer.invoke("file:path:tmp"),
      sep: () => ipcRenderer.invoke("file:path:sep"),
    },
  },

  // Execution
  exec: {
    openApp: (appName: string, args?: string[]) =>
      ipcRenderer.invoke("exec:openApp", appName, args),
    listApps: () => ipcRenderer.invoke("exec:listApps"),
    run: (opts: { command: string; cwd?: string; timeout?: number }) =>
      ipcRenderer.invoke("exec:run", opts),
    spawn: (opts: { id: string; command: string; args?: string[]; cwd?: string }) =>
      ipcRenderer.invoke("exec:spawn", opts),
    kill: (id: string) => ipcRenderer.invoke("exec:kill", id),
    running: () => ipcRenderer.invoke("exec:running"),
    onStdout: (id: string, callback: (data: string) => void) => {
      const listener = (_e: IpcRendererEvent, data: string) => callback(data);
      ipcRenderer.on(`exec:stdout:${id}`, listener);
      return () => ipcRenderer.removeListener(`exec:stdout:${id}`, listener);
    },
    onStderr: (id: string, callback: (data: string) => void) => {
      const listener = (_e: IpcRendererEvent, data: string) => callback(data);
      ipcRenderer.on(`exec:stderr:${id}`, listener);
      return () => ipcRenderer.removeListener(`exec:stderr:${id}`, listener);
    },
    onClose: (id: string, callback: (code: number) => void) => {
      const listener = (_e: IpcRendererEvent, code: number) => callback(code);
      ipcRenderer.on(`exec:close:${id}`, listener);
      return () => ipcRenderer.removeListener(`exec:close:${id}`, listener);
    },
  },

  // Auth
  auth: {
    isFirstRun: () => ipcRenderer.invoke("auth:isFirstRun"),
    setup: (data: { name: string; email: string; password: string }) =>
      ipcRenderer.invoke("auth:setup", data),
    login: (email: string, password: string) =>
      ipcRenderer.invoke("auth:login", { email, password }),
    logout: (token?: string) => ipcRenderer.invoke("auth:logout", token),
    getSession: (token?: string) => ipcRenderer.invoke("auth:session", token),
    changePassword: (token: string, currentPassword: string, newPassword: string) =>
      ipcRenderer.invoke("auth:changePassword", { token, currentPassword, newPassword }),
    updateProfile: (token: string, data: { name?: string; avatarUrl?: string }) =>
      ipcRenderer.invoke("auth:updateProfile", { token, ...data }),
    getHwid: () => ipcRenderer.invoke("auth:hwid"),
    validateLicense: (key: string) => ipcRenderer.invoke("auth:validateLicense", key),
    startTrial: () => ipcRenderer.invoke("auth:startTrial"),
    getLicense: () => ipcRenderer.invoke("auth:getLicense"),
  },

  // Database (local SQLite)
  db: {
    stats: () => ipcRenderer.invoke("db:stats"),
    export: () => ipcRenderer.invoke("db:export"),
    wipe: () => ipcRenderer.invoke("db:wipe"),
    path: () => ipcRenderer.invoke("db:path"),
    openFolder: () => ipcRenderer.invoke("db:openFolder"),
    backup: () => ipcRenderer.invoke("db:backup"),
  },

  // AI (multi-provider chat)
  ai: {
    chat: (messages: any[], conversationId?: string, options?: any) =>
      ipcRenderer.invoke("ai:chat", { messages, conversationId, ...options }),
    test: (provider: string, apiKey: string, model: string, baseUrl?: string) =>
      ipcRenderer.invoke("ai:test", { provider, apiKey, model, baseUrl }),
    models: (provider?: string) => ipcRenderer.invoke("ai:models", provider),
    providers: () => ipcRenderer.invoke("ai:providers"),
    conversations: (limit?: number) => ipcRenderer.invoke("ai:conversations", limit),
    conversation: (id: string) => ipcRenderer.invoke("ai:conversation", id),
    deleteConversation: (id: string) => ipcRenderer.invoke("ai:deleteConversation", id),
    saveSettings: (settings: any) => ipcRenderer.invoke("ai:saveSettings", settings),
    settings: () => ipcRenderer.invoke("ai:settings"),
  },

  // Sync (multi-device via LAN)
  sync: {
    start: () => ipcRenderer.invoke("sync:start"),
    stop: () => ipcRenderer.invoke("sync:stop"),
    status: () => ipcRenderer.invoke("sync:status"),
    pairingCode: () => ipcRenderer.invoke("sync:pairingCode"),
    devices: () => ipcRenderer.invoke("sync:devices"),
    revoke: (deviceId: string) => ipcRenderer.invoke("sync:revoke", deviceId),
    notify: (payload: any) => ipcRenderer.invoke("sync:notify", payload),
    localIPs: () => ipcRenderer.invoke("sync:localIPs"),
    onDeviceConnected: (callback: (device: any) => void) => {
      const listener = (_e: IpcRendererEvent, device: any) => callback(device);
      ipcRenderer.on("sync:deviceConnected", listener);
      return () => ipcRenderer.removeListener("sync:deviceConnected", listener);
    },
    onDeviceDisconnected: (callback: (device: any) => void) => {
      const listener = (_e: IpcRendererEvent, device: any) => callback(device);
      ipcRenderer.on("sync:deviceDisconnected", listener);
      return () => ipcRenderer.removeListener("sync:deviceDisconnected", listener);
    },
  },

  // Telemetry
  telemetry: {
    start: () => ipcRenderer.invoke("telemetry:start"),
    stop: () => ipcRenderer.invoke("telemetry:stop"),
    snapshot: (): Promise<TelemetrySnapshot | null> => ipcRenderer.invoke("telemetry:snapshot"),
    onUpdate: (callback: (snapshot: TelemetrySnapshot) => void) => {
      const listener = (_e: IpcRendererEvent, snapshot: TelemetrySnapshot) => callback(snapshot);
      ipcRenderer.on("telemetry:update", listener);
      return () => ipcRenderer.removeListener("telemetry:update", listener);
    },
  },

  // Store (persistent key-value)
  store: {
    get: (key: string) => ipcRenderer.invoke("store:get", key),
    set: (key: string, value: any) => ipcRenderer.invoke("store:set", key, value),
    delete: (key: string) => ipcRenderer.invoke("store:delete", key),
  },

  // Auto-update
  update: {
    check: () => ipcRenderer.invoke("update:check"),
    download: () => ipcRenderer.invoke("update:download"),
    install: () => ipcRenderer.invoke("update:install"),
    onAvailable: (callback: (info: any) => void) => {
      const listener = (_e: IpcRendererEvent, info: any) => callback(info);
      ipcRenderer.on("update-available", listener);
      return () => ipcRenderer.removeListener("update-available", listener);
    },
    onDownloaded: (callback: () => void) => {
      const listener = () => callback();
      ipcRenderer.on("update-downloaded", listener);
      return () => ipcRenderer.removeListener("update-downloaded", listener);
    },
  },

  // Navigation (from tray)
  onNavigate: (callback: (path: string) => void) => {
    const listener = (_e: IpcRendererEvent, path: string) => callback(path);
    ipcRenderer.on("navigate", listener);
    return () => ipcRenderer.removeListener("navigate", listener);
  },

  // Platform info (sync)
  platform: process.platform,
  isElectron: true,
};

// ============================================================================
// Expose to renderer (secure)
// ============================================================================

contextBridge.exposeInMainWorld("devfactory", api);

// Type export for renderer
export type DevFactoryAPI = typeof api;
