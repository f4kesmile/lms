"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Bot, Clock3, Quote } from "lucide-react";
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

interface ListProps {
  loading: boolean;
  error: string | null;
  interactions: Interaction[];
  search: string;
}

export function List({ loading, error, interactions, search }: ListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:hidden min-h-[50dvh]">
      {loading ? (
        Array(4)
          .fill(0)
          .map((_, index) => (
            <Skeleton
              key={`mobile-insight-skeleton-${index}`}
              className="h-44 w-full rounded-3xl"
            />
          ))
      ) : error ? (
        <EmptyState
          icon={Bot}
          title="Gagal memuat insight AI"
          description={error}
        />
      ) : interactions.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="Belum ada data interaksi"
          description={
            search
              ? "Tidak ada hasil pencarian."
              : "Menunggu interaksi pengguna..."
          }
        />
      ) : (
        interactions.map((item) => (
          <Card
            key={`mobile-${item.id}`}
            className="group border-border/50 p-6 shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl bg-card/60 backdrop-blur-sm relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="size-6 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                    {getInitials(item.user.name)}
                  </div>
                  <p className="text-sm font-black tracking-tight truncate">
                    {item.user.name}
                  </p>
                </div>
                <div className="relative">
                  <Quote className="absolute -left-1 -top-1 size-3 text-primary/10 rotate-180" />
                  <p className="mt-1 line-clamp-3 text-sm font-medium text-muted-foreground/80 leading-relaxed pl-3 italic">
                    {item.query}
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="shrink-0 text-[9px] font-black uppercase bg-primary/10 border-primary/30 text-primary px-2.5 rounded-full"
              >
                {item.status === "COMPLETED" ? "SUCCESS" : item.status}
              </Badge>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 pt-4 border-t border-border/30">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-muted/40 rounded-full">
                <span className="text-[10px] font-black uppercase text-muted-foreground/60">
                  {item.citationCount} Citasi
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-muted/40 rounded-full">
                <Clock3 className="size-3 text-secondary-brand" />
                <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">
                  {(item.responseTimeMs / 1000).toFixed(2)}s
                </span>
              </div>
              {item.rating !== null && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary text-on-primary rounded-full shadow-lg shadow-primary/20">
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Rate {item.rating}/5
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <span className="text-[10px] font-bold text-muted-foreground/40 font-mono">
                {formatDateTime(item.createdAt)}
              </span>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
