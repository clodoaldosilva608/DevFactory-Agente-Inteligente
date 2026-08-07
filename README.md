# DevFactory — Agente Inteligente para PC e Celular

> Agente inteligente que executa tarefas no seu PC, recebe comandos do celular e opera com interface HUD tanto no desktop quanto no mobile. IA + automação + controle remoto em um único sistema.

![DevFactory](https://img.shields.io/badge/DevFactory-v3.7.2-cyan?style=for-the-badge&labelColor=050811&color=00f0ff)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Tailwind](https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 🎯 Visão Geral

O **DevFactory** é um agente inteligente multi-dispositivo que combina:

- **IA Nativa Multi-Provider**: Gemini, GPT-4o, Claude e Ollama (local) com fallback automático
- **Controle por Voz**: Whisper offline + Google Speech API
- **Multi-Dispositivo**: Interface HUD idêntica no desktop (Electron) e no navegador mobile, com sincronização em tempo real
- **Automação de Tarefas**: Scripts, apps, controle do SO, scheduler integrado
- **Comandos Remotos**: Execute qualquer ação no PC a partir do celular
- **Interface Cyberpunk HUD**: Estética sci-fi imersiva inspirada no J.A.R.V.I.S

## 🏗️ Arquitetura

### Monorepo
O projeto é estruturado como monorepo leve com duas aplicações:

```
DevFactory-Agente-Inteligente/
├── src/                          # SaaS Web (Next.js 16)
├── prisma/                       # Schema do banco (compartilhado)
├── desktop/                      # App Desktop (Electron)
│   ├── src/
│   │   ├── main/                 # Electron main process
│   │   │   ├── index.ts          # BrowserWindow + tray + lifecycle
│   │   │   └── ipc/              # IPC handlers (system, files, exec, auth, telemetry)
│   │   ├── preload/              # Secure contextBridge
│   │   └── renderer/             # React UI (Vite)
│   │       └── src/
│   │           ├── pages/        # LoginPage, DashboardPage (HUD cyberpunk)
│   │           └── components/   # BootScreen
│   ├── electron-builder.yml      # Config NSIS + DMG + AppImage
│   └── README.md                 # Docs específicas do desktop
├── package.json                  # SaaS web deps
└── README.md
```

### Stack Principal
- **SaaS Web**: Next.js 16 (App Router) + React 19 + TypeScript 5
- **Desktop**: Electron 33 + React 19 + Vite 6 + TypeScript 5
- **Styling**: Tailwind CSS 4 (web) / Tailwind 3 (desktop) + shadcn/ui (web)
- **Banco de Dados**: Prisma 6 (SQLite dev → Postgres/Supabase prod)
- **Auth**: NextAuth.js v4 (Email + Google + GitHub + Phone OTP + Magic Link)
- **Animações**: Framer Motion (web)
- **Ícones**: Lucide React

### Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/              # Páginas públicas de autenticação
│   │   ├── login/           # Login (Email/Senha ou Phone OTP) + OAuth
│   │   ├── register/        # Cadastro com validação + auto-login
│   │   └── verify-request/  # Confirmação de magic link
│   ├── (app)/               # Páginas protegidas (require auth)
│   │   ├── dashboard/       # Painel principal com telemetria + radar
│   │   ├── whatsapp/        # Comandos & Dispositivos pareados
│   │   ├── billing/         # Planos + assinatura + faturas
│   │   └── settings/        # Perfil, org, API keys, segurança
│   ├── api/
│   │   ├── auth/            # NextAuth + register + phone OTP
│   │   └── ...
│   ├── layout.tsx           # Root layout (fonts, providers)
│   ├── page.tsx             # Landing page pública
│   └── globals.css          # Design system cyberpunk
├── components/
│   ├── jarvis/              # Componentes do produto
│   │   ├── cyber-background.tsx
│   │   ├── site-header.tsx
│   │   ├── hero-section.tsx
│   │   ├── features-section.tsx
│   │   ├── dashboard-section.tsx
│   │   ├── commands-section.tsx
│   │   ├── pricing-section.tsx
│   │   ├── footer.tsx
│   │   ├── app-shell.tsx        # Layout autenticado (sidebar + topbar)
│   │   ├── dashboard-home.tsx
│   │   ├── whatsapp-home.tsx
│   │   ├── billing-home.tsx
│   │   ├── settings-home.tsx
│   │   ├── radar-display.tsx    # Radar holográfico animado
│   │   ├── telemetry-panel.tsx  # CPU/RAM/GPU/Temp live
│   │   ├── logs-terminal.tsx    # Console sci-fi com auto-append
│   │   └── command-bar.tsx      # Input + quick actions
│   ├── providers.tsx           # SessionProvider wrapper
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── auth.ts                 # NextAuth config + adapters
│   └── db.ts                   # Prisma client
└── proxy.ts                    # Next.js 16 middleware (auth guard)

prisma/
└── schema.prisma               # 11 tabelas multi-tenant
```

### Database Schema (Multi-tenant)

| Tabela | Descrição |
|--------|-----------|
| `User` | Usuários (email, senha hash, phone, 2FA) |
| `Account` | OAuth accounts (Google, GitHub) |
| `Session` | Sessões NextAuth |
| `Organization` | Workspaces multi-tenant (1 user = 1 org pessoal) |
| `Membership` | Relação user ↔ org com roles (OWNER, ADMIN, MEMBER, VIEWER) |
| `Subscription` | Assinatura da org (plan, status, billingCycle, trial) |
| `Invoice` | Faturas históricas |
| `WhatsAppSession` | Dispositivos pareados (renomear p/ Device em breve) |
| `Campaign` | Comandos/tarefas agendadas |
| `Contact` | Dispositivos sincronizados |
| `Message` | Log de comandos executados |
| `CommandLog` | Atividades do usuário |
| `LicenseKey` | Licenças desktop (futuro Electron) |
| `Device` | Hardware fingerprint (futuro Electron) |

## 🚀 Quick Start

### Pré-requisitos
- Node.js 20+ ou Bun
- Python 3.10+ (opcional, para features de voz)
- Git

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/clodoaldosilva608/DevFactory-Agente-Inteligente.git
cd DevFactory-Agente-Inteligente

# 2. Instale as dependências
bun install
# ou
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas chaves (NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, etc.)

# 4. Inicialize o banco de dados
bun run db:push

# 5. Rode o servidor de desenvolvimento
bun run dev
```

Acesse: http://localhost:3000

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz com:

```env
DATABASE_URL=file:./db/custom.db

# NextAuth (obrigatório)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sua-chave-secreta-32-chars

# OAuth Providers (opcional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# SMTP para Magic Links (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=DevFactory <noreply@devfactory.app>

# Stripe (futuro)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_KEY=
STRIPE_WEBHOOK_SECRET=

# AI Providers (futuro)
GEMINI_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
OLLAMA_HOST=http://localhost:11434
```

## 📦 Scripts Disponíveis

```bash
bun run dev        # Servidor de desenvolvimento (porta 3000)
bun run build      # Build de produção
bun run start      # Servidor de produção
bun run lint       # Verificar qualidade do código
bun run db:push    # Sincronizar schema Prisma com banco
bun run db:generate # Gerar Prisma Client
bun run db:migrate # Criar migration
bun run db:reset   # Resetar banco (cuidado!)
```

## 💰 Planos & Preços

| Plano | Mensal | Anual | Dispositivos | Comandos/mês |
|-------|--------|-------|--------------|--------------|
| **Iniciante** | R$ 47 | R$ 470 | 1 | 1.000 |
| **Profissional** ⭐ | R$ 97 | R$ 970 | 5 | Ilimitados |
| **Enterprise** | R$ 297 | R$ 2.970 | Ilimitados | Ilimitados |

Todos os planos incluem **7 dias de trial grátis** sem cartão de crédito.

## 🎨 Design System

### Paleta Cyberpunk
- **Fundo principal**: `#050811` (preto profundo azulado)
- **Neon primário**: `#00f0ff` (ciano brilhante)
- **Neon secundário**: `#ff3333` (vermelho holográfico)
- **Verde matrix**: `#39ff14` (status sucesso)
- **Texto**: `#e6f7ff` (branco gelo)

### Tipografia
- **Display**: Orbitron (títulos, logo)
- **Mono**: JetBrains Mono (logs, badges, código)
- **Body**: Inter (textos corridos)

### Efeitos Visuais
- Glassmorphism (`backdrop-blur` + transparência)
- Glow neon (`box-shadow` colorido)
- Cantos chanfrados (`clip-path` polygon)
- Grid background animado
- Partículas flutuantes
- Scan line contínua
- Radar holográfico com sweep rotativo

## 🛣️ Roadmap

### Fase 1 — SaaS Web (atual) ✅
- [x] Landing page cyberpunk
- [x] Auth multi-provider (Email, Google, GitHub, Phone OTP, Magic Link)
- [x] Dashboard HUD com telemetria live
- [x] Painel de Comandos & Dispositivos
- [x] Billing com 3 planos (mock Stripe + PIX)
- [x] Settings com 5 abas (Perfil, Org, API, Segurança, Notificações)
- [x] Multi-tenant com Organizations + Memberships

### Fase 2 — Desktop Electron (atual) 🚧
- [x] App Electron empacotado (.exe/.dmg/.AppImage)
- [x] IPC handlers para system commands (open app, files, exec, telemetry)
- [x] Telemetria em tempo real (CPU/RAM/GPU/Temp/Network/Disk)
- [x] HUD cyberpunk idêntico ao web (radar, logs terminal, command bar)
- [x] Auth contra SaaS web (login + session)
- [x] HWID (hardware fingerprint) + trial 7 dias local
- [x] Boot screen com animação sci-fi
- [x] Tray icon (minimizar para bandeja)
- [x] Auto-update via GitHub Releases
- [ ] License server (validação online anti-pirataria)
- [ ] Code signing (Windows + macOS)
- [ ] Comandos por voz (Whisper offline)

### Fase 3 — IA Real
- [ ] Adapter multi-provider (Gemini + GPT-4o + Claude + Ollama)
- [ ] Whisper offline para STT
- [ ] Comandos por voz com hotword detection
- [ ] Function calling para execução de tarefas

### Fase 4 — Sync Multi-Device
- [ ] WebSocket server (`services/sync-server/`)
- [ ] P2P direto quando possível (menor latência)
- [ ] Cloud relay para dispositivos atrás de NAT
- [ ] Notificações push cross-platform

### Fase 5 — WhatsApp (futuro)
- [ ] Mini-service `whatsapp-web.js` (Puppeteer)
- [ ] Multi-conta por organização
- [ ] Campanhas em massa com anti-bloqueio
- [ ] Integração N8N + Webhooks

## 📝 Licença

Este projeto é proprietário. Todos os direitos reservados à **DevFactory**.

## 👨‍💻 Autor

**DevFactory** (clodoaldosilva608)
- GitHub: [@clodoaldosilva608](https://github.com/clodoaldosilva608)

---

<p align="center">
  <strong>DevFactory</strong> — Seu PC obedece. Seu celular comanda.
</p>
