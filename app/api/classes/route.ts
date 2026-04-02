import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser, hasRole } from "@/lib/auth/user";
import { prisma } from "@/lib/core/db";
import {
  badRequest,
  forbidden,
  serverError,
  unauthorized,
} from "@/lib/core/http";

const createClassSchema = z.object({
  name: z.string().min(2),
  academicYearId: z.string().min(1),
  capacity: z.number().int().positive().optional(),
  enrollmentKey: z.string().trim().min(1).optional().nullable(),
  subjectIds: z.array(z.string()).optional(),
  studentIds: z.array(z.string()).optional(),
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

    const currentYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true },
      select: { id: true },
      orderBy: { updatedAt: "desc" },
    });

    if (!currentYear) {
      return NextResponse.json({
        classes: [],
        pagination: {
          total: 0,
          page: safePage,
          pages: 0,
          limit: safeLimit,
        },
      });
    }

    const where = {
      academicYearId: currentYear.id,
      ...(search
        ? { name: { contains: search, mode: "insensitive" as const } }
        : {}),
    };

    const [total, classes] = await Promise.all([
      prisma.class.count({ where }),
      prisma.class.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: safeLimit,
        include: {
          academicYear: { select: { id: true, name: true } },
          subjects: {
            include: {
              subject: { select: { id: true, name: true, code: true } },
            },
          },
          students: {
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
      classes,
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
      return forbidden("Only admin can create classes");
    }

    const body = await request.json();
    const parsed = createClassSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid class payload");

    const {
      name,
      academicYearId,
      capacity,
      enrollmentKey,
      subjectIds = [],
      studentIds = [],
    } = parsed.data;

    const existingClass = await prisma.class.findUnique({
      where: {
        name_academicYearId: {
          name,
          academicYearId,
        },
      },
    });

    if (existingClass) {
      return badRequest(
        "Class with this name already exists for the specified academic year.",
      );
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        academicYearId,
        capacity: capacity ?? 40,
        enrollmentKey: enrollmentKey?.trim() || null,
        subjects: {
          create: subjectIds.map((subjectId: string) => ({
            subject: { connect: { id: subjectId } },
          })),
        },
        students: {
          create: studentIds.map((userId: string) => ({
            user: { connect: { id: userId } },
          })),
        },
      },
      include: {
        academicYear: { select: { id: true, name: true } },
        subjects: { include: { subject: true } },
        students: { include: { user: true } },
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
