/**
 * File operations IPC handlers — sandboxed to user home + tmp
 */

import { ipcMain, dialog } from "electron";
import fs from "fs/promises";
import path from "path";
import os from "os";

const ALLOWED_ROOTS = [os.homedir(), path.join(os.tmpdir())];

function isPathSafe(targetPath: string): boolean {
  const resolved = path.resolve(targetPath);
  return ALLOWED_ROOTS.some((root) => resolved.startsWith(root));
}

export function registerFileHandlers() {
  ipcMain.handle("file:read", async (_e, filePath: string, encoding: BufferEncoding = "utf-8") => {
    if (!isPathSafe(filePath)) throw new Error("Acesso negado: caminho fora dos limites permitidos");
    const data = await fs.readFile(filePath, { encoding });
    return { data, path: filePath };
  });

  ipcMain.handle("file:write", async (_e, filePath: string, data: string) => {
    if (!isPathSafe(filePath)) throw new Error("Acesso negado");
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, data, "utf-8");
    return { ok: true, path: filePath, bytes: data.length };
  });

  ipcMain.handle("file:list", async (_e, dirPath: string) => {
    if (!isPathSafe(dirPath)) throw new Error("Acesso negado");
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries.map((e) => ({
      name: e.name,
      isDirectory: e.isDirectory(),
      isFile: e.isFile(),
      path: path.join(dirPath, e.name),
    }));
  });

  ipcMain.handle("file:stat", async (_e, filePath: string) => {
    if (!isPathSafe(filePath)) throw new Error("Acesso negado");
    const stat = await fs.stat(filePath);
    return {
      size: stat.size,
      isDirectory: stat.isDirectory(),
      isFile: stat.isFile(),
      createdAt: stat.birthtime,
      modifiedAt: stat.mtime,
    };
  });

  ipcMain.handle("file:mkdir", async (_e, dirPath: string) => {
    if (!isPathSafe(dirPath)) throw new Error("Acesso negado");
    await fs.mkdir(dirPath, { recursive: true });
    return { ok: true };
  });

  ipcMain.handle("file:delete", async (_e, targetPath: string) => {
    if (!isPathSafe(targetPath)) throw new Error("Acesso negado");
    await fs.rm(targetPath, { recursive: true, force: true });
    return { ok: true };
  });

  ipcMain.handle("file:pickOpen", async (_e, opts: { multiple?: boolean; filters?: any; title?: string }) => {
    const result = await dialog.showOpenDialog({
      title: opts.title || "Selecionar arquivo",
      properties: [opts.multiple ? "multiSelections" : "openFile"].filter(Boolean) as any,
      filters: opts.filters || [],
    });
    if (result.canceled) return { canceled: true, files: [] };
    return { canceled: false, files: result.filePaths };
  });

  ipcMain.handle("file:pickFolder", async (_e, opts: { title?: string }) => {
    const result = await dialog.showOpenDialog({
      title: opts.title || "Selecionar pasta",
      properties: ["openDirectory"],
    });
    if (result.canceled) return { canceled: true, path: null };
    return { canceled: false, path: result.filePaths[0] };
  });

  ipcMain.handle("file:pickSave", async (_e, opts: { defaultName?: string; filters?: any; title?: string }) => {
    const result = await dialog.showSaveDialog({
      title: opts.title || "Salvar arquivo",
      defaultPath: opts.defaultName,
      filters: opts.filters || [],
    });
    if (result.canceled) return { canceled: true, path: null };
    return { canceled: false, path: result.filePath };
  });

  ipcMain.handle("file:path:join", (_e, ...segments: string[]) => path.join(...segments));
  ipcMain.handle("file:path:home", () => os.homedir());
  ipcMain.handle("file:path:tmp", () => os.tmpdir());
  ipcMain.handle("file:path:sep", () => path.sep);
}
