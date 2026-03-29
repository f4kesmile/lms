import { CourseStatus } from "@prisma/client";

import type {
  ClassForm,
  SubjectForm,
  YearForm,
} from "@/app/(admin)/admin/courses/_lib/types";

export const EMPTY_CLASS_FORM: ClassForm = {
  name: "",
  academicYearId: "",
  capacity: 40,
};

export const EMPTY_SUBJECT_FORM: SubjectForm = {
  code: "",
  name: "",
  description: "",
  learningOutcomes: "",
  credits: 2,
  status: CourseStatus.published,
  bannerImage: null,
  teacherId: null,
};

export const EMPTY_YEAR_FORM: YearForm = {
  name: "",
  fromYear: "",
  toYear: "",
  isCurrent: false,
};
