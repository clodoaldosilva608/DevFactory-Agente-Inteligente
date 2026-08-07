/**
 * Database IPC handlers — exposes DB info, backup, restore, wipe
 */

import { ipcMain, dialog } from "electron";
import fs from "fs/promises";
import log from "electron-log";
import { getDbStats, exportUserData, wipeDatabase, getDbPath } from "../db";

export function registerDbHandlers() {
  // Get DB stats (path, size, table counts)
  ipcMain.handle("db:stats", async () => {
    return await getDbStats();
  });

  // Export all user data as JSON
  ipcMain.handle("db:export", async () => {
    log.info("[db] exporting user data...");
    const json = await exportUserData();

    const { canceled, filePath } = await dialog.showSaveDialog({
      title: "Exportar dados — DevFactory",
      defaultPath: `devfactory-backup-${new Date().toISOString().slice(0, 10)}.json`,
      filters: [{ name: "JSON", extensions: ["json"] }],
    });

    if (canceled || !filePath) {
      return { canceled: true };
    }

    await fs.writeFile(filePath, json, "utf-8");
    log.info(`[db] data exported to ${filePath}`);
    return { canceled: false, path: filePath, bytes: json.length };
  });

  // Factory reset (wipe all data)
  ipcMain.handle("db:wipe", async () => {
    log.warn("[db] WIPING ALL DATA — factory reset");
    await wipeDatabase();
    return { ok: true };
  });

  // Get DB file path (for displaying in Settings)
  ipcMain.handle("db:path", () => {
    return getDbPath();
  });

  // Open DB folder in file explorer
  ipcMain.handle("db:openFolder", async () => {
    const { shell } = await import("electron");
    const dbPath = getDbPath();
    shell.showItemInFolder(dbPath);
    return { ok: true };
  });

  // Backup DB file (copy to timestamped file)
  ipcMain.handle("db:backup", async () => {
    const dbPath = getDbPath();
    const backupPath = `${dbPath}.backup-${Date.now()}`;
    try {
      await fs.copyFile(dbPath, backupPath);
      log.info(`[db] backup created: ${backupPath}`);
      return { ok: true, path: backupPath };
    } catch (err: any) {
      log.error("[db] backup failed:", err);
      throw new Error(err.message);
    }
  });
}
