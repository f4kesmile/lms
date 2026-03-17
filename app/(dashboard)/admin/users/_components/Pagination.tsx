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
    <div className="flex items-center justify-center gap-2 py-6">
      <Button
        variant="outline"
        size="icon"
        className="size-10 rounded-xl border-border/50 bg-card/60 backdrop-blur-sm shadow-sm transition-all hover:border-primary/50 hover:text-primary disabled:opacity-30"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
      >
        <ChevronLeft className="size-4" />
      </Button>

      <div className="flex items-center gap-1.5">
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
              className={`h-10 min-w-10 rounded-xl font-black text-[11px] tracking-tight transition-all duration-300 ${
                currentPage === page
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/30 scale-105"
                  : "border-border/50 bg-card/60 backdrop-blur-sm hover:border-primary/30 hover:text-primary"
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
        className="size-10 rounded-xl border-border/50 bg-card/60 backdrop-blur-sm shadow-sm transition-all hover:border-primary/50 hover:text-primary disabled:opacity-30"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
