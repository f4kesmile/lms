"use client";

import { useEffect, useMemo, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { toast } from "sonner";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { getInitials, formatDate, cn } from "@/lib/utils/index";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getDosenSubjectsAction } from "@/lib/actions/dosen";

type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
};

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const dataPoint = payload[0];
    const numeric = dataPoint.value;
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
        <p className="font-bold text-muted-foreground">{label}</p>
        <p className="text-sm font-black text-primary">
          {numeric} <span className="font-bold text-foreground">Aktivitas</span>
        </p>
      </div>
    );
  }
  return null;
}

type DashboardResponse = {
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

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "dosen" | "mahasiswa";
};

type SubjectClassItem = {
  class: {
    name: string;
  };
};

type DosenSubjectItem = {
  id: string;
  code: string;
  name: string;
  bannerImage: string | null;
  classes: SubjectClassItem[];
  _count?: {
    meetings?: number;
  };
};

const statColors = [
  "from-primary/20 to-primary/5 text-primary border-primary/20",
  "from-secondary-brand/20 to-secondary-brand/5 text-secondary-brand border-secondary-brand/20",
  "from-secondary-brand/20 to-secondary-brand/5 text-secondary-brand border-secondary-brand/20",
  "from-secondary-brand/20 to-secondary-brand/5 text-secondary-brand border-secondary-brand/20",
];

const statIcons = ["groups", "school", "library_books", "memory"];
const statLabels = [
  "Total Pengguna",
  "Kursus Aktif",
  "Modul Belajar",
  "Efisiensi AI",
];

