/**
 * AI Provider Adapter — multi-provider chat completion
 *
 * Supports: Gemini, OpenAI, Anthropic Claude, Groq, Mistral, HuggingFace, Ollama
 *
 * Each provider has its own API format. This adapter normalizes them
 * into a unified chat() interface.
 */

import log from "electron-log";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatOptions = {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
};

export type AIConfig = {
  provider: "gemini" | "openai" | "anthropic" | "groq" | "mistral" | "huggingface" | "ollama";
  apiKey?: string;
  model: string;
  baseUrl?: string;
};

export type ChatResponse = {
  content: string;
  model: string;
  tokensUsed?: number;
  finishReason?: string;
  raw?: any;
};

const DEFAULT_BASE_URLS: Record<AIConfig["provider"], string> = {
  gemini: "https://generativelanguage.googleapis.com/v1beta",
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com/v1",
  groq: "https://api.groq.com/openai/v1",
  mistral: "https://api.mistral.ai/v1",
  huggingface: "https://api-inference.huggingface.co/models",
  ollama: "http://127.0.0.1:11434",
};

export class AIAdapter {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl || DEFAULT_BASE_URLS[config.provider],
    };
  }

  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResponse> {
    const { temperature = 0.7, maxTokens = 2048 } = options;
    log.info(`[ai] chat: provider=${this.config.provider} model=${this.config.model} messages=${messages.length}`);

    switch (this.config.provider) {
      case "gemini":
        return this.chatGemini(messages, temperature, maxTokens);
      case "openai":
      case "groq":
      case "mistral":
        return this.chatOpenAICompatible(messages, temperature, maxTokens);
      case "anthropic":
        return this.chatAnthropic(messages, temperature, maxTokens);
      case "ollama":
        return this.chatOllama(messages, temperature, maxTokens);
      case "huggingface":
        return this.chatHuggingFace(messages, temperature, maxTokens);
      default:
        throw new Error(`Provider não suportado: ${this.config.provider}`);
    }
  }

  async testConnection(): Promise<{ ok: boolean; message: string }> {
    try {
      const response = await this.chat(
        [{ role: "user", content: "ping" }],
        { maxTokens: 10, temperature: 0 }
      );
      return { ok: true, message: `Conexão OK. Modelo: ${response.model}` };
    } catch (err: any) {
      return { ok: false, message: err.message || "Erro de conexão" };
    }
  }

  // Gemini
  private async chatGemini(messages: ChatMessage[], temperature: number, maxTokens: number): Promise<ChatResponse> {
    const { apiKey, model, baseUrl } = this.config;
    if (!apiKey) throw new Error("Gemini API key é obrigatória");

    const systemMsgs = messages.filter((m) => m.role === "system");
    const convoMsgs = messages.filter((m) => m.role !== "system");
    const systemInstruction = systemMsgs.length > 0
      ? { parts: [{ text: systemMsgs.map((m) => m.content).join("\n\n") }] }
      : undefined;
    const contents = convoMsgs.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction,
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API error ${res.status}: ${err}`);
    }

    const data: any = await res.json();
    return {
      content: data.candidates?.[0]?.content?.parts?.[0]?.text || "",
      model,
      tokensUsed: data.usageMetadata?.totalTokenCount,
      finishReason: data.candidates?.[0]?.finishReason,
      raw: data,
    };
  }

  // OpenAI-compatible (OpenAI, Groq, Mistral)
  private async chatOpenAICompatible(messages: ChatMessage[], temperature: number, maxTokens: number): Promise<ChatResponse> {
    const { apiKey, model, baseUrl, provider } = this.config;
    if (!apiKey) throw new Error(`${provider} API key é obrigatória`);

    const url = `${baseUrl}/chat/completions`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`${provider} API error ${res.status}: ${err}`);
    }

    const data: any = await res.json();
    return {
      content: data.choices?.[0]?.message?.content || "",
      model: data.model || model,
      tokensUsed: data.usage?.total_tokens,
      finishReason: data.choices?.[0]?.finish_reason,
      raw: data,
    };
  }

  // Anthropic Claude
  private async chatAnthropic(messages: ChatMessage[], temperature: number, maxTokens: number): Promise<ChatResponse> {
    const { apiKey, model, baseUrl } = this.config;
    if (!apiKey) throw new Error("Anthropic API key é obrigatória");

    const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
    const convo = messages.filter((m) => m.role !== "system").map((m) => ({ role: m.role, content: m.content }));

    const url = `${baseUrl}/messages`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        messages: convo,
        system: system || undefined,
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic API error ${res.status}: ${err}`);
    }

    const data: any = await res.json();
    return {
      content: data.content?.[0]?.text || "",
      model: data.model || model,
      tokensUsed: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      finishReason: data.stop_reason,
      raw: data,
    };
  }

  // Ollama (local)
  private async chatOllama(messages: ChatMessage[], temperature: number, maxTokens: number): Promise<ChatResponse> {
    const { model, baseUrl } = this.config;
    const url = `${baseUrl}/api/chat`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        options: { temperature, num_predict: maxTokens },
        stream: false,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Ollama error ${res.status}: ${err}. Verifique se o Ollama está rodando em ${baseUrl}`);
    }

    const data: any = await res.json();
    return {
      content: data.message?.content || "",
      model: data.model || model,
      tokensUsed: (data.prompt_eval_count || 0) + (data.eval_count || 0),
      finishReason: data.done ? "stop" : undefined,
      raw: data,
    };
  }

  // HuggingFace
  private async chatHuggingFace(messages: ChatMessage[], temperature: number, maxTokens: number): Promise<ChatResponse> {
    const { apiKey, model, baseUrl } = this.config;
    if (!apiKey) throw new Error("HuggingFace API key é obrigatória");

    const url = `${baseUrl}/${model}/v1/chat/completions`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HuggingFace API error ${res.status}: ${err}`);
    }

    const data: any = await res.json();
    return {
      content: data.choices?.[0]?.message?.content || "",
      model,
      tokensUsed: data.usage?.total_tokens,
      finishReason: data.choices?.[0]?.finish_reason,
      raw: data,
    };
  }
}

