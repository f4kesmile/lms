import AppTopbar from "@/components/AppTopbar";

export default function HomePage() {
  return (
    <>
      <AppTopbar title="EduNexus Portal" />

      <main className="app-shell" style={{ display: "grid", gap: "2rem" }}>
        {/* Hero */}
        <section className="neo-card hero-card" style={{ display: "grid", gap: "1.25rem" }}>
          <span className="eyebrow">UI Full Stitch</span>
          <h1 className="title-xl">
            Ecosystem LMS <span className="accent">Siap Pakai</span>
          </h1>
          <p className="text-muted" style={{ maxWidth: 700, fontSize: "1.05rem" }}>
            Semua screen utama dari project Stitch telah diterapkan ke routing
            Next.js: registrasi, dashboard admin, dashboard mahasiswa, detail
            kursus, manajemen pengguna, chatbot widget, chat AI, insights, dan
            PRD.
          </p>
          <div className="row" style={{ flexWrap: "wrap" }}>
            <a className="btn" href="/register">
              Mulai dari Halaman Daftar
            </a>
            <a className="btn-ghost" href="/prd">
              Lihat PRD
            </a>
          </div>
        </section>

        {/* Stats */}
        <section className="grid-4">
          <article className="stat-card">
            <div className="row" style={{ gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--primary)" }}>
                web
              </span>
              <p className="text-dim" style={{ fontSize: "0.8rem" }}>Screen Terpasang</p>
            </div>
            <p className="stat-value">9</p>
            <span className="pill">Sesuai export Stitch</span>
          </article>
          <article className="stat-card">
            <div className="row" style={{ gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--primary)" }}>
                bolt
              </span>
              <p className="text-dim" style={{ fontSize: "0.8rem" }}>Halaman Dinamis</p>
            </div>
            <p className="stat-value">3</p>
            <span className="pill">Chatbot + Knowledge + Stats</span>
          </article>
          <article className="stat-card">
            <div className="row" style={{ gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--primary)" }}>
                group
              </span>
              <p className="text-dim" style={{ fontSize: "0.8rem" }}>Role UI</p>
            </div>
            <p className="stat-value">3</p>
            <span className="pill">Admin, Dosen, Mahasiswa</span>
          </article>
          <article className="stat-card">
            <div className="row" style={{ gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--primary)" }}>
                palette
              </span>
              <p className="text-dim" style={{ fontSize: "0.8rem" }}>Tema</p>
            </div>
            <p className="stat-value" style={{ fontSize: "1.4rem" }}>Bottle Green</p>
            <span className="pill">Neo-brutalism</span>
          </article>
        </section>

        {/* Navigation Cards */}
        <section className="grid-3">
          <article className="content-card" style={{ display: "grid", gap: "0.75rem" }}>
            <h2 className="title-lg">User Flow</h2>
            <p className="text-muted" style={{ fontSize: "0.9rem" }}>
              Alur pelajar dari registrasi ke dashboard dan kursus.
            </p>
            <div className="row" style={{ flexWrap: "wrap" }}>
              <a className="btn-ghost" href="/register" style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}>Register</a>
              <a className="btn-ghost" href="/student" style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}>Student Home</a>
              <a className="btn-ghost" href="/courses/rpl-lanjut" style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}>Detail Kursus</a>
            </div>
          </article>

          <article className="content-card" style={{ display: "grid", gap: "0.75rem" }}>
            <h2 className="title-lg">AI Experience</h2>
            <p className="text-muted" style={{ fontSize: "0.9rem" }}>
              Versi widget, versi demo chat, dan versi dinamis dengan API.
            </p>
            <div className="row" style={{ flexWrap: "wrap" }}>
              <a className="btn-ghost" href="/chat/widget" style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}>Widget</a>
              <a className="btn-ghost" href="/chat/ai" style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}>Demo AI</a>
              <a className="btn-ghost" href="/chatbot" style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}>API Chatbot</a>
            </div>
          </article>

          <article className="content-card" style={{ display: "grid", gap: "0.75rem" }}>
            <h2 className="title-lg">Admin Suite</h2>
            <p className="text-muted" style={{ fontSize: "0.9rem" }}>
              Dashboard, users RBAC, knowledge base, statistik, dan insights.
            </p>
            <div className="row" style={{ flexWrap: "wrap" }}>
              <a className="btn-ghost" href="/admin/dashboard" style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}>Dashboard</a>
              <a className="btn-ghost" href="/admin/users" style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}>Users</a>
              <a className="btn-ghost" href="/admin/knowledge" style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}>Knowledge</a>
              <a className="btn-ghost" href="/admin/stats" style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}>Statistik</a>
              <a className="btn-ghost" href="/admin/insights" style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}>Insights</a>
            </div>
          </article>
        </section>
      </main>
    </>
  );
}
