"use client";

import { ChevronLeft, ChevronRight, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/index";

interface DataViewportControlsProps {
  // info
  startItem: number;
  endItem: number;
  totalItems: number;
  entityLabel?: string;
  // rows per page
  rowsPerPage: number;
  onRowsPerPageChange: (value: number) => void;
  // pagination
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const ROW_OPTIONS = [5, 10, 20, 50];

export function DataViewportControls({
  startItem,
  endItem,
  totalItems,
  entityLabel = "data",
  rowsPerPage,
  onRowsPerPageChange,
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
}: DataViewportControlsProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  let displayedPages = pages;
  if (totalPages > 7) {
    if (currentPage <= 4) {
      displayedPages = [...pages.slice(0, 5), -1, totalPages];
    } else if (currentPage >= totalPages - 3) {
      displayedPages = [1, -1, ...pages.slice(totalPages - 5)];
    } else {
      displayedPages = [
        1,
        -1,
        currentPage - 1,
        currentPage,
        currentPage + 1,
        -1,
        totalPages,
      ];
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-border/60 bg-card px-4 py-3 shadow-sm">
      {/* Kiri: info range */}
      <div className="flex items-center gap-2 shrink-0">
        <ListFilter className="size-3.5 text-primary shrink-0" />
        <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
          {totalItems === 0
            ? `Tidak ada ${entityLabel}`
            : `${startItem}–${endItem} dari ${totalItems} ${entityLabel}`}
        </span>
      </div>

      {/* Tengah: navigasi halaman */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 mx-auto">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl border-border bg-background text-muted-foreground shadow-sm transition-all hover:border-primary hover:text-primary disabled:opacity-30"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            <ChevronLeft className="size-3.5" />
          </Button>

          {displayedPages.map((page, i) =>
            page === -1 ? (
              <span
                key={`gap-${i}`}
                className="w-6 text-center text-xs font-black text-muted-foreground/30"
              >
                …
              </span>
            ) : (
              <Button
                key={`page-${page}`}
                size="sm"
                variant={currentPage === page ? "default" : "outline"}
                className={cn(
                  "h-9 min-w-9 rounded-xl border text-[11px] font-black tracking-tight transition-all",
                  currentPage === page
                    ? "border-primary bg-primary text-on-primary shadow-md shadow-primary/30 scale-105"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-primary",
                )}
                onClick={() => onPageChange(page)}
                disabled={loading}
              >
                {page}
              </Button>
            ),
          )}

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl border-border bg-background text-muted-foreground shadow-sm transition-all hover:border-primary hover:text-primary disabled:opacity-30"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      )}

      {/* Kanan: pilihan baris */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
          Baris
        </span>
        <div className="inline-flex items-center gap-1 rounded-xl border-2 border-border/60 bg-background p-1">
          {ROW_OPTIONS.map((option) => (
            <Button
              key={option}
              type="button"
              size="sm"
              variant="ghost"
              className={cn(
                "h-7 min-w-9 rounded-lg border text-[10px] font-black transition-all",
                rowsPerPage === option
                  ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/30"
                  : "border-transparent text-muted-foreground hover:border-border hover:bg-muted",
              )}
              onClick={() => onRowsPerPageChange(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
