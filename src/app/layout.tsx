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
  title: "DevFactory — Agente Inteligente para PC e Celular",
  description:
    "Agente inteligente que executa tarefas no seu PC, recebe comandos do celular e opera com interface HUD tanto no desktop quanto no mobile. IA + automação + controle remoto em um único sistema.",
  keywords: [
    "DevFactory",
    "agente inteligente",
    "automação de tarefas",
    "controle remoto PC",
    "comandos por voz",
    "IA",
    "multi-dispositivo",
    "assistente desktop",
  ],
  authors: [{ name: "DevFactory" }],
  openGraph: {
    title: "DevFactory — Agente Inteligente",
    description:
      "Execute tarefas no PC, controle pelo celular, IA em qualquer dispositivo.",
    siteName: "DevFactory",
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
