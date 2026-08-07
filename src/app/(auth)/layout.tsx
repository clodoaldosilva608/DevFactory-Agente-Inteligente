import { CyberBackground } from "@/components/jarvis/cyber-background";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#050811]">
      <CyberBackground />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
