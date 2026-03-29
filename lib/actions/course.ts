"use server";

import { CourseStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/core/db";

export async function createClassAction(data: { name: string; academicYearId: string; capacity: number }) {
  try {
    await prisma.class.create({ data });
    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    console.error("Error creating class:", error);
    return { success: false, error: "Gagal menyimpan kelas" };
  }
}

export async function updateClassAction(id: string, data: { name: string; academicYearId: string; capacity: number }) {
  try {
    await prisma.class.update({
      where: { id },
      data
    });
    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    console.error("Error updating class:", error);
    return { success: false, error: "Gagal mengubah kelas" };
  }
}

export async function deleteClassAction(id: string) {
  try {
    await prisma.class.delete({ where: { id } });
    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    console.error("Error deleting class:", error);
    return { success: false, error: "Gagal menghapus kelas" };
  }
}

export async function createSubjectCourseAction(data: {
  code: string;
  name: string;
  description: string | null;
  learningOutcomes: string | null;
  credits: number;
  status: CourseStatus;
  bannerImage?: string | null;
  teacherId?: string | null;
}) {
  try {
    const { teacherId, ...rest } = data;
    await prisma.subject.create({
      data: {
        code: rest.code,
        name: rest.name,
        description: rest.description,
        learningOutcomes: rest.learningOutcomes,
        credits: rest.credits,
        status: rest.status,
        bannerImage: rest.bannerImage,
        teachers: teacherId
          ? {
              create: {
                user: { connect: { id: teacherId } },
              },
            }
          : undefined,
      },
    });

    revalidatePath("/admin/courses");
    revalidatePath("/admin/knowledge");
    revalidatePath("/admin/materials/new");
    return { success: true };
  } catch (error) {
    console.error("Error creating subject:", error);
    return { success: false, error: "Gagal menyimpan mata kuliah" };
  }
}

export async function updateSubjectCourseAction(
  id: string,
  data: {
    code: string;
    name: string;
    description: string | null;
    learningOutcomes: string | null;
    credits: number;
    status: CourseStatus;
    bannerImage?: string | null;
    teacherId?: string | null;
  },
) {
  try {
    const { teacherId, ...rest } = data;
    await prisma.subject.update({
      where: { id },
      data: {
        code: rest.code,
        name: rest.name,
        description: rest.description,
        learningOutcomes: rest.learningOutcomes,
        credits: rest.credits,
        status: rest.status,
        bannerImage: rest.bannerImage,
        teachers: {
          deleteMany: {},
          create: teacherId
            ? {
                user: { connect: { id: teacherId } },
              }
            : undefined,
        },
      },
    });

    revalidatePath("/admin/courses");
    revalidatePath("/admin/knowledge");
    revalidatePath("/admin/materials/new");
    return { success: true };
  } catch (error) {
    console.error("Error updating subject:", error);
    return { success: false, error: "Gagal mengubah mata kuliah" };
  }
}

export async function deleteSubjectCourseAction(id: string) {
  try {
    await prisma.subject.delete({ where: { id } });

    revalidatePath("/admin/courses");
    revalidatePath("/admin/knowledge");
    revalidatePath("/admin/materials/new");
    return { success: true };
  } catch (error) {
    console.error("Error deleting subject:", error);
    return { success: false, error: "Gagal menghapus mata kuliah" };
  }
}

// Academic Year Actions
export async function createAcademicYearAction(data: { name: string; fromYear: string; toYear: string; isCurrent: boolean }) {
  try {
    if (data.isCurrent) {
      await prisma.academicYear.updateMany({ data: { isCurrent: false } });
    }
    
    await prisma.academicYear.create({
      data: {
        name: data.name,
        fromYear: new Date(data.fromYear),
        toYear: new Date(data.toYear),
        isCurrent: data.isCurrent
      }
    });

    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    console.error("Error creating academic year:", error);
    return { success: false, error: "Gagal menyimpan tahun akademik" };
  }
}

export async function updateAcademicYearAction(id: string, data: { name: string; fromYear: string; toYear: string; isCurrent: boolean }) {
  try {
    if (data.isCurrent) {
      await prisma.academicYear.updateMany({ data: { isCurrent: false } });
    }
    
    await prisma.academicYear.update({
      where: { id },
      data: {
        name: data.name,
        fromYear: new Date(data.fromYear),
        toYear: new Date(data.toYear),
        isCurrent: data.isCurrent
      }
    });

    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    console.error("Error updating academic year:", error);
    return { success: false, error: "Gagal mengubah tahun akademik" };
  }
}

export async function deleteAcademicYearAction(id: string) {
  try {
    // Check constraints
    const classesCount = await prisma.class.count({ where: { academicYearId: id } });
    if (classesCount > 0) {
      return { success: false, error: "Tahun akademik masih digunakan oleh kelas aktif" };
    }

    await prisma.academicYear.delete({ where: { id } });
    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    console.error("Error deleting academic year:", error);
    return { success: false, error: "Gagal menghapus tahun" };
  }
}

export async function setAcademicYearActiveAction(id: string) {
  try {
    await prisma.$transaction([
      prisma.academicYear.updateMany({ data: { isCurrent: false } }),
      prisma.academicYear.update({ where: { id }, data: { isCurrent: true } })
    ]);
    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    console.error("Error setting active year:", error);
    return { success: false, error: "Gagal mengubah status aktif" };
  }
}
