import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/layout/Navbar";
import { prisma } from "@/lib/core/db";
import {
  renderMaterialHtml,
  splitMaterialContent,
} from "@/lib/utils/material-content";

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

  const contentBlocks = splitMaterialContent(material.content);

  return (
    <>
      <Navbar />
      <main className="app-shell flex flex-col gap-6 pb-16">
        <section className="grid grid-cols-1 lg:grid-cols-[1.6fr_0.8fr] gap-4 items-start">
          <div className="neo-card flex flex-col gap-4 p-5 bg-gradient-to-br from-primary/10 to-card">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="eyebrow inline-block">Referensi Materi</span>
              <Link
                href="/courses"
                className="btn-ghost px-4 py-2 border border-border text-xs rounded hover:bg-muted"
              >
                Kembali ke Katalog Kelas
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="title-lg m-0">{material.title}</h1>
              <p className="text-muted-foreground leading-relaxed max-w-3xl text-sm">
                Materi ini dipakai sebagai referensi jawaban chatbot dan sumber
                belajar internal. Bacaan di bawah ditampilkan dalam format yang
                lebih nyaman agar sitasi chatbot bisa langsung kamu telusuri ke
                sumber aslinya.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {material.course && (
                <span className="pill text-xs">
                  Mata Kuliah: {material.course.code}
                </span>
              )}
              <span className="pill text-xs">Modul: {material.module}</span>
              {material.page && (
                <span className="pill text-xs">Halaman: {material.page}</span>
              )}
              <span className="pill text-xs">
                Chunk: {material._count.chunks}
              </span>
              <span className="pill text-xs">
                Penyusun: {material.createdBy?.name || "Admin"}
              </span>
            </div>
          </div>

          <aside className="neo-card flex flex-col gap-4 p-5">
            <span className="eyebrow inline-block">Ringkasan Referensi</span>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[0.72rem] uppercase tracking-widest text-muted-foreground font-black">
                  Judul
                </span>
                <span className="font-bold text-sm">{material.title}</span>
              </div>

              {material.course && (
                <div className="flex flex-col gap-1">
                  <span className="text-[0.72rem] uppercase tracking-widest text-muted-foreground font-black">
                    Mata Kuliah
                  </span>
                  <span className="font-bold text-sm">
                    {material.course.code} - {material.course.title}
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <span className="text-[0.72rem] uppercase tracking-widest text-muted-foreground font-black">
                  Cakupan
                </span>
                <span className="font-bold text-sm">
                  {contentBlocks.length} blok bacaan
                </span>
              </div>

              {siblingMaterials.length > 1 && (
                <div className="flex flex-col gap-1">
                  <span className="text-[0.72rem] uppercase tracking-widest text-muted-foreground font-black">
                    Posisi Materi
                  </span>
                  <span className="font-bold text-sm">
                    {currentIndex + 1} dari {siblingMaterials.length} materi
                    dalam mata kuliah ini
                  </span>
                </div>
              )}
            </div>
          </aside>
        </section>

        {(previousMaterial || nextMaterial) && (
          <section className="neo-card flex flex-col gap-4 p-5">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[0.72rem] uppercase tracking-widest text-muted-foreground font-black">
                  Navigasi Materi
                </span>
                <span className="font-bold text-sm">
                  Lanjutkan membaca materi terkait dalam mata kuliah yang sama
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {previousMaterial ? (
                <Link
                  href={`/materials/${previousMaterial.id}` as Route}
                  className="btn-ghost flex flex-col items-start gap-1 p-4 border border-border rounded-xl hover:bg-muted text-left"
                >
                  <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground font-black">
                    Materi Sebelumnya
                  </span>
                  <span className="font-bold text-sm">
                    {previousMaterial.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {previousMaterial.module}
                  </span>
                </Link>
              ) : (
                <div className="flex items-center justify-center p-4 border border-dashed border-border rounded-xl text-muted-foreground text-sm">
                  Tidak ada materi sebelumnya.
                </div>
              )}

              {nextMaterial ? (
                <Link
                  href={`/materials/${nextMaterial.id}` as Route}
                  className="btn-ghost flex flex-col items-start gap-1 p-4 border border-border rounded-xl hover:bg-muted text-left"
                >
                  <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground font-black">
                    Materi Berikutnya
                  </span>
                  <span className="font-bold text-sm">
                    {nextMaterial.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {nextMaterial.module}
                  </span>
                </Link>
              ) : (
                <div className="flex items-center justify-center p-4 border border-dashed border-border rounded-xl text-muted-foreground text-sm">
                  Tidak ada materi berikutnya.
                </div>
              )}
            </div>
          </section>
        )}

        <section className="neo-card flex flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[0.72rem] uppercase tracking-widest text-muted-foreground font-black">
                Konten Materi
              </span>
              <span className="font-bold text-sm text-foreground">
                Dibagi menjadi blok bacaan yang lebih nyaman dibaca
              </span>
            </div>
            <span className="pill">{contentBlocks.length} blok</span>
          </div>

          <div className="flex flex-col gap-4">
            {contentBlocks.map((block, index) => (
              <article
                key={`${material.id}-block-${index}`}
                className={`flex flex-col gap-2 p-4 border border-border rounded-xl ${
                  index % 2 === 0 ? "bg-card" : "bg-primary/5"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="eyebrow text-[0.68rem] m-0">
                    Blok {index + 1}
                  </span>
                  <span className="text-[0.76rem] font-bold text-muted-foreground">
                    Referensi chatbot
                  </span>
                </div>

                <div
                  className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 w-full text-foreground/90 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: renderMaterialHtml(block),
                  }}
                />
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
