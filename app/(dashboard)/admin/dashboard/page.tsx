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

type DashboardResponse = {
  metrics: {
    totalUsers: number;
    totalCourses: number;
    totalModules: number;
    aiUsage: number;
  };
  activities: Array<{
    id: string;
    user: string;
    activity: string;
    status: string;
    date: string;
  }>;
};

const statColors = [
  "from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "from-blue-500/20 to-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/20",
  "from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/20",
  "from-purple-500/20 to-purple-500/5 text-purple-600 dark:text-purple-400 border-purple-500/20",
];

const statIcons = [Users, BookOpen, Component, Cpu];
const statLabels = [
  "Total Pengguna",
  "Kursus Aktif",
  "Modul Belajar",
  "Efisiensi AI",
];

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
    if (!data) return Array(7).fill(20);
    const activityCount = data.activities.length;
    return [1, 2, 3, 4, 5, 6, 7].map((day) => {
      const dayActivities = data.activities.filter((item) => {
        const d = new Date(item.date).getDay();
        return d === day % 7;
      }).length;
      return Math.min(
        100,
        Math.max(15, (dayActivities / Math.max(activityCount, 1)) * 300),
      );
    });
  }, [data]);

  const metricValues = data
    ? [
        data.metrics.totalUsers.toLocaleString(),
        data.metrics.totalCourses.toString(),
        data.metrics.totalModules.toString(),
        `${data.metrics.aiUsage}%`,
      ]
    : ["0", "0", "0", "0%"];

  return (
    <AdminLayout
      title="Ringkasan Eksekutif"
      headerActions={
        <Button
          className="font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105"
          size="sm"
        >
          <Plus className="mr-1 size-4" />
          Kelas Baru
        </Button>
      }
    >
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
                    <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
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
                variant="ghost"
                size="sm"
                asChild
                className="text-xs font-bold text-primary hover:bg-primary/5"
              >
                <Link href={"/admin/dashboard" as Route}>Lihat Laporan</Link>
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
                  <TrendingUp className="size-5 text-emerald-500" />
                  <h3 className="font-bold">Kurva Pertumbuhan</h3>
                </div>
                <Badge
                  variant="outline"
                  className="text-[9px] font-bold border-emerald-500/30 text-emerald-500 bg-emerald-500/5"
                >
                  7 Hari Terakhir
                </Badge>
              </div>
              <div className="flex h-40 items-end gap-2 px-1">
                {bars.map((h, i) => (
                  <div key={`bar-${i}`} className="group relative flex-1">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-primary/40 to-primary/90 transition-all duration-300 hover:scale-x-110 hover:to-primary"
                      style={{ height: `${h}%` }}
                    />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-foreground px-1 py-0.5 text-[8px] font-bold text-background opacity-0 transition-opacity group-hover:opacity-100">
                      {Math.round(h)}%
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <span>Sen</span>
                <span>Sel</span>
                <span>Rab</span>
                <span>Kam</span>
                <span>Jum</span>
                <span>Sab</span>
                <span>Min</span>
              </div>
            </Card>

            {/* AI Insight Card */}
            <Card className="group relative border-none bg-emerald-900 text-emerald-50 p-6 shadow-lg shadow-emerald-900/20 overflow-hidden">
              {/* Background pattern */}
              <div className="absolute -right-8 -top-8 size-32 rounded-full bg-emerald-800/50 blur-3xl" />
              <div className="absolute -left-8 -bottom-8 size-32 rounded-full bg-emerald-800/50 blur-3xl" />

              <div className="relative">
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner">
                  <Lightbulb className="size-6 text-emerald-300 group-hover:animate-pulse" />
                </div>
                <h3 className="mb-2 text-lg font-black tracking-tight">
                  AI Platform Insight
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-emerald-100/80">
                  Platform Anda tercatat memiliki{" "}
                  <span className="font-bold text-white">
                    {metricValues[0]} pengguna
                  </span>{" "}
                  aktif dengan{" "}
                  <span className="font-bold text-white">
                    {metricValues[1]} kursus
                  </span>{" "}
                  berjalan. Efisiensi penggunaan AI bulan ini mencapai{" "}
                  {metricValues[3]}, menunjukkan adopsi fitur yang sangat
                  positif.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-white/20 bg-white/10 font-bold tracking-tight hover:bg-white/20 hover:text-white"
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
