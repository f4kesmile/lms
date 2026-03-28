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
import { formatDateRange } from "@/lib/utils/date";
import { cn } from "@/lib/utils/index";

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
                              alt={subject.title}
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
                        <h3 className="text-lg font-black tracking-tight line-clamp-2 text-foreground">
                          {subject.code} - {subject.title}
                        </h3>
                        <p className="mt-2 text-xs font-bold text-muted-foreground line-clamp-2 leading-relaxed opacity-80">
                          {subject.description ||
                            "Belum ada deskripsi mata kuliah."}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-1">
                          Pengampu:
                        </span>
                        <div className="flex -space-x-2">
                          {subject.teachers.length > 0 ? (
                            subject.teachers.map((t) => (
                              <div
                                key={t.user.id}
                                className="size-8 rounded-full border-2 border-background bg-secondary-brand flex items-center justify-center text-[10px] font-black text-white shadow-sm ring-1 ring-border/10"
                                title={t.user.name}
                              >
                                {t.user.name.charAt(0)}
                              </div>
                            ))
                          ) : (
                            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-40">
                              Belum ada
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Pertemuan
                          </span>
                          <span className="text-base font-black text-primary">
                            {subject._count?.meetings ?? 0} Sesi
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground font-mono">
                          Updated{" "}
                          {new Date(subject.updatedAt).toLocaleDateString(
                            "id-ID",
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-md border border-border bg-primary/10 text-primary shadow-sm hover:bg-primary/20 transition-all"
                  asChild
                  title="Kelola Sesi Pertemuan"
                >
                  <Link href={`/admin/courses/${item.id}/meetings` as Route}>
                    <Icon name="history_edu" size={20} />
                  </Link>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-md border border-border bg-background text-foreground shadow-sm hover:bg-primary/20 hover:text-primary  transition-all"
                onClick={() => onEdit(item)}
              >
                <Icon name="edit" size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-md border border-border bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90  transition-all"
                onClick={() => onDelete(item.id)}
              >
                <Icon name="delete" size={18} />
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
