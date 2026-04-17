"use client";

import Image from "next/image";
import type { Route } from "next";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  STAT_COLORS,
  STAT_ICONS,
  STAT_LABELS,
} from "@/app/(admin)/admin/dashboard/_lib/constants";
import type {
  CustomTooltipProps,
  DashboardResponse,
  GrowthPoint,
} from "@/app/(admin)/admin/dashboard/_lib/types";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEFAULT_AVATAR_DATA_URL } from "@/lib/constants/avatar";
import { cn, formatDate } from "@/lib/utils/index";

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

type AdminDashboardContentProps = {
  data: DashboardResponse | null;
  error: string | null;
  adminLoading: boolean;
  growthData: GrowthPoint[];
  metricValues: string[];
};

export function AdminDashboardContent({
  data,
  error,
  adminLoading,
  growthData,
  metricValues,
}: AdminDashboardContentProps) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const node = chartContainerRef.current;
    if (!node) return;

    const updateSize = () => {
      const rect = node.getBoundingClientRect();
      setChartSize({
        width: Math.max(0, Math.floor(rect.width)),
        height: Math.max(0, Math.floor(rect.height)),
      });
    };

    updateSize();

    const observer = new ResizeObserver(() => {
      updateSize();
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_LABELS.map((label, index) => {
          return (
            <Card
              key={label}
              className="group relative overflow-hidden border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-50",
                  STAT_COLORS[index],
                )}
              />
              <CardHeader className="relative flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                  {label}
                </CardTitle>
                <div className="rounded-md border border-border bg-background p-2 shadow-sm">
                  <Icon
                    name={STAT_ICONS[index]}
                    size={18}
                    className="text-foreground"
                  />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-black tracking-tight">
                    {metricValues[index]}
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
                    const statusKey = item.status.toLowerCase();
                    const variant =
                      statusKey === "completed" || statusKey === "aktif"
                        ? "default"
                        : statusKey === "pending" || statusKey === "proses"
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
                            <div className="flex size-8 shrink-0 overflow-hidden rounded-full bg-primary/10">
                              <Image
                                src={DEFAULT_AVATAR_DATA_URL}
                                alt={item.user}
                                width={32}
                                height={32}
                                unoptimized
                                className="size-full object-cover"
                              />
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
                const statusKey = item.status.toLowerCase();
                const variant =
                  statusKey === "completed" || statusKey === "aktif"
                    ? "default"
                    : statusKey === "pending" || statusKey === "proses"
                      ? "secondary"
                      : "destructive";
                return (
                  <div key={item.id} className="flex items-start gap-3 p-4">
                    <div className="flex size-9 shrink-0 overflow-hidden rounded-full bg-primary/10">
                      <Image
                        src={DEFAULT_AVATAR_DATA_URL}
                        alt={item.user}
                        width={36}
                        height={36}
                        unoptimized
                        className="size-full object-cover"
                      />
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
            <div
              ref={chartContainerRef}
              className="h-52 w-full min-w-0 min-h-[208px]"
            >
              {chartSize.width > 0 && chartSize.height > 0 ? (
                <LineChart
                  width={chartSize.width}
                  height={chartSize.height}
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
              ) : (
                <Skeleton className="h-full w-full rounded-md" />
              )}
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
  );
}
