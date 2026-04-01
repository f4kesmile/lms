"use client";

import {
  FormEvent,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

import EnrollButton from "@/features/courses/EnrollButton";
import { getInitials } from "@/lib/utils";

type CatalogCourse = {
  id: string;
  name: string;
  teacherName: string;
  subjectName: string;
  subjectCode: string;
  studentCount: number;
  isEnrolled: boolean;
  requiresKey: boolean;
};

const gradients = [
  "var(--catalog-gradient-1)",
  "var(--catalog-gradient-2)",
  "var(--catalog-gradient-3)",
  "var(--catalog-gradient-4)",
  "var(--catalog-gradient-5)",
  "var(--catalog-gradient-6)",
];

const cardIcons = [
  "science",
  "psychology",
  "terminal",
  "language",
  "palette",
  "code",
];

function getViewportConfig(width: number, height: number) {
  const columns = width >= 1200 ? 3 : width >= 768 ? 2 : 1;
  const availableHeight = Math.max(height - 360, 360);
  const visibleRows = Math.max(1, Math.ceil(availableHeight / 360));

  return {
    columns,
    initialCount: columns * visibleRows,
    loadStep: columns,
  };
}

export default function CourseCatalogBrowser({
  courses,
  initialQuery = "",
  isLoggedIn,
}: {
  courses: CatalogCourse[];
  initialQuery?: string;
  isLoggedIn: boolean;
}) {
  const [draftQuery, setDraftQuery] = useState(initialQuery);
  const [appliedQuery, setAppliedQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [initialCount, setInitialCount] = useState(6);
  const [loadStep, setLoadStep] = useState(3);
  const [visibleCount, setVisibleCount] = useState(6);

  const deferredQuery = useDeferredValue(appliedQuery.trim().toLowerCase());

  useEffect(() => {
    function syncViewport() {
      const viewport = getViewportConfig(window.innerWidth, window.innerHeight);
      setInitialCount(viewport.initialCount);
      setLoadStep(viewport.loadStep);
    }

    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  const categories = useMemo(() => {
    return [
      "Semua",
      ...Array.from(
        new Set(
          courses.map((course) => course.subjectName.trim()).filter(Boolean),
        ),
      ),
    ];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesCategory =
        activeCategory === "Semua" || course.subjectName === activeCategory;
      const haystack = [
        course.name,
        course.subjectName,
        course.subjectCode,
        course.teacherName,
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery = deferredQuery
        ? haystack.includes(deferredQuery)
        : true;

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, courses, deferredQuery]);

  const visibleCourses = filteredCourses.slice(0, visibleCount);
  const hasMore = filteredCourses.length > visibleCount;

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedQuery(draftQuery);
    setVisibleCount(initialCount);
  }

  return (
    <>
      <div>
        <p
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--text-dim)",
            marginBottom: "0.5rem",
          }}
        >
          Cari Materi
        </p>
        <div className="catalog-search-row">
          <form className="catalog-search-form" onSubmit={handleSearch}>
            <div className="catalog-search-shell">
              <div className="catalog-search-icon-box" aria-hidden="true">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                type="text"
                className="catalog-search-field"
                placeholder="Cari nama kelas atau kode..."
                value={draftQuery}
                onChange={(event) => setDraftQuery(event.target.value)}
              />
              <button className="btn catalog-search-btn" type="submit">
                Cari
              </button>
            </div>
          </form>

          <div className="catalog-filters">
            {categories.map((category) => (
              <button
                key={category}
                className={`filter-pill ${activeCategory === category ? "active" : ""}`}
                type="button"
                onClick={() => {
                  setActiveCategory(category);
                  setVisibleCount(initialCount);
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="course-grid">
        {visibleCourses.length === 0 ? (
          <p
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "3rem",
              color: "var(--text-dim)",
            }}
          >
            Tidak ada kelas yang cocok dengan pencarian atau kategori ini.
          </p>
        ) : (
          visibleCourses.map((course, index) => (
            <article key={course.id} className="catalog-card">
              <div
                className="catalog-card-img"
                style={{ background: gradients[index % gradients.length] }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 56,
                    color: "var(--icon-tint-on-gradient)",
                  }}
                >
                  {cardIcons[index % cardIcons.length]}
                </span>
                {index === 0 &&
                  activeCategory === "Semua" &&
                  !deferredQuery && (
                    <span className="card-badge">Terpopuler</span>
                  )}
              </div>
              <div className="catalog-card-body">
                <p className="catalog-card-category">{course.subjectName}</p>
                <h3 className="catalog-card-title">{course.name}</h3>
                <div className="catalog-card-instructor">
                  <div className="avatar-tiny">
                    {getInitials(course.teacherName)}
                  </div>
                  {course.teacherName}
                </div>
                <div className="catalog-card-meta">
                  <span>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 14 }}
                    >
                      schedule
                    </span>
                    12 Minggu
                  </span>
                  <span>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 14 }}
                    >
                      group
                    </span>
                    {course.studentCount} Mahasiswa
                  </span>
                </div>
                <div style={{ marginTop: "0.75rem" }}>
                  <EnrollButton
                    classId={course.id}
                    isLoggedIn={isLoggedIn}
                    isEnrolled={course.isEnrolled}
                    requiresKey={course.requiresKey}
                  />
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      {hasMore && visibleCourses.length >= initialCount && (
        <button
          className="load-more-btn"
          type="button"
          onClick={() => setVisibleCount((current) => current + loadStep)}
        >
          Muat Lebih Banyak
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            expand_more
          </span>
        </button>
      )}
    </>
  );
}
