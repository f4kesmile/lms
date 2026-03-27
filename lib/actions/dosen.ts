"use server";

import { prisma } from "@/lib/core/db";
import { getCurrentUser } from "@/lib/auth/user";

export async function getDosenSubjectsAction() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "dosen" && user.role !== "admin")) {
    return { success: false, error: "Akses ditolak" };
  }

  try {
    const subjects = await prisma.subject.findMany({
      where: {
        teachers: {
          some: { userId: user.id }
        }
      },
      include: {
        classes: {
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
