"use client";

import { useEffect, useMemo, useState } from "react";



type SubjectItem = {
  id: string;
  name: string;
  code: string;
  teachers: Array<{ user: { name: string } }>;
};

type ClassEnrollment = {
  classId: string;
  progress: number;
  class: {
    id: string;
    name: string;
    subjects: Array<{ subject: { name: string; code: string } }>;
    classTeacher: { name: string } | null;
  };
};

type MeResponse = {
  user: {
    name: string;
    classLinks: ClassEnrollment[];
  };
};

type SubjectsResponse = { subjects: SubjectItem[] };

type AcademicYearResponse = {
  name: string;
};

export default function StudentClient() {
  const [name, setName] = useState("Mahasiswa");
  const [courses, setCourses] = useState<SubjectItem[]>([]);
  const [enrollments, setEnrollments] = useState<ClassEnrollment[]>([]);
  const [academicYear, setAcademicYear] = useState("Tahun Ajaran Aktif");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/users/me"),
      fetch("/api/subjects?limit=6"),
      fetch("/api/academic-years/current"),
    ])
      .then(async ([meRes, subjectsRes, yearRes]) => {
        if (meRes.ok) {
          const meData = (await meRes.json()) as MeResponse;
          setName(meData.user.name);
          if (meData.user.classLinks) {
            setEnrollments(meData.user.classLinks);
          }
        }

        const subjectsData = (await subjectsRes.json()) as SubjectsResponse & {
          message?: string;
        };
        if (!subjectsRes.ok) {
          throw new Error(subjectsData.message || "Gagal memuat mata kuliah");
        }
        setCourses(subjectsData.subjects ?? []);

        if (yearRes.ok) {
          const yearData = (await yearRes.json()) as AcademicYearResponse;
          setAcademicYear(yearData.name);
        }
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Terjadi kesalahan");
      });
  }, []);

  const enrolledCount = enrollments.length;

  const avgProgress = useMemo(() => {
    if (enrollments.length === 0) return 0;
    const total = enrollments.reduce((sum, item) => sum + item.progress, 0);
    return Math.round(total / enrollments.length);
  }, [enrollments]);

  return (
    <>

      <main className="app-shell" style={{ display: "grid", gap: "2.5rem" }}>
        {/* Hero */}
        <section className="student-hero">
          <span className="eyebrow" style={{ marginBottom: "1rem" }}>
            {academicYear}
          </span>
          <h1 className="title-xl" style={{ color: "#000" }}>
            Selamat Datang Kembali, {name}!
          </h1>
          <p style={{ fontSize: "1.1rem", marginTop: "0.5rem", marginBottom: "1.5rem" }}>
            {avgProgress > 0
              ? `Kamu sudah menyelesaikan ${avgProgress}% dari rata-rata progres kelasmu.`
              : "Mulai pelajari mata kuliah yang tersedia untuk kamu."}
          </p>
          {courses.length > 0 && (
            <a className="btn" href={`/courses/${courses[0].id}`}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>play_arrow</span>
              Lanjutkan Belajar
            </a>
          )}
        </section>

        {/* Stats */}
        <section className="grid-3">
          <article className="stat-card">
            <div className="row" style={{ gap: "1rem" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(190,239,0,0.1)",
                  color: "var(--primary)",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
                  school
                </span>
              </div>
              <div>
                <p className="text-dim" style={{ fontSize: "0.85rem" }}>Kelas Terdaftar</p>
                <p className="stat-value">{enrolledCount}</p>
              </div>
            </div>
          </article>
          <article className="stat-card">
            <div className="row" style={{ gap: "1rem" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(190,239,0,0.1)",
                  color: "var(--primary)",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
                  library_books
                </span>
              </div>
              <div>
                <p className="text-dim" style={{ fontSize: "0.85rem" }}>Mata Kuliah Tersedia</p>
                <p className="stat-value">{courses.length}</p>
              </div>
            </div>
          </article>
          <article className="stat-card">
            <div className="row" style={{ gap: "1rem" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(190,239,0,0.1)",
                  color: "var(--primary)",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
                  trending_up
                </span>
              </div>
              <div>
                <p className="text-dim" style={{ fontSize: "0.85rem" }}>Rata-rata Progres</p>
                <p className="stat-value">{avgProgress}%</p>
              </div>
            </div>
          </article>
        </section>

        {/* Courses */}
        <section style={{ display: "grid", gap: "1.5rem" }}>
          <div className="row space-between">
            <div>
              <h2 className="title-lg">Kursus yang Diikuti</h2>
              <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                Lanjutkan progres belajarmu di mana pun kamu berada.
              </p>
            </div>
          </div>
          <div className="student-course-grid">
            {courses.map((course) => {
              const enrollment = enrollments.find((e) =>
                e.class.subjects.some((s) => s.subject.code === course.code)
              );
              const progress = enrollment?.progress ?? 0;

              return (
                <article className="course-card" key={course.id}>
                  <div className="course-image">
                    <span className="course-badge">
                      {course.code.slice(0, 4).toUpperCase()}
                    </span>
                  </div>
                  <div className="course-body">
                    <h3 style={{ fontSize: "1.05rem" }}>{course.name}</h3>
                    <div className="row" style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        person
                      </span>
                      {course.teachers[0]?.user.name ?? "Pengajar belum ditentukan"}
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="row space-between" style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-dim)" }}>
                      <span>{progress}% Selesai</span>
                      <a href={`/courses/${course.id}`} style={{ color: "var(--primary)" }}>Lanjutkan</a>
                    </div>
                  </div>
                </article>
              );
            })}
            {courses.length === 0 && !error && (
              <article className="course-card">
                <div className="course-body">
                  <h3>Belum ada mata kuliah aktif</h3>
                  <p className="text-muted">Silakan hubungi admin akademik.</p>
                </div>
              </article>
            )}
            {error && (
              <article className="course-card">
                <div className="course-body">
                  <h3>Gagal memuat data</h3>
                  <p style={{ color: "var(--rose)" }}>{error}</p>
                </div>
              </article>
            )}
          </div>
        </section>

        {/* Quick Links / Bantuan */}
        <section className="grid-2" style={{ gap: "1.5rem" }}>
          <a href="/about" className="neo-card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem", textDecoration: "none" }}>
            <div style={{ padding: "1rem", background: "var(--amber-bg)", color: "var(--amber)", borderRadius: "var(--radius-md)", display: "flex" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 28 }}>info</span>
            </div>
            <div>
              <h3 style={{ fontSize: "1.05rem", color: "var(--text-main)", marginBottom: "0.25rem", fontWeight: 700 }}>Tentang Kami</h3>
              <p className="text-muted" style={{ fontSize: "0.85rem" }}>Pelajari lebih lanjut tentang visi, misi, dan tim platform UniLMS.</p>
            </div>
          </a>
          
          <a href="/help" className="neo-card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem", textDecoration: "none" }}>
            <div style={{ padding: "1rem", background: "var(--blue-bg)", color: "var(--blue)", borderRadius: "var(--radius-md)", display: "flex" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 28 }}>help</span>
            </div>
            <div>
              <h3 style={{ fontSize: "1.05rem", color: "var(--text-main)", marginBottom: "0.25rem", fontWeight: 700 }}>Pusat Bantuan</h3>
              <p className="text-muted" style={{ fontSize: "0.85rem" }}>Temukan jawaban untuk pertanyaan umum dan panduan penggunaan.</p>
            </div>
          </a>
        </section>

        {/* CTA Section */}
        <section
          style={{
            borderRadius: "var(--radius-xl)",
            padding: "2.5rem 3rem",
            border: "2px dashed var(--border-primary-strong)",
            background: "rgba(190,239,0,0.02)",
          }}
        >
          <div className="grid-2" style={{ alignItems: "center" }}>
            <div>
              <h2 className="title-lg" style={{ marginBottom: "0.75rem" }}>
                Siap untuk Tantangan Baru?
              </h2>
              <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
                Temukan kursus berkualitas tinggi dari pengajar ahli. Tingkatkan skill-mu hari ini.
              </p>
              <div className="row" style={{ flexWrap: "wrap" }}>
                <a className="btn" href="/chatbot">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>smart_toy</span>
                  Tanya AI Assistant
                </a>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              {courses.slice(0, 4).map((course) => (
                <div
                  key={course.id}
                  className="neo-card"
                  style={{
                    padding: "1rem",
                    textAlign: "center",
                    display: "grid",
                    gap: "0.4rem",
                    justifyItems: "center",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 28, color: "var(--primary)" }}
                  >
                    menu_book
                  </span>
                  <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-main)" }}>
                    {course.code}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="row" style={{ justifyContent: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <div
            style={{
              width: 28,
              height: 28,
              background: "var(--primary)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#000",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>school</span>
          </div>
          <span style={{ fontWeight: 700, color: "var(--primary)" }}>LMS.Node</span>
        </div>
        <p className="text-dim" style={{ fontSize: "0.85rem" }}>
          2024 LMS Portal. Semua hak cipta dilindungi.
        </p>
        <div className="row" style={{ justifyContent: "center", gap: "1.5rem", marginTop: "1rem" }}>
          <a href="#" style={{ fontSize: "0.85rem" }}>Privacy Policy</a>
          <a href="#" style={{ fontSize: "0.85rem" }}>Terms of Service</a>
          <a href="#" style={{ fontSize: "0.85rem" }}>Help Center</a>
        </div>
      </footer>
    </>
  );
}
