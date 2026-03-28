import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import CourseCatalogBrowser from "@/features/courses/Catalog";
import { getCurrentUserIdFromCookie } from "@/lib/auth/index";
import { prisma } from "@/lib/core/db";

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function CourseCatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const userId = await getCurrentUserIdFromCookie();

  const courses = await prisma.class.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subjects: {
        select: {
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
      students: { select: { userId: true } },
    },
  });

  const coursesWithKeyStatus = courses.map((course) => {
    const teacherNames = Array.from(
      new Set(
        course.subjects
          .flatMap((subjectLink) => subjectLink.subject.teachers)
          .map((teacherLink) => teacherLink.user.name)
          .filter(Boolean),
      ),
    );

    return {
      id: course.id,
      name: course.name,
      teacherName:
        teacherNames.length > 0
          ? teacherNames.join(", ")
          : "Belum ada dosen pengampu",
      subjectName: course.subjects[0]?.subject.name || "Umum",
      subjectCode: course.subjects[0]?.subject.code || "",
      studentCount: course.students.length,
      isEnrolled:
        !!userId &&
        course.students.some((student) => student.userId === userId),
      requiresKey: !!course.enrollmentKey,
    };
  });

  return (
    <>
      <Navbar />
      <main className="app-shell flex flex-col gap-10 pb-20">
        <div className="catalog-header pb-4 border-b border-border">
          <h1 className="text-3xl font-black mb-2">Eksplorasi Kelas Akademik</h1>
          <p className="text-muted-foreground">
            Jelajahi kelas yang sedang dibuka, temukan pengajarnya, lalu daftar
            sesuai kebutuhan belajarmu.
          </p>
        </div>

        <CourseCatalogBrowser
          courses={coursesWithKeyStatus}
          initialQuery={q}
          isLoggedIn={!!userId}
        />
      </main>
      <Footer />
    </>
  );
}
