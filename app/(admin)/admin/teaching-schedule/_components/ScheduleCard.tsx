"use client";

import { type Route } from "next";
import Link from "next/link";

import { type ScheduleItem } from "@/app/(admin)/admin/teaching-schedule/_lib/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

interface ScheduleCardProps {
  item: ScheduleItem;
}

export function ScheduleCard({ item }: ScheduleCardProps) {
  const teacherName = item.assignedTeacher?.name || "Belum Ditentukan";

  return (
    <Card className="group relative overflow-hidden bg-card/40 border-border/40 hover:border-primary/30 transition-all duration-500 rounded-[2.5rem] p-6 shadow-sm hover:shadow-2xl hover:shadow-primary/5">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon name="event_note" size={80} className="text-primary" />
      </div>

      <div className="relative space-y-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <Badge
                variant="outline"
                className="font-extrabold text-[9px] tracking-widest px-2 py-0 border-primary/20 bg-primary/5 text-primary"
              >
                {item.subject.code}
              </Badge>
              <h4 className="text-lg font-black leading-tight tracking-tight truncate group-hover:text-primary transition-colors">
                {item.subject.name}
              </h4>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-brand/10 border border-secondary-brand/20 text-secondary-brand">
              <Icon name="groups" size={14} />
              <span className="text-[10px] font-black uppercase tracking-wider">
                {item.class.name}
              </span>
            </div>
            {item.schedule.room && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-muted-foreground">
                <Icon name="meeting_room" size={14} />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {item.schedule.room}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-muted/20 border border-border/30 space-y-4">
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Icon name="schedule" size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">
                Waktu Kuliah
              </p>
              <p className="text-sm font-black">
                {item.schedule.startTime || "--:--"} -{" "}
                {item.schedule.endTime || "--:--"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="size-10 rounded-2xl bg-secondary-brand/10 flex items-center justify-center text-secondary-brand border border-secondary-brand/20">
              <Icon name="person" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">
                Dosen Pengampu
              </p>
              <p className="text-sm font-black truncate">{teacherName}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            href={`/admin/courses/${item.subject.id}/meetings` as Route}
            className="flex items-center justify-center gap-2 h-11 rounded-2xl bg-primary text-primary-foreground font-black text-[11px] uppercase tracking-wider hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            <Icon name="history_edu" size={16} />
            Kelola Sesi
          </Link>
          <Link
            href={
              `/admin/courses/${item.subject.id}/students?classId=${item.class.id}` as Route
            }
            className="flex items-center justify-center gap-2 h-11 rounded-2xl bg-card border border-border/60 font-black text-[11px] uppercase tracking-wider hover:bg-muted/50 transition-all"
          >
            <Icon name="groups" size={16} />
            Daftar Mahasiswa
          </Link>
        </div>
      </div>
    </Card>
  );
}
