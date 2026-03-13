import AdminShell from "@/components/AdminShell";

const tabs = [
  { label: "Semua Dokumen", active: true },
  { label: "Kebijakan" },
  { label: "Tutorial" },
  { label: "Teknis" },
  { label: "FAQ" },
  { label: "Statistik Chatbot" },
];

const docs = [
  {
    icon: "description",
    title: "Panduan Pendaftaran KRS Online 2024",
    category: "Tutorial",
    desc: "Langkah-langkah detail mengenai proses pengisian kartu rencana studi secara online.",
  },
  {
    icon: "gavel",
    title: "Kode Etik Mahasiswa & Dosen",
    category: "Kebijakan",
    desc: "Dokumen resmi mengenai standar perilaku, etika profesional, dan sanksi akademik.",
  },
  {
    icon: "vpn_key",
    title: "Konfigurasi VPN Kampus",
    category: "Teknis",
    desc: "Panduan teknis mengakses jurnal internasional dari luar jaringan kampus.",
  },
];

const faqs = [
  {
    q: "Bagaimana cara mereset password email institusi?",
    a: "Reset password dapat dilakukan melalui portal SSO https://sso.univ.ac.id atau menghubungi Helpdesk IT kampus di ext. 7001.",
  },
  {
    q: "Di mana saya bisa mengunduh template jurnal skripsi?",
    a: "",
  },
  {
    q: "Apakah layanan VPN kampus tersedia untuk alumni?",
    a: "",
  },
];

export default function AdminInsightsPage() {
  return (
    <AdminShell
      title="Pusat Pengetahuan & Referensi Akademik"
      subtitle="Temukan kebijakan universitas, tutorial terkini, dan dokumentasi operasional seluruh unit yang terorganisir."
    >
      {/* Tabs */}
      <div className="row" style={{ flexWrap: "wrap", gap: "0.4rem" }}>
        {tabs.map((tab) => (
          <button
            key={tab.label}
            className={tab.active ? "btn" : "btn-ghost"}
            style={{ padding: "0.45rem 1rem", fontSize: "0.8rem" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Document Cards */}
      <section className="grid-3">
        {docs.map((doc) => (
          <article key={doc.title} className="doc-card" style={{ display: "grid", gap: "0.75rem" }}>
            <div className="row" style={{ gap: "0.5rem" }}>
              <span
                className="material-symbols-outlined"
                style={{ color: "var(--primary)", fontSize: 20 }}
              >
                {doc.icon}
              </span>
              <span className="pill">{doc.category}</span>
            </div>
            <h3 style={{ fontSize: "1rem" }}>{doc.title}</h3>
            <p className="text-muted" style={{ fontSize: "0.85rem" }}>{doc.desc}</p>
            <button
              className="btn-ghost"
              type="button"
              style={{ width: "fit-content", fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
            >
              Baca Selengkapnya
            </button>
          </article>
        ))}
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
            <p className="stat-value">12,842</p>
          </article>
          <article className="stat-card">
            <p className="text-dim" style={{ fontSize: "0.85rem" }}>Rata-rata Respon</p>
            <p className="stat-value">1.2s</p>
          </article>
          <article className="stat-card">
            <p className="text-dim" style={{ fontSize: "0.85rem" }}>Jawaban dengan Sitasi</p>
            <p className="stat-value">94%</p>
          </article>
        </div>
      </section>

      {/* FAQ */}
      <section className="glass-panel" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <h3 className="title-lg">Pertanyaan Sering Diajukan (FAQ)</h3>
        <p className="text-muted" style={{ fontSize: "0.85rem" }}>
          Pertanyaan paling sering ditanyakan melalui chatbot akademik.
        </p>
        {faqs.map((faq) => (
          <article key={faq.q} className="faq-item" style={{ display: "grid", gap: "0.4rem" }}>
            <strong style={{ fontSize: "0.9rem" }}>{faq.q}</strong>
            {faq.a && (
              <p className="text-muted" style={{ fontSize: "0.85rem" }}>{faq.a}</p>
            )}
          </article>
        ))}
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
        <button className="btn" style={{ background: "#000", color: "var(--primary)", borderColor: "#000" }}>
          Hubungi Support Sekarang
        </button>
      </section>
    </AdminShell>
  );
}
