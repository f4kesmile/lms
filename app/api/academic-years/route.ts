import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser, hasRole } from "@/lib/current-user";
import { badRequest, forbidden, serverError, unauthorized } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const createAcademicYearSchema = z.object({
  name: z.string().min(3),
  fromYear: z.coerce.date(),
  toYear: z.coerce.date(),
  isCurrent: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorized();
    if (!hasRole(currentUser.role, [UserRole.admin])) {
      return forbidden("Only admin can access academic years");
    }

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "10");
    const search = searchParams.get("search");

    const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
    const safeLimit = Number.isNaN(limit) || limit < 1 ? 10 : Math.min(limit, 100);
    const skip = (safePage - 1) * safeLimit;

    const where = search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : undefined;

    const [total, years] = await Promise.all([
      prisma.academicYear.count({ where }),
      prisma.academicYear.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: safeLimit,
      }),
    ]);

    return NextResponse.json({
      years,
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
      return forbidden("Only admin can create academic years");
    }

    const body = await request.json();
    const parsed = createAcademicYearSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid academic year payload");

    const { name, fromYear, toYear, isCurrent } = parsed.data;

    const existing = await prisma.academicYear.findUnique({
      where: {
        fromYear_toYear: {
          fromYear,
          toYear,
        },
      },
    });

    if (existing) {
      return badRequest("Academic Year already exists");
    }

    if (isCurrent) {
      await prisma.academicYear.updateMany({ data: { isCurrent: false } });
    }

    const academicYear = await prisma.academicYear.create({
      data: {
        name,
        fromYear,
        toYear,
        isCurrent: isCurrent ?? false,
      },
    });

    return NextResponse.json(academicYear, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
