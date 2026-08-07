/**
 * Create master admin credential
 *
 * Usage: bun run scripts/create-master-admin.cjs
 *
 * Creates (or updates) a user with:
 * - Email: clodoaldo608@gmail.com
 * - Password: Silva88677488
 * - Role: ADMIN (master access to all features)
 * - Organization: "DevFactory Master" with ENTERPRISE plan (lifetime, no trial)
 * - Subscription: ACTIVE, lifetime, R$ 0 (comped)
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const db = new PrismaClient();

const MASTER_EMAIL = "clodoaldo608@gmail.com";
const MASTER_PASSWORD = "Silva88677488";
const MASTER_NAME = "Clodoaldo Silva";

async function main() {
  console.log("🔐 Creating master admin credential...");
  console.log(`   Email: ${MASTER_EMAIL}`);

  const passwordHash = await bcrypt.hash(MASTER_PASSWORD, 12);
  const slug = `master-${crypto.randomBytes(3).toString("hex")}`;
  const lifetimeEnd = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000); // 100 years

  // Check if user already exists
  const existing = await db.user.findUnique({
    where: { email: MASTER_EMAIL },
    include: { ownedOrgs: { take: 1 } },
  });

  if (existing) {
    console.log("   ⚠ User already exists — updating password + promoting to ENTERPRISE");

    await db.user.update({
      where: { id: existing.id },
      data: {
        name: MASTER_NAME,
        passwordHash,
        emailVerified: new Date(),
      },
    });

    if (existing.ownedOrgs[0]) {
      const org = existing.ownedOrgs[0];
      await db.organization.update({
        where: { id: org.id },
        data: {
          name: "DevFactory Master",
          plan: "ENTERPRISE",
          status: "ACTIVE",
          trialEndsAt: null,
        },
      });

      const sub = await db.subscription.findUnique({ where: { orgId: org.id } });
      if (sub) {
        await db.subscription.update({
          where: { orgId: org.id },
          data: {
            plan: "ENTERPRISE",
            status: "ACTIVE",
            billingCycle: "YEARLY",
            trialEndsAt: null,
            currentPeriodStart: new Date(),
            currentPeriodEnd: lifetimeEnd,
            amount: 0,
            currency: "BRL",
            paymentMethod: "MANUAL",
          },
        });
      } else {
        await db.subscription.create({
          data: {
            orgId: org.id,
            plan: "ENTERPRISE",
            status: "ACTIVE",
            billingCycle: "YEARLY",
            trialEndsAt: null,
            currentPeriodStart: new Date(),
            currentPeriodEnd: lifetimeEnd,
            amount: 0,
            currency: "BRL",
            paymentMethod: "MANUAL",
          },
        });
      }
      console.log(`   ✓ Organization updated: ${org.id}`);
    } else {
      const org = await db.organization.create({
        data: {
          name: "DevFactory Master",
          slug,
          ownerId: existing.id,
          plan: "ENTERPRISE",
          status: "ACTIVE",
          trialEndsAt: null,
          subscriptions: {
            create: {
              plan: "ENTERPRISE",
              status: "ACTIVE",
              billingCycle: "YEARLY",
              trialEndsAt: null,
              currentPeriodStart: new Date(),
              currentPeriodEnd: lifetimeEnd,
              amount: 0,
              currency: "BRL",
              paymentMethod: "MANUAL",
            },
          },
          members: {
            create: {
              userId: existing.id,
              role: "OWNER",
              joinedAt: new Date(),
            },
          },
        },
      });
      console.log(`   ✓ Organization created: ${org.id}`);
    }

    console.log("\n✅ Master admin updated successfully!");
    console.log(`   Login: ${MASTER_EMAIL}`);
    console.log(`   Senha: ${MASTER_PASSWORD}`);
    console.log("   Plano: ENTERPRISE (vitalício)");
    return;
  }

  // Create new user + org + subscription (transactional)
  console.log("   Creating new admin user...");

  const user = await db.user.create({
    data: {
      name: MASTER_NAME,
      email: MASTER_EMAIL,
      passwordHash,
      emailVerified: new Date(),
      ownedOrgs: {
        create: {
          name: "DevFactory Master",
          slug,
          plan: "ENTERPRISE",
          status: "ACTIVE",
          trialEndsAt: null,
          subscriptions: {
            create: {
              plan: "ENTERPRISE",
              status: "ACTIVE",
              billingCycle: "YEARLY",
              trialEndsAt: null,
              currentPeriodStart: new Date(),
              currentPeriodEnd: lifetimeEnd,
              amount: 0,
              currency: "BRL",
              paymentMethod: "MANUAL",
            },
          },
        },
      },
    },
    include: { ownedOrgs: { take: 1 } },
  });

  const org = user.ownedOrgs[0];
  if (org) {
    await db.membership.create({
      data: {
        userId: user.id,
        orgId: org.id,
        role: "OWNER",
        joinedAt: new Date(),
      },
    });
  }

  console.log(`   ✓ User created: ${user.id}`);
  console.log(`   ✓ Organization created: ${org?.id}`);
  console.log(`   ✓ Subscription ENTERPRISE (vitalícia, R$ 0) created`);

  console.log("\n✅ Master admin created successfully!");
  console.log(`   Login: ${MASTER_EMAIL}`);
  console.log(`   Senha: ${MASTER_PASSWORD}`);
  console.log("   Plano: ENTERPRISE (vitalício)");
  console.log("   Acesso: TODAS as páginas protegidas");
}

main()
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
