"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { AlertTriangle, BarChart3 } from "lucide-react";

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

const statIcons = [
  "library_books",
  "forum",
  "quiz",
  "star",
  "format_quote",
  "speed",
];

export default function AdminStatsPage() {
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
      <AdminLayout
        title="Statistik Penggunaan Chatbot"
      >
        <EmptyState
          icon={AlertTriangle}
          title="Gagal memuat statistik"
          description={error}
        />
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout
        title="Statistik Penggunaan Chatbot"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <Card key={`stats-skeleton-${index}`} className="p-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="mt-4 h-8 w-24" />
              </Card>
            ))}
        </div>
      </AdminLayout>
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
    <AdminLayout
      title="Statistik Penggunaan Chatbot"
    >
      <section className="admin-grid-3">
        {statItems.map((item, i) => (
          <article className="stat-card" key={item.title}>
            <div
              className="row"
              style={{ gap: "0.75rem", marginBottom: "0.5rem" }}
            >
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
                <span className="material-symbols-outlined">
                  {statIcons[i]}
                </span>
              </div>
              <p className="text-dim" style={{ fontSize: "0.85rem" }}>
                {item.title}
              </p>
            </div>
            <p className="stat-value">{item.value}</p>
          </article>
        ))}
      </section>

      <section
        className="neo-card"
        style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}
      >
        <h2 className="title-lg">Target Uji</h2>
        <div className="grid-3">
          <div className="doc-card">
            <p
              className="text-dim"
              style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}
            >
              Answer Relevance
            </p>
            <p style={{ fontWeight: 700 }}>{stats.target.answerRelevance}</p>
          </div>
          <div className="doc-card">
            <p
              className="text-dim"
              style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}
            >
              Citation
            </p>
            <p style={{ fontWeight: 700 }}>{stats.target.citation}</p>
          </div>
          <div className="doc-card">
            <p
              className="text-dim"
              style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}
            >
              Response Time
            </p>
            <p style={{ fontWeight: 700 }}>{stats.target.responseTime}</p>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <EmptyState
          icon={BarChart3}
          title="Insight lanjutan segera hadir"
          description="Kami sedang menyiapkan visualisasi tren mingguan dan perbandingan lintas periode untuk analitik chatbot."
          className="min-h-40"
        />
      </section>
    </AdminLayout>
  );
}
