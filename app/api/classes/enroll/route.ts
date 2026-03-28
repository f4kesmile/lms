import { NextResponse } from "next/server";
import { prisma } from "@/lib/core/db";
import { getCurrentUserIdFromCookie } from "@/lib/auth/index";

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserIdFromCookie();
    if (!userId) {
      return NextResponse.json({ message: "Harap login terlebih dahulu" }, { status: 401 });
    }

    const { classId, enrollmentKey } = await req.json();
    if (!classId) {
      return NextResponse.json({ message: "Class ID required" }, { status: 400 });
    }

    const classData = await prisma.class.findUnique({
      where: { id: classId },
      select: {
        enrollmentKey: true,
        academicYear: {
          select: { isCurrent: true },
        },
      }
    });

    if (!classData) {
      return NextResponse.json({ message: "Kelas tidak ditemukan" }, { status: 404 });
    }

    if (!classData.academicYear.isCurrent) {
      return NextResponse.json(
        { message: "Pendaftaran hanya dibuka untuk kelas di tahun akademik aktif" },
        { status: 403 },
      );
    }

    // Require exact match if the class has a key defined
    if (classData.enrollmentKey && classData.enrollmentKey !== enrollmentKey) {
      return NextResponse.json({ message: "Kode kelas (Enrollment Key) tidak valid" }, { status: 403 });
    }

    const existing = await prisma.classStudent.findUnique({
      where: { classId_userId: { classId, userId } }
    });

    if (existing) {
      return NextResponse.json({ message: "Anda sudah terdaftar di kelas ini" }, { status: 400 });
    }

    await prisma.classStudent.create({
      data: { classId, userId, progress: 0 }
    });

    return NextResponse.json({ success: true, message: "Berhasil mendaftar kelas!" });
  } catch (error) {
    console.error("Enroll error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
