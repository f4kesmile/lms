import "server-only";

import { prisma } from "@/lib/core/db";

export async function getClasses() {
  try {
    const classes = await prisma.class.findMany({
      include: {
        academicYear: true,
        classTeacher: {
          select: { id: true, name: true }
        },
        students: true,
      },
      orderBy: { createdAt: "desc" }
    });
    return classes;
  } catch (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
}

export async function getAcademicYears() {
  try {
    const years = await prisma.academicYear.findMany({
      orderBy: { fromYear: "desc" }
    });
    return years;
  } catch (error) {
    console.error("Error fetching academic years:", error);
    return [];
  }
}
