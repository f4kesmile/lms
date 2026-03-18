import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { getCurrentUser, hasRole } from "@/lib/current-user";
import { forbidden, serverError, unauthorized } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type ActivityItem = {
  id: string;
  user: string;
  activity: string;
  status: "Completed" | "Pending" | "Active";
  date: string;
};

type GrowthPoint = {
  day: "Sen" | "Sel" | "Rab" | "Kam" | "Jum" | "Sab" | "Min";
  value: number;
};

const DAY_LABELS: GrowthPoint["day"][] = [
  "Sen",
  "Sel",
  "Rab",
  "Kam",
  "Jum",
  "Sab",
  "Min",
];

function mapJsDayToLabel(day: number): GrowthPoint["day"] {
  // JS Date#getDay(): 0=Sun .. 6=Sat
  const map: GrowthPoint["day"][] = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  return map[day] ?? "Sen";
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorized();

    if (!hasRole(currentUser.role, [UserRole.admin, UserRole.dosen])) {
      return forbidden("Only admin or dosen can access dashboard metrics");
    }

    const [
      totalUsers,
      totalCourses,
      totalModules,
      totalTurns,
      recentUsers,
      recentMaterials,
      recentTurns,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.class.count(),
      prisma.subject.count({ where: { isActive: true } }),
      prisma.chatTurn.count(),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 4,
        select: { id: true, name: true, createdAt: true },
      }),
      prisma.courseMaterial.findMany({
        orderBy: { createdAt: "desc" },
        take: 4,
        select: { id: true, title: true, createdAt: true },
      }),
      prisma.chatTurn.findMany({
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          id: true,
          question: true,
          createdAt: true,
          rating: true,
          user: { select: { name: true } },
        },
      }),
    ]);

    const activities: ActivityItem[] = [
      ...recentUsers.map((item) => ({
        id: `user-${item.id}`,
        user: item.name,
        activity: "Akun baru terdaftar",
        status: "Completed" as const,
        date: item.createdAt.toISOString(),
      })),
      ...recentMaterials.map((item) => ({
        id: `material-${item.id}`,
        user: "Admin",
        activity: `Upload materi: ${item.title}`,
        status: "Active" as const,
        date: item.createdAt.toISOString(),
      })),
      ...recentTurns.map((item) => ({
        id: `turn-${item.id}`,
        user: item.user.name,
        activity: `Mengirim pertanyaan: ${item.question.slice(0, 44)}${item.question.length > 44 ? "..." : ""}`,
        status: (item.rating ? "Completed" : "Pending") as "Completed" | "Pending",
        date: item.createdAt.toISOString(),
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);

    const aiUsage = totalUsers > 0 ? Math.min(100, Math.round((totalTurns / totalUsers) * 10)) : 0;

    const dailyCounter = new Map<GrowthPoint["day"], number>(
      DAY_LABELS.map((day) => [day, 0])
    );

    for (const item of activities) {
      const label = mapJsDayToLabel(new Date(item.date).getDay());
      dailyCounter.set(label, (dailyCounter.get(label) ?? 0) + 1);
    }

    const growthSeries: GrowthPoint[] = DAY_LABELS.map((day) => {
      const count = dailyCounter.get(day) ?? 0;
      return {
        day,
        value: count,
      };
    });

    return NextResponse.json({
      metrics: {
        totalUsers,
        totalCourses,
        totalModules,
        aiUsage,
      },
      activities,
      growthSeries,
    });
  } catch (error) {
    return serverError(error);
  }
}
