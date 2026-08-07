export type DevFactoryAPI = {
  app: {
    getVersion: () => Promise<string>;
    getPlatform: () => Promise<{ platform: string; arch: string; versions: any }>;
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
    hide: () => Promise<void>;
    show: () => Promise<void>;
    relaunch: () => Promise<void>;
  };
  system: {
    openExternal: (url: string) => Promise<{ ok: boolean }>;
    openPath: (path: string) => Promise<{ ok: boolean }>;
    showInFolder: (fullPath: string) => Promise<{ ok: boolean }>;
    beep: () => Promise<{ ok: boolean }>;
    getInfo: () => Promise<any>;
  };
  files: {
    read: (path: string, encoding?: BufferEncoding) => Promise<{ data: string; path: string }>;
    write: (path: string, data: string) => Promise<{ ok: boolean; path: string; bytes: number }>;
    list: (dirPath: string) => Promise<any[]>;
    stat: (path: string) => Promise<any>;
    mkdir: (dirPath: string) => Promise<{ ok: boolean }>;
    delete: (path: string) => Promise<{ ok: boolean }>;
    pickOpen: (opts?: any) => Promise<{ canceled: boolean; files: string[] }>;
    pickFolder: (opts?: any) => Promise<{ canceled: boolean; path: string | null }>;
    pickSave: (opts?: any) => Promise<{ canceled: boolean; path: string | null }>;
    path: {
      join: (...segments: string[]) => Promise<string>;
      home: () => Promise<string>;
      tmp: () => Promise<string>;
      sep: () => Promise<string>;
    };
  };
  exec: {
    openApp: (appName: string, args?: string[]) => Promise<{ ok: boolean; pid: number }>;
    listApps: () => Promise<{ name: string; cmd: string }[]>;
    run: (opts: { command: string; cwd?: string; timeout?: number }) => Promise<{ stdout: string; stderr: string; code: number }>;
    spawn: (opts: { id: string; command: string; args?: string[]; cwd?: string }) => Promise<{ ok: boolean; pid: number }>;
    kill: (id: string) => Promise<{ ok: boolean }>;
    running: () => Promise<string[]>;
    onStdout: (id: string, callback: (data: string) => void) => () => void;
    onStderr: (id: string, callback: (data: string) => void) => () => void;
    onClose: (id: string, callback: (code: number) => void) => () => void;
  };
  auth: {
    login: (email: string, password: string) => Promise<{ ok: boolean; user: any }>;
    logout: () => Promise<{ ok: boolean }>;
    getSession: () => Promise<any>;
    getHwid: () => Promise<string>;
    validateLicense: (key: string) => Promise<{ ok: boolean; hwid: string; license: string }>;
    startTrial: () => Promise<{ ok: boolean; hwid: string; trialEndsAt: string }>;
    getLicense: () => Promise<any>;
  };
  telemetry: {
    start: () => Promise<{ ok: boolean }>;
    stop: () => Promise<{ ok: boolean }>;
    snapshot: () => Promise<any>;
    onUpdate: (callback: (snapshot: any) => void) => () => void;
  };
  store: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<{ ok: boolean }>;
    delete: (key: string) => Promise<{ ok: boolean }>;
  };
  update: {
    check: () => Promise<any>;
    download: () => Promise<any>;
    install: () => Promise<void>;
    onAvailable: (callback: (info: any) => void) => () => void;
    onDownloaded: (callback: () => void) => () => void;
  };
  onNavigate: (callback: (path: string) => void) => () => void;
  platform: string;
  isElectron: boolean;
};

declare global {
  interface Window {
    devfactory: DevFactoryAPI;
  }
}

export {};
