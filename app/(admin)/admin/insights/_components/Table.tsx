"use client";

import Image from "next/image";

import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
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
import { DEFAULT_AVATAR_DATA_URL } from "@/lib/constants/avatar";
import { formatDateTime } from "@/lib/utils/index";

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
    <Card className="hidden overflow-hidden border border-border bg-card shadow-sm lg:block rounded-md">
      <div className="relative overflow-x-auto overflow-y-visible">
        <UITable>
          <TableHeader className="sticky top-0 z-20 bg-muted/95 backdrop-blur-md">
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest min-w-[200px]">
                Pengguna
              </TableHead>
              <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest min-w-[400px]">
                Pertanyaan
              </TableHead>
              <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest">
                Sinyal Kualitas
              </TableHead>
              <TableHead className="sticky right-0 z-30 h-12 bg-muted/95 backdrop-blur-md px-6 text-right text-[10px] font-black uppercase tracking-widest">
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
                    <TableCell
                      colSpan={4}
                      className="h-20 border-b border-border/50"
                    >
                      <Skeleton className="h-12 w-full rounded-md" />
                    </TableCell>
                  </TableRow>
                ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4} className="p-12">
                  <EmptyState
                    icon={() => <Icon name="smart_toy" size={48} />}
                    title="Gagal memuat insight AI"
                    description={error}
                  />
                </TableCell>
              </TableRow>
            ) : interactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="p-12">
                  <EmptyState
                    icon={() => <Icon name="smart_toy" size={48} />}
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
                  className="group border-b border-border transition-colors hover:bg-muted/50"
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex size-10 shrink-0 overflow-hidden rounded-md border border-border bg-primary/10 shadow-sm">
                        <Image
                          src={DEFAULT_AVATAR_DATA_URL}
                          alt={item.user.name}
                          width={40}
                          height={40}
                          unoptimized
                          className="size-full object-cover"
                        />
                      </div>
                      <span className="text-sm font-black tracking-tight truncate max-w-[150px] text-foreground">
                        {item.user.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <p className="max-w-2xl line-clamp-2 text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                      {item.query}
                    </p>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="grid grid-cols-[100px_70px_80px_100px] items-center gap-5">
                      <Badge
                        variant="outline"
                        className="w-full justify-center text-[9px] font-black uppercase text-center border border-border text-primary bg-primary/10 rounded-sm shadow-sm px-3 py-1"
                      >
                        {item.status === "COMPLETED" ? "BERHASIL" : item.status}
                      </Badge>
                      <span className="text-[10px] font-black text-muted-foreground whitespace-nowrap uppercase tracking-widest bg-muted/40 px-2 py-1 rounded-sm border border-border/50">
                        {item.citationCount} sitasi
                      </span>
                      <span className="text-[10px] font-black text-muted-foreground whitespace-nowrap flex items-center gap-1.5 uppercase tracking-widest bg-muted/40 px-2 py-1 rounded-sm border border-border/50">
                        <Icon
                          name="schedule"
                          size={12}
                          className="opacity-80 shrink-0"
                        />
                        {(item.responseTimeMs / 1000).toFixed(2)}s
                      </span>
                      {item.rating !== null ? (
                        <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground text-[9px] font-black justify-center w-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border border-border py-1.5 rounded-sm">
                          RATING {item.rating}/5
                        </Badge>
                      ) : (
                        <span className="text-[10px] font-black text-muted-foreground/50 text-center uppercase tracking-widest">
                          no rate
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="sticky right-0 z-10 bg-card px-6 py-4 text-right transition-colors group-hover:bg-muted/50">
                    <div className="flex flex-col items-end">
                      <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest font-mono">
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
