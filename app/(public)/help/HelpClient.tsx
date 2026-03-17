"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

const helpCategories = [
  {
    icon: "person",
    title: "Akun & Profil",
    desc: "Masalah login, ganti password, verifikasi email, dan pengaturan profil pengguna.",
    link: "Lihat Artikel →",
  },
  {
    icon: "build",
    title: "Masalah Teknis",
    desc: "Error sistem, kendala browser, aplikasi mobile, dan akses konten video pembelajaran.",
    link: "Lihat Artikel →",
  },
  {
    icon: "school",
    title: "Akademik",
    desc: "Cara pengumpulan tugas, kuis online, melihat nilai, dan interaksi di forum diskusi.",
    link: "Lihat Artikel →",
  },
  {
    icon: "payments",
    title: "Pembayaran",
    desc: "Informasi UKT, cicilan biaya, beasiswa, dan validasi bukti bayar otomatis.",
    link: "Lihat Artikel →",
  },
];

export default function HelpClient() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/faqs")
      .then((res) => res.json())
      .then((data) => {
        setFaqs(data.faqs || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <main
      className="app-shell"
      style={{ display: "grid", gap: "3.5rem", paddingBottom: "5rem" }}
    >
      {/* ===== HERO ===== */}
      <section className="help-hero">
        <h1>
          Apa yang bisa kami <span className="highlight">bantu?</span>
        </h1>
        <p>
          Cari panduan, tutorial, dan jawaban atas pertanyaan umum seputar
          sistem pembelajaran.
        </p>
        <div className="help-search-bar" style={{ position: "relative" }}>
          <span
            className="material-symbols-outlined"
            style={{
              position: "absolute",
              left: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 18,
              color: "var(--text-dim)",
              zIndex: 1,
            }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Cari bantuan (misal: cara reset password, unggah tugas)"
          />
          <button type="button">Cari</button>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section>
        <h2
          style={{
            fontSize: "1.4rem",
            fontWeight: 800,
            marginBottom: "1.25rem",
          }}
        >
          Kategori Bantuan
        </h2>
        <div className="help-categories">
          {helpCategories.map((cat) => (
            <div key={cat.title} className="help-cat-card">
              <div className="help-cat-icon">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 22 }}
                >
                  {cat.icon}
                </span>
              </div>
              <h3>{cat.title}</h3>
              <p>{cat.desc}</p>
              <span className="help-cat-link">{cat.link}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FAQ ACCORDION ===== */}
      <section>
        <h2 className="faq-section-title">Pertanyaan yang Sering Diajukan</h2>
        <p className="faq-section-subtitle">
          Temukan jawaban instan untuk kendala yang sering dialami mahasiswa.
        </p>

        {isLoading ? (
          <p style={{ textAlign: "center", color: "var(--text-dim)" }}>
            Memuat pertanyaan...
          </p>
        ) : faqs.length === 0 ? (
          <div className="faq-list">
            {/* Default FAQ if API empty */}
            {[
              {
                id: "d1",
                question: "Bagaimana cara reset password jika saya lupa?",
                answer:
                  'Anda dapat menekan tombol "Lupa Password" pada halaman login. Sistem akan mengirimkan link reset ke email institusi yang terdaftar. Pastikan cek folder spam jika tidak menemukannya di inbox.',
              },
              {
                id: "d2",
                question: "Kenapa saya tidak bisa mengunggah tugas PDF?",
                answer:
                  "Pastikan ukuran file tidak melebihi 10MB dan format yang didukung adalah PDF, DOCX, atau PPT. Coba gunakan browser versi terbaru.",
              },
              {
                id: "d3",
                question: "Kapan batas akhir pengisian KRS online?",
                answer:
                  "Batas pengisian KRS berbeda setiap semester. Silakan lihat kalender akademik di halaman utama atau hubungi bagian akademik.",
              },
            ].map((faq) => (
              <div
                key={faq.id}
                className={`faq-item ${openId === faq.id ? "open" : ""}`}
              >
                <button
                  className="faq-question"
                  onClick={() => toggleFaq(faq.id)}
                  type="button"
                >
                  {faq.question}
                  <span className="material-symbols-outlined">expand_more</span>
                </button>
                {openId === faq.id && (
                  <div className="faq-answer">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="faq-list">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className={`faq-item ${openId === faq.id ? "open" : ""}`}
              >
                <button
                  className="faq-question"
                  onClick={() => toggleFaq(faq.id)}
                  type="button"
                >
                  {faq.question}
                  <span className="material-symbols-outlined">expand_more</span>
                </button>
                {openId === faq.id && (
                  <div className="faq-answer">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="cta-green-banner">
        <h3>Masih butuh bantuan?</h3>
        <p>
          Tim dukungan teknis kami siap membantu Anda 24/7. Hubungi kami melalui
          kanal komunikasi resmi di bawah ini.
        </p>
        <div className="cta-buttons">
          <a
            href={`mailto:${SITE_CONFIG.supportEmail}`}
            className="btn"
            style={{
              padding: "0.7rem 1.75rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18 }}
            >
              mail
            </span>
            Kirim Email ke {SITE_CONFIG.name}
          </a>
          <a
            href="tel:+620000000000"
            className="btn-ghost"
            style={{
              padding: "0.7rem 1.75rem",
              border: "1px solid var(--border-primary-strong)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18 }}
            >
              call
            </span>
            Hubungi Hotline
          </a>
        </div>
      </section>
    </main>
  );
}
