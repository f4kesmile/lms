"use client";

import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
} from "lucide-react";
import { cn } from "@/lib/utils/index";
import { formatDateRange } from "@/lib/utils/date";
import {
  type ActiveTab,
  type ClassItem,
  type SubjectCourseItem,
  type AcademicYear,
} from "../page";

interface TableProps {
  activeTab: ActiveTab;
  loading: boolean;
  data: (SubjectCourseItem | ClassItem | AcademicYear)[];
  onEdit: (item: SubjectCourseItem | ClassItem | AcademicYear) => void;
  onDelete: (id: string) => void;
  onYearActive?: (id: string) => void;
  searchQuery: string;
}

export function Table({
  activeTab,
  loading,
  data,
  onEdit,
  onDelete,
  onYearActive,
  searchQuery,
}: TableProps) {
  return (
    <Card className="hidden overflow-hidden border-none bg-card shadow-xl lg:block rounded-2xl">
      <div className="relative overflow-x-auto overflow-y-visible">
        <UITable>
          <TableHeader className="sticky top-0 z-20 bg-muted/95 backdrop-blur-md">
            <TableRow className="border-none hover:bg-transparent">
              {activeTab === "mataKuliah" ? (
                <>
                  <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest min-w-[300px]">
                    Mata Kuliah
                  </TableHead>
                  <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest">
                    Status
                  </TableHead>
                  <TableHead className="h-12 text-center text-[10px] font-black uppercase tracking-widest">
                    Materi
                  </TableHead>
                  <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest">
                    Diperbarui
                  </TableHead>
                </>
              ) : activeTab === "kelas" ? (
                <>
                  <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest min-w-[200px]">
                    Kelas
                  </TableHead>
                  <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest">
                    Tahun
                  </TableHead>
                  <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest">
                    Dosen
                  </TableHead>
                  <TableHead className="h-12 text-center text-[10px] font-black uppercase tracking-widest">
                    Kuota
                  </TableHead>
                </>
              ) : (
                <>
                  <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest min-w-[250px]">
                    Tahun Akademik
                  </TableHead>
                  <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest">
                    Rentang
                  </TableHead>
                  <TableHead className="h-12 text-center text-[10px] font-black uppercase tracking-widest">
                    Status
                  </TableHead>
                </>
              )}
              <TableHead className="sticky right-0 z-30 h-12 bg-muted/95 backdrop-blur-md px-6 text-right text-[10px] font-black uppercase tracking-widest">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell
                      colSpan={activeTab === "years" ? 4 : 5}
                      className="h-20"
                    >
                      <Skeleton className="h-12 w-full rounded-xl" />
                    </TableCell>
                  </TableRow>
                ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={activeTab === "years" ? 4 : 5}
                  className="p-12"
                >
                  <EmptyState
                    icon={
                      activeTab === "mataKuliah"
                        ? GraduationCap
                        : activeTab === "kelas"
                          ? LayoutGrid
                          : Calendar
                    }
                    title={
                      activeTab === "mataKuliah"
                        ? "Belum ada mata kuliah"
                        : activeTab === "kelas"
                          ? "Belum ada kelas"
                          : "Belum ada tahun akademik"
                    }
                    description={
                      searchQuery
                        ? "Tidak ada hasil yang cocok dengan pencarian Anda."
                        : activeTab === "mataKuliah"
                          ? "Tambahkan mata kuliah agar Bank Materi dan AI bisa dikelompokkan dengan rapi."
                          : "Gunakan tombol di atas untuk menambahkan data baru."
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow
                  key={item.id}
                  className="group border-b border-border/30 transition-colors hover:bg-muted/20"
                >
                  {activeTab === "mataKuliah"
                    ? (() => {
                        const subject = item as SubjectCourseItem;
                        return (
                          <>
                            <TableCell className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
                                  <BookOpen className="size-5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-black tracking-tight underline decoration-primary/30 decoration-2 underline-offset-4">
                                    {subject.code} - {subject.title}
                                  </p>
                                  <p className="truncate text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1 opacity-60">
                                    {subject.description ||
                                      "Belum ada deskripsi"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  subject.status === "published"
                                    ? "default"
                                    : "outline"
                                }
                                className={cn(
                                  "font-black uppercase tracking-tighter text-[9px] px-2.5 py-0.5 rounded-full",
                                  subject.status === "published"
                                    ? "bg-primary hover:bg-primary/90"
                                    : "",
                                )}
                              >
                                {subject.status === "published"
                                  ? "AKTIF"
                                  : subject.status.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center font-mono font-black text-muted-foreground/60 transition-colors group-hover:text-primary">
                              {subject._count?.materials ?? 0}
                            </TableCell>
                            <TableCell>
                              <span className="text-[11px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
                                {new Date(subject.updatedAt).toLocaleDateString(
                                  "id-ID",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                            </TableCell>
                          </>
                        );
                      })()
                    : activeTab === "kelas"
                      ? (() => {
                          const classItem = item as ClassItem;
                          return (
                            <>
                              <TableCell className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
                                    <LayoutGrid className="size-5" />
                                  </div>
                                  <p className="text-sm font-black tracking-tight">
                                    {classItem.name}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className="bg-primary/5 text-primary border-primary/20 font-black text-[10px] uppercase tracking-wider"
                                >
                                  {classItem.academicYear.name}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="size-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                                    {classItem.classTeacher?.name?.charAt(0) ||
                                      "?"}
                                  </div>
                                  <span className="text-sm font-bold text-muted-foreground">
                                    {classItem.classTeacher?.name ||
                                      "Belum ada dosen"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex flex-col items-center">
                                  <span className="text-sm font-black text-primary">
                                    {classItem.students?.length || 0} /{" "}
                                    {classItem.capacity}
                                  </span>
                                  <div className="w-16 h-1 bg-muted rounded-full mt-1 overflow-hidden">
                                    <div
                                      className="h-full bg-primary"
                                      style={{
                                        width: `${Math.min(100, ((classItem.students?.length || 0) / classItem.capacity) * 100)}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              </TableCell>
                            </>
                          );
                        })()
                      : (() => {
                          const year = item as AcademicYear;
                          return (
                            <>
                              <TableCell className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary-brand/10 text-secondary-brand shadow-inner">
                                    <Calendar className="size-5" />
                                  </div>
                                  <p className="text-sm font-black tracking-tight">
                                    {year.name}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-mono text-[11px] font-bold text-muted-foreground bg-muted/30 px-3 py-1 rounded-lg border border-border/50 shadow-sm">
                                  {formatDateRange(year.fromYear, year.toYear)}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                {year.isCurrent ? (
                                  <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-sm">
                                    <CheckCircle2 className="size-3.5 fill-primary/20" />
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                      TAHUN AKTIF
                                    </span>
                                  </div>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-4 text-[10px] font-black uppercase tracking-widest border-primary/30 text-primary hover:bg-primary hover:text-on-primary rounded-xl shadow-sm transition-all duration-300"
                                    onClick={() => onYearActive?.(year.id)}
                                  >
                                    Set Aktif
                                  </Button>
                                )}
                              </TableCell>
                            </>
                          );
                        })()}
                  <TableCell className="sticky right-0 z-10 bg-card px-6 text-right transition-colors group-hover:bg-muted/50">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-lg transition-transform hover:scale-110"
                        onClick={() => onEdit(item)}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground rounded-lg hover:scale-110"
                        onClick={() => onDelete(item.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </UITable>
      </div>
    </Card>
  );
}
