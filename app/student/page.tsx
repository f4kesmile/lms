"use client";

import { useEffect, useMemo, useState } from "react";

import AppTopbar from "@/components/AppTopbar";

type SubjectItem = {
  id: string;
  name: string;
  code: string;
  teachers: Array<{ user: { name: string } }>;
};

type MeResponse = { user: { name: string } };
type SubjectsResponse = { subjects: SubjectItem[] };

const categories = [
  { icon: "language", label: "Business" },
  { icon: "code", label: "Coding" },
  { icon: "draw", label: "Art" },
  { icon: "insights", label: "Marketing" },
];

export default function StudentPage() {
  const [name, setName] = useState("Mahasiswa");
  const [courses, setCourses] = useState<SubjectItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetch("/api/users/me"), fetch("/api/subjects?limit=6")])
      .then(async ([meRes, subjectsRes]) => {
        if (meRes.ok) {
          const meData = (await meRes.json()) as MeResponse;
          setName(meData.user.name);
        }

        const subjectsData = (await subjectsRes.json()) as SubjectsResponse & {
          message?: string;
        };
        if (!subjectsRes.ok) {
          throw new Error(subjectsData.message || "Gagal memuat mata kuliah");
        }

        setCourses(subjectsData.subjects ?? []);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Terjadi kesalahan");
      });
  }, []);

  const finishedCount = useMemo(
    () => Math.min(courses.length, 3),
    [courses.length],
  );

  return (
    <>
      <AppTopbar title="LMS.Node" />
      <main className="app-shell" style={{ display: "grid", gap: "2.5rem" }}>
        {/* Hero */}
        <section className="student-hero">
          <span className="eyebrow" style={{ marginBottom: "1rem" }}>
            Semester Ganjil 2024
          </span>
          <h1 className="title-xl" style={{ color: "#000" }}>
            Selamat Datang Kembali, {name}! 👋
          </h1>
          <p style={{ fontSize: "1.1rem", marginTop: "0.5rem", marginBottom: "1.5rem" }}>
            Kamu sudah menyelesaikan 85% dari target belajar minggu ini. Sedikit
            lagi menuju pencapaian baru!
          </p>
          <button className="btn" type="button">
            Lanjutkan Belajar: UI/UX Design
          </button>
        </section>

        {/* Stats */}
        <section className="grid-3">
          <article className="stat-card">
            <div className="row" style={{ gap: "1rem" }}>
              <div
                className="icon-box"
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
                  verified
                </span>
              </div>
              <div>
                <p className="text-dim" style={{ fontSize: "0.85rem" }}>Kursus Selesai</p>
                <p className="stat-value">{finishedCount}</p>
                <p style={{ color: "var(--emerald)", fontSize: "0.75rem", fontWeight: 700 }}>
                  +2 bulan ini
                </p>
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
                  schedule
                </span>
              </div>
              <div>
                <p className="text-dim" style={{ fontSize: "0.85rem" }}>Jam Belajar</p>
                <p className="stat-value">{courses.length * 12}h</p>
                <p style={{ color: "var(--emerald)", fontSize: "0.75rem", fontWeight: 700 }}>
                  +12h minggu ini
                </p>
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
                  military_tech
                </span>
              </div>
              <div>
                <p className="text-dim" style={{ fontSize: "0.85rem" }}>Total Poin</p>
                <p className="stat-value">{courses.length * 180}</p>
                <p style={{ color: "var(--emerald)", fontSize: "0.75rem", fontWeight: 700 }}>
                  Peringkat 5 Global
                </p>
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
            <a
              className="nav-link"
              href="/courses/rpl-lanjut"
              style={{ color: "var(--primary)", fontWeight: 700 }}
            >
              Lihat Semua →
            </a>
          </div>
          <div className="student-course-grid">
            {courses.map((course) => (
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
                      style={{
                        width: `${(course.code.length * 11) % 100 || 35}%`,
                      }}
                    />
                  </div>
                  <div className="row space-between" style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-dim)" }}>
                    <span>{(course.code.length * 11) % 100 || 35}% Selesai</span>
                    <span style={{ color: "var(--primary)" }}>Lanjutkan</span>
                  </div>
                </div>
              </article>
            ))}
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
                Temukan ratusan kursus berkualitas tinggi dari pengajar ahli di
                seluruh dunia. Tingkatkan skill-mu hari ini.
              </p>
              <div className="row" style={{ flexWrap: "wrap" }}>
                <button className="btn" type="button">Enroll Kursus Baru</button>
                <button className="btn-ghost" type="button">Lihat Kurikulum</button>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              {categories.map((cat) => (
                <div
                  key={cat.label}
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
                    {cat.icon}
                  </span>
                  <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-main)" }}>
                    {cat.label}
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
          © 2024 LMS Portal. Semua hak cipta dilindungi.
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
