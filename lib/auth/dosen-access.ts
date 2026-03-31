import { Prisma, UserRole } from "@prisma/client";

import { prisma } from "@/lib/core/db";

type SubjectAccessParams = {
  userId: string;
  role: UserRole;
  subjectId: string;
};

export type DosenSubjectAccessStatus =
  | "allowed"
  | "forbidden-role"
  | "not-assigned"
  | "assigned-to-other-dosen";

export async function getDosenSubjectAccessInCurrentYear(
  params: SubjectAccessParams,
): Promise<{ allowed: boolean; status: DosenSubjectAccessStatus }> {
  const { userId, role, subjectId } = params;

  if (role === UserRole.admin) {
    return { allowed: true, status: "allowed" };
  }

  if (role !== UserRole.dosen) {
    return { allowed: false, status: "forbidden-role" };
  }

  const classSubjects = await prisma.classSubject.findMany({
    where: {
      subjectId,
      class: {
        academicYear: {
          isCurrent: true,
        },
      },
    },
    select: {
      teacherUserId: true,
    },
  });

  if (classSubjects.length === 0) {
    return { allowed: false, status: "not-assigned" };
  }

  const assignedToCurrent = classSubjects.some(
    (row) => row.teacherUserId === userId,
  );
  if (assignedToCurrent) {
    return { allowed: true, status: "allowed" };
  }

  const assignedToOther = classSubjects.some(
    (row) => row.teacherUserId && row.teacherUserId !== userId,
  );
  if (assignedToOther) {
    return { allowed: false, status: "assigned-to-other-dosen" };
  }

  return { allowed: false, status: "not-assigned" };
}

export async function isDosenAllowedForSubjectInCurrentYear(
  params: SubjectAccessParams,
): Promise<boolean> {
  const result = await getDosenSubjectAccessInCurrentYear(params);
  return result.allowed;
}

export function buildDosenCurrentYearSubjectWhere(
  userId: string,
): Prisma.SubjectWhereInput {
  return {
    classes: {
      some: {
        class: {
          academicYear: {
            isCurrent: true,
          },
        },
        teacherUserId: userId,
      },
    },
  };
}

export function buildDosenCurrentYearClassSubjectWhere(
  userId: string,
): Prisma.ClassSubjectWhereInput {
  return {
    class: {
      academicYear: {
        isCurrent: true,
      },
    },
    teacherUserId: userId,
  };
}
