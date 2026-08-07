import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Send,
  RefreshCw,
  Trash2,
  Plus,
  MessageSquare,
  Settings as SettingsIcon,
  Zap,
  Minus,
  Square,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  tokens?: number;
};

type Conversation = {
  id: string;
  title: string;
  provider: string;
  model: string;
  updatedAt: string;
  _count?: { messages: number };
};

export default function AIChatPage() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiSettings, setAiSettings] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load AI settings + conversations on mount
  useEffect(() => {
    loadSettings();
    loadConversations();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadSettings = async () => {
    const s = await window.devfactory.ai.settings();
    setAiSettings(s);
  };

  const loadConversations = async () => {
    const convs = await window.devfactory.ai.conversations(20);
    setConversations(convs);
  };

  const loadConversation = async (id: string) => {
    setActiveConvId(id);
    const conv = await window.devfactory.ai.conversation(id);
    if (conv) {
      setMessages(
        conv.messages.map((m: any) => ({
          role: m.role,
          content: m.content,
          timestamp: m.createdAt,
          tokens: m.tokens,
        }))
      );
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input, timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await window.devfactory.ai.chat(
        newMessages.map((m) => ({ role: m.role, content: m.content })),
        activeConvId || undefined
      );
      const aiMsg: Message = {
        role: "assistant",
        content: response.content,
        timestamp: new Date().toISOString(),
        tokens: response.tokensUsed,
      };
      setMessages((prev) => [...prev, aiMsg]);
      if (!activeConvId && response.conversationId) {
        setActiveConvId(response.conversationId);
        loadConversations();
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ Erro: ${err.message}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setActiveConvId(null);
    setMessages([]);
  };

  const handleDeleteConversation = async (id: string) => {
    if (!confirm("Excluir esta conversa?")) return;
    await window.devfactory.ai.deleteConversation(id);
    if (activeConvId === id) handleNewConversation();
    loadConversations();
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#050811] overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <CustomTitleBar navigate={navigate} />

      <div className="relative z-10 flex-1 flex overflow-hidden">
        {/* Sidebar — conversations list */}
        <div className="w-64 border-r border-cyan-500/20 bg-black/30 flex flex-col">
          <div className="p-3 border-b border-cyan-500/20">
            <button
              onClick={handleNewConversation}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Nova Conversa
            </button>
          </div>
          <div className="flex-1 overflow-y-auto scroll-cyber p-2 space-y-1">
            {conversations.length === 0 ? (
              <p className="text-center text-[11px] font-mono-cyber text-slate-600 mt-8 px-3">
                Nenhuma conversa ainda. Comece uma nova!
              </p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={`w-full text-left p-2.5 transition-all clip-cyber-sm border ${
                    activeConvId === conv.id
                      ? "bg-cyan-500/15 border-cyan-500/40"
                      : "bg-cyan-500/[0.03] border-cyan-500/15 hover:border-cyan-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono-cyber text-xs text-white truncate">
                        {conv.title}
                      </div>
                      <div className="font-mono-cyber text-[9px] text-slate-500 mt-0.5">
                        {conv._count?.messages || 0} msgs · {conv.provider}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conv.id);
                      }}
                      className="p-1 text-slate-600 hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </button>
              ))
            )}
          </div>
          {/* AI Status */}
          <div className="p-3 border-t border-cyan-500/20">
            <div className="p-2 bg-cyan-500/5 border border-cyan-500/20 clip-cyber-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <Brain className="h-3 w-3 text-cyan-400" />
                <span className="font-mono-cyber text-[9px] uppercase tracking-widest text-cyan-400">
                  IA Ativa
                </span>
              </div>
              <div className="font-mono-cyber text-[10px] text-slate-400">
                {aiSettings ? `${aiSettings.provider} · ${aiSettings.model}` : "Não configurada"}
              </div>
              <button
                onClick={() => navigate("/settings")}
                className="mt-2 flex items-center gap-1 text-[10px] font-mono-cyber text-cyan-400 hover:text-cyan-300"
              >
                <SettingsIcon className="h-2.5 w-2.5" />
                Configurar
              </button>
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="h-12 border-b border-cyan-500/20 bg-black/30 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-cyan-400" />
              <span className="font-display font-bold text-sm text-white">
                DevFactory AI Assistant
              </span>
              {aiSettings && (
                <span className="font-mono-cyber text-[10px] text-slate-500 ml-2">
                  {aiSettings.provider} / {aiSettings.model}
                </span>
              )}
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-cyan-400">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span className="font-mono-cyber text-[10px] uppercase tracking-widest">
                  Pensando...
                </span>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scroll-cyber p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="relative h-20 w-20 mb-4">
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-radar-sweep" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="h-8 w-8 text-cyan-400" />
                  </div>
                </div>
                <h2 className="font-display font-bold text-xl text-white mb-2">
                  Pronto para conversar
                </h2>
                <p className="font-mono-cyber text-xs text-slate-500 max-w-md">
                  Digite uma mensagem abaixo. A IA usa o provider configurado em Settings.
                  <br />
                  Pressione Enter para enviar, Shift+Enter para quebra de linha.
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <MessageBubble key={idx} message={msg} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-cyan-500/30 bg-black/40">
            <div className="flex items-end gap-2 max-w-4xl mx-auto">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para quebra de linha)"
                rows={1}
                className="flex-1 px-3 py-2.5 bg-black/60 border border-cyan-500/30 text-cyan-100 placeholder:text-slate-600 font-mono-cyber text-sm outline-none focus:border-cyan-500/60 focus:glow-cyan-sm transition-all clip-cyber-sm resize-none"
                style={{ minHeight: "44px", maxHeight: "120px" }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="p-2.5 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono-cyber text-xs uppercase tracking-wider clip-cyber-sm glow-cyan-sm transition-all disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const isError = message.content.startsWith("❌");

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] p-3 clip-cyber-sm ${
          isUser
            ? "bg-cyan-500/10 border border-cyan-500/40"
            : isError
            ? "bg-red-500/10 border border-red-500/40"
            : "bg-black/40 border border-cyan-500/20"
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`font-mono-cyber text-[9px] uppercase tracking-widest ${
              isUser ? "text-cyan-400" : isError ? "text-red-400" : "text-slate-500"
            }`}
          >
            {isUser ? "Você" : isSystem ? "Sistema" : isError ? "Erro" : "DevFactory AI"}
          </span>
          {message.tokens && (
            <span className="font-mono-cyber text-[9px] text-slate-600">
              · {message.tokens} tokens
            </span>
          )}
        </div>
        <div className="font-mono-cyber text-xs text-slate-200 whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </div>
      </div>
    </div>
  );
}

function CustomTitleBar({ navigate }: { navigate: any }) {
  return (
    <div className="titlebar-drag relative z-20 h-9 bg-black/60 backdrop-blur-md flex items-center justify-between px-3 border-b border-cyan-500/20">
      <div className="flex items-center gap-2">
        <div className="flex h-5 w-5 items-center justify-center bg-black border border-cyan-500/40 clip-cyber-sm">
          <Zap className="h-3 w-3 text-cyan-400" fill="currentColor" />
        </div>
        <span className="font-display font-bold text-xs tracking-widest text-cyan-400">
          DevFactory
        </span>
        <span className="font-mono-cyber text-[9px] uppercase tracking-widest text-slate-500 ml-2">
          AI Assistant
        </span>
      </div>
      <div className="titlebar-no-drag flex items-center gap-2">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-1.5 hover:bg-cyan-500/10 transition-colors"
          title="Voltar ao Dashboard"
        >
          <MessageSquare className="h-3.5 w-3.5 text-slate-400 hover:text-cyan-400" />
        </button>
        <button
          onClick={() => navigate("/settings")}
          className="p-1.5 hover:bg-cyan-500/10 transition-colors"
          title="Configurações"
        >
          <SettingsIcon className="h-3.5 w-3.5 text-slate-400 hover:text-cyan-400" />
        </button>
        <div className="flex items-center gap-1 ml-1">
          <button onClick={() => window.devfactory.app.minimize()} className="p-1.5 hover:bg-cyan-500/10">
            <Minus className="h-3 w-3 text-slate-400" />
          </button>
          <button onClick={() => window.devfactory.app.maximize()} className="p-1.5 hover:bg-cyan-500/10">
            <Square className="h-2.5 w-2.5 text-slate-400" />
          </button>
          <button onClick={() => window.devfactory.app.close()} className="p-1.5 hover:bg-red-500/20">
            <X className="h-3 w-3 text-slate-400 hover:text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
