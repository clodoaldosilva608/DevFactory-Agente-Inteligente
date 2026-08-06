import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { BillingHome } from "@/components/jarvis/billing-home";

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  // If JWT doesn't have orgId yet (e.g., session created before org was set),
  // fetch from DB as fallback
  let orgId = session.user.orgId;
  if (!orgId) {
    const freshUser = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        ownedOrgs: { take: 1 },
        memberships: { take: 1 },
      },
    });
    orgId = freshUser?.ownedOrgs[0]?.id || freshUser?.memberships[0]?.orgId;
  }
  if (!orgId) return null;

  const [org, subscription, invoices] = await Promise.all([
    db.organization.findUnique({
      where: { id: orgId },
      include: { _count: { select: { whatsappSessions: true, members: true } } },
    }),
    db.subscription.findUnique({
      where: { orgId },
      include: { invoices: { orderBy: { createdAt: "desc" }, take: 10 } },
    }),
    db.invoice.findMany({
      where: { subscription: { orgId } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <BillingHome
      org={org}
      subscription={subscription}
      invoices={invoices}
    />
  );
}
