"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn,formatDate, getInitials } from "@/lib/utils/index";

type UserRole = "admin" | "dosen" | "mahasiswa";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  nip: string | null;
  specialization: string | null;
  createdAt: string;
}

interface ListProps {
  users: UserItem[];
  loading: boolean;
  error: string | null;
  roleConfig: Record<
    UserRole,
    { bg: string; text: string; label: string; icon: string }
  >;
  handleRoleChange: (userId: string, newRole: UserRole) => void;
  onEdit: (user: UserItem) => void;
}

export function List({
  users,
  loading,
  error,
  roleConfig,
  handleRoleChange,
  onEdit,
}: ListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:hidden min-h-[50dvh]">
      {loading && users.length === 0 ? (
        Array(6)
          .fill(0)
          .map((_, i) => (
            <Skeleton
              key={`mobile-users-skeleton-${i}`}
              className="h-44 w-full rounded-md"
            />
          ))
      ) : error ? (
        <EmptyState title="Gagal memuat pengguna" description={error} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={() => <Icon name="group" size={32} />}
          title="Data pengguna tidak ditemukan"
          description="Ubah kata kunci pencarian atau filter role untuk menampilkan data lain."
        />
      ) : (
        users.map((user) => {
          const rc = roleConfig[user.role] || roleConfig.mahasiswa;
          const identifierLabel =
            user.role === "mahasiswa" ? "NPM" : "NIP/NIPY";

          return (
            <Card
              key={`mobile-${user.id}`}
              className="group border border-border p-5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 rounded-md bg-card"
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-md border border-border font-black text-sm shadow-sm",
                    rc.bg,
                    rc.text,
                  )}
                >
                  {getInitials(user.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-base font-black tracking-tight text-foreground">
                      {user.name}
                    </p>
                    <button
                      onClick={() => onEdit(user)}
                      className="p-1.5 hover:bg-muted rounded-sm transition-colors text-muted-foreground hover:text-primary"
                    >
                      <Icon name="edit" size={16} />
                    </button>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground font-bold">
                    {user.email}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                    <p className="text-[10px] font-bold text-foreground flex items-center gap-1">
                      <Icon
                        name="badge"
                        size={12}
                        className="text-muted-foreground"
                      />
                      {identifierLabel}: {user.nip || "-"}
                    </p>
                    <p className="text-[10px] font-medium text-muted-foreground">
                      {user.specialization || "Umum"}
                    </p>
                  </div>
                  <p className="mt-2 text-[10px] font-mono font-bold text-muted-foreground flex items-center gap-1.5">
                    <Icon
                      name="calendar_month"
                      size={14}
                      className="opacity-80"
                    />
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-4">
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider shadow-sm",
                    rc.bg,
                    rc.text,
                  )}
                >
                  <Icon name={rc.icon} size={14} />
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
                    <SelectTrigger className="h-9 w-full border border-border bg-card shadow-sm px-3 text-[10px] font-black uppercase tracking-wider rounded-md focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border border-border rounded-md shadow-sm">
                      <SelectItem
                        value="mahasiswa"
                        className="font-bold cursor-pointer hover:bg-muted"
                      >
                        Mahasiswa
                      </SelectItem>
                      <SelectItem
                        value="dosen"
                        className="font-bold cursor-pointer hover:bg-muted"
                      >
                        Dosen
                      </SelectItem>
                      <SelectItem
                        value="admin"
                        className="font-bold cursor-pointer hover:bg-muted"
                      >
                        Admin
                      </SelectItem>
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
