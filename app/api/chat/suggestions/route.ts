import { NextResponse } from "next/server";
import type { Prisma, UserRole } from "@prisma/client";

import { getCurrentUser } from "@/lib/current-user";
import { serverError, unauthorized } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const studentTemplates = [
  "Jelaskan konsep inti dari {title}",
  "Apa poin penting pada {title}?",
  "Berikan rangkuman singkat {title}",
  "Bagaimana penerapan {title} dalam praktik?",
  "Apa kesalahan umum saat mempelajari {title}?",
  "Beri contoh sederhana terkait {title}",
];

const mentorTemplates = [
  "Buat penjelasan terstruktur untuk topik {title}",
  "Apa miskonsepsi umum mahasiswa pada topik {title}?",
  "Rancang latihan singkat berbasis materi {title}",
  "Bagaimana cara mengevaluasi pemahaman pada {title}?",
  "Apa indikator keberhasilan belajar untuk {title}?",
  "Hubungkan {title} dengan studi kasus praktis",
];

function truncateTitle(title: string, maxLength = 72): string {
  const clean = title.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trimEnd()}...`;
}

function shuffle<T>(items: T[]): T[] {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

async function resolveTeacherFilterIds(input: {
  userId: string;
  role: UserRole;
  classId?: string;
}) {
  const { userId, role, classId } = input;

  if (role === "dosen") {
    return [userId];
  }

  if (role !== "mahasiswa" && !classId) {
    return null;
  }

  let classIds: string[] = [];

  if (role === "mahasiswa") {
    if (classId) {
      const membership = await prisma.classStudent.findFirst({
        where: { classId, userId },
        select: { classId: true },
      });
      if (!membership) return [];
      classIds = [classId];
    } else {
      const memberships = await prisma.classStudent.findMany({
        where: { userId },
        select: { classId: true },
        take: 20,
      });
      classIds = memberships.map((item) => item.classId);
    }
  } else if (classId) {
    classIds = [classId];
  }

  if (classIds.length === 0) return [];

  const classes = await prisma.class.findMany({
    where: { id: { in: classIds } },
    select: { classTeacherId: true },
    take: 20,
  });

  const teacherIds = Array.from(
    new Set(
      classes
        .map((item) => item.classTeacherId)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  return teacherIds;
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const allowedRoles: UserRole[] = ["admin", "dosen", "mahasiswa"];
    if (!allowedRoles.includes(user.role)) return unauthorized();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") || 8), 12);
    const classId = searchParams.get("classId")?.trim() || undefined;
    const courseId = searchParams.get("courseId")?.trim() || undefined;

    const templates = user.role === "mahasiswa" ? studentTemplates : mentorTemplates;

    const teacherIds = await resolveTeacherFilterIds({
      userId: user.id,
      role: user.role,
      classId,
    });

    if (teacherIds && teacherIds.length === 0) {
      return NextResponse.json({ suggestions: [], materials: [] });
    }

    const andConditions: Prisma.CourseMaterialWhereInput[] = [];
    if (courseId) {
      andConditions.push({ courseId });
    }
    if (teacherIds && teacherIds.length > 0) {
      andConditions.push({ createdById: { in: teacherIds } });
    }

    const where: Prisma.CourseMaterialWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    const materials = await prisma.courseMaterial.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 40,
      select: {
        id: true,
        title: true,
        module: true,
      },
    });

    const groupedByModule = new Map<string, typeof materials>();
    for (const material of materials) {
      const key = material.module || "Tanpa Modul";
      const bucket = groupedByModule.get(key) || [];
      bucket.push(material);
      groupedByModule.set(key, bucket);
    }

    const moduleKeys = shuffle(Array.from(groupedByModule.keys()));
    const moduleQueues = moduleKeys.map((key) => ({
      key,
      materials: shuffle(groupedByModule.get(key) || []),
      templateOrder: shuffle(templates),
      nextMaterial: 0,
      nextTemplate: 0,
    }));

    const suggestions: string[] = [];
    const seen = new Set<string>();

    while (suggestions.length < limit) {
      let addedInRound = false;

      for (const queue of moduleQueues) {
        if (suggestions.length >= limit) break;
        if (queue.materials.length === 0) continue;

        const material = queue.materials[queue.nextMaterial % queue.materials.length];
        const template = queue.templateOrder[queue.nextTemplate % queue.templateOrder.length];
        const suggestion = template.replace("{title}", truncateTitle(material.title));

        queue.nextTemplate += 1;
        if (queue.nextTemplate % queue.templateOrder.length === 0) {
          queue.nextMaterial += 1;
        }

        if (seen.has(suggestion)) continue;

        seen.add(suggestion);
        suggestions.push(suggestion);
        addedInRound = true;
      }

      if (!addedInRound) break;
    }

    return NextResponse.json({
      suggestions,
      materials: materials.map((m) => ({ id: m.id, title: m.title, module: m.module })),
    });
  } catch (error) {
    return serverError(error);
  }
}
