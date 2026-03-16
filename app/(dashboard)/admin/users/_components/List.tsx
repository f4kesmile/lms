"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInitials, formatDate, cn } from "@/lib/utils/index";
import { Users as UsersIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type UserRole = "admin" | "dosen" | "mahasiswa";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

interface ListProps {
  users: UserItem[];
  loading: boolean;
  error: string | null;
  roleConfig: Record<
    UserRole,
    { bg: string; text: string; label: string; icon: LucideIcon }
  >;
  handleRoleChange: (userId: string, newRole: UserRole) => void;
}

export function List({
  users,
  loading,
  error,
  roleConfig,
  handleRoleChange,
}: ListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:hidden min-h-[50dvh]">
      {loading && users.length === 0 ? (
        Array(6)
          .fill(0)
          .map((_, i) => (
            <Skeleton
              key={`mobile-users-skeleton-${i}`}
              className="h-44 w-full rounded-2xl"
            />
          ))
      ) : error ? (
        <EmptyState title="Gagal memuat pengguna" description={error} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
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
              className="group border-border/50 p-5 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl bg-card/60 backdrop-blur-sm"
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-2xl font-black text-sm shadow-inner transition-transform group-hover:scale-105",
                    rc.bg,
                    rc.text,
                  )}
                >
                  {getInitials(user.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-base font-black tracking-tight">
                      {user.name}
                    </p>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground font-medium">
                    {user.email}
                  </p>
                  <p className="mt-3 text-[10px] font-mono font-bold text-muted-foreground flex items-center gap-1.5">
                    <span className="size-1 rounded-full bg-border" />
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                <div className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider",
                  rc.bg,
                  rc.text
                )}>
                  <Icon className="size-3" />
                  {rc.label}
                </div>

                <div className="flex-1 max-w-[140px]">
                  <Select
                    value={user.role}
                    onValueChange={(value) =>
                      handleRoleChange(user.id, value as UserRole)
                    }
                    disabled={loading}
                  >
                    <SelectTrigger className="h-9 w-full border-none bg-muted/60 px-3 text-[10px] font-black uppercase tracking-wider rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                      <SelectItem value="dosen">Dosen</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
