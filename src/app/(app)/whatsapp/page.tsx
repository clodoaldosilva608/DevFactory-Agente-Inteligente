import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { WhatsAppHome } from "@/components/jarvis/whatsapp-home";

export default async function WhatsAppPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  let orgId = session.user.orgId;
  if (!orgId) {
    const freshUser = await db.user.findUnique({
      where: { id: session.user.id },
      include: { ownedOrgs: { take: 1 }, memberships: { take: 1 } },
    });
    orgId = freshUser?.ownedOrgs[0]?.id || freshUser?.memberships[0]?.orgId;
  }
  if (!orgId) return null;

  const [sessions, campaigns, contacts] = await Promise.all([
    db.whatsAppSession.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
    }),
    db.campaign.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.contact.findMany({
      where: { orgId },
      orderBy: { lastMessageAt: "desc" },
      take: 20,
    }),
  ]);

  return <WhatsAppHome sessions={sessions} campaigns={campaigns} contacts={contacts} />;
}
