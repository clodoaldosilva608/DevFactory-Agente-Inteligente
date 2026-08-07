/**
 * Local Auth IPC handlers
 *
 * 100% local authentication — no cloud, no SaaS dependency.
 * User credentials stored in local SQLite with bcrypt hash.
 * First run shows SetupWizard to create the master user.
 *
 * License validation is optional and can call a remote endpoint,
 * but defaults to local-only validation.
 */

import { ipcMain } from "electron";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import log from "electron-log";
import os from "os";
import { getDb, isDatabaseInitialized } from "../db";

// Token expiration: 30 days
const SESSION_EXPIRY_DAYS = 30;

// License validation endpoint (optional — set via env)
const LICENSE_SERVER_URL = process.env.LICENSE_SERVER_URL || "";

// In-memory store for active sessions (also persisted to DB)
const activeTokens = new Map<string, { userId: string; expiresAt: Date }>();

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function generateHWID(): string {
  try {
    const mid = `${os.hostname()}-${os.userInfo().username}-${os.platform()}-${os.arch()}-${os.cpus()[0]?.model || "unknown"}`;
    return crypto.createHash("sha256").update(mid).digest("hex").slice(0, 32);
  } catch {
    return crypto.createHash("sha256").update(`fallback-${Date.now()}`).digest("hex").slice(0, 32);
  }
}

