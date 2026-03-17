"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users } from "lucide-react";

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
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:max-w-xl">
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
          <SelectContent className="rounded-xl border-border/50">
            <SelectItem value="all" className="rounded-lg">
              Semua Role
            </SelectItem>
            <SelectItem value="admin" className="rounded-lg">
              Admin
            </SelectItem>
            <SelectItem value="dosen" className="rounded-lg">
              Dosen
            </SelectItem>
            <SelectItem value="mahasiswa" className="rounded-lg">
              Mahasiswa
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4 px-4 py-2 bg-primary/5 rounded-xl border border-primary/10">
        <div className="flex flex-col leading-none">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">
            Total Terdaftar
          </span>
          <span className="text-xl font-black tracking-tight">
            {totalUsers} User
          </span>
        </div>
        <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          <Users className="size-4" />
        </div>
      </div>
    </div>
  );
}
