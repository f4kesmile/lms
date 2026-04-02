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
    where: { academicYear: { isCurrent: true } },
    orderBy: { createdAt: "desc" },
    include: {
      subjects: {
        include: {
          subject: {
            select: {
              name: true,
              code: true,
              credits: true,
              teachers: {
                take: 1,
                select: { user: { select: { name: true } } },
              },
            },
          },
          teacher: { select: { name: true } },
        },
      },
      students: { select: { userId: true } },
    },
  });

  function formatTeacherDisplay(names: string[]) {
    if (names.length === 0) return "Belum ada dosen";
    if (names.length <= 2) return names.join(", ");
    return `${names.slice(0, 2).join(", ")} +${names.length - 2} dosen`;
  }

  const coursesWithKeyStatus = courses.map((course) => {
    const primarySubject = course.subjects[0];
    const subject = primarySubject?.subject;

    const assignedTeacherNames = Array.from(
      new Set(
        course.subjects
          .map((item) => item.teacher?.name)
          .filter((name): name is string => Boolean(name)),
      ),
    );

    const teacherName = formatTeacherDisplay(assignedTeacherNames);

    return {
      id: course.id,
      className: course.name,
      teacherName,
      subjectName: subject?.name || "Mata Kuliah Umum",
      subjectCode: subject?.code || "EDU-00",
      credits: subject?.credits || 2,
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
