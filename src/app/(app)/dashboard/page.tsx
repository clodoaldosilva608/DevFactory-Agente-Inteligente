import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardHome } from "@/components/jarvis/dashboard-home";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  // Fallback: fetch orgId from DB if not in JWT
  let orgId = session.user.orgId;
  if (!orgId) {
    const freshUser = await db.user.findUnique({
      where: { id: session.user.id },
      include: { ownedOrgs: { take: 1 }, memberships: { take: 1 } },
    });
    orgId = freshUser?.ownedOrgs[0]?.id || freshUser?.memberships[0]?.orgId;
  }

  const [user, org, whatsappSessions, campaigns, recentMessages, commandLogs] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, image: true, createdAt: true },
    }),
    orgId
      ? db.organization.findUnique({
          where: { id: orgId },
          include: {
            subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
            _count: { select: { whatsappSessions: true, campaigns: true, contacts: true } },
          },
        })
      : null,
    db.whatsAppSession.findMany({
      where: { orgId: orgId || "" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.campaign.findMany({
      where: { orgId: orgId || "" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.message.findMany({
      where: { orgId: orgId || "" },
      orderBy: { timestamp: "desc" },
      take: 10,
      include: { contact: true },
    }),
    db.commandLog.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <DashboardHome
      user={user}
      org={org}
      whatsappSessions={whatsappSessions}
      campaigns={campaigns}
      recentMessages={recentMessages}
      commandLogs={commandLogs}
    />
  );
}
