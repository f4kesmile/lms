import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import type { Route } from "next";
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
      students: { select: { userId: true } },
      subjects: {
        include: {
          subject: {
            select: {
              name: true,
              code: true,
              teachers: {
                select: {
                  user: { select: { name: true } },
                },
              },
            },
          },
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
  const teacherNames = Array.from(
    new Set(
      (course?.subjects ?? [])
        .flatMap((item) => item.subject.teachers)
        .map((item) => item.user.name)
        .filter(Boolean),
    ),
  );
  const teacher =
    teacherNames.length > 0
      ? teacherNames.join(", ")
      : "Belum ada dosen pengampu mata kuliah";
  const studentCount = course?.students.length ?? 0;
  const capacity = course?.capacity ?? 0;
  const subjectList: Array<{ name: string; code: string }> =
    course?.subjects.map((item) => ({
      name: item.subject.name,
      code: item.subject.code,
    })) ?? [];
  const isOpen = studentCount < capacity;

  const subjectCodes = subjectList
    .map((subject) => subject.code)
    .filter(Boolean);
  const subjectNames = subjectList
    .map((subject) => subject.name)
    .filter(Boolean);

  const courseWithMaterials =
    subjectList.length > 0
      ? await prisma.course.findMany({
          where: {
            OR: [
              { code: { in: subjectCodes } },
              { title: { in: subjectNames } },
            ],
          },
          select: {
            code: true,
            title: true,
            materials: {
              select: {
                id: true,
                title: true,
                module: true,
              },
              orderBy: [{ updatedAt: "desc" }],
              take: 1,
            },
          },
        })
      : [];

  const materialByCode = new Map(
    courseWithMaterials
      .filter((courseItem) => courseItem.materials[0])
      .map((courseItem) => [courseItem.code, courseItem.materials[0]]),
  );

  const materialByTitle = new Map(
    courseWithMaterials
      .filter((courseItem) => courseItem.materials[0])
      .map((courseItem) => [
        courseItem.title.toLowerCase(),
        courseItem.materials[0],
      ]),
  );

  const subjectMaterialLinks = subjectList
    .map((subject) => {
      const material =
        materialByCode.get(subject.code) ||
        materialByTitle.get(subject.name.toLowerCase()) ||
        null;

      return {
        ...subject,
        material,
      };
    })
    .filter((item) => item.material);

  const featuredMaterial = subjectMaterialLinks[0]?.material ?? null;

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
          <Link href="/courses">Kelas Saya</Link>
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
                    "linear-gradient(135deg, var(--surface-primary-soft), var(--brand-heavy))",
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
                    {teacherNames.length > 0
                      ? `${teacherNames.length} Dosen Pengampu`
                      : "Belum ada Dosen Pengampu"}
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
                ajaran {year}. Mata kuliah pada kelas ini diampu oleh {teacher}
                dan dapat menampung hingga {capacity} mahasiswa.
              </p>
            </section>

            {/* Curriculum */}
            <section style={{ display: "grid", gap: "1rem" }}>
              <h2 className="title-lg">Daftar Mata Pelajaran</h2>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {subjectList.length > 0 ? (
                  subjectList.map((subject, idx: number) => {
                    const material =
                      materialByCode.get(subject.code) ||
                      materialByTitle.get(subject.name.toLowerCase()) ||
                      null;

                    if (material) {
                      return (
                        <Link
                          key={subject.code}
                          href={`/materials/${material.id}` as Route}
                          className="row"
                          style={{
                            padding: "1rem",
                            border: "1px solid var(--border-primary)",
                            borderRadius: "var(--radius-sm)",
                            background: "var(--bg-card)",
                            textDecoration: "none",
                            color: "inherit",
                          }}
                        >
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              background: "var(--surface-primary-soft)",
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
                            <span
                              style={{ fontWeight: 500, fontSize: "0.9rem" }}
                            >
                              {subject.name}
                            </span>
                            <span
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-dim)",
                              }}
                            >
                              Kode: {subject.code} · Buka materi
                            </span>
                          </div>
                          <span
                            className="material-symbols-outlined"
                            style={{ color: "var(--text-dim)", fontSize: 18 }}
                          >
                            chevron_right
                          </span>
                        </Link>
                      );
                    }

                    return (
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
                            background: "var(--surface-primary-soft)",
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
                            Kode: {subject.code} · Materi belum tersedia
                          </span>
                        </div>
                        <span
                          className="material-symbols-outlined"
                          style={{ color: "var(--text-dim)", fontSize: 18 }}
                        >
                          chevron_right
                        </span>
                      </div>
                    );
                  })
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
                {featuredMaterial && (
                  <Link
                    href={`/materials/${featuredMaterial.id}` as Route}
                    className="btn-ghost"
                    style={{
                      width: "100%",
                      fontSize: "0.85rem",
                      padding: "0.5rem",
                      borderColor: "var(--border-primary-strong)",
                      color: "var(--text-main)",
                      fontWeight: 700,
                      textAlign: "center",
                    }}
                  >
                    Buka Materi Kelas
                  </Link>
                )}
              </div>
            </div>

            <div
              className="neo-card"
              style={{ padding: "1.5rem", display: "grid", gap: "0.75rem" }}
            >
              <h3 style={{ fontWeight: 700 }}>Materi Pendukung</h3>
              {subjectMaterialLinks.length > 0 ? (
                subjectMaterialLinks.map((subject) => (
                  <Link
                    key={`${subject.code}-${subject.material?.id}`}
                    href={`/materials/${subject.material!.id}` as Route}
                    className="doc-card"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <strong style={{ fontSize: "0.9rem" }}>
                      {subject.name}
                    </strong>
                    <p className="text-dim" style={{ fontSize: "0.8rem" }}>
                      Kode: {subject.code} · {subject.material!.module}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-dim" style={{ fontSize: "0.85rem" }}>
                  Belum ada materi yang terhubung untuk kelas ini.
                </p>
              )}
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
