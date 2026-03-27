"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { SITE_CONFIG } from "@/lib/constants";
import { 
  Bot, 
  History, 
  Minimize2, 
  Maximize2, 
  X, 
  Send, 
  MessageSquare, 
  Star,
  Plus,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Source {
  id: string;
  materialId: string;
  title: string;
  module: string;
  page: string | null;
  excerpt: string;
}

interface Message {
  id: string;
  turnId?: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  rating?: number | null;
}

interface SessionItem {
  id: string;
  title: string;
  updatedAt: string;
  totalTurns: number;
}

interface ChatTurn {
  id: string;
  question: string;
  answer: string;
  citations: Source[];
  rating: number | null;
}

interface FloatingChatbotProps {
  // Add props if needed in future
}

export const FloatingChatbot = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [ratingLoadingByTurn, setRatingLoadingByTurn] = useState<Record<string, boolean>>({});
  const [position, setPosition] = useState({ x: 24, y: 24 });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const suggestionsLoadedKeyRef = useRef<string>("");

  const classId = searchParams.get("classId") || "";
  const courseId = searchParams.get("courseId") || "";
  const suggestionContextKey = `${pathname}|class:${classId}|course:${courseId}`;

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (!isOpen) return;

    fetch("/api/chat/sessions")
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions || []))
      .catch(() => {});

    if (suggestionsLoadedKeyRef.current === suggestionContextKey && suggestions.length > 0) {
      return;
    }

    const params = new URLSearchParams({ limit: "8" });
    if (classId) params.set("classId", classId);
    if (courseId) params.set("courseId", courseId);

    fetch(`/api/chat/suggestions?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setSuggestions(d.suggestions || []);
        suggestionsLoadedKeyRef.current = suggestionContextKey;
      })
      .catch(() => {});
  }, [isOpen, classId, courseId, suggestionContextKey, suggestions.length]);

  const startDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMaximized || isMinimized) return;
    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: e.clientX - (window.innerWidth - position.x),
      y: e.clientY - (window.innerHeight - position.y),
    };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const nx = Math.max(8, Math.min(window.innerWidth - 8, window.innerWidth - (e.clientX - dragOffsetRef.current.x)));
      const ny = Math.max(8, Math.min(window.innerHeight - 8, window.innerHeight - (e.clientY - dragOffsetRef.current.y)));
      setPosition({ x: nx, y: ny });
    };
    const onUp = () => {
      isDraggingRef.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  async function loadSession(id: string) {
    const res = await fetch(`/api/chat/sessions/${id}`);
    const data = await res.json();
    if (!res.ok) return;

    const msgs: Message[] = (data.turns || []).flatMap((t: ChatTurn) => [
      { id: `${t.id}-q`, role: "user" as const, content: t.question },
      {
        id: `${t.id}-a`,
        turnId: t.id,
        role: "assistant" as const,
        content: t.answer,
        sources: Array.isArray(t.citations) ? t.citations : [],
        rating: t.rating,
      },
    ]);
    setSessionId(data.id);
    setMessages(msgs);
    setIsMinimized(false);
    setShowHistory(false);
  }

  async function sendQuestion(raw: string) {
    const question = raw.trim();
    if (!question || loading) return;
    setLoading(true);
    setMessages((prev) => [...prev, { id: `${Date.now()}-q`, role: "user", content: question }]);
    try {
      const res = await fetch("/api/chat/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, sessionId: sessionId ?? undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memproses pertanyaan");
      setSessionId(data.sessionId);
      setMessages((prev) => [
        ...prev,
        {
          id: `${data.turnId}-a`,
          turnId: data.turnId,
          role: "assistant",
          content: data.answer,
          sources: data.sources || [],
          rating: null,
        },
      ]);
      setInput("");
      fetch("/api/chat/sessions")
        .then((r) => r.json())
        .then((d) => setSessions(d.sessions || []))
        .catch(() => {});
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-err`,
          role: "assistant",
          content: err instanceof Error ? err.message : "Terjadi kesalahan.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function rateTurn(turnId: string, rating: number) {
    if (rating < 1 || rating > 5) return;
    setRatingLoadingByTurn((prev) => ({ ...prev, [turnId]: true }));
    try {
      const res = await fetch(`/api/chat/turns/${turnId}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan rating");
      setMessages((prev) => prev.map((msg) => msg.turnId === turnId ? { ...msg, rating } : msg));
    } catch {
      // Fail silently
    } finally {
      setRatingLoadingByTurn((prev) => ({ ...prev, [turnId]: false }));
    }
  }

  if (pathname === "/chatbot") return null;

  if (!isOpen) {
    return (
      <button
        onClick={() => { setIsOpen(true); setIsMinimized(false); }}
        className="fixed z-40 right-6 bottom-6 h-16 w-16 rounded-full bg-primary text-on-primary shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        title="Buka Chatbot"
      >
        <Bot className="h-8 w-8" />
      </button>
    );
  }

  return (
    <div
      style={isMaximized ? { inset: 16 } : { right: position.x, bottom: position.y, width: 400, height: isMinimized ? 60 : 600 }}
      className={cn(
        "fixed z-40 flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-2xl transition-all duration-200",
        isMaximized && "w-[calc(100%-32px)] h-[calc(100%-32px)] rounded-[2rem]"
      )}
    >
      {/* Header */}
      <div
        onMouseDown={startDrag}
        className={cn(
          "h-14 shrink-0 bg-primary px-4 flex items-center justify-between text-on-primary select-none",
          !isMaximized && !isMinimized && "cursor-grab active:cursor-grabbing"
        )}
      >
        <div className="flex items-center gap-2.5">
          <Bot className="h-5 w-5" />
          <span className="text-sm font-black tracking-tight">{SITE_CONFIG.assistantName}</span>
        </div>
        <div className="flex items-center gap-1">
          {!isMinimized && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-on-primary hover:bg-white/10" onClick={() => setShowHistory(!showHistory)}>
              <History className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-on-primary hover:bg-white/10" onClick={() => { setIsMinimized(!isMinimized); if (isMaximized) setIsMaximized(false); }}>
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          {!isMinimized && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-on-primary hover:bg-white/10" onClick={() => setIsMaximized(!isMaximized)}>
               <Monitor className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-on-primary hover:bg-white/10" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <div className="flex flex-1 min-h-0 bg-background">
          {/* History Sidebar */}
          {showHistory && (
            <aside className="w-48 shrink-0 border-r-2 border-border bg-muted/30 flex flex-col">
              <div className="p-3 border-b-2 border-border flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Riwayat</span>
                <Button variant="outline" size="sm" className="h-6 px-2 text-[10px] font-bold rounded-lg" onClick={() => { setMessages([]); setSessionId(null); }}>
                  <Plus className="h-3 w-3 mr-1" /> Baru
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => loadSession(s.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-all transition-colors",
                      sessionId === s.id ? "bg-primary/10 border-primary text-primary" : "border-transparent hover:bg-muted"
                    )}
                  >
                    <p className="text-xs font-bold truncate underline-offset-2">{s.title}</p>
                    <p className="text-[10px] font-medium opacity-60 mt-1">{s.totalTurns} pesan</p>
                  </button>
                ))}
              </div>
            </aside>
          )}

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-40">
                  <MessageSquare className="h-12 w-12" />
                  <div className="space-y-1">
                    <p className="font-bold">Mulai Percakapan</p>
                    <p className="text-xs">Tanyakan apa pun seputar materi kuliah Anda.</p>
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn("flex flex-col gap-2 max-w-[85%]", msg.role === "user" ? "ml-auto items-end" : "mr-auto")}
                >
                  <div
                    className={cn(
                      "px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none border border-primary/20"
                        : "bg-card border border-border rounded-tl-none"
                    )}
                  >
                    {msg.content}
                  </div>

                  {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.slice(0, 3).map((src) => (
                        <Link
                          key={src.id}
                          href={`/materials/${src.materialId}` as Route}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted border border-border text-[10px] font-bold text-primary hover:bg-primary/5 transition-colors"
                        >
                          <FileText className="h-3 w-3" />
                          <span className="truncate max-w-[100px]">{src.module || src.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {msg.role === "assistant" && msg.turnId && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rating:</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            disabled={ratingLoadingByTurn[msg.turnId!] || !!msg.rating}
                            onClick={() => rateTurn(msg.turnId!, val)}
                            className={cn(
                              "transition-all",
                              (msg.rating || 0) >= val ? "text-primary scale-110" : "text-muted-foreground/30 hover:text-primary/50"
                            )}
                          >
                            <Star className={cn("h-3 w-3", (msg.rating || 0) >= val && "fill-current")} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && !loading && (
               <div className="px-4 py-2 border-t border-border flex items-center gap-3 overflow-x-auto no-scrollbar bg-muted/20">
                  <div className="flex gap-2">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendQuestion(s)}
                        className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-card border border-border text-[11px] font-bold text-muted-foreground hover:border-primary hover:text-primary transition-all shadow-sm"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
               </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-muted/30 border-t-2 border-border">
              <form
                onSubmit={(e) => { e.preventDefault(); sendQuestion(input); }}
                className="relative flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ketik pertanyaan Anda..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  className="w-full h-12 pl-4 pr-12 rounded-2xl bg-card border border-border text-sm font-medium focus:border-primary focus:outline-none transition-all disabled:opacity-50"
                />
                <Button
                  type="submit"
                  variant="default"
                  size="icon"
                  disabled={loading || !input.trim()}
                  className="absolute right-1.5 top-1.5 h-9 w-9"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
              <p className="text-[10px] text-center mt-3 font-bold text-muted-foreground opacity-50 uppercase tracking-widest">
                Didukung oleh AI Nusa Belajar
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
