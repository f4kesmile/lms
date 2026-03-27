"use client";

import { type Material } from "../page";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Icon } from "@/components/ui/icon";
import { formatDate } from "@/lib/utils/index";

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
              <Button size="sm" onClick={openCreateModal} className="border border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold transition-all ">
                <Icon name="add" size={16} className="mr-1" /> Upload Materi
              </Button>
            ) : undefined
          }
        />
      ) : (
        materials.map((item) => (
          <Card
            key={`mobile-${item.id}`}
            className="group border border-border p-5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 rounded-md bg-card"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-black tracking-tight text-foreground">
                  {item.title}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="max-w-[200px] truncate px-3 py-1 text-[9px] font-black uppercase tracking-widest border border-border shadow-sm rounded-sm"
                  >
                    {item.course
                      ? `${item.course.code} - ${item.course.title}`
                      : "Tanpa Mata Kuliah"}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-primary border border-border shadow-sm rounded-sm"
                  >
                    {item.module}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xl font-black text-primary">
                  {item._count.chunks}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                   Chunks
                </span>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <p className="text-[10px] font-mono font-bold text-muted-foreground flex items-center gap-1.5 opacity-80">
                <span className="size-2 rounded-full border-border border bg-primary shadow-sm" />
                DIPERBARUI: {formatDate(item.updatedAt)}
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-md border border-border bg-background text-foreground shadow-sm hover:bg-primary/20 hover:text-primary  transition-all"
                  onClick={() => openEditModal(item)}
                >
                  <Icon name="edit" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-md border border-border bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90  transition-all"
                  onClick={() => deleteMaterial(item.id)}
                >
                  <Icon name="delete" size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
