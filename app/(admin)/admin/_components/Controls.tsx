"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils/index";

interface DataViewportControlsProps {
  startItem: number;
  endItem: number;
  totalItems: number;
  entityLabel?: string;
  rowsPerPage: number;
  onRowsPerPageChange: (value: number) => void;
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
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-primary/10 text-primary shadow-sm shrink-0">
          <Icon name="filter_list" size={16} />
        </div>
        <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/80 bg-muted/50 px-3 py-1.5 rounded-md border border-border/50">
          {totalItems === 0
            ? `Tidak ada ${entityLabel}`
            : `${startItem}–${endItem} dari ${totalItems} ${entityLabel}`}
        </span>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2 mx-auto max-w-full overflow-x-auto pb-1 scrollbar-hide">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-md border border-border bg-background text-foreground shadow-sm transition-all  hover:bg-muted disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            <Icon name="chevron_left" size={20} />
          </Button>

          {displayedPages.map((page, i) =>
            page === -1 ? (
              <span
                key={`gap-${i}`}
                className="w-8 text-center text-sm font-black text-muted-foreground"
              >
                …
              </span>
            ) : (
              <Button
                key={`page-${page}`}
                size="sm"
                variant={currentPage === page ? "default" : "outline"}
                className={cn(
                  "h-10 min-w-10 rounded-md border text-[12px] font-black tracking-widest transition-all",
                  currentPage === page
                    ? "border-border bg-primary text-primary-foreground shadow-sm translate-y-[-2px]"
                    : "border-border bg-background text-foreground shadow-sm hover:bg-muted ",
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
            className="h-10 w-10 rounded-md border border-border bg-background text-foreground shadow-sm transition-all  hover:bg-muted disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
          >
            <Icon name="chevron_right" size={20} />
          </Button>
        </div>
      )}

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md border border-border/50 hidden sm:inline-block">
          Baris
        </span>
        <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/30 p-1.5 shadow-inner">
          {ROW_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={cn(
                "h-7 min-w-9 rounded flex items-center justify-center border text-[10px] font-black transition-all",
                rowsPerPage === option
                  ? "border-border bg-primary text-primary-foreground shadow-sm"
                  : "border-transparent text-muted-foreground hover:border-border hover:bg-background hover:text-foreground",
              )}
              onClick={() => onRowsPerPageChange(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
