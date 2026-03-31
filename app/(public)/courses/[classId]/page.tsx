import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { getCourseDetailView } from "@/app/(public)/courses/[classId]/_lib/course-detail";
import { Navbar } from "@/components/layout/Navbar";
import { Icon } from "@/components/ui/icon";
import EnrollButton from "@/features/courses/EnrollButton";
import { cn } from "@/lib/utils";

type CourseDetailPageProps = {
  params: Promise<{ classId: string }>;
};

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { classId } = await params;
  const data = await getCourseDetailView(classId);

  return (
    <>
      <Navbar />
      <main className="app-shell flex flex-col gap-8 pb-16">
        <nav className="flex items-center gap-2 text-[0.85rem] text-muted-foreground">
          <Link href="/" className="text-primary hover:underline">
            Beranda
          </Link>
          <Icon name="chevron_right" size={16} />
          <Link href="/courses" className="hover:underline">
            Kelas Saya
          </Link>
          <Icon name="chevron_right" size={16} />
          <span className="text-foreground font-semibold">{data.title}</span>
        </nav>

        <div className="grid-2 items-start lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-8">
            <article className="neo-card overflow-hidden">
              <div className="relative flex h-[240px] items-end p-8 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-background z-0" />
                <div className="relative z-10 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-[0.65rem] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                      Kelas Aktif
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">
                      {data.year}
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-none">
                    {data.title}
                  </h1>
                  <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
                    <Icon
                      name="auto_stories"
                      size={14}
                      className="text-primary"
                    />
                    Kurikulum Kelas · {data.subjects.length} Mata Kuliah
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 p-6 border-t border-border bg-card/50">
                <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-muted/50 border border-border/50">
                  <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Icon name="person" size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-70">
                      Tim Pengajar
                    </span>
                    <span className="text-xs font-bold">
                      {data.teacherNames.length} Dosen
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-muted/50 border border-border/50">
                  <div className="size-8 rounded-lg bg-secondary-brand/10 text-secondary-brand flex items-center justify-center">
                    <Icon name="group" size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-70">
                      Mahasiswa
                    </span>
                    <span className="text-xs font-bold">
                      {data.studentCount} Terdaftar
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-muted/50 border border-border/50">
                  <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Icon name="auto_stories" size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-70">
                      Materi Sesi
                    </span>
                    <span className="text-xs font-bold">
                      {data.subjects.reduce((a, b) => a + b.meetingCount, 0)}{" "}
                      Pertemuan
                    </span>
                  </div>
                </div>
              </div>
            </article>

            <section className="space-y-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-black tracking-tight">
                  Daftar Mata Kuliah
                </h2>
                <p className="text-sm text-muted-foreground font-medium">
                  Pilih mata kuliah untuk melihat jadwal pertemuan dan materi
                  belajar.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {data.subjects.length > 0 ? (
                  data.subjects.map((sub) => (
                    <Link
                      href={`/courses/${classId}/subjects/${sub.id}` as Route}
                      key={sub.id}
                      className={cn(
                        "group flex flex-col items-stretch gap-0 rounded-[2rem] border border-border bg-card transition-all duration-300 overflow-hidden",
                        "hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1",
                      )}
                    >
                      <div className="flex flex-col md:flex-row items-center gap-6 p-6">
                        <div className="size-20 md:size-24 shrink-0 rounded-3xl bg-muted overflow-hidden relative shadow-inner">
                          {sub.banner ? (
                            <Image
                              src={sub.banner}
                              alt={sub.name}
                              width={96}
                              height={96}
                              unoptimized
                              className="size-full object-cover transition-transform group-hover:scale-110"
                            />
                          ) : (
                            <div className="size-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary">
                              <Icon name="auto_stories" size={32} />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-2">
                          <div className="flex flex-col md:flex-row md:items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-md self-center md:self-auto border border-primary/20">
                              {sub.code}
                            </span>
                            <h4 className="text-xl font-black tracking-tight leading-none">
                              {sub.name}
                            </h4>
                          </div>

                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                              <Icon
                                name="person"
                                size={14}
                                className="text-primary/60"
                              />
                              <span>{sub.teacherName}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                              <Icon
                                name="school"
                                size={14}
                                className="text-primary/60"
                              />
                              <span>{sub.credits} SKS</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                              <Icon
                                name="history_edu"
                                size={14}
                                className="text-indigo-500/60"
                              />
                              <span>{sub.meetingCount} Pertemuan</span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-3">
                          <div className="size-10 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            <Icon name="arrow_forward" size={20} />
                          </div>
                        </div>
                      </div>

                      {(sub.dayOfWeek || sub.room) && (
                        <div className="px-6 py-3 bg-muted/30 border-t border-border flex flex-wrap items-center gap-6">
                          {sub.dayOfWeek && (
                            <div className="flex items-center gap-2">
                              <Icon
                                name="calendar_today"
                                size={14}
                                className="text-primary"
                              />
                              <span className="text-[10px] font-black uppercase tracking-widest">
                                {sub.dayOfWeek}
                                {sub.startTime &&
                                  ` • ${sub.startTime}${sub.endTime ? ` - ${sub.endTime}` : ""}`}
                              </span>
                            </div>
                          )}
                          {sub.room && (
                            <div className="flex items-center gap-2">
                              <Icon
                                name="location_on"
                                size={14}
                                className="text-destructive"
                              />
                              <span className="text-[10px] font-black uppercase tracking-widest">
                                Ruangan: {sub.room}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </Link>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 rounded-[2rem] bg-muted/20">
                    <Icon
                      name="history_edu"
                      size={48}
                      className="text-muted-foreground/30 mb-4"
                    />
                    <p className="font-bold text-muted-foreground">
                      Belum ada mata kuliah yang terdaftar untuk kelas ini.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="p-8 rounded-[2.5rem] border-none shadow-2xl bg-card relative overflow-hidden border border-border">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Icon name="verified" size={120} />
              </div>

              <div className="relative z-10 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Status Mahasiswa
                  </h3>
                  <p
                    className={cn(
                      "text-2xl font-black italic tracking-tight",
                      data.isOpen ? "text-primary" : "text-destructive",
                    )}
                  >
                    {data.isOpen ? "Active Enrollment" : "Class Full"}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-muted-foreground flex items-center gap-2">
                      <Icon name="groups" size={18} /> Kapasitas
                    </span>
                    <span className="font-black">
                      {data.studentCount} / {data.capacity}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (data.studentCount / Math.max(data.capacity, 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <EnrollButton
                    classId={classId}
                    isLoggedIn={data.isLoggedIn}
                    isEnrolled={data.isEnrolled}
                    requiresKey={data.requiresKey}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-indigo-500/10 to-transparent border-dashed border-2 border-indigo-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
                  <Icon name="psychology" size={20} />
                </div>
                <h3 className="font-black tracking-tight">AI Academic Hub</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                Gunakan asisten AI kami di setiap materi untuk membantumu
                merangkum, mengerjakan tugas, atau bertanya seputar isi kuliah.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
