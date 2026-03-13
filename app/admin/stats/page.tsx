"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";

type Stats = {
  totalMaterials: number;
  totalSessions: number;
  totalTurns: number;
  avgRating: number | null;
  ratedTurns: number;
  citationCoverage: number;
  fastResponseRate: number;
  target: {
    answerRelevance: string;
    citation: string;
    responseTime: string;
  };
};

const statIcons = ["library_books", "forum", "quiz", "star", "format_quote", "speed"];

export default function ChatbotStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/chat/stats")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal memuat statistik");
        setStats(data);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error"));
  }, []);

  if (error) {
    return (
      <AdminShell title="Statistik Penggunaan Chatbot" subtitle="Monitoring metrik evaluasi sistem RAG ringan.">
        <p style={{ color: "var(--rose)" }}>{error}</p>
      </AdminShell>
    );
  }

  if (!stats) {
    return (
      <AdminShell title="Statistik Penggunaan Chatbot" subtitle="Monitoring metrik evaluasi sistem RAG ringan.">
        <p className="text-muted">Loading...</p>
      </AdminShell>
    );
  }

  const statItems = [
    { title: "Total Materi", value: stats.totalMaterials },
    { title: "Total Session Chat", value: stats.totalSessions },
    { title: "Total Pertanyaan", value: stats.totalTurns },
    { title: "Average Rating", value: stats.avgRating ?? "-" },
    { title: "Citation Coverage", value: `${stats.citationCoverage}%` },
    { title: "Response < 3 detik", value: `${stats.fastResponseRate}%` },
  ];

  return (
    <AdminShell
      title="Statistik Penggunaan Chatbot"
      subtitle="Monitoring metrik evaluasi sistem RAG ringan."
    >
      <section className="admin-grid-3">
        {statItems.map((item, i) => (
          <article className="stat-card" key={item.title}>
            <div className="row" style={{ gap: "0.75rem", marginBottom: "0.5rem" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(190,239,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary)",
                }}
              >
                <span className="material-symbols-outlined">{statIcons[i]}</span>
              </div>
              <p className="text-dim" style={{ fontSize: "0.85rem" }}>{item.title}</p>
            </div>
            <p className="stat-value">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="neo-card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <h2 className="title-lg">Target Uji</h2>
        <div className="grid-3">
          <div className="doc-card">
            <p className="text-dim" style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}>Answer Relevance</p>
            <p style={{ fontWeight: 700 }}>{stats.target.answerRelevance}</p>
          </div>
          <div className="doc-card">
            <p className="text-dim" style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}>Citation</p>
            <p style={{ fontWeight: 700 }}>{stats.target.citation}</p>
          </div>
          <div className="doc-card">
            <p className="text-dim" style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}>Response Time</p>
            <p style={{ fontWeight: 700 }}>{stats.target.responseTime}</p>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
