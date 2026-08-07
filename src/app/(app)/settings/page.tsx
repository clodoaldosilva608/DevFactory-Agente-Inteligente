import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { SettingsHome } from "@/components/jarvis/settings-home";

export default async function SettingsPage() {
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

  const [user, org] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, image: true, phone: true, createdAt: true },
    }),
    orgId
      ? db.organization.findUnique({
          where: { id: orgId },
          include: { _count: { select: { whatsappSessions: true, members: true, contacts: true } } },
        })
      : null,
  ]);

  return <SettingsHome user={user} org={org} />;
}
