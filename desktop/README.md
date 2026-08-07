# DevFactory Desktop

App desktop cyberpunk (Windows + macOS + Linux) que funciona como agente inteligente para PC — executa tarefas, recebe comandos remotos do celular e exibe telemetria em tempo real via HUD sci-fi.

## 🚀 Quick Start

### Pré-requisitos
- Node.js 20+ ou Bun
- Plataforma: Windows 10+, macOS 12+, ou Ubuntu 20.04+

### Instalação

```bash
cd desktop
bun install
# ou
npm install
```

### Desenvolvimento

```bash
# Roda Electron + Vite dev server em paralelo
bun run dev
```

Isso abre o app Electron com hot-reload do React.

### Build de produção

```bash
# Compila TypeScript + Vite build
bun run build

# Gera instalador (.exe / .dmg / .AppImage)
bun run dist          # plataforma atual
bun run dist:win      # Windows .exe (NSIS)
bun run dist:mac      # macOS .dmg
bun run dist:linux    # Linux .AppImage + .deb
```

Os instaladores são gerados em `desktop/release/`.

## 🏗️ Arquitetura

```
desktop/
├── src/
│   ├── main/                    # Electron Main Process (Node.js)
│   │   ├── index.ts             # Entry point — janela, tray, lifecycle
│   │   └── ipc/                 # IPC handlers (bridge renderer ↔ main)
│   │       ├── system.ts        # System info, open URLs/paths
│   │       ├── files.ts         # File operations (sandboxed)
│   │       ├── exec.ts          # App launcher + shell exec (allowlisted)
│   │       ├── auth.ts          # Login SaaS + HWID + license
│   │       └── telemetry.ts     # Real-time CPU/RAM/GPU/Temp polling
│   ├── preload/
│   │   └── index.ts             # Secure contextBridge API
│   └── renderer/                # React UI (Vite)
│       ├── index.html
│       └── src/
│           ├── main.tsx         # React entry (HashRouter)
│           ├── App.tsx          # Boot screen + router
│           ├── pages/
│           │   ├── LoginPage.tsx
│           │   └── DashboardPage.tsx  # HUD cyberpunk + telemetria real
│           ├── components/
│           │   └── BootScreen.tsx
│           └── types/
│               └── global.d.ts  # window.devfactory type
├── build/                       # Build assets (icons, entitlements)
├── electron-builder.yml         # Packager config (NSIS, DMG, AppImage)
├── package.json
├── tsconfig.json                # Renderer TS config
├── tsconfig.main.json           # Main process TS config
└── vite.renderer.config.ts      # Vite config
```

## 🔐 Segurança

### IPC Sandbox
- **contextIsolation: true** — renderer não tem acesso direto ao Node
- **nodeIntegration: false** — sem `require` no renderer
- **sandbox: false** (necessário para preload, mas limitado ao contextBridge)
- **CSP strict** — apenas self + localhost para dev

### File operations
- Sandboxed ao `os.homedir()` e `os.tmpdir()` — não pode acessar arquivos do sistema

### Execução de comandos
- **Allowlist de apps**: vscode, chrome, firefox, slack, etc (configurável em `src/main/ipc/exec.ts`)
- **Shell exec**: restrito, com timeout de 30s e buffer limitado a 5MB

## 🎯 Funcionalidades

### Telemetria em Tempo Real
- CPU (uso total + por core)
- RAM (total/used/active)
- GPU (modelo, vendor, VRAM)
- Temperatura CPU
- Rede (rx/tx por segundo)
- Discos (uso por partição)
- Uptime e load average

Polling a cada 2s via `systeminformation`. Streamed para renderer via `webContents.send()`.

### Comandos do Sistema
- Abrir aplicativos (allowlist): `"abrir vscode"`, `"abrir chrome"`
- Executar shell (sandboxed): `await window.devfactory.exec.run({ command: "ls -la" })`
- Spawn long-running processes com stream de stdout/stderr

### Auth + License
- Login contra SaaS web (NextAuth + Supabase)
- HWID (hardware fingerprint) gerado via `node-machine-id`
- Trial 7 dias armazenado localmente
- License key validation (offline com mock, pronto para plugar license server real)

### Auto-update
- Via `electron-updater` + GitHub Releases
- Verifica atualização 10s após launch
- Download + install on quit

## 🎨 UI Cyberpunk

- **Tema**: preto profundo (#050811) + ciano neon (#00f0ff) + vermelho holográfico (#ff3333)
- **Fontes**: Orbitron (display) + JetBrains Mono (mono) + Inter (body)
- **Efeitos**: glassmorphism, glow neon, cantos chanfrados (clip-path), grid background
- **Title bar custom**: frameless com botões minimize/maximize/close cyberpunk
- **Boot screen**: animação inicial com logs estilo terminal sci-fi

## 📦 Distribuição

### Windows (.exe)
- NSIS installer com opções: install dir, desktop shortcut, start menu
- Portable .exe também gerado
- ARM64 + x64

### macOS (.dmg)
- DMG com drag-to-Applications
- Hardened runtime + entitlements
- Universal binary (x64 + arm64)

### Linux (.AppImage + .deb)
- AppImage (sem instalação, executável)
- .deb para Debian/Ubuntu
- tar.gz standalone

## 🔧 Configuração

### Conectar ao SaaS Web
Por padrão, o desktop aponta para `http://localhost:3000` (SaaS local).

Para apontar para produção, edite `src/main/ipc/auth.ts`:
```ts
const DEVFACTORY_API = process.env.DEVFACTORY_API_URL || "https://devfactory.app";
```

Ou sete a variável de ambiente antes de empacotar:
```bash
DEVFACTORY_API_URL=https://devfactory.app bun run dist
```

### Code Signing (produção)

#### Windows
1. Comprar certificado EV Code Signing (~R$ 1.500-3.000/ano)
2. Configurar em `electron-builder.yml`:
```yaml
win:
  certificateFile: build/cert.pfx
  certificatePassword: ${env.CERT_PASSWORD}
```

#### macOS
1. Apple Developer Account ($99/ano)
2. Configurar:
```yaml
mac:
  identity: "Developer ID Application: DevFactory (XXXXXXXXXX)"
  notarize:
    teamId: "XXXXXXXXXX"
```

## 📝 Notas

- O app requer conexão com internet para login inicial
- Após login, funcionalidades básicas funcionam offline
- Telemetria é 100% local (não envia dados para nuvem)
- Comandos do sistema são executados localmente (sem cloud relay ainda)
