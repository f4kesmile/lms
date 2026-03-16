"use client";

import { Card } from "@/components/ui/card";
import { Database, FileText, Search } from "lucide-react";
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-none bg-card shadow-sm p-4 flex items-center gap-4">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Database className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Koleksi Dokumen
            </span>
            <span className="text-xl font-black">
              {materialsCount} Materi
            </span>
          </div>
        </Card>
        <Card className="border-none bg-card shadow-sm p-4 flex items-center gap-4">
          <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <FileText className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Tipe Terbanyak
            </span>
            <span className="text-xl font-black">Materi Teks</span>
          </div>
        </Card>
        <div className="flex items-center justify-end">
          <div className="flex w-full max-w-2xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Select
              value={selectedCourseId || "all"}
              onValueChange={(value) =>
                setSelectedCourseId(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="h-11 w-full bg-card font-medium sm:max-w-xs">
                <SelectValue placeholder="Semua Mata Kuliah" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Mata Kuliah</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.code} - {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                className="pl-9 h-11 bg-card border-border/50 focus-visible:ring-primary/20 font-medium"
                placeholder="Cari materi"
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
