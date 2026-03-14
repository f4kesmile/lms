"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { formatDate } from "@/lib/utils";

type Material = {
  id: string;
  title: string;
  module: string;
  page: string | null;
  createdAt: string;
};

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

type ChatStats = {
  totalTurns: number;
  fastResponseRate: number;
  citationCoverage: number;
};

export default function AdminInsightsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [chatStats, setChatStats] = useState<ChatStats | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    Promise.all([
      fetch("/api/kb/materials"),
      fetch("/api/faqs"),
      fetch("/api/chat/stats"),
    ])
      .then(async ([matRes, faqRes, statsRes]) => {
        if (matRes.ok) {
          const matData = await matRes.json();
          setMaterials(matData.materials ?? []);
        }
        if (faqRes.ok) {
          const faqData = await faqRes.json();
          setFaqs(faqData.faqs ?? []);
        }
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setChatStats({
            totalTurns: statsData.totalTurns ?? 0,
            fastResponseRate: statsData.fastResponseRate ?? 0,
            citationCoverage: statsData.citationCoverage ?? 0,
          });
        }
      })
      .catch(() => {
        // Silent fail for non-critical data
      });
  }, []);

  const uniqueModules = Array.from(new Set(materials.map((m) => m.module)));

  const tabs = [
    { key: "all", label: "Semua Dokumen" },
    ...uniqueModules.map((mod) => ({ key: mod, label: mod })),
  ];

  const filteredMaterials =
    activeTab === "all"
      ? materials
      : materials.filter((m) => m.module === activeTab);

  const avgResponseTime = chatStats
    ? chatStats.fastResponseRate > 0
      ? "< 3s"
      : "> 3s"
    : "-";

  return (
    <AdminLayout
      title="Pusat Pengetahuan & Referensi Akademik"
      subtitle="Temukan materi perkuliahan, FAQ, dan dokumentasi operasional yang terorganisir."
    >
      {/* Tabs */}
      <div className="row" style={{ flexWrap: "wrap", gap: "0.4rem" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? "btn" : "btn-ghost"}
            style={{ padding: "0.45rem 1rem", fontSize: "0.8rem" }}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Document Cards */}
      <section className="grid-3">
        {filteredMaterials.length > 0 ? (
          filteredMaterials.map((doc) => (
            <article key={doc.id} className="doc-card" style={{ display: "grid", gap: "0.75rem" }}>
              <div className="row" style={{ gap: "0.5rem" }}>
                <span
                  className="material-symbols-outlined"
                  style={{ color: "var(--primary)", fontSize: 20 }}
                >
                  description
                </span>
                <span className="pill">{doc.module}</span>
              </div>
              <h3 style={{ fontSize: "1rem" }}>{doc.title}</h3>
              <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                {doc.page ? `Halaman: ${doc.page}` : "Materi lengkap"}
              </p>
              <p className="text-dim" style={{ fontSize: "0.75rem" }}>
                Ditambahkan: {formatDate(doc.createdAt)}
              </p>
            </article>
          ))
        ) : (
          <article className="doc-card" style={{ display: "grid", gap: "0.75rem", gridColumn: "1 / -1" }}>
            <div className="row" style={{ gap: "0.5rem" }}>
              <span
                className="material-symbols-outlined"
                style={{ color: "var(--text-dim)", fontSize: 20 }}
              >
                folder_off
              </span>
            </div>
            <h3 style={{ fontSize: "1rem" }}>Belum Ada Dokumen</h3>
            <p className="text-muted" style={{ fontSize: "0.85rem" }}>
              Tambahkan materi melalui halaman Knowledge Base.
            </p>
          </article>
        )}
      </section>

      {/* Stats Row */}
      <section>
        <h2 className="title-lg" style={{ marginBottom: "1rem" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, verticalAlign: "middle", marginRight: "0.4rem", color: "var(--primary)" }}>
            analytics
          </span>
          Statistik Penggunaan Chatbot
        </h2>
        <div className="admin-grid-3">
          <article className="stat-card">
            <p className="text-dim" style={{ fontSize: "0.85rem" }}>Total Pertanyaan</p>
            <p className="stat-value">{chatStats?.totalTurns.toLocaleString() ?? "-"}</p>
          </article>
          <article className="stat-card">
            <p className="text-dim" style={{ fontSize: "0.85rem" }}>Rata-rata Respon</p>
            <p className="stat-value">{avgResponseTime}</p>
          </article>
          <article className="stat-card">
            <p className="text-dim" style={{ fontSize: "0.85rem" }}>Jawaban dengan Sitasi</p>
            <p className="stat-value">{chatStats ? `${chatStats.citationCoverage}%` : "-"}</p>
          </article>
        </div>
      </section>

      {/* FAQ */}
      <section className="glass-panel" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <h3 className="title-lg">Pertanyaan Sering Diajukan (FAQ)</h3>
        <p className="text-muted" style={{ fontSize: "0.85rem" }}>
          Pertanyaan dan jawaban yang sering ditanyakan.
        </p>
        {faqs.length > 0 ? (
          faqs.map((faq) => (
            <article key={faq.id} className="faq-item" style={{ display: "grid", gap: "0.4rem" }}>
              <strong style={{ fontSize: "0.9rem" }}>{faq.question}</strong>
              {faq.answer && (
                <p className="text-muted" style={{ fontSize: "0.85rem" }}>{faq.answer}</p>
              )}
              <span className="pill" style={{ width: "fit-content", fontSize: "0.7rem" }}>{faq.category}</span>
            </article>
          ))
        ) : (
          <p className="text-muted" style={{ fontSize: "0.85rem" }}>
            Belum ada FAQ tersedia. Admin dapat menambahkan melalui API.
          </p>
        )}
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <h3 className="title-lg" style={{ color: "#000", marginBottom: "0.5rem" }}>
          Masih Ingin Bertanya?
        </h3>
        <p style={{ marginBottom: "1.25rem" }}>
          Jika tidak menemukan jawaban, tanyakan ke AI Assistant kami untuk
          respons instan.
        </p>
        <a
          className="btn"
          href="/chatbot"
          style={{ background: "#000", color: "var(--primary)", borderColor: "#000" }}
        >
          Hubungi AI Assistant
        </a>
      </section>
    </AdminLayout>
  );
}
