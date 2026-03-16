"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, BrainCircuit, Clock3, Search, Sparkles, Star, LayoutGrid } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InsightSummary {
  totalTurns: number;
  avgResponseTimeMs: number;
  accuracyScore: number;
  avgRating: number | null;
}

interface FiltersProps {
  summary: InsightSummary | null;
  search: string;
  setSearch: (val: string) => void;
  limit: number;
  setLimit: (val: number) => void;
}

export function Filters({ summary, search, setSearch, limit, setLimit }: FiltersProps) {
  const summaryCards = [
    {
      title: "Total Interaksi",
      value: summary?.totalTurns ?? 0,
      icon: Bot,
      accent: "bg-primary/10 text-primary",
      note: "Semua chat yang terekam",
    },
    {
      title: "Rata-rata Respon",
      value: summary
        ? `${(summary.avgResponseTimeMs / 1000).toFixed(2)}s`
        : "0s",
      icon: Clock3,
      accent: "bg-blue-500/10 text-blue-600",
      note: "Dihitung dari interaksi terbaru",
    },
    {
      title: "Skor Kelayakan",
      value: summary ? `${summary.accuracyScore}%` : "0%",
      icon: BrainCircuit,
      accent: "bg-amber-500/10 text-amber-600",
      note: "Jawaban dengan sitasi atau respons valid",
    },
    {
      title: "Rata-rata Rating",
      value: summary?.avgRating ?? "-",
      icon: Star,
      accent: "bg-emerald-500/10 text-emerald-600",
      note: "Dari feedback pengguna yang masuk",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.title}
              className="border-none bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    {item.title}
                  </p>
                  <p className="mt-2 text-3xl font-black tracking-tight">
                    {item.value}
                  </p>
                  <p className="mt-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider">
                    {item.note}
                  </p>
                </div>
                <div
                  className={`flex size-12 items-center justify-center rounded-2xl shadow-inner ${item.accent}`}
                >
                  <Icon className="size-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="border-none bg-card p-5 shadow-sm rounded-3xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Sparkles className="size-24 text-primary" />
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <h2 className="text-lg font-black tracking-tight">
                Rekaman Interaksi AI
              </h2>
            </div>
            <p className="mt-1 text-xs font-semibold text-muted-foreground/70 uppercase tracking-widest">
              Audit kualitas jawaban, kecepatan respon, dan penggunaan sitasi.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:max-w-xl">
            <div className="relative flex-1 w-full">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 pl-10 rounded-2xl bg-muted/30 border-border/50 focus-visible:ring-primary/20 font-medium"
                placeholder="Cari pengguna atau pertanyaan..."
              />
            </div>
            <Select
              value={limit.toString()}
              onValueChange={(val) => setLimit(parseInt(val))}
            >
              <SelectTrigger className="h-12 w-full sm:w-40 border-border/20 bg-muted/40 text-[10px] font-black uppercase tracking-wider rounded-2xl px-4 flex items-center gap-2">
                <LayoutGrid className="size-4 opacity-50" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/50 p-2 shadow-xl">
                <SelectItem value="10" className="rounded-xl py-2 font-black text-[10px] uppercase">10 Baris</SelectItem>
                <SelectItem value="25" className="rounded-xl py-2 font-black text-[10px] uppercase">25 Baris</SelectItem>
                <SelectItem value="50" className="rounded-xl py-2 font-black text-[10px] uppercase">50 Baris</SelectItem>
                <SelectItem value="100" className="rounded-xl py-2 font-black text-[10px] uppercase">100 Baris</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
    </div>
  );
}
