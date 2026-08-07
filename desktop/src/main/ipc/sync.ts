/**
 * Sync Multi-Device via LAN — HTTP server local no Electron
 *
 * Permite que celulares/tablets na mesma rede WiFi:
 * - Acessem comandos remotos do PC
 * - Recebam notificações push do PC
 * - Enviem comandos para o PC executar
 *
 * Arquitetura:
 *   [Celular] → HTTP/WebSocket → [PC:3001] → IPC → [Electron Main]
 */

import http from "http";
import crypto from "crypto";
import os from "os";
import { Server as SocketIOServer } from "socket.io";
import log from "electron-log";
import { getDb } from "../db";
import { execCommand } from "./exec-helpers";
import type { Server as HTTPServer } from "http";

const SYNC_PORT = 3001;

let httpServer: HTTPServer | null = null;
let io: SocketIOServer | null = null;
const activeSockets = new Map<string, any>();
const pairingCodes = new Map<string, { code: string; expiresAt: number }>();

function getLocalIPs(): string[] {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

function isSameSubnet(remoteIp: string): boolean {
  const localIPs = getLocalIPs();
  for (const localIp of localIPs) {
    const localParts = localIp.split(".").map(Number);
    const remoteParts = remoteIp.split(".").map(Number);
    if (localParts.length === 4 && remoteParts.length === 4) {
      if (
        localParts[0] === remoteParts[0] &&
        localParts[1] === remoteParts[1] &&
        localParts[2] === remoteParts[2]
      ) {
        return true;
      }
    }
  }
  return false;
}

function generatePairingCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function startSyncServer(): Promise<{ port: number; urls: string[] }> {
  return new Promise((resolve, reject) => {
    if (httpServer) {
      const urls = getLocalIPs().map((ip) => `http://${ip}:${SYNC_PORT}`);
      resolve({ port: SYNC_PORT, urls });
      return;
    }

    httpServer = http.createServer((req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

      if (req.url === "/api/health" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          ok: true,
          service: "DevFactory Sync",
          version: "3.7.2",
          timestamp: Date.now(),
        }));
        return;
      }

      if (req.url === "/api/pair/code" && req.method === "GET") {
        const clientIp = req.socket.remoteAddress?.replace("::ffff:", "") || "";
        if (!isSameSubnet(clientIp)) {
          res.writeHead(403);
          res.end(JSON.stringify({ error: "Forbidden: not in same subnet" }));
          return;
        }
        const code = generatePairingCode();
        const sessionId = crypto.randomUUID();
        pairingCodes.set(sessionId, { code, expiresAt: Date.now() + 5 * 60 * 1000 });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ sessionId, code, expiresIn: 300 }));
        return;
      }

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>DevFactory Sync</title></head><body style="background:#050811;color:#00f0ff;font-family:monospace;padding:20px"><h1>DevFactory Sync Server</h1><p>Port: ${SYNC_PORT}</p><p>Status: Online</p><p>Local IPs: ${getLocalIPs().join(", ")}</p><p>Use o app mobile para se conectar.</p></body></html>`);
    });

    io = new SocketIOServer(httpServer, {
      cors: { origin: "*" },
      path: "/sync",
    });

    io.on("connection", (socket) => {
      const clientIp = socket.handshake.address.replace("::ffff:", "");
      log.info(`[sync] socket connected: ${clientIp}`);

      if (!isSameSubnet(clientIp)) {
        log.warn(`[sync] rejected: ${clientIp} not in same subnet`);
        socket.emit("error", { message: "Not in same subnet" });
        socket.disconnect();
        return;
      }

      socket.on("pair:request", async (data: { code: string; deviceName: string; deviceType?: string; os?: string }) => {
        log.info(`[sync] pair request: code=${data.code} name=${data.deviceName}`);
        let matchedSessionId: string | null = null;
        for (const [sessionId, entry] of pairingCodes.entries()) {
          if (entry.code === data.code && entry.expiresAt > Date.now()) {
            matchedSessionId = sessionId;
            break;
          }
        }

        if (!matchedSessionId) {
          socket.emit("pair:error", { message: "Código inválido ou expirado" });
          return;
        }

        pairingCodes.delete(matchedSessionId);

        const token = crypto.randomBytes(32).toString("hex");
        const db = getDb();
        const device = await db.pairedDevice.create({
          data: {
            name: data.deviceName,
            deviceType: data.deviceType || "MOBILE",
            os: data.os || null,
            pairingCode: data.code,
            publicKey: token,
            isOnline: true,
            lastSeenAt: new Date(),
          },
        });

        activeSockets.set(device.id, socket);
        socket.emit("pair:success", {
          deviceId: device.id,
          token,
          message: "Dispositivo pareado com sucesso!",
        });

        log.info(`[sync] device paired: ${device.id} (${data.deviceName})`);

        const { BrowserWindow } = require("electron");
        BrowserWindow.getAllWindows().forEach((win: any) => {
          win.webContents.send("sync:deviceConnected", {
            deviceId: device.id,
            name: device.name,
            deviceType: device.deviceType,
          });
        });
      });

      socket.on("auth", async (data: { token: string }) => {
        const db = getDb();
        const device = await db.pairedDevice.findFirst({
          where: { publicKey: data.token, isRevoked: false },
        });

        if (!device) {
          socket.emit("error", { message: "Token inválido ou dispositivo revogado" });
          socket.disconnect();
          return;
        }

        await db.pairedDevice.update({
          where: { id: device.id },
          data: { isOnline: true, lastSeenAt: new Date() },
        });

        activeSockets.set(device.id, socket);
        socket.emit("auth:success", { deviceId: device.id, name: device.name });
        log.info(`[sync] device authenticated: ${device.id}`);
      });

      socket.on("command", async (data: { token: string; command: string; args?: string[] }) => {
        const db = getDb();
        const device = await db.pairedDevice.findFirst({
          where: { publicKey: data.token, isRevoked: false },
        });
        if (!device) {
          socket.emit("error", { message: "Unauthorized" });
          return;
        }

        log.info(`[sync] command from ${device.name}: ${data.command}`);

        try {
          const result = await execCommand(data.command, data.args);
          // Find first user to log command against
          const db = getDb();
          const firstUser = await db.user.findFirst();
          await db.commandLog.create({
            data: {
              userId: firstUser?.id || "system",
              command: data.command,
              type: "TEXT",
              source: "MOBILE",
              status: result.ok ? "SUCCESS" : "ERROR",
              response: result.output,
              metadata: JSON.stringify({ deviceId: device.id, deviceName: device.name }),
            },
          });
          socket.emit("command:result", { ok: result.ok, output: result.output });
        } catch (err: any) {
          socket.emit("command:result", { ok: false, output: err.message });
        }
      });

      socket.on("disconnect", async () => {
        log.info(`[sync] socket disconnected: ${clientIp}`);
        for (const [deviceId, sock] of activeSockets.entries()) {
          if (sock === socket) {
            const db = getDb();
            await db.pairedDevice.update({
              where: { id: deviceId },
              data: { isOnline: false, lastSeenAt: new Date() },
            });
            activeSockets.delete(deviceId);
            const { BrowserWindow } = require("electron");
            BrowserWindow.getAllWindows().forEach((win: any) => {
              win.webContents.send("sync:deviceDisconnected", { deviceId });
            });
            break;
          }
        }
      });
    });

    httpServer.on("error", (err) => {
      log.error("[sync] server error:", err);
      reject(err);
    });

    httpServer.listen(SYNC_PORT, "0.0.0.0", () => {
      const urls = getLocalIPs().map((ip) => `http://${ip}:${SYNC_PORT}`);
      log.info(`[sync] server listening on port ${SYNC_PORT}`);
      log.info(`[sync] accessible at: ${urls.join(", ")}`);
      resolve({ port: SYNC_PORT, urls });
    });
  });
}

