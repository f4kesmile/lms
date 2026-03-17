"use client";

import { Mail, Calendar } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
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

interface TableProps {
  users: UserItem[];
  loading: boolean;
  error: string | null;
  roleConfig: Record<
    UserRole,
    { bg: string; text: string; label: string; icon: LucideIcon }
  >;
  handleRoleChange: (userId: string, newRole: UserRole) => void;
}

export function Table({
  users,
  loading,
  error,
  roleConfig,
  handleRoleChange,
}: TableProps) {
  return (
    <Card className="hidden overflow-hidden border-none bg-card shadow-xl animate-in fade-in duration-700 lg:block">
      <div className="relative overflow-x-auto overflow-y-visible">
        <UITable>
          <TableHeader className="sticky top-0 z-10 bg-muted/90 backdrop-blur-md">
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
                    icon={UsersIcon}
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
                            <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
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
        </UITable>
      </div>
    </Card>
  );
}
