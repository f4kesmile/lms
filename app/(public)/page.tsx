import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getInitials } from "@/lib/utils";

export default async function HomePage() {
  const [userCount, classCount, materialCount] = await Promise.all([
    prisma.user.count(),
    prisma.class.count(),
    prisma.courseMaterial.count(),
  ]);

  const featuredClasses = await prisma.class.findMany({
    take: 4,
    orderBy: { createdAt: "desc" },
    include: {
      classTeacher: { select: { name: true } },
      subjects: { select: { subject: { select: { name: true } } } },
      students: { select: { userId: true } },
    },
  });

  const gradients = [
    "linear-gradient(135deg, #10b981 0%, #064e3b 100%)",
    "linear-gradient(135deg, #f59e0b 0%, #78350f 100%)",
    "linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)",
    "linear-gradient(135deg, #f43f5e 0%, #881337 100%)",
  ];

  return (
    <>
      <Navbar />

      <main className="app-shell" style={{ display: "grid", gap: "3.5rem", paddingBottom: "5rem" }}>

        {/* ===== HERO ===== */}
        <section className="public-hero">
          <div className="public-hero-text">
            <h1 className="public-hero-title">
              Masa Depan Belajar
              <br />
              <span className="highlight">dengan Asisten AI</span>
            </h1>
            <p className="public-hero-subtitle">
              Tingkatkan pengalaman belajar Anda dengan platform e-learning
              interaktif terkemuka. Akses ribuan modul dari dosen terbaik,
              didukung kecerdasan buatan.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/register" className="btn" style={{ padding: "0.75rem 2rem" }}>
                Mulai Belajar Sekarang
              </Link>
              <Link href="/courses" className="btn-ghost" style={{ padding: "0.75rem 2rem", border: "1px solid var(--border-primary-strong)" }}>
                Eksplorasi Kelas
              </Link>
            </div>
          </div>
          <div className="public-hero-img">
            <Image
              src="/hero-illustration.png"
              alt="Mahasiswa belajar bersama"
              width={600}
              height={450}
              priority
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          </div>
        </section>

        {/* ===== STATS ===== */}
        <section className="stats-row">
          <div className="stat-box">
            <div className="stat-box-label">
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--primary)" }}>groups</span>
              Mahasiswa Aktif
            </div>
            <p className="stat-box-value">{userCount.toLocaleString("id-ID")}+</p>
          </div>
          <div className="stat-box">
            <div className="stat-box-label">
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--primary)" }}>school</span>
              Kursus Tersedia
            </div>
            <p className="stat-box-value">{classCount.toLocaleString("id-ID")}+</p>
          </div>
          <div className="stat-box">
            <div className="stat-box-label">
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--primary)" }}>library_books</span>
              Modul Belajar
            </div>
            <p className="stat-box-value">{materialCount.toLocaleString("id-ID")}+</p>
          </div>
        </section>

        {/* ===== FEATURED COURSES ===== */}
        <section style={{ display: "grid", gap: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, borderBottom: "3px solid var(--primary)", paddingBottom: "0.2rem", display: "inline-block" }}>
              Kursus Unggulan
            </h2>
            <Link href="/courses" style={{ color: "var(--primary)", fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              Lihat Semua
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
            </Link>
          </div>

          <div className="course-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            {featuredClasses.length === 0 ? (
              <p className="text-muted" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem" }}>
                Belum ada kursus tersedia.
              </p>
            ) : (
              featuredClasses.map((cls, idx) => {
                const teacherName = cls.classTeacher?.name || "Instruktur";
                const subjectName = cls.subjects[0]?.subject.name || "Umum";
                return (
                  <article key={cls.id} className="catalog-card">
                    <div className="catalog-card-img" style={{ background: gradients[idx % 4], height: 160 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 56, color: "rgba(255,255,255,0.15)" }}>
                        {["science", "psychology", "terminal", "language"][idx % 4]}
                      </span>
                      <span className="card-badge">{subjectName.substring(0, 15)}</span>
                    </div>
                    <div className="catalog-card-body">
                      <p className="catalog-card-category">{subjectName.substring(0, 20)}</p>
                      <h3 className="catalog-card-title">{cls.name}</h3>
                      <div className="catalog-card-instructor">
                        <div className="avatar-tiny">{getInitials(teacherName)}</div>
                        {teacherName}
                      </div>
                      <div style={{ marginTop: "auto", paddingTop: "0.75rem" }}>
                        <Link href={`/courses/${cls.id}`} className="btn" style={{ width: "100%", textAlign: "center", display: "block", padding: "0.6rem" }}>
                          Lihat Detail
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
