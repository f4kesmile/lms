"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertTriangle, ShieldAlert, Terminal } from "lucide-react";

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
      <div className="flex flex-col gap-4">
        <Card className="p-4 md:p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Cari kategori, pesan, atau metadata log..."
              className="h-10"
            />

            <div className="flex flex-wrap items-center gap-2">
              {LEVEL_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLevel(option)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                    level === option
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="max-h-[70vh] overflow-auto">
            {loading ? (
              <div className="p-6 text-sm text-muted-foreground">
                Memuat log...
              </div>
            ) : error ? (
              <EmptyState
                icon={ShieldAlert}
                title="Gagal memuat log sistem"
                description={error}
                className="min-h-[260px]"
              />
            ) : filteredLogs.length === 0 ? (
              <EmptyState
                icon={Terminal}
                title="Belum ada log"
                description="Belum ada kejadian yang tercatat untuk filter saat ini."
                className="min-h-[260px]"
              />
            ) : (
              <div className="divide-y divide-border/50">
                {filteredLogs.map((item) => (
                  <div key={item.id} className="space-y-2 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={levelBadgeVariant(item.level)}>
                        {item.level}
                      </Badge>
                      <Badge variant="outline">{item.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {item.message}
                    </p>
                    {item.meta && (
                      <pre className="overflow-auto rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
                        {JSON.stringify(item.meta, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertTriangle className="size-3.5" />
          Auto-refresh setiap 2 detik. Log disimpan di memori server runtime
          aktif.
        </p>
      </div>
    </AdminLayout>
  );
}
