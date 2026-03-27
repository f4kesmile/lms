"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Icon } from "@/components/ui/icon";
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
              className="h-44 w-full rounded-md border border-border"
            />
          ))
      ) : error ? (
        <EmptyState
          icon={() => <Icon name="smart_toy" size={48} />}
          title="Gagal memuat insight AI"
          description={error}
        />
      ) : interactions.length === 0 ? (
        <EmptyState
          icon={() => <Icon name="smart_toy" size={48} />}
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
            className="group border border-border p-5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 rounded-md bg-card relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-8 shrink-0 rounded-md border border-border bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary shadow-sm">
                    {getInitials(item.user.name)}
                  </div>
                  <p className="text-sm font-black tracking-tight truncate text-foreground">
                    {item.user.name}
                  </p>
                </div>
                <div className="relative pl-3 border-l border-border/50">
                  <Icon name="format_quote" size={16} className="absolute -left-2 -top-1 opacity-20 text-foreground rotate-180" />
                  <p className="mt-1 line-clamp-3 text-sm font-bold text-muted-foreground leading-relaxed italic">
                    {item.query}
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="shrink-0 text-[9px] font-black uppercase bg-primary/10 border border-border text-primary px-3 py-1 rounded-sm shadow-sm"
              >
                {item.status === "COMPLETED" ? "SUCCESS" : item.status}
              </Badge>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 pt-4 border-t border-border">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/40 rounded-sm border border-border shadow-sm">
                <span className="text-[10px] font-black uppercase text-foreground">
                  {item.citationCount} Citasi
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/40 rounded-sm border border-border shadow-sm">
                <Icon name="schedule" size={12} className="text-secondary-brand opacity-80" />
                <span className="text-[10px] font-black text-foreground uppercase tracking-tighter">
                  {(item.responseTimeMs / 1000).toFixed(2)}s
                </span>
              </div>
              {item.rating !== null && (
               <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-sm border border-border shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Rate {item.rating}/5
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <span className="text-[10px] font-bold text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded-sm border border-border/50">
                {formatDateTime(item.createdAt)}
              </span>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
