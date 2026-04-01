import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { buildDosenCurrentYearSubjectWhere } from "@/lib/auth/dosen-access";
import { getCurrentUser, hasRole } from "@/lib/auth/user";
import { prisma } from "@/lib/core/db";
import {
  badRequest,
  forbidden,
  serverError,
  unauthorized,
} from "@/lib/core/http";

const createSubjectSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  teacherIds: z.array(z.string()).optional(),
  teacher: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorized();
    if (
      !hasRole(currentUser.role, [
        UserRole.admin,
        UserRole.dosen,
        UserRole.mahasiswa,
      ])
    ) {
      return forbidden("User is not authorized to access this route");
    }

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "10");
    const search = searchParams.get("search");

    const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
    const safeLimit =
      Number.isNaN(limit) || limit < 1 ? 10 : Math.min(limit, 100);
    const skip = (safePage - 1) * safeLimit;

    const searchWhere = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { code: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : undefined;

    const dosenWhere =
      currentUser.role === UserRole.dosen
        ? buildDosenCurrentYearSubjectWhere(currentUser.id)
        : undefined;

    const where =
      searchWhere && dosenWhere
        ? { AND: [dosenWhere, searchWhere] }
        : (dosenWhere ?? searchWhere);

    const [total, subjects] = await Promise.all([
      prisma.subject.count({ where }),
      prisma.subject.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: safeLimit,
        include: {
          teachers: {
            include: {
              user: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      subjects,
      pagination: {
        total,
        page: safePage,
        pages: Math.ceil(total / safeLimit),
        limit: safeLimit,
      },
    });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorized();
    if (!hasRole(currentUser.role, [UserRole.admin])) {
      return forbidden("Only admin can create subjects");
    }

    const body = await request.json();
    const parsed = createSubjectSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid subject payload");

    const { name, code, teacherIds, teacher, isActive } = parsed.data;
    const resolvedTeacherIds = teacherIds ?? teacher ?? [];

    const subjectExists = await prisma.subject.findUnique({ where: { code } });
    if (subjectExists) return badRequest("Subject code already exists");

    const newSubject = await prisma.subject.create({
      data: {
        name,
        code,
        isActive: isActive ?? true,
        teachers: {
          create: resolvedTeacherIds.map((userId) => ({
            user: { connect: { id: userId } },
          })),
        },
      },
      include: {
        teachers: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    });

    return NextResponse.json(newSubject, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
