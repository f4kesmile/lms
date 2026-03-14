"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { getInitials, formatDate } from "@/lib/utils";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "dosen" | "mahasiswa";
  createdAt: string;
};

type UsersResponse = { users: UserItem[] };
type UserRole = UserItem["role"];

const roleConfig: Record<string, { cls: string; label: string }> = {
  admin: { cls: "pill-danger", label: "Admin" },
  dosen: { cls: "pill-success", label: "Dosen" },
  mahasiswa: { cls: "pill-info", label: "Mahasiswa" },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUsers() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ page: "1", limit: "20" });
        if (search.trim()) params.set("search", search.trim());
        if (role !== "all") params.set("role", role);

        const response = await fetch(`/api/users?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as UsersResponse & {
          message?: string;
        };

        if (!response.ok) {
          throw new Error(data.message || "Gagal memuat users");
        }

        setUsers(data.users ?? []);
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Gagal memuat users");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
    return () => controller.abort();
  }, [search, role]);

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

      // Refresh data local
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengubah role");
    } finally {
      setLoading(false);
    }
  }

  const displayed = useMemo(() => users.slice(0, 10), [users]);

  return (
    <AdminLayout
      title="Manajemen Pengguna"
      subtitle="Kelola hak akses dan peran seluruh sivitas akademika."
    >
      <section className="neo-card" style={{ overflow: "hidden" }}>
        <div
          className="row"
          style={{
            padding: "1.25rem 1.5rem",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div className="input-group" style={{ flex: 1, minWidth: 200 }}>
            <span className="input-icon material-symbols-outlined">search</span>
            <input
              className="input input-with-icon"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="select"
            style={{ maxWidth: 200 }}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="all">Semua Peran</option>
            <option value="admin">Admin</option>
            <option value="dosen">Dosen</option>
            <option value="mahasiswa">Mahasiswa</option>
          </select>
        </div>

        <div
          className="table-shell"
          style={{ border: "none", borderRadius: 0, boxShadow: "none" }}
        >
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Peran</th>
                <th>Tanggal Bergabung</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((user) => {
                const rc = roleConfig[user.role] ?? {
                  cls: "pill",
                  label: user.role,
                };
                return (
                  <tr key={user.email}>
                    <td>
                      <div className="row">
                        <div
                          className="avatar avatar-sm"
                          style={{
                            background: "rgba(190,239,0,0.08)",
                            color: "var(--primary)",
                            fontSize: "0.7rem",
                          }}
                        >
                          {getInitials(user.name)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-soft)" }}>{user.email}</td>
                    <td>
                      <span className={`pill ${rc.cls}`}>{rc.label}</span>
                    </td>
                    <td
                      style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}
                    >
                      {formatDate(user.createdAt)}
                    </td>
                    <td>
                      <select
                        className="select"
                        style={{
                          padding: "0.25rem 0.5rem",
                          fontSize: "0.8rem",
                          width: "auto",
                        }}
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value as UserRole)
                        }
                        disabled={loading}
                      >
                        {user.role !== "admin" && (
                          <option value="admin">Admin</option>
                        )}
                        {user.role !== "dosen" && (
                          <option value="dosen">Dosen</option>
                        )}
                        {user.role !== "mahasiswa" && (
                          <option value="mahasiswa">Mahasiswa</option>
                        )}
                        <option value={user.role} disabled hidden>
                          {rc.label}
                        </option>
                      </select>
                    </td>
                  </tr>
                );
              })}
              {!loading && !error && users.length === 0 && (
                <tr>
                  <td colSpan={5}>Tidak ada pengguna ditemukan.</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={5}>Memuat data pengguna...</td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={5} style={{ color: "var(--rose)" }}>
                    {error}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {users.length > 0 && (
          <div
            className="row"
            style={{
              justifyContent: "flex-end",
              padding: "1rem 1.5rem",
              gap: "0.5rem",
            }}
          >
            <span
              className="text-dim"
              style={{ fontSize: "0.8rem", marginRight: "auto" }}
            >
              Menampilkan {displayed.length} dari {users.length} Pengguna
            </span>
            <button
              className="btn-ghost"
              style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}
            >
              Prev
            </button>
            <button
              className="btn"
              style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
