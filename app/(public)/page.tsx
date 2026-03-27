import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import type { Route } from "next";
import Image from "next/image";
import { prisma } from "@/lib/core/db";
import { StatBox } from "@/components/ui/statbox";
import { SectionHeader } from "@/components/ui/header";
import { Icon } from "@/components/ui/icon";

export default async function HomePage() {
  const [userCount, classCount, materialCount] = await Promise.all([
    prisma.user.count(),
    prisma.class.count(),
    prisma.courseMaterial.count(),
  ]);

  const featuredClasses = await prisma.class.findMany({
    take: 4,
    orderBy: { createdAt: "desc" },
    include: {
      subjects: { select: { subject: { select: { name: true } } } },
      students: { select: { userId: true } },
    },
  });

  const gradients = [
    "var(--catalog-gradient-1)",
    "var(--catalog-gradient-2)",
    "var(--catalog-gradient-3)",
    "var(--catalog-gradient-4)",
  ];

  return (
    <>
      <Navbar />

      <main className="app-shell flex flex-col gap-14 pb-20">
        <section className="public-hero">
          <div className="public-hero-text">
            <h1 className="public-hero-title">
              Masa Depan Belajar
              <br />
              <span className="highlight text-primary">dengan Asisten AI</span>
            </h1>
            <p className="public-hero-subtitle">
              Tingkatkan pengalaman belajar Anda dengan platform e-learning
              interaktif terkemuka. Akses ribuan modul dari dosen terbaik,
              didukung kecerdasan buatan.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <Link href="/courses" className="btn px-8 py-3 text-base">
                Eksplorasi Kelas
              </Link>
              <Link
                href="/register"
                className="btn-ghost border border-border px-8 py-3 text-base hover:bg-muted"
              >
                Daftar Akun Gratis
              </Link>
            </div>
          </div>
          <div className="public-hero-img">
            <Image
              src="/hero-illustration.png"
              alt="Hero Illustration"
              width={600}
              height={450}
              priority
              className="object-cover w-full h-full"
            />
          </div>
        </section>

        <section className="stats-row">
          <StatBox
            icon="groups"
            label="Mahasiswa Aktif"
            value={`${userCount.toLocaleString("id-ID")}+`}
          />
          <StatBox
            icon="school"
            label="Kelas Tersedia"
            value={`${classCount.toLocaleString("id-ID")}+`}
          />
          <StatBox
            icon="library_books"
            label="Modul Belajar"
            value={`${materialCount.toLocaleString("id-ID")}+`}
          />
        </section>

        <section className="flex flex-col gap-6">
          <SectionHeader
            title="Kelas Unggulan"
            actionText="Lihat Semua"
            actionHref="/courses"
          />

          <div className="course-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredClasses.length === 0 ? (
              <p className="text-muted-foreground col-span-full text-center p-12">
                Belum ada kelas tersedia.
              </p>
            ) : (
              featuredClasses.map((cls, idx) => {
                const subjectName = cls.subjects[0]?.subject.name || "Umum";
                const mockIcon = [
                  "science",
                  "psychology",
                  "terminal",
                  "language",
                ][idx % 4];

                return (
                  <article key={cls.id} className="catalog-card">
                    <div
                      className="catalog-card-img"
                      style={{ background: gradients[idx % 4] }}
                    >
                      <Icon
                        name={mockIcon}
                        size={56}
                        className="text-white opacity-90"
                      />
                    </div>
                    <div className="catalog-card-body">
                      <p className="catalog-card-category">{subjectName}</p>
                      <h3 className="catalog-card-title">{cls.name}</h3>
                      <div className="mt-auto pt-3">
                        <Link
                          href={`/courses/${cls.id}` as Route}
                          className="btn w-full text-center block py-2"
                        >
                          Lihat Detail
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
