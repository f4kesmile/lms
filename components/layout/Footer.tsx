import Link from "next/link";

export function Footer() {
  return (
    <footer className="public-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link href="/" className="brand" style={{ marginBottom: "1rem" }}>
              <div className="brand-icon" style={{ borderRadius: 6, width: 28, height: 28, transform: "rotate(45deg)", background: "var(--primary)", position: "relative" }}>
                <div style={{ position: "absolute", top: 5, left: 5, right: 5, bottom: 5, background: "var(--bg-dark)", transform: "rotate(-45deg)" }} />
              </div>
              <span className="brand-text" style={{ color: "var(--text-main)", fontSize: "1.2rem" }}>
                Uni<span style={{ color: "var(--text-soft)", fontWeight: 300 }}>Course</span>
              </span>
            </Link>
            <p className="footer-desc">
              Platform pembelajaran terbuka yang menghubungkan mahasiswa dengan pengetahuan terbaik dunia. Belajar tanpa batas, kapan saja, di mana saja.
            </p>
            <div className="footer-socials">
              <a href="#" aria-label="WhatsApp" className="footer-social-btn">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chat</span>
              </a>
              <a href="#" aria-label="Share" className="footer-social-btn">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>share</span>
              </a>
            </div>
          </div>

          {/* Navigasi */}
          <div className="footer-col">
            <h4 className="footer-heading">Navigasi</h4>
            <Link href="/">Beranda</Link>
            <Link href="/courses">Daftar Kursus</Link>
            <Link href="/about">Tentang Kami</Link>
          </div>

          {/* Tentang Kami */}
          <div className="footer-col">
            <h4 className="footer-heading">Tentang Kami</h4>
            <Link href="/about">Visi & Misi</Link>
            <a href="#">Tim Pengajar</a>
            <a href="#">Kemitraan</a>
          </div>

          {/* Bantuan */}
          <div className="footer-col">
            <h4 className="footer-heading">Bantuan</h4>
            <Link href="/help">Pusat Bantuan</Link>
            <Link href="/help">FAQ</Link>
            <a href="#">Kebijakan Privasi</a>
            <Link href="/chatbot">Hubungi Kami</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 UniCourse University. Seluruh hak cipta dilindungi undang-undang.</p>
        </div>
      </div>
    </footer>
  );
}