export const PROVIDER_MODELS: Record<AIConfig["provider"], string[]> = {
  gemini: ["gemini-2.0-flash", "gemini-2.0-flash-exp", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.5-flash-8b"],
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo", "o1-preview", "o1-mini"],
  anthropic: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"],
  groq: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"],
  mistral: ["mistral-large-latest", "mistral-small-latest", "open-mistral-7b", "open-mixtral-8x7b", "open-mixtral-8x22b"],
  huggingface: [
    "meta-llama/Llama-3.3-70B-Instruct",
    "meta-llama/Meta-Llama-3-8B-Instruct",
    "mistralai/Mistral-7B-Instruct-v0.3",
    "Qwen/Qwen2.5-72B-Instruct",
    "google/gemma-2-9b-it",
  ],
  ollama: ["llama3.3", "llama3.1:8b", "llama3.1:70b", "mistral", "mistral-nemo", "phi3", "phi3.5", "qwen2.5", "qwen2.5-coder", "gemma2", "deepseek-r1", "deepseek-coder-v2"],
};

export const PROVIDER_LABELS: Record<AIConfig["provider"], string> = {
  gemini: "Google Gemini",
  openai: "OpenAI GPT",
  anthropic: "Anthropic Claude",
  groq: "Groq (Ultra Rápido)",
  mistral: "Mistral AI",
  huggingface: "HuggingFace",
  ollama: "Ollama (Local)",
};

export const PROVIDER_FREE_TIERS: Record<AIConfig["provider"], string> = {
  gemini: "Free: 15 req/min, 1500 req/dia",
  openai: "Pago: ~$0.01/1K tokens (GPT-4o-mini)",
  anthropic: "Free: $5 crédito inicial",
  groq: "Free: 30 req/min, 14400 req/dia",
  mistral: "Free: ~$8 crédito/mês",
  huggingface: "Free: rate limit variável por modelo",
  ollama: "100% Gratuito e Offline",
};
