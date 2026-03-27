"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils/index";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
}: PaginationProps) {
  if (totalPages <= 1) return null;

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
    <div className="flex flex-col items-center gap-3 py-6">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-sm border border-border/50">
        Halaman {currentPage} dari {totalPages}
      </p>
      <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card p-2 shadow-sm max-w-full overflow-x-auto scrollbar-hide">
        <Button
          variant="outline"
          size="icon"
          className="size-10 rounded-sm border border-border bg-background shadow-inner transition-all hover:bg-muted disabled:opacity-50"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
        >
          <Icon name="chevron_left" size={20} />
        </Button>

        <div className="flex items-center gap-2 px-2">
          {displayedPages.map((page, i) =>
            page === -1 ? (
              <span
                key={`gap-${i}`}
                className="px-2 text-muted-foreground font-black text-xs tracking-widest opacity-80"
              >
                ...
              </span>
            ) : (
              <Button
                key={`page-${page}`}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-10 min-w-10 rounded-sm border font-black text-[12px] tracking-tight transition-all duration-300",
                  currentPage === page
                    ? "border-border bg-primary text-primary-foreground shadow-sm translate-y-[-2px]"
                    : "border-border bg-background text-foreground hover:bg-muted hover:translate-y-[2px]"
                )}
                onClick={() => onPageChange(page)}
                disabled={loading}
              >
                {page}
              </Button>
            ),
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="size-10 rounded-sm border border-border bg-background shadow-inner transition-all hover:bg-muted disabled:opacity-50"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
        >
          <Icon name="chevron_right" size={20} />
        </Button>
      </div>
    </div>
  );
}
