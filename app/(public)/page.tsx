import { Calendar, Users } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/header";
import { Icon } from "@/components/ui/icon";
import { StatBox } from "@/components/ui/statbox";
import { prisma } from "@/lib/core/db";
import { getInitials } from "@/lib/utils";

export default async function HomePage() {
  const [userCount, classCount, materialCount] = await Promise.all([
    prisma.user.count(),
    prisma.class.count(),
    prisma.courseMaterial.count(),
  ]);

  const featuredClasses = await prisma.class.findMany({
    take: 3,
    where: {
      academicYear: { isCurrent: true },
    },
    orderBy: {
      students: { _count: "desc" },
    },
    include: {
      subjects: {
        include: {
          teacher: { select: { name: true } },
          subject: { select: { name: true, code: true } },
        },
      },
      students: { select: { userId: true } },
      academicYear: { select: { name: true } },
    },
  });

  function formatTeacherDisplay(names: string[]) {
    if (names.length === 0) return "Belum ada Dosen";
    if (names.length <= 2) return names.join(", ");
    return `${names.slice(0, 2).join(", ")} +${names.length - 2} Dosen`;
  }

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

        <section className="flex w-full flex-col gap-10">
          <SectionHeader
            title="Kelas Unggulan"
            subtitle="Paling banyak diminati mahasiswa semester ini"
            actionText="Lihat Semua Kelas"
            actionHref="/courses"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredClasses.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-border/50 rounded-[3rem] bg-muted/20">
                <p className="text-muted-foreground font-bold">
                  Belum ada kelas tersedia saat ini.
                </p>
              </div>
            ) : (
              featuredClasses.map((cls) => {
                const assignedTeacherNames = Array.from(
                  new Set(
                    cls.subjects
                      .map((item) => item.teacher?.name)
                      .filter((name): name is string => Boolean(name)),
                  ),
                );

                const teacherName = formatTeacherDisplay(assignedTeacherNames);
                const studentCount = cls.students.length;

                return (
                  <Card
                    key={cls.id}
                    className="group border-border/60 shadow-sm hover:shadow-2xl transition-all h-full flex flex-col rounded-[2.5rem] overflow-hidden bg-card/50"
                  >
                    <CardHeader className="space-y-4 pb-4 px-8 pt-8">
                      <CardTitle className="text-2xl font-black tracking-tighter leading-none group-hover:text-primary transition-all text-left">
                        {cls.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-3 pt-2 text-[11px] font-bold text-foreground">
                        <div className="h-8 w-8 rounded-full bg-muted border flex items-center justify-center text-[10px] font-bold text-muted-foreground shadow-inner">
                          {getInitials(teacherName)}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-muted-foreground/60 text-[8px] uppercase tracking-widest leading-none mb-1">
                            Tim Pengajar Kelas
                          </span>
                          <span className="line-clamp-1 italic">
                            {teacherName}
                          </span>
                        </div>
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 space-y-6 px-8">
                      <div className="grid grid-cols-1 gap-4 py-4 border-y border-dashed">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-2xl bg-secondary/50 flex items-center justify-center">
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[8px] uppercase font-bold text-muted-foreground/60 leading-none mb-1">
                              Mahasiswa Terdaftar
                            </span>
                            <span className="text-xs font-black">
                              {studentCount} Terdaftar
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 pb-2">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-primary" />
                          {cls.academicYear.name}
                        </span>
                      </div>
                    </CardContent>

                    <CardFooter className="px-8 pb-8">
                      <Link
                        href={`/courses/${cls.id}` as Route}
                        className="btn w-full h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-primary/10"
                      >
                        Lihat Detail Kelas
                        <Icon name="arrow_forward" size={16} />
                      </Link>
                    </CardFooter>
                  </Card>
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
