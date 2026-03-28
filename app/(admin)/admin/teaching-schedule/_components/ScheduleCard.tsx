import type { Route } from "next";
import Link from "next/link";

import {
  DAY_OPTIONS,
  dayLabel,
  type ScheduleDraft,
  type ScheduleItem,
  type TeacherItem,
} from "@/app/(admin)/admin/teaching-schedule/_lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ScheduleCardProps = {
  item: ScheduleItem;
  canManage: boolean;
  draft: ScheduleDraft | undefined;
  teachers: TeacherItem[];
  savingId: string | null;
  viewMode: "compact" | "detail";
  showDetails: boolean;
  onToggleDetails: (id: string) => void;
  onDraftChange: (
    id: string,
    updater: (current: ScheduleDraft) => ScheduleDraft,
  ) => void;
  onSave: (item: ScheduleItem) => Promise<void>;
};

export function ScheduleCard({
  item,
  canManage,
  draft,
  teachers,
  savingId,
  viewMode,
  showDetails,
  onToggleDetails,
  onDraftChange,
  onSave,
}: ScheduleCardProps) {
  return (
    <Card className="rounded-2xl border-border/60 bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md space-y-4">
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

      {canManage && draft && viewMode === "detail" && (
        <div className="rounded-xl border border-border/60 bg-background/60 p-3 space-y-3">
          <p className="text-[11px] font-black uppercase tracking-widest text-foreground">
            Atur Jadwal (Admin)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Select
              value={draft.teacherUserId}
              onValueChange={(value) =>
                onDraftChange(item.id, (current) => ({
                  ...current,
                  teacherUserId: value,
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
              value={draft.dayOfWeek}
              onValueChange={(value) =>
                onDraftChange(item.id, (current) => ({
                  ...current,
                  dayOfWeek: value as ScheduleDraft["dayOfWeek"],
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
              value={draft.room}
              placeholder="Ruang, contoh: Lab AI 2"
              onChange={(event) =>
                onDraftChange(item.id, (current) => ({
                  ...current,
                  room: event.target.value,
                }))
              }
            />

            <Input
              type="time"
              value={draft.startTime}
              onChange={(event) =>
                onDraftChange(item.id, (current) => ({
                  ...current,
                  startTime: event.target.value,
                }))
              }
            />

            <Input
              type="time"
              value={draft.endTime}
              onChange={(event) =>
                onDraftChange(item.id, (current) => ({
                  ...current,
                  endTime: event.target.value,
                }))
              }
            />
          </div>
          <Button
            type="button"
            className="w-full rounded-xl font-black text-[11px] uppercase tracking-widest"
            disabled={savingId === item.id}
            onClick={() => void onSave(item)}
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
        <span className="text-foreground">
          {item.subject.meetingsUpdatedThisWeek} sesi
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-xl font-black text-[11px] uppercase tracking-widest"
          onClick={() => onToggleDetails(item.id)}
        >
          {showDetails ? "Sembunyikan Detail" : "Lihat Detail"}
        </Button>
        <Link
          href={`/admin/courses/${item.subject.id}/meetings` as Route}
          className="flex-1"
        >
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
                Belum ada materi sesi. Tambahkan sesi agar mahasiswa menerima
                konten.
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

          <details
            className="rounded-xl border border-border/60 bg-background/60 p-3"
            open={viewMode === "detail"}
          >
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
}
