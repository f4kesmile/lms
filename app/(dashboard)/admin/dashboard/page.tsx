"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { getInitials, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge, type BadgeProps } from "@/components/ui/badge";

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

const statIcons = ["person", "library_books", "extension", "smart_toy"];
const statLabels = ["Total Pengguna", "Kursus", "Modul Aktif", "Penggunaan AI"];

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      });
  }, []);

  const bars = useMemo(() => {
    if (!data) return [20, 20, 20, 20, 20, 20, 20];
    const activityCount = data.activities.length;
    return [1, 2, 3, 4, 5, 6, 7].map((day) => {
      const dayActivities = data.activities.filter((item) => {
        const d = new Date(item.date).getDay();
        return d === day % 7;
      }).length;
      return Math.min(
        100,
        Math.max(10, (dayActivities / Math.max(activityCount, 1)) * 200),
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
    : ["-", "-", "-", "-"];

  return (
    <AdminLayout
      title="Ringkasan Dasbor"
      subtitle="Selamat datang kembali, berikut perkembangan hari ini."
      headerActions={
        <Button variant="default" size="sm">
          <span className="material-symbols-outlined text-sm">add</span>
          Kursus Baru
        </Button>
      }
    >
      {/* Stat Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statLabels.map((label, i) => (
          <Card key={label} className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-dim">
                {label}
              </CardTitle>
              <div className="bg-primary/10 p-2 rounded-md text-primary">
                <span className="material-symbols-outlined">
                  {statIcons[i]}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{metricValues[i]}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Recent Activities */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-6 bg-card">
          <h2 className="text-xl font-bold">Aktivitas Terbaru</h2>
          <Button variant="ghost" className="text-primary font-bold">
            Lihat Semua
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pengguna</TableHead>
              <TableHead>Aktivitas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.activities.map((item) => {
              const sKey = item.status.toLowerCase();
              const variant =
                sKey === "completed"
                  ? "default"
                  : sKey === "pending"
                    ? "destructive"
                    : "secondary";
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold">
                        {getInitials(item.user)}
                      </div>
                      <span className="font-semibold">{item.user}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-dim">{item.activity}</TableCell>
                  <TableCell>
                    <Badge variant={variant as BadgeProps["variant"]}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-dim text-sm">
                    {formatDate(item.date)}
                  </TableCell>
                </TableRow>
              );
            })}
            {!error && (data?.activities.length ?? 0) === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Belum ada aktivitas terbaru.
                </TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-destructive"
                >
                  {error}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Platform Growth + AI Insight */}
      <section className="admin-grid-2">
        <article
          style={{
            padding: "1.5rem",
            borderRadius: "var(--radius-md)",
            background: "rgba(190,239,0,0.03)",
            border: "1px solid var(--border-primary)",
          }}
        >
          <h4
            className="row"
            style={{ fontWeight: 700, marginBottom: "1rem", gap: "0.5rem" }}
          >
            <span
              className="material-symbols-outlined"
              style={{ color: "var(--primary)" }}
            >
              analytics
            </span>
            Platform Growth
          </h4>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "0.4rem",
              height: 160,
            }}
          >
            {bars.map((h, i) => (
              <div
                key={`bar-${i}`}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  borderRadius: "4px 4px 0 0",
                  background: `rgba(190,239,0,${0.2 + (h / 100) * 0.8})`,
                }}
              />
            ))}
          </div>
          <div
            className="row space-between"
            style={{
              marginTop: "0.5rem",
              fontSize: "0.6rem",
              fontWeight: 700,
              color: "var(--text-dim)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </article>

        <article
          className="neo-card"
          style={{
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div className="row" style={{ marginBottom: "1rem" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "rgba(190,239,0,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary)",
              }}
            >
              <span className="material-symbols-outlined">lightbulb</span>
            </div>
            <div>
              <h4 style={{ fontWeight: 700 }}>AI Insight</h4>
              <p className="text-dim" style={{ fontSize: "0.8rem" }}>
                Ringkasan Platform
              </p>
            </div>
          </div>
          <p
            className="text-muted"
            style={{ lineHeight: 1.7, marginBottom: "1rem" }}
          >
            Platform saat ini memiliki{" "}
            <span style={{ color: "var(--primary)", fontWeight: 700 }}>
              {metricValues[0]} pengguna
            </span>{" "}
            dan{" "}
            <span style={{ color: "var(--primary)", fontWeight: 700 }}>
              {metricValues[1]} kelas aktif
            </span>
            . Tingkat penggunaan AI berada di {metricValues[3]}.
          </p>
          <Link
            className="btn-ghost"
            href="/admin/stats"
            style={{ width: "fit-content", fontSize: "0.85rem" }}
          >
            Lihat Statistik
          </Link>
        </article>
      </section>
    </AdminLayout>
  );
}
