import AppTopbar from "@/components/AppTopbar";
import { prisma } from "@/lib/prisma";

type CourseDetailPageProps = {
  params: Promise<{ id: string }>;
};

const curriculum = [
  { num: 1, title: "Pengantar & Metodologi Agile/Scrum", status: "" },
  { num: 2, title: "Arsitektur Perangkat Lunak Masa Depan", status: "" },
  { num: 3, title: "Monolithic vs Microservices", status: "3/10" },
  { num: 4, title: "Design Patterns for Scalability", status: "" },
  { num: 5, title: "Rate Architecture Sistem", status: "PINFALL" },
  { num: 6, title: "Testing & Pengujian Kualitas (QA)", status: ">" },
];

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { id } = await params;
  const course = await prisma.class.findFirst({
    where: {
      OR: [{ id }, { name: { contains: id, mode: "insensitive" } }],
    },
    include: {
      classTeacher: { select: { name: true } },
      students: { select: { userId: true } },
      subjects: {
        include: {
          subject: { select: { name: true, code: true } },
        },
      },
      academicYear: { select: { name: true } },
    },
  });

  const title = course?.name ?? "Rekayasa Perangkat Lunak Lanjut";
  const year = course?.academicYear?.name ?? "Semester Ganjil 2023/2024";
  const teacher = course?.classTeacher?.name ?? "Dr. S. Ahmad Sobawi, M.Kom.";
  const studentCount = course?.students.length ?? 68;
  const subjectList = course?.subjects.map((item) => item.subject) ?? [];

  return (
    <>
      <AppTopbar title="EduLMS" />
      <main className="app-shell" style={{ display: "grid", gap: "2rem" }}>
        {/* Breadcrumb */}
        <nav className="row" style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>
          <a href="/" style={{ color: "var(--primary)" }}>Beranda</a>
          <span>›</span>
          <a href="/student">Mata Kuliah Mahasiswa</a>
          <span>›</span>
          <span style={{ color: "var(--text-main)" }}>Rekayasa Perangkat Lunak Lanjut</span>
        </nav>

        <div className="grid-2" style={{ alignItems: "start" }}>
          {/* Left: Course Info */}
          <div style={{ display: "grid", gap: "2rem" }}>
            {/* Hero */}
            <article className="neo-card" style={{ overflow: "hidden" }}>
              <div
                style={{
                  height: 200,
                  background: "linear-gradient(135deg, rgba(190,239,0,0.15), rgba(0,0,0,0.8))",
                  position: "relative",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: "1.5rem",
                }}
              >
                <div style={{ position: "relative", zIndex: 1 }}>
                  <span className="eyebrow" style={{ marginBottom: "0.75rem" }}>Tingkat Lanjut</span>
                  <h1 className="title-xl" style={{ fontSize: "1.6rem", marginTop: "0.5rem" }}>{title}</h1>
                  <p className="text-dim" style={{ marginTop: "0.35rem", fontSize: "0.85rem" }}>
                    {subjectList[0]?.code ?? "CS402"} · {year}
                  </p>
                </div>
              </div>
              <div style={{ padding: "1.25rem", display: "grid", gap: "0.75rem" }}>
                <div className="row" style={{ flexWrap: "wrap", fontSize: "0.85rem" }}>
                  <span className="pill">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person</span>
                    {teacher}
                  </span>
                  <span className="pill">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>group</span>
                    {studentCount} Mahasiswa Terdaftar
                  </span>
                  <span className="pill">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
                    4 SKS (Bobot)
                  </span>
                </div>
              </div>
            </article>

            {/* About */}
            <section style={{ display: "grid", gap: "1.25rem" }}>
              <h2 className="title-lg">Tentang Mata Kuliah Ini</h2>
              <p className="text-muted" style={{ lineHeight: 1.7 }}>
                Mata kuliah ini dirancang untuk memberikan pemahaman mendalam tentang prinsip-prinsip rekayasa perangkat lunak modern, termasuk arsitektur cloud, metodologi Agile, dan praktik CI/CD.
              </p>
              <div className="grid-2">
                <article className="doc-card" style={{ display: "grid", gap: "0.5rem" }}>
                  <h3 style={{ fontSize: "1rem" }}>Target Pembelajaran</h3>
                  <ul className="clean-list" style={{ fontSize: "0.85rem" }}>
                    <li>Menguasai implementasi pipeline CI/CD</li>
                    <li>Merancang arsitektur sistem berbasis cloud</li>
                    <li>Menerapkan Agile Scrum secara efektif</li>
                  </ul>
                </article>
                <article className="doc-card" style={{ display: "grid", gap: "0.5rem" }}>
                  <h3 style={{ fontSize: "1rem" }}>Prasyarat</h3>
                  <ul className="clean-list" style={{ fontSize: "0.85rem" }}>
                    <li>Dasar Rekayasa Perangkat Lunak</li>
                    <li>Pemrograman Berorientasi Objek</li>
                    <li>Struktur Data dan Algoritma</li>
                  </ul>
                </article>
              </div>
            </section>

            {/* Curriculum */}
            <section style={{ display: "grid", gap: "1rem" }}>
              <h2 className="title-lg">Kurikulum Mata Kuliah</h2>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {curriculum.map((item) => (
                  <div
                    key={item.num}
                    className="row"
                    style={{
                      padding: "1rem",
                      border: "1px solid var(--border-primary)",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--bg-card)",
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "rgba(190,239,0,0.12)",
                        color: "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {item.num}
                    </div>
                    <span style={{ flex: 1, fontWeight: 500, fontSize: "0.9rem" }}>
                      {item.title}
                    </span>
                    {item.status && (
                      <span className="pill" style={{ fontSize: "0.7rem" }}>{item.status}</span>
                    )}
                    <span className="material-symbols-outlined" style={{ color: "var(--text-dim)", fontSize: 18 }}>
                      chevron_right
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right sidebar */}
          <aside style={{ display: "grid", gap: "1.5rem" }}>
            <div className="neo-card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
              <h3 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-dim)" }}>
                Status Pendaftaran
              </h3>
              <div>
                <p className="text-dim" style={{ fontSize: "0.8rem" }}>Mata Kuliah Inti</p>
                <p style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--primary)", marginTop: "0.25rem" }}>
                  Pendaftaran Terbuka
                </p>
              </div>
              <div style={{ display: "grid", gap: "0.5rem", fontSize: "0.85rem" }}>
                <div className="row" style={{ gap: "0.5rem" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--text-dim)" }}>schedule</span>
                  <span className="text-muted">Senin &amp; Rabu</span>
                </div>
                <div className="row" style={{ gap: "0.5rem" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--text-dim)" }}>computer</span>
                  <span className="text-muted">Lab Komputer 4 (Lantai 2)</span>
                </div>
              </div>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                <button className="btn" type="button" style={{ width: "100%" }}>
                  Daftar ke Kursus
                </button>
                <button className="btn-ghost" type="button" style={{ width: "100%" }}>
                  Masuk Kelas (LMS)
                </button>
              </div>
            </div>

            <div className="neo-card" style={{ padding: "1.5rem", display: "grid", gap: "0.75rem" }}>
              <h3 style={{ fontWeight: 700 }}>Materi Pendukung</h3>
              <article className="doc-card">
                <strong style={{ fontSize: "0.9rem" }}>Silabus Perkuliahan 2023</strong>
                <p className="text-dim" style={{ fontSize: "0.8rem" }}>PDF · 2.4 MB</p>
              </article>
              {subjectList.map((subject) => (
                <article className="doc-card" key={subject.code}>
                  <strong style={{ fontSize: "0.9rem" }}>{subject.name}</strong>
                  <p className="text-dim" style={{ fontSize: "0.8rem" }}>Kode: {subject.code}</p>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
