import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CyberBackground } from "@/components/jarvis/cyber-background";
import { SiteHeader } from "@/components/jarvis/site-header";
import { HeroSection } from "@/components/jarvis/hero-section";
import { FeaturesSection } from "@/components/jarvis/features-section";
import { DashboardSection } from "@/components/jarvis/dashboard-section";
import { WhatsAppSection } from "@/components/jarvis/whatsapp-section";
import { PricingSection } from "@/components/jarvis/pricing-section";
import { Footer } from "@/components/jarvis/footer";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#050811] text-foreground overflow-x-hidden">
      <CyberBackground />

      <div className="relative z-10 flex flex-col flex-1">
        <SiteHeader isAuthenticated={!!session} />

        <main className="flex-1">
          <HeroSection />
          <FeaturesSection />
          <DashboardSection />
          <WhatsAppSection />
          <PricingSection />
        </main>

        <Footer />
      </div>
    </div>
  );
}
