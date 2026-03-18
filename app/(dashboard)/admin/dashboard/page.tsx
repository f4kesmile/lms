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
import {
  Plus,
  Users,
  BookOpen,
  Component,
  Cpu,
  Activity,
  Lightbulb,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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
  "from-primary/20 to-primary/5 text-primary dark:text-primary border-primary/20",
  "from-secondary-brand/20 to-secondary-brand/5 text-secondary-brand dark:text-secondary-brand border-secondary-brand/20",
  "from-secondary-brand/20 to-secondary-brand/5 text-secondary-brand dark:text-secondary-brand border-secondary-brand/20",
  "from-secondary-brand/20 to-secondary-brand/5 text-secondary-brand dark:text-secondary-brand border-secondary-brand/20",
];

const statIcons = [Users, BookOpen, Component, Cpu];
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

  return (
    <AdminLayout title="Ringkasan Eksekutif">
      <div className="flex flex-col gap-8">
        {/* Stat Cards Row */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statLabels.map((label, i) => {
            const Icon = statIcons[i];
            return (
              <Card
                key={label}
                className="group relative overflow-hidden border-none bg-card shadow-md transition-all hover:shadow-xl hover:-translate-y-1"
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
                  <div className="rounded-full bg-background/50 p-2 shadow-sm backdrop-blur-sm">
                    <Icon className="size-4 opacity-80" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black tracking-tight">
                      {metricValues[i]}
                    </span>
                    <span className="text-[10px] font-bold text-primary flex items-center gap-0.5">
                      <ArrowUpRight className="size-3" />
                      12%
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                    vs. bulan lalu
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Recent Activities Table */}
          <Card className="lg:col-span-2 border-none bg-card shadow-lg overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/30 px-6 py-4">
              <div className="flex items-center gap-2">
                <Activity className="size-5 text-primary" />
                <CardTitle className="text-lg font-bold">
                  Aktivitas Terkini
                </CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="text-[10px] font-black uppercase tracking-widest border-primary bg-primary/5 text-primary hover:bg-primary hover:text-on-primary shadow-md transition-all duration-200"
              >
                <Link href={"/admin/insights" as Route}>Lihat Laporan</Link>
              </Button>
            </CardHeader>
            <div className="p-0">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-6 text-[10px] font-black uppercase tracking-widest">
                      Pengguna
                    </TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">
                      Aktivitas
                    </TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">
                      Status
                    </TableHead>
                    <TableHead className="px-6 text-[10px] font-black uppercase tracking-widest text-right">
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
                            <Skeleton className="h-10 w-full" />
                          </TableCell>
                        </TableRow>
                      ))
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={4} className="p-6">
                        <EmptyState
                          title="Gagal memuat aktivitas"
                          description={error}
                          className="min-h-40 border-destructive/30"
                        />
                      </TableCell>
                    </TableRow>
                  ) : data?.activities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="p-6">
                        <EmptyState
                          icon={Activity}
                          title="Belum ada aktivitas"
                          description="Aktivitas pengguna akan muncul di sini setelah ada interaksi baru di platform."
                          className="min-h-40"
                        />
                      </TableCell>
                    </TableRow>
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
                        <TableRow
                          key={item.id}
                          className="group border-b border-border/30 transition-colors hover:bg-muted/20"
                        >
                          <TableCell className="px-6">
                            <div className="flex items-center gap-3">
                              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-[10px] font-black text-primary ring-2 ring-primary/5 group-hover:scale-110 transition-transform">
                                {getInitials(item.user)}
                              </div>
                              <span className="text-sm font-bold tracking-tight">
                                {item.user}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                            {item.activity}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={variant as BadgeProps["variant"]}
                              className="text-[9px] font-black uppercase tracking-wider px-2 h-5"
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 text-right font-mono text-[11px] font-bold text-muted-foreground">
                            {formatDate(item.date)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Right Column: Growth & Insights */}
          <div className="flex flex-col gap-6">
            {/* Platform Growth Chart Card */}
            <Card className="border-none bg-card shadow-lg p-6 overflow-hidden">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-5 text-primary" />
                  <h3 className="font-bold">Kurva Aktivitas Harian</h3>
                </div>
                <Badge
                  variant="outline"
                  className="text-[9px] font-bold border-primary/30 text-primary bg-primary/5"
                >
                  7 Hari Terakhir
                </Badge>
              </div>
              <div className="h-52">
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
                        fill: "var(--text-dim)",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "var(--text-dim)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={28}
                    />
                    <Tooltip
                      cursor={{ stroke: "var(--primary)", strokeOpacity: 0.25 }}
                      contentStyle={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-primary)",
                        borderRadius: "10px",
                        color: "var(--text-main)",
                        fontSize: "12px",
                      }}
                      labelStyle={{ color: "var(--text-dim)", fontWeight: 700 }}
                      formatter={(value) => {
                        const numeric =
                          typeof value === "number"
                            ? value
                            : Number(value ?? 0);
                        return [`${numeric}`, "Aktivitas"];
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="var(--primary)"
                      strokeWidth={3}
                      dot={{
                        r: 3,
                        strokeWidth: 2,
                        fill: "var(--bg-card)",
                        stroke: "var(--primary)",
                      }}
                      activeDot={{
                        r: 5,
                        fill: "var(--primary)",
                        stroke: "var(--bg-card)",
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* AI Insight Card */}
            <Card className="group relative border-none bg-card text-foreground p-6 shadow-lg shadow-primary/20 overflow-hidden">
              {/* Background pattern */}
              <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -left-8 -bottom-8 size-32 rounded-full bg-primary/20 blur-3xl" />

              <div className="relative">
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-card/10 backdrop-blur-md shadow-inner">
                  <Lightbulb className="size-6 text-primary group-hover:animate-pulse" />
                </div>
                <h3 className="mb-2 text-xl font-black tracking-tight text-foreground">
                  AI Platform Insight
                </h3>
                <p className="mb-6 text-sm leading-relaxed !text-foreground font-medium">
                  Platform Anda tercatat memiliki{" "}
                  <span className="font-black !text-foreground underline decoration-primary/60 decoration-2 underline-offset-4">
                    {metricValues[0]} pengguna
                  </span>{" "}
                  aktif dengan{" "}
                  <span className="font-black !text-foreground underline decoration-primary/60 decoration-2 underline-offset-4">
                    {metricValues[1]} kursus
                  </span>{" "}
                  berjalan. Efisiensi penggunaan AI bulan ini mencapai{" "}
                  <span className="font-black !text-foreground">
                    {metricValues[3]}
                  </span>
                  , menunjukkan adopsi fitur yang sangat positif.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-primary/20 bg-card/10 font-bold tracking-tight hover:bg-card/20 hover:text-primary"
                  size="sm"
                  asChild
                >
                  <Link
                    href="/admin/stats"
                    className="flex items-center justify-center gap-2"
                  >
                    Buka Manajemen Chatbot
                    <ArrowUpRight className="size-4" />
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
