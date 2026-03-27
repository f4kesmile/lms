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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="border border-border bg-card p-4 md:p-5 shadow-sm rounded-md flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-md border border-border bg-primary/10 text-primary shadow-sm">
            <Icon name="database" size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
              Koleksi Dokumen
            </span>
            <span className="text-2xl md:text-3xl font-black text-primary">
              {materialsCount} <span className="text-sm font-bold text-foreground">Materi</span>
            </span>
          </div>
        </Card>
        <Card className="border border-border bg-card p-4 md:p-5 shadow-sm rounded-md flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-md border border-border bg-secondary-brand/10 text-secondary-brand shadow-sm">
            <Icon name="description" size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
              Tipe Terbanyak
            </span>
            <span className="text-2xl font-black text-secondary-brand">Materi Teks</span>
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
