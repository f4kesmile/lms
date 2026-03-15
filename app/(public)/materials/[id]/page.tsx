import { notFound } from "next/navigation";

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
      createdBy: { select: { name: true } },
      _count: { select: { chunks: true } },
    },
  });

  if (!material) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main
        className="app-shell"
        style={{ display: "grid", gap: "1.5rem", paddingBottom: "4rem" }}
      >
        <section
          className="neo-card"
          style={{ display: "grid", gap: "0.75rem" }}
        >
          <span className="eyebrow">Referensi Materi</span>
          <h1 className="title-lg">{material.title}</h1>
          <div className="row" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
            <span className="pill">Modul: {material.module}</span>
            {material.page && (
              <span className="pill">Halaman: {material.page}</span>
            )}
            <span className="pill">Chunk: {material._count.chunks}</span>
            <span className="pill">
              Penyusun: {material.createdBy?.name || "Admin"}
            </span>
          </div>
        </section>

        <section
          className="neo-card"
          style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}
        >
          {material.content}
        </section>
      </main>
    </>
  );
}
