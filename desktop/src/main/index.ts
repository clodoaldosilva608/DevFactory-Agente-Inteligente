/**
 * DevFactory Desktop — Main Process
 *
 * Cyberpunk J.A.R.V.I.S-style HUD app for PC automation.
 * Multi-window capable, with secure IPC for system commands.
 */

import { app, BrowserWindow, ipcMain, shell, Menu, Tray, nativeImage } from "electron";
import * as path from "path";
import Store from "electron-store";
import log from "electron-log";
import { autoUpdater } from "electron-updater";
import { initDb, closeDb } from "./db";
import { registerSystemHandlers } from "./ipc/system";
import { registerFileHandlers } from "./ipc/files";
import { registerExecHandlers } from "./ipc/exec";
import { registerAuthHandlers } from "./ipc/auth";
import { registerTelemetryHandlers } from "./ipc/telemetry";
import { registerDbHandlers } from "./ipc/database";
import { registerAIHandlers } from "./ipc/ai";
import { registerSyncHandlers } from "./ipc/sync";

// ============================================================================
// Configuration
// ============================================================================

const isDev = !app.isPackaged;
const isMac = process.platform === "darwin";
const isWin = process.platform === "win32";
const isLinux = process.platform === "linux";

log.transports.file.level = "info";
log.transports.console.level = isDev ? "debug" : "info";
log.info(`DevFactory Desktop starting — v${app.getVersion()} (${process.platform}-${process.arch})`);

// Shared store for user session, license, settings
const store = new Store<{
  auth?: { token?: string; user?: any; expiresAt?: string };
  license?: { key?: string; hwid?: string; activatedAt?: string; trialEndsAt?: string };
  settings?: { minimizeToTray?: boolean; autoLaunch?: boolean; theme?: string };
}>({
  name: "devfactory",
  defaults: {
    settings: {
      minimizeToTray: true,
      autoLaunch: false,
      theme: "cyberpunk",
    },
  },
});

// ============================================================================
// Window management
// ============================================================================

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: "#050811",
    title: "DevFactory",
    show: false, // avoid white flash
    frame: process.platform === "darwin", // frameless on Win/Linux for cyberpunk feel
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "hidden",
    icon: path.join(__dirname, "../build/icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      devTools: isDev,
      spellcheck: false,
    },
  });

  // Cyberpunk-style draggable region support
  win.setMenuBarVisibility(false);

  // Load dev server or production build
  if (isDev) {
    win.loadURL("http://127.0.0.1:5173");
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  // Open external links in browser (not in app)
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  // Show window when ready (no white flash)
  win.once("ready-to-show", () => {
    win.show();
    if (isWin) {
      // Cyberpunk focus animation
      win.flashFrame(true);
      setTimeout(() => win.flashFrame(false), 1000);
    }
  });

  // Minimize to tray instead of closing
  win.on("close", (e) => {
    if (store.get("settings.minimizeToTray") && !(app as any).isQuitting) {
      e.preventDefault();
      win.hide();
      if (isWin) {
        // Show tray balloon
        tray?.displayBalloon({
          iconType: "info",
          title: "DevFactory",
          content: "Agente ativo em segundo plano. Clique para reabrir.",
        });
      }
    }
  });

  win.on("closed", () => {
    mainWindow = null;
  });

  return win;
}

// ============================================================================
// Tray
// ============================================================================

function createTray(): Tray {
  // Use a 16x16 transparent icon (would be replaced with proper asset)
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip("DevFactory — Agente Inteligente");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Abrir DevFactory",
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    { type: "separator" },
    {
      label: "Telemetria do Sistema",
      click: () => {
        mainWindow?.show();
        mainWindow?.webContents.send("navigate", "/dashboard");
      },
    },
    {
      label: "Comandos",
      click: () => {
        mainWindow?.show();
        mainWindow?.webContents.send("navigate", "/commands");
      },
    },
    { type: "separator" },
    {
      label: "Sair",
      click: () => {
        (app as any).isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  return tray;
}

// ============================================================================
// Auto-update
// ============================================================================

function setupAutoUpdater() {
  if (isDev) return;
  autoUpdater.logger = log;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("update-available", (info) => {
    mainWindow?.webContents.send("update-available", info);
  });

  autoUpdater.on("update-downloaded", () => {
    mainWindow?.webContents.send("update-downloaded");
  });

  autoUpdater.on("error", (err) => {
    log.error("AutoUpdater error:", err);
  });

  // Check for updates 10s after launch
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      log.warn("Update check failed:", err);
    });
  }, 10000);
}

// ============================================================================
// App lifecycle
// ============================================================================

// Single instance lock
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    // Set cyberpunk app user model id (Windows taskbar grouping)
    if (isWin) {
      app.setAppUserModelId("app.devfactory.desktop");
    }

    // Initialize local SQLite database BEFORE registering handlers
    log.info("[main] initializing local database...");
    initDb();

    mainWindow = createMainWindow();
    tray = createTray();
    setupAutoUpdater();

    // Register IPC handlers (now with DB available)
    registerSystemHandlers(store);
    registerFileHandlers();
    registerExecHandlers();
    registerAuthHandlers();
    registerTelemetryHandlers();
    registerDbHandlers();
    registerAIHandlers();
    registerSyncHandlers();

    // Global IPC
    ipcMain.handle("app:version", () => app.getVersion());
    ipcMain.handle("app:platform", () => ({
      platform: process.platform,
      arch: process.arch,
      versions: process.versions,
    }));
    ipcMain.handle("app:minimize", () => mainWindow?.minimize());
    ipcMain.handle("app:maximize", () => {
      if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow?.maximize();
      }
    });
    ipcMain.handle("app:close", () => mainWindow?.close());
    ipcMain.handle("app:hide", () => mainWindow?.hide());
    ipcMain.handle("app:show", () => mainWindow?.show());
    ipcMain.handle("app:relaunch", () => {
      app.relaunch();
      app.exit(0);
    });
    ipcMain.handle("update:check", () => autoUpdater.checkForUpdates());
    ipcMain.handle("update:download", () => autoUpdater.downloadUpdate());
    ipcMain.handle("update:install", () => autoUpdater.quitAndInstall());

    // macOS: re-create window on dock click
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createMainWindow();
      } else {
        mainWindow?.show();
      }
    });
  });
}

app.on("before-quit", async () => {
  (app as any).isQuitting = true;
  // Close database gracefully
  try {
    await closeDb();
  } catch (err) {
    log.warn("[main] db close error:", err);
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Export for type access
export { store, log };
