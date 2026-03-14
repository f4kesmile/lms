import { Navbar } from "@/components/layout/Navbar";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="app-shell" style={{ display: "grid", gap: "3rem", paddingBottom: "5rem" }}>
        {/* Header */}
        <section className="glass-panel" style={{ padding: "3rem 2rem", textAlign: "center", background: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
          <h1 className="title-xl" style={{ color: "var(--text-main)", marginBottom: "1rem" }}>
            Tentang <span className="accent" style={{ color: "var(--primary)", borderColor: "var(--primary)" }}>UniLMS</span>
          </h1>
          <p className="text-muted" style={{ maxWidth: 700, margin: "0 auto", fontSize: "1.1rem", lineHeight: 1.6 }}>
            Kami hadir untuk menjembatani batasan ruang dan waktu dalam pendidikan. UniLMS adalah platform pembelajaran cerdas yang memadukan keahlian akademik dengan kecanggihan kecerdasan buatan.
          </p>
        </section>

        {/* Visi Misi */}
        <section className="grid-2" style={{ gap: "2rem" }}>
          <article className="content-card" style={{ background: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
            <div className="row" style={{ marginBottom: "1rem" }}>
              <div style={{ width: 44, height: 44, borderRadius: 8, background: "rgba(12, 163, 127, 0.15)", color: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>visibility</span>
              </div>
              <h2 className="title-lg">Visi Kami</h2>
            </div>
            <p className="text-muted" style={{ lineHeight: 1.7 }}>
              Menjadi pionir platform pendidikan jarak jauh terdepan di Asia Tenggara yang paling mudah diakses, adaptif, dan responsif terhadap kebutuhan belajar setiap individu melalui teknologi AI.
            </p>
          </article>

          <article className="content-card" style={{ background: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
            <div className="row" style={{ marginBottom: "1rem" }}>
              <div style={{ width: 44, height: 44, borderRadius: 8, background: "rgba(12, 163, 127, 0.15)", color: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>flag</span>
              </div>
              <h2 className="title-lg">Misi Utama</h2>
            </div>
            <ul className="text-muted" style={{ lineHeight: 1.7, paddingLeft: "1.5rem" }}>
              <li>Menyediakan infrastruktur digital yang inklusif untuk kolaborasi antara dosen dan mahasiswa.</li>
              <li>Mengotomatisasi pencarian litelatur akademik menggunakan asisten kecerdasan buatan.</li>
              <li>Menjaga ekosistem belajar yang terukur melalui wawasan analitik mendalam.</li>
            </ul>
          </article>
        </section>

        {/* Tim */}
        <section style={{ textAlign: "center", marginTop: "2rem" }}>
          <h2 className="title-lg" style={{ display: "inline-block", borderBottom: "4px solid var(--primary-dark)", paddingBottom: "0.2rem", marginBottom: "2rem" }}>
            Tim Pendiri
          </h2>
          <div className="grid-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="content-card" style={{ background: "var(--bg-card)", borderColor: "var(--border-primary)", padding: "2rem 1rem" }}>
                <div style={{ 
                  width: 80, height: 80, borderRadius: "50%", 
                  background: "var(--primary-dark)", margin: "0 auto 1rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: "1.5rem", fontWeight: 700 
                }}>
                  {item === 1 ? 'A' : item === 2 ? 'B' : 'C'}
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Inovator {item}</h3>
                <p className="text-dim" style={{ fontSize: "0.85rem" }}>Co-founder & Edu-Tech Lead</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
