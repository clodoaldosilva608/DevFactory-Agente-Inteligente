import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = registerSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json(
        { error: "Email já cadastrado. Faça login." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Create user + organization + trial subscription atomically (membership linked after)
    const slug = `${normalizedEmail.split("@")[0]}-${randomBytes(3).toString("hex")}`;
    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const user = await db.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        emailVerified: new Date(),
        ownedOrgs: {
          create: {
            name: `${name}'s Workspace`,
            slug,
            plan: "PRO",
            status: "TRIALING",
            trialEndsAt,
            subscriptions: {
              create: {
                plan: "PRO",
                status: "TRIALING",
                billingCycle: "MONTHLY",
                trialEndsAt,
                currentPeriodStart: new Date(),
                currentPeriodEnd: trialEndsAt,
                amount: 9700,
                currency: "BRL",
                paymentMethod: "CARD",
              },
            },
          },
        },
      },
      include: { ownedOrgs: { take: 1 } },
    });

    // Link the OWNER membership now that we have user.id and org.id
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

    return NextResponse.json({
      ok: true,
      userId: user.id,
      orgId: org?.id,
      message: "Conta criada com sucesso!",
    });
  } catch (err) {
    console.error("[register] error:", err);
    return NextResponse.json(
      { error: "Erro ao criar conta. Tente novamente." },
      { status: 500 }
    );
  }
}

