import { getCurrentUserIdFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/core/db";

export type CourseSubjectView = {
  id: string;
  name: string;
  code: string;
  meetingCount: number;
  banner: string | null;
};

export type CourseDetailView = {
  classId: string;
  title: string;
  year: string;
  teacherNames: string[];
  studentCount: number;
  capacity: number;
  isOpen: boolean;
  isLoggedIn: boolean;
  isEnrolled: boolean;
  requiresKey: boolean;
  subjects: CourseSubjectView[];
};

export async function getCourseDetailView(classId: string): Promise<CourseDetailView> {
  const [course, userId] = await Promise.all([
    prisma.class.findFirst({
      where: {
        OR: [
          { id: classId },
          { name: { contains: classId, mode: "insensitive" } },
        ],
      },
      include: {
        students: { select: { userId: true } },
        subjects: {
          include: {
            subject: {
              include: {
                _count: { select: { meetings: true } },
                teachers: {
                  include: {
                    user: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
        academicYear: { select: { name: true } },
      },
    }),
    getCurrentUserIdFromCookie(),
  ]);

  const teacherNames = Array.from(
    new Set(
      (course?.subjects ?? [])
        .flatMap((item) => item.subject.teachers)
        .map((item) => item.user.name)
        .filter(Boolean),
    ),
  );

  const studentCount = course?.students.length ?? 0;
  const capacity = course?.capacity ?? 0;

  return {
    classId,
    title: course?.name ?? "Kelas Tidak Ditemukan",
    year: course?.academicYear?.name ?? "Tahun Ajaran Aktif",
    teacherNames,
    studentCount,
    capacity,
    isOpen: studentCount < capacity,
    isLoggedIn: !!userId,
    isEnrolled: course?.students.some((s) => s.userId === userId) ?? false,
    requiresKey: !!course?.enrollmentKey,
    subjects:
      course?.subjects.map((item) => ({
        id: item.subject.id,
        name: item.subject.name,
        code: item.subject.code,
        meetingCount: item.subject._count.meetings,
        banner: item.subject.bannerImage,
      })) ?? [],
  };
}
