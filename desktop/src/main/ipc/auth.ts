/**
 * Auth IPC handlers — login against SaaS + license + HWID
 */

import { ipcMain } from "electron";
import Store from "electron-store";
import log from "electron-log";
import crypto from "crypto";
import os from "os";

const DEVFACTORY_API = process.env.DEVFACTORY_API_URL || "http://localhost:3000";

function generateHWID(): string {
  try {
    const mid = `${os.hostname()}-${os.userInfo().username}-${os.platform()}-${os.arch()}`;
    return crypto.createHash("sha256").update(mid).digest("hex").slice(0, 32);
  } catch {
    return crypto.createHash("sha256").update(`${process.env.USER || "user"}-${Date.now()}`).digest("hex").slice(0, 32);
  }
}

export function registerAuthHandlers(store: Store<any>) {
  ipcMain.handle("auth:hwid", () => generateHWID());

  ipcMain.handle("auth:login", async (_e, { email, password }: { email: string; password: string }) => {
    log.info(`[auth] login attempt: ${email}`);
    try {
      const csrfRes = await fetch(`${DEVFACTORY_API}/api/auth/csrf`);
      const csrf: any = await csrfRes.json();

      const body = new URLSearchParams();
      body.append("email", email);
      body.append("password", password);
      body.append("csrfToken", csrf.csrfToken);
      body.append("callbackUrl", `${DEVFACTORY_API}/dashboard`);
      body.append("json", "true");

      await fetch(`${DEVFACTORY_API}/api/auth/callback/credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      const sessionRes = await fetch(`${DEVFACTORY_API}/api/auth/session`);
      const session: any = await sessionRes.json();

      if (!session?.user) throw new Error("Sessão inválida");

      store.set("auth", {
        token: session.expires,
        user: session.user,
        expiresAt: session.expires,
      });

      log.info(`[auth] login success: ${email}`);
      return { ok: true, user: session.user };
    } catch (err: any) {
      log.error("[auth] login error:", err);
      throw new Error(err.message || "Erro de autenticação");
    }
  });

  ipcMain.handle("auth:logout", async () => {
    store.delete("auth");
    log.info("[auth] logged out");
    return { ok: true };
  });

  ipcMain.handle("auth:session", () => {
    const auth = store.get("auth");
    if (!auth) return null;
    if (auth.expiresAt && new Date(auth.expiresAt) < new Date()) {
      store.delete("auth");
      return null;
    }
    return auth;
  });

  ipcMain.handle("auth:validateLicense", async (_e, licenseKey: string) => {
    log.info(`[auth] validating license: ${licenseKey.slice(0, 8)}...`);
    const hwid = generateHWID();
    const valid = licenseKey.startsWith("DF-") && licenseKey.length === 24;
    if (!valid) throw new Error("License key inválida");

    store.set("license", {
      key: licenseKey,
      hwid,
      activatedAt: new Date().toISOString(),
    });
    return { ok: true, hwid, license: licenseKey };
  });

  ipcMain.handle("auth:startTrial", async () => {
    const hwid = generateHWID();
    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    store.set("license", {
      key: null,
      hwid,
      activatedAt: new Date().toISOString(),
      trialEndsAt,
      isTrial: true,
    });
    log.info(`[auth] trial started for HWID ${hwid}`);
    return { ok: true, hwid, trialEndsAt };
  });

  ipcMain.handle("auth:license", () => store.get("license") || null);
}
