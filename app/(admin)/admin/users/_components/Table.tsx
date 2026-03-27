"use client";

import { Icon } from "@/components/ui/icon";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { getInitials, cn } from "@/lib/utils/index";

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

interface TableProps {
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

export function Table({
  users,
  loading,
  error,
  roleConfig,
  handleRoleChange,
  onEdit,
}: TableProps) {
  return (
    <Card className="hidden overflow-hidden border border-border bg-card shadow-sm animate-in fade-in duration-700 lg:block rounded-md">
      <div className="relative overflow-x-auto overflow-y-visible">
        <UITable>
          <TableHeader className="sticky top-0 z-10 bg-muted/90 backdrop-blur-md">
            <TableRow className="hover:bg-transparent border-b border-border/50">
              <TableHead className="w-[25%] text-[10px] font-black uppercase tracking-widest px-6 h-12">
                Sivitas Akademika
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest h-12">
                Nomor Induk / Keahlian
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest h-12">
                Kontak Email
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest h-12">
                Peran Akun
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest h-12">
                Ganti Role
              </TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase tracking-widest px-6 h-12 text-center">
                Aksi
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
                      colSpan={6}
                      className="h-16 border-b border-border/30"
                    >
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-20 text-center text-sm font-bold text-destructive"
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="p-6">
                  <EmptyState
                    icon={() => <Icon name="group" size={32} />}
                    title="Data pengguna tidak ditemukan"
                    description="Ubah kata kunci pencarian atau filter role untuk menampilkan data lain."
                  />
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const rc = roleConfig[user.role] || roleConfig.mahasiswa;
                const identifierLabel =
                  user.role === "mahasiswa" ? "NPM" : "NIP/NIPY";
                return (
                  <TableRow
                    key={user.id}
                    className="group border-b border-border/30 transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="px-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-md border border-border font-black text-xs shadow-sm transition-transform group-hover:-translate-y-1",
                            rc.bg,
                            rc.text,
                          )}
                        >
                          {getInitials(user.name)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-sm tracking-tight text-foreground">
                            {user.name}
                          </span>
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-black opacity-80">
                            #{user.id.split("-")[0]}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-foreground font-bold text-[11px]">
                          <Icon
                            name="badge"
                            size={14}
                            className="text-muted-foreground"
                          />
                          {identifierLabel}: {user.nip || "-"}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-medium truncate max-w-[120px]">
                          {user.specialization || "Umum"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground font-bold group-hover:text-foreground transition-colors overflow-hidden">
                        <Icon name="email" size={16} />
                        <span className="text-[12px] truncate max-w-[160px]">
                          {user.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-sm border border-border shadow-sm text-[10px] font-black uppercase tracking-wider",
                          rc.bg,
                          rc.text,
                        )}
                      >
                        <Icon name={rc.icon} size={12} />
                        {rc.label}
                      </div>
                    </TableCell>
                    <TableCell className="w-[120px]">
                      <Select
                        value={user.role}
                        onValueChange={(value) =>
                          handleRoleChange(user.id, value as UserRole)
                        }
                        disabled={loading}
                      >
                        <SelectTrigger className="h-8 w-full border border-border bg-card shadow-sm px-2 text-[10px] font-black uppercase tracking-wider rounded-sm focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border border-border rounded-md shadow-sm">
                          <SelectItem
                            value="mahasiswa"
                            className="font-bold cursor-pointer transition-colors text-xs"
                          >
                            Mahasiswa
                          </SelectItem>
                          <SelectItem
                            value="dosen"
                            className="font-bold cursor-pointer transition-colors text-xs"
                          >
                            Dosen
                          </SelectItem>
                          <SelectItem
                            value="admin"
                            className="font-bold cursor-pointer transition-colors text-xs"
                          >
                            Admin
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="px-6 text-center">
                      <button
                        onClick={() => onEdit(user)}
                        className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-primary"
                        title="Edit User Info"
                      >
                        <Icon name="edit" size={18} />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </UITable>
      </div>
    </Card>
  );
}
