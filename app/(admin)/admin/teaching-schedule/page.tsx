"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ScheduleCard } from "@/app/(admin)/admin/teaching-schedule/_components/ScheduleCard";
import {
  type ScheduleDraft,
  type ScheduleItem,
  type TeacherItem,
  toDraft,
  type WeekResponse,
} from "@/app/(admin)/admin/teaching-schedule/_lib/types";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeachingSchedulePage() {
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [activeYearLabel, setActiveYearLabel] = useState<string | null>(null);
  const [weekLabel, setWeekLabel] = useState("");
  const [canManage, setCanManage] = useState(false);
  const [summary, setSummary] = useState<WeekResponse["summary"]>({
    totalSchedules: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalUpdatesThisWeek: 0,
  });
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [draftById, setDraftById] = useState<Record<string, ScheduleDraft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"compact" | "detail">("compact");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCardIds, setExpandedCardIds] = useState<string[]>([]);

  const filteredItems = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return items;

    return items.filter((item) => {
      const teacherName = item.assignedTeacher?.name || "";
      const haystack = [
        item.subject.code,
        item.subject.name,
        item.class.name,
        teacherName,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [items, searchQuery]);

  function toggleExpandCard(id: string) {
    setExpandedCardIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  }

  function updateDraft(
    itemId: string,
    updater: (current: ScheduleDraft) => ScheduleDraft,
  ) {
    setDraftById((prev) => {
      const current = prev[itemId];
      if (!current) return prev;
      return {
        ...prev,
        [itemId]: updater(current),
      };
    });
  }

  useEffect(() => {
    fetch("/api/academic-years/current")
      .then(async (res) => {
        if (!res.ok) {
          setActiveYearLabel(null);
          return;
        }
        const data = (await res.json()) as { name?: string };
        setActiveYearLabel(data.name || null);
      })
      .catch(() => setActiveYearLabel(null));

    fetch("/api/users?role=dosen&limit=200")
      .then((res) => res.json())
      .then((data) => {
        setTeachers(data.users || []);
      })
      .catch(() => {
        setTeachers([]);
      });

    fetch("/api/admin/weekly-schedule")
      .then(async (response) => {
        const payload = (await response.json()) as unknown;
        if (!response.ok) {
          const message =
            typeof payload === "object" &&
            payload !== null &&
            "message" in payload &&
            typeof payload.message === "string"
              ? payload.message
              : "Gagal memuat jadwal mengajar";
          throw new Error(message);
        }

        const data = payload as WeekResponse;
        setWeekLabel(data.week?.label || "");
        setCanManage(Boolean(data.canManage));
        setSummary(
          data.summary || {
            totalSchedules: 0,
            totalTeachers: 0,
            totalStudents: 0,
            totalUpdatesThisWeek: 0,
          },
        );
        setItems(data.schedules || []);
        setDraftById(
          (data.schedules || []).reduce<Record<string, ScheduleDraft>>(
            (acc, item) => {
              acc[item.id] = toDraft(item);
              return acc;
            },
            {},
          ),
        );
      })
      .catch(() => {
        setWeekLabel("");
        setCanManage(false);
        setSummary({
          totalSchedules: 0,
          totalTeachers: 0,
          totalStudents: 0,
          totalUpdatesThisWeek: 0,
        });
        setItems([]);
        setDraftById({});
      })
      .finally(() => setLoading(false));
  }, []);

  async function saveSchedule(item: ScheduleItem) {
    const draft = draftById[item.id];
    if (!draft) return;

    async function submit(allowCrossClassTeacher: boolean) {
      return fetch("/api/admin/weekly-schedule", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: item.class.id,
          subjectId: item.subject.id,
          dayOfWeek: draft.dayOfWeek === "none" ? null : draft.dayOfWeek,
          teacherUserId:
            draft.teacherUserId === "none" ? null : draft.teacherUserId,
          allowCrossClassTeacher,
          startTime: draft.startTime || null,
          endTime: draft.endTime || null,
          room: draft.room || null,
        }),
      });
    }

    setSavingId(item.id);
    try {
      let response = await submit(false);
      let payload = (await response.json()) as {
        message?: string;
        conflicts?: Array<{ className: string; teacherName: string }>;
      };

      if (response.status === 409) {
        const conflictText = (payload.conflicts || [])
          .map((entry) => `${entry.className}: ${entry.teacherName}`)
          .join("\n");

        toast.warning(
          payload.message || "Ada pengampu berbeda pada mata kuliah ini.",
        );

        const proceed = window.confirm(
          `${payload.message || "Ada pengampu berbeda pada mata kuliah ini."}\n\n${conflictText ? `Detail konflik:\n${conflictText}\n\n` : ""}Tekan OK jika tetap ingin simpan dengan pengampu berbeda per kelas.`,
        );

        if (!proceed) {
          return;
        }

        response = await submit(true);
        payload = (await response.json()) as { message?: string };
      }

      if (!response.ok) {
        throw new Error(payload.message || "Gagal menyimpan jadwal");
      }

      setItems((prev) =>
        prev.map((row) =>
          row.id === item.id
            ? {
                ...row,
                schedule: {
                  dayOfWeek:
                    draft.dayOfWeek === "none" ? null : draft.dayOfWeek,
                  startTime: draft.startTime || null,
                  endTime: draft.endTime || null,
                  room: draft.room || null,
                },
                assignedTeacher:
                  draft.teacherUserId === "none"
                    ? null
                    : teachers.find(
                        (teacher) => teacher.id === draft.teacherUserId,
                      ) || row.assignedTeacher,
              }
            : row,
        ),
      );

      toast.success("Jadwal berhasil disimpan");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menyimpan jadwal",
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <AdminLayout title="Jadwal Mengajar">
      <div className="space-y-6">
        <header className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight">
            Jadwal Pengampu
          </h2>
          <p className="text-sm font-medium text-muted-foreground">
            Ringkasan jadwal minggu berjalan, dosen pengampu, dan daftar
            mahasiswa per mata kuliah.
          </p>
          {activeYearLabel && (
            <Badge
              variant="outline"
              className="mt-2 font-black tracking-widest"
            >
              Tahun Aktif: {activeYearLabel}
            </Badge>
          )}
          {weekLabel && (
            <Badge
              variant="outline"
              className="mt-2 font-black tracking-widest"
            >
              Minggu Aktif: {weekLabel}
            </Badge>
          )}
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-2xl border-border/60 bg-card p-4">
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              Slot Jadwal
            </p>
            <p className="mt-2 text-3xl font-black tracking-tight text-foreground">
              {summary.totalSchedules}
            </p>
          </Card>
          <Card className="rounded-2xl border-border/60 bg-card p-4">
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              Dosen Pengampu
            </p>
            <p className="mt-2 text-3xl font-black tracking-tight text-foreground">
              {summary.totalTeachers}
            </p>
          </Card>
          <Card className="rounded-2xl border-border/60 bg-card p-4">
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              Mahasiswa Terdata
            </p>
            <p className="mt-2 text-3xl font-black tracking-tight text-foreground">
              {summary.totalStudents}
            </p>
          </Card>
          <Card className="rounded-2xl border-border/60 bg-card p-4">
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              Update Sesi Minggu Ini
            </p>
            <p className="mt-2 text-3xl font-black tracking-tight text-foreground">
              {summary.totalUpdatesThisWeek}
            </p>
          </Card>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={viewMode === "compact" ? "default" : "outline"}
                className="rounded-xl font-black text-[11px] uppercase tracking-widest"
                onClick={() => setViewMode("compact")}
              >
                Mode Ringkas
              </Button>
              <Button
                type="button"
                variant={viewMode === "detail" ? "default" : "outline"}
                className="rounded-xl font-black text-[11px] uppercase tracking-widest"
                onClick={() => setViewMode("detail")}
              >
                Mode Detail
              </Button>
            </div>
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cari mata kuliah, kelas, atau dosen..."
              className="max-w-xl"
            />
          </div>
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            Menampilkan {filteredItems.length} dari {items.length} kartu mata
            kuliah.
          </p>
        </section>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-44 w-full rounded-2xl" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
            <Icon
              name="event_busy"
              size={44}
              className="mx-auto mb-3 text-muted-foreground/40"
            />
            <p className="text-sm font-bold text-muted-foreground">
              Tidak ada hasil yang cocok.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => {
              const showDetails =
                viewMode === "detail" || expandedCardIds.includes(item.id);

              return (
                <ScheduleCard
                  key={item.id}
                  item={item}
                  canManage={canManage}
                  draft={draftById[item.id]}
                  teachers={teachers}
                  savingId={savingId}
                  viewMode={viewMode}
                  showDetails={showDetails}
                  onToggleDetails={toggleExpandCard}
                  onDraftChange={updateDraft}
                  onSave={saveSchedule}
                />
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
