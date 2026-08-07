/**
 * Initialize local SQLite database (create file + tables)
 * Run once after fresh clone or to reset DB
 */
const { PrismaClient } = require("@prisma/client");

const path = require("path");

async function main() {
  const dbPath = path.resolve(__dirname, "../devfactory.db");
  const dbUrl = `file:${dbPath}`;

  const db = new PrismaClient({
    datasources: { db: { url: dbUrl } },
  });

  console.log(`[init] creating database at: ${dbPath}`);
  // Force Prisma to materialize the DB by running a real query
  await db.user.count();
  console.log("[init] database ready");

  const userCount = await db.user.count();
  console.log(`[init] users in DB: ${userCount}`);

  await db.$disconnect();
}

main().catch((err) => {
  console.error("[init] error:", err);
  process.exit(1);
});
