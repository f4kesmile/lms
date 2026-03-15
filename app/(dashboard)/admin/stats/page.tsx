"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bot,
  BrainCircuit,
  FileText,
  MessageSquare,
  Save,
  Settings2,
  Sparkles,
  Star,
  TimerReset,
} from "lucide-react";

type Stats = {
  totalMaterials: number;
  totalSessions: number;
  totalTurns: number;
  avgRating: number | null;
  ratedTurns: number;
  citationCoverage: number;
  fastResponseRate: number;
};

type ChatbotSettings = {
  topK: number;
  minScore: number;
  systemPrompt: string;
};

const DEFAULT_SETTINGS: ChatbotSettings = {
  topK: 4,
  minScore: 0.08,
  systemPrompt:
    "Kamu adalah asisten belajar virtual. Jawab hanya berdasarkan konteks materi internal yang diberikan. Jika konteks kurang, katakan keterbatasannya. Setiap klaim utama harus menyertakan sitasi [Sx]. Gunakan Bahasa Indonesia yang jelas dan ringkas.",
};

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [settings, setSettings] = useState<ChatbotSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({
    open: false,
    title: "",
    message: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/chat/stats").then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal memuat statistik");
        return data as Stats;
      }),
      fetch("/api/admin/chatbot-settings").then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Gagal memuat pengaturan chatbot");
        }
        return data as ChatbotSettings;
      }),
    ])
      .then(([statsPayload, settingsPayload]) => {
        setStats(statsPayload);
        setSettings(settingsPayload);
      })
      .catch((e) => {
        setError(
          e instanceof Error ? e.message : "Gagal memuat manajemen chatbot",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  async function saveSettings() {
    setSaving(true);
    try {
      const payload: ChatbotSettings = {
        topK: Number(settings.topK),
        minScore: Number(settings.minScore),
        systemPrompt: settings.systemPrompt.trim(),
      };

      const response = await fetch("/api/admin/chatbot-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || "Gagal menyimpan pengaturan chatbot");
      }

      setSettings(data.settings);
      setNotice({
        open: true,
        title: "Pengaturan Tersimpan",
        message:
          "Konfigurasi chatbot RAG berhasil diperbarui dan langsung dipakai oleh sistem.",
      });
    } catch (e) {
      setNotice({
        open: true,
        title: "Gagal Menyimpan",
        message:
          e instanceof Error ? e.message : "Gagal menyimpan pengaturan chatbot",
      });
    } finally {
      setSaving(false);
    }
  }

  const statItems = [
    {
      title: "Materi Aktif",
      value: stats?.totalMaterials ?? 0,
      icon: FileText,
      accent: "bg-primary/10 text-primary",
    },
    {
      title: "Sesi Chat",
      value: stats?.totalSessions ?? 0,
      icon: MessageSquare,
      accent: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Total Pertanyaan",
      value: stats?.totalTurns ?? 0,
      icon: Bot,
      accent: "bg-amber-500/10 text-amber-600",
    },
    {
      title: "Rata-rata Rating",
      value: stats?.avgRating ?? "-",
      icon: Star,
      accent: "bg-emerald-500/10 text-emerald-600",
    },
  ];

  return (
    <AdminLayout title="Manajemen Chatbot">
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <Card key={`chatbot-mgmt-skeleton-${index}`} className="p-5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="mt-4 h-8 w-24" />
              </Card>
            ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={Bot}
          title="Gagal memuat manajemen chatbot"
          description={error}
        />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statItems.map((item) => {
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

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.8fr]">
            <Card className="border-none bg-card p-5 shadow-sm">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Settings2 className="size-4 text-primary" />
                    <h2 className="text-lg font-black tracking-tight">
                      Pengaturan RAG Chatbot
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Semua perubahan di sini disimpan ke database dan langsung
                    mempengaruhi jumlah materi RAG yang diambil, batas relevansi
                    retrieval, dan format jawaban berbasis materi internal.
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] font-black uppercase"
                >
                  Admin Only
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                    Top-K Materi
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="8"
                    step="1"
                    value={settings.topK}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        topK: Number(e.target.value),
                      }))
                    }
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                    Min Score RAG
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.minScore}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        minScore: Number(e.target.value),
                      }))
                    }
                    className="h-11"
                  />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-border/50 bg-muted/20 p-3 text-xs text-muted-foreground">
                  Top-K menentukan berapa potongan materi dari knowledge base
                  yang dibawa ke proses RAG sebelum jawaban disusun.
                </div>
                <div className="rounded-xl border border-border/50 bg-muted/20 p-3 text-xs text-muted-foreground">
                  Min Score RAG menentukan batas relevansi chunk. Semakin tinggi
                  nilainya, semakin ketat materi yang lolos ke jawaban.
                </div>
              </div>

              <div className="mt-4 space-y-1.5">
                <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Prompt Sistem
                </label>
                <textarea
                  value={settings.systemPrompt}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      systemPrompt: e.target.value,
                    }))
                  }
                  className="min-h-48 w-full rounded-md border border-input bg-background px-3 py-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/20"
                  placeholder="Tulis aturan perilaku chatbot di sini..."
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="font-bold"
                  onClick={() => setSettings(DEFAULT_SETTINGS)}
                >
                  <TimerReset className="mr-1 size-4" />
                  Reset Draft
                </Button>
                <Button
                  type="button"
                  className="font-bold"
                  onClick={() => void saveSettings()}
                  disabled={saving}
                >
                  <Save className="mr-1 size-4" />
                  {saving ? "Menyimpan..." : "Simpan Pengaturan"}
                </Button>
              </div>
            </Card>

            <div className="flex flex-col gap-4">
              <Card className="border-none bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <h2 className="text-base font-black tracking-tight">
                    Kesehatan Chatbot
                  </h2>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Citation Coverage
                    </p>
                    <p className="mt-1 text-2xl font-black">
                      {stats?.citationCoverage ?? 0}%
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Persentase jawaban yang menyertakan sitasi materi.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Response &lt; 3 Detik
                    </p>
                    <p className="mt-1 text-2xl font-black">
                      {stats?.fastResponseRate ?? 0}%
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Semakin tinggi nilainya, semakin responsif pengalaman
                      pengguna.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Feedback Masuk
                    </p>
                    <p className="mt-1 text-2xl font-black">
                      {stats?.ratedTurns ?? 0}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Jumlah percakapan yang sudah diberi rating oleh pengguna.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border-none bg-emerald-950 p-5 text-emerald-50 shadow-sm">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="size-4" />
                  <h2 className="text-base font-black tracking-tight">
                    Catatan Operasional
                  </h2>
                </div>
                <ul className="mt-4 space-y-3 text-sm text-emerald-50/85">
                  <li>
                    Chatbot saat ini menggunakan RAG internal tanpa model AI
                    eksternal.
                  </li>
                  <li>
                    Top-K dan Min Score langsung mempengaruhi pipeline RAG saat
                    memilih materi yang relevan.
                  </li>
                  <li>
                    Jika API key Gemini tidak tersedia, chatbot tetap berjalan
                    dengan mode fallback berbasis sumber internal.
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      )}

      <Dialog
        open={notice.open}
        onOpenChange={(open) => setNotice((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{notice.title}</DialogTitle>
            <DialogDescription>{notice.message}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button
              onClick={() => setNotice((prev) => ({ ...prev, open: false }))}
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
