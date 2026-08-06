import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";

// Inline simple phone OTP verification storage (in-memory for demo)
// In production, move to Redis or DB table
const phoneOtpStore = new Map<string, { code: string; expires: number }>();

export function generatePhoneOtp(phone: string): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  phoneOtpStore.set(phone, { code, expires: Date.now() + 5 * 60 * 1000 });
  // In production: send via Twilio/SNS
  console.log(`[OTP] ${phone}: ${code}`);
  return code;
}

export function verifyPhoneOtp(phone: string, code: string): boolean {
  const entry = phoneOtpStore.get(phone);
  if (!entry) return false;
  if (Date.now() > entry.expires) {
    phoneOtpStore.delete(phone);
    return false;
  }
  if (entry.code !== code) return false;
  phoneOtpStore.delete(phone);
  return true;
}

export const authOptions: NextAuthOptions = {
  // @ts-expect-error - Prisma adapter compat with our schema
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || randomBytes(32).toString("hex"),
  },
  providers: [
    CredentialsProvider({
      name: "Email + Senha",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user || !user.passwordHash) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    CredentialsProvider({
      id: "phone",
      name: "Telefone (OTP)",
      credentials: {
        phone: { label: "Telefone", type: "tel" },
        code: { label: "Código OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) return null;
        const ok = verifyPhoneOtp(credentials.phone, credentials.code);
        if (!ok) return null;
        // Find or create user by phone
        let user = await db.user.findUnique({ where: { phone: credentials.phone } });
        if (!user) {
          user = await db.user.create({
            data: {
              phone: credentials.phone,
              email: `${credentials.phone.replace(/\D/g, "")}@phone.botzapbr.com`,
              name: `Usuário ${credentials.phone.slice(-4)}`,
              phoneVerified: new Date(),
            },
          });
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        auth: {
          user: process.env.SMTP_USER || "",
          pass: process.env.SMTP_PASS || "",
        },
      },
      from: process.env.SMTP_FROM || "BotZapBR <noreply@botzapbr.com>",
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/onboarding",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      // On signup or login, fetch org info
      if (trigger === "signUp" || trigger === "signIn") {
        if (token.email) {
          const dbUser = await db.user.findUnique({
            where: { email: token.email },
            include: {
              memberships: { include: { org: true } },
              ownedOrgs: true,
            },
          });
          if (dbUser) {
            const primaryOrg =
              dbUser.ownedOrgs[0] || dbUser.memberships[0]?.org;
            if (primaryOrg) {
              token.orgId = primaryOrg.id;
              token.orgSlug = primaryOrg.slug;
              token.plan = primaryOrg.plan;
            }
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.orgId = token.orgId as string;
        session.user.orgSlug = token.orgSlug as string;
        session.user.plan = token.plan as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Auto-create personal org for new users
      if (!user.email) return;
      const slug = `${user.email.split("@")[0]}-${randomBytes(3).toString("hex")}`;
      const org = await db.organization.create({
        data: {
          name: `${user.name || user.email.split("@")[0]}'s Workspace`,
          slug,
          ownerId: user.id,
          plan: "FREE",
          status: "TRIALING",
          trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7-day trial
        },
      });
      await db.membership.create({
        data: {
          userId: user.id,
          orgId: org.id,
          role: "OWNER",
          joinedAt: new Date(),
        },
      });
      // Create trial subscription
      await db.subscription.create({
        data: {
          orgId: org.id,
          plan: "PRO",
          status: "TRIALING",
          billingCycle: "MONTHLY",
          trialEndsAt: org.trialEndsAt,
          amount: 9700,
          currency: "BRL",
          paymentMethod: "CARD",
        },
      });
    },
  },
};

// Augment NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      orgId?: string;
      orgSlug?: string;
      plan?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    orgId?: string;
    orgSlug?: string;
    plan?: string;
  }
}
