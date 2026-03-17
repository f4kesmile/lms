"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  // Logical range for many pages
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
    <div className="flex flex-col items-center gap-3 py-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        Halaman {currentPage} dari {totalPages}
      </p>
      <div className="inline-flex items-center gap-2 rounded-2xl border-2 border-border/60 bg-gradient-to-r from-card to-muted/30 p-2 shadow-sm">
        <Button
          variant="outline"
          size="icon"
          className="size-10 rounded-xl border-border bg-background shadow-sm transition-all hover:border-primary hover:text-primary disabled:opacity-30"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
        >
          <ChevronLeft className="size-4" />
        </Button>

        <div className="flex items-center gap-1.5 px-1">
          {displayedPages.map((page, i) =>
            page === -1 ? (
              <span
                key={`gap-${i}`}
                className="px-2 text-muted-foreground font-black text-xs tracking-widest opacity-30"
              >
                ...
              </span>
            ) : (
              <Button
                key={`page-${page}`}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className={`h-10 min-w-10 rounded-xl border font-black text-[11px] tracking-tight transition-all duration-300 ${
                  currentPage === page
                    ? "border-primary bg-primary text-on-primary shadow-lg shadow-primary/30 scale-105"
                    : "border-border bg-background hover:border-primary/40 hover:text-primary"
                }`}
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
          className="size-10 rounded-xl border-border bg-background shadow-sm transition-all hover:border-primary hover:text-primary disabled:opacity-30"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
