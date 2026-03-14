"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { formatDate } from "@/lib/utils";

type Material = {
  id: string;
  title: string;
  module: string;
  page: string | null;
  createdAt: string;
  _count: { chunks: number };
};

export default function KnowledgeAdminPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    module: "",
    page: "",
    content: "",
  });

  async function loadMaterials() {
    const response = await fetch("/api/kb/materials");
    const data = await response.json();
    if (response.ok) {
      setMaterials(data.materials ?? []);
    }
  }

  useEffect(() => {
    loadMaterials();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/kb/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Gagal menyimpan materi");

      setMessage("Materi berhasil disimpan ke knowledge base.");
      setForm({ title: "", module: "", page: "", content: "" });
      await loadMaterials();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function removeMaterial(id: string) {
    await fetch(`/api/kb/materials/${id}`, { method: "DELETE" });
    await loadMaterials();
  }

  return (
    <AdminLayout
      title="Manajemen Knowledge Base"
      subtitle="Kelola dokumen referensi untuk chatbot akademik."
    >
      <section className="admin-grid-2">
        <article className="neo-card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
          <h2 className="title-lg">Input Dokumen Materi</h2>
          <form onSubmit={submit} style={{ display: "grid", gap: "1rem" }}>
            <div>
              <label className="input-label">Judul Materi</label>
              <input
                className="input"
                placeholder="Judul materi"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="input-label">Modul</label>
              <input
                className="input"
                placeholder="Modul"
                value={form.module}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, module: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="input-label">Halaman (opsional)</label>
              <input
                className="input"
                placeholder="Halaman"
                value={form.page}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, page: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="input-label">Isi Materi</label>
              <textarea
                className="textarea"
                placeholder="Isi materi lengkap"
                value={form.content}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, content: e.target.value }))
                }
                rows={7}
              />
            </div>
            <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
              <button className="btn" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan ke Knowledge Base"}
              </button>
              {message && <p className="text-muted" style={{ fontSize: "0.85rem" }}>{message}</p>}
            </div>
          </form>
        </article>

        <aside style={{ display: "grid", gap: "1rem", alignContent: "start" }}>
          <article className="stat-card">
            <div className="row" style={{ gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: 20 }}>
                library_books
              </span>
              <p className="text-dim" style={{ fontSize: "0.85rem" }}>Total materi</p>
            </div>
            <p className="stat-value">{materials.length}</p>
          </article>
          <article className="stat-card">
            <div className="row" style={{ gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: 20 }}>
                dataset
              </span>
              <p className="text-dim" style={{ fontSize: "0.85rem" }}>Total chunks</p>
            </div>
            <p className="stat-value">
              {materials.reduce((sum, item) => sum + item._count.chunks, 0)}
            </p>
          </article>
          <article className="stat-card">
            <div className="row" style={{ gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: 20 }}>
                folder_open
              </span>
              <p className="text-dim" style={{ fontSize: "0.85rem" }}>Modul unik</p>
            </div>
            <p className="stat-value">
              {new Set(materials.map((item) => item.module)).size}
            </p>
          </article>
        </aside>
      </section>

      <section className="neo-card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-primary)" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Daftar Materi</h2>
        </div>
        <div className="table-shell" style={{ border: "none", borderRadius: 0, boxShadow: "none" }}>
          <table>
            <thead>
              <tr>
                <th>Judul</th>
                <th>Modul</th>
                <th>Halaman</th>
                <th>Chunks</th>
                <th>Dibuat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 500 }}>{item.title}</td>
                  <td><span className="pill">{item.module}</span></td>
                  <td style={{ color: "var(--text-dim)" }}>{item.page ?? "-"}</td>
                  <td>{item._count.chunks}</td>
                  <td style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>
                    {formatDate(item.createdAt, { day: "numeric", month: "numeric", year: "numeric" })}
                  </td>
                  <td>
                    <button
                      className="btn-danger"
                      type="button"
                      onClick={() => removeMaterial(item.id)}
                      style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {materials.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-muted">
                    Belum ada materi tersimpan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}
