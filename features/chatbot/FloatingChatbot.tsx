"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type Source = {
  id: string;
  materialId: string;
  title: string;
  module: string;
  page: string | null;
  excerpt: string;
};

type Message = {
  id: string;
  turnId?: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  rating?: number | null;
};

type SessionItem = {
  id: string;
  title: string;
  updatedAt: string;
  totalTurns: number;
};

/* ─── icon button helper ─── */
function IconBtn({
  icon,
  onClick,
  title,
}: {
  icon: string;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
        borderRadius: 4,
        color: "inherit",
        opacity: 0.85,
        lineHeight: 1,
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 17 }}>
        {icon}
      </span>
    </button>
  );
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
  const [ratingLoadingByTurn, setRatingLoadingByTurn] = useState<
    Record<string, boolean>
  >({});
  const [position, setPosition] = useState({ x: 24, y: 24 });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const suppressSuggestionClickRef = useRef(false);
  const suggestionsDragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });
  const suggestionsLoadedKeyRef = useRef<string>("");

  const classIdFromQuery = searchParams.get("classId") ?? "";
  const courseIdFromQuery = searchParams.get("courseId") ?? "";

  const pathSegments = pathname.split("/").filter(Boolean);
  const courseIdFromPath =
    pathSegments[0] === "courses" && pathSegments[1] ? pathSegments[1] : "";
  const classIdFromPath =
    pathSegments[0] === "classes" && pathSegments[1] ? pathSegments[1] : "";

  const classId = classIdFromQuery || classIdFromPath;
  const courseId = courseIdFromQuery || courseIdFromPath;
  const suggestionContextKey = `${pathname}|class:${classId}|course:${courseId}`;

  if (pathname === "/chatbot") return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!isOpen) return;

    fetch("/api/chat/sessions")
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions || []))
      .catch(() => {});

    if (
      suggestionsLoadedKeyRef.current === suggestionContextKey &&
      suggestions.length > 0
    ) {
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

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const el = suggestionsRef.current;
    if (!el) return;

    function onWheel(e: WheelEvent) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      const current = suggestionsRef.current;
      if (!current) return;
      current.scrollLeft += e.deltaY;
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, [showSuggestions, suggestions.length]);

  function startDrag(e: React.MouseEvent<HTMLDivElement>) {
    if (isMaximized || isMinimized) return;
    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: e.clientX - (window.innerWidth - position.x),
      y: e.clientY - (window.innerHeight - position.y),
    };
  }

  function handleSuggestionsPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const el = suggestionsRef.current;
    if (!el) return;

    suggestionsDragRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
      moved: false,
    };
    suppressSuggestionClickRef.current = false;
    el.style.cursor = "grabbing";
  }

  function stopSuggestionsDrag() {
    const el = suggestionsRef.current;
    suggestionsDragRef.current.active = false;
    suggestionsDragRef.current.pointerId = -1;
    if (el) {
      el.style.cursor = "grab";
    }
    window.setTimeout(() => {
      suppressSuggestionClickRef.current = false;
    }, 0);
  }

  function handleSuggestionsPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = suggestionsRef.current;
    const drag = suggestionsDragRef.current;
    if (!el || !drag.active) return;
    if (drag.pointerId !== -1 && drag.pointerId !== e.pointerId) return;

    if (e.pointerType === "mouse" && e.buttons === 0) {
      stopSuggestionsDrag();
      return;
    }

    const deltaX = e.clientX - drag.startX;
    const dragThreshold = e.pointerType === "touch" ? 18 : 8;
    if (Math.abs(deltaX) > dragThreshold) {
      drag.moved = true;
      suppressSuggestionClickRef.current = true;
    }

    el.scrollLeft = drag.scrollLeft - deltaX;
  }

  function handleSuggestionsPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const drag = suggestionsDragRef.current;
    if (!drag.active) return;
    if (drag.pointerId !== -1 && drag.pointerId !== e.pointerId) return;
    stopSuggestionsDrag();
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    function forceStopSuggestionsDrag() {
      if (!suggestionsDragRef.current.active) return;
      stopSuggestionsDrag();
    }

    function onVisibilityChange() {
      if (document.hidden) {
        forceStopSuggestionsDrag();
      }
    }

    window.addEventListener("pointerup", forceStopSuggestionsDrag);
    window.addEventListener("pointercancel", forceStopSuggestionsDrag);
    window.addEventListener("blur", forceStopSuggestionsDrag);
    document.addEventListener("mouseleave", forceStopSuggestionsDrag);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("pointerup", forceStopSuggestionsDrag);
      window.removeEventListener("pointercancel", forceStopSuggestionsDrag);
      window.removeEventListener("blur", forceStopSuggestionsDrag);
      document.removeEventListener("mouseleave", forceStopSuggestionsDrag);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!isDraggingRef.current) return;
      const nx = Math.max(
        8,
        Math.min(
          window.innerWidth - 8,
          window.innerWidth - (e.clientX - dragOffsetRef.current.x),
        ),
      );
      const ny = Math.max(
        8,
        Math.min(
          window.innerHeight - 8,
          window.innerHeight - (e.clientY - dragOffsetRef.current.y),
        ),
      );
      setPosition({ x: nx, y: ny });
    }
    function onUp() {
      isDraggingRef.current = false;
    }
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
    const msgs: Message[] = (data.turns || []).flatMap((t: any) => [
      { id: `${t.id}-q`, role: "user" as const, content: t.question },
      {
        id: `${t.id}-a`,
        turnId: t.id,
        role: "assistant" as const,
        content: t.answer,
        sources: Array.isArray(t.citations) ? t.citations : [],
        rating: typeof t.rating === "number" ? t.rating : null,
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
      if (!res.ok)
        throw new Error(data.message || "Gagal memproses pertanyaan");
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

      if (!res.ok) {
        throw new Error("Gagal menyimpan rating");
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.turnId === turnId
            ? {
                ...msg,
                rating,
              }
            : msg,
        ),
      );
    } catch {
      // Keep UX simple: ignore toast for now to avoid visual noise in chat flow.
    } finally {
      setRatingLoadingByTurn((prev) => ({ ...prev, [turnId]: false }));
    }
  }

  const PANEL_W = 380;
  const PANEL_H = 520;
  const HEADER_H = 46;

  const panelStyle: React.CSSProperties = isMaximized
    ? { position: "fixed", inset: 16, zIndex: 9999 }
    : {
        position: "fixed",
        right: position.x,
        bottom: position.y,
        width: PANEL_W,
        height: isMinimized ? HEADER_H : PANEL_H,
        zIndex: 9999,
        transition: "height 0.2s cubic-bezier(.4,0,.2,1)",
      };

  /* ── FAB (closed state) ── */
  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        title="Buka Chatbot"
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--primary)",
          color: "var(--on-primary)",
          border: "2px solid var(--primary-dark)",
          boxShadow: "4px 4px 0 var(--primary-dark)",
          cursor: "pointer",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform =
            "translate(-2px,-2px)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "6px 6px 0 var(--primary-dark)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "";
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "4px 4px 0 var(--primary-dark)";
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 26 }}>
          smart_toy
        </span>
      </button>
    );
  }

  return (
    <div style={panelStyle}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: "var(--bg-card)",
          border: "2px solid var(--primary)",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "5px 5px 0 var(--primary-dark)",
        }}
      >
        {/* ── HEADER ── */}
        <div
          onMouseDown={startDrag}
          style={{
            cursor: isMaximized ? "default" : "grab",
            background: "var(--primary)",
            color: "var(--on-primary)",
            padding: "0 0.75rem",
            height: HEADER_H,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            userSelect: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18 }}
            >
              smart_toy
            </span>
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 800,
                letterSpacing: "-0.01em",
              }}
            >
              UniLMS Chatbot
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            {!isMinimized && (
              <IconBtn
                icon="history"
                title={showHistory ? "Tutup Riwayat" : "Riwayat Chat"}
                onClick={() => setShowHistory((v) => !v)}
              />
            )}
            <IconBtn
              icon={isMinimized ? "expand_content" : "remove"}
              title={isMinimized ? "Perbesar" : "Kecilkan"}
              onClick={() => {
                setIsMinimized((v) => !v);
                if (isMaximized) setIsMaximized(false);
              }}
            />
            {!isMinimized && (
              <IconBtn
                icon={isMaximized ? "close_fullscreen" : "open_in_full"}
                title={isMaximized ? "Pulihkan" : "Perluas"}
                onClick={() => setIsMaximized((v) => !v)}
              />
            )}
            <IconBtn
              icon="close"
              title="Tutup"
              onClick={() => setIsOpen(false)}
            />
          </div>
        </div>

        {/* ── BODY (hidden when minimized) ── */}
        {!isMinimized && (
          <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
            {/* History side-drawer */}
            {showHistory && (
              <aside
                style={{
                  width: 145,
                  flexShrink: 0,
                  borderRight: "1px solid var(--border-primary)",
                  background: "var(--bg-dark)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "0.55rem 0.6rem",
                    borderBottom: "1px solid var(--border-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.6rem",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--text-dim)",
                    }}
                  >
                    Riwayat
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMessages([]);
                      setSessionId(null);
                    }}
                    title="Mulai sesi baru"
                    style={{
                      background: "transparent",
                      border: "1px solid var(--border-primary)",
                      cursor: "pointer",
                      borderRadius: 4,
                      padding: "1px 4px",
                      fontSize: "0.6rem",
                      color: "var(--text-dim)",
                    }}
                  >
                    + Baru
                  </button>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "0.4rem" }}>
                  {sessions.length === 0 ? (
                    <p
                      style={{
                        fontSize: "0.65rem",
                        color: "var(--text-dim)",
                        textAlign: "center",
                        marginTop: "0.75rem",
                      }}
                    >
                      Belum ada riwayat
                    </p>
                  ) : (
                    sessions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => void loadSession(item.id)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          background:
                            sessionId === item.id
                              ? "var(--primary-light)"
                              : "transparent",
                          border: "1px solid var(--border-primary)",
                          borderRadius: 6,
                          padding: "0.4rem 0.45rem",
                          marginBottom: "0.3rem",
                          cursor: "pointer",
                          fontSize: "0.68rem",
                          lineHeight: 1.35,
                          color: "var(--text-main)",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.title}
                        </div>
                        <div style={{ opacity: 0.6, fontSize: "0.6rem" }}>
                          {item.totalTurns} pesan
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </aside>
            )}

            {/* Main chat column */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                background: "var(--bg-dark)",
              }}
            >
              {/* Messages */}
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  padding: "0.75rem 0.7rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                }}
              >
                {messages.length === 0 && (
                  <div
                    style={{
                      margin: "auto",
                      textAlign: "center",
                      color: "var(--text-dim)",
                      fontSize: "0.78rem",
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: 32,
                        opacity: 0.4,
                        display: "block",
                        marginBottom: "0.4rem",
                      }}
                    >
                      chat_bubble
                    </span>
                    Tanyakan sesuatu tentang materi kuliah.
                    <br />
                    <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                      Geser kiri untuk rekomendasi pertanyaan ↑
                    </span>
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf:
                        msg.role === "user" ? "flex-end" : "flex-start",
                      maxWidth: "90%",
                    }}
                  >
                    <div
                      style={{
                        background:
                          msg.role === "user"
                            ? "var(--primary)"
                            : "var(--bg-card)",
                        color:
                          msg.role === "user"
                            ? "var(--on-primary)"
                            : "var(--text-main)",
                        border: "1.5px solid",
                        borderColor:
                          msg.role === "user"
                            ? "var(--primary-dark)"
                            : "var(--border-primary)",
                        borderRadius:
                          msg.role === "user"
                            ? "12px 12px 2px 12px"
                            : "12px 12px 12px 2px",
                        padding: "0.55rem 0.7rem",
                        fontSize: "0.8rem",
                        lineHeight: 1.5,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.content}
                    </div>
                    {msg.role === "assistant" &&
                      msg.sources &&
                      msg.sources.length > 0 && (
                        <div
                          style={{
                            marginTop: "0.4rem",
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.3rem",
                          }}
                        >
                          {msg.sources.slice(0, 4).map((src) => (
                            <Link
                              key={`${msg.id}-${src.id}`}
                              href={`/materials/${src.materialId}` as Route}
                              style={{
                                fontSize: "0.62rem",
                                padding: "0.15rem 0.5rem",
                                borderRadius: 999,
                                background: "var(--bg-card)",
                                border: "1px solid var(--border-primary)",
                                color: "var(--primary)",
                                textDecoration: "none",
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                              }}
                            >
                              📄 {src.module || src.title}
                            </Link>
                          ))}
                        </div>
                      )}

                    {msg.role === "assistant" && msg.turnId && (
                      <div
                        style={{
                          marginTop: "0.45rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.62rem",
                            color: "var(--text-dim)",
                          }}
                        >
                          Nilai jawaban:
                        </span>
                        {[1, 2, 3, 4, 5].map((value) => {
                          const active = (msg.rating ?? 0) >= value;
                          const loadingRate =
                            ratingLoadingByTurn[msg.turnId!] === true;

                          return (
                            <button
                              key={`${msg.id}-rate-${value}`}
                              type="button"
                              disabled={loadingRate}
                              onClick={() => void rateTurn(msg.turnId!, value)}
                              title={`Beri rating ${value}`}
                              style={{
                                border: "none",
                                background: "transparent",
                                cursor: loadingRate ? "wait" : "pointer",
                                padding: 0,
                                lineHeight: 1,
                                color: active
                                  ? "var(--secondary-brand)"
                                  : "var(--text-dim)",
                                opacity: loadingRate ? 0.65 : 1,
                              }}
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: 17 }}
                              >
                                star
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div
                    style={{
                      alignSelf: "flex-start",
                      display: "flex",
                      gap: "4px",
                      padding: "0.5rem 0.6rem",
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: "var(--primary)",
                          display: "inline-block",
                          animation: `bounce 1s ${i * 0.15}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions drawer (above input) */}
              {suggestions.length > 0 && (
                <div
                  style={{
                    flexShrink: 0,
                    borderTop: "1px solid var(--border-primary)",
                    background: "var(--bg-card)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowSuggestions((v) => !v)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.5rem",
                      padding: "0.45rem 0.6rem",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-main)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.65rem",
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "var(--text-dim)",
                      }}
                    >
                      Rekomendasi Pertanyaan
                    </span>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 18, color: "var(--text-dim)" }}
                    >
                      {showSuggestions ? "expand_less" : "expand_more"}
                    </span>
                  </button>

                  {showSuggestions && (
                    <div
                      ref={suggestionsRef}
                      className="chatbot-suggestions-track"
                      onPointerDown={handleSuggestionsPointerDown}
                      onPointerMove={handleSuggestionsPointerMove}
                      onPointerUp={handleSuggestionsPointerUp}
                      onPointerCancel={handleSuggestionsPointerUp}
                      style={{
                        overflowX: "auto",
                        overflowY: "hidden",
                        display: "flex",
                        gap: "0.35rem",
                        padding: "0 0.6rem 0.5rem 0.6rem",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        WebkitOverflowScrolling: "touch",
                        touchAction: "pan-x",
                        overscrollBehaviorX: "contain",
                        cursor: "grab",
                        userSelect: "none",
                      }}
                    >
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            if (suppressSuggestionClickRef.current) {
                              suppressSuggestionClickRef.current = false;
                              return;
                            }
                            setInput(s);
                          }}
                          style={{
                            flexShrink: 0,
                            whiteSpace: "nowrap",
                            fontSize: "0.65rem",
                            padding: "0.2rem 0.55rem",
                            borderRadius: 999,
                            background: "var(--bg-dark)",
                            border: "1px solid var(--border-primary)",
                            cursor: "pointer",
                            color: "var(--text-main)",
                            lineHeight: 1.5,
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void sendQuestion(input);
                }}
                style={{
                  flexShrink: 0,
                  padding: "0.5rem 0.6rem",
                  display: "flex",
                  gap: "0.4rem",
                  background: "var(--bg-card)",
                }}
              >
                <input
                  className="input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tulis pertanyaan..."
                  disabled={loading}
                  style={{ flex: 1, fontSize: "0.8rem", minWidth: 0 }}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  style={{
                    flexShrink: 0,
                    background:
                      input.trim() && !loading
                        ? "var(--primary)"
                        : "var(--bg-dark)",
                    color:
                      input.trim() && !loading
                        ? "var(--on-primary)"
                        : "var(--text-dim)",
                    border: "1.5px solid var(--border-primary)",
                    borderRadius: 8,
                    padding: "0 0.75rem",
                    cursor:
                      input.trim() && !loading ? "pointer" : "not-allowed",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    transition: "background 0.15s",
                    height: "100%",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 18, display: "block" }}
                  >
                    send
                  </span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }

        .chatbot-suggestions-track::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};
