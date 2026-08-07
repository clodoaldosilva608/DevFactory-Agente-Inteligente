/**
 * Execution IPC handlers — allowlisted apps + sandboxed shell exec
 */

import { ipcMain } from "electron";
import { spawn, exec, ChildProcess } from "child_process";
import log from "electron-log";

const ALLOWED_APPS: Record<string, { cmd: string }> = {
  chrome: { cmd: process.platform === "win32" ? "chrome.exe" : "google-chrome" },
  firefox: { cmd: process.platform === "win32" ? "firefox.exe" : "firefox" },
  edge: { cmd: process.platform === "win32" ? "msedge.exe" : "microsoft-edge" },
  vscode: { cmd: process.platform === "win32" ? "code.cmd" : "code" },
  sublime: { cmd: process.platform === "win32" ? "sublime_text.exe" : "subl" },
  notepad: { cmd: "notepad.exe" },
  cmd: { cmd: "cmd.exe" },
  powershell: { cmd: process.platform === "win32" ? "powershell.exe" : "pwsh" },
  terminal: { cmd: process.platform === "darwin" ? "Terminal.app" : "gnome-terminal" },
  slack: { cmd: process.platform === "win32" ? "slack.exe" : "slack" },
  discord: { cmd: process.platform === "win32" ? "Discord.exe" : "discord" },
  whatsapp: { cmd: process.platform === "win32" ? "WhatsApp.exe" : "whatsapp" },
  explorer: { cmd: process.platform === "win32" ? "explorer.exe" : process.platform === "darwin" ? "open" : "nautilus" },
  finder: { cmd: "open" },
  vlc: { cmd: process.platform === "win32" ? "vlc.exe" : "vlc" },
  spotify: { cmd: process.platform === "win32" ? "Spotify.exe" : "spotify" },
  calculator: { cmd: process.platform === "win32" ? "calc.exe" : process.platform === "darwin" ? "Calculator.app" : "gnome-calculator" },
};

const runningProcesses = new Map<string, ChildProcess>();

export function registerExecHandlers() {
  ipcMain.handle("exec:openApp", async (_e, appName: string, args?: string[]) => {
    const app = ALLOWED_APPS[appName.toLowerCase()];
    if (!app) {
      throw new Error(`App "${appName}" não permitido. Disponíveis: ${Object.keys(ALLOWED_APPS).join(", ")}`);
    }
    log.info(`[exec] opening ${appName}: ${app.cmd}`);
    const child = spawn(app.cmd, args || [], {
      detached: true,
      stdio: "ignore",
      shell: process.platform === "win32",
    });
    child.unref();
    return { ok: true, pid: child.pid };
  });

  ipcMain.handle("exec:listApps", () =>
    Object.keys(ALLOWED_APPS).map((name) => ({ name, cmd: ALLOWED_APPS[name].cmd }))
  );

  ipcMain.handle("exec:run", async (_e, opts: { command: string; cwd?: string; timeout?: number }) => {
    const { command, cwd, timeout = 30000 } = opts;
    if (!command) throw new Error("Comando inválido");
    log.info(`[exec] running: ${command}`);
    return new Promise((resolve, reject) => {
      exec(command, {
        cwd: cwd || process.cwd(),
        timeout,
        maxBuffer: 1024 * 1024 * 5,
        shell: process.platform === "win32" ? "powershell.exe" : "/bin/bash",
      }, (err, stdout, stderr) => {
        if (err) {
          reject({ error: err.message, stderr, stdout, code: err.code, killed: (err as any).killed });
          return;
        }
        resolve({ stdout, stderr, code: 0 });
      });
    });
  });

  ipcMain.handle("exec:spawn", async (_e, opts: { id: string; command: string; args?: string[]; cwd?: string }) => {
    const { id, command, args = [], cwd } = opts;
    if (runningProcesses.has(id)) throw new Error(`Processo "${id}" já está rodando`);
    const child = spawn(command, args, {
      cwd: cwd || process.cwd(),
      shell: process.platform === "win32",
      env: process.env,
    });
    runningProcesses.set(id, child);
    child.stdout?.on("data", (data) => _e.sender.send(`exec:stdout:${id}`, data.toString()));
    child.stderr?.on("data", (data) => _e.sender.send(`exec:stderr:${id}`, data.toString()));
    child.on("close", (code) => {
      _e.sender.send(`exec:close:${id}`, code);
      runningProcesses.delete(id);
    });
    return { ok: true, pid: child.pid };
  });

  ipcMain.handle("exec:kill", async (_e, id: string) => {
    const child = runningProcesses.get(id);
    if (!child) throw new Error(`Processo "${id}" não encontrado`);
    child.kill("SIGTERM");
    runningProcesses.delete(id);
    return { ok: true };
  });

  ipcMain.handle("exec:running", () => Array.from(runningProcesses.keys()));
}
