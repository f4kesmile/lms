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
import { Icon } from "@/components/ui/icon";
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
    <Card className="hidden overflow-hidden border border-border bg-card shadow-sm lg:block rounded-md">
      <div className="relative overflow-x-auto overflow-y-visible">
        <UITable>
          <TableHeader className="sticky top-0 z-20 bg-muted/95 backdrop-blur-md">
            <TableRow className="border-b border-border hover:bg-transparent">
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
                      <Skeleton className="h-12 w-full rounded-md" />
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
                    icon={() => (
                      <Icon
                        name={
                          activeTab === "mataKuliah"
                            ? "school"
                            : activeTab === "kelas"
                              ? "grid_view"
                              : "calendar_month"
                        }
                        size={48}
                      />
                    )}
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
                  className="group border-b border-border transition-colors hover:bg-muted/50"
                >
                  {activeTab === "mataKuliah"
                    ? (() => {
                        const subject = item as SubjectCourseItem;
                        return (
                          <>
                            <TableCell className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-primary/10 text-primary shadow-sm">
                                  <Icon name="auto_stories" size={20} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-black tracking-tight underline decoration-primary/30 decoration-2 underline-offset-4 text-foreground">
                                    {subject.code} - {subject.title}
                                  </p>
                                  <p className="truncate text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1 opacity-80">
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
                                  "font-black uppercase tracking-widest text-[9px] px-3 py-1 rounded-sm border border-border shadow-sm",
                                  subject.status === "published"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground",
                                )}
                              >
                                {subject.status === "published"
                                  ? "AKTIF"
                                  : subject.status.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center font-mono font-black text-foreground transition-colors group-hover:text-primary">
                              {subject._count?.materials ?? 0}
                            </TableCell>
                            <TableCell>
                              <span className="text-[11px] text-muted-foreground font-black uppercase tracking-widest opacity-80">
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
                                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-secondary-brand/10 text-secondary-brand shadow-sm">
                                    <Icon name="grid_view" size={20} />
                                  </div>
                                  <p className="text-sm font-black tracking-tight text-foreground">
                                    {classItem.name}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className="bg-primary/10 text-primary border border-border shadow-sm font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-sm"
                                >
                                  {classItem.academicYear.name}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="size-8 rounded-md border border-border bg-muted flex items-center justify-center text-[12px] font-black text-foreground shadow-sm">
                                    {classItem.classTeacher?.name?.charAt(0) ||
                                      "?"}
                                  </div>
                                  <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">
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
                                  <div className="w-16 h-2 border border-border bg-muted rounded-full mt-1.5 overflow-hidden">
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
                                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-secondary-brand/10 text-secondary-brand shadow-sm">
                                    <Icon name="calendar_month" size={20} />
                                  </div>
                                  <p className="text-sm font-black tracking-tight text-foreground">
                                    {year.name}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-mono text-[11px] font-bold text-foreground bg-muted/50 px-3 py-1.5 rounded-sm border border-border shadow-sm">
                                  {formatDateRange(year.fromYear, year.toYear)}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                {year.isCurrent ? (
                                  <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-sm bg-primary/10 border border-border text-primary shadow-sm w-max mx-auto">
                                    <Icon name="check_circle" size={14} className="fill-primary/20" />
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                      TAHUN AKTIF
                                    </span>
                                  </div>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-4 text-[10px] font-black uppercase tracking-widest border border-border text-primary bg-background  hover:bg-primary hover:text-primary-foreground rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 mx-auto block"
                                    onClick={() => onYearActive?.(year.id)}
                                  >
                                    Set Aktif
                                  </Button>
                                )}
                              </TableCell>
                            </>
                          );
                        })()}
                  <TableCell className="sticky right-0 z-10 bg-card px-6 py-4 text-right transition-colors group-hover:bg-muted/50">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-md border border-border bg-background text-foreground shadow-sm hover:bg-primary/20 hover:text-primary hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                        onClick={() => onEdit(item)}
                      >
                        <Icon name="edit" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-md border border-border bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                        onClick={() => onDelete(item.id)}
                      >
                        <Icon name="delete" size={16} />
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
