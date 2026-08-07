/**
 * Debug script — verify master admin password
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const db = new PrismaClient();

async function main() {
  const user = await db.user.findUnique({
    where: { email: "clodoaldo608@gmail.com" },
    select: { id: true, email: true, name: true, passwordHash: true, createdAt: true },
  });

  if (!user) {
    console.log("❌ User NOT FOUND");
    return;
  }

  console.log("✅ User found:");
  console.log("  ID:", user.id);
  console.log("  Email:", user.email);
  console.log("  Name:", user.name);
  console.log("  Created:", user.createdAt);
  console.log("  passwordHash length:", user.passwordHash?.length || 0);
  console.log("  passwordHash prefix:", user.passwordHash?.slice(0, 10));

  // Test password comparison
  const password = "Silva88677488";
  console.log("\nTesting password:", password);

  if (!user.passwordHash) {
    console.log("❌ passwordHash is NULL");
    return;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  console.log("bcrypt.compare result:", isMatch);

  if (!isMatch) {
    console.log("\n❌ Password does NOT match hash in DB");
    console.log("Generating NEW hash for the same password...");
    const newHash = await bcrypt.hash(password, 12);
    console.log("New hash:", newHash.slice(0, 30) + "...");

    // Test new hash
    const newMatch = await bcrypt.compare(password, newHash);
    console.log("New hash comparison:", newMatch);

    // Update DB
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });
    console.log("✅ Password hash updated in DB");
  } else {
    console.log("✅ Password matches hash in DB — login should work");
  }
}

main()
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
