"use server";

import { CourseStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function createCourseAction(data: { name: string; academicYearId: string; classTeacherId: string | null; capacity: number }) {
  try {
    await prisma.class.create({ data });
    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    console.error("Error creating course:", error);
    return { success: false, error: "Gagal menyimpan kelas" };
  }
}

export async function updateCourseAction(id: string, data: { name: string; academicYearId: string; classTeacherId: string | null; capacity: number }) {
  try {
    await prisma.class.update({
      where: { id },
      data
    });
    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    console.error("Error updating course:", error);
    return { success: false, error: "Gagal mengubah kelas" };
  }
}

export async function deleteCourseAction(id: string) {
  try {
    await prisma.class.delete({ where: { id } });
    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    console.error("Error deleting course:", error);
    return { success: false, error: "Gagal menghapus kelas" };
  }
}

export async function createSubjectCourseAction(data: {
  code: string;
  title: string;
  description: string | null;
  learningOutcomes: string | null;
  status: CourseStatus;
}) {
  try {
    const currentUser = await getCurrentUser();

    await prisma.course.create({
      data: {
        ...data,
        createdById: currentUser?.id,
      },
    });

    revalidatePath("/admin/courses");
    revalidatePath("/admin/knowledge");
    revalidatePath("/admin/materials/new");
    return { success: true };
  } catch (error) {
    console.error("Error creating subject course:", error);
    return { success: false, error: "Gagal menyimpan mata kuliah" };
  }
}

export async function updateSubjectCourseAction(
  id: string,
  data: {
    code: string;
    title: string;
    description: string | null;
    learningOutcomes: string | null;
    status: CourseStatus;
  },
) {
  try {
    await prisma.course.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/courses");
    revalidatePath("/admin/knowledge");
    revalidatePath("/admin/materials/new");
    return { success: true };
  } catch (error) {
    console.error("Error updating subject course:", error);
    return { success: false, error: "Gagal mengubah mata kuliah" };
  }
}

export async function deleteSubjectCourseAction(id: string) {
  try {
    await prisma.course.delete({ where: { id } });

    revalidatePath("/admin/courses");
    revalidatePath("/admin/knowledge");
    revalidatePath("/admin/materials/new");
    return { success: true };
  } catch (error) {
    console.error("Error deleting subject course:", error);
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
