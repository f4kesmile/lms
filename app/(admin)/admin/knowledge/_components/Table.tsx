"use client";

import { type Material } from "../page";

import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils/index";

interface TableProps {
  materials: Material[];
  loading: boolean;
  search: string;
  openCreateModal: () => void;
  openEditModal: (material: Material) => void;
  deleteMaterial: (id: string) => void;
}

export function Table({
  materials,
  loading,
  search,
  openCreateModal,
  openEditModal,
  deleteMaterial,
}: TableProps) {
  return (
    <Card className="hidden overflow-hidden border border-border bg-card shadow-sm lg:block rounded-md">
      <div className="relative overflow-x-auto overflow-y-visible">
        <UITable>
          <TableHeader className="sticky top-0 z-20 bg-muted/95 backdrop-blur-md">
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="px-6 h-12 text-[10px] font-black uppercase tracking-widest min-w-[300px]">
                Judul Materi
              </TableHead>
              <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest min-w-[200px]">
                Mata Kuliah
              </TableHead>
              <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest">
                Topik/Modul
              </TableHead>
              <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-center">
                Chunks
              </TableHead>
              <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest min-w-[140px]">
                Diperbarui
              </TableHead>
              <TableHead className="sticky right-0 z-30 h-12 bg-muted/95 backdrop-blur-md px-6 text-right text-[10px] font-black uppercase tracking-widest">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i}>
                    <TableCell
                      colSpan={6}
                      className="h-16 border-b border-border/30"
                    >
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
            ) : materials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="p-6">
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
                </TableCell>
              </TableRow>
            ) : (
              materials.map((item) => (
                <TableRow
                  key={item.id}
                  className="group border-b border-border transition-colors hover:bg-muted/50"
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-md border border-border bg-muted flex items-center justify-center text-muted-foreground shadow-sm">
                        <Icon name="description" size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black tracking-tight text-foreground">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-bold">
                          MATA KULIAH:{" "}
                          {item.course
                            ? `${item.course.code} - ${item.course.title}`
                            : "Tanpa Mata Kuliah"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="max-w-[280px] truncate font-black uppercase text-[9px] tracking-widest border border-border bg-background shadow-sm px-3 py-1 rounded-sm"
                    >
                      {item.course
                        ? `${item.course.code} - ${item.course.title}`
                        : "Tanpa Mata Kuliah"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border border-border shadow-sm font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-sm"
                    >
                      {item.module}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-mono font-black text-foreground">
                    {item._count.chunks}
                  </TableCell>
                  <TableCell>
                    <span className="text-[11px] text-muted-foreground font-black uppercase tracking-widest">
                      {formatDate(item.updatedAt)}
                    </span>
                  </TableCell>
                  <TableCell className="sticky right-0 z-10 bg-card px-6 text-right transition-colors group-hover:bg-muted/50">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-md border border-border bg-background text-foreground shadow-sm hover:bg-primary/20 hover:text-primary hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                        onClick={() => openEditModal(item)}
                      >
                        <Icon name="edit" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-md border border-border bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                        onClick={() => deleteMaterial(item.id)}
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
