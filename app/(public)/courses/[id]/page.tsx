import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserIdFromCookie } from "@/lib/auth";
import EnrollButton from "@/features/courses/EnrollButton";

type CourseDetailPageProps = {
  params: Promise<{ id: string }>;
};

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

  const userId = await getCurrentUserIdFromCookie();
  const isEnrolled = course?.students.some((s) => s.userId === userId) ?? false;
  const isLoggedIn = !!userId;
  const requiresKey = !!course?.enrollmentKey;

  const title = course?.name ?? "Kelas Tidak Ditemukan";
  const year = course?.academicYear?.name ?? "Tahun Ajaran Aktif";
  const teacher = course?.classTeacher?.name ?? "Belum ada Dosen";
  const studentCount = course?.students.length ?? 0;
  const capacity = course?.capacity ?? 0;
  const subjectList: Array<{ name: string; code: string }> =
    course?.subjects.map((item) => item.subject) ?? [];
  const isOpen = studentCount < capacity;

  return (
    <>
      <Navbar />
      <main className="app-shell" style={{ display: "grid", gap: "2rem" }}>
        {/* Breadcrumb */}
        <nav
          className="row"
          style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}
        >
          <Link href="/" style={{ color: "var(--primary)" }}>
            Beranda
          </Link>
          <span>›</span>
          <Link href="/student">Kelas Saya</Link>
          <span>›</span>
          <span style={{ color: "var(--text-main)" }}>{title}</span>
        </nav>

        <div className="grid-2" style={{ alignItems: "start" }}>
          {/* Left: Class Info */}
          <div style={{ display: "grid", gap: "2rem" }}>
            {/* Hero */}
            <article className="neo-card" style={{ overflow: "hidden" }}>
              <div
                style={{
                  height: 200,
                  background:
                    "linear-gradient(135deg, rgba(190,239,0,0.15), rgba(0,0,0,0.8))",
                  position: "relative",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: "1.5rem",
                }}
              >
                <div style={{ position: "relative", zIndex: 1 }}>
                  <span className="eyebrow" style={{ marginBottom: "0.75rem" }}>
                    Kelas Aktif
                  </span>
                  <h1
                    className="title-xl"
                    style={{ fontSize: "1.6rem", marginTop: "0.5rem" }}
                  >
                    {title}
                  </h1>
                  <p
                    className="text-dim"
                    style={{ marginTop: "0.35rem", fontSize: "0.85rem" }}
                  >
                    {subjectList.length > 0 ? subjectList[0].code : "Umum"} ·{" "}
                    {year}
                  </p>
                </div>
              </div>
              <div
                style={{ padding: "1.25rem", display: "grid", gap: "0.75rem" }}
              >
                <div
                  className="row"
                  style={{ flexWrap: "wrap", fontSize: "0.85rem" }}
                >
                  <span className="pill">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 14 }}
                    >
                      person
                    </span>
                    {teacher}
                  </span>
                  <span className="pill">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 14 }}
                    >
                      group
                    </span>
                    {studentCount} Mahasiswa Terdaftar
                  </span>
                  <span className="pill">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 14 }}
                    >
                      library_books
                    </span>
                    {subjectList.length} Mata Pelajaran
                  </span>
                </div>
              </div>
            </article>

            {/* About */}
            <section style={{ display: "grid", gap: "1.25rem" }}>
              <h2 className="title-lg">Informasi Kelas</h2>
              <p className="text-muted" style={{ lineHeight: 1.7 }}>
                Kelas <strong>{title}</strong> merupakan bagian dari tahun
                ajaran {year}. Kelas ini diampu oleh {teacher} dan dapat
                menampung hingga {capacity} mahasiswa.
              </p>
            </section>

            {/* Curriculum */}
            <section style={{ display: "grid", gap: "1rem" }}>
              <h2 className="title-lg">Daftar Mata Pelajaran</h2>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {subjectList.length > 0 ? (
                  subjectList.map((subject, idx: number) => (
                    <div
                      key={subject.code}
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
                        {idx + 1}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <span style={{ fontWeight: 500, fontSize: "0.9rem" }}>
                          {subject.name}
                        </span>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-dim)",
                          }}
                        >
                          Kode: {subject.code}
                        </span>
                      </div>
                      <span
                        className="material-symbols-outlined"
                        style={{ color: "var(--text-dim)", fontSize: 18 }}
                      >
                        chevron_right
                      </span>
                    </div>
                  ))
                ) : (
                  <div
                    className="row"
                    style={{
                      padding: "1.5rem",
                      border: "1px dashed var(--border-primary)",
                      borderRadius: "var(--radius-sm)",
                      justifyContent: "center",
                    }}
                  >
                    <span className="text-dim">Belum ada mata pelajaran.</span>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right sidebar */}
          <aside style={{ display: "grid", gap: "1.5rem" }}>
            <div
              className="neo-card"
              style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}
            >
              <h3
                style={{
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--text-dim)",
                }}
              >
                Status Pendaftaran
              </h3>
              <div>
                <p className="text-dim" style={{ fontSize: "0.8rem" }}>
                  Ketersediaan Kelas
                </p>
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: isOpen ? "var(--primary)" : "var(--danger)",
                    marginTop: "0.25rem",
                  }}
                >
                  {isOpen ? "Pendaftaran Terbuka" : "Kelas Penuh"}
                </p>
              </div>
              <div
                style={{ display: "grid", gap: "0.5rem", fontSize: "0.85rem" }}
              >
                <div className="row" style={{ gap: "0.5rem" }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 16, color: "var(--text-dim)" }}
                  >
                    people
                  </span>
                  <span className="text-muted">
                    Kapasitas: {studentCount} / {capacity} Terisi
                  </span>
                </div>
              </div>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                <EnrollButton
                  classId={id}
                  isLoggedIn={isLoggedIn}
                  isEnrolled={isEnrolled}
                  requiresKey={requiresKey}
                />
              </div>
            </div>

            <div
              className="neo-card"
              style={{ padding: "1.5rem", display: "grid", gap: "0.75rem" }}
            >
              <h3 style={{ fontWeight: 700 }}>Materi Pendukung</h3>
              {subjectList.length > 0 ? (
                subjectList.map((subject) => (
                  <article className="doc-card" key={subject.code}>
                    <strong style={{ fontSize: "0.9rem" }}>
                      {subject.name}
                    </strong>
                    <p className="text-dim" style={{ fontSize: "0.8rem" }}>
                      Kode: {subject.code}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-dim" style={{ fontSize: "0.85rem" }}>
                  Belum ada materi tercantum.
                </p>
              )}
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
