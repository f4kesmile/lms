import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { DAY_LABELS } from "@/app/(admin)/admin/dashboard/_lib/constants";
import type {
  DashboardResponse,
  DosenSubjectItem,
  GrowthPoint,
  SessionUser,
} from "@/app/(admin)/admin/dashboard/_lib/types";
import { getDosenSubjectsAction } from "@/lib/actions/dosen";

export function useDashboardController() {
  const router = useRouter();

  const [user, setUser] = useState<SessionUser | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState(true);
  const [dosenSubjects, setDosenSubjects] = useState<DosenSubjectItem[]>([]);
  const [dosenLoading, setDosenLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message || "Gagal memuat sesi");
        }

        if (payload?.user?.role === "mahasiswa") {
          router.replace("/" as Route);
          return;
        }

        setUser(payload.user ?? null);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setRoleLoading(false));
  }, [router]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    fetch("/api/admin/dashboard")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message || "Gagal memuat dashboard");
        }
        setData(payload);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Gagal memuat dashboard");
      })
      .finally(() => setAdminLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== "dosen") return;

    getDosenSubjectsAction()
      .then((res) => {
        if (res.success) {
          setDosenSubjects(res.subjects || []);
          return;
        }
        toast.error(res.error);
      })
      .finally(() => setDosenLoading(false));
  }, [user]);

  const bars = useMemo(() => {
    if (!data) return Array(7).fill(0);

    return [1, 2, 3, 4, 5, 6, 7].map(
      (day) =>
        data.activities.filter((item) => {
          const d = new Date(item.date).getDay();
          return d === day % 7;
        }).length,
    );
  }, [data]);

  const growthData: GrowthPoint[] = data?.growthSeries?.length
    ? DAY_LABELS.map((day) => {
        const point = data.growthSeries?.find((item) => item.day === day);
        return {
          day,
          value: Math.round(point?.value ?? 0),
        };
      })
    : DAY_LABELS.map((day, index) => ({
        day,
        value: Math.round(bars[index] ?? 0),
      }));

  const metricValues = data
    ? [
        data.metrics.totalUsers.toLocaleString(),
        data.metrics.totalCourses.toString(),
        data.metrics.totalModules.toString(),
        `${data.metrics.aiUsage}%`,
      ]
    : ["0", "0", "0", "0%"];

  return {
    user,
    roleLoading,
    data,
    error,
    adminLoading,
    dosenSubjects,
    dosenLoading,
    growthData,
    metricValues,
  };
}