const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export default function AdminDashboardPage() {
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
        setUser(payload.user ?? null);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setRoleLoading(false));
  }, []);

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

  const growthData = data?.growthSeries?.length
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

  if (roleLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-3xl" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  if (user?.role === "dosen") {
    return (
      <AdminLayout title="Dashboard Pengajar">
        <div className="space-y-8">
          <header className="flex flex-col gap-2">
            <h2 className="text-3xl font-black tracking-tight text-foreground">
              Halo, Selamat Datang!
            </h2>
            <p className="text-muted-foreground font-medium">
              Berikut adalah rangkuman aktivitas akademik dan mata kuliah yang
              Anda ampu.
            </p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-to-br from-secondary-brand/20 to-card border-none shadow-xl shadow-secondary-brand/5 rounded-3xl group transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="size-12 rounded-2xl bg-secondary-brand/10 text-secondary-brand flex items-center justify-center font-black">
                  <Icon name="library_books" size={24} />
                </div>
                <span className="text-3xl font-black text-foreground">
                  {dosenSubjects.length}
                </span>
              </div>
              <p className="text-sm font-black uppercase tracking-widest text-muted-foreground opacity-70">
                Mata Kuliah Aktif
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/20 to-card border-none shadow-xl shadow-primary/5 rounded-3xl group transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black">
                  <Icon name="groups" size={24} />
                </div>
                <span className="text-3xl font-black text-foreground">
                  {dosenSubjects.reduce((acc, s) => acc + s.classes.length, 0)}
                </span>
              </div>
              <p className="text-sm font-black uppercase tracking-widest text-muted-foreground opacity-70">
                Total Rombel / Kelas
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-indigo-500/20 to-card border-none shadow-xl shadow-indigo-500/5 rounded-3xl group transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="size-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black">
                  <Icon name="auto_stories" size={24} />
                </div>
                <span className="text-3xl font-black text-foreground">
                  {dosenSubjects.reduce(
                    (acc, s) => acc + (s._count?.meetings || 0),
                    0,
                  )}
                </span>
              </div>
              <p className="text-sm font-black uppercase tracking-widest text-muted-foreground opacity-70">
                Materi Sesi Terbit
              </p>
            </Card>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                <Icon name="school" className="text-secondary-brand" />
                Mata Kuliah Yang Diampu
              </h3>
            </div>

            {dosenLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-48 bg-card/50 animate-pulse rounded-3xl border border-border/30"
                  />
                ))}
              </div>
            ) : dosenSubjects.length === 0 ? (
              <div className="py-20 text-center bg-card/30 rounded-3xl border border-dashed border-border/50">
                <Icon
                  name="history_edu"
                  size={48}
                  className="text-muted-foreground/30 mb-4 mx-auto"
                />
                <p className="font-bold text-muted-foreground">
                  Anda belum ditugaskan ke mata kuliah manapun.
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Hubungi Administrator untuk plotting pengampu.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dosenSubjects.map((sub) => (
                  <Card
                    key={sub.id}
                    className="relative overflow-hidden rounded-[2rem] border-border/50 bg-card group shadow-sm hover:shadow-2xl hover:shadow-secondary-brand/10 transition-all duration-500"
                  >
                    <div className="h-40 bg-muted relative">
                      {sub.bannerImage ? (
                        <img
                          src={sub.bannerImage}
                          alt={sub.name}
                          className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="size-full bg-gradient-to-br from-secondary-brand/40 to-secondary-brand/10 flex items-center justify-center text-secondary-brand">
                          <Icon name="auto_stories" size={48} />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <span className="px-2 py-0.5 rounded-md bg-secondary-brand text-secondary-brand-foreground text-[10px] font-black uppercase tracking-tighter">
                          {sub.code}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h4 className="text-lg font-black tracking-tight mb-2 line-clamp-1">
                        {sub.name}
                      </h4>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {sub.classes.map((cl) => (
                          <span
                            key={cl.class.name}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                          >
                            Kelas {cl.class.name}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between gap-4 mt-auto">
                        <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <Icon name="description" size={14} />
                          {sub._count?.meetings || 0} Sesi
                        </div>
                        <Link
                          href={`/admin/courses/${sub.id}/meetings` as Route}
                        >
                          <Button
                            variant="outline"
                            className="rounded-xl font-black text-[10px] uppercase tracking-widest px-4 h-9 hover:bg-secondary-brand hover:text-white transition-all border-secondary-brand/20"
                          >
                            Kelola Sesi
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Ringkasan Eksekutif">
      <div className="flex flex-col gap-8">
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statLabels.map((label, i) => {
            return (
              <Card
                key={label}
                className="group relative overflow-hidden border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-50",
                    statColors[i],
                  )}
                />
                <CardHeader className="relative flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                    {label}
                  </CardTitle>
                  <div className="rounded-md border border-border bg-background p-2 shadow-sm">
                    <Icon
                      name={statIcons[i]}
                      size={18}
                      className="text-foreground"
                    />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl md:text-3xl font-black tracking-tight">
                      {metricValues[i]}
                    </span>
                    <span className="flex items-center gap-0.5 rounded-sm bg-primary/10 px-1 py-0.5 text-[10px] font-black text-primary border border-primary/20">
                      <Icon name="arrow_outward" size={12} />
                      12%
                    </span>
                  </div>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    vs. bulan lalu
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2 border border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/40 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-primary text-primary-foreground shadow-sm">
                  <Icon name="monitoring" size={18} />
                </div>
                <CardTitle className="text-lg font-black uppercase">
                  Aktivitas Terkini
                </CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="h-8 border border-border bg-card text-[10px] font-black uppercase tracking-widest text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-muted"
              >
                <Link href={"/admin/insights" as Route}>Lihat Laporan</Link>
              </Button>
            </CardHeader>
            <div className="hidden lg:block p-0">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow className="hover:bg-transparent border-b border-border">
                    <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Pengguna
                    </TableHead>
                    <TableHead className="py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Aktivitas
                    </TableHead>
                    <TableHead className="py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Waktu
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminLoading ? (
                    Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <TableRow key={i}>
                          <TableCell
                            colSpan={4}
                            className="h-16 border-b border-border/30"
                          >
                            <Skeleton className="h-10 w-full rounded-lg" />
                          </TableCell>
                        </TableRow>
                      ))
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={4} className="p-6">
                        <EmptyState
                          title="Gagal memuat aktivitas"
                          description={error}
                          className="min-h-40"
                        />
                      </TableCell>
                    </TableRow>
                  ) : data?.activities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="p-6">
                        <EmptyState
                          icon={() => <Icon name="monitoring" size={32} />}
                          title="Belum ada aktivitas"
                          description="Aktivitas pengguna akan muncul di sini setelah ada interaksi baru di platform."
                          className="min-h-40"
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.activities.map((item, idx) => {
                      const sKey = item.status.toLowerCase();
                      const variant =
                        sKey === "completed" || sKey === "aktif"
                          ? "default"
                          : sKey === "pending" || sKey === "proses"
                            ? "secondary"
                            : "destructive";
                      return (
                        <TableRow
                          key={item.id}
                          className={cn(
                            "group transition-colors hover:bg-muted/30",
                            idx !== data.activities.length - 1 &&
                              "border-b border-border/30",
                          )}
                        >
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                {getInitials(item.user)}
                              </div>
                              <span className="text-sm font-semibold">
                                {item.user}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 text-sm text-muted-foreground">
                            {item.activity}
                          </TableCell>
                          <TableCell className="py-4 text-center">
                            <Badge
                              variant={variant as BadgeProps["variant"]}
                              className="text-[10px] font-semibold uppercase"
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(item.date)}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="lg:hidden divide-y divide-border">
              {adminLoading ? (
                Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={`mobile-activity-skeleton-${i}`}
                      className="p-4 space-y-2"
                    >
                      <Skeleton className="h-4 w-32 rounded-lg" />
                      <Skeleton className="h-3 w-full rounded-lg" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-16 rounded-lg" />
                        <Skeleton className="h-3 w-20 rounded-lg" />
                      </div>
                    </div>
                  ))
              ) : error ? (
                <div className="p-4">
                  <EmptyState
                    title="Gagal memuat aktivitas"
                    description={error}
                  />
                </div>
              ) : data?.activities.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    icon={() => <Icon name="monitoring" size={32} />}
                    title="Belum ada aktivitas"
                    description="Aktivitas pengguna akan muncul di sini."
                  />
                </div>
              ) : (
                data?.activities.map((item) => {
                  const sKey = item.status.toLowerCase();
                  const variant =
                    sKey === "completed" || sKey === "aktif"
                      ? "default"
                      : sKey === "pending" || sKey === "proses"
                        ? "secondary"
                        : "destructive";
                  return (
                    <div key={item.id} className="flex items-start gap-3 p-4">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {getInitials(item.user)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">
                          {item.user}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.activity}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge
                            variant={variant as BadgeProps["variant"]}
                            className="text-[10px]"
                          >
                            {item.status}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(item.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="border border-border bg-card p-6 shadow-sm overflow-hidden">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-secondary-brand/10 text-secondary-brand shadow-sm">
                    <Icon name="trending_up" size={18} />
                  </div>
                  <h3 className="font-black uppercase text-sm">Kurva Harian</h3>
                </div>
                <Badge
                  variant="outline"
                  className="bg-primary/5 text-[9px] font-black uppercase tracking-widest text-primary border-primary/30"
                >
                  7 Hari
                </Badge>
              </div>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={growthData}
                    margin={{ top: 8, right: 8, left: -16, bottom: 8 }}
                  >
                    <CartesianGrid
                      stroke="var(--border-primary)"
                      strokeDasharray="3 3"
                      opacity={0.35}
                    />
                    <XAxis
                      dataKey="day"
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fill: "var(--text-dim)",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                      axisLine={false}
                      tickLine={false}
                      width={28}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="var(--primary)"
                      strokeWidth={4}
                      dot={{
                        r: 4,
                        strokeWidth: 2,
                        fill: "var(--bg-card)",
                        stroke: "var(--primary)",
                      }}
                      activeDot={{
                        r: 6,
                        fill: "var(--primary)",
                        stroke: "var(--bg-card)",
                        strokeWidth: 3,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="group relative border border-border bg-card p-6 shadow-sm overflow-hidden">
              <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/20 blur-3xl transition-transform group-hover:scale-110" />
              <div className="absolute -left-8 -bottom-8 size-32 rounded-full bg-primary/20 blur-3xl transition-transform group-hover:scale-110" />

              <div className="relative">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md border border-border bg-primary/10 shadow-sm">
                  <Icon
                    name="lightbulb"
                    size={24}
                    className="text-primary group-hover:animate-pulse"
                  />
                </div>
                <h3 className="mb-3 text-lg font-black uppercase tracking-tight text-foreground">
                  AI Platform Insight
                </h3>
                <p className="mb-6 text-sm font-medium leading-relaxed text-muted-foreground">
                  Platform Anda tercatat memiliki{" "}
                  <span className="font-black text-foreground underline decoration-primary/60 decoration-2 underline-offset-4">
                    {metricValues[0]} pengguna
                  </span>{" "}
                  aktif dengan{" "}
                  <span className="font-black text-foreground underline decoration-primary/60 decoration-2 underline-offset-4">
                    {metricValues[1]} kursus
                  </span>{" "}
                  berjalan. Efisiensi penggunaan AI bulan ini mencapai{" "}
                  <span className="font-black text-primary">
                    {metricValues[3]}
                  </span>
                  , menunjukkan adopsi fitur yang sangat positif.
                </p>
                <Button
                  variant="outline"
                  className="w-full border border-border bg-card font-black uppercase tracking-widest text-[10px] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-muted hover:text-primary"
                  size="sm"
                  asChild
                >
                  <Link
                    href={"/admin/stats" as Route}
                    className="flex items-center justify-center gap-2"
                  >
                    Buka Manajemen Chatbot
                    <Icon name="arrow_outward" size={16} />
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
