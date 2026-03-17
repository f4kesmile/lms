"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Bot,
  BrainCircuit,
  Clock3,
  Search,
  Sparkles,
  Star,
} from "lucide-react";

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
}

export function Filters({ summary, search, setSearch }: FiltersProps) {
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
      accent: "bg-secondary-brand/10 text-secondary-brand",
      note: "Dihitung dari interaksi terbaru",
    },
    {
      title: "Skor Kelayakan",
      value: summary ? `${summary.accuracyScore}%` : "0%",
      icon: BrainCircuit,
      accent: "bg-secondary-brand/10 text-secondary-brand",
      note: "Jawaban dengan sitasi atau respons valid",
    },
    {
      title: "Rata-rata Rating",
      value: summary?.avgRating ?? "-",
      icon: Star,
      accent: "bg-primary/10 text-primary",
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
          <div className="w-full md:max-w-xl">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 pl-10 rounded-2xl bg-muted/30 border-border/50 focus-visible:ring-primary/20 font-medium"
                placeholder="Cari pengguna atau pertanyaan..."
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
