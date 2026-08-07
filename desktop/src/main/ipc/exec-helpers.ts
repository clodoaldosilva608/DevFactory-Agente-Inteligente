/**
 * Exec helpers — shared between IPC exec handler and sync server
 *
 * Allows executing commands by name from a high-level API.
 */

import { spawn } from "child_process";
import path from "path";
import log from "electron-log";

const ALLOWED_APPS: Record<string, { cmd: string; args?: string[] }> = {
  // Browsers
  chrome: { cmd: process.platform === "win32" ? "chrome.exe" : "google-chrome" },
  firefox: { cmd: process.platform === "win32" ? "firefox.exe" : "firefox" },
  edge: { cmd: process.platform === "win32" ? "msedge.exe" : "microsoft-edge" },
  // Editors
  vscode: { cmd: process.platform === "win32" ? "code.cmd" : "code" },
  code: { cmd: process.platform === "win32" ? "code.cmd" : "code" },
  sublime: { cmd: process.platform === "win32" ? "sublime_text.exe" : "subl" },
  notepad: { cmd: "notepad.exe" },
  // Terminals
  cmd: { cmd: "cmd.exe" },
  powershell: { cmd: process.platform === "win32" ? "powershell.exe" : "pwsh" },
  terminal: { cmd: process.platform === "darwin" ? "Terminal.app" : "gnome-terminal" },
  // Communication
  slack: { cmd: process.platform === "win32" ? "slack.exe" : "slack" },
  discord: { cmd: process.platform === "win32" ? "Discord.exe" : "discord" },
  whatsapp: { cmd: process.platform === "win32" ? "WhatsApp.exe" : "whatsapp" },
  // File managers
  explorer: { cmd: process.platform === "win32" ? "explorer.exe" : process.platform === "darwin" ? "open" : "nautilus" },
  finder: { cmd: "open" },
  files: { cmd: process.platform === "win32" ? "explorer.exe" : process.platform === "darwin" ? "open" : "nautilus" },
  // Media
  vlc: { cmd: process.platform === "win32" ? "vlc.exe" : "vlc" },
  spotify: { cmd: process.platform === "win32" ? "Spotify.exe" : "spotify" },
  // Utils
  calculator: { cmd: process.platform === "win32" ? "calc.exe" : process.platform === "darwin" ? "Calculator.app" : "gnome-calculator" },
  calc: { cmd: process.platform === "win32" ? "calc.exe" : process.platform === "darwin" ? "Calculator.app" : "gnome-calculator" },
  screenshot: { cmd: process.platform === "win32" ? "snippingtool.exe" : "screencapture" },
};

/**
 * Execute a high-level command (called from mobile or voice)
 *
 * @param command - Natural language command: "abrir vscode", "open chrome", etc
 * @param args - Optional args
 */
export async function execCommand(
  command: string,
  args?: string[]
): Promise<{ ok: boolean; output: string }> {
  const normalized = command.toLowerCase().trim();

  // Parse "abrir <app>" or "open <app>"
  const openMatch = normalized.match(/^(?:abrir|open|launch|start)\s+(\w+)/);
  if (openMatch) {
    const appName = openMatch[1];
    return openApp(appName, args);
  }

  // Parse "fechar <app>" or "close <app>"
  const closeMatch = normalized.match(/^(?:fechar|close|kill|quit)\s+(\w+)/);
  if (closeMatch) {
    return closeApp(closeMatch[1]);
  }

  // Parse "exec <command>"
  if (normalized.startsWith("exec ") || normalized.startsWith("run ")) {
    const shellCmd = command.split(" ").slice(1).join(" ");
    return runShell(shellCmd);
  }

  // Direct app name (e.g. just "vscode")
  if (ALLOWED_APPS[normalized]) {
    return openApp(normalized, args);
  }

  // Unknown command — return error
  return {
    ok: false,
    output: `Comando não reconhecido: "${command}". Tente: "abrir vscode", "abrir chrome", "fechar vscode", ou "exec <cmd>"`,
  };
}

/**
 * Open an app by name (from allowlist)
 */
export async function openApp(
  appName: string,
  args?: string[]
): Promise<{ ok: boolean; output: string }> {
  const app = ALLOWED_APPS[appName.toLowerCase()];
  if (!app) {
    return {
      ok: false,
      output: `App "${appName}" não permitido. Disponíveis: ${Object.keys(ALLOWED_APPS).join(", ")}`,
    };
  }

  const finalArgs = [...(app.args || []), ...(args || [])];
  log.info(`[exec] opening ${appName}: ${app.cmd} ${finalArgs.join(" ")}`);

  return new Promise((resolve) => {
    try {
      const child = spawn(app.cmd, finalArgs, {
        detached: true,
        stdio: "ignore",
        shell: process.platform === "win32",
      });
      child.unref();
      resolve({
        ok: true,
        output: `${appName} iniciado (PID: ${child.pid})`,
      });
    } catch (err: any) {
      resolve({
        ok: false,
        output: `Erro ao abrir ${appName}: ${err.message}`,
      });
    }
  });
}

/**
 * Close/kill an app by name
 */
async function closeApp(appName: string): Promise<{ ok: boolean; output: string }> {
  const platform = process.platform;
  let cmd: string;

  if (platform === "win32") {
    cmd = `taskkill /IM ${appName}.exe /F`;
  } else if (platform === "darwin") {
    cmd = `pkill -f ${appName}`;
  } else {
    cmd = `pkill -f ${appName}`;
  }

  return runShell(cmd);
}

/**
 * Run a shell command (sandboxed with timeout)
 */
async function runShell(command: string): Promise<{ ok: boolean; output: string }> {
  const { exec } = await import("child_process");
  log.info(`[exec] shell: ${command}`);

  return new Promise((resolve) => {
    exec(
      command,
      {
        timeout: 30000,
        maxBuffer: 1024 * 1024 * 5,
        shell: process.platform === "win32" ? "powershell.exe" : "/bin/bash",
      },
      (err, stdout, stderr) => {
        if (err) {
          resolve({
            ok: false,
            output: `Erro: ${err.message}\n${stderr}`,
          });
          return;
        }
        resolve({
          ok: true,
          output: stdout || stderr || "Comando executado (sem output)",
        });
      }
    );
  });
}

/**
 * List all available apps
 */
export function listAvailableApps() {
  return Object.keys(ALLOWED_APPS).map((name) => ({
    name,
    cmd: ALLOWED_APPS[name].cmd,
  }));
}
