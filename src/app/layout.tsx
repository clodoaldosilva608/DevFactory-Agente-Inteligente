import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Orbitron } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BotZapBR / J.A.R.V.I.S — Automação Inteligente para WhatsApp",
  description:
    "Plataforma de automação inteligente e assistente virtual que combina IA, automação de WhatsApp e controle de sistema com interface sci-fi imersiva estilo J.A.R.V.I.S.",
  keywords: [
    "BotZapBR",
    "JARVIS",
    "automação WhatsApp",
    "IA",
    "assistente virtual",
    "cyberpunk",
    "N8N",
    "automação",
  ],
  authors: [{ name: "BotZapBR" }],
  openGraph: {
    title: "BotZapBR / J.A.R.V.I.S — Automação Inteligente",
    description:
      "IA + Automação WhatsApp + Controle de Sistema com interface cyberpunk imersiva.",
    siteName: "BotZapBR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <body
        className={`${inter.variable} ${jetbrains.variable} ${orbitron.variable} antialiased`}
      >
        <Providers>
          {children}
          <Toaster />
          <SonnerToaster
            position="top-right"
            theme="dark"
            toastOptions={{
              style: {
                background: "rgba(5, 8, 17, 0.95)",
                border: "1px solid rgba(0, 240, 255, 0.3)",
                color: "#e6f7ff",
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: "12px",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

