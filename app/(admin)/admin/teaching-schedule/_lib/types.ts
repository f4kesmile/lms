export type DayOfWeek =
  | "senin"
  | "selasa"
  | "rabu"
  | "kamis"
  | "jumat"
  | "sabtu"
  | "minggu";

export const DAY_OPTIONS: Array<{ value: DayOfWeek; label: string }> = [
  { value: "senin", label: "Senin" },
  { value: "selasa", label: "Selasa" },
  { value: "rabu", label: "Rabu" },
  { value: "kamis", label: "Kamis" },
  { value: "jumat", label: "Jumat" },
  { value: "sabtu", label: "Sabtu" },
  { value: "minggu", label: "Minggu" },
];

export function dayLabel(day: DayOfWeek | null) {
  if (!day) return "Belum diatur";
  return DAY_OPTIONS.find((item) => item.value === day)?.label || "Belum diatur";
}

export type WeekResponse = {
  week: {
    start: string;
    end: string;
    label: string;
  };
  summary: {
    totalSchedules: number;
    totalTeachers: number;
    totalStudents: number;
    totalUpdatesThisWeek: number;
  };
  canManage: boolean;
  schedules: ScheduleItem[];
};

export type TeacherItem = {
  id: string;
  name: string;
  email: string;
  nip: string | null;
  specialization: string | null;
};

export type ScheduleItem = {
  id: string;
  class: {
    id: string;
    name: string;
    academicYear: {
      id: string;
      name: string;
    };
  };
  subject: {
    id: string;
    code: string;
    name: string;
    credits: number;
    status: string;
    totalMeetings: number;
    meetingsUpdatedThisWeek: number;
    latestMeetings: Array<{
      id: string;
      meetingNo: number;
      title: string;
      preview: string;
      updatedAt: string;
    }>;
  };
  schedule: {
    dayOfWeek: DayOfWeek | null;
    startTime: string | null;
    endTime: string | null;
    room: string | null;
  };
  assignedTeacher: TeacherItem | null;
  teacherCandidates: TeacherItem[];
  students: Array<{
    id: string;
    name: string;
    email: string;
    identifier: string | null;
    progress: number;
  }>;
};

export type ScheduleDraft = {
  dayOfWeek: DayOfWeek | "none";
  teacherUserId: string;
  startTime: string;
  endTime: string;
  room: string;
};

export function toDraft(item: ScheduleItem): ScheduleDraft {
  return {
    dayOfWeek: item.schedule.dayOfWeek ?? "none",
    teacherUserId: item.assignedTeacher?.id || "none",
    startTime: item.schedule.startTime ?? "",
    endTime: item.schedule.endTime ?? "",
    room: item.schedule.room ?? "",
  };
}
