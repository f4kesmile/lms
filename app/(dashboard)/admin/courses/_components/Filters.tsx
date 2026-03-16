"use client";

import { Card } from "@/components/ui/card";
import { GraduationCap, LayoutGrid, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/index";
import { type ActiveTab } from "../page";

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-none bg-card p-5 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Total Mata Kuliah
              </p>
              <p className="text-2xl font-black tracking-tight">{subjectCoursesCount}</p>
            </div>
          </div>
        </Card>
        <Card className="border-none bg-card p-5 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-inner">
              <LayoutGrid className="size-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Total Kelas
              </p>
              <p className="text-2xl font-black tracking-tight">{classesCount}</p>
            </div>
          </div>
        </Card>
        <div className="flex items-center justify-end">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 border-border/50 bg-card pl-10 rounded-2xl shadow-sm focus-visible:ring-primary/20 font-medium"
              placeholder={searchPlaceholder}
            />
          </div>
        </div>
      </div>

      <div className="inline-flex rounded-2xl border border-border/50 bg-muted/40 p-1.5 gap-1.5 backdrop-blur-sm">
        <button
          type="button"
          className={cn(
            "rounded-xl px-8 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300",
            activeTab === "years"
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-primary/30 scale-105"
              : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
          )}
          onClick={() => setActiveTab("years")}
        >
          Tahun Akademik
        </button>
        <button
          type="button"
          className={cn(
            "rounded-xl px-8 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300",
            activeTab === "kelas"
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-primary/30 scale-105"
              : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
          )}
          onClick={() => setActiveTab("kelas")}
        >
          Kelas
        </button>
        <button
          type="button"
          className={cn(
            "rounded-xl px-8 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300",
            activeTab === "mataKuliah"
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-primary/30 scale-105"
              : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
          )}
          onClick={() => setActiveTab("mataKuliah")}
        >
          Mata Kuliah
        </button>
      </div>
    </div>
  );
}
