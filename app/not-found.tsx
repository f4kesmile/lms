import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="app-shell"
      style={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}
    >
      <section
        className="neo-card"
        style={{
          width: "min(760px, 100%)",
          padding: "2rem",
          display: "grid",
          gap: "1.5rem",
          textAlign: "center",
          background:
            "linear-gradient(180deg, var(--bg-card), color-mix(in srgb, var(--bg-card) 76%, var(--surface-secondary-soft)))",
        }}
      >
        <div
          style={{
            width: 92,
            height: 92,
            margin: "0 auto",
            borderRadius: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--surface-secondary-soft)",
            color: "var(--secondary-brand)",
            border:
              "2px solid color-mix(in srgb, var(--secondary-brand) 38%, transparent)",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 44 }}>
            search_off
          </span>
        </div>

        <div style={{ display: "grid", gap: "0.5rem" }}>
          <span
            className="eyebrow"
            style={{ margin: "0 auto", color: "var(--secondary-brand)" }}
          >
            Halaman Tidak Ditemukan
          </span>
          <h1
            className="title-xl"
            style={{ fontSize: "clamp(2rem, 6vw, 3.4rem)" }}
          >
            404
          </h1>
          <p className="title-lg">Alamat yang kamu buka tidak tersedia.</p>
          <p
            className="text-muted"
            style={{ maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}
          >
            Bisa jadi halaman sudah dipindahkan, dihapus, atau alamat URL yang
            dimasukkan belum benar. Gunakan tombol di bawah untuk kembali ke
            area yang tersedia.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/" className="btn">
            Ke Beranda
          </Link>
          <Link href="/courses" className="btn-ghost">
            Jelajahi Kelas
          </Link>
          <Link href="/help" className="btn-ghost">
            Pusat Bantuan
          </Link>
        </div>
      </section>
    </main>
  );
}
