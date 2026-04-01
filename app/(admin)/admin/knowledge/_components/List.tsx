"use client";

import { type Material } from "@/app/(admin)/admin/knowledge/page";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, formatDate } from "@/lib/utils/index";

interface ListProps {
  materials: Material[];
  loading: boolean;
  search: string;
  openCreateModal: () => void;
  openEditModal: (material: Material) => void;
  deleteMaterial: (id: string) => void;
}

export function List({
  materials,
  loading,
  search,
  openCreateModal,
  openEditModal,
  deleteMaterial,
}: ListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:hidden min-h-[50dvh]">
      {loading ? (
        Array(5)
          .fill(0)
          .map((_, i) => (
            <Skeleton
              key={`mobile-knowledge-skeleton-${i}`}
              className="h-44 w-full rounded-md border border-border"
            />
          ))
      ) : materials.length === 0 ? (
        <EmptyState
          icon={() => <Icon name="database" size={48} />}
          title="Materi pengetahuan belum tersedia"
          description={
            search
              ? "Tidak ada materi yang sesuai dengan kata kunci pencarian."
              : "Tambahkan materi baru agar AI memiliki referensi jawaban yang lebih kaya."
          }
          action={
            !search ? (
              <Button
                size="sm"
                onClick={openCreateModal}
                className="border border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold transition-all "
              >
                <Icon name="add" size={16} className="mr-1" /> Upload Materi
              </Button>
            ) : undefined
          }
        />
      ) : (
        materials.map((item) => (
          <Card
            key={`mobile-${item.id}`}
            className="group relative flex flex-col overflow-hidden border border-border/30 bg-card p-6 shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5 rounded-2xl"
          >
            <div className="flex flex-1 flex-col">
              {/* Header Section (Minimal) */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl border transition-all",
                      item.type === "session"
                        ? "bg-primary/5 border-primary/20 text-primary"
                        : "bg-muted border-border/40 text-muted-foreground/60",
                    )}
                  >
                    <Icon
                      name={item.type === "session" ? "school" : "description"}
                      size={20}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={cn(
                        "text-[10px] font-black uppercase tracking-[0.2em]",
                        item.type === "session"
                          ? "text-primary/70"
                          : "text-muted-foreground/60",
                      )}
                    >
                      {item.type === "session" ? "Course Session" : "Reference"}
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      {item._count.chunks} Chunks
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider",
                      item.type === "session"
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground/60",
                    )}
                  >
                    {item.type === "session" ? "SESI" : "REF"}
                  </span>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                    {formatDate(item.updatedAt)}
                  </div>
                </div>
              </div>

              <div className="mb-8 flex-1">
                <h3 className="text-xl font-black leading-[1.3] tracking-tight text-foreground transition-colors group-hover:text-primary">
                  {item.title}
                </h3>
              </div>

              <div className="flex items-end justify-between gap-4 border-t border-border/40 pt-6 mt-auto">
                <div className="flex-1 flex flex-col gap-3 min-w-0">
                  <div className="flex items-start gap-3">
                    <Icon
                      name="auto_stories"
                      size={16}
                      className="mt-0.5 text-primary/40 shrink-0"
                    />
                    <div className="flex flex-col min-w-0 text-left">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
                        Subject
                      </span>
                      <span className="truncate text-[11px] font-extrabold text-foreground/80">
                        {item.course
                          ? `${item.course.code} - ${item.course.title}`
                          : "General Material"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon
                      name={
                        item.type === "session"
                          ? "calendar_today"
                          : "folder_open"
                      }
                      size={16}
                      className="mt-0.5 text-muted-foreground/30 shrink-0"
                    />
                    <div className="flex flex-col min-w-0 text-left">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
                        {item.type === "session" ? "Meeting" : "Module"}
                      </span>
                      <span className="truncate text-[11px] font-extrabold text-foreground/80">
                        {item.type === "session"
                          ? `Pertemuan Ke-${item.meetingNo}`
                          : item.module}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions (Integrated into flow to prevent overlap) */}
                <div className="flex items-center gap-2 shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 border border-border/40 bg-background/80 backdrop-blur-md text-foreground shadow-sm hover:border-primary hover:text-primary transition-all rounded-lg"
                        onClick={() => openEditModal(item)}
                      >
                        <Icon name="edit" size={18} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="font-bold">
                      Edit
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 border border-border/40 bg-destructive/5 text-destructive shadow-sm hover:bg-destructive hover:text-white transition-all rounded-lg"
                        onClick={() => deleteMaterial(item.id)}
                      >
                        <Icon name="delete" size={18} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="font-bold">
                      Hapus
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
