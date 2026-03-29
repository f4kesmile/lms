"use client";

import { useEffect, useMemo, useState } from "react";

import { ScheduleCard } from "@/app/(admin)/admin/teaching-schedule/_components/ScheduleCard";
import {
  DAY_OPTIONS,
  dayLabel,
  type DayOfWeek,
  type ScheduleItem,
  type WeekResponse,
} from "@/app/(admin)/admin/teaching-schedule/_lib/types";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function TeachingSchedulePage() {
  const [activeYearLabel, setActiveYearLabel] = useState<string | null>(null);
  const [weekLabel, setWeekLabel] = useState("");
  const [summary, setSummary] = useState<WeekResponse["summary"]>({
    totalSchedules: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalUpdatesThisWeek: 0,
  });
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("senin");

  const filteredItems = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return items;

    return items.filter((item) => {
      const teacherName = item.assignedTeacher?.name || "";
      return [
        item.subject.code,
        item.subject.name,
        item.class.name,
        teacherName,
      ].some((val) => val.toLowerCase().includes(keyword));
    });
  }, [items, searchQuery]);

  const groupedByDay = useMemo(() => {
    const groups: Record<string, ScheduleItem[]> = {};
    DAY_OPTIONS.forEach((d) => (groups[d.value] = []));
    
    filteredItems.forEach((item) => {
      if (item.schedule.dayOfWeek) {
        groups[item.schedule.dayOfWeek].push(item);
      }
    });

    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => {
        if (!a.schedule.startTime) return 1;
        if (!b.schedule.startTime) return -1;
        return a.schedule.startTime.localeCompare(b.schedule.startTime);
      });
    });

    return groups;
  }, [filteredItems]);

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

    fetch("/api/admin/weekly-schedule")
      .then(async (response) => {
        const payload = (await response.json()) as unknown;
        if (!response.ok) {
          throw new Error("Gagal memuat jadwal mengajar");
        }

        const data = payload as WeekResponse;
        setWeekLabel(data.week?.label || "");
        setSummary(
          data.summary || {
            totalSchedules: 0,
            totalTeachers: 0,
            totalStudents: 0,
            totalUpdatesThisWeek: 0,
          },
        );
        setItems(data.schedules || []);
      })
      .catch(() => {
        setWeekLabel("");
        setSummary({
          totalSchedules: 0,
          totalTeachers: 0,
          totalStudents: 0,
          totalUpdatesThisWeek: 0,
        });
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Planner Jadwal Mengajar">
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tighter">
              Time Planner
            </h2>
            <p className="text-sm font-medium text-muted-foreground max-w-md">
              Pantau runutan jadwal mengajar Anda di setiap sesi pertemuan dengan mudah dan terstruktur.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {activeYearLabel && (
                <Badge variant="secondary" className="font-black text-[10px] uppercase h-6 px-3">
                  Tahun: {activeYearLabel}
                </Badge>
              )}
              {weekLabel && (
                <Badge variant="outline" className="font-black text-[10px] uppercase h-6 px-3 border-primary/50 text-primary">
                  Minggu: {weekLabel}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total Slot", val: summary.totalSchedules },
              { label: "Dosen", val: summary.totalTeachers },
              { label: "Mahasiswa", val: summary.totalStudents },
              { label: "Update", val: summary.totalUpdatesThisWeek },
            ].map((s, i) => (
              <div key={i} className="bg-card/40 border border-border/50 rounded-2xl p-3 min-w-[100px]">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground truncate">{s.label}</p>
                <p className="text-xl font-black">{s.val}</p>
              </div>
            ))}
          </div>
        </header>

        <section className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border border-border/50 rounded-[2rem] p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Icon name="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                placeholder="Cari matakuliah, kelas, atau dosen..."
                className="pl-11 h-12 bg-card/50 border-border/30 rounded-2xl font-medium focus-visible:ring-primary/20"
              />
            </div>
            
            <div className="w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
               <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-2xl border border-border/20">
                {DAY_OPTIONS.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => setSelectedDay(day.value)}
                    className={cn(
                      "px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
                      selectedDay === day.value 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                        : "text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-[2.5rem]" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="size-2 bg-primary rounded-full" />
               <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Jadwal Hari {dayLabel(selectedDay)}
              </h3>
            </div>
            
            {groupedByDay[selectedDay].length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-card/20 border border-dashed border-border/50 rounded-[3rem]">
                <Icon name="event_busy" size={48} className="text-muted-foreground/30 mb-4" />
                <p className="font-bold text-muted-foreground">Tidak ada perkuliahan dijadwalkan.</p>
                <p className="text-sm text-center text-muted-foreground/50 max-w-xs mt-1 leading-relaxed">
                  Semua mata kuliah sudah terpetakan atau hari ini memang sedang kosong.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {groupedByDay[selectedDay].map((item) => (
                  <ScheduleCard 
                    key={item.id} 
                    item={item}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
