"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatDateTime, getInitials } from "@/lib/utils/index";
import {
  Bot,
  BrainCircuit,
  Clock3,
  Search,
  Sparkles,
  Star,
} from "lucide-react";

type InsightSummary = {
  totalTurns: number;
  avgResponseTimeMs: number;
  accuracyScore: number;
  avgRating: number | null;
};

type Interaction = {
  id: string;
  user: { name: string };
  query: string;
  response: string;
  status: string;
  createdAt: string;
  responseTimeMs: number;
  rating: number | null;
  citationCount: number;
};

export default function AdminInsightsPage() {
  const [summary, setSummary] = useState<InsightSummary | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/insights?limit=20")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message || "Gagal memuat insight AI");
        }
        setSummary(payload.summary);
        setInteractions(payload.interactions || []);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Gagal memuat insight AI");
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredInteractions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return interactions;

    return interactions.filter((item) => {
      return (
        item.user.name.toLowerCase().includes(query) ||
        item.query.toLowerCase().includes(query) ||
        item.response.toLowerCase().includes(query)
      );
    });
  }, [interactions, search]);

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
    <AdminLayout title="AI & Wawasan">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className="border-none bg-card p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {item.title}
                    </p>
                    <p className="mt-2 text-3xl font-black tracking-tight">
                      {item.value}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {item.note}
                    </p>
                  </div>
                  <div
                    className={`flex size-11 items-center justify-center rounded-2xl ${item.accent}`}
                  >
                    <Icon className="size-5" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="border-none bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <h2 className="text-base font-black tracking-tight">
                  Rekaman Interaksi AI
                </h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Pantau pertanyaan, kualitas jawaban, kecepatan respon, dan
                penggunaan sitasi.
              </p>
            </div>
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 pl-9"
                placeholder="Cari pengguna atau pertanyaan..."
              />
            </div>
          </div>
        </Card>

        <Card className="hidden overflow-hidden border-none bg-card shadow-xl lg:block">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest">
                  Pengguna
                </TableHead>
                <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest">
                  Pertanyaan
                </TableHead>
                <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest">
                  Sinyal Kualitas
                </TableHead>
                <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-right px-6">
                  Waktu
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <TableRow key={`insight-skeleton-${index}`}>
                      <TableCell
                        colSpan={4}
                        className="h-16 border-b border-border/30"
                      >
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} className="p-6">
                    <EmptyState
                      icon={Bot}
                      title="Gagal memuat insight AI"
                      description={error}
                    />
                  </TableCell>
                </TableRow>
              ) : filteredInteractions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="p-6">
                    <EmptyState
                      icon={Bot}
                      title="Belum ada data interaksi"
                      description={
                        search
                          ? "Tidak ada data yang cocok dengan pencarian saat ini."
                          : "Interaksi chatbot akan muncul di sini setelah pengguna mulai bertanya."
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredInteractions.map((item) => (
                  <TableRow
                    key={item.id}
                    className="group border-b border-border/30 transition-colors hover:bg-muted/20"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-[10px] font-black text-primary">
                          {getInitials(item.user.name)}
                        </div>
                        <span className="text-sm font-bold tracking-tight">
                          {item.user.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <p className="max-w-xl line-clamp-2 text-sm text-muted-foreground">
                        {item.query}
                      </p>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="grid grid-cols-[110px_70px_80px_100px] items-center gap-4">
                        <Badge
                          variant="outline"
                          className="w-full justify-center text-[10px] font-black uppercase text-center truncate"
                        >
                          {item.status}
                        </Badge>
                        <span className="text-[10px] font-black text-muted-foreground whitespace-nowrap">
                          {item.citationCount} sitasi
                        </span>
                        <span className="text-[10px] font-black text-muted-foreground whitespace-nowrap">
                          {(item.responseTimeMs / 1000).toFixed(2)} dtk
                        </span>
                        {item.rating !== null ? (
                          <Badge className="bg-emerald-500 text-[10px] font-black justify-center w-full">
                            Rating {item.rating}/5
                          </Badge>
                        ) : (
                          <span className="text-[10px] font-black text-muted-foreground/30 text-center">
                            -
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right text-[11px] font-bold text-muted-foreground leading-relaxed whitespace-nowrap">
                      {formatDateTime(item.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        <div className="grid grid-cols-1 gap-3 lg:hidden">
          {loading ? (
            Array(4)
              .fill(0)
              .map((_, index) => (
                <Skeleton
                  key={`mobile-insight-${index}`}
                  className="h-40 w-full"
                />
              ))
          ) : error ? (
            <EmptyState
              icon={Bot}
              title="Gagal memuat insight AI"
              description={error}
            />
          ) : filteredInteractions.length === 0 ? (
            <EmptyState
              icon={Bot}
              title="Belum ada data interaksi"
              description={
                search
                  ? "Tidak ada data yang cocok dengan pencarian saat ini."
                  : "Interaksi chatbot akan muncul di sini setelah pengguna mulai bertanya."
              }
            />
          ) : (
            filteredInteractions.map((item) => (
              <Card
                key={`mobile-${item.id}`}
                className="border-border/50 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">{item.user.name}</p>
                    <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
                      {item.query}
                    </p>
                  </div>
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-[10px] font-black text-primary">
                    {getInitials(item.user.name)}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-black uppercase"
                  >
                    {item.status}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] font-black">
                    {item.citationCount} sitasi
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] font-black">
                    {(item.responseTimeMs / 1000).toFixed(2)} dtk
                  </Badge>
                </div>
                <p className="mt-3 text-[11px] font-bold text-muted-foreground">
                  {formatDateTime(item.createdAt)}
                </p>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
