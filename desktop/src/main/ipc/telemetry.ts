/**
 * Telemetry IPC handlers — real-time CPU/RAM/GPU/Temp/Network
 */

import { ipcMain, BrowserWindow } from "electron";
import si from "systeminformation";
import os from "os";
import log from "electron-log";

let pollingInterval: NodeJS.Timeout | null = null;
let currentWindows: BrowserWindow[] = [];

export function registerTelemetryHandlers() {
  ipcMain.handle("telemetry:start", (e) => {
    if (pollingInterval) clearInterval(pollingInterval);
    const win = BrowserWindow.fromWebContents(e.sender);
    if (win && !currentWindows.includes(win)) {
      currentWindows.push(win);
      win.on("closed", () => {
        currentWindows = currentWindows.filter((w) => w !== win);
      });
    }
    log.info("[telemetry] polling started");
    pollOnce();
    pollingInterval = setInterval(pollOnce, 2000);
    return { ok: true };
  });

  ipcMain.handle("telemetry:stop", () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    log.info("[telemetry] polling stopped");
    return { ok: true };
  });

  ipcMain.handle("telemetry:snapshot", async () => await getSnapshot());
}

async function getSnapshot() {
  try {
    const [currentLoad, mem, networkStats, cpuTemp, graphics, fsSize] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.networkStats(),
      si.cpuTemperature(),
      si.graphics(),
      si.fsSize(),
    ]);

    const netTotal = networkStats.reduce(
      (acc, n) => ({
        rx_sec: acc.rx_sec + (n.rx_sec || 0),
        tx_sec: acc.tx_sec + (n.tx_sec || 0),
      }),
      { rx_sec: 0, tx_sec: 0 }
    );

    return {
      timestamp: Date.now(),
      cpu: {
        usage: Math.round(currentLoad.currentLoad || 0),
        cores: currentLoad.cpus.map((c) => Math.round(c.load)),
      },
      memory: {
        total: mem.total,
        used: mem.used,
        active: mem.active,
        usage: Math.round((mem.active / mem.total) * 100),
      },
      temperature: {
        cpu: cpuTemp.main || null,
        max: cpuTemp.max || null,
      },
      network: {
        rx_sec: Math.round(netTotal.rx_sec),
        tx_sec: Math.round(netTotal.tx_sec),
        interfaces: networkStats.length,
      },
      gpu: graphics.controllers.map((c) => ({
        model: c.model,
        vendor: c.vendor,
        vram: c.vram,
      })),
      disk: fsSize.slice(0, 4).map((d) => ({
        fs: d.fs,
        mount: d.mount,
        size: d.size,
        used: d.used,
        available: d.available,
        usage: Math.round(d.use),
      })),
      uptime: os.uptime(),
      loadAvg: os.loadavg(),
    };
  } catch (err) {
    log.error("[telemetry] snapshot error:", err);
    return null;
  }
}

async function pollOnce() {
  if (currentWindows.length === 0) return;
  const snapshot = await getSnapshot();
  if (snapshot) {
    currentWindows.forEach((win) => {
      if (!win.isDestroyed()) {
        win.webContents.send("telemetry:update", snapshot);
      }
    });
  }
}
