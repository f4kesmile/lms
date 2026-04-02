"use client";

import { type ActiveTab } from "@/app/(admin)/admin/courses/_lib/types";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/index";

interface FiltersProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  subjectCoursesCount: number;
  classesCount: number;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  searchPlaceholder: string;
}

export function Filters({
  activeTab,
  setActiveTab,
  subjectCoursesCount,
  classesCount,
  searchQuery,
  setSearchQuery,
  searchPlaceholder,
}: FiltersProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-3">
        <Card className="border border-border bg-card p-4 md:p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md rounded-md">
          <div className="flex items-center gap-4">
            <div className="flex size-10 md:size-12 items-center justify-center rounded-md border border-border bg-primary/10 text-primary shadow-sm">
              <Icon name="school" size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Total Mata Kuliah
              </p>
              <p className="text-2xl md:text-3xl font-black tracking-tight">
                {subjectCoursesCount}
              </p>
            </div>
          </div>
        </Card>
        <Card className="border border-border bg-card p-4 md:p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md rounded-md">
          <div className="flex items-center gap-4">
            <div className="flex size-10 md:size-12 items-center justify-center rounded-md border border-border bg-secondary-brand/10 text-secondary-brand shadow-sm">
              <Icon name="grid_view" size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Total Kelas
              </p>
              <p className="text-2xl md:text-3xl font-black tracking-tight">
                {classesCount}
              </p>
            </div>
          </div>
        </Card>
        <div className="flex items-center justify-end">
          <div className="relative w-full lg:max-w-sm">
            <Icon
              name="search"
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full border border-border bg-card pl-11 pr-4 font-bold focus-visible:ring-0 focus-visible:border-primary shadow-sm rounded-md"
              placeholder={searchPlaceholder}
            />
          </div>
        </div>
      </div>

      <div className="flex w-full items-center overflow-x-auto rounded-md border border-border bg-muted/40 p-1.5 gap-1.5 shadow-inner scrollbar-hide">
        <button
          type="button"
          className={cn(
            "rounded flex-1 min-w-[100px] px-2 sm:px-6 py-2.5 text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap text-center",
            activeTab === "years"
              ? "bg-primary text-primary-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:bg-background hover:text-foreground border border-transparent hover:border-border hover:shadow-sm",
          )}
          onClick={() => setActiveTab("years")}
        >
          Tahun Akademik
        </button>
        <button
          type="button"
          className={cn(
            "rounded flex-1 min-w-[70px] px-2 sm:px-6 py-2.5 text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap text-center",
            activeTab === "kelas"
              ? "bg-primary text-primary-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:bg-background hover:text-foreground border border-transparent hover:border-border hover:shadow-sm",
          )}
          onClick={() => setActiveTab("kelas")}
        >
          Kelas
        </button>
        <button
          type="button"
          className={cn(
            "rounded flex-1 min-w-[100px] px-2 sm:px-6 py-2.5 text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap text-center",
            activeTab === "mataKuliah"
              ? "bg-primary text-primary-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:bg-background hover:text-foreground border border-transparent hover:border-border hover:shadow-sm",
          )}
          onClick={() => setActiveTab("mataKuliah")}
        >
          Mata Kuliah
        </button>
      </div>
    </div>
  );
}
