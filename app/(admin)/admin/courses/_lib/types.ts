import { CourseStatus } from "@prisma/client";

export type ActiveTab = "mataKuliah" | "kelas" | "years";

export type ClassItem = {
  id: string;
  name: string;
  academicYear: { id: string; name: string };
  academicYearId: string;
  capacity: number;
  students: Array<{ userId: string }>;
  createdAt: string;
};

export type SubjectCourseItem = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  learningOutcomes: string | null;
  bannerImage: string | null;
  status: CourseStatus;
  updatedAt: string;
  teachers: Array<{
    user: {
      id: string;
      name: string;
      nip: string | null;
      specialization: string | null;
    };
  }>;
  _count?: { meetings: number };
};

export type AcademicYear = {
  id: string;
  name: string;
  fromYear: string;
  toYear: string;
  isCurrent: boolean;
};

export type Teacher = {
  id: string;
  name: string;
  nip: string | null;
  specialization: string | null;
};

export type ClassForm = {
  name: string;
  academicYearId: string;
  capacity: number;
};

export type SubjectForm = {
  code: string;
  title: string;
  description: string;
  learningOutcomes: string;
  status: CourseStatus;
  bannerImage: string | null;
  teacherIds: string[];
};

export type YearForm = {
  name: string;
  fromYear: string;
  toYear: string;
  isCurrent: boolean;
};
