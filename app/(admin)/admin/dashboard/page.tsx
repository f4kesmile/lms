"use client";

import { useEffect, useMemo, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
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
  type TooltipProps,
} from "recharts";

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
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      .finally(() => setLoading(false));
  }, []);

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

  const growthData = useMemo(() => {
    if (data?.growthSeries && data.growthSeries.length > 0) {
      return DAY_LABELS.map((day) => {
        const point = data.growthSeries?.find((item) => item.day === day);
        return {
          day,
          value: Math.round(point?.value ?? 0),
        };
      });
    }

    return DAY_LABELS.map((day, index) => ({
      day,
      value: Math.round(bars[index] ?? 0),
    }));
  }, [bars, data?.growthSeries]);

  const metricValues = data
    ? [
        data.metrics.totalUsers.toLocaleString(),
        data.metrics.totalCourses.toString(),
        data.metrics.totalModules.toString(),
        `${data.metrics.aiUsage}%`,
      ]
    : ["0", "0", "0", "0%"];

  interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ value: number; payload: { day: string } }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0];
      const numeric = dataPoint.value;
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
          <p className="font-bold text-muted-foreground">{label}</p>
          <p className="text-sm font-black text-primary">
            {numeric}{" "}
            <span className="font-bold text-foreground">Aktivitas</span>
          </p>
        </div>
      );
    }
    return null;
  };

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
                    <Icon name={statIcons[i]} size={18} className="text-foreground" />
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
                  {loading ? (
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
                            idx !== data.activities.length - 1 && "border-b border-border/30"
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
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={`mobile-activity-skeleton-${i}`} className="p-4 space-y-2">
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
                  <EmptyState title="Gagal memuat aktivitas" description={error} />
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
                        <p className="text-sm font-semibold truncate">{item.user}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.activity}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant={variant as BadgeProps["variant"]} className="text-[10px]">
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
                      tick={{ fill: "var(--text-dim)", fontSize: 10, fontWeight: 700 }}
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
                  <Icon name="lightbulb" size={24} className="text-primary group-hover:animate-pulse" />
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
                    href="/admin/stats"
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
