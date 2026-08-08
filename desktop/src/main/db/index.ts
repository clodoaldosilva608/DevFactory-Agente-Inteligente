/**
 * DevFactory Desktop — Local Database Client
 *
 * SQLite database stored at userData/devfactory.db
 * Each customer has their own DB file (no cloud, no shared state).
 *
 * Path resolution is deferred until app is ready (Electron app.getPath).
 */

import { app } from "electron";
import path from "path";
import fs from "fs";
import { PrismaClient } from "./generated";

let prisma: PrismaClient | null = null;

/**
 * Get the database file path.
 * Falls back to a local file if app is not available (during tests).
 */
export function getDbPath(): string {
  try {
    const userDataPath = app.getPath("userData");
    // Ensure directory exists
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    return path.join(userDataPath, "devfactory.db");
  } catch {
    // Fallback for tests / non-Electron contexts
    return path.join(process.cwd(), "devfactory.db");
  }
}

/**
 * Initialize the Prisma client with the local SQLite database.
 * Call this once after app.whenReady().
 */
export function initDb(): PrismaClient {
  if (prisma) return prisma;

  const dbPath = getDbPath();
  console.log(`[db] Initializing SQLite at: ${dbPath}`);

  // Set DATABASE_URL env var so Prisma can find it
  process.env.DATABASE_URL = `file:${dbPath}`;

  prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["warn", "error"],
  });

  return prisma;
}

/**
 * Get the singleton Prisma client.
 * Throws if initDb() hasn't been called yet.
 */
export function getDb(): PrismaClient {
  if (!prisma) {
    throw new Error("Database not initialized. Call initDb() first after app.whenReady().");
  }
  return prisma;
}

/**
 * Gracefully disconnect from the database.
 * Call on app shutdown.
 */
export async function closeDb(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
    console.log("[db] Disconnected");
  }
}

/**
 * Check if the database has been initialized (has User table with at least one user).
 * Used to determine if we should show the SetupWizard on first run.
 */
export async function isDatabaseInitialized(): Promise<boolean> {
  try {
    const db = getDb();
    const count = await db.user.count();
    return count > 0;
  } catch {
    return false;
  }
}

/**
 * Wipe all user data (factory reset).
 * Used in Settings → Danger Zone.
 */
export async function wipeDatabase(): Promise<void> {
  const db = getDb();
  // Delete in dependency order
  await db.aIMessage.deleteMany();
  await db.aIConversation.deleteMany();
  await db.message.deleteMany();
  await db.contact.deleteMany();
  await db.commandLog.deleteMany();
  await db.automation.deleteMany();
  await db.pairedDevice.deleteMany();
  await db.session.deleteMany();
  await db.userSettings.deleteMany();
  await db.license.deleteMany();
  await db.user.deleteMany();
  console.log("[db] Database wiped");
}

/**
 * Export all user data as JSON (for backup / LGPD compliance).
 */
export async function exportUserData(): Promise<string> {
  const db = getDb();
  const [
    users,
    settings,
    commandLogs,
    automations,
    contacts,
    messages,
    pairedDevices,
    aiConversations,
    aiMessages,
    licenses,
  ] = await Promise.all([
    db.user.findMany(),
    db.userSettings.findMany(),
    db.commandLog.findMany(),
    db.automation.findMany(),
    db.contact.findMany(),
    db.message.findMany(),
    db.pairedDevice.findMany(),
    db.aIConversation.findMany(),
    db.aIMessage.findMany(),
    db.license.findMany(),
  ]);

  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      version: app.getVersion(),
      data: {
        users,
        settings,
        commandLogs,
        automations,
        contacts,
        messages,
        pairedDevices,
        aiConversations,
        aiMessages,
        licenses,
      },
    },
    null,
    2
  );
}

/**
 * Get database stats (for Settings → About).
 */
export async function getDbStats(): Promise<{
  dbPath: string;
  dbSizeBytes: number;
  tableCounts: Record<string, number>;
}> {
  const dbPath = getDbPath();
  let dbSizeBytes = 0;
  try {
    const stat = fs.statSync(dbPath);
    dbSizeBytes = stat.size;
  } catch {}

  const db = getDb();
  const [
    users,
    contacts,
    messages,
    automations,
    commandLogs,
    pairedDevices,
    aiConversations,
  ] = await Promise.all([
    db.user.count(),
    db.contact.count(),
    db.message.count(),
    db.automation.count(),
    db.commandLog.count(),
    db.pairedDevice.count(),
    db.aIConversation.count(),
  ]);

  return {
    dbPath,
    dbSizeBytes,
    tableCounts: {
      users,
      contacts,
      messages,
      automations,
      commandLogs,
      pairedDevices,
      aiConversations,
    },
  };
}
