"use client";

import { FormEvent, useMemo, useState } from "react";
import AppTopbar from "@/components/AppTopbar";

type Source = {
  id: string;
  title: string;
  module: string;
  page: string | null;
  excerpt: string;
};

type Turn = {
  id: string;
  question: string;
  answer: string;
  sources: Source[];
  rating?: number;
  responseTimeMs?: number;
};

export default function ChatbotPage() {
  const [question, setQuestion] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const avgRating = useMemo(() => {
    const rated = turns.filter((item) => typeof item.rating === "number");
    if (rated.length === 0) return "-";
    const score =
      rated.reduce((sum, item) => sum + (item.rating ?? 0), 0) / rated.length;
    return score.toFixed(2);
  }, [turns]);

  async function askQuestion(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!question.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/chat/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, sessionId: sessionId ?? undefined }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to get chatbot response");
      }

      setSessionId(data.sessionId);
      setTurns((prev) => [
        ...prev,
        {
          id: data.turnId,
          question: data.question,
          answer: data.answer,
          sources: data.sources,
          responseTimeMs: data.responseTimeMs,
        },
      ]);
      setQuestion("");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unexpected error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function rateAnswer(turnId: string, rating: number) {
    await fetch(`/api/chat/turns/${turnId}/rating`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating }),
    });

    setTurns((prev) =>
      prev.map((item) => (item.id === turnId ? { ...item, rating } : item)),
    );
  }

  return (
    <>
      <AppTopbar title="Asisten AI" />
      <main className="app-shell" style={{ display: "grid", gap: "2rem" }}>
        {/* Hero */}
        <section className="neo-card hero-card" style={{ display: "grid", gap: "0.75rem" }}>
          <span className="eyebrow">Asisten Akademik</span>
          <h1 className="title-lg">
            Tanya Materi Kuliah dengan Referensi Valid
          </h1>
          <p className="text-muted">
            Sistem akan menjawab berdasarkan materi internal dan menampilkan
            citation modul/halaman.
          </p>
        </section>

        <div className="grid-2" style={{ alignItems: "start" }}>
          {/* Chat Input */}
          <div className="neo-card" style={{ padding: "1.5rem" }}>
            <h2 className="title-lg" style={{ marginBottom: "1rem" }}>
              Jendela Chat
            </h2>
            <form onSubmit={askQuestion} style={{ display: "grid", gap: "1rem" }}>
              <textarea
                className="textarea"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
                placeholder="Contoh: jelaskan perbedaan microservices dan monolith"
              />
              <div className="row" style={{ justifyContent: "flex-end" }}>
                <button className="btn" type="submit" disabled={loading}>
                  {loading ? "Memproses..." : "Kirim Pertanyaan"}
                </button>
              </div>
            </form>
            {error && (
              <p style={{ color: "var(--rose)", marginTop: "0.75rem", fontSize: "0.9rem" }}>
                {error}
              </p>
            )}
          </div>

          {/* Session Summary */}
          <aside style={{ display: "grid", gap: "1rem", alignContent: "start" }}>
            <article className="stat-card">
              <div className="row" style={{ gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--primary)" }}>
                  chat
                </span>
                <p className="text-dim" style={{ fontSize: "0.85rem" }}>Total pertanyaan</p>
              </div>
              <p className="stat-value">{turns.length}</p>
            </article>
            <article className="stat-card">
              <div className="row" style={{ gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--primary)" }}>
                  star
                </span>
                <p className="text-dim" style={{ fontSize: "0.85rem" }}>Rata-rata rating</p>
              </div>
              <p className="stat-value">{avgRating}</p>
            </article>
            <article className="stat-card">
              <div className="row" style={{ gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--primary)" }}>
                  key
                </span>
                <p className="text-dim" style={{ fontSize: "0.85rem" }}>Session ID</p>
              </div>
              <p style={{ marginTop: "0.5rem", wordBreak: "break-word", fontSize: "0.85rem" }}>
                {sessionId ?? "-"}
              </p>
            </article>
          </aside>
        </div>

        {/* Chat History */}
        <section className="neo-card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
          <h2 className="title-lg">Histori Percakapan</h2>
          {turns.length === 0 && (
            <p className="text-muted">
              Belum ada percakapan. Mulai dengan pertanyaan pertama Anda.
            </p>
          )}

          <div className="chat-stream">
            {turns.map((turn, idx) => (
              <article key={turn.id} style={{ display: "grid", gap: "0.75rem" }}>
                <div className="bubble user">
                  <p>
                    <strong>Q{idx + 1}.</strong> {turn.question}
                  </p>
                </div>

                <div className="bubble">
                  <p style={{ whiteSpace: "pre-wrap" }}>{turn.answer}</p>
                  <p className="text-dim" style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
                    Response time: {turn.responseTimeMs ?? "-"} ms
                  </p>

                  <div style={{ marginTop: "0.75rem" }}>
                    <p className="text-dim" style={{ marginBottom: "0.35rem", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Referensi Materi
                    </p>
                    <div className="row" style={{ flexWrap: "wrap" }}>
                      {turn.sources.map((source) => (
                        <span key={`${turn.id}-${source.id}`} className="pill">
                          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>link</span>
                          {source.module} - {source.title}
                          {source.page ? ` p.${source.page}` : ""}
                        </span>
                      ))}
                      {turn.sources.length === 0 && (
                        <span className="pill">Tidak ada citation</span>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: "0.75rem" }}>
                    <p className="text-dim" style={{ marginBottom: "0.35rem", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Rating jawaban
                    </p>
                    <div className="rating-row">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={`${turn.id}-rating-${score}`}
                          type="button"
                          className={`rating-btn ${turn.rating === score ? "active" : ""}`}
                          onClick={() => rateAnswer(turn.id, score)}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
