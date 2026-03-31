import { useEffect, useMemo, useState } from "react";

import type {
  UserItem,
  UserRole,
  UsersResponse,
} from "@/app/(admin)/admin/users/_lib/types";
import { toastUpdateFailed, toastUpdated } from "@/lib/utils/toast";

export function useUsersController() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"all" | UserRole>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const startItem = useMemo(
    () => (total === 0 ? 0 : (page - 1) * limit + 1),
    [page, limit, total],
  );
  const endItem = useMemo(
    () => (total === 0 ? 0 : Math.min(page * limit, total)),
    [page, limit, total],
  );

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
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        setError(error instanceof Error ? error.message : "Gagal memuat users");
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      void loadUsers();
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
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal mengubah role");
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user,
        ),
      );
      toastUpdated("role pengguna");
    } catch (error) {
      toastUpdateFailed("role pengguna", error);
      setError(error instanceof Error ? error.message : "Gagal mengubah role");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateUser(userId: string, data: Partial<UserItem>) {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Gagal memperbarui data user");
      }

      const updated = await response.json();
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, ...updated } : user,
        ),
      );
      toastUpdated("data pengguna");
    } catch (error) {
      toastUpdateFailed("data pengguna", error);
      setError(
        error instanceof Error ? error.message : "Gagal memperbarui data user",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleEditClick(user: UserItem) {
    setSelectedUser(user);
    setIsModalOpen(true);
  }

  return {
    users,
    search,
    setSearch,
    role,
    setRole,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    total,
    totalPages,
    startItem,
    endItem,
    selectedUser,
    isModalOpen,
    setIsModalOpen,
    handleRoleChange,
    handleUpdateUser,
    handleEditClick,
  };
}
