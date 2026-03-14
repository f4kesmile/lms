"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  createCourseAction,
  updateCourseAction,
  deleteCourseAction,
  createAcademicYearAction,
  deleteAcademicYearAction,
  setAcademicYearActiveAction,
} from "@/lib/actions/courseActions";

type ClassItem = {
  id: string;
  name: string;
  academicYear: { id: string; name: string };
  academicYearId: string;
  classTeacher: { id: string; name: string } | null;
  classTeacherId: string | null;
  capacity: number;
  students: Array<{ userId: string }>;
  createdAt: string;
};

type AcademicYear = {
  id: string;
  name: string;
  fromYear: string;
  toYear: string;
  isCurrent: boolean;
};

type Teacher = {
  id: string;
  name: string;
};

export default function AdminCoursesPage() {
  const [activeTab, setActiveTab] = useState<"courses" | "years">("courses");
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<ClassItem | null>(null);

  // Form States
  const [courseForm, setCourseForm] = useState({
    name: "",
    academicYearId: "",
    classTeacherId: "",
    capacity: 40,
  });

  const [yearForm, setYearForm] = useState({
    name: "",
    fromYear: "",
    toYear: "",
    isCurrent: false,
  });

  const [meta, setMeta] = useState<{
    years: AcademicYear[];
    teachers: Teacher[];
  }>({
    years: [],
    teachers: [],
  });

  useEffect(() => {
    loadData();
    loadMeta();
    // loadData/loadMeta are recreated each render but intentionally keyed by activeTab changes only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function fetchClasses() {
    const res = await fetch("/api/classes?limit=100");
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || "Gagal mengambil data kelas");
    }
    return data.classes ?? [];
  }

  async function fetchAcademicYears() {
    const res = await fetch("/api/academic-years?limit=100");
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || "Gagal mengambil data tahun akademik");
    }
    return data.years ?? [];
  }

  async function loadData() {
    setLoading(true);
    try {
      if (activeTab === "courses") {
        const data = await fetchClasses();
        setClasses(data);
      } else {
        const data = await fetchAcademicYears();
        setYears(data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function loadMeta() {
    try {
      const [yData, tRes] = await Promise.all([
        fetchAcademicYears(),
        fetch("/api/users?role=dosen"),
      ]);
      const tData = await tRes.json();
      setMeta({ years: yData || [], teachers: tData.users || [] });
    } catch {}
  }

  async function handleCourseSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: courseForm.name,
        academicYearId: courseForm.academicYearId,
        classTeacherId: courseForm.classTeacherId || null,
        capacity: courseForm.capacity,
      };

      let res;
      if (editingCourse) {
        res = await updateCourseAction(editingCourse.id, payload);
      } else {
        res = await createCourseAction(payload);
      }

      if (!res.success) throw new Error(res.error || "Gagal menyimpan kursus");

      setShowCourseModal(false);
      setEditingCourse(null);
      await loadData();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menyimpan kursus");
    } finally {
      setLoading(false);
    }
  }

  async function handleYearSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createAcademicYearAction({
        name: yearForm.name,
        fromYear: yearForm.fromYear,
        toYear: yearForm.toYear,
        isCurrent: yearForm.isCurrent,
      });

      if (!res.success)
        throw new Error(res.error || "Gagal menyimpan tahun akademik");
      setShowYearModal(false);
      await loadData();
      await loadMeta();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menyimpan tahun akademik");
    } finally {
      setLoading(false);
    }
  }

  async function deleteCourse(id: string) {
    if (!confirm("Hapus kursus ini?")) return;
    try {
      await deleteCourseAction(id);
      await loadData();
    } catch {}
  }

  async function deleteYear(id: string) {
    if (!confirm("Hapus tahun akademik ini?")) return;
    try {
      const res = await deleteAcademicYearAction(id);
      if (!res.success) {
        alert(res.error || "Gagal menghapus");
      } else {
        await loadData();
        await loadMeta();
      }
    } catch {}
  }

  async function setYearActive(id: string) {
    try {
      await setAcademicYearActiveAction(id);
      await loadData();
    } catch {}
  }

  return (
    <AdminLayout
      title="Manajemen Kursus & Akademik"
      subtitle="Kelola kurikulum, kelas, dan periode tahun ajaran."
      headerActions={
        <div className="row" style={{ gap: "0.5rem" }}>
          {activeTab === "courses" ? (
            <button
              className="btn"
              style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
              onClick={() => {
                setEditingCourse(null);
                setCourseForm({
                  name: "",
                  academicYearId: "",
                  classTeacherId: "",
                  capacity: 40,
                });
                setShowCourseModal(true);
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 16 }}
              >
                add_circle
              </span>
              Kursus Baru
            </button>
          ) : (
            <button
              className="btn"
              style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
              onClick={() => setShowYearModal(true)}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 16 }}
              >
                calendar_add_on
              </span>
              Tahun Baru
            </button>
          )}
        </div>
      }
    >
      {/* Tabs */}
      <div
        className="row"
        style={{
          marginBottom: "1.5rem",
          borderBottom: "1px solid var(--border)",
          gap: "1rem",
        }}
      >
        <button
          className={activeTab === "courses" ? "tab active" : "tab"}
          onClick={() => setActiveTab("courses")}
          style={{
            padding: "0.5rem 1rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontWeight: activeTab === "courses" ? 700 : 400,
            borderBottom:
              activeTab === "courses" ? "2px solid var(--primary)" : "none",
          }}
        >
          Daftar Kursus
        </button>
        <button
          className={activeTab === "years" ? "tab active" : "tab"}
          onClick={() => setActiveTab("years")}
          style={{
            padding: "0.5rem 1rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontWeight: activeTab === "years" ? 700 : 400,
            borderBottom:
              activeTab === "years" ? "2px solid var(--primary)" : "none",
          }}
        >
          Tahun Akademik
        </button>
      </div>

      {/* Modals */}
      {showCourseModal && (
        <div
          className="glass-panel"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 100,
            padding: "2rem",
            width: "min(500px, 90vw)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          }}
        >
          <h2 className="title-lg" style={{ marginBottom: "1.5rem" }}>
            {editingCourse ? "Edit Kursus" : "Buat Kursus Baru"}
          </h2>
          <form
            onSubmit={handleCourseSubmit}
            style={{ display: "grid", gap: "1rem" }}
          >
            <div className="input-group">
              <label className="input-label">Nama Kursus/Kelas</label>
              <input
                className="input"
                required
                value={courseForm.name}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, name: e.target.value })
                }
                placeholder="Contoh: Pemrograman Web A"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Tahun Akademik</label>
              <select
                className="select"
                required
                value={courseForm.academicYearId}
                onChange={(e) =>
                  setCourseForm({
                    ...courseForm,
                    academicYearId: e.target.value,
                  })
                }
              >
                <option value="">Pilih Tahun...</option>
                {meta.years.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Dosen Pengampu</label>
              <select
                className="select"
                value={courseForm.classTeacherId || ""}
                onChange={(e) =>
                  setCourseForm({
                    ...courseForm,
                    classTeacherId: e.target.value,
                  })
                }
              >
                <option value="">Pilih Dosen (Opsional)</option>
                {meta.teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Kapasitas Maksimal</label>
              <input
                type="number"
                className="input"
                value={courseForm.capacity}
                onChange={(e) =>
                  setCourseForm({
                    ...courseForm,
                    capacity: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div
              className="row"
              style={{
                marginTop: "1rem",
                justifyContent: "flex-end",
                gap: "0.5rem",
              }}
            >
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setShowCourseModal(false);
                  setEditingCourse(null);
                }}
              >
                Batal
              </button>
              <button type="submit" className="btn" disabled={loading}>
                Simpan Kursus
              </button>
            </div>
          </form>
        </div>
      )}

      {showYearModal && (
        <div
          className="glass-panel"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 100,
            padding: "2rem",
            width: "min(400px, 90vw)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          }}
        >
          <h2 className="title-lg" style={{ marginBottom: "1.5rem" }}>
            Tahun Akademik Baru
          </h2>
          <form
            onSubmit={handleYearSubmit}
            style={{ display: "grid", gap: "1rem" }}
          >
            <div className="input-group">
              <label className="input-label">
                Nama Tahun (e.g. 2024/2025 Ganjil)
              </label>
              <input
                className="input"
                required
                value={yearForm.name}
                onChange={(e) =>
                  setYearForm({ ...yearForm, name: e.target.value })
                }
              />
            </div>
            <div className="input-group">
              <label className="input-label">Dari Tanggal</label>
              <input
                type="date"
                className="input"
                required
                value={yearForm.fromYear}
                onChange={(e) =>
                  setYearForm({ ...yearForm, fromYear: e.target.value })
                }
              />
            </div>
            <div className="input-group">
              <label className="input-label">Sampai Tanggal</label>
              <input
                type="date"
                className="input"
                required
                value={yearForm.toYear}
                onChange={(e) =>
                  setYearForm({ ...yearForm, toYear: e.target.value })
                }
              />
            </div>
            <div
              className="row"
              style={{ gap: "0.5rem", alignItems: "center" }}
            >
              <input
                type="checkbox"
                id="isCurrent"
                checked={yearForm.isCurrent}
                onChange={(e) =>
                  setYearForm({ ...yearForm, isCurrent: e.target.checked })
                }
              />
              <label htmlFor="isCurrent" style={{ fontSize: "0.85rem" }}>
                Set sebagai Tahun Aktif
              </label>
            </div>
            <div
              className="row"
              style={{
                marginTop: "1rem",
                justifyContent: "flex-end",
                gap: "0.5rem",
              }}
            >
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setShowYearModal(false)}
              >
                Batal
              </button>
              <button type="submit" className="btn" disabled={loading}>
                Simpan Tahun
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Content */}
      <section className="neo-card" style={{ overflow: "hidden" }}>
        <div
          className="table-shell"
          style={{ border: "none", borderRadius: 0, boxShadow: "none" }}
        >
          {activeTab === "courses" ? (
            <table>
              <thead>
                <tr>
                  <th>Nama Kelas</th>
                  <th>Tahun Akademik</th>
                  <th>Dosen Pengampu</th>
                  <th>Siswa</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => (
                  <tr key={cls.id}>
                    <td>
                      <span style={{ fontWeight: 600 }}>{cls.name}</span>
                    </td>
                    <td>{cls.academicYear.name}</td>
                    <td style={{ color: "var(--text-soft)" }}>
                      {cls.classTeacher?.name || "Belum ditentukan"}
                    </td>
                    <td>
                      <span className="pill">
                        {cls.students.length}/{cls.capacity}
                      </span>
                    </td>
                    <td>
                      <div className="row" style={{ gap: "0.4rem" }}>
                        <button
                          className="btn-ghost"
                          style={{ padding: "0.3rem 0.6rem" }}
                          onClick={() => {
                            setEditingCourse(cls);
                            setCourseForm({
                              name: cls.name,
                              academicYearId: cls.academicYear.id, // Fixed: use cls.academicYear.id
                              classTeacherId: cls.classTeacherId || "",
                              capacity: cls.capacity,
                            });
                            setShowCourseModal(true);
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 16 }}
                          >
                            edit
                          </span>
                        </button>
                        <button
                          className="btn-ghost"
                          style={{
                            padding: "0.3rem 0.6rem",
                            color: "var(--rose)",
                          }}
                          onClick={() => deleteCourse(cls.id)}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 16 }}
                          >
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && classes.length === 0 && (
                  <tr>
                    <td colSpan={5}>Tidak ada kursus ditemukan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nama Tahun</th>
                  <th>Periode</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {years.map((y) => (
                  <tr key={y.id}>
                    <td>
                      <span style={{ fontWeight: 600 }}>{y.name}</span>
                    </td>
                    <td>
                      {new Date(y.fromYear).getFullYear()} -{" "}
                      {new Date(y.toYear).getFullYear()}
                    </td>
                    <td>
                      {y.isCurrent ? (
                        <span className="pill pill-success">Aktif</span>
                      ) : (
                        <span className="pill">Non-aktif</span>
                      )}
                    </td>
                    <td>
                      <div className="row" style={{ gap: "0.4rem" }}>
                        {!y.isCurrent && (
                          <button
                            className="btn-ghost"
                            style={{ padding: "0.3rem 0.6rem" }}
                            onClick={() => setYearActive(y.id)}
                          >
                            Set Aktif
                          </button>
                        )}
                        <button
                          className="btn-ghost"
                          style={{
                            padding: "0.3rem 0.6rem",
                            color: "var(--rose)",
                          }}
                          onClick={() => deleteYear(y.id)}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 16 }}
                          >
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && years.length === 0 && (
                  <tr>
                    <td colSpan={4}>Belum ada tahun akademik.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
          {loading && (
            <div style={{ padding: "2rem", textAlign: "center" }}>
              Memuat data...
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}
