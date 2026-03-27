"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";

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
      icon: "smart_toy",
      accent: "bg-primary/10 text-primary border-primary/20",
      note: "Semua chat yang terekam",
    },
    {
      title: "Rata-rata Respon",
      value: summary
        ? `${(summary.avgResponseTimeMs / 1000).toFixed(2)}s`
        : "0s",
      icon: "schedule",
      accent: "bg-secondary-brand/10 text-secondary-brand border-secondary-brand/20",
      note: "Dihitung dari interaksi terbaru",
    },
    {
      title: "Skor Kelayakan",
      value: summary ? `${summary.accuracyScore}%` : "0%",
      icon: "psychology",
      accent: "bg-secondary-brand/10 text-secondary-brand border-secondary-brand/20",
      note: "Jawaban dengan sitasi atau respons valid",
    },
    {
      title: "Rata-rata Rating",
      value: summary?.avgRating ?? "-",
      icon: "star",
      accent: "bg-primary/10 text-primary border-primary/20",
      note: "Dari feedback pengguna yang masuk",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => {
          return (
            <Card
              key={item.title}
              className="border border-border bg-card p-4 md:p-5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 rounded-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {item.title}
                  </p>
                  <p className="mt-2 text-2xl md:text-3xl font-black tracking-tight text-foreground">
                    {item.value}
                  </p>
                  <p className="mt-2 text-[9px] font-bold text-muted-foreground uppercase tracking-wider opacity-80">
                    {item.note}
                  </p>
                </div>
                <div
                  className={`flex size-10 md:size-12 shrink-0 items-center justify-center rounded-md border border-border shadow-sm ${item.accent}`}
                >
                  <Icon name={item.icon} size={24} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="border border-border bg-card p-4 md:p-5 shadow-sm rounded-md overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5 hidden md:block">
          <Icon name="auto_awesome" size={96} className="text-primary" />
        </div>
        <div className="flex flex-col gap-4 md:gap-6 md:flex-row md:items-center md:justify-between relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-md border border-border bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                 <Icon name="auto_awesome" size={16} />
              </div>
              <h2 className="text-lg md:text-xl font-black tracking-tight text-foreground">
                Rekaman Interaksi AI
              </h2>
            </div>
            <p className="mt-2 text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
              Audit kualitas jawaban, kecepatan respon, dan penggunaan sitasi.
            </p>
          </div>
          <div className="w-full md:max-w-xl">
            <div className="relative w-full">
              <Icon name="search" size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 border border-border bg-card pl-12 pr-4 shadow-sm focus-visible:ring-0 focus-visible:border-primary font-bold rounded-md"
                placeholder="Cari pengguna atau pertanyaan..."
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
