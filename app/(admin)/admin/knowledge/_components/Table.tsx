"use client";

import { type Material } from "@/app/(admin)/admin/knowledge/page";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, formatDate } from "@/lib/utils/index";

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
    <Card className="hidden overflow-hidden border border-border/30 bg-card shadow-lg lg:block rounded-2xl">
      <div className="relative overflow-x-auto overflow-y-visible">
        <UITable>
          <TableHeader className="bg-muted/30 backdrop-blur-sm">
            <TableRow className="border-b border-border/40 hover:bg-transparent">
              <TableHead className="px-8 h-14 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 min-w-[300px]">
                Judul Materi
              </TableHead>
              <TableHead className="h-14 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 min-w-[200px]">
                Mata Kuliah
              </TableHead>
              <TableHead className="h-14 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                Modul
              </TableHead>
              <TableHead className="h-14 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 text-center">
                Chunks
              </TableHead>
              <TableHead className="h-14 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 min-w-[140px]">
                Update
              </TableHead>
              <TableHead className="sticky right-0 z-30 h-14 bg-card/95 backdrop-blur-sm px-8 text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
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
                      className="h-20 border-b border-border/20 px-8"
                    >
                      <Skeleton className="h-12 w-full rounded-lg" />
                    </TableCell>
                  </TableRow>
                ))
            ) : materials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="p-12">
                  <EmptyState
                    icon={() => <Icon name="database" size={48} />}
                    title="Database Kosong"
                    description={
                      search
                        ? "Tidak ada hasil pencarian."
                        : "Silakan unggah materi baru."
                    }
                    action={
                      !search ? (
                        <Button
                          size="sm"
                          onClick={openCreateModal}
                          className="bg-primary shadow-lg shadow-primary/20 font-bold px-6"
                        >
                          <Icon name="add" size={16} className="mr-2" /> Upload
                          Materi
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
                  className="group border-b border-border/20 transition-colors hover:bg-muted/30"
                >
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div
                        className={cn(
                          "size-11 rounded-xl border flex items-center justify-center shadow-inner transition-all group-hover:scale-105",
                          item.type === "session"
                            ? "bg-primary/10 border-primary/20 text-primary"
                            : "bg-muted border-border/30 text-muted-foreground/70",
                        )}
                      >
                        <Icon
                          name={
                            item.type === "session" ? "school" : "description"
                          }
                          size={20}
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-black tracking-tight text-foreground line-clamp-1">
                            {item.title}
                          </span>
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
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className={cn(
                              "size-1.5 rounded-full",
                              item.type === "session"
                                ? "bg-primary/40"
                                : "bg-muted-foreground/30",
                            )}
                          />
                          <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-wider">
                            {item.type === "session"
                              ? `Pertemuan ${item.meetingNo}`
                              : "Referensi Pengetahuan"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-black text-foreground/80 uppercase tracking-wide">
                        {item.course?.code || "N/A"}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50 font-bold truncate max-w-[180px]">
                        {item.course?.title || "Umum"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-[11px] font-black text-primary/70 uppercase">
                      {item.module}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex h-7 px-3 items-center justify-center rounded-full bg-muted font-mono text-[11px] font-black text-foreground/70">
                      {item._count.chunks}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] text-muted-foreground/60 font-black tracking-widest">
                      {formatDate(item.updatedAt)}
                    </span>
                  </TableCell>
                  <TableCell className="sticky right-0 z-30 bg-card/95 backdrop-blur-sm px-8 text-right transition-opacity">
                    <div className="flex items-center justify-end gap-2 text-right">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 border border-border/30 bg-background/50 hover:bg-background hover:text-primary transition-all rounded-lg"
                            onClick={() => openEditModal(item)}
                          >
                            <Icon name="edit" size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <span className="font-bold text-[11px]">
                            Edit Detail
                          </span>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 border border-border/30 bg-background/50 hover:bg-destructive hover:text-white transition-all rounded-lg"
                            onClick={() => deleteMaterial(item.id)}
                          >
                            <Icon name="delete" size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <span className="font-bold text-[11px]">Hapus</span>
                        </TooltipContent>
                      </Tooltip>
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
