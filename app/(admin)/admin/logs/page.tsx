"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";

type LogLevel = "INFO" | "WARNING" | "ERROR" | "EMERGENCY" | "DANGER";

type LogItem = {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  meta?: unknown;
};

const LEVEL_OPTIONS: Array<"ALL" | LogLevel> = [
  "ALL",
  "INFO",
  "WARNING",
  "ERROR",
  "EMERGENCY",
  "DANGER",
];

function levelBadgeVariant(
  level: LogLevel,
): "default" | "secondary" | "destructive" | "outline" {
  if (level === "INFO") return "secondary";
  if (level === "WARNING") return "outline";
  return "destructive";
}

export default function AdminSystemLogsPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState<"ALL" | LogLevel>("ALL");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const query = new URLSearchParams();
        query.set("limit", "250");
        if (level !== "ALL") {
          query.set("level", level);
        }

        const response = await fetch(`/api/admin/logs?${query.toString()}`, {
          cache: "no-store",
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message || "Gagal memuat log sistem");
        }

        if (alive) {
          setLogs(payload.logs ?? []);
          setError(null);
        }
      } catch (e) {
        if (alive) {
          setError(e instanceof Error ? e.message : "Gagal memuat log sistem");
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    const timer = setInterval(load, 2000);

    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [level]);

  const filteredLogs = useMemo(() => {
    const text = keyword.trim().toLowerCase();
    if (!text) return logs;

    return logs.filter((item) => {
      const metaText = item.meta ? JSON.stringify(item.meta).toLowerCase() : "";
      return (
        item.category.toLowerCase().includes(text) ||
        item.message.toLowerCase().includes(text) ||
        metaText.includes(text)
      );
    });
  }, [logs, keyword]);

  return (
    <AdminLayout title="Log Sistem (Live)">
      <div className="flex flex-col gap-6">
        <Card className="border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Icon name="search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Cari kategori, pesan, atau rincian log..."
                className="h-12 w-full border border-border bg-background pl-10 pr-4 font-bold focus-visible:ring-0 focus-visible:border-primary shadow-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 max-w-full overflow-x-auto pb-1">
              {LEVEL_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLevel(option)}
                  className={`rounded-md border px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                    level === option
                      ? "border-border bg-primary text-primary-foreground shadow-sm translate-y-[1px]"
                      : "border-transparent bg-muted text-muted-foreground hover:border-border hover:text-foreground"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="border border-border bg-card shadow-sm overflow-hidden">
          <div className="max-h-[70dvh] overflow-auto">
            {loading ? (
              <div className="space-y-4 p-5">
                {Array(6).fill(0).map((_, i) => (
                  <div key={`log-skeleton-${i}`} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-16 rounded-md" />
                      <Skeleton className="h-5 w-24 rounded-md" />
                      <Skeleton className="ml-auto h-4 w-32 rounded-md" />
                    </div>
                    <Skeleton className="h-4 w-3/4 rounded-md" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <EmptyState
                icon={() => <Icon name="error" size={32} className="text-destructive" />}
                title="Gagal memuat log sistem"
                description={error}
                className="min-h-[260px] border-none"
              />
            ) : filteredLogs.length === 0 ? (
              <EmptyState
                icon={() => <Icon name="terminal" size={32} />}
                title="Belum ada log"
                description="Belum ada kejadian yang tercatat untuk filter saat ini."
                className="min-h-[260px] border-none"
              />
            ) : (
              <div className="divide-y-2 divide-border">
                {filteredLogs.map((item) => (
                  <div key={item.id} className="space-y-3 p-5 transition-colors hover:bg-muted/30">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant={levelBadgeVariant(item.level)} className="border border-border font-black text-[9px] uppercase tracking-widest leading-none py-1">
                        {item.level}
                      </Badge>
                      <Badge variant="outline" className="border border-border font-bold text-[9px] uppercase tracking-widest leading-none py-1">
                        {item.category}
                      </Badge>
                      <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest font-bold ml-auto">
                        {new Date(item.timestamp).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-foreground">
                      {item.message}
                    </p>
                    {Boolean(item.meta) && (
                      <pre className="mt-2 overflow-auto rounded-md border border-border bg-muted/50 p-3 text-[11px] font-mono font-medium text-foreground shadow-inner max-w-full">
                        {JSON.stringify(item.meta, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-2">
          <Icon name="warning" size={14} className="text-secondary-brand" />
          Auto-refresh setiap 2 detik. Log disimpan di memori runtime.
        </p>
      </div>
    </AdminLayout>
  );
}