export async function stopSyncServer(): Promise<void> {
  if (io) {
    await new Promise<void>((resolve) => io!.close(() => resolve()));
    io = null;
  }
  if (httpServer) {
    await new Promise<void>((resolve) => httpServer!.close(() => resolve()));
    httpServer = null;
  }
  activeSockets.clear();
  log.info("[sync] server stopped");
}

export function getSyncStatus(): {
  running: boolean;
  port: number | null;
  urls: string[];
  connectedDevices: number;
} {
  return {
    running: !!httpServer,
    port: httpServer ? SYNC_PORT : null,
    urls: getLocalIPs().map((ip) => `http://${ip}:${SYNC_PORT}`),
    connectedDevices: activeSockets.size,
  };
}

export async function broadcastNotification(payload: {
  title: string;
  body: string;
  level?: "info" | "warning" | "error";
}): Promise<void> {
  if (!io) return;
  io.emit("notification", payload);
  log.info(`[sync] broadcast notification: ${payload.title}`);
}

export function createPairingCode(): { code: string; sessionId: string; expiresIn: number } {
  const code = generatePairingCode();
  const sessionId = crypto.randomUUID();
  pairingCodes.set(sessionId, { code, expiresAt: Date.now() + 5 * 60 * 1000 });
  log.info(`[sync] pairing code generated: ${code}`);
  return { code, sessionId, expiresIn: 300 };
}

export async function listPairedDevices() {
  const db = getDb();
  return db.pairedDevice.findMany({ orderBy: { createdAt: "desc" } });
}

export async function revokeDevice(deviceId: string) {
  const db = getDb();
  await db.pairedDevice.update({
    where: { id: deviceId },
    data: { isRevoked: true, isOnline: false },
  });
  const sock = activeSockets.get(deviceId);
  if (sock) {
    sock.emit("revoked", { message: "Device revoked" });
    sock.disconnect();
    activeSockets.delete(deviceId);
  }
  log.info(`[sync] device revoked: ${deviceId}`);
}

// ============================================================================
// IPC Handlers — expose sync functions to renderer
// ============================================================================

import { ipcMain } from "electron";

export function registerSyncHandlers() {
  ipcMain.handle("sync:start", async () => {
    try {
      const result = await startSyncServer();
      log.info(`[sync] started: ${result.urls.join(", ")}`);
      return { ok: true, ...result };
    } catch (err: any) {
      log.error("[sync] start failed:", err);
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle("sync:stop", async () => {
    await stopSyncServer();
    return { ok: true };
  });

  ipcMain.handle("sync:status", () => getSyncStatus());

  ipcMain.handle("sync:pairingCode", () => createPairingCode());

  ipcMain.handle("sync:devices", async () => await listPairedDevices());

  ipcMain.handle("sync:revoke", async (_e, deviceId: string) => {
    await revokeDevice(deviceId);
    return { ok: true };
  });

  ipcMain.handle(
    "sync:notify",
    async (_e, payload: { title: string; body: string; level?: "info" | "warning" | "error" }) => {
      await broadcastNotification(payload);
      return { ok: true };
    }
  );

  ipcMain.handle("sync:localIPs", () => {
    const interfaces = os.networkInterfaces();
    const ips: { name: string; address: string; family: string }[] = [];
    for (const [name, ifaces] of Object.entries(interfaces)) {
      for (const iface of ifaces || []) {
        if (iface.family === "IPv4" && !iface.internal) {
          ips.push({ name, address: iface.address, family: iface.family });
        }
      }
    }
    return ips;
  });
}
