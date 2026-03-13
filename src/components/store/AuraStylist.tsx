import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-processor`;

export default function AuraStylist() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
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
          payload: { messages: newMessages },
        }),
      });

      if (!resp.ok || !resp.body) {
        throw new Error("Error connecting to AI");
      }

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
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Perdón, hubo un error. ¿Podés intentar de nuevo? 💕" },
      ]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg hover:scale-110 transition-transform duration-200"
        aria-label="Aura Stylist"
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 left-6 z-50 w-[340px] max-w-[calc(100vw-3rem)] bg-background border border-border rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
          style={{ height: "min(480px, calc(100vh - 8rem))" }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-border bg-secondary/30">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <div>
                <p className="font-display text-sm font-semibold tracking-wide">Aura Stylist</p>
                <p className="text-[10px] text-muted-foreground">Tu asesora de moda virtual ✨</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Sparkles className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-xs text-muted-foreground">
                  ¡Hola! Soy tu asesora de moda.
                  <br />
                  Preguntame lo que quieras 💕
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-foreground text-background"
                      : "bg-secondary text-foreground"
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
            {loading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-lg px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="¿En qué te puedo ayudar?"
                className="flex-1 bg-secondary/50 border border-border rounded-md px-3 py-2 text-xs outline-none focus:border-foreground/50 transition-colors placeholder:text-muted-foreground"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="bg-foreground text-background rounded-md px-3 py-2 disabled:opacity-40 hover:bg-foreground/90 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
