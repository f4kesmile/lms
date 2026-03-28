"use client";

import { useEffect, useMemo, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { toast } from "sonner";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type DayOfWeek =
  | "senin"
  | "selasa"
  | "rabu"
  | "kamis"
  | "jumat"
  | "sabtu"
  | "minggu";

const DAY_OPTIONS: Array<{ value: DayOfWeek; label: string }> = [
  { value: "senin", label: "Senin" },
  { value: "selasa", label: "Selasa" },
  { value: "rabu", label: "Rabu" },
  { value: "kamis", label: "Kamis" },
  { value: "jumat", label: "Jumat" },
  { value: "sabtu", label: "Sabtu" },
  { value: "minggu", label: "Minggu" },
];

function dayLabel(day: DayOfWeek | null) {
  if (!day) return "Belum diatur";
  return DAY_OPTIONS.find((item) => item.value === day)?.label || "Belum diatur";
}

type WeekResponse = {
  week: {
    start: string;
    end: string;
    label: string;
  };
  summary: {
    totalSchedules: number;
    totalTeachers: number;
    totalStudents: number;
    totalUpdatesThisWeek: number;
  };
  canManage: boolean;
  schedules: ScheduleItem[];
};

type TeacherItem = {
  id: string;
  name: string;
  email: string;
  nip: string | null;
  specialization: string | null;
};

type ScheduleItem = {
  id: string;
  class: {
    id: string;
    name: string;
    academicYear: {
      id: string;
      name: string;
    };
  };
  subject: {
    id: string;
    code: string;
    name: string;
    credits: number;
    status: string;
    totalMeetings: number;
    meetingsUpdatedThisWeek: number;
    latestMeetings: Array<{
      id: string;
      meetingNo: number;
      title: string;
      preview: string;
      updatedAt: string;
    }>;
  };
  schedule: {
    dayOfWeek: DayOfWeek | null;
    startTime: string | null;
    endTime: string | null;
    room: string | null;
  };
  assignedTeacher: TeacherItem | null;
  teacherCandidates: TeacherItem[];
  students: Array<{
    id: string;
    name: string;
    email: string;
    identifier: string | null;
    progress: number;
  }>;
};

type ScheduleDraft = {
  dayOfWeek: DayOfWeek | "none";
  teacherUserId: string;
  startTime: string;
  endTime: string;
  room: string;
};

function toDraft(item: ScheduleItem): ScheduleDraft {
  return {
    dayOfWeek: item.schedule.dayOfWeek ?? "none",
    teacherUserId: item.assignedTeacher?.id || "none",
    startTime: item.schedule.startTime ?? "",
    endTime: item.schedule.endTime ?? "",
    room: item.schedule.room ?? "",
  };
}

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
      const haystack = [item.subject.code, item.subject.name, item.class.name, teacherName]
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [items, searchQuery]);

  function toggleExpandCard(id: string) {
    setExpandedCardIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id],
    );
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
          (data.schedules || []).reduce<Record<string, ScheduleDraft>>((acc, item) => {
            acc[item.id] = toDraft(item);
            return acc;
          }, {}),
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
          teacherUserId: draft.teacherUserId === "none" ? null : draft.teacherUserId,
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
          .map((item) => `${item.className}: ${item.teacherName}`)
          .join("\n");

        toast.warning(payload.message || "Ada pengampu berbeda pada mata kuliah ini.");

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
                  dayOfWeek: draft.dayOfWeek === "none" ? null : draft.dayOfWeek,
                  startTime: draft.startTime || null,
                  endTime: draft.endTime || null,
                  room: draft.room || null,
                },
                assignedTeacher:
                  draft.teacherUserId === "none"
                    ? null
                    : teachers.find((teacher) => teacher.id === draft.teacherUserId) ||
                      row.assignedTeacher,
              }
            : row,
        ),
      );

      toast.success("Jadwal berhasil disimpan");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan jadwal");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <AdminLayout title="Jadwal Mengajar">
      <div className="space-y-6">
        <header className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight">Jadwal Pengampu</h2>
          <p className="text-sm font-medium text-muted-foreground">
            Ringkasan jadwal minggu berjalan, dosen pengampu, dan daftar mahasiswa per mata kuliah.
          </p>
          {activeYearLabel && (
            <Badge variant="outline" className="mt-2 font-black tracking-widest">
              Tahun Aktif: {activeYearLabel}
            </Badge>
          )}
          {weekLabel && (
            <Badge variant="outline" className="mt-2 font-black tracking-widest">
              Minggu Aktif: {weekLabel}
            </Badge>
          )}
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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
            Menampilkan {filteredItems.length} dari {items.length} kartu mata kuliah.
          </p>
        </section>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
            <p className="text-sm font-bold text-muted-foreground">Tidak ada hasil yang cocok.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const showDetails = viewMode === "detail" || expandedCardIds.includes(item.id);

              return (
                <Card
                  key={item.id}
                  className="rounded-2xl border-border/60 bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md space-y-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="outline" className="font-black tracking-wider">
                      {item.subject.code}
                    </Badge>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      {item.subject.credits || 0} SKS
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-black tracking-tight line-clamp-2">
                    {item.subject.name} - Kelas {item.class.name}
                  </h3>

                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Tahun Akademik {item.class.academicYear.name}
                  </p>

                  <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-xs font-bold text-muted-foreground">
                    <div className="flex items-center justify-between gap-2">
                      <span>Jadwal Kuliah</span>
                      <span className="text-foreground font-black">
                        {dayLabel(item.schedule.dayOfWeek)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span>Jam</span>
                      <span className="text-foreground font-black">
                        {item.schedule.startTime && item.schedule.endTime
                          ? `${item.schedule.startTime} - ${item.schedule.endTime}`
                          : "Belum diatur"}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span>Ruang</span>
                      <span className="text-foreground font-black">
                        {item.schedule.room || "Belum diatur"}
                      </span>
                    </div>
                  </div>

                  {canManage && draftById[item.id] && viewMode === "detail" && (
                    <div className="rounded-xl border border-border/60 bg-background/60 p-3 space-y-3">
                      <p className="text-[11px] font-black uppercase tracking-widest text-foreground">
                        Atur Jadwal (Admin)
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Select
                          value={draftById[item.id].teacherUserId}
                          onValueChange={(value) =>
                            setDraftById((prev) => ({
                              ...prev,
                              [item.id]: {
                                ...prev[item.id],
                                teacherUserId: value,
                              },
                            }))
                          }
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Pilih dosen pengampu" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Belum diatur</SelectItem>
                            {teachers.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={draftById[item.id].dayOfWeek}
                          onValueChange={(value) =>
                            setDraftById((prev) => ({
                              ...prev,
                              [item.id]: {
                                ...prev[item.id],
                                dayOfWeek: value as ScheduleDraft["dayOfWeek"],
                              },
                            }))
                          }
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Pilih hari" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Belum diatur</SelectItem>
                            {DAY_OPTIONS.map((day) => (
                              <SelectItem key={day.value} value={day.value}>
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          value={draftById[item.id].room}
                          placeholder="Ruang, contoh: Lab AI 2"
                          onChange={(event) =>
                            setDraftById((prev) => ({
                              ...prev,
                              [item.id]: {
                                ...prev[item.id],
                                room: event.target.value,
                              },
                            }))
                          }
                        />

                        <Input
                          type="time"
                          value={draftById[item.id].startTime}
                          onChange={(event) =>
                            setDraftById((prev) => ({
                              ...prev,
                              [item.id]: {
                                ...prev[item.id],
                                startTime: event.target.value,
                              },
                            }))
                          }
                        />

                        <Input
                          type="time"
                          value={draftById[item.id].endTime}
                          onChange={(event) =>
                            setDraftById((prev) => ({
                              ...prev,
                              [item.id]: {
                                ...prev[item.id],
                                endTime: event.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        className="w-full rounded-xl font-black text-[11px] uppercase tracking-widest"
                        disabled={savingId === item.id}
                        onClick={() => void saveSchedule(item)}
                      >
                        {savingId === item.id ? "Menyimpan..." : "Simpan Jadwal"}
                      </Button>
                    </div>
                  )}

                  <div className="mt-4 rounded-xl border border-border/60 bg-muted/20 p-3 text-xs font-bold text-muted-foreground">
                    <div className="flex items-center justify-between gap-2">
                      <span>Dosen Pengampu Kelas</span>
                      <span className="text-foreground font-black">
                        {item.assignedTeacher?.name || "Belum diatur"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs font-black uppercase tracking-wider text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Icon name="menu_book" size={14} />
                      {item.subject.totalMeetings || 0} sesi
                    </span>
                    <span>{item.subject.status}</span>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-xs font-bold text-muted-foreground flex items-center justify-between">
                    <span>Update minggu ini</span>
                    <span className="text-foreground">{item.subject.meetingsUpdatedThisWeek} sesi</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl font-black text-[11px] uppercase tracking-widest"
                      onClick={() => toggleExpandCard(item.id)}
                    >
                      {showDetails ? "Sembunyikan Detail" : "Lihat Detail"}
                    </Button>
                    <Link href={`/admin/courses/${item.subject.id}/meetings` as Route} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full rounded-xl font-black text-[11px] uppercase tracking-widest"
                      >
                        Kelola Sesi
                      </Button>
                    </Link>
                  </div>

                  {showDetails && (
                    <>
                      <div className="rounded-xl border border-border/60 bg-background/60 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[11px] font-black uppercase tracking-widest text-foreground">
                            Preview Materi
                          </p>
                          <Badge variant="outline" className="font-black text-[10px]">
                            {item.subject.latestMeetings.length} terbaru
                          </Badge>
                        </div>
                        {item.subject.latestMeetings.length === 0 ? (
                          <p className="mt-2 text-xs font-medium text-muted-foreground">
                            Belum ada materi sesi. Tambahkan sesi agar mahasiswa menerima konten.
                          </p>
                        ) : (
                          <div className="mt-2 space-y-2">
                            {item.subject.latestMeetings.map((meeting) => (
                              <div
                                key={meeting.id}
                                className="rounded-lg border border-border/60 bg-card px-3 py-2"
                              >
                                <p className="text-xs font-black uppercase tracking-widest text-primary">
                                  Pertemuan {meeting.meetingNo}
                                </p>
                                <p className="mt-1 text-sm font-bold text-foreground line-clamp-1">
                                  {meeting.title}
                                </p>
                                <p className="mt-1 text-[11px] font-medium text-muted-foreground line-clamp-2">
                                  {meeting.preview}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <details className="rounded-xl border border-border/60 bg-background/60 p-3" open={viewMode === "detail"}>
                        <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
                          <span className="text-xs font-black uppercase tracking-widest text-foreground">
                            Mahasiswa di Mata Kuliah Ini
                          </span>
                          <Badge variant="outline" className="font-black">
                            {item.students.length}
                          </Badge>
                        </summary>
                        <div className="mt-3 space-y-2 max-h-48 overflow-auto pr-1">
                          {item.students.length === 0 ? (
                            <p className="text-xs font-medium text-muted-foreground">
                              Belum ada mahasiswa terdaftar.
                            </p>
                          ) : (
                            item.students.map((student) => (
                              <div
                                key={student.id}
                                className="rounded-lg border border-border/60 bg-card px-3 py-2"
                              >
                                <p className="text-sm font-bold text-foreground line-clamp-1">
                                  {student.name}
                                </p>
                                <p className="text-[11px] font-medium text-muted-foreground line-clamp-1">
                                  {student.email}
                                </p>
                                <div className="mt-1 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                  <span>{student.identifier || "NPM belum diisi"}</span>
                                  <span>{student.progress}% progres</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </details>
                    </>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
