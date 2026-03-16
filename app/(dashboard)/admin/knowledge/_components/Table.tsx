"use client";

import { type Material } from "../page";

import { FileText, Pencil, Trash2, Database, Plus } from "lucide-react";
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
    <Card className="hidden overflow-hidden border-none bg-card shadow-xl lg:block">
      <div className="relative overflow-auto max-h-[65dvh]">
        <UITable>
          <TableHeader className="sticky top-0 z-20 bg-muted/95 backdrop-blur-md">
            <TableRow className="border-none hover:bg-transparent">
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
              <TableHead className="sticky right-0 z-30 h-12 bg-muted/95 backdrop-blur-md px-6 text-right text-[10px] font-black uppercase tracking-widest shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
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
                </TableCell>
              </TableRow>
            ) : (
              materials.map((item) => (
                <TableRow
                  key={item.id}
                  className="group border-b border-border/30 transition-colors hover:bg-muted/20"
                >
                  <TableCell className="px-6">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shadow-inner">
                        <FileText className="size-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black tracking-tight">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold">
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
                      className="max-w-[280px] truncate font-bold px-2.5 py-0.5 text-[10px]"
                    >
                      {item.course
                        ? `${item.course.code} - ${item.course.title}`
                        : "Tanpa Mata Kuliah"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-primary/5 text-primary border-primary/20 font-bold px-2.5 py-0.5 text-[10px] uppercase"
                    >
                      {item.module}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold text-muted-foreground">
                    {item._count.chunks}
                  </TableCell>
                  <TableCell>
                    <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                      {formatDate(item.updatedAt)}
                    </span>
                  </TableCell>
                  <TableCell className="sticky right-0 z-10 bg-card px-6 text-right shadow-[-8px_0_8px_-4px_rgba(0,0,0,0.05)] transition-colors group-hover:bg-muted/50">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                        onClick={() => openEditModal(item)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 transition-all duration-200 hover:bg-red-600 hover:text-white"
                        onClick={() => deleteMaterial(item.id)}
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
