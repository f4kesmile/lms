"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Don't show floating widget on the main chatbot page to avoid redundancy
  if (pathname === "/chatbot") {
    return null;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg.content }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          { id: data.turnId, role: "assistant", content: data.answer },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Maaf, terjadi kesalahan saat menghubungi asisten.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Koneksi terputus.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      {isOpen && (
        <div
          className="neo-card"
          style={{
            width: 340,
            height: 480,
            marginBottom: "1rem",
            display: "flex",
            flexDirection: "column",
            background: "var(--bg-card)",
            boxShadow: "var(--neo-shadow-hover)",
            overflow: "hidden",
            padding: 0, // overriding base card padding for custom header
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "var(--primary)",
              color: "#000",
              padding: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "2px solid var(--border-primary)",
            }}
          >
            <div className="row">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20 }}
              >
                smart_toy
              </span>
              <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                UniLMS Asisten
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#000",
                display: "flex",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20 }}
              >
                close
              </span>
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              background: "var(--bg-dark)",
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: "var(--text-dim)",
                  marginTop: "2rem",
                  fontSize: "0.85rem",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 32,
                    marginBottom: "0.5rem",
                    color: "var(--primary)",
                  }}
                >
                  waving_hand
                </span>
                <p>Halo! Ada yang bisa saya bantu terkait perkuliahan Anda?</p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  background:
                    msg.role === "user" ? "var(--primary)" : "var(--bg-card)",
                  color: msg.role === "user" ? "#000" : "var(--text-main)",
                  border: "2px solid",
                  borderColor:
                    msg.role === "user"
                      ? "var(--primary)"
                      : "var(--border-primary-strong)",
                  padding: "0.6rem 0.85rem",
                  borderRadius: "var(--radius-md)",
                  borderBottomRightRadius:
                    msg.role === "user" ? 0 : "var(--radius-md)",
                  borderBottomLeftRadius:
                    msg.role === "assistant" ? 0 : "var(--radius-md)",
                  maxWidth: "85%",
                  fontSize: "0.85rem",
                  lineHeight: 1.4,
                  boxShadow: "2px 2px 0px 0px rgba(0,0,0,0.1)",
                }}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "var(--bg-card)",
                  border: "2px solid var(--border-primary)",
                  padding: "0.5rem 0.8rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.8rem",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 16, animation: "spin 2s linear infinite" }}
                >
                  sync
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            style={{
              display: "flex",
              padding: "0.75rem",
              borderTop: "2px solid var(--border-primary)",
              background: "var(--bg-card)",
              gap: "0.5rem",
            }}
          >
            <input
              type="text"
              className="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya sesuatu..."
              style={{ fontSize: "0.85rem", padding: "0.6rem", flex: 1 }}
              disabled={loading}
            />
            <Button
              type="submit"
              size="sm"
              style={{ padding: "0.6rem", minWidth: "auto" }}
              disabled={loading || !input.trim()}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                send
              </span>
            </Button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "var(--primary)",
          color: "#000",
          border: "2px solid var(--primary-dark)",
          boxShadow: "var(--neo-shadow)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
          {isOpen ? "close" : "smart_toy"}
        </span>
      </button>
    </div>
  );
};
