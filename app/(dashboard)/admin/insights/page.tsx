"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { getInitials, formatDate } from "@/lib/utils/index";
import { MessageSquare, Zap, Search, BrainCircuit, Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Interaction = {
  id: string;
  user: { name: string };
  query: string;
  response: string;
  status: string;
  createdAt: string;
};

export default function AdminInsightsPage() {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/insights?limit=20");
        const data = await res.json();
        setInteractions(data.interactions || []);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = interactions.filter(
    (i) =>
      i.query.toLowerCase().includes(search.toLowerCase()) ||
      i.user.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AdminLayout
      title="Intelijen Platform & Analitik AI"
      subtitle="Pantau interaksi chatbot, efektivitas basis pengetahuan, dan performa AI secara mendalam."
    >
      <div className="flex flex-col gap-8">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-none bg-emerald-900/10 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <MessageSquare className="size-5" />
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest">
                  Live
                </Badge>
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-1">
                Total Interaksi
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black">
                  {interactions.length}+
                </span>
                <span className="text-[10px] font-bold text-emerald-500 flex items-center">
                  +5%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-blue-900/10 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <Zap className="size-5" />
                </div>
                <Badge className="bg-blue-500/10 text-blue-600 border-none font-black text-[9px] uppercase tracking-widest">
                  Performa
                </Badge>
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-1">
                Kecepatan Respon
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black">1.2s</span>
                <span className="text-[10px] font-bold text-blue-500 flex items-center">
                  -0.2s
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-amber-900/10 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <BrainCircuit className="size-5" />
                </div>
                <Badge className="bg-amber-500/10 text-amber-600 border-none font-black text-[9px] uppercase tracking-widest">
                  Akurasi
                </Badge>
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-1">
                AI Accuracy Score
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black">94.8%</span>
                <span className="text-[10px] font-bold text-amber-500 flex items-center">
                  +1.2%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Interaction Table */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
            <div className="flex items-center gap-3">
              <Bot className="size-5 text-primary" />
              <h3 className="font-bold tracking-tight">
                Log Interaksi Chatbot
              </h3>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                className="pl-9 h-9 bg-muted/30 border-none focus-visible:ring-primary/20 text-xs font-bold"
                placeholder="Cari kata kunci..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <Card className="hidden overflow-hidden border-none bg-card shadow-xl lg:block">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="px-6 h-12 text-[10px] font-black uppercase tracking-widest">
                    Pengguna
                  </TableHead>
                  <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest">
                    Pertanyaan (Query)
                  </TableHead>
                  <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest">
                    Status AI
                  </TableHead>
                  <TableHead className="px-6 h-12 text-[10px] font-black uppercase tracking-widest text-right">
                    Waktu
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        <TableCell
                          colSpan={4}
                          className="h-16 border-b border-border/30"
                        >
                          <Skeleton className="h-10 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="p-6">
                      <EmptyState
                        icon={Bot}
                        title="Belum ada rekaman interaksi"
                        description={
                          search
                            ? "Tidak ada data yang cocok dengan kata kunci pencarian."
                            : "Interaksi chatbot dari pengguna akan muncul otomatis di tabel ini."
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item) => (
                    <TableRow
                      key={item.id}
                      className="group border-b border-border/30 transition-colors hover:bg-primary/[0.01]"
                    >
                      <TableCell className="px-6">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-[10px] shadow-inner">
                            {getInitials(item.user.name)}
                          </div>
                          <span className="text-sm font-bold tracking-tight">
                            {item.user.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium line-clamp-1 max-w-md text-muted-foreground group-hover:text-foreground transition-colors">
                          {item.query}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-[9px] font-black uppercase tracking-widest border-emerald-500/30 text-emerald-600 bg-emerald-500/5 h-5 px-2"
                        >
                          {item.status || "BERHASIL"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-bold text-muted-foreground">
                            {formatDate(item.createdAt)}
                          </span>
                          <span className="text-[10px] font-mono opacity-40">
                            {new Date(item.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:hidden">
            {loading ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton
                    key={`mobile-insights-skeleton-${i}`}
                    className="h-36 w-full"
                  />
                ))
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={Bot}
                title="Belum ada rekaman interaksi"
                description={
                  search
                    ? "Tidak ada data yang cocok dengan kata kunci pencarian."
                    : "Interaksi chatbot dari pengguna akan muncul otomatis di sini."
                }
              />
            ) : (
              filtered.map((item) => (
                <Card
                  key={`mobile-${item.id}`}
                  className="border-border/50 p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-black text-primary shadow-inner">
                      {getInitials(item.user.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold tracking-tight">
                        {item.user.name}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {item.query}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <Badge
                      variant="outline"
                      className="h-5 px-2 text-[9px] font-black uppercase tracking-widest border-emerald-500/30 bg-emerald-500/5 text-emerald-600"
                    >
                      {item.status || "BERHASIL"}
                    </Badge>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