export function registerAuthHandlers() {
  // ========================================
  // First-run check
  // ========================================
  ipcMain.handle("auth:isFirstRun", async () => {
    const initialized = await isDatabaseInitialized();
    return { isFirstRun: !initialized };
  });

  // ========================================
  // Setup (create master user on first run)
  // ========================================
  ipcMain.handle(
    "auth:setup",
    async (_e, { name, email, password }: { name: string; email: string; password: string }) => {
      log.info(`[auth] setup: creating first user "${email}"`);

      const alreadyInit = await isDatabaseInitialized();
      if (alreadyInit) {
        throw new Error("Database já inicializado. Faça login.");
      }

      // Validate
      if (!name || name.length < 2) throw new Error("Nome muito curto");
      if (!email || !email.includes("@")) throw new Error("Email inválido");
      if (!password || password.length < 8) throw new Error("Senha deve ter pelo menos 8 caracteres");

      const db = getDb();
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user + settings + trial license in one transaction
      const hwid = generateHWID();
      const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const user = await db.user.create({
        data: {
          name,
          email: email.toLowerCase().trim(),
          passwordHash,
          lastLoginAt: new Date(),
          settings: {
            create: {},
          },
        },
        include: { settings: true },
      });

      // Create trial license
      await db.license.create({
        data: {
          key: `TRIAL-${crypto.randomBytes(8).toString("hex").toUpperCase()}`,
          hwid,
          status: "TRIAL",
          plan: "PRO",
          trialEndsAt,
          expiresAt: trialEndsAt,
        },
      });

      // Create session token
      const token = generateToken();
      const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
      await db.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
          userAgent: `DevFactory-Desktop/${process.platform}`,
        },
      });
      activeTokens.set(token, { userId: user.id, expiresAt });

      log.info(`[auth] setup complete — user ${user.id}, trial 7 dias`);

      return {
        ok: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
        license: {
          status: "TRIAL",
          plan: "PRO",
          trialEndsAt: trialEndsAt.toISOString(),
        },
      };
    }
  );

  // ========================================
  // Login (local)
  // ========================================
  ipcMain.handle(
    "auth:login",
    async (_e, { email, password }: { email: string; password: string }) => {
      log.info(`[auth] login attempt: ${email}`);

      const db = getDb();
      const user = await db.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (!user || !user.passwordHash) {
        log.warn(`[auth] login failed: user not found`);
        throw new Error("Email ou senha incorretos");
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        log.warn(`[auth] login failed: invalid password`);
        throw new Error("Email ou senha incorretos");
      }

      // Update last login
      await db.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Create session
      const token = generateToken();
      const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
      await db.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
          userAgent: `DevFactory-Desktop/${process.platform}`,
        },
      });
      activeTokens.set(token, { userId: user.id, expiresAt });

      log.info(`[auth] login success: ${user.email}`);

      return {
        ok: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      };
    }
  );

  // ========================================
  // Logout
  // ========================================
  ipcMain.handle("auth:logout", async (_e, token: string) => {
    if (token) {
      const db = getDb();
      await db.session.deleteMany({ where: { token } });
      activeTokens.delete(token);
    }
    log.info("[auth] logged out");
    return { ok: true };
  });

  // ========================================
  // Get current session (from token)
  // ========================================
  ipcMain.handle("auth:session", async (_e, token?: string) => {
    if (!token) return null;

    // Check in-memory first
    const memSession = activeTokens.get(token);
    if (memSession && memSession.expiresAt > new Date()) {
      const db = getDb();
      const user = await db.user.findUnique({
        where: { id: memSession.userId },
        select: { id: true, name: true, email: true, avatarUrl: true },
      });
      if (user) {
        return { user, token, expiresAt: memSession.expiresAt };
      }
    }

    // Fallback: check DB (e.g. after app restart)
    const db = getDb();
    const session = await db.session.findUnique({
      where: { token },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    if (!session) return null;
    if (session.expiresAt < new Date()) {
      await db.session.delete({ where: { id: session.id } });
      activeTokens.delete(token);
      return null;
    }

    // Re-populate in-memory
    activeTokens.set(token, { userId: session.userId, expiresAt: session.expiresAt });

    return {
      user: session.user,
      token,
      expiresAt: session.expiresAt,
    };
  });

  // ========================================
  // Change password
  // ========================================
  ipcMain.handle(
    "auth:changePassword",
    async (_e, { token, currentPassword, newPassword }: { token: string; currentPassword: string; newPassword: string }) => {
      const sessionInfo = await (async () => {
        const db = getDb();
        const session = await db.session.findUnique({
          where: { token },
          include: { user: true },
        });
        if (!session) throw new Error("Sessão inválida");
        return session;
      })();

      const valid = await bcrypt.compare(currentPassword, sessionInfo.user.passwordHash);
      if (!valid) throw new Error("Senha atual incorreta");

      if (newPassword.length < 8) throw new Error("Nova senha deve ter pelo menos 8 caracteres");

      const newHash = await bcrypt.hash(newPassword, 12);
      const db = getDb();
      await db.user.update({
        where: { id: sessionInfo.userId },
        data: { passwordHash: newHash },
      });

      log.info(`[auth] password changed for user ${sessionInfo.userId}`);
      return { ok: true };
    }
  );

  // ========================================
  // Update profile
  // ========================================
  ipcMain.handle(
    "auth:updateProfile",
    async (_e, { token, name, avatarUrl }: { token: string; name?: string; avatarUrl?: string }) => {
      const db = getDb();
      const session = await db.session.findUnique({ where: { token } });
      if (!session) throw new Error("Sessão inválida");

      const data: any = {};
      if (name) data.name = name;
      if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;

      await db.user.update({
        where: { id: session.userId },
        data,
      });

      return { ok: true };
    }
  );

  // ========================================
  // HWID (hardware fingerprint)
  // ========================================
  ipcMain.handle("auth:hwid", () => generateHWID());

  // ========================================
  // License management
  // ========================================
  ipcMain.handle("auth:getLicense", async () => {
    const db = getDb();
    const license = await db.license.findFirst({
      orderBy: { activatedAt: "desc" },
    });
    return license;
  });

  ipcMain.handle("auth:validateLicense", async (_e, licenseKey: string) => {
    log.info(`[auth] validating license: ${licenseKey.slice(0, 12)}...`);
    const hwid = generateHWID();
    const db = getDb();

    // Format check
    if (!licenseKey || licenseKey.length < 10) {
      throw new Error("License key inválida");
    }

    // Optional: validate against remote license server
    if (LICENSE_SERVER_URL) {
      try {
        const res = await fetch(`${LICENSE_SERVER_URL}/api/license/validate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: licenseKey, hwid }),
        });
        const data: any = await res.json();
        if (!data.ok) {
          throw new Error(data.error || "License inválida no servidor");
        }

        // Save to local DB
        const existing = await db.license.findFirst({ where: { key: licenseKey } });
        if (existing) {
          await db.license.update({
            where: { id: existing.id },
            data: {
              hwid,
              status: data.status || "ACTIVE",
              plan: data.plan || "PRO",
              expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
              lastValidated: new Date(),
            },
          });
        } else {
          await db.license.create({
            data: {
              key: licenseKey,
              hwid,
              status: data.status || "ACTIVE",
              plan: data.plan || "PRO",
              expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
              activatedAt: new Date(),
              lastValidated: new Date(),
            },
          });
        }

        return { ok: true, license: data };
      } catch (err: any) {
        log.error("[auth] remote license validation failed:", err);
        throw err;
      }
    }

    // Local validation (offline mode)
    // For now: accept any key starting with "DF-" with length 24
    const isValidFormat = licenseKey.startsWith("DF-") && licenseKey.length === 24;
    if (!isValidFormat) {
      throw new Error("License key inválida. Formato esperado: DF-XXXXXXXXXXXXXXXXXXXX (24 chars)");
    }

    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    const existing = await db.license.findFirst({ where: { key: licenseKey } });
    if (existing) {
      await db.license.update({
        where: { id: existing.id },
        data: {
          hwid,
          status: "ACTIVE",
          plan: "PRO",
          expiresAt,
          lastValidated: new Date(),
        },
      });
    } else {
      await db.license.create({
        data: {
          key: licenseKey,
          hwid,
          status: "ACTIVE",
          plan: "PRO",
          expiresAt,
          activatedAt: new Date(),
          lastValidated: new Date(),
        },
      });
    }

    log.info("[auth] license validated locally (offline mode)");
    return {
      ok: true,
      license: {
        key: licenseKey,
        status: "ACTIVE",
        plan: "PRO",
        expiresAt: expiresAt.toISOString(),
      },
    };
  });

  // ========================================
  // Start trial (manual, if not auto-started)
  // ========================================
  ipcMain.handle("auth:startTrial", async () => {
    const db = getDb();
    const existing = await db.license.findFirst({ where: { status: "TRIAL" } });
    if (existing) {
      return {
        ok: true,
        trialEndsAt: existing.trialEndsAt,
        message: "Trial já ativo",
      };
    }

    const hwid = generateHWID();
    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.license.create({
      data: {
        key: `TRIAL-${crypto.randomBytes(8).toString("hex").toUpperCase()}`,
        hwid,
        status: "TRIAL",
        plan: "PRO",
        trialEndsAt,
        expiresAt: trialEndsAt,
        activatedAt: new Date(),
        lastValidated: new Date(),
      },
    });

    log.info(`[auth] trial started for HWID ${hwid}`);
    return { ok: true, trialEndsAt: trialEndsAt.toISOString() };
  });
}
