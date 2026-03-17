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
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Bot, Clock3, Sparkles } from "lucide-react";
import { formatDateTime, getInitials } from "@/lib/utils/index";

interface Interaction {
  id: string;
  user: { name: string };
  query: string;
  response: string;
  status: string;
  createdAt: string;
  responseTimeMs: number;
  rating: number | null;
  citationCount: number;
}

interface TableProps {
  loading: boolean;
  error: string | null;
  interactions: Interaction[];
  search: string;
}

export function Table({ loading, error, interactions, search }: TableProps) {
  return (
    <Card className="hidden overflow-hidden border-none bg-card shadow-xl lg:block rounded-3xl">
      <div className="relative overflow-x-auto overflow-y-visible">
        <UITable>
          <TableHeader className="sticky top-0 z-20 bg-muted/95 backdrop-blur-md">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest min-w-[200px]">
                Pengguna
              </TableHead>
              <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest min-w-[400px]">
                Pertanyaan
              </TableHead>
              <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest">
                Sinyal Kualitas
              </TableHead>
              <TableHead className="sticky right-0 z-30 h-12 bg-muted/95 backdrop-blur-md px-6 text-right text-[10px] font-black uppercase tracking-widest shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                Waktu
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <TableRow key={`insight-skeleton-${index}`}>
                    <TableCell colSpan={4} className="h-20">
                      <Skeleton className="h-12 w-full rounded-xl" />
                    </TableCell>
                  </TableRow>
                ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4} className="p-12">
                  <EmptyState
                    icon={Bot}
                    title="Gagal memuat insight AI"
                    description={error}
                  />
                </TableCell>
              </TableRow>
            ) : interactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="p-12">
                  <EmptyState
                    icon={Bot}
                    title="Belum ada data interaksi"
                    description={
                      search
                        ? "Tidak ada data yang cocok dengan pencarian saat ini."
                        : "Interaksi chatbot akan muncul di sini setelah pengguna mulai bertanya."
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              interactions.map((item) => (
                <TableRow
                  key={item.id}
                  className="group border-b border-border/30 transition-colors hover:bg-muted/20"
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-black text-primary shadow-inner">
                        {getInitials(item.user.name)}
                      </div>
                      <span className="text-sm font-black tracking-tight truncate max-w-[150px]">
                        {item.user.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <p className="max-w-2xl line-clamp-2 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                      {item.query}
                    </p>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="grid grid-cols-[100px_70px_80px_100px] items-center gap-5">
                      <Badge
                        variant="outline"
                        className="w-full justify-center text-[9px] font-black uppercase text-center border-emerald-500/30 text-emerald-600 bg-emerald-50/10"
                      >
                        {item.status === "COMPLETED" ? "BERHASIL" : item.status}
                      </Badge>
                      <span className="text-[10px] font-black text-muted-foreground/60 whitespace-nowrap uppercase tracking-tighter">
                        {item.citationCount} sitasi
                      </span>
                      <span className="text-[10px] font-black text-muted-foreground/60 whitespace-nowrap flex items-center gap-1.5 uppercase tracking-tighter">
                        <Clock3 className="size-3 opacity-40 shrink-0" />
                        {(item.responseTimeMs / 1000).toFixed(2)}s
                      </span>
                      {item.rating !== null ? (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[9px] font-black justify-center w-full shadow-md shadow-emerald-500/20 py-1 rounded-lg">
                          RATING {item.rating}/5
                        </Badge>
                      ) : (
                        <span className="text-[10px] font-black text-muted-foreground/20 text-center uppercase tracking-widest">
                          no rate
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="sticky right-0 z-10 bg-card px-6 py-4 text-right shadow-[-8px_0_8px_-4px_rgba(0,0,0,0.05)] transition-colors group-hover:bg-muted/50">
                    <div className="flex flex-col items-end">
                      <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                        {formatDateTime(item.createdAt)}
                      </span>
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
