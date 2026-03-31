import { CourseStatus } from "@prisma/client";

export type ActiveTab = "mataKuliah" | "kelas" | "years";

export type ClassItem = {
  id: string;
  name: string;
  academicYear: { id: string; name: string };
  academicYearId: string;
  capacity: number;
  enrollmentKey: string | null;
  students: Array<{ userId: string }>;
  createdAt: string;
};

export type SubjectCourseItem = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  learningOutcomes: string | null;
  credits: number;
  bannerImage: string | null;
  status: CourseStatus;
  _count: {
    meetings: number;
  };
  teachers: {
    user: {
      id: string;
      name: string;
      nip: string | null;
      specialization: string | null;
    };
  }[];
  updatedAt: string;
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
  enrollmentKey: string;
};

export type SubjectForm = {
  code: string;
  name: string;
  description: string;
  learningOutcomes: string;
  credits: number;
  status: CourseStatus;
  bannerImage: string | null;
  teacherId: string | null;
};

export type YearForm = {
  name: string;
  fromYear: string;
  toYear: string;
  isCurrent: boolean;
};
