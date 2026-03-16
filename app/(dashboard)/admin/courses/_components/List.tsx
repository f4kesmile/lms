"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Edit,
  GraduationCap,
  LayoutGrid,
  Trash2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils/index";
import { formatDateRange } from "@/lib/utils/date";
import { 
  type ActiveTab, 
  type ClassItem, 
  type SubjectCourseItem, 
  type AcademicYear 
} from "../page";

interface ListProps {
  activeTab: ActiveTab;
  loading: boolean;
  data: (SubjectCourseItem | ClassItem | AcademicYear)[];
  onEdit: (item: SubjectCourseItem | ClassItem | AcademicYear) => void;
  onDelete: (id: string) => void;
  onYearActive?: (id: string) => void;
  searchQuery: string;
}

export function List({
  activeTab,
  loading,
  data,
  onEdit,
  onDelete,
  onYearActive,
  searchQuery,
}: ListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:hidden min-h-[50dvh]">
      {loading ? (
        Array(4)
          .fill(0)
          .map((_, i) => (
            <Skeleton
              key={`skeleton-list-${i}`}
              className="h-48 w-full rounded-2xl"
            />
          ))
      ) : data.length === 0 ? (
        <EmptyState
          icon={activeTab === "mataKuliah" ? GraduationCap : activeTab === "kelas" ? LayoutGrid : Calendar}
          title="Tidak ada data"
          description={searchQuery ? "Coba cari dengan kata kunci lain." : "Belum ada data di kategori ini."}
        />
      ) : (
        data.map((item) => (
          <Card
            key={item.id}
            className="group border-border/50 p-6 shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl bg-card/60 backdrop-blur-sm overflow-hidden relative"
          >
            {activeTab === "mataKuliah" ? (
              (() => {
                const subject = item as SubjectCourseItem;
                return (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                        <BookOpen className="size-6" />
                      </div>
                      <Badge
                        variant={subject.status === "published" ? "default" : "outline"}
                        className={cn(
                          "font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest",
                          subject.status === "published" ? "bg-emerald-500" : ""
                        )}
                      >
                        {subject.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight line-clamp-2">
                        {subject.code} - {subject.title}
                      </h3>
                      <p className="mt-2 text-xs font-medium text-muted-foreground line-clamp-2 leading-relaxed opacity-80">
                        {subject.description || "Belum ada deskripsi mata kuliah."}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                          Bank Materi
                        </span>
                        <span className="text-base font-black text-primary">
                          {subject._count?.materials ?? 0} Dokumen
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground/40 font-mono">
                        Updated {new Date(subject.updatedAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                );
              })()
            ) : activeTab === "kelas" ? (
              (() => {
                const classItem = item as ClassItem;
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-inner">
                        <LayoutGrid className="size-6" />
                      </div>
                      <Badge variant="secondary" className="font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-xl">
                        {classItem.academicYear.name}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight">{classItem.name}</h3>
                      <div className="mt-3 flex items-center gap-3">
                        <Users className="size-4 text-primary" />
                        <div className="flex-1">
                           <div className="flex justify-between items-end mb-1">
                              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Kapasitas</span>
                              <span className="text-xs font-black">{classItem.students?.length || 0} / {classItem.capacity}</span>
                           </div>
                           <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ width: `${Math.min(100, ((classItem.students?.length || 0) / classItem.capacity) * 100)}%` }}
                              />
                           </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-2xl">
                      <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-[11px] font-bold text-primary">
                        {classItem.classTeacher?.name?.charAt(0) || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Dosen Wali</p>
                        <p className="truncate text-xs font-black">{classItem.classTeacher?.name || "Belum ditentukan"}</p>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              (() => {
                const year = item as AcademicYear;
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 shadow-inner">
                        <Calendar className="size-6" />
                      </div>
                      {year.isCurrent && (
                         <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 shadow-sm">
                           <CheckCircle2 className="size-3.5 fill-emerald-500/20" />
                           <span className="text-[9px] font-black uppercase tracking-widest leading-none">AKTIF</span>
                         </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight">{year.name}</h3>
                      <div className="mt-2 inline-block font-mono text-[11px] font-bold text-muted-foreground bg-muted/30 px-3 py-1 rounded-lg border border-border/50 shadow-sm">
                        {formatDateRange(year.fromYear, year.toYear)}
                      </div>
                    </div>
                    {!year.isCurrent && (
                       <Button 
                         variant="outline" 
                         className="w-full font-black text-[10px] uppercase tracking-widest h-10 border-primary/30 text-primary hover:bg-primary hover:text-white rounded-xl shadow-sm transition-all duration-300"
                         onClick={() => onYearActive?.(year.id)}
                       >
                         Set Aktif Tahun Ini
                       </Button>
                    )}
                  </div>
                );
              })()
            )}

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-border/30 pt-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-primary/10 hover:text-primary rounded-xl transition-transform hover:scale-110"
                onClick={() => onEdit(item)}
              >
                <Edit className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-transform hover:scale-110"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
