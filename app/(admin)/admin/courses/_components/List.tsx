"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  type AcademicYear,
  type ActiveTab,
  type ClassItem,
  type SubjectCourseItem,
} from "@/app/(admin)/admin/courses/_lib/types";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDateRange } from "@/lib/utils/date";
import { cn } from "@/lib/utils/index";

interface ListProps {
  activeTab: ActiveTab;
  loading: boolean;
  data: (SubjectCourseItem | ClassItem | AcademicYear)[];
  onEdit: (
    item: SubjectCourseItem | ClassItem | AcademicYear,
    action?: string,
  ) => void;
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
              className="h-48 w-full rounded-md border border-border"
            />
          ))
      ) : data.length === 0 ? (
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
          title="Tidak ada data"
          description={
            searchQuery
              ? "Coba cari dengan kata kunci lain."
              : "Belum ada data di kategori ini."
          }
        />
      ) : (
        data.map((item) => (
          <Card
            key={item.id}
            className="group border border-border p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 rounded-md bg-card overflow-hidden relative"
          >
            {activeTab === "mataKuliah"
              ? (() => {
                  const subject = item as SubjectCourseItem;
                  return (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        {subject.bannerImage ? (
                          <div className="size-16 shrink-0 rounded-xl overflow-hidden border border-border shadow-sm">
                            <Image
                              src={subject.bannerImage}
                              alt={subject.name}
                              width={64}
                              height={64}
                              unoptimized
                              className="size-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-border bg-primary/10 text-primary shadow-sm">
                            <Icon name="auto_stories" size={28} />
                          </div>
                        )}
                        <Badge
                          variant={
                            subject.status === "published"
                              ? "default"
                              : "outline"
                          }
                          className={cn(
                            "font-black text-[9px] px-3 py-1 border border-border rounded-sm uppercase tracking-widest shadow-sm",
                            subject.status === "published"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {subject.status.toUpperCase()}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="text-xl font-black tracking-tight text-foreground leading-tight">
                          {subject.name}
                        </h3>
                        <p className="text-sm font-bold text-primary mt-1 uppercase tracking-wider">
                          {subject.code}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 py-3 border-y border-border/50">
                        <div className="flex size-8 items-center justify-center rounded-md bg-primary/5 text-primary border border-primary/10">
                          <Icon name="fact_check" size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                            Beban Mata Kuliah
                          </span>
                          <span className="text-sm font-black text-foreground">
                            {subject.credits} SKS
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block pl-1">
                          Dosen Pengampu
                        </span>
                        {subject.teachers.length > 0 ? (
                          (() => {
                            const t = subject.teachers[0];
                            return (
                              <div className="flex items-center gap-3 bg-muted/30 p-2.5 rounded-xl border border-border/40 transition-colors hover:bg-muted/50">
                                <div className="size-8 rounded-full bg-secondary-brand flex items-center justify-center text-[10px] font-black text-white shadow-sm ring-2 ring-background">
                                  {t.user.name.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-black text-foreground">
                                    {t.user.name}
                                  </span>
                                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">
                                    NIP: {t.user.nip || "-"}
                                  </span>
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="text-xs font-bold text-muted-foreground py-2 px-1 opacity-50 italic">
                            Belum ada dosen pengampu
                          </div>
                        )}
                      </div>

                      <div className="pt-2">
                        <p className="text-[10px] font-bold text-muted-foreground font-mono flex items-center gap-1.5 opacity-60">
                          <Icon name="history" size={12} />
                          Last Update:{" "}
                          {new Date(subject.updatedAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })()
              : activeTab === "kelas"
                ? (() => {
                    const classItem = item as ClassItem;
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex size-12 items-center justify-center rounded-md border border-border bg-secondary-brand/10 text-secondary-brand shadow-sm">
                            <Icon name="grid_view" size={24} />
                          </div>
                          <Badge className="font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-sm border border-border bg-primary/10 text-primary shadow-sm">
                            {classItem.academicYear.name}
                          </Badge>
                        </div>
                        <div>
                          <h3 className="text-xl font-black tracking-tight text-foreground">
                            {classItem.name}
                          </h3>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {classItem.enrollmentKey
                              ? "Enrollment key aktif"
                              : "Tanpa enrollment key"}
                          </p>
                          <div className="mt-4 flex items-center gap-3">
                            <Icon
                              name="group"
                              size={20}
                              className="text-primary"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-end mb-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                  Kapasitas
                                </span>
                                <span className="text-xs font-black">
                                  {classItem.students?.length || 0} /{" "}
                                  {classItem.capacity}
                                </span>
                              </div>
                              <div className="h-2 w-full border border-border bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{
                                    width: `${Math.min(100, ((classItem.students?.length || 0) / classItem.capacity) * 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-primary/5 p-3 rounded-lg border border-primary/10 text-center">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                            Total Mahasiswa Terdaftar
                          </p>
                          <p className="text-lg font-black text-primary">
                            {classItem.students?.length || 0} Mahasiswa
                          </p>
                        </div>
                      </div>
                    );
                  })()
                : (() => {
                    const year = item as AcademicYear;
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex size-12 items-center justify-center rounded-md border border-border bg-secondary-brand/10 text-secondary-brand shadow-sm">
                            <Icon name="calendar_month" size={24} />
                          </div>
                          {year.isCurrent && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-border bg-primary/10 text-primary shadow-sm">
                              <Icon
                                name="check_circle"
                                size={14}
                                className="fill-primary/20"
                              />
                              <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                                AKTIF
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-black tracking-tight text-foreground">
                            {year.name}
                          </h3>
                          <div className="mt-3 inline-block font-mono text-[11px] font-bold text-foreground bg-muted/50 px-3 py-1.5 rounded-sm border border-border shadow-sm">
                            {formatDateRange(year.fromYear, year.toYear)}
                          </div>
                        </div>
                        {!year.isCurrent && (
                          <Button
                            variant="outline"
                            className="w-full font-black text-[10px] uppercase tracking-widest h-11 border border-border bg-background text-primary hover:bg-primary hover:text-primary-foreground  rounded-md shadow-sm transition-all duration-300"
                            onClick={() => onYearActive?.(year.id)}
                          >
                            Set Aktif Tahun Ini
                          </Button>
                        )}
                      </div>
                    );
                  })()}

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
              {activeTab === "mataKuliah" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-md border border-border bg-primary/10 text-primary shadow-sm hover:bg-primary/20 hover:scale-105 transition-all"
                      asChild
                    >
                      <Link
                        href={`/admin/courses/${item.id}/meetings` as Route}
                      >
                        <Icon name="history_edu" size={20} />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <span className="font-bold">Kelola Sesi Pertemuan</span>
                  </TooltipContent>
                </Tooltip>
              )}

              {activeTab === "kelas" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-md border border-border bg-indigo-500/10 text-indigo-500 shadow-sm hover:bg-indigo-500/20 hover:scale-105 transition-all"
                      onClick={() => onEdit(item, "manage-subjects")}
                    >
                      <Icon name="library_books" size={20} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <span className="font-bold">
                      Kelola Mata Kuliah & Jadwal
                    </span>
                  </TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-md border border-border bg-background text-foreground shadow-sm hover:bg-primary/10 hover:text-primary hover:scale-105 transition-all"
                    onClick={() => onEdit(item)}
                  >
                    <Icon name="edit" size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <span className="font-bold">Edit Data</span>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-md border border-border bg-destructive text-destructive-foreground shadow-lg hover:bg-red-600 hover:shadow-red-500/30 hover:scale-110 active:scale-95 transition-all duration-300"
                    onClick={() => onDelete(item.id)}
                  >
                    <Icon name="delete" size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <span className="font-bold">Hapus Data</span>
                </TooltipContent>
              </Tooltip>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
