import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import type { Route } from "next";
import { prisma } from "@/lib/core/db";
import { getCurrentUserIdFromCookie } from "@/lib/auth";
import EnrollButton from "@/features/courses/EnrollButton";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type CourseDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { id } = await params;
  const course = await prisma.class.findFirst({
    where: {
      OR: [{ id }, { name: { contains: id, mode: "insensitive" } }],
    },
    include: {
      students: { select: { userId: true } },
      subjects: {
        include: {
          subject: {
            select: {
              name: true,
              code: true,
              teachers: {
                select: {
                  user: { select: { name: true } },
                },
              },
            },
          },
        },
      },
      academicYear: { select: { name: true } },
    },
  });

  const userId = await getCurrentUserIdFromCookie();
  const isEnrolled = course?.students.some((s) => s.userId === userId) ?? false;
  const isLoggedIn = !!userId;
  const requiresKey = !!course?.enrollmentKey;

  const title = course?.name ?? "Kelas Tidak Ditemukan";
  const year = course?.academicYear?.name ?? "Tahun Ajaran Aktif";
  const teacherNames = Array.from(
    new Set(
      (course?.subjects ?? [])
        .flatMap((item) => item.subject.teachers)
        .map((item) => item.user.name)
        .filter(Boolean),
    ),
  );
  const teacher =
    teacherNames.length > 0
      ? teacherNames.join(", ")
      : "Belum ada dosen pengampu mata kuliah";
  const studentCount = course?.students.length ?? 0;
  const capacity = course?.capacity ?? 0;
  const subjectList: Array<{ name: string; code: string }> =
    course?.subjects.map((item) => ({
      name: item.subject.name,
      code: item.subject.code,
    })) ?? [];
  const isOpen = studentCount < capacity;

  const subjectCodes = subjectList
    .map((subject) => subject.code)
    .filter(Boolean);
  const subjectNames = subjectList
    .map((subject) => subject.name)
    .filter(Boolean);

  const courseWithMaterials =
    subjectList.length > 0
      ? await prisma.course.findMany({
          where: {
            OR: [
              { code: { in: subjectCodes } },
              { title: { in: subjectNames } },
            ],
          },
          select: {
            code: true,
            title: true,
            materials: {
              select: {
                id: true,
                title: true,
                module: true,
              },
              orderBy: [{ updatedAt: "desc" }],
              take: 1,
            },
          },
        })
      : [];

  const materialByCode = new Map(
    courseWithMaterials
      .filter((courseItem) => courseItem.materials[0])
      .map((courseItem) => [courseItem.code, courseItem.materials[0]]),
  );

  const materialByTitle = new Map(
    courseWithMaterials
      .filter((courseItem) => courseItem.materials[0])
      .map((courseItem) => [
        courseItem.title.toLowerCase(),
        courseItem.materials[0],
      ]),
  );

  const subjectMaterialLinks = subjectList
    .map((subject) => {
      const material =
        materialByCode.get(subject.code) ||
        materialByTitle.get(subject.name.toLowerCase()) ||
        null;

      return {
        ...subject,
        material,
      };
    })
    .filter((item) => item.material);

  const featuredMaterial = subjectMaterialLinks[0]?.material ?? null;

  return (
    <>
      <Navbar />
      <main className="app-shell flex flex-col gap-8 pb-16">
        <nav className="flex items-center gap-2 text-[0.85rem] text-muted-foreground">
          <Link href="/" className="text-primary hover:underline">
            Beranda
          </Link>
          <Icon name="chevron_right" size={16} />
          <Link href="/courses" className="hover:underline">Kelas Saya</Link>
          <Icon name="chevron_right" size={16} />
          <span className="text-foreground font-semibold">{title}</span>
        </nav>

        <div className="grid-2 items-start lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-8">
            <article className="neo-card overflow-hidden">
              <div className="relative flex h-[200px] items-end bg-gradient-to-br from-surface-primary-soft to-brand-heavy p-6">
                <div className="relative z-10 flex flex-col gap-2">
                  <span className="eyebrow inline-block">Kelas Aktif</span>
                  <h1 className="title-xl text-2xl md:text-3xl">
                    {title}
                  </h1>
                  <p className="text-muted-foreground text-[0.85rem] font-medium">
                    {subjectList.length > 0 ? subjectList[0].code : "Umum"} · {year}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 p-5">
                <span className="pill flex items-center gap-2">
                  <Icon name="person" size={16} />
                  {teacherNames.length > 0
                    ? `${teacherNames.length} Dosen Pengampu`
                    : "Belum ada Dosen Pengampu"}
                </span>
                <span className="pill flex items-center gap-2">
                  <Icon name="group" size={16} />
                  {studentCount} Mahasiswa Terdaftar
                </span>
                <span className="pill flex items-center gap-2">
                  <Icon name="library_books" size={16} />
                  {subjectList.length} Mata Pelajaran
                </span>
              </div>
            </article>

            <section className="flex flex-col gap-4">
              <h2 className="title-lg">Informasi Kelas</h2>
              <p className="text-muted-foreground leading-relaxed text-[0.95rem]">
                Kelas <strong>{title}</strong> merupakan bagian dari tahun
                ajaran {year}. Mata kuliah pada kelas ini diampu oleh {teacher}
                dan dapat menampung hingga {capacity} mahasiswa.
              </p>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="title-lg">Daftar Mata Pelajaran</h2>
              <div className="flex flex-col gap-3">
                {subjectList.length > 0 ? (
                  subjectList.map((subject, idx) => {
                    const material =
                      materialByCode.get(subject.code) ||
                      materialByTitle.get(subject.name.toLowerCase()) ||
                      null;

                    const ContentWrapper = material ? Link : "div";
                    const wrapperProps = material
                      ? { href: `/materials/${material.id}` as Route }
                      : {};

                    return material ? (
                      <Link
                        href={`/materials/${material.id}` as Route}
                        key={subject.code}
                        className={cn(
                          "row p-4 border border-border rounded-md bg-card flex items-center justify-between gap-4 transition-colors",
                          "hover:border-primary hover:bg-muted cursor-pointer"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-primary-soft text-[0.75rem] font-bold text-primary">
                            {idx + 1}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-[0.9rem] text-foreground">
                              {subject.name}
                            </span>
                            <span className="text-[0.75rem] text-muted-foreground">
                              Kode: {subject.code} · {material ? "Buka materi" : "Materi belum tersedia"}
                            </span>
                          </div>
                        </div>
                        <Icon name="chevron_right" size={20} className="text-muted-foreground" />
                      </Link>
                    ) : (
                      <div
                        key={subject.code}
                        className={cn(
                          "row p-4 border border-border rounded-md bg-card flex items-center justify-between gap-4 transition-colors"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-primary-soft text-[0.75rem] font-bold text-primary">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">
                              {subject.name}
                            </div>
                            <div className="text-sm text-foreground-soft">
                              {subject.code}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-muted">
                            {/* Assuming subject.credits is a number or string, adjust as needed */}
                            {/* {subject.credits} SKS */}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="row flex items-center justify-center rounded-md border border-dashed border-border p-6">
                    <span className="text-muted-foreground">Belum ada mata pelajaran.</span>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="neo-card flex flex-col gap-4 p-6">
              <h3 className="text-[0.85rem] font-bold uppercase tracking-widest text-muted-foreground">
                Status Pendaftaran
              </h3>
              
              <div className="flex flex-col gap-1">
                <p className="text-[0.8rem] text-muted-foreground">Ketersediaan Kelas</p>
                <p className={cn("text-lg font-bold", isOpen ? "text-primary" : "text-destructive")}>
                  {isOpen ? "Pendaftaran Terbuka" : "Kelas Penuh"}
                </p>
              </div>
              
              <div className="flex flex-col gap-2 text-[0.85rem]">
                <div className="row flex items-center gap-2">
                  <Icon name="people" size={18} className="text-muted-foreground" />
                  <span className="text-muted-foreground font-medium">
                    Kapasitas: {studentCount} / {capacity} Terisi
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 mt-2">
                <EnrollButton
                  classId={id}
                  isLoggedIn={isLoggedIn}
                  isEnrolled={isEnrolled}
                  requiresKey={requiresKey}
                />
                {featuredMaterial && (
                  <Link
                    href={`/materials/${featuredMaterial.id}` as Route}
                    className="btn-ghost flex w-full items-center justify-center rounded-md border border-border px-4 py-2 text-[0.85rem] font-bold transition-colors hover:bg-muted"
                  >
                    Buka Materi Kelas
                  </Link>
                )}
              </div>
            </div>

            <div className="neo-card flex flex-col gap-4 p-6">
              <h3 className="font-bold">Materi Pendukung</h3>
              {subjectMaterialLinks.length > 0 ? (
                subjectMaterialLinks.map((subject) => (
                  <Link
                    key={`${subject.code}-${subject.material?.id}`}
                    href={`/materials/${subject.material!.id}` as Route}
                    className="doc-card block"
                  >
                    <strong className="block text-[0.9rem] mb-1">
                      {subject.name}
                    </strong>
                    <p className="text-[0.8rem] text-muted-foreground">
                      Kode: {subject.code} · {subject.material!.module}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-[0.85rem] text-muted-foreground">
                  Belum ada materi yang terhubung untuk kelas ini.
                </p>
              )}
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
