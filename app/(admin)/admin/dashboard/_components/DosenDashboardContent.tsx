import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import type { DosenSubjectItem } from "@/app/(admin)/admin/dashboard/_lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

type DosenDashboardContentProps = {
  dosenSubjects: DosenSubjectItem[];
  dosenLoading: boolean;
};

export function DosenDashboardContent({
  dosenSubjects,
  dosenLoading,
}: DosenDashboardContentProps) {
  const totalUniqueClasses = new Set(
    dosenSubjects.flatMap((subject) =>
      subject.classes.map((classSubject) => classSubject.class.id),
    ),
  ).size;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-black tracking-tight text-foreground">
          Halo, Selamat Datang!
        </h2>
        <p className="text-muted-foreground font-medium">
          Berikut adalah rangkuman aktivitas akademik dan mata kuliah yang Anda
          ampu.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-secondary-brand/20 to-card border-none shadow-xl shadow-secondary-brand/5 rounded-3xl group transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="size-12 rounded-2xl bg-secondary-brand/10 text-secondary-brand flex items-center justify-center font-black">
              <Icon name="library_books" size={24} />
            </div>
            <span className="text-3xl font-black text-foreground">
              {dosenSubjects.length}
            </span>
          </div>
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground opacity-70">
            Mata Kuliah Aktif
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-primary/20 to-card border-none shadow-xl shadow-primary/5 rounded-3xl group transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black">
              <Icon name="groups" size={24} />
            </div>
            <span className="text-3xl font-black text-foreground">
              {totalUniqueClasses}
            </span>
          </div>
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground opacity-70">
            Total Rombel / Kelas
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-indigo-500/20 to-card border-none shadow-xl shadow-indigo-500/5 rounded-3xl group transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="size-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black">
              <Icon name="auto_stories" size={24} />
            </div>
            <span className="text-3xl font-black text-foreground">
              {dosenSubjects.reduce(
                (acc, subject) => acc + (subject._count?.meetings || 0),
                0,
              )}
            </span>
          </div>
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground opacity-70">
            Materi Sesi Terbit
          </p>
        </Card>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
            <Icon name="school" className="text-secondary-brand" />
            Mata Kuliah Yang Diampu
          </h3>
        </div>

        {dosenLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-48 bg-card/50 animate-pulse rounded-3xl border border-border/30"
              />
            ))}
          </div>
        ) : dosenSubjects.length === 0 ? (
          <div className="py-20 text-center bg-card/30 rounded-3xl border border-dashed border-border/50">
            <Icon
              name="history_edu"
              size={48}
              className="text-muted-foreground/30 mb-4 mx-auto"
            />
            <p className="font-bold text-muted-foreground">
              Anda belum ditugaskan ke mata kuliah manapun.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Hubungi Administrator untuk plotting pengampu.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dosenSubjects.map((subject) => (
              <Card
                key={subject.id}
                className="relative overflow-hidden rounded-[2rem] border-border/50 bg-card group shadow-sm hover:shadow-2xl hover:shadow-secondary-brand/10 transition-all duration-500"
              >
                <div className="h-40 bg-muted relative">
                  {subject.bannerImage ? (
                    <Image
                      src={subject.bannerImage}
                      alt={subject.name}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="size-full bg-gradient-to-br from-secondary-brand/40 to-secondary-brand/10 flex items-center justify-center text-secondary-brand">
                      <Icon name="auto_stories" size={48} />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <span className="px-2 py-0.5 rounded-md bg-secondary-brand text-secondary-brand-foreground text-[10px] font-black uppercase tracking-tighter">
                      {subject.code}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-lg font-black tracking-tight mb-2 line-clamp-1">
                    {subject.name}
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {subject.classes.map((classSubject) => (
                      <span
                        key={classSubject.class.id}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                      >
                        Kelas {classSubject.class.name}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-4 mt-auto">
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <Icon name="description" size={14} />
                      {subject._count?.meetings || 0} Sesi
                    </div>
                    <Link
                      href={`/admin/courses/${subject.id}/meetings` as Route}
                    >
                      <Button
                        variant="outline"
                        className="rounded-xl font-black text-[10px] uppercase tracking-widest px-4 h-9 hover:bg-secondary-brand hover:text-white transition-all border-secondary-brand/20"
                      >
                        Kelola Sesi
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
