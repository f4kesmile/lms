"use client";

import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

type UserRole = "admin" | "dosen" | "mahasiswa";

interface FiltersProps {
  search: string;
  setSearch: (val: string) => void;
  role: "all" | UserRole;
  setRole: (val: "all" | UserRole) => void;
  totalUsers: number;
}

export function Filters({
  search,
  setSearch,
  role,
  setRole,
  totalUsers,
}: FiltersProps) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:max-w-xl">
        <div className="relative flex-1 w-full">
          <Icon name="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-11 h-12 bg-card border border-border shadow-sm focus-visible:ring-0 focus-visible:border-primary font-bold rounded-md"
            placeholder="Cari nama, email, atau ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={role}
          onValueChange={(value) => setRole(value as "all" | UserRole)}
        >
          <SelectTrigger className="h-12 w-full border border-border bg-card shadow-sm text-[11px] font-black uppercase tracking-wider sm:w-48 rounded-md focus:ring-0">
            <SelectValue placeholder="Filter Role" />
          </SelectTrigger>
          <SelectContent className="rounded-md border border-border shadow-sm">
            <SelectItem value="all" className="font-bold cursor-pointer hover:bg-muted">
              Semua Role
            </SelectItem>
            <SelectItem value="admin" className="font-bold cursor-pointer hover:bg-muted">
              Admin
            </SelectItem>
            <SelectItem value="dosen" className="font-bold cursor-pointer hover:bg-muted">
              Dosen
            </SelectItem>
            <SelectItem value="mahasiswa" className="font-bold cursor-pointer hover:bg-muted">
              Mahasiswa
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="flex items-center gap-4 px-5 py-3 bg-primary/10 rounded-md border border-border shadow-sm">
        <div className="flex flex-col leading-none">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary/80 mb-1">
            Total Terdaftar
          </span>
          <span className="text-xl md:text-2xl font-black tracking-tight text-primary">
            {totalUsers} User
          </span>
        </div>
        <div className="size-10 rounded-md bg-background border border-border flex items-center justify-center text-primary shadow-sm">
          <Icon name="group" size={20} />
        </div>
      </Card>
    </div>
  );
}
