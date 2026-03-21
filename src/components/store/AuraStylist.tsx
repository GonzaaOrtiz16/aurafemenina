import { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface AuraStylistProductContext {
  id: string;
  name: string;
  slug?: string;
  price?: number | string | null;
  priceEstimate?: number | string | null;
  colores?: unknown;
  sizes?: unknown;
  estimatedDays?: string | null;
  description?: string | null;
  catalogType?: "stock" | "encargue";
}

interface OpenAuraStylistOptions {
  initialMessage?: string;
  productContext?: AuraStylistProductContext;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-processor`;

// Singleton state for opening from outside
let externalOpenFn: ((options?: OpenAuraStylistOptions | string) => void) | null = null;

const buildSystemMessages = (productContext?: AuraStylistProductContext): Message[] => {
  if (!productContext) return [];

  const exactPrice = productContext.catalogType === "encargue"
    ? productContext.priceEstimate
    : productContext.price;

  return [{
    role: "system",
    content: [
      "[CONTEXTO INVISIBLE DEL PRODUCTO ACTUAL]",
      `ID: ${productContext.id}`,
      `Nombre: ${productContext.name}`,
      `Slug: ${productContext.slug || "sin-slug"}`,
      `Catálogo: ${productContext.catalogType === "encargue" ? "por encargue" : "stock inmediato"}`,
      `Precio: ${exactPrice ?? "sin dato"}`,
      `Stock: ${JSON.stringify(productContext.colores ?? null)}`,
      `Talles: ${JSON.stringify(productContext.sizes ?? null)}`,
      `Demora estimada: ${productContext.estimatedDays || "sin dato"}`,
      `Descripción: ${productContext.description || "sin dato"}`,
      `Link actual: ${window.location.href}`,
    ].join("\n"),
  }];
};

export function openAuraStylist(options?: OpenAuraStylistOptions | string) {
  externalOpenFn?.(options);
}

export default function AuraStylist() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const visibleMessages = messages.filter((message) => message.role !== "system");

  const sendMessageWithText = useCallback(async (text: string) => {
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          action: "chat",
          payload: {
            messages: newMessages,
            pageContext: {
              pathname: window.location.pathname,
              href: window.location.href,
            },
          },
        }),
      });

      if (!resp.ok || !resp.body) throw new Error("Error connecting to AI");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Perdón, hubo un error. ¿Podés intentar de nuevo? 💕" },
      ]);
    }
    setLoading(false);
  }, [messages, loading]);

  // Register external open function
  useEffect(() => {
    externalOpenFn = (options?: OpenAuraStylistOptions | string) => {
      const resolvedOptions = typeof options === "string"
        ? { initialMessage: options }
        : options;

      setOpen(true);
      setMessages(buildSystemMessages(resolvedOptions?.productContext));

      if (resolvedOptions?.initialMessage) {
        setTimeout(() => sendMessageWithText(resolvedOptions.initialMessage || ""), 300);
      }
    };
    return () => { externalOpenFn = null; };
  }, [sendMessageWithText]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const sendMessage = () => sendMessageWithText(input.trim());

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-2xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Aura Stylist"
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] bg-background border border-border shadow-2xl flex flex-col overflow-hidden"
            style={{ height: "min(520px, calc(100vh - 8rem))" }}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="font-display text-sm font-semibold tracking-wider uppercase">Aura Stylist</p>
                  <p className="text-[9px] text-muted-foreground tracking-widest uppercase">Asesora de moda virtual</p>
                </div>
              </div>
            </div>

            {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
               {visibleMessages.length === 0 && (
                <div className="text-center py-10">
                  <Sparkles className="h-8 w-8 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    ¡Hola! Soy tu asesora de moda personal.
                    <br />
                    Preguntame lo que quieras 💕
                  </p>
                </div>
              )}
              {visibleMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] px-4 py-3 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-foreground text-background"
                        : "bg-secondary/60 text-foreground border border-border/50"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-xs prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {loading && visibleMessages[visibleMessages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="bg-secondary/60 border border-border/50 px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="¿En qué te puedo ayudar?"
                  className="flex-1 bg-transparent border border-border px-4 py-2.5 text-xs outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/60"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="bg-foreground text-background px-3 py-2.5 disabled:opacity-30 hover:bg-foreground/90 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
