export type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
};

export type DashboardResponse = {
  metrics: {
    totalUsers: number;
    totalCourses: number;
    totalModules: number;
    aiUsage: number;
  };
  growthSeries?: Array<{
    day: string;
    value: number;
  }>;
  activities: Array<{
    id: string;
    user: string;
    activity: string;
    status: string;
    date: string;
  }>;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "dosen" | "mahasiswa";
};

export type SubjectClassItem = {
  class: {
    id: string;
    name: string;
  };
};

export type DosenSubjectItem = {
  id: string;
  code: string;
  name: string;
  bannerImage: string | null;
  classes: SubjectClassItem[];
  _count?: {
    meetings?: number;
  };
};

export type GrowthPoint = {
  day: string;
  value: number;
};
