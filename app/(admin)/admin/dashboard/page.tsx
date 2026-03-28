"use client";

import { AdminDashboardContent } from "@/app/(admin)/admin/dashboard/_components/AdminDashboardContent";
import { DosenDashboardContent } from "@/app/(admin)/admin/dashboard/_components/DosenDashboardContent";
import { useDashboardController } from "@/app/(admin)/admin/dashboard/_hooks/useDashboardController";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
  const {
    user,
    roleLoading,
    data,
    error,
    adminLoading,
    dosenSubjects,
    dosenLoading,
    growthData,
    metricValues,
  } = useDashboardController();

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
        <DosenDashboardContent
          dosenSubjects={dosenSubjects}
          dosenLoading={dosenLoading}
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Ringkasan Eksekutif">
      <AdminDashboardContent
        data={data}
        error={error}
        adminLoading={adminLoading}
        growthData={growthData}
        metricValues={metricValues}
      />
    </AdminLayout>
  );
}
