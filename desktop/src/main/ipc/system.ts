/**
 * System IPC handlers
 * - Open external URLs/files
 * - Show in folder
 * - Open app/file with default program
 * - Get system info
 */

import { ipcMain, shell, app } from "electron";
import si from "systeminformation";
import os from "os";
import type Store from "electron-store";

export function registerSystemHandlers(store: Store<any>) {
  ipcMain.handle("system:openExternal", async (_e, url: string) => {
    if (!url || typeof url !== "string") throw new Error("URL inválida");
    if (!url.match(/^https?:\/\//i)) throw new Error("Apenas URLs HTTP/HTTPS são permitidas");
    await shell.openExternal(url);
    return { ok: true };
  });

  ipcMain.handle("system:openPath", async (_e, path: string) => {
    if (!path || typeof path !== "string") throw new Error("Caminho inválido");
    const err = await shell.openPath(path);
    if (err) throw new Error(err);
    return { ok: true };
  });

  ipcMain.handle("system:showInFolder", async (_e, fullPath: string) => {
    if (!fullPath) throw new Error("Caminho inválido");
    shell.showItemInFolder(fullPath);
    return { ok: true };
  });

  ipcMain.handle("system:beep", () => {
    shell.beep();
    return { ok: true };
  });

  ipcMain.handle("system:info", async () => {
    const [osInfo, cpu, mem, graphics] = await Promise.all([
      si.osInfo(),
      si.cpu(),
      si.mem(),
      si.graphics(),
    ]);
    return {
      platform: osInfo.platform,
      distro: osInfo.distro,
      release: osInfo.release,
      hostname: os.hostname(),
      arch: process.arch,
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        cores: cpu.cores,
        speed: cpu.speed,
      },
      memory: { total: mem.total },
      graphics: graphics.controllers.map((c) => ({
        model: c.model,
        vendor: c.vendor,
        vram: c.vram,
      })),
      userInfo: {
        username: os.userInfo().username,
        homedir: os.userInfo().homedir,
      },
      appVersion: app.getVersion(),
    };
  });

  ipcMain.handle("store:get", (_e, key: string) => store.get(key));
  ipcMain.handle("store:set", (_e, key: string, value: any) => {
    store.set(key, value);
    return { ok: true };
  });
  ipcMain.handle("store:delete", (_e, key: string) => {
    store.delete(key as any);
    return { ok: true };
  });
}
