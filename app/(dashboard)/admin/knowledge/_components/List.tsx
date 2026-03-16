"use client";

import { type Material } from "../page";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Database, FileText, Pencil, Trash2, Plus } from "lucide-react";
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
              className="h-44 w-full rounded-2xl"
            />
          ))
      ) : materials.length === 0 ? (
        <EmptyState
          icon={Database}
          title="Materi pengetahuan belum tersedia"
          description={
            search
              ? "Tidak ada materi yang sesuai dengan kata kunci pencarian."
              : "Tambahkan materi baru agar AI memiliki referensi jawaban yang lebih kaya."
          }
          action={
            !search ? (
              <Button size="sm" onClick={openCreateModal}>
                <Plus className="mr-1 size-4" /> Upload Materi
              </Button>
            ) : undefined
          }
        />
      ) : (
        materials.map((item) => (
          <Card
            key={`mobile-${item.id}`}
            className="group border-border/50 p-5 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl bg-card/60 backdrop-blur-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-black tracking-tight">
                  {item.title}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="max-w-[200px] truncate px-2.5 py-0.5 text-[10px] font-bold"
                  >
                    {item.course
                      ? `${item.course.code} - ${item.course.title}`
                      : "Tanpa Mata Kuliah"}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-primary/5 px-2.5 py-0.5 text-[10px] font-bold uppercase text-primary border-primary/20"
                  >
                    {item.module}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">
                  {item._count.chunks}
                </span>
                <span className="text-[9px] font-bold uppercase text-muted-foreground">
                   Chunks
                </span>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-between border-t border-border/30 pt-4">
              <p className="text-[10px] font-mono font-bold text-muted-foreground flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                DIPERBARUI: {formatDate(item.updatedAt)}
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-lg"
                  onClick={() => openEditModal(item)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                  onClick={() => deleteMaterial(item.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
