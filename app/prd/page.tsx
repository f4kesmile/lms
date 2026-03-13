import AppTopbar from "@/components/AppTopbar";

export default function PrdPage() {
  return (
    <>
      <AppTopbar title="EduNexus PRD" />
      <main
        className="app-shell section-gap"
        style={{ paddingTop: "1rem", paddingBottom: "2rem" }}
      >
        <section
          className="glass-panel section-gap"
          style={{ padding: "1rem" }}
        >
          <span className="eyebrow">Product Requirements Document</span>
          <h1 className="title-lg">EduNexus LMS + Academic AI Assistant</h1>
          <p className="text-muted">
            Ringkasan requirement produk berdasarkan dokumen Stitch: portal
            pembelajaran terpadu dengan chatbot akademik, knowledge base, RBAC,
            dan dashboard analitik.
          </p>
        </section>

        <section className="grid-2">
          <article className="doc-card section-gap">
            <h2>Tujuan Produk</h2>
            <ul className="clean-list">
              <li>Menyatukan alur belajar mahasiswa, dosen, dan admin.</li>
              <li>
                Meningkatkan akses informasi lewat chatbot berbasis sitasi.
              </li>
              <li>
                Menyediakan monitoring kualitas jawaban AI secara real-time.
              </li>
            </ul>
          </article>

          <article className="doc-card section-gap">
            <h2>Ruang Lingkup</h2>
            <ul className="clean-list">
              <li>Registrasi dan onboarding akun.</li>
              <li>Dashboard mahasiswa, admin, dan dosen.</li>
              <li>Knowledge base admin + statistik chatbot.</li>
              <li>Manajemen pengguna berbasis RBAC.</li>
            </ul>
          </article>
        </section>

        <section
          className="glass-panel section-gap"
          style={{ padding: "1rem" }}
        >
          <h2 className="title-lg">Rute Implementasi UI</h2>
          <div className="row" style={{ flexWrap: "wrap" }}>
            <a className="btn-ghost" href="/register">
              /register
            </a>
            <a className="btn-ghost" href="/admin/dashboard">
              /admin/dashboard
            </a>
            <a className="btn-ghost" href="/student">
              /student
            </a>
            <a className="btn-ghost" href="/courses/rpl-lanjut">
              /courses/rpl-lanjut
            </a>
            <a className="btn-ghost" href="/admin/users">
              /admin/users
            </a>
            <a className="btn-ghost" href="/chat/widget">
              /chat/widget
            </a>
            <a className="btn-ghost" href="/chat/ai">
              /chat/ai
            </a>
            <a className="btn-ghost" href="/admin/insights">
              /admin/insights
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
