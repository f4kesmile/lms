"use client";

import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CourseOption {
  id: string;
  code: string;
  title: string;
}

interface FiltersProps {
  materialsCount: number;
  search: string;
  setSearch: (val: string) => void;
  selectedCourseId: string;
  setSelectedCourseId: (val: string) => void;
  courses: CourseOption[];
}

export function Filters({
  materialsCount,
  search,
  setSearch,
  selectedCourseId,
  setSelectedCourseId,
  courses,
}: FiltersProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        <Card className="group relative overflow-hidden border border-border/40 bg-card p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl rounded-2xl">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary shadow-inner transition-colors group-hover:bg-primary group-hover:text-white">
              <Icon name="database" size={28} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 mb-1">
                Koleksi Dokumen
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tight text-foreground">
                  {materialsCount}
                </span>
                <span className="text-xs font-bold text-primary tracking-widest uppercase">Materi</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="group relative overflow-hidden border border-border/40 bg-card p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl rounded-2xl">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-brand/5 text-secondary-brand shadow-inner transition-colors group-hover:bg-secondary-brand group-hover:text-white">
              <Icon name="description" size={28} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 mb-1">
                Tipe Terbanyak
              </span>
              <span className="text-xl font-black tracking-tight text-foreground group-hover:text-secondary-brand transition-colors">
                Materi Teks
              </span>
            </div>
          </div>
        </Card>
        <div className="flex items-center justify-end">
          <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center justify-end">
            <Select
              value={selectedCourseId || "all"}
              onValueChange={(value) =>
                setSelectedCourseId(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="h-12 w-full border border-border bg-card shadow-sm text-[11px] font-black uppercase tracking-wider sm:max-w-xs rounded-md focus:ring-0">
                <SelectValue placeholder="Semua Mata Kuliah" />
              </SelectTrigger>
              <SelectContent className="rounded-md border border-border shadow-sm">
                <SelectItem value="all" className="font-bold cursor-pointer hover:bg-muted">Semua Mata Kuliah</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id} className="font-bold cursor-pointer hover:bg-muted">
                    {course.code} - {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative w-full sm:max-w-xs">
              <Icon name="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-11 h-12 w-full bg-card border border-border shadow-sm focus-visible:ring-0 focus-visible:border-primary font-bold rounded-md"
                placeholder="Cari materi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
