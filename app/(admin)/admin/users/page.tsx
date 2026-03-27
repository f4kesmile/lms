"use client";

import { Suspense, useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Filters } from "./_components/Filters";
import { Table } from "./_components/Table";
import { List } from "./_components/List";
import { DataViewportControls } from "../_components/Controls";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "dosen" | "mahasiswa";
  createdAt: string;
};

type UsersResponse = {
  users: UserItem[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    limit: number;
  };
};
type UserRole = UserItem["role"];

const roleConfig: Record<
  UserRole,
  { bg: string; text: string; label: string; icon: string }
> = {
  admin: {
    bg: "bg-destructive/10",
    text: "text-destructive",
    label: "Administrator",
    icon: "shield",
  },
  dosen: {
    bg: "bg-primary/10",
    text: "text-primary",
    label: "Dosen Pengajar",
    icon: "person",
  },
  mahasiswa: {
    bg: "bg-secondary-brand/10",
    text: "text-secondary-brand",
    label: "Mahasiswa",
    icon: "school",
  },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"all" | UserRole>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = total === 0 ? 0 : Math.min(page * limit, total);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUsers() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (search.trim()) params.set("search", search.trim());
        if (role !== "all") params.set("role", role);

        const response = await fetch(`/api/users?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as UsersResponse & {
          message?: string;
        };

        if (!response.ok) {
          throw new Error(data.message || "Gagal memuat daftar pengguna");
        }

        setUsers(data.users ?? []);
        if (data.pagination) {
          setTotal(data.pagination.total);
          setTotalPages(data.pagination.pages);
        }
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Gagal memuat users");
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadUsers();
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [search, role, page, limit]);

  useEffect(() => {
    setPage(1);
  }, [search, role, limit]);

  async function handleRoleChange(userId: string, newRole: UserRole) {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal mengubah role");
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengubah role");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout title="Manajemen Sivitas Akademika">
      <Suspense
        fallback={
          <div className="h-[60dvh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          <Filters
            search={search}
            setSearch={setSearch}
            role={role}
            setRole={setRole}
            totalUsers={total}
          />

          <Table
            users={users}
            loading={loading}
            error={error}
            roleConfig={roleConfig}
            handleRoleChange={handleRoleChange}
          />

          <List
            users={users}
            loading={loading}
            error={error}
            roleConfig={roleConfig}
            handleRoleChange={handleRoleChange}
          />

          <DataViewportControls
            startItem={startItem}
            endItem={endItem}
            totalItems={total}
            rowsPerPage={limit}
            onRowsPerPageChange={setLimit}
            entityLabel="pengguna"
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            loading={loading}
          />
        </div>
      </Suspense>
    </AdminLayout>
  );
}
