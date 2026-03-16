import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";

import { Navbar } from "@/components/layout/Navbar";
import { prisma } from "@/lib/prisma";

type MaterialDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MaterialDetailPage({
  params,
}: MaterialDetailPageProps) {
  const { id } = await params;
  const material = await prisma.courseMaterial.findUnique({
    where: { id },
    include: {
      course: { select: { id: true, code: true, title: true } },
      createdBy: { select: { name: true } },
      _count: { select: { chunks: true } },
    },
  });

  if (!material) {
    notFound();
  }

  const siblingMaterials = material.course?.id
    ? await prisma.courseMaterial.findMany({
        where: { courseId: material.course.id },
        select: {
          id: true,
          title: true,
          module: true,
        },
        orderBy: [{ module: "asc" }, { createdAt: "asc" }, { title: "asc" }],
        take: 50,
      })
    : [];

  const currentIndex = siblingMaterials.findIndex(
    (item) => item.id === material.id,
  );
  const previousMaterial =
    currentIndex > 0 ? siblingMaterials[currentIndex - 1] : null;
  const nextMaterial =
    currentIndex >= 0 && currentIndex < siblingMaterials.length - 1
      ? siblingMaterials[currentIndex + 1]
      : null;

  const contentBlocks = material.content
    .split(/\n\n=== HALAMAN BARU ===\n\n|\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <>
      <Navbar />
      <main
        className="app-shell"
        style={{ display: "grid", gap: "1.5rem", paddingBottom: "4rem" }}
      >
        <section
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "minmax(0, 1.6fr) minmax(260px, 0.8fr)",
            alignItems: "start",
          }}
        >
          <div
            className="neo-card"
            style={{
              display: "grid",
              gap: "0.9rem",
              padding: "1.2rem 1.1rem",
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--primary) 9%, white), var(--bg-card))",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <span className="eyebrow">Referensi Materi</span>
              <Link
                href="/courses"
                className="btn-ghost"
                style={{ padding: "0.45rem 0.8rem", fontSize: "0.8rem" }}
              >
                Kembali ke Katalog Kelas
              </Link>
            </div>
            <div style={{ display: "grid", gap: "0.6rem" }}>
              <h1 className="title-lg" style={{ margin: 0 }}>
                {material.title}
              </h1>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-soft)",
                  lineHeight: 1.65,
                  maxWidth: 760,
                }}
              >
                Materi ini dipakai sebagai referensi jawaban chatbot dan sumber
                belajar internal. Bacaan di bawah ditampilkan dalam format yang
                lebih nyaman agar sitasi chatbot bisa langsung kamu telusuri ke
                sumber aslinya.
              </p>
            </div>
            <div className="row" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
              {material.course && (
                <span className="pill">
                  Mata Kuliah: {material.course.code}
                </span>
              )}
              <span className="pill">Modul: {material.module}</span>
              {material.page && (
                <span className="pill">Halaman: {material.page}</span>
              )}
              <span className="pill">Chunk: {material._count.chunks}</span>
              <span className="pill">
                Penyusun: {material.createdBy?.name || "Admin"}
              </span>
            </div>
          </div>

          <aside
            className="neo-card"
            style={{ padding: "1rem", display: "grid", gap: "0.8rem" }}
          >
            <span className="eyebrow">Ringkasan Referensi</span>
            <div style={{ display: "grid", gap: "0.55rem" }}>
              <div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--text-dim)",
                    fontWeight: 800,
                  }}
                >
                  Judul
                </div>
                <div style={{ fontWeight: 700 }}>{material.title}</div>
              </div>
              {material.course && (
                <div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--text-dim)",
                      fontWeight: 800,
                    }}
                  >
                    Mata Kuliah
                  </div>
                  <div style={{ fontWeight: 700 }}>
                    {material.course.code} - {material.course.title}
                  </div>
                </div>
              )}
              <div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--text-dim)",
                    fontWeight: 800,
                  }}
                >
                  Cakupan
                </div>
                <div style={{ fontWeight: 700 }}>
                  {contentBlocks.length} blok bacaan
                </div>
              </div>
              {siblingMaterials.length > 1 && (
                <div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--text-dim)",
                      fontWeight: 800,
                    }}
                  >
                    Posisi Materi
                  </div>
                  <div style={{ fontWeight: 700 }}>
                    {currentIndex + 1} dari {siblingMaterials.length} materi
                    dalam mata kuliah ini
                  </div>
                </div>
              )}
            </div>
          </aside>
        </section>

        {(previousMaterial || nextMaterial) && (
          <section
            className="neo-card"
            style={{ padding: "1rem", display: "grid", gap: "0.9rem" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--text-dim)",
                    fontWeight: 800,
                  }}
                >
                  Navigasi Materi
                </div>
                <div style={{ fontWeight: 700 }}>
                  Lanjutkan membaca materi terkait dalam mata kuliah yang sama
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "0.8rem",
              }}
            >
              {previousMaterial ? (
                <Link
                  href={`/materials/${previousMaterial.id}` as Route}
                  className="btn-ghost"
                  style={{
                    justifyContent: "space-between",
                    padding: "0.9rem",
                    display: "grid",
                    gap: "0.3rem",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      color: "var(--text-dim)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Materi Sebelumnya
                  </span>
                  <span style={{ fontWeight: 700 }}>
                    {previousMaterial.title}
                  </span>
                  <span
                    style={{ fontSize: "0.8rem", color: "var(--text-soft)" }}
                  >
                    {previousMaterial.module}
                  </span>
                </Link>
              ) : (
                <div
                  style={{
                    border: "1px dashed var(--border-primary)",
                    borderRadius: 12,
                    padding: "0.9rem",
                    color: "var(--text-dim)",
                    fontSize: "0.85rem",
                  }}
                >
                  Tidak ada materi sebelumnya.
                </div>
              )}

              {nextMaterial ? (
                <Link
                  href={`/materials/${nextMaterial.id}` as Route}
                  className="btn-ghost"
                  style={{
                    justifyContent: "space-between",
                    padding: "0.9rem",
                    display: "grid",
                    gap: "0.3rem",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      color: "var(--text-dim)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Materi Berikutnya
                  </span>
                  <span style={{ fontWeight: 700 }}>{nextMaterial.title}</span>
                  <span
                    style={{ fontSize: "0.8rem", color: "var(--text-soft)" }}
                  >
                    {nextMaterial.module}
                  </span>
                </Link>
              ) : (
                <div
                  style={{
                    border: "1px dashed var(--border-primary)",
                    borderRadius: 12,
                    padding: "0.9rem",
                    color: "var(--text-dim)",
                    fontSize: "0.85rem",
                  }}
                >
                  Tidak ada materi berikutnya.
                </div>
              )}
            </div>
          </section>
        )}

        <section
          className="neo-card"
          style={{ display: "grid", gap: "1rem", padding: "1rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--text-dim)",
                  fontWeight: 800,
                }}
              >
                Konten Materi
              </div>
              <div style={{ fontWeight: 700, color: "var(--text-main)" }}>
                Dibagi menjadi blok bacaan yang lebih nyaman dibaca
              </div>
            </div>
            <span className="pill">{contentBlocks.length} blok</span>
          </div>

          <div style={{ display: "grid", gap: "0.9rem" }}>
            {contentBlocks.map((block, index) => (
              <article
                key={`${material.id}-block-${index}`}
                style={{
                  border: "1px solid var(--border-primary)",
                  borderRadius: 12,
                  padding: "0.95rem 1rem",
                  background:
                    index % 2 === 0
                      ? "var(--bg-card)"
                      : "color-mix(in srgb, var(--primary) 4%, white)",
                  display: "grid",
                  gap: "0.55rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <span className="eyebrow" style={{ fontSize: "0.68rem" }}>
                    Blok {index + 1}
                  </span>
                  <span
                    style={{
                      fontSize: "0.76rem",
                      color: "var(--text-dim)",
                      fontWeight: 700,
                    }}
                  >
                    Referensi chatbot
                  </span>
                </div>
                <div
                  style={{
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.8,
                    color: "var(--text-main)",
                    fontSize: "0.98rem",
                  }}
                >
                  {block}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
