"use client";

import { useEffect, useMemo, useState } from "react";

import AdminShell from "@/components/AdminShell";

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

const statusConfig: Record<string, { cls: string; label: string }> = {
  completed: { cls: "pill-success", label: "Completed" },
  pending: { cls: "pill-warning", label: "Pending" },
  active: { cls: "pill-info", label: "Active" },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const statIcons = ["person", "library_books", "extension", "smart_toy"];
const statLabels = ["Total Users", "Courses", "Active Modules", "AI Usage"];
const statChanges = ["+12%", "+3%", "+8%", "-2%"];

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
    const count = data?.activities.length ?? 0;
    return [25, 50, 20, 75, 40, 100, 80].map((value) =>
      Math.min(100, value + count),
    );
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
    <AdminShell
      title="Dashboard Overview"
      subtitle="Welcome back, here is what is happening today."
      headerActions={
        <button className="btn" style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
          New Course
        </button>
      }
    >
      {/* Stat Cards */}
      <section className="admin-grid-4">
        {statLabels.map((label, i) => (
          <article className="stat-card" key={label}>
            <div className="row space-between" style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(190,239,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary)",
                }}
              >
                <span className="material-symbols-outlined">{statIcons[i]}</span>
              </div>
              <span className={`kpi-change${i === 3 ? " negative" : ""}`}>
                {statChanges[i]}
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  {i === 3 ? "trending_down" : "trending_up"}
                </span>
              </span>
            </div>
            <p className="text-dim" style={{ fontSize: "0.85rem" }}>{label}</p>
            <p className="stat-value">{metricValues[i]}</p>
          </article>
        ))}
      </section>

      {/* Recent Activities */}
      <section className="neo-card" style={{ overflow: "hidden" }}>
        <div className="row space-between" style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-primary)" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Recent Activities</h2>
          <button className="nav-link" style={{ color: "var(--primary)", fontWeight: 600, fontSize: "0.85rem" }}>
            View All
          </button>
        </div>
        <div className="table-shell" style={{ border: "none", borderRadius: 0, boxShadow: "none" }}>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Activity</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.activities.map((item) => {
                const sKey = item.status.toLowerCase();
                const config = statusConfig[sKey] ?? { cls: "pill", label: item.status };
                return (
                  <tr key={item.id}>
                    <td>
                      <div className="row">
                        <div
                          className="avatar avatar-sm"
                          style={{
                            background: "rgba(190,239,0,0.08)",
                            color: "var(--text-dim)",
                            fontSize: "0.7rem",
                          }}
                        >
                          {getInitials(item.user)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{item.user}</span>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-soft)" }}>{item.activity}</td>
                    <td>
                      <span className={`pill ${config.cls}`}>{config.label}</span>
                    </td>
                    <td style={{ textAlign: "right", color: "var(--text-dim)", fontSize: "0.85rem" }}>
                      {new Date(item.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                );
              })}
              {!error && (data?.activities.length ?? 0) === 0 && (
                <tr><td colSpan={4}>Belum ada aktivitas terbaru.</td></tr>
              )}
              {error && (
                <tr><td colSpan={4} style={{ color: "var(--rose)" }}>{error}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

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
          <h4 className="row" style={{ fontWeight: 700, marginBottom: "1rem", gap: "0.5rem" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--primary)" }}>
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
            style={{ marginTop: "0.5rem", fontSize: "0.6rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}
          >
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </article>

        <article className="neo-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
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
              <p className="text-dim" style={{ fontSize: "0.8rem" }}>Suggested Action</p>
            </div>
          </div>
          <p className="text-muted" style={{ lineHeight: 1.7, marginBottom: "1rem" }}>
            Siswa mengalami kesulitan pada{" "}
            <span style={{ color: "var(--primary)", fontWeight: 700 }}>Module 3 Kursus UI Design</span>.
            Tingkat kegagalan kuis meningkat 15% minggu ini.
          </p>
          <button className="btn-ghost" type="button" style={{ width: "fit-content", fontSize: "0.85rem" }}>
            Review Module
          </button>
        </article>
      </section>
    </AdminShell>
  );
}
