import { getCurrentUserIdFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/core/db";

export type CourseSubjectView = {
  id: string;
  name: string;
  code: string;
  credits: number;
  teacherName: string;
  dayOfWeek: string | null;
  startTime: string | null;
  endTime: string | null;
  room: string | null;
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

export async function getCourseDetailView(
  classId: string,
): Promise<CourseDetailView> {
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
            teacher: { select: { name: true } },
            subject: {
              include: {
                _count: { select: { meetings: true } },
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
        .map((item) => item.teacher?.name)
        .filter((name): name is string => Boolean(name))
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
        credits: item.subject.credits,
        teacherName: item.teacher?.name || "Belum ada dosen",
        dayOfWeek: item.dayOfWeek,
        startTime: item.startTime,
        endTime: item.endTime,
        room: item.room,
        meetingCount: item.subject._count.meetings,
        banner: item.subject.bannerImage,
      })) ?? [],
  };
}
