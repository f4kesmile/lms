"use client";

import {
  Bot,
  ChevronDown,
  ChevronUp,
  FileText,
  History,
  Lightbulb,
  Loader2,
  Maximize2,
  MessageSquare,
  Minimize2,
  Plus,
  Send,
  Star,
  X,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Source } from "@/lib/ai/chatbot";
import { SITE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

function renderMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^(\d+)\.\s+(.+)$/gm, "<li class='ml-4 list-decimal'>$2</li>")
    .replace(/^[-–]\s+(.+)$/gm, "<li class='ml-4 list-disc'>$1</li>")
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

interface Message {
  id: string;
  turnId?: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  rating?: number | null;
  followUps?: string[];
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

export const FloatingChatbot = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const [ratingLoadingByTurn, setRatingLoadingByTurn] = useState<
    Record<string, boolean>
  >({});
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [isMobile, setIsMobile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const suggestionsLoadedKeyRef = useRef<string>("");

  const classId = searchParams.get("classId") || "";
  const courseId = searchParams.get("courseId") || "";
  const suggestionContextKey = `${pathname}|class:${classId}|course:${courseId}`;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  // Greeting — runs once when chatbot is first opened
  useEffect(() => {
    if (!isOpen || hasGreeted) return;
    const hour = new Date().getHours();
    const timeGreet =
      hour < 11
        ? "Selamat pagi"
        : hour < 15
          ? "Selamat siang"
          : hour < 18
            ? "Selamat sore"
            : "Selamat malam";
    setMessages([
      {
        id: "greeting",
        role: "assistant",
        content: `${timeGreet}! Saya **Liona**, asisten akademik untuk Nusa Belajar.\n\nSaya siap membantu Anda memahami materi kuliah, menjawab pertanyaan, dan berdiskusi seputar topik pembelajaran. Silakan ajukan pertanyaan Anda!`,
      },
    ]);
    setHasGreeted(true);
  }, [isOpen, hasGreeted]);

  // Fetch sessions & suggestions when chatbot opens or context changes
  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/chat/sessions")
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions || []))
      .catch(() => {});

    if (
      suggestionsLoadedKeyRef.current === suggestionContextKey &&
      suggestions.length > 0
    )
      return;

    const params = new URLSearchParams({ limit: "5" });
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
    if (isMaximized || isMinimized || isMobile) return;
    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: e.clientX - (window.innerWidth - position.x),
      y: e.clientY - (window.innerHeight - position.y),
    };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      setPosition({
        x: Math.max(8, Math.min(window.innerWidth - 8, window.innerWidth - (e.clientX - dragOffsetRef.current.x))),
        y: Math.max(8, Math.min(window.innerHeight - 8, window.innerHeight - (e.clientY - dragOffsetRef.current.y))),
      });
    };
    const onUp = () => { isDraggingRef.current = false; };
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
        followUps: [],
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
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-q`, role: "user", content: question },
    ]);
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
          followUps: data.followUps || [],
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
      setMessages((prev) =>
        prev.map((msg) => (msg.turnId === turnId ? { ...msg, rating } : msg)),
      );
    } catch {
      /* silent */
    } finally {
      setRatingLoadingByTurn((prev) => ({ ...prev, [turnId]: false }));
    }
  }

  if (pathname === "/chatbot") return null;

  /* ── Floating Toggle ── */
  if (!isOpen) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => { setIsOpen(true); setIsMinimized(false); }}
            className="fixed z-[100] right-5 bottom-5 sm:right-6 sm:bottom-6 h-14 w-14 rounded-2xl bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          >
            <Bot className="h-7 w-7" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">Asisten AI</TooltipContent>
      </Tooltip>
    );
  }

  /* ── Window Styles ── */
  const windowStyle: React.CSSProperties = isMaximized
    ? { inset: isMobile ? 0 : 16 }
    : isMobile
      ? { bottom: 0, left: 0, right: 0, height: isMinimized ? 56 : "92dvh" }
      : { right: position.x, bottom: position.y, width: 420, height: isMinimized ? 56 : 620 };

  return (
    <div
      style={windowStyle}
      className={cn(
        "fixed z-[100] flex flex-col overflow-hidden transition-all duration-300",
        "bg-background border border-border shadow-2xl",
        isMobile
          ? isMaximized ? "rounded-none" : isMinimized ? "rounded-t-2xl" : "rounded-t-2xl"
          : isMaximized ? "rounded-2xl" : isMinimized ? "rounded-xl" : "rounded-2xl",
      )}
    >
      {/* ── Header ── */}
      <div
        onMouseDown={startDrag}
        className={cn(
          "h-14 shrink-0 px-4 flex items-center justify-between border-b border-border bg-card",
          !isMaximized && !isMinimized && !isMobile && "cursor-grab active:cursor-grabbing",
        )}
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none">{SITE_CONFIG.assistantName}</p>
            <p className="text-[10px] text-primary font-semibold mt-0.5">Online</p>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          {!isMinimized && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost" size="icon"
                    className={cn("h-8 w-8 rounded-lg", showHistory ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    <History className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Riwayat</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                    onClick={() => { setMessages([]); setSessionId(null); setHasGreeted(false); }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Chat Baru</TooltipContent>
              </Tooltip>
            </>
          )}

          {!isMinimized && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost" size="icon"
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                  onClick={() => setIsMaximized(!isMaximized)}
                >
                  {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isMaximized ? "Kembalikan" : "Layar Penuh"}</TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost" size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setIsMinimized(!isMinimized);
                  if (isMaximized) setIsMaximized(false);
                }}
              >
                {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isMinimized ? "Buka" : "Kecilkan"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost" size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Tutup</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* ── Body ── */}
      {!isMinimized && (
        <div className="flex flex-1 min-h-0">
          {/* History Panel */}
          {showHistory && (
            <aside className="w-52 shrink-0 border-r border-border bg-card flex flex-col">
              <div className="p-3 border-b border-border">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Riwayat Sesi
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {sessions.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="h-6 w-6 mx-auto mb-2 opacity-30" />
                    <p className="text-[10px] font-semibold">Belum ada riwayat</p>
                  </div>
                )}
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => loadSession(s.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl transition-colors",
                      sessionId === s.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted text-foreground",
                    )}
                  >
                    <p className="text-xs font-bold truncate">{s.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.totalTurns} pesan</p>
                  </button>
                ))}
              </div>
            </aside>
          )}

          {/* Chat Column */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center px-6 gap-4 text-muted-foreground">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-foreground">Mulai Percakapan</p>
                    <p className="text-xs mt-1">Tanyakan seputar materi kuliah Anda.</p>
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col gap-2 max-w-[85%]",
                    msg.role === "user" ? "ml-auto items-end" : "mr-auto",
                  )}
                >
                  <div
                    className={cn(
                      "px-4 py-3 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
                        : "bg-muted rounded-2xl rounded-bl-md [&_strong]:font-bold [&_em]:italic [&_li]:my-0.5",
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                    ) : (
                      msg.content
                    )}
                  </div>

                  {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.slice(0, 3).map((src) => (
                        <Link
                          key={src.id}
                          href={`/courses/${classId}/subjects/${src.subjectId}/meetings/${src.meetingNo}` as Route}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted border border-border text-[10px] font-semibold text-primary hover:bg-primary/5 transition-colors"
                        >
                          <FileText className="h-3 w-3" />
                          <span className="truncate max-w-[100px]">{src.subjectCode} · {src.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {msg.role === "assistant" && msg.turnId && msg.sources && msg.sources.length > 0 && (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-semibold text-muted-foreground">Rating</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            disabled={ratingLoadingByTurn[msg.turnId!] || !!msg.rating}
                            onClick={() => rateTurn(msg.turnId!, val)}
                            className={cn(
                              "transition-colors",
                              (msg.rating || 0) >= val
                                ? "text-primary"
                                : "text-muted-foreground/30 hover:text-primary/50",
                            )}
                          >
                            <Star className={cn("h-3 w-3", (msg.rating || 0) >= val && "fill-current")} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Render Follow-Ups for the latest Assistant Message */}
                  {msg.role === "assistant" && idx === messages.length - 1 && !loading && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-1">
                      {/* For the greeting message, use global `suggestions`. For others, use `msg.followUps` */}
                      {(msg.id === "greeting" ? suggestions : msg.followUps || []).map((s, i) => (
                        <button
                          key={i}
                          onClick={() => sendQuestion(s)}
                          className="flex items-start gap-1.5 text-left px-3 py-1.5 rounded-xl bg-background border border-border text-[11px] font-medium text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-muted/50 transition-all max-w-[280px]"
                        >
                          <Lightbulb className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/60" />
                          <span className="line-clamp-2">{s}</span>
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border bg-card">
              <form
                onSubmit={(e) => { e.preventDefault(); sendQuestion(input); }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ketik pertanyaan…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  className="flex-1 h-10 px-4 rounded-xl bg-background border border-border text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all disabled:opacity-50 placeholder:text-muted-foreground/60"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      size="icon"
                      disabled={loading || !input.trim()}
                      className="h-10 w-10 rounded-xl shrink-0"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Kirim</TooltipContent>
                </Tooltip>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
