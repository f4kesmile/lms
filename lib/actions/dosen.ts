"use server";

import { prisma } from "@/lib/core/db";
import { getCurrentUser } from "@/lib/auth/user";

export async function getDosenSubjectsAction() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "dosen" && user.role !== "admin")) {
    return { success: false, error: "Akses ditolak" };
  }

  try {
    const currentYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true },
      select: { id: true },
      orderBy: { updatedAt: "desc" },
    });

    if (!currentYear) {
      return { success: true, subjects: [] };
    }

    const subjects = await prisma.subject.findMany({
      where: {
        teachers: {
          some: { userId: user.id }
        },
        classes: {
          some: {
            class: {
              academicYearId: currentYear.id,
            },
          },
        },
      },
      include: {
        classes: {
          where: {
            class: {
              academicYearId: currentYear.id,
            },
          },
          include: {
            class: {
              select: {
                name: true,
                academicYear: {
                  select: { name: true }
                }
              }
            }
          }
        },
        _count: {
          select: { meetings: true }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    return { success: true, subjects };
  } catch (error) {
    console.error("Error fetching dosen subjects:", error);
    return { success: false, error: "Gagal mengambil data mata kuliah yang diampu" };
  }
}
