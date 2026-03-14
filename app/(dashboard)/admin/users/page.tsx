"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { getInitials, formatDate, cn } from "@/lib/utils/index";
import {
  Users,
  Search,
  Mail,
  Calendar,
  ShieldCheck,
  GraduationCap,
  User as UserIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "dosen" | "mahasiswa";
  createdAt: string;
};

type UsersResponse = { users: UserItem[] };
type UserRole = UserItem["role"];

const roleConfig: Record<
  UserRole,
  { bg: string; text: string; label: string; icon: LucideIcon }
> = {
  admin: {
    bg: "bg-rose-500/10",
    text: "text-rose-600",
    label: "Administrator",
    icon: ShieldCheck,
  },
  dosen: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600",
    label: "Dosen Pengajar",
    icon: UserIcon,
  },
  mahasiswa: {
    bg: "bg-blue-500/10",
    text: "text-blue-600",
    label: "Mahasiswa",
    icon: GraduationCap,
  },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"all" | UserRole>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUsers() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ page: "1", limit: "50" });
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
      <div className="flex flex-col gap-6">
        {/* Modern Filter & Stats Bar */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:max-w-2xl">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                className="pl-9 h-11 bg-card border-border/50 focus-visible:ring-primary/20 font-medium"
                placeholder="Cari nama, email, atau ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as "all" | UserRole)}
            >
              <SelectTrigger className="h-11 w-full border-border/20 bg-muted/30 text-[11px] font-black uppercase tracking-wider sm:w-44">
                <SelectValue placeholder="Filter Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Role</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="dosen">Dosen</SelectItem>
                <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 px-4 py-2 bg-primary/5 rounded-xl border border-primary/10">
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">
                Total Terdaftar
              </span>
              <span className="text-xl font-black tracking-tight">
                {users.length} User
              </span>
            </div>
            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Users className="size-4" />
            </div>
          </div>
        </div>

        {/* Desktop Table (lg+) */}
        <Card className="hidden overflow-hidden border-none bg-card shadow-xl animate-in fade-in duration-700 lg:block">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="w-[35%] text-[10px] font-black uppercase tracking-widest px-6 h-12">
                  Informasi Profil
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest h-12">
                  Kontak Email
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest h-12">
                  Peran Akun
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest h-12">
                  Tanggal Bergabung
                </TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest px-6 h-12 text-center">
                  Ganti Role
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && users.length === 0 ? (
                Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow key={i}>
                      <TableCell
                        colSpan={5}
                        className="h-16 border-b border-border/30"
                      >
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-20 text-center text-sm font-bold text-destructive"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-6">
                    <EmptyState
                      icon={Users}
                      title="Data pengguna tidak ditemukan"
                      description="Ubah kata kunci pencarian atau filter role untuk menampilkan data lain."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const rc = roleConfig[user.role] || roleConfig.mahasiswa;
                  const Icon = rc.icon;
                  return (
                    <TableRow
                      key={user.id}
                      className="group border-b border-border/30 transition-colors hover:bg-primary/[0.02]"
                    >
                      <TableCell className="px-6">
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "flex size-10 shrink-0 items-center justify-center rounded-2xl font-black text-xs shadow-inner transition-transform group-hover:scale-105",
                              rc.bg,
                              rc.text,
                            )}
                          >
                            {getInitials(user.name)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-sm tracking-tight">
                              {user.name}
                            </span>
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-black opacity-60">
                              Sivitas #{user.id.split("-")[0]}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                          <Mail className="size-3.5 opacity-40" />
                          <span className="text-sm font-medium">
                            {user.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                            rc.bg,
                            rc.text,
                          )}
                        >
                          <Icon className="size-3" />
                          {rc.label}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground font-mono text-[11px] font-bold">
                          <Calendar className="size-3.5 opacity-30" />
                          {formatDate(user.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex justify-center">
                          <Select
                            value={user.role}
                            onValueChange={(value) =>
                              handleRoleChange(user.id, value as UserRole)
                            }
                            disabled={loading}
                          >
                            <SelectTrigger className="h-8 w-[110px] border-none bg-muted/40 px-2 text-[11px] font-black uppercase tracking-wider">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mahasiswa">
                                Mahasiswa
                              </SelectItem>
                              <SelectItem value="dosen">Dosen</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between px-6 py-4 bg-muted/20 border-t border-border/30">
            <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              Menampilkan {users.length} Catatan
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[11px] font-black uppercase tracking-widest bg-background"
                disabled
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[11px] font-black uppercase tracking-widest bg-background"
                disabled
              >
                Next
              </Button>
            </div>
          </div>
        </Card>

        {/* Mobile + Tablet Card List */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:hidden">
          {loading && users.length === 0 ? (
            Array(6)
              .fill(0)
              .map((_, i) => (
                <Skeleton
                  key={`mobile-users-skeleton-${i}`}
                  className="h-40 w-full"
                />
              ))
          ) : error ? (
            <EmptyState title="Gagal memuat pengguna" description={error} />
          ) : users.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Data pengguna tidak ditemukan"
              description="Ubah kata kunci pencarian atau filter role untuk menampilkan data lain."
            />
          ) : (
            users.map((user) => {
              const rc = roleConfig[user.role] || roleConfig.mahasiswa;
              const Icon = rc.icon;

              return (
                <Card
                  key={`mobile-${user.id}`}
                  className="border-border/50 p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-2xl font-black text-xs shadow-inner",
                        rc.bg,
                        rc.text,
                      )}
                    >
                      {getInitials(user.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black tracking-tight">
                        {user.name}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="mt-2 text-[11px] font-mono text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        rc.text,
                      )}
                    >
                      <Icon className="size-3" />
                      {rc.label}
                    </span>
                  </div>

                  <div className="mt-3">
                    <Select
                      value={user.role}
                      onValueChange={(value) =>
                        handleRoleChange(user.id, value as UserRole)
                      }
                      disabled={loading}
                    >
                      <SelectTrigger className="h-9 w-full border-none bg-muted/40 px-2 text-[11px] font-black uppercase tracking-wider">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                        <SelectItem value="dosen">Dosen</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
