"use server";

import { prisma } from "@/lib/core/db";
import { getCurrentUser } from "@/lib/auth/user";
import { buildDosenCurrentYearClassSubjectWhere } from "@/lib/auth/dosen-access";

export async function getDosenSubjectsAction() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "dosen" && user.role !== "admin")) {
    return { success: false, error: "Akses ditolak" };
  }

  try {
    const classSubjectRows = await prisma.classSubject.findMany({
      where: {
        subject: {
          isActive: true,
        },
        ...buildDosenCurrentYearClassSubjectWhere(user.id),
      },
      select: {
        subject: {
          select: {
            id: true,
            code: true,
            name: true,
            bannerImage: true,
            updatedAt: true,
            _count: {
              select: {
                meetings: true,
              },
            },
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ subject: { updatedAt: "desc" } }, { class: { name: "asc" } }],
    });

    const subjectMap = new Map<
      string,
      {
        id: string;
        code: string;
        name: string;
        bannerImage: string | null;
        _count: { meetings: number };
        classes: Array<{ class: { name: string } }>;
      }
    >();

    for (const row of classSubjectRows) {
      const existing = subjectMap.get(row.subject.id);
      if (!existing) {
        subjectMap.set(row.subject.id, {
          id: row.subject.id,
          code: row.subject.code,
          name: row.subject.name,
          bannerImage: row.subject.bannerImage,
          _count: {
            meetings: row.subject._count.meetings,
          },
          classes: [{ class: { name: row.class.name } }],
        });
        continue;
      }

      if (
        !existing.classes.some((item) => item.class.name === row.class.name)
      ) {
        existing.classes.push({ class: { name: row.class.name } });
      }
    }

    const subjects = Array.from(subjectMap.values());

    return { success: true, subjects };
  } catch (error) {
    console.error("Error fetching dosen subjects:", error);
    return {
      success: false,
      error: "Gagal mengambil data mata kuliah yang diampu",
    };
  }
}
