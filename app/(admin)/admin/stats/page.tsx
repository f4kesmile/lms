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
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toastSaveFailed, toastSaved } from "@/lib/utils/toast";

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
      toastSaved("pengaturan chatbot");
      setNotice({
        open: true,
        title: "Pengaturan Tersimpan",
        message:
          "Konfigurasi chatbot RAG berhasil diperbarui dan langsung dipakai oleh sistem.",
      });
    } catch (e) {
      toastSaveFailed("pengaturan chatbot", e);
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
      icon: "plagiarism",
      accent: "bg-primary/10 text-primary border-primary/20",
    },
    {
      title: "Sesi Chat",
      value: stats?.totalSessions ?? 0,
      icon: "forum",
      accent:
        "bg-secondary-brand/10 text-secondary-brand border-secondary-brand/20",
    },
    {
      title: "Total Pertanyaan",
      value: stats?.totalTurns ?? 0,
      icon: "smart_toy",
      accent:
        "bg-secondary-brand/10 text-secondary-brand border-secondary-brand/20",
    },
    {
      title: "Rata-rata Rating",
      value: stats?.avgRating ?? "-",
      icon: "star",
      accent: "bg-primary/10 text-primary border-primary/20",
    },
  ];

  return (
    <AdminLayout title="Manajemen Chatbot">
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <Card key={`chatbot-mgmt-skeleton-${index}`} className="p-6">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="mt-4 h-8 w-24" />
              </Card>
            ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={() => <Icon name="smart_toy" size={32} />}
          title="Gagal memuat manajemen chatbot"
          description={error}
        />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {statItems.map((item) => {
              return (
                <Card
                  key={item.title}
                  className="border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        {item.title}
                      </p>
                      <p className="mt-2 text-2xl md:text-3xl font-black tracking-tight">
                        {item.value}
                      </p>
                    </div>
                    <div
                      className={`flex size-11 items-center justify-center rounded-md border border-border shadow-sm ${item.accent}`}
                    >
                      <Icon name={item.icon} size={24} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.8fr]">
            <Card className="border border-border bg-card p-6 shadow-sm">
              <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-primary text-primary-foreground shadow-sm">
                      <Icon name="tune" size={18} />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight">
                      Pengaturan RAG
                    </h2>
                  </div>
                  <p className="mt-2 text-sm font-medium text-muted-foreground">
                    Semua perubahan di sini disimpan ke database dan langsung
                    mempengaruhi jumlah materi RAG yang diambil, batas relevansi
                    retrieval, dan format jawaban berbasis materi internal.
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] font-black uppercase border border-border"
                >
                  Admin Only
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                    Top-K Materi
                  </label>
                  <div className="relative">
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
                      className="h-12 border border-border bg-background focus-visible:ring-0 focus-visible:border-primary pl-4 font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
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
                    className="h-12 border border-border bg-background focus-visible:ring-0 focus-visible:border-primary pl-4 font-bold"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-md border border-border bg-muted/40 p-4 text-xs font-bold text-muted-foreground shadow-sm">
                  Top-K menentukan berapa potongan materi dari knowledge base
                  yang dibawa ke proses RAG sebelum jawaban disusun.
                </div>
                <div className="rounded-md border border-border bg-muted/40 p-4 text-xs font-bold text-muted-foreground shadow-sm">
                  Min Score RAG menentukan batas relevansi chunk. Semakin tinggi
                  nilainya, semakin ketat materi yang lolos ke jawaban.
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
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
                  className="min-h-48 w-full rounded-md border border-border bg-background p-4 text-sm font-medium outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0"
                  placeholder="Tulis aturan perilaku chatbot di sini..."
                />
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-border pt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto font-black uppercase tracking-widest text-[11px] border border-border shadow-sm  transition-all"
                  onClick={() => setSettings(DEFAULT_SETTINGS)}
                >
                  <Icon name="history" size={16} className="mr-2" />
                  Reset Draft
                </Button>
                <Button
                  type="button"
                  className="w-full sm:w-auto font-black uppercase tracking-widest text-[11px] border border-border shadow-sm  transition-all"
                  onClick={() => void saveSettings()}
                  disabled={saving}
                >
                  <Icon name="save" size={16} className="mr-2" />
                  {saving ? "Menyimpan..." : "Simpan Pengaturan"}
                </Button>
              </div>
            </Card>

            <div className="flex flex-col gap-6">
              <Card className="border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-secondary-brand/10 text-secondary-brand shadow-sm">
                    <Icon name="favorite" size={18} />
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-tight">
                    Kesehatan Chatbot
                  </h2>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="rounded-md border border-border bg-muted/20 p-4 relative overflow-hidden">
                    <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Citation Coverage
                      </p>
                      <p className="mt-1 text-2xl md:text-3xl font-black text-primary">
                        {stats?.citationCoverage ?? 0}%
                      </p>
                      <p className="mt-2 text-xs font-bold text-muted-foreground">
                        Persentase jawaban yang menyertakan sitasi materi.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-md border border-border bg-muted/20 p-4 relative overflow-hidden">
                    <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Response &lt; 3 Detik
                      </p>
                      <p className="mt-1 text-2xl md:text-3xl font-black text-primary">
                        {stats?.fastResponseRate ?? 0}%
                      </p>
                      <p className="mt-2 text-xs font-bold text-muted-foreground">
                        Semakin tinggi nilainya, semakin responsif pengalaman.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-md border border-border bg-muted/20 p-4 relative overflow-hidden">
                    <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Feedback Masuk
                      </p>
                      <p className="mt-1 text-2xl md:text-3xl font-black text-primary">
                        {stats?.ratedTurns ?? 0}
                      </p>
                      <p className="mt-2 text-xs font-bold text-muted-foreground">
                        Jumlah percakapan yang sudah diberi rating oleh
                        pengguna.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted text-foreground shadow-sm">
                    <Icon name="description" size={18} />
                  </div>
                  <h2 className="text-lg font-black uppercase tracking-tight">
                    Catatan Operasional
                  </h2>
                </div>
                <ul className="mt-5 space-y-4 text-sm font-bold text-muted-foreground">
                  <li className="flex gap-2">
                    <Icon
                      name="check_circle"
                      size={20}
                      className="text-primary shrink-0"
                    />
                    <span>
                      Chatbot saat ini menggunakan RAG internal tanpa model AI
                      eksternal.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <Icon
                      name="check_circle"
                      size={20}
                      className="text-primary shrink-0"
                    />
                    <span>
                      Top-K dan Min Score langsung mempengaruhi pipeline RAG
                      saat memilih materi yang relevan.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <Icon
                      name="check_circle"
                      size={20}
                      className="text-primary shrink-0"
                    />
                    <span>
                      Jika API key Gemini tidak tersedia, chatbot berjalan
                      dengan fallback internal.
                    </span>
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
        <DialogContent className="sm:max-w-md border border-border rounded-md shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase">
              {notice.title}
            </DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground">
              {notice.message}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button
              className="font-black px-10 rounded-md border border-border shadow-sm  transition-all"
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
