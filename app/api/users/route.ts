import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser, hasRole } from "@/lib/auth/user";
import { badRequest, forbidden, serverError, unauthorized } from "@/lib/core/http";
import { prisma } from "@/lib/core/db";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  studentClassId: z.string().optional(),
  nip: z.string().optional(),
  specialization: z.string().optional(),
});

const allowedRoles = [UserRole.admin, UserRole.dosen];

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) return unauthorized();
    if (!hasRole(currentUser.role, allowedRoles)) {
      return forbidden("User is not authorized to access this route");
    }

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "10");
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
    const safeLimit = Number.isNaN(limit) || limit < 1 ? 10 : Math.min(limit, 100);
    const skip = (safePage - 1) * safeLimit;

    const where = {
      ...(role && role !== "all" ? { role: role as UserRole } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: safeLimit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          studentClassId: true,
          nip: true,
          specialization: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      users,
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
    if (!hasRole(currentUser.role, allowedRoles)) {
      return forbidden("User is not authorized to access this route");
    }

    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid user payload");
    }

    const { name, email, password, role, isActive, studentClassId, nip, specialization } = parsed.data;
    const finalRole = role ?? UserRole.mahasiswa;
    const normalizedIdentifier = nip?.trim() || null;
    const normalizedSpecialization =
      finalRole === UserRole.dosen ? specialization?.trim() || null : null;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return badRequest("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: finalRole,
        isActive: isActive ?? true,
        studentClassId,
        nip: normalizedIdentifier,
        specialization: normalizedSpecialization,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        studentClassId: true,
        nip: true,
        specialization: true,
      },
    });

    return NextResponse.json(
      {
        ...newUser,
        message: "User registered successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return serverError(error);
  }
}
