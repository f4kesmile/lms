import { DayOfWeek, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { getCurrentUser, hasRole } from "@/lib/auth/user";
import { badRequest, forbidden, serverError, unauthorized } from "@/lib/core/http";
import { prisma } from "@/lib/core/db";

function getWeekRange(date = new Date()) {
  const base = new Date(date);
  const day = base.getDay();
  const mondayDiff = day === 0 ? -6 : 1 - day;

  const start = new Date(base);
  start.setDate(base.getDate() + mondayDiff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function formatWeekLabel(start: Date, end: Date) {
  const fmt = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return `${fmt.format(start)} - ${fmt.format(end)}`;
}

const DAY_OF_WEEK: DayOfWeek[] = [
  DayOfWeek.senin,
  DayOfWeek.selasa,
  DayOfWeek.rabu,
  DayOfWeek.kamis,
  DayOfWeek.jumat,
  DayOfWeek.sabtu,
  DayOfWeek.minggu,
];

function isTimeText(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorized();

    if (!hasRole(currentUser.role, [UserRole.admin, UserRole.dosen])) {
      return forbidden("Hanya admin dan dosen yang dapat melihat jadwal mengajar");
    }

    const { start, end } = getWeekRange();

    const rows = await prisma.classSubject.findMany({
      where: {
        subject: { isActive: true },
        class: {
          academicYear: {
            isCurrent: true,
          },
        },
        ...(currentUser.role === UserRole.dosen
          ? {
              OR: [
                { teacherUserId: currentUser.id },
                {
                  teacherUserId: null,
                  subject: { teachers: { some: { userId: currentUser.id } } },
                  NOT: {
                    subject: {
                      classes: {
                        some: {
                          class: { academicYear: { isCurrent: true } },
                          teacherUserId: { not: null },
                        },
                      },
                    },
                  },
                },
              ],
            }
          : {}),
      },
      select: {
        classId: true,
        subjectId: true,
        teacherUserId: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        room: true,
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            nip: true,
            specialization: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            academicYear: {
              select: {
                id: true,
                name: true,
              },
            },
            students: {
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    nip: true,
                  },
                },
                progress: true,
              },
              orderBy: {
                user: {
                  name: "asc",
                },
              },
            },
          },
        },
        subject: {
          select: {
            id: true,
            code: true,
            name: true,
            credits: true,
            status: true,
            teachers: {
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    nip: true,
                    specialization: true,
                  },
                },
              },
              orderBy: {
                user: {
                  name: "asc",
                },
              },
            },
            meetings: {
              where: {
                updatedAt: {
                  gte: start,
                  lte: end,
                },
              },
              select: {
                id: true,
              },
            },
            _count: {
              select: {
                meetings: true,
              },
            },
          },
        },
      },
      orderBy: [{ subject: { name: "asc" } }, { class: { name: "asc" } }],
      take: 500,
    });

    const subjectIds = Array.from(new Set(rows.map((item) => item.subjectId)));
    const latestMeetingRows = subjectIds.length
      ? await prisma.subjectMeeting.findMany({
          where: {
            subjectId: {
              in: subjectIds,
            },
          },
          select: {
            id: true,
            subjectId: true,
            meetingNo: true,
            title: true,
            content: true,
            updatedAt: true,
          },
          orderBy: [{ subjectId: "asc" }, { meetingNo: "desc" }],
        })
      : [];

    const latestMeetingsBySubject = new Map<
      string,
      Array<{
        id: string;
        meetingNo: number;
        title: string;
        preview: string;
        updatedAt: Date;
      }>
    >();

    for (const meeting of latestMeetingRows) {
      const current = latestMeetingsBySubject.get(meeting.subjectId) || [];
      if (current.length >= 2) continue;

      current.push({
        id: meeting.id,
        meetingNo: meeting.meetingNo,
        title: meeting.title,
        preview:
          meeting.content.length > 160
            ? `${meeting.content.slice(0, 160)}...`
            : meeting.content,
        updatedAt: meeting.updatedAt,
      });

      latestMeetingsBySubject.set(meeting.subjectId, current);
    }

    const schedules = rows.map((item) => {
      const teacherCandidates = item.subject.teachers.map((teacher) => teacher.user);
      const assignedTeacher = item.teacher ?? teacherCandidates[0] ?? null;

      return {
        id: `${item.subjectId}-${item.classId}`,
        class: {
          id: item.class.id,
          name: item.class.name,
          academicYear: item.class.academicYear,
        },
        subject: {
          id: item.subject.id,
          code: item.subject.code,
          name: item.subject.name,
          credits: item.subject.credits,
          status: item.subject.status,
          totalMeetings: item.subject._count.meetings,
          meetingsUpdatedThisWeek: item.subject.meetings.length,
          latestMeetings: latestMeetingsBySubject.get(item.subjectId) || [],
        },
        schedule: {
          dayOfWeek: item.dayOfWeek,
          startTime: item.startTime,
          endTime: item.endTime,
          room: item.room,
        },
        assignedTeacher,
        teacherCandidates,
        students: item.class.students.map((student) => ({
          id: student.user.id,
          name: student.user.name,
          email: student.user.email,
          identifier: student.user.nip,
          progress: student.progress,
        })),
      };
    });

    const uniqueTeacherIds = new Set(
      schedules
        .map((item) => item.assignedTeacher?.id)
        .filter((id): id is string => Boolean(id)),
    );
    const uniqueStudentIds = new Set(
      schedules.flatMap((item) => item.students.map((student) => student.id)),
    );

    return NextResponse.json({
      week: {
        start: start.toISOString(),
        end: end.toISOString(),
        label: formatWeekLabel(start, end),
      },
      summary: {
        totalSchedules: schedules.length,
        totalTeachers: uniqueTeacherIds.size,
        totalStudents: uniqueStudentIds.size,
        totalUpdatesThisWeek: schedules.reduce(
          (acc, schedule) => acc + schedule.subject.meetingsUpdatedThisWeek,
          0,
        ),
      },
      canManage: currentUser.role === UserRole.admin,
      schedules,
    });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorized();

    if (currentUser.role !== UserRole.admin) {
      return forbidden("Hanya admin yang dapat mengubah jadwal");
    }

    const payload = (await request.json()) as {
      classId?: string;
      subjectId?: string;
      dayOfWeek?: DayOfWeek | null;
      teacherUserId?: string | null;
      allowCrossClassTeacher?: boolean;
      startTime?: string | null;
      endTime?: string | null;
      room?: string | null;
    };

    if (!payload.classId || !payload.subjectId) {
      return badRequest("classId dan subjectId wajib diisi");
    }

    if (payload.dayOfWeek && !DAY_OF_WEEK.includes(payload.dayOfWeek)) {
      return badRequest("Nilai hari tidak valid");
    }

    if (payload.startTime && !isTimeText(payload.startTime)) {
      return badRequest("Format jam mulai harus HH:MM");
    }

    if (payload.endTime && !isTimeText(payload.endTime)) {
      return badRequest("Format jam selesai harus HH:MM");
    }

    if (payload.startTime && payload.endTime && payload.startTime >= payload.endTime) {
      return badRequest("Jam selesai harus lebih besar dari jam mulai");
    }

    if (payload.teacherUserId) {
      const teacher = await prisma.user.findUnique({
        where: { id: payload.teacherUserId },
        select: { id: true, role: true, isActive: true },
      });
      if (!teacher || teacher.role !== UserRole.dosen || !teacher.isActive) {
        return badRequest("Pengampu kelas harus user dosen yang aktif");
      }

      if (!payload.allowCrossClassTeacher) {
        const conflicts = await prisma.classSubject.findMany({
          where: {
            subjectId: payload.subjectId,
            classId: { not: payload.classId },
            teacherUserId: { not: null },
            NOT: { teacherUserId: payload.teacherUserId },
          },
          select: {
            class: { select: { name: true } },
            teacher: { select: { name: true } },
          },
          take: 5,
        });

        if (conflicts.length > 0) {
          return NextResponse.json(
            {
              message:
                "Mata kuliah ini sudah memiliki pengampu berbeda di kelas lain. Lanjutkan hanya jika memang beda kelas dengan dosen berbeda.",
              conflicts: conflicts.map((item) => ({
                className: item.class.name,
                teacherName: item.teacher?.name || "Belum diatur",
              })),
            },
            { status: 409 },
          );
        }
      }
    }

    const updated = await prisma.classSubject.update({
      where: {
        classId_subjectId: {
          classId: payload.classId,
          subjectId: payload.subjectId,
        },
      },
      data: {
        teacherUserId: payload.teacherUserId ?? null,
        dayOfWeek: payload.dayOfWeek ?? null,
        startTime: payload.startTime ?? null,
        endTime: payload.endTime ?? null,
        room: payload.room?.trim() ? payload.room.trim() : null,
      },
      select: {
        classId: true,
        subjectId: true,
        teacherUserId: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        room: true,
      },
    });

    return NextResponse.json({ schedule: updated });
  } catch (error) {
    return serverError(error);
  }
}
