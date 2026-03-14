import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { getCurrentUserIdFromCookie } from "@/lib/auth";
import { getInitials } from "@/lib/utils";
import CourseSearch from "@/features/courses/CourseSearch";
import EnrollButton from "@/features/courses/EnrollButton";

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function CourseCatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const userId = await getCurrentUserIdFromCookie();

  const courses = await prisma.class.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            {
              subjects: {
                some: {
                  subject: { name: { contains: q, mode: "insensitive" } },
                },
              },
            },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      classTeacher: { select: { name: true } },
      subjects: { select: { subject: { select: { name: true } } } },
      students: userId ? { where: { userId } } : false,
    },
  });

  const coursesWithKeyStatus = courses.map((c) => ({
    ...c,
    requiresKey: !!c.enrollmentKey,
  }));

  const gradients = [
    "linear-gradient(135deg, #10b981 0%, #064e3b 100%)",
    "linear-gradient(135deg, #f59e0b 0%, #78350f 100%)",
    "linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)",
    "linear-gradient(135deg, #f43f5e 0%, #881337 100%)",
    "linear-gradient(135deg, #8b5cf6 0%, #4c1d95 100%)",
    "linear-gradient(135deg, #06b6d4 0%, #164e63 100%)",
  ];

  return (
    <>
      <Navbar />

      <main className="app-shell" style={{ display: "grid", gap: "2.5rem", paddingBottom: "5rem" }}>

        {/* ===== HEADER ===== */}
        <div className="catalog-header">
          <h1>Eksplorasi Kursus Akademik</h1>
          <p>
            Akses materi berkualitas dari pengajar terbaik secara gratis.
            Tingkatkan wawasan dan kompetensi Anda di sini.
          </p>
        </div>

        {/* ===== SEARCH + FILTERS ===== */}
        <div>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-dim)", marginBottom: "0.5rem" }}>
            CARI MATERI
          </p>
          <div className="catalog-search-row">
            <div className="catalog-search-wrap">
              <span className="material-symbols-outlined">search</span>
              <CourseSearch initialQuery={q} />
            </div>
            <div className="catalog-filters">
              <button className="filter-pill active" type="button">Semua</button>
              <button className="filter-pill" type="button">Teknologi</button>
              <button className="filter-pill" type="button">Bisnis</button>
              <button className="filter-pill" type="button">Humaniora</button>
            </div>
          </div>
        </div>

        {/* ===== COURSE GRID ===== */}
        <section className="course-grid">
          {courses.length === 0 ? (
            <p style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem", color: "var(--text-dim)" }}>
              Belum ada kursus publik untuk saat ini.
            </p>
          ) : (
            coursesWithKeyStatus.map((cls, idx: number) => {
              const teacherName = cls.classTeacher?.name || "Pengajar";
              const subjectName = cls.subjects[0]?.subject.name || "Umum";
              const studentCount = userId ? cls.students.length : 0;
              return (
                <article key={cls.id} className="catalog-card">
                  <div className="catalog-card-img" style={{ background: gradients[idx % gradients.length] }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 56, color: "rgba(255,255,255,0.12)" }}>
                      {["science", "psychology", "terminal", "language", "palette", "code"][idx % 6]}
                    </span>
                    {idx === 0 && <span className="card-badge">TERPOPULER</span>}
                  </div>
                  <div className="catalog-card-body">
                    <p className="catalog-card-category">{subjectName.substring(0, 20)}</p>
                    <h3 className="catalog-card-title">{cls.name}</h3>
                    <div className="catalog-card-instructor">
                      <div className="avatar-tiny">{getInitials(teacherName)}</div>
                      {teacherName}
                    </div>
                    <div className="catalog-card-meta">
                      <span>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
                        12 Minggu
                      </span>
                      <span>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>group</span>
                        {studentCount > 0 ? `${studentCount} Siswa` : "Baru"}
                      </span>
                    </div>
                    <div style={{ marginTop: "0.75rem" }}>
                      <EnrollButton
                        classId={cls.id}
                        isLoggedIn={!!userId}
                        isEnrolled={userId ? cls.students.length > 0 : false}
                        requiresKey={cls.requiresKey}
                      />
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>

        {/* ===== LOAD MORE ===== */}
        {courses.length > 0 && (
          <button className="load-more-btn" type="button">
            Muat Lebih Banyak
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>expand_more</span>
          </button>
        )}
      </main>

      <Footer />
    </>
  );
}
