/**
 * AI IPC handlers — chat, test connection, list models per provider
 *
 * Persists conversations + messages in local DB (AIConversation, AIMessage)
 */

import { ipcMain } from "electron";
import log from "electron-log";
import { AIAdapter, ChatMessage, PROVIDER_MODELS, PROVIDER_LABELS, PROVIDER_FREE_TIERS, AIConfig } from "../ai/adapter";
import { getDb } from "../db";

// Get AI config from store
async function getAIConfig(): Promise<AIConfig | null> {
  const settings = (await (await import("electron-store")).default) || {};
  // We use electron-store, accessed via store IPC — but for direct access in main:
  // We'll re-read from DB instead (UserSettings table)
  const db = getDb();
  const userSettings = await db.userSettings.findFirst();
  if (!userSettings) return null;

  const provider = (userSettings.aiProvider || "ollama") as AIConfig["provider"];
  const apiKey = userSettings.aiApiKey || undefined;
  const model = userSettings.aiModel || PROVIDER_MODELS[provider][0];

  return { provider, apiKey, model };
}

export function registerAIHandlers() {
  // ========================================
  // Chat with AI
  // ========================================
  ipcMain.handle(
    "ai:chat",
    async (
      _e,
      params: {
        messages: ChatMessage[];
        conversationId?: string;
        temperature?: number;
        maxTokens?: number;
      }
    ) => {
      log.info(`[ai] chat request: ${params.messages.length} messages`);

      const config = await getAIConfig();
      if (!config) {
        throw new Error("IA não configurada. Vá em Settings → IA & API Keys.");
      }

      const ai = new AIAdapter(config);
      const response = await ai.chat(params.messages, {
        temperature: params.temperature,
        maxTokens: params.maxTokens,
      });

      // Persist to DB (if conversationId provided or create new)
      const db = getDb();
      let conversationId = params.conversationId;

      if (!conversationId) {
        // Create new conversation
        const title = params.messages[0]?.content.slice(0, 60) || "Nova conversa";
        const conv = await db.aIConversation.create({
          data: {
            title,
            provider: config.provider,
            model: config.model,
          },
        });
        conversationId = conv.id;
      }

      // Save user message + AI response
      const lastUserMsg = params.messages[params.messages.length - 1];
      if (lastUserMsg && lastUserMsg.role === "user") {
        await db.aIMessage.create({
          data: {
            conversationId,
            role: "user",
            content: lastUserMsg.content,
            metadata: JSON.stringify({ provider: config.provider, model: config.model }),
          },
        });
      }

      await db.aIMessage.create({
        data: {
          conversationId,
          role: "assistant",
          content: response.content,
          tokens: response.tokensUsed,
          metadata: JSON.stringify({
            provider: config.provider,
            model: response.model,
            finishReason: response.finishReason,
          }),
        },
      });

      // Update conversation timestamp
      await db.aIConversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return {
        content: response.content,
        model: response.model,
        tokensUsed: response.tokensUsed,
        finishReason: response.finishReason,
        conversationId,
      };
    }
  );

  // ========================================
  // Test AI connection (validates API key)
  // ========================================
  ipcMain.handle(
    "ai:test",
    async (
      _e,
      params: { provider: string; apiKey?: string; model: string; baseUrl?: string }
    ) => {
      log.info(`[ai] test: provider=${params.provider} model=${params.model}`);
      const config: AIConfig = {
        provider: params.provider as AIConfig["provider"],
        apiKey: params.apiKey,
        model: params.model,
        baseUrl: params.baseUrl,
      };
      const ai = new AIAdapter(config);
      return await ai.testConnection();
    }
  );

  // ========================================
  // List models per provider
  // ========================================
  ipcMain.handle("ai:models", (_e, provider?: string) => {
    if (provider) {
      return PROVIDER_MODELS[provider as AIConfig["provider"]] || [];
    }
    return PROVIDER_MODELS;
  });

  // ========================================
  // List providers (with labels + free tier info)
  // ========================================
  ipcMain.handle("ai:providers", () => {
    return Object.keys(PROVIDER_LABELS).map((id) => ({
      id,
      label: PROVIDER_LABELS[id as AIConfig["provider"]],
      freeTier: PROVIDER_FREE_TIERS[id as AIConfig["provider"]],
      models: PROVIDER_MODELS[id as AIConfig["provider"]],
    }));
  });

  // ========================================
  // List past conversations
  // ========================================
  ipcMain.handle("ai:conversations", async (_e, limit: number = 20) => {
    const db = getDb();
    const conversations = await db.aIConversation.findMany({
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: {
        _count: { select: { messages: true } },
      },
    });
    return conversations;
  });

  // ========================================
  // Get conversation messages
  // ========================================
  ipcMain.handle("ai:conversation", async (_e, conversationId: string) => {
    const db = getDb();
    const conversation = await db.aIConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
    return conversation;
  });

  // ========================================
  // Delete conversation
  // ========================================
  ipcMain.handle("ai:deleteConversation", async (_e, conversationId: string) => {
    const db = getDb();
    await db.aIConversation.delete({ where: { id: conversationId } });
    return { ok: true };
  });

  // ========================================
  // Save AI settings to DB
  // ========================================
  ipcMain.handle(
    "ai:saveSettings",
    async (
      _e,
      params: { provider: string; apiKey?: string; model: string; baseUrl?: string }
    ) => {
      const db = getDb();
      const existing = await db.userSettings.findFirst();

      if (existing) {
        await db.userSettings.update({
          where: { id: existing.id },
          data: {
            aiProvider: params.provider,
            aiApiKey: params.apiKey || null,
            aiModel: params.model,
          },
        });
      } else {
        // Find first user to associate settings with
        const firstUser = await db.user.findFirst();
        if (!firstUser) {
          throw new Error("Nenhum usuário encontrado. Faça setup primeiro.");
        }
        await db.userSettings.create({
          data: {
            userId: firstUser.id,
            aiProvider: params.provider,
            aiApiKey: params.apiKey || null,
            aiModel: params.model,
          },
        });
      }

      log.info(`[ai] settings saved: provider=${params.provider} model=${params.model}`);
      return { ok: true };
    }
  );

  // ========================================
  // Get current AI settings
  // ========================================
  ipcMain.handle("ai:settings", async () => {
    const db = getDb();
    const settings = await db.userSettings.findFirst();
    if (!settings) {
      return {
        provider: "ollama",
        apiKey: null,
        model: "llama3.1",
      };
    }
    return {
      provider: settings.aiProvider,
      apiKey: settings.aiApiKey,
      model: settings.aiModel,
    };
  });
}
